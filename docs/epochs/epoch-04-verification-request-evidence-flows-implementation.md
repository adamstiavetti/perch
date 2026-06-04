# Epoch 04 Verification Request Evidence Flows Implementation

## Purpose

`E04-T06` connects the existing `/app/verification` surface to the verification request and evidence tables for the bounded `work_email` path.

This ticket implements request/evidence metadata creation only. It does not implement proof upload, reviewer tooling, final approval, or automatic claim issuance.

## What The Work-Email Flow Now Does

The verification surface can now accept a user-submitted work email and, when the domain matches an active approved-domain record, create:

- a `verification_requests` row
- a `verification_evidence` row for the `work_email` method

The flow:

- requires an authenticated current user
- keeps work email separate from login email
- validates email shape
- extracts the domain
- checks the domain against `approved_email_domains`
- blocks unsupported or disabled domains
- blocks duplicate active work-email requests
- refreshes the `/app/verification` page after submission through redirect-based route reload

## How Approved Domains Are Used

The flow uses the existing `approved_email_domains` table only.

Current behavior:

- only `status = active` domain records are eligible
- no domains are hard-coded in application code
- no real airline domains were seeded or guessed
- if no matching approved domain exists, the flow returns an unsupported-domain message and creates no rows

## What Happens For Unsupported Domains

Unsupported or disabled work-email domains do not create any verification rows.

The user sees a bounded message:

- only approved airline-controlled domains can start this path
- unsupported domains do not imply account failure, profile failure, or beta failure

Invalid email shapes also do not create any rows.

## Request Row Behavior

For a supported active domain, the flow creates a `verification_requests` row with:

- `user_id = current user`
- `status = submitted`
- `method = work_email`
- `requested_claim_types = ['airline_worker']`
- `requested_claim_types = ['airline_worker', 'airline']` when the approved-domain record includes an airline value
- `submitted_at = now()`

Duplicate handling:

- if an active work-email request already exists and already has work-email evidence metadata, the flow does not create another request
- if an active work-email request exists but its work-email evidence metadata row is missing, the flow repairs that state by attaching the missing evidence row instead of creating a second request

## Evidence Row Behavior

For a supported active domain, the flow creates a `verification_evidence` row with:

- `user_id = current user`
- `request_id = created request id` or the existing active request id when repairing a missing evidence row
- `evidence_type = work_email`
- `status = submitted`
- `uploaded_at = now()`
- `storage_bucket = null`
- `storage_path = null`
- metadata only

## What Metadata Is Stored

Current work-email evidence metadata stores only:

- `email_domain`
- `airline`
- `verification_method`
- `source`
- `support_result`

Current values are intentionally non-sensitive and operationally minimal.

## What Metadata Is Not Stored

The work-email evidence metadata does not store:

- raw full work email
- email local-part
- employee IDs
- badge numbers
- barcode or QR content
- raw extracted proof text
- badge/proof contents
- file/blob data

## Claims And Approval Boundaries

This ticket does not create:

- `verification_claims`
- reviewer actions
- automatic claim issuance
- automatic final approval

Submitting a work-email verification request starts tracking only. It does not grant verified status, beta access, or room access.

## `/app/verification` Surface Changes

The verification page now includes:

- a live work-email form
- approved-domain guidance
- private/not-public work-email copy
- success and failure messages after submission
- status refresh after redirect

The redacted-proof path remains disabled and copy-only in this ticket.

## What This Ticket Does Not Implement

This ticket does not add:

- custom email-code delivery
- proof upload
- Supabase Storage buckets
- reviewer/admin dashboard
- human review queue
- AI pre-check
- automatic claim issuance
- claims-based room or board access

## What Remains Later

### E04-T07

- human review queue foundation
- reviewer actions and bounded internal review flows

### E04-T08

- verification-specific security-event lifecycle expansion
- request/review audit event coverage

### E04-T09

- claims-based authorization preparation for future protected areas

### E04-T10

- validation, handoff, and final Epoch 04 review
