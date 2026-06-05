import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

import {
  ADMIN_ROUTES,
  buildAdminNavigation,
} from "../../src/lib/admin/access.ts";
import {
  PROOF_CLEANUP_RUN_CONFIRMATION,
  PROOF_CLEANUP_RUN_SCOPE,
  buildProofCleanupRunDeniedEventMetadata,
  buildProofCleanupRunEventMetadata,
  normalizeProofCleanupRunLimit,
  sanitizeProofCleanupRunSummary,
} from "../../src/lib/admin/proofCleanupControlsShared.ts";
import { runManualProofCleanupWithAuditPrecondition } from "../../src/lib/admin/proofCleanupControlsCore.ts";

const AUTHORIZED_RUN_ACCESS = {
  authConfigured: true,
  user: {
    id: "11111111-1111-1111-1111-111111111111",
  },
  scopes: ["operator.run_proof_cleanup"],
  operatorGranted: true,
  loadError: null,
} as never;

test("proof cleanup navigation opens for monitor or run scope without making them equivalent", () => {
  const noScopeNavigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: [],
  });
  const monitorNavigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: ["operator.monitor_proof_cleanup"],
  });
  const runNavigation = buildAdminNavigation({
    reviewerAuthorized: false,
    operatorScopes: ["operator.run_proof_cleanup"],
  });

  assert.equal(PROOF_CLEANUP_RUN_SCOPE, "operator.run_proof_cleanup");
  assert.equal(
    noScopeNavigation.find((item) => item.path === ADMIN_ROUTES.proofCleanup)?.status,
    "disabled",
  );
  assert.equal(
    monitorNavigation.find((item) => item.path === ADMIN_ROUTES.proofCleanup)?.status,
    "available",
  );
  assert.equal(
    runNavigation.find((item) => item.path === ADMIN_ROUTES.proofCleanup)?.status,
    "available",
  );
  assert.match(
    runNavigation.find((item) => item.path === ADMIN_ROUTES.proofCleanup)?.reason ??
      "",
    /operator\.monitor_proof_cleanup or operator\.run_proof_cleanup/i,
  );
});

test("proof cleanup run helpers enforce confirmation, bounds, and summary-only output", () => {
  assert.equal(PROOF_CLEANUP_RUN_CONFIRMATION, "RUN CLEANUP");
  assert.equal(normalizeProofCleanupRunLimit(undefined), 5);
  assert.equal(normalizeProofCleanupRunLimit("0"), 5);
  assert.equal(normalizeProofCleanupRunLimit("3"), 3);
  assert.equal(normalizeProofCleanupRunLimit("500"), 25);
  assert.deepEqual(
    sanitizeProofCleanupRunSummary({
      scannedCount: 4,
      deletedCount: 2,
      missingCount: 1,
      failedCount: 1,
      skippedCount: 0,
      storage_path: "private/path.png",
      signed_url: "https://signed.example",
      proof_text: "raw proof",
    }),
    {
      scannedCount: 4,
      deletedCount: 2,
      missingCount: 1,
      failedCount: 1,
      skippedCount: 0,
    },
  );
});

test("proof cleanup manual audit metadata is summary-only and never path driven", () => {
  assert.deepEqual(
    buildProofCleanupRunEventMetadata({
      requestedLimit: 10,
      summary: {
        scannedCount: 3,
        deletedCount: 1,
        missingCount: 1,
        failedCount: 1,
        skippedCount: 0,
      },
    }),
    {
      requested_limit: 10,
      scanned_count: 3,
      deleted_count: 1,
      missing_count: 1,
      failed_count: 1,
      skipped_count: 0,
    },
  );
  assert.deepEqual(buildProofCleanupRunDeniedEventMetadata("missing_scope"), {
    reason_code: "missing_scope",
  });
  assert.doesNotMatch(
    JSON.stringify(
      buildProofCleanupRunEventMetadata({
        requestedLimit: 10,
        summary: {
          scannedCount: 3,
          deletedCount: 1,
          missingCount: 1,
          failedCount: 1,
          skippedCount: 0,
        },
      }),
    ),
    /storage|bucket|path|filename|signed|public|token|secret|proof_text/i,
  );
});

test("manual cleanup fails closed when the requested audit event is not recorded", async () => {
  let cleanupCalled = false;
  const auditEvents: Array<Record<string, unknown>> = [];

  const result = await runManualProofCleanupWithAuditPrecondition({
    access: AUTHORIZED_RUN_ACCESS,
    limit: 5,
    confirmation: PROOF_CLEANUP_RUN_CONFIRMATION,
    storageAdminConfigured: true,
    recordAudit: async (event) => {
      auditEvents.push(event as unknown as Record<string, unknown>);
      return { recorded: false, skipped: false };
    },
    runCleanup: async () => {
      cleanupCalled = true;
      return {
        scannedCount: 1,
        deletedCount: 1,
        missingCount: 0,
        failedCount: 0,
        skippedCount: 0,
      };
    },
  });

  assert.equal(cleanupCalled, false);
  assert.deepEqual(
    auditEvents.map((event) => event.eventType),
    ["proof_cleanup.manual_requested"],
  );
  assert.deepEqual(result, {
    ok: false,
    code: "manual_cleanup_audit_required",
    message:
      "Cleanup did not run because the required audit event could not be recorded.",
    limit: 5,
  });
  assert.doesNotMatch(JSON.stringify(result), /database|stack|service_role|secret|token/i);
});

