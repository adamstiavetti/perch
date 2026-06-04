create or replace function public.apply_verification_review_decision(
  p_request_id uuid,
  p_action text,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reviewer_id uuid := auth.uid();
  v_now timestamptz := now();
  v_request public.verification_requests%rowtype;
  v_reason text := nullif(trim(coalesce(p_reason, '')), '');
  v_next_status text;
  v_requested_claim_types text[] := '{}'::text[];
  v_work_email_evidence public.verification_evidence%rowtype;
  v_supported_airline text := null;
  v_can_issue_airline_worker boolean := false;
  v_can_issue_airline boolean := false;
  v_inserted_claim public.verification_claims%rowtype;
  v_issued_claims jsonb := '[]'::jsonb;
begin
  if v_reviewer_id is null then
    raise exception 'Authenticated reviewer required.';
  end if;

  if p_action not in ('approve', 'reject', 'request_resubmission') then
    raise exception 'Unsupported verification review action.';
  end if;

  select *
  into v_request
  from public.verification_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'Verification request not found.';
  end if;

  if v_request.user_id = v_reviewer_id then
    raise exception 'Reviewers cannot review their own verification requests.';
  end if;

  if not public.can_review_verification_request(v_reviewer_id, v_request.user_id, v_request.id) then
    raise exception 'Reviewer is not authorized to review this verification request.';
  end if;

  if v_request.status not in ('submitted', 'pending_review') then
    raise exception 'Verification request is not currently in a reviewable state.';
  end if;

  v_requested_claim_types := coalesce(v_request.requested_claim_types, '{}'::text[]);
  v_next_status := case
    when p_action = 'approve' then 'approved'
    when p_action = 'reject' then 'rejected'
    else 'needs_resubmission'
  end;

  if p_action = 'approve' then
    if v_request.method <> 'work_email' then
      raise exception 'This verification request does not contain enough approved evidence metadata to issue any supported claims.';
    end if;

    select *
    into v_work_email_evidence
    from public.verification_evidence
    where request_id = v_request.id
      and evidence_type = 'work_email'
      and metadata ->> 'support_result' = 'supported_domain'
      and metadata ->> 'verification_method' = 'work_email'
    order by created_at asc
    limit 1;

    if not found then
      raise exception 'This verification request does not contain enough approved evidence metadata to issue any supported claims.';
    end if;

    v_supported_airline := nullif(trim(coalesce(v_work_email_evidence.metadata ->> 'airline', '')), '');
    v_can_issue_airline_worker := 'airline_worker' = any (v_requested_claim_types);
    v_can_issue_airline := 'airline' = any (v_requested_claim_types) and v_supported_airline is not null;

    if not v_can_issue_airline_worker and not v_can_issue_airline then
      raise exception 'This verification request does not contain enough approved evidence metadata to issue any supported claims.';
    end if;
  end if;

  update public.verification_requests
  set
    status = v_next_status,
    reviewed_by = v_reviewer_id,
    reviewed_at = v_now,
    reason = case
      when p_action = 'approve' then null
      else v_reason
    end
  where id = v_request.id;

  if p_action = 'approve' and v_can_issue_airline_worker then
    if not exists (
      select 1
      from public.verification_claims
      where user_id = v_request.user_id
        and claim_type = 'airline_worker'
        and claim_value is null
        and status = 'approved'
        and revoked_at is null
        and (expires_at is null or expires_at > v_now)
    ) then
      insert into public.verification_claims (
        user_id,
        request_id,
        claim_type,
        claim_value,
        status,
        verification_method,
        approved_by,
        approved_at,
        expires_at,
        reason
      )
      values (
        v_request.user_id,
        v_request.id,
        'airline_worker',
        null,
        'approved',
        'work_email',
        v_reviewer_id,
        v_now,
        v_now + interval '365 days',
        null
      )
      returning *
      into v_inserted_claim;

      v_issued_claims := v_issued_claims || jsonb_build_array(
        jsonb_build_object(
          'id', v_inserted_claim.id,
          'claim_type', v_inserted_claim.claim_type,
          'claim_value', v_inserted_claim.claim_value
        )
      );
    end if;
  end if;

  if p_action = 'approve' and v_can_issue_airline then
    if not exists (
      select 1
      from public.verification_claims
      where user_id = v_request.user_id
        and claim_type = 'airline'
        and lower(coalesce(claim_value, '')) = lower(v_supported_airline)
        and status = 'approved'
        and revoked_at is null
        and (expires_at is null or expires_at > v_now)
    ) then
      insert into public.verification_claims (
        user_id,
        request_id,
        claim_type,
        claim_value,
        status,
        verification_method,
        approved_by,
        approved_at,
        expires_at,
        reason
      )
      values (
        v_request.user_id,
        v_request.id,
        'airline',
        v_supported_airline,
        'approved',
        'work_email',
        v_reviewer_id,
        v_now,
        v_now + interval '180 days',
        null
      )
      returning *
      into v_inserted_claim;

      v_issued_claims := v_issued_claims || jsonb_build_array(
        jsonb_build_object(
          'id', v_inserted_claim.id,
          'claim_type', v_inserted_claim.claim_type,
          'claim_value', v_inserted_claim.claim_value
        )
      );
    end if;
  end if;

  insert into public.verification_review_actions (
    request_id,
    claim_id,
    reviewer_id,
    action,
    notes
  )
  values (
    v_request.id,
    null,
    v_reviewer_id,
    p_action,
    v_reason
  );

  return jsonb_build_object(
    'request_id', v_request.id,
    'final_request_status', v_next_status,
    'action', p_action,
    'issued_claims', v_issued_claims
  );
end;
$$;

revoke all on function public.apply_verification_review_decision(uuid, text, text) from public;
grant execute on function public.apply_verification_review_decision(uuid, text, text) to authenticated;
