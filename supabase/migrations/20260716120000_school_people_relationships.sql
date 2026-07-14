-- Real people, enrolment and teaching relationships.
-- These tables replace JSON-based ownership checks with verifiable database links.

create table public.student_records (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  student_number text not null check (length(trim(student_number)) between 1 and 40),
  preferred_name text,
  date_of_birth date,
  start_date date,
  end_date date,
  status text not null default 'active' check (status in ('planned', 'active', 'graduated', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id),
  unique (school_id, student_number),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create table public.staff_records (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  employee_number text,
  job_title text,
  department text,
  start_date date,
  end_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create unique index staff_records_unique_employee_number
  on public.staff_records(school_id, employee_number) where employee_number is not null;

create table public.student_enrolments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_profile_id uuid not null references public.profiles(id) on delete cascade,
  school_year_id uuid not null references public.school_years(id) on delete restrict,
  class_id uuid references public.school_classes(id) on delete restrict,
  programme_id uuid references public.education_programmes(id) on delete restrict,
  starts_on date,
  ends_on date,
  status text not null default 'active' check (status in ('planned', 'active', 'completed', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

create unique index student_enrolments_one_active_per_year
  on public.student_enrolments(student_profile_id, school_year_id) where status = 'active';
create index student_enrolments_class on public.student_enrolments(class_id, status);

create table public.guardian_student_links (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  guardian_profile_id uuid not null references public.profiles(id) on delete cascade,
  student_profile_id uuid not null references public.profiles(id) on delete cascade,
  relationship text not null default 'parent' check (relationship in ('parent', 'guardian', 'foster_parent', 'stepparent', 'other')),
  has_legal_authority boolean not null default true,
  receives_communication boolean not null default true,
  financial_responsibility boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (guardian_profile_id, student_profile_id),
  check (guardian_profile_id <> student_profile_id)
);

create index guardian_student_links_student on public.guardian_student_links(student_profile_id, is_active);

create table public.teacher_subject_assignments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  teacher_profile_id uuid not null references public.profiles(id) on delete cascade,
  school_year_id uuid not null references public.school_years(id) on delete restrict,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (teacher_profile_id, school_year_id, subject_id)
);

create table public.teacher_group_assignments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  teacher_profile_id uuid not null references public.profiles(id) on delete cascade,
  teaching_group_id uuid not null references public.teaching_groups(id) on delete cascade,
  assignment_role text not null default 'teacher' check (assignment_role in ('lead_teacher', 'teacher', 'mentor', 'assistant', 'substitute')),
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (teacher_profile_id, teaching_group_id, assignment_role),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

create index teacher_group_assignments_group on public.teacher_group_assignments(teaching_group_id);

create table public.student_group_memberships (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_profile_id uuid not null references public.profiles(id) on delete cascade,
  teaching_group_id uuid not null references public.teaching_groups(id) on delete cascade,
  starts_on date,
  ends_on date,
  status text not null default 'active' check (status in ('planned', 'active', 'completed', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_profile_id, teaching_group_id),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

create index student_group_memberships_group on public.student_group_memberships(teaching_group_id, status);

create or replace function public.prevent_linked_profile_school_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.school_id is distinct from old.school_id and (
    exists (select 1 from public.student_records where profile_id = old.id)
    or exists (select 1 from public.staff_records where profile_id = old.id)
    or exists (select 1 from public.student_enrolments where student_profile_id = old.id)
    or exists (select 1 from public.guardian_student_links where guardian_profile_id = old.id or student_profile_id = old.id)
    or exists (select 1 from public.teacher_subject_assignments where teacher_profile_id = old.id)
    or exists (select 1 from public.teacher_group_assignments where teacher_profile_id = old.id)
    or exists (select 1 from public.student_group_memberships where student_profile_id = old.id)
  ) then
    raise exception 'Verwijder eerst de schoolinschrijvingen en koppelingen voordat dit account naar een andere school gaat';
  end if;
  return new;
end;
$$;

create trigger protect_linked_profile_school
before update of school_id on public.profiles
for each row execute function public.prevent_linked_profile_school_change();

-- Every referenced profile and structure record must belong to the row's school.
create or replace function public.validate_school_people_reference()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_table_name in ('student_records', 'staff_records') then
    if not exists (select 1 from public.profiles where id = new.profile_id and school_id = new.school_id) then
      raise exception 'Het account hoort niet bij deze school';
    end if;
  end if;

  if tg_table_name in ('student_enrolments', 'guardian_student_links', 'student_group_memberships') then
    if not exists (select 1 from public.profiles where id = new.student_profile_id and school_id = new.school_id) then
      raise exception 'Het leerlingaccount hoort niet bij deze school';
    end if;
  end if;

  if tg_table_name = 'guardian_student_links' and not exists (
    select 1 from public.profiles where id = new.guardian_profile_id and school_id = new.school_id
  ) then raise exception 'Het ouder- of verzorgeraccount hoort niet bij deze school'; end if;

  if tg_table_name in ('teacher_subject_assignments', 'teacher_group_assignments') and not exists (
    select 1 from public.profiles where id = new.teacher_profile_id and school_id = new.school_id
  ) then raise exception 'Het medewerkersaccount hoort niet bij deze school'; end if;

  if tg_table_name in ('student_enrolments', 'teacher_subject_assignments') and not exists (
    select 1 from public.school_years where id = new.school_year_id and school_id = new.school_id
  ) then raise exception 'Het schooljaar hoort niet bij deze school'; end if;

  if tg_table_name = 'student_enrolments' then
    if new.class_id is not null and not exists (
      select 1 from public.school_classes where id = new.class_id and school_id = new.school_id
        and school_year_id = new.school_year_id
    ) then raise exception 'De klas hoort niet bij deze school en dit schooljaar'; end if;
    if new.programme_id is not null and not exists (
      select 1 from public.education_programmes where id = new.programme_id and school_id = new.school_id
    ) then raise exception 'De opleiding hoort niet bij deze school'; end if;
  elsif tg_table_name = 'teacher_subject_assignments' and not exists (
    select 1 from public.subjects where id = new.subject_id and school_id = new.school_id
  ) then raise exception 'Het vak hoort niet bij deze school';
  elsif tg_table_name in ('teacher_group_assignments', 'student_group_memberships') and not exists (
    select 1 from public.teaching_groups where id = new.teaching_group_id and school_id = new.school_id
  ) then raise exception 'De lesgroep hoort niet bij deze school';
  end if;
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'student_records','staff_records','student_enrolments','guardian_student_links',
    'teacher_subject_assignments','teacher_group_assignments','student_group_memberships'
  ] loop
    execute format('create trigger validate_%I before insert or update on public.%I for each row execute function public.validate_school_people_reference()', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_school_structure_updated_at()', table_name, table_name);
    execute format('create trigger protect_%I_school before update on public.%I for each row execute function public.prevent_school_id_change()', table_name, table_name);
    execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function public.write_admin_audit_log()', table_name, table_name);
  end loop;
end $$;

-- Resolve own, guardian, assigned and school-wide student access from real relations.
create or replace function public.can_access_student(
  _student_profile_id uuid,
  _permission_key text default 'students.view',
  _user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    (_user_id = auth.uid() or public.is_platform_admin(auth.uid()))
    and (
    public.is_platform_admin(_user_id)
    or _student_profile_id = _user_id
    or exists (
      select 1 from public.guardian_student_links link
      where link.guardian_profile_id = _user_id
        and link.student_profile_id = _student_profile_id and link.is_active
    )
    or exists (
      select 1
      from public.effective_permissions(_user_id) permission
      join public.profiles actor on actor.id = _user_id
      join public.profiles student on student.id = _student_profile_id and student.school_id = actor.school_id
      where permission.permission_key = _permission_key
        and (
          permission.scope = 'school'
          or (permission.scope in ('assigned', 'team') and exists (
            select 1
            from public.teacher_group_assignments teacher_group
            join public.teaching_groups teaching_group on teaching_group.id = teacher_group.teaching_group_id
            where teacher_group.teacher_profile_id = _user_id
              and (
                exists (
                  select 1 from public.student_group_memberships membership
                  where membership.teaching_group_id = teacher_group.teaching_group_id
                    and membership.student_profile_id = _student_profile_id
                    and membership.status in ('planned','active')
                )
                or exists (
                  select 1 from public.student_enrolments enrolment
                  where enrolment.student_profile_id = _student_profile_id
                    and enrolment.class_id = teaching_group.base_class_id
                    and enrolment.school_year_id = teaching_group.school_year_id
                    and enrolment.status in ('planned','active')
                )
              )
          ))
        )
    ));
$$;

revoke all on function public.can_access_student(uuid, text, uuid) from public;
grant execute on function public.can_access_student(uuid, text, uuid) to authenticated;

alter table public.student_records enable row level security;
alter table public.staff_records enable row level security;
alter table public.student_enrolments enable row level security;
alter table public.guardian_student_links enable row level security;
alter table public.teacher_subject_assignments enable row level security;
alter table public.teacher_group_assignments enable row level security;
alter table public.student_group_memberships enable row level security;

create policy read_student_records on public.student_records for select to authenticated
  using (public.can_access_student(profile_id, 'students.view'));
create policy manage_student_records on public.student_records for all to authenticated
  using (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and public.has_permission('students.manage')))
  with check (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and public.has_permission('students.manage')));

create policy read_student_enrolments on public.student_enrolments for select to authenticated
  using (public.can_access_student(student_profile_id, 'students.view'));
create policy manage_student_enrolments on public.student_enrolments for all to authenticated
  using (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and (public.has_permission('students.manage') or public.has_permission('classes.manage'))))
  with check (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and (public.has_permission('students.manage') or public.has_permission('classes.manage'))));

create policy read_guardian_links on public.guardian_student_links for select to authenticated
  using (guardian_profile_id = auth.uid() or student_profile_id = auth.uid() or public.can_access_student(student_profile_id, 'parents.view'));
create policy manage_guardian_links on public.guardian_student_links for all to authenticated
  using (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and public.has_permission('parents.manage')))
  with check (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and public.has_permission('parents.manage')));

create policy read_staff_records on public.staff_records for select to authenticated
  using (profile_id = auth.uid() or public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and public.has_permission('staff.view')));
