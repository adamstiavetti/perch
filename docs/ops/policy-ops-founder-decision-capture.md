# Policy/Ops Founder Decision Capture

Date: 2026-06-14

Repo checkpoint: `ee62677 docs: add policy ops founder review packet`

## Purpose

This is a founder decision worksheet for jmpseat Policy/Ops Pack v1. It turns
the open questions from `docs/ops/policy-ops-founder-review-packet.md` into a
fillable checklist/table.

This document is not legal advice. Policy text remains draft/founder/legal
review material until the founder and any needed qualified legal reviewer
approve it. This document does not implement support intake, deletion/export
handling, appeals, policy acceptance tracking, comments/replies, or any backend
behavior.

Selected MVP defaults have been recorded below. Rows marked `Needs
implementation`, `Needs legal review`, `Pending founder approval`, `Pending`,
or `Deferred` are not complete implementation approval.

## How To Use This Document

Founder should fill the `Founder Selected Decision`, `Status`, and `Notes`
columns before Codex starts follow-up implementation work.

Codex should not implement follow-up work until the selected decisions needed
for that work are filled in and accepted. Legal-sensitive decisions should be
reviewed by qualified counsel if the founder determines counsel review is
needed.

Use conservative defaults when a decision is not ready. A blank selected
decision means the decision is not made; a selected MVP default means follow-up
may be planned only within the recorded status and stop conditions.

## Decision Status Legend

| Status | Meaning |
| --- | --- |
| `Pending` | No final founder decision has been recorded. |
| `Approved` | Founder has accepted the decision for current private-beta scope. |
| `Pending founder approval` | A selected MVP default is recorded but still needs explicit founder confirmation before use. |
| `Needs legal review` | Founder wants legal/policy review before approval. |
| `Needs implementation` | Decision is accepted but requires product/docs/code follow-up before use. |
| `Deferred` | Decision is intentionally postponed and the deferral risk is accepted. |

## Decision Table

