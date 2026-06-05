"use server";

import { redirect } from "next/navigation";

import { ADMIN_ROUTES, getCurrentOperatorAccess } from "./access";
import { recordSecurityEventWithServiceRole } from "../securityEvents/server";
import { isStorageAdminConfigured } from "../supabase/storageAdmin";
import { cleanupExpiredVerificationProofsForOps } from "../verification/proofRetention";
import { normalizeProofCleanupRunLimit } from "./proofCleanupControlsShared";
import {
  runManualProofCleanupWithAuditPrecondition,
  type ManualCleanupRunResult,
} from "./proofCleanupControlsCore";

const MANUAL_CLEANUP_ROUTE = ADMIN_ROUTES.proofCleanup;
function getConfirmation(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function buildResultRedirect(input: {
  status: "completed" | "failed";
  limit: number;
  scannedCount: number;
  deletedCount: number;
  missingCount: number;
  failedCount: number;
  skippedCount: number;
}) {
  const params = new URLSearchParams({
    manual_status: input.status,
    manual_limit: String(input.limit),
    manual_scanned: String(input.scannedCount),
    manual_deleted: String(input.deletedCount),
    manual_missing: String(input.missingCount),
    manual_failed: String(input.failedCount),
    manual_skipped: String(input.skippedCount),
  });

  return `${MANUAL_CLEANUP_ROUTE}?${params.toString()}`;
}

function buildFailureRedirect(result: Extract<ManualCleanupRunResult, { ok: false }>) {
  switch (result.code) {
    case "operator_setup_not_ready":
    case "cleanup_storage_not_ready":
      return `${MANUAL_CLEANUP_ROUTE}?manual_status=not_ready`;
    case "missing_run_proof_cleanup_scope":
      return `${MANUAL_CLEANUP_ROUTE}?manual_status=denied`;
    case "confirmation_required":
      return `${MANUAL_CLEANUP_ROUTE}?manual_status=confirmation_required`;
    case "manual_cleanup_audit_required":
      return `${MANUAL_CLEANUP_ROUTE}?manual_status=audit_not_recorded`;
    case "manual_cleanup_outcome_audit_required": {
      const params = new URLSearchParams({
        manual_status: "outcome_audit_not_recorded",
        manual_limit: String(result.limit),
      });

      if (result.summary) {
        params.set("manual_scanned", String(result.summary.scannedCount));
        params.set("manual_deleted", String(result.summary.deletedCount));
        params.set("manual_missing", String(result.summary.missingCount));
        params.set("manual_failed", String(result.summary.failedCount));
        params.set("manual_skipped", String(result.summary.skippedCount));
      }

      return `${MANUAL_CLEANUP_ROUTE}?${params.toString()}`;
    }
    case "manual_cleanup_failed":
      return `${MANUAL_CLEANUP_ROUTE}?manual_status=failed&manual_limit=${result.limit}`;
  }
}

export async function runProofCleanupForOperatorAction(formData: FormData) {
  const access = await getCurrentOperatorAccess();
  const limit = normalizeProofCleanupRunLimit(formData.get("limit"));
  const confirmation = getConfirmation(formData.get("confirmation"));
  const result = await runManualProofCleanupWithAuditPrecondition({
    access,
    limit,
    confirmation,
    storageAdminConfigured: isStorageAdminConfigured(),
    recordAudit: recordSecurityEventWithServiceRole,
    runCleanup: cleanupExpiredVerificationProofsForOps,
  });

  if (!result.ok) {
    redirect(buildFailureRedirect(result));
  }

  redirect(
    buildResultRedirect({
      status: result.summary.failedCount > 0 ? "failed" : "completed",
      limit: result.limit,
      ...result.summary,
    }),
  );
}
