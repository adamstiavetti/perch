export const ACTIVE_WORK_EMAIL_REQUEST_STATUSES = [
  "submitted",
  "pending_review",
  "needs_resubmission",
] as const;

type ApprovedEmailDomainRecord = {
  domain?: string | null;
  airline?: string | null;
  status?: string | null;
};

export type VerificationRequestFlowRequest = {
  id: string;
  method: string | null | undefined;
  status: string;
};

export type VerificationRequestFlowEvidence = {
  request_id: string;
  evidence_type: string | null | undefined;
};

export type WorkEmailVerificationSubmissionPlan =
  | {
      kind: "invalid_email";
      message: string;
    }
  | {
      kind: "unsupported_domain";
      domain: string;
      message: string;
    }
  | {
      kind: "duplicate_request";
      requestId: string;
      message: string;
    }
  | {
      kind: "attach_missing_evidence";
      requestId: string;
      evidence: {
        user_id: string;
        evidence_type: "work_email";
        status: "submitted";
        uploaded_at: string;
        redaction_acknowledged: false;
        storage_bucket: null;
        storage_path: null;
        metadata: {
          email_domain: string | null;
          airline: string | null;
          verification_method: "work_email";
          source: "user_submitted_work_email_domain";
          support_result: "supported_domain" | "unsupported_domain";
        };
      };
      message: string;
    }
  | {
      kind: "create_request";
      request: {
        user_id: string;
        status: "submitted";
        requested_claim_types: string[];
        method: "work_email";
        submitted_at: string;
      };
      evidence: {
        user_id: string;
        evidence_type: "work_email";
        status: "submitted";
        uploaded_at: string;
        redaction_acknowledged: false;
        storage_bucket: null;
        storage_path: null;
        metadata: {
          email_domain: string | null;
          airline: string | null;
          verification_method: "work_email";
          source: "user_submitted_work_email_domain";
          support_result: "supported_domain" | "unsupported_domain";
        };
      };
      message: string;
    };

function normalizeWorkEmail(email: string | null | undefined) {
  const normalized = email?.trim().toLowerCase() ?? "";
  return normalized.length > 0 ? normalized : null;
}

function extractWorkEmailDomain(email: string | null | undefined) {
  const normalized = normalizeWorkEmail(email);

  if (!normalized) {
    return null;
  }

  const atIndex = normalized.lastIndexOf("@");
  const dotIndex = normalized.lastIndexOf(".");

  if (atIndex <= 0 || dotIndex <= atIndex + 1 || dotIndex >= normalized.length - 1) {
    return null;
  }

  return normalized.split("@")[1] ?? null;
}

function matchApprovedEmailDomain(
  domain: string | null | undefined,
  records: ApprovedEmailDomainRecord[],
) {
  const normalizedDomain = domain?.trim().toLowerCase() ?? "";

  if (!normalizedDomain) {
    return null;
  }

  for (const record of records) {
    const recordDomain = record.domain?.trim().toLowerCase() ?? "";
    const recordStatus = record.status?.trim().toLowerCase() ?? "";

    if (recordDomain === normalizedDomain && recordStatus === "active") {
      return {
        domain: recordDomain,
        airline: record.airline?.trim() || null,
      };
    }
  }

  return null;
}

function buildWorkEmailEvidenceMetadata({
  workEmail,
  matchedDomain,
}: {
  workEmail: string | null | undefined;
  matchedDomain: {
    domain: string;
    airline: string | null;
  } | null;
}) {
  return {
    email_domain: extractWorkEmailDomain(workEmail),
    airline: matchedDomain?.airline ?? null,
    verification_method: "work_email" as const,
    source: "user_submitted_work_email_domain" as const,
    support_result: matchedDomain ? ("supported_domain" as const) : ("unsupported_domain" as const),
  };
}

function buildWorkEmailVerificationDraft({
  userId,
  workEmail,
  approvedDomains,
  nowIso,
}: {
  userId: string;
  workEmail: string;
  approvedDomains: ApprovedEmailDomainRecord[];
  nowIso: string;
}) {
  const matchedDomain = matchApprovedEmailDomain(
    extractWorkEmailDomain(workEmail),
    approvedDomains,
  );

  const requestedClaimTypes =
    matchedDomain?.airline ? ["airline_worker", "airline"] : ["airline_worker"];

  return {
    request: {
      user_id: userId,
      status: "submitted" as const,
      requested_claim_types: requestedClaimTypes,
      method: "work_email" as const,
      submitted_at: nowIso,
    },
    evidence: {
      user_id: userId,
      evidence_type: "work_email" as const,
      status: "submitted" as const,
      uploaded_at: nowIso,
      redaction_acknowledged: false as const,
      storage_bucket: null,
      storage_path: null,
      metadata: buildWorkEmailEvidenceMetadata({
        workEmail,
        matchedDomain,
      }),
    },
  };
}

function getActiveWorkEmailRequest(
  requests: VerificationRequestFlowRequest[],
) {
  return requests.find(
    (request) =>
      request.method === "work_email" &&
      ACTIVE_WORK_EMAIL_REQUEST_STATUSES.some((status) => status === request.status),
  );
}

export function planWorkEmailVerificationSubmission({
  userId,
  workEmail,
  approvedDomains,
  existingRequests,
  existingEvidence = [],
  nowIso = new Date().toISOString(),
}: {
  userId: string;
  workEmail: string | null | undefined;
  loginEmail?: string | null | undefined;
  approvedDomains: ApprovedEmailDomainRecord[];
  existingRequests: VerificationRequestFlowRequest[];
  existingEvidence?: VerificationRequestFlowEvidence[];
  nowIso?: string;
}) {
  const normalizedEmail = normalizeWorkEmail(workEmail);
  const domain = extractWorkEmailDomain(normalizedEmail);

  if (!normalizedEmail || !domain) {
    return {
      kind: "invalid_email" as const,
      message: "Enter a valid work email before starting verification.",
    };
  }

  const matchedDomain = matchApprovedEmailDomain(domain, approvedDomains);

  if (!matchedDomain) {
    return {
      kind: "unsupported_domain" as const,
      domain,
      message:
        "That work-email domain is not currently supported for verification. Only approved airline-controlled domains can start this path.",
    };
  }

  const draft = buildWorkEmailVerificationDraft({
    userId,
    workEmail: normalizedEmail,
    approvedDomains,
    nowIso,
  });

  const activeRequest = getActiveWorkEmailRequest(existingRequests);

  if (!activeRequest) {
    return {
      kind: "create_request" as const,
      request: draft.request,
      evidence: draft.evidence,
      message:
        "Work-email verification request submitted. This starts request tracking only and does not issue claims automatically.",
    };
  }

  const existingWorkEmailEvidence = existingEvidence.find(
    (evidence) =>
      evidence.request_id === activeRequest.id &&
      evidence.evidence_type === "work_email",
  );

  if (!existingWorkEmailEvidence) {
    return {
      kind: "attach_missing_evidence" as const,
      requestId: activeRequest.id,
      evidence: draft.evidence,
      message:
        "Your existing work-email verification request was refreshed with the missing evidence metadata.",
    };
  }

  return {
    kind: "duplicate_request" as const,
    requestId: activeRequest.id,
    message: "You already have a work-email verification request in progress.",
  };
}
