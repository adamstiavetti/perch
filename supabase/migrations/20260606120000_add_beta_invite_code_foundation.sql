create table public.beta_invite_batches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active',
  quantity integer not null,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  notes text,
  allowed_domain text,
  allowed_airline text,
  allowed_base text,
  constraint beta_invite_batches_status_check check (
    status in ('active', 'paused', 'closed', 'revoked')
  ),
  constraint beta_invite_batches_quantity_check check (
    quantity > 0 and quantity <= 100
  )
);

create table public.beta_invite_codes (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.beta_invite_batches (id) on delete cascade,
  code_hash text not null unique,
  status text not null default 'active',
  max_redemptions integer not null default 1,
  redeemed_count integer not null default 0,
  redeemed_by_user_id uuid references auth.users (id) on delete set null,
  redeemed_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  constraint beta_invite_codes_status_check check (
    status in ('active', 'redeemed', 'revoked', 'expired')
  ),
  constraint beta_invite_codes_max_redemptions_check check (
    max_redemptions = 1
  ),
  constraint beta_invite_codes_redeemed_count_check check (
    redeemed_count >= 0 and redeemed_count <= max_redemptions
  ),
  constraint beta_invite_codes_redeemed_state_check check (
    (
      status = 'redeemed'
      and redeemed_count >= 1
      and redeemed_at is not null
    )
    or (
      status <> 'redeemed'
      and redeemed_count = 0
      and redeemed_by_user_id is null
      and redeemed_at is null
    )
  )
);

create index beta_invite_batches_status_created_at_idx
on public.beta_invite_batches (status, created_at desc);

create index beta_invite_codes_batch_status_idx
on public.beta_invite_codes (batch_id, status);

create index beta_invite_codes_redeemed_by_user_idx
on public.beta_invite_codes (redeemed_by_user_id, redeemed_at desc)
where redeemed_by_user_id is not null;

alter table public.beta_invite_batches enable row level security;
alter table public.beta_invite_codes enable row level security;

alter table public.beta_access
add column invite_code_id uuid references public.beta_invite_codes (id) on delete set null;

create index beta_access_invite_code_id_idx
on public.beta_access (invite_code_id)
where invite_code_id is not null;

comment on table public.beta_invite_batches is 'Operator-generated private-testing invite batches for jmpseat beta capacity control. Invite codes do not prove airline eligibility.';
comment on table public.beta_invite_codes is 'Hashed single-use private-testing invite codes. Plaintext invite codes are not stored.';
comment on column public.beta_invite_codes.code_hash is 'Server-side hash of the normalized invite code. Do not store plaintext invite codes.';
comment on column public.beta_access.invite_code_id is 'Optional source invite-code linkage for beta access granted from a redeemed invite code.';

create or replace function public.operator_scope_values()
returns text[]
language sql
immutable
as $$
  select array[
    'operator.read_audit',
    'operator.manage_approved_domains',
    'operator.manage_reviewer_scopes',
    'operator.read_verification_requests',
    'operator.monitor_proof_cleanup',
    'operator.run_proof_cleanup',
    'operator.manage_operator_access',
    'operator.manage_beta_invites'
  ]::text[];
$$;

alter table public.security_events
drop constraint if exists security_events_event_type_check;

