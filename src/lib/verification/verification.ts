export const VERIFICATION_CLAIM_TYPES = [
  "airline_worker",
  "airline",
  "role",
  "base",
] as const;

export const VERIFICATION_REQUEST_STATUSES = [
  "draft",
  "submitted",
  "pending_review",
  "needs_resubmission",
  "approved",
  "rejected",
  "cancelled",
  "expired",
  "revoked",
] as const;

export const VERIFICATION_CLAIM_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "needs_resubmission",
  "expired",
  "revoked",
] as const;

export const VERIFICATION_METHODS = [
  "work_email",
  "redacted_badge_or_proof",
] as const;

export const VERIFICATION_EVIDENCE_TYPES = VERIFICATION_METHODS;

export const VERIFICATION_EVIDENCE_STATUSES = [
  "pending",
  "submitted",
  "accepted",
  "rejected",
  "needs_resubmission",
  "deleted",
] as const;

export const VERIFICATION_REVIEW_ACTIONS = [
  "approve",
  "reject",
  "request_resubmission",
  "revoke",
  "expire",
  "cancel",
] as const;

export type VerificationClaimType = (typeof VERIFICATION_CLAIM_TYPES)[number];
export type VerificationRequestStatus = (typeof VERIFICATION_REQUEST_STATUSES)[number];
export type VerificationClaimStatus = (typeof VERIFICATION_CLAIM_STATUSES)[number];
export type VerificationMethod = (typeof VERIFICATION_METHODS)[number];
export type VerificationEvidenceType = (typeof VERIFICATION_EVIDENCE_TYPES)[number];
export type VerificationEvidenceStatus = (typeof VERIFICATION_EVIDENCE_STATUSES)[number];
export type VerificationReviewAction = (typeof VERIFICATION_REVIEW_ACTIONS)[number];

const DISALLOWED_EVIDENCE_METADATA_KEYS = new Set([
  "badge_id",
  "badge_number",
  "employee_id",
  "barcode",
  "barcodes",
  "qr_code",
  "qr_codes",
  "raw_text",
  "file_blob",
  "file_bytes",
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isVerificationClaimApproved(status: VerificationClaimStatus) {
  return status === "approved";
}

export function isSafeVerificationEvidenceMetadata(metadata: unknown) {
  if (!isPlainObject(metadata)) {
    return false;
  }

  return !Object.keys(metadata).some((key) => DISALLOWED_EVIDENCE_METADATA_KEYS.has(key));
}
