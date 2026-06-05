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
  APPROVED_EMAIL_DOMAIN_STATUSES,
} from "../verification/workEmail";
import {
  normalizeApprovedDomain,
  normalizeApprovedDomainActionStatus,
  normalizeApprovedDomainLabel,
  normalizeApprovedDomainReason,
  type ApprovedEmailDomainStatus,
  type ApprovedDomainAdminRecord,
} from "./approvedDomainsShared";

export const APPROVED_DOMAIN_OPERATOR_SCOPE =
  "operator.manage_approved_domains" as const satisfies OperatorScope;
export const APPROVED_DOMAIN_ROUTE = ADMIN_ROUTES.approvedDomains;
export const APPROVED_DOMAIN_NOT_READY_MESSAGE =
  "Approved-domain management is not ready yet. Apply the E05-T03 migration before using this route.";

type ApprovedDomainListRpcResponse = {
  ok?: boolean;
  code?: string;
  message?: string | null;
  domains?: Array<{
    id?: string;
    domain?: string;
    airline?: string | null;
    status?: string;
    created_at?: string;
    updated_at?: string;
  }> | null;
};

type ApprovedDomainMutationRpcResponse = {
  ok?: boolean;
  code?: string;
  message?: string | null;
  approved_domain_id?: string | null;
};

export type ApprovedDomainListResult =
  | {
      ok: true;
      code: string;
      domains: ApprovedDomainAdminRecord[];
    }
  | {
      ok: false;
      code: string;
      message: string;
      domains: [];
    };

export type ApprovedDomainMutationResult =
  | {
      ok: true;
      code: string;
      approvedDomainId: string | null;
      message: string;
    }
  | {
      ok: false;
      code: string;
      approvedDomainId: string | null;
      message: string;
    };

