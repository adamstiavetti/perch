# Boarding Portal Entry Review

- Lab route URL: `http://localhost:3000/lab/boarding-portal-entry`

## Files Changed

- `app/lab/boarding-portal-entry/page.tsx`
- `app/lab/boarding-portal-entry/page.module.css`
- `docs/landing/boarding-portal-entry-review.md`
- `public/cinematic/backgrounds/boarding-portal-entry-background.png`
- `public/cinematic/previews/boarding-portal-entry-mobile.png`
- `public/cinematic/previews/boarding-portal-entry-desktop.png`

## Screenshots

- `public/cinematic/previews/boarding-portal-entry-mobile.png`
- `public/cinematic/previews/boarding-portal-entry-desktop.png`

## Intentionally Included (Step 1 Only)

- Full-viewport background plate based on the target aviation environment
- Strong vignette and deep negative space
- Soft wake-up fade and restrained idle pulse above the static plate
- `prefers-reduced-motion` fallback

## Intentionally Excluded

- Globe
- Scanner/printer
- Ticket surface
- ENTER CTA
- Route arcs
- Aircraft
- Chapter cards
- Waitlist form behavior
- Production homepage content

## Reference Match Notes

- The route now uses a single image-backed environment instead of a CSS-synthesized approximation.
- Upper star field, blue mist column, and illuminated lower infrastructure come from the integrated background plate.
- Motion stays quiet and restrained to feel like a private network waking up, not a flashy intro.

## Mobile Notes (390x844)

- Upper area remains prepared for a future large globe reveal.
- Lower ambience is visible but subtle and non-distracting.
- No card frame or standard webpage layout appears.

## Desktop Notes (1440x900)

- Negative space remains dark and cinematic.
- Haze and floor texture scale independently from mobile so the scene does not look stretched.
- Lower grid remains dim and backgrounded.

## Safety / Scope

- Production homepage unchanged.
- Waitlist behavior unchanged.
- All work remains isolated to `/lab/boarding-portal-entry`.

## Next Recommended Step

- Step 2: globe reveal phase (introduce globe presence and controlled reveal timing without scanner/ticket yet).
