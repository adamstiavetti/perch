# Operator Private-App Scope Gate Fix

Date: 2026-06-08

## Summary

This patch narrows the private-app operator override so `operatorPrivateAppAccess`
is true only when the active operator scopes include the dedicated
`operator.internal_private_app_access` scope.

The previous mapping treated any active operator scope as private-app override
eligibility. In `private_testing` and `internal_test` launch modes, that meant
unrelated operator/admin tooling scopes could bypass the normal beta access and
airline-email verification gates.

## Fix

The server-side app access context now derives private-app operator override
through a dedicated helper:

- `operator.internal_private_app_access` grants the private-app override.
- `operator.read_audit` does not grant the private-app override.
- `operator.view_waitlist_contacts` does not grant the private-app override.
- approved-domain, reviewer-scope, audit, proof-cleanup, waitlist, beta-invite,
  and operator-management tooling scopes do not grant private-app entry by
  themselves.

The shared private-app gate behavior remains unchanged after the boolean is
mapped:

- signed-out users still redirect to login
- incomplete profiles still redirect to profile setup
- private/internal launch modes still require beta access and airline-email
  verification when the dedicated operator override is absent
- accounts with `operator.internal_private_app_access` can still enter private
  app surfaces through the existing `operator_internal` source during
  `private_testing` and `internal_test`
- first-base and broader-launch airline-email gates are not widened by operator
  access

## Boundaries Preserved

This change keeps these concepts separate:

- operator/admin tool permissions
- private app entry
- beta access
- airline work-email verification
- reviewer access

Admin/operator pages continue to enforce their own route-specific scope checks.
The internal private-app scope does not unlock operator-management tooling by
itself, and operator/admin tooling scopes do not grant private-app entry by
themselves.

No beta grants or runtime operator grants were changed. No runtime data was
mutated.

## Validation Status

Local regression coverage was added for:

- no operator scopes
- `operator.read_audit` only
- `operator.view_waitlist_contacts` only
- multiple unrelated operator scopes
- dedicated `operator.internal_private_app_access`
- source-level prevention of the broad `operatorScopes.length > 0` mapping
- existing private/internal launch-mode operator override behavior
- existing beta and airline-email gate enforcement when override is absent
- admin/operator tooling authorization remaining separate
- public waitlist root guardrails through the waitlist test suite

Runtime validation and deployment remain pending after review/merge.

## Scope

This is part of the Epoch 5 security/access-control closeout. It did not create
or edit migrations, did not run Supabase `db push`, did not deploy, did not
change DNS, did not change Vercel settings or aliases, did not change Supabase
settings, and did not alter public waitlist behavior or waitlist database
behavior.
