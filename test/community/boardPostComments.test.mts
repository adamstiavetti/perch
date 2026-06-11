import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

function readCommentsMigration() {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) =>
        name.endsWith("_create_board_post_comments_foundation.sql"),
      )
    : [];

  assert.equal(
    migrationNames.length,
    1,
    "expected one T19 board-post-comments migration",
  );

  return readFileSync(path.join(migrationsDir.pathname, migrationNames[0]), "utf8");
}

const commentsHelperSource = existsSync(
  new URL("../../src/lib/community/boardPostComments.ts", import.meta.url),
)
  ? readFileSync(
      new URL("../../src/lib/community/boardPostComments.ts", import.meta.url),
      "utf8",
    )
  : "";

const detailRouteSource = existsSync(
  new URL("../../app/app/hubs/dfw/baseboard/[postId]/page.tsx", import.meta.url),
)
  ? readFileSync(
      new URL("../../app/app/hubs/dfw/baseboard/[postId]/page.tsx", import.meta.url),
      "utf8",
    )
  : "";

const detailShellSource = readFileSync(
  new URL("../../src/components/privateApp/HomeHubShell.tsx", import.meta.url),
  "utf8",
);

const docsSource = [
  "../../docs/ops/fbmvp-t19-dfw-baseboard-comments-foundation.md",
  "../../docs/BUILD_TICKETS.md",
  "../../docs/DATA_MODEL.md",
  "../../docs/ops/05b-first-base-mvp-planning.md",
]
  .map((docPath) =>
    existsSync(new URL(docPath, import.meta.url))
      ? readFileSync(new URL(docPath, import.meta.url), "utf8")
      : "",
  )
  .join("\n\n");

test("T19 migration creates a private top-level board post comments table", () => {
  const sql = readCommentsMigration();

  assert.match(sql, /create table public\.board_post_comments/i);
  assert.match(sql, /id uuid primary key default gen_random_uuid\(\)/i);
  assert.match(sql, /post_id uuid not null references public\.board_posts \(id\)/i);
  assert.match(sql, /author_user_id uuid not null references auth\.users \(id\)/i);
  assert.match(sql, /parent_comment_id uuid references public\.board_post_comments \(id\)/i);
  assert.match(sql, /body text not null/i);
  assert.match(sql, /status text not null default 'published'/i);
  assert.match(sql, /removed_at timestamptz/i);
  assert.match(sql, /removed_by uuid references auth\.users \(id\)/i);
  assert.match(sql, /removal_reason text/i);
  assert.match(sql, /board_post_comments_body_present_check[\s\S]*char_length\(trim\(body\)\) > 0/i);
  assert.match(sql, /board_post_comments_body_length_check[\s\S]*char_length\(body\) <= 2000/i);
  assert.match(sql, /board_post_comments_status_check[\s\S]*'published'[\s\S]*'hidden'[\s\S]*'removed'/i);
  assert.match(sql, /board_post_comments_removed_state_check/i);
  assert.match(sql, /board_post_comments_top_level_only_check[\s\S]*parent_comment_id is null/i);
  assert.match(sql, /create index board_post_comments_post_status_created_at_idx/i);
  assert.match(sql, /alter table public\.board_post_comments enable row level security/i);
  assert.match(sql, /revoke all on table public\.board_post_comments from anon, authenticated/i);
  assert.match(sql, /grant select, insert, update on table public\.board_post_comments to service_role/i);

  assert.doesNotMatch(sql, /create table public\.(board_post_comment_reports|comment_reports)/i);
  assert.doesNotMatch(sql, /create policy[\s\S]*on public\.board_post_comments[\s\S]*to (anon|authenticated|public)/i);
  assert.doesNotMatch(sql, /grant (insert|update|delete) on table public\.board_post_comments to (anon|authenticated|public)/i);
});

