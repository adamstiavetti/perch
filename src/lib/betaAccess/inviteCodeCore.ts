import type { AirlineEmailAccessState } from "../verification/airlineEmailAccess";

const BETA_INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const BETA_INVITE_CODE_GROUP_COUNT = 4;
const BETA_INVITE_CODE_GROUP_SIZE = 4;
const BETA_INVITE_CODE_LENGTH =
  BETA_INVITE_CODE_GROUP_COUNT * BETA_INVITE_CODE_GROUP_SIZE;

export type BetaInviteRedeemCode =
  | "redeemed"
  | "invalid_or_unavailable_code"
  | "airline_email_required"
  | "already_has_beta_access"
  | "not_ready"
  | "authenticated_user_required";

export type BetaInviteRedeemResult =
  | {
      ok: true;
      code: "redeemed";
      message: string;
    }
  | {
      ok: false;
      code: Exclude<BetaInviteRedeemCode, "redeemed">;
      message: string;
    };

type BetaInviteRedeemFailureResult = Extract<
  BetaInviteRedeemResult,
  { ok: false }
>;

export type BetaInviteRedeemRpcResponse = {
  ok?: boolean;
  code?: string;
  message?: string | null;
  batch_id?: string | null;
};

type RedeemDependencies = {
  userId: string | null;
  betaActive: boolean;
  airlineEmailAccessState: AirlineEmailAccessState;
  storageReady: boolean;
  redeemCodeHash: (codeHash: string) => Promise<BetaInviteRedeemRpcResponse | null>;
  recordFailure: (input: {
    userId: string | null;
    code: Exclude<BetaInviteRedeemCode, "redeemed">;
  }) => Promise<void>;
};

export function getBetaInviteRedemptionMessage(code: string | null | undefined) {
  switch (code) {
    case "redeemed":
      return "Beta invite code redeemed. App access will open after the access checks refresh.";
    case "airline_email_required":
      return "Confirm an approved airline employee email before redeeming a beta invite code.";
    case "already_has_beta_access":
      return "Beta access is already active for this account.";
    case "not_ready":
      return "Beta invite-code redemption is not ready yet.";
    case "invalid_or_unavailable_code":
      return "That beta invite code is invalid or unavailable.";
    default:
      return null;
  }
}

function toFailureResult(
  code: Exclude<BetaInviteRedeemCode, "redeemed">,
): BetaInviteRedeemFailureResult {
  return {
    ok: false,
    code,
    message: getBetaInviteRedemptionMessage(code) ?? "Beta invite redemption failed.",
  };
}

function normalizeBetaInviteCodeInput(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const compact = value.trim().toUpperCase().replace(/[\s-]+/g, "");

  if (compact.length !== BETA_INVITE_CODE_LENGTH) {
    return null;
  }

  for (const char of compact) {
    if (!BETA_INVITE_CODE_ALPHABET.includes(char)) {
      return null;
    }
  }

  return compact
    .match(new RegExp(`.{1,${BETA_INVITE_CODE_GROUP_SIZE}}`, "g"))
    ?.join("-") ?? null;
}

async function hashBetaInviteCode(normalizedCode: string) {
  const payload = new TextEncoder().encode(
    `jmpseat_beta_invite_code:v1:${normalizedCode.replace(/-/g, "")}`,
  );
  const digest = await crypto.subtle.digest("SHA-256", payload);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function redeemBetaInviteCodeWithDependencies(
  rawCode: string | null | undefined,
  dependencies: RedeemDependencies,
): Promise<BetaInviteRedeemResult> {
  if (!dependencies.userId) {
    const result = toFailureResult("authenticated_user_required");
    await dependencies.recordFailure({
      userId: dependencies.userId,
      code: result.code,
    });
    return result;
  }

  if (!dependencies.storageReady) {
    const result = toFailureResult("not_ready");
    await dependencies.recordFailure({
      userId: dependencies.userId,
      code: result.code,
    });
    return result;
  }

  if (dependencies.betaActive) {
    const result = toFailureResult("already_has_beta_access");
    await dependencies.recordFailure({
      userId: dependencies.userId,
      code: result.code,
    });
    return result;
  }

  if (dependencies.airlineEmailAccessState.status === "not_ready") {
    const result = toFailureResult("not_ready");
    await dependencies.recordFailure({
      userId: dependencies.userId,
      code: result.code,
    });
    return result;
  }

  if (!dependencies.airlineEmailAccessState.airlineEmailVerified) {
    const result = toFailureResult("airline_email_required");
    await dependencies.recordFailure({
      userId: dependencies.userId,
      code: result.code,
    });
    return result;
  }

  const normalizedCode = normalizeBetaInviteCodeInput(rawCode);

  if (!normalizedCode) {
    const result = toFailureResult("invalid_or_unavailable_code");
    await dependencies.recordFailure({
      userId: dependencies.userId,
      code: result.code,
    });
    return result;
  }

  const response = await dependencies.redeemCodeHash(
    await hashBetaInviteCode(normalizedCode),
  );

  if (response?.ok === true && response.code === "beta_invite_redeemed") {
    return {
      ok: true,
      code: "redeemed",
      message: getBetaInviteRedemptionMessage("redeemed") ?? "Beta invite code redeemed.",
    };
  }

  if (response?.code === "already_has_beta_access") {
    return toFailureResult("already_has_beta_access");
  }

  return toFailureResult("invalid_or_unavailable_code");
}
