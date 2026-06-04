create or replace function public.create_redacted_proof_verification_submission(
  p_request_id uuid,
  p_evidence_id uuid,
  p_storage_bucket text,
  p_storage_path text,
  p_file_size_bytes bigint,
  p_mime_type text,
  p_original_extension text,
  p_requested_airline text,
  p_routing_context_source text,
  p_upload_client text default 'web',
  p_redaction_acknowledged boolean default true,
  p_submitted_at timestamptz default now(),
  p_delete_after timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_submitted_at timestamptz := coalesce(p_submitted_at, now());
  v_delete_after timestamptz := coalesce(
    p_delete_after,
    coalesce(p_submitted_at, now()) + interval '30 days'
  );
  v_upload_client text := coalesce(nullif(trim(p_upload_client), ''), 'web');
  v_original_extension text := lower(trim(coalesce(p_original_extension, '')));
  v_requested_airline text := nullif(regexp_replace(coalesce(p_requested_airline, ''), '\s+', ' ', 'g'), '');
  v_routing_context_source text := lower(trim(coalesce(p_routing_context_source, '')));
begin
  if v_user_id is null then
    raise exception 'Authentication required for redacted proof submission.';
  end if;

  if p_request_id is null or p_evidence_id is null then
    raise exception 'Request and evidence identifiers are required.';
  end if;

  if p_storage_bucket <> 'verification-proofs' then
    raise exception 'Invalid verification proof bucket.';
  end if;

  if p_storage_path is null or p_storage_path !~ (
    '^'
    || v_user_id::text
    || '/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}[.](jpg|jpeg|png)$'
  ) then
    raise exception 'Invalid verification proof storage path.';
  end if;

  if p_file_size_bytes is null or p_file_size_bytes <= 0 or p_file_size_bytes > 5242880 then
    raise exception 'Verification proof file size is out of bounds.';
  end if;

  if p_mime_type not in ('image/jpeg', 'image/png') then
    raise exception 'Verification proof mime type is not allowed.';
  end if;

  if v_original_extension not in ('jpg', 'jpeg', 'png') then
    raise exception 'Verification proof extension is not allowed.';
  end if;

  if v_requested_airline is null then
    raise exception 'Requested airline routing context is required.';
  end if;

  if v_routing_context_source not in ('profile_claimed_airline', 'self_declared') then
    raise exception 'Invalid routing context source.';
  end if;

  if not coalesce(p_redaction_acknowledged, false) then
    raise exception 'Redaction acknowledgement is required.';
  end if;

  if v_delete_after <= v_submitted_at then
    raise exception 'Verification proof delete_after must be after submitted_at.';
  end if;

  if exists (
    select 1
    from public.verification_requests
    where user_id = v_user_id
      and method = 'redacted_badge_or_proof'
      and status in ('submitted', 'pending_review', 'needs_resubmission')
  ) then
    raise exception 'An active redacted proof verification request already exists.';
  end if;

  insert into public.verification_requests (
    id,
    user_id,
    status,
    requested_claim_types,
    method,
    submitted_at
  )
  values (
    p_request_id,
    v_user_id,
    'submitted',
    array['airline_worker']::text[],
    'redacted_badge_or_proof',
    v_submitted_at
  );

  insert into public.verification_evidence (
    id,
    request_id,
    user_id,
    evidence_type,
    storage_bucket,
    storage_path,
    redaction_acknowledged,
    status,
    uploaded_at,
    delete_after,
    metadata
  )
  values (
    p_evidence_id,
    p_request_id,
    v_user_id,
    'redacted_badge_or_proof',
    p_storage_bucket,
    p_storage_path,
    true,
    'submitted',
    v_submitted_at,
    v_delete_after,
    jsonb_build_object(
      'file_size_bytes', p_file_size_bytes,
      'mime_type', p_mime_type,
      'original_extension', v_original_extension,
      'upload_client', v_upload_client,
      'redaction_acknowledged', true,
      'evidence_method', 'redacted_badge_or_proof',
      'requested_airline', v_requested_airline,
      'routing_context_source', v_routing_context_source
    )
  );

  return jsonb_build_object(
    'request_id', p_request_id,
    'evidence_id', p_evidence_id,
    'request_status', 'submitted',
    'evidence_status', 'submitted'
  );
end;
$$;

revoke all on function public.create_redacted_proof_verification_submission(
  uuid,
  uuid,
  text,
  text,
  bigint,
  text,
  text,
  text,
  text,
  text,
  boolean,
  timestamptz,
  timestamptz
) from public;

grant execute on function public.create_redacted_proof_verification_submission(
  uuid,
  uuid,
  text,
  text,
  bigint,
  text,
  text,
  text,
  text,
  text,
  boolean,
  timestamptz,
  timestamptz
) to authenticated;
