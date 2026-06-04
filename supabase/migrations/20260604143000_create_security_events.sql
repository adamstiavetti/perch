create table public.security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  event_type text not null,
  route text,
  result text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint security_events_event_type_check check (
    event_type in (
      'auth.sign_in_attempt',
      'auth.sign_in_success',
      'auth.sign_in_failed',
      'auth.sign_up_attempt',
      'auth.sign_up_success',
      'auth.sign_up_failed',
      'auth.password_reset_requested',
      'auth.password_reset_request_failed',
      'auth.callback_resolved',
      'private_access.redirect_login',
      'private_access.redirect_profile',
      'private_access.redirect_access_hold',
      'private_access.allowed',
      'private_access.storage_not_ready',
      'profile.upsert_attempt',
      'profile.upsert_success',
      'profile.upsert_failed',
      'beta_access.checked'
    )
  )
);

create index security_events_user_id_idx on public.security_events (user_id);
create index security_events_event_type_idx on public.security_events (event_type);
create index security_events_created_at_idx on public.security_events (created_at desc);
create index security_events_user_created_at_idx on public.security_events (user_id, created_at desc);

alter table public.security_events enable row level security;

comment on table public.security_events is 'Minimal server-recorded audit/security events for auth, profile, beta access, and private-route authorization decisions.';
comment on column public.security_events.metadata is 'Minimal operational metadata only. Do not store passwords, raw proof data, employee identifiers, or full raw emails unless a later reviewed policy explicitly allows it.';

create policy "authenticated users can insert bounded security events for themselves"
on public.security_events
for insert
to authenticated
with check (
  user_id is null
  or auth.uid() = user_id
);
