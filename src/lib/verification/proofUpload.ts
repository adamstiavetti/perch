const REDACTED_PROOF_VERIFICATION_METHOD = "redacted_badge_or_proof" as const;
const REDACTED_PROOF_EVIDENCE_TYPE = "redacted_badge_or_proof" as const;

export const VERIFICATION_PROOFS_BUCKET = "verification-proofs";
export const VERIFICATION_PROOF_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
] as const;
export const VERIFICATION_PROOF_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const VERIFICATION_PROOF_RETENTION_DAYS = 30;

export const ACTIVE_PROOF_REQUEST_STATUSES = [
  "submitted",
  "pending_review",
  "needs_resubmission",
] as const;

type AllowedProofMimeType = (typeof VERIFICATION_PROOF_ALLOWED_MIME_TYPES)[number];

type RedactedProofFileLike = {
  name: string;
  size: number;
  type: string;
};

export const PROOF_REVIEW_ROUTING_CONTEXT_SOURCES = [
  "self_declared",
  "profile_claimed_airline",
] as const;

type ProofReviewRoutingContextSource =
  (typeof PROOF_REVIEW_ROUTING_CONTEXT_SOURCES)[number];

type VerificationRequestFlowRequest = {
  id: string;
  method: string | null | undefined;
  status: string;
};

export type RedactedProofValidationResult =
  | {
      kind: "invalid";
      message: string;
    }
  | {
      kind: "valid";
      fileSizeBytes: number;
      mimeType: AllowedProofMimeType;
      originalExtension: "jpg" | "jpeg" | "png";
      storageExtension: "jpg" | "png";
    };

function normalizeExtension(name: string | null | undefined) {
  const trimmed = name?.trim().toLowerCase() ?? "";
  const dotIndex = trimmed.lastIndexOf(".");

  if (dotIndex <= 0 || dotIndex >= trimmed.length - 1) {
    return null;
  }

  return trimmed.slice(dotIndex + 1);
}

function normalizeMimeType(type: string | null | undefined) {
  const normalized = type?.trim().toLowerCase() ?? "";

  return VERIFICATION_PROOF_ALLOWED_MIME_TYPES.find(
    (candidate) => candidate === normalized,
  ) ?? null;
}

function normalizeRequestedAirline(value: string | null | undefined) {
  const normalized = value?.trim().replace(/\s+/g, " ") ?? "";
  return normalized.length > 0 ? normalized : null;
}

