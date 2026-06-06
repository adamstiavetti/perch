# Community Admin Responsibilities / Disclaimer Policy

Brand note: jmpseat is the canonical product and app name. This decision note
does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Decision Summary

Community admins are board-level volunteers or trusted members who manage
specific restricted-board access and, where tooling exists, basic moderation for
the boards they manage.

Community admins are not jmpseat employees, not airline representatives, not
employer representatives, and not sponsored by jmpseat or airlines.

Community-admin approval is a community access decision. It is not jmpseat
global role/base verification, official employment verification, or
employer-backed identity verification.

jmpseat provides platform tooling, safety boundaries, audit logs, and operator
escalation paths. Community admins operate inside those boundaries and only for
the boards where they have explicit authority.

## 2. Definitions

Community admin:

- A user explicitly granted board/community management authority for one or
  more specific restricted boards.

Board moderator:

- A board-scoped moderation role that can help enforce content rules if and
  when moderation tooling is implemented.

Board member:

- A user with approved membership for a specific restricted board.

Restricted board:

- A board that requires board-level membership and community-admin approval
  before content is visible.

General baseboard:

- A broad base or airport board available to airline-email verified users in the
  launched population.

Board access request:

- A user request to join a restricted board.

Board membership:

- A board-scoped authorization record that grants access to one restricted
  board.

jmpseat operator:

- A platform operator who manages platform-level safety, approved domains,
  operator grants, global settings, and operational health.

Platform operator:

- Same as jmpseat operator in this policy. The phrase is used to distinguish
  platform-level authority from board-level community authority.

Community decision:

- A board-level access or moderation decision made under community rules. It
  does not create a global jmpseat identity claim.

Official verification:

- A reviewed verification or endorsement by an airline, airport, union,
  employer, or other official institution. Community-admin approval is not
  official verification.

## 3. Community Admin Responsibilities

Community admins may:

- review access requests for boards they manage
- approve access requests
- deny access requests
- revoke board memberships
- review reports for their boards if moderation is included
- hide or remove posts or comments only if moderation tooling is implemented
  and scoped to their board
- escalate abuse or safety issues to jmpseat operators
- help keep board content aligned with board rules

Community admins must:

- apply board rules consistently
- avoid retaliation, harassment, and discrimination
- avoid collecting sensitive documents through jmpseat
- avoid representing themselves as official airline, employer, or jmpseat staff
- avoid implying employer-backed verification
- keep member and request information private
- use tooling only for boards they manage

## 4. Community Admin Limits

Community admins cannot:

- manage jmpseat platform operators
- manage approved email domains
- access platform admin tools unless separately granted platform access
- access raw proof files
- request or view badge/proof uploads through jmpseat
- see full airline employee emails by default
- access hidden audit/security internals
- approve users into unrelated boards
- issue global role/base claims
- claim official employment verification
- claim airline endorsement
- delete arbitrary user data
- bypass platform safety controls

Community admin access must remain separate from jmpseat operator access. A user
can have one, both, or neither, but one role must never imply the other.

## 5. Non-Sponsorship / Disclaimer Language

Required disclaimer principles:

- jmpseat is not sponsored by, endorsed by, or affiliated with airlines,
  airports, unions, or employers unless separately stated in reviewed legal
  copy.
- Community admins are not sponsored by jmpseat.
- Community admins are not airline representatives.
- Community-admin approval is not official role, base, or employment
  verification.
- Airline email confirmation is not employer endorsement.
- Restricted board membership means community-managed access only.

Suggested product copy snippets:

- "This board is community-managed and is not sponsored by jmpseat or any
  airline."
- "Access approval is a community decision and does not represent official
  employment or role verification."
- "Do not upload badges, documents, or sensitive employer materials."
- "Report abuse or misuse of community-admin authority to jmpseat."

These snippets are product-policy direction, not final legal copy. Production
terms, privacy policy, community guidelines, and launch copy still need the
appropriate owner or legal review before broad launch.

## 6. Access Request Review Policy

Recommended community-admin review behavior:

- Review only information intentionally submitted through the board access
  request.
- Prefer minimal data.
- Approve or deny based on board-specific rules.
- Do not request sensitive employment documents through jmpseat.
- Do not ask for badge images, screenshots, pay stubs, schedules, or IDs.
- If self-declared role/base context is used, label it as self-declared unless
  later policy says otherwise.
- Denial should use safe reason categories when possible.
- Repeated denial or revocation patterns should be auditable by jmpseat
  operators later.

The request flow should avoid creating pressure for users to disclose sensitive
employment materials or private identity details beyond the minimum needed for
community access.

## 7. Community Admin Visibility / Privacy

Recommended fields community admins can see:

- display name or handle
- airline-email verified status
- approved-domain-derived airline label, if safe
- self-declared base, role, or airline context
- board access request message
- prior request status for their board
- board membership status for their board

Recommended fields community admins should not see by default:

- full login email
- full airline employee email
- hidden profile fields
- proof files
- proof storage data
- platform security events
- operator notes
- unrelated board memberships
- unrelated board requests

