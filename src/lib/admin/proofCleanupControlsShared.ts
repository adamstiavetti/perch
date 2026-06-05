import type { OperatorScope } from "./access";
import type { ProofRetentionCleanupSummary } from "../verification/proofRetentionCore";

export const PROOF_CLEANUP_RUN_SCOPE =
  "operator.run_proof_cleanup" as const satisfies OperatorScope;

export const PROOF_CLEANUP_RUN_CONFIRMATION = "RUN CLEANUP";
export const DEFAULT_PROOF_CLEANUP_RUN_LIMIT = 5;
export const MAX_PROOF_CLEANUP_RUN_LIMIT = 25;

export type ProofCleanupRunSummary = ProofRetentionCleanupSummary;

export function normalizeProofCleanupRunLimit(
  value: FormDataEntryValue | string | number | null | undefined,
) {
  const parsed =
    typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_PROOF_CLEANUP_RUN_LIMIT;
  }

  return Math.min(Math.max(1, Math.trunc(parsed)), MAX_PROOF_CLEANUP_RUN_LIMIT);
}

function getSummaryCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function sanitizeProofCleanupRunSummary(
  summary: Partial<ProofRetentionCleanupSummary> | null | undefined,
): ProofCleanupRunSummary {
  return {
    scannedCount: getSummaryCount(summary?.scannedCount),
    deletedCount: getSummaryCount(summary?.deletedCount),
    missingCount: getSummaryCount(summary?.missingCount),
    failedCount: getSummaryCount(summary?.failedCount),
    skippedCount: getSummaryCount(summary?.skippedCount),
  };
}

export function buildProofCleanupRunEventMetadata(input: {
  requestedLimit: number;
  summary: Partial<ProofRetentionCleanupSummary> | null | undefined;
}) {
  const summary = sanitizeProofCleanupRunSummary(input.summary);

  return {
    requested_limit: normalizeProofCleanupRunLimit(input.requestedLimit),
    scanned_count: summary.scannedCount,
    deleted_count: summary.deletedCount,
    missing_count: summary.missingCount,
    failed_count: summary.failedCount,
    skipped_count: summary.skippedCount,
  };
}

export function buildProofCleanupRunDeniedEventMetadata(reasonCode: string) {
  return {
    reason_code: reasonCode,
  };
}
