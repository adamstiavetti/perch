create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null,
  requested_claim_types text[] not null default '{}'::text[],
  method text not null,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id),
  expires_at timestamptz,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint verification_requests_status_check check (
    status in (
      'draft',
      'submitted',
      'pending_review',
      'needs_resubmission',
      'approved',
      'rejected',
      'cancelled',
      'expired',
      'revoked'
    )
  ),
  constraint verification_requests_method_check check (
    method in ('work_email', 'redacted_badge_or_proof')
  ),
  constraint verification_requests_claim_types_check check (
    requested_claim_types <@ array['airline_worker', 'airline', 'role', 'base']::text[]
  )
);

create table public.verification_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  request_id uuid references public.verification_requests (id) on delete set null,
  claim_type text not null,
  claim_value text,
  status text not null,
  verification_method text,
  confidence_level text,
  approved_by uuid references auth.users (id),
  approved_at timestamptz,
  expires_at timestamptz,
  revoked_by uuid references auth.users (id),
  revoked_at timestamptz,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint verification_claims_type_check check (
    claim_type in ('airline_worker', 'airline', 'role', 'base')
  ),
  constraint verification_claims_status_check check (
    status in (
      'pending',
      'approved',
      'rejected',
      'needs_resubmission',
      'expired',
      'revoked'
    )
  ),
  constraint verification_claims_method_check check (
    verification_method is null
    or verification_method in ('work_email', 'redacted_badge_or_proof')
  ),
  constraint verification_claims_confidence_check check (
    confidence_level is null
    or confidence_level in ('low', 'medium', 'high')
  )
);

create table public.verification_evidence (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.verification_requests (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  evidence_type text not null,
  storage_bucket text,
  storage_path text,
  redaction_acknowledged boolean not null default false,
  status text not null,
  uploaded_at timestamptz,
  delete_after timestamptz,
  deleted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint verification_evidence_type_check check (
    evidence_type in ('work_email', 'redacted_badge_or_proof')
  ),
  constraint verification_evidence_status_check check (
    status in (
      'pending',
      'submitted',
      'accepted',
      'rejected',
      'needs_resubmission',
      'deleted'
    )
  ),
  constraint verification_evidence_metadata_object_check check (
    jsonb_typeof(metadata) = 'object'
  ),
  constraint verification_evidence_metadata_safe_check check (
    not (
      metadata ?| array[
        'badge_id',
        'badge_number',
        'employee_id',
        'barcode',
        'barcodes',
        'qr_code',
        'qr_codes',
        'raw_text',
        'file_blob',
        'file_bytes'
      ]
    )
  )
);

create table public.verification_review_actions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.verification_requests (id) on delete cascade,
  claim_id uuid references public.verification_claims (id) on delete set null,
  reviewer_id uuid not null references auth.users (id),
  action text not null,
  notes text,
  created_at timestamptz not null default now(),
  constraint verification_review_actions_action_check check (
    action in (
      'approve',
      'reject',
      'request_resubmission',
      'revoke',
      'expire',
      'cancel'
    )
  )
);

create table public.approved_email_domains (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  airline text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint approved_email_domains_domain_lowercase check (domain = lower(domain)),
  constraint approved_email_domains_status_check check (
    status in ('active', 'disabled')
  )
);

create index verification_requests_user_id_idx
on public.verification_requests (user_id, created_at desc);
create index verification_requests_status_idx
on public.verification_requests (status, created_at desc);
create index verification_requests_method_idx
on public.verification_requests (method, created_at desc);
create index verification_requests_expires_at_idx
on public.verification_requests (expires_at);
create index verification_requests_reviewed_by_idx
on public.verification_requests (reviewed_by, reviewed_at desc);

create index verification_claims_user_id_idx
on public.verification_claims (user_id, created_at desc);
create index verification_claims_status_idx
on public.verification_claims (status, created_at desc);
create index verification_claims_claim_type_idx
on public.verification_claims (claim_type, status, created_at desc);
create index verification_claims_claim_value_idx
on public.verification_claims (claim_value);
create index verification_claims_request_id_idx
on public.verification_claims (request_id);
create index verification_claims_expires_at_idx
on public.verification_claims (expires_at);

create index verification_evidence_request_id_idx
on public.verification_evidence (request_id, created_at desc);
create index verification_evidence_user_id_idx
on public.verification_evidence (user_id, created_at desc);
create index verification_evidence_status_idx
on public.verification_evidence (status, created_at desc);
create index verification_evidence_delete_after_idx
on public.verification_evidence (delete_after);

create index verification_review_actions_request_id_idx
on public.verification_review_actions (request_id, created_at desc);
create index verification_review_actions_claim_id_idx
on public.verification_review_actions (claim_id);
create index verification_review_actions_reviewer_id_idx
on public.verification_review_actions (reviewer_id, created_at desc);
create index verification_review_actions_action_idx
on public.verification_review_actions (action, created_at desc);

create index approved_email_domains_status_idx
on public.approved_email_domains (status, created_at desc);

create or replace function public.set_verification_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_verification_requests_updated_at
before update on public.verification_requests
for each row
execute function public.set_verification_updated_at();

create trigger set_verification_claims_updated_at
before update on public.verification_claims
for each row
execute function public.set_verification_updated_at();

create trigger set_verification_evidence_updated_at
before update on public.verification_evidence
for each row
execute function public.set_verification_updated_at();

create trigger set_approved_email_domains_updated_at
before update on public.approved_email_domains
for each row
execute function public.set_verification_updated_at();

alter table public.verification_requests enable row level security;
alter table public.verification_claims enable row level security;
alter table public.verification_evidence enable row level security;
alter table public.verification_review_actions enable row level security;
alter table public.approved_email_domains enable row level security;

comment on table public.verification_requests is 'Verification workflow requests. Separate from auth, profile completion, beta access, and final claim issuance.';
comment on table public.verification_claims is 'Issued or historical worker verification claims for future claims-based authorization. Profile fields remain self-declared.';
comment on table public.verification_evidence is 'Metadata-only verification evidence records. Raw files must remain in private storage later, not in database rows.';
comment on table public.verification_review_actions is 'Auditable reviewer action history for verification decisions. No reviewer UI is implemented in this migration.';
comment on table public.approved_email_domains is 'Approved airline or employer domains for later work-email verification flows. No seed data or domain-management UI is included here.';
comment on column public.verification_evidence.storage_bucket is 'Future storage metadata only. This migration does not create storage buckets or upload flows.';
comment on column public.verification_evidence.storage_path is 'Future private storage path metadata only. Do not store raw file bytes in this table.';
comment on column public.verification_evidence.metadata is 'Minimal metadata only. Do not store employee IDs, badge numbers, barcodes, QR codes, raw proof text, or raw file/blob data.';

create policy "users can read their own verification requests"
on public.verification_requests
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can create their own verification requests"
on public.verification_requests
for insert
to authenticated
with check (
  auth.uid() = user_id
  and reviewed_by is null
  and status in ('draft', 'submitted', 'cancelled')
);

create policy "users can read their own verification claims"
on public.verification_claims
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can read their own verification evidence"
on public.verification_evidence
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can create their own verification evidence metadata"
on public.verification_evidence
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.verification_requests
    where verification_requests.id = request_id
      and verification_requests.user_id = auth.uid()
  )
  and status in ('pending', 'submitted')
);

create policy "users can read review actions for their own verification requests"
on public.verification_review_actions
for select
to authenticated
using (
  exists (
    select 1
    from public.verification_requests
    where verification_requests.id = request_id
      and verification_requests.user_id = auth.uid()
  )
);
