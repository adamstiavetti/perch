# Policy/Ops Founder Review Packet

Date: 2026-06-14

Repo checkpoint: `488a3f7 docs: align dfw channel reporting status`

## Purpose

This packet consolidates the existing Policy/Ops Pack v1 drafts, runbooks, UI
wiring notes, and browser-smoke limitations into one founder/legal review
checklist.

This packet is not legal advice, does not mark policy copy as legally approved,
and does not add implementation behavior. It is intended to help the founder
decide what language, workflows, owners, and implementation gates must be
approved before broader private beta or DFW Channel comments/replies.

Current product principles:

- jmpseat is the canonical product name.
- Utility first, community second, social feed last.
- Verified privately, anonymous publicly, accountable internally.

## Current Policy/Ops Pack Inventory

| Artifact | Purpose | Audience | UI wired? |
| --- | --- | --- | --- |
| `docs/policy/PRIVATE_BETA_TERMS_DRAFT.md` | Draft private-beta terms covering beta status, eligibility, identity model, acceptable use, prohibited aviation-sensitive content, reports, moderation, appeals placeholder, no-affiliation, and not-operational-source boundaries. | Public-facing when approved; founder/legal review input now. | Partially. Public `/legal/beta-terms` summarizes this content. |
| `docs/policy/PRIVACY_NOTICE_DRAFT.md` | Draft private-beta privacy notice covering account/access/profile/verification/content/report/moderation/operator/support data, work-email caveat, proof-upload deactivation, retention principles, deletion/export placeholder, and security caveats. | Public-facing when approved; founder/legal review input now. | Partially. Public `/legal/privacy` summarizes this content. |
| `docs/policy/COMMUNITY_RULES_DRAFT.md` | Draft community rules for practical aviation-worker utility, prohibited passenger/security/live-ops/hotel/confidential content, reporting, moderation, and tone. | Public-facing and operator reference. | Partially. Public `/legal/community-rules` summarizes this content and Channel composer links to it. |
| `docs/policy/VERIFICATION_CONSENT_COPY_DRAFT.md` | Draft reusable work-email, manual-review, future proof-upload, verification outcome, and support copy. | Public-facing product copy when approved; internal implementation source. | Partially. `/legal/verification-privacy` and `/app/access-hold` carry focused work-email/privacy copy. |
| `docs/policy/MODERATION_AND_APPEALS_RUNBOOK.md` | Draft report triage, priority, hide/remove, escalation, appeal, AI boundary, evidence minimization, reporter privacy, audit, and SLA guidance. | Internal-facing operator/founder runbook; public-facing excerpts via policy page. | Partially. `/legal/moderation-appeals` summarizes user-facing pieces; admin moderation links to it. |
| `docs/policy/SUPPORT_INCIDENT_DELETION_RUNBOOK.md` | Draft support categories, intake rules, privacy/deletion/export handling, verification issues, appeals reference, incident handling, owners, response-time placeholders, and data minimization. | Internal-facing operations runbook; public-facing excerpts via support page. | Partially. `/legal/support-requests` summarizes placeholder state. |
| `docs/policy/OPERATOR_MODERATION_RUNBOOK.md` | Draft operator guide for `operator.community_moderation`, least privilege, temporary grants, report review, hide/remove criteria, identity leakage boundaries, audit, smoke-test rules, and token/access hygiene. | Internal-facing operator/founder runbook. | Partially. Admin moderation links to policy drafts; no operator behavior changed. |
| `docs/ops/policy-ops-pack-v1-summary.md` | Summary of draft pack scope, review needs, implementation gaps, deferred scope, and evidence sources. | Internal planning/status. | No direct UI route; referenced by planning docs. |
| `docs/ops/policy-ops-pack-v1-ui-wiring.md` | Records the public legal routes and focused product links added for the pack. | Internal implementation/status. | N/A. It documents UI wiring. |
| `docs/ops/policy-ops-pack-v1-ui-wiring-browser-smoke.md` | Records beta browser smoke for public legal pages, public/auth links, Channel composer/report links, public-domain boundaries, and limitations. | Internal QA/status. | N/A. It documents smoke results. |

