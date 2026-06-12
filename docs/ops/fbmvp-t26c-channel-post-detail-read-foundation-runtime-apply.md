# FBMVP-T26C Channel Post Detail Read Runtime Apply

Date: 2026-06-12

## Purpose

This record closes the targeted runtime migration apply for `FBMVP-T26C`.

The apply targeted Supabase project:

- project name: `jmpseat`
- project ref: `qcdfjrcnwuioqprmqqzx`

Target migration:

- `supabase/migrations/20260612024544_create_hub_channel_post_detail_rpc.sql`

## Runtime Apply Summary

The targeted runtime apply completed successfully.

Applied only:

- `supabase/migrations/20260612024544_create_hub_channel_post_detail_rpc.sql`
- one migration ledger row:
  - version: `20260612024544`
  - name: `create_hub_channel_post_detail_rpc`

Apply method:

- targeted SQL transaction only
- no broad `supabase db push`
- no migration repair
- no `apply_migration`
- no deploy tooling
- no Vercel changes
- no file edits during runtime apply
- no staging
- no commit

## Pre-Apply State

Pre-apply checks confirmed:

- repo was clean
- `HEAD = origin/main = 8b03517`
- prior channel ledger rows existed:
  - `20260611183000 create_hub_channel_board_type_dfw_seeds`
  - `20260611203000 create_hub_channel_list_read_rpc`
  - `20260611214500 create_hub_channel_post_list_rpc`
- T26C ledger row did not exist
- T25B/T26A/T26B runtime foundation existed
- `public.get_open_hub_channel_post(...)` did not exist before apply

## Post-Apply Verification

Post-apply checks confirmed:

- runtime now has:
  - `public.get_open_hub_channel_post(p_base_code text, p_channel_slug text, p_post_id uuid)`
- ledger row exists:
  - `20260612024544 create_hub_channel_post_detail_rpc`
- no standalone channel tables were created:
  - `channels`
  - `hub_channels`
  - `board_channels`

Function definition safety scan verified:

- `auth.uid()` authentication check
- `public.current_user_can_read_open_board_posts()` eligibility check
- active base resolution
- active parent `base_board` resolution
- active visible `hub_channel` resolution
- `board_posts.id = p_post_id` filter
- `board_posts.board_id = v_channel_board_id` membership check
- `board_posts.category` is not used for channel membership
- `board_posts.status = 'published'`
- `board_posts.visibility = 'board'`
- comments and reports are not returned

Safety confirmation:

- no board IDs returned
- no base IDs returned
- no parent board IDs returned
- no author user IDs returned
- no reporter identity returned
- no moderation internals returned
- no verification fields returned
- no storage paths returned
- no signed URLs returned
- no emails returned
- no proof data returned
- no comments or reports returned

## Policy And Table Review

Runtime policy review returned only existing `board_posts` `SELECT` policies.
T26C added no broad direct table policies and no direct user
insert/update/delete policies.

The standalone channel table check returned zero rows for:

- `channels`
- `hub_channels`
- `board_channels`

## Authenticated RPC Call Boundary

An authenticated functional RPC call was not run. The available tooling did not
provide a safe real authenticated user context, so no authenticated RPC result is
claimed here.

Authenticated browser/route smoke for
`/app/hubs/dfw/channels/[channelSlug]/[postId]` is partially recorded in
`docs/ops/fbmvp-t26c-channel-post-detail-browser-smoke.md`. That smoke covered
route/access/unavailable-state behavior only. Happy-path browser smoke still
requires a safe post existing on a child `hub_channel` board.

## Explicitly Still Not Implemented

T26C still does not add:

- composer
- channel post creation
- comments
- reports
- moderation review changes
- `Request a Channel` workflow
- DFW Today MVP baseline
- Base MVP baseline
- Layover MVP baseline
- search
- saves
- reactions
- media
- live weather or traffic integrations

## Next Step

Record happy-path authenticated browser/route smoke for selected-channel post
detail after a safe child-channel post detail can be verified.

Runtime apply docs are satisfied by this record. Browser smoke docs are
partially satisfied by
`docs/ops/fbmvp-t26c-channel-post-detail-browser-smoke.md`; happy-path smoke
docs remain needed later.

## Documentation Governance Status

Docs updated:

- `docs/ops/fbmvp-t26c-channel-post-detail-read-foundation-runtime-apply.md`
- `docs/BUILD_TICKETS.md`
- `docs/DATA_MODEL.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/hub-pivot-plan.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/fbmvp-t26c-channel-post-detail-read-foundation.md`

Docs not updated / why:

- App, migration, and test files were not updated because this task only records
  the already-completed targeted runtime apply.
- Happy-path browser smoke docs were not created because no safe published
  child-channel post existed during smoke.

Scope impact:

- Runtime-apply documentation only.
- No app behavior, local migration files, tests, routes, helpers, or runtime
  settings changed in this docs task.

Runtime apply docs needed?

- Satisfied by this record.

Browser smoke docs needed?

- Partially satisfied for route/access/unavailable-state behavior.
- Happy-path smoke docs are still needed after a safe child-channel post detail
  can be verified.
