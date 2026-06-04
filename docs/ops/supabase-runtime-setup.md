# Supabase Runtime Setup

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

## Purpose

This runbook covers the post-Epoch 03 operator setup required to make the merged auth/profile/beta/security foundation work against a real Supabase project.

This document is operational only. It does not add product features.

## 1. Required Supabase Project Setup

Create or confirm a Supabase project for jmpseat that will back:

- Supabase Auth
- `profiles`
- `beta_access`
- `security_events`

The current web app expects:

- Supabase Auth to own account/session state
- Postgres to own profile, beta-access, and security-event state
- the Epoch 03 migrations to be applied before runtime use

## 2. Required Environment Variables

The merged app expects these public variables at runtime:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Important:

- do not commit real values
- do not expose any service-role or privileged key to browser/mobile clients

## 3. Local `.env.local` Setup

Create `.env.local` in the repo root with:

```dotenv
NEXT_PUBLIC_WAITLIST_FORM_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Notes:

- `NEXT_PUBLIC_WAITLIST_FORM_URL` remains for the public waitlist page
- the two Supabase public values are required for real local auth/profile/beta runtime testing

## 4. Vercel / Production Environment Setup

Add the same public Supabase variables in Vercel for:

- Preview
- Production

Current deployment guardrail:

- production `/app` requests fail closed if the public Supabase env vars are missing
- missing runtime env must not silently disable auth or private-route protection

## 5. Supabase Auth Redirect URL Checklist

Configure Supabase Auth redirect URLs for all actual environments used by jmpseat.

### Local development

- `http://localhost:3000/auth/callback`

If you run the app on another local port for smoke testing, add that too.

### Preview deployment

- each real preview deployment callback URL, for example:
  - `https://<preview-domain>/auth/callback`

### Production

- the production callback URL, for example:
  - `https://<production-domain>/auth/callback`

## 6. Email Confirmation And Password Reset Paths

Current app path expectations:

- auth callback path: `/auth/callback`
- reset-password surface: `/reset-password`

Behavior to preserve:

- signup/email confirmation returns through `/auth/callback`
- password reset email returns through `/auth/callback`
- password recovery continuation lands at `/reset-password?mode=update`

## 7. Migration Application Checklist

Apply these Epoch 03 migrations to the target Supabase project:

1. `supabase/migrations/20260604113000_create_profiles.sql`
2. `supabase/migrations/20260604124500_create_beta_access.sql`
3. `supabase/migrations/20260604143000_create_security_events.sql`

Operator options:

- use Supabase CLI if installed and the repo/project is linked
- or apply the SQL through the Supabase SQL editor if CLI/project wiring is not available

Current local status from this setup review:

- Supabase CLI: not installed
- local project link metadata: not present
- migrations applied from this task: not attempted

## 8. Manual SQL For Granting Beta Access To A Test User

Use this operator-only SQL after the `beta_access` migration is applied:

```sql
insert into public.beta_access (
  user_id,
  status,
  source,
  invited_email,
  approved_at
)
values (
  '<auth-user-uuid>',
  'active',
  'founder-manual',
  'crew@example.com',
  now()
)
on conflict (user_id)
do update set
  status = excluded.status,
  source = excluded.source,
  invited_email = excluded.invited_email,
  approved_at = excluded.approved_at,
  revoked_at = null,
  revoked_by = null,
  reason = null;
```

Do not expose any public route or UI that lets users approve themselves.

## 9. Smoke-Test Checklist

Run this after:

- `.env.local` is configured
- Supabase redirect URLs are configured
- Epoch 03 migrations are applied
- at least one auth test user exists

### Public waitlist

- `/`

Expected:

- public waitlist page loads
- no auth/beta/private content is exposed

### Signup

- `/signup`

Expected:

- signup form loads
- copy states that account creation is not beta approval or worker verification

### Email confirmation / callback

- signup confirmation flow through `/auth/callback`

Expected:

- callback resolves without provider misconfiguration
- incomplete-profile users are sent to `/app/profile`

### Login

- `/login`

Expected:

- login form loads
- signed-in users are routed according to profile and beta state

### Password reset

- `/reset-password`

Expected:

- reset request flow works
- recovery callback can reach `/reset-password?mode=update`

### Signed-out private entry

- `/app`

Expected:

- signed-out users are redirected to `/login`

### Profile onboarding

- `/app/profile`

Expected:

- signed-in users can see the profile form
- signed-out users are redirected to `/login`
- claimed airline/role/base copy remains self-declared and not verified

### Beta hold

- `/app/access-hold`

Expected:

- complete-profile plus non-active-beta users see the hold surface
- active-beta users are redirected to `/app`

### Active-beta private entry

- `/app`

Expected:

- complete-profile plus active-beta users reach the locked private shell placeholder

### Known private child route

- `/app/home`

Expected:

- same auth/profile/beta gate order as `/app`
- active-beta users see route-specific placeholder content

### Unknown private route

- `/app/unknown`

Expected:

- `404`

## 10. Known Expected Limitations

- no worker verification yet
- no badge upload yet
- beta grants are manual SQL
- no real community content yet
- no mobile app yet

## 11. Current Operational Validation Status

Date:

- `2026-06-04`

Environment reviewed:

- local repo checkout only

What passed:

- static validation commands
- docs/operator checklist creation

What was deferred:

- runtime Supabase auth smoke testing
- migration application
- live signup/login/profile/beta flow validation

Configuration gaps found:

- `.env.local` does not exist
- `NEXT_PUBLIC_SUPABASE_URL` is not configured locally
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is not configured locally
- Supabase CLI is not installed locally
- no Supabase project link metadata is present in this repo checkout

## 12. Remaining Manual Setup Steps

1. Create `.env.local` with the required public Supabase values.
2. Configure Supabase redirect URLs for local, preview, and production.
3. Apply the three Epoch 03 migrations to the target Supabase project.
4. Create a test auth user.
5. Complete the profile flow for that user.
6. Confirm the user lands on `/app/access-hold`.
7. Run the manual SQL beta grant.
8. Re-test `/app` and `/app/home` for active-beta access.
9. Re-test `/app/unknown` for `404`.
