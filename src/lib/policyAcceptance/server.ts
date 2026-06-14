import "server-only";

import { redirect } from "next/navigation";

import type { CurrentAppAccessContext } from "../betaAccess/server";
import type { PrivateAppGateResult } from "../privateApp/access";
import {
  buildPolicyAcceptanceRedirectPath,
  getMissingRequiredPolicyAcceptances,
  hasAcceptedRequiredPolicyAcceptances,
  type PolicyAcceptanceRecord,
} from "./policies";

export const POLICY_ACCEPTANCE_STORAGE_NOT_READY_MESSAGE =
  "Policy acceptance storage is not ready yet. Apply the policy acceptance migration before enforcing broader private-beta app entry.";

export type PolicyAcceptanceStatus = {
  missingPolicies: ReturnType<typeof getMissingRequiredPolicyAcceptances>;
  hasAcceptedAll: boolean;
  loadError: string | null;
};

export function getPolicyAcceptanceStatus(input: {
  records: readonly PolicyAcceptanceRecord[] | null | undefined;
  loadError?: string | null;
}): PolicyAcceptanceStatus {
  const missingPolicies = getMissingRequiredPolicyAcceptances(input.records);

  return {
    missingPolicies,
    hasAcceptedAll: missingPolicies.length === 0 && !input.loadError,
    loadError: input.loadError ?? null,
  };
}

export function shouldRequirePolicyAcceptance(input: {
  context: Pick<
    CurrentAppAccessContext,
    "authConfigured" | "user" | "policyAcceptanceRecords" | "policyAcceptanceLoadError"
  >;
}) {
  if (!input.context.authConfigured || !input.context.user) {
    return false;
  }

  return (
    Boolean(input.context.policyAcceptanceLoadError) ||
    !hasAcceptedRequiredPolicyAcceptances(input.context.policyAcceptanceRecords)
  );
}

export function requireCurrentPolicyAcceptance({
  context,
  gate,
  nextPath,
}: {
  context: CurrentAppAccessContext;
  gate: PrivateAppGateResult;
  nextPath: string;
}) {
  if (gate.kind === "redirect") {
    return;
  }

  if (shouldRequirePolicyAcceptance({ context })) {
    redirect(buildPolicyAcceptanceRedirectPath(nextPath));
  }
}