| ID | Decision Area | Decision Needed | Recommended Default | Founder Selected Decision | Status | Blocks Broader Beta? | Blocks Comments/Replies? | Implementation Follow-Up | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `POL-DEC-01` | Official support/contact path | Select the official private-beta support path for account, access, verification, reports, moderation, and safety/privacy questions. | Choose one official inbox or controlled form before broader beta. Do not rely on ad hoc founder DMs as the primary path. | Use a controlled official support inbox before broader beta. Preferred path is `support@jmpseat.com` once configured. Do not advertise it until configured. | `Needs implementation` | Yes | Yes | `OPS-INTAKE-01` if app-visible intake or updated support copy is needed. | Confirm inbox configuration, owner, and monitoring cadence before publishing. |
| `POL-DEC-02` | Deletion/export request intake | Select the path for private-beta deletion/export requests and define whether handling is manual or product-backed. | Use documented manual intake first. Do not promise automated self-service until implemented. | Use `privacy@jmpseat.com` once configured. If separate inbox is unavailable, route through `support@jmpseat.com` with `[Deletion Request]`, `[Export Request]`, or `[Privacy Request]` subject prefixes. | `Needs implementation` | Yes | No, unless comment data is included in scope. | `OPS-INTAKE-01`; possible later data export/deletion tooling ticket. | Manual intake only. Do not promise automated self-service until implemented. |
| `POL-DEC-03` | Moderation appeal intake | Select how users can request review of moderation or access decisions during private beta. | Allow documented manual intake first, not a backend appeal workflow. | Use manual intake through `support@jmpseat.com` with subject prefix `[Moderation Appeal]`. No backend appeal workflow yet. | `Needs implementation` | Yes | Yes | `OPS-INTAKE-01`; later appeal intake UI/backend only if approved. | Do not expose reporter identity or unrelated private operator notes. |
| `POL-DEC-04` | Policy acceptance tracking | Decide whether broader beta requires explicit acceptance tracking for terms/privacy/community rules. | Decide before broader beta. Defer implementation only if founder explicitly accepts the risk in writing. | Implement minimal acceptance tracking before broader beta. Track accepted policy version and timestamp for private beta terms, privacy notice, and community rules. | `Needs implementation` | Yes | Yes | `POL-ACCEPT-01`. | Do not add acceptance schema/UI until this implementation lane is explicitly scoped. |
| `POL-DEC-05` | Private beta terms approval | Approve, revise, or send the private beta terms draft for legal review. | Treat as draft until founder/legal approval is recorded. | Founder product approval required; legal review recommended before broader beta. Keep draft status until reviewed. | `Needs legal review` | Yes | Yes | `POL-REV-01` if revisions are needed. | Do not present as final legal terms until reviewed/approved. |
| `POL-DEC-06` | Privacy notice approval | Approve, revise, or send the private beta privacy notice draft for legal/privacy review. | Treat as draft until founder/legal/privacy approval is recorded. | Founder product approval required; legal review strongly recommended before broader beta. Keep draft status until reviewed. | `Needs legal review` | Yes | Yes | `POL-REV-01` if revisions are needed. | Confirm coverage for accounts, verification, posts, reports, moderation, support, retention, deletion/export, and operator access. |
| `POL-DEC-07` | Community rules approval | Approve or revise community rules for current DFW Channels posting/reporting surfaces. | Approve rules before broader posting volume or comments/replies. | Current community rules are accepted operationally for MVP if the language remains moderate. Legal review is recommended if enforcement or account-action language is strengthened. | `Approved` | Yes | Yes | `POL-REV-01` if revisions are needed. | MVP approval does not make the rules final legal policy. Keep aviation-sensitive boundaries explicit. |
| `POL-DEC-08` | Verification consent copy approval | Approve or revise work-email, manual review, and proof-upload boundary copy. | Approve work-email caveat and keep proof uploads inactive unless separately reviewed. | Founder approval required; legal review recommended because it touches verification and sensitive artifacts. | `Needs legal review` | Yes | No, except where comments/replies require verified-user onboarding clarity. | `POL-REV-01` for copy revisions; no proof-upload work without separate approval. | Confirm employer email logging caveat is acceptable. |
| `POL-DEC-09` | Incident/escalation owner | Assign the primary owner for privacy, safety, security, aviation-sensitive, operator-access, and high-risk moderation incidents. | Assign one primary accountable owner before broader beta. | Founder is the primary incident/escalation owner for private beta. | `Approved` | Yes | Yes | `OPS-INTAKE-01` or operator runbook update if owner/cadence changes public/internal docs. | Include when to escalate to legal/security/privacy reviewer. Backup owner remains unresolved in `POL-DEC-10`. |
| `POL-DEC-10` | Incident/escalation backup | Assign a backup owner for incidents when the primary owner is unavailable. | Assign one backup before broader beta. | Unassigned until trusted backup is selected. Broader beta should not proceed until backup is named or founder explicitly accepts single-owner risk. | `Pending` | Yes | Yes | `OPS-INTAKE-01` or runbook update. | Avoid single-person coverage for P0/P1 issues unless founder explicitly accepts the risk. |
| `POL-DEC-11` | Operator/moderation owner | Assign the owner for report review, operator grants, moderation actions, smoke-test scope, and operator hygiene. | Assign one moderation owner and one backup/coverage expectation. | Founder is initial moderation owner. Additional operator access should be scoped and limited. | `Approved` | Yes | Yes | `OPS-INTAKE-01`, `QA-POL-01`, or operator runbook update. | Keep `operator.community_moderation` least-privilege posture. Backup/coverage still needs operational detail. |
| `POL-DEC-12` | Verification artifact retention/deletion | Decide retention/deletion expectations for verification metadata and any historical/future proof artifacts. | Keep proof uploads inactive. Do not reactivate proof uploads without fresh privacy/security/legal review. | Preserve minimal-retention posture; no indefinite retention. Private storage, short-lived access, audit trail, deletion fields, and no public proof exposure remain required. Legal review recommended before broader beta if artifact workflows are active or reactivated. | `Needs legal review` | Yes if artifacts are active; otherwise should be documented. | No, unless comments/replies alter verification scope. | `POL-REV-01` for copy; separate proof-upload reactivation ticket only if approved. | Do not inspect or change proof-upload/storage flows in this decision lane. |
| `POL-DEC-13` | Access-hold policy copy re-smoke | Decide whether `/app/access-hold` policy copy must be browser-smoked with an account that lands on access hold before broader beta. | Complete before broader beta if possible. | Complete before broader beta with an account that renders `/app/access-hold`. | `Needs implementation` | Yes | No | `QA-POL-01`. | Prior smoke was limited because active account redirected to `/app`. |
| `POL-DEC-14` | Operator admin policy-link re-smoke | Decide whether `/app/admin/community-moderation` policy links must be browser-smoked with an operator-scoped session before broader beta. | Complete before broader beta if possible, without clicking destructive actions. | Complete before broader beta with an operator-scoped session with `operator.community_moderation`. | `Needs implementation` | Yes | Yes, if comments/replies depend on operator workflow confidence. | `QA-POL-01`. | Do not click destructive moderation actions during smoke unless separately authorized. |
| `POL-DEC-15` | Comments/replies planning gate | Decide whether DFW Channel comments/replies can begin planning after the required Policy/Ops decisions are accepted. | Keep comments/replies blocked until support, appeal, moderation, rules, and owner decisions are accepted. | Comments/replies remain blocked. Planning can begin only after support/contact path, moderation appeal intake, community rules approval, and moderation ownership are accepted. Implementation should not begin until those decisions are recorded. | `Deferred` | No | Yes | `COMM-READY-01` only after prerequisite decisions are accepted. | This does not authorize implementation. |

