-- Phase 3: authoritative attendance and absence validation and role scopes.

create or replace function public.can_record_lesson_attendance(
  _entry_id uuid,
  _user_id uuid default auth.uid()
) returns boolean
language sql stable security definer set search_path=public,pg_temp as $$
  select (_user_id=auth.uid() or public.is_platform_admin(auth.uid())) and exists (
    select 1 from public.timetable_entries t
    where t.id=_entry_id
      and t.school_id=(select p.school_id from public.profiles p where p.id=_user_id)
      and t.status in ('scheduled','changed','completed')
      and (
        public.is_platform_admin(_user_id)
        or public.has_permission('attendance.manage',_user_id)
        or (
          (public.has_permission('attendance.create',_user_id) or public.has_permission('attendance.update',_user_id))
          and (
            t.teacher_profile_id=_user_id
            or exists(select 1 from public.substitutions s where s.timetable_entry_id=t.id and s.replacement_teacher_id=_user_id and s.status in ('assigned','accepted'))
            or exists(select 1 from public.teacher_group_assignments a where a.school_id=t.school_id and a.teaching_group_id=t.teaching_group_id and a.teacher_profile_id=_user_id and (a.starts_on is null or a.starts_on<=t.starts_at::date) and (a.ends_on is null or a.ends_on>=t.starts_at::date))
          )
        )
      )
  )
$$;

create or replace function public.student_belongs_to_lesson(_student_id uuid,_entry_id uuid)
returns boolean language sql stable security definer set search_path=public,pg_temp as $$
  select exists (
    select 1 from public.timetable_entries t
    join public.profiles p on p.id=_student_id and p.school_id=t.school_id
    where t.id=_entry_id and (
      exists(select 1 from public.student_group_memberships m where m.student_profile_id=_student_id and m.teaching_group_id=t.teaching_group_id and m.status='active' and (m.starts_on is null or m.starts_on<=t.starts_at::date) and (m.ends_on is null or m.ends_on>=t.starts_at::date))
      or exists(select 1 from public.teaching_groups g join public.student_enrolments e on e.class_id=g.base_class_id and e.student_profile_id=_student_id and e.school_year_id=t.school_year_id and e.status='active' where g.id=t.teaching_group_id and (e.starts_on is null or e.starts_on<=t.starts_at::date) and (e.ends_on is null or e.ends_on>=t.starts_at::date))
    )
  )
$$;

create or replace function public.validate_attendance_record()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare entry_school uuid; student_school uuid; recorder_school uuid;
begin
  if tg_op='UPDATE' and (new.school_id is distinct from old.school_id or new.timetable_entry_id is distinct from old.timetable_entry_id or new.student_profile_id is distinct from old.student_profile_id) then
    raise exception using errcode='23514',message='School, les en leerling van een aanwezigheidsrecord kunnen niet worden gewijzigd';
  end if;
  select school_id into entry_school from public.timetable_entries where id=new.timetable_entry_id;
  select school_id into student_school from public.profiles where id=new.student_profile_id;
  select school_id into recorder_school from public.profiles where id=new.recorded_by;
  if entry_school is null or entry_school is distinct from new.school_id then raise exception using errcode='23514',message='De les hoort niet bij deze school'; end if;
  if student_school is null or student_school is distinct from new.school_id then raise exception using errcode='23514',message='De leerling hoort niet bij deze school'; end if;
  if recorder_school is null or recorder_school is distinct from new.school_id then raise exception using errcode='23514',message='De registrator hoort niet bij deze school'; end if;
  if not public.student_belongs_to_lesson(new.student_profile_id,new.timetable_entry_id) then raise exception using errcode='23514',message='De leerling hoort niet bij deze les'; end if;
  if new.status='late' and new.minutes_late=0 then raise exception using errcode='23514',message='Vul het aantal minuten te laat in'; end if;
  if new.status<>'late' then new.minutes_late=0; end if;
  new.updated_at=now();
  if tg_op='UPDATE' then new.recorded_at=now(); end if;
  return new;
end $$;

drop trigger if exists validate_attendance_record on public.attendance_records;
create trigger validate_attendance_record before insert or update on public.attendance_records
for each row execute function public.validate_attendance_record();

