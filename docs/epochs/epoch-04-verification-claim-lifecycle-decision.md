# Epoch 04 Verification Claim Lifecycle Decision

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

## 1. Purpose

`E04-T01` locks the worker-verification claim model and lifecycle before any schema, upload, storage, or human-review implementation begins.

The goal is to verify real airline-worker affiliation safely, without employer-system lookup, while preserving privacy and keeping sensitive verification concerns separate from general account state.

This decision must preserve explicit separation between:

- auth/session control
- self-declared profile fields
- beta-access approval
- worker verification

This is a planning decision only. It does not implement migrations, storage, upload handling, UI, reviewer tooling, or claims-based room access.

## 2. Core Principles

- Auth proves account/session control.
- Profile fields are self-declared and useful for onboarding, not proof.
- Beta access grants private-beta entry and is separate from verification.
- Verification proves specific worker, airline, role, or base claims based on allowed evidence.
- Verification does not automatically equal beta access unless a later reviewed policy explicitly says so.
- Future protected rooms/areas should rely on approved claims, not self-declared profile text.
- Self-declared `claimed_airline`, `claimed_role`, and `claimed_base` must never be trusted for protected airline/base/role access by themselves.
- Employer-system lookup is prohibited unless jmpseat has explicit written authorization from that employer.
- Verification must be reusable across web and future mobile, not tied to web-only route assumptions.

## 3. Verification Claim Types

### `airline_worker`

- Meaning:
  - the user has been approved as a real airline or aviation worker at a broad level
- Example claim values:
  - `airline_worker = true`
- Evidence that may support it:
  - approved work-email verification where domain policy allows broad worker confirmation
  - redacted badge/proof with human review
- Required for MVP:
  - yes, as the broad worker-verification baseline
- What it may unlock later:
  - broad verified-worker areas
  - broad aviation-worker community surfaces that do not require airline/base/role specificity
- What it must not imply:
  - employer endorsement
  - permanent or forever-valid employment
  - airline-specific, role-specific, or base-specific access by itself

### `airline`

- Meaning:
  - the user has been approved as affiliated with a specific airline or aviation employer based on allowed evidence
- Example claim values:
  - `airline = United`
  - `airline = Delta`
  - `airline = Southwest`
- Evidence that may support it:
  - work-email verification against an approved airline-controlled domain
  - redacted badge/proof showing airline affiliation clearly enough for safe human review
- Required for MVP:
  - likely yes for later airline-specific areas, but exact rollout can remain bounded by later tickets
- What it may unlock later:
  - airline-specific rooms/areas
  - airline-scoped moderation/reviewer trust boundaries later
- What it must not imply:
  - jmpseat endorsement by that airline
  - current employment forever
  - role or base certainty by itself

### `role`

- Meaning:
  - the user has been approved for a specific work role claim
- Example claim values:
  - `role = Flight Attendant`
  - `role = Pilot`
  - `role = Gate Agent`
  - `role = Ramp`
- Evidence that may support it:
  - redacted badge/proof if role is visible and safe to review
  - future allowed work-email plus additional bounded evidence if later approved
- Required for MVP:
  - not necessarily required for broad verified access, but important for future role-scoped areas
- What it may unlock later:
  - role-specific rooms or guidance areas
- What it must not imply:
  - broad airline or base verification if role is approved alone
  - employer endorsement
  - indefinite validity

### `base`

- Meaning:
  - the user has been approved for a specific base/domicile claim
- Example claim values:
  - `base = DEN`
  - `base = IAH`
  - `base = ATL`
- Evidence that may support it:
  - redacted badge/proof if base is visible and safe to review
  - later approved bounded evidence methods if needed
- Required for MVP:
  - not necessarily required for broad verified access, but needed before future base-specific protected areas
- What it may unlock later:
  - base-specific rooms/areas
- What it must not imply:
  - airline-worker verification by itself
  - current assignment forever
  - employer endorsement

## 4. Verification Claim Statuses

### `pending`

- Meaning:
  - a claim request exists, but no final approval or rejection has been issued
- Who/what can set it:
  - user submission flow
  - system transition from draft/submitted into review
- User-facing behavior:
  - show that verification is in progress
- Access implications:
  - no claim-gated access yet
- Audit requirements:
  - submission time and actor must be auditable

### `approved`

- Meaning:
  - the claim has been issued based on allowed evidence and review rules
- Who/what can set it:
  - approved human reviewer flow
  - work-email flow only if a later ticket explicitly approves bounded automatic issuance for that method
