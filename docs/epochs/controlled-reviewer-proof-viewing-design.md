# Controlled Reviewer Proof Viewing Design

## Purpose

This design defines how authorized reviewers should view submitted proof files safely without exposing:

- public proof URLs
- raw storage paths in UI
- broad bucket access
- proof files to unauthorized users

The goal is to preserve the existing privacy boundary around `verification-proofs` while enabling a bounded reviewer-only viewing step later.

## Current State

Current runtime-proven state:

- redacted proof upload works
- the `verification-proofs` bucket is private
- upload is limited to JPEG and PNG under 5 MB
- storage paths use UUID-only segments
- evidence rows remain metadata-only
- reviewer routing works through bounded `requested_airline` context
- reviewer queue is metadata-only

Current non-features:

- no proof viewing exists
- no signed URLs exist
- no reviewer storage read policy exists
- no reviewer proof download exists
- no preview exists

## Hard Requirements

Any future proof-viewing implementation must enforce all of the following:

- reviewer must be authenticated
- reviewer must have active reviewer scope
- reviewer cannot view their own proof for self-review
- reviewer must only view proof for requests they are allowed to review
- no public URLs
- no broad bucket listing
- no storage paths exposed in UI
- no permanent links
- access must be audited
- proof viewing must not imply approval
- no AI or OCR in this step
- no employer-system lookup

## Candidate Approaches

### A. Server-Controlled Short-Lived Signed URL

How it works:

- reviewer requests proof view from a server-controlled route or action
- server verifies reviewer authorization first
- server creates a short-lived signed URL only after authorization succeeds
- browser receives only the short-lived access URL, not a reusable public link

Strengths:

- bounded and relatively simple MVP
- keeps authorization centralized in server code
- does not require broad reviewer storage policies
- works well with the existing private bucket model

Weaknesses:

- still exposes a short-lived URL to the browser
- requires careful TTL discipline
- requires server-only privileged object access

Risk posture:

- acceptable if the URL is very short-lived
- acceptable only if every grant is audited
- acceptable only if storage paths are not surfaced in the visible UI

### B. Server-Rendered Or Streamed Proof Retrieval Route

How it works:

- reviewer requests proof view from a server route
- server verifies reviewer authorization first
- server fetches the object and streams it back directly
- browser never receives a signed storage URL

Strengths:

- strongest control over proof delivery
- no signed URL exposed to the browser
- easiest place to centralize audit, deny reasons, and response headers

Weaknesses:

- more implementation complexity
- more server bandwidth and code surface
- still requires server-only privileged object access

Risk posture:

- strongest long-term privacy control
- likely the safest eventual model
- more than is needed for the first bounded MVP if we want to move incrementally

### C. Storage RLS Reviewer Read Policy

How it works:

- add storage read policy so reviewers can read matching objects directly from `storage.objects`
- storage policy would have to map:
  - object path
  - evidence row
  - request row
  - reviewer scope

Strengths:

- avoids server-side privileged retrieval path
- keeps access inside Storage and RLS concepts

Weaknesses:

- harder to express safely
- easier to accidentally broaden read access
- harder to reason about no-list/no-broad-read posture
- object-level reviewer authorization becomes more fragile and indirect

Risk posture:

- too risky and too complex for the MVP proof-viewing slice
- not preferred as the first retrieval architecture

### D. Public URL Or Direct Bucket Exposure

Rejected.

Why rejected:

- incompatible with current privacy boundaries
- violates the no-public-URL requirement
- increases unauthorized sharing risk
- undermines the controlled, audited review model

## Recommended Approach

Recommended MVP approach:

- server-controlled short-lived signed URL
- only after the server verifies `can_review_verification_request(...)`
- very short TTL:
  - target `60 seconds`
  - hard upper bound `5 minutes`
- every request and grant must record a security or audit event
- no broad bucket list access
- no user-provided path parameters

Why this is the recommended MVP:

