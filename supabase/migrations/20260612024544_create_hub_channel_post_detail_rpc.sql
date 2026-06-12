create or replace function public.get_open_hub_channel_post(
  p_base_code text,
  p_channel_slug text,
  p_post_id uuid
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
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_base_code text := coalesce(upper(trim(p_base_code)), '');
  v_parent_slug text := lower(v_base_code);
  v_channel_slug text := coalesce(lower(trim(p_channel_slug)), '');
  v_base_id uuid;
  v_parent_board_id uuid;
  v_channel_board_id uuid;
  v_channel_name text;
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  if v_channel_slug = '' then
    return;
  end if;

  if not public.current_user_can_read_open_board_posts() then
    raise exception 'Read eligibility required'
      using errcode = '42501';
  end if;

  select bases.id
  into v_base_id
  from public.bases
  where bases.code = v_base_code
    and bases.status = 'active'
  limit 1;

  if v_base_id is null then
    return;
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
    return;
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
    and child_boards.discoverability = 'visible'
    and child_board_types.key = 'hub_channel'
    and child_board_types.is_active = true
  limit 1;

  if v_channel_board_id is null then
    return;
  end if;

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
  where board_posts.id = p_post_id
    and board_posts.board_id = v_channel_board_id
    and board_posts.status = 'published'
    and board_posts.visibility = 'board'
  limit 1;
end;
$$;

revoke all on function public.get_open_hub_channel_post(text, text, uuid) from public;
revoke execute on function public.get_open_hub_channel_post(text, text, uuid) from anon;
grant execute on function public.get_open_hub_channel_post(text, text, uuid) to authenticated;
grant execute on function public.get_open_hub_channel_post(text, text, uuid) to service_role;

comment on function public.get_open_hub_channel_post(text, text, uuid) is 'Read-only detail for one published board-visible post inside one active open verified Hub Channel by active base code, channel slug, and post UUID. Requires DB-level open-board read eligibility and resolves channel membership through board_posts.board_id on the resolved hub_channel board. Category is not used. Returns safe post fields plus safe channel slug/name only. Does not expose board ids, base ids, parent board ids, author ids, user ids, emails, reporter identity, moderation internals, verification evidence, proof storage data, signed URLs, comments, reports, composer behavior, request/create channel workflow, search, saves, reactions, media, or live integrations.';
