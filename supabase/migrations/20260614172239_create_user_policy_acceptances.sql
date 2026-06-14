create table public.user_policy_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  policy_key text not null,
  policy_version text not null,
  accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint user_policy_acceptances_policy_key_check check (
    policy_key in (
      'private_beta_terms',
      'privacy_notice',
      'community_rules'
    )
  ),
  constraint user_policy_acceptances_policy_version_check check (
    policy_version in ('v1')
  ),
  constraint user_policy_acceptances_unique_version unique (user_id, policy_key, policy_version)
);

create index user_policy_acceptances_user_id_created_at_idx
on public.user_policy_acceptances (user_id, created_at desc);

alter table public.user_policy_acceptances enable row level security;

revoke all on table public.user_policy_acceptances from anon, authenticated;
grant select on table public.user_policy_acceptances to authenticated;
grant select, insert on table public.user_policy_acceptances to service_role;

create policy "users can read their own policy acceptances"
on public.user_policy_acceptances
for select
to authenticated
using (auth.uid() = user_id);

comment on table public.user_policy_acceptances is 'Minimal private-beta policy acceptance records for current user-facing beta terms, privacy notice, and community rules. Does not store raw IP address or user agent.';
comment on column public.user_policy_acceptances.policy_key is 'Server-controlled policy key for one required private-beta acceptance artifact.';
comment on column public.user_policy_acceptances.policy_version is 'Server-controlled policy version. New material policy versions require new acceptance rows.';

create or replace function public.accept_current_private_beta_policies()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_inserted integer := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  with required_policies(policy_key, policy_version) as (
    values
      ('private_beta_terms'::text, 'v1'::text),
      ('privacy_notice'::text, 'v1'::text),
      ('community_rules'::text, 'v1'::text)
  ),
  inserted as (
    insert into public.user_policy_acceptances (
      user_id,
      policy_key,
      policy_version
    )
    select
      v_user_id,
      required_policies.policy_key,
      required_policies.policy_version
    from required_policies
    on conflict (user_id, policy_key, policy_version) do nothing
    returning 1
  )
  select count(*)
  into v_inserted
  from inserted;

  return jsonb_build_object(
    'ok', true,
    'code', 'private_beta_policies_accepted',
    'accepted_policy_count', 3,
    'inserted_policy_count', v_inserted
  );
end;
$$;

revoke all on function public.accept_current_private_beta_policies() from public;
revoke execute on function public.accept_current_private_beta_policies() from anon;
grant execute on function public.accept_current_private_beta_policies() to authenticated;
grant execute on function public.accept_current_private_beta_policies() to service_role;

comment on function public.accept_current_private_beta_policies() is 'Idempotently records the current private beta terms, privacy notice, and community rules acceptance set for auth.uid(). Accepts no user id, policy key, policy version, IP address, or user agent from the client.';
