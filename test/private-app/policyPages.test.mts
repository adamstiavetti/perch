import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";

function readSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

const policyPageSource = readSource("../../app/legal/PolicyPage.tsx");
const policyContentSource = readSource("../../app/legal/policyContent.ts");
const publicHomeSource = readSource("../../app/page.tsx");
const loginSource = readSource("../../app/login/page.tsx");
const signupSource = readSource("../../app/signup/page.tsx");
const accessHoldSource = readSource("../../app/app/access-hold/page.tsx");
const composerSource = readSource(
  "../../src/components/privateApp/DfwChannelPostComposerForm.tsx",
);
const homeHubShellSource = readSource(
  "../../src/components/privateApp/HomeHubShell.tsx",
);
const adminModerationSource = readSource(
  "../../app/app/admin/community-moderation/page.tsx",
);
const docsSource = [
  "../../docs/ops/policy-ops-pack-v1-ui-wiring.md",
  "../../docs/ops/policy-ops-pack-v1-summary.md",
  "../../docs/BUILD_TICKETS.md",
  "../../docs/BETA_READINESS_CHECKLIST.md",
  "../../docs/PRIVATE_BETA_OPERATING_PLAN.md",
  "../../docs/ops/fbmvp-remaining-functional-backlog.md",
  "../../docs/ops/05b-first-base-mvp-planning.md",
]
  .map((docPath) =>
    existsSync(new URL(docPath, import.meta.url))
      ? readFileSync(new URL(docPath, import.meta.url), "utf8")
      : "",
  )
  .join("\n\n");

const legalRoutes = [
  ["../../app/legal/beta-terms/page.tsx", "/legal/beta-terms", "Private Beta Terms"],
  ["../../app/legal/privacy/page.tsx", "/legal/privacy", "Privacy Notice"],
  ["../../app/legal/community-rules/page.tsx", "/legal/community-rules", "Community Rules"],
  [
    "../../app/legal/verification-privacy/page.tsx",
    "/legal/verification-privacy",
    "Verification & Privacy",
  ],
  [
    "../../app/legal/moderation-appeals/page.tsx",
    "/legal/moderation-appeals",
    "Moderation & Appeals",
  ],
  [
    "../../app/legal/support-requests/page.tsx",
    "/legal/support-requests",
    "Support & Requests",
  ],
] as const;

test("Policy/Ops Pack v1 public legal routes exist and render draft headings", () => {
  for (const [relativePath, route, title] of legalRoutes) {
    const routeUrl = new URL(relativePath, import.meta.url);
    assert.equal(existsSync(routeUrl), true, `${route} route should exist`);
    const routeSource = readFileSync(routeUrl, "utf8");

    assert.match(routeSource, /PolicyPage/);
    assert.ok(policyContentSource.includes(title));
    assert.match(policyPageSource, new RegExp(route.replaceAll("/", "\\/")));
  }

  assert.match(policyPageSource, /Private beta draft/);
  assert.match(policyPageSource, /not\s+legal advice/);
  assert.match(policyPageSource, /founder\/legal\s+review/);
});

test("policy pages preserve private-beta boundaries without overclaiming legal completeness", () => {
  assert.match(policyContentSource, /verified privately/);
  assert.match(policyContentSource, /anonymous publicly/);
  assert.match(policyContentSource, /accountable internally/);
  assert.match(policyContentSource, /utility first, community second, and social feed last/);
  assert.match(policyContentSource, /Airline portal login/);
  assert.match(policyContentSource, /schedule scraping/);
  assert.match(policyContentSource, /public crew tracking/);
  assert.match(policyContentSource, /dating\/swiping/);
  assert.match(policyContentSource, /Exact crew hotel exposure/);
  assert.match(policyContentSource, /Passenger private information/);
  assert.match(policyContentSource, /Airport or security procedures/);
  assert.match(policyContentSource, /Live operations-sensitive information/);
  assert.match(policyContentSource, /Confidential company documents/);
  assert.match(policyContentSource, /No AI final moderation decisions/);
  assert.match(policyContentSource, /marketplace payments/);
  assert.doesNotMatch(policyContentSource, /fully compliant|legally final|lawyer-approved|official legal advice/i);
});

