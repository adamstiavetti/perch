create or replace function public.normalize_approved_email_domain(raw_domain text)
returns text
language sql
immutable
as $$
  select nullif(lower(btrim(coalesce(raw_domain, ''))), '');
$$;

create or replace function public.approved_email_domain_format_valid(raw_domain text)
returns boolean
language sql
immutable
as $$
  select
    public.normalize_approved_email_domain(raw_domain) is not null
    and public.normalize_approved_email_domain(raw_domain) !~ '[@/:?#]'
    and public.normalize_approved_email_domain(raw_domain) ~ '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$';
$$;

create or replace function public.personal_email_domain_values()
returns text[]
language sql
immutable
as $$
  select array[
    'aol.com',
    'fastmail.com',
    'gmail.com',
    'gmx.com',
    'googlemail.com',
    'hey.com',
    'hotmail.com',
    'icloud.com',
    'live.com',
    'me.com',
    'msn.com',
    'outlook.com',
    'pm.me',
    'proton.me',
    'protonmail.com',
    'yahoo.com',
    'yandex.com',
    'zoho.com'
  ]::text[];
$$;

create or replace function public.is_personal_approved_email_domain(raw_domain text)
returns boolean
language sql
immutable
as $$
  select coalesce(
    public.normalize_approved_email_domain(raw_domain) = any (public.personal_email_domain_values()),
    false
  );
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
    'approved_email_domain.unauthorized_attempt'
  )
);

create or replace function public.list_approved_email_domains_for_operator()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_domains jsonb;
begin
  if v_actor_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'authenticated_operator_required',
      'domains', '[]'::jsonb,
      'message', 'Authenticated operator required.'
    );
  end if;

  if not public.is_operator_with_scope('operator.manage_approved_domains') then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'approved_email_domain.unauthorized_attempt',
      '/app/admin/approved-domains',
      'denied',
      jsonb_build_object(
        'reason_code', 'missing_manage_approved_domains_scope'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'missing_manage_approved_domains_scope',
      'domains', '[]'::jsonb,
      'message', 'Operator scope required to manage approved domains.'
    );
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'domain', domain,
        'airline', airline,
        'status', status,
        'created_at', created_at,
        'updated_at', updated_at
      )
      order by
        case when status = 'active' then 0 else 1 end,
        domain asc
    ),
    '[]'::jsonb
  )
  into v_domains
  from public.approved_email_domains;

  return jsonb_build_object(
    'ok', true,
    'code', 'approved_email_domains_listed',
    'domains', v_domains
  );
end;
$$;

