alter table public.verification_reviewer_scopes
add column if not exists revoked_by uuid references auth.users (id),
add column if not exists revoked_at timestamptz;

with ranked_active_scopes as (
  select
    id,
    row_number() over (
      partition by
        reviewer_id,
        scope_type,
        lower(btrim(coalesce(scope_value, '')))
      order by
        created_at asc nulls last,
        id asc
    ) as duplicate_rank
  from public.verification_reviewer_scopes
  where status = 'active'
),
duplicate_active_scopes as (
  select id
  from ranked_active_scopes
  where duplicate_rank > 1
)
update public.verification_reviewer_scopes as scope
set
  status = 'revoked',
  revoked_at = now(),
  revoked_by = null
from duplicate_active_scopes
where scope.id = duplicate_active_scopes.id;

create unique index if not exists verification_reviewer_scopes_one_active_scope_idx
on public.verification_reviewer_scopes (
  reviewer_id,
  scope_type,
  (lower(btrim(coalesce(scope_value, ''))))
)
where status = 'active';

comment on column public.verification_reviewer_scopes.revoked_by is 'Operator who soft-revoked this reviewer scope, when revoked through operator tooling.';
comment on column public.verification_reviewer_scopes.revoked_at is 'Timestamp when this reviewer scope was soft-revoked. Existing verification history is preserved.';

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
    'reviewer_scope.unauthorized_attempt'
  )
);

create or replace function public.normalize_verification_reviewer_scope_type(
  requested_scope_type text
)
returns text
language sql
immutable
as $$
  select nullif(lower(btrim(coalesce(requested_scope_type, ''))), '');
$$;

create or replace function public.normalize_verification_reviewer_scope_value(
  requested_scope_type text,
  requested_scope_value text
)
returns text
language sql
immutable
as $$
  select case
    when public.normalize_verification_reviewer_scope_type(requested_scope_type) = 'global'
      then null
    else nullif(lower(btrim(coalesce(requested_scope_value, ''))), '')
  end;
$$;

create or replace function public.verification_reviewer_scope_input_valid(
  requested_scope_type text,
  requested_scope_value text
)
returns boolean
language sql
immutable
as $$
  select
    public.normalize_verification_reviewer_scope_type(requested_scope_type)
      in ('global', 'airline', 'role', 'base')
    and (
      public.normalize_verification_reviewer_scope_type(requested_scope_type) = 'global'
      or public.normalize_verification_reviewer_scope_value(
        requested_scope_type,
        requested_scope_value
      ) is not null
    );
$$;

create or replace function public.list_verification_reviewer_scopes_for_operator()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
begin
  if v_actor_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'authenticated_operator_required',
      'message', 'Authenticated operator required.',
      'reviewer_scopes', jsonb_build_array()
    );
  end if;

  if not public.is_operator_with_scope('operator.manage_reviewer_scopes') then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'reviewer_scope.unauthorized_attempt',
      '/app/admin/reviewer-scopes',
      'denied',
      jsonb_build_object(
        'reason_code', 'missing_manage_reviewer_scopes_scope'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'missing_manage_reviewer_scopes_scope',
      'message', 'Operator is not authorized to manage reviewer scopes.',
      'reviewer_scopes', jsonb_build_array()
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'code', 'verification_reviewer_scopes_listed',
    'reviewer_scopes',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id', id,
              'reviewer_id', reviewer_id,
              'scope_type', scope_type,
              'scope_value', scope_value,
              'status', status,
              'granted_by', granted_by,
              'revoked_by', revoked_by,
              'reason', reason,
              'created_at', created_at,
              'updated_at', updated_at,
              'revoked_at', revoked_at
            )
            order by created_at desc
          )
          from public.verification_reviewer_scopes
        ),
        jsonb_build_array()
      )
  );
end;
$$;

