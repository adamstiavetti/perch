import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import {
  POLICY_ACCEPTANCE_ROUTE,
  REQUIRED_POLICY_ACCEPTANCES,
  getMissingRequiredPolicyAcceptances,
  sanitizePolicyAcceptanceNextPath,
} from "../../src/lib/policyAcceptance/policies.ts";

function readSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

function readPolicyAcceptanceMigration() {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = readdirSync(migrationsDir).filter((name) =>
    name.endsWith("_create_user_policy_acceptances.sql"),
  );

  assert.equal(
    migrationNames.length,
    1,
    "expected one POL-ACCEPT-01A user policy acceptances migration",
  );

  return readFileSync(path.join(migrationsDir.pathname, migrationNames[0]), "utf8");
}

test("required policy acceptance allowlist is exact and links public policy pages", () => {
  assert.equal(POLICY_ACCEPTANCE_ROUTE, "/app/policy-acceptance");
  assert.deepEqual(
    REQUIRED_POLICY_ACCEPTANCES.map((policy) => ({
      key: policy.key,
      version: policy.version,
      href: policy.href,
    })),
    [
      {
        key: "private_beta_terms",
        version: "v1",
        href: "/legal/beta-terms",
      },
      {
        key: "privacy_notice",
        version: "v1",
        href: "/legal/privacy",
      },
      {
        key: "community_rules",
        version: "v1",
        href: "/legal/community-rules",
      },
    ],
  );
});

test("missing policy helper is idempotent and ignores arbitrary client policy values", () => {
  assert.deepEqual(
    getMissingRequiredPolicyAcceptances([
      { policy_key: "private_beta_terms", policy_version: "v1" },
      { policy_key: "privacy_notice", policy_version: "v1" },
      { policy_key: "community_rules", policy_version: "v1" },
      { policy_key: "fake_policy", policy_version: "v9" },
    ]),
    [],
  );

  assert.deepEqual(
    getMissingRequiredPolicyAcceptances([
      { policy_key: "private_beta_terms", policy_version: "v1" },
    ]).map((policy) => policy.key),
    ["privacy_notice", "community_rules"],
  );
});

test("policy acceptance next path stays inside the private app and avoids loops", () => {
  assert.equal(sanitizePolicyAcceptanceNextPath("/app/hubs/dfw"), "/app/hubs/dfw");
  assert.equal(sanitizePolicyAcceptanceNextPath("/legal/privacy"), "/app");
  assert.equal(sanitizePolicyAcceptanceNextPath("//evil.test/app"), "/app");
  assert.equal(
    sanitizePolicyAcceptanceNextPath("/app/policy-acceptance"),
    "/app",
  );
});

test("POL-ACCEPT-01A migration creates minimal user policy acceptance table", () => {
  const sql = readPolicyAcceptanceMigration();

  assert.match(sql, /create table public\.user_policy_acceptances/i);
  assert.match(sql, /id uuid primary key default gen_random_uuid\(\)/i);
  assert.match(
    sql,
    /user_id uuid not null references auth\.users \(id\) on delete cascade/i,
  );
  assert.match(sql, /policy_key text not null/i);
  assert.match(sql, /policy_version text not null/i);
  assert.match(sql, /accepted_at timestamptz not null default now\(\)/i);
  assert.match(sql, /created_at timestamptz not null default now\(\)/i);
  assert.match(sql, /unique \(user_id, policy_key, policy_version\)/i);
  assert.match(sql, /private_beta_terms/i);
  assert.match(sql, /privacy_notice/i);
  assert.match(sql, /community_rules/i);
  assert.match(sql, /v1/i);
  assert.doesNotMatch(sql, /ip_address|raw_ip|accepted_ip|user_agent/i);
});

