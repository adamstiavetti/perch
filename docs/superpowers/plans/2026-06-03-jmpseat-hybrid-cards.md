# jmpseat Hybrid Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the AI-looking public feature-card imagery with a premium hybrid card system while tightening public marketing copy toward `airline life`.

**Architecture:** Keep the existing moody runway hero as the page's single dominant image. Convert the four public feature cards into typographic glass cards with restrained accent treatments, no full-bleed generated imagery, and slightly sharper copy. Keep legal/trust language precise where needed, but use `airline life` in public marketing copy where it reads more naturally.

**Tech Stack:** Next.js App Router, React, CSS Modules, TypeScript

---

### Task 1: Replace card data and page markup

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update feature-card data and public marketing copy**

Replace the current card data object so cards no longer depend on image assets and use restrained accent metadata instead:

```ts
const FEATURE_CARDS = [
  {
    label: "base",
    title: "Base Boards",
    copy: "Trusted base intel for reserve life, new hires, parking, transit, food, errands, and how your base actually works.",
    accent: "base",
  },
  {
    label: "layover",
    title: "Layover Boards",
    copy: "Trusted layover intel for food, transportation, downtime, and airport-area know-how.",
    accent: "layover",
  },
  {
    label: "rooms",
    title: "Verified Rooms",
    copy: "Verified discussion spaces for airline life, organized by base and topic.",
    accent: "rooms",
  },
  {
    label: "verified",
    title: "Verified Entry",
    copy: "Invite-only beta access for verified airline workers.",
    accent: "verified",
  },
] as const;
```

Also update marketing-facing page copy where it reads naturally:

```ts
const TRUST_ITEMS = [
  "verified workers",
  "private by design",
  "built for airline life",
] as const;
```

```tsx
<p>Trusted base intel and layover knowledge for airline life.</p>
```

```tsx
<p>
  Get early access to trusted base intel, layover knowledge, and
  verified discussion for airline life.
</p>
```

- [ ] **Step 2: Replace feature-card media markup with hybrid accent markup**

In the feature-card render loop, replace the image block with a small accent panel and keep the label/title/copy hierarchy:

```tsx
<article key={card.title} className={styles.featureCard}>
  <div
    className={`${styles.featureAccent} ${styles[`featureAccent${card.accent[0].toUpperCase()}${card.accent.slice(1)}`]}`}
    aria-hidden="true"
  >
    <span className={styles.featureAccentLine} />
    <span className={styles.featureAccentGlow} />
  </div>
  <div className={styles.featureBody}>
    <span className={styles.featureLabel}>{card.label}</span>
    <h2>{card.title}</h2>
    <p>{card.copy}</p>
  </div>
</article>
```

- [ ] **Step 3: Run type-aware page check**

Run: `npm run typecheck`
Expected: PASS

### Task 2: Replace image-led card styling with hybrid glass-card styling

**Files:**
- Modify: `app/page.module.css`

- [ ] **Step 1: Remove image-led feature-card styling and add hybrid accent styles**

Delete the unused image-driven card selectors:

```css
.featureMedia { ... }
.featureImage { ... }
.featureMediaOverlay { ... }
```

Replace them with hybrid accent styling:

```css
.featureCard {
  display: grid;
  gap: 0;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.35rem;
  background:
    linear-gradient(180deg, rgba(9, 16, 27, 0.96) 0%, rgba(6, 12, 21, 0.92) 100%),
    radial-gradient(circle at top right, rgba(244, 155, 19, 0.08), transparent 45%);
  backdrop-filter: blur(16px);
  box-shadow: 0 22px 50px rgba(0, 0, 0, 0.22);
}

.featureAccent {
  position: relative;
  min-height: 8rem;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0));
}

.featureAccentLine {
  position: absolute;
  left: 1rem;
  right: 1rem;
  top: 1.15rem;
  height: 1px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0.04));
}

.featureAccentGlow {
  position: absolute;
  width: 12rem;
  height: 12rem;
  right: -2rem;
  top: -4rem;
  border-radius: 999px;
  filter: blur(6px);
  opacity: 0.9;
}

.featureAccentBase .featureAccentGlow {
  background: radial-gradient(circle, rgba(246, 163, 53, 0.28) 0%, rgba(246, 163, 53, 0) 70%);
}

.featureAccentLayover .featureAccentGlow {
  background: radial-gradient(circle, rgba(116, 154, 255, 0.24) 0%, rgba(116, 154, 255, 0) 70%);
}

.featureAccentRooms .featureAccentGlow {
  background: radial-gradient(circle, rgba(169, 128, 255, 0.22) 0%, rgba(169, 128, 255, 0) 70%);
}

.featureAccentVerified .featureAccentGlow {
  background: radial-gradient(circle, rgba(95, 220, 178, 0.22) 0%, rgba(95, 220, 178, 0) 70%);
}
```

- [ ] **Step 2: Tighten feature body hierarchy for text-first cards**

Adjust the body spacing and label placement:

```css
.featureBody {
  display: grid;
  gap: 0.65rem;
  padding: 1rem 1rem 1.15rem;
}

.featureLabel {
  color: #f4a11a;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: lowercase;
}
```

Keep the `h2` and `p` styles, but remove the absolute-position assumptions from the old media treatment.

- [ ] **Step 3: Run CSS-backed build verification**

Run: `npm run build`
Expected: PASS

### Task 3: Verify the public waitlist visually and capture status

**Files:**
- Modify: `docs/landing/jmpseat-static-waitlist-direction.md`

- [ ] **Step 1: Add a short note about the hybrid card direction**

Append a docs-impact bullet such as:

```md
- Feature cards now use a hybrid typographic treatment instead of AI-looking generated card imagery.
- The moody runway hero remains the primary atmospheric visual on the public page.
```

- [ ] **Step 2: Open the local page and verify the result**

Run the dev server if needed and verify:
- `/` still renders the runway hero
- feature cards are typographic glass cards without photo tiles
- `/app` remains untouched

Expected: Visual pass with no AI-looking card imagery

- [ ] **Step 3: Run final validation**

Run:
- `npm run lint`
- `npm run typecheck`
- `npm run build`

Expected:
- lint PASS with only the known pre-existing live-globe warnings
- typecheck PASS
- build PASS
