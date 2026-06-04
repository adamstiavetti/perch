# Epoch 03 Auth Route Account State Map

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

Product principle: Utility first. Community second. Social feed last.

Identity principle: Verified privately. Anonymous publicly. Accountable internally.

## 1. Purpose

`E03-T02` defines the planned auth routes, auth surfaces, account states, and private-app access behavior before implementation begins.

This document exists to remove ambiguity before `E03-T03` starts auth foundation work.

This is planning only. It does not implement auth, database schema, Supabase configuration, route handlers, or UI.

## 2. Route Inventory For Web MVP

The web MVP needs a small set of explicit auth and access routes. Route behavior is a web delivery concern, but the underlying account, beta-access, and verification states remain shared-core or mobile-ready concepts.

| Route | Purpose | Who can access | Redirect behavior | Associated states | Epoch | Client scope |
| --- | --- | --- | --- | --- | --- | --- |
| `/login` | Sign-in surface for existing app accounts. | Signed-out users. Signed-in users may hit it but should be redirected away. | Signed-in users should be redirected to the highest-priority post-auth destination: `/app`, `/app/profile`, or `/app/access-hold` based on state. | `unauthenticated`, `authenticated_*` | E03 | `web-only` route, `mobile-ready` state logic |
| `/signup` | Account creation surface for allowed beta entrants. | Signed-out users. | Signed-in users should be redirected away to the correct post-auth destination. Sign-up success should send users into callback/email-confirmation flow. | `unauthenticated`, `authenticated_unconfirmed` | E03 | `web-only` route, `mobile-ready` state logic |
| `/auth/callback` | Auth-provider callback handoff for email confirmation, sign-in completion, password-recovery completion, and future magic-link flow if approved. | Provider-return traffic only. Not a general navigation destination. | Should resolve auth result server-side, then redirect to `/app`, `/app/profile`, `/app/access-hold`, `/reset-password`, or `/login` with an error state. | `authenticated_unconfirmed`, `authenticated_profile_incomplete`, `authenticated_profile_complete`, `beta_*`, `suspended`, `disabled` | E03 | `web-only` route, `mobile-ready` flow requirements |
| `/reset-password` | Password reset entry and completion surface. | Signed-out users from reset email and signed-in users if allowed later. | Start state: request reset email. Completion state after callback should allow password update, then redirect to `/login` or directly into post-auth resolution depending on provider behavior. | `unauthenticated`, `authenticated_*` | E03 | `web-only` route, `mobile-ready` flow requirements |
| `/app` | Private app entry route and primary access gate. | Authenticated users only after server-side access checks. | Signed-out users go to `/login`. Profile-incomplete users go to `/app/profile`. Beta-inactive users go to `/app/access-hold`. Suspended/disabled users go to `/app/access-restricted`. Beta-active + profile-complete users continue into the private app shell. | All auth/account/beta states | E03 | `web-only` route, `shared-core` access rules |
| `/app/profile` | Profile onboarding and completion surface. | Authenticated users only. | Signed-out users go to `/login`. Profile-complete + beta-active users may be redirected to `/app`. Suspended/disabled users go to `/app/access-restricted`. | `authenticated_unconfirmed`, `authenticated_profile_incomplete`, `authenticated_profile_complete`, `beta_*` | E03 | `web-only` route, `shared-core` profile state |
| `/app/access-hold` | User-facing hold state for signed-in users who are not yet beta-approved. | Authenticated users without active beta access. | Signed-out users go to `/login`. Beta-active users should be redirected to `/app` or `/app/profile` depending on profile completion. Suspended/disabled users go to `/app/access-restricted`. | `beta_none`, `beta_waitlisted`, `beta_invited`, `beta_denied`, `beta_revoked` | E03 | `web-only` route, `shared-core` beta-access logic |
| `/app/access-restricted` | Controlled restricted-access screen for suspended or disabled accounts. | Authenticated restricted users only. | Non-restricted users should be redirected to their normal post-auth destination. Signed-out users go to `/login`. | `suspended`, `disabled` | E03 | `web-only` route, `shared-core` restriction state |
| `/app/verification` | Reserved future aviation-worker verification surface. | Authenticated users only when later verification work begins. | In E03 it may remain placeholder-only or unavailable. It must not imply that aviation-worker verification is completed during auth. | Future verification states | Later epoch | `web-only` route, `shared-core` future verification state |

### Route design notes

- Route names like `/login` and `/signup` are acceptable public web aliases even if implementation later nests some provider-specific handling under `/auth/*`.
- `/auth/callback` is required because Supabase-style provider flows need a stable return surface for email confirmation, auth completion, and password recovery handoffs.
- `/app` must remain the single user-facing private entry point even if child routes exist later.

## 3. Public Waitlist Vs App Account

These concepts must remain separate:

- Public waitlist email capture is not an app account.
- Joining the waitlist does not create auth identity.
- Waitlist membership does not equal beta approval.
- App sign-up and sign-in belong to the Epoch 03 auth flow.
- Beta access must be modeled separately from the marketing waitlist.

Recommended conceptual flow:

1. A person joins the external waitlist from the public marketing site.
2. Founder/admin reviews waitlist interest outside the app.
3. Founder/admin creates or records beta invite/access intent separately.
4. The invited person signs up for an app account through Epoch 03 auth routes.
5. The app account is checked against beta-access state before `/app` is opened.

## 4. Account State Model

Account state is distinct from beta-access state and from aviation-worker verification state.

### Account states

#### `unauthenticated`

- Meaning: no valid authenticated app session exists.
- Source of truth: auth provider session state plus server-side session resolution.
- Allowed routes: `/`, `/login`, `/signup`, `/reset-password`.
- Blocked routes: `/app`, `/app/profile`, `/app/access-hold`, `/app/access-restricted`, `/app/verification`.
- Default redirect: `/login` when private routes are requested.
- User-facing screen: standard sign-in or sign-up entry.
- Epoch: E03.

#### `authenticated_unconfirmed`

- Meaning: account exists and user is signed in or partially signed in, but email confirmation is still required if that flow is enabled by provider settings.
- Source of truth: auth provider email-confirmation state plus app account linkage.
- Allowed routes: `/auth/callback`, `/app/profile` if later allowed, limited `/app/access-hold` style messaging, `/reset-password`.
- Blocked routes: private app shell content under `/app`.
- Default redirect: confirmation-resolution flow, usually via `/auth/callback`, then to the next allowed screen.
- User-facing screen: confirm your email / finish account confirmation.
- Epoch: E03.

#### `authenticated_profile_incomplete`

- Meaning: user has a valid account/session but has not completed the minimum required profile fields for private beta entry.
- Source of truth: app account/profile record, not provider metadata alone.
- Allowed routes: `/app/profile`, `/app/access-hold`, `/reset-password`.
- Blocked routes: full private app content at `/app`.
- Default redirect: `/app/profile`.
- User-facing screen: complete your profile before entering the private beta.
- Epoch: E03.

#### `authenticated_profile_complete`

- Meaning: user has completed the minimum required profile information for Epoch 03.
- Source of truth: app account/profile record.
- Allowed routes: `/app`, `/app/profile`, `/app/access-hold`, `/app/verification` later.
- Blocked routes: none by account state alone, but beta-access and restriction rules still apply.
- Default redirect: depends on beta-access state.
- User-facing screen: depends on beta-access state.
- Epoch: E03.

#### `authenticated_beta_active`

- Meaning: user is authenticated, profile-complete, and has active beta approval.
- Source of truth: combined server-side evaluation of auth state, profile state, and beta-access state.
- Allowed routes: `/app`, `/app/profile`, `/app/verification` later.
- Blocked routes: `/login`, `/signup` should redirect away.
- Default redirect: `/app`.
- User-facing screen: private app entry.
- Epoch: E03.

#### `suspended`

- Meaning: access is temporarily or operationally blocked.
- Source of truth: app account restriction state and later trust/admin controls.
- Allowed routes: `/app/access-restricted`, possibly `/login` for controlled messaging.
- Blocked routes: `/app` and all private content surfaces.
- Default redirect: `/app/access-restricted`.
- User-facing screen: restricted access notice with support/contact guidance if appropriate.
- Epoch: E03 for the gate behavior; later epochs may expand admin causes and workflows.

#### `disabled`

- Meaning: account is unavailable because of admin, security, or account-state action.
- Source of truth: app account status and later admin controls.
- Allowed routes: `/app/access-restricted`, possibly `/login` for controlled messaging.
- Blocked routes: all private app content.
- Default redirect: `/app/access-restricted`.
- User-facing screen: account unavailable notice with minimal safe explanation.
- Epoch: E03 for the gate behavior; later epochs may expand admin workflows.

### Later verification and role states

These are intentionally separate and not part of the E03 auth gate itself.

#### Future verification states

- `verification_pending`
- `verification_approved`
- `verification_rejected`

Meaning:

- these states describe aviation-worker verification, not login or beta approval

Source of truth:

- future verification entity/workflow

Epoch:

- later epoch, not implemented in E03

#### Future privileged-role states

- `moderator`
- `admin`

Meaning:

- privileged access roles for later moderation and administration

Source of truth:

- explicit app role/permission model

Epoch:

- later or limited E03 foundation only if needed for beta invite handling, but not as a full admin product workflow

## 5. Beta Access State Model

Beta-access state remains separate from auth/account.

### `beta_none`