type ApprovedDomainActionFormValues = {
  domainId: string | null;
  domain: string | null;
  airline: string | null;
  status: ApprovedEmailDomainStatus | null;
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

function toApprovedDomainAdminRecord(
  row:
    | {
        id?: string;
        domain?: string;
        airline?: string | null;
        status?: string;
        created_at?: string;
        updated_at?: string;
      }
    | null
    | undefined,
) {
  const status = normalizeApprovedDomainActionStatus(row?.status);

  if (
    !row?.id ||
    !row.domain ||
    !status ||
    typeof row.created_at !== "string" ||
    typeof row.updated_at !== "string"
  ) {
    return null;
  }

  return {
    id: row.id,
    domain: row.domain,
    airline: normalizeApprovedDomainLabel(row.airline),
    status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } satisfies ApprovedDomainAdminRecord;
}

async function getAuthorizedApprovedDomainsClient() {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    return {
      kind: "storage_not_ready" as const,
      message:
        "Approved-domain management is not ready yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in this environment first.",
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
      message: APPROVED_DOMAIN_NOT_READY_MESSAGE,
    };
  }

  if (
    !hasOperatorScope({
      scopes,
      scope: APPROVED_DOMAIN_OPERATOR_SCOPE,
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

async function recordApprovedDomainUnauthorizedRouteAttempt(userId: string) {
  await recordSecurityEvent({
    userId,
    eventType: "approved_email_domain.unauthorized_attempt",
    route: APPROVED_DOMAIN_ROUTE,
    result: "denied",
    metadata: {
      reason_code: "missing_manage_approved_domains_scope",
    },
  });
}

function normalizeApprovedDomainActionFormValues(
  formData: FormData,
): ApprovedDomainActionFormValues {
  const rawStatus = getString(formData, "status");

  return {
    domainId: getString(formData, "domain_id") || null,
    domain: normalizeApprovedDomain(getString(formData, "domain")),
    airline: normalizeApprovedDomainLabel(getString(formData, "airline")),
    status:
      normalizeApprovedDomainActionStatus(rawStatus) ??
      (rawStatus ? null : APPROVED_EMAIL_DOMAIN_STATUSES[0]),
    reason: normalizeApprovedDomainReason(getString(formData, "reason")),
  };
}

function getMutationMessage(
  response: ApprovedDomainMutationRpcResponse | null,
  fallback: string,
) {
  if (
    response?.code === "domain_already_exists" ||
    response?.code === "duplicate_active_domain"
  ) {
    return response.message?.trim() || "Another approved domain record already uses that domain.";
  }

  return response?.message?.trim() || fallback;
}

function getMutationDomainId(
  response: ApprovedDomainMutationRpcResponse | null,
) {
  return typeof response?.approved_domain_id === "string"
    ? response.approved_domain_id
    : null;
}

export async function getApprovedDomainsForOperator(
  searchQuery?: string | null,
): Promise<ApprovedDomainListResult> {
  const access = await getAuthorizedApprovedDomainsClient();

  if (access.kind === "storage_not_ready") {
    return {
      ok: false,
      code: "approved_domain_management_not_ready",
      message: access.message,
      domains: [],
    };
  }

  if (access.kind === "not_ready") {
    return {
      ok: false,
      code: "approved_domain_management_not_ready",
      message: access.message,
      domains: [],
    };
  }

  if (access.kind === "redirect_login") {
    return {
      ok: false,
      code: "authenticated_operator_required",
      message: "Authenticated operator required.",
      domains: [],
    };
  }

  if (access.kind === "unauthorized") {
    return {
      ok: false,
      code: "missing_manage_approved_domains_scope",
      message: "Operator scope required to manage approved domains.",
      domains: [],
    };
  }

  const rpcResult = await access.supabase.rpc(
    "list_approved_email_domains_for_operator",
  );

  if (rpcResult.error) {
    return {
      ok: false,
      code: "approved_domain_management_not_ready",
      message: APPROVED_DOMAIN_NOT_READY_MESSAGE,
      domains: [],
    };
  }

  const payload =
    (rpcResult.data as ApprovedDomainListRpcResponse | null | undefined) ?? null;

  if (!payload?.ok) {
    return {
      ok: false,
      code: payload?.code ?? "approved_domain_list_denied",
      message:
        payload?.message?.trim() ||
        "Approved-domain management is unavailable for this account.",
      domains: [],
    };
  }

  const normalizedQuery = searchQuery?.trim().toLowerCase() ?? "";
  const domains = (payload.domains ?? [])
    .map((row) => toApprovedDomainAdminRecord(row))
    .filter((row): row is ApprovedDomainAdminRecord => row !== null)
    .filter((row) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        row.domain.includes(normalizedQuery) ||
        (row.airline?.toLowerCase().includes(normalizedQuery) ?? false) ||
        row.status.includes(normalizedQuery)
      );
    });

  return {
    ok: true,
    code: payload.code ?? "approved_email_domains_listed",
    domains,
  };
}

async function requireApprovedDomainOperatorAccess() {
  const access = await getAuthorizedApprovedDomainsClient();

  if (access.kind === "storage_not_ready") {
    redirect(
      buildRedirect(APPROVED_DOMAIN_ROUTE, {
        error: access.message,
      }),
    );
  }

  if (access.kind === "not_ready") {
    redirect(
      buildRedirect(APPROVED_DOMAIN_ROUTE, {
        error: access.message,
      }),
    );
  }

  if (access.kind === "redirect_login") {
    redirect(
      buildRedirect(AUTH_ROUTES.login, {
        next: APPROVED_DOMAIN_ROUTE,
      }),
    );
  }

  if (access.kind === "unauthorized") {
    await recordApprovedDomainUnauthorizedRouteAttempt(access.userId);
    redirect(AUTH_ROUTES.accessRestricted);
  }

  return access;
}

export async function createApprovedEmailDomainAction(formData: FormData) {
  "use server";
  const access = await requireApprovedDomainOperatorAccess();
  const values = normalizeApprovedDomainActionFormValues(formData);

  const rpcResult = await access.supabase.rpc("create_approved_email_domain", {
    requested_domain: values.domain,
    requested_airline: values.airline,
    requested_status: values.status ?? APPROVED_EMAIL_DOMAIN_STATUSES[0],
    reason: values.reason,
  });

  if (rpcResult.error) {
    redirect(
      buildRedirect(APPROVED_DOMAIN_ROUTE, {
        error: APPROVED_DOMAIN_NOT_READY_MESSAGE,
      }),
    );
  }

  const payload =
    (rpcResult.data as ApprovedDomainMutationRpcResponse | null | undefined) ?? null;

  if (!payload?.ok) {
    redirect(
      buildRedirect(APPROVED_DOMAIN_ROUTE, {
        error: getMutationMessage(
          payload,
          "The approved domain could not be created.",
        ),
      }),
    );
  }

  redirect(
    buildRedirect(APPROVED_DOMAIN_ROUTE, {
      message: getMutationMessage(payload, "Approved domain created."),
    }),
  );
}

export async function updateApprovedEmailDomainAction(formData: FormData) {
  "use server";
  const access = await requireApprovedDomainOperatorAccess();
  const values = normalizeApprovedDomainActionFormValues(formData);

  const rpcResult = await access.supabase.rpc("update_approved_email_domain", {
    target_domain_id: values.domainId,
    requested_domain: values.domain,
    requested_airline: values.airline,
    requested_status: values.status ?? APPROVED_EMAIL_DOMAIN_STATUSES[0],
    reason: values.reason,
  });

  if (rpcResult.error) {
    redirect(
      buildRedirect(APPROVED_DOMAIN_ROUTE, {
        error: APPROVED_DOMAIN_NOT_READY_MESSAGE,
      }),
    );
  }

  const payload =
    (rpcResult.data as ApprovedDomainMutationRpcResponse | null | undefined) ?? null;

  if (!payload?.ok) {
    redirect(
      buildRedirect(APPROVED_DOMAIN_ROUTE, {
        error: getMutationMessage(
          payload,
          "The approved domain could not be updated.",
        ),
      }),
    );
  }

  redirect(
    buildRedirect(APPROVED_DOMAIN_ROUTE, {
      message: getMutationMessage(payload, "Approved domain updated."),
      highlight: getMutationDomainId(payload) ?? undefined,
    }),
  );
}

export async function disableApprovedEmailDomainAction(formData: FormData) {
  "use server";
  const access = await requireApprovedDomainOperatorAccess();
  const values = normalizeApprovedDomainActionFormValues(formData);

  const rpcResult = await access.supabase.rpc("disable_approved_email_domain", {
    target_domain_id: values.domainId,
    reason: values.reason,
  });

  if (rpcResult.error) {
    redirect(
      buildRedirect(APPROVED_DOMAIN_ROUTE, {
        error: APPROVED_DOMAIN_NOT_READY_MESSAGE,
      }),
    );
  }

  const payload =
    (rpcResult.data as ApprovedDomainMutationRpcResponse | null | undefined) ?? null;

  if (!payload?.ok) {
    redirect(
      buildRedirect(APPROVED_DOMAIN_ROUTE, {
        error: getMutationMessage(
          payload,
          "The approved domain could not be disabled.",
        ),
      }),
    );
  }

  redirect(
    buildRedirect(APPROVED_DOMAIN_ROUTE, {
      message: getMutationMessage(payload, "Approved domain disabled."),
      highlight: getMutationDomainId(payload) ?? undefined,
    }),
  );
}