## Product Behavior Mapping

Private beta access:

- Current behavior uses private app gates, beta access state, work-email/domain
  eligibility, profile completion, and explicit operator/private-app access
  where applicable.
- Policy drafts correctly frame access as limited, invite-based, mutable during
  beta, and not guaranteed.
- Missing approval: whether terms/privacy/rules are acceptable as the official
  beta access language.

Verification, work email, and proof sensitivity:

- Current active path does not use proof uploads.
- Work-email verification copy warns that employer-managed email systems may
  log, retain, scan, or review activity outside jmpseat's control.
- Access-hold copy warns against passwords, airline portal credentials,
  employee numbers, schedules, and confidential documents.
- Missing approval: final verification consent language and any retention
  expectations for historical/future proof artifacts.

Public legal pages:

- Public read-only routes exist at `/legal/beta-terms`, `/legal/privacy`,
  `/legal/community-rules`, `/legal/verification-privacy`,
  `/legal/moderation-appeals`, and `/legal/support-requests`.
- Browser smoke passed for public legal rendering and public/auth links.
- Pages preserve draft framing and do not claim legal approval.

DFW Channels posting/reporting:

- DFW Channels overview/list/detail/create/create-redirect are implemented,
  runtime-applied where needed, beta-smoked, and documented.
- DFW Channel posts can be reported from post detail.
- Reporter identity and public report counts are not shown.
- Channel comments/replies are not implemented.

Operator-scoped moderation:

- T26E-A supports DFW Channel post reporting, duplicate-safe report state,
  operator-scoped report review, and narrow hide/remove actions.
- Admin moderation requires `operator.community_moderation`.
- Account bans, AI final moderation decisions, public moderation feeds, and
  public report counts are not part of the current foundation.

Admin/operator runbooks:

- Current runbooks cover least privilege, temporary grants, report triage,
  evidence minimization, identity leakage boundaries, audit expectations, and
  token/access hygiene.
- Missing approval: owner, backup, coverage, response targets, appeal reviewer
  expectations, and support routing.

Support/contact/deletion/appeals placeholder state:

- Draft docs mention `support@jmpseat.com` and `privacy@jmpseat.com`, but the
  public support page says approved support/contact paths are still being
  finalized.
- No support form backend, deletion/export request intake, appeal intake, or
  policy acceptance tracking exists.
- Missing approval: official contact paths, intake process, owner, response
  targets, and whether manual-only handling is acceptable for broader beta.

## Founder Review Decisions Needed

