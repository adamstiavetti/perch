# Private Beta Readiness Bridge

Date: 2026-06-08

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Purpose

This bridge reconciles the current post-Epoch-5 repo state with the broader
private-beta planning docs.

It defines the narrow lane between the closed Epoch 5 operator/admin/security
closeout and the broader `05B / Community Access Architecture` implementation
lane.

Use this doc when deciding what "private beta readiness" means right now. Do
not read the broader private-beta docs as immediate implementation scope unless
this bridge or a newer roadmap doc explicitly says so.

## 2. Executive Summary

Epoch 5 is closed with explicit carry-forward items.

jmpseat is not yet claiming readiness for a real broader private beta user
population. The current repo supports:

- public waitlist/marketing on `jmpseat.com` and `www.jmpseat.com`
- private beta/auth/admin on `beta.jmpseat.com`
- stable auth/onboarding/access-hold foundations
- bounded operator/admin tooling and related security hardening

The immediate next lane is a narrow private beta readiness bridge, not broad
community/baseboard implementation.

The bridge exists to:

- confirm what is actually implemented today
- keep deprecated proof-system safety obligations visible without treating proof
  uploads as the active product path
- track deferred auth/email trust, deliverability, and polish work
- prevent broader beta docs from being misread as current-ready scope
- define the stop conditions before moving into `05B`

## 3. What Is Actually Implemented Today

Current implemented/runtime-proven baseline:

- `jmpseat.com` and `www.jmpseat.com` serve the public waitlist/marketing page.
- `beta.jmpseat.com` remains the private beta/auth/admin surface.
- Public waitlist capture is live with optional follow-up survey.
- Public root has no Beta Access CTA, no `/login?next=/app` CTA, and no
  proof/badge/document/manual-review upload copy.
- Initial-scroll bug on the public page is fixed live.
- Duplicate waitlist survey-token hardening is deployed and runtime-proven.
- Stable beta auth flow is founder-confirmed at runtime.
- `/app/access-hold` is the canonical airline employee email verification and
  beta-status surface.
- Work-email verification is code-first and inline on `/app/access-hold`.
- Normal account signup confirmation is code-first through Supabase Auth-native
  flow.
- Founder/admin internal private-app access uses explicit operator grants.
- Private-app operator override now requires the dedicated
  `operator.internal_private_app_access` scope.
- Trusted `security_events` boundary hardening is deployed and runtime-proven.
- Proof-upload content validation is deployed and test-covered as historical
  hardening, but proof uploads are deprecated/out of current scope for the
  active private beta / 05B path.
- Security headers are live on public and beta routes.
- Beta Preview Supabase env scoping is fixed persistently in Vercel Preview.

## 4. What Epoch 5 Closed

Epoch 5 closed the bounded operator/admin/security hardening lane.

Closed live:

- public root/www waitlist launch and preservation
- public initial-scroll hotfix
- duplicate waitlist survey-token hardening
- operator private-app scope gate hardening
- `security_events` trust-boundary hardening
- security headers hardening
- persistent beta Preview Supabase env scoping

Historical / deprecated for the current path:

- proof-upload content validation is deployed and test-covered. The old safe
  live authenticated proof-upload mutation test is no longer an active next
  task, blocker, or prerequisite before 05B because proof uploads are not part
  of the current product path.

## 5. What Private Beta Readiness Means Right Now

Narrowly, private beta readiness now means:

- the repo has a truthful post-Epoch-5 operating baseline
- proof-upload code/storage/artifacts, if still present, remain covered by the
  historical privacy/security controls without becoming active product scope
- branded sender/custom SMTP/email template polish is tracked as a deferred
  beta-readiness TODO, not as missing auth-flow implementation
- beta deployment/runtime caveats are documented
- the roadmap clearly separates immediate readiness work from later 05B
  community/baseboard implementation

It does not yet mean:

- jmpseat is ready for a real broad private beta invite wave
- the broader private-beta feature set in older docs is fully implemented
- community boards, posting, moderation, or community-admin tools are ready
- proof uploads are part of the current verification path

## 6. What Private Beta Readiness Explicitly Does Not Mean Yet

This bridge does not mean:

- airline portal login
- schedule scraping
- roster/calendar integrations
- public live crew tracking
- dating/swiping
- exact public crew hotel exposure
- passenger private information handling beyond current policy boundaries
- airport security procedure handling beyond current policy boundaries
- live ops-sensitive community launch
- AI final verification decisions
- AI final moderation/ban decisions
- broad UGC/community launch without moderation/admin gates

It also does not mean the proof bucket is public or that proof files should be
used as a forward product path.

## 7. How To Read The Broader Beta Docs

