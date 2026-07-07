do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'profile_role' and n.nspname = 'public'
  ) then
    create type public.profile_role as enum (
      'platform_admin',
      'school_admin',
      'teacher',
      'student',
      'parent'
    );
  end if;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.profile_role not null default 'student',
  school_name text,
  created_at timestamptz not null default now()
);

insert into public.profiles (
  id,
  email,
  full_name,
  role,
  school_name
)
select
  u.id,
  u.email,
  coalesce(
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'name',
    split_part(coalesce(u.email, ''), '@', 1)
  ),
  case
    when u.raw_user_meta_data ->> 'role' in ('platform_admin', 'school_admin', 'teacher', 'student', 'parent')
      then (u.raw_user_meta_data ->> 'role')::public.profile_role
    else 'student'::public.profile_role
  end,
  u.raw_user_meta_data ->> 'school_name'
from auth.users u
on conflict (id) do nothing;

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_school_name on public.profiles(school_name);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    role,
    school_name
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    case
      when new.raw_user_meta_data ->> 'role' in ('platform_admin', 'school_admin', 'teacher', 'student', 'parent')
        then (new.raw_user_meta_data ->> 'role')::public.profile_role
      else 'student'::public.profile_role
    end,
    new.raw_user_meta_data ->> 'school_name'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    school_name = coalesce(excluded.school_name, public.profiles.school_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.handle_updated_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    email = new.email,
    full_name = coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      public.profiles.full_name
    ),
    role = case
      when new.raw_user_meta_data ->> 'role' in ('platform_admin', 'school_admin', 'teacher', 'student', 'parent')
        then (new.raw_user_meta_data ->> 'role')::public.profile_role
      else public.profiles.role
    end,
    school_name = coalesce(new.raw_user_meta_data ->> 'school_name', public.profiles.school_name)
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email, raw_user_meta_data on auth.users
  for each row execute procedure public.handle_updated_user();
