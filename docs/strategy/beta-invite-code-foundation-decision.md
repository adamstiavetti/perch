# Beta Invite-Code Foundation Decision

Brand note: jmpseat is the canonical product and app name. This decision note
does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Decision Summary

Private beta access should be controlled by batch-generated, single-use invite
codes.

Invite codes are private testing capacity controls only. They do not prove
airline eligibility, worker status, role, base, restricted-board membership, or
community-admin authority.

Confirmed approved airline employee email remains required for private testing
and launch access. A beta invite code must never bypass airline-email
verification.

Invite codes should not be required for `first_base_launch` or
`broader_launch` general access. After launch, the invite system may remain only
for internal tests, unreleased features, or other explicitly scoped controlled
rollouts.

This document is planning only. It does not implement invite codes, change the
current app gate, create migrations, or remove beta access.

## 2. Definitions

- Beta invite code: A random, private code that can be redeemed once by default
  to grant beta access during controlled testing.
- Invite batch: A group of generated invite codes with a shared label, status,
  quantity, creator, creation time, optional expiry, and optional notes.
- Redemption: The server-side action that validates a code, marks it redeemed,
  and grants beta access if all requirements pass.
- Beta access: A temporary rollout-control state used to admit selected testers
  while the product is unfinished. It is separate from authentication,
  profile completion, airline-email verification, and board access.
- `private_testing`: The launch mode where app access requires login, required
  onboarding/profile state, airline-email verification, and active beta access.
- `internal_test`: A controlled mode for unreleased features or internal test
  surfaces. Unless explicitly changed later, it should preserve airline-email
  verification and beta/invite access requirements.
- `first_base_launch`: The first launched base mode where the launched
  population should not need one-by-one invite codes for general app access.
- `broader_launch`: A broader launch mode where beta access is removed from the
  general app gate while airline-email verification remains required.
- Airline-email verified user: A user who has confirmed control of an approved
  airline employee email.
- Invited tester: A user who has received or redeemed a beta invite code, or who
  has otherwise been granted active beta access for controlled testing.

## 3. Recommended Beta Invite Model

Operators should generate invite codes in bounded batches, such as 25, 50, or
100 codes.

Codes should be single-use by default, random, non-personal, and not derived
from an email address, name, airline, base, or other user attribute.

Trusted people may hand out codes, but total growth remains controlled by the
batch size. This allows jmpseat to give trusted contacts a handful of codes
without giving them broad admin authority.

Codes should be stored hashed after creation. Plaintext codes should be shown
or exported only once at generation time if a later implementation supports a
secure one-time export flow.

Codes may expire and may be revoked before redemption. Batches may have optional
labels or campaign names so operators can understand which testing wave a code
belongs to without embedding sensitive information in the code itself.

## 4. Access Rule

During `private_testing`, app access should require:

- authenticated login
- required profile or onboarding state
- confirmed approved airline employee email
- redeemed invite code or separately active beta access

An invite code alone must never grant app access.

Airline-email verification alone must not grant app access in `private_testing`
because private testing still uses beta access as a capacity-control gate.

Beta invite code redemption plus airline-email verification may grant beta
access during `private_testing`, subject to all other account and profile gates.

`first_base_launch` and `broader_launch` should not require invite codes for
launched or general app access. The launch gate should continue to require
confirmed approved airline employee email.

## 5. Redemption Flow

Recommended redemption flow:

- User creates or logs into a stable account.
- User verifies an approved airline employee email.
- If the active mode is `private_testing` and the user lacks beta access, the
  user is routed to an access-hold or beta invite screen.
- User enters the invite code.
- Server validates that the code exists, is active, is not redeemed, is not
  expired, satisfies any optional constraints, and that the user has the
  required airline-email verification state if that is required before
  redemption.
- On success, the code is marked redeemed, beta access is granted with source
  `invite_code`, and the user can proceed through the normal app gate.
