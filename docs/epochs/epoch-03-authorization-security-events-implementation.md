# Epoch 03 Authorization Security Events Implementation

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

## Purpose

This note records what `E03-T07` implemented for the bounded authorization-baseline and security-event slice.

This implementation is intentionally narrow:

- it adds a minimal server-recorded `security_events` foundation
- it makes the current auth, profile, beta, and private-route baseline explicit
- it records key auth and private-access decisions without turning them into page-view analytics
- it does not add an admin dashboard
- it does not add moderation workflows
- it does not add worker verification

## Authorization Baseline

The current explicit authorization baseline is:

- `/` remains public waitlist marketing
- `/login`, `/signup`, `/reset-password`, and `/auth/callback` remain public auth surfaces
- `/app/profile` requires authentication but is not beta-gated
- `/app/access-hold` requires authentication plus a complete profile and remains for non-active beta states
- `/app` and known private child routes require:
  - authenticated account
  - complete profile
  - active beta access
- unknown `/app/[section]` routes still return `404`
- `/app/verification` remains a gated placeholder only and does not implement worker verification
- `/app/admin` remains a gated placeholder only and does not implement an admin dashboard

Current exposed-table baseline:

- `profiles` has owner read/write RLS
- `beta_access` has owner read RLS and no self-service user write path
- `security_events` is server-recorded and not publicly readable

## Security Event Model Added

`E03-T07` adds:

- `public.security_events`
- server-only event taxonomy helpers under `src/lib/securityEvents/`
- fail-soft event recording from server actions, route handlers, and private-route gate surfaces

The event table stores:

- optional `user_id`
- `event_type`
- `route`
- `result`
- minimal `metadata`
- `created_at`

The table includes:

- event-type constraint
- indexes for `user_id`, `event_type`, `created_at`, and `(user_id, created_at desc)`
- RLS with no normal-user read policy

Current write baseline:

- event writes happen only from server-side app code in this slice
- there is no browser/client helper for arbitrary event insertion
- there is no public route that accepts arbitrary event payloads

This is still a baseline, not a final security-log ingestion architecture.

## Event Taxonomy In Use

Implemented event types:

- `auth.sign_in_attempt`
- `auth.sign_in_success`
- `auth.sign_in_failed`
- `auth.sign_up_attempt`
- `auth.sign_up_success`
- `auth.sign_up_failed`
- `auth.password_reset_requested`
- `auth.password_reset_request_failed`
- `auth.callback_resolved`
- `private_access.redirect_login`
- `private_access.redirect_profile`
- `private_access.redirect_access_hold`
- `private_access.allowed`
- `private_access.storage_not_ready`
- `profile.upsert_attempt`
- `profile.upsert_success`
- `profile.upsert_failed`
- `beta_access.checked`

This slice does not add moderation, upload, verification-review, or community-event logging.

## Metadata Safety Rules

The event helper sanitizes metadata to keep it minimal and operationally useful.

Current rules:

- do not log passwords
- do not log full raw emails
- prefer email-domain-only metadata where needed
- do not log badge or proof-upload data
- do not log employee IDs
- do not log worker-verification evidence
- do not log sensitive airline security or employer-system data

Typical allowed metadata in this slice:

- route path
- result code
- email domain
- next-path value
- bounded route kind
- bounded profile/beta state markers

## Event Recording Integration

Bounded event recording now exists at these key decision points:

- auth sign-in attempt, success, and failure
- auth sign-up attempt, success, and failure
- password-reset request attempt/failure plus request-success confirmation
- auth callback resolution outcomes
- profile save attempt, success, and failure
- beta-access check during post-auth private-app resolution
- private-route gate outcomes for `/app`, known child routes, `/app/profile`, and `/app/access-hold`

This is not page-view analytics:

- no public waitlist visit logging
- no generic public route logging
- no free-form client event stream

## Missing Env And Missing Migration Safety

Local build, test, and docs workflows still run without real Supabase env vars.

Current behavior:

- if Supabase env is missing, event recording no-ops safely
- if the `security_events` migration is not applied, event insertion failure is swallowed
- event logging failure does not grant private access
- event logging failure does not weaken auth, profile, beta, or private-route authorization decisions

Runtime event recording still requires:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- applied `profiles`, `beta_access`, and `security_events` migrations

## What Remains For Later Work

`E03-T07` does not add:

- suspended or disabled account state enforcement workflow
- admin event review UI
- moderation event review UI
- worker verification events
- upload/storage artifact audit events
- privileged server-side ingest with a stronger internal-only write model

Those concerns remain later work.

## Explicitly Not Implemented

- worker verification workflow
- badge/proof upload
- airline email-domain verification
- storage
- AI
- boards, rooms, posts, comments, search, or saves
- moderation dashboard or workflow
- payments
- admin dashboard
- mobile app scaffold

## Separation Boundaries Preserved

This slice continues to preserve:

- waitlist email is not an app account
- auth is not beta approval
- profile completion is not beta approval
- claimed airline/role/base is not worker verification
- beta approval is not airline-worker verification
- later worker verification still belongs to work-email and redacted-proof review paths
- employer-system lookup remains prohibited
- security logging must not expose private user data unnecessarily
