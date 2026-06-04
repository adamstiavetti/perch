import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_ROUTES, sanitizeNextPath } from "../../../src/lib/auth/routes";
import { resolveCurrentUserAppPath } from "../../../src/lib/betaAccess/server";
import { recordSecurityEvent } from "../../../src/lib/securityEvents/server";
import { getSupabaseBrowserEnv } from "../../../src/lib/supabase/config";
import { createClient } from "../../../src/lib/supabase/server";

export async function GET(request: NextRequest) {
  const env = getSupabaseBrowserEnv();
  const redirectUrl = request.nextUrl.clone();

  if (!env.enabled) {
    await recordSecurityEvent({
      eventType: "auth.callback_resolved",
      route: AUTH_ROUTES.callback,
      result: "auth_not_configured",
    });
    redirectUrl.pathname = AUTH_ROUTES.login;
    redirectUrl.searchParams.set(
      "error",
      "Supabase auth is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
    return NextResponse.redirect(redirectUrl);
  }

  const code = request.nextUrl.searchParams.get("code");
  const next = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
  const mode = request.nextUrl.searchParams.get("mode");

  if (!code) {
    await recordSecurityEvent({
      eventType: "auth.callback_resolved",
      route: AUTH_ROUTES.callback,
      result: "missing_code",
    });
    redirectUrl.pathname = AUTH_ROUTES.login;
    redirectUrl.searchParams.set("error", "Missing authentication callback code.");
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    await recordSecurityEvent({
      eventType: "auth.callback_resolved",
      route: AUTH_ROUTES.callback,
      result: "exchange_failed",
    });
    redirectUrl.pathname = AUTH_ROUTES.login;
    redirectUrl.searchParams.set("error", error.message);
    return NextResponse.redirect(redirectUrl);
  }

  if (next === AUTH_ROUTES.resetPassword && mode === "update") {
    await recordSecurityEvent({
      eventType: "auth.callback_resolved",
      route: AUTH_ROUTES.callback,
      result: "password_update",
      metadata: {
        next_path: AUTH_ROUTES.resetPassword,
      },
    });
    redirectUrl.pathname = AUTH_ROUTES.resetPassword;
    redirectUrl.search = "";
    redirectUrl.searchParams.set("mode", "update");
    redirectUrl.searchParams.set(
      "message",
      "Choose a new password to finish recovery.",
    );
    return NextResponse.redirect(redirectUrl);
  }

  const destination = await resolveCurrentUserAppPath(next);
  await recordSecurityEvent({
    eventType: "auth.callback_resolved",
    route: AUTH_ROUTES.callback,
    result: "resolved",
    metadata: {
      next_path: destination,
    },
  });
  return NextResponse.redirect(new URL(destination, request.url));
}