- On failure, the user receives a safe generic error that does not reveal code
  inventory details.

Redemption should be server-side. Client code must not receive invite inventory,
hashes, batch internals, or existence/expiry/redeemed-state details that help
enumeration.

## 6. Batch Behavior

Invite batches should support:

- name or label
- status
- quantity
- creator
- creation time
- optional expiry
- optional notes

Recommended batch statuses:

- `active`
- `paused`
- `closed`
- `revoked`

Pausing, closing, or revoking a batch should stop unredeemed codes from being
redeemed. Already redeemed beta access should follow the separate beta-access
status lifecycle unless a later implementation explicitly revokes those grants
too.

Redeemed codes should remain traceable to their batch for operator counts,
audit, and growth analysis. A safe label example is
`DFW_PRIVATE_TEST_WAVE_1`.

## 7. Future Data Model Recommendation

A later reviewed implementation may add `beta_invite_batches` with fields such
as:

- `id`
- `name`
- `status`: `active`, `paused`, `closed`, or `revoked`
- `quantity`
- `created_by`
- `created_at`
- `expires_at`, nullable
- `notes`, nullable
- `allowed_domain`, nullable optional future constraint
- `allowed_airline`, nullable optional future constraint
- `allowed_base`, nullable optional future constraint

A later reviewed implementation may add `beta_invite_codes` with fields such
as:

- `id`
- `batch_id`
- `code_hash`
- `status`: `active`, `redeemed`, `revoked`, or `expired`
- `max_redemptions`, default `1`
- `redeemed_count`
- `redeemed_by_user_id`, nullable
- `redeemed_at`, nullable
- `created_at`
- `expires_at`, nullable

The existing or future beta-access record should be able to link back to the
invite source with fields such as:

- `source`: `invite_code`
- `invite_code_id`
- `granted_at`
- `expires_at`, nullable
- `status`: `active`, `revoked`, or `expired`

Do not create this schema in this docs task.

## 8. Code Generation And Security Requirements

Invite codes should be generated with cryptographically secure randomness and
be long enough to resist guessing.

Codes should avoid ambiguous characters where practical. Redemption may
normalize uppercase, trim spaces, and normalize hyphens according to a later
implementation design.

Plaintext codes must not be stored after generation, logged, emitted in audit
metadata, or exposed through operator screens after the one-time generation
view/export.

Stored codes should use a strong hash or keyed hash appropriate for lookup and
comparison. Comparison should be server-side.

Redemption must be rate-limited and abuse-aware. Failure responses should not
distinguish between nonexistent, expired, redeemed, revoked, or otherwise
invalid codes in a way that helps attackers enumerate valid inventory.

## 9. Operator/Admin Behavior

jmpseat operators may generate invite batches, pause batches, close batches,
revoke unredeemed codes, inspect safe counts, and inspect safe status summaries.

Operators should not be able to view plaintext codes after generation unless a
later implementation creates a secure one-time export at generation time.

Invite-code management is platform-operator functionality. It is not a
community-admin function, and it must not grant community admins access to
platform beta controls.

Trusted people may distribute codes outside the app, but that distribution does
not make them operators, reviewers, or community admins.

## 10. Audit/Security Events

Recommended future audit events include:

- `beta_invite.batch_created`
- `beta_invite.batch_paused`
- `beta_invite.batch_closed`
- `beta_invite.code_redeemed`
- `beta_invite.code_revoked`
- `beta_invite.redemption_failed`
- `beta_access.granted_from_invite`
- `beta_access.revoked`

Audit metadata should be safe by default:

- no plaintext invite codes
- no secrets
- no tokens or sessions
- no raw full airline employee email unless a later privacy review explicitly
  approves it
- no unnecessary user-private data
- safe batch or code record references only

Audit events should distinguish operator actions from user redemption attempts
without exposing sensitive identifiers in user-facing surfaces.

## 11. User-Facing Copy

