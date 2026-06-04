import test from "node:test";
import assert from "node:assert/strict";

import {
  ACTIVE_WORK_EMAIL_REQUEST_STATUSES,
  planWorkEmailVerificationSubmission,
} from "../../src/lib/verification/requestFlow.ts";

const APPROVED_DOMAINS = [
  { domain: "airline.test", airline: "Test Air", status: "active" as const },
  { domain: "disabled.test", airline: "Disabled Air", status: "disabled" as const },
];

test("active work-email request statuses stay bounded for duplicate-request prevention", () => {
  assert.deepEqual(ACTIVE_WORK_EMAIL_REQUEST_STATUSES, [
    "submitted",
    "pending_review",
    "needs_resubmission",
  ]);
});

test("invalid work email returns an invalid-email result and creates no payload", () => {
  assert.deepEqual(
    planWorkEmailVerificationSubmission({
      userId: "user-1",
      workEmail: "not-an-email",
      loginEmail: "pilot.personal@example.com",
      approvedDomains: APPROVED_DOMAINS,
      existingRequests: [],
      nowIso: "2026-06-04T17:00:00.000Z",
    }),
    {
      kind: "invalid_email",
      message: "Enter a valid work email before starting verification.",
    },
  );
});

test("unsupported or disabled domains return an unsupported-domain result and create no payload", () => {
  assert.deepEqual(
    planWorkEmailVerificationSubmission({
      userId: "user-1",
      workEmail: "crew.member@unknown.test",
      loginEmail: "pilot.personal@example.com",
      approvedDomains: APPROVED_DOMAINS,
      existingRequests: [],
      nowIso: "2026-06-04T17:00:00.000Z",
    }),
    {
      kind: "unsupported_domain",
      domain: "unknown.test",
      message:
        "That work-email domain is not currently supported for verification. Only approved airline-controlled domains can start this path.",
    },
  );

  assert.deepEqual(
    planWorkEmailVerificationSubmission({
      userId: "user-1",
      workEmail: "crew.member@disabled.test",
      loginEmail: "pilot.personal@example.com",
      approvedDomains: APPROVED_DOMAINS,
      existingRequests: [],
      nowIso: "2026-06-04T17:00:00.000Z",
    }),
    {
      kind: "unsupported_domain",
      domain: "disabled.test",
      message:
        "That work-email domain is not currently supported for verification. Only approved airline-controlled domains can start this path.",
    },
  );
});

test("supported active domain creates request and evidence payloads with domain-only metadata", () => {
  const result = planWorkEmailVerificationSubmission({
    userId: "user-1",
    workEmail: "crew.member@airline.test",
    loginEmail: "pilot.personal@example.com",
    approvedDomains: APPROVED_DOMAINS,
    existingRequests: [],
    nowIso: "2026-06-04T17:00:00.000Z",
  });

  assert.equal(result.kind, "create_request");

  if (result.kind !== "create_request") {
    return;
  }

  assert.deepEqual(result.request, {
    user_id: "user-1",
    status: "submitted",
    requested_claim_types: ["airline_worker", "airline"],
    method: "work_email",
    submitted_at: "2026-06-04T17:00:00.000Z",
  });

  assert.deepEqual(result.evidence, {
    user_id: "user-1",
    evidence_type: "work_email",
    status: "submitted",
    uploaded_at: "2026-06-04T17:00:00.000Z",
    redaction_acknowledged: false,
    storage_bucket: null,
    storage_path: null,
    metadata: {
      email_domain: "airline.test",
      airline: "Test Air",
      verification_method: "work_email",
      source: "user_submitted_work_email_domain",
      support_result: "supported_domain",
    },
  });

  assert.equal("claim" in result, false);
  assert.equal("normalizedEmail" in result.evidence.metadata, false);
  assert.equal("local_part" in result.evidence.metadata, false);
});

test("existing active work-email request without evidence refreshes the missing evidence metadata", () => {
  assert.deepEqual(
    planWorkEmailVerificationSubmission({
      userId: "user-1",
      workEmail: "crew.member@airline.test",
      loginEmail: "pilot.personal@example.com",
      approvedDomains: APPROVED_DOMAINS,
      existingRequests: [
        { id: "req-1", method: "work_email", status: "submitted" },
      ],
      nowIso: "2026-06-04T17:00:00.000Z",
    }),
    {
      kind: "attach_missing_evidence",
      message:
        "Your existing work-email verification request was refreshed with the missing evidence metadata.",
      requestId: "req-1",
      evidence: {
        user_id: "user-1",
        evidence_type: "work_email",
        status: "submitted",
        uploaded_at: "2026-06-04T17:00:00.000Z",
        redaction_acknowledged: false,
        storage_bucket: null,
        storage_path: null,
        metadata: {
          email_domain: "airline.test",
          airline: "Test Air",
          verification_method: "work_email",
          source: "user_submitted_work_email_domain",
          support_result: "supported_domain",
        },
      },
    },
  );
});

test("existing active work-email request with evidence blocks duplicate submissions", () => {
  assert.deepEqual(
    planWorkEmailVerificationSubmission({
      userId: "user-1",
      workEmail: "crew.member@airline.test",
      loginEmail: "pilot.personal@example.com",
      approvedDomains: APPROVED_DOMAINS,
      existingRequests: [
        { id: "req-1", method: "work_email", status: "submitted" },
      ],
      existingEvidence: [
        { request_id: "req-1", evidence_type: "work_email" },
      ],
      nowIso: "2026-06-04T17:00:00.000Z",
    }),
    {
      kind: "duplicate_request",
      message: "You already have a work-email verification request in progress.",
      requestId: "req-1",
    },
  );
});