create or replace function public.grant_verification_reviewer_scope(
  target_user_id uuid,
  requested_scope_type text,
  requested_scope_value text default null,
  reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_now timestamptz := now();
  v_reason text := nullif(btrim(coalesce(reason, '')), '');
  v_scope_type text := public.normalize_verification_reviewer_scope_type(requested_scope_type);
  v_scope_value text := public.normalize_verification_reviewer_scope_value(
    requested_scope_type,
    requested_scope_value
  );
  v_scope_id uuid;
  v_constraint_name text;
begin
  if v_actor_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'authenticated_operator_required',
      'reviewer_scope_id', null,
      'message', 'Authenticated operator required.'
    );
  end if;

  if not public.is_operator_with_scope('operator.manage_reviewer_scopes') then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'reviewer_scope.unauthorized_attempt',
      '/app/admin/reviewer-scopes',
      'denied',
      jsonb_build_object(
        'target_user_id', target_user_id,
        'scope_type', v_scope_type,
        'scope_value', v_scope_value,
        'reason_code', 'missing_manage_reviewer_scopes_scope'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'missing_manage_reviewer_scopes_scope',
      'reviewer_scope_id', null,
      'message', 'Operator is not authorized to manage reviewer scopes.'
    );
  end if;

  if target_user_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'target_user_required',
      'reviewer_scope_id', null,
      'message', 'Target user id required.'
    );
  end if;

  if target_user_id = v_actor_id then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'reviewer_scope.unauthorized_attempt',
      '/app/admin/reviewer-scopes',
      'denied',
      jsonb_build_object(
        'target_user_id', target_user_id,
        'scope_type', v_scope_type,
        'scope_value', v_scope_value,
        'reason_code', 'self_grant_blocked'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'self_grant_blocked',
      'reviewer_scope_id', null,
      'message', 'Operators cannot grant reviewer scope to themselves.'
    );
  end if;

  if not public.verification_reviewer_scope_input_valid(
    requested_scope_type,
    requested_scope_value
  ) then
    return jsonb_build_object(
      'ok', false,
      'code', 'invalid_reviewer_scope',
      'reviewer_scope_id', null,
      'message', 'Reviewer scope type or value is invalid.'
    );
  end if;

  if exists (
    select 1
    from public.verification_reviewer_scopes
    where reviewer_id = target_user_id
      and scope_type = v_scope_type
      and lower(btrim(coalesce(scope_value, ''))) = coalesce(v_scope_value, '')
      and status = 'active'
  ) then
    return jsonb_build_object(
      'ok', false,
      'code', 'duplicate_active_reviewer_scope',
      'reviewer_scope_id', null,
      'message', 'Target user already has that active reviewer scope.'
    );
  end if;

  begin
    insert into public.verification_reviewer_scopes (
      reviewer_id,
      scope_type,
      scope_value,
      status,
      granted_by,
      reason
    )
    values (
      target_user_id,
      v_scope_type,
      v_scope_value,
      'active',
      v_actor_id,
      v_reason
    )
    returning id into v_scope_id;
  exception
    when unique_violation then
      get stacked diagnostics v_constraint_name = constraint_name;

      if v_constraint_name = 'verification_reviewer_scopes_one_active_scope_idx' then
        return jsonb_build_object(
          'ok', false,
          'code', 'duplicate_active_reviewer_scope',
          'reviewer_scope_id', null,
          'message', 'Target user already has that active reviewer scope.'
        );
      end if;

      raise;
  end;

  insert into public.security_events (user_id, event_type, route, result, metadata)
  values (
    v_actor_id,
    'reviewer_scope.granted',
    '/app/admin/reviewer-scopes',
    'granted',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'scope_type', v_scope_type,
      'scope_value', v_scope_value,
      'reason_present', v_reason is not null,
      'granted_at', v_now
    )
  );

  return jsonb_build_object(
    'ok', true,
    'code', 'reviewer_scope_granted',
    'reviewer_scope_id', v_scope_id,
    'reviewer_id', target_user_id,
    'scope_type', v_scope_type,
    'scope_value', v_scope_value,
    'status', 'active',
    'message', null
  );
end;
$$;

create or replace function public.revoke_verification_reviewer_scope(
  target_scope_id uuid,
  reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_now timestamptz := now();
  v_reason text := nullif(btrim(coalesce(reason, '')), '');
  v_existing public.verification_reviewer_scopes%rowtype;
begin
  if v_actor_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'authenticated_operator_required',
      'reviewer_scope_id', null,
      'message', 'Authenticated operator required.'
    );
  end if;

  if not public.is_operator_with_scope('operator.manage_reviewer_scopes') then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'reviewer_scope.unauthorized_attempt',
      '/app/admin/reviewer-scopes',
      'denied',
      jsonb_build_object(
        'target_scope_id', target_scope_id,
        'reason_code', 'missing_manage_reviewer_scopes_scope'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'missing_manage_reviewer_scopes_scope',
      'reviewer_scope_id', null,
      'message', 'Operator is not authorized to manage reviewer scopes.'
    );
  end if;

  if target_scope_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'target_scope_required',
      'reviewer_scope_id', null,
      'message', 'Reviewer scope id required.'
    );
  end if;

  select *
  into v_existing
  from public.verification_reviewer_scopes
  where id = target_scope_id
    and status = 'active'
  for update;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'code', 'target_scope_not_active',
      'reviewer_scope_id', null,
      'message', 'Reviewer scope is not active.'
    );
  end if;

  if v_existing.reviewer_id = v_actor_id then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'reviewer_scope.unauthorized_attempt',
      '/app/admin/reviewer-scopes',
      'denied',
      jsonb_build_object(
        'target_scope_id', target_scope_id,
        'reason_code', 'self_revoke_blocked'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'self_revoke_blocked',
      'reviewer_scope_id', target_scope_id,
      'message', 'Operators cannot revoke their own reviewer scope in this slice.'
    );
  end if;

  update public.verification_reviewer_scopes
  set
    status = 'revoked',
    revoked_by = v_actor_id,
    revoked_at = v_now,
    reason = v_reason
  where id = v_existing.id;

  insert into public.security_events (user_id, event_type, route, result, metadata)
  values (
    v_actor_id,
    'reviewer_scope.revoked',
    '/app/admin/reviewer-scopes',
    'revoked',
    jsonb_build_object(
      'target_user_id', v_existing.reviewer_id,
      'target_scope_id', v_existing.id,
      'scope_type', v_existing.scope_type,
      'scope_value', v_existing.scope_value,
      'reason_present', v_reason is not null,
      'revoked_at', v_now
    )
  );

  return jsonb_build_object(
    'ok', true,
    'code', 'reviewer_scope_revoked',
    'reviewer_scope_id', v_existing.id,
    'reviewer_id', v_existing.reviewer_id,
    'scope_type', v_existing.scope_type,
    'scope_value', v_existing.scope_value,
    'status', 'revoked',
    'message', null
  );
end;
$$;

revoke execute on function public.list_verification_reviewer_scopes_for_operator() from public;
revoke execute on function public.grant_verification_reviewer_scope(uuid, text, text, text) from public;
revoke execute on function public.revoke_verification_reviewer_scope(uuid, text) from public;

grant execute on function public.list_verification_reviewer_scopes_for_operator() to authenticated;
grant execute on function public.grant_verification_reviewer_scope(uuid, text, text, text) to authenticated;
grant execute on function public.revoke_verification_reviewer_scope(uuid, text) to authenticated;