create or replace function public.create_approved_email_domain(
  requested_domain text,
  requested_airline text default null,
  requested_status text default 'active',
  reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_domain text := public.normalize_approved_email_domain(requested_domain);
  v_airline text := nullif(btrim(coalesce(requested_airline, '')), '');
  v_status text := lower(btrim(coalesce(requested_status, 'active')));
  v_reason text := nullif(btrim(coalesce(reason, '')), '');
  v_existing_id uuid;
  v_existing_status text;
  v_domain_id uuid;
  v_constraint_name text;
begin
  if v_actor_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'authenticated_operator_required',
      'approved_domain_id', null,
      'message', 'Authenticated operator required.'
    );
  end if;

  if not public.is_operator_with_scope('operator.manage_approved_domains') then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'approved_email_domain.unauthorized_attempt',
      '/app/admin/approved-domains',
      'denied',
      jsonb_build_object(
        'domain', v_domain,
        'status', v_status,
        'reason_code', 'missing_manage_approved_domains_scope'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'missing_manage_approved_domains_scope',
      'approved_domain_id', null,
      'message', 'Operator scope required to manage approved domains.'
    );
  end if;

  if not public.approved_email_domain_format_valid(requested_domain) then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'approved_email_domain.unauthorized_attempt',
      '/app/admin/approved-domains',
      'denied',
      jsonb_build_object(
        'domain', v_domain,
        'status', v_status,
        'reason_code', 'invalid_domain_format'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'invalid_domain_format',
      'approved_domain_id', null,
      'message', 'Enter a valid work-email domain without protocol, path, or email local-part.'
    );
  end if;

  if public.is_personal_approved_email_domain(v_domain) then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'approved_email_domain.unauthorized_attempt',
      '/app/admin/approved-domains',
      'denied',
      jsonb_build_object(
        'domain', v_domain,
        'status', v_status,
        'reason_code', 'personal_email_domain_blocked'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'personal_email_domain_blocked',
      'approved_domain_id', null,
      'message', 'Personal email domains cannot be approved for work-email verification.'
    );
  end if;

  if v_status not in ('active', 'disabled') then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'approved_email_domain.unauthorized_attempt',
      '/app/admin/approved-domains',
      'denied',
      jsonb_build_object(
        'domain', v_domain,
        'status', v_status,
        'reason_code', 'invalid_status'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'invalid_status',
      'approved_domain_id', null,
      'message', 'Approved domain status must be active or disabled.'
    );
  end if;

  select id, status
  into v_existing_id, v_existing_status
  from public.approved_email_domains
  where domain = v_domain
  limit 1;

  if v_existing_id is not null then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'approved_email_domain.unauthorized_attempt',
      '/app/admin/approved-domains',
      'denied',
      jsonb_build_object(
        'approved_domain_id', v_existing_id,
        'domain', v_domain,
        'status', v_existing_status,
        'reason_code',
          case when v_existing_status = 'active' then 'duplicate_active_domain' else 'domain_already_exists' end
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code',
        case when v_existing_status = 'active' then 'duplicate_active_domain' else 'domain_already_exists' end,
      'approved_domain_id', v_existing_id,
      'message',
        case
          when v_existing_status = 'active' then 'This approved domain already exists as an active record.'
          else 'This domain already exists. Update or reactivate the existing record instead.'
        end
    );
  end if;

  begin
    insert into public.approved_email_domains (
      domain,
      airline,
      status
    )
    values (
      v_domain,
      v_airline,
      v_status
    )
    returning id into v_domain_id;
  exception
    when unique_violation then
      get stacked diagnostics v_constraint_name = constraint_name;

      if v_constraint_name = 'approved_email_domains_domain_key' then
        insert into public.security_events (user_id, event_type, route, result, metadata)
        values (
          v_actor_id,
          'approved_email_domain.unauthorized_attempt',
          '/app/admin/approved-domains',
          'denied',
          jsonb_build_object(
            'domain', v_domain,
            'status', v_status,
            'reason_code', 'domain_already_exists'
          )
        );

        return jsonb_build_object(
          'ok', false,
          'code', 'domain_already_exists',
          'approved_domain_id', null,
          'message', 'This domain already exists. Update or reactivate the existing record instead.'
        );
      end if;

      raise;
  end;

  insert into public.security_events (user_id, event_type, route, result, metadata)
  values (
    v_actor_id,
    'approved_email_domain.created',
    '/app/admin/approved-domains',
    v_status,
    jsonb_build_object(
      'approved_domain_id', v_domain_id,
      'domain', v_domain,
      'status', v_status,
      'reason_present', v_reason is not null
    )
  );

  return jsonb_build_object(
    'ok', true,
    'code', 'approved_email_domain_created',
    'approved_domain_id', v_domain_id,
    'message', 'Approved domain created.'
  );
end;
$$;

