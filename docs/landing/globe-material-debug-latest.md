# Globe Lighting Lookdev Latest

Generated: 2026-05-30T15:41:21.824150+00:00

Status: **FAILED LIGHTING LOOKDEV PROOF - NOT READY FOR HERO REINSERTION**

## Outputs

- Sheet: `public/cinematic/previews/globe-lighting-lookdev-sheet.png`
- Best day surface: `public/cinematic/previews/globe-lookdev-best-day-surface.png`
- Best city emission: `public/cinematic/previews/globe-lookdev-best-city-emission.png`
- Best no atmosphere: `public/cinematic/previews/globe-lookdev-best-no-atmosphere.png`
- Best with atmosphere: `public/cinematic/previews/globe-lookdev-best-with-atmosphere.png`

## Variant Scores

| Variant | Score | Notes |
| --- | ---: | --- |
| A. Low Fill Cinematic | 16/30 | Darkest and least overfilled, but still reads as a smooth blue sphere with weak surface detail. |
| B. Reference Balanced | 16/30 | More fill, but surface detail remains too weak and a visible band/seam breaks the render. |
| C. Rich Surface Fill | 15/30 | Too smooth and map-like; not enough embedded terrain/cloud richness. |
| D. Rim/Atmosphere Match | 15/30 | Rim direction is useful, but the globe still reads synthetic and under-detailed. |

Best variant: **A. Low Fill Cinematic**, narrowly.

## Gate

- Ready for full hero reinsertion: no.
- Best score: 16/30.
- Pass requires at least 25/30 with no category below 4/5.
- Remaining issue: lighting-only fill exposed a material/UV/detail problem. The globe reads as a smooth blue sphere with weak embedded Earth detail and a visible horizontal band/seam.

## Recommendation

Do not continue lighting-only tuning. Pivot to an R3F shader/static-render hybrid or source/create a high-quality art-directed globe plate that already contains the reference-level surface/cloud/ocean richness.
