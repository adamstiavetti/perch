# Account Signup Code Confirmation Implementation

Date: 2026-06-06

## Summary

Normal jmpseat account signup confirmation is now code-first where Supabase
Auth supports it.

After a user creates a jmpseat account with email and password, the signup
surface guides them to an account-code confirmation state. The app carries the
pending signup email forward through a short-lived server-side cookie, shows a
masked version of that account email, and asks the user to enter only the
six-digit Supabase account confirmation code from the confirmation email. The
app verifies that code with Supabase Auth and then continues through the
existing profile and private-app gate flow.

This is account email confirmation only. It is not airline employee email
verification, beta invite-code redemption, founder/admin access, operator
access, role/base claim issuance, or community/baseboard work.

## Supabase Auth Source Of Truth

Supabase Auth remains the source of truth for account confirmation.

The app does not create an app-owned account-confirmation credential system and
does not store account confirmation codes in app-owned tables. The confirmation
action uses Supabase Auth email OTP verification for the pending account email
and six-digit code. If the pending signup cookie is missing or expired, the UI
falls back safely by asking for the account email again.

The Confirm Signup email template should be updated in the Supabase dashboard
after review and deployment.

Expected code-first template shape:

```text
Subject:
Confirm your jmpseat account

Body:
Your jmpseat account confirmation code is: {{ .Token }}
Enter this code in jmpseat to finish creating your account.
You'll verify your airline employee email separately after signup.
```

Runtime template inspection confirmed the live Confirm Signup template uses
`{{ .Token }}`, does not use `{{ .TokenHash }}` as the displayed account code,
does not include a primary clickable confirmation link, and does not target
localhost. Runtime Auth configuration also exposed `mailer_otp_length`; it was
aligned to 6 so the Supabase-generated account confirmation token matches the
six-digit product experience. Fresh inbox validation of the delivered code
length is still required after beta deploy/runtime testing.

Do not paste real auth links, confirmation links, reset links, magic links,
tokens, six-digit account codes, private user emails, SMTP credentials, or
environment values into docs, issue trackers, chat, logs, or screenshots.

## Route And UX Behavior

- `/signup` remains the account creation surface.
- Successful signup redirects to `/signup` in an account-code confirmation
  state without putting the account email or code in the URL.
- The account-code form shows a masked account email when pending signup state
  exists and accepts only the six-digit code.
- The code entry UI uses six individual digit boxes with paste, auto-advance,
  backspace navigation support, and explicit digit clearing so the submitted
  hidden value matches the visible boxes after edits.
- Resend code uses Supabase Auth's signup resend path and the pending account
  email. It does not expose the full email in the URL.
- Change email clears the pending signup handoff and returns the user to the
  normal signup form. It does not delete accounts or mutate auth state.
- Invalid, missing, or expired codes return safe generic account-code errors.
- Successful code confirmation redirects through the existing post-auth
  profile/private-app gate resolution.
- `/auth/confirm` remains available for legacy Supabase token-hash confirmation
  links.
- `/auth/callback` remains available for PKCE/code callback links and password
  reset recovery.

## Separation From Airline Email Verification

Account email confirmation does not verify airline eligibility.

This implementation does not:

- mark `airline_email_verified`
- grant beta access
- issue role, base, restricted-board, or employer claims
- change approved-domain matching
- change work-email confirmation code behavior
- change launch-mode gates
- change founder/admin/operator access
- reintroduce proof upload, badge upload, document upload, proof review, or
  proof-based onboarding

Airline employee email verification still happens later through the existing
approved-domain work-email verification flow.

## Security Notes

- The submitted account code is passed only to Supabase Auth verification.
- Security-event metadata records safe email-domain and result context only.
- Full account emails and plaintext codes are not recorded in security-event
  metadata.
- Error redirects do not include codes, tokens, auth links, or account emails.
- Supabase Auth sessions set by successful verification are resolved through the
  existing profile/private-app gate code.

## Validation

Planned validation for this branch:

- auth page/action tests for account-code confirmation
- auth route tests for `/auth/callback` and `/auth/confirm` compatibility
- private-app gate tests
- work-email confirmation tests
- beta invite-code tests
- profile tests
- security-event tests
- lint, typecheck, build, and `git diff --check`

Runtime validation is still pending after the Supabase Confirm Signup template
is updated and the branch is deployed to the beta/stable test surface.
