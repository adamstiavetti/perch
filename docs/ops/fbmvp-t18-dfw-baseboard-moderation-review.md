# FBMVP-T18 DFW Baseboard Moderation Review

Status: implemented, runtime-applied.

`FBMVP-T18` adds the first app-level operator moderation review surface for
reported DFW Baseboard posts. It uses the existing T16 report and hide/remove
foundation, adds the app-side `operator.community_moderation` scope, and keeps
the review workflow private to explicitly scoped operators.

## Scope

T18 adds:

- `public.list_open_baseboard_post_reports(p_base_code text, p_limit integer default 50)`
- a server-only DFW Baseboard report read helper
- a server action that calls existing `public.moderate_open_baseboard_post(...)`
- `/app/admin/community-moderation`
- admin navigation for operators with `operator.community_moderation`

The route is private-app gated, then operator-scope gated, before any report
data is read. The report list is DFW Baseboard only.

## Migration

Local migration:

- `supabase/migrations/20260610235111_create_board_post_report_review_rpc.sql`

Runtime ledger row:

- version: `20260610235111`
- name: `create_board_post_report_review_rpc`

The migration creates only the report-review RPC. It does not add tables,
direct `board_posts` write policies, broad report policies, or RLS weakening.

Known Supabase migration-history drift remains preserved.
Broad Supabase `db push` remains unsafe.
The targeted T18 runtime pass is recorded in
`docs/ops/fbmvp-t18-dfw-baseboard-moderation-review-runtime-pass.md`.

## Report Review RPC

`public.list_open_baseboard_post_reports(...)`:

- is `SECURITY DEFINER`
- is `STABLE`
- locks `search_path=public, pg_temp`
- requires `auth.uid()`
- requires `public.is_operator_with_scope('operator.community_moderation')`
- resolves the active base by `p_base_code`
- resolves the active `open_verified` Baseboard
- returns only open/reviewing reports for posts on that Baseboard
- clamps `p_limit` server-side to a max of `100`
- grants execute only to `authenticated` and `service_role`
- revokes execute from `public` and `anon`

Returned fields are limited to operator-review fields:

- `report_id`
- `post_id`
- `post_title`
- `post_body_preview`
- `post_category`
- `post_content_type`
- `post_created_at`
- `post_author_label`
- `reason`
- `details`
- `report_status`
- `reported_at`

Author labels use `profiles.handle` with `jmpseat member` fallback.

The RPC does not return reporter identity, author IDs, emails, claimed fields,
verification status/evidence, proof/storage data, signed URLs, private paths, or
sensitive evidence.

## Server Action

`moderateDfwBaseboardPostAction(...)`:

- is server-only
- requires `operator.community_moderation`
- validates post UUID, action, and reason before the RPC call
- supports only `hide` and `remove`
- uses `p_base_code = "DFW"`
- calls existing `public.moderate_open_baseboard_post(...)`
- redirects with safe status values
- revalidates the moderation page and DFW Baseboard list on success

T18 does not auto-resolve report rows. Report status transitions remain future
moderation workflow work.

## UI

`/app/admin/community-moderation` lists open DFW Baseboard reports for scoped
operators. It shows safe post review fields and compact hide/remove forms with a
required moderation reason.

The route does not show reporter identity. It does not show author IDs, emails,
claimed fields, verification/proof data, storage paths, signed URLs, or private
paths.

## Explicit Non-Goals

T18 does not add:

- comments
- replies
- comment moderation
- saves
- reactions
- search
- Crew Picks
- Layovers
- public sharing
- appeal workflow
- bans
- AI moderation
- proof-upload scope
- broad admin overbuild
- direct `board_posts` write policies

T18 preserves zero direct `board_posts` write policies.

## Runtime Status

T18 is runtime-applied as
`20260610235111 create_board_post_report_review_rpc`. The runtime pass is
recorded in
`docs/ops/fbmvp-t18-dfw-baseboard-moderation-review-runtime-pass.md`.

Runtime verification used only catalog/permission/count checks. The review RPC
was not called for a content smoke test. No report details, post title, post
body, author labels, reporter information, or runtime content was read or
printed during runtime verification.

Runtime count checks found `public.board_posts` count `1` and
`public.board_post_reports` count `0`.

No posts, reports, moderation records, comments, replies, saves, reactions,
search indexes, or user/community content were created by the T18
migration/apply.

Next comments/replies milestone should wait until this T18 runtime-pass
documentation is reviewed and committed.