`docs/BETA_READINESS_CHECKLIST.md` and
`docs/PRIVATE_BETA_OPERATING_PLAN.md` remain useful as broader/full-beta target
references.

They should currently be read as:

- aspirational/full-beta references
- later-lane planning inputs
- not the immediate post-Epoch-5 implementation scope

In particular, community boards, restricted-board gates, posting, comments,
moderation, community-admin tooling, and broader launch-density assumptions
belong to `05B / Community Access Architecture`, not this bridge.

## 8. Carry-Forward Items From Epoch 5

These remain current carry-forward items:

1. Proof uploads remain deprecated/out of current scope. The old safe live
   authenticated proof-upload mutation test is no longer active. Historical
   proof-upload hardening and privacy/security requirements still apply to any
   existing code, storage, or artifacts.
2. Deferred branded sender/custom SMTP/email template polish for trust,
   deliverability, and product quality. This is not an auth-flow implementation
   blocker by itself.
3. Future CSP reporting/enforcement planning. The broad CSP remains
   report-only.
4. Future Vercel deployment-model maturity decision. This is deferred ops work,
   not an immediate blocker.
5. Existing Supabase migration-history drift. Continue targeted migration apply
   only until explicitly resolved.

## 9. First Bridge Tasks

Recommended bridge tasks:

1. `Private Beta Readiness Checklist Reconciliation`
2. `Auth Email Branding / Confirmation Template Deferred TODO Tracking`
3. `Proof Upload Deprecated Scope Alignment`
4. `Post-Bridge 05B Entry Decision`

Task notes:

- Auth email branding/custom SMTP is a deferred trust/deliverability/polish
  TODO. It should not be described as building auth emails from scratch.
- The current readiness package for that task lives in
  `docs/ops/auth-email-branding-confirmation-template-plan.md`.
- Proof upload live mutation testing is no longer an active next task or
  blocker. Any future manual-proof/document-upload workflow requires a fresh
  scope decision and privacy/security review.
- The Vercel deployment-model decision is intentionally not a bridge blocker.

## 10. Which Task Should Come First And Why

Recommended first task:

`Private Beta Readiness Checklist Reconciliation`

Why:

- auth email flows already exist and work
- account signup confirmation and work-email verification are code-first with
  six-digit codes
- password reset remains link-driven through the existing recovery flow
- branded sender/custom SMTP/email template polish is deferred trust and
  deliverability work, not the next active auth implementation task
- proof uploads are deprecated/out of current scope, so the old live mutation
  test should not gate 05B
- checklist reconciliation is narrower and lower-risk than moving directly into
  05B implementation

## 11. Required User Decisions Before Implementation

Before implementation starts, the user should decide:

1. Whether any future manual-proof/document-upload workflow should ever be
   reactivated. If yes, it needs a fresh scope decision and privacy/security
   review before any runtime work.
2. Whether to keep auth email branding/custom SMTP deferred or explicitly
   activate a later docs/settings ops task for trust and deliverability polish.
3. Whether the broader private-beta docs should remain aspirational references
   or be narrowed later to reflect a smaller near-term beta target.
4. Whether 05B should begin immediately after the bridge or pause for more
   beta-readiness/auth operations work.

## 12. Stop Conditions Before Moving Into 05B

Do not move into broader `05B / Community Access Architecture` work if:

- repo docs still misstate the existing auth email flows or treat deferred
  sender/template polish as missing auth implementation
- repo docs still present proof-upload mutation testing as an active blocker or
  prerequisite rather than historical/deprecated proof-system scope
- the repo docs still imply a broader current beta scope than the product
  actually supports
- the user has not decided whether the broader beta docs remain aspirational or
  should be narrowed

## 13. Current Doc Inconsistencies

This bridge resolves or flags these inconsistencies:

- `docs/epochs/first-base-mvp-implementation-ticket-pack.md` still described
  the app-generated work-email confirmation flow as pending review/merge/
  migration/runtime validation, while newer roadmap and auth-closeout docs
  describe the current auth flow as implemented and founder-confirmed on beta.
- `docs/ops/epoch-5-level-set.md` still used stale next-step language that
  pointed to a final Epoch 5 handoff/bridge framing even though the final
  closeout already exists.

Historical implementation docs may still describe earlier pre-runtime states.
Treat the newer closeout/runtime docs and this bridge as the controlling source
for immediate next-lane planning unless a newer doc supersedes them.

## 14. Next Lane After The Bridge

After the bridge, the next broader implementation lane remains:

`05B / Community Access Architecture`

That lane covers:

- general baseboards
- restricted-board gates and access requests
- community-admin authority
- text-first board content
- moderation/reporting foundation for real community surfaces

Those items are explicitly not part of this bridge unless a newer roadmap doc
changes scope.
