export const REVIEWER_SCOPE_TYPES = [
  "global",
  "airline",
  "role",
  "base",
] as const;

export const REVIEWER_SCOPE_STATUSES = [
  "active",
  "paused",
  "revoked",
] as const;

export type ReviewerScopeType = (typeof REVIEWER_SCOPE_TYPES)[number];
export type ReviewerScopeStatus = (typeof REVIEWER_SCOPE_STATUSES)[number];

export type ReviewerScopeAdminRecord = {
  id: string;
  reviewerId: string;
  scopeType: ReviewerScopeType;
  scopeValue: string | null;
  status: ReviewerScopeStatus;
  grantedBy: string | null;
  revokedBy: string | null;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
  revokedAt: string | null;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizeTargetUserId(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase() ?? "";

  return UUID_PATTERN.test(normalized) ? normalized : null;
}

export function normalizeReviewerScopeType(
  value: string | null | undefined,
): ReviewerScopeType | null {
  const normalized = value?.trim().toLowerCase() ?? "";

  return (REVIEWER_SCOPE_TYPES as readonly string[]).includes(normalized)
    ? (normalized as ReviewerScopeType)
    : null;
}

export function normalizeReviewerScopeStatus(
  value: string | null | undefined,
): ReviewerScopeStatus | null {
  const normalized = value?.trim().toLowerCase() ?? "";

  return (REVIEWER_SCOPE_STATUSES as readonly string[]).includes(normalized)
    ? (normalized as ReviewerScopeStatus)
    : null;
}

export function normalizeReviewerScopeValue(
  value: string | null | undefined,
  scopeType?: ReviewerScopeType | null,
) {
  if (scopeType === "global") {
    return null;
  }

  const normalized = value?.trim().toLowerCase() ?? "";

  return normalized || null;
}

export function normalizeReviewerScopeReason(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";

  return normalized || null;
}

export function filterActiveReviewerScopes<
  T extends { status: string | null | undefined },
>(scopes: T[]) {
  return scopes.filter((scope) => scope.status === "active");
}
