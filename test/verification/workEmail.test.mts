import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import {
  APPROVED_EMAIL_DOMAIN_STATUSES,
  buildWorkEmailEvidenceMetadata,
  buildWorkEmailVerificationDraft,
  extractWorkEmailDomain,
  getWorkEmailVerificationSupport,
  isApprovedEmailDomainActive,
  isWorkEmailShapeValid,
  matchApprovedEmailDomain,
  normalizeWorkEmail,
} from "../../src/lib/verification/workEmail.ts";

const APPROVED_DOMAINS = [
  { domain: "airline.test", airline: "Test Air", status: "active" as const },
  { domain: "disabled.test", airline: "Disabled Air", status: "disabled" as const },
];

test("approved email domain statuses stay bounded for the E04-T03 foundation", () => {
  assert.deepEqual(APPROVED_EMAIL_DOMAIN_STATUSES, ["active", "disabled"]);
  assert.equal(isApprovedEmailDomainActive("active"), true);
  assert.equal(isApprovedEmailDomainActive("disabled"), false);
});

test("work email normalization trims and lowercases without mixing with login email concerns", () => {
  assert.equal(normalizeWorkEmail("  Crew.Member@Airline.Test "), "crew.member@airline.test");
  assert.equal(normalizeWorkEmail(""), null);
});

test("work email shape validation and domain extraction reject malformed values", () => {
  assert.equal(isWorkEmailShapeValid("crew.member@airline.test"), true);
  assert.equal(isWorkEmailShapeValid("crew.member"), false);
  assert.equal(extractWorkEmailDomain("crew.member@airline.test"), "airline.test");
  assert.equal(extractWorkEmailDomain("crew.member"), null);
});

test("approved-domain matching only accepts active configured domains", () => {
  assert.deepEqual(
    matchApprovedEmailDomain("airline.test", APPROVED_DOMAINS),
    { domain: "airline.test", airline: "Test Air", status: "active" },
  );

  assert.equal(matchApprovedEmailDomain("disabled.test", APPROVED_DOMAINS), null);
  assert.equal(matchApprovedEmailDomain("unknown.test", APPROVED_DOMAINS), null);
});

test("supported and unsupported domain results stay explicit", () => {
  assert.deepEqual(
    getWorkEmailVerificationSupport({
      workEmail: "crew.member@airline.test",
      approvedDomains: APPROVED_DOMAINS,
    }),
    {
      kind: "supported_domain",
      normalizedEmail: "crew.member@airline.test",
      domain: "airline.test",
      airlineClaimValue: "Test Air",
      matchedDomain: { domain: "airline.test", airline: "Test Air", status: "active" },
    },
  );

  assert.deepEqual(
    getWorkEmailVerificationSupport({
      workEmail: "crew.member@unknown.test",
      approvedDomains: APPROVED_DOMAINS,
    }),
    {
      kind: "unsupported_domain",
      normalizedEmail: "crew.member@unknown.test",
      domain: "unknown.test",
    },
  );

  assert.deepEqual(
    getWorkEmailVerificationSupport({
      workEmail: "not-an-email",
      approvedDomains: APPROVED_DOMAINS,
    }),
    {
      kind: "invalid_email",
    },
  );
});

test("safe work-email evidence metadata preserves domain-only guidance and not the raw email", () => {
  assert.deepEqual(
    buildWorkEmailEvidenceMetadata({
      workEmail: "crew.member@airline.test",
      loginEmail: "pilot.personal@example.com",
      matchedDomain: { domain: "airline.test", airline: "Test Air", status: "active" },
    }),
    {
      email_domain: "airline.test",
      airline: "Test Air",
      login_email_separate: true,
      supported_domain: true,
      verification_method: "work_email",
    },
  );
});

test("work-email verification draft stays metadata-only and does not issue claims automatically", () => {
  const draft = buildWorkEmailVerificationDraft({
    userId: "user-1",
    workEmail: "crew.member@airline.test",
    loginEmail: "pilot.personal@example.com",
    approvedDomains: APPROVED_DOMAINS,
    nowIso: "2026-06-04T16:00:00.000Z",
  });

  assert.deepEqual(draft.request, {
    user_id: "user-1",
    status: "submitted",
    requested_claim_types: ["airline_worker", "airline"],
    method: "work_email",
    submitted_at: "2026-06-04T16:00:00.000Z",
  });

  assert.deepEqual(draft.evidence, {
    user_id: "user-1",
    evidence_type: "work_email",
    status: "submitted",
    uploaded_at: "2026-06-04T16:00:00.000Z",
    redaction_acknowledged: false,
    storage_bucket: null,
    storage_path: null,
    metadata: {
      email_domain: "airline.test",
      airline: "Test Air",
      login_email_separate: true,
      supported_domain: true,
      verification_method: "work_email",
    },
  });

  assert.equal("claim" in draft, false);
});

test("the E04-T03 foundation does not seed real airline domains or badge/upload logic", () => {
  assert.equal(
    existsSync(new URL("../../src/lib/verification/workEmailSeedData.ts", import.meta.url)),
    false,
  );

  const source = readFileSync(
    new URL("../../src/lib/verification/workEmail.ts", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /supabase storage|type="file"|badge upload|openai|ai pre-check/i);
});
