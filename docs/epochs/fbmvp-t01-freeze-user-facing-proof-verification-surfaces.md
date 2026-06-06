# FBMVP-T01 Freeze User-Facing Proof Verification Surfaces

Date: 2026-06-05

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or employer unless explicitly obtained and documented.

## Summary

FBMVP-T01 freezes normal user-facing proof verification surfaces as part of the First-Base MVP pivot. The forward access direction is confirmed approved airline employee email for general app/general baseboard eligibility, with restricted board access handled separately by future board/community-admin approval.

This ticket does not delete historical proof infrastructure. It removes proof-upload calls to action from the normal `/app/verification` surface and reframes verification copy so proof upload is not presented as a forward app-access path.

## Implemented Scope

- `/app/verification` no longer imports or renders the redacted proof upload server action.
- `/app/verification` no longer renders a multipart proof-upload form, proof file input, redaction checklist, requested-airline routing field, or proof-review submit button.
- The verification page now describes confirmed approved airline employee email as the forward general-access direction.
- Historical verification requests and claims remain visible as legacy account status only.
- Work-email request tracking remains available where approved airline-controlled domains are configured, but the copy clarifies that it does not implement the launch gate, automatic access, or role/base/restricted-board membership.
- Proof upload is shown as frozen for normal users, with restricted boards directed toward future board/community-admin approval instead of badge or document upload.

## Preserved Infrastructure

The following historical/runtime-applied systems remain intact and unchanged:

- redacted proof upload server action and helper code
- proof storage helpers and private bucket assumptions
- controlled reviewer proof viewing helpers
- proof retention and cleanup helpers
- protected cleanup routes
- proof cleanup monitoring and manual cleanup controls
- existing migrations
- existing proof runtime documentation
- admin/operator proof tooling

Preserving these systems avoids data-retirement, audit, and cleanup regressions while the product moves away from proof upload as a forward verification path.

## Boundaries

- No migration was created or edited.
- No Supabase remote database change is required for this ticket.
- No proof storage objects, storage paths, signed URLs, proof filenames, raw proof files, or proof contents are exposed.
- No arbitrary deletion controls are introduced.
- No community, board, moderation, launch-gate, or FBMVP-T02 implementation is included.
- No beta-gate removal is included.

## Validation Intent

Validation should prove:

- normal users are not offered proof upload from `/app/verification`
- the page does not render proof file inputs or multipart proof-upload submission
- airline employee email remains the forward eligibility credential in copy
- existing proof upload, proof access, proof retention, and cleanup tests still pass
- auth, profile, beta-access, private-app, work-email, and verification-request flow tests still pass
- lint, typecheck, build, and diff checks pass

## Runtime Note

This is a local app-surface freeze with no database migration. Runtime validation after deployment should confirm that `/app/verification` shows airline-email-forward copy and no normal proof-upload path, while protected legacy proof cleanup/admin routes remain protected.

## Next Ticket

The recommended next First-Base MVP ticket is `FBMVP-T02 Airline-Email Verification Access State Design/Implementation`.