- User-facing behavior:
  - show verified status and any expiration/recheck notice
- Access implications:
  - claim can be used by later claim-gated authorization
- Audit requirements:
  - reviewer or decision actor, evidence method, and issued-at time must be auditable

### `rejected`

- Meaning:
  - the request was reviewed and denied
- Who/what can set it:
  - human reviewer
- User-facing behavior:
  - show neutral rejection messaging without exposing reviewer-only internals
- Access implications:
  - no claim-gated access
- Audit requirements:
  - decision reason category and reviewer must be auditable

### `needs_resubmission`

- Meaning:
  - the request was not safely or sufficiently reviewable and needs a new submission
- Who/what can set it:
  - human reviewer
  - future advisory AI pre-check may suggest it, but cannot finalize it without approved reviewer action unless later policy changes
- User-facing behavior:
  - show clear resubmission guidance
- Access implications:
  - no claim-gated access until approved
- Audit requirements:
  - resubmission reason category must be auditable

### `expired`

- Meaning:
  - the claim was valid previously but is no longer current under the reverification policy
- Who/what can set it:
  - scheduled expiration logic later
  - reviewer/admin action if expiration is applied manually
- User-facing behavior:
  - show reverification needed
- Access implications:
  - claim-gated access should be removed or paused
- Audit requirements:
  - expiration event and prior issued claim linkage must be auditable

### `revoked`

- Meaning:
  - the claim was removed before or after expiry because of fraud, abuse, stale employment, policy violation, or other reviewed decision
- Who/what can set it:
  - trusted reviewer/admin path
- User-facing behavior:
  - show that verification is no longer active, with bounded messaging
- Access implications:
  - claim-gated access must be removed
- Audit requirements:
  - revocation actor, timestamp, and reason category must be auditable

## 5. Verification Request Lifecycle

Recommended request lifecycle:

1. authenticated user starts a verification request
2. user selects or confirms requested claim(s)
3. user chooses an evidence method:
   - `work_email`
   - `redacted_badge_or_proof`
4. user submits evidence or verification details
5. request enters review state
6. optional future AI pre-check may provide advisory classification only
7. human reviewer approves, rejects, or requests resubmission where required
8. approved claim is issued
9. raw evidence is retained only for the approved retention window
10. claim may later expire or be revoked

Recommended lifecycle states:

- `draft`
  - user has started but not submitted a request
- `submitted`
  - user has completed the submission action
- `pending_review`
  - request is waiting for reviewer decision or later bounded automated domain confirmation step
- `needs_resubmission`
  - reviewer requires safer/clearer evidence
- `approved`
  - request resulted in issued claim(s)
- `rejected`
  - request was denied
- `cancelled`
  - user or system closed the request before approval
- `expired`
  - request or resulting claim is no longer current under policy
- `revoked`
  - resulting claim was actively withdrawn after issuance

Lifecycle guardrails:

- one request may produce one or more approved claims
- request state and claim state should remain distinct
- a request being approved should not silently change beta access
- future work-email automation must still honor the rule that AI or system heuristics do not become unreviewed final approval unless a later policy explicitly permits it for a bounded method

## 6. Evidence Types

### `work_email`

- What it can prove:
  - access to an approved airline-controlled or employer-controlled domain
  - likely airline affiliation at a broad level
- Limitations:
  - not all workers have it
  - may not prove role or base
  - may raise workplace privacy concerns
- Privacy risk:
  - work email is sensitive and should not be exposed publicly
- Required safeguards:
  - approved-domain allowlist
  - domain-only logging where possible
  - keep work email separate from public profile and possibly separate from login email
- Scope:
  - initial scope

### `redacted_badge_or_proof`

- What it can prove:
  - broad worker status
  - airline affiliation
  - possibly role/base if visible and safe
- Limitations:
  - requires human review
  - can include unsafe or overbroad private details if not properly redacted
- Privacy risk:
  - high, because uploaded proof may contain sensitive information
- Required safeguards:
  - strict redaction instructions
  - private storage only
  - bounded retention
  - auditable reviewer access
- Scope:
  - initial scope

### `peer_vouch`

- What it can prove:
  - later supplemental trust signal only
- Limitations:
  - should not be the only verification path for unknown users
- Privacy risk:
  - social pressure and clique risk
- Required safeguards:
  - later policy review
  - bounded abuse controls
- Scope:
  - later scope

### `ai_precheck`

