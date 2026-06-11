# FBMVP-T20 DFW Baseboard Comment Reporting + Moderation Review

Status: implemented locally, runtime-pending.

`FBMVP-T20` adds the missing safety intake and operator review loop for
top-level DFW Baseboard comments. It keeps comment reporting server/RPC
controlled and extends the existing Community Moderation route instead of adding
a separate comment moderation queue.

## Scope

T20 adds:

- `public.board_post_comment_reports`
- `public.report_open_baseboard_post_comment(p_base_code text, p_comment_id uuid, p_reason text, p_details text default null)`
- `public.list_open_baseboard_post_comment_reports(p_base_code text, p_limit integer default 50)`
- a server-side `reportDfwBaseboardPostCommentAction(...)`
- compact comment report affordances on DFW Baseboard post detail comments
- a separate comment reports section in `/app/admin/community-moderation`

Operators continue to use the existing T19
`moderateDfwBaseboardPostCommentAction(...)` /
`public.moderate_open_baseboard_post_comment(...)` hide/remove path for comment
moderation decisions.

## Migration

Local migration:

- `supabase/migrations/20260611014500_create_board_post_comment_reports.sql`

Expected targeted runtime ledger row:

- version: `20260611014500`
- name: `create_board_post_comment_reports`

Known Supabase migration-history drift remains preserved. Broad Supabase
`db push` remains unsafe. T20 requires targeted runtime preflight/apply before a
runtime-pass record can be created.

## Comment Report Storage

`public.board_post_comment_reports` stores private report rows for top-level
comments. It includes:

- `comment_id`
- `reporter_user_id`
- `reason`
- `details`
- `status`
- review metadata fields
- created/updated timestamps

The report table enables RLS, has no direct anon/public/authenticated table
access, and reserves table access for service-role runtime paths. Reporter
identity is forced by RPC with `auth.uid()` and is not exposed by the operator
review RPC.

Reason values mirror post reports:

- `spam`
- `harassment`
- `unsafe_info`
- `privacy`
- `off_topic`
- `other`

Status values mirror post reports:

- `open`
- `reviewing`
- `resolved`
- `dismissed`

Optional details and resolution notes are bounded to `1000` characters. A
partial unique index prevents repeated open/reviewing reports for the same
reporter/comment pair.

## RPCs

`public.report_open_baseboard_post_comment(...)`:

- is `SECURITY DEFINER`
- locks `search_path=public, pg_temp`
- requires `auth.uid()`
- requires `public.current_user_can_read_open_board_posts()`
- resolves the active base by `p_base_code`
- resolves the active `open_verified` Baseboard
- reports only published top-level comments attached to published
  `visibility = 'board'` posts on that Baseboard
- forces `reporter_user_id = auth.uid()`
- validates reason and bounded details
- returns only a report UUID

`public.list_open_baseboard_post_comment_reports(...)`:

- is `SECURITY DEFINER`
- is `STABLE`
- locks `search_path=public, pg_temp`
- requires `auth.uid()`
- requires `public.is_operator_with_scope('operator.community_moderation')`
- resolves the active base by `p_base_code`
- resolves the active `open_verified` Baseboard
- returns only open/reviewing comment reports for published top-level comments
  on published board-visible DFW Baseboard posts
- clamps `p_limit` to a max of `100`
- returns safe operator-review fields only

Safe operator-review fields are:

- `report_id`
- `comment_id`
- `post_id`
- `comment_body_preview`
- `comment_author_label`
- `post_title_preview`
- `reason`
- `details`
- `report_status`
- `reported_at`

The review RPC uses `profiles.handle` for comment author labels with
`jmpseat member` fallback. It does not return reporter identity,
`reporter_user_id`, `author_user_id`, emails, claimed fields,
verification/proof data, signed URLs, private paths, or storage paths.

Both T20 RPCs revoke execute from `public` and `anon`, and grant execute only to
`authenticated` and `service_role`.

## App Integration

The DFW Baseboard post detail route remains private-gated before post/comment
reads. It now passes a server-side comment report action to comment cards and
reads only safe comment report redirect statuses.

The comment report action:

- validates post UUID, comment UUID, report reason, and bounded details
- records a security event without post/comment content
- calls `public.report_open_baseboard_post_comment(...)`
- always uses `p_base_code = "DFW"`
- revalidates only the relevant DFW Baseboard post detail route
- redirects with safe success/invalid/failure statuses
- does not call moderation RPCs or use client-side Supabase writes

The Community Moderation route now has separate sections for post reports and
comment reports. It keeps the existing `operator.community_moderation` app gate,
loads comment reports only after the operator gate succeeds, and uses the
existing comment hide/remove moderation action for decisions.

## Explicit Non-Goals

T20 does not add:

- nested replies
- saves
- reactions
- search
- Crew Picks ranking
- Layovers content
- public sharing
- lounge/restricted posting
- media uploads
- AI moderation
- bans
- appeals
- proof-upload scope
- a separate comment moderation route

T20 preserves zero direct `board_posts` write policies and adds no direct
`board_post_comments` write policies for anon/authenticated users.

No posts, reports, moderation records, comments, replies, saves, reactions,
search indexes, or user/community content were created during local validation.

## Next Step

Run targeted runtime preflight/apply for T20. T21 should be planned only after
T20 runtime-pass docs are reviewed and committed.