Any expansion of community-admin visibility into full email, full domain,
identity history, operator notes, or broader cross-board data requires a
separate privacy decision before implementation.

## 8. Appeals And Dispute Handling

Users should have a way to appeal or report denied/revoked access.

Appeals should not automatically grant access. They should create a review path
that can inspect the decision, the board rules, and any abuse concern without
exposing more user data than necessary.

jmpseat operators should be able to review abuse reports later. Operators may
suspend or revoke community-admin powers for misuse.

Appeals and abuse reports need a future implementation plan. For MVP, if
appeals tooling is not ready, restricted board launch should be limited or
policies should be clear enough that users understand what review path exists.

## 9. Abuse Prevention

Risks:

- gatekeeping abuse
- retaliation
- harassment
- discrimination
- doxxing or exposure of airline identities
- off-app pressure for proof
- false official-representative claims
- admin capture of a board

Controls:

- audit community-admin actions
- report admin abuse
- operator override or suspension
- board-admin revocation
- minimal applicant data visibility
- clear disclaimers
- repeat action monitoring later

Abuse controls should be built before community-admin decisions affect real
restricted-board access at meaningful scale.

## 10. Moderation Boundaries

Community admins may moderate content only inside boards they manage if tooling
exists.

Community admins should not moderate general platform-wide content unless
separately granted a reviewed platform role.

jmpseat operators retain platform safety authority. Moderation actions should
be logged, and content moderation policy remains a separate required policy
before launch.

Community admins should not get access to private identity evidence,
verification artifacts, platform security logs, or broad moderation queues by
virtue of board-level authority.

## 11. First Community-Admin Appointment Policy

The first community admin for each restricted board should be appointed by a
jmpseat operator during early launch.

Appointment must be explicit, logged, and revocable.

Do not automatically make the first requester a community admin. Do not infer
community admin authority from airline email domain, login email, beta access,
profile text, role claim, or general baseboard activity.

Later community-admin expansion can be:

- operator-appointed
- existing-admin nominated
- board-policy based

Any expansion path must be explicit, logged, and revocable.

## 12. Relationship To jmpseat Operators

jmpseat operators manage platform-level safety, approved domains, operator
grants, global settings, and operational health.

Community admins manage board-specific access and board-specific moderation
where moderation tooling exists.

Community admins are not platform operators. Platform operators can revoke
community-admin rights. Community-admin rights should be scoped to specific
boards.

Community admins cannot manage approved domains, operator grants, reviewer
scopes, proof cleanup, platform audit inspection, or other platform-level
systems unless separately granted explicit platform operator authority through a
reviewed model.

## 13. Implementation Implications

Future implementation tasks likely need:

- community admin role/grant model
- board-specific admin permissions
- board access request review UI
- approve/deny/revoke actions
- community-admin action audit events
- community-admin abuse reporting
- appeal flow
- disclaimer copy placement
- minimum applicant data visibility policy
- operator override/suspension tooling
- moderation policy/tooling

Each implementation ticket should state the exact authorization boundary,
audited event types, visibility rules, and launch gating assumptions.

## 14. Launch Readiness Requirements

Before launching restricted boards:

- community-admin disclaimer copy exists
- first community admins are explicitly appointed
- access request rules are written
- community-admin actions are audited
- abuse reporting path exists or launch is limited
- baseline moderation policy exists
- proof upload is not used for access
- privacy boundaries are implemented

Restricted boards should not launch broadly until the access, privacy,
moderation, appeal, and abuse-reporting boundaries are clear enough for real
users.

## 15. Non-Goals

This task does not include:

- code changes
- database migrations
- community-admin implementation
- legal finalization
- proof upload
- badge upload
- employer-system lookup
- official airline verification
- global role/base claim issuance
- broad platform-admin powers for community admins

## 16. Open Questions

- Who selects the first community admins?
- What minimum criteria should a first community admin meet?
- Can community admins appoint other admins?
- Can community admins moderate posts at MVP or only approve access?
- Are appeals handled by jmpseat operators or a board-level process?
- What denial reason categories should exist?
- What applicant data can community admins see?
- Should community admins see airline domain or only airline-email verified
  status?
- Are off-app proof requests prohibited or only discouraged?
- What sanctions exist for abusive community admins?
- What disclaimers must users accept before joining restricted boards?
- Should each restricted board have public rules before launch?

## 17. Source-Of-Truth Statement

This document defines community-admin responsibilities and disclaimer policy
for the forward jmpseat model.

It builds on the product pivot, airline-email access gate, board/community
access model, proof-system freeze plan, and First-Base MVP scope:

- `strategy/product-pivot-email-verification-community-boards.md`
- `strategy/airline-email-access-gate-decision.md`
- `strategy/board-community-access-model-decision.md`
- `strategy/proof-system-freeze-deprecation-plan.md`
- `strategy/first-base-mvp-scope.md`

Future implementation must not treat community-admin approval as official
jmpseat role/base verification.

Future implementation must not grant proof-system access to community admins.
