import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import {
  VERIFICATION_CLAIM_STATUSES,
  VERIFICATION_CLAIM_TYPES,
  VERIFICATION_EVIDENCE_STATUSES,
  VERIFICATION_EVIDENCE_TYPES,
  VERIFICATION_METHODS,
  VERIFICATION_REQUEST_STATUSES,
  VERIFICATION_REVIEW_ACTIONS,
  isSafeVerificationEvidenceMetadata,
  isVerificationClaimApproved,
} from "../../src/lib/verification/verification.ts";

test("verification constants stay aligned with the E04-T01 claim and lifecycle decision", () => {
  assert.deepEqual(VERIFICATION_CLAIM_TYPES, [
    "airline_worker",
    "airline",
    "role",
    "base",
  ]);

  assert.deepEqual(VERIFICATION_REQUEST_STATUSES, [
    "draft",
    "submitted",
    "pending_review",
    "needs_resubmission",
    "approved",
    "rejected",
    "cancelled",
    "expired",
    "revoked",
  ]);

  assert.deepEqual(VERIFICATION_CLAIM_STATUSES, [
    "pending",
    "approved",
    "rejected",
    "needs_resubmission",
    "expired",
    "revoked",
  ]);

  assert.deepEqual(VERIFICATION_METHODS, [
    "work_email",
    "redacted_badge_or_proof",
  ]);

  assert.deepEqual(VERIFICATION_EVIDENCE_TYPES, [
    "work_email",
    "redacted_badge_or_proof",
  ]);

  assert.deepEqual(VERIFICATION_EVIDENCE_STATUSES, [
    "pending",
    "submitted",
    "accepted",
    "rejected",
    "needs_resubmission",
    "deleted",
  ]);

  assert.deepEqual(VERIFICATION_REVIEW_ACTIONS, [
    "approve",
    "reject",
    "request_resubmission",
    "revoke",
    "expire",
    "cancel",
  ]);
});

test("approved claim helper only treats approved claims as active", () => {
  assert.equal(isVerificationClaimApproved("approved"), true);
  assert.equal(isVerificationClaimApproved("pending"), false);
  assert.equal(isVerificationClaimApproved("revoked"), false);
});

test("evidence metadata helper rejects sensitive keys and non-object values", () => {
  assert.equal(
    isSafeVerificationEvidenceMetadata({
      file_name: "proof.png",
      mime_type: "image/png",
    }),
    true,
  );

  assert.equal(
    isSafeVerificationEvidenceMetadata({
      employee_id: "12345",
    }),
    false,
  );

  assert.equal(isSafeVerificationEvidenceMetadata(["proof.png"]), false);
});

test("verification migration exists with required tables and private evidence posture", () => {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) => name.endsWith("_create_verification_foundation.sql"))
    : [];

  assert.ok(migrationNames.length > 0, "expected a create_verification_foundation migration");

  const migrationPath = path.join(migrationsDir.pathname, migrationNames[0] ?? "");
  const sql = readFileSync(migrationPath, "utf8");

  assert.match(sql, /create table public\.verification_requests/i);
  assert.match(sql, /create table public\.verification_claims/i);
  assert.match(sql, /create table public\.verification_evidence/i);
  assert.match(sql, /create table public\.verification_review_actions/i);
  assert.match(sql, /create table public\.approved_email_domains/i);
  assert.match(sql, /alter table public\.verification_requests enable row level security/i);
  assert.match(sql, /alter table public\.verification_claims enable row level security/i);
  assert.match(sql, /alter table public\.verification_evidence enable row level security/i);
  assert.match(sql, /alter table public\.verification_review_actions enable row level security/i);
  assert.match(sql, /alter table public\.approved_email_domains enable row level security/i);
  assert.match(sql, /metadata jsonb not null default '\{\}'::jsonb/i);
  assert.match(sql, /do not store employee ids, badge numbers, barcodes, qr codes, raw proof text, or raw file\/blob data/i);
  assert.doesNotMatch(
    sql,
    /\bbytea\b|employee_id\s+(text|varchar|uuid|bigint|integer)|badge_number\s+(text|varchar|uuid|bigint|integer)|qr_code\s+(text|varchar|uuid|bigint|integer)|barcode\s+(text|varchar|uuid|bigint|integer)|raw_file\s+(text|varchar|bytea)|file_blob\s+(text|varchar|bytea)/i,
  );
});

test("verification migration adds conservative ownership policies without self-approval writes", () => {
  const migrationPath = new URL(
    "../../supabase/migrations/20260604154521_create_verification_foundation.sql",
    import.meta.url,
  );
  const sql = readFileSync(migrationPath, "utf8");

  assert.match(sql, /users can read their own verification requests/i);
  assert.match(sql, /users can create their own verification requests/i);
  assert.match(sql, /users can read their own verification claims/i);
  assert.match(sql, /users can read their own verification evidence/i);
  assert.match(sql, /users can create their own verification evidence metadata/i);
  assert.match(sql, /users can read review actions for their own verification requests/i);
  assert.doesNotMatch(
    sql,
    /users can update their own verification claims|users can create their own verification claims|users can create their own verification review actions/i,
  );
});
