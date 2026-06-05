import "server-only";

import { redirect } from "next/navigation";

import {
  ADMIN_ROUTES,
  type OperatorScope,
  hasOperatorScope,
} from "./access";
import { AUTH_ROUTES } from "../auth/routes";
import { recordSecurityEvent } from "../securityEvents/server";
import { getSupabaseBrowserEnv } from "../supabase/config";
import { createClient } from "../supabase/server";
import {
  REVIEWER_SCOPE_STATUSES,
  normalizeReviewerScopeReason,
  normalizeReviewerScopeStatus,
  normalizeReviewerScopeType,
  normalizeReviewerScopeValue,
  normalizeTargetUserId,
  type ReviewerScopeAdminRecord,
  type ReviewerScopeStatus,
  type ReviewerScopeType,
} from "./reviewerScopesShared";

export const REVIEWER_SCOPE_OPERATOR_SCOPE =
  "operator.manage_reviewer_scopes" as const satisfies OperatorScope;
export const REVIEWER_SCOPE_ROUTE = ADMIN_ROUTES.reviewerScopes;
export const REVIEWER_SCOPE_NOT_READY_MESSAGE =
  "Reviewer-scope management is not ready yet. Apply the E05-T04 migration before using this route.";

type ReviewerScopeListRpcResponse = {
  ok?: boolean;
  code?: string;
  message?: string | null;
  reviewer_scopes?: Array<{
    id?: string;
    reviewer_id?: string;
    scope_type?: string;
    scope_value?: string | null;
    status?: string;
    granted_by?: string | null;
    revoked_by?: string | null;
    reason?: string | null;
    created_at?: string;
    updated_at?: string;
    revoked_at?: string | null;
  }> | null;
};

type ReviewerScopeMutationRpcResponse = {
  ok?: boolean;
  code?: string;
  message?: string | null;
  reviewer_scope_id?: string | null;
};

export type ReviewerScopeListResult =
  | {
      ok: true;
      code: string;
      reviewerScopes: ReviewerScopeAdminRecord[];
    }
  | {
      ok: false;
      code: string;
      message: string;
      reviewerScopes: [];
    };

type ReviewerScopeActionFormValues = {
  scopeId: string | null;
  targetUserId: string | null;
  scopeType: ReviewerScopeType | null;
  scopeValue: string | null;
  status: ReviewerScopeStatus | null;
  reason: string | null;
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

function toReviewerScopeAdminRecord(
  row:
    | {
        id?: string;
        reviewer_id?: string;
        scope_type?: string;
        scope_value?: string | null;
        status?: string;
        granted_by?: string | null;
        revoked_by?: string | null;
        reason?: string | null;
        created_at?: string;
        updated_at?: string;
        revoked_at?: string | null;
      }
    | null
    | undefined,
) {
  const scopeType = normalizeReviewerScopeType(row?.scope_type);
  const status = normalizeReviewerScopeStatus(row?.status);

  if (
    !row?.id ||
    !row.reviewer_id ||
    !scopeType ||
    !status ||
    typeof row.created_at !== "string" ||
    typeof row.updated_at !== "string"
  ) {
    return null;
  }

  return {
    id: row.id,
    reviewerId: row.reviewer_id,
    scopeType,
    scopeValue: normalizeReviewerScopeValue(row.scope_value, scopeType),
    status,
    grantedBy: row.granted_by ?? null,
    revokedBy: row.revoked_by ?? null,
    reason: normalizeReviewerScopeReason(row.reason),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    revokedAt: row.revoked_at ?? null,
  } satisfies ReviewerScopeAdminRecord;
}

async function getAuthorizedReviewerScopesClient() {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    return {
      kind: "storage_not_ready" as const,
      message:
        "Reviewer-scope management is not ready yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in this environment first.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      kind: "redirect_login" as const,
    };
  }

  const scopesResult = await supabase.rpc("current_user_operator_scopes");
  const scopes = Array.isArray(scopesResult.data)
    ? scopesResult.data.filter((value): value is string => typeof value === "string")
    : [];

  if (scopesResult.error) {
    return {
      kind: "not_ready" as const,
      message: REVIEWER_SCOPE_NOT_READY_MESSAGE,
    };
  }

  if (
    !hasOperatorScope({
      scopes,
      scope: REVIEWER_SCOPE_OPERATOR_SCOPE,
    })
  ) {
    return {
      kind: "unauthorized" as const,
      userId: user.id,
    };
  }

  return {
    kind: "authorized" as const,
    supabase,
    userId: user.id,
  };
}

