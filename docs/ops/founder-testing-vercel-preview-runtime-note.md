# Founder Testing Vercel Preview Runtime Note

## Summary

- Date: 2026-06-06
- Commit present: `a35718b`
- Preview deployment URL: `https://jmpseat-foxokdioc-adam-stiavetti-s-projects.vercel.app`
- Deployment type: Vercel Preview only
- Production deployment: not run
- DNS changes: none
- `jmpseat.com` DNS/custom-domain changes: none
- Landing-page Beta Access entry: added

This preview exists to give founder/work-email verification testing a real
HTTPS app URL instead of a `localhost` confirmation link.

The current landing page includes a `Beta Access` entry that routes users into
the existing login/auth flow at `/login?next=/app`.

This entry does not bypass:

- authentication
- beta access requirements
- airline-email verification requirements
- private app launch/access gates

## Environment Checklist

The Preview deployment was created with deployment-scoped environment values for:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `JMPSEAT_LAUNCH_MODE`

No environment values, SMTP credentials, auth links, verification links, reset
links, magic links, tokens, privileged identifiers, or plaintext invite codes are
recorded in this note.

`NEXT_PUBLIC_APP_URL` was not set for the preview deployment. The work-email
confirmation URL helper can use Vercel's `VERCEL_URL` fallback, which produces a
real HTTPS preview URL for confirmation links.

## Smoke Test

Preview smoke checks confirmed:

- `/login` renders with `200`
- `/signup` renders with `200`
- `/app` redirects to `/login?next=%2Fapp`
- `/app/verification` redirects to `/login?next=%2Fapp%2Fverification`

No work-email verification request was submitted during this deployment task.
No work-email confirmation email was sent during this deployment task.

## Founder Manual AA Retest Steps

1. Open the Preview deployment URL.
2. Sign in or create a test account.
3. Complete profile setup if the account is routed to profile onboarding.
4. Open `/app/verification` after authentication/profile completion.
5. Submit the AA work-email address from the preview app.
6. Confirm Resend reports accepted/delivered for the message.
7. Check the AA inbox and quarantine/spam tooling.
8. Click the confirmation link only from the controlled recipient inbox.
9. Confirm the app moves to the expected private-testing gate state.
10. Do not paste or record auth links, verification links, tokens, or full private emails.

## Caveats

- Production deployment remains separate.
- Corporate inbox deliverability still needs validation through the AA inbox and
  any available quarantine/spam controls.
- The Vercel project is not currently connected to a Git repository, so Preview
  environment values for this pass were supplied at deployment scope rather than
  saved as branch-scoped Preview project settings.
- If future account confirmation or auth callback testing uses this preview URL,
  Supabase Auth redirect allowlist settings may need manual review for the
  preview origin and callback path.
