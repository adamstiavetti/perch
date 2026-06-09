import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

function readBaseBoardModelMigration() {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) =>
        name.endsWith("_create_base_board_model.sql"),
      )
    : [];

  assert.equal(
    migrationNames.length,
    1,
    "expected one T05 base/board model migration",
  );

  return readFileSync(path.join(migrationsDir.pathname, migrationNames[0]), "utf8");
}

test("T05 migration creates bases, board types, and boards with RLS", () => {
  const sql = readBaseBoardModelMigration();

  assert.match(sql, /create table public\.bases/i);
  assert.match(sql, /create table public\.board_types/i);
  assert.match(sql, /create table public\.boards/i);

  assert.match(sql, /alter table public\.bases enable row level security/i);
  assert.match(sql, /alter table public\.board_types enable row level security/i);
  assert.match(sql, /alter table public\.boards enable row level security/i);

  assert.match(sql, /bases_status_check[\s\S]*'draft'[\s\S]*'active'[\s\S]*'archived'/i);
  assert.match(sql, /bases_code_format_check[\s\S]*\^\[A-Z0-9\]/i);
  assert.match(sql, /board_types_key_format_check[\s\S]*\^\[a-z0-9\]/i);
  assert.match(sql, /boards_slug_format_check[\s\S]*\^\[a-z0-9\]/i);
  assert.match(sql, /boards_parent_not_self_check/i);
  assert.match(sql, /open_verified[\s\S]*restricted[\s\S]*hidden/i);
  assert.match(sql, /read_only[\s\S]*members_can_post[\s\S]*admins_only/i);
  assert.match(sql, /visible[\s\S]*unlisted[\s\S]*hidden/i);
});

test("T05 seeds DFW and the required board type taxonomy", () => {
  const sql = readBaseBoardModelMigration();

  assert.match(sql, /insert into public\.bases/i);
  assert.match(sql, /'DFW'/);
  assert.match(sql, /'Dallas\/Fort Worth'/);
  assert.match(sql, /'Dallas Fort Worth International Airport'/);
  assert.match(sql, /'America\/Chicago'/);
  assert.match(sql, /launch_priority[\s\S]*1/i);

  assert.match(sql, /'base_board'/);
  assert.match(sql, /'layover_board'/);
  assert.match(sql, /'verified_lounge'/);
  assert.match(sql, /'Verified Lounge'/);
  assert.match(sql, /'restricted'/);

  assert.match(sql, /insert into public\.boards/i);
  assert.match(sql, /'dfw'/);
  assert.match(sql, /'DFW Base Board'/);
  assert.match(sql, /'open_verified'/);
  assert.match(sql, /'members_can_post'/);
});

test("T05 keeps later-ticket community features out of the schema", () => {
  const sql = readBaseBoardModelMigration();

  assert.doesNotMatch(sql, /create table public\.(posts|comments|post_comments)\b/i);
  assert.doesNotMatch(sql, /create table public\.(board_follows|user_board_follows|follows)\b/i);
  assert.doesNotMatch(sql, /create table public\.(board_memberships|board_access_requests)\b/i);
  assert.doesNotMatch(sql, /create table public\.(saved_items|post_saves|reactions|post_reactions)\b/i);
  assert.doesNotMatch(sql, /create table public\.(reports|moderation_actions)\b/i);
  assert.doesNotMatch(sql, /search_vector|to_tsvector|create index .* using gin/i);
  assert.doesNotMatch(sql, /board_wiki|board_intel|wiki_section|intel_section/i);
});

test("T05 does not use self-declared profile fields or proof upload scope for authorization", () => {
  const sql = readBaseBoardModelMigration();

  assert.doesNotMatch(sql, /claimed_airline|claimed_role|claimed_base/i);
  assert.doesNotMatch(sql, /verification_proofs|storage\.objects|storage_path|signed_url|proof upload|badge upload/i);
  assert.doesNotMatch(sql, /for select[\s\S]*using\s*\(\s*true\s*\)/i);
  assert.doesNotMatch(sql, /to anon/i);
});