async function recordReviewerScopeUnauthorizedRouteAttempt(userId: string) {
  await recordSecurityEvent({
    userId,
    eventType: "reviewer_scope.unauthorized_attempt",
    route: REVIEWER_SCOPE_ROUTE,
    result: "denied",
    metadata: {
      reason_code: "missing_manage_reviewer_scopes_scope",
    },
  });
}

function normalizeReviewerScopeActionFormValues(
  formData: FormData,
): ReviewerScopeActionFormValues {
  const scopeType = normalizeReviewerScopeType(getString(formData, "scope_type"));
  const rawStatus = getString(formData, "status");

  return {
    scopeId: normalizeTargetUserId(getString(formData, "scope_id")),
    targetUserId: normalizeTargetUserId(getString(formData, "target_user_id")),
    scopeType,
    scopeValue: normalizeReviewerScopeValue(
      getString(formData, "scope_value"),
      scopeType,
    ),
    status:
      normalizeReviewerScopeStatus(rawStatus) ??
      (rawStatus ? null : REVIEWER_SCOPE_STATUSES[0]),
    reason: normalizeReviewerScopeReason(getString(formData, "reason")),
  };
}

function getMutationMessage(
  response: ReviewerScopeMutationRpcResponse | null,
  fallback: string,
) {
  if (response?.code === "duplicate_active_reviewer_scope") {
    return response.message?.trim() || "That active reviewer scope already exists.";
  }

  if (
    response?.code === "self_grant_blocked" ||
    response?.code === "self_revoke_blocked"
  ) {
    return response.message?.trim() || "Operators cannot change their own reviewer scope.";
  }

  if (response?.code === "target_scope_not_active") {
    return response.message?.trim() || "Reviewer scope is not active.";
  }

  return response?.message?.trim() || fallback;
}

function getMutationScopeId(
  response: ReviewerScopeMutationRpcResponse | null,
) {
  return typeof response?.reviewer_scope_id === "string"
    ? response.reviewer_scope_id
    : null;
}

export async function getReviewerScopesForOperator(
  searchQuery?: string | null,
): Promise<ReviewerScopeListResult> {
  const access = await getAuthorizedReviewerScopesClient();

  if (access.kind === "storage_not_ready" || access.kind === "not_ready") {
    return {
      ok: false,
      code: "reviewer_scope_management_not_ready",
      message: access.message,
      reviewerScopes: [],
    };
  }

  if (access.kind === "redirect_login") {
    return {
      ok: false,
      code: "authenticated_operator_required",
      message: "Authenticated operator required.",
      reviewerScopes: [],
    };
  }

  if (access.kind === "unauthorized") {
    return {
      ok: false,
      code: "missing_manage_reviewer_scopes_scope",
      message: "Operator scope required to manage reviewer scopes.",
      reviewerScopes: [],
    };
  }

  const rpcResult = await access.supabase.rpc(
    "list_verification_reviewer_scopes_for_operator",
  );

  if (rpcResult.error) {
    return {
      ok: false,
      code: "reviewer_scope_management_not_ready",
      message: REVIEWER_SCOPE_NOT_READY_MESSAGE,
      reviewerScopes: [],
    };
  }

  const payload =
    (rpcResult.data as ReviewerScopeListRpcResponse | null | undefined) ?? null;

  if (!payload?.ok) {
    return {
      ok: false,
      code: payload?.code ?? "reviewer_scope_list_denied",
      message:
        payload?.message?.trim() ||
        "Reviewer-scope management is unavailable for this account.",
      reviewerScopes: [],
    };
  }

  const normalizedQuery = searchQuery?.trim().toLowerCase() ?? "";
  const reviewerScopes = (payload.reviewer_scopes ?? [])
    .map((row) => toReviewerScopeAdminRecord(row))
    .filter((row): row is ReviewerScopeAdminRecord => row !== null)
    .filter((row) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        row.reviewerId.toLowerCase().includes(normalizedQuery) ||
        row.scopeType.includes(normalizedQuery) ||
        (row.scopeValue?.includes(normalizedQuery) ?? false) ||
        row.status.includes(normalizedQuery)
      );
    });

  return {
    ok: true,
    code: payload.code ?? "verification_reviewer_scopes_listed",
    reviewerScopes,
  };
}

