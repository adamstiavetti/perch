# Privacy Notice Draft

Status: draft copy for founder/legal review

Last updated: 2026-06-14

This draft is practical private-beta privacy copy for jmpseat. It is not legal
advice and is not a final Privacy Policy. Founder/legal review is required
before broader launch or broader private-beta use.

## Scope

This draft covers the private-beta app and private-beta operations. The current
public waitlist Privacy page at `app/privacy/page.tsx` remains waitlist-scoped
and does not fully cover private app accounts, verification, posts, reports, or
moderation records.

## Privacy Principle

jmpseat's identity principle is:

- verified privately
- anonymous publicly
- accountable internally

This means public surfaces should avoid exposing private identity, but jmpseat
may internally use account, verification, report, and moderation data to operate
the product, enforce rules, and handle safety/security issues.

## Information We May Collect

Account and authentication data:

- login email
- account confirmation state
- authentication/session metadata from the auth provider
- password reset or account confirmation events
- account status and access state

Private-beta access data:

- invite or beta access status
- accepted/revoked/paused beta access metadata
- launch-mode eligibility signals
- operator/internal access signals where applicable

Profile data:

- public handle or safe display label
- self-declared airline, role, base, or aviation connection fields
- profile completion state
- optional profile fields the product later asks for

Verification data:

- work-email domain and confirmation state
- verification method and status
- reviewer decision metadata
- verification timestamps
- limited audit metadata

Content and community data:

- DFW Channel posts created by users
- post metadata such as title, body, content type, category, created time, and
  visibility/status
- report reason and optional report details
- moderation status and moderation action records
- safe public author labels where used

Operator/admin data:

- operator grant scopes
- operator action audit metadata
- authorization denials
- report review and moderation action metadata
- security events created by server-side actions

Support and operations data:

- emails or messages sent to support/privacy/safety contacts
- deletion/export request records
- moderation appeal records
- incident triage records

## Work-Email Verification

If you use work-email verification, jmpseat may collect and store the work-email
domain and verification status needed to decide whether your account can access
private-beta surfaces.

Important caveat: using a work email may create records in employer-managed
email systems. jmpseat cannot control employer email logs, retention, monitoring,
or access.

jmpseat should not publicly show your full work email as part of normal
community display.

## Proof Uploads If Reactivated

Proof uploads are not part of the current active private-beta path.

If manual/redacted proof upload is reactivated later, jmpseat should collect
only the minimum evidence needed for review, require redaction instructions,
store artifacts privately, restrict reviewer access, log access where practical,
avoid AI verification decisions, and delete raw artifacts after review unless a
documented safety/fraud reason requires temporary retention.

Implementation and legal/privacy review are required before reactivation.

## What May Be Publicly Visible

Depending on the surface, other eligible private-beta users may see:

- public handle or safe member label
- user-created post title/body
- safe post metadata
- channel name or slug
- safe status messages

jmpseat should not publicly show:

- reporter identity
- report counts
- full work email
- author user ID
- board/base/parent internal IDs
- proof or verification artifacts
- storage paths
- signed URLs
- private admin notes
- private identity fields

## Internal Accountability

jmpseat may internally connect public handles, posts, reports, verification
state, moderation actions, and account records to enforce policies, handle
appeals, review safety issues, respond to support requests, and protect the
service.

Internal accountability does not mean users should be publicly identified.

## How We Use Information

jmpseat may use private-beta information to:

- provide account and private-beta access
- verify eligibility
- operate DFW Hub, DFW Today, DFW Base, DFW Layover, and Channels
- display user-submitted posts where allowed
- process reports
- review and moderate content
- investigate abuse, security, privacy, or aviation-sensitive incidents
- respond to support, privacy, deletion/export, and appeal requests
- improve private-beta product direction and safety
- maintain audit logs and operator accountability

## What We Do Not Collect For V1

jmpseat should not collect or ask users to submit:

- airline portal credentials
- schedules or schedule screenshots
- roster/calendar integrations
- passenger private information
- exact public crew hotel details
- live location
- public nearby crew tracking data
- airport/security procedures
- confidential company documents
- full marketplace payment data
- documents or proof uploads unless a later reviewed reactivation explicitly
  approves them

## No Sale Of Personal Data

jmpseat should not sell personal data.

If future advertising, affiliate, vendor, marketplace, or analytics behavior is
introduced, this privacy notice must be reviewed and updated before launch.

## Service Providers

jmpseat may use providers for hosting, authentication, database storage, email,
security, analytics on public pages, logging, and operations.

Provider use should be limited to operating jmpseat and should not be used to
sell private-beta data.

## Retention Principles

Retention is draft and implementation may be pending.

Principles:

- keep account, access, verification, report, moderation, and audit records only
  as long as needed for product operations, safety, security, policy, legal, or
  support reasons
- avoid retaining raw sensitive verification artifacts when not needed
- delete raw proof artifacts after review if proof uploads are ever reactivated,
  unless a documented safety/fraud reason requires temporary retention
- retain minimal report/moderation audit records when needed for accountability
  and appeals
- avoid over-retaining support messages that include sensitive information

Exact retention periods require founder/legal/security review.

## Deletion And Export Requests

Draft/manual process, implementation pending:

- deletion/export requests should go to `privacy@jmpseat.com` or the approved
  private-beta privacy support path
- jmpseat should verify the requester before acting
- jmpseat should document what can be deleted, exported, anonymized, or retained
  for safety/security/legal/audit reasons
- reports, moderation actions, security events, and abuse records may need to be
  retained in limited form where necessary

## Security

jmpseat uses private app access gates, server-side authorization, operator
scopes, and report/moderation controls to protect private-beta surfaces.

No internet service can guarantee perfect security. Users should not submit
unnecessary sensitive information.

## Contact Placeholder

Draft contact paths:

- Privacy, deletion, export: `privacy@jmpseat.com`
- General support: `support@jmpseat.com`
- Safety/security escalation: owner and address pending founder decision

## Legal Review Note

This draft is not a final Privacy Policy. It must be reviewed by the founder and
a qualified legal/privacy reviewer before broader launch or broader private-beta
use.
