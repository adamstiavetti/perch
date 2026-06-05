import type { RecordSecurityEventInput } from "../securityEvents/securityEvents";

export const PROOF_RETENTION_PROOFS_BUCKET = "verification-proofs";
export const PROOF_RETENTION_CLEANUP_ROUTE = "proof_retention_cleanup";
export const PROOF_RETENTION_CLEANUP_DEFAULT_LIMIT = 25;
export const PROOF_RETENTION_CLEANUP_MAX_LIMIT = 100;
export const PROOF_RETENTION_EXPIRED_REASON_CODE = "retention_expired";
export const PROOF_RETENTION_OBJECT_MISSING_REASON_CODE = "object_already_missing";

type CleanupQueryResult<T> = {
  data?: T | null;
  error?: { message?: string; status?: number | string; statusCode?: number | string } | Error | null;
};

type CleanupQueryBuilder<T> = PromiseLike<CleanupQueryResult<T>> & {
  select(columns: string): CleanupQueryBuilder<T>;
  update(values: Record<string, unknown>): CleanupQueryBuilder<unknown>;
  eq(column: string, value: unknown): CleanupQueryBuilder<T>;
  not(column: string, operator: string, value: unknown): CleanupQueryBuilder<T>;
  lte(column: string, value: unknown): CleanupQueryBuilder<T>;
  is(column: string, value: unknown): CleanupQueryBuilder<T>;
  order(column: string, options: { ascending: boolean }): CleanupQueryBuilder<T>;
  limit(count: number): Promise<CleanupQueryResult<T>>;
};

export type ProofRetentionStorageAdminClient = {
  from<T>(table: string): CleanupQueryBuilder<T>;
  storage: {
    from(bucket: string): {
      remove(paths: string[]): Promise<CleanupQueryResult<unknown>>;
    };
  };
};

export type ProofRetentionEventRecorder = (
  input: RecordSecurityEventInput,
) => Promise<unknown>;

export type ProofRetentionEvidenceRow = {
  id: string;
  request_id: string;
  user_id: string;
  evidence_type: string;
  status: string;
  storage_bucket: string | null;
  storage_path: string | null;
  delete_after: string | null;
  deleted_at: string | null;
};

export type ProofRetentionCleanupSummary = {
  scannedCount: number;
  deletedCount: number;
  missingCount: number;
  failedCount: number;
  skippedCount: number;
};

export function normalizeProofRetentionCleanupLimit(limit: number | undefined) {
  if (!Number.isFinite(limit) || !limit) {
    return PROOF_RETENTION_CLEANUP_DEFAULT_LIMIT;
  }

  return Math.min(
    Math.max(1, Math.trunc(limit)),
    PROOF_RETENTION_CLEANUP_MAX_LIMIT,
  );
}

export function isExpiredProofEvidenceEligible(
  evidence: ProofRetentionEvidenceRow,
  nowIso: string,
) {
  return (
    evidence.evidence_type === "redacted_badge_or_proof" &&
    evidence.storage_bucket === PROOF_RETENTION_PROOFS_BUCKET &&
    Boolean(evidence.storage_path) &&
    Boolean(evidence.delete_after) &&
    !evidence.deleted_at &&
    String(evidence.delete_after) <= nowIso
  );
}

export function buildProofDeletionEventMetadata(input: {
  evidence: ProofRetentionEvidenceRow;
  reasonCode: string;
  deletedAt?: string | null;
}) {
  return {
    verification_request_id: input.evidence.request_id,
    verification_evidence_id: input.evidence.id,
    evidence_type: input.evidence.evidence_type,
    status: input.evidence.status,
    delete_after: input.evidence.delete_after,
    deleted_at: input.deletedAt ?? input.evidence.deleted_at,
    reason_code: input.reasonCode,
  };
}

export function isStorageObjectMissingError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    message?: unknown;
    status?: unknown;
    statusCode?: unknown;
  };
  const status = String(candidate.status ?? candidate.statusCode ?? "");
  const message = String(candidate.message ?? "").toLowerCase();

  return (
    status === "404" ||
    message.includes("not found") ||
    message.includes("does not exist") ||
    message.includes("missing")
  );
}

function createEmptySummary(): ProofRetentionCleanupSummary {
  return {
    scannedCount: 0,
    deletedCount: 0,
    missingCount: 0,
    failedCount: 0,
    skippedCount: 0,
  };
}

