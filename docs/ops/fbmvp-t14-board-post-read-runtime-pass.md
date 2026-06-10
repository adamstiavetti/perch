# FBMVP-T14 Board Post Read Runtime Pass

Date: 2026-06-10

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## Purpose

This document records the targeted runtime application of
`FBMVP-T14: Board Post Read Foundation`.

T14 adds the first read-only DFW Baseboard post-read RPC surface. It does not
create posts, expose a composer, add comments, saves, reactions, search,
lounge/restricted posting, seeded layover content, proof-upload scope, deploy,
or runtime setting changes.

## Target Runtime

Target Supabase project:

- project name: `jmpseat`
- project ref/id: `qcdfjrcnwuioqprmqqzx`

Applied migration:

- file: `supabase/migrations/20260610162000_create_board_post_read_rpc.sql`
- ledger version: `20260610162000`
- ledger name: `create_board_post_read_rpc`

Apply method:

- targeted SQL execution only
- migration SQL and exact ledger row were applied in one explicit transaction
- no broad `supabase db push`
- no migration repair
- no deploy

## Verified Runtime Objects

The runtime pass verified these functions exist:

- `public.current_user_can_read_open_board_posts()`
- `public.list_open_baseboard_posts(p_base_code text, p_limit integer)`

Both functions are:

- `SECURITY DEFINER`
- `STABLE`
- locked to `search_path=public, pg_temp`

## Read Eligibility Verification

The read eligibility helper is not auth-only.

Runtime verification confirmed:

- read eligibility requires a completed profile
- normal users require active beta access plus verified work-email /
  aviation-worker state
- operator bypass is limited to `operator.internal_private_app_access`
- authorization does not use `claimed_airline`
- authorization does not use `claimed_role`
- authorization does not use `claimed_base`
- unauthenticated eligibility returned `false`

## Safe Return Verification

`public.list_open_baseboard_posts(...)` returns only:

- `id`
- `title`
- `body`
- `content_type`
- `category`
- `is_pinned`
- `created_at`
- `updated_at`
- `author_label`

Runtime verification confirmed returned fields do not include:

- `author_user_id`
- email
- claimed fields
- verification status or evidence
- proof/storage data
- signed URLs
- private paths

Author display uses `profiles.handle` only, with `jmpseat member` fallback.

## Grant And Policy Verification

Function execute posture:

- unavailable to `anon`
- unavailable to `public`
- granted to `authenticated`
- granted to `service_role`

`public.board_posts` verification:

- RLS remains enabled
- existing policies remain `SELECT` only
- no direct write policies were added

## Runtime Smoke Verification

The runtime pass used catalog, permission, schema, and count checks only.

- no post/content smoke test was run
- no posts were inserted
- no user/community content was created
- `public.board_posts` count remained `0`

## Drift Boundary

Known migration drift remains preserved and unrepaired:

- local `20260607103000` vs remote `20260607182257`
- local `20260607204212` vs remote `20260607205909`
- local T06 `20260609130534` vs remote T06 `20260609194858`

Broad `supabase db push` remains unsafe. Future runtime schema work should use
targeted preflight/apply flows that preserve the known drift and exact intended
ledger versions.

## Result

T14 is runtime-applied and verified on the intended `jmpseat` Supabase project.

The next implementation milestone should be selected as T15 only after this
runtime-pass documentation is reviewed and committed.
