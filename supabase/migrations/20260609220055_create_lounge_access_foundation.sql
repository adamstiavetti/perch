create table public.lounge_memberships (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'active',
  approved_by uuid references auth.users (id),
  approved_at timestamptz,
  revoked_by uuid references auth.users (id),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lounge_memberships_board_user_unique unique (board_id, user_id),
  constraint lounge_memberships_status_check check (
    status in ('active', 'revoked')
  ),
  constraint lounge_memberships_approval_state_check check (
    (status = 'active' and approved_at is not null)
    or status = 'revoked'
  ),
  constraint lounge_memberships_revocation_state_check check (
    (status = 'revoked' and revoked_at is not null)
    or status = 'active'
  )
);

create table public.lounge_access_requests (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending',
  request_message text,
  reviewed_by uuid references auth.users (id),
  reviewed_at timestamptz,
  decision_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lounge_access_requests_status_check check (
    status in ('pending', 'approved', 'denied', 'withdrawn')
  ),
  constraint lounge_access_requests_review_state_check check (
    (status in ('approved', 'denied') and reviewed_at is not null)
    or status in ('pending', 'withdrawn')
  ),
  constraint lounge_access_requests_request_message_length_check check (
    request_message is null or char_length(request_message) <= 2000
  ),
  constraint lounge_access_requests_decision_reason_length_check check (
    decision_reason is null or char_length(decision_reason) <= 1000
  )
);

create table public.lounge_request_comments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.lounge_access_requests (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null,
  visibility text not null default 'request_participants',
  created_at timestamptz not null default now(),
  constraint lounge_request_comments_body_check check (
    char_length(trim(body)) > 0
    and char_length(body) <= 2000
  ),
  constraint lounge_request_comments_visibility_check check (
    visibility in ('request_participants', 'operator_review')
  )
);

create table public.lounge_admin_grants (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'active',
  granted_by uuid references auth.users (id),
  granted_at timestamptz not null default now(),
  revoked_by uuid references auth.users (id),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lounge_admin_grants_board_user_unique unique (board_id, user_id),
  constraint lounge_admin_grants_status_check check (
    status in ('active', 'revoked')
  ),
  constraint lounge_admin_grants_revocation_state_check check (
    (status = 'revoked' and revoked_at is not null)
    or status = 'active'
  )
);

create unique index lounge_access_requests_one_pending_per_user_board_idx
on public.lounge_access_requests (board_id, user_id)
where status = 'pending';

create index lounge_memberships_user_status_idx
on public.lounge_memberships (user_id, status, created_at desc);

create index lounge_memberships_board_status_idx
on public.lounge_memberships (board_id, status, created_at desc);

create index lounge_access_requests_user_status_idx
on public.lounge_access_requests (user_id, status, created_at desc);

create index lounge_access_requests_board_status_idx
on public.lounge_access_requests (board_id, status, created_at desc);

create index lounge_request_comments_request_created_at_idx
on public.lounge_request_comments (request_id, created_at);

create index lounge_admin_grants_user_status_idx
on public.lounge_admin_grants (user_id, status, created_at desc);

create index lounge_admin_grants_board_status_idx
on public.lounge_admin_grants (board_id, status, created_at desc);

create or replace function public.set_lounge_access_foundation_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_lounge_memberships_updated_at
before update on public.lounge_memberships
for each row
execute function public.set_lounge_access_foundation_updated_at();

create trigger set_lounge_access_requests_updated_at
before update on public.lounge_access_requests
for each row
execute function public.set_lounge_access_foundation_updated_at();

create trigger set_lounge_admin_grants_updated_at
before update on public.lounge_admin_grants
for each row
execute function public.set_lounge_access_foundation_updated_at();

alter table public.lounge_memberships enable row level security;
alter table public.lounge_access_requests enable row level security;
alter table public.lounge_request_comments enable row level security;
alter table public.lounge_admin_grants enable row level security;

revoke all on table public.lounge_memberships from anon, authenticated;
revoke all on table public.lounge_access_requests from anon, authenticated;
revoke all on table public.lounge_request_comments from anon, authenticated;
revoke all on table public.lounge_admin_grants from anon, authenticated;

grant select on table public.lounge_memberships to authenticated;
grant select on table public.lounge_access_requests to authenticated;
grant select on table public.lounge_request_comments to authenticated;
grant select on table public.lounge_admin_grants to authenticated;

create policy "users can read their own lounge memberships"
on public.lounge_memberships
for select
to authenticated
using (auth.uid() = user_id);

