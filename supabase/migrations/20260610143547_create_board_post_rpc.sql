create or replace function public.current_user_can_create_open_board_post()
returns boolean
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_has_completed_profile boolean := false;
  v_has_operator_access boolean := false;
  v_has_active_beta_access boolean := false;
  v_has_verified_work_email boolean := false;
begin
  if v_user_id is null then
    return false;
  end if;

  select exists (
    select 1
    from public.profiles
    where profiles.id = v_user_id
      and profiles.profile_completed_at is not null
  ) into v_has_completed_profile;

  if not v_has_completed_profile then
    return false;
  end if;

  v_has_operator_access :=
    public.is_operator_with_scope('operator.internal_private_app_access');

  if v_has_operator_access then
    return true;
  end if;

  select exists (
    select 1
    from public.beta_access
    where beta_access.user_id = v_user_id
      and beta_access.status = 'active'
      and beta_access.revoked_at is null
  ) into v_has_active_beta_access;

  if not v_has_active_beta_access then
    return false;
  end if;

  select (
    exists (
      select 1
      from public.verification_requests
      inner join public.verification_evidence
        on verification_evidence.request_id = verification_requests.id
       and verification_evidence.user_id = verification_requests.user_id
       and verification_evidence.evidence_type = 'work_email'
      inner join public.approved_email_domains
        on approved_email_domains.domain = verification_evidence.metadata->>'email_domain'
       and approved_email_domains.status = 'active'
      where verification_requests.user_id = v_user_id
        and verification_requests.method = 'work_email'
        and verification_requests.status = 'approved'
        and (verification_requests.expires_at is null or verification_requests.expires_at > now())
        and verification_evidence.status = 'accepted'
        and verification_evidence.metadata->>'support_result' = 'supported_domain'
        and verification_evidence.metadata->>'verification_method' = 'work_email'
    )
    or exists (
      select 1
      from public.verification_claims
      inner join public.verification_requests
        on verification_requests.id = verification_claims.request_id
       and verification_requests.user_id = verification_claims.user_id
       and verification_requests.method = 'work_email'
      inner join public.verification_evidence
        on verification_evidence.request_id = verification_claims.request_id
       and verification_evidence.user_id = verification_claims.user_id
       and verification_evidence.evidence_type = 'work_email'
      inner join public.approved_email_domains
        on approved_email_domains.domain = verification_evidence.metadata->>'email_domain'
       and approved_email_domains.status = 'active'
      where verification_claims.user_id = v_user_id
        and verification_claims.request_id is not null
        and verification_claims.claim_type = 'airline_worker'
        and verification_claims.status = 'approved'
        and verification_claims.verification_method = 'work_email'
        and verification_claims.revoked_at is null
        and (verification_claims.expires_at is null or verification_claims.expires_at > now())
        and verification_evidence.status = 'accepted'
        and verification_evidence.metadata->>'support_result' = 'supported_domain'
        and verification_evidence.metadata->>'verification_method' = 'work_email'
    )
  ) into v_has_verified_work_email;

  return v_has_verified_work_email;
end;
$$;

create or replace function public.create_board_post(
  p_board_id uuid,
  p_title text,
  p_body text,
  p_content_type text default 'note',
  p_category text default 'general'
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_board_id uuid;
  v_title text := trim(coalesce(p_title, ''));
  v_body text := trim(coalesce(p_body, ''));
  v_content_type text := lower(trim(coalesce(nullif(p_content_type, ''), 'note')));
  v_category text := lower(trim(coalesce(nullif(p_category, ''), 'general')));
  v_post_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  if not public.current_user_can_create_open_board_post() then
    raise exception 'Contribution eligibility required'
      using errcode = '42501';
  end if;

  if p_board_id is null then
    raise exception 'Board is required'
      using errcode = '22023';
  end if;

  if char_length(v_title) = 0 then
    raise exception 'Post title is required'
      using errcode = '22023';
  end if;

  if char_length(v_title) > 120 then
    raise exception 'Post title is too long'
      using errcode = '22023';
  end if;

  if char_length(v_body) = 0 then
    raise exception 'Post body is required'
      using errcode = '22023';
  end if;

  if char_length(v_body) > 4000 then
    raise exception 'Post body is too long'
      using errcode = '22023';
  end if;

  if v_content_type not in ('note', 'question', 'recommendation', 'guide') then
    raise exception 'Unsupported post content type'
      using errcode = '22023';
  end if;

  if v_category not in (
    'general',
    'food',
    'coffee',
    'transportation',
    'fitness',
    'things_to_do',
    'crew_tips',
    'safety',
    'base_q_and_a',
    'operations_note'
  ) then
    raise exception 'Unsupported post category'
      using errcode = '22023';
  end if;

  select boards.id
  into v_board_id
  from public.boards
  inner join public.board_types
    on board_types.id = boards.board_type_id
  where boards.id = p_board_id
    and boards.status = 'active'
    and boards.visibility = 'open_verified'
    and board_types.key = 'base_board'
    and board_types.is_active = true
  limit 1;

  if v_board_id is null then
    raise exception 'Active open verified base board not found'
      using errcode = 'P0002';
  end if;

  insert into public.board_posts (
    board_id,
    author_user_id,
    title,
    body,
    content_type,
    category,
    status,
    visibility,
    is_admin_seeded,
    is_pinned
  )
  values (
    v_board_id,
    v_user_id,
    v_title,
    v_body,
    v_content_type,
    v_category,
    'published',
    'board',
    false,
    false
  )
  returning id into v_post_id;

  return v_post_id;
end;
$$;

revoke all on function public.current_user_can_create_open_board_post() from public;
revoke execute on function public.current_user_can_create_open_board_post() from anon;
grant execute on function public.current_user_can_create_open_board_post() to authenticated;
grant execute on function public.current_user_can_create_open_board_post() to service_role;

revoke all on function public.create_board_post(uuid, text, text, text, text) from public;
revoke execute on function public.create_board_post(uuid, text, text, text, text) from anon;
grant execute on function public.create_board_post(uuid, text, text, text, text) to authenticated;
grant execute on function public.create_board_post(uuid, text, text, text, text) to service_role;

comment on function public.current_user_can_create_open_board_post() is 'Returns whether the authenticated caller has DB-level open Baseboard contribution eligibility. Auth alone is not enough: callers need a completed profile plus operator internal private-app access or active beta access with verified work-email eligibility. Returns only a boolean and does not expose verification evidence details.';
comment on function public.create_board_post(uuid, text, text, text, text) is 'Server-controlled post creation foundation for active open verified Baseboards. The function uses auth.uid() as author, requires DB-level contribution eligibility, validates bounded text and allowed metadata, forces published board visibility, and does not enable restricted lounge posting, comments, saves, reactions, search, AI moderation, seed content, or proof-upload scope.';
