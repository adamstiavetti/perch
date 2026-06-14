# OPS-INTAKE-01 Browser Smoke

Date: 2026-06-14

## Commit / Deployment Tested

- Commit: `03e373c docs: wire manual policy intake copy`
- Deployment: `https://beta.jmpseat.com`
- Scope: public legal copy smoke for OPS-INTAKE-01 manual support, privacy,
  deletion/export, and moderation appeal intake language.

## Routes Tested

- `https://beta.jmpseat.com/legal/privacy`
- `https://beta.jmpseat.com/legal/moderation-appeals`
- `https://beta.jmpseat.com/legal/support-requests`
- Optional spot-check: `https://beta.jmpseat.com/legal/beta-terms`

## Manual Intake Copy Verification

Passed:

- `/legal/privacy` rendered publicly and returned HTTP 200 in a no-cookie check.
- `/legal/privacy` showed `privacy@jmpseat.com` and `support@jmpseat.com` with
  "once configured" framing.
- `/legal/privacy` rendered the fallback privacy/deletion/export subject
  prefixes:
  - `[Privacy Request]`
  - `[Deletion Request]`
  - `[Export Request]`
- `/legal/moderation-appeals` rendered publicly.
- `/legal/moderation-appeals` showed `support@jmpseat.com` and
  `[Moderation Appeal]` for manual appeal intake.
- `/legal/support-requests` rendered publicly.
- `/legal/support-requests` showed `support@jmpseat.com` as the manual support
  path once configured.
- `/legal/beta-terms` rendered publicly in the optional spot-check.

## Negative Boundary Verification

Passed:

- Copy clearly says there is no automated self-service deletion/export.
- Copy clearly says there is no in-app appeal backend.
- No in-app support form rendered.
- No form or `/api/...` action/link was found on the checked legal pages.
- No automated deletion/export claim was found.
- No immediate or guaranteed deletion/export timeline claim was found.
- No instant or guaranteed appeal approval claim was found.
- No AI final moderation decision claim was found.
- "Not final legal terms" and "not legal advice" framing rendered correctly.
- No portal login, schedule scraping, public crew tracking, exact crew hotel
  exposure, proof-upload expansion, or AI final-decision feature was implied.
- No secrets, tokens, private IDs, signed URLs, or storage paths were exposed as
  actual values. Mentions of storage paths were privacy-boundary copy saying
  they should not be public.

## Public/Auth Boundary Verification

Passed:

- Public legal no-cookie check for `/legal/privacy` returned HTTP 200.
- No-cookie private app check for `/app` returned HTTP 307 to
  `/login?next=%2Fapp`.
- Legal pages were public-safe and reachable without authentication.
- Private app routes remained gated in the spot-check.

## Data/Runtime Mutation Statement

No runtime or data mutation occurred.

No posts, reports, accounts, operator grants, Supabase state, deployment state,
environment settings, or runtime data were changed.

## Issues Found

None.

## Remaining Gaps

- No backend support/contact/deletion/export/appeal intake exists.
- No policy acceptance tracking exists.
- Legal-sensitive policy copy remains draft/founder/legal review material.
- Comments/replies remain blocked.
- Access-hold and operator-admin policy-link smoke limitations remain open from
  the earlier Policy/Ops UI wiring smoke.
- Incident/escalation backup owner remains unresolved unless later decided.

## Result

Passed.

OPS-INTAKE-01 manual intake legal copy is visible on the beta deployment and
preserves the intended manual-only, no-backend, no-legal-finality boundaries.
