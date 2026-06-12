# FBMVP-T26B Selected Channel Authenticated Browser Smoke

Date: 2026-06-11

## Purpose

This record captures functional authenticated browser smoke for the
`FBMVP-T26B` selected-channel thread-list route.

This is not visual approval and does not mean the selected-channel experience is
MVP-polished. UI/UX polish remains deferred and should not block the next
functional ticket.

## Deployment Tested

- host: `https://beta.jmpseat.com`
- route pattern: `/app/hubs/dfw/channels/[channelSlug]`

Routes tested:

- `https://beta.jmpseat.com/app/hubs/dfw/channels/dfw-q-and-a`
- `https://beta.jmpseat.com/app/hubs/dfw/channels/commuting-parking`

## Smoke Result

T26B selected-channel authenticated browser smoke passed functionally.

The beta deployment contained the T26B route/helper code, and the selected
channel pages rendered against the runtime-applied T25B/T26A/T26B database
foundation.

## Access Results

Verified:

- authenticated eligible beta/private-app session reached both selected-channel
  routes
- authenticated session did not redirect to login or access-restricted
- no-cookie beta request redirected to login:
  - `307` to
    `https://beta.jmpseat.com/login?next=%2Fapp%2Fhubs%2Fdfw%2Fchannels%2Fdfw-q-and-a`
- public apex did not expose the private app route:
  - `https://jmpseat.com/app/hubs/dfw/channels/dfw-q-and-a` ultimately resolved
    to `https://www.jmpseat.com/`

## Selected Channel Rendering

`dfw-q-and-a` rendered:

- `DFW Q&A`
- channel description
- back navigation to `DFW Channels`

`commuting-parking` rendered:

- `Commuting & Parking`
- channel metadata/description
- back navigation

## Thread List And Empty State

The selected-channel pages rendered the safe empty state:

- `No threads in this Channel yet.`

No unavailable/error state appeared.

Real threads were not required or expected for this smoke because T26B does not
create posts and existing parent/baseboard posts were not migrated into child
channel boards.

## Overview Navigation

Verified:

- `/app/hubs/dfw/channels` rendered channel row links
- clicking the `DFW Q&A` row navigated to
  `https://beta.jmpseat.com/app/hubs/dfw/channels/dfw-q-and-a`
- selected-channel shell rendered after navigation

## Product Boundary Checks

Verified absent:

- composer
- `Start a Thread`
- comments/replies
- report/moderation controls
- `Request a Channel` workflow
- fake activity counts
- fake thread counts
- DFW Today/Base/Layover functionality introduced by T26B

## Security And Privacy Checks

No visible exposure found for:

- board IDs
- base IDs
- parent board IDs
- author user IDs
- reporter identity
- verification/proof data
- storage paths
- signed URLs
- runtime comments/reports
- passenger private information
- exact crew hotel exposure
- airport/security-sensitive procedures
- company-confidential content
- live crew movement/location

## Optional Runtime Checks

Read-only runtime checks confirmed ledger rows:

- `20260611183000 create_hub_channel_board_type_dfw_seeds`
- `20260611203000 create_hub_channel_list_read_rpc`
- `20260611214500 create_hub_channel_post_list_rpc`

Read-only runtime checks confirmed functions:

- `public.list_open_hub_channels(p_base_code text)`
- `public.list_open_hub_channel_posts(p_base_code text, p_channel_slug text, p_limit integer)`

## UI/UX Boundary

The route still needs UI/UX polish. This smoke is not visual approval and does
not mean the route is MVP-polished. Visual polish remains deferred while the
functional route baselines are completed.

## Still Not Implemented

T26B still does not add:

- composer
- channel post creation
- channel post detail
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

`T26C` channel post detail remains future work unless explicitly rescoped.
