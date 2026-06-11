create table public.board_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.board_posts (id) on delete cascade,
  author_user_id uuid not null references auth.users (id) on delete cascade,
  parent_comment_id uuid references public.board_post_comments (id) on delete cascade,
  body text not null,
  status text not null default 'published',
  removed_at timestamptz,
  removed_by uuid references auth.users (id),
  removal_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint board_post_comments_body_present_check check (char_length(trim(body)) > 0),
  constraint board_post_comments_body_length_check check (char_length(body) <= 2000),
  constraint board_post_comments_status_check check (
    status in ('published', 'hidden', 'removed')
  ),
  constraint board_post_comments_removed_state_check check (
    (status = 'removed' and removed_at is not null)
    or status in ('published', 'hidden')
  ),
  constraint board_post_comments_removal_reason_length_check check (
    removal_reason is null or char_length(removal_reason) <= 1000
  ),
  constraint board_post_comments_top_level_only_check check (
    parent_comment_id is null
  )
);

create index board_post_comments_post_status_created_at_idx
on public.board_post_comments (post_id, status, created_at asc);

create index board_post_comments_parent_comment_id_idx
on public.board_post_comments (parent_comment_id);

create index board_post_comments_author_created_at_idx
on public.board_post_comments (author_user_id, created_at desc);

create or replace function public.set_board_post_comments_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_board_post_comments_updated_at
before update on public.board_post_comments
for each row
execute function public.set_board_post_comments_updated_at();

alter table public.board_post_comments enable row level security;

revoke all on table public.board_post_comments from anon, authenticated;
grant select, insert, update on table public.board_post_comments to service_role;

