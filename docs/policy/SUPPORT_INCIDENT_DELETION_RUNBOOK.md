# Support / Incident / Deletion Runbook

Status: draft operations runbook

Last updated: 2026-06-14

This runbook is a draft for private-beta operations. It is not legal advice and
does not implement any support, deletion, export, or incident tooling.

## Contact Categories

Draft support categories:

- account access
- beta invite/access
- work-email verification
- manual verification
- privacy question
- deletion/export request
- moderation appeal
- report follow-up
- safety/security incident
- bug report
- product feedback

Draft/manual contact paths:

- General support: `support@jmpseat.com` once configured
- Privacy/deletion/export: `privacy@jmpseat.com` once configured
- Privacy/deletion/export fallback if a separate privacy inbox is unavailable:
  route through `support@jmpseat.com` with subject prefix `[Privacy Request]`,
  `[Deletion Request]`, or `[Export Request]`
- Moderation appeal: `support@jmpseat.com` with subject prefix
  `[Moderation Appeal]`
- Safety/security escalation: `[owner/address pending]`

There is no in-app support, deletion/export, or appeal backend in the current
product.

## Intake Rules

For each request, record:

- date/time received
- contact channel
- requester email or account if known
- category
- short summary
- priority
- owner
- status
- next action

Do not request or store unnecessary sensitive information.

Do not ask users to send:

- passenger information
- schedules
- schedule screenshots
- portal credentials
- employee numbers
- full IDs or passports
- confidential company documents
- exact crew hotel information
- airport/security-sensitive procedures
- live operations-sensitive information

## Privacy Requests

Privacy requests may include:

- data question
- correction request
- deletion request
- export/access request
- concern about verification or reports
- concern about public/private identity separation

Draft handling:

1. Acknowledge receipt.
2. Verify the requester before disclosing or changing account data.
3. Identify data categories involved.
4. Determine whether data can be deleted/exported or must be retained in limited
   form for safety, security, audit, legal, or abuse-prevention reasons.
5. Record decision and owner.
6. Respond with safe, plain-language status.

Legal/privacy review is required for final response language and timing.

## Account Deletion Requests

Draft/manual process, implementation pending:

1. Confirm the requester controls the account.
2. Pause any active public/community exposure if needed.
3. Inventory account, profile, posts, reports, moderation records, verification
   metadata, support records, and audit records.
4. Delete or de-identify data that can be removed.
5. Preserve limited records only where needed for safety, security, legal,
   abuse-prevention, or audit reasons.
6. Avoid exposing reporter identity or other users' data in the response.
7. Record completion.

Open decision: exact deletion scope and retention periods need legal/privacy
review.

## Export Requests

Draft/manual process, implementation pending:

1. Confirm the requester controls the account.
2. Gather exportable data about the requester.
3. Exclude other users' private data, reporter identities, author user IDs,
   internal operator notes, security-sensitive data, signed URLs, storage paths,
   and proof artifacts unless legally required and reviewed.
4. Provide export through a secure reviewed channel.
5. Record completion.

Open decision: export format and completion target need founder/legal review.

## Verification Issues

Handle:

- work-email verification confusion
- employer email privacy concerns
- manual review questions
- rejected/denied verification
- correction requests
- proof-upload confusion

Rules:

- Explain that proof uploads are not active unless a future scope reactivates
  them.
- Do not ask for schedules, passenger data, portal screenshots, employee
  numbers, confidential documents, or exact crew hotel information.
- Do not use AI for final verification decisions.
- Keep verification artifacts private if any future proof flow is reactivated.

## Moderation Appeals

Appeals should be handled through the manual process in
`docs/policy/MODERATION_AND_APPEALS_RUNBOOK.md`.

Use `support@jmpseat.com` once configured with the subject prefix
`[Moderation Appeal]`. Do not promise instant review, guaranteed restoration,
or automatic appeal approval.

Do not reveal reporter identity, author user ID, private account data,
verification data, or unrelated moderator notes.

## Safety / Security Incidents

Treat these as high priority:

- passenger private information exposure
- exact crew hotel exposure
- airport/security-sensitive procedures
- live operations-sensitive information
- credible threat
- doxxing
- account compromise
- operator/admin access issue
- proof or verification artifact exposure
- signed URL or private storage exposure
- token/secret exposure

Draft response:

1. Control visible exposure first where possible.
2. Preserve minimal necessary evidence.
3. Assign owner and backup.
4. Determine whether legal/security/privacy review is needed.
5. Record timeline and actions.
6. Notify affected users where appropriate and reviewed.
7. Complete post-incident notes.

## Escalation Owner Placeholders

- Primary incident owner: `[founder/policy owner pending]`
- Backup incident owner: `[backup pending]`
- Security reviewer: `[reviewer pending]`
- Legal/privacy reviewer: `[reviewer pending]`

These must be filled before broader private-beta use.

## Response Time Placeholders

These require founder approval:

- P0 safety/security/privacy exposure: same day
- P1 high-risk support/moderation/verification issue: 24 hours during active
  beta coverage
- Routine support: 2 business days
- Deletion/export acknowledgement: 7 days
- Deletion/export completion: pending legal/privacy review
- Appeal acknowledgement: 3 business days

## What To Log

Log:

- request category
- requester/account identifier if verified
- target content route or object if relevant
- owner
- priority
- action taken
- reason
- timestamp
- follow-up date

## What Not To Collect

Do not collect unnecessary:

- passenger details
- schedules or portal screenshots
- employee numbers
- exact crew hotels
- live location
- security procedures
- confidential employer documents
- proof artifacts
- government IDs
- private messages from unrelated third parties

## Data Minimization

Use the minimum information needed to solve the issue.

If sensitive information is accidentally received, do not copy it into docs or
summaries. Redact or delete according to the approved retention process.

## Review Note

This runbook must be reviewed by founder/legal/policy owner before broader
private-beta use.
