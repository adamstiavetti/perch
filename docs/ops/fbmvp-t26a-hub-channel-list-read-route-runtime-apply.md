# FBMVP-T26A Hub Channel List Read Runtime Apply

Date: 2026-06-11

## Purpose

This record closes the targeted runtime migration apply for `FBMVP-T26A`.

The apply targeted Supabase project:

- project name: `jmpseat`
- project ref: `qcdfjrcnwuioqprmqqzx`

Target migration:

- `supabase/migrations/20260611203000_create_hub_channel_list_read_rpc.sql`

## Runtime Apply Summary

The targeted runtime apply completed successfully.

Applied only:

- `supabase/migrations/20260611203000_create_hub_channel_list_read_rpc.sql`
- one migration ledger row:
  - version: `20260611203000`
  - name: `create_hub_channel_list_read_rpc`

Apply method:

- targeted SQL execution only
- no broad `supabase db push`
- no migration repair
- no `apply_migration`
- no deploy
- no file edits during runtime apply
- no staging
- no commit

## Pre-Apply State

Pre-apply checks confirmed:

- repo was clean
- `HEAD = origin/main = 1cb7966`
- T25B ledger row existed:
  - `20260611183000 create_hub_channel_board_type_dfw_seeds`
- T26A ledger row did not exist
- T25B channel seed foundation existed in runtime
- `public.list_open_hub_channels` did not exist before apply

## Post-Apply Verification

Post-apply checks confirmed:

- `public.list_open_hub_channels(p_base_code text)` now exists
- ledger row exists exactly once:
  - `20260611203000 create_hub_channel_list_read_rpc`
- no standalone channel tables were created:
  - `channels`
  - `hub_channels`
  - `board_channels`

Function definition safety scan verified:

- `auth.uid()` authentication check
- `public.current_user_can_read_open_board_posts()` eligibility check
- active base resolution
- active parent `base_board` resolution
- `hub_channel` child-board filter
- `status = 'active'`
- `visibility = 'open_verified'`
- `discoverability = 'visible'`
- safe return columns only:
  - `slug`
  - `name`
  - `short_name`
  - `description`
  - `sort_order`

## Safety Confirmation

The runtime function returns no:

- IDs
- user IDs
- author IDs
- reporter identity
- moderation internals
- verification fields
- storage paths
- signed URLs
- posts
- comments
- reports

Policy review returned only existing `board_posts` `SELECT` policies. T26A
added no direct table read/write policies and no direct user insert, update, or
delete policies.

## Authenticated RPC Call Boundary

An authenticated functional RPC call was not run during this apply. The
available tooling did not provide a safe real authenticated user context, so no
authenticated RPC result was claimed.

Authenticated browser and route smoke remains pending unless separately
verified.

## Product Scope Boundary

T26A is now runtime-applied for the channel metadata read RPC only. The DFW
Channels route can call the runtime RPC after deployment of the T26A app code.

T26A still does not add:

- channel post list/read/create behavior
- channel post detail
- composer behavior
- comments
- reports
- moderation review changes
- request/create channel workflow
- search
- saves
- reactions
- media
- live weather or traffic
- standalone `channels` table

DB/RPC-backed Channels remain incomplete until later scoped tickets add channel
post list/detail/create behavior and any related comment/report/moderation
integration.

## Unexpected Findings

None.

## Next Step

Run authenticated browser/route smoke for `/app/hubs/dfw/channels` after the
T26A app code is available on the reviewed beta deployment. Do not proceed to
channel posting or comment/report integration without a separate scoped ticket.
