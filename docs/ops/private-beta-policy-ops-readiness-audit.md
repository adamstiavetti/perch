# Private-Beta Policy / Ops Readiness Audit

Date: 2026-06-13

Repo checkpoint: `149da73 docs: record final channel reporting browser smoke`

## Purpose

This docs-only audit records what is ready, partially ready, missing, or
decision-blocked before broader private-beta use now that the DFW Hub baseline
pillars and the T26E-A channel post reporting/moderation foundation have been
implemented, runtime-applied where needed, beta-smoked, and documented.

This audit is not a legal review, production launch approval, feature
implementation, migration, deployment, or runtime operation.

## Current Baseline

DFW Hub lightweight MVP pillars are complete at the current baseline level:

- DFW Today: implemented, beta-smoked, documented.
- DFW Base: implemented, beta-smoked, documented.
- DFW Layover: implemented, beta-smoked, documented.
- Channels: overview, selected-channel list, post detail, create/composer,
  created-detail redirect, reporting, and operator moderation-review foundation
  implemented, beta-smoked, and documented.

Current functional evidence:

- DFW Hub baseline checkpoint:
  `docs/ops/fbmvp-checkpoint-dfw-hub-baseline-pillars-complete.md`
- Final T26E-A channel reporting browser smoke:
  `docs/ops/fbmvp-t26e-a-channel-post-reporting-final-browser-smoke.md`
- Public legal pages:
  `app/terms/page.tsx`, `app/privacy/page.tsx`
- Public/private domain gate:
  `src/lib/privateApp/domainGate.ts`, `test/private-app/domainGate.test.mts`
- Private app gate:
  `src/lib/privateApp/access.ts`, `src/lib/privateApp/dfwHubAccess.ts`
- Operator scopes:
  `src/lib/admin/access.ts`
- DFW Channel report action and statuses:
  `src/lib/community/hubChannelActions.ts`,
  `src/lib/community/hubChannelPostActionState.ts`
- DFW Channel report/moderation RPC migration:
  `supabase/migrations/20260613091500_create_hub_channel_post_reporting_rpc.sql`
- Operator moderation review surface:
  `app/app/admin/community-moderation/page.tsx`,
  `src/lib/admin/communityModerationReports.ts`,
  `src/lib/admin/communityModerationActions.ts`

Still not implemented or not launch-complete:

- Comments/replies for DFW Channels.
- Request a Channel workflow.
- Full user-facing private-beta terms/privacy/community-guidelines package.
- Appeals process.
- Deletion/export request process for private beta users.
- Incident/escalation owner and backup process.
- Final UI/UX polish.

## Readiness Matrix