test("manual cleanup calls the reviewed helper only after requested audit records", async () => {
  let cleanupCalled = false;
  const auditEvents: Array<Record<string, unknown>> = [];

  const result = await runManualProofCleanupWithAuditPrecondition({
    access: AUTHORIZED_RUN_ACCESS,
    limit: 5,
    confirmation: PROOF_CLEANUP_RUN_CONFIRMATION,
    storageAdminConfigured: true,
    recordAudit: async (event) => {
      auditEvents.push(event as unknown as Record<string, unknown>);
      return { recorded: true, skipped: false };
    },
    runCleanup: async () => {
      cleanupCalled = true;
      return {
        scannedCount: 2,
        deletedCount: 1,
        missingCount: 1,
        failedCount: 0,
        skippedCount: 0,
      };
    },
  });

  assert.equal(cleanupCalled, true);
  assert.deepEqual(
    auditEvents.map((event) => event.eventType),
    ["proof_cleanup.manual_requested", "proof_cleanup.manual_completed"],
  );
  assert.deepEqual(result, {
    ok: true,
    code: "manual_cleanup_completed",
    limit: 5,
    summary: {
      scannedCount: 2,
      deletedCount: 1,
      missingCount: 1,
      failedCount: 0,
      skippedCount: 0,
    },
  });
});

test("manual cleanup does not report success when completed audit is not recorded", async () => {
  let cleanupCalled = false;
  const auditEvents: Array<Record<string, unknown>> = [];

  const result = await runManualProofCleanupWithAuditPrecondition({
    access: AUTHORIZED_RUN_ACCESS,
    limit: 5,
    confirmation: PROOF_CLEANUP_RUN_CONFIRMATION,
    storageAdminConfigured: true,
    recordAudit: async (event) => {
      auditEvents.push(event as unknown as Record<string, unknown>);
      return {
        recorded: event.eventType === "proof_cleanup.manual_requested",
        skipped: false,
      };
    },
    runCleanup: async () => {
      cleanupCalled = true;
      return {
        scannedCount: 2,
        deletedCount: 1,
        missingCount: 1,
        failedCount: 0,
        skippedCount: 0,
      };
    },
  });

  assert.equal(cleanupCalled, true);
  assert.deepEqual(
    auditEvents.map((event) => event.eventType),
    ["proof_cleanup.manual_requested", "proof_cleanup.manual_completed"],
  );
  assert.deepEqual(result, {
    ok: false,
    code: "manual_cleanup_outcome_audit_required",
    message:
      "Manual cleanup ran, but the required outcome audit event could not be recorded.",
    limit: 5,
    summary: {
      scannedCount: 2,
      deletedCount: 1,
      missingCount: 1,
      failedCount: 0,
      skippedCount: 0,
    },
  });
  assert.doesNotMatch(JSON.stringify(result), /database|stack|service_role|secret|token/i);
});

test("manual cleanup does not report normal failure when failed audit is not recorded", async () => {
  const auditEvents: Array<Record<string, unknown>> = [];

  const result = await runManualProofCleanupWithAuditPrecondition({
    access: AUTHORIZED_RUN_ACCESS,
    limit: 5,
    confirmation: PROOF_CLEANUP_RUN_CONFIRMATION,
    storageAdminConfigured: true,
    recordAudit: async (event) => {
      auditEvents.push(event as unknown as Record<string, unknown>);
      return {
        recorded: event.eventType === "proof_cleanup.manual_requested",
        skipped: false,
      };
    },
    runCleanup: async () => {
      throw new Error("database stack service_role secret token");
    },
  });

  assert.deepEqual(
    auditEvents.map((event) => event.eventType),
    ["proof_cleanup.manual_requested", "proof_cleanup.manual_failed"],
  );
  assert.deepEqual(result, {
    ok: false,
    code: "manual_cleanup_outcome_audit_required",
    message:
      "Manual cleanup may have run, but the required failure audit event could not be recorded.",
    limit: 5,
  });
  assert.doesNotMatch(JSON.stringify(result), /database|stack|service_role|secret|token/i);
});

test("manual cleanup reports normal failure when failed audit records", async () => {
  const auditEvents: Array<Record<string, unknown>> = [];

  const result = await runManualProofCleanupWithAuditPrecondition({
    access: AUTHORIZED_RUN_ACCESS,
    limit: 5,
    confirmation: PROOF_CLEANUP_RUN_CONFIRMATION,
    storageAdminConfigured: true,
    recordAudit: async (event) => {
      auditEvents.push(event as unknown as Record<string, unknown>);
      return { recorded: true, skipped: false };
    },
    runCleanup: async () => {
      throw new Error("storage internals should not leak");
    },
  });

  assert.deepEqual(
    auditEvents.map((event) => event.eventType),
    ["proof_cleanup.manual_requested", "proof_cleanup.manual_failed"],
  );
  assert.deepEqual(result, {
    ok: false,
    code: "manual_cleanup_failed",
    message: "Manual cleanup could not run.",
    limit: 5,
  });
  assert.doesNotMatch(JSON.stringify(result), /storage internals|database|stack|service_role|secret|token/i);
});

