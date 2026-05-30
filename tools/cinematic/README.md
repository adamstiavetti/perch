# Deadhead Cinematic Blender Pipeline

This folder contains the local Blender-first asset/previs pipeline for the Deadhead cinematic waitlist hero.

The scripts create first-pass physical assets and camera validation previews:

- Scanner/printer GLB
- Ticket plane GLB
- Small passenger aircraft GLB
- Optional globe helper GLB
- Thin route guide GLB
- Mobile and desktop preview renders
- `public/cinematic/manifest.json`

## Run

From the repo root:

```bash
blender --background --python tools/cinematic/build_deadhead_hero_scene.py
```

To export GLBs and refresh the manifest without rendering previews:

```bash
blender --background --python tools/cinematic/export_deadhead_assets.py
```

Or:

```bash
blender --background --python tools/cinematic/build_deadhead_hero_scene.py -- --skip-renders
```

## Outputs

- `public/cinematic/models/deadhead-scanner-printer.glb`
- `public/cinematic/models/deadhead-ticket-plane.glb`
- `public/cinematic/models/deadhead-aircraft.glb`
- `public/cinematic/models/deadhead-globe-helpers.glb`
- `public/cinematic/models/deadhead-route-guides.glb`
- `public/cinematic/previews/deadhead-hero-mobile-preview.png`
- `public/cinematic/previews/deadhead-hero-desktop-preview.png`
- `public/cinematic/manifest.json`

These assets are blockout/previs quality. They exist to establish physical scale, camera framing, and R3F loader contracts before final art direction.
