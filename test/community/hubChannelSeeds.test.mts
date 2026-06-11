import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const EXPECTED_CHANNEL_SLUGS = [
  "dfw-q-and-a",
  "commuting-parking",
  "terminal-ground-logistics",
  "food-coffee-breaks",
  "new-to-dfw",
  "dfw-layover-local",
];

const REJECTED_CHANNEL_SLUGS = ["base-life", "crew-tips", "app-feedback"];

function readHubChannelSeedMigration() {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) =>
        name.endsWith("_create_hub_channel_board_type_dfw_seeds.sql"),
      )
    : [];

  assert.equal(
    migrationNames.length,
    1,
    "expected one T25B hub channel board type and DFW seed migration",
  );

  return readFileSync(path.join(migrationsDir.pathname, migrationNames[0]), "utf8");
}

test("T25B migration adds hub_channel board type and six DFW child channel slugs", () => {
  const sql = readHubChannelSeedMigration();

  assert.match(sql, /insert into public\.board_types/i);
  assert.match(sql, /'hub_channel'/i);
  assert.match(sql, /'Hub Channel'/i);
  assert.match(sql, /'open_verified'/i);
  assert.match(sql, /'members_can_post'/i);
  assert.match(sql, /on conflict \(key\) do update/i);

  for (const slug of EXPECTED_CHANNEL_SLUGS) {
    assert.match(sql, new RegExp(`'${slug}'`, "i"));
  }

  for (const slug of REJECTED_CHANNEL_SLUGS) {
    assert.doesNotMatch(sql, new RegExp(`'${slug}'`, "i"));
  }
});

test("T25B migration resolves active DFW parent board and seeds child boards idempotently", () => {
  const sql = readHubChannelSeedMigration();

  assert.match(sql, /from public\.bases/i);
  assert.match(sql, /bases\.code = 'DFW'/i);
  assert.match(sql, /bases\.status = 'active'/i);
  assert.match(sql, /parent_boards\.slug = 'dfw'/i);
  assert.match(sql, /parent_boards\.status = 'active'/i);
  assert.match(sql, /parent_board_types\.key = 'base_board'/i);
  assert.match(sql, /parent_board_types\.is_active = true/i);
  assert.match(sql, /channel_board_types\.key = 'hub_channel'/i);
  assert.match(sql, /channel_board_types\.is_active = true/i);
  assert.match(sql, /parent_board_id/i);
  assert.match(sql, /on conflict \(slug\) do update/i);
  assert.match(sql, /where public\.boards\.base_id = excluded\.base_id\s+and public\.boards\.parent_board_id = excluded\.parent_board_id/i);
  assert.match(sql, /v_seeded_channel_count <> 6/i);
  assert.match(sql, /Expected 6 DFW Hub Channel child boards/i);
});

test("T25B migration keeps Channels as board metadata only", () => {
  const sql = readHubChannelSeedMigration();

  assert.doesNotMatch(sql, /create table public\.channels/i);
  assert.doesNotMatch(sql, /create table public\.hub_channels/i);
  assert.doesNotMatch(sql, /create or replace function public\.list_open_hub_channels/i);
  assert.doesNotMatch(sql, /create or replace function public\.list_open_hub_channel_posts/i);
  assert.doesNotMatch(sql, /create or replace function public\.create_open_hub_channel_post/i);
  assert.doesNotMatch(sql, /create or replace function public\.get_open_hub_channel_post/i);
  assert.doesNotMatch(sql, /create or replace function public\..*hub_channel.*comment/i);
  assert.doesNotMatch(sql, /create or replace function public\..*hub_channel.*report/i);
  assert.doesNotMatch(sql, /alter table public\.board_posts/i);
  assert.doesNotMatch(sql, /alter table public\.board_post_comments/i);
  assert.doesNotMatch(sql, /board_posts\.category/i);
  assert.doesNotMatch(sql, /create policy[\s\S]*(insert|update|delete)/i);
  assert.doesNotMatch(sql, /grant (insert|update|delete) on table public\./i);
});

test("T25B docs describe private-beta taxonomy and incomplete Channels behavior", () => {
  const docs = [
    "../../docs/ops/fbmvp-t25b-hub-channel-board-type-dfw-seeds.md",
    "../../docs/BUILD_TICKETS.md",
    "../../docs/DATA_MODEL.md",
    "../../docs/ops/05b-first-base-mvp-planning.md",
    "../../docs/ops/hub-pivot-plan.md",
  ]
    .map((docPath) => readFileSync(new URL(docPath, import.meta.url), "utf8"))
    .join("\n\n");

  assert.match(docs, /FBMVP-T25B/i);
  assert.match(docs, /hub_channel/i);
  assert.match(docs, /private-beta seed defaults/i);
  assert.match(docs, /six DFW child/i);
  assert.match(docs, /no UI routes/i);
  assert.match(docs, /no post reads/i);
  assert.match(docs, /no composer/i);
  assert.match(docs, /no comments/i);
  assert.match(docs, /no reports/i);
  assert.match(docs, /no moderation review changes/i);
  assert.match(docs, /no runtime apply/i);
  assert.match(docs, /DB\/RPC-backed Channels remain incomplete/i);
  assert.match(docs, /slugs should be\s+treated as stable unless redirects or aliases are explicitly planned/i);

  for (const slug of EXPECTED_CHANNEL_SLUGS) {
    assert.match(docs, new RegExp(slug, "i"));
  }
});
