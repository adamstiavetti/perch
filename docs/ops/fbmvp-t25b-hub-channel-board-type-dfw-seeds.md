# FBMVP-T25B Hub Channel Board Type + DFW Seeds

Date: 2026-06-11

## Purpose

`FBMVP-T25B` creates the database metadata foundation for DFW Hub Channels.
It adds the `hub_channel` board type and seeds six DFW child board rows under
the existing active DFW parent `base_board`.

This is not a runtime smoke report. The later targeted runtime apply is recorded
separately in
`docs/ops/fbmvp-t25b-hub-channel-board-type-dfw-seeds-runtime-apply.md`.

## Scope

Implemented schema/seed foundation:

- one migration:
  `supabase/migrations/20260611183000_create_hub_channel_board_type_dfw_seeds.sql`
- source tests:
  `test/community/hubChannelSeeds.test.mts`
- documentation updates for the current Channels foundation state

T25B adds only board metadata. It adds no post reads, no comments, no reports,
and no moderation review changes. DB/RPC-backed Channels remain incomplete
until later tickets add channel-aware reads, posting, routes, and detail
behavior.

## Board Type

The migration inserts `public.board_types.key = 'hub_channel'` idempotently.

Default behavior aligns with open verified member-postable boards:

- default visibility: `open_verified`
- default posting mode: `members_can_post`
- active board type: `true`

No direct table read/write policies are added.

## DFW Child Channel Seeds

The six private-beta seed defaults are:

- `dfw-q-and-a` - DFW Q&A
- `commuting-parking` - Commuting & Parking
- `terminal-ground-logistics` - Terminal & Ground Logistics
- `food-coffee-breaks` - Food, Coffee & Breaks
- `new-to-dfw` - New to DFW
- `dfw-layover-local` - DFW Layover & Local

The migration resolves the parent board through:

- active base code `DFW`
- active parent board slug `dfw`
- parent board type `base_board`

Each seeded child board uses the resolved DFW `base_id`, resolved DFW parent
`parent_board_id`, `hub_channel` board type, `open_verified` visibility,
`members_can_post` posting mode, `visible` discoverability, `active` status,
and deterministic sort order.

If the active DFW base, active DFW parent `base_board`, or active
`hub_channel` board type cannot be resolved, the migration raises a clear
exception rather than creating orphan channel boards.

## Private-Beta Taxonomy Note

These six channels are private-beta seed defaults, not final public-release
taxonomy. Names, descriptions, slugs, sort order, active/hidden status, and the
number of channels may change before release and before meaningful production
UGC exists.

Do not build irreversible assumptions around this exact list. Existing
parent-board posts are not migrated into these channels. Downstream RPC and UI
work should resolve channels from database state rather than assuming this seed
list is final.

Once meaningful real user content exists in channel boards, slugs should be
treated as stable unless redirects or aliases are explicitly planned.

## Explicitly Not Implemented

T25B does not add:

- UI routes
- post reads
- composer behavior
- comments
- reports
- moderation review changes
- channel list RPCs
- channel post list RPCs
- channel create-post RPCs
- channel detail routes
- request/create channel workflow
- search, saves, reactions, media, live weather, or live traffic
- standalone `channels` table
- existing parent/baseboard post migration
- broad `supabase db push`
- deploy

## Safety

T25B preserves the existing server/RPC controlled contribution model. It does
not weaken private-app, public-domain, admin, verification, proof-upload,
reporting, moderation, RLS, or operator-scope behavior.

The migration does not expose author IDs, reporter identity, verification
evidence, proof-upload data, private storage paths, signed URLs, passenger
private information, exact crew hotel exposure, security-sensitive procedures,
company-confidential content, or live crew movement/location.

## Validation

Planned local validation:

```bash
git diff --check
node --test test/community/hubChannelSeeds.test.mts
npm run typecheck
npm run lint
npm run build
```

The targeted runtime apply is recorded separately in
`docs/ops/fbmvp-t25b-hub-channel-board-type-dfw-seeds-runtime-apply.md`.
