import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  PROOF_RETENTION_CLEANUP_DEFAULT_LIMIT,
  PROOF_RETENTION_CLEANUP_MAX_LIMIT,
  buildProofDeletionEventMetadata,
  cleanupExpiredVerificationProofsWithClient,
  isExpiredProofEvidenceEligible,
  isStorageObjectMissingError,
  normalizeProofRetentionCleanupLimit,
  type ProofRetentionEvidenceRow,
} from "../../src/lib/verification/proofRetentionCore.ts";

const NOW_ISO = "2026-06-05T00:00:00.000Z";

function createEvidence(
  overrides: Partial<ProofRetentionEvidenceRow> = {},
): ProofRetentionEvidenceRow {
  return {
    id: "33333333-3333-3333-3333-333333333333",
    request_id: "22222222-2222-2222-2222-222222222222",
    user_id: "11111111-1111-1111-1111-111111111111",
    evidence_type: "redacted_badge_or_proof",
    status: "submitted",
    storage_bucket: "verification-proofs",
    storage_path:
      "11111111-1111-1111-1111-111111111111/22222222-2222-2222-2222-222222222222/33333333-3333-3333-3333-333333333333.png",
    delete_after: "2026-06-04T00:00:00.000Z",
    deleted_at: null,
    ...overrides,
  };
}

class MockQueryBuilder<T> implements PromiseLike<{ data?: T | null; error?: Error | null }> {
  filters: Array<[string, string, unknown]> = [];
  selectedColumns: string | null = null;
  updateValues: Record<string, unknown> | null = null;
  limitedTo: number | null = null;
  private readonly selectResult: { data?: T | null; error?: Error | null };
  private readonly updateResult: { data?: unknown | null; error?: Error | null };

  constructor(
    selectResult: { data?: T | null; error?: Error | null },
    updateResult: { data?: unknown | null; error?: Error | null },
  ) {
    this.selectResult = selectResult;
    this.updateResult = updateResult;
  }

  select(columns: string) {
    this.selectedColumns = columns;
    return this;
  }

  update(values: Record<string, unknown>) {
    this.updateValues = values;
    return this as unknown as MockQueryBuilder<unknown>;
  }

  eq(column: string, value: unknown) {
    this.filters.push(["eq", column, value]);
    return this;
  }

  not(column: string, operator: string, value: unknown) {
    this.filters.push([`not.${operator}`, column, value]);
    return this;
  }

  lte(column: string, value: unknown) {
    this.filters.push(["lte", column, value]);
    return this;
  }

  is(column: string, value: unknown) {
    this.filters.push(["is", column, value]);
    return this;
  }

  order() {
    return this;
  }

  async limit(count: number) {
    this.limitedTo = count;
    return this.selectResult;
  }