test("POL-ACCEPT-01A migration keeps acceptance table RLS narrow", () => {
  const sql = readPolicyAcceptanceMigration();

  assert.match(
    sql,
    /alter table public\.user_policy_acceptances enable row level security/i,
  );
  assert.match(
    sql,
    /revoke all on table public\.user_policy_acceptances from anon, authenticated/i,
  );
  assert.match(sql, /grant select on table public\.user_policy_acceptances to authenticated/i);
  assert.match(
    sql,
    /grant select, insert on table public\.user_policy_acceptances to service_role/i,
  );
  assert.match(sql, /for select[\s\S]*to authenticated[\s\S]*auth\.uid\(\) = user_id/i);
  assert.doesNotMatch(
    sql,
    /create policy[\s\S]*on public\.user_policy_acceptances[\s\S]*for (insert|update|delete)[\s\S]*to authenticated/i,
  );
  assert.doesNotMatch(sql, /to anon/i);
});

test("POL-ACCEPT-01A RPC accepts only the current server-controlled policy set", () => {
  const sql = readPolicyAcceptanceMigration();

  assert.match(sql, /create or replace function public\.accept_current_private_beta_policies\(\)/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = public, pg_temp/i);
  assert.match(sql, /v_user_id uuid := auth\.uid\(\)/i);
  assert.match(sql, /Authentication required/i);
  assert.match(sql, /on conflict \(user_id, policy_key, policy_version\) do nothing/i);
  assert.match(sql, /private_beta_terms[\s\S]*privacy_notice[\s\S]*community_rules/i);
  assert.match(sql, /revoke execute on function public\.accept_current_private_beta_policies\(\) from anon/i);
  assert.match(sql, /grant execute on function public\.accept_current_private_beta_policies\(\) to authenticated/i);
  assert.doesNotMatch(sql, /accept_current_private_beta_policies\([^)]*(user_id|policy_key|policy_version)/i);
});

test("policy acceptance route renders required policies without backend scope expansion", () => {
  const pagePath = new URL(
    "../../app/app/policy-acceptance/page.tsx",
    import.meta.url,
  );
  assert.equal(existsSync(pagePath), true, "policy acceptance route should exist");

  const pageSource = readFileSync(pagePath, "utf8");
  const actionSource = readSource("../../src/lib/policyAcceptance/actions.ts");
  const serverSource = readSource("../../src/lib/policyAcceptance/server.ts");

  assert.match(pageSource, /getPrivateAppGateResult/);
  assert.match(pageSource, /routeKind: "policy-acceptance"/);
  assert.match(pageSource, /acceptCurrentPrivateBetaPoliciesAction/);
  assert.match(pageSource, /REQUIRED_POLICY_ACCEPTANCES\.map/);
  assert.match(pageSource, /<Link href={policy\.href}>{policy\.title}<\/Link>/);
  assert.match(pageSource, /not final legal terms/i);
  assert.match(actionSource, /accept_current_private_beta_policies/);
  assert.doesNotMatch(actionSource, /policy_key|policy_version|user_id/i);
  assert.doesNotMatch(
    [pageSource, actionSource, serverSource].join("\n"),
    /\/api\/|support form exists|appeal backend exists|implements comments\/replies|raw IP collection|user agent collection/i,
  );
});

test("protected app entry points enforce policy acceptance after private app eligibility", () => {
  const appRootSource = readSource("../../app/app/page.tsx");
  const placeholderSource = readSource("../../app/app/[section]/page.tsx");
  const dfwHubAccessSource = readSource("../../src/lib/privateApp/dfwHubAccess.ts");
  const adminSource = readSource("../../app/app/admin/page.tsx");
  const moderationSource = readSource("../../app/app/admin/community-moderation/page.tsx");

  for (const source of [
    appRootSource,
    placeholderSource,
    dfwHubAccessSource,
    adminSource,
    moderationSource,
  ]) {
    assert.match(source, /requireCurrentPolicyAcceptance/);
    assert.match(source, /if \(gate\.kind === "redirect"\)[\s\S]*requireCurrentPolicyAcceptance/s);
  }

  assert.match(moderationSource, /requireCurrentPolicyAcceptance[\s\S]*getCurrentOperatorAccess/s);
  assert.match(adminSource, /requireCurrentPolicyAcceptance[\s\S]*getCurrentOperatorAccess/s);
});
