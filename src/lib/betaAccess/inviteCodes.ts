import "server-only";

import { redirect } from "next/navigation";

import { requireOperatorScope } from "../admin/access";
import { AUTH_ROUTES } from "../auth/routes";
import { doesLaunchModeRequireBeta } from "../privateApp/launchMode";
import { recordSecurityEvent } from "../securityEvents/server";
import {
  createStorageAdminClient,
  isStorageAdminConfigured,
} from "../supabase/storageAdmin";
import {
  getBetaInviteRedemptionMessage,
  redeemBetaInviteCodeWithDependencies,
  type BetaInviteRedeemCode,
  type BetaInviteRedeemRpcResponse,
  type BetaInviteRedeemResult,
} from "./inviteCodeCore";
import { getCurrentAppAccessContext } from "./server";
import {
  generateBetaInviteCodeRecords,
  type BetaInviteCodeRecord,
} from "./inviteCodeShared";

export const BETA_INVITE_REDEMPTION_ROUTE = AUTH_ROUTES.accessHold;
export const BETA_INVITE_OPERATOR_SCOPE = "operator.manage_beta_invites";
export const BETA_INVITE_NOT_READY_MESSAGE =
  "Beta invite-code storage is not ready yet. Apply the beta invite-code foundation migration before using invite redemption.";

export { getBetaInviteRedemptionMessage };

type ServiceRpcResponse = {
  ok?: boolean;
  code?: string;
  message?: string | null;
  batch_id?: string | null;
};

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

async function recordBetaInviteRedemptionFailure(input: {
  userId: string | null;
  code: Exclude<BetaInviteRedeemCode, "redeemed">;
}) {
  await recordSecurityEvent({
    userId: input.userId,
    eventType: "beta_invite.redemption_failed",
    route: BETA_INVITE_REDEMPTION_ROUTE,
    result: input.code,
    metadata: {
      reason_code: input.code,
    },
  });
}

export async function redeemCurrentUserBetaInviteCode(
  rawCode: string | null | undefined,
): Promise<BetaInviteRedeemResult> {
  const context = await getCurrentAppAccessContext();

  if (!doesLaunchModeRequireBeta(context.launchMode)) {
    return {
      ok: false,
      code: "already_has_beta_access",
      message:
        getBetaInviteRedemptionMessage("already_has_beta_access") ??
        "Beta access is already active for this account.",
    };
  }

  if (!isStorageAdminConfigured()) {
    await recordBetaInviteRedemptionFailure({
      userId: context.user?.id ?? null,
      code: "not_ready",
    });
    return {
      ok: false,
      code: "not_ready",
      message:
        getBetaInviteRedemptionMessage("not_ready") ??
        "Beta invite-code redemption is not ready yet.",
    };
  }

  return redeemBetaInviteCodeWithDependencies(rawCode, {
    userId: context.user?.id ?? null,
    betaActive: context.betaActive,
    airlineEmailAccessState: context.airlineEmailAccessState,
    storageReady: true,
    recordFailure: recordBetaInviteRedemptionFailure,
    redeemCodeHash: async (codeHash) => {
      const supabase = createStorageAdminClient();
      const result = await supabase.rpc("redeem_beta_invite_code_for_service", {
        target_user_id: context.user?.id ?? null,
        requested_code_hash: codeHash,
      });

      return (result.data as BetaInviteRedeemRpcResponse | null) ?? null;
    },
  });
}

export async function redeemBetaInviteCodeAction(formData: FormData) {
  "use server";

  const rawCode = formData.get("invite_code");
  const result = await redeemCurrentUserBetaInviteCode(
    typeof rawCode === "string" ? rawCode : null,
  );

  if (result.ok) {
    redirect(AUTH_ROUTES.app);
  }

  redirect(
    buildRedirect(AUTH_ROUTES.accessHold, {
      invite_result: result.code,
    }),
  );
}

export type GenerateBetaInviteBatchResult =
  | {
      ok: true;
      code: "beta_invite_batch_created";
      batchId: string;
      plaintextCodes: string[];
    }
  | {
      ok: false;
      code:
        | "beta_invite_generation_not_ready"
        | "missing_manage_beta_invites_scope"
        | "invalid_batch_codes";
      batchId: null;
      plaintextCodes: [];
    };

export async function generateBetaInviteBatchForOperator(input: {
  name: string;
  quantity: number;
  expiresAt?: string | null;
  notes?: string | null;
}): Promise<GenerateBetaInviteBatchResult> {
  let userId: string | null = null;

  try {
    const access = await requireOperatorScope(BETA_INVITE_OPERATOR_SCOPE);
    userId = access.user?.id ?? null;
  } catch {
    return {
      ok: false,
      code: "missing_manage_beta_invites_scope",
      batchId: null,
      plaintextCodes: [],
    };
  }

  if (!userId || !isStorageAdminConfigured()) {
    return {
      ok: false,
      code: "beta_invite_generation_not_ready",
      batchId: null,
      plaintextCodes: [],
    };
  }

  let records: BetaInviteCodeRecord[];

  try {
    records = generateBetaInviteCodeRecords(input.quantity);
  } catch {
    return {
      ok: false,
      code: "invalid_batch_codes",
      batchId: null,
      plaintextCodes: [],
    };
  }

  const supabase = createStorageAdminClient();
  const response = await supabase.rpc("create_beta_invite_batch_for_service", {
    actor_user_id: userId,
    requested_name: input.name,
    requested_code_hashes: records.map((record) => record.codeHash),
    requested_expires_at: input.expiresAt ?? null,
    requested_notes: input.notes ?? null,
  });
  const data = (response.data as ServiceRpcResponse | null) ?? null;

  if (response.error || data?.ok !== true || !data.batch_id) {
    return {
      ok: false,
      code:
        data?.code === "missing_manage_beta_invites_scope"
          ? "missing_manage_beta_invites_scope"
          : "beta_invite_generation_not_ready",
      batchId: null,
      plaintextCodes: [],
    };
  }

  return {
    ok: true,
    code: "beta_invite_batch_created",
    batchId: data.batch_id,
    plaintextCodes: records.map((record) => record.plaintextCode),
  };
}
