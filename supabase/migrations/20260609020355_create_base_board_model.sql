create table public.bases (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  airport_name text,
  city text,
  state text,
  country text not null default 'US',
  timezone text,
  status text not null default 'draft',
  launch_priority integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bases_code_format_check check (
    code = upper(code)
    and code ~ '^[A-Z0-9]+(-[A-Z0-9]+)*$'
  ),
  constraint bases_status_check check (
    status in ('draft', 'active', 'archived')
  ),
  constraint bases_launch_priority_check check (
    launch_priority is null or launch_priority > 0
  )
);

create table public.board_types (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  description text,
  default_visibility text not null,
  default_posting_mode text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint board_types_key_format_check check (
    key ~ '^[a-z0-9]+(_[a-z0-9]+)*$'
  ),
  constraint board_types_default_visibility_check check (
    default_visibility in ('open_verified', 'restricted', 'hidden')
  ),
  constraint board_types_default_posting_mode_check check (
    default_posting_mode in ('read_only', 'members_can_post', 'admins_only')
  )
);

create table public.boards (
  id uuid primary key default gen_random_uuid(),
  board_type_id uuid not null references public.board_types (id),
  base_id uuid references public.bases (id),
  parent_board_id uuid references public.boards (id) on delete set null,
  slug text not null unique,
  name text not null,
  short_name text,
  description text,
  visibility text not null,
  posting_mode text not null,
  discoverability text not null default 'visible',
  status text not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint boards_slug_format_check check (
    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint boards_visibility_check check (
    visibility in ('open_verified', 'restricted', 'hidden')
  ),
  constraint boards_posting_mode_check check (
    posting_mode in ('read_only', 'members_can_post', 'admins_only')
  ),
  constraint boards_discoverability_check check (
    discoverability in ('visible', 'unlisted', 'hidden')
  ),
  constraint boards_status_check check (
    status in ('draft', 'active', 'archived')
  ),
  constraint boards_parent_not_self_check check (
    parent_board_id is null or parent_board_id <> id
  )
);

create index bases_status_launch_priority_idx
on public.bases (status, launch_priority, code);

create index board_types_active_display_order_idx
on public.board_types (is_active, display_order, key);

create index boards_status_discoverability_idx
on public.boards (status, discoverability, sort_order, slug);

create index boards_base_type_idx
on public.boards (base_id, board_type_id, status, sort_order);

create index boards_parent_board_id_idx
on public.boards (parent_board_id)
where parent_board_id is not null;

create or replace function public.set_base_board_model_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_bases_updated_at
before update on public.bases
for each row
execute function public.set_base_board_model_updated_at();

create trigger set_board_types_updated_at
before update on public.board_types
for each row
execute function public.set_base_board_model_updated_at();

create trigger set_boards_updated_at
before update on public.boards
for each row
execute function public.set_base_board_model_updated_at();

alter table public.bases enable row level security;
alter table public.board_types enable row level security;
alter table public.boards enable row level security;

comment on table public.bases is 'Supported aviation base or airport community anchors. DFW is the first launch base, not the only supported base.';
comment on column public.bases.code is 'Uppercase base/airport community code, such as DFW.';
comment on column public.bases.status is 'Lifecycle state for base availability. Active bases may be shown only through app-gated access helpers.';

comment on table public.board_types is 'Controlled board taxonomy for base boards, layover boards, and verified lounges. Board wiki/intel is structured board content in a later ticket, not a board type.';
comment on column public.board_types.key is 'Stable lowercase board type key.';
comment on column public.board_types.default_visibility is 'Default visibility for boards of this type. Final access still requires server-side and RLS authorization.';
comment on column public.board_types.default_posting_mode is 'Default posting mode for boards of this type. Posts/comments are implemented in a later ticket.';

comment on table public.boards is 'User-facing board spaces where future tickets can add follows, posts, comments, saves, reactions, access requests, search, and moderation.';
comment on column public.boards.base_id is 'Optional base anchor. Base boards should have a base_id by product contract; this migration avoids fragile cross-table board-type checks.';
comment on column public.boards.parent_board_id is 'Optional parent board for base-associated lounges or nested board experiences.';
comment on column public.boards.visibility is 'Board metadata visibility classification. Restricted content access is deferred to membership/access-request tickets.';
comment on column public.boards.posting_mode is 'Posting mode metadata only. This migration does not create posts, comments, or media upload tables.';

insert into public.bases (
  code,
  name,
  airport_name,
  city,
  state,
  country,
  timezone,
  status,
  launch_priority
)
values (
  'DFW',
  'Dallas/Fort Worth',
  'Dallas Fort Worth International Airport',
  'Dallas/Fort Worth',
  'TX',
  'US',
  'America/Chicago',
  'active',
  1
)
on conflict (code) do update
set
  name = excluded.name,
  airport_name = excluded.airport_name,
  city = excluded.city,
  state = excluded.state,
  country = excluded.country,
  timezone = excluded.timezone,
  status = excluded.status,
  launch_priority = excluded.launch_priority;

insert into public.board_types (
  key,
  label,
  description,
  default_visibility,
  default_posting_mode,
  display_order,
  is_active
)
values
  (
    'base_board',
    'Base Board',
    'Base-centered utility board for airport/base information, questions, and community knowledge.',
    'open_verified',
    'members_can_post',
    10,
    true
  ),
  (
    'layover_board',
    'Layover Board',
    'City or airport layover utility board for practical crew intel.',
    'open_verified',
    'members_can_post',
    20,
    true
  ),
  (
    'verified_lounge',
    'Verified Lounge',
    'Restricted base-associated or role-based board for approved members.',
    'restricted',
    'members_can_post',
    30,
    true
  )
on conflict (key) do update
set
  label = excluded.label,
  description = excluded.description,
  default_visibility = excluded.default_visibility,
  default_posting_mode = excluded.default_posting_mode,
  display_order = excluded.display_order,
  is_active = excluded.is_active;

insert into public.boards (
  board_type_id,
  base_id,
  slug,
  name,
  short_name,
  description,
  visibility,
  posting_mode,
  discoverability,
  status,
  sort_order
)
select
  board_types.id,
  bases.id,
  'dfw',
  'DFW Base Board',
  'DFW',
  'First available jmpseat base board for Dallas/Fort Worth.',
  'open_verified',
  'members_can_post',
  'visible',
  'active',
  1
from public.board_types
cross join public.bases
where board_types.key = 'base_board'
  and bases.code = 'DFW'
on conflict (slug) do update
set
  board_type_id = excluded.board_type_id,
  base_id = excluded.base_id,
  name = excluded.name,
  short_name = excluded.short_name,
  description = excluded.description,
  visibility = excluded.visibility,
  posting_mode = excluded.posting_mode,
  discoverability = excluded.discoverability,
  status = excluded.status,
  sort_order = excluded.sort_order;
