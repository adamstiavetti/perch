create or replace function public.create_open_hub_channel_post(
  p_base_code text,
  p_channel_slug text,
  p_title text,
  p_body text,
  p_content_type text default null,
  p_category text default null
)
returns table (
  id uuid,
  title text,
  body text,
  content_type text,
  category text,
  is_pinned boolean,
  created_at timestamptz,
  updated_at timestamptz,
  author_label text,
  channel_slug text,
  channel_name text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_base_code text := coalesce(upper(trim(p_base_code)), '');
  v_parent_slug text := lower(v_base_code);
  v_channel_slug text := coalesce(lower(trim(p_channel_slug)), '');
  v_title text := trim(coalesce(p_title, ''));
  v_body text := trim(coalesce(p_body, ''));
  v_content_type text := lower(trim(coalesce(nullif(p_content_type, ''), 'note')));
  v_category text := lower(trim(coalesce(nullif(p_category, ''), 'general')));
  v_base_id uuid;
  v_parent_board_id uuid;
  v_channel_board_id uuid;
  v_channel_name text;
  v_post_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  if v_channel_slug = '' then
    raise exception 'Channel is required'
      using errcode = '22023';
  end if;

  if not public.current_user_can_create_open_board_post() then
    raise exception 'Contribution eligibility required'
      using errcode = '42501';
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

  select bases.id
  into v_base_id
  from public.bases
  where bases.code = v_base_code
    and bases.status = 'active'
  limit 1;

  if v_base_id is null then
    raise exception 'Active base not found'
      using errcode = 'P0002';
  end if;

  select parent_boards.id
  into v_parent_board_id
  from public.boards as parent_boards
  inner join public.board_types as parent_board_types
    on parent_board_types.id = parent_boards.board_type_id
  where parent_boards.base_id = v_base_id
    and parent_boards.slug = v_parent_slug
    and parent_boards.status = 'active'
    and parent_board_types.key = 'base_board'
    and parent_board_types.is_active = true
  limit 1;

  if v_parent_board_id is null then
    raise exception 'Active parent Hub board not found'
      using errcode = 'P0002';
  end if;

  select child_boards.id, child_boards.name
  into v_channel_board_id, v_channel_name
  from public.boards as child_boards
  inner join public.board_types as child_board_types
    on child_board_types.id = child_boards.board_type_id
  where child_boards.base_id = v_base_id
    and child_boards.parent_board_id = v_parent_board_id
    and child_boards.slug = v_channel_slug
    and child_boards.status = 'active'
    and child_boards.visibility = 'open_verified'
    and child_boards.posting_mode = 'members_can_post'
    and child_boards.discoverability = 'visible'
    and child_board_types.key = 'hub_channel'
    and child_board_types.is_active = true
  limit 1;

  if v_channel_board_id is null then
    raise exception 'Active open verified Hub Channel not found'
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
    v_channel_board_id,
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
  returning board_posts.id into v_post_id;

  return query
  select
    board_posts.id,
    board_posts.title,
    board_posts.body,
    board_posts.content_type,
    board_posts.category,
    board_posts.is_pinned,
    board_posts.created_at,
    board_posts.updated_at,
    coalesce(nullif(trim(profiles.handle), ''), 'jmpseat member') as author_label,
    v_channel_slug as channel_slug,
    v_channel_name as channel_name
  from public.board_posts
  left join public.profiles
    on profiles.id = board_posts.author_user_id
  where board_posts.id = v_post_id
    and board_posts.board_id = v_channel_board_id
  limit 1;
end;
$$;

revoke all on function public.create_open_hub_channel_post(text, text, text, text, text, text) from public;
revoke execute on function public.create_open_hub_channel_post(text, text, text, text, text, text) from anon;
grant execute on function public.create_open_hub_channel_post(text, text, text, text, text, text) to authenticated;
grant execute on function public.create_open_hub_channel_post(text, text, text, text, text, text) to service_role;

comment on function public.create_open_hub_channel_post(text, text, text, text, text, text) is 'Server-controlled post creation for one active open verified member-postable Hub Channel by active base code and channel slug. Requires auth.uid() and DB-level open-board contribution eligibility, resolves channel membership through the hub_channel board id, validates bounded title/body/content metadata, inserts a published board-visible post, and returns safe post/channel fields only. Does not accept or return board ids, base ids, parent board ids, author ids, user ids, reporter identity, moderation internals, verification evidence, proof storage data, signed URLs, comments, reports, Request a Channel workflow, search, saves, reactions, media, or live integrations.';
