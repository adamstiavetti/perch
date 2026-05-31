# Skybyrd Orb Transition

Date: 2026-05-31

## Route

- Lab URL: `/lab/live-globe-proof`
- Local verification URL: `http://localhost:3001/lab/live-globe-proof`

## Final Unified State

The lab hero now uses one canonical version: the accepted cityhalo globe, global route network, aircraft traffic, Skybyrd branding, scroll cue, and scroll-driven compact orb transition are all active on the default route. No `aircraft=on` query string is required.

## Transition Behavior

- The page keeps the cinematic background fixed while scroll acts as a transition driver.
- A single scroll progress value is derived from `window.scrollY / (viewportHeight * 0.14)`.
- The live globe rig shrinks and moves to the top-center compact orb position.
- Routes and aircraft remain parented to the globe/route rig, so they move, scale, rotate, and stay attached as one system.
- The Skybyrd wordmark moves upward faster than the globe, collapses width-wise, and fades into the orb with a particle/cone absorption layer.
- The scroll cue remains visible while scrolling.
- Reduced motion keeps the initial hero state and disables the absorption layer.

## Compact Orb Look

- The compact orb increases globe spin substantially so it reads as alive.
- The initial hero globe spin was also increased so the globe feels alive before scrolling begins.
- City lights, route shimmer, atmosphere, and a shader-based aura intensify as orb progress increases.
- The compact aura was tuned away from a white ring and back toward a sharper electric blue pulse.
- Energy wisps were removed because they looked too decorative and cheap.

## Aircraft State

- Default aircraft mode is now `on`.
- The current default deploys 18 aircraft across the route network.
- Aircraft continue using route curve points and tangents, not manual screen placement.
- Aircraft route-following speed was increased so their motion is visibly readable in the hero.

## Proofs

- Initial: `public/cinematic/previews/skybyrd-orb-transition-initial.png`
- Mid-transition: `public/cinematic/previews/skybyrd-orb-transition-mid.png`
- Final compact orb: `public/cinematic/previews/skybyrd-orb-transition-final.png`

## Acceptance

Accepted for this pass.

Reason:

- The route now has one unified final lab version instead of separate aircraft and alive-globe variants.
- The compact orb keeps aircraft/routes attached while adding the intended alive/electrified feel.
- The scroll cue remains present, and the background no longer visibly scrolls away.
