import type { ProofRetentionCleanupSummary } from "../verification/proofRetention";
import type { RecordSecurityEventInput } from "../securityEvents/securityEvents";

const MANUAL_CLEANUP_ROUTE = "/app/admin/proof-cleanup";
const REQUIRED_MANUAL_CLEANUP_SCOPE = "operator.run_proof_cleanup";
const MANUAL_CLEANUP_CONFIRMATION = "RUN CLEANUP";

type ProofCleanupRunSummary = {
  scannedCount: number;
  deletedCount: number;
  missingCount: number;
  failedCount: number;
  skippedCount: number;
};

export type ManualCleanupAccess = {
  authConfigured: boolean;
  user: { id: string } | null;
  scopes: readonly string[];
  loadError: string | null;
};

type ManualCleanupAuditResult =
  | {
      recorded?: boolean;
      skipped?: boolean;
    }
  | undefined;

export type ManualCleanupRunResult =
  | {
      ok: true;
      code: "manual_cleanup_completed" | "manual_cleanup_failed";
      limit: number;
      summary: ProofCleanupRunSummary;
    }
  | {
      ok: false;
      code:
        | "operator_setup_not_ready"
        | "missing_run_proof_cleanup_scope"
        | "confirmation_required"
        | "cleanup_storage_not_ready"
        | "manual_cleanup_audit_required"
        | "manual_cleanup_outcome_audit_required"
        | "manual_cleanup_failed";
      message: string;
      limit: number;
      summary?: ProofCleanupRunSummary;
    };

type RunManualProofCleanupDependencies = {
  access: ManualCleanupAccess;
  limit: number;
  confirmation: string;
  storageAdminConfigured: boolean;
  recordAudit: (
    input: RecordSecurityEventInput,
  ) => Promise<ManualCleanupAuditResult>;
  runCleanup: (input: {
    limit?: number;
  }) => Promise<ProofRetentionCleanupSummary>;
};

function auditWasRecorded(result: ManualCleanupAuditResult) {
  return result?.recorded === true;
}

function hasManualCleanupRunScope(scopes: readonly string[]) {
  return scopes.includes(REQUIRED_MANUAL_CLEANUP_SCOPE);
}

function sanitizeProofCleanupRunSummary(
  summary: ProofRetentionCleanupSummary,
): ProofCleanupRunSummary {
  return {
    scannedCount: Math.max(0, summary.scannedCount),
    deletedCount: Math.max(0, summary.deletedCount),
    missingCount: Math.max(0, summary.missingCount),
    failedCount: Math.max(0, summary.failedCount),
    skippedCount: Math.max(0, summary.skippedCount),
  };
}

function buildProofCleanupRunEventMetadata(input: {
  requestedLimit: number;
  summary: ProofCleanupRunSummary;
}) {
  return {
    requested_limit: input.requestedLimit,
    scanned_count: input.summary.scannedCount,
    deleted_count: input.summary.deletedCount,
    missing_count: input.summary.missingCount,
    failed_count: input.summary.failedCount,
    skipped_count: input.summary.skippedCount,
  };
}

function buildProofCleanupRunDeniedEventMetadata(reasonCode: string) {
  return {
    reason_code: reasonCode,
  };
}

