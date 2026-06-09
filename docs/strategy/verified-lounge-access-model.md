# Verified Lounge Access Model

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Canonical Definition

A Verified Lounge is a restricted board associated with a base, role, airline,
or other approved aviation-worker criteria.

It is similar to a Facebook group structurally, but with stronger privacy,
moderation, and access boundaries.

A Verified Lounge is not:

- a public feed
- a direct-message system
- proof that a user works for a specific airline, role, or base
- a platform-wide operator/admin surface

Examples:

- DFW Flight Attendants Lounge
- DFW Pilots Lounge
- DFW New Hires Lounge
- DFW Commuters Lounge
- future airline-specific or role-specific lounges if approved

## 2. Access Model

Any verified jmpseat user may request access to a visible/requestable lounge.

Requesting access does not mean the user qualifies.

Lounge access requires approved membership.

The following must not grant lounge access:

- board follows
- Home Base
- self-declared `claimed_airline`
- self-declared `claimed_role`
- self-declared `claimed_base`

Future airline-specific lounges must use verified work-email/domain logic or
explicit Crew Lead/admin approval. Self-declared airline text alone is not
enough.

Work-email verification remains the broad aviation-worker eligibility gate. It
does not grant restricted lounge membership by itself.

## 3. Crew Lead Role

Use `Crew Lead` as the product-facing name for lounge/community admins.

Implementation may use neutral internal names such as:

- `community_admin`
- `board_admin`
- `board_moderator`

Crew Leads are scoped to specific lounges or boards. They must not receive
operator/admin access to platform-wide systems, proof systems, waitlist
metrics, unrelated moderation tools, or unrelated lounges merely because they
manage one lounge.

Crew Leads cannot approve themselves into unrelated lounges and cannot grant
platform/operator roles.

## 4. Request Lifecycle

Canonical lounge access states:

- `not_requested`
- `pending`
- `approved`
- `denied`
- `revoked`

Optional later states:

- `expired`
- `withdrawn`

### Pending UX

When a request is pending:

- the user sees "Request pending."
- the user can view their request status
- the user may add a limited follow-up message if needed
- the user does not see lounge content until approved

### Denied UX

When a request is denied:

- the user sees "Request denied."
- the denial is private to the user and Crew Leads/operators
- the denial is not public and is not visible on the user's profile
- the denial may include an optional reason category or generic copy
- re-request behavior should be configurable later, possibly with a cooldown

### Approved UX

When a request is approved:

- the user becomes a lounge member
- the lounge appears in Your Lounges
- the user can view, post, and comment according to that lounge's rules

Approval does not publicly verify the user's airline, role, or base unless a
separate verified badge model is approved later.

### Revoked UX

When access is revoked:

- the user loses access
- revocation is audited
- handling of the user's existing lounge content should be defined later by
  moderation policy

## 5. Request Thread Model

The request conversation model is not a full direct-message or chat system.

Use "request thread" or "request comments" for limited messages attached to a
specific lounge access request.

Requester and Crew Leads can exchange limited messages about access. The
thread is scoped to that request only and must not become general private
messaging.

Request threads should be auditable and visible to operators if needed for
abuse or safety review.

## 6. Crew Lead Visibility

Minimum information visible to Crew Leads for a lounge request:

- public handle
- display name if the product uses one
- account email, or preferably email domain / verified work-email status
- verified work-email domain/status if available
- self-declared airline, role, and base, clearly labeled as self-declared
- request message
- request history/status for that lounge
- any prior denial or revocation for that lounge

Information Crew Leads should not see by default:

- proof uploads or documents
- private verification artifacts
- unrelated account security data
- unrelated lounge memberships
- private messages outside the request thread
- full platform admin notes
- sensitive internal audit details
- exact live location or schedule data
- passenger/private company information

## 7. Crew Lead Panel

Crew Leads should have a scoped Lounge Review panel for lounges they manage.

The panel should show:

- pending requests
- approved members
- denied/revoked history
- request threads

The panel must be scoped by lounge/board membership admin rights.

Crew Lead tooling must remain separate from platform operator/admin tooling.

## 8. Safety And Audit Requirements

The following actions should be auditable:

- request creation
- request approval
- request denial
- access revocation
- request-thread messages

An operator escalation path should exist later for abuse, safety issues, or
Crew Lead misconduct.

Rate limits or cooldowns should be considered for repeat requests and request
messages.

AI must not make final approval or denial decisions. AI may assist
summarization later only if that use is admin-reviewed and privacy-reviewed.

## 9. Dashboard Relationship

Your Lounges on the Home Dashboard should show approved lounges first.

Pending requests may appear as pending cards.

Available or requestable lounges may appear later, but they should not
overwhelm Home.

Users who are not lounge members must not see restricted lounge content.

See `docs/strategy/home-dashboard-product-definition.md` for the Home
Dashboard hierarchy and `docs/strategy/base-board-product-definition.md` for
how Verified Lounges relate to Base Boards.

## 10. T07 Foundation

`FBMVP-T07` adds the local schema foundation for:

- lounge memberships
- lounge access requests
- request-scoped comments
- board-scoped Crew Lead grants

The implementation uses neutral internal table names such as
`lounge_admin_grants` while keeping `Crew Lead` as the product-facing role
name.

T07 is schema/RLS foundation only. Request creation, approval, denial,
revocation, request comments, Crew Lead panel UI, and dashboard lounge cards
remain later server/UI work.

## 11. Out Of Scope

This document does not implement:

- migrations
- lounge membership tables
- access request tables
- request UI
- Crew Lead panel UI
- full messaging or direct messages
- AI approval or denial
- proof uploads
- automatic airline, role, or base verification
- public verified badge behavior
- posts/comments
- moderation tooling
- runtime data changes

Implementation must preserve the existing rule that proof uploads are
deprecated/out of current scope.
