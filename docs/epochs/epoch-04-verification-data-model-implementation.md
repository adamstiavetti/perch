# Epoch 04 Verification Data Model Implementation

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

## 1. Purpose

`E04-T02` implements the verification data-model foundation only.

This slice adds the first schema layer for verification requests, verification claims, evidence metadata, review-action audit rows, and approved email-domain references.

It does not implement upload flows, storage buckets, work-email verification execution, reviewer UI, AI, or claims-based room access.

## 2. Migration Added

Added:

- `supabase/migrations/20260604154521_create_verification_foundation.sql`

## 3. Tables Added

### `public.verification_requests`

Purpose:

- tracks the verification request lifecycle separately from auth, profile completion, beta access, and final claim issuance

Key fields:

- `user_id`
- `status`
- `requested_claim_types`
- `method`
- `submitted_at`
- `reviewed_at`
- `reviewed_by`
- `expires_at`
- `reason`
- `created_at`
- `updated_at`

### `public.verification_claims`

Purpose:

- stores issued or historical verification claims that later claims-based authorization can use

Key fields:

- `user_id`
- `request_id`
- `claim_type`
- `claim_value`
- `status`
- `verification_method`
- `confidence_level`
- `approved_by`
- `approved_at`
- `expires_at`
- `revoked_by`
- `revoked_at`
- `reason`
- `created_at`
- `updated_at`

### `public.verification_evidence`

Purpose:

- stores metadata only for submitted evidence
- reserves `storage_bucket` and `storage_path` as future storage references without creating upload or bucket behavior in this ticket

Key fields:

- `request_id`
- `user_id`
- `evidence_type`
- `storage_bucket`
- `storage_path`
- `redaction_acknowledged`
- `status`
- `uploaded_at`
- `delete_after`
- `deleted_at`
- `metadata`
- `created_at`
- `updated_at`

### `public.verification_review_actions`

Purpose:

- stores auditable review-action rows for later reviewer flows without implementing reviewer UI in this ticket

Key fields:

- `request_id`
- `claim_id`
- `reviewer_id`
- `action`
- `notes`
- `created_at`

### `public.approved_email_domains`

Purpose:

- provides a schema foundation for later work-email verification
- no seed data and no domain-management UI were added here

Key fields:

- `domain`
- `airline`
- `status`
- `created_at`
- `updated_at`

## 4. Constraints And Indexes

The migration adds:

- explicit status/type/action check constraints for:
  - verification requests
  - verification claims
  - verification evidence
  - verification review actions
  - approved email domains
- request claim-type bounds via `requested_claim_types <@ allowed_types`
- lower-case enforcement for `approved_email_domains.domain`
- indexes for:
  - `user_id`
  - `status`
  - `claim_type`
  - `claim_value`
  - `request_id`
  - `expires_at`
  - reviewer/action queue lookup
  - email-domain status lookup
- shared `updated_at` trigger usage for the mutable verification tables

## 5. RLS Posture

RLS is enabled on all new tables.

Current conservative policies:

- users can read their own `verification_requests`
- users can create their own `verification_requests`
- users can read their own `verification_claims`
- users can read their own `verification_evidence`
- users can create their own `verification_evidence` metadata when it references their own request
- users can read review-action rows tied to their own verification requests

What is intentionally not allowed yet:

- no public access
- no user-created verification claims
- no user-created reviewer actions
- no broad admin/reviewer policy until the reviewer-role model exists
- no self-approval path

## 6. Metadata-Only Evidence Boundary

`verification_evidence` is metadata-only in this ticket.

This foundation explicitly does not store:

- raw file or blob data
- employee IDs
- badge numbers
- barcode data
- QR-code data
- raw extracted proof text

The migration includes a metadata safety check that rejects those disallowed keys from the `metadata` JSON payload.

## 7. Verification Domain Helpers

Added:

- `src/lib/verification/verification.ts`

This file provides:

- verification claim-type constants
- request-status constants
- claim-status constants
- evidence-type constants
- evidence-status constants
- review-action constants
- `isVerificationClaimApproved`
- `isSafeVerificationEvidenceMetadata`

These helpers are pure domain utilities only. No Supabase write helpers or UI surfaces were added.

## 8. What This Ticket Does Not Implement

This ticket does not add:

- upload implementation
- Supabase Storage buckets
- work-email verification code
- badge/proof upload handling
- AI
- human review UI
- admin/reviewer dashboard
- claims-based room access
- community features
- mobile scaffold

## 9. What Remains For E04-T03 Through E04-T10

Later tickets still need to implement or define:

- `E04-T03`
  - work-email verification domain and flow behavior
- `E04-T04`
  - private storage and retention design for redacted proof
- `E04-T05`
  - `/app/verification` user-facing surface
- `E04-T06`
  - verification request and evidence metadata flows
- `E04-T07`
  - human review queue foundation
- `E04-T08`
  - verification-related security events and audit rules
- `E04-T09`
  - claims-based authorization preparation
- `E04-T10`
  - validation and handoff review

## 10. Validation

Validation for this slice should confirm:

- migration file exists
- required tables and constraints exist
- RLS is enabled
- evidence remains metadata-only
- no sensitive proof columns or blob storage were introduced
- no upload/storage/UI/reviewer/AI implementation was added accidentally
