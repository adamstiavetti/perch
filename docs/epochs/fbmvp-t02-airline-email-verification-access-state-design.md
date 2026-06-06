# FBMVP-T02 Airline Email Verification Access State Design

Date: 2026-06-05

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or employer unless explicitly obtained and documented.

## 1. Decision Summary

`airline_email_verified` is the forward app-level eligibility state for jmpseat general app access and general baseboard access.

This state replaces proof-upload verification as the forward general-access gate. It proves only that the user has confirmed control of an approved airline employee email address at the relevant verification time. It does not prove role, base, seniority, current employment beyond email control, employer endorsement, airline endorsement, union endorsement, or airport endorsement.

Restricted role/base boards remain separate. They require board membership and community-admin approval in later First-Base MVP work. `airline_email_verified` must not automatically grant DFW FA, DFW Pilot, DFW Ramp, DFW Mechanics, or any other restricted-board access.

This is a docs/design task only. It does not implement code, create migrations, change app gates, remove beta gating, or start FBMVP-T03.

## 2. Current Foundation

The existing verification foundation remains useful, even though proof upload is frozen as a forward product path:

- `approved_email_domains`: stores operator-reviewed airline or employer domains with `active` / `disabled` status and optional airline label.
- Work-email verification helpers: normalize work email, extract domain, match active approved domains, and prepare metadata-only request/evidence payloads.
- `verification_requests`: records submitted verification requests, including `method = 'work_email'` for work-email requests.
- `verification_evidence`: stores metadata-only work-email evidence such as `email_domain`, optional `airline`, `verification_method`, source, and support result. It does not store the full work email in evidence metadata.
- `verification_claims`: stores historical `airline_worker`, `airline`, `role`, and `base` claims from the previous worker-verification model.
- Approved-domain management: operator-managed tooling exists for creating, updating, disabling, and auditing approved domains.
- Security events: auth, private access, verification request/evidence, review, claim, and approved-domain events exist.
- Auth/profile/beta gate: current private app access still uses authenticated login, profile completion, and beta access as the private-testing gate.
- Operator/admin tooling: platform operator tools are explicit-scope based and remain separate from community-admin authority.

Proof upload, proof review, proof viewing, proof cleanup, and proof audit infrastructure remain historical/runtime-applied infrastructure. They should not be expanded for this forward access model.

## 3. Recommended Forward State

The forward app-level access state should be named `airline_email_verified`.

Recommended state fields:

- `status`: one of `pending`, `verified`, `expired`, `revoked`, `unsupported_domain`.
- `airline_email_domain`: the normalized approved airline employee email domain.
- `airline`: optional airline label, only when safely derived from an active approved-domain mapping.
- `verified_at`: timestamp when control of the approved airline employee email was confirmed.
- `expires_at`: optional future expiry timestamp.
- `refresh_after`: optional future refresh timestamp.
- `source`: should identify the state as derived from approved airline email, not proof upload.

Recommended implementation posture:

- Start with a clean app-level access helper or database view around existing work-email verification data.
- Name the adapter/helper around the forward state, such as `getCurrentAirlineEmailAccessState`.
- Derive `verified` only from unambiguous work-email provenance.
- Consider schema normalization later if the adapter becomes awkward, if expiry/revocation needs become complex, or if multiple airline emails need first-class lifecycle records.

Recommendation: use a transitional adapter first, then decide whether a new table is needed after reviewing implementation complexity. This keeps FBMVP-T02 smaller, avoids premature schema churn, and preserves the existing runtime-applied verification history. A later migration may still be appropriate, but it should be justified by a clean implementation need rather than by naming alone.

Avoid:

- global role/base claims
- proof-oriented status names in user-facing copy
- treating beta access as eligibility
- treating login email as eligibility unless it is also the confirmed approved airline employee email
- treating proof-based claims as airline-email verification

## 4. Relationship To Existing `verification_claims`

Existing `airline_worker` and `airline` claims may exist from earlier flows. They are historical verification claims, not automatically the forward access state.

Forward app access should be expressed as `airline_email_verified` or an equivalent helper/view result. It should not rely on role/base claims and should not issue role/base claims.

Existing claims may be mapped into `airline_email_verified` only if their provenance is unambiguously approved airline email. Safe signals may include:

- `verification_claims.verification_method = 'work_email'`
- a linked `verification_requests.method = 'work_email'`
- linked `verification_evidence.evidence_type = 'work_email'`
- work-email evidence metadata with `support_result = 'supported_domain'`
- work-email evidence metadata with an `email_domain` that still matches an active approved domain at evaluation time, if the policy requires current domain activity

If provenance is ambiguous, do not auto-upgrade. A claim issued from `redacted_badge_or_proof`, a claim with no reliable method, or a claim whose linked evidence cannot be inspected safely should remain historical until a reviewed migration or manual remediation plan says otherwise.

The forward state should not treat `airline_worker` as equivalent to `airline_email_verified` without checking source. This protects the pivot from quietly preserving proof-upload verification as the app gate.

## 5. Relationship To `approved_email_domains`

`approved_email_domains` remains central to airline-email verification.

Only active approved domains should support airline-email verification. Disabled, missing, unsupported, personal/free, malformed, or unconfigured domains must not grant eligibility.

Approved-domain management remains useful because operators need to maintain the domain allowlist, airline labels, audit trail, and disabled-domain behavior. Airline labels should be displayed only when the mapping is reviewed and safe. A label derived from an approved domain is broad affiliation context, not role/base proof.

Unsupported domains should route to safe hold or unsupported copy. The user-facing state should explain that jmpseat currently supports only configured approved airline-controlled domains and should not invite badge/document upload as a fallback.

