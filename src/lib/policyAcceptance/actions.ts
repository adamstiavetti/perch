"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { AUTH_ROUTES } from "../auth/routes";
import { getCurrentAppAccessContext } from "../betaAccess/server";
import { getPrivateAppGateResult } from "../privateApp/access";
import { createClient } from "../supabase/server";
import {
  POLICY_ACCEPTANCE_ROUTE,
  sanitizePolicyAcceptanceNextPath,
} from "./policies";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function buildRedirect(params: Record<string, string | null | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const suffix = search.toString();
  return suffix ? `${POLICY_ACCEPTANCE_ROUTE}?${suffix}` : POLICY_ACCEPTANCE_ROUTE;
}

export async function acceptCurrentPrivateBetaPoliciesAction(formData: FormData) {
  const next = sanitizePolicyAcceptanceNextPath(getString(formData, "next"));
  const acknowledged = getString(formData, "policy_acknowledgement") === "accepted";

  if (!acknowledged) {
    redirect(
      buildRedirect({
        next,
        status: "policy_acceptance_required",
      }),
    );
  }

  const context = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "policy-acceptance",
    nextPath: POLICY_ACCEPTANCE_ROUTE,
    context,
  });

  if (gate.kind === "redirect") {
    redirect(gate.path);
  }

  if (!context.authConfigured || !context.user) {
    redirect(`${AUTH_ROUTES.login}?next=${encodeURIComponent(POLICY_ACCEPTANCE_ROUTE)}`);
  }

  const supabase = await createClient();
  const result = await supabase.rpc("accept_current_private_beta_policies");

  if (result.error) {
    redirect(
      buildRedirect({
        next,
        status: "policy_acceptance_failed",
      }),
    );
  }

  revalidatePath(AUTH_ROUTES.app);
  redirect(next);
}
