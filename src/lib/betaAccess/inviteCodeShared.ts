import { createHash, randomInt } from "node:crypto";

export const BETA_INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const BETA_INVITE_CODE_GROUP_LENGTH = 4;
export const BETA_INVITE_CODE_GROUP_COUNT = 4;
export const BETA_INVITE_CODE_LENGTH =
  BETA_INVITE_CODE_GROUP_LENGTH * BETA_INVITE_CODE_GROUP_COUNT;
export const BETA_INVITE_CODE_MAX_BATCH_SIZE = 100;

export type BetaInviteCodeRecord = {
  plaintextCode: string;
  codeHash: string;
};

export function normalizeBetaInviteCodeInput(value: string | null | undefined) {
  const compact = (value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "");

  if (compact.length !== BETA_INVITE_CODE_LENGTH) {
    return null;
  }

  for (const character of compact) {
    if (!BETA_INVITE_CODE_ALPHABET.includes(character)) {
      return null;
    }
  }

  return compact
    .match(new RegExp(`.{1,${BETA_INVITE_CODE_GROUP_LENGTH}}`, "g"))
    ?.join("-") ?? null;
}

export function hashBetaInviteCode(normalizedCode: string) {
  const compact = normalizedCode.replace(/-/g, "");

  return createHash("sha256")
    .update(`jmpseat_beta_invite_code:v1:${compact}`)
    .digest("hex");
}

export function generateBetaInviteCode() {
  let compact = "";

  for (let index = 0; index < BETA_INVITE_CODE_LENGTH; index += 1) {
    compact += BETA_INVITE_CODE_ALPHABET[randomInt(BETA_INVITE_CODE_ALPHABET.length)];
  }

  const normalized = normalizeBetaInviteCodeInput(compact);

  if (!normalized) {
    throw new Error("Generated beta invite code failed normalization.");
  }

  return normalized;
}

export function generateBetaInviteCodeRecords(quantity: number) {
  const boundedQuantity = Math.floor(quantity);

  if (boundedQuantity < 1 || boundedQuantity > BETA_INVITE_CODE_MAX_BATCH_SIZE) {
    throw new Error("Beta invite batch quantity must be between 1 and 100.");
  }

  const records = new Map<string, BetaInviteCodeRecord>();

  while (records.size < boundedQuantity) {
    const plaintextCode = generateBetaInviteCode();
    records.set(plaintextCode, {
      plaintextCode,
      codeHash: hashBetaInviteCode(plaintextCode),
    });
  }

  return [...records.values()];
}

export function hasPlaintextInviteCodeInMetadata(metadata: Record<string, unknown>) {
  return Object.keys(metadata).some((key) =>
    /plain.*code|invite.*code|code.*plain|code_value|raw_code/i.test(key),
  );
}
