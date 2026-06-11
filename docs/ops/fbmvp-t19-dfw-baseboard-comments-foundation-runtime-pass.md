# FBMVP-T19 DFW Baseboard Comments Foundation Runtime Pass

Status: runtime-applied.

`FBMVP-T19` was successfully runtime-applied to the Supabase `jmpseat`
project.

## Target Project

- name: `jmpseat`
- ref/id: `qcdfjrcnwuioqprmqqzx`

## Applied Migration

- version: `20260611001000`
- name: `create_board_post_comments_foundation`
- file: `supabase/migrations/20260611001000_create_board_post_comments_foundation.sql`

## Table Verification

Runtime verification confirmed:

- `public.board_post_comments` exists
- RLS is enabled on `public.board_post_comments`
- no comment table policies exist
- no direct anon/authenticated table access:
  - anon select/insert/update: `false`
  - authenticated select/insert/update: `false`
- service_role select/insert/update: `true`
- expected constraints exist:
  - trimmed nonempty body
  - body max `2000`
  - status allowlist: `published`, `hidden`, `removed`
  - removed lifecycle check
  - removal reason max `1000`
  - top-level-only `parent_comment_id IS NULL`
- trigger/index support exists:
  - `1` non-internal trigger
  - `4` indexes including primary key

## Read RPC Verification

`public.list_open_baseboard_post_comments(text, uuid, integer)` exists and was
verified as:

- `SECURITY DEFINER`
- `STABLE`
- locked `search_path=public, pg_temp`
- requires `auth.uid()`
- requires `public.current_user_can_read_open_board_posts()`
- resolves active base and active `open_verified` Baseboard
- requires parent post `status = 'published'`
- requires parent post `visibility = 'board'`
- returns only published top-level comments
- clamps limit to max `100`
- returns safe fields only:
  - `id`
  - `post_id`
  - `body`
  - `created_at`
  - `updated_at`
  - `author_label`

The read RPC does not return author IDs, emails, claimed fields,
verification/proof data, reporter identity, signed URLs, private paths, removal
fields, or moderation metadata.

## Create RPC Verification

`public.create_open_baseboard_post_comment(text, uuid, text)` exists and was
verified as:

- `SECURITY DEFINER`
- locked `search_path=public, pg_temp`
- requires `auth.uid()`
- requires `public.current_user_can_create_open_board_post()`
- resolves active base and active `open_verified` Baseboard
- requires parent post `status = 'published'`
- requires parent post `visibility = 'board'`
- trims and bounds body to `2000`
- forces `author_user_id = auth.uid()`
- forces `status = 'published'`
- forces top-level comments through inserted `parent_comment_id = null` plus the
  table constraint
- returns UUID only
- does not accept author id, status, or parent id from the client

## Comment Moderation RPC Verification

`public.moderate_open_baseboard_post_comment(text, uuid, text, text)` exists and
was verified as:

- `SECURITY DEFINER`
- locked `search_path=public, pg_temp`
- requires `auth.uid()`
- requires `public.is_operator_with_scope('operator.community_moderation')`
- resolves active base and active `open_verified` Baseboard through the
  comment's post
- supports only `hide` and `remove`
- requires bounded nonempty reason
- returns UUID only
- does not create comment reports, moderation queue UI, bans, suspensions,
  appeals, AI moderation, saves, reactions, search, or proof-upload scope

## Grant And Policy Verification

All three T19 RPCs were verified with:

- public execute: `false`
- anon execute: `false`
- authenticated execute: `true`
- service_role execute: `true`

Policy verification confirmed:

- `public.board_posts` write policy count remains `0`
- `public.board_posts` SELECT policy count remains `2`
- `public.board_post_comments` policy count is `0`

## Runtime Smoke Verification

Only catalog, permission, schema, and count checks were run.

- comment create/read/moderation RPCs were not called for live row output
- no comment/post/report content was read or printed during runtime verification
- no post/comment body, title, author label, user IDs, reporter info, or runtime
  content was printed
- `public.board_posts` count was `1`
- `public.board_post_reports` count was `0`
- `public.board_post_comments` count was `0`

No posts, reports, moderation records, comments, replies, saves, reactions,
search indexes, or user/community content were created by the T19 migration/apply.

## Drift And Safety Notes

Known Supabase migration-history drift remains preserved and unrepaired:

- local `20260607103000` vs remote `20260607182257`
- local `20260607204212` vs remote `20260607205909`
- local T06 `20260609130534` vs remote T06 `20260609194858`

Broad Supabase `db push` remains unsafe. T19 used targeted runtime apply only;
no broad db push or migration repair was used.

## Scope Confirmed

T19 adds top-level DFW Baseboard comments only. It uses safe comment read/create
RPCs and an operator hide/remove RPC plus server-side moderation action for
comment safety.

T19 does not add nested replies, comment reporting, comment moderation review
UI, saves, reactions, search, public sharing, lounge/restricted posting,
Layovers, Crew Picks, media, AI moderation, bans, appeals, or proof-upload
scope.

## Next Step

T20 should likely be comment reporting/moderation review integration after T19
runtime-pass docs are reviewed and committed.
