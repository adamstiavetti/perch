-- E05-T03 corrective migration:
-- Keep SQL approved-domain validation aligned with the server-side TypeScript
-- validator while allowing reserved test-only TLDs for safe runtime proof.
create or replace function public.approved_email_domain_format_valid(raw_domain text)
returns boolean
language sql
immutable
as $$
  select
    public.normalize_approved_email_domain(raw_domain) is not null
    and public.normalize_approved_email_domain(raw_domain) !~ '[@/:?#]'
    and public.normalize_approved_email_domain(raw_domain) ~ '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$';
$$;