| Decision | Why it matters | Recommended default | Risk if undecided | Blocks broader beta? |
| --- | --- | --- | --- | --- |
| Official support/contact path | Users need one approved route for account, verification, safety, privacy, and moderation issues. | Approve `support@jmpseat.com` for general beta support and assign owner/backup before inviting more users. | Users may send sensitive issues through ad hoc channels or receive inconsistent answers. | Yes |
| Deletion/export request intake path | Privacy notice and readiness docs require a manual path even if no backend exists. | Approve `privacy@jmpseat.com` plus a manual intake log, requester verification step, owner, and response target. | Privacy requests may be mishandled or delayed without a documented owner/process. | Yes |
| Moderation appeal intake path | Moderation pages reference manual appeals, but no formal intake exists. | Use the approved support path for appeals until a dedicated intake exists; require owner review and no reporter identity exposure. | Users may expect an appeal process that operators cannot consistently run. | Yes |
| Policy acceptance tracking before broader beta | Determines whether users must affirm terms/rules before access/posting. | Decide explicitly. If not required for first controlled wave, document founder risk acceptance and keep copy linked near posting/reporting. | Lack of acceptance record may weaken enforceability or create ambiguity about user notice. | Yes, if founder/legal says required |
| Private beta terms acceptable as written | Terms define beta status, scope, prohibited content, and moderation rights. | Founder/legal review should approve, revise, or mark conditions before broader beta. | Public-facing draft language may overpromise, understate rights, or miss required terms. | Yes |
| Privacy notice acceptable as written | Notice covers private app data classes, work email, reports, moderation, support, deletion/export, and retention. | Founder/legal/privacy review should approve final public wording. | Users may not have clear notice for account, verification, posts, reports, moderation, or manual requests. | Yes |
| Community rules acceptable as written | Rules set boundaries for posting/reporting and moderation. | Approve as the active beta rules before adding more posting volume. | Operators and users may interpret aviation-sensitive content boundaries differently. | Yes |
| Verification consent copy acceptable | Work-email caveat and proof-upload boundaries affect trust and privacy. | Approve work-email and non-upload manual review copy before expanding verification usage. | Users may misunderstand employer email logging or send sensitive documents. | Yes |
| Incident/escalation owner and backup | High-risk privacy, security, aviation-sensitive, and operator-access issues need accountable handling. | Assign primary founder/policy owner, backup owner, and legal/privacy/security reviewer path. | P0/P1 issues may be delayed or handled inconsistently. | Yes |
| Operator/moderation owner | Report review, temporary grants, and moderation decisions need ownership. | Assign one moderation owner and one backup for private beta coverage. | Reports may sit unresolved or grants/actions may lack oversight. | Yes |
| Data retention/deletion expectations for verification artifacts | Drafts reference artifact deletion if proof upload is reactivated; historical proof scope still carries obligations. | Keep proof uploads inactive. Approve metadata retention and future artifact deletion default before any reactivation. | Sensitive artifact handling may be unclear if uploads are accidentally revived or old artifacts remain. | Yes if uploads are active; otherwise should be documented |
| Access-hold copy re-smoke before broader beta | Browser smoke could not view access-hold copy due account state. | Re-smoke with an account that naturally lands on `/app/access-hold` before broader beta. | Verification/privacy copy may be wired but not visually confirmed in the relevant state. | No for docs approval; yes before wider rollout |
| Operator admin policy links re-smoke before broader beta | Browser smoke could not verify operator-scoped admin policy links due non-operator session. | Re-smoke with an operator-scoped account without changing moderation actions. | Operator-facing policy links may remain unverified in the intended role. | No for docs approval; yes before wider rollout |

## Must-Fix Before Broader Beta

Legal/founder approval blockers:

- Approve or revise private beta terms.
- Approve or revise private beta privacy notice.
- Approve community rules.
- Approve verification consent/work-email caveat copy.
- Confirm language does not imply legal finality, official airline/employer
  verification, or legal/trademark clearance.
- Decide whether policy acceptance tracking is required before broader beta.

Operational blockers:

- Approve official support/contact paths.
- Approve deletion/export request intake and owner.
- Approve moderation appeal intake and owner.
- Assign incident/escalation owner and backup.
- Assign operator/moderation owner and coverage expectations.
- Confirm token/access hygiene follow-up, including rotation of any token
  exposed in chat or logs if not already complete.

Implementation blockers:

- If founder/legal requires acceptance records, implement policy acceptance
  tracking before broader beta.
- If founder approves support/deletion/export/appeal intake as product
  behavior, implement the minimum intake path or explicitly document manual
  handling outside the app.
- Re-smoke access-hold copy with the correct account state if broader beta
  depends on that copy.
- Re-smoke operator admin policy links with an operator-scoped session before
  relying on operator policy visibility.

Nice-to-have improvements:

- Add approved policy links to future settings/help surfaces once those exist.
- Add a concise operator checklist view after owners and coverage are approved.
- Run accessibility and security reviews for auth, access-hold, Channels
  reporting, and admin moderation.
- Tighten response-time targets after actual first-wave coverage is known.

## Must-Fix Before Comments/Replies

DFW Channel comments/replies should remain blocked until:

- Rules are approved, because comments increase volume, context collapse, and
  risk of passenger, hotel, live-ops, security, and harassment content.
