# Verification Transactional Review Action Hardening

## Purpose

This note records the post-Epoch-04 hardening pass that moved the core verification review decision into a transactional database function.

This work was needed because the original bounded reviewer flow applied the core review outcome through multiple sequential app writes:

- request status update
- review action insert
- claim issuance on approval

That was acceptable for the initial foundation, but it left a partial-write risk if one later write failed after an earlier write succeeded.

## What Moved Into The Transactional Function

Added a new migration:

- `supabase/migrations/20260604195441_create_apply_verification_review_decision.sql`

That migration creates:

- `public.apply_verification_review_decision(p_request_id uuid, p_action text, p_reason text default null)`

The function applies the core review decision atomically for:

- verification request status update
- verification review action creation
- bounded claim issuance on approval

The app now calls that RPC instead of performing those core writes independently from application code.

## Authorization And Guard Behavior

The function enforces its own reviewer checks using `auth.uid()` and existing reviewer-scope helpers.

Required guards:

- authenticated reviewer required
- active reviewer scope required
- reviewer scope must authorize the request
- reviewer cannot review their own request
- request must still be in a reviewable state
- only `approve`, `reject`, and `request_resubmission` are supported

This function does not rely on:

- employer systems
- proof storage access
- upload behavior
- self-declared profile fields

## Claim Issuance Bounds

Approval remains intentionally bounded:

- `airline_worker` may be issued for supported approved `work_email` requests
- `airline` may be issued only when safe airline metadata exists from the approved domain mapping

Not issued from work email alone:

- `role`
- `base`

The function also avoids duplicate active approved claim spam by skipping inserts when a matching active approved claim already exists.

## What Remains Fail-Soft Outside The Transaction

Verification security-event logging remains outside the core transaction.

That boundary is intentional:

- authorization and review application must not depend on event recording
- event logging should still fail soft
- a security-event insert failure must not roll back an otherwise valid review decision

Current post-transaction event handling still records:

- review decision outcome
- claim-issued events for any claims returned by the function
- unauthorized and self-review blocked attempts from the existing bounded preflight path

## Security Notes

The function uses:

- `security definer`
- `set search_path = public`

It also explicitly limits execution to authenticated callers.

The function does not add:

- upload support
- Storage integration
- AI behavior
- admin/dashboard expansion
- community features

## Remote Migration Handling

This migration is created locally only in this branch.

No remote `db push` is run in this hardening ticket. Remote application remains deferred until review and merge.

## What Remains Out Of Scope

This hardening pass still does not implement:

- proof upload
- Storage buckets
- proof retention automation
- transactional security-event logging
- full admin tooling
- claim-gated rooms or boards
- custom SMTP or auth-email branding
