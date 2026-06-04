# jmpseat Static Waitlist Direction

## Purpose

This note records the public waitlist direction change that replaces the older cinematic/globe concept with a simpler premium static email waitlist page for `jmpseat.`.

## Decision

- The older cinematic/globe/terrain waitlist concept is canceled.
- The public production route `/` now moves toward a simpler dark premium `jmpseat.` waitlist page.
- The new page remains a public marketing and waitlist surface only.
- The private `/app` shell remains separate and unchanged.

## What Replaced It

The new public direction uses:

- a dark aviation-native static landing page
- mobile-first layout
- premium runway/airport imagery
- repeat email waitlist CTA
- simple, high-readability copy
- hybrid typographic feature cards instead of generated image tiles
- footer links for privacy, terms, and contact
- public privacy and terms pages
- no 3D, globe, WebGL, cinematic scroll sequence, or transformation choreography

## What This Does Not Change

- Epoch 03 auth/account/beta-access work remains paused and untouched in this slice.
- `/app` private shell routes remain untouched.
- No database, verification workflow, boards, posts, moderation, AI, or payments work is added here.
- The public waitlist still hands off to the existing external waitlist flow instead of inventing a backend capture system in this repo.
- Footer links now include Privacy, Terms, and Contact.
- Public `/privacy` and `/terms` pages now support the waitlist launch with simple plain-language legal and consent copy.
- `contact@jmpseat.com`, `privacy@jmpseat.com`, and `support@jmpseat.com` are the intended business contact addresses for now.
- Custom-domain email should be confirmed and fully configured before public launch.

## Docs Impact

- The older 3JS/cinematic waitlist direction should now be treated as historical exploration, not the current public product direction.
- Future public waitlist work should extend the simpler `jmpseat.` static page unless product direction changes again explicitly.
- The moody runway hero remains the primary atmospheric visual on the public page.
- Feature cards should stay typographic and utility-led rather than reverting to AI-looking generated card imagery.
