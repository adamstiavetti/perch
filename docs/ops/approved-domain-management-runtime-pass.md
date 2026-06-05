# Approved Domain Management Runtime Pass

## Purpose

This artifact records that Epoch 05 Approved Email Domain Management was applied
to the linked Supabase runtime and validated through the operator-only RPC
surface.

This pass confirms:

- the approved-domain management migration is applied remotely
- the reserved test-TLD validation corrective migration is applied remotely
- operator-only approved-domain RPCs enforce explicit operator scope
- reserved/test-only domains can be used for safe runtime proof
- invalid and unsafe domain inputs still return structured safe denials
- normal work-email verification reads active domains only
- disabled approved-domain rows stay hidden from normal authenticated reads

## Runtime Environment

- date: 2026-06-05
- repo path: `/Users/ClawdBot/jmpseat`
- commits present:
  - `2a8beb1 feat: add approved domain management`
  - `eff9f14 test: document approved domain RPC contract`
  - `2527c14 fix: allow approved domain test tlds`
- migrations applied:
  - `20260605184500_add_operator_managed_approved_email_domains.sql`
  - `20260605190500_fix_approved_domain_test_tld_validation.sql`
- operator identity:
  - validated through an active operator grant with `operator.manage_approved_domains`
  - exact auth UUID and email are redacted from committed docs
- no environment values, session tokens, secrets, privileged account identifiers,
  or magic-link contents are included in this artifact
- no production deployment was run

## Migration State

`npx supabase migration list --linked` showed matching local and remote history
through:

- `20260605184500`
- `20260605190500`

Before applying the corrective migration, the linked project had exactly one
pending local migration:

- `20260605190500_fix_approved_domain_test_tld_validation.sql`

After `npx supabase db push`, the corrective migration appeared in the remote
history.

## Authorization Checks

Runtime RPC checks confirmed:

- truly unauthenticated `list_approved_email_domains_for_operator()` execution is
  blocked before the RPC body runs because execute is not granted to `public`
  for this operator-only function
- anonymous callers are therefore denied at the Supabase/PostgREST
  auth/execute-permission layer rather than receiving the in-function
  `authenticated_operator_required` response
- a non-operator active beta user returned structured denial with
  `missing_manage_approved_domains_scope`
- the operator-scope RPC returned `operator.manage_approved_domains` for the
  validated operator
- `is_operator_with_scope('operator.manage_approved_domains')` returned `true`
  for the validated operator
- an ungranted scope returned `false`

No privileged operator UUID or email was printed or recorded.

## Reserved Test-Domain Validation

Runtime create checks used the app-shaped RPC parameter names only:

- `requested_domain`
- `requested_airline`
- `requested_status`
- `target_domain_id`

Accepted reserved/test-only domains:

- `.test`
- `.example`
- `.invalid`

Uppercase domain input normalized to lowercase in the stored operator-visible
record.

Structured invalid-input denials remained intact:

- protocol input returned `invalid_domain_format`
- path input returned `invalid_domain_format`
- email local-part input returned `invalid_domain_format`
- blank input returned `invalid_domain_format`
- malformed hyphen-label input returned `invalid_domain_format`
- known personal-provider input returned `personal_email_domain_blocked`

Duplicate active domain creation returned structured duplicate behavior with
`duplicate_active_domain`.

## Operator List, Search, Update, And Disable

Runtime operator checks confirmed:

- authorized operator create succeeded for safe reserved test domains
- authorized operator list could see the created rows
- operator-side search-equivalent filtering found the runtime proof rows
- update of domain metadata/status succeeded with
  `approved_email_domain_updated`
- update-driven status change to `disabled` succeeded with
  `approved_email_domain_disabled`
- dedicated disable RPC succeeded with `approved_email_domain_disabled`
- disable behavior was a soft status change, not a destructive delete
- disabled runtime proof rows remained visible through the operator path

The runtime-created proof rows were soft-disabled at the end of the pass.

## Normal Work-Email Verification Read Path

Runtime checks confirmed:

- normal authenticated reads can resolve active approved domains
- disabled approved-domain rows are hidden from normal authenticated reads
- the work-email support helper treats active approved domains as supported
- the work-email support helper treats disabled domains as unsupported
- work-email draft claim planning still includes `airline_worker`
- work-email draft claim planning does not issue `role` or `base` claims

This pass did not change work-email claim issuance rules.

## Audit Behavior

Runtime audit checks confirmed persistence for:

- `approved_email_domain.created`
- `approved_email_domain.updated`
- `approved_email_domain.disabled`
- `approved_email_domain.unauthorized_attempt`

Audit proof was checked by event type and approved-domain metadata without
printing privileged account identifiers.

## Admin Shell And Navigation Behavior

Automated admin-shell tests and build output confirmed:

- `/app/admin/approved-domains` is present as an implemented route
- Approved Domains becomes available only with
  `operator.manage_approved_domains`
- future operator sections remain disabled until their routes are implemented
- `/app/admin/verification` remains reviewer-scope based

This runtime pass did not use a browser-authenticated visual session for the
signed-in admin shell.

## Validation Commands

Runtime checks were followed by:

- `node --test test/admin/approvedDomains.test.mts`
- `node --test test/admin/adminShell.test.mts test/admin/operatorAccess.test.mts test/admin/operatorBootstrapRoute.test.mts`
- `node --test test/verification/workEmail.test.mts test/verification/approvedEmailDomains.test.mts test/verification/verificationRequestFlows.test.mts test/verification/review.test.mts test/verification/claimsAuth.test.mts`
- `node --test test/security-events/securityEvents.test.mts test/security-events/verificationSecurityEvents.test.mts`
- `npm run typecheck`
- `npm run build`
- `npm run lint`
- `git diff --check`

Known lint warnings remained unrelated:

- `app/lab/live-globe-proof/page.tsx`
- `src/lib/scroll/heroFlightControl.ts`

## Caveats

- Production deployment/runtime validation is separate from this linked-runtime
  database proof.
- No reviewer-scope management was implemented.
- No audit-inspection UI was implemented.
- No cleanup-monitoring UI was implemented.
- No E05-T04 work was started.