async function requireReviewerScopeOperatorAccess() {
  const access = await getAuthorizedReviewerScopesClient();

  if (access.kind === "storage_not_ready" || access.kind === "not_ready") {
    redirect(
      buildRedirect(REVIEWER_SCOPE_ROUTE, {
        error: access.message,
      }),
    );
  }

  if (access.kind === "redirect_login") {
    redirect(
      buildRedirect(AUTH_ROUTES.login, {
        next: REVIEWER_SCOPE_ROUTE,
      }),
    );
  }

  if (access.kind === "unauthorized") {
    await recordReviewerScopeUnauthorizedRouteAttempt(access.userId);
    redirect(AUTH_ROUTES.accessRestricted);
  }

  return access;
}

export async function grantVerificationReviewerScopeAction(formData: FormData) {
  "use server";
  const access = await requireReviewerScopeOperatorAccess();
  const values = normalizeReviewerScopeActionFormValues(formData);

  const rpcResult = await access.supabase.rpc("grant_verification_reviewer_scope", {
    target_user_id: values.targetUserId,
    requested_scope_type: values.scopeType,
    requested_scope_value: values.scopeValue,
    reason: values.reason,
  });

  if (rpcResult.error) {
    redirect(
      buildRedirect(REVIEWER_SCOPE_ROUTE, {
        error: REVIEWER_SCOPE_NOT_READY_MESSAGE,
      }),
    );
  }

  const payload =
    (rpcResult.data as ReviewerScopeMutationRpcResponse | null | undefined) ?? null;

  if (!payload?.ok) {
    redirect(
      buildRedirect(REVIEWER_SCOPE_ROUTE, {
        error: getMutationMessage(
          payload,
          "The reviewer scope could not be granted.",
        ),
      }),
    );
  }

  redirect(
    buildRedirect(REVIEWER_SCOPE_ROUTE, {
      message: getMutationMessage(payload, "Reviewer scope granted."),
      highlight: getMutationScopeId(payload) ?? undefined,
    }),
  );
}

export async function revokeVerificationReviewerScopeAction(formData: FormData) {
  "use server";
  const access = await requireReviewerScopeOperatorAccess();
  const values = normalizeReviewerScopeActionFormValues(formData);

  const rpcResult = await access.supabase.rpc("revoke_verification_reviewer_scope", {
    target_scope_id: values.scopeId,
    reason: values.reason,
  });

  if (rpcResult.error) {
    redirect(
      buildRedirect(REVIEWER_SCOPE_ROUTE, {
        error: REVIEWER_SCOPE_NOT_READY_MESSAGE,
      }),
    );
  }

  const payload =
    (rpcResult.data as ReviewerScopeMutationRpcResponse | null | undefined) ?? null;

  if (!payload?.ok) {
    redirect(
      buildRedirect(REVIEWER_SCOPE_ROUTE, {
        error: getMutationMessage(
          payload,
          "The reviewer scope could not be revoked.",
        ),
      }),
    );
  }

  redirect(
    buildRedirect(REVIEWER_SCOPE_ROUTE, {
      message: getMutationMessage(payload, "Reviewer scope revoked."),
      highlight: getMutationScopeId(payload) ?? undefined,
    }),
  );
}
