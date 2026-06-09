# FBMVP-T07 Verified Lounge Access Foundation

Date: 2026-06-09

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Purpose

This note records the local implementation scope for `FBMVP-T07: Verified
Lounge Membership + Access Request Foundation`.

T07 builds on the runtime-applied T05 board model and runtime-applied/hardened
T06 Home Base / Board Follow foundation. It adds the data foundation for
restricted Verified Lounge membership, access requests, request-scoped
comments, and scoped Crew Lead grants.

T07 does not build dashboard UI, request UI, Crew Lead panel UI, posts,
comments, search, saves, reactions, moderation, AI, marketplace/deals, or a
full direct-message system.

## 2. Implemented Scope

T07 adds one local migration:

- `20260609220055_create_lounge_access_foundation.sql`

The migration creates:

- `lounge_memberships`
- `lounge_access_requests`
- `lounge_request_comments`
- `lounge_admin_grants`

`lounge_memberships` stores approved or revoked membership for restricted
Verified Lounge boards. Active membership is the T07 access truth for future
restricted lounge content. Request rows, Home Base, board follows, and
self-declared profile fields do not grant lounge access.

`lounge_access_requests` stores a user's request to join a restricted lounge.
Requesting access does not grant access. The table keeps request history and
uses a partial unique index to prevent multiple active pending requests for the
same user and board while allowing prior denied/approved/withdrawn history.

`lounge_request_comments` stores limited access-review comments attached to a
specific access request. It is a request thread model, not full direct
messaging or chat.

`lounge_admin_grants` stores board-scoped Crew Lead authority. The table uses a
neutral internal name while product copy should say `Crew Lead`.

## 3. Constraints

Membership status is constrained to:

- `active`
- `revoked`

Access request status is constrained to:

- `pending`
- `approved`
- `denied`
- `withdrawn`

Request comment visibility is constrained to:

- `request_participants`
- `operator_review`

Crew Lead grant status is constrained to:

- `active`
- `revoked`

T07 intentionally does not add optional future request states such as
`expired`. Those can be added in a later migration when the product behavior is
ready.

## 4. RLS And Client Access

RLS is enabled on all four T07 tables.

The migration grants authenticated users `select` only. It does not add direct
client insert, update, delete, or upsert policies.

Read policies are scoped as follows:

- users can read their own lounge memberships
- users can read their own lounge access requests
- requesters can read comments on their own requests
- Crew Leads can read memberships, requests, and request comments for boards
  where they have an active scoped grant
- users can read only their own active Crew Lead grants

No anon policies are added.

No `using (true)` or permissive public policies are added.

Mutations for request creation, request review, membership activation,
revocation, and request comments should use later server-side/RPC-controlled
paths with audit events.

## 5. Authorization Boundary

Verified Lounge access must come from active lounge membership.

The following do not grant lounge access:

- Home Base
- board follows
- lounge access request rows
- self-declared profile fields
- work-email verification by itself

Work-email verification remains the broad aviation-worker eligibility gate.
Approved lounge membership remains separate.

Approved membership does not publicly verify a user's airline, role, or base
unless a separate verified badge model is approved later.

Crew Lead grants are scoped to specific boards/lounges. They do not grant
platform operator/admin access, proof-system access, waitlist metrics access,
or unrelated moderation powers.

## 6. Deferred Scope

The following remain later tickets:

- server-side request creation action/RPC
- server-side approval/denial/revocation action/RPC
- request comment mutation path
- audit events for request creation, approval, denial, revocation, and request
  messages
- request UI
- Crew Lead panel UI
- dashboard Your Lounges cards
- restricted lounge content route gates
- posts/comments inside lounges
- moderation/reporting tools
- operator escalation tools for abuse or Crew Lead misconduct
- rate limits and cooldowns for repeat requests/messages
- AI-assisted summaries

AI must not make final approval or denial decisions.

Proof uploads remain deprecated/out of current scope.

## 7. Validation

Local validation for this branch should include:

- `node --test test/community/loungeAccessFoundation.test.mts`
- `node --test test/community/loungeAccessFoundation.test.mts test/community/homeBaseBoardFollows.test.mts test/community/baseBoardModel.test.mts`
- `git diff --check`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

Runtime migration apply is pending after review/merge and must use targeted
apply only. Do not run broad `supabase db push`.
