# Waitlist Contact Dashboard Runtime Pass

Date: 2026-06-08

Baseline commit: `2894c9e polish: refine admin access and waitlist dashboard`

Stable beta target: `https://beta.jmpseat.com`

## Summary

This runtime pass aligned the linked stable beta runtime with the richer
operator/admin waitlist dashboard introduced in `2894c9e`. The pass applied the
waitlist-contact operator-scope migration, aligned the founder/admin operator
grant with the new `operator.view_waitlist_contacts` scope, refreshed the stable
beta preview, and validated the safe data boundaries for the audit-only and
contact-authorized dashboard modes.

No root `jmpseat.com` cutover, root alias, DNS change, Vercel project setting
change, Supabase Auth setting change, broad Supabase db push, beta grant,
airline-email verification mutation, role/base claim, restricted-board claim, or
proof-upload behavior was introduced.

## Migration

Applied only:

- `supabase/migrations/20260608110000_add_waitlist_contact_operator_scope.sql`

The migration was applied with a direct linked SQL execution and then the linked
migration history was repaired for version `20260608110000` only. A broad
`supabase db push` was not run. Older local/remote migration-history mismatches
remain untouched.

Safe runtime checks confirmed:

- `operator.view_waitlist_contacts` is included in `public.operator_scope_values()`
- `public.mask_waitlist_contact_label(text)` exists
- `public.recent_waitlist_signup_summaries(integer)` exists
- the audit-only summary function does not expose unsafe return columns such as
  raw email, normalized email, row IDs, signup IDs, survey tokens, or user IDs

## Founder/Admin Scope Alignment

Safe preflight checks found exactly one active founder/admin-style operator
grant with:

- `operator.internal_private_app_access`
- `operator.manage_operator_access`
- `operator.read_audit`

That grant was missing `operator.view_waitlist_contacts`, so runtime alignment
added only:

- `operator.view_waitlist_contacts`

The alignment preserved the existing active operator grant row and wrote one
bounded `operator_access.granted` security event with safe metadata. The
alignment event metadata did not include raw user identifier keys.

This pass did not grant beta access, did not mark airline-email verification,
and did not issue role/base/restricted-board claims.

## Stable Beta Refresh

Stable beta was refreshed from current `main` and the resulting preview was
aliased to `beta.jmpseat.com` only. The root domain was not deployed, aliased,
cut over, or changed.

Confirmed after refresh:

- `https://beta.jmpseat.com` loads
- unauthenticated `/app` requests redirect to login
- unauthenticated `/app/admin/waitlist` requests redirect to login with the
  waitlist route preserved as the intended next path
- the stable beta build includes `/app/admin/waitlist`

## Access-Restricted Copy

The reviewed source and automated tests confirm `/app/access-restricted` now
uses neutral restricted-surface copy for reviewer, admin, and operator denials.
It no longer uses the stale `EPOCH 04 REVIEW` framing and no longer presents the
page as reviewer-only or operator-only.

Authenticated browser rendering of `/app/access-restricted` was not repeated in
this pass because no safe authenticated non-operator/reviewer-denial browser
session was available in the tool context.

## Waitlist Dashboard Modes

### Audit-Only Mode

Runtime database checks confirmed the audit-only recent-summary path is active:

- `public.recent_waitlist_signup_summaries(50)` returns runtime waitlist summary
  rows
- masked recent-contact labels are present and useful
- the RPC return signature does not include raw contact email, normalized email,
  row IDs, signup IDs, survey tokens, or user IDs

This proves the server-side audit-only data boundary used by
`operator.read_audit` can provide useful masked recent summaries without
returning raw contact fields to the app result.

Browser-level audit-only rendering remains covered by automated tests, but was
not manually browsed in this pass because no safe audit-only operator browser
session was available.

### Contact-Authorized Mode

Runtime checks confirmed:

- the founder/admin-style operator grant now includes
  `operator.view_waitlist_contacts`
- runtime waitlist signup rows with contact emails exist
- runtime optional survey response rows exist
- the contact-authorized dashboard data path has the runtime data needed to show
  full contact email and bounded per-submission survey detail for authorized
  founder/admin invite/contact workflow

Authenticated founder/admin browser rendering should now use the
contact-authorized mode. A manual browser refresh by the founder/admin can
confirm the visual presentation in the live session.

## Public And Private Regression Checks

Stable beta public checks confirmed:

- the public waitlist page loads
- `Beta Access` is absent from the public page
- proof upload, badge upload, and document upload copy are absent
- unauthenticated private app and admin routes remain protected by login

The public waitlist page does not expose waitlist dashboard data. Runtime SQL
alignment did not create beta grants, airline-email verification mutations,
role/base/restricted-board claims, or proof-upload behavior.

## Validation

Passed:

- `node --test test/admin/waitlistMetrics.test.mts`
- `node --test test/admin/adminShell.test.mts test/admin/operatorAccess.test.mts test/admin/operatorBootstrapRoute.test.mts`
- `node --test test/auth/authPages.test.mts test/auth/authRoutes.test.mts`
- `node --test test/private-app/access.test.mts test/private-app/privateShellPlaceholder.test.mts`
- `node --test test/waitlist/jmpseatWaitlist.test.mts`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `git diff --check`

`npm run lint` passed with the known unrelated warnings in the lab/scroll files.

## Remaining Follow-Up

- Founder/admin should manually refresh `/app/admin/waitlist` in the existing
  authenticated browser session to confirm the live visual contact-authorized
  dashboard presentation.
- If needed, create a dedicated audit-only operator browser session to prove the
  masked-only UI path at browser level. The server-side runtime data path and
  automated UI/source tests already cover this boundary.
