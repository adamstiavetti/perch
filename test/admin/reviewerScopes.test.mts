import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

import {
  ADMIN_ROUTES,
  buildAdminNavigation,
} from "../../src/lib/admin/access.ts";
import {
  REVIEWER_SCOPE_STATUSES,
  REVIEWER_SCOPE_TYPES,
  filterActiveReviewerScopes,
  normalizeReviewerScopeReason,
  normalizeReviewerScopeType,
  normalizeReviewerScopeValue,
  normalizeTargetUserId,
} from "../../src/lib/admin/reviewerScopesShared.ts";
import {
  REVIEWER_SCOPE_STATUSES as VERIFICATION_REVIEWER_SCOPE_STATUSES,
  REVIEWER_SCOPE_TYPES as VERIFICATION_REVIEWER_SCOPE_TYPES,
  filterReviewQueueByScopes,
} from "../../src/lib/verification/review.ts";

test("reviewer-scope helpers normalize bounded operator input", () => {
  assert.deepEqual(REVIEWER_SCOPE_TYPES, ["global", "airline", "role", "base"]);
  assert.deepEqual(REVIEWER_SCOPE_STATUSES, ["active", "paused", "revoked"]);
  assert.deepEqual(REVIEWER_SCOPE_TYPES, VERIFICATION_REVIEWER_SCOPE_TYPES);
  assert.deepEqual(REVIEWER_SCOPE_STATUSES, VERIFICATION_REVIEWER_SCOPE_STATUSES);
  assert.equal(normalizeReviewerScopeType(" AIRLINE "), "airline");
  assert.equal(normalizeReviewerScopeType("invalid"), null);
  assert.equal(normalizeReviewerScopeValue(" Delta "), "delta");
  assert.equal(normalizeReviewerScopeValue(" "), null);
  assert.equal(normalizeReviewerScopeReason("  staffing coverage  "), "staffing coverage");
  assert.equal(normalizeReviewerScopeReason(" "), null);
  assert.equal(
    normalizeTargetUserId(" 00000000-0000-4000-8000-000000000001 "),
    "00000000-0000-4000-8000-000000000001",
  );
  assert.equal(normalizeTargetUserId("not-a-user-id"), null);
});

test("global reviewer scopes reject scope values and non-global scopes require values", () => {
  assert.equal(normalizeReviewerScopeValue("anything", "global"), null);
  assert.equal(normalizeReviewerScopeValue(" Delta ", "airline"), "delta");
  assert.equal(normalizeReviewerScopeValue("", "airline"), null);
  assert.equal(normalizeReviewerScopeValue(" Captain ", "role"), "captain");
  assert.equal(normalizeReviewerScopeValue(" JFK ", "base"), "jfk");
});

test("revoked reviewer scopes no longer count for review queue filtering", () => {
  const scopes = [
    {
      scope_type: "airline",
      scope_value: "delta",
      status: "revoked",
    },
    {
      scope_type: "airline",
      scope_value: "delta",
      status: "active",
    },
  ];
  const queue = [
    {
      request: {
        id: "request-1",
        user_id: "user-1",
      },
      evidence: [
        {
          metadata: {
            requested_airline: "delta",
          },
        },
      ],
    },
  ];

  assert.equal(filterActiveReviewerScopes(scopes).length, 1);
  assert.deepEqual(
    filterReviewQueueByScopes({
      queue,
      scopes: [
        {
          scope_type: "airline",
          scope_value: "delta",
          status: "revoked",
        },
      ],
    }),
    [],
  );
  assert.equal(
    filterReviewQueueByScopes({
      queue,
      scopes: [
        {
          scope_type: "airline",
          scope_value: "delta",
          status: "active",
        },
      ],
    }).length,
    1,
  );
});

test("reviewer-scopes route becomes available only for matching operator scope", () => {
  const unauthorizedNavigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: [],
  });
  const authorizedNavigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: ["operator.manage_reviewer_scopes"],
  });

  assert.equal(
    unauthorizedNavigation.find((item) => item.path === ADMIN_ROUTES.reviewerScopes)?.status,
    "disabled",
  );

  const reviewerScopesItem = authorizedNavigation.find(
    (item) => item.path === ADMIN_ROUTES.reviewerScopes,
  );

  assert.equal(reviewerScopesItem?.status, "available");
  assert.equal(reviewerScopesItem?.availabilityLabel, "Available now");
  assert.match(reviewerScopesItem?.reason ?? "", /operator\.manage_reviewer_scopes/i);
});

