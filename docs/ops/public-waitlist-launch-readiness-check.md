# Public Waitlist Launch Readiness Check

Date: 2026-06-08

Baseline commits:

- `4e68569 feat: add first party waitlist capture`
- `6eba81c docs: record public waitlist runtime pass`
- `75f53f0 polish: refine waitlist survey copy`
- `b88df14 docs: record waitlist survey copy runtime pass`
- `b9bd7e6 feat: add waitlist metrics dashboard`
- `b4fd9f5 docs: record waitlist metrics dashboard runtime pass`
- `2894c9e polish: refine admin access and waitlist dashboard`
- `653281d docs: record waitlist contact dashboard runtime pass`
- `80b68a2 docs: record founder waitlist dashboard visual pass`

## Readiness Status

Status: `blocked`

Summary:

- The first-party public waitlist flow is implemented and runtime-proven.
- The operator/admin waitlist dashboard is implemented and runtime-proven,
  including founder-confirmed full-contact mode for authorized admin use.
- The public/private domain split is clear in code, tests, and current docs.
- Root-domain cutover to `jmpseat.com` should not happen yet because the public
  waitlist surface still needs production-grade metadata polish and the linked
  legal pages still contain placeholder effective dates.

## Checklist

| Area | Status | Notes |
| --- | --- | --- |
| Public/private domain split | Pass | Public root is intended to stay waitlist/marketing-only while `beta.jmpseat.com` remains the private beta/auth/admin surface. |
| No public Beta Access exposure | Pass | Public page/tests confirm no Beta Access button and no `/login?next=/app` root entry. |
| Email-first waitlist capture | Pass | Email field appears above the main CTA and submit state is runtime-proven. |
| Invalid email handling | Pass | Safe invalid-email state is implemented and test-covered. |
| Duplicate signup handling | Pass | Friendly duplicate behavior is implemented and runtime-proven. |
| Optional survey after email submit | Pass | Survey appears only after successful email capture and can be skipped or submitted. |
| URL safety | Pass | Raw email and survey token do not appear in URL state. |
| Public data exposure | Pass | Public page does not expose waitlist emails, survey answers, internal IDs, or tokens. |
| Admin waitlist dashboard | Pass | `/app/admin/waitlist` exists, is not public, and supports masked audit mode plus contact-authorized detail mode. |
| Contact-detail permission split | Pass | `operator.read_audit` remains masked/aggregate only; `operator.view_waitlist_contacts` is required for raw contact-detail mode. |
| Public copy safety boundaries | Pass | No proof upload, badge upload, manual review, role/base claim, or guaranteed beta-access language appears on the public page. |
| Responsive layout and form semantics | Pass with follow-up | Layout, headings, labels, alerts, and success states are in place; a small helper-text association polish remains optional. |
| SEO/social metadata | Blocked | Public root page currently lacks final launch metadata coverage such as Open Graph, Twitter card, canonical URL, and explicit robots posture. |
| Linked legal page readiness | Blocked | Privacy and Terms pages still show `Effective date: [Add launch date]`. |

## Blockers

1. Public waitlist metadata is not launch-ready.
   Current public-page metadata includes a title and description, but the page
   still lacks confirmed launch-ready Open Graph metadata, Twitter card
   metadata, canonical URL handling, and an explicit robots/noindex posture for
   the root-launch plan.

2. Linked legal pages still contain placeholder effective dates.
   `/privacy` and `/terms` currently render `Effective date: [Add launch date]`,
   which should be resolved before the root domain becomes the public waitlist
   surface.

## Non-Blocking Follow-Ups

- Add `aria-describedby` from the public email field to its helper text so the
  form guidance is more explicitly tied to the input for assistive technology.
- Do one final manual visual pass on a root-domain preview after metadata/legal
  polish lands to confirm mobile spacing, contrast, and footer-link focus
  affordances.
- Confirm whether the current `"Private waitlist"` page-title wording should
  remain as-is for launch or be updated to a broader public-waitlist framing.

