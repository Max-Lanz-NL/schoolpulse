create extension if not exists pgcrypto;

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brin_code text,
  city text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_accounts (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  school_id uuid references public.schools(id) on delete set null,
  full_name text not null,
  email text not null unique,
  role text not null check (role in ('platform_admin', 'school_admin', 'support')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists schools_set_updated_at on public.schools;
create trigger schools_set_updated_at
before update on public.schools
for each row execute function public.set_updated_at();

drop trigger if exists platform_accounts_set_updated_at on public.platform_accounts;
create trigger platform_accounts_set_updated_at
before update on public.platform_accounts
for each row execute function public.set_updated_at();

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
as $$
  select
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'platform_admin'
    or coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'platform_admin'
    or coalesce((auth.jwt() -> 'app_metadata' -> 'roles')::jsonb ? 'platform_admin', false)
    or coalesce((auth.jwt() -> 'user_metadata' -> 'roles')::jsonb ? 'platform_admin', false);
$$;

alter table public.schools enable row level security;
alter table public.platform_accounts enable row level security;

drop policy if exists "platform_admin_all_schools" on public.schools;
create policy "platform_admin_all_schools"
on public.schools
for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

drop policy if exists "platform_admin_all_accounts" on public.platform_accounts;
create policy "platform_admin_all_accounts"
on public.platform_accounts
for all
using (public.is_platform_admin())
with check (public.is_platform_admin());
