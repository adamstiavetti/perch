# Epoch 5 Final Closeout

Date: 2026-06-08

## Executive Status

Epoch 5 is closed with explicit carry-forward items.

The bounded operator/admin tooling foundation is implemented, documented, and
runtime-proven across its original operator/admin surfaces. The recent
security/access-control closeout items are either closed live or preserved as
historical/deprecated proof-system records.

This closeout does not claim the broader jmpseat product is ready for open
community launch. It closes the current Epoch 5 operator/admin/security
hardening lane and carries forward the remaining narrow operational items.

## Runtime Surfaces

Current public/private domain split:

- `https://jmpseat.com` serves the public waitlist/marketing surface.
- `https://www.jmpseat.com` serves the public waitlist/marketing surface.
- `https://beta.jmpseat.com` serves the private beta/auth/admin surface.

Apex, `www`, and beta preservation has been repeatedly verified across recent
runtime passes. Public root and `www` remain waitlist-only, while beta remains
the private auth/admin runtime.

Vercel environment scoping is now documented and runtime-verified:

- public apex/`www` use the Vercel Production environment.
- beta uses a Vercel Preview deployment.
- the required Supabase env names now exist persistently in Preview.
- a normal beta Preview deploy without deployment-scoped Supabase env injection
  returned healthy beta auth redirects and did not move apex/`www`.

Future ops maturity should decide whether to keep the CLI/manual-deploy model,
connect the project to Git, or split public and beta into separate Vercel
projects. That decision is deferred and was not implemented in this closeout.

## Public Waitlist Status

Public waitlist status is live:

- email-first waitlist capture is live on apex and `www`.
- optional product-shaping survey is live for legitimate new signup sessions.
- public root has no Beta Access entry.
- public root has no `/login?next=/app` CTA.
- public root has no proof/badge/document/manual-review upload copy.
- duplicate survey-token takeover is closed live.
- initial top-scroll bug is fixed live.
- app-owned security headers are live on public routes.

The public waitlist remains a validation/marketing surface, not a public auth
entry or private-app access surface.

## Auth, Private Beta, And Admin Status

The beta auth/admin surface is preserved:

- `https://beta.jmpseat.com/login` renders.
- signed-out `/app` redirects to beta login.
- signed-out `/app/admin/waitlist` redirects to beta login.
- beta remains separate from public apex/`www`.

Private-app access and operator/admin tooling remain separate:

- `operator.internal_private_app_access` is the only operator scope that grants
  internal private-app override.
- unrelated operator scopes do not grant app-entry override.
- admin/operator tool permissions continue to use their own scoped checks.
- reviewer access remains separate from operator/admin access.
- no beta grants, role claims, base claims, or restricted-board claims were
  created by the recent closeout tasks.

## Security Closeout Status

| Item | Status | Notes |
| --- | --- | --- |
| Duplicate waitlist survey-token | Closed live | Duplicate public waitlist submissions no longer receive existing survey tokens or edit another signup's optional survey answers. |
| Operator private-app scope gate | Closed live | Private-app operator override now requires `operator.internal_private_app_access`; unrelated operator/admin scopes do not grant app entry. |
| `security_events` audit forgery | Closed live | Direct authenticated/anon inserts into trusted audit rows are removed; operator/admin audit readers filter to trusted server-produced rows. |
| Proof upload metadata trust | Historical / deprecated for current path | Code is deployed and test-covered with server-side JPEG/PNG structural validation. The former live authenticated proof-upload mutation test is no longer an active next task or blocker because proof uploads are out of current private beta / 05B scope. Existing proof code/storage/artifacts, if present, remain subject to the documented privacy/security controls. |
| Security headers | Closed live | App-owned `nosniff`, referrer, permissions, anti-framing, and CSP headers are live on public and beta routes. |
| Broad CSP policy | Carry-forward | Anti-framing is enforced now; broader CSP remains report-only pending a reporting/enforcement plan. |
| Proof upload decode/re-encode | Future only if reactivated | Current fix uses bounded structural validation; full decode/re-encode is not part of the active lane and would require a fresh proof-upload scope decision plus dependency/runtime compatibility review. |

## Carry-Forward Items

Carry forward exactly these items from this closeout:

1. Keep proof uploads deprecated/out of current scope for the active private
   beta / 05B product path. The old safe live authenticated proof-upload
   mutation test is no longer an active next task or blocker. Existing
   proof-upload hardening, private proof storage, access, retention, cleanup,
   and audit requirements remain historically documented and still apply to any
   proof artifacts that may exist. Any future manual-proof or document-upload
   workflow requires a fresh scope decision and privacy/security review.
2. Define a future CSP reporting/enforcement plan. The current broad CSP is
   report-only and has no report endpoint.
3. Decide the future Vercel deployment model: keep CLI/manual deploys, connect
   the project to Git, or split public and beta into separate Vercel projects.
4. Keep handling Supabase migration-history drift with targeted migration apply
   until the drift is explicitly resolved. Do not run broad `supabase db push`
   while the drift remains.
5. Keep branded sender/custom SMTP/email template polish as a deferred
   beta-readiness TODO for trust and deliverability. Existing auth email flows
   already work; this is not an auth-flow implementation blocker by itself.
6. Keep community boards, restricted-board gates, community-admin tooling, and
   posting/moderation work in the next product lane, not in Epoch 5.

## Non-Goals And Boundaries

This closeout did not add or change:

- airline portal login
- schedule scraping
- live crew tracking
- AI final verification decisions
- public proof-file access
- proof bucket privacy
- reviewer signed-URL authorization
- signed URL TTLs
- self-review blocks
- reviewable status checks
- proof audit logging
- beta grants
- role claims
- base claims
- restricted-board claims
- private beta auth settings

The proof bucket remains private. Proof files are not public.

## Evidence Commits

Key evidence commits:

- `6a4dd08 docs: record public waitlist www launch pass`
- `a2aa4f8 docs: record public waitlist scroll hotfix`
- `9e0adef docs: record waitlist survey token hardening runtime pass`
- `08d4641 docs: record operator private app scope gate runtime pass`
- `94e8158 docs: record security events trust boundary runtime pass`
- `ea6db24 docs: record proof upload content validation runtime pass`
- `91d1b1d docs: record security headers runtime pass`
- `be6a458 docs: record beta vercel env scoping fix`

Additional relevant commits:

- `9458543 docs: record public waitlist root cutover`
- `c430748 fix: harden waitlist survey token handling`
- `03d7455 fix: require dedicated operator private app scope`
- `ba74e02 fix: harden security event trust boundary`
- `329d238 fix: validate proof upload image content`
- `8558d2d fix: add security response headers`

## Next Recommended Lane

Recommended next lane:

1. Move to the narrow private beta readiness lane: checklist
   reconciliation, beta verification/admin workflow polish, deferred auth email
   branding/custom SMTP TODO tracking, and the bridge into
   community-access/moderation planning.

Do not reopen Epoch 5 for broad proof-upload expansion, community boards,
posting, role/base claims, restricted-board gates, or unrelated operator/admin
features unless a specific regression or approved product lane requires it.
