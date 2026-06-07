# Waitlist Metrics Dashboard

Date: 2026-06-07

Baseline branch: `w03-waitlist-metrics-dashboard`

## Summary

This note records the W03/W04 implementation for an operator/admin-only
first-party waitlist dashboard at `/app/admin/waitlist`. The dashboard uses the
existing first-party waitlist signup and optional survey response tables to show
safe aggregate metrics and masked recent records. No new analytics SDK,
third-party analytics path, root public cutover, deployment, runtime mutation, or
Supabase migration apply happened in this task.

Runtime validation is still pending after the branch is reviewed, merged, and
the linked runtime is confirmed to be serving the new route.

## Implemented Scope

- Added `/app/admin/waitlist` behind the private-app gate and explicit operator
  authorization.
- Added a Waitlist item to the shared admin shell navigation.
- Reused the existing `operator.read_audit` scope because the dashboard is
  read-only, aggregate-first operational inspection.
- Added server-side waitlist metrics loading through the existing service-role
  server path.
- Added pure metrics helpers for testable aggregation and email masking.
- Added summary cards for total signups, signups today, signups over 7 days,
  signups over 30 days, survey completion rate, and recent submissions shown.
- Added aggregate lists for aviation connection, desired features, safe
  base/airport/community text, discovery source, and referral/UTM source.
- Preserved common safe UTM/source labels, including underscore-separated
  campaign labels, in referral/source aggregates.
- Added recent signup cards that show masked email only, submission date, survey
  completion state, and bounded optional category fields.
- Kept headline aggregate metrics separate from the recent-submissions display
  cap so totals, time-window counts, survey completion rate, and top survey
  insights are not computed from a truncated recent sample.

## Metrics Source

The existing waitlist schema already supports the initial dashboard:

- `waitlist_signups` provides email capture date, source/referrer/UTM fields,
  duplicate-safe signup rows, and survey completion state.
- `waitlist_survey_responses` provides bounded optional answers through the
  existing allowlisted survey response path.

No new `waitlist_events` table was created in this pass. Dedicated event capture
for page views, CTA clicks, and failed submissions remains optional future work
if the founder needs funnel metrics beyond signup and survey-response state.

Aggregate metrics are loaded through a paginated server-side query path and are
not computed from the bounded recent-submissions list. Recent submissions remain
intentionally display-limited and masked.

## Privacy And Access Controls

- The dashboard is not public.
- Non-operators cannot access `/app/admin/waitlist`.
- Access requires an explicit active operator grant containing
  `operator.read_audit`.
- Raw waitlist emails are not rendered.
- Recent submissions use masked email only.
- Row IDs, survey tokens, cookies, user IDs, and internal identifiers are not
  rendered.
- Aggregate display only uses bounded checkbox/select answers and sanitized
  short free-text base/community values.
- Sensitive text such as employee IDs, badge/proof/document references, portal
  credentials, passenger information, exact hotel details, schedules, tokens, or
  email-like values is excluded from free-text aggregate display.
- UTM/source labels may include normal campaign characters such as letters,
  numbers, spaces, periods, hyphens, and underscores, but unsafe/private
  attribution strings are still excluded.
- The dashboard does not grant beta access, mutate airline-email verification,
  issue role/base/restricted-board claims, or expose proof-upload data.

## Runtime Status

Implementation status: complete on branch.

Runtime status: pending.

Required runtime follow-up after merge/deploy:

- Confirm `/app/admin/waitlist` is available on stable beta only to an authorized
  operator/admin.
- Confirm a non-operator is redirected or blocked.
- Confirm summary cards render from real waitlist data.
- Confirm total, time-window, survey completion, and top-list aggregate metrics
  are not truncated by the recent-submissions display limit.
- Confirm recent records are masked and do not expose raw emails, row IDs, or
  survey tokens.
- Confirm public `/` still has no Beta Access entry.
- Confirm no root `jmpseat.com` cutover happened unless a separate launch ticket
  explicitly performs it.

## Not Included

- No root public-domain cutover.
- No deployment.
- No Supabase db push or migration apply.
- No new migration.
- No third-party analytics SDK.
- No Vercel settings changes.
- No DNS changes.
- No beta grant or private beta auth changes.
- No proof upload, badge upload, document upload, proof review, or community
  feature work.
