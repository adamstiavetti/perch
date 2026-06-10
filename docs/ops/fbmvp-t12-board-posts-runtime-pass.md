# FBMVP-T12 Board Posts Runtime Pass

Date: 2026-06-10

Brand note: jmpseat is the canonical product and app name. This document does
not claim legal or trademark clearance for the name.

jmpseat is not affiliated with or endorsed by any airline, airport, union, or
employer unless explicitly obtained and documented.

## Target

Supabase project:

- name: `jmpseat`
- ref: `qcdfjrcnwuioqprmqqzx`

## Repo State At Apply

- branch/status: `main...origin/main`
- HEAD/origin main: `059e53c feat: add board posts foundation`
- local migration file:
  `supabase/migrations/20260610010000_create_board_posts_foundation.sql`

## Migration Ledger

Pre-apply ledger included:

- `20260609020355 create_base_board_model`
- `20260609194858 create_home_base_board_follows`
- `20260609200310 harden_home_base_rpc_execute_grants`
- `20260609220055 create_lounge_access_foundation`

Pre-apply ledger did not include:

- `20260610010000 create_board_posts_foundation`

Post-apply ledger includes:

- `20260610010000 create_board_posts_foundation`

No unrelated migration versions were newly marked applied.

## Known Drift Preserved

Known migration-history drift remains:

- local `20260607103000` vs remote `20260607182257`
- local `20260607204212` vs remote `20260607205909`
- local T06 `20260609130534` vs remote T06 `20260609194858`

Because that drift remains, broad `supabase db push` remains unsafe. Future
runtime schema changes should continue to use targeted, version-aware apply
steps until migration history is intentionally reconciled.

## Apply Method

The T12 runtime pass used an exact-version-preserving targeted authenticated
SQL transaction.

The transaction executed only:

- `supabase/migrations/20260610010000_create_board_posts_foundation.sql`

The transaction inserted exactly one migration ledger row:

- `20260610010000 create_board_posts_foundation`

No `migration repair` command was used during the T12 runtime apply.

## Schema Verification

Runtime verification confirmed:

- `public.board_posts` exists
- row count was `0` at verification

Verified columns:

- `id`
- `board_id`
- `author_user_id`
- `title`
- `body`
- `content_type`
- `category`
- `status`
- `visibility`
- `is_admin_seeded`
- `is_pinned`
- `edited_at`
- `removed_at`
- `removed_by`
- `removal_reason`
- `created_at`
- `updated_at`

Verified constraints:

- `content_type`
- `category`
- `status`
- `visibility`
- title/body trim checks
- removed-state/removal-reason length checks

Verified indexes:

- primary key
- `board_posts_board_created_at_idx`
- `board_posts_board_status_created_at_idx`
- `board_posts_board_category_created_at_idx`
- `board_posts_author_created_at_idx`

Verified trigger:

- `set_board_posts_updated_at`

## RLS And Policy Verification

Runtime verification confirmed:

- RLS is enabled on `public.board_posts`
- no anon table grants exist
- no insert/update/delete table grants exist for `authenticated`
- the only authenticated table grant is `SELECT`
- no permissive `using (true)` or `with check (true)` policies exist
- policies are SELECT-only

The verified read policy shape is:

- authenticated users can read published `board` posts on active
  `open_verified` boards
- active lounge members can read published `members_only` posts on active
  restricted boards through active `lounge_memberships`

The verified policy posture preserves:

- `operator_only` posts are not exposed to normal authenticated users
- Home Base is not used as authorization truth
- board follows are not used as authorization truth
- self-declared profile fields are not used as authorization truth

## Prior Objects Verified Intact

T05 objects still exist:

- `public.bases`
- `public.board_types`
- `public.boards`

T06 objects still exist:

- `public.user_home_base_preferences`
- `public.board_follows`

T07 objects still exist:

- `public.lounge_memberships`
- `public.lounge_access_requests`
- `public.lounge_admin_grants`

Seed state still exists:

- active `DFW`
- active `DFW Base Board`
- active `base_board`
- active `layover_board`
- active `verified_lounge`

## Confirmations

- No broad `supabase db push` was used.
- No `migration repair` command was used.
- No deploy happened.
- No Supabase, Vercel, DNS, SMTP, Auth, Storage, or runtime settings were
  changed.
- No proof-upload code, storage, or artifacts changed.
- No unrelated runtime data was mutated.
- Only the approved T12 schema creation and exact migration ledger row were
  applied.

## Scope Still Not Implemented

T12 remains a shared post/thread data foundation only. It does not implement:

- posting UI
- comments or replies
- saves
- reactions
- search backend
- moderation actions or reports
- Crew Picks ranking
- seeded layover runtime content
- AI behavior
- proof-upload scope