- Meaning: no beta-access record exists for this account.
- Source of truth: app beta-access entity or absence of one.
- Private `/app` behavior: redirect to `/app/access-hold`.
- Admin action needed: founder/admin must create or approve a beta-access record before entry is allowed.
- User-facing copy guidance: you have an account, but private beta access is not active yet.
- Epoch: E03.

### `beta_waitlisted`

- Meaning: external interest is known, but no active app beta approval exists yet.
- Source of truth: conceptual linkage between waitlist review and beta-access model, not the waitlist itself as the security boundary.
- Private `/app` behavior: redirect to `/app/access-hold`.
- Admin action needed: invite or approve user explicitly.
- User-facing copy guidance: interest received, access not yet granted.
- Epoch: E03 if represented in the app model; the public waitlist itself remains external.

### `beta_invited`

- Meaning: user has been invited or pre-approved to proceed through account creation, but access is not yet fully active until account linking and required entry steps are complete.
- Source of truth: beta-access or invite record.
- Private `/app` behavior: if account creation/profile completion is unfinished, redirect to `/signup`, `/auth/callback`, or `/app/profile` as appropriate.
- Admin action needed: invite creation already happened; activation may still depend on user action.
- User-facing copy guidance: your invitation is active, finish account setup to continue.
- Epoch: E03.

### `beta_active`

- Meaning: user is approved for private beta entry.
- Source of truth: beta-access record.
- Private `/app` behavior: allow entry once account and profile requirements also pass.
- Admin action needed: none for routine access after activation.
- User-facing copy guidance: access granted.
- Epoch: E03.

### `beta_denied`

- Meaning: user will not be admitted through the current beta path.
- Source of truth: beta-access record or admin decision state.
- Private `/app` behavior: redirect to `/app/access-hold`.
- Admin action needed: explicit deny decision already recorded.
- User-facing copy guidance: access is not available at this time, with neutral copy that does not expose internal criteria.
- Epoch: E03 if needed; otherwise may remain a conceptual decision state until a later admin workflow exists.

### `beta_revoked`

- Meaning: previously granted access has been removed.
- Source of truth: beta-access record.
- Private `/app` behavior: redirect to `/app/access-restricted` or `/app/access-hold` depending on whether the removal is punitive or operational.
- Admin action needed: explicit revoke action.
- User-facing copy guidance: beta access is no longer active.
- Epoch: E03 gate behavior, fuller admin operations later.

### `beta_paused`

- Meaning: access is temporarily paused.
- Source of truth: beta-access record.
- Private `/app` behavior: redirect to `/app/access-hold` or `/app/access-restricted` depending on reason.
- Admin action needed: explicit pause and later unpause action.
- User-facing copy guidance: beta access is temporarily unavailable.
- Epoch: E03 gate behavior, fuller admin operations later.

## 6. Route Behavior Matrix

| Scenario | Expected behavior |
| --- | --- |
| Signed out visiting `/app` | Do not render private content. Redirect to `/login` or provider-approved sign-in entry. |
| Signed out visiting `/login` | Show sign-in surface. |
| Signed out visiting `/signup` | Show sign-up surface if allowed by the approved signup model. |
| Signed in with incomplete profile visiting `/app` | Do not render private app shell. Redirect to `/app/profile`. |
| Signed in but not beta-approved visiting `/app` | Do not render private app shell. Redirect to `/app/access-hold`. |
| Signed in and beta-approved visiting `/app` | Allow entry to the private app shell if profile is complete and account is not restricted. |
| Suspended or disabled user visiting `/app` | Do not render private content. Redirect to `/app/access-restricted`. |
| User returning from email confirmation through `/auth/callback` | Resolve auth session and email confirmation, then redirect based on account/profile/beta state: `/app/profile`, `/app/access-hold`, or `/app`. |
| User completing password reset flow | Land on `/reset-password` completion state or equivalent callback flow, update password, then redirect to `/login` or post-auth destination depending on provider/session behavior. |

## 7. Redirect And Callback Strategy

### Successful login

Successful login should not always go directly to `/app`.

Post-login routing order should be:

1. `suspended` or `disabled` -> `/app/access-restricted`
2. `authenticated_profile_incomplete` -> `/app/profile`
3. no active beta access -> `/app/access-hold`
4. active beta access + complete profile -> `/app`

### Successful signup

Successful signup should go through the provider-required confirmation path first.

Likely flow:

1. user submits sign-up
2. provider handles email confirmation requirement
3. provider returns to `/auth/callback`
4. callback resolves next route based on state

### Auth callback behavior

`/auth/callback` should be the central route-resolution handoff for:

- sign-in completion
- email confirmation
- password-recovery callback completion
- future magic-link flow if approved later

The callback must:

- resolve provider result server-side
- resolve app account/profile state
- resolve beta-access state
- redirect to the next safe route
- send failures to `/login` or `/reset-password` with generic error messaging

### Password reset flow

Planned flow:

