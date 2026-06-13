# FBMVP-T26E-A: Channel Post Reporting Partial Browser Smoke

Date: 2026-06-13

Repo checkpoint during smoke: `8512a9e docs: record channel post reporting runtime apply`

Target host: `https://beta.jmpseat.com`

## Purpose

This record captures the first authenticated beta browser smoke for
FBMVP-T26E-A after the channel post reporting RPCs were applied to runtime.

This is a partial browser smoke, not full T26E-A closure. User-side report
submission, duplicate-safe behavior, no-cookie/public-domain boundaries, and
non-operator admin denial passed. Operator/admin moderation review was not
completed because the available authenticated Chrome session was not
operator-scoped.

## Repo State

- Repo root: `/Users/ClawdBot/jmpseat-public-scroll`
- Branch: `main`
- Worktree: clean during smoke
- HEAD/origin: `8512a9e`

## Deployment Tested

Beta deployment evidence:

- DFW Channel post detail rendered the new report affordance.
- Operator review surface could not be fully verified because the available
  Chrome session was not operator-scoped.

## Test Post Used

- Channel: `dfw-q-and-a`
- Post UUID: `b7a56588-3050-409e-87ef-5ac869b72895`
- Route:
  `/app/hubs/dfw/channels/dfw-q-and-a/b7a56588-3050-409e-87ef-5ac869b72895`

## Authenticated Report Flow

Passed for a normal verified/private-beta user.

The smoke submitted one `Privacy` report with this detail:

> Browser smoke test report for moderation flow.

The page rendered the safe success message:

> Thanks — this report was sent for review.

No raw SQL/error text, reporter identity, admin internals, or visible internal
IDs appeared.

## Duplicate Report Flow

Passed.

A second report attempt by the same authenticated user returned the safe
duplicate state:

> You already reported this post.

No public report count and no raw error appeared.

## No-Cookie / Public-Domain Boundary

Passed.

- No-cookie beta detail route returned `307` to login with `next`.
- `jmpseat.com` canonicalized to `www.jmpseat.com`.
- `www.jmpseat.com` private app route returned `307` to `/`.
- The private app route was not exposed on the public domain.

## Operator Moderation Review

Not completed.

The available authenticated Chrome profile redirected from
`/app/admin/community-moderation` to `/app/access-restricted`. No moderation
report data was exposed to that non-operator session.

Full T26E-A browser smoke remains pending until an operator-scoped session
verifies the moderation review surface.

## Non-Operator Admin Boundary

Passed.

Non-operator access was denied through the existing restricted-access flow.

## Product Boundary Checks

The smoke did not show:

- comments/replies UI
- account-ban action
- AI moderation decision
- public moderation feed
- Request a Channel workflow
- NonRev Deals
- payments/marketplace behavior
- public report counts

## Safety / Privacy Checks

The smoke did not visibly expose:

- reporter identity
- author user ID
- board/base/parent IDs
- proof data
- storage paths
- signed URLs
- passenger private information
- company-confidential content
- exact crew hotel exposure
- live operations data
- security-sensitive procedures

## Unexpected Findings

- Operator/admin moderation review remains pending because no operator-scoped
  browser session was available.
- Boundary copy mentions that public report counts are not live; no actual
  public count was rendered.

## Runtime Mutation Note

One authorized report submission was created as required by this browser smoke.

No schema mutation, migration apply, broad database push, deploy, file changes,
or commit occurred during the smoke.

## Documentation Governance

Docs Updated:

- `docs/BUILD_TICKETS.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/fbmvp-t26e-a-channel-post-reporting-moderation-foundation.md`
- `docs/ops/hub-pivot-plan.md`
- this partial browser-smoke record

Docs Not Updated / Why:

- `docs/DATA_MODEL.md` was not updated because no schema/data-model status
  marker changed in this docs-only browser-smoke record.
- Broad roadmap docs were not rewritten.

Scope Impact:

- Docs-only partial browser-smoke record for T26E-A.
- Does not close full T26E-A browser smoke because operator moderation review
  remains pending.

Runtime Apply Docs Needed?

- No. Runtime apply docs are already satisfied by
  `docs/ops/fbmvp-t26e-a-channel-post-reporting-runtime-apply.md`.

Browser Smoke Docs Needed?

- Yes. Full browser smoke docs are still needed after an operator-scoped session
  verifies the DFW Channel report moderation review surface.

## Status

Partial browser smoke recorded. User-side report flow, duplicate-safe behavior,
no-cookie/public-domain boundaries, and non-operator admin boundary passed.
Operator-scoped moderation review remains pending.

Follow-up final operator-scoped browser smoke is recorded in
`docs/ops/fbmvp-t26e-a-channel-post-reporting-final-browser-smoke.md`. The
operator moderation-review gap from this partial smoke is now closed.