alter table public.security_events
add constraint security_events_event_type_check check (
  event_type in (
    'auth.sign_in_attempt',
    'auth.sign_in_success',
    'auth.sign_in_failed',
    'auth.sign_up_attempt',
    'auth.sign_up_success',
    'auth.sign_up_failed',
    'auth.password_reset_requested',
    'auth.password_reset_request_failed',
    'auth.callback_resolved',
    'private_access.redirect_login',
    'private_access.redirect_profile',
    'private_access.redirect_access_hold',
    'private_access.allowed',
    'private_access.storage_not_ready',
    'profile.upsert_attempt',
    'profile.upsert_success',
    'profile.upsert_failed',
    'beta_access.checked',
    'beta_invite.batch_created',
    'beta_invite.code_redeemed',
    'beta_invite.redemption_failed',
    'beta_access.granted_from_invite',
    'verification_request.submitted',
    'verification_request.unsupported_domain',
    'verification_request.invalid_work_email',
    'verification_request.duplicate_active',
    'verification_evidence.created',
    'verification_evidence.uploaded',
    'verification_evidence.view_requested',
    'verification_evidence.view_granted',
    'verification_evidence.view_denied',
    'verification_evidence.deletion_scheduled',
    'verification_evidence.deleted',
    'verification_evidence.deletion_failed',
    'verification_review.approved',
    'verification_review.rejected',
    'verification_review.needs_resubmission',
    'verification_review.unauthorized_attempt',
    'verification_review.self_review_blocked',
    'verification_claim.issued',
    'operator_access.granted',
    'operator_access.revoked',
    'operator_access.unauthorized_attempt',
    'approved_email_domain.created',
    'approved_email_domain.updated',
    'approved_email_domain.disabled',
    'approved_email_domain.unauthorized_attempt',
    'reviewer_scope.granted',
    'reviewer_scope.revoked',
    'reviewer_scope.unauthorized_attempt',
    'operator_audit.viewed',
    'operator_audit.unauthorized_attempt',
    'proof_cleanup.monitor_viewed',
    'proof_cleanup.monitor_unauthorized_attempt',
    'proof_cleanup.manual_requested',
    'proof_cleanup.manual_completed',
    'proof_cleanup.manual_denied',
    'proof_cleanup.manual_failed'
  )
);

create or replace function public.create_beta_invite_batch_for_service(
  actor_user_id uuid,
  requested_name text,
  requested_code_hashes text[],
  requested_expires_at timestamptz default null,
  requested_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := nullif(btrim(coalesce(requested_name, '')), '');
  v_hashes text[] := coalesce(requested_code_hashes, '{}'::text[]);
  v_unique_count integer;
  v_quantity integer;
  v_batch_id uuid;
begin
  if actor_user_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'authenticated_operator_required',
      'message', 'Authenticated operator required.',
      'batch_id', null
    );
  end if;

  if not exists (
    select 1
    from public.operator_grants
    where user_id = actor_user_id
      and status = 'active'
      and revoked_at is null
      and 'operator.manage_beta_invites' = any(scopes)
  ) then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      actor_user_id,
      'operator_access.unauthorized_attempt',
      '/app/admin',
      'denied',
      jsonb_build_object(
        'reason_code', 'missing_manage_beta_invites_scope',
        'surface', 'beta_invites'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'missing_manage_beta_invites_scope',
      'message', 'Operator is not authorized to manage beta invite codes.',
      'batch_id', null
    );
  end if;

  select count(distinct hash_value)
  into v_unique_count
  from unnest(v_hashes) as hash_value
  where nullif(btrim(hash_value), '') is not null;

  v_quantity := cardinality(v_hashes);

  if v_name is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'batch_name_required',
      'message', 'Batch name required.',
      'batch_id', null
    );
  end if;

  if v_quantity < 1 or v_quantity > 100 or v_unique_count <> v_quantity then
    return jsonb_build_object(
      'ok', false,
      'code', 'invalid_batch_codes',
      'message', 'Invite code batch must include 1 to 100 unique codes.',
      'batch_id', null
    );
  end if;

  insert into public.beta_invite_batches (
    name,
    status,
    quantity,
    created_by,
    expires_at,
    notes
  )
  values (
    v_name,
    'active',
    v_quantity,
    actor_user_id,
    requested_expires_at,
    nullif(btrim(coalesce(requested_notes, '')), '')
  )
  returning id into v_batch_id;

  insert into public.beta_invite_codes (
    batch_id,
    code_hash,
    status,
    max_redemptions,
    redeemed_count,
    expires_at
  )
  select
    v_batch_id,
    btrim(hash_value),
    'active',
    1,
    0,
    requested_expires_at
  from unnest(v_hashes) as hash_value;

  insert into public.security_events (user_id, event_type, route, result, metadata)
  values (
    actor_user_id,
    'beta_invite.batch_created',
    '/app/admin',
    'created',
    jsonb_build_object(
      'batch_id', v_batch_id,
      'quantity', v_quantity,
      'expires_at_present', requested_expires_at is not null
    )
  );

  return jsonb_build_object(
    'ok', true,
    'code', 'beta_invite_batch_created',
    'message', 'Beta invite batch created.',
    'batch_id', v_batch_id
  );