create or replace function public.list_open_baseboard_post_comments(
  p_base_code text,
  p_post_id uuid,
  p_limit integer default 100
)
returns table (
  id uuid,
  post_id uuid,
  body text,
  created_at timestamptz,
  updated_at timestamptz,
  author_label text
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_base_code text := coalesce(upper(trim(p_base_code)), '');
  v_limit integer := least(greatest(coalesce(p_limit, 100), 1), 100);
  v_base_id uuid;
  v_board_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  if p_post_id is null then
    raise exception 'Post is required'
      using errcode = '22023';
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

  select boards.id
  into v_board_id
  from public.boards
  inner join public.board_types
    on board_types.id = boards.board_type_id
  where boards.base_id = v_base_id
    and boards.status = 'active'
    and boards.visibility = 'open_verified'
    and board_types.key = 'base_board'
    and board_types.is_active = true
  order by boards.sort_order, boards.created_at
  limit 1;

  if v_board_id is null then
    return;
  end if;

  perform 1
  from public.board_posts
  where board_posts.id = p_post_id
    and board_posts.board_id = v_board_id
    and board_posts.status = 'published'
    and board_posts.visibility = 'board';

  if not found then
    return;
  end if;

  return query
  select
    board_post_comments.id,
    board_post_comments.post_id,
    board_post_comments.body,
    board_post_comments.created_at,
    board_post_comments.updated_at,
    coalesce(nullif(trim(profiles.handle), ''), 'jmpseat member') as author_label
  from public.board_post_comments
  left join public.profiles
    on profiles.id = board_post_comments.author_user_id
  where board_post_comments.post_id = p_post_id
    and board_post_comments.status = 'published'
    and board_post_comments.parent_comment_id is null
  order by board_post_comments.created_at asc, board_post_comments.id asc
  limit v_limit;
end;
$$;

create or replace function public.create_open_baseboard_post_comment(
  p_base_code text,
  p_post_id uuid,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_base_code text := coalesce(upper(trim(p_base_code)), '');
  v_body text := trim(coalesce(p_body, ''));
  v_base_id uuid;
  v_board_id uuid;
  v_comment_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  if not public.current_user_can_create_open_board_post() then
    raise exception 'Contribution eligibility required'
      using errcode = '42501';
  end if;

  if p_post_id is null then
    raise exception 'Post is required'
      using errcode = '22023';
  end if;

  if char_length(v_body) = 0 then
    raise exception 'Comment body is required'
      using errcode = '22023';
  end if;

  if char_length(v_body) > 2000 then
    raise exception 'Comment body is too long'
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

  select boards.id
  into v_board_id
  from public.boards
  inner join public.board_types
    on board_types.id = boards.board_type_id
  where boards.base_id = v_base_id
    and boards.status = 'active'
    and boards.visibility = 'open_verified'
    and board_types.key = 'base_board'
    and board_types.is_active = true
  order by boards.sort_order, boards.created_at
  limit 1;

  if v_board_id is null then
    raise exception 'Active open verified base board not found'
      using errcode = 'P0002';
  end if;

  perform 1
  from public.board_posts
  where board_posts.id = p_post_id
    and board_posts.board_id = v_board_id
    and board_posts.status = 'published'
    and board_posts.visibility = 'board';

  if not found then
    raise exception 'Published board post not found'
      using errcode = 'P0002';
  end if;

  insert into public.board_post_comments (
    post_id,
    author_user_id,
    parent_comment_id,
    body,
    status
  )
  values (
    p_post_id,
    v_user_id,
    null,
    v_body,
    'published'
  )
  returning id into v_comment_id;

  return v_comment_id;
end;
$$;

create or replace function public.moderate_open_baseboard_post_comment(
  p_base_code text,
  p_comment_id uuid,
  p_action text,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_base_code text := coalesce(upper(trim(p_base_code)), '');
  v_action text := lower(trim(coalesce(p_action, '')));
  v_reason text := trim(coalesce(p_reason, ''));
  v_base_id uuid;
  v_board_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  if not public.is_operator_with_scope('operator.community_moderation') then
    raise exception 'Operator moderation scope required'
      using errcode = '42501';
  end if;

  if p_comment_id is null then
    raise exception 'Comment is required'
      using errcode = '22023';
  end if;

  if v_action not in ('hide', 'remove') then
    raise exception 'Unsupported moderation action'
      using errcode = '22023';
  end if;

  if char_length(v_reason) = 0 then
    raise exception 'Moderation reason is required'
      using errcode = '22023';
  end if;

  if char_length(v_reason) > 1000 then
    raise exception 'Moderation reason is too long'
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

  select boards.id
  into v_board_id
  from public.boards
  inner join public.board_types
    on board_types.id = boards.board_type_id
  where boards.base_id = v_base_id
    and boards.status = 'active'
    and boards.visibility = 'open_verified'
    and board_types.key = 'base_board'
    and board_types.is_active = true
  order by boards.sort_order, boards.created_at
  limit 1;

  if v_board_id is null then
    raise exception 'Active open verified base board not found'
      using errcode = 'P0002';
  end if;

  update public.board_post_comments
  set
    status = case when v_action = 'hide' then 'hidden' else 'removed' end,
    removed_at = now(),
    removed_by = v_user_id,
    removal_reason = v_reason
  from public.board_posts
  where board_post_comments.id = p_comment_id
    and board_posts.id = board_post_comments.post_id
    and board_posts.board_id = v_board_id;

  if not found then
    raise exception 'Board post comment not found'
      using errcode = 'P0002';
  end if;

  return p_comment_id;
end;
$$;

revoke all on function public.list_open_baseboard_post_comments(text, uuid, integer) from public;
revoke execute on function public.list_open_baseboard_post_comments(text, uuid, integer) from anon;
grant execute on function public.list_open_baseboard_post_comments(text, uuid, integer) to authenticated;
grant execute on function public.list_open_baseboard_post_comments(text, uuid, integer) to service_role;

revoke all on function public.create_open_baseboard_post_comment(text, uuid, text) from public;
revoke execute on function public.create_open_baseboard_post_comment(text, uuid, text) from anon;
grant execute on function public.create_open_baseboard_post_comment(text, uuid, text) to authenticated;
grant execute on function public.create_open_baseboard_post_comment(text, uuid, text) to service_role;

revoke all on function public.moderate_open_baseboard_post_comment(text, uuid, text, text) from public;
revoke execute on function public.moderate_open_baseboard_post_comment(text, uuid, text, text) from anon;
grant execute on function public.moderate_open_baseboard_post_comment(text, uuid, text, text) to authenticated;
grant execute on function public.moderate_open_baseboard_post_comment(text, uuid, text, text) to service_role;

comment on table public.board_post_comments is 'Top-level DFW/Baseboard comments foundation. Comment reads and writes use scoped RPCs; direct anon/authenticated table access is not enabled. parent_comment_id is schema-reserved but T19 live creation is top-level only.';
comment on column public.board_post_comments.author_user_id is 'Authenticated author forced by create_open_baseboard_post_comment via auth.uid(); not user supplied and not returned by safe read RPCs.';
comment on column public.board_post_comments.parent_comment_id is 'Reserved for future replies. T19 enforces top-level comments only.';
comment on function public.list_open_baseboard_post_comments(text, uuid, integer) is 'Read-only top-level comment list for one published board-visible post on an active open verified Baseboard by active base code. Requires DB-level open-board read eligibility and returns safe fields only.';
comment on function public.create_open_baseboard_post_comment(text, uuid, text) is 'Server-controlled top-level comment creation for one published board-visible post on an active open verified Baseboard. Requires T13-equivalent contribution eligibility, forces auth.uid() as author, and returns only the created comment UUID.';
comment on function public.moderate_open_baseboard_post_comment(text, uuid, text, text) is 'Operator-scoped hide/remove RPC for DFW/Baseboard comments. Requires operator.community_moderation, updates comment lifecycle fields, returns only the comment UUID, and does not implement comment reports, bans, appeals, AI moderation, saves, reactions, search, or proof-upload scope.';
