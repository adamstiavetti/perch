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

revoke all on function public.create_board_post(uuid, text, text, text, text) from public;
revoke execute on function public.create_board_post(uuid, text, text, text, text) from anon;
grant execute on function public.create_board_post(uuid, text, text, text, text) to authenticated;
grant execute on function public.create_board_post(uuid, text, text, text, text) to service_role;

comment on function public.create_board_post(uuid, text, text, text, text) is 'Server-controlled post creation foundation for active open verified Baseboards. The function uses auth.uid() as author, validates bounded text and allowed metadata, forces published board visibility, and does not enable restricted lounge posting, comments, saves, reactions, search, AI moderation, seed content, or proof-upload scope.';
