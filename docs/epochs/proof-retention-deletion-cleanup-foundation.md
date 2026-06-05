# Proof Retention Deletion Cleanup Foundation

## Purpose

This slice adds the first server-only cleanup foundation for raw redacted proof files in the private `verification-proofs` bucket.

It does not add a scheduler, cron route, Edge Function, UI delete control, reviewer delete action, or any product-facing retention automation yet.

## What Changed

The foundation introduces:

- a server-only cleanup entrypoint for expired redacted proof evidence
- a testable cleanup core for batch selection, deletion ordering, idempotency, and summaries
- security-event taxonomy for proof deletion lifecycle events
- a proof-view guard that denies access after `verification_evidence.deleted_at` is set
- focused tests for successful deletion, missing-object idempotency, failure behavior, sanitized audit metadata, and deleted-proof view denial

## Cleanup Eligibility

The cleanup helper targets only evidence rows that are:

- `evidence_type = redacted_badge_or_proof`
- `storage_bucket = verification-proofs`
- `storage_path is not null`
- `delete_after <= now`
- `deleted_at is null`

The batch limit defaults to 25 and is capped at 100.

## Deletion Ordering

The cleanup order is intentionally conservative:

1. Find eligible evidence rows.
2. Record `verification_evidence.deletion_scheduled`.
3. Delete the object from private Storage, or treat a missing object as idempotently removable.
4. Set `deleted_at` only after Storage deletion succeeds or the object is confirmed missing.
5. Record `verification_evidence.deleted`.

If Storage deletion fails, the helper:

- leaves `deleted_at` null
- records `verification_evidence.deletion_failed`
- returns the row as failed so a future run can retry

If the Storage object is already missing, the helper:

- sets `deleted_at`
- records deletion with reason `object_already_missing`
- counts the row separately from normal deletes

## Cleanup Summary

The helper returns a bounded operational summary:

- `scannedCount`
- `deletedCount`
- `missingCount`
- `failedCount`
- `skippedCount`

The summary does not include Storage paths, filenames, signed URLs, public URLs, proof contents, employee IDs, badge numbers, barcodes, QR data, OCR text, or secrets.

## Audit Events

The migration extends the `security_events` event-type constraint with:

- `verification_evidence.deletion_scheduled`
- `verification_evidence.deleted`
- `verification_evidence.deletion_failed`

Allowed deletion-event metadata:

- verification request id
- verification evidence id
- evidence type
- status
- `delete_after`
- `deleted_at`
- reason code

Deletion-event metadata must not include:

- Storage path
- Storage bucket
- signed URL
- public URL
- raw filename
- proof contents
- OCR text
- employee ID
- badge number
- barcode or QR data
- secrets, tokens, or passwords

The security-event sanitizer was also hardened to strip generic token and service-role-key metadata keys.

## Proof Viewing After Deletion

Controlled reviewer proof viewing now fails closed when `deleted_at` is set on an evidence row.

The denied reason code is:

- `proof_deleted`

No signed URL is generated after deletion.

## Server-Only Posture

The production cleanup entrypoint is server-only and uses the existing service-role Storage helper.

The cleanup foundation does not expose:

- browser/client-side deletion
- public routes
- reviewer queue deletion controls
- signed URLs
- public URLs
- previews
- persistent downloads

## Migration

Created migration:

- `20260605003656_extend_security_events_for_proof_deletion.sql`

The migration only extends the security-event taxonomy. It does not create Storage policies, SQL cleanup functions, cron jobs, Edge Functions, or app tables.

Remote migration push is deferred until after review/merge.

## Runtime Validation Still Needed

After review/merge and migration push, validate with dummy proof only:

1. Upload a dummy redacted proof.
2. Set its `delete_after` to a past timestamp in a controlled test fixture.
3. Run the cleanup helper from a server-only/operator path.
4. Confirm the Storage object is deleted.
5. Confirm `deleted_at` is set.
6. Confirm deletion events are recorded and sanitized.
7. Confirm proof viewing is denied with `proof_deleted`.
8. Confirm a missing object is marked deleted with `object_already_missing`.
9. Confirm a Storage deletion failure leaves `deleted_at` null and is retryable.

## Out Of Scope

This slice does not add:

- scheduled cleanup automation
- cron
- Edge Functions
- SQL cleanup functions
- UI delete controls
- reviewer proof deletion
- proof upload changes
- proof viewing redesign
- AI or OCR
- automatic approval
- employer-system lookup
- community features
- mobile scaffold
- custom SMTP or auth email branding

## Recommended Next Slice

Add one explicit trigger path for this cleanup foundation:

- Supabase Edge Function scheduled job, or
- protected Vercel Cron/operator route

That slice should remain server-only, idempotent, batch-limited, and audited.