## Public / Private Domain Split

- Future `jmpseat.com` target: public waitlist/marketing only.
- Future `jmpseat.com` must not expose Beta Access.
- Future `jmpseat.com` must not route visitors into `/login?next=/app` from the
  public waitlist page.
- `beta.jmpseat.com` remains the private beta/auth/admin/operator surface.
- Root cutover must not disturb beta auth, admin, or operator tooling on
  `beta.jmpseat.com`.

## Waitlist Flow Summary

- Email-first capture is implemented on the public route.
- Invalid email handling fails safely.
- Successful email submit shows a safe success state.
- Optional product-shaping survey appears only after successful email capture.
- Optional survey submit and skip paths are implemented and runtime-proven.
- Duplicate signup behavior is friendly and runtime-proven.
- Raw email and survey token do not appear in the URL.
- The public page does not expose waitlist emails or survey answers.

## Admin Dashboard Summary

- `/app/admin/waitlist` exists and is restricted to authorized operator/admin
  users.
- Founder/admin full-contact mode has been browser-confirmed separately in
  runtime notes.
- `operator.read_audit` supports aggregate metrics plus masked recent-submission
  summaries only.
- `operator.view_waitlist_contacts` is required for full contact email and
  per-person survey detail.
- Public waitlist users cannot see dashboard data, waitlist emails, survey
  answers, or internal identifiers.

## SEO / Metadata Summary

Current public waitlist metadata state is not sufficient for root launch:

- Page title exists.
- Page description exists.
- Open Graph title/description are not yet confirmed on the public route.
- Twitter card metadata is not yet confirmed on the public route.
- Canonical URL handling is not yet confirmed on the public route.
- Explicit robots/noindex posture is not yet confirmed for the root-launch
  target.

This should be handled in a focused code task before root cutover.

## Mobile / Accessibility Summary

Code review indicates the public waitlist page is structurally in good shape:

- Responsive layout rules are present.
- Heading order is semantic.
- Labels exist for the public email field and survey controls.
- Error states use `role="alert"`.
- Success state uses `role="status"`.
- Fieldsets/legends are present for grouped survey choices.
- Focus styles exist for primary form controls.

Non-blocking polish remains:

- Explicitly associate email helper text with the email input.
- Recheck mobile/footer affordances visually after final launch metadata/legal
  polish.

## Final Root Cutover Checklist

1. Merge and deploy the focused metadata/legal readiness task to production.
2. Confirm the current production target serves the latest reviewed `main`.
3. Point `jmpseat.com` at the public waitlist deployment only.
4. Keep `beta.jmpseat.com` pointed at the private beta/auth/admin deployment.
5. Verify root `jmpseat.com` has no Beta Access button or `/login?next=/app`
   entry path.
6. Verify a non-sensitive waitlist signup succeeds on root.
7. Verify optional survey submit and skip still work on root.
8. Verify `/privacy` and `/terms` render final effective dates and launch-ready
   copy.
9. Verify social preview/canonical/robots behavior on the root deployment.
10. Verify `beta.jmpseat.com/app/admin/waitlist` still works for authorized
    operator/admin users.

## Rollback Plan

1. Re-alias `jmpseat.com` back to the previous known-good deployment.
2. Reconfirm `beta.jmpseat.com` was not changed and still serves the private
   beta/auth/admin surface.
3. Re-test the public waitlist root after rollback.
4. Record what failed, revert only the launch-surface change, and keep beta
   runtime untouched.

## Recommended Next Action

Recommended next task:

`W05A Public Waitlist Metadata And Legal Launch Polish`

Scope:

- Add launch-ready root metadata for the public waitlist page.
- Resolve placeholder effective dates on the linked Privacy and Terms pages.
- Re-run launch-readiness verification after that polish.

Root cutover to `jmpseat.com` should happen only after that focused readiness
task is complete and reviewed.