| Item | Status | Evidence | Gap / decision |
| --- | --- | --- | --- |
| DFW Hub product baseline | Ready | `docs/ops/fbmvp-checkpoint-dfw-hub-baseline-pillars-complete.md`; T27A/T27B/T27C smoke docs; T26D/T26E-A smoke docs | Lightweight baseline only; UI/UX polish deferred. |
| Public waitlist terms | Ready for waitlist, partial for private beta | `app/terms/page.tsx`; `docs/LEGAL_POLICY_REQUIREMENTS.md` | Current page is waitlist-scoped, not full beta/community terms. |
| Public waitlist privacy notice | Ready for waitlist, partial for private beta | `app/privacy/page.tsx`; `docs/DEPLOYMENT_AND_WAITLIST_READINESS.md` | Current notice covers waitlist/survey/public analytics, not private app content, reports, moderation, verification, or account data. |
| No-affiliation disclaimer | Ready | `app/terms/page.tsx`; `app/privacy/page.tsx`; `docs/LEGAL_POLICY_REQUIREMENTS.md`; `docs/PRIVATE_APP_AUTH_DB_ARCHITECTURE.md` | Keep present in beta onboarding/invite materials. |
| Community rules | Partially ready | Requirements exist in `docs/LEGAL_POLICY_REQUIREMENTS.md`; operating expectations exist in `docs/PRIVATE_BETA_OPERATING_PLAN.md`; DFW Today/Base/Layover safety copy is smoke-documented | Needs a concise user-facing private-beta rules artifact linked near posting/reporting. |
| Verification consent language | Partially ready | Requirements in `docs/LEGAL_POLICY_REQUIREMENTS.md`; active path in `docs/PRIVATE_BETA_OPERATING_PLAN.md`; gates in `src/lib/privateApp/access.ts` | Needs current user-facing beta copy for work-email/private-access gates and non-upload review. |
| Work-email verification consent | Partially ready | `docs/PRIVATE_BETA_OPERATING_PLAN.md`; work-email confirmation migrations; `src/lib/privateApp/access.ts` | Needs explicit beta UX/legal copy that work email may reveal use to employer systems. |
| Redacted proof upload/review language | Partially ready / mostly deferred | Proof upload expectations in `docs/LEGAL_POLICY_REQUIREMENTS.md`, `docs/PRIVATE_BETA_OPERATING_PLAN.md`, `docs/BETA_READINESS_CHECKLIST.md`; proof cleanup/admin docs remain historical | Proof uploads are deprecated/out of current scope; if reactivated, fresh privacy/security review and user-facing redaction/retention language are required. |
| Moderation policy | Partially ready | `docs/PRIVATE_BETA_OPERATING_PLAN.md` moderation runbook; `app/app/admin/community-moderation/page.tsx`; `src/lib/admin/communityModerationActions.ts` | Needs concise operator runbook with owners, response times, appeal handling, and beta coverage schedule. |
| Report handling policy | Partially ready | T26E-A final smoke doc; `src/lib/community/hubChannelActions.ts`; `supabase/migrations/20260613091500_create_hub_channel_post_reporting_rpc.sql` | Post reports work for Channels; comment/user/profile/deal report scope is not complete for broader beta. |
| Appeals policy | Missing | `docs/LEGAL_POLICY_REQUIREMENTS.md` and `docs/PRIVATE_BETA_OPERATING_PLAN.md` say appeals are required/manual | Needs user-facing manual appeal path and internal operator workflow. |
| Deletion/export request process | Missing / needs decision | Public waitlist deletion contact exists in `app/privacy/page.tsx`; broader need documented in `docs/LEGAL_POLICY_REQUIREMENTS.md` and `docs/BETA_READINESS_CHECKLIST.md` | Private app account/content/report/export handling needs a support channel, owner, response target, and data inventory. |
| Support/contact path | Partially ready | Public pages list `support@jmpseat.com` and `privacy@jmpseat.com` in `app/terms/page.tsx` and `app/privacy/page.tsx` | Needs beta support/escalation routing for app, moderation, privacy, verification, and safety issues. |
| Incident/escalation owner/process | Missing / needs decision | Requirements in `docs/LEGAL_POLICY_REQUIREMENTS.md`; runbook outline in `docs/PRIVATE_BETA_OPERATING_PLAN.md` | Must assign owner/backup and severity response targets before inviting more users. |
| Admin/reviewer responsibilities | Partially ready | Operator scopes in `src/lib/admin/access.ts`; moderation page in `app/app/admin/community-moderation/page.tsx`; `docs/strategy/community-admin-responsibilities-disclaimer-policy.md` | Needs current DFW beta operator checklist and conflict/coverage expectations. |
| Verification artifact retention/deletion | Partially ready / deferred for uploads | Retention recommendation in `docs/PRIVATE_BETA_OPERATING_PLAN.md`; proof cleanup code/docs exist; active path avoids proof uploads | Must define private-beta retention for account/verification metadata and avoid reactivating uploads without review. |
| Aviation-sensitive content boundaries | Ready for current DFW surfaces | `docs/LEGAL_POLICY_REQUIREMENTS.md`; DFW Today/Base/Layover smoke docs; T26E-A final smoke doc | Needs user-facing rules before broader member posting volume. |
| Private-beta invite/waitlist operating process | Partially ready | `docs/PRIVATE_BETA_OPERATING_PLAN.md`; `docs/DEPLOYMENT_AND_WAITLIST_READINESS.md`; public waitlist pages and waitlist capture docs | Needs current first-wave operating checklist, invite owner, support path, and beta communications copy. |
| Public-domain/private-app route boundaries | Ready | `src/lib/privateApp/domainGate.ts`; `test/private-app/domainGate.test.mts`; T26/T27/T26E-A smoke docs | Continue beta/private app on `beta.jmpseat.com`; public apex/`www` remain waitlist/legal only. |
| Operator/admin access controls | Ready for current scope | `src/lib/admin/access.ts`; `app/app/admin/community-moderation/page.tsx`; T26E-A final smoke doc | Rotate any exposed operational tokens before broader beta and keep temporary grants reversible. |
| Reporting/moderation operating workflow | Partially ready | T26E-A implementation/runtime/final smoke docs; `src/lib/admin/communityModerationReports.ts`; `src/lib/admin/communityModerationActions.ts` | Current DFW Channel post workflow is smoked; broader report targets, appeals, coverage, and incident escalation still need ops closure. |