function isUuidLike(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function addDays(nowIso: string, days: number) {
  const date = new Date(nowIso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

export function getActiveRedactedProofRequest(
  requests: VerificationRequestFlowRequest[],
) {
  return requests.find(
    (request) =>
      request.method === REDACTED_PROOF_VERIFICATION_METHOD &&
      ACTIVE_PROOF_REQUEST_STATUSES.some((status) => status === request.status),
  );
}

export function validateRedactedProofUpload(input: {
  file: RedactedProofFileLike | null;
  redactionAcknowledged: boolean;
}): RedactedProofValidationResult {
  if (!input.redactionAcknowledged) {
    return {
      kind: "invalid",
      message:
        "Confirm that you redacted employee IDs, badge numbers, barcodes, QR codes, badge backsides, and security-sensitive details before uploading.",
    };
  }

  if (!input.file || input.file.size <= 0) {
    return {
      kind: "invalid",
      message: "Choose a JPEG or PNG proof image before submitting.",
    };
  }

  const mimeType = normalizeMimeType(input.file.type);

  if (!mimeType) {
    return {
      kind: "invalid",
      message:
        "Only JPEG or PNG proof uploads are supported right now. PDF, video, and HEIC remain out of scope for this first upload slice.",
    };
  }

  if (input.file.size > VERIFICATION_PROOF_MAX_FILE_SIZE_BYTES) {
    return {
      kind: "invalid",
      message: "Proof uploads must stay at or below 5 MB.",
    };
  }

  const originalExtension = normalizeExtension(input.file.name);
  const normalizedExtension =
    originalExtension === "jpg" ||
    originalExtension === "jpeg" ||
    originalExtension === "png"
      ? originalExtension
      : mimeType === "image/jpeg"
        ? "jpg"
        : "png";

  return {
    kind: "valid",
    fileSizeBytes: input.file.size,
    mimeType,
    originalExtension: normalizedExtension,
    storageExtension: mimeType === "image/jpeg" ? "jpg" : "png",
  };
}

export function buildVerificationProofStoragePath({
  userId,
  requestId,
  evidenceId,
  extension,
}: {
  userId: string;
  requestId: string;
  evidenceId: string;
  extension: "jpg" | "png";
}) {
  return `${userId}/${requestId}/${evidenceId}.${extension}`;
}

export function isSafeVerificationProofStoragePath(path: string) {
  const parts = path.split("/");

  if (parts.length !== 3) {
    return false;
  }

  const [userId, requestId, filename] = parts;
  const filenameParts = filename.split(".");

  if (filenameParts.length !== 2) {
    return false;
  }

  const [evidenceId, extension] = filenameParts;

  return (
    isUuidLike(userId) &&
    isUuidLike(requestId) &&
    isUuidLike(evidenceId) &&
    (extension === "jpg" || extension === "png")
  );
}

export function buildRedactedProofEvidenceMetadata(input: {
  fileSizeBytes: number;
  mimeType: AllowedProofMimeType;
  originalExtension: "jpg" | "jpeg" | "png";
  requestedAirline: string;
  routingContextSource: ProofReviewRoutingContextSource;
  uploadClient?: "web";
}) {
  return {
    file_size_bytes: input.fileSizeBytes,
    mime_type: input.mimeType,
    original_extension: input.originalExtension,
    upload_client: input.uploadClient ?? "web",
    redaction_acknowledged: true,
    evidence_method: REDACTED_PROOF_VERIFICATION_METHOD,
    requested_airline: input.requestedAirline,
    routing_context_source: input.routingContextSource,
  };
}

export function resolveProofReviewRoutingContext(input: {
  requestedAirline: string | null | undefined;
  profileClaimedAirline: string | null | undefined;
}) {
  const requestedAirline = normalizeRequestedAirline(input.requestedAirline);

  if (!requestedAirline) {
    return {
      kind: "invalid" as const,
      message:
        "Provide the airline name reviewers should use for routing. This is self-declared review context only and not a verified claim.",
    };
  }

  const profileClaimedAirline = normalizeRequestedAirline(input.profileClaimedAirline);
  const routingContextSource: ProofReviewRoutingContextSource =
    profileClaimedAirline &&
    requestedAirline.localeCompare(profileClaimedAirline, undefined, {
      sensitivity: "accent",
    }) === 0
      ? "profile_claimed_airline"
      : "self_declared";

  return {
    kind: "valid" as const,
    requestedAirline,
    routingContextSource,
  };
}

export function buildRedactedProofVerificationDraft(input: {
  userId: string;
  requestId: string;
  evidenceId: string;
  storagePath: string;
  fileSizeBytes: number;
  mimeType: AllowedProofMimeType;
  originalExtension: "jpg" | "jpeg" | "png";
  requestedAirline: string;
  routingContextSource: ProofReviewRoutingContextSource;
  nowIso?: string;
}) {
  const nowIso = input.nowIso ?? new Date().toISOString();

  return {
    request: {
      id: input.requestId,
      user_id: input.userId,
      status: "submitted" as const,
      requested_claim_types: ["airline_worker"],
      method: REDACTED_PROOF_VERIFICATION_METHOD,
      submitted_at: nowIso,
    },
    evidence: {
      id: input.evidenceId,
      request_id: input.requestId,
      user_id: input.userId,
      evidence_type: REDACTED_PROOF_EVIDENCE_TYPE,
      storage_bucket: VERIFICATION_PROOFS_BUCKET,
      storage_path: input.storagePath,
      redaction_acknowledged: true,
      status: "submitted" as const,
      uploaded_at: nowIso,
      delete_after: addDays(nowIso, VERIFICATION_PROOF_RETENTION_DAYS),
      metadata: buildRedactedProofEvidenceMetadata({
        fileSizeBytes: input.fileSizeBytes,
        mimeType: input.mimeType,
        originalExtension: input.originalExtension,
        requestedAirline: input.requestedAirline,
        routingContextSource: input.routingContextSource,
      }),
    },
  };
}
