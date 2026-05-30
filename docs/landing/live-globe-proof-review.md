# Live Globe Proof Review

Date: 2026-05-30

## Route

- Local route: `/lab/live-globe-proof`
- Proof URL used during this pass: `http://localhost:3000/lab/live-globe-proof`

## Scope

This pass was app-level globe lookdev only. The existing hero placement, initial orientation, camera/framing values, and live rotation behavior were preserved. No route arcs, aircraft, scanner, ticket, ENTER CTA, chapter cards, production homepage behavior, or waitlist behavior were added or modified.

## Scope Checks

- Routes disabled: yes. The live proof route renders globe spheres/materials only; no route arcs or dashed paths are rendered.
- Aircraft disabled: yes. No aircraft models or plane markers are rendered.
- Scanner/ticket/ENTER CTA: not added.
- Production homepage: untouched.
- Waitlist behavior: untouched.
- Step 1 background: preserved as the base cinematic plate.

## Files Changed

- `app/lab/live-globe-proof/page.tsx`
- `app/lab/live-globe-proof/page.module.css`
- `public/cinematic/previews/live-globe-proof-mobile.png`
- `public/cinematic/previews/live-globe-proof-desktop.png`
- `docs/landing/live-globe-proof-review.md`

## Screenshots

- `public/cinematic/previews/live-globe-proof-mobile.png`
- `public/cinematic/previews/live-globe-proof-desktop.png`

Screenshots were captured with `prefers-reduced-motion: reduce` after waiting for the live globe textures to load. This keeps the proof frame deterministic without changing the live page rotation behavior for normal users.

## Asset Source

The runtime globe uses the existing CGTrader-derived Earth texture set:

- `public/cinematic/textures/cgtrader-earth-day-4k.jpg`
- `public/cinematic/textures/cgtrader-earth-night-4k.jpg`
- `public/cinematic/textures/cgtrader-earth-clouds-4k.jpg`
- `public/cinematic/textures/cgtrader-earth-normal-4k.jpg`
- `public/cinematic/textures/cgtrader-earth-specular-4k.jpg`

Raw CGTrader source files were not modified or newly exposed in this pass.

## Visual Controls Changed

- Lowered renderer exposure slightly to reduce raw daytime Earth brightness and make the globe feel more cinematic.
- Deepened the ocean grade in the custom shader, including a darker navy base and reduced raw satellite blue lift.
- Added more selective ocean detail so the surface does not become a flat navy disk.
- Warmed and shaped city-light treatment using softer halo and core thresholds, so lights feel more embedded in the globe surface.
- Tuned land/desert/ice suppression in shader to reduce chalky Sahara and harsh polar highlights without removing recognizable geography.
- Increased subtle cloud contribution to preserve surface richness under the darker grade.
- Tightened the atmosphere shader to keep the rim thin and edge-based, with stronger top-edge emphasis but no cyan glass coating across the face.
- Strengthened the small CSS top-edge glow layer while keeping it localized and separate from layout/framing.

## Preserved Controls

- `INITIAL_GLOBE_ROTATION` unchanged in this pass.
- Camera FOV, camera distance, globe scale, globe position, resize/framing logic, and rotation speed unchanged in this pass.
- Step 1 cinematic background preserved.
- Transparent/seamless canvas integration preserved.

## App-Level vs. Asset-Level

This was app-level lookdev. No Blender files, raw CGTrader files, model exports, or texture files were edited.

The live scene exposes enough control to make the globe visibly closer: darker navy oceans, warmer lights, stronger thin rim, subtler clouds, and reduced raw satellite brightness. It does not expose enough control to exactly reproduce the supplied design spec because the current render still depends on source Earth maps and runtime shader approximations.

## Current Score

| Criterion | Score |
| --- | ---: |
| Deep navy ocean richness | 4.1 / 5 |
| City-light warmth/integration | 4.1 / 5 |
| Atmosphere/rim quality | 3.9 / 5 |
| Surface/cloud richness | 3.8 / 5 |
| Premium cinematic reference match | 4.0 / 5 |
| Background integration | 4.3 / 5 |

Legacy full-pass framing/orientation scores from the original pasted task remain covered by the current proof screenshots:

| Criterion | Score |
| --- | ---: |
| Globe orientation match | 4.1 / 5 |
| Mobile framing match | 4.1 / 5 |
| Desktop framing match | 4.1 / 5 |
| Overall match to supplied design spec | 4.0 / 5 |

## Remaining Gaps

- The globe is darker and more cinematic, but it still reads as a shader-graded Earth texture rather than a fully authored Deadhead globe asset.
- North America and Europe are warmer and more luminous, but the city-light network is limited by the source night map. The design spec needs custom emission density, coastline glints, and art-directed metro clusters.
- The atmosphere is thin and edge-based now, but the reference top bloom feels physically integrated with the globe. CSS and a simple atmosphere shell can approximate it, not match it exactly.
- Sahara, polar ice, and land color are subdued by shader masks, but a texture-authored grade would be cleaner and less fragile.
- Clouds and surface detail are present, but the reference has more controlled depth and premium render richness.

## Blender/Export Work Required Next

To match the design spec exactly, the next pass should move into asset/lookdev work:

- Author a Deadhead-specific globe beauty/albedo map with deep navy oceans baked into the source material.
- Build a custom warm emission map emphasizing North America and Europe, with designed city networks, coastline glints, and selected high-intensity hotspots.
- Create a land/desert/ice grade mask so Sahara and polar regions stay recognizable but do not dominate the hero.
- Improve cloud treatment with a cleaner cloud-opacity/depth map or Blender-authored cloud layer.
- Author/export a controlled atmosphere/halo asset or Blender render pass that creates the thin rim and bright top-edge bloom without a thick blue shell.
- If the final live scene remains Three.js-driven, export those maps/halo elements separately so the runtime shader can consume purpose-built art assets instead of fighting raw satellite textures.

## Recommendation

Frontend controls were enough for this correction pass and the proof is visibly closer to the Deadhead design spec. The next meaningful improvement should be Blender/export texture work, not more page layout or orientation tuning.

## Proposed Next Single Correction

Create the Deadhead-specific asset lookdev set: a dark navy beauty/albedo map plus a warm city-emission map that emphasizes North America and Europe while suppressing Sahara/ice dominance. Swap those maps into the existing live globe shader before adding scanner, ticket, route arcs, aircraft, or any broader cinematic journey pieces.