create or replace function public.validate_absence_request()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare student_school uuid; reporter_school uuid; reviewer_school uuid;
begin
  if tg_op='UPDATE' and (new.school_id is distinct from old.school_id or new.student_profile_id is distinct from old.student_profile_id or new.reported_by is distinct from old.reported_by) then
    raise exception using errcode='23514',message='School, leerling en melder van een absentieverzoek kunnen niet worden gewijzigd';
  end if;
  select school_id into student_school from public.profiles where id=new.student_profile_id;
  select school_id into reporter_school from public.profiles where id=new.reported_by;
  if student_school is null or student_school is distinct from new.school_id then raise exception using errcode='23514',message='De leerling hoort niet bij deze school'; end if;
  if reporter_school is null or reporter_school is distinct from new.school_id then raise exception using errcode='23514',message='De melder hoort niet bij deze school'; end if;
  if new.reviewed_by is not null then
    select school_id into reviewer_school from public.profiles where id=new.reviewed_by;
    if reviewer_school is distinct from new.school_id then raise exception using errcode='23514',message='De beoordelaar hoort niet bij deze school'; end if;
  end if;
  if new.status in ('approved','rejected') and (new.reviewed_by is null or new.reviewed_at is null) then raise exception using errcode='23514',message='Een verwerkt verzoek vereist beoordelaar en beoordelingsdatum'; end if;
  new.updated_at=now(); return new;
end $$;

drop trigger if exists validate_absence_request on public.absence_requests;
create trigger validate_absence_request before insert or update on public.absence_requests
for each row execute function public.validate_absence_request();

drop policy if exists attendance_read on public.attendance_records;
drop policy if exists attendance_manage on public.attendance_records;
create policy attendance_read on public.attendance_records for select to authenticated using (
  school_id=public.current_school_id() and (
    student_profile_id=auth.uid()
    or public.can_record_lesson_attendance(timetable_entry_id)
    or (public.has_permission('attendance.view') and not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('student','teacher')))
  )
);
create policy attendance_insert on public.attendance_records for insert to authenticated with check (
  school_id=public.current_school_id() and recorded_by=auth.uid() and public.can_record_lesson_attendance(timetable_entry_id)
);
create policy attendance_update on public.attendance_records for update to authenticated using (
  school_id=public.current_school_id() and public.can_record_lesson_attendance(timetable_entry_id)
) with check (school_id=public.current_school_id() and recorded_by=auth.uid() and public.can_record_lesson_attendance(timetable_entry_id));
create policy attendance_delete on public.attendance_records for delete to authenticated using (
  school_id=public.current_school_id() and public.has_permission('attendance.manage')
);

drop policy if exists absence_read on public.absence_requests;
drop policy if exists absence_create on public.absence_requests;
drop policy if exists absence_manage on public.absence_requests;
create policy absence_read on public.absence_requests for select to authenticated using (
  school_id=public.current_school_id() and (
    student_profile_id=auth.uid()
    or exists(select 1 from public.guardian_student_links g where g.school_id=absence_requests.school_id and g.student_profile_id=absence_requests.student_profile_id and g.guardian_profile_id=auth.uid() and g.is_active)
    or public.can_access_student(student_profile_id,'absences.view')
  )
);
create policy absence_insert on public.absence_requests for insert to authenticated with check (
  school_id=public.current_school_id() and reported_by=auth.uid() and (
    student_profile_id=auth.uid()
    or exists(select 1 from public.guardian_student_links g where g.school_id=absence_requests.school_id and g.student_profile_id=absence_requests.student_profile_id and g.guardian_profile_id=auth.uid() and g.is_active)
    or public.has_permission('absences.create')
  )
);
create policy absence_update on public.absence_requests for update to authenticated using (
  school_id=public.current_school_id() and (public.has_permission('absences.update') or public.has_permission('absences.approve') or public.has_permission('absences.manage'))
) with check (school_id=public.current_school_id() and reviewed_by=auth.uid());

revoke all on table public.attendance_records,public.absence_requests from anon;
revoke all on table public.attendance_records,public.absence_requests from authenticated;
grant select,insert,update,delete on table public.attendance_records to authenticated;
grant select,insert,update on table public.absence_requests to authenticated;
revoke execute on function public.can_record_lesson_attendance(uuid,uuid),public.student_belongs_to_lesson(uuid,uuid),public.validate_attendance_record(),public.validate_absence_request() from public,anon;
grant execute on function public.can_record_lesson_attendance(uuid,uuid),public.student_belongs_to_lesson(uuid,uuid) to authenticated;
notify pgrst,'reload schema';