create or replace function public.update_approved_email_domain(
  target_domain_id uuid,
  requested_domain text,
  requested_airline text default null,
  requested_status text default 'active',
  reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_domain text := public.normalize_approved_email_domain(requested_domain);
  v_airline text := nullif(btrim(coalesce(requested_airline, '')), '');
  v_status text := lower(btrim(coalesce(requested_status, 'active')));
  v_reason text := nullif(btrim(coalesce(reason, '')), '');
  v_existing_domain text;
  v_existing_status text;
  v_conflict_id uuid;
  v_constraint_name text;
  v_event_type text;
  v_result text;
  v_code text;
  v_message text;
begin
  if v_actor_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'authenticated_operator_required',
      'approved_domain_id', null,
      'message', 'Authenticated operator required.'
    );
  end if;

  if not public.is_operator_with_scope('operator.manage_approved_domains') then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'approved_email_domain.unauthorized_attempt',
      '/app/admin/approved-domains',
      'denied',
      jsonb_build_object(
        'approved_domain_id', target_domain_id,
        'domain', v_domain,
        'status', v_status,
        'reason_code', 'missing_manage_approved_domains_scope'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'missing_manage_approved_domains_scope',
      'approved_domain_id', target_domain_id,
      'message', 'Operator scope required to manage approved domains.'
    );
  end if;

  if target_domain_id is null then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'approved_email_domain.unauthorized_attempt',
      '/app/admin/approved-domains',
      'denied',
      jsonb_build_object(
        'domain', v_domain,
        'status', v_status,
        'reason_code', 'approved_domain_id_required'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'approved_domain_id_required',
      'approved_domain_id', null,
      'message', 'Approved domain id required.'
    );
  end if;

  select domain, status
  into v_existing_domain, v_existing_status
  from public.approved_email_domains
  where id = target_domain_id
  limit 1;

  if v_existing_domain is null then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'approved_email_domain.unauthorized_attempt',
      '/app/admin/approved-domains',
      'denied',
      jsonb_build_object(
        'approved_domain_id', target_domain_id,
        'reason_code', 'domain_not_found'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'domain_not_found',
      'approved_domain_id', target_domain_id,
      'message', 'Approved domain not found.'
    );
  end if;

  if not public.approved_email_domain_format_valid(requested_domain) then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'approved_email_domain.unauthorized_attempt',
      '/app/admin/approved-domains',
      'denied',
      jsonb_build_object(
        'approved_domain_id', target_domain_id,
        'domain', v_domain,
        'status', v_status,
        'reason_code', 'invalid_domain_format'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'invalid_domain_format',
      'approved_domain_id', target_domain_id,
      'message', 'Enter a valid work-email domain without protocol, path, or email local-part.'
    );
  end if;

  if public.is_personal_approved_email_domain(v_domain) then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'approved_email_domain.unauthorized_attempt',
      '/app/admin/approved-domains',
      'denied',
      jsonb_build_object(
        'approved_domain_id', target_domain_id,
        'domain', v_domain,
        'status', v_status,
        'reason_code', 'personal_email_domain_blocked'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'personal_email_domain_blocked',
      'approved_domain_id', target_domain_id,
      'message', 'Personal email domains cannot be approved for work-email verification.'
    );
  end if;

  if v_status not in ('active', 'disabled') then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'approved_email_domain.unauthorized_attempt',
      '/app/admin/approved-domains',
      'denied',
      jsonb_build_object(
        'approved_domain_id', target_domain_id,
        'domain', v_domain,
        'status', v_status,
        'reason_code', 'invalid_status'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'invalid_status',
      'approved_domain_id', target_domain_id,
      'message', 'Approved domain status must be active or disabled.'
    );
  end if;

  select id
  into v_conflict_id
  from public.approved_email_domains
  where domain = v_domain
    and id <> target_domain_id
  limit 1;

  if v_conflict_id is not null then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'approved_email_domain.unauthorized_attempt',
      '/app/admin/approved-domains',
      'denied',
      jsonb_build_object(
        'approved_domain_id', target_domain_id,
        'conflict_domain_id', v_conflict_id,
        'domain', v_domain,
        'status', v_status,
        'reason_code', 'duplicate_active_domain'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'duplicate_active_domain',
      'approved_domain_id', target_domain_id,
      'message', 'Another approved domain record already uses that domain.'
    );
  end if;

  begin
    update public.approved_email_domains
    set
      domain = v_domain,
      airline = v_airline,
      status = v_status
    where id = target_domain_id;
  exception
    when unique_violation then
      get stacked diagnostics v_constraint_name = constraint_name;

      if v_constraint_name = 'approved_email_domains_domain_key' then
        insert into public.security_events (user_id, event_type, route, result, metadata)
        values (
          v_actor_id,
          'approved_email_domain.unauthorized_attempt',
          '/app/admin/approved-domains',
          'denied',
          jsonb_build_object(
            'approved_domain_id', target_domain_id,
            'domain', v_domain,
            'status', v_status,
            'reason_code', 'domain_already_exists'
          )
        );

        return jsonb_build_object(
          'ok', false,
          'code', 'domain_already_exists',
          'approved_domain_id', target_domain_id,
          'message', 'Another approved domain record already uses that domain.'
        );
      end if;

      raise;
  end;

  v_event_type := case
    when v_status = 'disabled' and v_existing_status <> 'disabled'
      then 'approved_email_domain.disabled'
    else 'approved_email_domain.updated'
  end;
  v_result := case
    when v_status = 'disabled' and v_existing_status <> 'disabled'
      then 'disabled'
    else v_status
  end;
  v_code := case
    when v_status = 'disabled' and v_existing_status <> 'disabled'
      then 'approved_email_domain_disabled'
    else 'approved_email_domain_updated'
  end;
  v_message := case
    when v_status = 'disabled' and v_existing_status <> 'disabled'
      then 'Approved domain disabled.'
    else 'Approved domain updated.'
  end;

  insert into public.security_events (user_id, event_type, route, result, metadata)
  values (
    v_actor_id,
    v_event_type,
    '/app/admin/approved-domains',
    v_result,
    jsonb_build_object(
      'approved_domain_id', target_domain_id,
      'domain', v_domain,
      'previous_domain', v_existing_domain,
      'status', v_status,
      'previous_status', v_existing_status,
      'reason_present', v_reason is not null
    )
  );

  return jsonb_build_object(
    'ok', true,
    'code', v_code,
    'approved_domain_id', target_domain_id,
    'message', v_message
  );
