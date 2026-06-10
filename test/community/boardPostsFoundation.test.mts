import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

function readBoardPostsFoundationMigration() {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) =>
        name.endsWith("_create_board_posts_foundation.sql"),
      )
    : [];

  assert.equal(
    migrationNames.length,
    1,
    "expected one T12 shared board-posts foundation migration",
  );

  return readFileSync(path.join(migrationsDir.pathname, migrationNames[0]), "utf8");
}

test("T12 migration creates board_posts with constrained shared post/thread fields", () => {
  const sql = readBoardPostsFoundationMigration();

  assert.match(sql, /create table public\.board_posts/i);
  assert.match(sql, /board_id uuid not null references public\.boards\s*\(id\) on delete cascade/i);
  assert.match(sql, /author_user_id uuid not null references auth\.users\s*\(id\) on delete cascade/i);
  assert.match(sql, /title text not null/i);
  assert.match(sql, /body text not null/i);
  assert.match(sql, /content_type text not null default 'note'/i);
  assert.match(sql, /category text not null default 'general'/i);
  assert.match(sql, /status text not null default 'published'/i);
  assert.match(sql, /visibility text not null default 'board'/i);
  assert.match(sql, /is_admin_seeded boolean not null default false/i);
  assert.match(sql, /is_pinned boolean not null default false/i);
  assert.match(sql, /edited_at timestamptz/i);
  assert.match(sql, /removed_at timestamptz/i);
  assert.match(sql, /removed_by uuid references auth\.users\s*\(id\)/i);
  assert.match(sql, /created_at timestamptz not null default now\(\)/i);
  assert.match(sql, /updated_at timestamptz not null default now\(\)/i);
});

test("T12 migration constrains content type, category, status, visibility, and non-empty text", () => {
  const sql = readBoardPostsFoundationMigration();

  assert.match(sql, /board_posts_title_present_check[\s\S]*char_length\(trim\(title\)\) > 0/i);
  assert.match(sql, /board_posts_body_present_check[\s\S]*char_length\(trim\(body\)\) > 0/i);
  assert.match(sql, /board_posts_content_type_check[\s\S]*'note'[\s\S]*'question'[\s\S]*'recommendation'[\s\S]*'guide'/i);
  assert.match(sql, /board_posts_category_check[\s\S]*'food'[\s\S]*'coffee'[\s\S]*'transportation'[\s\S]*'fitness'[\s\S]*'things_to_do'[\s\S]*'crew_tips'[\s\S]*'safety'[\s\S]*'base_q_and_a'[\s\S]*'operations_note'/i);
  assert.match(sql, /board_posts_status_check[\s\S]*'draft'[\s\S]*'published'[\s\S]*'hidden'[\s\S]*'removed'/i);
  assert.match(sql, /board_posts_visibility_check[\s\S]*'board'[\s\S]*'members_only'[\s\S]*'operator_only'/i);
  assert.match(sql, /board_posts_removed_state_check/i);
});

test("T12 migration adds read-only RLS for open verified boards and active lounge memberships", () => {
  const sql = readBoardPostsFoundationMigration();

  assert.match(sql, /alter table public\.board_posts enable row level security/i);
  assert.match(sql, /revoke all on table public\.board_posts from anon, authenticated/i);
  assert.match(sql, /grant select on table public\.board_posts to authenticated/i);

  assert.match(sql, /create policy "authenticated users can read published posts on open verified boards"/i);
  assert.match(sql, /status = 'published'/i);
  assert.match(sql, /visibility = 'board'/i);
  assert.match(sql, /boards\.visibility = 'open_verified'/i);

  assert.match(sql, /create policy "active lounge members can read published members-only posts on restricted boards"/i);
  assert.match(sql, /visibility = 'members_only'/i);
  assert.match(sql, /boards\.visibility = 'restricted'/i);
  assert.match(sql, /from public\.boards[\s\S]*inner join public\.lounge_memberships/i);
  assert.match(sql, /lounge_memberships\.user_id = auth\.uid\(\)/i);
  assert.match(sql, /lounge_memberships\.status = 'active'/i);

  assert.doesNotMatch(sql, /to anon/i);
  assert.doesNotMatch(sql, /using\s*\(\s*true\s*\)/i);
  assert.doesNotMatch(sql, /with check\s*\(\s*true\s*\)/i);
});

