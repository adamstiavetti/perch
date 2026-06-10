"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { AUTH_ROUTES } from "../auth/routes";
import { getCurrentAppAccessContext } from "../betaAccess/server";
import {
  getPrivateAccessSource,
  getPrivateAppGateResult,
  getPrivateRouteAuditResult,
} from "../privateApp/access";
import { getPrivateAccessEventType } from "../securityEvents/securityEvents";
import { recordSecurityEvent } from "../securityEvents/server";
import {
  START_WITH_DFW_FAILED_STATUS,
  START_WITH_DFW_STATUS_PARAM,
  START_WITH_DFW_SUCCESS_STATUS,
} from "./homeBaseActionState";
import { setUserHomeBaseByCode } from "./homeBase";

function buildAppRedirect(status: string) {
  const search = new URLSearchParams({
    [START_WITH_DFW_STATUS_PARAM]: status,
  });

  return `${AUTH_ROUTES.app}?${search.toString()}`;
}

export async function startWithDfwHomeBaseAction(formData: FormData) {
  void formData;

  const context = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-root",
    nextPath: AUTH_ROUTES.app,
    context,
  });

  await recordSecurityEvent({
    userId: context.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: AUTH_ROUTES.app,
    result: getPrivateRouteAuditResult(gate, context),
    metadata: {
      route_kind: "private-root",
      action: "start_with_dfw_home_base",
      access_source: getPrivateAccessSource(gate),
      ...(getPrivateAccessSource(gate) === "operator_internal"
        ? { operator_private_app_access: true }
        : {}),
    },
  });

  if (gate.kind === "redirect") {
    redirect(gate.path);
  }

  if (!context.authConfigured || !context.user) {
    redirect(buildAppRedirect(START_WITH_DFW_FAILED_STATUS));
  }

  const result = await setUserHomeBaseByCode("DFW");

  if (result.error || !result.result) {
    redirect(buildAppRedirect(START_WITH_DFW_FAILED_STATUS));
  }

  revalidatePath(AUTH_ROUTES.app);
  redirect(buildAppRedirect(START_WITH_DFW_SUCCESS_STATUS));
}