## Required Decision Checklist

- [x] Official support/contact path selected; implementation still needed.
- [x] Deletion/export request intake selected; implementation still needed.
- [x] Moderation appeal intake selected; implementation still needed.
- [x] Policy acceptance tracking decision recorded as yes; implementation still needed.
- [ ] Private beta terms still need legal review before broader beta.
- [ ] Privacy notice still needs legal/privacy review before broader beta.
- [x] Community rules accepted operationally for MVP if current language remains moderate.
- [ ] Verification consent copy still needs legal review before broader beta.
- [x] Incident/escalation owner assigned to founder for private beta.
- [ ] Incident/escalation backup remains unassigned.
- [x] Operator/moderation owner assigned to founder for initial private beta.
- [x] Verification artifact retention/deletion expectations recorded; legal review remains recommended if artifact workflows are active or reactivated.
- [x] Access-hold policy copy re-smoke requirement recorded; implementation still needed.
- [x] Operator admin policy-link re-smoke requirement recorded; implementation still needed.
- [x] Comments/replies planning gate recorded; comments/replies remain blocked.

## Recommended Defaults

- Support/contact path: choose one official inbox or controlled form before
  broader beta.
- Deletion/export intake: use documented manual handling first; do not promise
  automated self-service until it exists.
- Moderation appeals: use documented manual intake first; do not imply a
  backend appeal workflow exists.
- Policy acceptance tracking: decide before broader beta; defer implementation
  only with explicit founder risk acceptance.
- Comments/replies: keep blocked until support, appeal, moderation, rules, and
  owner decisions are accepted.
- Access-hold/operator smoke: complete before broader beta if possible.

## Implementation Follow-Up Map

| Follow-Up Ticket | Triggering Decisions | Scope |
| --- | --- | --- |
| `POL-REV-01 Policy Copy Revision Lane` | `POL-DEC-05`, `POL-DEC-06`, `POL-DEC-07`, `POL-DEC-08`, or legal review changes. | Revise draft policy docs and public page summaries after founder/legal decisions. |
| `OPS-INTAKE-01 Support Contact Deletion Appeal Intake Lane` | `POL-DEC-01`, `POL-DEC-02`, `POL-DEC-03`, `POL-DEC-09`, `POL-DEC-10`, or `POL-DEC-11`. | Implement or document approved support/contact, deletion/export, moderation appeal, owner, and coverage process. |
| `POL-ACCEPT-01 Policy Acceptance Tracking Lane` | `POL-DEC-04` selected as yes. | Add acceptance tracking only after schema/RPC/UI design is explicitly approved. |
| `QA-POL-01 Access-Hold And Operator Policy Link Re-Smoke Lane` | `POL-DEC-13` or `POL-DEC-14` selected as required. | Re-smoke access-hold copy and operator admin policy links with appropriate account state/session. |
| `COMM-READY-01 Comments/Replies Readiness Lane` | `POL-DEC-15` selected as allow planning after prerequisite decisions are accepted. | Plan comments/replies readiness without implementation until moderation/support/appeal scope is approved. |

## Stop Conditions

Codex must not proceed to implementation if:

- founder-selected decisions needed for the lane are blank
- legal-sensitive copy is unresolved
- support/contact path is undecided
- deletion/export intake is undecided
- appeal intake is undecided
- comments/replies are requested before moderation, support, and appeal
  decisions are accepted
- policy acceptance tracking is requested without an accepted yes/no/defer
  decision and implementation scope
- proof-upload/storage work is requested without a separate explicit
  reactivation decision

## Documentation Governance

Docs Updated:

- `docs/BUILD_TICKETS.md`
- `docs/BETA_READINESS_CHECKLIST.md`
- `docs/PRIVATE_BETA_OPERATING_PLAN.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- this decision capture worksheet

Docs Not Updated / Why:

- Policy draft docs were not updated because this worksheet captures decisions
  without rewriting policy language.
- App code and `app/legal/policyContent.ts` were not updated because this task
  adds no UI content or runtime behavior.
- `docs/DATA_MODEL.md` was not updated because this task adds no schema, table,
  RPC, migration, runtime data model, or runtime behavior.

Runtime Apply Needed?

- No. This is docs-only.

Browser Smoke Needed?

- No. No UI content or app behavior changed.

## Status

Selected MVP defaults are recorded for founder review. This document still does
not implement any support/contact/deletion/appeal backend, policy acceptance
tracking, comments/replies, migration, runtime change, or legal approval.
