# Epoch 04 Work Email Verification Foundation Implementation

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

## 1. Purpose

`E04-T03` implements the bounded work-email verification foundation only.

This slice adds pure helper logic for:

- work-email normalization
- email-shape validation
- approved-domain matching
- safe work-email metadata creation
- metadata-only verification request/evidence draft payloads for the `work_email` method

It does not implement email delivery, proof upload, Storage, reviewer tooling, AI, or claims-based access.

## 2. What Work-Email Verification Can Prove

At this stage, work-email verification can support:

- confirming that a user can present a work email under an approved configured domain
- supporting an airline-affiliation claim when the approved domain record includes an airline label
- preparing a verification request and evidence metadata for later workflow steps

## 3. What Work-Email Verification Cannot Prove

This foundation does not treat work email as proof of:

- beta access
- role verification
- base verification
- permanent employment
- employer endorsement
- final claim approval by itself

Work email remains separate from auth identity, profile completion, and beta access.

## 4. Login Email vs Work Email

This implementation preserves the separation between:

- account/login email
- work email used for verification

The work-email metadata helper records only whether the login email and work email are separate. It does not expose the raw work email in the generated evidence metadata.

## 5. Approved Domain Behavior

This ticket uses the existing `approved_email_domains` foundation from `E04-T02`.

Current behavior:

- only domains explicitly present in `approved_email_domains` and marked `active` are treated as supported
- `disabled` domains are treated as unsupported
- unsupported domains produce an explicit unsupported result
- invalid email shapes produce an explicit invalid result

Important boundary:

- no real airline domains were guessed
- no real airline domains were seeded
- no hard-coded approved-domain list was added to application code

Domain management and real approved-domain population remain later operational or reviewer/admin work.

## 6. Automatic Claim Issuance

Automatic claim issuance was intentionally deferred.

This implementation prepares:

- a `verification_requests` draft insert payload
- a `verification_evidence` draft insert payload for the `work_email` method

It does not create:

- `verification_claims`
- reviewer actions
- any automatic final approval path

Current request/evidence preparation behavior:

- request status is `submitted`
- requested claim types default to:
  - `airline_worker`
  - plus `airline` when the approved-domain record includes an airline value
- evidence status is `submitted`
- evidence metadata is domain-only and method-only
- storage fields remain `null`

## 7. Metadata Safety Boundary

The work-email helper emits metadata intended to stay operationally useful without exposing the raw work email.

Current metadata includes:

- `email_domain`
- `airline`
- `login_email_separate`
- `supported_domain`
- `verification_method`

Current metadata does not include:

- full raw work email
- employee IDs
- badge/proof data
- file/blob data

## 8. What This Ticket Does Not Implement

This ticket does not add:

- redacted badge/proof upload
- Supabase Storage bucket creation
- file upload UI
- AI pre-check
- human review queue or reviewer/admin dashboard
- claims-based room or board access
- mobile scaffold
- custom SMTP configuration
- Supabase auth email template branding

## 9. Employer-System Lookup

No employer-system lookup was added.

This implementation does not access:

- employer systems
- crew scheduling tools
- internal directories
- employee databases
- company portals

That prohibition remains in force.

## 10. What Remains Later

Later tickets still need to cover:

- real approved-domain operations or reviewer/admin management
- work-email delivery/confirmation flow if adopted later
- proof upload and private storage design
- human review workflow
- claim issuance policy and audit integration
- claims-based authorization
- branded auth email templates and custom SMTP as a separate later ops/brand follow-up
