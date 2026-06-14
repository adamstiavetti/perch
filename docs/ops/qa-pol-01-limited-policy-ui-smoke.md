# QA-POL-01 Limited Policy UI Smoke

Date: 2026-06-14

## Commit / Deployment Tested

- Repo root: `/Users/ClawdBot/jmpseat-public-scroll`
- Branch: `main`
- Commit: `4ddf345 docs: record ops intake browser smoke`
- HEAD/origin during smoke: `4ddf345`
- Deployment: `https://beta.jmpseat.com`
- Scope: focused re-smoke attempt for the two remaining Policy UI limitations
  from the Policy/Ops UI wiring browser smoke.

## Routes Tested

- `https://beta.jmpseat.com/app/access-hold`
- `https://beta.jmpseat.com/app/admin/community-moderation`

## Access-Hold Smoke Result

Status: limited, not closed.

The active authenticated Chrome session redirected direct `/app/access-hold` to
`/app`, which rendered the DFW Hub surface.

This means the current account is app-eligible and does not naturally land on
access-hold. No access-hold policy/verification copy was visible under this
session state.

No unsafe DB/auth mutation was attempted.

Future smoke still needs an account/session that naturally renders
`/app/access-hold`.

## Operator Admin Policy-Link Smoke Result

Status: limited, not closed.

The active authenticated Chrome session redirected
`/app/admin/community-moderation` to `/app/access-restricted`.

This confirms the non-operator gate remains intact. The operator moderation page
did not render, so operator-scoped policy-link visibility remains open.

No destructive moderation action was clicked.

Future smoke still needs an operator-scoped session with
`operator.community_moderation`.

## Session/Scope Handling

The existing Chrome session was used read-only. It was:

- app-eligible for normal private app access
- not in access-hold state
- not operator-scoped for `operator.community_moderation`

No temporary operator grant was created. No grant state was inspected or changed.
No Supabase mutation was performed.

## Public/Auth Boundary Verification

Passed:

- No-cookie `/app/access-hold` returned HTTP 307 to
  `/login?next=%2Fapp%2Faccess-hold`.
- No-cookie `/app/admin/community-moderation` returned HTTP 307 to
  `/login?next=%2Fapp%2Fadmin%2Fcommunity-moderation`.
- Private app auth gating remains intact.
- Non-operator admin access redirected to `/app/access-restricted`.

## Negative Boundary Verification

Passed for the limited surfaces reached:

- No unauthorized private app surface was exposed.
- No reporter identity, author user IDs, private IDs, secrets, signed URLs, or
  storage paths were visible.
- No proof-upload expansion surfaced.
- No AI final-decision claim surfaced.
- No support/appeal backend claim surfaced.
- No account ban/suspension workflow surfaced.
- No posts, reports, comments, grants, accounts, Supabase state, migrations,
  deploys, or runtime settings were changed.

## Runtime/Data Mutation Statement

No runtime or data mutation occurred.

No posts, reports, comments, grants, accounts, Supabase state, migrations,
deploys, or runtime settings were changed.

## Issues Found

No product/security issue was found.

The smoke could not close the two target limitations because the available
session states were not suitable.

## Remaining Limitations

- `/app/access-hold` still needs an account/session that naturally renders
  access-hold.
- `/app/admin/community-moderation` policy links still need an operator-scoped
  session with `operator.community_moderation`.

## Result

Limited/partial smoke recorded.

The non-operator admin gate, no-cookie auth gates, no-sensitive-leakage boundary,
and no-runtime-mutation boundary passed. The access-hold policy/verification
copy visibility and operator policy-link visibility limitations remain open.
