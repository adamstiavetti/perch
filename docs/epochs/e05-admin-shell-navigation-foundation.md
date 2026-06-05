# E05-T02: Admin Shell And Navigation Foundation

Brand note: jmpseat is the canonical product and app name. This implementation note does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or employer unless explicitly obtained and documented.

## 1. Scope

This ticket implements the safe admin shell and navigation foundation for Epoch 05 without implementing privileged operator tooling yet.

Delivered in this slice:

- A real `/app/admin` landing page.
- A shared admin shell/navigation component for admin-area routes.
- A minimal admin navigation model that keeps operator-only sections unavailable by default while operator grants are still unimplemented.
- Preservation of the existing `/app/admin/verification` reviewer queue behavior.

Not delivered in this slice:

- No `operator_grants` table or migration.
- No approved-domain management.
- No reviewer-scope management.
- No audit inspection.
- No cleanup monitoring or manual cleanup UI.
- No community, rooms, posts, or moderation work.

Client scope:

- `web-only` UI shell for `/app/admin`.
- `shared-core` authorization/navigation helper for keeping reviewer and future operator sections separate.

## 2. Authorization Model Used

This ticket follows `e05-operator-access-model-decision.md`.

Current behavior:

- `/app/admin` stays behind the existing private-app auth/profile/beta gates.
- `/app/admin` renders a safe landing page with no privileged operational data fetch.
- Existing reviewer authorization remains the only path to an active admin-area tool in this slice.
- Existing `/app/admin/verification` still requires reviewer authorization and still redirects unauthorized users to `/app/access-restricted`.
- Future operator-only sections are shown only as disabled/unavailable placeholders.

Important non-behavior:

- Reviewer scope is not treated as operator/admin access.
- Verification claims are not treated as operator/admin access.
- Login email, work email, beta access, or profile text are not treated as operator/admin access.

## 3. Implementation Summary

App/UI changes:

- Added a shared admin shell component for admin-area layout and navigation.
- Added `/app/admin` as a real route that explains the bounded operator/admin foundation and current section availability.
- Reused the shared shell in `/app/admin/verification` so the reviewer queue now lives inside the same admin navigation frame.

Authorization changes:

- Added a minimal admin navigation helper that marks operator-only sections unavailable while operator grants are still not implemented.
- Added a lightweight reviewer-authorization loader so `/app/admin` can determine whether to show the verification-review link without loading the full reviewer queue first.

Security posture preserved:

- No privileged operator data is fetched on `/app/admin`.
- No proof paths, signed URLs, public URLs, raw filenames, proof contents, or secrets are introduced into the admin shell.
- Existing proof-viewing and reviewer-queue boundaries are unchanged.

## 4. Validation

Validation for this ticket should include:

- Focused admin shell tests.
- Existing private-app gate tests.
- Existing verification reviewer tests.
- Standard `lint`, `typecheck`, and `build`.

## 5. Follow-On Work

This ticket intentionally stops before operator tooling implementation.

Next likely follow-ons:

- E05-T03 Approved Email Domain Management.
- E05-T04 Reviewer Scope Management.
- E05-T05 Verification Audit Inspection.
- E05-T06 Proof Cleanup Monitoring.

## 6. Source-Of-Truth Status

This document records the implementation outcome for E05-T02.

No migrations, Supabase `db push`, production commands, or secrets are part of this ticket.
