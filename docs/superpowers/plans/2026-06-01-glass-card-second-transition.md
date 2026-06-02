# Glass Card Second Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the two-piece cut glass card as a late second-transition 3D object and retarget the hero aircraft so it flies through the center cut seamlessly.

**Architecture:** Keep the glass inside the existing `LiveGlobeCanvas` Three.js scene and bind its rise/settle choreography to existing chapter/handoff progress. Adjust the hero aircraft end-path logic so the plane uses the glass cut as the new handoff target instead of a detached free-flight endpoint.

**Tech Stack:** Next.js, React, Three.js, GLTFLoader, existing waitlist transition and hero-flight controllers.

---

### Task 1: Wire the glass card asset into the live globe scene

**Files:**
- Modify: `app/lab/live-globe-proof/page.tsx`

- [ ] **Step 1: Add glass card asset constants and controller state**
- [ ] **Step 2: Load the GLB with the existing loader path and attach it to a dedicated scene group**
- [ ] **Step 3: Verify the card can be positioned/oriented independently from the globe and background**

### Task 2: Bind glass reveal to the latter second-transition phase

**Files:**
- Modify: `app/lab/live-globe-proof/page.tsx`

- [ ] **Step 1: Define a late-phase progress window for glass rise and settle**
- [ ] **Step 2: Animate vertical rise, horizontal settle, and screen-facing orientation from that progress window**
- [ ] **Step 3: Ensure smaller segment renders on screen-left in final composition**

### Task 3: Retarget the hero plane into the card split

**Files:**
- Modify: `app/lab/live-globe-proof/page.tsx`
- Modify: `src/lib/scroll/heroFlightControl.ts` (only if helper extraction is required)
- Test: `test/scroll/heroFlightControl.test.mts` (only if behavior helpers change)

- [ ] **Step 1: Define a stable world-space target in the card split**
- [ ] **Step 2: Adjust hero launch/free-flight endpoint logic so the aircraft enters the split cleanly**
- [ ] **Step 3: Preserve interrupted scroll / reverse / resume behavior while using the new target**

### Task 4: Verify and tune choreography

**Files:**
- Modify: `app/lab/live-globe-proof/page.tsx` (tuning only)

- [ ] **Step 1: Run targeted tests/build**
- [ ] **Step 2: Browser-check the late transition, settle pose, and plane entry path**
- [ ] **Step 3: Tune rise timing and plane-entry timing until the handoff reads as one continuous motion**
