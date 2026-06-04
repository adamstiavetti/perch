# Supabase CLI Migration Workflow

Brand note: jmpseat is the canonical product and app name. This document does not claim legal or trademark clearance for the name.

## 1. Purpose

jmpseat should use Supabase CLI migrations going forward instead of relying on manual SQL pastes into the Supabase UI for normal schema changes.

This runbook defines the safe CLI migration workflow, documents the current migration-history mismatch risk, and explains how to reconcile the first manually applied Epoch 03 migrations before using `db push` confidently against the remote project.

This document is operational only. It does not add product features.

## 2. Current State

Current repo/runtime truth:

- local migration files exist under `supabase/migrations/`
- `supabase/config.toml` now exists for local CLI workflow setup
- Supabase CLI is available through `npx`
- `.env.local` exists locally and remains ignored

Important current operational detail:

- the first three Epoch 03 migrations were manually applied through the Supabase SQL Editor
- those three migrations are:
  - `20260604113000_create_profiles.sql`
  - `20260604124500_create_beta_access.sql`
  - `20260604143000_create_security_events.sql`
- remote migration history may not know about them yet

Because of that:

- migration-history reconciliation is required before using `npx supabase db push` confidently against the remote project
- blindly pushing could try to reapply DDL that already exists remotely

## 3. Recommended Workflow For Future Migrations

Use this workflow for all future schema changes after project linking and migration-history reconciliation are complete.

### Create a migration

```bash
npx supabase migration new <migration_name>
```

Edit the generated SQL file under:

```text
supabase/migrations/
```

### Validate locally when local Supabase is available

Start local Supabase:

```bash
npx supabase start
```

Reset local database and apply migrations:

```bash
npx supabase db reset
```

Use this local validation flow before any remote push whenever practical.

### Review before remote push

- inspect the migration SQL carefully
- inspect git diff
- confirm branch scope is correct
- confirm the migration belongs to the current approved ticket

### Push remote only after review

```bash
npx supabase db push
```

Do not run remote `db push` until:

- the repo is linked to the correct Supabase project
- migration history has been inspected
- manually applied migrations have been reconciled if needed
- the branch has been reviewed

## 4. Project Linking

Current Supabase project ref:

- `qcdfjrcnwuioqprmqqzx`

Recommended linking command:

```bash
npx supabase link --project-ref qcdfjrcnwuioqprmqqzx
```

Important:

- linking may require Supabase authentication and/or remote database credentials
- do not paste service-role or browser/client secrets into the repo
- if the CLI prompts for a database password or interactive auth and the operator does not have it available, stop and complete that step manually

Current status from this setup pass:

- the repo is **not linked yet**
- `npx supabase migration list` currently fails with:
  - `Cannot find project ref. Have you run supabase link?`

## 5. Migration-History Repair

Why repair may be needed:

- the remote database schema already includes the first three Epoch 03 migrations because they were pasted manually into the Supabase SQL Editor
- the Supabase migration-history table may not record them as applied
- if remote migration history is missing them, `npx supabase db push` may try to run those SQL files again

Do not blindly repair or push.

### Safe inspection sequence

After linking:

```bash
npx supabase migration list --linked
```

Review whether the linked project already records:

- `20260604113000`
- `20260604124500`
- `20260604143000`

### If the remote migration history already records them

- no repair is needed for those three versions
- review any later pending migrations normally before `db push`

### If the remote schema exists but migration history does not record them

The likely next step is to mark them as applied in migration history rather than re-running their DDL.

Exact repair command shape:

```bash
npx supabase migration repair --linked --status applied 20260604113000 20260604124500 20260604143000
```

Important:

- run that only after confirming the remote schema objects already exist and match the local migration intent
- operator approval is required before running repair

### Risks of blindly running `db push`

- duplicate table creation errors
- duplicate index or trigger creation errors
- misleading migration-history state
- accidental drift between remote schema and local migration expectations

### How to avoid reapplying already-applied DDL

1. link the project
2. inspect remote migration history with `migration list --linked`
3. confirm remote schema already contains:
   - `profiles`
   - `beta_access`
   - `security_events`
4. if history is missing the versions, repair history to `applied`
5. only then review and use `npx supabase db push` for later migrations

## 6. Safety Rules

- never paste secret keys into client env
- never commit `.env.local`
- never run remote `db push` from an unreviewed branch
- never apply production migrations without review
- prefer local validation before remote push
- keep idempotency in mind, but do not rely on re-running migrations blindly
- do not repair migration history until the remote state has been inspected
- do not use service-role keys for normal CLI migration workflow

## 7. Current Local CLI/Config State

From this setup pass:

- Supabase CLI is available through `npx`
- local config now exists at `supabase/config.toml`
- local config was initialized without changing app code
- local repo is not yet linked to the remote Supabase project

Local config notes:

- `project_id` is set to `jmpseat` for local CLI workflow identity
- local auth site URL is aligned to `http://localhost:3000`
- local additional redirect URLs include localhost variants for dev use

## 8. Epoch 03 Manual Migration Reconciliation Plan

The three already-applied Epoch 03 migrations should be treated as the reconciliation baseline:

1. `20260604113000_create_profiles.sql`
2. `20260604124500_create_beta_access.sql`
3. `20260604143000_create_security_events.sql`

Expected decision tree:

### Case A: linked project history already lists all three versions

- no repair needed
- proceed with normal reviewed migration workflow

### Case B: linked project history lists none or only some of the three versions

- inspect remote schema/table existence first
- if the remote schema objects already exist, repair missing versions to `applied`
- do not re-run those SQL files remotely through `db push` first

### Case C: linked project history is missing them and remote schema is also missing matching objects

- stop
- investigate drift before any repair or push

## 9. Next Recommended Action

1. link the Supabase project if operator auth/credentials are available:

```bash
npx supabase link --project-ref qcdfjrcnwuioqprmqqzx
```

2. inspect remote migration history:

```bash
npx supabase migration list --linked
```

3. reconcile the three manually applied Epoch 03 migrations if needed
4. only after that, proceed with future schema work such as `E04-T02` verification data model foundation

