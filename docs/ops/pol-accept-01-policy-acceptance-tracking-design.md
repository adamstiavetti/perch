# POL-ACCEPT-01 Policy Acceptance Tracking Design

Date: 2026-06-14

Repo checkpoint: `8c16342 docs: record limited policy ui smoke`

## Purpose

This docs-only design packet defines the narrowest safe design for minimal
private-beta policy acceptance tracking before broader beta.

This packet does not implement schema, migrations, UI, server actions, RPCs,
runtime behavior, or legal approval. It is not legal advice.

## Current State

- Public policy pages exist at `/legal/beta-terms`, `/legal/privacy`, and
  `/legal/community-rules`, along with supporting policy pages for
  verification/privacy, moderation/appeals, and support/requests.
- Manual support, privacy/deletion/export, and moderation appeal intake copy is
  wired and browser-smoked in `docs/ops/ops-intake-01-browser-smoke.md`.
- No policy acceptance tracking currently exists.
- No support/contact/deletion/export/appeal backend intake exists.
- Legal-sensitive policy copy remains draft/founder/legal review material.
- Broader beta remains blocked until acceptance tracking is implemented or the
  founder explicitly accepts deferral risk.
- Comments/replies remain blocked until policy/ops readiness is accepted.
- QA-POL-01 access-hold and operator-admin policy-link checks remain limited
  because suitable session states were unavailable.

## Policy Documents To Track

Minimum MVP acceptance set:

- private beta terms
- privacy notice
- community rules

Do not require acceptance of every support/runbook page for MVP. Support,
verification/privacy, moderation/appeals, and support/requests pages should
remain linked and visible, but they should not be required acceptance records
unless founder/legal explicitly expands the acceptance set.

Reason: the minimum set covers access terms, data notice, and user conduct rules
without turning internal runbooks or operational placeholders into accepted
user-facing contract artifacts.

## Versioning Model

Recommended stable policy keys and initial versions:

- `private_beta_terms:v1`
- `privacy_notice:v1`
- `community_rules:v1`

Recommended implementation representation:

| Policy key | Current version | Public route |
| --- | --- | --- |
| `private_beta_terms` | `v1` | `/legal/beta-terms` |
| `privacy_notice` | `v1` | `/legal/privacy` |
| `community_rules` | `v1` | `/legal/community-rules` |

Future version handling:

- A new material version requires re-acceptance.
- Old acceptance records remain auditable and should not be overwritten.
- Policy content updates should deliberately bump version only when material.
- Cosmetic typo fixes can keep the same version if founder/legal agrees they do
  not change user obligations or data notice.
- Version strings should be controlled in one server-side allowlist, not passed
  freely from the client.

## Data Model Recommendation

Recommended minimal table: `public.user_policy_acceptances`.

Suggested fields:

| Field | Type | Recommendation |
| --- | --- | --- |
| `id` | `uuid` | Primary key, default `gen_random_uuid()`. |
| `user_id` | `uuid` | Not null, references `auth.users(id)` with delete behavior reviewed before implementation. |
| `policy_key` | `text` | Not null. Must be one of the allowed policy keys. |
| `policy_version` | `text` | Not null. Must be a known accepted version for that policy key. |
| `accepted_at` | `timestamptz` | Not null, default `now()`. |
| `accepted_ip_hash` | `text` | Nullable. Prefer omitting for MVP unless founder/legal/security requires it. Never store raw IP by default. |
| `user_agent_hash` | `text` | Nullable. Prefer omitting for MVP unless founder/legal/security requires it. Never store raw user agent by default. |
| `created_at` | `timestamptz` | Not null, default `now()`. |

Uniqueness:

- Add a unique constraint on `(user_id, policy_key, policy_version)`.

Suggested indexes:

- `(user_id, policy_key, policy_version)`
- `(user_id, accepted_at desc)` if audit reads need recent acceptance history.

Data minimization:

- Do not store raw IP addresses for MVP by default.
- Do not store raw user agents for MVP by default.
- If founder/legal/security requires device evidence, store only keyed hashes or
  stable digests after a separate privacy/security decision.
- Do not store public handles, work emails, profile labels, routes, or policy
  body snapshots in each row.

## RLS / Access Model

Recommended access posture:

