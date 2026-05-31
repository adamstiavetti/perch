# Live Globe Routes Correction

Date: 2026-05-30

## Route

- Route URL: `/lab/live-globe-proof`
- Verification URL: `http://localhost:3001/lab/live-globe-proof`

## Goal

Add globe-attached premium route arcs to the accepted `cityhalo` live globe proof without disturbing the working hero composition.

This pass later expanded in response to art direction feedback:

- broader global route coverage
- west coast / Texas landings
- Pacific and East Asia coverage
- stronger continent terrain relief

## Preserved

- production homepage
- waitlist behavior
- scanner
- ticket
- ENTER CTA
- chapter cards
- overall globe orientation and motion behavior
- warm city-light look from the accepted `cityhalo` state
- deep navy ocean tone
- thin bright atmosphere rim

## Baseline

Captured before the route pass:

- `public/cinematic/previews/live-globe-proof-routes-baseline-desktop.png`
- `public/cinematic/previews/live-globe-proof-routes-baseline-mobile.png`

Baseline reproduction route state:

- `routes=off`

## Candidate

Accepted route candidate outputs:

- `public/cinematic/previews/live-globe-proof-routes-desktop.png`
- `public/cinematic/previews/live-globe-proof-routes-mobile.png`
- `public/cinematic/previews/live-globe-proof-routes-comparison.png`

Accepted route state:

- default live route arcs enabled
- candidate reproduction: `routes=on`

## What Changed

- Added a globe-attached 3D route network using real curved geometry instead of a flat overlay.
- Mixed blue and amber luminous routes with front-side emphasis and dimmer far-side wrap behavior.
- Expanded the network beyond the Atlantic hero area to include:
  - North America to Europe
  - North America to South America
  - South America to Europe
  - South America to South Africa
  - Texas-linked long-haul routes
  - California / west coast Pacific routes
  - Hawaii-linked Pacific routes
  - Japan, East Asia, India, and Australia side coverage
- Slightly reduced globe scale so long routes stay inside frame more reliably.
- Increased continent displacement and terrain-style relief shading, with extra emphasis on Greenland / Arctic landmass form.
- Kept aircraft out of the scene.

## Acceptance

Accepted.

Reason:

- The scene now reads much closer to the supplied aviation-network reference.
- The route system feels attached to the globe and depth-aware instead of flat or UI-like.
- The network is global without replacing the globe as the hero.
- The expanded Pacific / East Asia / Australia coverage solves the previously bare right-side and far-side areas.

## Validation

- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm run build`: passed

## Files

- `app/lab/live-globe-proof/page.tsx`
- `tools/cinematic/render_live_globe_routes_candidate.mjs`
- `public/cinematic/previews/live-globe-proof-routes-baseline-desktop.png`
- `public/cinematic/previews/live-globe-proof-routes-baseline-mobile.png`
- `public/cinematic/previews/live-globe-proof-routes-desktop.png`
- `public/cinematic/previews/live-globe-proof-routes-mobile.png`
- `public/cinematic/previews/live-globe-proof-routes-comparison.png`
- `docs/landing/live-globe-routes-correction.md`
- `docs/landing/live-globe-proof-review.md`

## Next Single Correction

Add a restrained premium endpoint / landing-node pass so select route origins and destinations feel more intentional before introducing any aircraft.
