import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

const rootDir = new URL("../..", import.meta.url).pathname;

async function readNextConfig() {
  return readFile(path.join(rootDir, "next.config.ts"), "utf8");
}

test("Next config applies app-owned security headers to all routes", async () => {
  const source = await readNextConfig();

  assert.match(source, /async headers\(\)/);
  assert.match(source, /source:\s*"\/:path\*"/);
  assert.match(source, /poweredByHeader:\s*false/);

  assert.match(source, /key:\s*"X-Content-Type-Options"[\s\S]*?value:\s*"nosniff"/);
  assert.match(source, /key:\s*"Referrer-Policy"[\s\S]*?value:\s*"strict-origin-when-cross-origin"/);
  assert.match(source, /key:\s*"X-Frame-Options"[\s\S]*?value:\s*"DENY"/);
  assert.match(source, /key:\s*"Permissions-Policy"/);
  assert.match(source, /camera=\(\)/);
  assert.match(source, /microphone=\(\)/);
  assert.match(source, /geolocation=\(\)/);
  assert.match(source, /payment=\(\)/);
  assert.match(source, /usb=\(\)/);
});

test("CSP hardening enforces anti-framing and keeps broad runtime policy report-only", async () => {
  const source = await readNextConfig();

  assert.match(source, /key:\s*"Content-Security-Policy"/);
  assert.match(source, /"frame-ancestors 'none'"/);
  assert.match(source, /key:\s*"Content-Security-Policy-Report-Only"/);
  assert.match(source, /"default-src 'self'"/);
  assert.match(source, /"base-uri 'self'"/);
  assert.match(source, /"object-src 'none'"/);
  assert.match(source, /"form-action 'self'"/);
  assert.match(source, /https:\/\/\*\.supabase\.co/);
  assert.match(source, /wss:\/\/\*\.supabase\.co/);
  assert.match(source, /https:\/\/vercel\.live/);
  assert.match(source, /"img-src 'self' data: blob: https:"/);
  assert.match(source, /"style-src 'self' 'unsafe-inline'"/);
  assert.match(source, /"script-src 'self' 'unsafe-inline' 'unsafe-eval' https:\/\/vercel\.live"/);
});

test("security header pass does not add app-managed HSTS or preload policy", async () => {
  const source = await readNextConfig();

  assert.doesNotMatch(source, /Strict-Transport-Security/i);
  assert.doesNotMatch(source, /includeSubDomains|preload/i);
});