- Enable RLS on `public.user_policy_acceptances`.
- Revoke broad table access from `anon`.
- Users may read their own acceptance records.
- Users may not update or delete acceptance records.
- Insert should be allowed only through a narrow server/RPC/action path, not
  broad direct client writes.
- Service role/operator read may be allowed only if needed for audit or support
  investigation; it must not become public exposure.
- No anon access.

Recommended SQL posture for future implementation:

- Create the table with RLS enabled.
- Grant minimal `select` to `authenticated` only if users need to read their own
  acceptance state directly.
- Prefer a server-controlled `accept_current_private_beta_policies` path that
  uses `auth.uid()` or server-authenticated user identity.
- Avoid `security definer` in exposed schema unless the current repo pattern and
  security review explicitly justify it. If used, keep `set search_path =
  public, pg_temp`, validate `auth.uid()`, revoke from `anon`, and grant only to
  `authenticated`.

## Server/API Recommendation

Recommended future mutation path: a narrow server action or RPC that accepts the
current required policies for the authenticated user.

Required behavior:

- Use authenticated user identity from the server session or `auth.uid()`.
- Accept only known current policy keys and versions from a server-side
  allowlist.
- Insert idempotently, using `on conflict do nothing` or equivalent.
- Do not allow accepting for another user.
- Return safe success/failure state only.
- Do not expose private IDs publicly.
- Do not accept arbitrary policy keys, versions, timestamps, IPs, user agents,
  or user IDs from client input.
- Do not treat the acceptance action as verification, beta approval, profile
  completion, or operator authorization.

Recommended read helper:

- A server-side helper should compute whether the current authenticated user has
  accepted all required current versions.
- The helper should return only a boolean or missing policy keys/versions needed
  by the route gate.

## UX / Route Gate Recommendation

Recommended route: `/app/policy-acceptance`.

Where acceptance should be required:

- After signup/login and before entering protected `/app` for otherwise
  app-eligible users.
- As an interstitial when an authenticated, app-eligible user lacks one or more
  current required acceptances.
- Existing beta users should be asked on next app entry if they are otherwise
  eligible and lack current acceptance records.

Where acceptance should not be required:

- Public legal pages.
- Login and signup pages.
- Password reset/auth callback routes.
- Routes that need to remain reachable to resolve account/access setup.

Recommended UX:

- Show concise acceptance copy with links to the three required public policy
  pages.
- Require an explicit checkbox or equivalent explicit action for the current
  set.
- The submit action records all missing current policy acceptances
  idempotently.
- After success, redirect to the originally requested protected app path.

Do not implement in this design lane.

## Interaction With Account States

Authenticated but not beta-approved:

- Policy acceptance should not grant private app access.
- Conservative default: do not force policy acceptance before a user can see the
  relevant hold/verification state unless founder/legal explicitly wants
  acceptance at account creation.

Access-hold users:

- Preserve access-hold behavior carefully.
- Conservative default: access-hold remains the state for users who are not yet
  app-eligible.
- Open question: require acceptance on access-hold, or wait until hold is
  resolved. Default recommendation is wait until app eligibility unless
  founder/legal wants acceptance earlier.

App-eligible users:

- App entry should require both app eligibility and required current policy
  acceptance.
- Missing acceptance redirects to `/app/policy-acceptance`.

Operator/admin users:

- Admin/operator pages inherit protected app and operator authorization.
- Operators should accept the same minimum user-facing policies before protected
  app/admin access.
- Operator-specific runbook acceptance is out of MVP unless separately scoped.

Gate ordering recommendation:

1. Auth/session check.
2. Profile completion and access eligibility checks.
3. Access-hold routing if beta/work-email access is not complete.
4. Policy acceptance check for otherwise app-eligible users.
5. Normal app/admin route rendering and operator authorization.

This ensures policy acceptance never bypasses beta/access/verification gates.

## Privacy / Security Risks

- Avoid collecting extra device/IP data unless necessary.
- Do not publicly expose acceptance records.
- Do not use acceptance tracking as identity verification.
- Do not treat acceptance as legal approval of draft copy.
- Do not rely on client-only hiding; enforce acceptance server-side before
  protected app rendering.
- Do not let client input choose arbitrary policy keys/versions.
- Do not store raw IP or raw user agent by default.
- Do not expose author IDs, user IDs, work emails, report IDs, storage paths,
  signed URLs, or private admin data through acceptance UX.