end;
$$;

create or replace function public.disable_approved_email_domain(
  target_domain_id uuid,
  reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_reason text := nullif(btrim(coalesce(reason, '')), '');
  v_domain text;
  v_status text;
begin
  if v_actor_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'authenticated_operator_required',
      'approved_domain_id', null,
      'message', 'Authenticated operator required.'
    );
  end if;

  if not public.is_operator_with_scope('operator.manage_approved_domains') then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'approved_email_domain.unauthorized_attempt',
      '/app/admin/approved-domains',
      'denied',
      jsonb_build_object(
        'approved_domain_id', target_domain_id,
        'reason_code', 'missing_manage_approved_domains_scope'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'missing_manage_approved_domains_scope',
      'approved_domain_id', target_domain_id,
      'message', 'Operator scope required to manage approved domains.'
    );
  end if;

  if target_domain_id is null then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'approved_email_domain.unauthorized_attempt',
      '/app/admin/approved-domains',
      'denied',
      jsonb_build_object(
        'reason_code', 'approved_domain_id_required'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'approved_domain_id_required',
      'approved_domain_id', null,
      'message', 'Approved domain id required.'
    );
  end if;

  select domain, status
  into v_domain, v_status
  from public.approved_email_domains
  where id = target_domain_id
  limit 1;

  if v_domain is null then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'approved_email_domain.unauthorized_attempt',
      '/app/admin/approved-domains',
      'denied',
      jsonb_build_object(
        'approved_domain_id', target_domain_id,
        'reason_code', 'domain_not_found'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'domain_not_found',
      'approved_domain_id', target_domain_id,
      'message', 'Approved domain not found.'
    );
  end if;

  if v_status = 'disabled' then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'approved_email_domain.unauthorized_attempt',
      '/app/admin/approved-domains',
      'denied',
      jsonb_build_object(
        'approved_domain_id', target_domain_id,
        'domain', v_domain,
        'reason_code', 'domain_already_disabled'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'domain_already_disabled',
      'approved_domain_id', target_domain_id,
      'message', 'Approved domain is already disabled.'
    );
  end if;

  update public.approved_email_domains
  set status = 'disabled'
  where id = target_domain_id;

  insert into public.security_events (user_id, event_type, route, result, metadata)
  values (
    v_actor_id,
    'approved_email_domain.disabled',
    '/app/admin/approved-domains',
    'disabled',
    jsonb_build_object(
      'approved_domain_id', target_domain_id,
      'domain', v_domain,
      'reason_present', v_reason is not null
    )
  );

  return jsonb_build_object(
    'ok', true,
    'code', 'approved_email_domain_disabled',
    'approved_domain_id', target_domain_id,
    'message', 'Approved domain disabled.'
  );
end;
$$;

revoke all on function public.list_approved_email_domains_for_operator() from public;
revoke all on function public.create_approved_email_domain(text, text, text, text) from public;
revoke all on function public.update_approved_email_domain(uuid, text, text, text, text) from public;
revoke all on function public.disable_approved_email_domain(uuid, text) from public;

grant execute on function public.list_approved_email_domains_for_operator() to authenticated;
grant execute on function public.create_approved_email_domain(text, text, text, text) to authenticated;
grant execute on function public.update_approved_email_domain(uuid, text, text, text, text) to authenticated;
grant execute on function public.disable_approved_email_domain(uuid, text) to authenticated;
