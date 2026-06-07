# Account Confirmation Callback Fix

Date: 2026-06-06

## Summary

Founder-testing surfaced an account-confirmation dead end in the standard
Supabase signup flow:

- the user could create an account
- the account confirmation email arrived
- clicking the confirmation link did not complete the in-app callback flow
- the app eventually showed "Missing authentication callback code."

The app only handled PKCE callback links that include a `code` query parameter
at `/auth/callback`. Supabase email templates can also be configured to use the
token-hash confirmation pattern. If that token-hash link lands on
`/auth/callback`, the app has no code to exchange and the user is stranded.

Follow-up: account signup confirmation is moving to a code-first jmpseat UX
where possible. Supabase Auth remains the source of truth, and the legacy
token-hash/callback routes remain for compatibility.

## Route Behavior

The account auth routes now support both safe confirmation shapes:

- `/signup` can show a code-first account confirmation state after account
  creation.
- `/auth/callback` continues to exchange PKCE `code` values for a session.
- `/auth/confirm` verifies Supabase email `token_hash` links with the supplied
  email confirmation type.
- `/auth/callback` hands token-hash links to `/auth/confirm` if a template sends
  that shape to the callback route.
- `/auth/confirm` hands PKCE-code links back to `/auth/callback` if a template
  sends that shape to the confirm route.

Both routes keep post-auth routing aligned with the existing app gates:

- signup confirmation resolves to the existing profile / verification /
  access-hold / app flow
- password recovery resolves to the existing password reset update flow
- private app access remains blocked until the active gate requirements pass

## Supabase Template / Redirect Requirement

Supabase dashboard templates should be reviewed before founder/Yuri testing.

Preferred code-first Confirm Signup template:

```text
Subject:
Confirm your jmpseat account

Body:
Your jmpseat account confirmation code is: {{ .Token }}
Enter this code in jmpseat to finish creating your account.
You'll verify your airline employee email separately after signup.
```

Acceptable account-confirmation configurations:

- Code-first confirmation email using the Supabase `{{ .Token }}` placeholder
  and the jmpseat `/signup` account-code confirmation state. The app verifies
  this submitted code through the Supabase Auth email OTP verification path.
- PKCE/default confirmation link that redirects to `/auth/callback` with a
  callback `code`.
- Token-hash template link that targets `/auth/confirm` with the Supabase
  token-hash placeholder and confirmation type placeholder.

Placeholder-only token-hash shape:

```text
/auth/confirm?token_hash={{ .TokenHash }}&type=signup
```

If the dashboard template uses token-hash placeholders, the app route should be
`/auth/confirm`, not a normal app page. Do not paste real confirmation links,
tokens, account codes, or auth URLs into docs, issue trackers, chat, or logs.

## Token / Storage / Security Notes

The fix does not store auth tokens, confirmation tokens, or account
confirmation codes in app-owned tables.

Error redirects are built from clean route URLs instead of cloned callback URLs,
so failed callback and confirmation paths do not carry `code` or `token_hash`
query parameters into `/login`.

Security-event metadata records only safe routing/context fields such as
confirmation type and destination path. It does not record auth links, callback
codes, token hashes, sessions, SMTP credentials, invite codes, or private user
identifiers.

## Work-Email Confirmation Unchanged

This fix is for normal Supabase account confirmation and password recovery.

It does not change the airline employee work-email confirmation flow at
`/app/verification/confirm`, does not change approved-domain behavior, does not
grant beta access, and does not grant airline-email eligibility without the
existing work-email confirmation path.

## Gate Rules Unchanged

This fix does not weaken app entry:

- authentication is still required for app access
- profile completion is still required where the private app gate requires it
- airline-email verification remains required for app access
- `private_testing` and `internal_test` still require beta access
- `first_base_launch` and `broader_launch` still bypass beta but require
  airline-email verification
- invite codes still do not replace airline-email verification

## Validation

Validation should include:

- auth route tests for the new `/auth/confirm` route
- auth page source tests confirming callback and confirm routes exist
- private app access tests to confirm gate behavior remains unchanged
- work-email verification tests to confirm airline-email confirmation remains
  separate
- lint, typecheck, build, and `git diff --check`

Runtime validation is still needed after review to confirm the live Supabase
Confirm Signup template matches one of the supported shapes.
