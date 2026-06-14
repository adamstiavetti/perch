# Policy/Ops Pack v1 UI Wiring

Date: 2026-06-14

Repo checkpoint: `2aca2e6 docs: add private beta policy ops pack`

## Purpose

This record documents the narrow UI wiring for Policy/Ops Pack v1.

The work makes the approved-draft private-beta policy/copy pack visible in the
product without adding policy acceptance tracking, database tables, migrations,
runtime data mutation, support form backend, or legal-final claims.

## Routes Added

Public read-only policy routes:

- `/legal/beta-terms`
- `/legal/privacy`
- `/legal/community-rules`
- `/legal/verification-privacy`
- `/legal/moderation-appeals`
- `/legal/support-requests`

Implementation files:

- `app/legal/PolicyPage.tsx`
- `app/legal/policyContent.ts`
- `app/legal/beta-terms/page.tsx`
- `app/legal/privacy/page.tsx`
- `app/legal/community-rules/page.tsx`
- `app/legal/verification-privacy/page.tsx`
- `app/legal/moderation-appeals/page.tsx`
- `app/legal/support-requests/page.tsx`
- `app/legal.module.css`

The pages use private-beta draft framing and state that the copy is not legal
advice, not final legal terms, and still needs founder/legal review before broad
launch.

## Surfaces Linked

Public waitlist:

- waitlist consent copy links to `/legal/beta-terms`
- footer links to beta terms, beta privacy, community rules, and support
  requests

Auth/private-beta entry:

- `/login` links to private beta terms, privacy notice, and community rules
- `/signup` links to private beta terms, privacy notice, and verification
  privacy

Verification/access hold:

- `/app/access-hold` explains that work-email verification keeps public identity
  safe while remaining accountable internally
- copy warns users not to submit passwords, airline portal credentials,
  employee numbers, schedules, or confidential documents
- copy links to `/legal/verification-privacy`

DFW Channels:

- selected-channel composer links to `/legal/community-rules`
- selected-channel post report UI links to `/legal/moderation-appeals`
- report copy states reporter identity and public report counts are not shown

Admin/community moderation:

- operator-scoped community moderation footer links to moderation/appeals and
  support/request drafts
- no operator actions were expanded

## Still Unwired

Still not implemented:

- policy acceptance tracking
- acceptance database table
- support/contact form backend
- deletion/export request intake
- appeal intake
- approved final contact paths
- footer/onboarding links beyond the focused MVP surfaces listed above
- final legal approval

## Scope Boundaries

This wiring preserves:

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
- no AI final moderation or verification decisions
- no marketplace/payments scope

This wiring does not change:

- auth/session behavior
- verification runtime behavior
- report/moderation runtime behavior
- operator grants
- public-domain/proxy gates
- database schema
- Supabase runtime state

## Tests

Focused source test added:

- `test/private-app/policyPages.test.mts`

The test covers:

- policy/legal routes exist
- headings and related policy links render from shared content
- public/auth surfaces link to policy pages
- access-hold verification copy warns against portal credentials
- Channel composer links to community rules
- Channel report UI links to moderation/appeals
- admin moderation links to policy drafts without expanding actions
- no policy acceptance table/migration is added
- proof upload is not surfaced as live

## Documentation Governance

Docs Updated:

- `docs/BUILD_TICKETS.md`
- `docs/BETA_READINESS_CHECKLIST.md`
- `docs/PRIVATE_BETA_OPERATING_PLAN.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/policy-ops-pack-v1-summary.md`
- this record

Docs Not Updated / Why:

- `docs/DATA_MODEL.md` was not updated because no schema, table, RPC,
  migration, policy acceptance model, or runtime data model changed.
- Runtime-apply docs were not created because no runtime apply is needed.
- Browser-smoke docs were not created in this implementation task because smoke
  must happen after deployment.

Scope Impact:

- Policy page/link/copy wiring only.
- No database, runtime, auth/session, verification-runtime, moderation-runtime,
  operator-grant, support-backend, or deployment change.

Runtime Apply Docs Needed?

- No. No migration or runtime apply was introduced.

Browser Smoke Docs Needed?

- Yes. Browser smoke is needed after deployment to verify the public policy
  routes, links from public/auth/access-hold/Channels/admin surfaces, and
  domain-boundary behavior.

## Status

Policy/Ops Pack v1 UI wiring is ready for review. The policy pages remain draft
private-beta copy and should not be treated as final legal approval.
