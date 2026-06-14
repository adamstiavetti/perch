export const POLICY_ACCEPTANCE_ROUTE = "/app/policy-acceptance" as const;
export const POLICY_ACCEPTANCE_DEFAULT_NEXT_PATH = "/app" as const;

export type RequiredPolicyAcceptance = {
  key: "private_beta_terms" | "privacy_notice" | "community_rules";
  version: "v1";
  title: string;
  href: string;
};

export type PolicyAcceptanceRecord = {
  policy_key: string | null;
  policy_version: string | null;
};

export const REQUIRED_POLICY_ACCEPTANCES = [
  {
    key: "private_beta_terms",
    version: "v1",
    title: "Private Beta Terms",
    href: "/legal/beta-terms",
  },
  {
    key: "privacy_notice",
    version: "v1",
    title: "Privacy Notice",
    href: "/legal/privacy",
  },
  {
    key: "community_rules",
    version: "v1",
    title: "Community Rules",
    href: "/legal/community-rules",
  },
] as const satisfies readonly RequiredPolicyAcceptance[];

function toPolicyVersionToken(record: PolicyAcceptanceRecord) {
  return `${record.policy_key ?? ""}:${record.policy_version ?? ""}`;
}

export function getRequiredPolicyVersionToken(policy: RequiredPolicyAcceptance) {
  return `${policy.key}:${policy.version}`;
}

export function getMissingRequiredPolicyAcceptances(
  records: readonly PolicyAcceptanceRecord[] | null | undefined,
) {
  const acceptedTokens = new Set((records ?? []).map(toPolicyVersionToken));

  return REQUIRED_POLICY_ACCEPTANCES.filter(
    (policy) => !acceptedTokens.has(getRequiredPolicyVersionToken(policy)),
  );
}

export function hasAcceptedRequiredPolicyAcceptances(
  records: readonly PolicyAcceptanceRecord[] | null | undefined,
) {
  return getMissingRequiredPolicyAcceptances(records).length === 0;
}

export function sanitizePolicyAcceptanceNextPath(nextPath?: string | null) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return POLICY_ACCEPTANCE_DEFAULT_NEXT_PATH;
  }

  if (!nextPath.startsWith("/app")) {
    return POLICY_ACCEPTANCE_DEFAULT_NEXT_PATH;
  }

  if (
    nextPath === POLICY_ACCEPTANCE_ROUTE ||
    nextPath.startsWith(`${POLICY_ACCEPTANCE_ROUTE}?`) ||
    nextPath.startsWith(`${POLICY_ACCEPTANCE_ROUTE}/`)
  ) {
    return POLICY_ACCEPTANCE_DEFAULT_NEXT_PATH;
  }

  return nextPath;
}

export function buildPolicyAcceptanceRedirectPath(nextPath?: string | null) {
  const safeNext = sanitizePolicyAcceptanceNextPath(nextPath);
  const search = new URLSearchParams({
    next: safeNext,
  });

  return `${POLICY_ACCEPTANCE_ROUTE}?${search.toString()}`;
}
