create table public.board_post_comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.board_post_comments (id) on delete cascade,
  reporter_user_id uuid not null references auth.users (id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'open',
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id),
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint board_post_comment_reports_reason_check check (
    reason in ('spam', 'harassment', 'unsafe_info', 'privacy', 'off_topic', 'other')
  ),
  constraint board_post_comment_reports_status_check check (
    status in ('open', 'reviewing', 'resolved', 'dismissed')
  ),
  constraint board_post_comment_reports_details_length_check check (
    details is null or char_length(details) <= 1000
  ),
  constraint board_post_comment_reports_resolution_note_length_check check (
    resolution_note is null or char_length(resolution_note) <= 1000
  ),
  constraint board_post_comment_reports_reviewed_state_check check (
    (status in ('open', 'reviewing') and reviewed_at is null)
    or status in ('resolved', 'dismissed')
  )
);

create unique index board_post_comment_reports_one_open_report_per_reporter_comment_idx
on public.board_post_comment_reports (comment_id, reporter_user_id)
where status in ('open', 'reviewing');

create index board_post_comment_reports_comment_status_created_at_idx
on public.board_post_comment_reports (comment_id, status, created_at asc);

create index board_post_comment_reports_reporter_created_at_idx
on public.board_post_comment_reports (reporter_user_id, created_at desc);

create or replace function public.set_board_post_comment_reports_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_board_post_comment_reports_updated_at
before update on public.board_post_comment_reports
for each row
execute function public.set_board_post_comment_reports_updated_at();

alter table public.board_post_comment_reports enable row level security;

revoke all on table public.board_post_comment_reports from anon, authenticated;
grant select, insert, update on table public.board_post_comment_reports to service_role;

create or replace function public.report_open_baseboard_post_comment(
  p_base_code text,
  p_comment_id uuid,
  p_reason text,
  p_details text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_base_code text := coalesce(upper(trim(p_base_code)), '');
  v_reason text := lower(trim(coalesce(p_reason, '')));
  v_details text := nullif(trim(coalesce(p_details, '')), '');
  v_base_id uuid;
  v_board_id uuid;
  v_report_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  if not public.current_user_can_read_open_board_posts() then
    raise exception 'Read eligibility required'
      using errcode = '42501';
  end if;

  if p_comment_id is null then
    raise exception 'Comment is required'
      using errcode = '22023';
  end if;

  if v_reason not in ('spam', 'harassment', 'unsafe_info', 'privacy', 'off_topic', 'other') then
    raise exception 'Unsupported report reason'
      using errcode = '22023';
  end if;

  if v_details is not null and char_length(v_details) > 1000 then
    raise exception 'Report details are too long'
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
  from public.board_post_comments
  inner join public.board_posts
    on board_posts.id = board_post_comments.post_id
  where board_post_comments.id = p_comment_id
    and board_post_comments.status = 'published'
    and board_post_comments.parent_comment_id is null
    and board_posts.board_id = v_board_id
    and board_posts.status = 'published'
    and board_posts.visibility = 'board';

  if not found then
    raise exception 'Published board post comment not found'
      using errcode = 'P0002';
  end if;

  select board_post_comment_reports.id
  into v_report_id
  from public.board_post_comment_reports
  where board_post_comment_reports.comment_id = p_comment_id
    and board_post_comment_reports.reporter_user_id = v_user_id
    and board_post_comment_reports.status in ('open', 'reviewing')
  order by board_post_comment_reports.created_at desc
  limit 1;

  if v_report_id is not null then
    return v_report_id;
  end if;

  insert into public.board_post_comment_reports (
    comment_id,
    reporter_user_id,
    reason,
    details
  )
  values (
    p_comment_id,
    v_user_id,
    v_reason,
    v_details
  )
  returning id into v_report_id;

  return v_report_id;
end;
$$;

create or replace function public.list_open_baseboard_post_comment_reports(
  p_base_code text,
  p_limit integer default 50
)
returns table (
  report_id uuid,
  comment_id uuid,
  post_id uuid,
  comment_body_preview text,
  comment_author_label text,
  post_title_preview text,
  reason text,
  details text,
  report_status text,
  reported_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_base_code text := coalesce(upper(trim(p_base_code)), '');
  v_base_id uuid;
  v_board_id uuid;
  v_limit integer := least(greatest(coalesce(p_limit, 50), 1), 100);
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  if not public.is_operator_with_scope('operator.community_moderation') then
    raise exception 'Operator moderation scope required'
      using errcode = '42501';
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

  return query
  select
    board_post_comment_reports.id as report_id,
    board_post_comments.id as comment_id,
    board_posts.id as post_id,
    case
      when char_length(board_post_comments.body) > 280
        then substring(board_post_comments.body from 1 for 280) || '...'
      else board_post_comments.body
    end as comment_body_preview,
    coalesce(nullif(trim(profiles.handle), ''), 'jmpseat member') as comment_author_label,
    case
      when char_length(board_posts.title) > 140
        then substring(board_posts.title from 1 for 140) || '...'
      else board_posts.title
    end as post_title_preview,
    board_post_comment_reports.reason,
    board_post_comment_reports.details,
    board_post_comment_reports.status as report_status,
    board_post_comment_reports.created_at as reported_at
  from public.board_post_comment_reports
  inner join public.board_post_comments
    on board_post_comments.id = board_post_comment_reports.comment_id
  inner join public.board_posts
    on board_posts.id = board_post_comments.post_id
  left join public.profiles
    on profiles.id = board_post_comments.author_user_id
  where board_posts.board_id = v_board_id
    and board_posts.status = 'published'
    and board_posts.visibility = 'board'
    and board_post_comments.status = 'published'
    and board_post_comments.parent_comment_id is null
    and board_post_comment_reports.status in ('open', 'reviewing')
  order by board_post_comment_reports.created_at asc, board_post_comment_reports.id asc
  limit v_limit;
end;
$$;

revoke all on function public.report_open_baseboard_post_comment(text, uuid, text, text) from public;
revoke execute on function public.report_open_baseboard_post_comment(text, uuid, text, text) from anon;
grant execute on function public.report_open_baseboard_post_comment(text, uuid, text, text) to authenticated;
grant execute on function public.report_open_baseboard_post_comment(text, uuid, text, text) to service_role;

revoke all on function public.list_open_baseboard_post_comment_reports(text, integer) from public;
revoke execute on function public.list_open_baseboard_post_comment_reports(text, integer) from anon;
grant execute on function public.list_open_baseboard_post_comment_reports(text, integer) to authenticated;
grant execute on function public.list_open_baseboard_post_comment_reports(text, integer) to service_role;

comment on table public.board_post_comment_reports is 'Private top-level DFW/Baseboard comment report storage. Report creation and operator review use scoped RPCs; reporter identity is not exposed by review RPCs.';
comment on column public.board_post_comment_reports.reporter_user_id is 'Reporter identity forced by report_open_baseboard_post_comment via auth.uid(); not user supplied and not returned by review RPCs.';
comment on function public.report_open_baseboard_post_comment(text, uuid, text, text) is 'Server-controlled report intake for published top-level comments on published board-visible DFW Baseboard posts. Requires open-board read eligibility, forces auth.uid() as reporter, and returns only a report UUID.';
comment on function public.list_open_baseboard_post_comment_reports(text, integer) is 'Operator-scoped DFW/Baseboard comment report review list. Requires operator.community_moderation and returns safe comment-review fields without reporter identity, author IDs, emails, verification/proof data, signed URLs, or private paths.';
