# FBMVP-T21 DFW Hub Product Framing Runtime Smoke

Status: runtime-smoke passed with expected UX debt.

Commit under test: `8abf799 feat: reframe dfw surface as hub`

## Scope

T21 is a product-framing and UI shell implementation only. It reframes the
existing DFW Baseboard surface as the DFW Hub model without database, migration,
RLS, RPC, runtime-data, or table-name changes.

T21 does not add live weather or traffic integrations, free user-created
channels, photo uploads, migrations, runtime mutation, database table renames,
or new moderation/RLS behavior.

## Manual Beta UI Smoke

Manual beta UI review observed the expected Hub framing:

- `DFW Hub` renders.
- `DFW Today` renders.
- `Base` renders.
- `Layover` renders.
- `Channels` renders.
- `Recent Useful Threads` renders.
- `Request a Channel` appears inside the Channels area.

The smoke result is a pass for the intended T21 shell/framing scope. It should
not be read as final Hub UX completion.

## Request A Channel

`Request a Channel` is correctly placed inside Channels rather than as a
top-level Hub section.

Known UX debt: the current callout is too visually prominent for a secondary
reviewed action. A later UX polish pass should make it lower-priority inside
Channels so it does not compete with common thread reading, creation, and reply
actions.

No channel request workflow or free user-created channel creation is live.

## Known UX Debt

- The Hub surface is placeholder-heavy.
- Card stacking needs visual polish.
- Channels needs restructuring around common thread creation, reading, replies,
  and eventual reaction/signal patterns.
- `Request a Channel` should become a secondary action inside Channels.

These are expected follow-up items, not T21 blockers.

## Non-Blockers

- There is no real user-generated community content yet.
- Existing test/seed post content is not production community UGC.
- There is no UGC data-migration concern for this framing ticket.
- The internal `/app/hubs/dfw/baseboard` route name remains acceptable for now.
- Internal Baseboard/board route, helper, RPC, and table names remain in place
  intentionally to avoid churn and preserve safety.

## Safety Preservation

T21 preserves:

- private app gates.
- public-domain host gate behavior.
- admin shell authorization.
- existing posts, comments, reporting, and moderation primitives.
- existing migration/RLS/RPC posture.

No access, moderation, RLS, admin, reporting, proof-upload, deployment, or
runtime settings were changed by T21.

## Recommended Next Ticket

The next ticket should be a narrow DFW Hub UX polish pass, likely focused on
Channels and thread interaction, or a similarly scoped DFW Hub section polish
pass.

Do not start free channel creation, media/photo uploads, or live weather/traffic
integrations unless those are separately scoped and reviewed.