test("operator scope does not imply verification reviewer queue access", () => {
  const navigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: ["operator.manage_reviewer_scopes"],
  });

  assert.equal(
    navigation.find((item) => item.path === ADMIN_ROUTES.verification)?.status,
    "disabled",
  );
  assert.equal(
    navigation.find((item) => item.path === ADMIN_ROUTES.reviewerScopes)?.status,
    "available",
  );
});

test("reviewer-scopes page enforces private gate and operator scope before loading records", () => {
  const source = readFileSync(
    new URL("../../app/app/admin/reviewer-scopes/page.tsx", import.meta.url),
    "utf8",
  );
  const gateIndex = source.indexOf("const gate = getPrivateAppGateResult(");
  const fallbackIndex = source.indexOf("if (!env.enabled) {");
  const loadErrorIndex = source.indexOf("if (operatorContext.loadError) {");
  const unauthorizedIndex = source.indexOf("!hasOperatorScope");
  const listIndex = source.indexOf("const reviewerScopesResult = await getReviewerScopesForOperator(searchQuery);");

  assert.match(source, /AdminShell/);
  assert.match(source, /getCurrentOperatorAccess/);
  assert.match(source, /REVIEWER_SCOPE_OPERATOR_SCOPE/);
  assert.match(source, /AUTH_ROUTES\.accessRestricted/);
  assert.match(source, /getReviewerScopesForOperator/);
  assert.match(source, /grantVerificationReviewerScopeAction/);
  assert.match(source, /revokeVerificationReviewerScopeAction/);
  assert.match(source, /const appContext = await getCurrentAppAccessContext\(\);/);
  assert.match(source, /if \(gate\.kind === "redirect"\)\s*{\s*redirect\(gate\.path\);/s);
  assert.ok(gateIndex >= 0);
  assert.ok(fallbackIndex >= 0);
  assert.ok(loadErrorIndex >= 0);
  assert.ok(unauthorizedIndex >= 0);
  assert.ok(listIndex >= 0);
  assert.ok(gateIndex < fallbackIndex);
  assert.ok(loadErrorIndex < unauthorizedIndex);
  assert.ok(unauthorizedIndex < listIndex);
  assert.doesNotMatch(source, /\.from\("verification_reviewer_scopes"\)/);
});

test("reviewer-scopes server module uses session-backed RPCs and safe access states", () => {
  const source = readFileSync(
    new URL("../../src/lib/admin/reviewerScopes.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /rpc\(\s*"list_verification_reviewer_scopes_for_operator"/);
  assert.match(source, /rpc\(\s*"grant_verification_reviewer_scope"/);
  assert.match(source, /rpc\(\s*"revoke_verification_reviewer_scope"/);
  assert.match(source, /current_user_operator_scopes/);
  assert.match(source, /REVIEWER_SCOPE_NOT_READY_MESSAGE/);
  assert.match(source, /kind: "not_ready"/);
  assert.match(source, /reviewer_scope\.unauthorized_attempt/);
  assert.doesNotMatch(source, /createStorageAdminClient|SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(source, /\.from\("verification_reviewer_scopes"\)/);
});

test("reviewer-scope management migration adds audited operator RPCs with self-escalation controls", () => {
  const migrationsDir = new URL("../../supabase/migrations/", import.meta.url);
  const migrationName = readdirSync(migrationsDir).find((name) =>
    name.endsWith("_add_operator_managed_reviewer_scopes.sql"),
  );

  assert.ok(migrationName, "expected reviewer-scope management migration");

  const sql = readFileSync(
    new URL(`../../supabase/migrations/${migrationName}`, import.meta.url),
    "utf8",
  );
  const grantFunction = sql.slice(
    sql.indexOf("create or replace function public.grant_verification_reviewer_scope"),
    sql.indexOf("create or replace function public.revoke_verification_reviewer_scope"),
  );
  const revokeFunction = sql.slice(
    sql.indexOf("create or replace function public.revoke_verification_reviewer_scope"),
  );

  assert.match(sql, /create or replace function public\.list_verification_reviewer_scopes_for_operator/i);
  assert.match(sql, /create or replace function public\.grant_verification_reviewer_scope/i);
  assert.match(sql, /create or replace function public\.revoke_verification_reviewer_scope/i);
  assert.match(sql, /operator\.manage_reviewer_scopes/i);
  assert.match(sql, /reviewer_scope\.granted/i);
  assert.match(sql, /reviewer_scope\.revoked/i);
  assert.match(sql, /reviewer_scope\.unauthorized_attempt/i);
  assert.match(sql, /'code', 'self_grant_blocked'/i);
  assert.match(sql, /'code', 'self_revoke_blocked'/i);
  assert.match(sql, /'code', 'duplicate_active_reviewer_scope'/i);
  assert.match(sql, /'code', 'target_scope_not_active'/i);
  assert.match(sql, /status = 'revoked'/i);
  assert.match(sql, /revoked_by = v_actor_id/i);
  assert.doesNotMatch(sql, /delete from public\.verification_reviewer_scopes/i);
  assert.doesNotMatch(grantFunction, /raise exception/i);
  assert.doesNotMatch(revokeFunction, /raise exception/i);
});

test("reviewer-scope migration deduplicates existing active scopes before creating the unique index", () => {
  const migrationsDir = new URL("../../supabase/migrations/", import.meta.url);
  const migrationName = readdirSync(migrationsDir).find((name) =>
    name.endsWith("_add_operator_managed_reviewer_scopes.sql"),
  );

  assert.ok(migrationName, "expected reviewer-scope management migration");

  const sql = readFileSync(
    new URL(`../../supabase/migrations/${migrationName}`, import.meta.url),
    "utf8",
  );
  const dedupeIndex = sql.indexOf("with ranked_active_scopes as (");
  const uniqueIndex = sql.indexOf("create unique index if not exists verification_reviewer_scopes_one_active_scope_idx");
  const dedupeBlock = sql.slice(dedupeIndex, uniqueIndex);

  assert.ok(dedupeIndex >= 0);
  assert.ok(uniqueIndex >= 0);
  assert.ok(dedupeIndex < uniqueIndex);
  assert.match(dedupeBlock, /row_number\(\) over/i);
  assert.match(dedupeBlock, /partition by\s+reviewer_id,\s+scope_type,\s+lower\(btrim\(coalesce\(scope_value, ''\)\)\)/i);
  assert.match(dedupeBlock, /order by\s+created_at asc nulls last,\s+id asc/i);
  assert.match(dedupeBlock, /where status = 'active'/i);
  assert.match(dedupeBlock, /where duplicate_rank > 1/i);
  assert.match(dedupeBlock, /update public\.verification_reviewer_scopes as scope/i);
  assert.match(dedupeBlock, /status = 'revoked'/i);
  assert.match(dedupeBlock, /revoked_at = now\(\)/i);
  assert.match(dedupeBlock, /revoked_by = null/i);
  assert.doesNotMatch(dedupeBlock, /delete from public\.verification_reviewer_scopes/i);
  assert.doesNotMatch(dedupeBlock, /insert into public\.security_events/i);
});

test("reviewer-scope duplicate cleanup uses the same normalized key as index and RPC duplicate checks", () => {
  const migrationsDir = new URL("../../supabase/migrations/", import.meta.url);
  const migrationName = readdirSync(migrationsDir).find((name) =>
    name.endsWith("_add_operator_managed_reviewer_scopes.sql"),
  );

  assert.ok(migrationName, "expected reviewer-scope management migration");

  const sql = readFileSync(
    new URL(`../../supabase/migrations/${migrationName}`, import.meta.url),
    "utf8",
  );
  const keyExpression = "lower(btrim(coalesce(scope_value, '')))";

  assert.match(sql, /create unique index if not exists verification_reviewer_scopes_one_active_scope_idx/i);
  assert.ok(sql.includes(keyExpression));
  assert.match(
    sql,
    /lower\(btrim\(coalesce\(scope_value, ''\)\)\) = coalesce\(v_scope_value, ''\)/i,
  );
});

test("reviewer-scope migration preserves existing reviewer queue authorization semantics", () => {
  const migrationsDir = new URL("../../supabase/migrations/", import.meta.url);
  const migrationName = readdirSync(migrationsDir).find((name) =>
    name.endsWith("_add_operator_managed_reviewer_scopes.sql"),
  );

  assert.ok(migrationName, "expected reviewer-scope management migration");

  const sql = readFileSync(
    new URL(`../../supabase/migrations/${migrationName}`, import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(sql, /create or replace function public\.can_review_verification_request/i);
  assert.doesNotMatch(sql, /verification_claims|claim issuance|approved_by/i);
  assert.match(sql, /create unique index if not exists verification_reviewer_scopes_one_active_scope_idx/i);
  assert.match(sql, /where status = 'active'/i);
});

test("reviewer-scope action form maps self and duplicate denials to safe messages", () => {
  const source = readFileSync(
    new URL("../../src/lib/admin/reviewerScopes.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /self_grant_blocked/);
  assert.match(source, /self_revoke_blocked/);
  assert.match(source, /duplicate_active_reviewer_scope/);
  assert.match(source, /target_scope_not_active/);
  assert.doesNotMatch(source, /console\.log|console\.error/);
});