- simpler than full server-streaming while still keeping authorization server-side
- narrower and safer than complex Storage RLS reviewer-read rules
- preserves the current private-bucket posture
- gives us a bounded first retrieval slice that is testable and auditable

Why not broad Storage RLS first:

- reviewer object authorization would be harder to prove safe
- Storage policy logic would need to reconstruct request/evidence/reviewer scope matching from path and metadata
- the blast radius of a policy mistake is much larger than a server-guarded signed-URL step

Why not server-streaming first:

- safer long-term, but higher implementation cost
- signed-URL generation is a reasonable first slice if:
  - TTL is short
  - access is audited
  - the browser UI never shows storage paths or reusable download controls

## Required Authorization Checks

Before granting any proof view:

- current user authenticated
- active reviewer scope exists
- request exists
- evidence exists
- request is reviewable
- evidence belongs to request
- reviewer is not request owner
- `can_review_verification_request(...)` returns `true`
- evidence type is `redacted_badge_or_proof`
- storage bucket is `verification-proofs`

Recommended additional bounded checks:

- evidence `storage_path` exists and matches the expected stored evidence row
- evidence is not already marked deleted
- request has not moved into a terminal state where proof access should be withdrawn, if later policy decides that

## Audit And Security Events

Recommended future event types:

- `verification_evidence.view_requested`
- `verification_evidence.view_granted`
- `verification_evidence.view_denied`

Event metadata must not include:

- storage path
- signed URL
- raw filename
- proof contents
- OCR text
- employee IDs
- badge numbers
- barcode values
- QR values

Allowed metadata:

- request id
- evidence id
- result
- reason code
- evidence type
- reviewer id if stored in the internal event row already

Recommended deny reason examples:

- `unauthenticated`
- `scope_missing`
- `self_review_blocked`
- `request_not_reviewable`
- `evidence_missing`
- `bucket_mismatch`
- `unsupported_evidence_type`

## UI Behavior

Future reviewer UI should:

- show `View proof` only for authorized reviewers
- avoid image preview by default unless deliberately chosen in the future implementation
- avoid any persistent download link
- show a redaction reminder before opening proof
- show a `do not use employer systems` reminder
- show that proof viewing is audited
- make clear that viewing proof does not approve the request

The reviewer queue should remain metadata-first.

Proof viewing should be a separate deliberate action, not automatic inline rendering.

## Access Lifetime And Retention

Future proof-view access should be:

- short-lived only
- non-persistent
- not reusable after expiration

The raw uploaded object should still follow the current `delete_after` retention model.

Retention automation remains a later step and is not solved by the proof-viewing design alone.

## Founder And Global Reviewer Note

If founder or admin review coverage is needed:

- grant explicit `global` reviewer scope through `verification_reviewer_scopes`
- do not hard-code a founder or admin email in app code
- keep that access explicit and auditable

Global reviewer scope may review any request, but still:

- cannot self-review
- should remain within the same audited proof-viewing path

## Out Of Scope

This design does not implement or decide:

- upload changes
- proof deletion automation
- AI or OCR
- automatic approval
- claim-gated community access
- mobile implementation
- custom Supabase auth branding or custom SMTP

## Implementation Gates

Before implementation starts:

1. Choose the final retrieval approach:
   - bounded short-lived signed URL
   - or server-streaming if we decide to absorb the extra complexity now
2. Confirm whether server-only privileged storage access is acceptable for this route.
3. Add event taxonomy entries if new proof-view events are adopted.
4. Add focused authorization-denial tests.
5. Add a runtime test plan covering:
   - authorized reviewer success
   - unauthorized reviewer denial
   - self-review denial
   - expired access denial
6. Confirm privacy and legal copy for reviewer proof access.

## Recommended Next Implementation Slice

Next build ticket:

- controlled reviewer proof viewing foundation

Boundaries for that slice:

- no approval changes
- no claim changes
- no AI
- no retention automation yet
- no public URLs
- no broad storage read policy
