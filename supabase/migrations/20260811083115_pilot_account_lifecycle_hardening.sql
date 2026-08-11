-- A banned Auth user can retain an already issued access token until it expires.
-- Keep an authoritative application-side block flag so every core helper denies
-- data access immediately, independently from JWT freshness.
alter table public.profiles
  add column if not exists is_blocked boolean not null default false;

create index if not exists idx_profiles_blocked
  on public.profiles(id)
  where is_blocked;

create or replace function public.current_school_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select school_id
  from public.profiles
  where id = auth.uid()
    and not is_blocked;
$$;

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
      and not p.is_blocked
  );
$$;

create or replace function public.can_manage_school_data()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and not is_blocked
      and role in ('platform_admin', 'school_admin', 'teacher')
  );
$$;

create or replace function public.effective_permissions(_user_id uuid default auth.uid())
returns table(permission_key text, scope text, source_roles text[])
language sql
stable
security definer
set search_path = public
as $$
  select rp.permission_key,
    (array_agg(rp.scope order by case rp.scope when 'school' then 4 when 'team' then 3 when 'assigned' then 2 else 1 end desc))[1],
    array_agg(distinct sr.name order by sr.name)
  from public.profile_role_assignments pra
  join public.school_roles sr on sr.id = pra.role_id and sr.is_active
  join public.role_permissions rp on rp.role_id = sr.id
  join public.profiles p on p.id = pra.profile_id and p.school_id = sr.school_id and not p.is_blocked
  where pra.profile_id = _user_id
    and (_user_id = auth.uid() or public.is_platform_admin(auth.uid()))
  group by rp.permission_key;
$$;

revoke execute on function public.current_school_id() from public, anon;
revoke execute on function public.is_platform_admin(uuid) from public, anon;
revoke execute on function public.can_manage_school_data() from public, anon;
revoke execute on function public.effective_permissions(uuid) from public, anon;
grant execute on function public.current_school_id() to authenticated;
grant execute on function public.is_platform_admin(uuid) to authenticated;
grant execute on function public.can_manage_school_data() to authenticated;
grant execute on function public.effective_permissions(uuid) to authenticated;
