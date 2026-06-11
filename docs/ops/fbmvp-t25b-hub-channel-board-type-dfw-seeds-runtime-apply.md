# FBMVP-T25B Hub Channel Board Type + DFW Seeds Runtime Apply

Date: 2026-06-11

## Purpose

This note records the targeted Supabase runtime apply for `FBMVP-T25B`.

Runtime project:

- project name: `jmpseat`
- project ref/id: `qcdfjrcnwuioqprmqqzx`

Applied migration:

- file:
  `supabase/migrations/20260611183000_create_hub_channel_board_type_dfw_seeds.sql`
- ledger version: `20260611183000`
- ledger name: `create_hub_channel_board_type_dfw_seeds`

Apply method:

- targeted SQL execution only
- migration SQL and exact ledger row were applied in one explicit transaction
- no broad `supabase db push`
- no migration repair
- no deploy
- no app code changes

## Ledger Preflight

Runtime ledger table shape:

- `version text not null`
- `statements array nullable`
- `name text nullable`
- `created_by text nullable`
- `idempotency_key text nullable`
- `rollback array nullable`

Pre-apply ledger check confirmed `20260611183000` was not already recorded.

## Pre-Apply Runtime Readiness

Pre-apply runtime checks found:

- active DFW base: `1`
- active `base_board` board type: `1`
- active DFW parent board with `slug = 'dfw'`: `1`
- existing `hub_channel` type: `0`
- existing target child slugs: `0`
- rejected slugs: `0`
- standalone channel table exists: `false`

## Runtime Objects Applied

The targeted apply added:

- `public.board_types.key = 'hub_channel'`
- six DFW child channel boards under the active DFW parent `base_board`
- one migration ledger row:
  `20260611183000 create_hub_channel_board_type_dfw_seeds`

The `hub_channel` board type was verified with:

- `default_visibility = 'open_verified'`
- `default_posting_mode = 'members_can_post'`
- `is_active = true`

## Seeded DFW Child Channels

The six runtime child boards are:

- `dfw-q-and-a` - DFW Q&A
- `commuting-parking` - Commuting & Parking
- `terminal-ground-logistics` - Terminal & Ground Logistics
- `food-coffee-breaks` - Food, Coffee & Breaks
- `new-to-dfw` - New to DFW
- `dfw-layover-local` - DFW Layover & Local

Post-apply verification confirmed each child board has:

- correct DFW `base_id`
- correct active DFW parent board id
- correct `hub_channel` board type id
- `visibility = 'open_verified'`
- `posting_mode = 'members_can_post'`
- `discoverability = 'visible'`
- `status = 'active'`
- deterministic sort order from `10` through `60`

Seeded channel count verified: `6`.

## Negative Verification

Rejected old slugs returned zero rows:

- `base-life`
- `crew-tips`
- `app-feedback`

Standalone channel table check returned zero rows:

- `channels`
- `hub_channels`
- `board_channels`

## Scope Boundary

T25B is now runtime-applied, but it is still only the board metadata foundation.

T25B does not add:

- DB/RPC-backed Channels behavior
- UI routes
- channel post list RPCs
- channel create-post RPCs
- channel detail RPCs
- composer changes
- comments
- reports
- moderation review changes
- request/create channel workflow
- search, saves, reactions, media, live weather, or live traffic

The child channel boards now exist in runtime, but they are not yet surfaced by
real channel routes or channel-aware RPCs.

## Safety

The targeted apply did not expose author IDs, reporter identity, verification
evidence, proof-upload data, private storage paths, signed URLs, passenger
private information, exact crew hotel exposure, security-sensitive procedures,
company-confidential content, or live crew movement/location.

Known Supabase migration-history drift remains preserved. Broad
`supabase db push` remains unsafe.

## Next Step

The recommended next implementation ticket is a separate scoped channel-list
read foundation:

- add a safe `list_open_hub_channels(p_base_code)` RPC, or equivalent scoped
  read helper
- add the real Channels overview route/surface that reads only active DFW child
  channel metadata
- keep channel post list/create/detail behavior out of that ticket unless
  separately scoped

