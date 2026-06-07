# E05 Operator Grant Management Runtime Pass

Date: 2026-06-07

Baseline commit: `835972c fix: redact operator grant audit identifiers`

## Summary

The post-bootstrap operator grant management path is runtime-proven for the
linked stable beta runtime through the existing `grant_operator_access(...)`
operator RPC path used by `/app/admin/operator-access`.

This pass proves that an existing operator with
`operator.manage_operator_access` can grant the minimal
`operator.internal_private_app_access` scope to an existing account, duplicate
active grants are handled safely, non-operators are denied, and resulting
audit/security metadata remains redacted.

## Migration

Applied migration SQL:

- `supabase/migrations/20260607103000_redact_operator_grant_audit_metadata.sql`

Runtime migration history records the applied migration by the redaction
migration name. The SQL is active in the linked runtime and the redaction
function covers normalized target/user identifier keys, including camelCase
`userId` input after normalization.

## Runtime Proof

Safe boolean runtime checks confirmed:

- Stable beta loads.
- `/app/admin/operator-access` is protected behind authentication.
- At least one active operator has the expected founder/admin-style internal
  and manage-operator scopes.
- An existing operator with `operator.manage_operator_access` can grant
  `operator.internal_private_app_access` to an existing account.
- The granted account receives an active `operator.internal_private_app_access`
  scope.
- A duplicate active grant attempt returns a safe idempotent result.
- A non-operator grant attempt is denied.
- An account with only `operator.internal_private_app_access` is expected to
  enter the private app through `operator_internal`.
- That account cannot manage operator access without
  `operator.manage_operator_access`.

## Audit And Redaction

Runtime checks confirmed bounded audit/security-event behavior:

- Grant, duplicate-grant, and denied non-operator attempts produced expected
  security-event coverage.
- Grant audit metadata does not expose raw target identifier metadata keys.
- Duplicate-grant audit metadata does not expose raw target identifier metadata
  keys.
- Denied non-operator audit metadata does not expose raw actor or target
  identifier metadata keys.
- Top-level security-event user references are masked/redacted by the
  application sanitizer path.

No private emails, user UUIDs, operator UUIDs, secrets, tokens, auth links,
confirmation links, plaintext account codes, work-email verification codes, or
invite codes are included in this note.

## Boundary Checks

Runtime checks confirmed the grant path did not:

- grant beta access
- mark the account as `airline_email_verified`
- create airline-worker eligibility
- issue role claims
- issue base claims
- issue restricted-board claims
- change work-email verification behavior
- reintroduce proof upload, badge upload, document upload, or proof review
- implement baseboards or community features

Founder/admin internal private-app access remains separate from airline-email
eligibility and separate from beta access.

## Caveat

This runtime pass exercised the production RPC/action path with authenticated
runtime context simulation and safe database checks. It did not perform a
browser-authenticated form submission from a live operator session because this
task did not use or print private credentials. The protected route itself was
confirmed behind auth, and the server-side grant/deny/audit behavior used by the
page was runtime-proven.

## Result

The post-bootstrap operator grant management path can now be treated as
runtime-proven for Epoch 5 handoff purposes, with the caveat above.

Recommended next ticket:

- Create the final Epoch 5 handoff index and then move planning focus to the
  next community-access/moderation lane.
