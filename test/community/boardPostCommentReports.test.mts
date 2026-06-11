import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

function readCommentReportsMigration() {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) =>
        name.endsWith("_create_board_post_comment_reports.sql"),
      )
    : [];

  assert.equal(
    migrationNames.length,
    1,
    "expected one T20 board-post-comment-reports migration",
  );

  return readFileSync(path.join(migrationsDir.pathname, migrationNames[0]), "utf8");
}

test("T20 migration creates a private board post comment report table", () => {
  const sql = readCommentReportsMigration();

  assert.match(sql, /create table public\.board_post_comment_reports/i);
  assert.match(sql, /comment_id uuid not null references public\.board_post_comments \(id\) on delete cascade/i);
  assert.match(sql, /reporter_user_id uuid not null references auth\.users \(id\) on delete cascade/i);
  assert.match(sql, /reason text not null/i);
  assert.match(sql, /details text/i);
  assert.match(sql, /status text not null default 'open'/i);
  assert.match(sql, /reviewed_at timestamptz/i);
  assert.match(sql, /reviewed_by uuid references auth\.users \(id\)/i);
  assert.match(sql, /resolution_note text/i);
  assert.match(sql, /board_post_comment_reports_reason_check[\s\S]*'spam'[\s\S]*'harassment'[\s\S]*'unsafe_info'[\s\S]*'privacy'[\s\S]*'off_topic'[\s\S]*'other'/i);
  assert.match(sql, /board_post_comment_reports_status_check[\s\S]*'open'[\s\S]*'reviewing'[\s\S]*'resolved'[\s\S]*'dismissed'/i);
  assert.match(sql, /board_post_comment_reports_details_length_check[\s\S]*char_length\(details\) <= 1000/i);
  assert.match(sql, /board_post_comment_reports_resolution_note_length_check[\s\S]*char_length\(resolution_note\) <= 1000/i);
  assert.match(sql, /one_open_report_per_reporter_comment/i);
  assert.match(sql, /alter table public\.board_post_comment_reports enable row level security/i);
  assert.match(sql, /revoke all on table public\.board_post_comment_reports from anon, authenticated/i);
  assert.match(sql, /grant select, insert, update on table public\.board_post_comment_reports to service_role/i);

  assert.doesNotMatch(sql, /create policy[\s\S]*on public\.board_post_comment_reports[\s\S]*to (anon|authenticated|public)/i);
  assert.doesNotMatch(sql, /grant (select|insert|update|delete) on table public\.board_post_comment_reports to (anon|authenticated|public)/i);
  assert.doesNotMatch(sql, /create policy[\s\S]*on public\.(board_posts|board_post_comments)[\s\S]*for (insert|update|delete)/i);
});

test("comment report RPC is gated, base-scoped, and only reports published top-level comments", () => {
  const sql = readCommentReportsMigration();

  assert.match(sql, /create or replace function public\.report_open_baseboard_post_comment\(/i);
  assert.match(sql, /p_base_code text/i);
  assert.match(sql, /p_comment_id uuid/i);
  assert.match(sql, /p_reason text/i);
  assert.match(sql, /p_details text default null/i);
  assert.match(sql, /returns uuid/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = public, pg_temp/i);
  assert.match(sql, /v_user_id uuid := auth\.uid\(\)/i);
  assert.match(sql, /if v_user_id is null/i);
  assert.match(sql, /public\.current_user_can_read_open_board_posts\(\)/i);
  assert.match(sql, /bases\.code = v_base_code/i);
  assert.match(sql, /boards\.visibility = 'open_verified'/i);
  assert.match(sql, /board_types\.key = 'base_board'/i);
  assert.match(sql, /board_posts\.status = 'published'/i);
  assert.match(sql, /board_posts\.visibility = 'board'/i);
  assert.match(sql, /board_post_comments\.status = 'published'/i);
  assert.match(sql, /board_post_comments\.parent_comment_id is null/i);
  assert.match(sql, /v_reason not in \('spam', 'harassment', 'unsafe_info', 'privacy', 'off_topic', 'other'\)/i);
  assert.match(sql, /char_length\(v_details\) > 1000/i);
  assert.match(sql, /reporter_user_id[\s\S]*v_user_id/i);
  assert.match(sql, /return v_report_id/i);
  assert.match(sql, /revoke all on function public\.report_open_baseboard_post_comment\(text, uuid, text, text\) from public/i);
  assert.match(sql, /revoke execute on function public\.report_open_baseboard_post_comment\(text, uuid, text, text\) from anon/i);
  assert.match(sql, /grant execute on function public\.report_open_baseboard_post_comment\(text, uuid, text, text\) to authenticated/i);
  assert.match(sql, /grant execute on function public\.report_open_baseboard_post_comment\(text, uuid, text, text\) to service_role/i);

  assert.doesNotMatch(sql, /p_reporter|claimed_airline|claimed_role|claimed_base|verification_evidence|storage_path|signed_url/i);
});

test("operator comment report review RPC returns safe bounded fields only", () => {
  const sql = readCommentReportsMigration();
  const returnsBlock =
    sql.match(/public\.list_open_baseboard_post_comment_reports[\s\S]*?returns table\s*\(([\s\S]*?)\)\s*language plpgsql/i)?.[1] ??
    "";

  assert.match(sql, /create or replace function public\.list_open_baseboard_post_comment_reports\(/i);
  assert.match(sql, /p_limit integer default 50/i);
  assert.match(sql, /stable/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = public, pg_temp/i);
  assert.match(sql, /public\.is_operator_with_scope\('operator\.community_moderation'\)/i);
  assert.match(sql, /board_post_comment_reports\.status in \('open', 'reviewing'\)/i);
  assert.match(sql, /board_post_comments\.status = 'published'/i);
  assert.match(sql, /board_post_comments\.parent_comment_id is null/i);
  assert.match(sql, /board_posts\.status = 'published'/i);
  assert.match(sql, /board_posts\.visibility = 'board'/i);
  assert.match(sql, /least\(greatest\(coalesce\(p_limit, 50\), 1\), 100\)/i);
  assert.match(sql, /profiles\.handle/i);
  assert.match(sql, /'jmpseat member'/i);

  assert.match(returnsBlock, /report_id uuid/i);
  assert.match(returnsBlock, /comment_id uuid/i);
  assert.match(returnsBlock, /post_id uuid/i);
  assert.match(returnsBlock, /comment_body_preview text/i);
  assert.match(returnsBlock, /comment_author_label text/i);
  assert.match(returnsBlock, /post_title_preview text/i);
  assert.match(returnsBlock, /reason text/i);
  assert.match(returnsBlock, /details text/i);
  assert.match(returnsBlock, /report_status text/i);
  assert.match(returnsBlock, /reported_at timestamptz/i);
  assert.doesNotMatch(
    returnsBlock,
    /reporter|reporter_user_id|author_user_id|email|claimed|verification|evidence|proof|storage|signed|private/i,
  );
  const executableSql = sql
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("comment on "))
    .join("\n");
  assert.doesNotMatch(executableSql, /verification_evidence|verification_requests|verification_claims|storage\.|signed_url|private_path/i);

  assert.match(sql, /revoke all on function public\.list_open_baseboard_post_comment_reports\(text, integer\) from public/i);
  assert.match(sql, /revoke execute on function public\.list_open_baseboard_post_comment_reports\(text, integer\) from anon/i);
  assert.match(sql, /grant execute on function public\.list_open_baseboard_post_comment_reports\(text, integer\) to authenticated/i);
  assert.match(sql, /grant execute on function public\.list_open_baseboard_post_comment_reports\(text, integer\) to service_role/i);
});
