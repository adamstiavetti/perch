import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { AUTH_ROUTES } from "../auth/routes";
import {
  getSupabaseBrowserEnv,
  getSupabaseMissingEnvMessage,
  isSupabaseEnvRequired,
} from "./config";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    if (
      isSupabaseEnvRequired() &&
      request.nextUrl.pathname.startsWith(AUTH_ROUTES.app)
    ) {
      return new NextResponse(
        `${getSupabaseMissingEnvMessage()} Protected /app auth cannot run in production without these values.`,
        {
          status: 503,
          headers: {
            "content-type": "text/plain; charset=utf-8",
          },
        },
      );
    }

    return response;
  }

  const supabase = createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({
          request,
        });

        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith("/app") && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = AUTH_ROUTES.login;

    const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    redirectUrl.searchParams.set("next", nextPath);

    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
