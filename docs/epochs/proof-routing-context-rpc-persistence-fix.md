# Proof Routing Context RPC Persistence Fix

## Purpose

This fix closes the redacted-proof reviewer-routing persistence bug found during runtime validation.

The runtime sequence showed:

- proof upload UI accepted a requested airline routing value
- the app built proof metadata containing:
  - `requested_airline`
  - `routing_context_source`
- upload succeeded
- request row was created
- evidence row was created
- but the saved `verification_evidence.metadata` row dropped both routing fields

## Root Cause

The app-side proof draft and reviewer queue logic were updated first, but the RPC-backed database write path still used the older function shape:

- `public.create_redacted_proof_verification_submission(...)`

That function still accepted only the original upload metadata inputs and rebuilt `verification_evidence.metadata` without:

- `requested_airline`
- `routing_context_source`

So the routing context was lost between:

- app draft construction
- RPC call
- database metadata persistence

## Fix Summary

This slice adds a narrow migration that redefines the proof-submission RPC to accept and persist routing context safely.

Migration:

- `20260604220401_persist_proof_routing_context_metadata.sql`

The updated RPC now accepts:

- `p_requested_airline`
- `p_routing_context_source`

The server action now passes:

- `draft.evidence.metadata.requested_airline`
- `draft.evidence.metadata.routing_context_source`

## Persisted Metadata

The RPC continues to write the original safe upload metadata:

- `file_size_bytes`
- `mime_type`
- `original_extension`
- `upload_client`
- `redaction_acknowledged`
- `evidence_method`

It now also persists bounded reviewer-routing context:

- `requested_airline`
- `routing_context_source`

## Validation Rules

The RPC now enforces:

- authenticated current user required via `auth.uid()`
- requested airline must be present after normalization
- routing context source must be one of:
  - `profile_claimed_airline`
  - `self_declared`
- request remains:
  - `method = redacted_badge_or_proof`
  - `status = submitted`
  - `requested_claim_types = ['airline_worker']`

It still does not:

- issue claims
- approve requests
- create role/base claims
- use profile fields as proof

## Trust Boundary

`requested_airline` remains:

- routing context only
- self-declared or profile-derived context only
- not verified proof
- not a claim
- not authorization

Reviewer routing may use it to decide queue visibility.

Claim issuance still requires separate reviewer approval and supported evidence logic.

## Metadata Safety

The RPC still does not store sensitive proof metadata such as:

- raw filename
- storage path inside metadata
- proof contents
- OCR text
- employee IDs
- badge numbers
- barcode content
- QR code content
- raw work email
- email local-part

## Reviewer Queue Effect

With the persisted routing context present in `verification_evidence.metadata`, airline-scoped reviewers can now match redacted proof requests using:

- `requested_airline`

That restores the intended runtime behavior without granting:

- proof viewing
- downloads
- signed URLs
- public URLs
- previews

## Security And Scope

This fix does not add:

- proof viewing
- AI
- automatic approval
- employer-system lookup
- community features
- mobile scaffold
- custom SMTP/auth branding

## Remote Migration Status

- The migration is created locally in this branch.
- Remote `db push` is deferred until after review and merge.

## Required Runtime Follow-Up

After remote apply, runtime validation should confirm:

- proof upload still succeeds
- `verification_evidence.metadata` now persists:
  - `requested_airline`
  - `routing_context_source`
- airline-scoped reviewer sees matching proof requests without global scope
- mismatched requested airline remains hidden from unrelated airline-scoped reviewers
- no claim is issued from upload alone
- security events remain sanitized