## Required Before Broader Private Beta

Must-have before inviting more users:

- Draft and review private-beta terms that cover account eligibility, beta
  status, user content, moderation rights, no-affiliation, and prohibited
  aviation-sensitive content.
- Draft and review a private-beta privacy notice that covers accounts,
  verification/work-email, profiles, posts, reports, moderation actions,
  operator access, retention, deletion/export requests, support contacts, and
  analytics if any private-app analytics are later introduced.
- Publish concise community rules for posting/reporting surfaces, including no
  passenger private information, live operations-sensitive information,
  airport/security-sensitive procedures, exact crew hotel exposure, confidential
  company documents, harassment, doxxing, impersonation, and unsafe meetup
  pressure.
- Add user-facing work-email verification consent/caveat language before users
  rely on work email as an aviation-worker signal.
- Define the support/contact path for privacy, safety, verification, account,
  and moderation issues.
- Assign incident/escalation owner and backup for privacy, security,
  aviation-sensitive content, reports, and account/operator access events.
- Define the manual appeal path for moderation and verification decisions.
- Define the private-app deletion/export request process, even if manual.
- Create a short operator/moderation runbook covering report review cadence,
  emergency categories, hide/remove criteria, evidence minimization, and
  non-destructive smoke/testing rules.
- Rotate the exposed Supabase access token from the T26E-A migration lane before
  broader beta operations continue.

Should-have soon after:

- Coverage schedule for reports and support during invite waves.
- Beta invite/waitlist wave plan aligned to actual DFW first-wave users.
- Policy copy links near posting/reporting/onboarding surfaces.
- Accessibility review of auth, DFW Hub, reporting, and admin moderation flows.
- Security review focused on private route gates, operator grants, reporting
  RPCs, and public/private domain boundaries.
- Updated admin/reviewer responsibilities packet for current operator scopes.

Can defer:

- Full public-launch Terms of Service and Privacy Policy if a reviewed
  private-beta policy set exists.
- Request a Channel workflow.
- DFW Channel comments/replies if broader beta stays limited or if posting
  volume is constrained.
- AI/Jumpseat Brief policies until AI is enabled.
- NonRev Deals/vendor/affiliate policies until monetized deals are reopened.
- Full marketplace/payments policy until payments are scoped.
- Proof-upload reactivation policy if proof uploads remain deprecated/out of
  current scope.

## Implementation Backlog

Recommended narrow tickets:

1. `POL-01 Private Beta Terms And Privacy Notice`
   - Create beta-specific terms/privacy copy from the current requirements.
   - Cover accounts, content, verification, work email, reports/moderation,
     deletion/export requests, support, no-affiliation, and beta limitations.
2. `POL-02 Community Rules And Aviation-Sensitive Content Copy`
   - Add concise user-facing rules and examples.
   - Link from posting/reporting surfaces where practical.
3. `OPS-01 Beta Support, Incident, And Escalation Runbook`
   - Assign owner/backup, severity categories, response targets, and evidence
     handling for privacy/security/content incidents.
4. `OPS-02 Moderation And Appeals Runbook`
   - Define report review cadence, hide/remove criteria, author/reporter
     notification boundaries, manual appeals, and operator conflict handling.
