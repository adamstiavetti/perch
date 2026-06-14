# Policy/Ops Pack v1 Summary

Date: 2026-06-14

Repo checkpoint: `b06db28 docs: audit private beta policy ops readiness`

## Purpose

This docs-only summary records Policy/Ops Pack v1 for jmpseat private beta.
The pack converts the private-beta policy/ops readiness audit into draft
product copy and operating runbooks.

Initial docs creation did not wire pages, buttons, forms, routes, footer links,
onboarding links, policy acceptance, database tables, migrations, runtime
behavior, or deployment changes.

Follow-up UI wiring is recorded in
`docs/ops/policy-ops-pack-v1-ui-wiring.md`. That follow-up adds public
read-only policy routes and focused links from public, auth, verification,
Channel composer/reporting, and admin moderation surfaces. It still does not
add policy acceptance tracking, support form backend, deletion/export backend
intake, appeal backend intake, database tables, migrations, runtime behavior,
response-time commitments, or final legal approval.

OPS-INTAKE-01 copy wiring adds the selected manual MVP contact paths to public
legal content and policy/runbook drafts: `support@jmpseat.com` once configured,
`privacy@jmpseat.com` once configured, fallback privacy/deletion/export subject
prefixes through support, and `[Moderation Appeal]` manual appeal routing. This
copy wiring does not add a support form, deletion/export backend, appeal
backend, policy acceptance tracking, database tables, migrations, runtime
behavior, response-time promises, or legal approval.

## Created Drafts

Policy/copy drafts:

- `docs/policy/PRIVATE_BETA_TERMS_DRAFT.md`
- `docs/policy/PRIVACY_NOTICE_DRAFT.md`
- `docs/policy/COMMUNITY_RULES_DRAFT.md`
- `docs/policy/VERIFICATION_CONSENT_COPY_DRAFT.md`

Operations runbooks:

- `docs/policy/MODERATION_AND_APPEALS_RUNBOOK.md`
- `docs/policy/SUPPORT_INCIDENT_DELETION_RUNBOOK.md`
- `docs/policy/OPERATOR_MODERATION_RUNBOOK.md`

Summary:

- `docs/ops/policy-ops-pack-v1-summary.md`

## Ready As Draft Copy

The pack now has draft text for:

- private-beta access and beta instability
- verified aviation-worker community framing
- public anonymity with internal accountability
- acceptable use and prohibited conduct
- aviation-sensitive content boundaries
- no-affiliation and not-operational-source disclaimers
- user content responsibility
- report handling expectations
- work-email verification consent/caveat
- future proof-upload copy if reactivated
- privacy notice coverage for private app data classes
- support, incident, deletion/export, moderation, appeal, and operator workflows

## Still Needs Founder / Legal / Policy Review

Before broader private-beta use:

- approve or revise private-beta terms
- approve or revise private-beta privacy notice
- approve community rules
- approve verification consent copy
- fill support/escalation owner placeholders
- approve response-time targets
- approve deletion/export handling
- approve moderation and appeals process
- confirm token/access hygiene follow-up

This pack is not final legal advice and should not be presented as final legal
terms without review.

## Still Needs Implementation / Wiring

Future implementation tasks may need to:

- expand policy links into any remaining onboarding, settings, help, or support
  surfaces once those surfaces are approved
- add policy acceptance if required
- add support/contact backend or form intake if required
- add deletion/export request backend intake if required
- add appeal backend intake if required
- confirm inbox configuration, owner, and monitoring cadence
- add admin/operator checklist links where appropriate
- browser-smoke the copy after it is wired

The first wiring pass added policy routes and focused links, but it did not add
runtime acceptance, support intake, deletion/export intake, appeal intake, or
final legal approval.

OPS-INTAKE-01 copy wiring adds the manual intake language only; it still does
not add backend intake, automated deletion/export, in-app appeal workflow,
policy acceptance tracking, or final legal approval.

## Deferred Scope

Still deferred:

- DFW Channel comments/replies
- Request a Channel workflow
- AI/Jumpseat Brief
- NonRev Deals
- payments/marketplace
- live integrations
- proof uploads unless reactivated after fresh review
- final public-launch legal terms

## Current Product Boundaries

This pack preserves:

- verified privately
- anonymous publicly
- accountable internally
- utility first, community second, social feed last
- no airline portal login
- no schedule scraping
- no public nearby crew tracking
- no dating/swiping
- no exact public crew hotel exposure
- no passenger private information
- no airport/security procedures
- no live operations-sensitive information
- no confidential company documents
- no AI auto-approval of verification
- no AI final bans without human/admin review
- no full marketplace payments in V1

## Evidence Sources

This pack is grounded in:

- `docs/ops/private-beta-policy-ops-readiness-audit.md`
- `docs/LEGAL_POLICY_REQUIREMENTS.md`
- `docs/PRIVATE_BETA_OPERATING_PLAN.md`
- `docs/BETA_READINESS_CHECKLIST.md`
- `docs/DEPLOYMENT_AND_WAITLIST_READINESS.md`
- `docs/PRIVATE_APP_AUTH_DB_ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
- `docs/ops/fbmvp-checkpoint-dfw-hub-baseline-pillars-complete.md`
- `docs/ops/fbmvp-t26e-a-channel-post-reporting-final-browser-smoke.md`
- current app copies and route/access helpers inspected for private-app,
  community, admin, and domain-boundary behavior

## Documentation Governance

Docs Updated:

- `docs/BUILD_TICKETS.md`
- `docs/BETA_READINESS_CHECKLIST.md`
- `docs/PRIVATE_BETA_OPERATING_PLAN.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/policy-ops-pack-v1-ui-wiring.md`
- this summary
- the seven policy/runbook drafts listed above

Docs Not Updated / Why:

- `docs/DATA_MODEL.md` was not updated because this pack adds no schema, table,
  RPC, migration, runtime data model, or runtime behavior.
- Broad roadmap docs were not rewritten because this is a focused policy/ops
  pack.
- App code and tests were not updated in the original docs-only pack. The
  focused UI wiring is tracked separately in
  `docs/ops/policy-ops-pack-v1-ui-wiring.md`.

Scope Impact:

- Original pack: docs/copy only.
- UI wiring follow-up: policy page/link/copy wiring only.
- No migrations, runtime data, deployment, policy acceptance, or support backend
  changed.

Runtime Apply Docs Needed?

- No. This pack has no migration or runtime apply.

Browser Smoke Docs Needed?

- Mostly satisfied by
  `docs/ops/policy-ops-pack-v1-ui-wiring-browser-smoke.md`. Public legal
  routes, public/auth links, Channel composer/report policy links,
  public-domain boundary behavior, and product/safety boundaries passed.
  Access-hold verification copy and operator-admin policy-link visibility remain
  limited by session state.

## Status

Policy/Ops Pack v1 has draft copy plus narrow UI wiring and beta browser smoke
with the limitations above. It remains pending founder/legal/policy review
before broader private-beta use.
