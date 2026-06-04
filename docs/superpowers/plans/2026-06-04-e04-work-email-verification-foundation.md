# E04 Work Email Verification Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the bounded work-email verification foundation for approved-domain matching and metadata-only verification request/evidence preparation without building upload, review, or claims-issuance flows.

**Architecture:** Keep this slice in pure verification-domain helpers so it stays shared-core/mobile-ready and does not mix with auth email, beta access, or reviewer logic. Reuse the existing `approved_email_domains`, `verification_requests`, and `verification_evidence` schema by generating safe request/evidence payloads and domain-support results without adding a migration.

**Tech Stack:** TypeScript, Node test runner, existing verification domain modules, Supabase schema already applied remotely

---

### Task 1: Add failing work-email domain tests

**Files:**
- Create: `test/verification/workEmail.test.mts`
- Modify: `src/lib/verification/workEmail.ts`

- [ ] **Step 1: Write the failing test**

Add tests covering:
- work-email normalization
- domain extraction
- invalid email rejection
- approved-domain matching
- unsupported-domain handling
- login-email/work-email separation signaling
- metadata helper stripping the full raw work email
- request/evidence payload builders staying metadata-only

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/verification/workEmail.test.mts`
Expected: FAIL because `src/lib/verification/workEmail.ts` does not exist yet

### Task 2: Implement minimal work-email helper layer

**Files:**
- Create: `src/lib/verification/workEmail.ts`
- Test: `test/verification/workEmail.test.mts`

- [ ] **Step 1: Write minimal implementation**

Add:
- work-email normalization
- email-shape validation
- domain extraction
- approved-domain status constants/types
- supported/unsupported domain result helper
- safe metadata helper that emits domain-only metadata
- pure request/evidence payload builders for the `work_email` method with no claim issuance

- [ ] **Step 2: Run the focused test**

Run: `node --test test/verification/workEmail.test.mts`
Expected: PASS

### Task 3: Document the bounded E04-T03 foundation

**Files:**
- Create: `docs/epochs/epoch-04-work-email-verification-foundation-implementation.md`
- Modify: `docs/epochs/epoch-04-worker-verification-foundation-tickets.md`
- Modify: `docs/BUILD_TICKETS.md`

- [ ] **Step 1: Write the implementation note**

Document:
- what work-email verification can prove
- what it cannot prove
- how login email differs from work email
- how approved domains are managed
- that no real domains were guessed or seeded
- that automatic claim issuance is deferred
- what remains for proof upload, storage, and human review
- that employer-system lookup and custom SMTP work remain out of scope

- [ ] **Step 2: Update ticket index docs**

Mark `E04-T03` complete in the Epoch 04 ticket pack and add the implementation note to `docs/BUILD_TICKETS.md`.

### Task 4: Run full validation and commit

**Files:**
- Verify: `test/verification/workEmail.test.mts`
- Verify: `test/verification/verification.test.mts`
- Verify: `test/auth/supabaseConfig.test.mts`
- Verify: `test/auth/authRoutes.test.mts`
- Verify: `test/auth/authPages.test.mts`
- Verify: `test/profile/profile.test.mts`
- Verify: `test/beta-access/betaAccess.test.mts`
- Verify: `test/private-app/privateShellPlaceholder.test.mts`
- Verify: `test/private-app/access.test.mts`
- Verify: `test/security-events/securityEvents.test.mts`

- [ ] **Step 1: Run validation**

Run:
- `node --test test/verification/workEmail.test.mts`
- `node --test test/verification/verification.test.mts`
- `node --test test/auth/supabaseConfig.test.mts test/auth/authRoutes.test.mts test/auth/authPages.test.mts`
- `node --test test/profile/profile.test.mts`
- `node --test test/beta-access/betaAccess.test.mts`
- `node --test test/private-app/privateShellPlaceholder.test.mts test/private-app/access.test.mts`
- `node --test test/security-events/securityEvents.test.mts`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

- [ ] **Step 2: Commit**

Run:
`git add src/lib/verification/ test/verification/ docs/`

Commit:
`git commit -m "feat: add work email verification foundation"`