async function recordCleanupEvent(
  recordEvent: ProofRetentionEventRecorder,
  input: RecordSecurityEventInput,
) {
  try {
    await recordEvent(input);
  } catch {
    // Cleanup must continue even if audit insertion is temporarily unavailable.
  }
}

async function markEvidenceDeleted(input: {
  storageAdmin: ProofRetentionStorageAdminClient;
  evidence: ProofRetentionEvidenceRow;
  deletedAt: string;
}) {
  return input.storageAdmin
    .from("verification_evidence")
    .update({ deleted_at: input.deletedAt })
    .eq("id", input.evidence.id)
    .eq("storage_bucket", PROOF_RETENTION_PROOFS_BUCKET)
    .is("deleted_at", null);
}

export async function cleanupExpiredVerificationProofsWithClient(input: {
  now?: Date;
  limit?: number;
  storageAdmin: ProofRetentionStorageAdminClient;
  recordEvent: ProofRetentionEventRecorder;
}): Promise<ProofRetentionCleanupSummary> {
  const nowIso = (input.now ?? new Date()).toISOString();
  const limit = normalizeProofRetentionCleanupLimit(input.limit);
  const summary = createEmptySummary();

  const evidenceResult = await input.storageAdmin
    .from<ProofRetentionEvidenceRow[]>("verification_evidence")
    .select(
      "id, request_id, user_id, evidence_type, status, storage_bucket, storage_path, delete_after, deleted_at",
    )
    .eq("evidence_type", "redacted_badge_or_proof")
    .eq("storage_bucket", PROOF_RETENTION_PROOFS_BUCKET)
    .not("storage_path", "is", null)
    .lte("delete_after", nowIso)
    .is("deleted_at", null)
    .order("delete_after", { ascending: true })
    .limit(limit);

  if (evidenceResult.error) {
    throw evidenceResult.error;
  }

  for (const evidence of evidenceResult.data ?? []) {
    summary.scannedCount += 1;

    if (!isExpiredProofEvidenceEligible(evidence, nowIso)) {
      summary.skippedCount += 1;
      continue;
    }

    await recordCleanupEvent(input.recordEvent, {
      userId: null,
      eventType: "verification_evidence.deletion_scheduled",
      route: PROOF_RETENTION_CLEANUP_ROUTE,
      result: "scheduled",
      metadata: buildProofDeletionEventMetadata({
        evidence,
        reasonCode: PROOF_RETENTION_EXPIRED_REASON_CODE,
      }),
    });

    const deleteResult = await input.storageAdmin.storage
      .from(PROOF_RETENTION_PROOFS_BUCKET)
      .remove([evidence.storage_path as string]);
    const objectAlreadyMissing = isStorageObjectMissingError(deleteResult.error);

    if (deleteResult.error && !objectAlreadyMissing) {
      summary.failedCount += 1;
      await recordCleanupEvent(input.recordEvent, {
        userId: null,
        eventType: "verification_evidence.deletion_failed",
        route: PROOF_RETENTION_CLEANUP_ROUTE,
        result: "failed",
        metadata: buildProofDeletionEventMetadata({
          evidence,
          reasonCode: "storage_delete_failed",
        }),
      });
      continue;
    }

    const deletedAt = nowIso;
    const updateResult = await markEvidenceDeleted({
      storageAdmin: input.storageAdmin,
      evidence,
      deletedAt,
    });

    if (updateResult.error) {
      summary.failedCount += 1;
      await recordCleanupEvent(input.recordEvent, {
        userId: null,
        eventType: "verification_evidence.deletion_failed",
        route: PROOF_RETENTION_CLEANUP_ROUTE,
        result: "failed",
        metadata: buildProofDeletionEventMetadata({
          evidence,
          reasonCode: "metadata_update_failed",
        }),
      });
      continue;
    }

    if (objectAlreadyMissing) {
      summary.missingCount += 1;
    } else {
      summary.deletedCount += 1;
    }

    await recordCleanupEvent(input.recordEvent, {
      userId: null,
      eventType: "verification_evidence.deleted",
      route: PROOF_RETENTION_CLEANUP_ROUTE,
      result: "deleted",
      metadata: buildProofDeletionEventMetadata({
        evidence,
        deletedAt,
        reasonCode: objectAlreadyMissing
          ? PROOF_RETENTION_OBJECT_MISSING_REASON_CODE
          : PROOF_RETENTION_EXPIRED_REASON_CODE,
      }),
    });
  }

  return summary;
}
