import "server-only";

import { recordSecurityEvent } from "../securityEvents/server";
import { createStorageAdminClient } from "../supabase/storageAdmin";
import {
  cleanupExpiredVerificationProofsWithClient,
  type ProofRetentionCleanupSummary,
  type ProofRetentionStorageAdminClient,
} from "./proofRetentionCore";

export type { ProofRetentionCleanupSummary };
export {
  PROOF_RETENTION_CLEANUP_DEFAULT_LIMIT,
  PROOF_RETENTION_CLEANUP_MAX_LIMIT,
  PROOF_RETENTION_CLEANUP_ROUTE,
  PROOF_RETENTION_EXPIRED_REASON_CODE,
  PROOF_RETENTION_OBJECT_MISSING_REASON_CODE,
  PROOF_RETENTION_PROOFS_BUCKET,
  buildProofDeletionEventMetadata,
  isExpiredProofEvidenceEligible,
  isStorageObjectMissingError,
  normalizeProofRetentionCleanupLimit,
  type ProofRetentionEvidenceRow,
} from "./proofRetentionCore";

export async function cleanupExpiredVerificationProofs(input: {
  now?: Date;
  limit?: number;
} = {}): Promise<ProofRetentionCleanupSummary> {
  return cleanupExpiredVerificationProofsWithClient({
    now: input.now,
    limit: input.limit,
    storageAdmin:
      createStorageAdminClient() as unknown as ProofRetentionStorageAdminClient,
    recordEvent: recordSecurityEvent,
  });
}
