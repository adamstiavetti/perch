import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

function readLoungeAccessFoundationMigration() {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) =>
        name.endsWith("_create_lounge_access_foundation.sql"),
      )
    : [];

  assert.equal(
    migrationNames.length,
    1,
    "expected one T07 lounge access foundation migration",
  );

  return readFileSync(path.join(migrationsDir.pathname, migrationNames[0]), "utf8");
}

test("T07 migration creates lounge membership, access request, request comment, and Crew Lead grant tables", () => {
  const sql = readLoungeAccessFoundationMigration();

  assert.match(sql, /create table public\.lounge_memberships/i);
  assert.match(sql, /create table public\.lounge_access_requests/i);
  assert.match(sql, /create table public\.lounge_request_comments/i);
  assert.match(sql, /create table public\.lounge_admin_grants/i);

  assert.match(sql, /board_id uuid not null references public\.boards\s*\(id\) on delete cascade/i);
  assert.match(sql, /user_id uuid not null references auth\.users\s*\(id\) on delete cascade/i);
  assert.match(sql, /request_id uuid not null references public\.lounge_access_requests\s*\(id\) on delete cascade/i);
  assert.match(sql, /author_id uuid not null references auth\.users\s*\(id\) on delete cascade/i);

  assert.match(sql, /constraint lounge_memberships_board_user_unique unique\s*\(board_id,\s*user_id\)/i);
  assert.match(sql, /constraint lounge_admin_grants_board_user_unique unique\s*\(board_id,\s*user_id\)/i);
});

test("T07 migration constrains membership, request, comment, and Crew Lead grant state", () => {
  const sql = readLoungeAccessFoundationMigration();

  assert.match(sql, /lounge_memberships_status_check[\s\S]*status in \('active', 'revoked'\)/i);
  assert.match(sql, /lounge_access_requests_status_check[\s\S]*status in \('pending', 'approved', 'denied', 'withdrawn'\)/i);
  assert.match(sql, /lounge_request_comments_visibility_check[\s\S]*visibility in \('request_participants', 'operator_review'\)/i);
  assert.match(sql, /lounge_admin_grants_status_check[\s\S]*status in \('active', 'revoked'\)/i);

  assert.match(sql, /create unique index lounge_access_requests_one_pending_per_user_board_idx/i);
  assert.match(sql, /where status = 'pending'/i);
});

test("T07 migration enables conservative RLS and avoids public or anon policies", () => {
  const sql = readLoungeAccessFoundationMigration();

  assert.match(sql, /alter table public\.lounge_memberships enable row level security/i);
  assert.match(sql, /alter table public\.lounge_access_requests enable row level security/i);
  assert.match(sql, /alter table public\.lounge_request_comments enable row level security/i);
  assert.match(sql, /alter table public\.lounge_admin_grants enable row level security/i);

  assert.match(sql, /revoke all on table public\.lounge_memberships from anon, authenticated/i);
  assert.match(sql, /revoke all on table public\.lounge_access_requests from anon, authenticated/i);
  assert.match(sql, /revoke all on table public\.lounge_request_comments from anon, authenticated/i);
  assert.match(sql, /revoke all on table public\.lounge_admin_grants from anon, authenticated/i);

  assert.match(sql, /grant select on table public\.lounge_memberships to authenticated/i);
  assert.match(sql, /grant select on table public\.lounge_access_requests to authenticated/i);
  assert.match(sql, /grant select on table public\.lounge_request_comments to authenticated/i);
  assert.match(sql, /grant select on table public\.lounge_admin_grants to authenticated/i);

  assert.doesNotMatch(sql, /to anon/i);
  assert.doesNotMatch(sql, /using\s*\(\s*true\s*\)/i);
  assert.doesNotMatch(sql, /with check\s*\(\s*true\s*\)/i);
});

test("T07 RLS read policies are caller-scoped or active Crew Lead scoped", () => {
  const sql = readLoungeAccessFoundationMigration();

  assert.match(sql, /create policy "users can read their own lounge memberships"/i);
  assert.match(sql, /on public\.lounge_memberships[\s\S]*for select[\s\S]*to authenticated[\s\S]*using\s*\([\s\S]*auth\.uid\(\) = user_id/i);

  assert.match(sql, /create policy "crew leads can read lounge memberships for managed boards"/i);
  assert.match(sql, /exists\s*\([\s\S]*from public\.lounge_admin_grants as grants[\s\S]*grants\.board_id = lounge_memberships\.board_id[\s\S]*grants\.user_id = auth\.uid\(\)[\s\S]*grants\.status = 'active'/i);

  assert.match(sql, /create policy "users can read their own lounge access requests"/i);
  assert.match(sql, /create policy "crew leads can read lounge access requests for managed boards"/i);

  assert.match(sql, /create policy "requesters can read comments on their requests"/i);
  assert.match(sql, /create policy "crew leads can read request comments for managed boards"/i);
  assert.match(sql, /lounge_request_comments\.visibility = 'request_participants'/i);
  assert.match(sql, /Operator review comments are reserved for later escalation and are not exposed through T07 participant\/Crew Lead read policies/i);

  assert.match(sql, /create policy "users can read their own active lounge admin grants"/i);
  assert.match(sql, /on public\.lounge_admin_grants[\s\S]*using\s*\([\s\S]*auth\.uid\(\) = user_id[\s\S]*status = 'active'/i);
});

test("T07 comments define request threads as scoped access-review comments, not full DMs", () => {
  const sql = readLoungeAccessFoundationMigration();

  assert.match(sql, /Limited access-review comments attached to a lounge access request/i);
  assert.match(sql, /not a general direct-message or chat system/i);
  assert.match(sql, /request creation, approval, denial, revocation, and request-thread messages should be audited/i);
  assert.doesNotMatch(sql, /create table public\.(direct_messages|messages|conversations|chats)\b/i);
});

test("T07 does not use home base, follows, or self-declared profile fields as lounge authorization truth", () => {
  const sql = readLoungeAccessFoundationMigration();

  assert.match(sql, /membership is the access truth/i);
  assert.match(sql, /Home Base and board follows do not grant lounge access/i);
  assert.match(sql, /self-declared profile fields do not grant lounge access/i);

  assert.doesNotMatch(sql, /claimed_airline|claimed_role|claimed_base/i);
  assert.doesNotMatch(sql, /user_home_base_preferences[\s\S]*(grant|authorize|allow|access)/i);
  assert.doesNotMatch(sql, /board_follows[\s\S]*(grant|authorize|allow|access)/i);
});

test("T07 stays within lounge access foundation scope", () => {
  const sql = readLoungeAccessFoundationMigration();

  assert.doesNotMatch(sql, /verification_proofs|storage\.objects|storage_path|signed_url|proof upload|badge upload/i);
  assert.doesNotMatch(sql, /create table public\.(posts|comments|post_comments)\b/i);
  assert.doesNotMatch(sql, /create table public\.(saved_items|post_saves|reactions|post_reactions)\b/i);
  assert.doesNotMatch(sql, /create table public\.(reports|moderation_actions)\b/i);
  assert.doesNotMatch(sql, /search_vector|to_tsvector|create index .* using gin/i);
  assert.doesNotMatch(sql, /ai_|embedding|marketplace|deal/i);
  assert.doesNotMatch(sql, /create table public\.operator_/i);
  assert.doesNotMatch(sql, /operator_scope/i);
  assert.doesNotMatch(sql, /create table public\.waitlist/i);
  assert.doesNotMatch(sql, /proof_cleanup/i);
});
