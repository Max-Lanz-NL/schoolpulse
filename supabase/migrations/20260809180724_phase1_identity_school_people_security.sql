-- Phase 1 exposes only the typed Identity, School and People surfaces required by the app.
-- Data API grants and RLS are deliberately both explicit.

grant select, update on table public.profiles to authenticated;
grant select on table public.schools to authenticated;
grant update on table public.schools to authenticated;
grant select on table public.permission_definitions, public.school_roles,
  public.role_permissions, public.profile_role_assignments
  to authenticated;
grant insert, update, delete on table public.profile_role_assignments to authenticated;

grant select, insert, update, delete on table
  public.school_years, public.school_periods, public.school_locations,
  public.education_programmes, public.subjects, public.school_classes,
  public.teaching_groups, public.rooms
  to authenticated;

grant select, insert, update, delete on table
  public.student_records, public.staff_records, public.student_enrolments,
  public.guardian_student_links, public.teacher_subject_assignments,
  public.teacher_group_assignments, public.student_group_memberships
  to authenticated;

drop policy if exists schools_read_own_tenant on public.schools;
create policy schools_read_own_tenant on public.schools
for select to authenticated
using (public.is_platform_admin(auth.uid()) or id = public.current_school_id());

drop policy if exists schools_update_own_tenant on public.schools;
create policy schools_update_own_tenant on public.schools
for update to authenticated
using (id = public.current_school_id() and public.has_permission('school_settings.manage'))
with check (id = public.current_school_id() and public.has_permission('school_settings.manage'));

-- Rooms are School structure in 1.0, while Timetable may continue using schedule permissions.
drop policy if exists rooms_read on public.rooms;
create policy rooms_read on public.rooms for select to authenticated
using (
  public.is_platform_admin(auth.uid()) or
  (school_id = public.current_school_id() and (
    public.has_permission('school_settings.view') or
    public.has_permission('classes.view') or
    public.has_permission('schedule.view')
  ))
);

drop policy if exists rooms_manage on public.rooms;
create policy rooms_manage on public.rooms for all to authenticated
using (
  public.is_platform_admin(auth.uid()) or
  (school_id = public.current_school_id() and (
    public.has_permission('school_settings.manage') or
    public.has_permission('classes.manage') or
    public.has_permission('schedule.manage')
  ))
)
with check (
  public.is_platform_admin(auth.uid()) or
  (school_id = public.current_school_id() and (
    public.has_permission('school_settings.manage') or
    public.has_permission('classes.manage') or
    public.has_permission('schedule.manage')
  ))
);

-- Public gets EXECUTE by default in PostgreSQL. These authorization helpers are authenticated APIs.
revoke execute on function public.current_school_id() from public, anon;
revoke execute on function public.is_platform_admin(uuid) from public, anon;
revoke execute on function public.effective_permissions(uuid) from public, anon;
revoke execute on function public.effective_rank(uuid) from public, anon;
revoke execute on function public.has_permission(text, uuid) from public, anon;
revoke execute on function public.can_access_student(uuid, text, uuid) from public, anon;

grant execute on function public.current_school_id() to authenticated;
grant execute on function public.is_platform_admin(uuid) to authenticated;
grant execute on function public.effective_permissions(uuid) to authenticated;
grant execute on function public.effective_rank(uuid) to authenticated;
grant execute on function public.has_permission(text, uuid) to authenticated;
grant execute on function public.can_access_student(uuid, text, uuid) to authenticated;

drop policy if exists profile_school_context_read on public.profiles;
create policy profile_school_context_read on public.profiles
for select to authenticated
using (
  id = auth.uid() or
  public.is_platform_admin(auth.uid()) or
  (
    school_id = public.current_school_id() and
    (
      public.has_permission('user_management.view') or
      public.has_permission('user_management.manage') or
      public.can_access_student(id, 'students.view') or
      (role in ('teacher', 'school_admin') and public.has_permission('staff.view'))
    )
  )
);

-- Trigger-only functions are not client APIs.
revoke execute on function public.prevent_school_id_change() from public, anon, authenticated;
revoke execute on function public.prevent_linked_profile_school_change() from public, anon, authenticated;
revoke execute on function public.validate_school_people_reference() from public, anon, authenticated;
revoke execute on function public.validate_school_structure_reference() from public, anon, authenticated;
revoke execute on function public.normalize_single_school_structure_flag() from public, anon, authenticated;
