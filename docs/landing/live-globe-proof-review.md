# Live Globe Proof Review

Date: 2026-05-30

## Route

- Route URL: `/lab/live-globe-proof`
- Verification URL: `http://localhost:3001/lab/live-globe-proof`

## Scope Result

The live proof moved from the accepted `cityhalo` globe-only state into a broader aviation-network presentation while preserving the production homepage, waitlist behavior, scanner, ticket, ENTER CTA, and chapter cards.

Preserved intentionally:

- production homepage
- waitlist behavior
- globe rotation behavior
- scanner
- ticket
- ENTER CTA
- chapter cards
- no aircraft added

## Files Changed In This Pass

- `app/lab/live-globe-proof/page.tsx`
- `tools/cinematic/render_live_globe_routes_candidate.mjs`
- `public/cinematic/previews/live-globe-proof-routes-baseline-desktop.png`
- `public/cinematic/previews/live-globe-proof-routes-baseline-mobile.png`
- `public/cinematic/previews/live-globe-proof-routes-desktop.png`
- `public/cinematic/previews/live-globe-proof-routes-mobile.png`
- `public/cinematic/previews/live-globe-proof-routes-comparison.png`
- `docs/landing/live-globe-routes-correction.md`
- `docs/landing/live-globe-proof-review.md`

## Baseline And Candidate

- Baseline route state: `routes=off`
- Accepted route state: default route arcs enabled
- Baseline desktop: `public/cinematic/previews/live-globe-proof-routes-baseline-desktop.png`
- Baseline mobile: `public/cinematic/previews/live-globe-proof-routes-baseline-mobile.png`
- Candidate desktop: `public/cinematic/previews/live-globe-proof-routes-desktop.png`
- Candidate mobile: `public/cinematic/previews/live-globe-proof-routes-mobile.png`
- Comparison sheet: `public/cinematic/previews/live-globe-proof-routes-comparison.png`

## Visual Assessment

Accepted improvements:

- The globe now reads as a real global aviation network instead of an isolated hero planet.
- Front-facing North Atlantic routes remain the hero.
- Additional routes now cover South America, South Africa, Texas, the US west coast, Hawaii, Japan, East Asia, India, and Australia.
- The far side no longer feels empty.
- Routes remain thin, luminous, and depth-aware rather than turning into thick neon tubes or flat UI scribbles.
- Continent relief was pushed further, especially around Greenland and the northern landmass, to increase the 3D feel.

Remaining risk:

- The route network is now intentionally denser than the original 4-6-arc target because later art direction requested a broader global system.
- Future passes should preserve readability and avoid tipping into clutter as more aviation elements are added.

## Acceptance Decision

Accepted.

Reason:

- The accepted state is visibly closer to the supplied design intent than the no-routes baseline.
- The route network feels global, premium, and better integrated with the globe surface.
- The right side / Pacific / Asia regions no longer feel abandoned.
- The scene still preserves the underlying city-light, ocean, atmosphere, and no-aircraft constraints.

## Validation

- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm run build`: passed

## Single Next Best Correction

Add a selective endpoint-glint / landing-node pass so the strongest routes have intentional takeoff/arrival emphasis before any aircraft are introduced.
