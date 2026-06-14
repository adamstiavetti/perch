# Moderation And Appeals Runbook

Status: draft operator/founder runbook

Last updated: 2026-06-14

This runbook is a draft for private-beta operations. It is not legal advice and
is not a final enforcement policy. Founder/legal/policy review is required
before broader launch or broader private-beta use.

## Current Product Scope

Current implemented and smoked moderation foundation:

- DFW Channel post reporting
- duplicate-safe report state
- operator-scoped DFW Channel report review
- narrow hide/remove post actions

Out of current T26E-A scope:

- DFW Channel comments/replies
- account bans
- AI final moderation decisions
- public moderation feed
- public report counts
- Request a Channel workflow
- NonRev Deals
- marketplace/payments

## Report Intake

Reports may arrive through:

- in-app DFW Channel post report flow
- support email
- privacy email
- founder/operator observation
- external report from a trusted beta participant

Record:

- intake source
- date/time received
- reporter contact if provided outside app
- reported content route or identifier
- report category
- short summary
- immediate exposure risk
- operator assigned

Do not copy unnecessary sensitive details into working notes.

## Triage Categories

Use these categories for private beta:

- `privacy`: passenger information, reporter/author identity exposure,
  doxxing, exact crew hotel exposure, private user information
- `safety_sensitive`: airport/security-sensitive procedures, live operations,
  live crew movement, safety-rule evasion
- `harassment`: threats, targeted abuse, hate, sexualized targeting,
  retaliation
- `spam`: scams, vendor spam, phishing, abusive automation
- `confidential`: employer-confidential documents, manuals, portal screenshots,
  internal memos, non-public company information
- `off_topic`: content that does not belong in the channel but is not urgent
- `other`: needs operator judgment

## Priority Levels

P0 emergency:

- credible threat or immediate safety concern
- passenger private information exposure
- airport/security-sensitive procedure exposure
- live operations-sensitive information
- exact crew hotel exposure tied to identifiable operational context
- account compromise or operator-access issue

Draft response target: same day, with immediate hide/remove if exposure risk is
clear.

P1 high:

- harassment or doxxing
- confidential company document exposure
- repeated spam/scam behavior
- verification/privacy issue affecting a user

Draft response target: within 24 hours during active beta coverage.

P2 routine:

- off-topic content
- low-risk duplicate/spam report
- unclear rule concern
- minor community conduct issue

Draft response target: within 2 business days during beta, unless founder sets a
stricter target.

## Hide / Remove Guidance

Hide or remove immediately when content appears to expose:

- passenger private information
- exact crew hotel details
- airport/security-sensitive procedures
- live operations-sensitive information
- doxxing or private identity details
- threats or severe harassment
- confidential company documents
- phishing, malware, or scams

Use the least destructive action that controls exposure, but do not leave
high-risk content visible while waiting for perfect certainty.

## When To Escalate

Escalate to founder/security/legal owner when:

- content may involve passenger privacy
- content may involve airport/security-sensitive procedures
- content may reveal exact crew hotels or live crew movement
- content may involve a credible threat or safety risk
- content may involve legal process or law enforcement request
- content involves an operator/admin account
- content involves verification artifacts or private identity exposure
- a user disputes moderation in a way that raises safety or legal concerns

Owner placeholders:

- Primary safety/privacy owner: `[founder/policy owner pending]`
- Backup owner: `[backup pending]`
- Legal/privacy reviewer: `[reviewer pending]`

## User Contact

Contact a user when:

- a policy violation is not obvious but needs clarification
- content is removed and notification is safe
- verification/account access needs explanation
- the user asks for appeal or correction

Do not contact a user if doing so may worsen a safety issue, reveal a reporter,
expose private information, or compromise an investigation.

## Appeals

Appeals are manual during private beta until a formal flow is implemented.

Draft intake:

- support path: `support@jmpseat.com`
- privacy/deletion path: `privacy@jmpseat.com`
- appeal owner: `[owner pending]`

Appeal review steps:

1. Confirm the requester owns the affected account or content.
2. Review the original content/action and report context.
3. Avoid exposing reporter identity.
4. If possible, have a different operator/founder review the appeal.
5. Decide: uphold, modify, restore, or request more information.
6. Record decision, reason, reviewer, and timestamp.
7. Notify the requester where safe.

Do not restore content that exposes passengers, exact crew hotels,
airport/security-sensitive procedures, live operations-sensitive information,
doxxing, threats, or confidential company information.

## AI And Final Decisions

AI may not issue final moderation decisions, final bans, account restrictions,
verification decisions, or appeal outcomes.

Human/admin review is required for high-impact outcomes.

## Evidence Preservation Without Over-Retention

Preserve only what is needed:

- content route or identifier
- report category
- short excerpt if needed
- action taken
- operator/reviewer
- timestamp
- reason

Avoid storing:

- full passenger data
- unnecessary screenshots
- proof artifacts unless required
- full private identity details
- storage paths or signed URLs
- unrelated sensitive workplace details

If a high-risk item must be preserved, mark owner, purpose, access limit, and
review/delete date.

## Reporter Privacy

Reporter identity is not public.

Do not reveal reporter identity to authors, ordinary users, ambassadors, or
unrelated operators.

Report counts should not be shown publicly in the current product.

## Author Privacy

Do not expose author user IDs, work emails, private verification details,
internal IDs, proof data, or private profile fields outside authorized operator
review.

Use safe author labels where the product already does so.

## Audit Expectations

Operator moderation actions should create or preserve auditable records:

- action requested
- action applied or denied
- operator account
- reason
- target content
- timestamp

Audit records should avoid overexposing sensitive content.

## Draft SLA Placeholders

These require founder approval:

- P0 emergency: same day / immediate visible exposure control
- P1 high: within 24 hours during active beta coverage
- P2 routine: within 2 business days
- Appeals: initial response within 3 business days
- Deletion/export requests: acknowledge within 7 days, completion target pending
  legal/privacy review

## Review Note

This runbook must be reviewed by founder/legal/policy owner before broader
private-beta use.
