# FBMVP-T12 Shared Posts/Threads Foundation

Date: 2026-06-10

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## Purpose

`FBMVP-T12` adds the shared database foundation for posts/threads that later
Baseboard, Layovers, Crew Picks sourcing, and access-aware lounge content can
reuse.

This lane creates only the first post/thread table plus conservative read-only
RLS. It does not implement posting UI, comment threads, saves, reactions,
search backend, moderation workflows, Crew Picks ranking, seeded layover
content, or AI behavior.

Runtime status: T12 is merged and runtime-applied to the intended `jmpseat`
Supabase project. The targeted runtime pass is recorded in
`docs/ops/fbmvp-t12-board-posts-runtime-pass.md`. Known migration-history drift
remains, so broad `supabase db push` remains unsafe.

## What T12 Adds

New schema:

- `public.board_posts`

Core model direction:

- a post belongs to a board
- a post belongs to an authenticated author
- a post has constrained `content_type`
- a post has constrained `category`
- a post has constrained `status`
- a post has constrained `visibility`
- pinned and admin-seeded flags exist as future presentation/editorial hints

Initial supported content types:

- `note`
- `question`
- `recommendation`
- `guide`

Initial supported categories:

- `general`
- `food`
- `coffee`
- `transportation`
- `fitness`
- `things_to_do`
- `crew_tips`
- `safety`
- `base_q_and_a`
- `operations_note`

## RLS Posture

T12 keeps write behavior closed.

It enables only conservative authenticated reads:

- published `board` posts on active `open_verified` boards
- published `members_only` posts on active `restricted` boards only when the
  authenticated user has active `lounge_memberships` for that board

T12 does not expose:

- draft posts
- hidden posts
- removed posts
- `operator_only` posts
- restricted lounge content to non-members

## Boundaries Preserved

T12 preserves these product and security boundaries:

- Home Base does not grant restricted lounge access
- board follows do not grant restricted lounge access
- self-declared `claimed_airline`, `claimed_role`, and `claimed_base` do not
  grant protected access
- proof uploads remain out of scope
- no anon read/write surface is added
- no permissive `using (true)` or `with check (true)` policies are added

## Relationship To Layovers And Crew Picks

T12 is the shared primitive that later tickets can reuse for:

- Baseboard questions and notes
- Layovers Featured Picks, Crew Notes, Questions, recommendations, notes, and
  guides
- Crew Picks sourcing from saved/admin-curated or later ranked content

This keeps the product language utility-first even if the underlying storage
uses shared post/thread primitives.

## What T12 Does Not Add

T12 does not add:

- posting UI
- direct write policies
- comment/reply schema
- saves
- reactions
- search backend
- moderation actions or reports
- Crew Picks ranking
- seeded layover runtime content
- lounge request/review flows
- Crew Lead panel functionality
- AI-generated publishing

## Validation

Static/source validation for T12 should confirm:

- `board_posts` exists with constrained content/state fields
- RLS is enabled
- anon remains blocked
- authenticated reads are limited to open verified board posts or active lounge
  member reads on restricted boards
- no comment/reaction/save/search/moderation scope is added
- no proof-upload scope is introduced
