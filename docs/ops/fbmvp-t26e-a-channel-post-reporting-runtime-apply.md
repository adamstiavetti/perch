# FBMVP-T26E-A Channel Post Reporting Runtime Apply

Date: 2026-06-13

## Purpose

This record closes the targeted runtime migration apply for `FBMVP-T26E-A:
DFW Channel Post Reporting + Moderation Review Foundation`.

The apply targeted Supabase project:

- project name: `jmpseat`
- project ref: `qcdfjrcnwuioqprmqqzx`

Target migration:

- `supabase/migrations/20260613091500_create_hub_channel_post_reporting_rpc.sql`

## Runtime Apply Summary

The targeted runtime apply completed successfully.

Applied only:

- `supabase/migrations/20260613091500_create_hub_channel_post_reporting_rpc.sql`
- one migration ledger row:
  - version: `20260613091500`
  - name: `create_hub_channel_post_reporting_rpc`

Apply method:

- targeted SQL transaction only
- temporary transaction assembled in `/tmp`
- exact committed migration contents plus the exact migration ledger insert
- disposable Supabase temp workdir outside the repo
- temp SQL/workdir removed after apply and verification
- no broad `supabase db push`
- no migration repair
- no broad migration sync
- no unrelated migrations
- no deploy
- no file changes during runtime apply
- no staging
- no commit

## Repo State During Apply

Runtime apply was performed from:

- repo root: `/Users/ClawdBot/jmpseat-public-scroll`
- branch: `main`
- worktree: clean
- `HEAD = origin/main = dc91518`

## Post-Apply Verification

Post-apply read-only checks confirmed the migration ledger contains:

- `20260613091500`
- `create_hub_channel_post_reporting_rpc`

Post-apply read-only checks confirmed all three RPCs exist in `public`:

- `public.list_open_hub_channel_post_reports(p_base_code text, p_limit integer)`
- `public.moderate_open_hub_channel_post(p_base_code text, p_channel_slug text, p_post_id uuid, p_action text, p_reason text)`
- `public.report_open_hub_channel_post(p_base_code text, p_channel_slug text, p_post_id uuid, p_reason text, p_details text)`

Post-apply read-only checks confirmed:

- `public.board_post_reports` still exists
- no runtime drift or conflict was found after apply

## Safety Boundary

This runtime apply did not use:

- broad `supabase db push`
- migration repair
- broad migration sync
- unrelated migrations
- deploy tooling
- Vercel changes
- app code edits
- local migration edits
- test edits

The migration remains scoped to the T26E-A reporting and moderation-review RPC
foundation. It does not add comments, AI final moderation decisions, account
bans, public reporter identity, public report counts, Request a Channel, NonRev
Deals, payments, marketplace behavior, proof-upload scope, storage policy
changes, or verification-flow changes.

## Token Note

The Supabase token was used only as an ephemeral CLI environment token and was
not printed in reports. Because it was pasted into chat during the apply lane,
token rotation remains recommended after this migration lane is complete.

## Next Step

Record and commit this runtime-apply note, then confirm deployment contains
`dc91518` before running authenticated browser smoke for:

- report submission from selected-channel post detail
- duplicate-safe report behavior
- operator review visibility in community moderation
- no-cookie/public-domain boundaries
- privacy and product-scope boundaries

## Documentation Governance Status

Docs updated:

- `docs/ops/fbmvp-t26e-a-channel-post-reporting-runtime-apply.md`
- `docs/BUILD_TICKETS.md`
- `docs/DATA_MODEL.md`
- `docs/ops/05b-first-base-mvp-planning.md`
- `docs/ops/fbmvp-remaining-functional-backlog.md`
- `docs/ops/fbmvp-t26e-a-channel-post-reporting-moderation-foundation.md`
- `docs/ops/hub-pivot-plan.md`

Docs not updated / why:

- App, migration, and test files were not updated because this task only records
  the already-completed targeted runtime apply.
- Browser-smoke docs were not created because browser smoke has not run yet.
- Broad roadmap docs outside the current First-Base / DFW Hub lane were not
  rewritten.

Scope impact:

- Runtime-apply documentation only.
- No app behavior, local migration files, tests, routes, helpers, runtime data,
  or runtime settings changed in this docs task.

Runtime apply docs needed?

- Satisfied by this record after review and commit.

Browser smoke docs needed?

- Yes. Browser smoke remains pending after deployment/runtime readiness.