test("T12 does not expose operator-only posts or skip board-status checks", () => {
  const sql = readBoardPostsFoundationMigration();

  assert.match(sql, /operator_only = withheld from authenticated user reads/i);
  assert.match(sql, /boards\.status = 'active'/i);
  assert.doesNotMatch(sql, /visibility = 'operator_only'[\s\S]*create policy/i);
  assert.doesNotMatch(sql, /boards\.visibility = 'hidden'[\s\S]*create policy/i);
});

test("T12 keeps shared post/thread foundation separate from comments, reactions, saves, search, and moderation", () => {
  const sql = readBoardPostsFoundationMigration();

  assert.doesNotMatch(sql, /create table public\.(comments|post_comments|comment_threads)\b/i);
  assert.doesNotMatch(sql, /create table public\.(saved_items|post_saves|reactions|post_reactions)\b/i);
  assert.doesNotMatch(sql, /create table public\.(reports|moderation_actions)\b/i);
  assert.doesNotMatch(sql, /search_vector|to_tsvector|create index .* using gin/i);
  assert.doesNotMatch(sql, /create function public\.(request_lounge_access|review_lounge_access_request|add_lounge_request_comment)\b/i);
  assert.doesNotMatch(sql, /crew_lead|crew lead panel|operator_scope/i);
  assert.doesNotMatch(sql, /ai_|embedding|autopublish|auto-publish/i);
});

test("T12 does not use home base, follows, self-declared profile fields, or proof-upload scope as post authorization truth", () => {
  const sql = readBoardPostsFoundationMigration();

  assert.match(sql, /Self-declared profile fields are not authorization truth/i);
  assert.doesNotMatch(sql, /claimed_airline|claimed_role|claimed_base/i);
  assert.doesNotMatch(sql, /user_home_base_preferences[\s\S]*(grant|authorize|allow|access)/i);
  assert.doesNotMatch(sql, /board_follows[\s\S]*(grant|authorize|allow|access)/i);
  assert.doesNotMatch(sql, /verification_proofs|storage\.objects|storage_path|signed_url|proof upload|badge upload/i);
});

test("T12 docs describe board_posts as the shared primitive without overclaiming runtime or feature scope", () => {
  const t12OpsDoc = readFileSync(
    new URL("../../docs/ops/fbmvp-t12-shared-post-thread-foundation.md", import.meta.url),
    "utf8",
  );
  const docs = [
    "../../docs/BUILD_TICKETS.md",
    "../../docs/DATA_MODEL.md",
    "../../docs/ops/05b-first-base-mvp-planning.md",
    "../../docs/strategy/seeded-layovers-editorial-model.md",
    "../../docs/strategy/hub-board-taxonomy.md",
  ]
    .map((docPath) => readFileSync(new URL(docPath, import.meta.url), "utf8"))
    .join("\n\n");
  const allDocs = `${t12OpsDoc}\n\n${docs}`;

  assert.match(t12OpsDoc, /FBMVP-T12 Shared Posts\/Threads Foundation/i);
  assert.match(allDocs, /board_posts/i);
  assert.match(allDocs, /shared (database )?foundation|shared post\/thread foundation|shared primitive/i);
  assert.match(allDocs, /Baseboard/i);
  assert.match(t12OpsDoc, /Layovers Featured Picks, Crew Notes, Questions/i);
  assert.match(t12OpsDoc, /Crew Picks sourcing/i);
  assert.match(t12OpsDoc, /comment threads|comment\/reply schema/i);
  assert.match(t12OpsDoc, /reactions/i);
  assert.match(t12OpsDoc, /saves/i);
  assert.match(t12OpsDoc, /search backend/i);
  assert.match(t12OpsDoc, /AI/i);
  assert.match(t12OpsDoc, /posting UI/i);
  assert.match(t12OpsDoc, /seeded layover runtime content/i);
  assert.match(t12OpsDoc, /active `lounge_memberships`/i);
  assert.match(t12OpsDoc, /Home Base does not grant restricted lounge access/i);
  assert.match(t12OpsDoc, /board follows do not grant restricted lounge access/i);
  assert.match(t12OpsDoc, /self-declared `claimed_airline`, `claimed_role`, and `claimed_base`/i);

  assert.doesNotMatch(t12OpsDoc, /runtime-applied|runtime proof|runtime-proven|deployed/i);
  assert.doesNotMatch(t12OpsDoc, /remote migration apply succeeded|applied successfully to/i);
});
