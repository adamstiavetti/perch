import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import {
  getRequestHost,
  isPublicMarketingHost,
  shouldBlockPublicMarketingHostPath,
} from "../../src/lib/privateApp/domainGate.ts";

const proxySource = existsSync(new URL("../../proxy.ts", import.meta.url))
  ? readFileSync(new URL("../../proxy.ts", import.meta.url), "utf8")
  : "";

test("public marketing hosts block private app paths before auth redirects", () => {
  assert.equal(shouldBlockPublicMarketingHostPath("jmpseat.com", "/app"), true);
  assert.equal(shouldBlockPublicMarketingHostPath("www.jmpseat.com", "/app"), true);
  assert.equal(
    shouldBlockPublicMarketingHostPath("jmpseat.com", "/app/hubs/dfw/baseboard"),
    true,
  );
  assert.equal(
    shouldBlockPublicMarketingHostPath("www.jmpseat.com", "/app/admin/waitlist"),
    true,
  );
});

test("public marketing hosts block private beta auth entry routes", () => {
  assert.equal(shouldBlockPublicMarketingHostPath("jmpseat.com", "/login"), true);
  assert.equal(shouldBlockPublicMarketingHostPath("www.jmpseat.com", "/signup"), true);
  assert.equal(
    shouldBlockPublicMarketingHostPath("jmpseat.com", "/reset-password"),
    true,
  );
  assert.equal(
    shouldBlockPublicMarketingHostPath("www.jmpseat.com", "/auth/callback"),
    true,
  );
});

test("beta and local development hosts remain usable", () => {
  assert.equal(shouldBlockPublicMarketingHostPath("beta.jmpseat.com", "/app"), false);
  assert.equal(
    shouldBlockPublicMarketingHostPath("beta.jmpseat.com", "/login"),
    false,
  );
  assert.equal(shouldBlockPublicMarketingHostPath("localhost:3000", "/app"), false);
  assert.equal(shouldBlockPublicMarketingHostPath("127.0.0.1:3000", "/login"), false);
  assert.equal(shouldBlockPublicMarketingHostPath("[::1]:3000", "/app"), false);
});

test("host parsing prefers x-forwarded-host and normalizes safely", () => {
  const headers = new Headers({
    host: "internal.vercel.test",
    "x-forwarded-host": "JMPSEAT.COM:443",
  });

  assert.equal(getRequestHost(headers, "ignored.example"), "jmpseat.com");
  assert.equal(isPublicMarketingHost("WWW.JMPSEAT.COM:443"), true);
  assert.equal(isPublicMarketingHost("beta.jmpseat.com"), false);
});

test("proxy performs the public-host gate server-side before session refresh without private data", () => {
  assert.match(proxySource, /NextResponse\.redirect/);
  assert.match(proxySource, /shouldBlockPublicMarketingHostPath/);
  assert.match(proxySource, /request\.nextUrl\.pathname/);
  assert.match(proxySource, /return updateSession\(request\)/);
  assert.match(proxySource, /shouldBlockPublicMarketingHostPath[\s\S]*updateSession/);
  assert.doesNotMatch(
    proxySource,
    /proof|verification_evidence|reporter|author_user_id|post body|comment body|signed_url|storage_path/i,
  );
});