test("proof cleanup controls action is server-only and invokes only the reviewed cleanup helper", () => {
  const actionSource = readFileSync(
    new URL("../../src/lib/admin/proofCleanupControls.ts", import.meta.url),
    "utf8",
  );
  const coreSource = readFileSync(
    new URL("../../src/lib/admin/proofCleanupControlsCore.ts", import.meta.url),
    "utf8",
  );
  const source = `${actionSource}\n${coreSource}`;

  assert.match(actionSource, /"use server"/);
  assert.match(actionSource, /runManualProofCleanupWithAuditPrecondition/);
  assert.match(source, /operator\.run_proof_cleanup/);
  assert.match(source, /cleanupExpiredVerificationProofsForOps/);
  assert.match(source, /proof_cleanup\.manual_requested/);
  assert.match(source, /proof_cleanup\.manual_completed/);
  assert.match(source, /proof_cleanup\.manual_denied/);
  assert.match(source, /proof_cleanup\.manual_failed/);
  assert.match(source, /manual_cleanup_audit_required/);
  assert.match(source, /manual_cleanup_outcome_audit_required/);
  assert.match(source, /auditWasRecorded/);
  assert.doesNotMatch(source, /storage\.from|remove\(|storage_path|storage_bucket|signed_url|public_url|filename/i);
  assert.doesNotMatch(source, /request_id|evidence_id|bucket|path|object/i);
});

test("proof cleanup page separates monitoring and manual run scopes", () => {
  const source = readFileSync(
    new URL("../../app/app/admin/proof-cleanup/page.tsx", import.meta.url),
    "utf8",
  );
  const monitorLoadIndex = source.indexOf("getProofCleanupMonitoringForOperator");
  const runActionIndex = source.indexOf("runProofCleanupForOperatorAction");

  assert.match(source, /PROOF_CLEANUP_MONITORING_SCOPE/);
  assert.match(source, /PROOF_CLEANUP_RUN_SCOPE/);
  assert.match(source, /operatorCanMonitor/);
  assert.match(source, /operatorCanRunCleanup/);
  assert.match(source, /PROOF_CLEANUP_RUN_CONFIRMATION/);
  assert.match(source, /name="confirmation"/);
  assert.match(source, /name="limit"/);
  assert.match(source, /audit_not_recorded/);
  assert.match(source, /outcome_audit_not_recorded/);
  assert.match(source, /eligible expired proof files only/i);
  assert.ok(monitorLoadIndex >= 0);
  assert.ok(runActionIndex >= 0);
  assert.doesNotMatch(source, /name="bucket"|name="path"|name="storage_path"|name="filename"|name="evidence_id"/i);
  assert.doesNotMatch(source, /viewVerificationProofAction|createSignedUrl|signed_url|storage_path/i);
});

test("proof cleanup manual controls migration extends the event taxonomy and monitoring allowlist", () => {
  const migrationsDir = new URL("../../supabase/migrations/", import.meta.url);
  const migrationName = readdirSync(migrationsDir).find((name) =>
    name.endsWith("_add_operator_manual_proof_cleanup_controls.sql"),
  );

  assert.ok(migrationName, "expected manual proof cleanup controls migration");

  const sql = readFileSync(
    new URL(`../../supabase/migrations/${migrationName}`, import.meta.url),
    "utf8",
  );

  assert.match(sql, /drop constraint if exists security_events_event_type_check/i);
  assert.match(sql, /proof_cleanup\.manual_requested/i);
  assert.match(sql, /proof_cleanup\.manual_completed/i);
  assert.match(sql, /proof_cleanup\.manual_denied/i);
  assert.match(sql, /proof_cleanup\.manual_failed/i);
  assert.match(sql, /create or replace function public\.list_proof_cleanup_events_for_operator/i);
  assert.match(sql, /invalid_cleanup_event_type/i);
  assert.match(sql, /public\.sanitize_operator_audit_metadata\(event_row\.metadata\)/i);
  assert.match(sql, /verification_evidence\.deletion_scheduled/i);
  assert.match(sql, /verification_evidence\.deleted/i);
  assert.match(sql, /verification_evidence\.deletion_failed/i);
  assert.match(sql, /proof_cleanup\.monitor_viewed/i);
  assert.doesNotMatch(sql, /storage\.objects|verification_evidence\s+set|delete from public\.verification_evidence/i);
  assert.doesNotMatch(sql, /'storage_path'|'storage_bucket'|'signed_url'|'public_url'|'filename'|'proof_file_contents'|'proof_text'/i);
});
