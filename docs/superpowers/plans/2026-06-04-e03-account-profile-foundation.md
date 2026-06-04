# Epoch 03 Account Profile Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first real app-account/profile layer for authenticated jmpseat users without introducing beta access, worker verification, or community features.

**Architecture:** Add a small `profiles` table migration plus shared server-side profile helpers that evaluate completion from self-declared fields. Use dedicated `/app/profile` onboarding and bounded server-side redirect helpers so `/app` and `/auth/callback` can route authenticated users to profile completion without inventing later beta or verification state.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase SSR/Auth, Postgres SQL migration, Node test runner.

---

### Task 1: Add failing profile-domain tests

**Files:**
- Create: `test/profile/profile.test.mts`
- Modify: `test/auth/authRoutes.test.mts`

- [ ] **Step 1: Write the failing test**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Write minimal profile-domain implementation**
- [ ] **Step 4: Run test to verify it passes**

### Task 2: Add the profiles migration and server helpers

**Files:**
- Create: `supabase/migrations/<timestamp>_create_profiles.sql`
- Create: `src/lib/profile/profile.ts`
- Create: `src/lib/profile/server.ts`

- [ ] **Step 1: Write migration/profile helper tests where practical**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement migration and server helpers**
- [ ] **Step 4: Run focused tests to verify they pass**

### Task 3: Add `/app/profile` onboarding and redirect behavior

**Files:**
- Create: `app/app/profile/page.tsx`
- Create: `src/lib/profile/actions.ts`
- Modify: `app/app/page.tsx`
- Modify: `app/auth/callback/route.ts`

- [ ] **Step 1: Extend tests for route/copy/redirect behavior**
- [ ] **Step 2: Run tests to verify they fail**
- [ ] **Step 3: Implement dedicated profile surface and redirect resolution**
- [ ] **Step 4: Run focused tests to verify they pass**

### Task 4: Update docs and validate

**Files:**
- Create: `docs/epochs/epoch-03-account-profile-foundation-implementation.md`
- Modify: `docs/epochs/epoch-03-auth-account-beta-access-tickets.md`
- Modify: `docs/BUILD_TICKETS.md`

- [ ] **Step 1: Update docs with profile foundation boundaries**
- [ ] **Step 2: Run required test and validation commands**
- [ ] **Step 3: Commit the bounded E03-T04 slice**
