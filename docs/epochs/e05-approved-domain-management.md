# E05-T03: Approved Email Domain Management

Brand note: jmpseat is the canonical product and app name. This implementation
note does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Scope

This ticket implements the first real operator-only admin tool in Epoch 05:
approved work-email domain management.

Delivered in this slice:

- operator-only `/app/admin/approved-domains`
- audited operator RPCs for approved-domain list/create/update/disable
- server-only approved-domain action layer
- approved-domains navigation activation for authorized operators
- preservation of the existing normal-user `active` domain read path used by
  work-email verification

Not delivered in this slice:

- no reviewer-scope management
- no audit inspection UI
- no cleanup monitoring UI
- no work-email claim issuance rule changes

## 2. Migration

Migration created:

- `supabase/migrations/20260605184500_add_operator_managed_approved_email_domains.sql`

This migration adds:

- approved-domain normalization and validation helpers
- personal-email-domain blocking helpers
- `list_approved_email_domains_for_operator()`
- `create_approved_email_domain(...)`
- `update_approved_email_domain(...)`
- `disable_approved_email_domain(...)`
- approved-domain security-event taxonomy extension

The migration does not alter the existing normal-user read policy that exposes
only `status = 'active'` rows for work-email verification checks.

## 3. Operator Authorization

Required scope:

- `operator.manage_approved_domains`

Authorization behavior:

- no operator grant means no access
- missing or failing operator-scope readiness RPCs are treated as tool setup/not-ready, not unauthorized access
- the private-app gate runs before the approved-domain config fallback is rendered
- gated users who hit operator-scope load failures see a safe setup/not-ready state instead of an access-restricted redirect
- reviewer scope does not imply approved-domain access
- beta access, verification claims, work email, login email, and profile text
  do not imply approved-domain access
- the page redirects unauthorized users to `/app/access-restricted`
- the operator RPCs also enforce `operator.manage_approved_domains`

## 4. Approved-Domain Behavior

The operator tool now supports:

- listing approved domains with bounded metadata
- simple server-side search by domain, label, or status
- creating approved domains
- updating domain, label, and status
- disabling domains through soft-disable only

Safety rules:

- domains are normalized to lowercase
- invalid domain shapes are rejected
- protocol, path, query-string, fragment, and email local-part inputs are rejected
- known personal email domains are rejected
- duplicate domain conflicts are blocked
- concurrent duplicate-domain races are handled inside the SQL RPC layer with unique-constraint handling
- update-driven disable transitions emit `approved_email_domain.disabled` instead of a generic update event
- disable is a status change, not a destructive delete
- historical verification evidence and claims are untouched

## 5. Audit Events

This slice adds:

- `approved_email_domain.created`
- `approved_email_domain.updated`
- `approved_email_domain.disabled`
- `approved_email_domain.unauthorized_attempt`

Success and expected denial paths are represented in the RPC layer with stable
structured responses. Unauthorized route access is also recorded through the
existing server security-event helper before redirecting to the restricted page.

## 6. Admin Route

Route added:

- `/app/admin/approved-domains`

Navigation behavior now becomes:

- Approved Domains: linkable only for operators with
  `operator.manage_approved_domains`
- landing-page copy distinguishes explicit operator authorization from whether
  any currently implemented operator tool matches the account's granted scopes
- Verification Review: still reviewer-scope based
- Reviewer Scopes, Audit Inspection, Proof Cleanup: still disabled until their
  later Epoch 05 tickets implement those tools

## 7. Runtime Follow-Up

Runtime validation is still required after merge and migration apply.
The initial post-apply runtime pass confirmed the migration applied and operator
scope checks passed, then stopped on an invalid-input check that used stale
`p_*` RPC argument names. The app and published RPC contract use
`requested_domain`, `requested_airline`, `requested_status`, and
`target_domain_id`; app-shaped runtime calls return structured validation
responses for protocol, path, local-part, blank, malformed, and personal-provider
inputs.

No corrective schema migration was created for that investigation because the
database behavior matched the app's RPC contract. The full E05-T03 runtime proof
is still pending and should resume with app-shaped RPC parameters.

The runtime pass should confirm:

- unauthorized users cannot access or fetch approved-domain data
- authorized operators can create, update, and disable domains safely
- disabled domains no longer appear to normal work-email verification reads
- approved-domain audit events persist as expected
- verification reviewer behavior remains unchanged

## 8. What Remains For E05-T04

The next operator/admin tooling ticket is E05-T04 Reviewer Scope Management.

That slice still needs:

- bounded reviewer-scope list and mutation tooling
- self-escalation prevention for reviewer-scope grants
- reviewer-scope audit events and runtime proof

## 9. Source-Of-Truth Status

This document records the E05-T03 implementation outcome.

No Supabase `db push`, production commands, or secrets are part of this ticket.
