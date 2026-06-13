# FBMVP-T26E-A: Channel Post Reporting Final Browser Smoke

Date: 2026-06-13

Repo checkpoint during smoke:
`a9c9d14 docs: record partial channel reporting browser smoke`

Target host: `https://beta.jmpseat.com`

## Purpose

This record closes the remaining operator-scoped browser-smoke gap for
FBMVP-T26E-A. The prior partial smoke already verified user report submission,
duplicate-safe report state, no-cookie/public-domain boundaries, and
non-operator admin denial. This final smoke verifies the operator moderation
review surface.

T26E-A is now browser-smoked for the channel post reporting/moderation
foundation. Comments, account bans, AI moderation decisions, Request a Channel,
and public moderation feeds remain out of scope.

## Repo State

- Repo root: `/Users/ClawdBot/jmpseat-public-scroll`
- Branch: `main`
- HEAD/origin: `a9c9d14`
- Worktree: clean during smoke

## Prior Committed Status

- T26E-A implementation committed.
- Runtime apply documented and committed.
- Partial browser smoke documented and committed.
- Partial smoke already passed:
  - user report submission
  - duplicate-safe report state
  - no-cookie/public-domain boundaries
  - non-operator admin boundary

## Operator Grant Pattern

Operator/admin access is database-backed through `public.operator_grants`.
Active scopes come from `public.current_user_operator_scopes()`. Scope checks
use `public.is_operator_with_scope(required_scope text)`.

`/app/admin/community-moderation` requires `operator.community_moderation`.

## Temporary Operator Access

Target account: `adam@jmpseat.com`

An existing active operator grant already existed. Prior scopes were:

- `operator.internal_private_app_access`
- `operator.manage_operator_access`
- `operator.read_audit`
- `operator.view_waitlist_contacts`

The temporary update added only:

- `operator.community_moderation`

After the smoke, the exact prior scope list was restored and
`operator.community_moderation` was verified removed.

No second operator grant was created. No schema mutation, migration apply, broad
database push, deploy, file edit, or commit occurred during the smoke.

## Operator Moderation Review

Passed.

After the temporary scope update, the beta session reached:

- `/app/admin/community-moderation`

No access-restricted redirect occurred. The moderation surface rendered.

## DFW Channel Report Visibility

Passed.

The DFW Channel report appeared with safe context:

- Channel context: `DFW Q&A / dfw-q-and-a`
- Post: `DFW Q&A smoke test thread after redirect fix`
- Post UUID: `b7a56588-3050-409e-87ef-5ac869b72895`
- Reason: `Privacy`
- Detail: `Browser smoke test report for moderation flow.`
- Status/timing: `Report status: Open / reported Jun 13, 2026`

Safe post context rendered.

## Privacy / Safety Observations

The moderation review surface did not visibly expose:

- unnecessary reporter user ID
- author user ID
- board/base/parent IDs
- proof/verification data
- storage paths
- signed URLs
- raw SQL/errors
- private identity fields

## Moderation Action Boundary

Visible moderation actions were narrow:

- `Hide post`
- `Remove post`

Neither action was clicked. No destructive action was performed.

The smoke did not show:

- account-ban action
- AI final decision
- public moderation feed

## Product Boundary Checks

The smoke did not add or expose:

- comments/replies
- Request a Channel workflow
- NonRev Deals
- payments/marketplace behavior
- public report counts

## Documentation Governance

Docs Updated:

- `docs/BUILD_TICKETS.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/fbmvp-t26e-a-channel-post-reporting-moderation-foundation.md`
- `docs/ops/fbmvp-t26e-a-channel-post-reporting-partial-browser-smoke.md`
- `docs/ops/hub-pivot-plan.md`
- this final browser-smoke record

Docs Not Updated / Why:

- `docs/DATA_MODEL.md` was not updated because no schema/data-model marker
  changed for this docs-only browser-smoke result.
- Broad roadmap docs were not rewritten.

Scope Impact:

- Docs-only final browser-smoke record for T26E-A.
- Closes the prior operator-scoped moderation-review smoke gap.

Runtime Apply Docs Needed?

- No. Runtime apply docs are already satisfied by
  `docs/ops/fbmvp-t26e-a-channel-post-reporting-runtime-apply.md`.

Browser Smoke Docs Needed?

- Satisfied for T26E-A reporting/moderation foundation after this final record
  is reviewed and committed.

## Status

Final operator-scoped browser smoke passed. The prior partial-smoke gap is now
closed. Report submission, duplicate handling, non-operator boundary, and
operator moderation review path are browser-smoked for the T26E-A reporting and
moderation-review foundation.
