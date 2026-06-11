import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  getRequestHost,
  shouldBlockPublicMarketingHostPath,
} from "./src/lib/privateApp/domainGate";
import { updateSession } from "./src/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const host = getRequestHost(request.headers, request.nextUrl.host);

  if (shouldBlockPublicMarketingHostPath(host, request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
