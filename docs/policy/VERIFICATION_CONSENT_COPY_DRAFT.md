# Verification Consent Copy Draft

Status: draft product copy for founder/legal review

Last updated: 2026-06-14

This file contains reusable copy blocks for private-beta verification surfaces.
It is not legal advice and is not wired into the app. Founder/legal review is
required before broader launch or broader private-beta use.

## Shared Verification Principle

jmpseat uses verification to keep private beta useful for aviation workers.

Verification is private to jmpseat operations. Public community display should
not expose your full work email, proof artifacts, private identity fields, or
reviewer notes.

jmpseat is independent and is not affiliated with, sponsored by, endorsed by, or
officially connected to any airline, airport, union, or employer.

## Work-Email Verification Copy

Suggested heading:

> Verify with a work email

Suggested body:

> jmpseat may use your aviation work-email domain to help confirm eligibility
> for the private beta. Your full work email should not be shown publicly in
> community surfaces.

Employer email caveat:

> Work email is not the same as private personal email. Your employer's email
> systems may log, retain, scan, or review email activity according to employer
> policy. jmpseat cannot control employer email logs or monitoring.

Consent checkbox draft:

> I understand that jmpseat may use my work-email domain and verification result
> to decide private-beta access, and that employer-managed email systems may
> keep their own logs.

No-affiliation note:

> Work-email verification does not mean your airline, airport, union, or
> employer sponsors, endorses, or administers jmpseat.

## Non-Upload Manual Verification Copy

Suggested body:

> If work-email verification is not a good fit, jmpseat may offer manual
> verification during private beta. Manual review should use the least amount of
> information needed to confirm eligibility.

Examples of non-upload review:

- founder/admin-known verification
- work email plus limited manual context
- live call review
- non-stored visual confirmation

Consent checkbox draft:

> I understand that manual review may involve an authorized reviewer seeing
> limited information I provide for eligibility review, and that jmpseat should
> keep only the minimum verification metadata needed after review.

## Redacted Proof Upload Copy

Status: future/reactivation-ready only. Proof uploads are not part of the
current active private-beta path.

Suggested heading:

> Upload redacted proof

Suggested body:

> This option is only available if jmpseat has reactivated proof uploads after
> privacy/security review. Upload only redacted proof that jmpseat has requested.
> Do not upload passports, government IDs, schedules, passenger information,
> portal screenshots, employee numbers, confidential company documents, or
> anything unrelated to eligibility review.

Redaction acknowledgement:

> I confirm that I have redacted unnecessary sensitive information before
> upload, including employee numbers, passenger data, schedules, portal details,
> exact trip details, and confidential company information.

Reviewer visibility:

> Authorized reviewers may see the uploaded proof only for verification review,
> safety/fraud review, or required support/security handling. Ambassadors and
> ordinary users should not see proof artifacts.

Retention/deletion:

> jmpseat should delete raw proof artifacts after review unless a documented
> safety/fraud reason requires temporary retention. jmpseat may retain limited
> verification metadata such as method, result, reviewer, timestamp, and
> redaction confirmation.

No public exposure:

> Proof artifacts, storage paths, signed URLs, and private verification details
> should not be publicly visible.

No AI final decision:

> AI does not approve or reject verification. Verification decisions require
> human/admin review.

## Verification Outcome Copy

Approved:

> Verification complete. You can continue into the private beta where your
> access allows.

Pending:

> Verification is pending review. We will update access when review is complete.

More information needed:

> We need a little more information before completing verification. Do not send
> schedules, passenger information, portal screenshots, employee numbers,
> confidential documents, or exact crew hotel information.

Rejected or not eligible:

> We could not approve verification from the information provided. You may
> contact support if you think this was a mistake.

## Verification Support Copy

Suggested support line:

> Questions about verification can be sent to the private-beta support path.
> Draft placeholder: `support@jmpseat.com`.

Suggested privacy line:

> Privacy questions or deletion/export requests can be sent to the privacy path.
> Draft placeholder: `privacy@jmpseat.com`.

## Implementation Note

These copy blocks are not wired into onboarding, verification, email flows, or
policy acceptance. Wiring requires a separate implementation task and browser
smoke after deployment.