- What it can prove:
  - nothing by itself
- Limitations:
  - advisory only
  - cannot be final approval by default
- Privacy risk:
  - model exposure risk if raw evidence is mishandled
- Required safeguards:
  - later policy review
  - no final authority
  - no raw proof handling without explicit approved policy
- Scope:
  - later scope

## 7. Work-Email Verification Rules

- Work-email verification verifies access to an explicitly approved airline-controlled or employer-controlled domain.
- Work email may differ from login email.
- Work email should never be public.
- Approved airline/employer domains must be explicitly managed and reviewed.
- Not all workers have work email access, so work email cannot be the only verification method.
- Work-email verification may support broad `airline_worker` and airline-specific claims.
- Work-email verification does not by itself prove role or base unless a later bounded policy and evidence model explicitly supports that.
- Work-email verification must not imply employer endorsement or permanent employment.

## 8. Redacted Badge/Proof Rules

- Users must be instructed to redact:
  - employee IDs
  - barcodes
  - QR codes
  - badge backsides
  - security/access markings
  - unnecessary personal details
- Raw proof must be private and access-limited.
- Raw proof must not be stored longer than needed.
- Minimal metadata should remain after review.
- Proof upload must not collect more than necessary.
- Unredacted or unsafe proof should be rejected or moved to `needs_resubmission`.
- Redacted proof may support:
  - `airline_worker`
  - `airline`
  - possibly `role`
  - possibly `base`
- Role/base approval from proof should be carefully bounded and only issued when evidence is visible, safe, and clearly reviewable.

## 9. Human Review Model

- Human review is required for redacted proof approval.
- Reviewers cannot approve themselves.
- Reviewer actions must be audited.
- Reviewer scope should eventually be limited by airline/base/role trust level or reviewer trust role.
- Reviewers may rely only on:
  - submitted proof
  - verified email-domain evidence
  - user-provided information
  - permitted personal knowledge
  - approved jmpseat workflows
- Reviewers may not use:
  - employer systems
  - internal directories
  - crew scheduling tools
  - company portals
  - employee databases
  - confidential employer resources

## 10. Claim Expiration And Reverification

- Airline employment can change.
- Claims should have expiration and reverification rules.
- Proposed initial windows:
  - `airline_worker`: 12 months
  - `airline`: 6 to 12 months
  - `role`: 6 months or user-triggered update
  - `base`: 6 months or user-triggered update
- These windows are starting policy defaults only and may be revisited before broad launch.
- Expiration must not silently leave stale claims active forever.

## 11. Revocation And Abuse Handling

- Claims can be revoked for:
  - fraud
  - stale employment
  - user report
  - policy violation
  - reviewer/admin decision
- Revoked claims remove access to claim-gated rooms/features later.
- Revocation must be audited.
- Appeal/resubmission flow can be implemented later and should not be assumed complete in this decision.

## 12. Data Model Implications

This section describes expected future entities only. It does not create migrations.

### `verification_requests`

- Purpose:
  - user-level verification request lifecycle
- Ownership:
  - owned by the user who submits the request
- Sensitivity:
  - private, non-public
- RLS posture:
  - user can read own request state
  - reviewer/admin access must be explicit
- Indexing/scalability considerations:
  - `user_id`
  - `status`
  - `created_at`
  - reviewer queue filters
- What it must not store:
  - raw proof blobs
  - badge numbers
  - employee IDs unless a later reviewed policy explicitly requires minimal derived metadata

### `verification_claims`

- Purpose:
  - stores issued claims and their status/expiry/revocation posture
- Ownership:
  - platform-issued, user-linked
- Sensitivity:
  - private authorization data
- RLS posture:
  - user may read own claim state
  - write/issue/revoke paths must be reviewer/admin controlled
- Indexing/scalability considerations:
  - `user_id`
  - `claim_type`
  - `claim_value`
  - `status`
  - `expires_at`
- What it must not store:
  - raw proof data

### `verification_evidence`

- Purpose:
  - metadata describing the evidence method and storage linkage
- Ownership:
  - linked to the request and platform review process
- Sensitivity:
  - highly sensitive metadata
- RLS posture:
  - not publicly readable
  - user access should be bounded to safe summary state only
- Indexing/scalability considerations:
  - `request_id`
  - `evidence_type`
  - status/retention fields
- What it must not store:
  - raw file contents in DB rows
  - unnecessary extracted sensitive text

### `verification_reviews` or `review_actions`

- Purpose:
  - tracks reviewer decisions and reasons
