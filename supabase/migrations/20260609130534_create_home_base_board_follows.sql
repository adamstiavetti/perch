create table public.user_home_base_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  base_id uuid not null references public.bases (id),
  selected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.board_follows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  board_id uuid not null references public.boards (id) on delete cascade,
  source text not null default 'manual',
  notification_level text not null default 'default',
  is_favorite boolean not null default false,
  followed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint board_follows_user_board_unique unique (user_id, board_id),
  constraint board_follows_source_check check (
    source in ('manual', 'home_base', 'onboarding', 'system')
  ),
  constraint board_follows_notification_level_check check (
    notification_level in ('default', 'muted', 'important')
  )
);

create index user_home_base_preferences_base_id_idx
on public.user_home_base_preferences (base_id);

create index board_follows_user_followed_at_idx
on public.board_follows (user_id, followed_at desc);

create index board_follows_board_id_idx
on public.board_follows (board_id);

create index board_follows_user_favorite_idx
on public.board_follows (user_id, is_favorite, followed_at desc)
where is_favorite;

create or replace function public.set_home_base_board_follow_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_user_home_base_preferences_updated_at
before update on public.user_home_base_preferences
for each row
execute function public.set_home_base_board_follow_updated_at();

create trigger set_board_follows_updated_at
before update on public.board_follows
for each row
execute function public.set_home_base_board_follow_updated_at();

alter table public.user_home_base_preferences enable row level security;
alter table public.board_follows enable row level security;

revoke all on table public.user_home_base_preferences from anon, authenticated;
revoke all on table public.board_follows from anon, authenticated;

grant select on table public.user_home_base_preferences to authenticated;
grant select on table public.board_follows to authenticated;

create policy "users can read their own home base preference"
on public.user_home_base_preferences
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can read their own board follows"
on public.board_follows
for select
to authenticated
using (auth.uid() = user_id);

comment on table public.user_home_base_preferences is 'Current Home Base preference for personalization. This is not authorization truth and does not prove employment, role, airline, base assignment, or restricted-board eligibility.';
comment on column public.user_home_base_preferences.user_id is 'Authenticated user who selected this Home Base.';
comment on column public.user_home_base_preferences.base_id is 'Selected active base for personalization. Active-base enforcement is handled by set_user_home_base.';
comment on column public.user_home_base_preferences.selected_at is 'Most recent time this Home Base preference was selected.';

comment on table public.board_follows is 'Board follow/subscription state for personalization. Following a board does not grant restricted-board access.';
comment on column public.board_follows.board_id is 'Followed board. Restricted boards still require a separate membership/access model before exposure.';
comment on column public.board_follows.source is 'How the follow was created. Home Base auto-follow uses home_base.';
comment on column public.board_follows.notification_level is 'Future notification preference placeholder. No notification delivery is implemented by this migration.';
comment on column public.board_follows.is_favorite is 'Future personalization hint. This is not authorization state.';

create or replace function public.set_user_home_base(p_base_code text)
returns table (
  base_id uuid,
  board_id uuid
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_base_id uuid;
  v_board_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  select bases.id
  into v_base_id
  from public.bases
  where bases.code = upper(trim(p_base_code))
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
    and board_types.key = 'base_board'
    and board_types.is_active = true
    and boards.status = 'active'
  order by boards.sort_order, boards.created_at
  limit 1;

  if v_board_id is null then
    raise exception 'Active base board not found'
      using errcode = 'P0002';
  end if;

  insert into public.user_home_base_preferences (
    user_id,
    base_id,
    selected_at,
    updated_at
  )
  values (
    v_user_id,
    v_base_id,
    now(),
    now()
  )
  on conflict (user_id) do update
  set
    base_id = excluded.base_id,
    selected_at = excluded.selected_at,
    updated_at = excluded.updated_at;

  insert into public.board_follows (
    user_id,
    board_id,
    source,
    notification_level,
    is_favorite,
    followed_at,
    updated_at
  )
  values (
    v_user_id,
    v_board_id,
    'home_base',
    'default',
    false,
    now(),
    now()
  )
  on conflict (user_id, board_id) do update
  set
    source = case
      when public.board_follows.source = 'manual' then public.board_follows.source
      else 'home_base'
    end,
    updated_at = now();

  return query
  select v_base_id, v_board_id;
end;
$$;

create or replace function public.get_current_user_home_base()
returns table (
  base_id uuid,
  base_code text,
  base_name text,
  selected_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  return query
  select
    bases.id,
    bases.code,
    bases.name,
    preferences.selected_at,
    preferences.updated_at
  from public.user_home_base_preferences as preferences
  inner join public.bases
    on bases.id = preferences.base_id
  where preferences.user_id = v_user_id;
end;
$$;

create or replace function public.list_current_user_board_follows()
returns table (
  id uuid,
  board_id uuid,
  board_slug text,
  board_name text,
  board_type text,
  source text,
  notification_level text,
  is_favorite boolean,
  followed_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  return query
  select
    follows.id,
    boards.id,
    boards.slug,
    boards.name,
    board_types.key,
    follows.source,
    follows.notification_level,
    follows.is_favorite,
    follows.followed_at,
    follows.updated_at
  from public.board_follows as follows
  inner join public.boards
    on boards.id = follows.board_id
  inner join public.board_types
    on board_types.id = boards.board_type_id
  where follows.user_id = v_user_id
  order by follows.followed_at desc;
end;
$$;

revoke all on function public.set_user_home_base(text) from public;
revoke all on function public.get_current_user_home_base() from public;
revoke all on function public.list_current_user_board_follows() from public;

grant execute on function public.set_user_home_base(text) to authenticated;
grant execute on function public.get_current_user_home_base() to authenticated;
grant execute on function public.list_current_user_board_follows() to authenticated;

comment on function public.set_user_home_base(text) is 'Sets the authenticated user Home Base by active base code and ensures the matching active Base Board is followed. This does not grant restricted-board access.';
comment on function public.get_current_user_home_base() is 'Returns the authenticated user Home Base preference with base metadata. This is personalization state, not authorization truth.';
comment on function public.list_current_user_board_follows() is 'Returns followed board metadata for the authenticated user. Follows do not grant restricted-board access.';