create policy "crew leads can read lounge memberships for managed boards"
on public.lounge_memberships
for select
to authenticated
using (
  exists (
    select 1
    from public.lounge_admin_grants as grants
    where grants.board_id = lounge_memberships.board_id
      and grants.user_id = auth.uid()
      and grants.status = 'active'
  )
);

create policy "users can read their own lounge access requests"
on public.lounge_access_requests
for select
to authenticated
using (auth.uid() = user_id);

create policy "crew leads can read lounge access requests for managed boards"
on public.lounge_access_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.lounge_admin_grants as grants
    where grants.board_id = lounge_access_requests.board_id
      and grants.user_id = auth.uid()
      and grants.status = 'active'
  )
);

create policy "requesters can read comments on their requests"
on public.lounge_request_comments
for select
to authenticated
using (
  exists (
    select 1
    from public.lounge_access_requests as requests
    where requests.id = lounge_request_comments.request_id
      and requests.user_id = auth.uid()
      and lounge_request_comments.visibility = 'request_participants'
  )
);

create policy "crew leads can read request comments for managed boards"
on public.lounge_request_comments
for select
to authenticated
using (
  exists (
    select 1
    from public.lounge_access_requests as requests
    inner join public.lounge_admin_grants as grants
      on grants.board_id = requests.board_id
    where requests.id = lounge_request_comments.request_id
      and grants.user_id = auth.uid()
      and grants.status = 'active'
      and lounge_request_comments.visibility = 'request_participants'
  )
);

create policy "users can read their own active lounge admin grants"
on public.lounge_admin_grants
for select
to authenticated
using (
  auth.uid() = user_id
  and status = 'active'
);

comment on table public.lounge_memberships is 'Approved or revoked membership for restricted Verified Lounge boards. Membership is the access truth for restricted lounge content. Home Base and board follows do not grant lounge access; self-declared profile fields do not grant lounge access.';
comment on column public.lounge_memberships.board_id is 'Restricted lounge board this membership applies to. T07 avoids fragile board-type checks and relies on later server paths to target verified_lounge boards.';
comment on column public.lounge_memberships.user_id is 'Member user. Approved membership does not publicly verify airline, role, or base.';
comment on column public.lounge_memberships.status is 'Membership lifecycle. Active membership permits future restricted lounge content access; revoked membership removes it.';
comment on column public.lounge_memberships.approved_by is 'Reviewer who approved membership. Future mutation paths must keep Crew Lead scope separate from platform operator/admin access.';
comment on column public.lounge_memberships.revoked_by is 'Reviewer who revoked membership. Revocation should be audited by later mutation paths.';

comment on table public.lounge_access_requests is 'Requests to join restricted Verified Lounge boards. Requesting access does not grant access; approval must create or retain active membership before restricted content is exposed.';
comment on column public.lounge_access_requests.status is 'Request lifecycle: pending, approved, denied, or withdrawn. Later states such as expired can be added in a future migration if needed.';
comment on column public.lounge_access_requests.request_message is 'Optional access-review note from the requester. This is not a general messaging surface.';
comment on column public.lounge_access_requests.decision_reason is 'Optional private decision context for the requester, Crew Leads, and operators according to later UI policy.';

comment on table public.lounge_request_comments is 'Limited access-review comments attached to a lounge access request. This is not a general direct-message or chat system. Request creation, approval, denial, revocation, and request-thread messages should be audited by later mutation paths.';
comment on column public.lounge_request_comments.request_id is 'Request this limited comment belongs to.';
comment on column public.lounge_request_comments.author_id is 'Authenticated author of the request-scoped comment.';
comment on column public.lounge_request_comments.visibility is 'Request participant comments are visible to the requester and scoped Crew Leads. Operator review comments are reserved for later escalation and are not exposed through T07 participant/Crew Lead read policies.';

comment on table public.lounge_admin_grants is 'Board-scoped Crew Lead grant table for restricted lounge review. Crew Leads do not receive platform operator/admin access, proof-system access, waitlist metrics access, or unrelated moderation authority.';
comment on column public.lounge_admin_grants.board_id is 'Lounge or board this Crew Lead grant is scoped to.';
comment on column public.lounge_admin_grants.user_id is 'Crew Lead user for this specific board. This grant is separate from operator grants.';
comment on column public.lounge_admin_grants.status is 'Crew Lead grant lifecycle for the specific board.';
comment on column public.lounge_admin_grants.granted_by is 'User who granted scoped Crew Lead authority. Future mutation paths must prevent self-escalation.';
comment on column public.lounge_admin_grants.revoked_by is 'User who revoked scoped Crew Lead authority.';
