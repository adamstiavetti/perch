# Beta Waitlist Capture Runtime Pass

Date: 2026-06-08

Baseline commit: `31e976f docs: update public waitlist launch readiness`

Stable beta target: `https://beta.jmpseat.com`

## Summary

This pass aligned the stable beta preview deployment with the env names required
 for live public waitlist capture, redeployed current `main` to a fresh Vercel
 preview, aliased only `beta.jmpseat.com`, and runtime-validated the public
 waitlist email capture and optional survey flows.

The public waitlist page rendered the latest copy polish, email capture
 succeeded with a founder-controlled test address, duplicate submission remained
 bounded and idempotent, optional survey answers saved successfully, and
 signed-out protected routes redirected to login again instead of failing with a
 runtime configuration error.

Root `jmpseat.com` was not deployed, aliased, or changed. No DNS change, broad
 Supabase db push, Supabase Auth setting change, beta grant, role/base claim,
 restricted-board claim, or private-beta auth rule change was introduced.

## Beta Env Alignment

The beta-serving preview deployment was missing the runtime env names required
 for the live waitlist path. The deployment was refreshed with deployment-scoped
 env injection for:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

No env values are recorded in this note.

The project-level Vercel env list still shows these names configured only for
 Production, while `NEXT_PUBLIC_WAITLIST_FORM_URL` remains the existing
 project-level Preview env entry. The beta fix in this pass was deployment-
 scoped and did not touch root-domain production settings.

## Stable Beta Deploy And Alias

Stable beta was refreshed from current `main` through a fresh Vercel preview
 deployment, then aliased only to:

- `https://beta.jmpseat.com`

No alias or deploy was performed for:

- `https://jmpseat.com`
- the root production public domain

## Public Waitlist Runtime Checks

Confirmed on stable beta:

- the public waitlist page loads
- the latest public waitlist copy appears
- `Beta Access` is absent
- no `/login?next=/app` CTA appears on the public page
- the page remains email-first before submission
- the independence framing remains present
- proof upload, badge upload, and document upload copy remain absent
- the social preview asset remains reachable at `1200 x 630`

## Email Capture Runtime Checks

Using a clearly marked founder-controlled test address, redacted from this note:

- email capture succeeded
- the success state appeared with `You&apos;re on the waitlist.`
- raw email was not placed in the URL
- no survey token appeared in the URL
- the database stored one bounded waitlist signup row for the normalized email
- `landing_path` stored as `/`
- safe attribution fields remained bounded and empty in this test path

## Duplicate Submit Runtime Checks

Using the same redacted founder-controlled test address:

- duplicate email submission returned the same safe joined state
- duplicate behavior remained bounded and idempotent at the database layer
- exactly one signup row existed for the normalized email
- no unsafe duplicate waitlist state was created

## Optional Survey Runtime Checks

Confirmed on stable beta:

- the optional survey appeared only after successful email capture
- safe optional answers submitted successfully
- the post-submit URL remained free of raw email and survey token values
- exactly one survey response row existed for the test signup
- stored survey values matched the submitted safe answers
- no prohibited or sensitive fields were introduced by the survey path

## Protected Route Runtime Checks

Confirmed after beta env alignment:

- `/login` renders
- signed-out `/app` requests redirect to `/login?next=/app`
- signed-out `/app/admin/waitlist` requests redirect to
  `/login?next=/app/admin/waitlist`

This confirms the earlier beta preview failure was an env-alignment issue, not a
 root public waitlist code regression.

## Test Data Cleanup

Only clearly marked founder-controlled beta runtime test rows were cleaned up.

Cleanup summary:

- founder-controlled waitlist test rows matched by the dedicated beta-runtime
  prefix were deleted after verification
- related optional survey response rows were removed through the existing
  signup-to-survey cascade

No normal waitlist rows were targeted or removed in this pass.

## Validation

Passed:

- `node --test test/waitlist/jmpseatWaitlist.test.mts`
- `node --test test/admin/waitlistMetrics.test.mts`
- `node --test test/auth/authPages.test.mts test/auth/authRoutes.test.mts`
- `node --test test/private-app/access.test.mts test/private-app/privateShellPlaceholder.test.mts`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `git diff --check`

`npm run lint` still reports only the known unrelated warnings in the
 lab/scroll files.