## 6. Login Email Versus Airline Employee Email

Login email and airline employee email may be the same, but they can be distinct.

Login email is the account credential used for authentication, password reset, and account communication. Airline employee email is the eligibility credential used for general app and general baseboard access.

A personal login email alone must not grant app access. If a user changes their airline employee email, the new airline employee email must be reverified before it can restore or continue `airline_email_verified` status.

Future implementation should avoid hiding airline-email eligibility inside auth-provider identity alone. The app should be able to answer, explicitly and safely, which airline-email verification state grants eligibility.

## 7. Private Testing Versus Launch Modes

The airline-email state participates differently by rollout mode:

- `private_testing`: requires login, required profile/onboarding fields, active beta access, and `airline_email_verified`.
- `first_base_launch`: requires login, required profile/onboarding fields, and `airline_email_verified` for the launched population. Normal launched-population users should not need one-by-one beta grants.
- `broader_launch`: requires login, required profile/onboarding fields, and `airline_email_verified` broadly. Beta should be removed from the general access gate except for internal tests or unreleased features.

This design does not implement the mode switch. FBMVP-T03 should implement the explicit launch-mode gate after FBMVP-T02 creates a reliable `airline_email_verified` state.

## 8. User Experience Implications

Future user experience should move toward:

- signup/onboarding asks for airline employee email or starts airline-email verification at the right step
- users confirm control of the airline employee email
- access-hold explains unsupported, unconfirmed, pending, expired, or revoked airline email
- `/app/verification` becomes an airline-email status or account eligibility page
- no proof upload, badge upload, employment document upload, screenshot upload, or proof-review fallback
- restricted-board screens explain community-admin approval separately from general app eligibility

Copy should avoid proof-era language such as "worker proof," "badge review," or "redacted proof" for forward access. It should say airline-email verification is broad eligibility only and is not official airline or employer verification.

## 9. Security / Privacy Boundaries

The forward state must preserve these boundaries:

- no badge upload
- no proof upload
- no employer-system lookup
- no AI/OCR approval
- no official airline endorsement
- no role/base global claim issuance
- no community-admin access to airline employee email by default
- no broad exposure of full airline employee email
- no proof data, storage paths, filenames, signed URLs, public URLs, tokens, sessions, or service-role behavior in user-facing flows

Community admins may later see minimal eligibility context if a reviewed board-access design allows it, such as `airline_email_verified`, approved-domain-derived airline label, or domain-level status. They should not see full airline employee email by default.

## 10. Implementation Recommendation

Likely later implementation steps:

- Add a shared-core helper such as `getCurrentAirlineEmailAccessState`.
- Normalize existing work-email request/evidence/claim data into a forward state with `pending`, `verified`, `expired`, `revoked`, and `unsupported_domain`.
- Derive `verified` only from approved-domain-backed work-email provenance.
- Keep the current private-app gate unchanged until FBMVP-T03.
- Later update the private app gate to consume the new helper by rollout mode.
- Update `/app/verification` copy and status rendering around airline-email eligibility.
- Add tests for supported, pending, unsupported, expired, revoked, disabled-domain, and distinct-login-email states.
- Add tests proving proof-based claims do not satisfy `airline_email_verified`.
- Add security events for airline-email verification lifecycle if existing verification events are not sufficient.
- Runtime validate with a test approved domain after implementation and review.
- Keep proof infrastructure frozen and preserved.

Implementation should be `shared-core` or `mobile-ready` wherever practical because future web and mobile clients will need the same access-state semantics.

## 11. Migration Posture

No migration is created in this docs task.

Later implementation may need a migration if the existing schema cannot represent the clean state safely. If a migration is needed, it should be narrow and reviewed.

Migration rules:

- do not mutate proof rows as part of airline-email access-state implementation
- do not drop old verification tables
- do not drop proof tables, proof storage, proof cleanup helpers, or proof runtime docs
- do not auto-upgrade ambiguous proof-based claims
- preserve audit history
- keep full airline employee email private
- keep approved-domain status and domain normalization explicit

Possible future schema options include a new `airline_email_verifications` table, a new `airline_email_verified` claim type, or a database view over existing work-email request/evidence/claim data. The first implementation should prefer the smallest reliable shape that can answer the access-gate question without expanding proof systems.

## 12. Non-Goals

This task does not include:

- code changes
- database migrations
- launch-gate switch
- beta-gate removal
- baseboard implementation
- board membership implementation
- posting, replies, moderation, or community-admin tooling
- proof system removal
- proof upload
- role/base verification
- production deployment

## 13. Open Questions

- Should `airline_email_verified` eventually be a new claim type or a new table?
- Should existing email-based `airline_worker` claims map into it?
- How do we distinguish email-based claims from proof-based claims if needed?
- How often should airline employee email verification expire?
- Should users be able to verify multiple airline emails?
- What happens if the approved domain is later disabled?
- What airline label should users see?
- Should users be able to keep app access if airline email expires but board memberships remain?
- Should airline-email verification be required before profile completion or after?
- Should disabled domains revoke access immediately or begin a grace period?
- Should the app store full airline employee email separately, hash it, avoid storing it, or rely on confirmation events only?
- What user-facing copy appears when an airline email is pending confirmation?

## 14. Source-Of-Truth Statement

This design defines the forward airline-email access state for jmpseat.

It builds on the product pivot, airline-email access gate, launch-readiness gate transition, proof-system freeze plan, and FBMVP-T01 proof-surface freeze.

It does not implement the gate, change beta behavior, create migrations, or remove proof infrastructure.

Future implementation should follow this design unless it is superseded by a reviewed decision document.
