# FBMVP-T07 Verified Lounge Access Runtime Pass

Date: 2026-06-09

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Purpose

This note records the targeted Supabase runtime apply and verification pass for
`FBMVP-T07: Verified Lounge Membership + Access Request Foundation`.

T07 was already merged in app/repo history. This pass applied only the T07
schema/RLS foundation migration to the intended `jmpseat` Supabase project and
verified the lounge access tables, RLS posture, policy shape, and upstream
T05/T06 dependencies.

## 2. Runtime Apply Summary

Applied migration:

- `20260609220055 create_lounge_access_foundation`

Target Supabase project:

- `jmpseat`
- project ref: `qcdfjrcnwuioqprmqqzx`

Apply path used:

- targeted SQL transaction through the authenticated Supabase connector

Broad `supabase db push` was not used.

Only `20260609220055 create_lounge_access_foundation` was inserted into remote
migration history during this pass.

No unrelated migration versions were newly marked applied.

## 3. Existing Drift Still Present

This pass did not resolve prior remote migration-history drift.

The existing documented drift remains:

- local `20260607103000` vs remote `20260607182257`
- local `20260607204212` vs remote `20260607205909`
- local T06 `20260609130534` vs remote T06 `20260609194858`

That drift is why this pass remained targeted and did not use broad migration
push behavior.

## 4. Schema Verification

Verified successfully:

- `public.lounge_memberships` exists
- `public.lounge_access_requests` exists
- `public.lounge_request_comments` exists
- `public.lounge_admin_grants` exists
- RLS is enabled on all four T07 tables
- no anon policies exist on the four T07 tables
- no permissive `using (true)` or `with check (true)` policies exist
- authenticated read policies are scoped as expected
- own-row reads exist for memberships and access requests
- Crew Lead reads are board-scoped through `lounge_admin_grants`
- `operator_review` comments are not exposed through participant/Crew Lead
  request-comment policies

## 5. Dependency Verification

Verified T05/T06 foundation remains intact:

- `public.bases` exists
- `public.board_types` exists
- `public.boards` exists
- `public.user_home_base_preferences` exists
- `public.board_follows` exists
- `DFW` remains an active base
- `DFW Base Board` remains active with slug `dfw`
- `verified_lounge` remains an active board type

## 6. Boundaries Preserved

This runtime pass did not:

- deploy app code
- run broad `supabase db push`
- change Supabase/Vercel/DNS/SMTP/auth/storage/runtime settings
- touch proof-upload code, storage, or artifacts
- add dashboard UI
- add request UI
- add Crew Lead panel UI
- add direct write policies or mutation RPCs
- add posts, comments, search, saves, reactions, moderation, AI,
  marketplace/deals, or proof-upload scope

The only runtime mutation in this pass was the intended T07 schema/RLS
foundation apply and exact migration-ledger row for
`20260609220055 create_lounge_access_foundation`.

## 7. Next Lane

With T07 runtime-applied and verified, the next implementation lane remains:

- `FBMVP-T08` DFW Base Board read-only dashboard shell

Later lounge work should add server-side/RPC-controlled request creation,
review, approval, denial, revocation, request comments, and audit events before
any broad real user exposure.

Future runtime schema changes must still use targeted migration apply while the
known remote migration-history drift remains unresolved.
