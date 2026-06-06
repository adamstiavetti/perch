# FBMVP-T03 Private-Testing Versus First-Base-Launch Gate Implementation

Date: 2026-06-06

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or employer unless explicitly obtained and documented.

## Summary

FBMVP-T03 adds explicit launch-mode support to the shared private-app access gate.

The implementation wires the FBMVP-T02 airline-email access-state helper into the existing app entry decision while preserving auth, profile, beta-access, proof-system, operator, reviewer, and board boundaries.

No migration was created.

## Launch Mode Helper

Module:

- `src/lib/privateApp/launchMode.ts`

Canonical modes:

- `private_testing`
- `first_base_launch`
- `broader_launch`
- `internal_test`

The default is `private_testing`. Unknown or missing values normalize back to `private_testing` so an invalid config does not accidentally bypass the private-testing gate.

The server helper reads `JMPSEAT_LAUNCH_MODE` without exposing the value to users.

## Gate Behavior

Private-testing mode requires:

- authenticated login
- completed profile/private-app prerequisites
- active beta access
- confirmed approved airline employee email

First-base launch mode requires:

- authenticated login
- completed profile/private-app prerequisites
- confirmed approved airline employee email

First-base launch mode does not require one-by-one manual beta grants for the launched population. This implementation does not hard-code a base, airport, or airline population.

Broader launch mode requires:

- authenticated login
- completed profile/private-app prerequisites
- confirmed approved airline employee email

Broader launch mode does not keep beta access as the general app gate.

Internal-test mode stays strict like private testing:

- active beta access is required
- confirmed approved airline employee email is required

## Airline-Email Access Integration

The app access context now loads safe verification state and approved active domains, then calls `getCurrentAirlineEmailAccessState(...)`.

The access context selects only the fields needed to derive eligibility:

- approved domain domain/airline/status
- verification request status/method/timestamps
- work-email evidence metadata needed by the helper
- verification claim status/method/timestamps

It does not expose raw proof files, proof content, signed URLs, public URLs, storage paths, proof filenames, tokens, sessions, secrets, or service-role behavior.

If verification storage or approved-domain reads are not ready, the airline-email state resolves to `not_ready` and app entry fails closed to `/app/access-hold` with safe setup copy.

## Beta Gate Behavior

Beta remains required for:

- `private_testing`
- `internal_test`

Beta is not required for:

- `first_base_launch`
- `broader_launch`

Beta access alone does not grant app access because airline-email eligibility is required in every launch mode.

Airline-email eligibility does not grant restricted board access, reviewer authority, operator authority, community-admin authority, role claims, or base claims.

## Access-Hold Copy

`/app/access-hold` now explains that app access is held by launch mode, beta access when required, and airline-email eligibility.

The page remains proof-free:

- no badge upload
- no proof upload
- no verification files
- no storage paths
- no community access

## Auth Callback Alignment

The auth callback destination resolver now uses the same shared private-app gate decision as `/app` and known private child routes.

This keeps post-auth redirects aligned with launch mode, beta requirements, profile completion, and airline-email eligibility.

## Non-Goals

This implementation does not:

- create migrations
- remove auth requirements
- remove profile requirements
- change production launch mode
- deploy anything
- implement baseboards
- implement board memberships
- implement posting
- implement community-admin tools
- implement restricted-board gates
- implement FBMVP-T04 or later tickets
- issue role or base claims
- auto-upgrade ambiguous proof-based claims
- delete proof infrastructure
- re-enable proof upload as an app gate

## Validation

Validation run:

- `node --test test/private-app/access.test.mts test/beta-access/betaAccess.test.mts`

Broader validation remains required before review completion:

- verification access-state tests
- auth/profile/beta/private-app regression tests
- lint
- typecheck
- build
- `git diff --check`

## Next Ticket

Recommended next implementation ticket:

- `FBMVP-T04 Onboarding/Signup Flow Update`

FBMVP-T04 should update onboarding/signup to collect and verify the airline employee email eligibility credential while keeping login credentials stable and distinct when users choose.
