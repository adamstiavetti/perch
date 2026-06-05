export const APPROVED_DOMAIN_STATUS_VALUES = ["active", "disabled"] as const;

export type ApprovedEmailDomainStatus =
  (typeof APPROVED_DOMAIN_STATUS_VALUES)[number];

export const APPROVED_DOMAIN_PERSONAL_EMAIL_DOMAINS = [
  "aol.com",
  "fastmail.com",
  "gmail.com",
  "gmx.com",
  "googlemail.com",
  "hey.com",
  "hotmail.com",
  "icloud.com",
  "live.com",
  "me.com",
  "msn.com",
  "outlook.com",
  "pm.me",
  "proton.me",
  "protonmail.com",
  "yahoo.com",
  "yandex.com",
  "zoho.com",
] as const;

export type ApprovedDomainAdminRecord = {
  id: string;
  domain: string;
  airline: string | null;
  status: ApprovedEmailDomainStatus;
  createdAt: string;
  updatedAt: string;
};

export function normalizeApprovedDomain(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase() ?? "";
  return normalized.length > 0 ? normalized : null;
}

export function normalizeApprovedDomainLabel(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
}

export function normalizeApprovedDomainReason(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized.slice(0, 500) : null;
}

export function isApprovedDomainFormatValid(value: string | null | undefined) {
  const normalized = normalizeApprovedDomain(value);

  if (!normalized) {
    return false;
  }

  if (/[@/:?#]/.test(normalized)) {
    return false;
  }

  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(
    normalized,
  );
}

export function isPersonalApprovedDomain(value: string | null | undefined) {
  const normalized = normalizeApprovedDomain(value);

  if (!normalized) {
    return false;
  }

  return APPROVED_DOMAIN_PERSONAL_EMAIL_DOMAINS.includes(
    normalized as (typeof APPROVED_DOMAIN_PERSONAL_EMAIL_DOMAINS)[number],
  );
}

export function normalizeApprovedDomainActionStatus(
  value: string | null | undefined,
) {
  const normalized = value?.trim().toLowerCase();
  const matchedStatus =
    APPROVED_DOMAIN_STATUS_VALUES.find((candidate) => candidate === normalized) ?? null;

  return matchedStatus ?? (value?.trim() ? null : APPROVED_DOMAIN_STATUS_VALUES[0]);
}
