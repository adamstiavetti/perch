# E04 Verification Request Evidence Flows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect `/app/verification` to bounded work-email verification request and evidence-row creation without adding upload, review, or approval systems.

**Architecture:** Keep the flow split into a pure verification request planner and a thin server action. Reuse the existing verification surface, verification tables, and current private-app gate while storing only domain-level work-email evidence metadata.

**Tech Stack:** Next.js App Router, server actions, Supabase SSR client, Supabase Postgres tables with existing RLS, Node test runner, TypeScript.

---

### Task 1: Add failing request-flow tests

**Files:**
- Create: `test/verification/verificationRequestFlows.test.mts`
- Modify: `test/verification/workEmail.test.mts`
- Modify: `test/verification/verificationSurface.test.mts`

- [ ] Write failing tests for invalid email, unsupported domain, supported domain payload creation, duplicate request blocking, and missing-evidence repair.
- [ ] Run the focused verification tests and confirm the new expectations fail for the right reasons.

### Task 2: Add pure request-flow planning logic

**Files:**
- Create: `src/lib/verification/requestFlow.ts`
- Modify: `src/lib/verification/workEmail.ts`
- Modify: `src/lib/verification/surface.ts`

- [ ] Implement a pure planner for work-email verification submissions with bounded result types.
- [ ] Tighten work-email metadata to domain-only fields.
- [ ] Update surface-state helpers for the now-live work-email form and rejected-request state.

### Task 3: Add the server action

**Files:**
- Create: `src/lib/verification/actions.ts`

- [ ] Implement the bounded authenticated server action for work-email submission.
- [ ] Query current-user requests/evidence and active approved domains.
- [ ] Create request/evidence rows only for supported active domains.
- [ ] Prevent duplicate active requests and repair missing evidence metadata when needed.

### Task 4: Wire the verification page form

**Files:**
- Modify: `app/app/verification/page.tsx`
- Modify: `app/app/verification/verification.module.css`

- [ ] Convert the work-email section from disabled guidance into a bounded live submit form.
- [ ] Preserve privacy, separation, and no-employer-system-lookup copy.
- [ ] Keep redacted proof in a disabled coming-next state with no upload input.

### Task 5: Update docs and validate

**Files:**
- Create: `docs/epochs/epoch-04-verification-request-evidence-flows-implementation.md`
- Modify: `docs/epochs/epoch-04-worker-verification-foundation-tickets.md`
- Modify: `docs/BUILD_TICKETS.md`

- [ ] Document what rows are created, what metadata is stored, and what remains deferred.
- [ ] Run the required verification/auth/profile/beta/private/security tests.
- [ ] Run `npm run lint`, `npm run typecheck`, and `npm run build`.
