-- Resolve the legacy overload ambiguity by always checking the authenticated
-- user against profiles. The older no-argument helper only checks JWT metadata,
-- while admin access in the current portal is stored in public.profiles.

alter table public.schools enable row level security;

drop policy if exists "platform_admin_all_schools" on public.schools;
drop policy if exists "Platform admins can read schools" on public.schools;
drop policy if exists "Platform admins can insert schools" on public.schools;
drop policy if exists "Platform admins can update schools" on public.schools;
drop policy if exists "Platform admins can delete schools" on public.schools;
drop policy if exists "Platform admins manage schools" on public.schools;

create policy "Platform admins manage schools"
on public.schools
for all
to authenticated
using (public.is_platform_admin(auth.uid()))
with check (public.is_platform_admin(auth.uid()));

-- Apply the same explicit check to the admin tables that used the ambiguous
-- helper, without touching users' existing own-profile policies.
drop policy if exists "Platform admins can read all profiles" on public.profiles;
create policy "Platform admins can read all profiles"
on public.profiles
for select
to authenticated
using (public.is_platform_admin(auth.uid()));

drop policy if exists "Platform admins can insert profiles" on public.profiles;
create policy "Platform admins can insert profiles"
on public.profiles
for insert
to authenticated
with check (public.is_platform_admin(auth.uid()));

drop policy if exists "Platform admins can update all profiles" on public.profiles;
create policy "Platform admins can update all profiles"
on public.profiles
for update
to authenticated
using (public.is_platform_admin(auth.uid()))
with check (public.is_platform_admin(auth.uid()));

drop policy if exists "Platform admins can delete profiles" on public.profiles;
create policy "Platform admins can delete profiles"
on public.profiles
for delete
to authenticated
using (public.is_platform_admin(auth.uid()));

drop policy if exists "Platform admins can read audit logs" on public.admin_audit_logs;
create policy "Platform admins can read audit logs"
on public.admin_audit_logs
for select
to authenticated
using (public.is_platform_admin(auth.uid()));
