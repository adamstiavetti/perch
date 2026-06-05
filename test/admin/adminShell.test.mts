import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  ADMIN_ROUTES,
  buildAdminNavigation,
  OPERATOR_GRANT_IMPLEMENTATION_STATUS,
} from "../../src/lib/admin/access.ts";

test("admin routes stay bounded to the admin shell", () => {
  assert.deepEqual(ADMIN_ROUTES, {
    home: "/app/admin",
    verification: "/app/admin/verification",
    approvedDomains: "/app/admin/approved-domains",
    reviewerScopes: "/app/admin/reviewer-scopes",
    auditInspection: "/app/admin/audit",
    proofCleanup: "/app/admin/proof-cleanup",
  });
  assert.equal(OPERATOR_GRANT_IMPLEMENTATION_STATUS, "not_implemented");
});

test("normal active beta users do not get active privileged admin tools by default", () => {
  const navigation = buildAdminNavigation({
    reviewerAuthorized: false,
  });

  assert.equal(
    navigation.some((item) => item.status === "available"),
    false,
  );

  const verificationItem = navigation.find(
    (item) => item.path === ADMIN_ROUTES.verification,
  );

  assert.equal(verificationItem?.status, "disabled");
  assert.match(verificationItem?.reason ?? "", /reviewer scope/i);
});

test("reviewer-authorized users only gain the existing verification review section", () => {
  const navigation = buildAdminNavigation({
    reviewerAuthorized: true,
  });

  assert.deepEqual(
    navigation
      .filter((item) => item.status === "available")
      .map((item) => item.path),
    [ADMIN_ROUTES.verification],
  );

  const operatorItems = navigation.filter(
    (item) => item.path !== ADMIN_ROUTES.verification,
  );

  assert.ok(operatorItems.every((item) => item.status === "disabled"));
  assert.ok(
    operatorItems.every((item) =>
      /operator grants are not implemented yet/i.test(item.reason),
    ),
  );
});

test("/app/admin landing uses reviewer authorization only and avoids privileged data reads", () => {
  const source = readFileSync(
    new URL("../../app/app/admin/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /getCurrentVerificationReviewerAuthorizationContext/);
  assert.match(source, /buildAdminNavigation/);
  assert.match(source, /metadata-free/i);
  assert.doesNotMatch(source, /getCurrentVerificationReviewContext/);
  assert.doesNotMatch(source, /approved_email_domains|operator_grants/i);
  assert.doesNotMatch(source, /signed_url|public_url|storage_path/i);
});

test("/app/admin\\/verification keeps reviewer-only queue behavior inside the shared shell", () => {
  const source = readFileSync(
    new URL("../../app/app/admin/verification/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /getCurrentVerificationReviewContext/);
  assert.match(source, /if \(!reviewContext\.reviewerAuthorized\)/);
  assert.match(source, /AUTH_ROUTES\.accessRestricted/);
  assert.match(source, /viewVerificationProofAction/);
  assert.match(source, /submitVerificationReviewAction/);
  assert.match(source, /AdminShell/);
});

test("admin shell implementation does not hard-code email-based authorization", () => {
  const accessSource = readFileSync(
    new URL("../../src/lib/admin/access.ts", import.meta.url),
    "utf8",
  );
  const pageSource = readFileSync(
    new URL("../../app/app/admin/page.tsx", import.meta.url),
    "utf8",
  );
  const combined = `${accessSource}\n${pageSource}`;

  assert.doesNotMatch(combined, /@gmail\.com|@jmpseat\.com/i);
  assert.doesNotMatch(combined, /split\(["']@["']\)|endsWith\(["'][^"']+["']\)/);
  assert.doesNotMatch(combined, /hard-coded founder|hard-coded admin/i);
});
