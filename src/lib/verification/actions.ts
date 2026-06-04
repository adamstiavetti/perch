"use server";

import { redirect } from "next/navigation";

import { AUTH_ROUTES } from "../auth/routes";
import {
  getVerificationRequestEventType,
} from "../securityEvents/securityEvents";
import { recordSecurityEvent } from "../securityEvents/server";
import { getSupabaseBrowserEnv } from "../supabase/config";
import { createClient } from "../supabase/server";
import {
  buildRedactedProofVerificationDraft,
  buildVerificationProofStoragePath,
  getActiveRedactedProofRequest,
  resolveProofReviewRoutingContext,
  validateRedactedProofUpload,
  VERIFICATION_PROOFS_BUCKET,
} from "./proofUpload";
import { planWorkEmailVerificationSubmission } from "./requestFlow";

const VERIFICATION_ROUTE = "/app/verification";

type QueryVerificationRequestRow = {
  id: string;
  method: string;
  status: string;
};

type QueryVerificationEvidenceRow = {
  request_id: string;
  evidence_type: string;
};

type QueryApprovedEmailDomainRow = {
  domain: string;
  airline: string | null;
  status: string;
};

type QueryProfileRoutingRow = {
  claimed_airline: string | null;
};

type CreateRedactedProofVerificationSubmissionResult = {
  request_id: string;
  evidence_id: string;
  request_status: string;
  evidence_status: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function buildRedirect(
  path: string,
  params: Record<string, string | null | undefined>,
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const suffix = search.toString();
  return suffix ? `${path}?${suffix}` : path;
}

export async function submitWorkEmailVerificationAction(formData: FormData) {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        error:
          "Supabase auth is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      }),
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      buildRedirect(AUTH_ROUTES.login, {
        next: VERIFICATION_ROUTE,
      }),
    );
  }

  const workEmail = getString(formData, "work_email");

  const [
    requestsResult,
    evidenceResult,
    approvedDomainsResult,
  ] = await Promise.all([
    supabase
      .from("verification_requests")
      .select("id, method, status")
      .eq("user_id", user.id)
      .returns<QueryVerificationRequestRow[]>(),
    supabase
      .from("verification_evidence")
      .select("request_id, evidence_type")
      .eq("user_id", user.id)
      .returns<QueryVerificationEvidenceRow[]>(),
    supabase
      .from("approved_email_domains")
      .select("domain, airline, status")
      .eq("status", "active")
      .returns<QueryApprovedEmailDomainRow[]>(),
  ]);

  if (requestsResult.error || evidenceResult.error || approvedDomainsResult.error) {
    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        error:
          "Verification request storage is not ready yet. Try again after the verification foundation is available in this environment.",
      }),
    );
  }

  const submission = planWorkEmailVerificationSubmission({
    userId: user.id,
    workEmail,
    loginEmail: user.email,
    approvedDomains: approvedDomainsResult.data ?? [],
    existingRequests: requestsResult.data ?? [],
    existingEvidence: evidenceResult.data ?? [],
  });

  if (submission.kind === "invalid_email" || submission.kind === "unsupported_domain") {
    await recordSecurityEvent({
      userId: user.id,
      eventType: getVerificationRequestEventType({
        submissionKind: submission.kind,
      }),
      route: VERIFICATION_ROUTE,
      result: submission.kind,
      metadata: {
        email_domain: submission.kind === "unsupported_domain" ? submission.domain : null,
        verification_method: "work_email",
        support_result:
          submission.kind === "unsupported_domain" ? "unsupported_domain" : "invalid_email",
      },
    });
    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        error: submission.message,
      }),
    );
  }

  if (submission.kind === "duplicate_request") {
    await recordSecurityEvent({
      userId: user.id,
      eventType: getVerificationRequestEventType({
        submissionKind: submission.kind,
      }),
      route: VERIFICATION_ROUTE,
      result: "duplicate_active",
      metadata: {
        verification_request_id: submission.requestId,
        verification_method: "work_email",
        status: "submitted",
      },
    });
    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        message: submission.message,
      }),
    );
  }

  if (submission.kind === "attach_missing_evidence") {
    const { error } = await supabase.from("verification_evidence").insert({
      request_id: submission.requestId,
      ...submission.evidence,
    });

    if (error) {
      redirect(
        buildRedirect(VERIFICATION_ROUTE, {
          error:
            "Your verification request exists, but the work-email evidence metadata could not be attached yet. Try again.",
        }),
      );
    }

    await recordSecurityEvent({
      userId: user.id,
      eventType: "verification_evidence.created",
      route: VERIFICATION_ROUTE,
      result: "attached_missing_evidence",
      metadata: {
        verification_request_id: submission.requestId,
        evidence_type: submission.evidence.evidence_type,
        email_domain: submission.evidence.metadata.email_domain,
        support_result: submission.evidence.metadata.support_result,
        claim_value: submission.evidence.metadata.airline,
      },
    });

    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        message: submission.message,
      }),
    );
  }

  const { data: createdRequest, error: requestError } = await supabase
    .from("verification_requests")
    .insert(submission.request)
    .select("id")
    .single<{ id: string }>();

  if (requestError || !createdRequest) {
    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        error:
          "The work-email verification request could not be created. Try again.",
      }),
    );
  }

  const { error: evidenceError } = await supabase.from("verification_evidence").insert({
    request_id: createdRequest.id,
    ...submission.evidence,
  });

  if (evidenceError) {
    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        error:
          "Your verification request was created, but the work-email evidence metadata could not be attached yet. Try again to refresh the request state.",
      }),
    );
  }

  await recordSecurityEvent({
    userId: user.id,
    eventType: getVerificationRequestEventType({
      submissionKind: submission.kind,
    }),
    route: VERIFICATION_ROUTE,
    result: "submitted",
    metadata: {
      verification_request_id: createdRequest.id,
      verification_method: submission.request.method,
      status: submission.request.status,
      email_domain: submission.evidence.metadata.email_domain,
      support_result: submission.evidence.metadata.support_result,
    },
  });

  await recordSecurityEvent({
    userId: user.id,
    eventType: "verification_evidence.created",
    route: VERIFICATION_ROUTE,
    result: "created",
    metadata: {
      verification_request_id: createdRequest.id,
      evidence_type: submission.evidence.evidence_type,
      email_domain: submission.evidence.metadata.email_domain,
      support_result: submission.evidence.metadata.support_result,
      claim_value: submission.evidence.metadata.airline,
    },
  });

  redirect(
    buildRedirect(VERIFICATION_ROUTE, {
      message: submission.message,
    }),
  );
}

function getUploadedFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File ? value : null;
}

async function cleanupUploadedVerificationProof(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storagePath: string,
) {
  try {
    await supabase.storage
      .from(VERIFICATION_PROOFS_BUCKET)
      .remove([storagePath]);
  } catch {
    // Cleanup is best-effort because storage rollback must not mask the original failure.
  }
}

export async function submitRedactedProofVerificationAction(formData: FormData) {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        error:
          "Supabase auth is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      }),
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      buildRedirect(AUTH_ROUTES.login, {
        next: VERIFICATION_ROUTE,
      }),
    );
  }

  const proofFile = getUploadedFile(formData, "proof_file");
  const redactionAcknowledged =
    formData.get("redaction_acknowledged") === "on";
  const requestedAirline = getString(formData, "requested_airline");
  const validation = validateRedactedProofUpload({
    file: proofFile,
    redactionAcknowledged,
  });

  if (validation.kind !== "valid") {
    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        error: validation.message,
      }),
    );
  }

  if (!proofFile) {
    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        error: "Choose a JPEG or PNG proof image before submitting.",
      }),
    );
  }

  const profileResult = await supabase
    .from("profiles")
    .select("claimed_airline")
    .eq("id", user.id)
    .maybeSingle<QueryProfileRoutingRow>();

  if (profileResult.error) {
    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        error:
          "Profile routing context is not available yet. Save a profile or try again after profile storage is ready.",
      }),
    );
  }

  const routingContext = resolveProofReviewRoutingContext({
    requestedAirline,
    profileClaimedAirline: profileResult.data?.claimed_airline,
  });

  if (routingContext.kind !== "valid") {
    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        error: routingContext.message,
      }),
    );
  }

  const requestsResult = await supabase
    .from("verification_requests")
    .select("id, method, status")
    .eq("user_id", user.id)
    .returns<QueryVerificationRequestRow[]>();

  if (requestsResult.error) {
    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        error:
          "Verification request storage is not ready yet. Try again after the verification foundation is available in this environment.",
      }),
    );
  }

  const activeProofRequest = getActiveRedactedProofRequest(
    requestsResult.data ?? [],
  );

  if (activeProofRequest) {
    await recordSecurityEvent({
      userId: user.id,
      eventType: "verification_request.duplicate_active",
      route: VERIFICATION_ROUTE,
      result: "duplicate_active",
      metadata: {
        verification_request_id: activeProofRequest.id,
        verification_method: "redacted_badge_or_proof",
        status: activeProofRequest.status,
      },
    });

    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        message:
          "A redacted proof verification request is already active for your account. Wait for review or a resubmission request before uploading again.",
      }),
    );
  }

  const requestId = crypto.randomUUID();
  const evidenceId = crypto.randomUUID();
  const storagePath = buildVerificationProofStoragePath({
    userId: user.id,
    requestId,
    evidenceId,
    extension: validation.storageExtension,
  });
  const nowIso = new Date().toISOString();
  const draft = buildRedactedProofVerificationDraft({
    userId: user.id,
    requestId,
    evidenceId,
    storagePath,
    fileSizeBytes: validation.fileSizeBytes,
    mimeType: validation.mimeType,
    originalExtension: validation.originalExtension,
    requestedAirline: routingContext.requestedAirline,
    routingContextSource: routingContext.routingContextSource,
    nowIso,
  });

  const uploadResult = await supabase.storage
    .from(VERIFICATION_PROOFS_BUCKET)
    .upload(storagePath, proofFile, {
      contentType: validation.mimeType,
      upsert: false,
    });

  if (uploadResult.error) {
    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        error:
          "The redacted proof file could not be uploaded safely. Confirm it is a JPEG or PNG under 5 MB and try again.",
      }),
    );
  }

  const submissionResult = await supabase.rpc(
    "create_redacted_proof_verification_submission",
    {
      p_request_id: draft.request.id,
      p_evidence_id: draft.evidence.id,
      p_storage_bucket: draft.evidence.storage_bucket,
      p_storage_path: draft.evidence.storage_path,
      p_file_size_bytes: draft.evidence.metadata.file_size_bytes,
      p_mime_type: draft.evidence.metadata.mime_type,
      p_original_extension: draft.evidence.metadata.original_extension,
      p_requested_airline: draft.evidence.metadata.requested_airline,
      p_routing_context_source: draft.evidence.metadata.routing_context_source,
      p_upload_client: draft.evidence.metadata.upload_client,
      p_redaction_acknowledged: draft.evidence.redaction_acknowledged,
      p_submitted_at: draft.request.submitted_at,
      p_delete_after: draft.evidence.delete_after,
    },
  );

  if (submissionResult.error || !submissionResult.data) {
    await cleanupUploadedVerificationProof(supabase, storagePath);

    redirect(
      buildRedirect(VERIFICATION_ROUTE, {
        error:
          "The redacted proof upload completed, but the verification request metadata could not be stored safely. The upload was rolled back where possible. Try again.",
      }),
    );
  }

  const createdSubmission =
    submissionResult.data as CreateRedactedProofVerificationSubmissionResult;

  await recordSecurityEvent({
    userId: user.id,
    eventType: "verification_request.submitted",
    route: VERIFICATION_ROUTE,
    result: createdSubmission.request_status,
    metadata: {
      verification_request_id: createdSubmission.request_id,
      verification_method: draft.request.method,
      status: createdSubmission.request_status,
    },
  });

  await recordSecurityEvent({
    userId: user.id,
    eventType: "verification_evidence.created",
    route: VERIFICATION_ROUTE,
    result: createdSubmission.evidence_status,
    metadata: {
      verification_request_id: createdSubmission.request_id,
      verification_evidence_id: createdSubmission.evidence_id,
      evidence_type: draft.evidence.evidence_type,
      redaction_acknowledged: true,
    },
  });

  await recordSecurityEvent({
    userId: user.id,
    eventType: "verification_evidence.uploaded",
    route: VERIFICATION_ROUTE,
    result: "uploaded",
    metadata: {
      verification_request_id: createdSubmission.request_id,
      verification_evidence_id: createdSubmission.evidence_id,
      evidence_type: draft.evidence.evidence_type,
      file_size_bytes: draft.evidence.metadata.file_size_bytes,
      mime_type: draft.evidence.metadata.mime_type,
    },
  });

  redirect(
    buildRedirect(VERIFICATION_ROUTE, {
      message:
        "Redacted proof uploaded. This starts human review only and does not guarantee approval or claim issuance.",
    }),
  );
}