end;
$$;

create or replace function public.redeem_beta_invite_code_for_service(
  target_user_id uuid,
  requested_code_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code_hash text := nullif(btrim(coalesce(requested_code_hash, '')), '');
  v_code_id uuid;
  v_batch_id uuid;
  v_now timestamptz := now();
begin
  if target_user_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'authenticated_user_required',
      'message', 'Authenticated user required.'
    );
  end if;

  if exists (
    select 1
    from public.beta_access
    where user_id = target_user_id
      and status = 'active'
      and revoked_at is null
  ) then
    return jsonb_build_object(
      'ok', false,
      'code', 'already_has_beta_access',
      'message', 'Beta access is already active.'
    );
  end if;

  select code_row.id, code_row.batch_id
  into v_code_id, v_batch_id
  from public.beta_invite_codes code_row
  join public.beta_invite_batches batch_row
    on batch_row.id = code_row.batch_id
  where code_row.code_hash = v_code_hash
    and code_row.status = 'active'
    and code_row.redeemed_count = 0
    and code_row.max_redemptions = 1
    and code_row.redeemed_at is null
    and batch_row.status = 'active'
    and (code_row.expires_at is null or code_row.expires_at > v_now)
    and (batch_row.expires_at is null or batch_row.expires_at > v_now)
  for update of code_row;

  if v_code_id is null then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      target_user_id,
      'beta_invite.redemption_failed',
      '/app/access-hold',
      'invalid_or_unavailable_code',
      jsonb_build_object(
        'reason_code', 'invalid_or_unavailable_code'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'invalid_or_unavailable_code',
      'message', 'Invite code is invalid or unavailable.'
    );
  end if;

  update public.beta_invite_codes
  set
    status = 'redeemed',
    redeemed_count = 1,
    redeemed_by_user_id = target_user_id,
    redeemed_at = v_now
  where id = v_code_id;

  insert into public.beta_access (
    user_id,
    status,
    source,
    approved_at,
    revoked_at,
    reason,
    invite_code_id
  )
  values (
    target_user_id,
    'active',
    'invite_code',
    v_now,
    null,
    'Redeemed beta invite code.',
    v_code_id
  )
  on conflict (user_id)
  do update set
    status = 'active',
    source = 'invite_code',
    approved_at = excluded.approved_at,
    revoked_at = null,
    reason = excluded.reason,
    invite_code_id = excluded.invite_code_id;

  insert into public.security_events (user_id, event_type, route, result, metadata)
  values
    (
      target_user_id,
      'beta_invite.code_redeemed',
      '/app/access-hold',
      'redeemed',
      jsonb_build_object(
        'batch_id', v_batch_id,
        'invite_code_id', v_code_id
      )
    ),
    (
      target_user_id,
      'beta_access.granted_from_invite',
      '/app/access-hold',
      'active',
      jsonb_build_object(
        'batch_id', v_batch_id,
        'invite_code_id', v_code_id
      )
    );

  return jsonb_build_object(
    'ok', true,
    'code', 'beta_invite_redeemed',
    'message', 'Beta invite code redeemed.'
  );
end;
$$;

revoke all on public.beta_invite_batches from public;
revoke all on public.beta_invite_codes from public;
revoke execute on function public.create_beta_invite_batch_for_service(uuid, text, text[], timestamptz, text) from public;
revoke execute on function public.create_beta_invite_batch_for_service(uuid, text, text[], timestamptz, text) from authenticated;
revoke execute on function public.redeem_beta_invite_code_for_service(uuid, text) from public;
revoke execute on function public.redeem_beta_invite_code_for_service(uuid, text) from authenticated;

grant execute on function public.create_beta_invite_batch_for_service(uuid, text, text[], timestamptz, text) to service_role;
grant execute on function public.redeem_beta_invite_code_for_service(uuid, text) to service_role;
