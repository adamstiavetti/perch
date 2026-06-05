# Board / Community Access Model Decision

Brand note: jmpseat is the canonical product and app name. This decision note
does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Decision Summary

General app and general baseboard access should be based on confirmed control
of an approved airline employee email, subject to the temporary private-testing
beta gate until launch-readiness work explicitly changes that gate.

Restricted role/base boards should be controlled by board-level access requests
and community-admin approval. Restricted board approval is not jmpseat global
role/base verification, official employment verification, or employer-backed
identity verification.

Community admins are not sponsored by jmpseat and do not represent airlines,
airports, unions, or employers by virtue of their community role. jmpseat
provides the platform, access-control mechanics, logging, moderation
boundaries, and operator safety controls.

## 2. Definitions

General baseboard:

- A broadly available base or airport board, such as DFW General.
- Available to airline-email verified users once general app access is
  available for the applicable rollout mode.
- Not role-verified and not employer-verified.

Restricted board:

- A board with additional access requirements, such as DFW FA, DFW Pilot, DFW
  Ramp, DFW Mechanics, or DFW Gate Agents.
- Requires a board-level access request and approved board membership.
- Not automatically granted by airline email alone.

Verified board:

- A legacy or user-facing phrase that should be avoided unless clarified.
- If retained, it should mean community-admin approved board membership, not
  jmpseat official role/base verification.

Board membership:

- A board-scoped authorization record that allows a user to access one specific
  board.
- It should not imply a global role, base, airline, or employer claim.

Board access request:

- A request by an airline-email verified user to join a restricted board.
- It can include self-declared context for community-admin review.

Community admin:

- A user granted board/community management authority for a specific restricted
  board or community.
- Community admin access is separate from jmpseat platform operator access.

Board moderator:

- A future board-scoped moderation role that may help manage posts, comments,
  reports, and board norms.
- Board moderator authority should be separate from board access approval unless
  a future policy explicitly combines them.

Board member:

- A user with approved board membership for a specific restricted board.
- Membership does not create a global jmpseat role/base claim.

jmpseat operator:

- A platform operator who manages platform-level settings, safety controls,
  approved email-domain configuration, operator grants, and operational health.
- A jmpseat operator is not automatically a community admin.

Airline-email verified user:

- A user who has confirmed control of an approved airline employee email.
- This status proves broad eligibility only, as defined in
  `strategy/airline-email-access-gate-decision.md`.

Launched base population:

- The user population included in a first-base launch or later launch segment.
- This group should not require one-by-one manual beta grants once the explicit
  launch-readiness gate transition is implemented.

## 3. Board Taxonomy

Recommended MVP board types:

- General baseboard: examples include DFW General or another selected first-base
  general board. These boards are available to airline-email verified users in
  the applicable rollout mode. They should contain base information, general
  questions, answers, discussions, resources, and non-sensitive operational-life
  content.
- Restricted role/base board: examples include DFW FA, DFW Pilot, DFW Ramp, DFW
  Mechanics, and DFW Gate Agents. These boards require a board-level access
  request and community-admin approval. Airline email alone does not grant
  access.
- Future optional airline-specific base board: a board for a specific airline
  at a base if later user research supports that split.
- Future optional topic-specific board: a board for cross-base topics such as
  commuting, training, reserve life, or benefits if moderation and taxonomy
  rules are ready.
- Future optional temporary/event board: a time-bound board for a launch cohort,
  disruption, event, or temporary operational context if retention and
  moderation rules are defined.

## 4. Access Model

Airline-email verification grants general app and general baseboard access,
subject to the current rollout mode.

Restricted board access requires an approved `board_membership` for that
specific board. Recommended membership/request statuses are:

- `requested`
- `approved`
- `denied`
- `revoked`
- `expired`, optional future status

Access is evaluated per board. Approval for one restricted board does not imply
approval for another restricted board. General baseboard access does not imply
restricted board access. Restricted board access does not imply jmpseat operator
access.

Restricted board membership should be revocable. Revoked users should lose
access immediately, subject to later policy for appeal visibility, retained
audit logs, and user notification.

## 5. Community-Admin Model

Community admins manage access to specific restricted boards. They can approve,
deny, or revoke board memberships for boards where they have explicit community
admin authority.

Community admins are not jmpseat platform operators unless separately granted
operator access. They cannot manage approved email domains, operator grants,
platform-level systems, proof cleanup, or jmpseat security tooling.

Community admins are not airline, airport, union, or employer representatives
by virtue of their board role. Their decisions are community access decisions,
not official employment, role, or base verification.

jmpseat should provide audit logs, abuse reporting, operator override, and
safety controls before real board membership decisions affect live communities.
Those controls should be implemented in later reviewed tasks.

## 6. First Community-Admin Bootstrap

The first community admin for a restricted board should be appointed by a
jmpseat operator during early launch.

Appointment should be explicit, logged, and revocable. The initial appointment
should identify the board, the appointed user, the appointing operator, the
timestamp, and a safe reason or launch context.

Later community-admin expansion can be done by existing board admins if the
board policy allows it, or by jmpseat operators. The first person who requests a
board should not automatically become an admin. Community admin should not be
inferred from airline email domain alone.

## 7. Access Request Flow

Recommended restricted-board flow:

1. An airline-email verified user opens a restricted board.
2. If the user is not an approved member, they see a request-access screen.
3. The user submits a board access request.
4. The request can include self-declared context such as role, base, airline,
   seniority range, or a short request message if allowed by policy.
5. The request copy must explain that self-declared context is not jmpseat proof
   review and does not create a platform role/base claim.