test("T19 list comments RPC is gated and returns safe top-level comment fields only", () => {
  const sql = readCommentsMigration();
  const returnSignature = sql.slice(
    sql.indexOf("returns table"),
    sql.indexOf("language plpgsql", sql.indexOf("returns table")),
  );

  assert.match(sql, /create or replace function public\.list_open_baseboard_post_comments\(/i);
  assert.match(sql, /p_base_code text/i);
  assert.match(sql, /p_post_id uuid/i);
  assert.match(sql, /p_limit integer default 100/i);
  assert.match(sql, /stable/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = public, pg_temp/i);
  assert.match(sql, /v_user_id uuid := auth\.uid\(\)/i);
  assert.match(sql, /if v_user_id is null/i);
  assert.match(sql, /public\.current_user_can_read_open_board_posts\(\)/i);
  assert.match(sql, /bases\.code = v_base_code/i);
  assert.match(sql, /boards\.visibility = 'open_verified'/i);
  assert.match(sql, /board_types\.key = 'base_board'/i);
  assert.match(sql, /board_posts\.id = p_post_id/i);
  assert.match(sql, /board_posts\.status = 'published'/i);
  assert.match(sql, /board_posts\.visibility = 'board'/i);
  assert.match(sql, /board_post_comments\.status = 'published'/i);
  assert.match(sql, /board_post_comments\.parent_comment_id is null/i);
  assert.match(sql, /least\(greatest\(coalesce\(p_limit, 100\), 1\), 100\)/i);
  assert.match(sql, /coalesce\(nullif\(trim\(profiles\.handle\), ''\), 'jmpseat member'\)/i);
  assert.match(returnSignature, /\bid uuid\b/i);
  assert.match(returnSignature, /\bpost_id uuid\b/i);
  assert.match(returnSignature, /\bbody text\b/i);
  assert.match(returnSignature, /\bcreated_at timestamptz\b/i);
  assert.match(returnSignature, /\bupdated_at timestamptz\b/i);
  assert.match(returnSignature, /\bauthor_label text\b/i);
  assert.match(sql, /revoke all on function public\.list_open_baseboard_post_comments\(text, uuid, integer\) from public/i);
  assert.match(sql, /revoke execute on function public\.list_open_baseboard_post_comments\(text, uuid, integer\) from anon/i);
  assert.match(sql, /grant execute on function public\.list_open_baseboard_post_comments\(text, uuid, integer\) to authenticated/i);
  assert.match(sql, /grant execute on function public\.list_open_baseboard_post_comments\(text, uuid, integer\) to service_role/i);

  assert.doesNotMatch(returnSignature, /author_user_id|email|claimed|verification|proof|reporter|signed|private|removed|removal|moderation/i);
});

test("T19 create comment RPC uses T13-equivalent contribution eligibility and forces safe comment fields", () => {
  const sql = readCommentsMigration();

  assert.match(sql, /create or replace function public\.create_open_baseboard_post_comment\(/i);
  assert.match(sql, /returns uuid/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = public, pg_temp/i);
  assert.match(sql, /v_user_id uuid := auth\.uid\(\)/i);
  assert.match(sql, /public\.current_user_can_create_open_board_post\(\)/i);
  assert.match(sql, /bases\.code = v_base_code/i);
  assert.match(sql, /boards\.visibility = 'open_verified'/i);
  assert.match(sql, /board_posts\.id = p_post_id/i);
  assert.match(sql, /board_posts\.status = 'published'/i);
  assert.match(sql, /board_posts\.visibility = 'board'/i);
  assert.match(sql, /v_body text := trim\(coalesce\(p_body, ''\)\)/i);
  assert.match(sql, /char_length\(v_body\) = 0/i);
  assert.match(sql, /char_length\(v_body\) > 2000/i);
  assert.match(sql, /author_user_id[\s\S]*v_user_id/i);
  assert.match(sql, /parent_comment_id[\s\S]*null/i);
  assert.match(sql, /status[\s\S]*'published'/i);
  assert.match(sql, /return v_comment_id/i);
  assert.match(sql, /revoke all on function public\.create_open_baseboard_post_comment\(text, uuid, text\) from public/i);
  assert.match(sql, /revoke execute on function public\.create_open_baseboard_post_comment\(text, uuid, text\) from anon/i);
  assert.match(sql, /grant execute on function public\.create_open_baseboard_post_comment\(text, uuid, text\) to authenticated/i);
  assert.match(sql, /grant execute on function public\.create_open_baseboard_post_comment\(text, uuid, text\) to service_role/i);

  assert.doesNotMatch(sql, /p_author|p_status|p_parent_comment_id/i);
  assert.doesNotMatch(sql, /claimed_airline|claimed_role|claimed_base|verification_evidence|storage_path|signed_url/i);
});

test("T19 moderation RPC is operator-scoped and only hides or removes comments", () => {
  const sql = readCommentsMigration();
  const executableSql = sql
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("comment on "))
    .join("\n");

  assert.match(sql, /create or replace function public\.moderate_open_baseboard_post_comment\(/i);
  assert.match(sql, /p_comment_id uuid/i);
  assert.match(sql, /p_action text/i);
  assert.match(sql, /p_reason text/i);
  assert.match(sql, /returns uuid/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = public, pg_temp/i);
  assert.match(sql, /v_user_id uuid := auth\.uid\(\)/i);
  assert.match(sql, /public\.is_operator_with_scope\('operator\.community_moderation'\)/i);
  assert.match(sql, /v_action not in \('hide', 'remove'\)/i);
  assert.match(sql, /char_length\(v_reason\) = 0/i);
  assert.match(sql, /char_length\(v_reason\) > 1000/i);
  assert.match(sql, /boards\.visibility = 'open_verified'/i);
  assert.match(sql, /board_types\.key = 'base_board'/i);
  assert.match(sql, /update public\.board_post_comments/i);
  assert.match(sql, /status = case when v_action = 'hide' then 'hidden' else 'removed' end/i);
  assert.match(sql, /removed_at = now\(\)/i);
  assert.match(sql, /removed_by = v_user_id/i);
  assert.match(sql, /removal_reason = v_reason/i);
  assert.match(sql, /return p_comment_id/i);
  assert.match(sql, /revoke all on function public\.moderate_open_baseboard_post_comment\(text, uuid, text, text\) from public/i);
  assert.match(sql, /revoke execute on function public\.moderate_open_baseboard_post_comment\(text, uuid, text, text\) from anon/i);
  assert.match(sql, /grant execute on function public\.moderate_open_baseboard_post_comment\(text, uuid, text, text\) to authenticated/i);
  assert.match(sql, /grant execute on function public\.moderate_open_baseboard_post_comment\(text, uuid, text, text\) to service_role/i);

  assert.doesNotMatch(executableSql, /ban|suspend|appeal|ai[_ -]?moderation|comment_reports|board_post_comment_reports/i);
});

test("T19 adds no direct board_posts write policies or out-of-scope features", () => {
  const sql = readCommentsMigration();
  const executableSql = sql
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("comment on "))
    .join("\n");

  assert.doesNotMatch(sql, /create policy[\s\S]*on public\.board_posts[\s\S]*for (insert|update|delete)/i);
  assert.doesNotMatch(sql, /grant (insert|update|delete) on table public\.board_posts to (anon|authenticated|public)/i);
  assert.doesNotMatch(sql, /create table public\.(saved_items|post_saves|reactions|post_reactions|search|crew_picks|layovers)\b/i);
  assert.doesNotMatch(executableSql, /to_tsvector|search_vector|public sharing|proof-upload|proof upload|storage\.objects|signed_url/i);
});

test("T19 server helper reads DFW comments through the safe RPC only", () => {
  assert.match(commentsHelperSource, /import "server-only"/);
  assert.match(commentsHelperSource, /listDfwBaseboardPostComments/);
  assert.match(commentsHelperSource, /list_open_baseboard_post_comments/);
  assert.match(commentsHelperSource, /p_base_code: "DFW"/);
  assert.match(commentsHelperSource, /p_post_id: normalizedPostId/);
  assert.match(commentsHelperSource, /authorLabel/);
  assert.match(commentsHelperSource, /"jmpseat member"/);
  assert.match(commentsHelperSource, /comments: \[\]/);
  assert.match(commentsHelperSource, /error: null/);

  assert.doesNotMatch(commentsHelperSource, /createBrowserClient|from\("board_post_comments"\)|author_user_id|email|claimed|verification|proof|storage|signed/i);
});

test("DFW post detail route gates before reading comments and wires safe comment status", () => {
  assert.match(detailRouteSource, /dynamic = "force-dynamic"/);
  assert.match(detailRouteSource, /requireDfwHubRouteAccess/);
  assert.match(detailRouteSource, /listDfwBaseboardPostComments/);
  assert.match(detailRouteSource, /createDfwBaseboardPostCommentAction/);
  assert.match(detailRouteSource, /DFW_BASEBOARD_COMMENT_STATUS_PARAM/);
  assert.match(detailRouteSource, /await requireDfwHubRouteAccess[\s\S]*getDfwBaseboardPost[\s\S]*listDfwBaseboardPostComments/s);
  assert.match(detailRouteSource, /comments=\{commentResult\.comments\}/);
  assert.match(detailRouteSource, /createCommentAction=\{createDfwBaseboardPostCommentAction\}/);
  assert.doesNotMatch(detailRouteSource, /create_open_baseboard_post_comment[\s\S]*return \(/);
  assert.doesNotMatch(detailRouteSource, /\.insert\(|\.update\(|\.delete\(/);
});

test("DFW post detail UI renders comments, composer, and the T20 comment report affordance without replies", () => {
  const commentsSectionSource = detailShellSource.slice(
    detailShellSource.indexOf("function DfwBaseboardCommentsSection"),
  );

  assert.match(detailShellSource, /DfwBaseboardCommentsSection/);
  assert.match(commentsSectionSource, /Post a comment/);
  assert.match(commentsSectionSource, /name="commentBody"/);
  assert.match(detailShellSource, /Your comment is live\./);
  assert.match(detailShellSource, /Add a comment before posting\. Comments can be up to 2,000 characters\./);
  assert.match(detailShellSource, /jmpseat could not publish that comment right now/);
  assert.match(commentsSectionSource, /No comments yet\./);
  assert.match(commentsSectionSource, /comments\.map/);
  assert.match(commentsSectionSource, /authorLabel/);
  assert.match(commentsSectionSource, /DfwBaseboardCommentReportForm/);
  assert.match(commentsSectionSource, /reportCommentAction/);
  assert.doesNotMatch(commentsSectionSource, /parentComment|parent_comment|Reply to comment/i);
  assert.doesNotMatch(commentsSectionSource, /save comment|reaction|public sharing|share this/i);
});

test("T19 docs describe runtime-applied comments scope and completed T20 safety step", () => {
  assert.match(docsSource, /FBMVP-T19/i);
  assert.match(docsSource, /DFW Baseboard Comments Foundation/i);
  assert.match(docsSource, /runtime-applied/i);
  assert.match(docsSource, /top-level DFW Baseboard comments/i);
  assert.match(docsSource, /safe read\/create RPCs|safe read and create RPCs/i);
  assert.match(docsSource, /operator hide\/remove RPC/i);
  assert.match(docsSource, /zero direct `board_posts` write policies/i);
  assert.match(docsSource, /no direct anon\/authenticated comment table writes/i);
  assert.match(docsSource, /nested replies/i);
  assert.match(docsSource, /comment reporting/i);
  assert.match(docsSource, /comment moderation review UI/i);
  assert.match(docsSource, /saves/i);
  assert.match(docsSource, /reactions/i);
  assert.match(docsSource, /search/i);
  assert.match(docsSource, /Crew Picks/i);
  assert.match(docsSource, /Layovers/i);
  assert.match(docsSource, /public sharing/i);
  assert.match(docsSource, /proof-upload|proof upload/i);
  assert.match(docsSource, /broad supabase db push remains unsafe/i);
  assert.match(docsSource, /T20[\s\S]*comment reporting[\s\S]*(merged and runtime-applied|runtime-applied)/i);
});
