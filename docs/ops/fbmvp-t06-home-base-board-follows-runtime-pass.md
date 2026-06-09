# FBMVP-T06 Home Base And Board Follows Runtime Pass

Date: 2026-06-09

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## 1. Purpose

This note records the targeted runtime verification pass for `FBMVP-T06: Home
Base Preference + Board Follow Foundation`.

The goal of this pass was to confirm the already-present T06 schema/functions
in the intended Supabase runtime, then apply only the follow-up RPC
execute-grant hardening migration without re-applying or retro-marking the
local T06 migration file.

## 2. Runtime Context

Target project:

- project name: `jmpseat`
- project ref: `qcdfjrcnwuioqprmqqzx`

Important migration-ledger context:

- the intended runtime already had T06 schema/functions present
- the remote migration ledger recorded that T06 apply as
  `20260609194858 create_home_base_board_follows`
- the local repo still contains
  `20260609130534_create_home_base_board_follows.sql`
- the local T06 migration was not re-applied
- the local T06 migration was not retroactively marked applied

This mismatch remains known and intentional. It must not be “fixed” by
re-applying local T06 or by retro-marking `20260609130534` in migration
history.

## 3. Hardening Apply

Applied hardening migration:

- `20260609200310 harden_home_base_rpc_execute_grants`

Apply method:

- targeted SQL transaction against the intended Supabase runtime
- explicit migration-ledger insert for `20260609200310`
- no broad `supabase db push`

Only the following hardening behavior was applied:

- revoke execute on `public.set_user_home_base(text)` from `anon`
- revoke execute on `public.get_current_user_home_base()` from `anon`
- revoke execute on `public.list_current_user_board_follows()` from `anon`
- revoke execute on those same functions from `public`
- grant execute on those same functions to `authenticated`
- grant execute on those same functions to `service_role`
- refresh function comments to document the least-privilege boundary

No tables were recreated.

No T06 functions were replaced.

No T05/T06 data rows were inserted, updated, or deleted outside the migration
ledger entry for `20260609200310`.

## 4. Migration History Result

Verified migration history after apply includes:

- `20260609020355 create_base_board_model`
- `20260609194858 create_home_base_board_follows`
- `20260609200310 harden_home_base_rpc_execute_grants`

No unrelated migration versions were newly marked applied during this pass.

## 5. Grant Verification

Verified after apply:

- `anon` no longer has execute on `public.set_user_home_base(text)`
- `anon` no longer has execute on `public.get_current_user_home_base()`
- `anon` no longer has execute on `public.list_current_user_board_follows()`
- `public` does not have execute on those three functions
- `authenticated` has execute on those three functions
- `service_role` has execute on those three functions

The T06 functions still exist after hardening:

- `public.set_user_home_base(text)`
- `public.get_current_user_home_base()`
- `public.list_current_user_board_follows()`

The least-privilege hardening is additive to the existing internal function
guard. The functions still enforce `auth.uid()` internally.

## 6. Schema Verification

Verified after hardening:

- `public.user_home_base_preferences` exists
- `public.board_follows` exists
- RLS remains enabled on both T06 tables

Verified T05 foundation remains intact:

- `public.bases` exists
- `public.board_types` exists
- `public.boards` exists
- `DFW` remains an active base
- board types remain:
  - `base_board`
  - `layover_board`
  - `verified_lounge`
- `DFW Base Board` remains active with slug `dfw`, visibility
  `open_verified`, and posting mode `members_can_post`

## 7. Boundaries Preserved

This runtime pass did not:

- deploy app code
- run broad `supabase db push`
- change Supabase/Vercel/DNS/SMTP/auth/storage/runtime settings
- change proof-upload code, storage, or artifacts
- change app-entry gates
- make Home Base or board follows authorization truth
- grant restricted lounge access

Work-email verification remains the aviation-worker eligibility gate.

Home Base and board follows remain personalization/subscription state only.

## 8. Next Lane

With T06 runtime state and RPC grant hardening now recorded, the next
implementation lane remains:

- `FBMVP-T07` restricted lounge membership/access request/community-admin model

Later tickets should continue using targeted migration apply while the known
remote migration-history drift remains unresolved.
