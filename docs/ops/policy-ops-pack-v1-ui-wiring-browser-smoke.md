# Policy/Ops Pack v1 UI Wiring Browser Smoke

Date: 2026-06-14

Repo checkpoint during smoke: `21f2e58 feat: wire private beta policy pages`

Target host: `https://beta.jmpseat.com`

## Purpose

This docs-only record captures browser smoke for the Policy/Ops Pack v1 UI
wiring on beta.

The smoke verifies that the private-beta policy pages and focused policy links
render on deployed beta without adding policy acceptance tracking, support
backend behavior, runtime mutation, or new sensitive exposure.

## Repo State

- repo root: `/Users/ClawdBot/jmpseat-public-scroll`
- branch: `main`
- worktree: clean during smoke
- HEAD/origin: `21f2e58`

No files were changed, staged, or committed during the browser smoke.

## Deployment Tested

- host: `https://beta.jmpseat.com`
- deployment contains Policy/Ops UI wiring because:
  - `/legal/beta-terms` rendered
  - updated legal links appeared on public/auth surfaces

## Public Legal Route Result

Status: passed.

The following routes rendered publicly without auth, generic error, secrets,
private app data, or legal-finality claims:

- `/legal/beta-terms`
- `/legal/privacy`
- `/legal/community-rules`
- `/legal/verification-privacy`
- `/legal/moderation-appeals`
- `/legal/support-requests`

Each route showed the expected heading and private-beta/draft framing. Related
policy links were present. The support page clearly stated that
support/contact paths are still being finalized.

## Public/Auth Link Result

Status: passed.

`/` includes Private Beta Terms plus footer links for:

- Beta Terms
- Beta Privacy
- Community Rules
- Support

`/login` links:

- Private Beta Terms
- Privacy Notice
- Community Rules

`/signup` links:

- Private Beta Terms
- Privacy Notice
- Verification & Privacy

No auth behavior change was observed.

## Access-Hold / Verification Copy Result

Status: limited.

The active authenticated Chrome session redirected direct `/app/access-hold` to
`/app`, so the access-hold verification copy was not visible in browser under
this account state.

No proof upload or policy acceptance surfaced in the active app redirect.

Future browser smoke may recheck `/app/access-hold` with an account state that
naturally lands on access-hold.

Follow-up note: `docs/ops/qa-pol-01-limited-policy-ui-smoke.md` records a
focused re-smoke attempt after `4ddf345`. The available session still redirected
`/app/access-hold` to `/app`, so this limitation remains open.

## Channel Composer Policy Link Result

Status: passed.

Authenticated `/app/hubs/dfw/channels/dfw-q-and-a` rendered the composer with a
Community Rules link pointing to `/legal/community-rules`.

No post was created. No comments/replies were added.

## Report UI Policy Link Result

Status: passed.

The existing DFW Q&A post detail route rendered the report UI with a Moderation
& Appeals link pointing to `/legal/moderation-appeals`:

- `/app/hubs/dfw/channels/dfw-q-and-a/b7a56588-3050-409e-87ef-5ac869b72895`

No report was submitted. No reporter identity, internal IDs, raw errors, or
secrets were visible.

The page text says public report counts are not live/not shown. No actual
public count was rendered.

## Admin Moderation Policy Link Result

Status: limited.

The current authenticated session was not operator-scoped. Direct access to
`/app/admin/community-moderation` redirected to `/app/access-restricted`.

The non-operator gate passed. Operator-scoped policy-link visibility remains
pending unless an operator session is available.

No moderation data or actions were exposed to the non-operator session.

Follow-up note: `docs/ops/qa-pol-01-limited-policy-ui-smoke.md` records a
focused re-smoke attempt after `4ddf345`. The available session still redirected
`/app/admin/community-moderation` to `/app/access-restricted`, so operator
policy-link visibility remains open.

## Public-Domain Boundary Result

Status: passed.

- `https://jmpseat.com/legal/beta-terms` canonicalized to
  `https://www.jmpseat.com/legal/beta-terms` and rendered the legal page.
- `https://www.jmpseat.com/legal/beta-terms` rendered.
- Public-domain private app post detail routes redirected/resolved to
  `https://www.jmpseat.com/`.
- Private app content was not exposed on the public domain.

## Product / Safety Boundary Checks

No new visible behavior was observed for:

- policy acceptance tracking
- support backend/form
- deletion/export automation
- proof upload activation
- airline portal login
- schedule scraping
- public crew tracking
- exact crew hotel exposure
- passenger private info
- airport/security procedures
- live ops-sensitive information
- confidential company docs
- AI final moderation/verification decisions
- marketplace/payments
- comments/replies

## Unexpected Findings

Two limited areas were caused by the current session state:

- `/app/access-hold` copy could not be directly viewed because the active
  account redirects to `/app`.
- admin moderation policy-link visibility could not be verified because the
  current account is non-operator; the gate correctly denied access.

## Documentation Governance

Docs Updated:

- `docs/BUILD_TICKETS.md`
- `docs/BETA_READINESS_CHECKLIST.md`
- `docs/PRIVATE_BETA_OPERATING_PLAN.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/policy-ops-pack-v1-summary.md`
- `docs/ops/policy-ops-pack-v1-ui-wiring.md`
- this record

Docs Not Updated / Why:

- `docs/DATA_MODEL.md` was not updated because no schema/data-model behavior
  changed.
- Runtime-apply docs were not created because no migration or runtime apply is
  needed.

Scope Impact:

- Docs-only browser-smoke record.
- No app code, migrations, tests, runtime data, deployment, policy acceptance,
  support backend, verification runtime, reporting runtime, moderation runtime,
  or operator-grant behavior changed in this docs task.

Runtime Apply Docs Needed?

- No. No migration or runtime apply is needed.

Browser Smoke Docs Needed?

- Mostly satisfied for Policy/Ops Pack v1 UI wiring by this record.
- Future focused browser smoke may recheck access-hold verification copy with
  an access-hold account state and operator-scoped admin moderation policy-link
  visibility with an operator session.

## Status

Policy/Ops Pack v1 UI wiring browser smoke passed for public legal routes,
public/auth links, Channel composer policy link, report UI policy link,
public-domain boundary behavior, and product/safety boundaries.

The access-hold verification copy and operator-scoped admin moderation
policy-link checks remain limited/pending because of session state.