Recommended user-facing copy:

- "Enter your beta invite code."
- "Beta access controls early testing capacity. Airline employee email
  verification is still required."
- "Invite codes do not replace airline-email verification."
- "First-base launch will not require one-by-one beta invite codes for
  launched users."

Avoid copy such as:

- "Invite code verifies airline employment."
- "Invite code grants verified worker status."
- "Invite code grants restricted board access."

Copy should make the two gates legible: beta invite codes control private
testing capacity, while airline employee email verification controls eligibility.

## 12. Relationship To Launch Modes

`private_testing` should require beta access or redeemed invite access plus
`airline_email_verified`.

`internal_test` should require beta access or redeemed invite access plus
`airline_email_verified` unless a later reviewed design explicitly scopes a
different internal-only behavior.

`first_base_launch` should not require invite codes for the launched general
population. It should still require airline-email verification and the
applicable launch population rules.

`broader_launch` should not require invite codes for general access. It should
continue to require airline-email verification unless a future source-of-truth
decision changes the app eligibility model.

The invite system may remain after launch for internal testing or unreleased
features, but it should not become a permanent general-access requirement.

## 13. Abuse And Operational Risks

Risks:

- Codes may be shared more widely than intended.
- Attackers may try guessing or enumerating codes.
- A plaintext export may leak.
- Users may be confused by expired or revoked codes.
- Operators may generate too many codes and accidentally exceed testing
  capacity.
- Users may think an invite code proves airline status.

Mitigations:

- Single-use defaults.
- Hashed code storage.
- Rate-limited redemption.
- Bounded batch sizes.
- Batch pause, close, revoke, and expiry controls.
- Safe user-facing copy.
- Audit events for generation, redemption, revocation, and failures.
- Operator review of batch counts and growth.

## 14. Implementation Implications

Future implementation tasks should include:

- migration for invite batches and codes
- server-side code generation utility
- server-side redemption action
- beta invite screen or access-hold integration
- operator admin UI for batch generation and status inspection
- tests for generation, redemption, rate limiting, authorization, and safe copy
- audit/security events
- abuse controls and safe failure behavior
- docs and operator runbook updates

The implementation must not accept user-supplied authority flags, grant
airline-email verification, grant restricted-board access, or change launch
modes implicitly.

## 15. Non-Goals

This task does not include:

- code changes
- migrations
- invite-code implementation
- app-gate changes
- launch-gate changes
- first-base launch implementation
- community-admin invite management
- restricted-board access
- proof upload
- badge upload
- proof-system deletion
- production deployment

## 16. Open Questions

- Should invite code redemption require airline-email verification first, or
  should it reserve beta access pending airline-email verification?
- Should invite codes expire by default?
- Should beta access granted from invite codes expire by default?
- What batch sizes are allowed for the first testing wave?
- Which operator scope should manage invite batches?
- Should trusted distributors be tracked outside the app, or only via batch
  labels?
- Should secure one-time plaintext batch export be supported at generation
  time?
- Should invite batches support domain, airline, or base constraints in the
  first implementation?
- Should redemption be available during signup, after signup, or only on
  `/app/access-hold`?
- Should one account be allowed to redeem at most one invite code?
- What exact rate limits apply to redemption attempts?
- What safe error copy should be used for invalid, expired, revoked, or already
  redeemed codes?
- What audit events are required before production use?
- Should operators be able to revoke beta access that was already granted from
  a redeemed invite code?

## 17. Source-Of-Truth Statement

This document defines beta invite-code behavior for private testing. It builds
on the airline-email access gate decision and launch-readiness gate transition
plan.

This document does not change the current app gate by itself.

Future implementation must not let invite codes bypass airline-email
verification.

Future implementation must not make invite codes a long-term first-base launch
or broader-launch general-access requirement.

Future implementation must not reintroduce proof upload, badge upload, or
proof-review approval as a private-testing or launch-access gate.