- Report/moderation process is accepted, because comments need clear report
  categories, operator review expectations, and safe hide/remove behavior.
- Appeal/support path is decided, because comment removals create more disputes
  and support load than post-only reporting.
- Operator workflow is clear, because comments add more review targets and
  evidence-retention decisions.

Minimum comments/replies readiness gate:

- Approved community rules.
- Approved moderation and appeals process.
- Approved support/contact path.
- Assigned moderation owner/backup.
- Decided reporting target coverage for comments and replies.
- Decided whether comment/reply launch is limited to controlled beta cohorts.

## Policy Language Risk Notes

Potentially too strong or operationally unsupported:

- Response-time targets in runbooks are placeholders. Same-day, 24-hour,
  2-business-day, 3-business-day, and 7-day targets need owner/coverage
  approval before they become promises.
- Deletion/export handling is described as draft/manual and implementation
  pending. Public copy should not imply an automated or fully built workflow.
- Appeals are described as manual and pending. Public copy should not imply a
  formal in-app appeal workflow exists.
- `support@jmpseat.com` and `privacy@jmpseat.com` appear in draft docs, while
  public UI says contact paths are still being finalized. Founder must decide
  whether those addresses are official.
- Draft pages must continue to say they are not legal advice, not final legal
  terms, and require founder/legal review until approval is complete.
- AI boundaries are correctly conservative. Keep language clear that AI does
  not make final verification, moderation, ban, or appeal decisions.
- Proof-upload language is future/reactivation-only. Keep public UI clear that
  proof upload is not live in the current private-beta path.
- Moderation rights mention account restrictions/removal in terms, while the
  current T26E-A moderation surface only supports hide/remove for posts. If
  account restrictions are retained in policy language, founder should confirm
  they are reserved manual/admin actions, not current T26E-A UI actions.

## Implementation Follow-Up Candidates

Future tickets to consider after founder/legal review:

- `POL-REV-01 Policy Copy Revision Lane`: revise terms, privacy, community
  rules, verification copy, and public page summaries after founder/legal
  decisions.
- `OPS-INTAKE-01 Support Contact Deletion Appeal Intake Lane`: implement or
  document the approved support/contact, privacy/deletion/export, and appeal
  intake process.
- `POL-ACCEPT-01 Policy Acceptance Tracking Lane`: add schema/RPC/UI only if
  founder/legal requires acceptance records before broader beta.
- `QA-POL-01 Access-Hold And Operator Policy Link Re-Smoke Lane`: re-smoke
  access-hold verification copy with an account in that state and admin policy
  links with an operator-scoped session.
- `COMM-READY-01 Comments/Replies Readiness Lane`: design comments/replies only
  after policy rules, moderation, appeals, support, and operator workflow are
  accepted.

## Recommended Next Step

Founder should review this packet and decide the official support/contact,
deletion/export, and moderation appeal paths before any backend intake or
comments/replies work.

Reason: the current product already has enough posting/reporting behavior to
need clear user notice, operator ownership, manual support paths, and escalation
coverage before expanding private beta or increasing UGC volume with comments
and replies.

## Documentation Governance

Docs Updated:

- `docs/BUILD_TICKETS.md`
- `docs/BETA_READINESS_CHECKLIST.md`
- `docs/PRIVATE_BETA_OPERATING_PLAN.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- this packet

Docs Not Updated / Why:

- Policy draft docs were not updated because this task creates a founder review
  packet and does not rewrite policy language.
- `app/legal/policyContent.ts` was not updated because UI content did not
  change.
- `docs/DATA_MODEL.md` was not updated because this packet adds no schema,
  table, RPC, migration, runtime data model, or runtime behavior.

Runtime Apply Needed?

- No. This is docs-only.

Browser Smoke Needed?

- No. No UI content or app behavior changed.

## Status

Founder/legal review packet is ready as a docs-only decision aid. It does not
approve policy language, create support/deletion/export/appeal intake, add
policy acceptance tracking, add comments/replies, change migrations, or mutate
runtime data.
