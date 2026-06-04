# Verification Runtime Pass: American Airlines Test

## Purpose

This artifact records the successful end-to-end runtime verification pass for the bounded work-email review flow after the approved-domain RLS fix.

## Runtime Summary

Runtime test setup:

- applicant app-login account: `adamstiavetti@gmail.com`
- reviewer app-login account: `jmpseatapp@gmail.com`
- test work-email input: `test@aa.com`
- seeded approved test domain: `aa.com`
- airline label on the seeded domain: `American Airlines`

Successful runtime flow:

- applicant reached `/app/verification`
- applicant submitted `test@aa.com`
- a verification request row was created
- a verification evidence metadata row was created
- reviewer reached `/app/admin/verification`
- reviewer approved the request
- claims issued:
  - `airline_worker`
  - `airline = American Airlines`
- claims not issued:
  - `role`
  - `base`

Security and negative-path confirmation:

- verification security events were recorded
- metadata remained sanitized
- unsupported-domain handling still created no verification rows
- non-reviewers could not access the reviewer route
- no employer-system lookup occurred

## Original Blocking Bug And Fix

Before the runtime pass succeeded:

- an active `approved_email_domains` row for `aa.com` existed
- the authenticated runtime path could not read it
- `/app/verification` still showed no supported domains
- `test@aa.com` returned unsupported

Root cause:

- `public.approved_email_domains` had RLS enabled
- active approved rows were not readable by authenticated app users

Fix migration:

- `20260604191118_allow_active_approved_email_domain_reads.sql`

Fix posture:

- authenticated users can read only active approved domains
- no write access was added
- no domains were hard-coded in app code

## Important Caveats

- `test@aa.com` was fake test input for domain-matching only
- this does not prove control of a real American Airlines work email
- American Airlines does not endorse jmpseat
- `aa.com` was a runtime smoke-test seed, not final production domain policy
- real work-email delivery does not exist yet
- proof upload does not exist yet

## Follow-Up Hardening Note

At the time of the runtime proof, one known hardening gap remained:

- review writes were still sequential rather than transactional

That follow-up is addressed by the later transactional review-action hardening work documented in:

- [Verification Transactional Review Action Hardening](../epochs/verification-transactional-review-action-hardening.md)
