# POL-ACCEPT-01A Policy Acceptance Tracking Implementation

Date: 2026-06-14

Repo checkpoint before implementation: `195dd56 docs: design policy acceptance tracking`

## Purpose

POL-ACCEPT-01A implements the minimal local code, migration, tests, and docs for
private-beta policy acceptance tracking.

This lane does not apply the migration to runtime, deploy, browser-smoke beta,
approve legal-sensitive policy copy, add support/deletion/export/appeal backend
intake, or add comments/replies.

## Implemented Scope

- Adds `public.user_policy_acceptances` in a new migration.
- Adds server-controlled current policy allowlist:
  - `private_beta_terms:v1`
  - `privacy_notice:v1`
  - `community_rules:v1`
- Adds `public.accept_current_private_beta_policies()` as an idempotent RPC for
  the authenticated user.
- Adds server helpers for loading acceptance records, computing missing current
  acceptances, and building safe `/app/policy-acceptance` redirects.
- Adds `/app/policy-acceptance` as a protected app-entry interstitial for
  otherwise app-eligible users missing current acceptance records.
- Wires policy acceptance enforcement after the existing private-app eligibility
  gate for known protected app/admin/DFW Hub entry points.
- Keeps public legal pages, login, signup, access-hold, and access-restricted
  routes outside the acceptance gate.

## Migration Summary

Migration:

- `supabase/migrations/20260614172239_create_user_policy_acceptances.sql`

Table:

- `public.user_policy_acceptances`

Columns:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users (id) on delete cascade`
- `policy_key text not null`
- `policy_version text not null`
- `accepted_at timestamptz not null default now()`
- `created_at timestamptz not null default now()`

Constraints:

- `policy_key` is limited to `private_beta_terms`, `privacy_notice`, and
  `community_rules`.
- `policy_version` is limited to `v1`.
- `(user_id, policy_key, policy_version)` is unique.

Data minimization:

- No raw IP address column.
- No raw user-agent column.
- No hashed IP address column.
- No hashed user-agent column.
- No public handle, work email, profile label, route, or policy body snapshot is
  stored in acceptance rows.

## RLS And RPC Summary

RLS posture:

- RLS is enabled on `public.user_policy_acceptances`.
- Broad table access is revoked from `anon` and `authenticated`.
- `authenticated` receives `select` only.
- The only authenticated table policy is select-own:
  `auth.uid() = user_id`.
- No authenticated insert/update/delete table policies are added.
- `service_role` receives select/insert for controlled server/runtime paths.

RPC:

- `public.accept_current_private_beta_policies()`
- `security definer`
- `set search_path = public, pg_temp`
- Uses `auth.uid()`.
- Rejects unauthenticated calls.
- Accepts no `user_id`, `policy_key`, `policy_version`, IP, or user-agent
  argument from the client.
- Inserts the exact current required policy set idempotently with
  `on conflict do nothing`.
- Revokes execute from `public` and `anon`; grants execute to `authenticated`
  and `service_role`.

## Route And Gate Summary

Acceptance is enforced only after normal private-app eligibility has passed.

Gate ordering preserved:

- Signed-out users still go to login.
- Incomplete profiles still go to profile completion.
- Users who are not beta/access/work-email eligible still go to the existing
  hold/restricted path.
- Access-hold users remain access-hold; policy acceptance does not grant app
  access.
- Otherwise app-eligible users missing current acceptances redirect to
  `/app/policy-acceptance`.
- Users who already accepted all current policies continue to the intended app
  route.
- Operator/admin routes inherit the private-app policy gate first, then keep the
  existing operator authorization checks.

Protected entry points wired in this lane:

- `/app`
- `/app/[section]`
- DFW Hub helpers through `src/lib/privateApp/dfwHubAccess.ts`
- `/app/admin`
- `/app/admin/community-moderation`

## UI Summary

`/app/policy-acceptance` renders:

- Links to Private Beta Terms, Privacy Notice, and Community Rules.
- An explicit acknowledgement checkbox.
- A submit button that calls the server action/RPC.
- Safe failure copy if policy acceptance storage is not ready.

The page does not claim legal finality, legal advice, support/deletion/export
backend intake, an appeal backend, proof-upload expansion, AI final decisions,
or comments/replies.

## Runtime Status

Runtime apply is pending.

The migration has not been applied to beta/production runtime by this lane.
Until targeted runtime apply happens, deployed app code must not be treated as
fully enabled for broader private-beta acceptance enforcement.

Required future runtime lane:

1. Review and commit POL-ACCEPT-01A.
2. Run read-only runtime preflight.
3. Apply the exact migration SQL with a targeted process only.
4. Insert/verify the migration ledger entry as appropriate for the current
   project migration-history state.
5. Record runtime apply docs.
6. Deploy through the approved deployment process.
7. Browser-smoke login/app-entry, policy acceptance, app continuation, and
   access-hold/admin boundaries.

Do not run broad `supabase db push`.

## Remaining Gaps

- Runtime migration apply is pending.
- Browser smoke is pending after runtime apply/deploy.
- Legal-sensitive policy copy remains draft/founder/legal review material.
- No support/contact/deletion/export/appeal backend exists.
- No comments/replies are implemented.
- No operator runbook acknowledgement exists.
- QA-POL-01 access-hold and operator-admin policy-link visibility limitations
  remain open until suitable session states are available.
- Incident/escalation backup owner remains unresolved.

## Result

POL-ACCEPT-01A is ready for review as a local implementation patch. It is not
runtime-applied, deployed, browser-smoked, or approved for broader private-beta
launch.