6. A community admin reviews the request and approves or denies it.
7. The user receives access only after approval.
8. Denied users may re-request or appeal depending on future policy.
9. Revoked users lose access immediately.

The request flow should not ask users to upload badge images, employment
documents, proof files, storage objects, or other sensitive employer material.

## 8. What Community Admins Can See

Community admins should see only the minimum information needed to decide board
access.

Recommended visible fields:

- display name or handle
- airline-email verified status
- airline or approved-domain-derived airline label, if safe
- self-declared role, base, or airline context
- prior request status for that board
- request message, if allowed

Community admins should not see by default:

- full airline employee email
- login email
- hidden profile data
- proof files
- storage paths
- audit internals
- platform operator notes

If full email, full domain, or more detailed identity visibility is considered
later, it needs a separate privacy decision before implementation.

## 9. Off-App Proof And Evidence

jmpseat should not require or store badge uploads, proof uploads, employment
documents, screenshots, or other sensitive evidence for board access.

Community admins may make community access decisions, but jmpseat should avoid
hosting or requesting sensitive documents. Off-app proof requests should be
discouraged because they create safety, privacy, harassment, and coercion risks
outside the platform.

If off-app proof is allowed later, it requires explicit policy, user-facing
disclaimers, abuse reporting, and operator review paths. It should not be added
implicitly as part of board access implementation.

## 10. Appeals And Abuse Prevention

Users should have a path to report community-admin abuse.

Users should have a path to appeal denied or revoked board access. The first
version can be lightweight, but it should be visible enough that community-admin
decisions do not become unreviewable.

jmpseat operators should be able to suspend or revoke abusive community admins
in a later operator tooling phase. Community-admin actions should be audited.
Repeated deny/revoke patterns should be inspectable by jmpseat operators later.

Anti-harassment rules, moderation policy, operator escalation paths, and
community-admin conduct expectations are required before launch with real board
membership decisions.

## 11. Relationship To jmpseat Operators

jmpseat operators manage platform-level settings and safety. Community admins
manage board-specific access and, if later granted, board-scoped moderation.

jmpseat operators can appoint or revoke community admins. Community admins
cannot manage approved email domains, operator grants, reviewer scopes, proof
cleanup, platform audit inspection, or other platform-level systems.

Operator access and community admin access are separate grants. A user can have
one, both, or neither, but one should never imply the other.

## 12. Claims / Access Model

Recommended future concepts:

- `airline_email_verified`
- `board_membership`
- `board_admin`
- `board_moderator`
- `board_access_request`

DFW FA membership means "approved into the DFW FA board by community admins."
It does not mean jmpseat globally verified the user is a current DFW flight
attendant.

Future implementation should not issue global role/base claims from board
membership. Board membership should remain board-scoped unless a later reviewed
decision explicitly changes that model.

## 13. General Baseboard MVP Recommendation

First-base launch should begin with one selected base, likely DFW if later
confirmed by product validation.

Recommended first-base launch community scope:

- one general baseboard
- a small number of restricted boards
- request-access flow
- community-admin approval tooling
- basic posting/question/answer surface if and when forum implementation begins

This decision doc does not implement boards, posts, comments, moderation queues,
or database changes.

## 14. Legal / Trust Language

Required language for future product, docs, and UI work:

- jmpseat is not sponsored by airlines, airports, unions, or employers unless
  explicitly obtained and documented.
- Community admins are not sponsored by jmpseat or airlines.
- Community admins are not airline, airport, union, or employer
  representatives by virtue of board-admin status.
- Airline email confirmation is not employer endorsement.
- Board access is community-managed.
- Restricted board membership is not official employment or role verification.
- Users should not upload sensitive employer documents to jmpseat for this
  model.

## 15. Implementation Implications

Future implementation tasks likely need:

- board data model
- baseboard data model
- board membership table
- board access request table
- community admin role/grant model
- community-admin approval UI
- restricted board route gate
- general baseboard route gate
- community-admin audit events
- abuse report and appeal path
- disclaimer copy
- proof-upload UI freeze/hide plan
- private-beta versus first-base-launch gate switch

Each implementation task should be explicit, reviewed, tested, and scoped. This
decision does not authorize code changes, migrations, board implementation, or
beta-gate removal.

## 16. Non-Goals

This task does not include:

- code changes
- database migrations
- board implementation
- proof-system deletion
- badge upload
- proof upload
- employer-system lookup
- AI/OCR approval
- official airline verification
- global role/base claim issuance
- app route changes
- community-admin tooling implementation
- E05-T08 handoff

## 17. Open Questions

- Which base launches first?
- Is the first launch airport-wide or airline-specific?
- Which restricted boards exist at MVP?
- Who selects the first community admin for each restricted board after the
  initial operator appointment model is reviewed?
- Can community admins appoint other admins?
- Can community admins revoke access without operator review?
- What request information should users provide?
- What can community admins see beyond the recommended minimum fields?
- Are off-app proof requests allowed or prohibited?
- How do appeals work?
- What moderation tools are required before launch?
- How anonymous can users be inside boards?
- Are general baseboards airport-wide, airline-specific, or both?
- How should inactive or lost airline-email status affect existing board
  memberships?

## 18. Source-Of-Truth Statement

This decision defines the forward board/community access model.

It builds on the airline-email access gate decision in
`strategy/airline-email-access-gate-decision.md`.

It supersedes proof-upload role/base verification as the forward approach for
restricted board access.

Existing proof infrastructure remains historical/runtime-applied infrastructure
until separately deprecated.

Future implementation must not add board proof uploads unless explicitly
decided later.