create policy manage_staff_records on public.staff_records for all to authenticated
  using (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and public.has_permission('staff.manage')))
  with check (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and public.has_permission('staff.manage')));

create policy read_teacher_subjects on public.teacher_subject_assignments for select to authenticated
  using (teacher_profile_id = auth.uid() or public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and (public.has_permission('staff.view') or public.has_permission('classes.view'))));
create policy manage_teacher_subjects on public.teacher_subject_assignments for all to authenticated
  using (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and (public.has_permission('staff.manage') or public.has_permission('classes.manage'))))
  with check (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and (public.has_permission('staff.manage') or public.has_permission('classes.manage'))));

create policy read_teacher_groups on public.teacher_group_assignments for select to authenticated
  using (teacher_profile_id = auth.uid() or public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and (public.has_permission('staff.view') or public.has_permission('classes.view'))));
create policy manage_teacher_groups on public.teacher_group_assignments for all to authenticated
  using (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and (public.has_permission('staff.manage') or public.has_permission('classes.manage'))))
  with check (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and (public.has_permission('staff.manage') or public.has_permission('classes.manage'))));

create policy read_student_groups on public.student_group_memberships for select to authenticated
  using (public.can_access_student(student_profile_id, 'classes.view'));
create policy manage_student_groups on public.student_group_memberships for all to authenticated
  using (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and (public.has_permission('students.manage') or public.has_permission('classes.manage'))))
  with check (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and (public.has_permission('students.manage') or public.has_permission('classes.manage'))));

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'student_records','staff_records','student_enrolments','guardian_student_links',
    'teacher_subject_assignments','teacher_group_assignments','student_group_memberships'
  ] loop
    if not exists (
      select 1 from pg_publication_tables where pubname = 'supabase_realtime'
        and schemaname = 'public' and tablename = table_name
    ) then execute format('alter publication supabase_realtime add table public.%I', table_name); end if;
  end loop;
end $$;
