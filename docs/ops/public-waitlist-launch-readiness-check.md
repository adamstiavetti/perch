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

Status: `pending review and readiness rerun`

Summary:

- The first-party public waitlist flow is implemented and runtime-proven.
- The operator/admin waitlist dashboard is implemented and runtime-proven,
  including founder-confirmed full-contact mode for authorized admin use.
- The public/private domain split is clear in code, tests, and current docs.
- W05A code now addresses the prior launch blockers by adding launch-ready
  public waitlist metadata, replacing placeholder Privacy/Terms effective
  dates, and tying the email helper text to the email input.
- W05A also adds a dedicated `1200 x 630` social preview image so Open Graph and
  Twitter metadata no longer point at the wider runway hero crop.
- Root-domain cutover to `jmpseat.com` still has not happened. Launch readiness
  should be rerun after W05A review and merge before any root-domain cutover.

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
| Responsive layout and form semantics | Addressed in W05A | Layout, headings, labels, alerts, and success states are in place; W05A adds `aria-describedby` from the email input to its helper text. |
| SEO/social metadata | Addressed in W05A | W05A adds launch-ready title, description, Open Graph, Twitter card, canonical root URL handling, indexable robots posture, and a dedicated `1200 x 630` social preview image for `jmpseat.com`. |
| Linked legal page readiness | Addressed in W05A | W05A replaces the Privacy and Terms placeholder effective dates with a concrete launch-intent date. |

## Prior Blockers Addressed In W05A

1. Public waitlist metadata is not launch-ready.
   W05A adds launch-ready public root metadata for `jmpseat.com`, including
   title, description, Open Graph title/description/URL, Twitter card
   title/description/card type, canonical root URL handling, and indexable
   robots posture. It also replaces the mismatched runway hero image reference
   with `public/jmpseat/social-preview.png`, a dedicated `1200 x 630` PNG that
   matches the declared social-card dimensions.

2. Linked legal pages still contain placeholder effective dates.
   W05A replaces `/privacy` and `/terms` placeholder effective dates with
   `Effective date: June 8, 2026`.

## Non-Blocking Follow-Ups

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

W05A public waitlist metadata coverage:

- W05A adds launch-ready page title and description.
- W05A adds Open Graph title, description, and URL metadata.
- W05A adds Twitter summary-card metadata.
- W05A points Open Graph and Twitter image metadata at the dedicated
  `1200 x 630` `public/jmpseat/social-preview.png` asset.
- W05A adds canonical URL handling for the future `https://jmpseat.com` root.
- W05A sets the public root waitlist to indexable robots posture.

These changes still need review, merge, and a fresh launch-readiness rerun
before root cutover.

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

- Recheck mobile/footer affordances visually after final launch metadata/legal
  polish.

## Final Root Cutover Checklist

1. Review and merge W05A metadata/legal/accessibility polish.
2. Rerun this launch-readiness check against the reviewed branch or deployment
   candidate.
3. Deploy the reviewed public waitlist build to the production target.
4. Confirm the current production target serves the latest reviewed `main`.
5. Point `jmpseat.com` at the public waitlist deployment only.
6. Keep `beta.jmpseat.com` pointed at the private beta/auth/admin deployment.
7. Verify root `jmpseat.com` has no Beta Access button or `/login?next=/app`
   entry path.
8. Verify a non-sensitive waitlist signup succeeds on root.
9. Verify optional survey submit and skip still work on root.
10. Verify `/privacy` and `/terms` render final effective dates and launch-ready
   copy.
11. Verify social preview/canonical/robots behavior on the root deployment.
12. Verify `beta.jmpseat.com/app/admin/waitlist` still works for authorized
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

`W05B Public Waitlist Launch Readiness Rerun`

Scope:

- Review and merge W05A.
- Rerun launch-readiness verification against the reviewed branch or deployment
  candidate.
- Decide whether root cutover is approved as a separate task.

Root cutover to `jmpseat.com` should happen only after that rerun is complete
and explicitly approved.
