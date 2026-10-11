-- Temporary test-phase access. Login grants are only issued after an authenticated
-- platform administrator approves the request.
alter table public.profiles
  add column if not exists is_blocked boolean not null default false;

create table if not exists public.login_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null,
  school_name text,
  request_secret_hash text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'denied')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '20 minutes'),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,
  grant_token_hash text,
  grant_consumed_at timestamptz
);

create index if not exists login_requests_pending_created_idx
  on public.login_requests (created_at desc)
  where status = 'pending';

create index if not exists login_requests_profile_created_idx
  on public.login_requests (profile_id, created_at desc);

alter table public.login_requests enable row level security;
revoke all on table public.login_requests from public, anon, authenticated;
grant all on table public.login_requests to service_role;

-- The only browser-accessible path to a login grant is the Edge Function. Keep
-- this atomic consume helper executable by service_role only.
create or replace function public.consume_login_request_grant(
  _request_id uuid,
  _request_secret_hash text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  _token_hash text;
begin
  update public.login_requests
  set grant_consumed_at = pg_catalog.now()
  where id = _request_id
    and request_secret_hash = _request_secret_hash
    and status = 'approved'
    and expires_at > pg_catalog.now()
    and grant_token_hash is not null
    and grant_consumed_at is null
  returning grant_token_hash into _token_hash;

  return _token_hash;
end;
$$;

revoke all on function public.consume_login_request_grant(uuid, text) from public, anon, authenticated;
grant execute on function public.consume_login_request_grant(uuid, text) to service_role;