1. user starts reset from `/reset-password`
2. provider sends reset email
3. provider returns user through callback or equivalent recovery flow
4. user sets a new password on the reset completion surface
5. user is redirected to `/login` or a post-auth destination depending on final provider behavior

### Error handling

Errors should:

- use generic auth-safe messaging
- avoid exposing internal provider details, invite logic, or private account data
- preserve enough context for retry guidance

### Preview and production URL requirements

Later configuration work must inventory:

- preview callback URL(s)
- production callback URL(s)
- email confirmation URL(s)
- password reset URL(s)
- allowed auth origin(s)

This document defines the route requirements only. It does not configure provider redirects.

### Future mobile compatibility

Future native mobile work must preserve:

- deep-link capable callback design
- password recovery compatibility
- email confirmation compatibility
- shared post-auth state resolution based on backend/account/beta rules rather than web-only assumptions

## 8. Profile Onboarding Route And State

Profile completion is an app account concern, not a verification concern.

Conceptually, profile completion means the user has supplied the minimum information needed for private beta entry and later routing.

Likely minimum profile fields to resolve later:

- public handle
- airline or employer context
- role
- base

Current rule:

- exact minimum fields are not locked by this document
- E03-T04 should finalize the minimum set before implementation

Behavior requirements:

- incomplete profile blocks or limits private app entry
- incomplete profile redirects users to `/app/profile`
- profile completion remains separate from aviation-worker verification
- role/base/airline fields may belong to E03 if needed for entry and later routing, but they do not create verification status by themselves

## 9. Verification Boundary

These boundaries must remain explicit:

- aviation-worker verification is not auth
- email confirmation is not airline-worker verification
- beta approval is not airline-worker verification
- verification workflow belongs to a later epoch unless a later ticket explicitly expands scope
- `/app/verification` may remain a placeholder or planned route surface during E03

Users must not be told or shown that they are "verified airline workers" simply because they completed sign-up, confirmed an email, or received beta approval.

## 10. Mobile-Readiness

### Web-specific routes

These routes are web delivery surfaces:

- `/login`
- `/signup`
- `/auth/callback`
- `/reset-password`
- `/app`
- `/app/profile`
- `/app/access-hold`
- `/app/access-restricted`
- `/app/verification`

### Shared-core or mobile-ready states

These states must be reusable by future mobile:

- auth/account session status
- email-confirmed status
- profile completeness
- beta-access state
- restriction state
- future verification state

### Why route decisions cannot be the source of truth

- web routes are UX surfaces
- account/beta/verification/restriction decisions must be enforced by server-side and database-side rules
- future native mobile must evaluate the same rules without depending on Next.js route logic

### Future mobile implications to revisit later

- deep-link callback handling
- password reset completion flow
- email confirmation flow
- mobile session persistence
- any future invite acceptance links

Client impact classification for this route/state map: `mobile-ready`.

## 11. Scalability And Security Notes

- No client-only route gates.
- Private content must never be fetched before authorization is confirmed.
- Future admin and beta queues must be paginated and filterable.
- Account, beta, and security states should be auditable where relevant.
- No secrets may be exposed to browser or future mobile clients.
- Route behavior must be testable through explicit access-control and redirect scenarios.
- `/app` access checks should be deterministic and composable so they can be reused across child routes later.

## 12. Open Decisions Carried Into E03-T03, E03-T04, And E03-T05

The following remain unresolved and must be carried forward explicitly:

1. Email/password only vs email/password plus magic link.
2. Exact preview and production redirect URL inventory.
3. Whether sign-up is open-but-held or invite-constrained.
4. Exact minimum required profile fields.
5. Exact admin mechanism for invite creation and beta approval.
6. Security-event retention window.

## 13. Impact On Next Tickets

### E03-T03 - Auth Foundation

This document defines:

- required public auth routes
- callback/reset route expectations
- state-driven redirects

### E03-T04 - Account And Profile Foundation

This document defines:

- profile-incomplete vs profile-complete behavior
- separation between auth identity and app profile
- minimum routing consequences of incomplete profile

### E03-T05 - Invite And Beta Access Model

This document defines:

- explicit beta-access states
- separation between waitlist, account, and beta approval
- hold-state behavior for non-approved users

### E03-T06 - Private-App Access Gates

This document defines:

- `/app` gate behavior
- signed-out, incomplete-profile, non-approved, approved, and restricted outcomes

### E03-T07 - Authorization Baseline And Security Events

This document defines:

- requirement for server-side and database-side enforcement
- testable route/access scenarios
- minimum auditability expectations for access-denied and account-state transitions

## 14. Status

`E03-T02` result: complete for planning.

Outcome:

- planned web auth routes and private entry behavior are defined
- account, beta-access, and verification state boundaries are separated
- redirect and callback expectations are defined strongly enough to unblock later Epoch 03 implementation work
