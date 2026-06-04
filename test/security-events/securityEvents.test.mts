import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import {
  SECURITY_EVENT_TYPES,
  getPrivateAccessEventType,
  recordSecurityEventWithInsert,
  sanitizeSecurityEventMetadata,
} from "../../src/lib/securityEvents/securityEvents.ts";

test("security event taxonomy stays aligned with the bounded E03-T07 baseline", () => {
  assert.deepEqual(SECURITY_EVENT_TYPES, [
    "auth.sign_in_attempt",
    "auth.sign_in_success",
    "auth.sign_in_failed",
    "auth.sign_up_attempt",
    "auth.sign_up_success",
    "auth.sign_up_failed",
    "auth.password_reset_requested",
    "auth.password_reset_request_failed",
    "auth.callback_resolved",
    "private_access.redirect_login",
    "private_access.redirect_profile",
    "private_access.redirect_access_hold",
    "private_access.allowed",
    "private_access.storage_not_ready",
    "profile.upsert_attempt",
    "profile.upsert_success",
    "profile.upsert_failed",
    "beta_access.checked",
  ]);
});

test("security event metadata strips sensitive or noisy values", () => {
  assert.deepEqual(
    sanitizeSecurityEventMetadata({
      email: "crew.member@example.com",
      email_domain: "example.com",
      password: "secret",
      invited_email: "invite@example.com",
      badge_id: "12345",
      employee_id: "67890",
      proof_type: "badge",
      route: "/app",
      result: "redirect_login",
      next_path: "/app/home",
      nullish: null,
    }),
    {
      email_domain: "example.com",
      route: "/app",
      result: "redirect_login",
      next_path: "/app/home",
    },
  );
});

test("private gate results map to bounded security event types", () => {
  assert.equal(
    getPrivateAccessEventType({ kind: "redirect", path: "/login?next=%2Fapp" }),
    "private_access.redirect_login",
  );
  assert.equal(
    getPrivateAccessEventType({ kind: "redirect", path: "/app/profile" }),
    "private_access.redirect_profile",
  );
  assert.equal(
    getPrivateAccessEventType({ kind: "redirect", path: "/app/access-hold?error=missing" }),
    "private_access.storage_not_ready",
  );
  assert.equal(
    getPrivateAccessEventType({ kind: "allow" }),
    "private_access.allowed",
  );
});

test("security event recorder fails soft when Supabase auth is not configured", async () => {
  const calls: Array<unknown> = [];

  const result = await recordSecurityEventWithInsert(
    {
      eventType: "auth.sign_in_attempt",
      route: "/login",
      result: "attempt",
      metadata: {
        email_domain: "example.com",
      },
    },
    {
      enabled: false,
      insert: async (payload) => {
        calls.push(payload);
        return { error: null };
      },
    },
  );

  assert.deepEqual(result, { recorded: false, skipped: true });
  assert.equal(calls.length, 0);
});

test("security event recorder sanitizes metadata and swallows insert failures", async () => {
  const payloads: Array<Record<string, unknown>> = [];

  const result = await recordSecurityEventWithInsert(
    {
      userId: "user-1",
      eventType: "profile.upsert_failed",
      route: "/app/profile",
      result: "failed",
      metadata: {
        email: "crew.member@example.com",
        email_domain: "example.com",
        profile_field: "handle",
      },
    },
    {
      enabled: true,
      insert: async (payload) => {
        payloads.push(payload as Record<string, unknown>);
        return { error: new Error("relation security_events does not exist") };
      },
    },
  );

  assert.deepEqual(result, { recorded: false, skipped: false });
  assert.equal(payloads.length, 1);
  assert.deepEqual(payloads[0], {
    user_id: "user-1",
    event_type: "profile.upsert_failed",
    route: "/app/profile",
    result: "failed",
    metadata: {
      email_domain: "example.com",
      profile_field: "handle",
    },
  });
});

test("security events migration exists with audit-oriented indexes and private RLS", () => {
  const migrationsDir = new URL("../../supabase/migrations", import.meta.url);
  const migrationNames = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter((name) => name.endsWith("_create_security_events.sql"))
    : [];

  assert.ok(migrationNames.length > 0, "expected a create_security_events migration");

  const migrationPath = path.join(migrationsDir.pathname, migrationNames[0] ?? "");
  const sql = readFileSync(migrationPath, "utf8");

  assert.match(sql, /create table public\.security_events/i);
  assert.match(sql, /event_type text not null/i);
  assert.match(sql, /metadata jsonb not null default '\{\}'::jsonb/i);
  assert.match(sql, /create index .*security_events_user_id/i);
  assert.match(sql, /create index .*security_events_event_type/i);
  assert.match(sql, /create index .*security_events_created_at/i);
  assert.match(sql, /alter table public\.security_events enable row level security/i);
  assert.doesNotMatch(sql, /users can read their own security events|public read|for select using \(true\)/i);
});

test("security event implementation stays server-only", () => {
  assert.equal(
    existsSync(new URL("../../src/lib/securityEvents/client.ts", import.meta.url)),
    false,
  );

  const serverSource = readFileSync(
    new URL("../../src/lib/securityEvents/server.ts", import.meta.url),
    "utf8",
  );

  assert.match(serverSource, /"server-only"|import "server-only"/i);
});
