import test from "node:test";
import assert from "node:assert/strict";

import {
  SUPABASE_ENV_KEYS,
  getSupabaseBrowserEnv,
  getSupabaseMissingEnvMessage,
  isSupabaseEnvRequired,
} from "../../src/lib/supabase/config.ts";

test("supabase env keys stay aligned with public browser-safe contract", () => {
  assert.deepEqual(SUPABASE_ENV_KEYS, [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  ]);
});

test("missing env values return a disabled auth config instead of crashing", () => {
  const env = getSupabaseBrowserEnv({});

  assert.equal(env.enabled, false);
  assert.equal(env.url, "");
  assert.equal(env.publishableKey, "");
});

test("missing env stays optional outside production", () => {
  assert.equal(isSupabaseEnvRequired({ NODE_ENV: "development" }), false);
  assert.equal(isSupabaseEnvRequired({ NODE_ENV: "test" }), false);
  assert.equal(isSupabaseEnvRequired({}), false);
});

test("production requires supabase env for protected auth behavior", () => {
  assert.equal(isSupabaseEnvRequired({ NODE_ENV: "production" }), true);
  assert.match(
    getSupabaseMissingEnvMessage(),
    /NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/,
  );
});
