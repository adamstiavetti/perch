create table public.board_posts (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  author_user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text not null,
  content_type text not null default 'note',
  category text not null default 'general',
  status text not null default 'published',
  visibility text not null default 'board',
  is_admin_seeded boolean not null default false,
  is_pinned boolean not null default false,
  edited_at timestamptz,
  removed_at timestamptz,
  removed_by uuid references auth.users (id),
  removal_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint board_posts_title_present_check check (char_length(trim(title)) > 0),
  constraint board_posts_body_present_check check (char_length(trim(body)) > 0),
  constraint board_posts_content_type_check check (
    content_type in ('note', 'question', 'recommendation', 'guide')
  ),
  constraint board_posts_category_check check (
    category in (
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
    )
  ),
  constraint board_posts_status_check check (
    status in ('draft', 'published', 'hidden', 'removed')
  ),
  constraint board_posts_visibility_check check (
    visibility in ('board', 'members_only', 'operator_only')
  ),
  constraint board_posts_removed_state_check check (
    (status = 'removed' and removed_at is not null)
    or status in ('draft', 'published', 'hidden')
  ),
  constraint board_posts_removal_reason_length_check check (
    removal_reason is null or char_length(removal_reason) <= 1000
  )
);

create index board_posts_board_created_at_idx
on public.board_posts (board_id, created_at desc);

create index board_posts_board_status_created_at_idx
on public.board_posts (board_id, status, created_at desc);

create index board_posts_board_category_created_at_idx
on public.board_posts (board_id, category, created_at desc);

create index board_posts_author_created_at_idx
on public.board_posts (author_user_id, created_at desc);

create or replace function public.set_board_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_board_posts_updated_at
before update on public.board_posts
for each row
execute function public.set_board_posts_updated_at();

alter table public.board_posts enable row level security;

revoke all on table public.board_posts from anon, authenticated;
grant select on table public.board_posts to authenticated;

create policy "authenticated users can read published posts on open verified boards"
on public.board_posts
for select
to authenticated
using (
  status = 'published'
  and visibility = 'board'
  and exists (
    select 1
    from public.boards
    where boards.id = board_posts.board_id
      and boards.status = 'active'
      and boards.visibility = 'open_verified'
  )
);

create policy "active lounge members can read published members-only posts on restricted boards"
on public.board_posts
for select
to authenticated
using (
  status = 'published'
  and visibility = 'members_only'
  and exists (
    select 1
    from public.boards
    inner join public.lounge_memberships
      on lounge_memberships.board_id = boards.id
    where boards.id = board_posts.board_id
      and boards.status = 'active'
      and boards.visibility = 'restricted'
      and lounge_memberships.user_id = auth.uid()
      and lounge_memberships.status = 'active'
  )
);

comment on table public.board_posts is 'Shared board post/thread foundation for Baseboard, Layovers, Crew Picks sourcing, and future restricted lounge content. This ticket adds no comments, reactions, saves, ranking, search backend, or moderation workflows.';
comment on column public.board_posts.board_id is 'Owning board for the post. Later server paths must still ensure product-correct board targeting and write authorization.';
comment on column public.board_posts.author_user_id is 'Authenticated author for the post. Self-declared profile fields are not authorization truth.';
comment on column public.board_posts.content_type is 'Utility-first content shape for future Baseboard and Layovers UX: note, question, recommendation, or guide.';
comment on column public.board_posts.category is 'Future utility category label. This migration does not create category browsing UI or search.';
comment on column public.board_posts.status is 'Post lifecycle. Only published rows are readable through T12 RLS.';
comment on column public.board_posts.visibility is 'Board-scoped content visibility. board = open board post, members_only = restricted lounge member content, operator_only = withheld from authenticated user reads.';
comment on column public.board_posts.is_admin_seeded is 'Marks editorial/admin-seeded content without making Seeded Layovers or Crew Picks implementation live in T12.';
comment on column public.board_posts.is_pinned is 'Future presentation hint only. No ranking or special surfacing logic is implemented here.';
comment on column public.board_posts.removed_by is 'Future moderation/removal actor reference. T12 does not create moderation actions, reports, or reviewer workflows.';