- Ownership:
  - reviewer/admin controlled
- Sensitivity:
  - internal operational/audit data
- RLS posture:
  - internal-only read/write
- Indexing/scalability considerations:
  - `request_id`
  - `reviewer_id`
  - `created_at`
  - decision filters
- What it must not store:
  - raw proof duplication
  - informal sensitive notes that exceed minimum operational need

### Optional `approved_domains`

- Purpose:
  - approved airline/employer domain inventory
- Ownership:
  - platform-managed reference data
- Sensitivity:
  - internal reference/config data
- RLS posture:
  - internal management, public/client exposure only where minimally needed
- Indexing/scalability considerations:
  - domain lookup
  - airline/employer grouping
- What it must not store:
  - unnecessary unrelated employer metadata

### Optional `reviewer_scopes`

- Purpose:
  - later reviewer eligibility/scoping rules
- Ownership:
  - internal reviewer-role management
- Sensitivity:
  - internal role/privilege data
- RLS posture:
  - internal-only
- Indexing/scalability considerations:
  - reviewer lookups by airline/base/role scope
- What it must not store:
  - sensitive proof payloads

## 13. Storage And Retention Implications

- Raw evidence should live in private storage, not in database rows.
- The database should store metadata and review status only.
- Storage access must be restricted.
- Retention/deletion policy must be defined before upload implementation.
- No raw proof should appear in `security_events` metadata.
- No employee IDs, badge numbers, QR codes, or barcodes should appear in logs.
- Storage/path design must support later deletion after review or retention expiry.

## 14. Authorization Implications

- Future rooms/boards should check approved claims, not profile text.
- `airline_worker` may unlock broad verified areas later.
- `airline` may unlock airline-specific rooms later.
- `base` may unlock base-specific rooms later.
- `role` may unlock role-specific rooms later.
- This decision does not implement rooms or boards.

## 15. Route/Surface Implications

Expected future `/app/verification` behavior:

- authenticated users only
- explicit gate decision still needed in later tickets on whether the route is:
  - beta-gated
  - or available after auth/profile completion before active beta
- lets users view verification status
- lets users start a verification request
- does not grant automatic access by itself
- includes clear privacy and redaction copy
- must not imply employer-system lookup

## 16. Security-Event Implications

Expected future security events:

- `verification_request.submitted`
- `verification_request.needs_resubmission`
- `verification_request.approved`
- `verification_request.rejected`
- `verification_claim.issued`
- `verification_claim.revoked`
- `verification_evidence.uploaded`
- `verification_evidence.deleted`

Security-event metadata must remain minimal and must not include:

- raw proof
- employee IDs
- badge numbers
- QR code or barcode contents
- unnecessary sensitive airline/security details

## 17. Out Of Scope For E04-T01

- no migrations
- no upload implementation
- no storage implementation
- no UI implementation
- no AI implementation
- no reviewer queue implementation
- no admin dashboard
- no room access implementation
- no community features

## 18. Open Questions

- exact approved airline/employer domains
- exact proof file types and size limits
- exact evidence retention period
- whether `/app/verification` is beta-gated or available after login/profile completion
- reviewer role/scoping model
- whether role/base claims require proof or may start as self-declared-plus-review in any bounded cases
- how appeals and resubmissions work in detail
- whether and when peer vouching is allowed
- future AI pre-check policy

## 19. Impact On Epoch 04 Tickets

- `E04-T02` uses this decision to define verification tables, statuses, RLS posture, and indexes
- `E04-T03` uses this decision to define approved-domain handling and work-email claim issuance boundaries
- `E04-T04` uses this decision to define storage, retention, deletion, and redaction rules
- `E04-T05` uses this decision to define `/app/verification` status and submission behavior
- `E04-T06` uses this decision to define request/evidence metadata flows and state transitions
- `E04-T07` uses this decision to define human-review queue scope and self-approval prohibitions
- `E04-T08` uses this decision to extend security events without exposing sensitive proof data
- `E04-T09` uses this decision to map approved claims to future protected-area authorization
- `E04-T10` uses this decision as the controlling reference for validation and handoff

## 20. Important Ops/Brand Follow-Up

Preserve, but do not silently absorb into `E04-T01`:

- customize Supabase auth email templates for jmpseat branding
- configure custom SMTP/domain sender so confirmation/reset emails do not look third-party

These remain important trust/brand follow-up items, but they are not part of this claim/lifecycle decision except as later referenced operational work.

