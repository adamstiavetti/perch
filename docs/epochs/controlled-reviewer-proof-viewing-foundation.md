# Controlled Reviewer Proof Viewing Foundation

## Purpose

This implementation adds the first bounded reviewer proof-viewing path for `jmpseat`.

It allows an authorized reviewer to request short-lived access to a submitted redacted proof file without adding:

- public bucket access
- broad Storage read or list policies
- proof previews in the queue
- persistent download links
- approval automation
- claim issuance changes
- employer-system lookup

## Approach

The foundation follows the approved design:

- server-controlled short-lived signed URL
- server authorization before URL creation
- server-only service-role usage for signed URL minting
- metadata-only reviewer queue with a deliberate `View proof` action
- audited access attempts

TTL is intentionally tight:

- target: `60 seconds`
- hard upper bound in code/tests: `5 minutes`

## Server Authorization Checks

Before a signed URL is minted, the server action verifies:

- reviewer is authenticated
- reviewer has an active reviewer scope
- request exists
- evidence exists
- evidence belongs to the selected request
- reviewer is not the request owner
- request is still in a reviewable state
- evidence type is `redacted_badge_or_proof`
- storage bucket is `verification-proofs`
- storage path exists
- `can_review_verification_request(...)` returns `true`

If any check fails, the flow denies access and returns a safe reviewer-facing error without returning a proof URL.

## Service-Role Posture

The implementation uses a server-only storage admin helper:

- env var: `SUPABASE_SERVICE_ROLE_KEY`
- never exposed through `NEXT_PUBLIC`
- not imported into client components
- not printed
- not persisted in application data

If the service-role key is missing at runtime, proof viewing fails closed with a safe unavailable message.

`.env.example` now includes a placeholder only.

## Audit Events

This slice extends bounded verification security events with:

- `verification_evidence.view_requested`
- `verification_evidence.view_granted`
- `verification_evidence.view_denied`

Safe event metadata may include:

- `verification_request_id`
- `verification_evidence_id`
- `evidence_type`
- `status`
- `reason_code`

Event metadata does not include:

- storage path
- signed URL
- public URL
- raw filename
- proof contents
- OCR text
- employee IDs
- badge numbers
- barcode or QR data
- secrets or tokens

## Reviewer UI

The reviewer queue now adds a bounded `View proof` action for proof evidence rows only.

The queue still does not show:

- storage path
- storage bucket
- signed URL
- public URL
- preview
- download button
- proof content in HTML

Reviewer copy now makes the operational boundary explicit:

- access is short-lived
- viewing is audited
- do not use employer systems
- viewing proof does not approve the request

## What This Does Not Change

This foundation does not:

- change proof upload behavior
- issue claims
- approve requests automatically
- add AI or OCR
- add employer-system lookup
- add retention automation

`requested_airline` remains routing context only and is still not proof, not a verified claim, and not authorization.

## Remote Handling

Remote migration push is deferred until after review and merge.

This branch does not run `supabase db push`.

## Runtime Validation Needed After Push

After the reviewed migration is applied remotely and the runtime has the server-only service-role key configured, the next runtime pass should verify:

1. authorized airline-scoped reviewer can open `View proof`
2. self-review remains blocked
3. non-authorized reviewer receives deny path only
4. granted access produces short-lived signed URL behavior only
5. denied/granted/requested security events are recorded and sanitized
6. reviewer queue still exposes metadata only outside the deliberate proof-view action
