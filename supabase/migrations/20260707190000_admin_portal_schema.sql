create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  address text,
  contact_email text,
  created_at timestamptz not null default now()
);

alter table public.schools enable row level security;

alter table public.profiles
  add column if not exists school_id uuid references public.schools(id) on delete set null;

create index if not exists idx_profiles_school_id on public.profiles(school_id);

create or replace function public.is_platform_admin(_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = _user_id
      and p.role = 'platform_admin'
  );
$$;

drop policy if exists "Platform admins can read all profiles" on public.profiles;
create policy "Platform admins can read all profiles"
  on public.profiles
  for select
  using (public.is_platform_admin());

drop policy if exists "Platform admins can insert profiles" on public.profiles;
create policy "Platform admins can insert profiles"
  on public.profiles
  for insert
  with check (public.is_platform_admin());

drop policy if exists "Platform admins can update all profiles" on public.profiles;
create policy "Platform admins can update all profiles"
  on public.profiles
  for update
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Platform admins can delete profiles" on public.profiles;
create policy "Platform admins can delete profiles"
  on public.profiles
  for delete
  using (public.is_platform_admin());

drop policy if exists "Platform admins can read schools" on public.schools;
create policy "Platform admins can read schools"
  on public.schools
  for select
  using (public.is_platform_admin());

drop policy if exists "Platform admins can insert schools" on public.schools;
create policy "Platform admins can insert schools"
  on public.schools
  for insert
  with check (public.is_platform_admin());

drop policy if exists "Platform admins can update schools" on public.schools;
create policy "Platform admins can update schools"
  on public.schools
  for update
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Platform admins can delete schools" on public.schools;
create policy "Platform admins can delete schools"
  on public.schools
  for delete
  using (public.is_platform_admin());

create table if not exists public.admin_audit_logs (
  id bigint generated always as identity primary key,
  table_name text not null,
  action text not null,
  record_id uuid,
  actor_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_logs enable row level security;

drop policy if exists "Platform admins can read audit logs" on public.admin_audit_logs;
create policy "Platform admins can read audit logs"
  on public.admin_audit_logs
  for select
  using (public.is_platform_admin());

create or replace function public.write_admin_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_record_id uuid;
begin
  if tg_op = 'DELETE' then
    v_record_id := old.id;
  else
    v_record_id := new.id;
  end if;

  insert into public.admin_audit_logs (table_name, action, record_id, actor_id, details)
  values (
    tg_table_name,
    tg_op,
    v_record_id,
    auth.uid(),
    case
      when tg_op = 'DELETE' then to_jsonb(old)
      else to_jsonb(new)
    end
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_admin_audit on public.profiles;
create trigger trg_profiles_admin_audit
  after insert or update or delete on public.profiles
  for each row execute function public.write_admin_audit_log();

drop trigger if exists trg_schools_admin_audit on public.schools;
create trigger trg_schools_admin_audit
  after insert or update or delete on public.schools
  for each row execute function public.write_admin_audit_log();
