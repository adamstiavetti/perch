import {
  PRIVATE_SHELL_MESSAGE,
  PRIVATE_SHELL_ROUTE,
} from "../../src/lib/privateApp/privateShellPlaceholder";
import { PrivateShellPlaceholder } from "../../src/components/privateApp/PrivateShellPlaceholder";
import { redirect } from "next/navigation";
import { getCurrentAppAccessContext } from "../../src/lib/betaAccess/server";
import {
  getPrivateAppGateResult,
  getPrivateRouteAuditResult,
} from "../../src/lib/privateApp/access";
import { getPrivateAccessEventType } from "../../src/lib/securityEvents/securityEvents";
import { recordSecurityEvent } from "../../src/lib/securityEvents/server";

export default async function AppPlaceholder() {
  const context = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-root",
    nextPath: PRIVATE_SHELL_ROUTE,
    context,
  });

  await recordSecurityEvent({
    userId: context.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: PRIVATE_SHELL_ROUTE,
    result: getPrivateRouteAuditResult(gate, context),
    metadata: {
      route_kind: "private-root",
    },
  });

  if (gate.kind === "redirect") {
    redirect(gate.path);
  }

  return (
    <PrivateShellPlaceholder
      currentPath={PRIVATE_SHELL_ROUTE}
      message={PRIVATE_SHELL_MESSAGE}
    />
  );
}
