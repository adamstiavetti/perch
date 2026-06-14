# Operator Moderation Runbook

Status: draft operator/admin guide

Last updated: 2026-06-14

This guide is for authorized jmpseat operators during private beta. It is not
legal advice and does not change runtime permissions.

## Current Operator Model

Operator access is explicit-scope backed.

Current relevant code/docs:

- Operator scopes: `src/lib/admin/access.ts`
- Community moderation route: `app/app/admin/community-moderation/page.tsx`
- Channel report review helper: `src/lib/admin/communityModerationReports.ts`
- Channel moderation action: `src/lib/admin/communityModerationActions.ts`
- Final T26E-A browser smoke:
  `docs/ops/fbmvp-t26e-a-channel-post-reporting-final-browser-smoke.md`

Relevant scope:

- `operator.community_moderation`

Current T26E-A visible actions:

- Hide post
- Remove post

Not included in T26E-A:

- account bans
- AI final moderation decisions
- public moderation feed
- public report counts
- DFW Channel comments/replies

## Least Privilege

Grant only the scope needed for the task.

Do not use broad operator grants when a narrow scope is enough.

Operator access should not be used to bypass normal user privacy, verification,
or community boundaries except where the operator task explicitly requires it.

## Temporary Operator Grants

Use temporary grants only when:

- an operator-scoped smoke test is required
- no existing operator-scoped session is available
- the target account is approved for the task
- rollback is planned before the grant is applied

Before grant:

- record target account
- record current active grant status
- record exact prior scopes
- plan exact added scope
- plan exact rollback

After smoke:

- restore exact prior scope list
- verify temporary scope removed
- confirm no second grant was created unless explicitly intended
- record the result

## Grant / Revoke Hygiene

Do:

- preserve existing scopes unless intentionally changing them
- add only the needed scope
- revoke temporary scope promptly
- verify state after revoke
- keep audit notes
- rotate exposed tokens/secrets

Do not:

- grant operator scopes casually
- leave temporary scopes in place after smoke
- use operator access as user-facing beta access
- expose tokens, secrets, or raw grant SQL in public docs
- use broad database push for scope changes

## Report Review Workflow

1. Open `/app/admin/community-moderation` with an authorized operator account.
2. Review open/reviewing DFW Channel reports.
3. Confirm channel context, post context, reason, details, status, and timing.
4. Check whether content exposes high-risk information.
5. Decide whether no action, hide, remove, or escalation is appropriate.
6. If action is needed, enter a concise internal moderation reason.
7. Avoid copying unnecessary sensitive information into the reason.
8. Verify the visible surface no longer exposes hidden/removed content where
   applicable.
9. Record follow-up if author contact, appeal, or incident review is needed.

## Hide / Remove Guidance

Hide or remove content when it exposes or appears to expose:

- passenger private information
- exact crew hotel exposure
- airport/security-sensitive procedures
- live operations-sensitive information
- doxxing
- threats
- severe harassment
- confidential company documents
- phishing, malware, or scams

When uncertain about aviation/security-sensitive exposure, hide first and
escalate for review.

## Identity Leakage Boundaries

Do not expose:

- reporter user ID
- reporter identity
- author user ID
- full work email
- private profile fields
- board/base/parent internal IDs
- proof or verification evidence
- storage paths
- signed URLs
- raw SQL/errors
- private admin notes

The moderation UI should use safe context and safe labels. If a workflow shows
more than needed, treat that as a product/security issue.

## Audit Expectations

Every moderation action should be auditable:

- operator account
- route/action
- target content
- action requested
- action applied or denied
- reason
- timestamp

Audit metadata should not overexpose sensitive content.

## Smoke-Test Rules

For future smoke tests:

- prefer existing safe smoke posts
- do not create posts unless explicitly authorized
- do not click hide/remove unless explicitly authorized and safe
- if temporary operator scope is used, restore exact prior scope list
- record whether destructive actions were avoided
- never print tokens/secrets
- rotate tokens if pasted into chat or logs

## Token / Access Hygiene

If a Supabase token or other operational secret is pasted into chat, logs, or an
untrusted place:

1. Treat it as exposed.
2. Complete only the authorized lane if still necessary.
3. Rotate it promptly after the lane closes.
4. Record the rotation or pending rotation in ops docs.
5. Do not paste the token into reports.

## Operator Conduct

Operators should:

- use the minimum access needed
- avoid conflicts of interest
- avoid reviewing disputes involving themselves where possible
- protect reporter and author privacy
- avoid sharing screenshots with private data
- use official/employer sources for operational matters
- escalate unclear high-risk content

## Review Note

This runbook must be reviewed by founder/security/policy owner before broader
private-beta use.