5. `OPS-03 Deletion / Export Request Process`
   - Define manual beta request intake, identity verification, response target,
     data inventory, and audit trail.
6. `OPS-04 Work-Email Verification Consent Copy`
   - Add or update user-facing copy before work-email verification use expands.
7. `SEC-01 Operator Access And Token Hygiene Review`
   - Rotate exposed token, review active operator grants, confirm least
     privilege, and record the result.
8. `QA-01 Private-Beta Launch Gate Smoke Pack`
   - Re-run public/private domain boundaries, private route gates, reporting,
     non-operator admin denial, and operator moderation review after policy
     copy is deployed.

## Risk Notes

Privacy:

- Public waitlist privacy is covered, but private app privacy is not yet fully
  user-facing.
- Reports and moderation records must stay private; reporter identity must not
  become public.
- Deletion/export requests need an explicit manual path before broader beta.

Moderation:

- DFW Channel post reporting and operator review are now browser-smoked, but
  comments/replies are not implemented and broader report targets remain
  incomplete.
- Hide/remove actions exist and must remain operator-scoped; account bans are
  intentionally out of scope.
- Appeals are documented as required but not operationalized.

Aviation-sensitive content:

- Current surfaces avoid live ops, exact crew hotels, passenger data,
  airport/security-sensitive procedures, schedule scraping, crew tracking, AI
  operational advice, and external live integrations.
- Broader user volume increases risk; community rules and incident escalation
  should be user-facing before invite expansion.

Verification artifacts:

- Active direction avoids proof uploads.
- Historical proof-upload code/storage/admin controls still impose retention,
  deletion, access logging, and private-storage obligations if ever reactivated.

Admin/operator access:

- Operator access is explicit-scope backed, and T26E-A smoke verified temporary
  `operator.community_moderation` restoration.
- Token rotation remains a security hygiene requirement because a Supabase token
  was pasted into the work lane.

## Recommended Next Step

Fix policy/ops gaps first through a smaller docs/legal copy pass before starting
DFW Channel comments/replies.

Reason: the DFW Hub has enough user-generated content capability to require
clear beta terms, privacy notice, community rules, report handling, appeals,
support, and incident ownership before inviting more users. Comments/replies
would increase moderation load and evidence-retention complexity before those
operating guardrails are explicit.

## Product Boundaries To Preserve

Do not add or propose as part of this readiness lane:

- airline portal login
- schedule scraping
- roster/calendar integrations
- public nearby crew tracking
- dating/swiping
- exact public crew hotel exposure
- passenger private information
- airport/security procedures
- live operations-sensitive information
- confidential company documents
- AI auto-approval of verification
- AI final bans without human/admin review
- full marketplace payments in V1

## Documentation Governance

Docs Updated:

- `docs/BUILD_TICKETS.md`
- `docs/BETA_READINESS_CHECKLIST.md`
- `docs/PRIVATE_BETA_OPERATING_PLAN.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/hub-pivot-plan.md`
- this audit

Docs Not Updated / Why:

- `docs/DATA_MODEL.md` was not updated because this audit introduces no schema,
  table, RPC, migration, or runtime data model change.
- `docs/DEPLOYMENT_AND_WAITLIST_READINESS.md` was inspected but not updated
  because it remains public waitlist/deployment focused; this audit concerns
  private-beta policy/ops readiness after DFW Hub baseline work.
- Broad roadmap docs were not rewritten because this is a focused
  launch-readiness audit.

Scope Impact:

- Docs-only private-beta policy/ops readiness audit.
- No app behavior, migration, runtime data, tests, deployment, or configuration
  changed.

Runtime Apply Docs Needed?

- No. This audit has no runtime migration or runtime apply.

Browser Smoke Docs Needed?

- No for this docs-only audit. Future policy/ops copy implementation may need
  browser smoke after deployment.

## Status

DFW Hub baseline and T26E-A reporting/moderation foundation are functionally
smoked, but broader private-beta use should wait for the must-have policy/ops
items above.
