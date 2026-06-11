# FBMVP-T19 DFW Baseboard Comments Foundation

Status: runtime-applied.

`FBMVP-T19` adds the first top-level comment foundation for DFW Baseboard post
detail. Comments are read and created through server-side helpers/actions and
database RPCs only.

## Scope

T19 adds:

- `public.board_post_comments`
- `public.list_open_baseboard_post_comments(p_base_code text, p_post_id uuid, p_limit integer default 100)`
- `public.create_open_baseboard_post_comment(p_base_code text, p_post_id uuid, p_body text)`
- `public.moderate_open_baseboard_post_comment(p_base_code text, p_comment_id uuid, p_action text, p_reason text)`
- a server-only DFW Baseboard comment read helper
- a server action for creating top-level comments
- a server-side operator-scoped comment moderation action that wraps
  `public.moderate_open_baseboard_post_comment(...)`
- top-level comments on `/app/hubs/dfw/baseboard/[postId]`

Comments attach only to published, board-visible posts on the active DFW
`open_verified` Baseboard.

## Migration

Runtime-applied migration:

- `supabase/migrations/20260611001000_create_board_post_comments_foundation.sql`

Runtime ledger row:

- version: `20260611001000`
- name: `create_board_post_comments_foundation`

Known Supabase migration-history drift remains preserved.
Broad Supabase `db push` remains unsafe. Plain guardrail: broad supabase db push remains unsafe.
T19 used targeted runtime preflight/apply only.

Runtime pass record:

- `docs/ops/fbmvp-t19-dfw-baseboard-comments-foundation-runtime-pass.md`

## Comments Table

`public.board_post_comments` stores top-level comments with lifecycle fields:

- `status`
- `removed_at`
- `removed_by`
- `removal_reason`

The table enables RLS and avoids direct anon/authenticated table writes. Direct
table access is reserved for service-role runtime paths. T19 has no direct
anon/authenticated comment table writes. Plain guardrail: no direct
anon/authenticated comment table writes.
Exact guardrail: no direct anon/authenticated comment table writes.
T19 preserves zero direct `board_posts` write policies.

`parent_comment_id` is retained as a reserved future schema direction, but T19
enforces top-level-only comments and live creation forces `parent_comment_id` to
`null`.

## RPCs

`public.list_open_baseboard_post_comments(...)`:

- is `SECURITY DEFINER`
- is `STABLE`
- locks `search_path=public, pg_temp`
- requires `auth.uid()`
- requires `public.current_user_can_read_open_board_posts()`
- resolves the active base by `p_base_code`
- resolves the active `open_verified` Baseboard
- verifies the target post is published and `visibility = 'board'`
- returns only published top-level comments
- clamps `p_limit` to a max of `100`
- returns safe fields only

`public.create_open_baseboard_post_comment(...)`:

- is `SECURITY DEFINER`
- locks `search_path=public, pg_temp`
- requires `auth.uid()`
- requires T13-equivalent contribution eligibility through
  `public.current_user_can_create_open_board_post()`
- validates and trims a bounded comment body
- forces `author_user_id = auth.uid()`
- forces `status = 'published'`
- forces top-level comments only
- returns only the created comment UUID

`public.moderate_open_baseboard_post_comment(...)`:

- is `SECURITY DEFINER`
- locks `search_path=public, pg_temp`
- requires `auth.uid()`
- requires `public.is_operator_with_scope('operator.community_moderation')`
- supports only `hide` and `remove`
- stores bounded moderation reason fields
- returns only the moderated comment UUID

All T19 RPCs revoke execute from `public` and `anon`, and grant execute only to
`authenticated` and `service_role`.

The server-side comment moderation action:

- wraps `public.moderate_open_baseboard_post_comment(...)`
- always uses `p_base_code = 'DFW'`
- requires `operator.community_moderation`
- validates comment UUID, `hide` or `remove`, and bounded moderation reason
- records a security event without exposing post or comment content
- revalidates only safe relevant routes
- does not add comment moderation UI, comment reporting, or a moderation queue
- does not add bans, appeals, AI moderation, public sharing, saves, reactions,
  search, Crew Picks, Layovers, lounge/restricted posting, media, or proof-upload
  scope

Safe comment read fields are limited to:

- `id`
- `post_id`
- `body`
- `created_at`
- `updated_at`
- `author_label`

Author labels use `profiles.handle` with `jmpseat member` fallback. The RPCs do
not expose author IDs, emails, claimed fields, verification/proof data, reporter
identity, signed URLs, private paths, removal fields, or moderation metadata.

## UI

The DFW Baseboard post detail route renders:

- top-level comments under the post
- a native server-action form for top-level comment creation
- safe success/invalid/failure status messages
- an empty state when no comments exist

The route preserves the private DFW Hub route gate before post/comment reads.

## Explicit Non-Goals

T19 does not add:

- nested replies
- comment reporting
- comment moderation review UI
- comment moderation queue
- saves
- reactions
- search
- Crew Picks ranking
- Layovers content
- public sharing
- lounge or restricted-board posting
- media uploads
- AI moderation
- bans
- appeals
- proof-upload scope

No posts, reports, moderation records, comments, replies, saves, reactions,
search indexes, or user/community content were created during local validation or
T19 runtime apply. Runtime verification used catalog, permission, schema, and
count checks only. Comment create/read/moderation RPCs were not called for live
row output, and no comment/post/report content was read or printed. Runtime
counts were `public.board_posts = 1`, `public.board_post_reports = 0`, and
`public.board_post_comments = 0`.

## Next Step

T20 should likely be comment reporting and moderation review integration after
T19 runtime-pass docs are reviewed and committed.
