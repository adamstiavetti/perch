# FBMVP-T09 Start With DFW Home Base Action

Date: 2026-06-10

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## Purpose

`FBMVP-T09` turns the no-Home-Base "Start with DFW" placeholder from the T08
Home Dashboard shell into a real authenticated server-action path.

The action is intentionally narrow:

- It is available only from the no-Home-Base state on `/app`.
- It runs the existing private app gate before mutation.
- It calls the existing T06 helper `setUserHomeBaseByCode("DFW")`.
- It relies on the T06 RPC to set Home Base and auto-follow the DFW Baseboard.
- It revalidates and redirects back to `/app`.

## Product Behavior

Users may still skip Home Base during the initial DFW-first rollout.

If a user chooses Start with DFW:

- Home Base is set to DFW.
- The DFW Baseboard is followed through the existing T06 RPC behavior.
- The user returns to `/app`.
- The app should show DFW as personalization state.

If the action fails:

- The user returns to `/app`.
- jmpseat shows generic retry copy.
- No storage, token, identifier, or internal error detail is exposed.

If the user already has a Home Base:

- The Start with DFW action is not shown.

## Safety Boundaries

`FBMVP-T09` preserves these boundaries:

- Home Base remains personalization only.
- Home Base does not verify employment, airline, role, or base assignment.
- Home Base does not grant lounge access.
- Board follows do not grant lounge access.
- Self-declared `claimed_base`, `claimed_airline`, and `claimed_role` are not
  used as authorization truth.
- Work Email verification remains the app-entry eligibility gate.
- Restricted lounge membership remains separate.
- No posting, comments, search backend, saves, reactions, lounge requests,
  Crew Lead panel, AI, seed content, proof uploads, or migrations are added.

## Implementation Notes

The server action lives in `src/lib/community/homeBaseActions.ts`.

The action records the same private-access audit event shape used by the `/app`
route before deciding whether the caller is allowed to mutate Home Base.

The visual shell remains server-rendered. The button is a form submit backed by
the server action rather than a client-only mutation assumption.

## Validation

Source/static tests cover:

- the no-Home-Base state renders a real Start with DFW form action
- the action uses the private app gate
- the action calls `setUserHomeBaseByCode("DFW")`
- the action redirects safely back to `/app`
- existing Home Base state does not show the no-Home-Base action card
- render-time code does not fake-assign DFW
- self-declared profile fields are not used
- lounge access is not granted
- no T09 migration exists
- no proof-upload scope is introduced

Runtime validation remains pending until this branch is reviewed, merged, and
tested with an authenticated app-eligible account.