export async function runManualProofCleanupWithAuditPrecondition({
  access,
  limit,
  confirmation,
  storageAdminConfigured,
  recordAudit,
  runCleanup,
}: RunManualProofCleanupDependencies): Promise<ManualCleanupRunResult> {
  if (access.loadError || !access.authConfigured || !access.user) {
    await recordAudit({
      userId: access.user?.id,
      eventType: "proof_cleanup.manual_denied",
      route: MANUAL_CLEANUP_ROUTE,
      result: "denied",
      metadata: buildProofCleanupRunDeniedEventMetadata("operator_setup_not_ready"),
    });
    return {
      ok: false,
      code: "operator_setup_not_ready",
      message: "Manual cleanup controls are not ready.",
      limit,
    };
  }

  if (
    !hasManualCleanupRunScope(access.scopes)
  ) {
    await recordAudit({
      userId: access.user.id,
      eventType: "proof_cleanup.manual_denied",
      route: MANUAL_CLEANUP_ROUTE,
      result: "denied",
      metadata: buildProofCleanupRunDeniedEventMetadata(
        "missing_run_proof_cleanup_scope",
      ),
    });
    return {
      ok: false,
      code: "missing_run_proof_cleanup_scope",
      message: "Operator scope required to run proof cleanup.",
      limit,
    };
  }

  if (confirmation !== MANUAL_CLEANUP_CONFIRMATION) {
    await recordAudit({
      userId: access.user.id,
      eventType: "proof_cleanup.manual_denied",
      route: MANUAL_CLEANUP_ROUTE,
      result: "denied",
      metadata: buildProofCleanupRunDeniedEventMetadata("confirmation_mismatch"),
    });
    return {
      ok: false,
      code: "confirmation_required",
      message: "Manual cleanup confirmation is required.",
      limit,
    };
  }

  if (!storageAdminConfigured) {
    await recordAudit({
      userId: access.user.id,
      eventType: "proof_cleanup.manual_denied",
      route: MANUAL_CLEANUP_ROUTE,
      result: "denied",
      metadata: buildProofCleanupRunDeniedEventMetadata(
        "cleanup_storage_not_ready",
      ),
    });
    return {
      ok: false,
      code: "cleanup_storage_not_ready",
      message: "Manual cleanup controls are not ready.",
      limit,
    };
  }

  const requestedAuditResult = await recordAudit({
    userId: access.user.id,
    eventType: "proof_cleanup.manual_requested",
    route: MANUAL_CLEANUP_ROUTE,
    result: "requested",
    metadata: { requested_limit: limit },
  });

  if (!auditWasRecorded(requestedAuditResult)) {
    return {
      ok: false,
      code: "manual_cleanup_audit_required",
      message:
        "Cleanup did not run because the required audit event could not be recorded.",
      limit,
    };
  }

  try {
    const summary = sanitizeProofCleanupRunSummary(await runCleanup({ limit }));
    const eventType =
      summary.failedCount > 0
        ? "proof_cleanup.manual_failed"
        : "proof_cleanup.manual_completed";

    const outcomeAuditResult = await recordAudit({
      userId: access.user.id,
      eventType,
      route: MANUAL_CLEANUP_ROUTE,
      result: summary.failedCount > 0 ? "failed" : "completed",
      metadata: buildProofCleanupRunEventMetadata({
        requestedLimit: limit,
        summary,
      }),
    });

    if (!auditWasRecorded(outcomeAuditResult)) {
      return {
        ok: false,
        code: "manual_cleanup_outcome_audit_required",
        message:
          "Manual cleanup ran, but the required outcome audit event could not be recorded.",
        limit,
        summary,
      };
    }

    return {
      ok: true,
      code:
        summary.failedCount > 0
          ? "manual_cleanup_failed"
          : "manual_cleanup_completed",
      limit,
      summary,
    };
  } catch {
    const failureAuditResult = await recordAudit({
      userId: access.user.id,
      eventType: "proof_cleanup.manual_failed",
      route: MANUAL_CLEANUP_ROUTE,
      result: "failed",
      metadata: {
        requested_limit: limit,
        reason_code: "cleanup_run_failed",
      },
    });

    if (!auditWasRecorded(failureAuditResult)) {
      return {
        ok: false,
        code: "manual_cleanup_outcome_audit_required",
        message:
          "Manual cleanup may have run, but the required failure audit event could not be recorded.",
        limit,
      };
    }

    return {
      ok: false,
      code: "manual_cleanup_failed",
      message: "Manual cleanup could not run.",
      limit,
    };
  }
}
