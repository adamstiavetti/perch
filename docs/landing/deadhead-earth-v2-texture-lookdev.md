# Deadhead Earth V2 Texture Lookdev

Date: 2026-05-30

## Scope

This pass is Step 2A.1 only: derive a Deadhead-specific v2 texture set for `/lab/live-globe-proof` without changing the production homepage, waitlist behavior, globe placement, globe orientation, globe camera/framing, or the disabled scanner/ticket/routes/aircraft/ENTER sequence.

## Texture Audit Results

### Current live globe route

- Route: `/lab/live-globe-proof`
- Runtime file: `app/lab/live-globe-proof/page.tsx`

### Current live globe asset path

- Runtime globe geometry: `THREE.SphereGeometry` created directly in `app/lab/live-globe-proof/page.tsx`
- Existing generated model on disk: `public/cinematic/models/cgtrader-earth-live-proof.glb`

Important audit result: the live route does **not** render the GLB at runtime. The current proof uses direct Three.js sphere geometry plus externally loaded texture files.

### Current texture map handling

- Albedo/base color/day surface: external image file
- Emission/night city lights: external image file
- Clouds: external image file
- Ocean response/specular proxy: external image file
- Normal/bump/displacement: external image file exists, but the active runtime shader was not consuming it
- Atmosphere/rim: procedural shader, not asset-backed

### Current texture maps identified

- Albedo/day surface: `public/cinematic/textures/cgtrader-earth-day-4k.jpg`
- Emission/night lights: `public/cinematic/textures/cgtrader-earth-night-4k.jpg`
- Clouds: `public/cinematic/textures/cgtrader-earth-clouds-4k.jpg`
- Normal: `public/cinematic/textures/cgtrader-earth-normal-4k.jpg`
- Specular/ocean response source: `public/cinematic/textures/cgtrader-earth-specular-4k.jpg`

### Source texture provenance

These current web-safe inputs were already derived from the local private CGTrader source package documented in:

- `docs/landing/cgtrader-live-globe-proof.md`
- `docs/landing/cgtrader-live-globe-asset-report.json`

Raw source remained private under the ignored local `Globe/` directory.

## External vs. Embedded vs. Override Findings

- External image files: yes
- Embedded inside GLB: no for the live route
- Overridden in component code: yes
- R3F material override: not applicable; the route is custom Three.js code, not React Three Fiber

## Derived V2 Outputs

### Required outputs created

- `public/cinematic/textures/deadhead-earth-albedo-v2.webp`
- `public/cinematic/textures/deadhead-earth-emission-v2.webp`
- `public/cinematic/textures/deadhead-earth-clouds-v2.webp`
- `public/cinematic/textures/deadhead-earth-lookdev-metadata.json`

### Optional supporting outputs created

- `public/cinematic/textures/deadhead-earth-ocean-mask-v2.webp`
- `public/cinematic/textures/deadhead-earth-desert-suppression-v2.webp`
- `public/cinematic/textures/deadhead-earth-ice-suppression-v2.webp`

### Flat previews created

- `public/cinematic/previews/deadhead-earth-albedo-v2-preview.png`
- `public/cinematic/previews/deadhead-earth-emission-v2-preview.png`
- `public/cinematic/previews/deadhead-earth-clouds-v2-preview.png`

## Exact Visual Changes Made

### Albedo / beauty map

- Re-derived from `cgtrader-earth-day-4k.jpg`
- Oceans pushed toward deeper navy/blue-black using a specular-informed ocean mask
- Sahara/desert response muted so Africa does not flare bright tan
- Ice and snow cooled into controlled blue-gray instead of raw white
- Land saturation reduced to avoid the daytime satellite look
- Subtle cloud lift retained in the beauty map so the globe does not collapse into a dead black ball

### Emission / city-light map

- Re-derived from `cgtrader-earth-night-4k.jpg`
- Non-city background moved to transparent black rather than keeping the source land tint
- Light color shifted toward amber/gold
- Source geography was preserved; no random synthetic dots were introduced
- North America and Europe were selectively boosted in the derivation pass

### Cloud map

- Re-derived from `cgtrader-earth-clouds-4k.jpg`
- Low-intensity haze was suppressed
- Stronger cloud bodies were preserved in alpha so the cloud layer stays restrained and does not milk over the whole sphere

## Procedural / Supporting Map Notes

No required output was invented from scratch in place of an existing source.

Supporting helper maps were generated because they improved selective grading and were defensibly derived from existing source inputs:

- `deadhead-earth-ocean-mask-v2.webp` from the specular map plus day-map blue separation
- `deadhead-earth-desert-suppression-v2.webp` from day-map hue, saturation, and luminance cues
- `deadhead-earth-ice-suppression-v2.webp` from day-map brightness/saturation plus latitude weighting

These supporting maps are explicitly procedural/derived helpers, not original CGTrader source maps.

## Runtime Wiring

The live route was rewired to use the v2 maps directly in `app/lab/live-globe-proof/page.tsx`.

Changes made there:

- swapped day/albedo input to `deadhead-earth-albedo-v2.webp`
- swapped city/emission input to `deadhead-earth-emission-v2.webp`
- swapped cloud input to `deadhead-earth-clouds-v2.webp`
- replaced raw specular-driven heuristics with dedicated ocean/desert/ice helper masks
- kept globe placement, orientation, camera/framing, and rotation logic unchanged
- kept atmosphere/rim procedural, but reduced its strength to avoid a stronger blue-glass read

No Blender relink/export step was required because the live route already used external textures rather than embedded GLB materials.

## Privacy / Asset Handling Check

- Raw CGTrader files stayed private/local: yes
- Raw `.blend`, `.fbx`, `.obj`, `.mtl`, or original full-resolution textures copied into `/public`: no
- `.gitignore` already protected `Globe/`, `private-assets/`, `assets-private/`, and `local-assets/`: yes

## Lab Status

- Lab-only derivatives: yes
- Production-ready claim: no
- Production candidate value: useful lookdev candidate textures, not launch-approved globe art

## Before / After Notes

### Before

- The live proof was structurally correct but still relied on the raw CGTrader-derived day/night/cloud/specular set.
- Shader tuning alone had improved the globe, but the base asset inputs still pulled the render toward a brighter satellite Earth with a glassier blue-rim read.

### After

- The globe now uses a dedicated Deadhead v2 albedo/emission/cloud set rather than the raw CGTrader web derivatives.
- Oceans are darker and more premium.
- City-light geography is cleaner and warmer.
- Sahara and polar whites are more controlled.
- Cloud contribution is more restrained because the new cloud map carries a cleaner alpha treatment.

## Remaining Exact-Match Gaps

- The atmosphere/rim is still procedural and still reads slightly thicker than the supplied premium design spec wants.
- The dark-side surface is improved, but it still trends slightly underexposed in the live proof compared with the target art.
- The reference has more integrated top-bloom and richer surface separation than this texture-only pass delivers.
- The route orientation is preserved as requested, so the exact most-flattering city clusters from the design spec are not always front-and-center in the same way as the supplied reference art.

## Recommendation

This v2 set is a worthwhile improvement over the raw CGTrader map inputs, but it does not yet close the final gap to the supplied Deadhead globe art. The single best next correction is a dedicated atmosphere/halo pass that decouples rim glow from surface brightness, so continent detail can be lifted without the globe falling back into a blue-glass look.
