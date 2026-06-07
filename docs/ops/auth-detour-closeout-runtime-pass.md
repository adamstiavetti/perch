# Auth Detour Closeout Runtime Pass

Date: 2026-06-07

Stable beta URL: `https://beta.jmpseat.com`

Current auth baseline commit: `f45023b polish: unify auth flow design`

## Summary

This note closes the temporary auth/onboarding detour before returning to Epoch 5
operator/admin tooling level-set work.

The founder manually confirmed the unified auth flow end to end on stable beta.
This was founder-confirmed runtime validation, not a Codex-handled inbox-code
pass.

Founder-confirmed stable beta coverage:

- Beta Access entry works.
- Normal account signup confirmation works through the code-first account
  confirmation UI.
- Profile completion works.
- `/app/access-hold` works as the active airline employee email verification
  and beta access status surface.
- Work-email verification works through the code-first inline flow on
  `/app/access-hold`.
- Founder/operator internal app access works through explicit operator grants.

## Current Auth Flow Baseline

- Account signup is code-first and remains Supabase Auth-native.
- Work-email verification is code-first and inline on `/app/access-hold`.
- `/app/verification` is deprecated and redirects to `/app/access-hold`.
- `/app/verification/confirm` remains only as the legacy-compatible work-email
  confirmation route.
- Founder/operator access is separate from airline-email eligibility.
- Founder/operator access uses explicit operator grants, not temporary
  `jmpseat.com` work-email domain approval.

## Temporary Domain Cleanup

The temporary `jmpseat.com` approved work-email domain used for founder testing
was soft-disabled through the existing approved-domain operator/admin path.

Cleanup result:

- `jmpseat.com` is no longer active as an approved work-email domain.
- The disabled domain row is preserved for history.
- The normal approved-domain disabled audit event exists.
- Other active approved domains were not changed.
- Root `jmpseat.com` DNS, Google Workspace DNS, Resend DNS, Vercel settings,
  and Supabase Auth templates were not changed.

## Test-Derived Eligibility Cleanup

Historical founder-testing work-email verification rows derived from
`jmpseat.com` were preserved for audit/history.

Active app eligibility from that test domain is neutralized because the current
airline-email access helper only derives active work-email access from accepted
work-email evidence whose domain is still active in `approved_email_domains`.
After the temporary domain disable, the `jmpseat.com` test-derived state no
longer joins to an active approved domain.

No direct destructive cleanup of historical verification requests, evidence, or
audit rows was performed.

## Founder / Operator Regression

Runtime operator checks confirmed safe booleans:

- Active `operator.internal_private_app_access` grant exists.
- Active `operator.manage_operator_access` grant exists.
- `current_user_operator_scopes()` resolves the internal private-app access
  scope for an active operator context.
- `current_user_operator_scopes()` resolves the manage-operator-access scope
  for an active operator context.
- Expected private-app gate source remains `operator_internal` for
  founder/admin internal access.
- Founder/operator access does not depend on `jmpseat.com` being an approved
  work-email domain.

## Guardrails Confirmed

- No beta grant was created by this closeout.
- No `airline_email_verified` shortcut mutation was performed.
- No role, base, or restricted-board claims were issued.
- No proof upload, badge upload, document upload, proof review, baseboard, or
  community feature work was reintroduced.
- No migrations were created or edited.
- No Supabase db push was run.
- No deploy was run for this closeout.
- No root DNS, Vercel settings, or Supabase Auth template settings were changed.
- No sensitive runtime values or private identifiers are included in this note.

## Next Lane

Return to Epoch 5 operator/admin tooling level-set work.
