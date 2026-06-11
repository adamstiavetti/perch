# FBMVP-T18 DFW Baseboard Moderation Review Runtime Pass

Date: 2026-06-10

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## Runtime Result

`FBMVP-T18` was successfully runtime-applied to the intended Supabase project.

Target project:

- name: `jmpseat`
- ref/id: `qcdfjrcnwuioqprmqqzx`

Applied migration:

- version: `20260610235111`
- name: `create_board_post_report_review_rpc`
- file:
  `supabase/migrations/20260610235111_create_board_post_report_review_rpc.sql`

## Verified Runtime State

The runtime apply created:

- `public.list_open_baseboard_post_reports(p_base_code text, p_limit integer)`

Runtime verification confirmed the function:

- is `SECURITY DEFINER`
- is `STABLE`
- uses locked `search_path=public, pg_temp`
- requires `auth.uid()`
- requires `public.is_operator_with_scope('operator.community_moderation')`
- resolves the active base by `p_base_code`
- resolves the active `open_verified` Baseboard
- returns only open/reviewing reports
- clamps `p_limit` to a max of `100`
- returns safe operator-review columns only
- uses `profiles.handle` with `jmpseat member` fallback
- does not return unsafe fields:
  - reporter identity
  - `reporter_user_id`
  - `author_user_id`
  - reporter email
  - author email
  - claimed fields
  - verification/proof data
  - signed URLs
  - private paths

Function execute posture:

- `public`: false
- `anon`: false
- `authenticated`: true
- `service_role`: true

Additional verification:

- `public.board_posts` write policy count remains `0`
- `public.board_posts` SELECT policy count remains `2`
- existing T16 functions remain present
- existing T17 functions remain present

## Runtime Smoke Boundary

Runtime verification used only catalog/permission/count checks.

The review RPC was not called for a content smoke test. No report details, post
title, post body, author labels, reporter information, or runtime content was
read or printed during runtime verification.

Count-only checks:

- `public.board_posts` count was `1`
- `public.board_post_reports` count was `0`

T18 migration/apply did not create:

- posts
- reports
- moderation records
- comments
- replies
- saves
- reactions
- search indexes
- user/community content

No broad Supabase `db push` or migration repair was used.

## Drift State

Known Supabase migration-history drift remains preserved and unrepaired:

- local `20260607103000` vs remote `20260607182257`
- local `20260607204212` vs remote `20260607205909`
- local T06 `20260609130534` vs remote T06 `20260609194858`

Plain-language guardrail: broad Supabase `db push` remains unsafe.

## Product Scope Confirmed

T18 adds operator-scoped DFW Baseboard moderation review through
`operator.community_moderation`. The admin review surface uses the safe
`public.list_open_baseboard_post_reports(...)` RPC and the existing T16
`public.moderate_open_baseboard_post(...)` hide/remove moderation RPC for
decisions.

T18 allows only hide/remove of reported DFW Baseboard posts.

T18 does not add:

- comments or replies
- saves
- reactions
- search backend
- moderation expansion beyond DFW Baseboard report review
- public sharing
- lounge or restricted-board posting
- Layovers content
- Crew Picks ranking
- media uploads
- AI moderation
- bans
- appeals
- comment moderation
- proof-upload scope
- direct `board_posts` write policies
- RLS weakening
- deploy or runtime settings changes

Next comments/replies milestone should wait until this T18 runtime-pass
documentation is reviewed and committed.