- Keep public legal pages public even when acceptance is missing.
- Keep policy acceptance separate from support/deletion/export/appeal intake.

## Migration / Runtime Apply Plan

Future implementation will require a migration and targeted runtime apply.

Recommended sequence:

1. Commit the migration and source changes first.
2. Run local/source validation.
3. Perform read-only runtime preflight against the intended Supabase project.
4. Apply only the targeted SQL for the policy acceptance migration.
5. Insert an exact migration ledger row only if the established project practice
   for targeted apply requires it.
6. Verify table, RLS, grants, constraints, and RPC/action availability.
7. Create runtime apply docs.
8. Browser-smoke the policy acceptance interstitial and public legal pages.
9. Create browser smoke docs.

Do not run broad `supabase db push`.

Do not mutate production acceptance rows during preflight except with an
explicitly authorized test account/smoke path.

## Test Plan

Future implementation tests should cover:

- Source/migration tests for table name, required columns, uniqueness, RLS,
  grants, and no anon access.
- RLS/policy SQL tests if the existing test style supports them.
- Server action/RPC allowlist tests for known keys/versions only.
- Idempotent insert behavior for repeat acceptance.
- Rejection of accepting for another user.
- Route gate/source tests for otherwise app-eligible users missing acceptance.
- Tests that access-hold behavior remains intact and is not bypassed.
- Tests that public legal pages remain public.
- Tests that login/signup/reset/auth callback remain reachable.
- Tests that app/admin routes require acceptance when otherwise eligible.
- Tests that no raw IP/user-agent storage exists if those fields are not used.
- Tests that policy acceptance does not create support/deletion/export/appeal
  backend behavior.

## Acceptance Criteria For Future Implementation

Future POL-ACCEPT-01 implementation should be considered complete only when:

- A migration creates the minimal acceptance data model with RLS and safe grants.
- Required policy keys and versions are server-side controlled.
- Users can accept the current private beta terms, privacy notice, and community
  rules exactly for themselves.
- Repeat acceptance is idempotent.
- App-eligible users who lack current acceptance are routed to the acceptance
  interstitial before protected app content renders.
- Policy acceptance cannot bypass auth, profile, beta, work-email, access-hold,
  or operator gates.
- Public legal pages remain public.
- Login/signup remain reachable.
- No raw IP or raw user-agent is stored unless a separate founder/legal/security
  decision approves hashed collection.
- No support/contact/deletion/export/appeal backend is added.
- No comments/replies are added.
- Runtime apply and browser smoke are documented.

## Open Questions / Founder Decisions

- Exact policy version strings for the first required set:
  `private_beta_terms:v1`, `privacy_notice:v1`, and `community_rules:v1` are the
  recommended defaults.
- Whether to store IP/user-agent hashes or omit them. Recommended default:
  omit for MVP.
- Whether acceptance is required for access-hold users before or after hold
  resolution. Recommended default: after hold resolution, before `/app`.
- Whether existing beta users must accept on next login/app entry. Recommended
  default: yes, when otherwise app-eligible.
- Whether operators must accept the same policies plus an operator-specific
  runbook later. Recommended default: same user-facing policies for MVP;
  operator runbook acknowledgment can be a later lane.
- Whether founder/legal will approve the current draft policy pages before
  acceptance tracking ships. Acceptance tracking should not imply legal-final
  approval if copy remains draft.

## Documentation Governance

Docs Created:

- `docs/ops/pol-accept-01-policy-acceptance-tracking-design.md`

Docs Updated:

- `docs/BUILD_TICKETS.md`
- `docs/BETA_READINESS_CHECKLIST.md`
- `docs/PRIVATE_BETA_OPERATING_PLAN.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`

Docs Not Updated / Why:

- `docs/DATA_MODEL.md` is not updated in this design-only lane because no
  schema, migration, or runtime data model has been implemented yet.
- Policy draft docs are not updated because this packet designs acceptance
  tracking without rewriting policy language.

Runtime Apply Needed?

- No. This is docs-only.

Browser Smoke Needed?

- No. No UI or runtime behavior changed.

## Result

Design/preflight ready for review.

POL-ACCEPT-01 should not proceed to implementation until founder/legal confirms
the required policy versions, whether IP/user-agent hashes are omitted, and the
desired gate timing for access-hold users.