test("public and auth surfaces link to private-beta policy pages without acceptance tracking", () => {
  assert.match(publicHomeSource, /href="\/legal\/beta-terms"/);
  assert.match(publicHomeSource, /href="\/legal\/privacy"/);
  assert.match(publicHomeSource, /href="\/legal\/community-rules"/);
  assert.match(publicHomeSource, /href="\/legal\/support-requests"/);
  assert.match(loginSource, /href="\/legal\/beta-terms"/);
  assert.match(loginSource, /href="\/legal\/privacy"/);
  assert.match(loginSource, /href="\/legal\/community-rules"/);
  assert.match(signupSource, /href="\/legal\/verification-privacy"/);
  assert.doesNotMatch(
    [publicHomeSource, loginSource, signupSource].join("\n"),
    /accept_terms|terms_accepted|privacy_accepted|policy_acceptance|insert\(|update\(/i,
  );
});

test("verification surface adds worker-privacy copy without surfacing proof upload as live", () => {
  assert.match(accessHoldSource, /Verification & Privacy/);
  assert.match(accessHoldSource, /Public identity remains a safe handle/);
  assert.match(accessHoldSource, /accountable internally/);
  assert.match(accessHoldSource, /Do not submit passwords, airline\s+portal credentials/);
  assert.match(accessHoldSource, /Do not\s+enter airline portal credentials here/);
  assert.doesNotMatch(accessHoldSource, /proof upload is live|upload redacted proof|badge upload/i);
});

test("Channel composer and report UI link community and moderation policy copy", () => {
  assert.match(composerSource, /Community Rules/);
  assert.match(composerSource, /href="\/legal\/community-rules"/);
  assert.match(homeHubShellSource, /Moderation & Appeals/);
  assert.match(homeHubShellSource, /href="\/legal\/moderation-appeals"/);
  assert.match(homeHubShellSource, /Reporter identity and public report counts are not shown/);
  assert.doesNotMatch(homeHubShellSource, /policy_acceptance|accept_terms|reportCount|reportsCount|public moderation feed/i);
});

test("admin moderation surface links policy drafts without expanding operator actions", () => {
  assert.match(adminModerationSource, /href="\/legal\/moderation-appeals"/);
  assert.match(adminModerationSource, /href="\/legal\/support-requests"/);
  assert.match(adminModerationSource, /broader private-beta moderation use/);
  assert.match(adminModerationSource, /Hide post/);
  assert.match(adminModerationSource, /Remove post/);
  assert.doesNotMatch(adminModerationSource, /ban|suspend|AI final|public moderation feed/i);
});

test("Policy/Ops Pack v1 UI wiring adds no migrations, tables, or proof-upload runtime scope", () => {
  const migrationFiles = readdirSync(new URL("../../supabase/migrations", import.meta.url));
  assert.equal(
    migrationFiles.some((file) => /policy|terms|privacy|acceptance/i.test(file)),
    false,
  );

  const appSources = [
    policyPageSource,
    policyContentSource,
    publicHomeSource,
    loginSource,
    signupSource,
    accessHoldSource,
    composerSource,
    homeHubShellSource,
    adminModerationSource,
  ].join("\n");

  assert.doesNotMatch(appSources, /create table|alter table|create policy|policy_acceptance/i);
  assert.doesNotMatch(appSources, /proof upload is live|upload redacted proof|badge upload/i);
});

test("Policy/Ops Pack v1 UI wiring docs record scope and browser-smoke follow-up", () => {
  assert.match(docsSource, /Policy\/Ops Pack v1 UI Wiring/i);
  assert.match(docsSource, /\/legal\/beta-terms/);
  assert.match(docsSource, /\/legal\/privacy/);
  assert.match(docsSource, /\/legal\/community-rules/);
  assert.match(docsSource, /\/legal\/verification-privacy/);
  assert.match(docsSource, /\/legal\/moderation-appeals/);
  assert.match(docsSource, /\/legal\/support-requests/);
  assert.match(docsSource, /no policy acceptance/i);
  assert.match(docsSource, /browser smoke/i);
  assert.match(docsSource, /no migration/i);
});