  then<TResult1 = { data?: T | null; error?: Error | null }, TResult2 = never>(
    onfulfilled?:
      | ((value: { data?: T | null; error?: Error | null }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return Promise.resolve(
      this.updateValues ? this.updateResult : this.selectResult,
    ).then(onfulfilled, onrejected);
  }
}

class MockStorageAdmin {
  readonly tableQueries: Array<MockQueryBuilder<unknown>> = [];
  readonly removedPaths: string[][] = [];
  readonly updateValues: Array<Record<string, unknown>> = [];
  private readonly evidenceRows: ProofRetentionEvidenceRow[];
  private readonly removeError: Error | null;
  private readonly updateError: Error | null;

  constructor(
    evidenceRows: ProofRetentionEvidenceRow[],
    removeError: Error | null = null,
    updateError: Error | null = null,
  ) {
    this.evidenceRows = evidenceRows;
    this.removeError = removeError;
    this.updateError = updateError;
  }

  from<T>() {
    const query = new MockQueryBuilder<T>(
      { data: this.evidenceRows as T, error: null },
      { data: null, error: this.updateError },
    );
    const originalUpdate = query.update.bind(query);
    query.update = (values: Record<string, unknown>) => {
      this.updateValues.push(values);
      return originalUpdate(values);
    };
    this.tableQueries.push(query as unknown as MockQueryBuilder<unknown>);
    return query;
  }

  storage = {
    from: () => ({
      remove: async (paths: string[]) => {
        this.removedPaths.push(paths);
        return { data: null, error: this.removeError };
      },
    }),
  };
}

test("proof retention cleanup limits are bounded", () => {
  assert.equal(
    normalizeProofRetentionCleanupLimit(undefined),
    PROOF_RETENTION_CLEANUP_DEFAULT_LIMIT,
  );
  assert.equal(normalizeProofRetentionCleanupLimit(0), PROOF_RETENTION_CLEANUP_DEFAULT_LIMIT);
  assert.equal(normalizeProofRetentionCleanupLimit(1.9), 1);
  assert.equal(
    normalizeProofRetentionCleanupLimit(10_000),
    PROOF_RETENTION_CLEANUP_MAX_LIMIT,
  );
});

test("proof retention eligibility is limited to expired undeleted proof evidence in the proof bucket", () => {
  assert.equal(isExpiredProofEvidenceEligible(createEvidence(), NOW_ISO), true);
  assert.equal(
    isExpiredProofEvidenceEligible(createEvidence({ evidence_type: "work_email" }), NOW_ISO),
    false,
  );
  assert.equal(
    isExpiredProofEvidenceEligible(createEvidence({ storage_bucket: "other" }), NOW_ISO),
    false,
  );
  assert.equal(
    isExpiredProofEvidenceEligible(createEvidence({ storage_path: null }), NOW_ISO),
    false,
  );
  assert.equal(
    isExpiredProofEvidenceEligible(createEvidence({ delete_after: "2026-06-06T00:00:00.000Z" }), NOW_ISO),
    false,
  );
  assert.equal(
    isExpiredProofEvidenceEligible(createEvidence({ deleted_at: NOW_ISO }), NOW_ISO),
    false,
  );
});

test("proof deletion event metadata excludes storage paths, bucket names, users, and proof contents", () => {
  assert.deepEqual(
    buildProofDeletionEventMetadata({
      evidence: createEvidence(),
      reasonCode: "retention_expired",
      deletedAt: NOW_ISO,
    }),
    {
      verification_request_id: "22222222-2222-2222-2222-222222222222",
      verification_evidence_id: "33333333-3333-3333-3333-333333333333",
      evidence_type: "redacted_badge_or_proof",
      status: "submitted",
      delete_after: "2026-06-04T00:00:00.000Z",
      deleted_at: NOW_ISO,
      reason_code: "retention_expired",
    },
  );
});

test("cleanup deletes expired proof objects, sets deleted_at, and records sanitized events", async () => {
  const admin = new MockStorageAdmin([createEvidence()]);
  const events: Array<Record<string, unknown>> = [];

  const summary = await cleanupExpiredVerificationProofsWithClient({
    now: new Date(NOW_ISO),
    limit: 5,
    storageAdmin: admin as never,
    recordEvent: async (event) => {
      events.push(event as unknown as Record<string, unknown>);
    },
  });

  assert.deepEqual(summary, {
    scannedCount: 1,
    deletedCount: 1,
    missingCount: 0,
    failedCount: 0,
    skippedCount: 0,
  });
  assert.deepEqual(admin.removedPaths, [[createEvidence().storage_path]]);
  assert.deepEqual(admin.updateValues, [{ deleted_at: NOW_ISO }]);
  assert.deepEqual(
    events.map((event) => event.eventType),
    [
      "verification_evidence.deletion_scheduled",
      "verification_evidence.deleted",
    ],
  );

  for (const event of events) {
    assert.equal(event.userId, null);
    assert.equal(event.route, "proof_retention_cleanup");
    assert.doesNotMatch(JSON.stringify(event.metadata), /storage_path|storage_bucket|signed_url|public_url|filename|employee_id|badge_number|barcode|qr|ocr|proof_text/i);
  }
});

test("cleanup treats already-missing objects as deleted only after metadata update succeeds", async () => {
  const missingError = Object.assign(new Error("Object not found"), {
    statusCode: 404,
  });
  const admin = new MockStorageAdmin([createEvidence()], missingError);
  const events: Array<Record<string, unknown>> = [];

  const summary = await cleanupExpiredVerificationProofsWithClient({
    now: new Date(NOW_ISO),
    storageAdmin: admin as never,
    recordEvent: async (event) => {
      events.push(event as unknown as Record<string, unknown>);
    },
  });

  assert.equal(isStorageObjectMissingError(missingError), true);
  assert.deepEqual(summary, {
    scannedCount: 1,
    deletedCount: 0,
    missingCount: 1,
    failedCount: 0,
    skippedCount: 0,
  });
  assert.match(JSON.stringify(events.at(-1)?.metadata), /object_already_missing/);
});

test("cleanup leaves deleted_at unset and records a failure when storage deletion fails", async () => {
  const admin = new MockStorageAdmin([createEvidence()], new Error("storage unavailable"));
  const events: Array<Record<string, unknown>> = [];

  const summary = await cleanupExpiredVerificationProofsWithClient({
    now: new Date(NOW_ISO),
    storageAdmin: admin as never,
    recordEvent: async (event) => {
      events.push(event as unknown as Record<string, unknown>);
    },
  });

  assert.deepEqual(summary, {
    scannedCount: 1,
    deletedCount: 0,
    missingCount: 0,
    failedCount: 1,
    skippedCount: 0,
  });
  assert.deepEqual(admin.updateValues, []);
  assert.equal(events.at(-1)?.eventType, "verification_evidence.deletion_failed");
  assert.match(JSON.stringify(events.at(-1)?.metadata), /storage_delete_failed/);
});

test("proof retention helper remains server-only and does not add UI delete controls or public proof access", () => {
  const source = readFileSync(
    new URL("../../src/lib/verification/proofRetention.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /import "server-only"/i);
  assert.match(source, /createStorageAdminClient/);
  assert.match(source, /cleanupExpiredVerificationProofsWithClient/);
  assert.doesNotMatch(source, /createSignedUrl|public url|download button|type="file"|openai|ocr|ai pre-check|employer system lookup/i);

  const coreSource = readFileSync(
    new URL("../../src/lib/verification/proofRetentionCore.ts", import.meta.url),
    "utf8",
  );

  assert.match(coreSource, /verification_evidence\.deletion_scheduled/);
  assert.match(coreSource, /verification_evidence\.deleted/);
  assert.match(coreSource, /verification_evidence\.deletion_failed/);
  assert.match(coreSource, /\.lte\("delete_after"/);
  assert.match(coreSource, /\.is\("deleted_at", null\)/);
  assert.doesNotMatch(coreSource, /createSignedUrl|public url|download button|type="file"|openai|ocr|ai pre-check|employer system lookup/i);
});

test("proof deletion security-events migration extends only the audit event taxonomy", () => {
  const sql = readFileSync(
    new URL("../../supabase/migrations/20260605003656_extend_security_events_for_proof_deletion.sql", import.meta.url),
    "utf8",
  );

  assert.match(sql, /drop constraint if exists security_events_event_type_check/i);
  assert.match(sql, /verification_evidence\.deletion_scheduled/i);
  assert.match(sql, /verification_evidence\.deleted/i);
  assert.match(sql, /verification_evidence\.deletion_failed/i);
  assert.doesNotMatch(sql, /storage\.objects|storage\.buckets|create policy|create function|\bcron\b|edge function/i);
});
