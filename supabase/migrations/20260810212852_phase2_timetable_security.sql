-- Phase 2: make the typed timetable tables authoritative and safe for direct Data API use.

create or replace function public.validate_timetable_entry()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  ref_school uuid;
begin
  if tg_op = 'UPDATE' and new.school_id is distinct from old.school_id then
    raise exception using errcode='23514', message='Een roosteritem kan niet naar een andere school worden verplaatst';
  end if;

  select school_id into ref_school from public.school_years where id=new.school_year_id;
  if ref_school is distinct from new.school_id then raise exception using errcode='23514', message='Het schooljaar hoort niet bij deze school'; end if;
  select school_id into ref_school from public.teaching_groups where id=new.teaching_group_id;
  if ref_school is distinct from new.school_id then raise exception using errcode='23514', message='De lesgroep hoort niet bij deze school'; end if;
  if new.subject_id is not null then
    select school_id into ref_school from public.subjects where id=new.subject_id;
    if ref_school is distinct from new.school_id then raise exception using errcode='23514', message='Het vak hoort niet bij deze school'; end if;
  end if;
  if new.teacher_profile_id is not null then
    select school_id into ref_school from public.profiles where id=new.teacher_profile_id;
    if ref_school is distinct from new.school_id then raise exception using errcode='23514', message='De docent hoort niet bij deze school'; end if;
    if new.subject_id is not null and not exists (
      select 1 from public.teacher_subject_assignments a
      where a.school_id=new.school_id and a.teacher_profile_id=new.teacher_profile_id
        and a.school_year_id=new.school_year_id and a.subject_id=new.subject_id
    ) then raise exception using errcode='23514', message='De docent is niet aan dit vak gekoppeld'; end if;
    if not exists (
      select 1 from public.teacher_group_assignments a
      where a.school_id=new.school_id and a.teacher_profile_id=new.teacher_profile_id
        and a.teaching_group_id=new.teaching_group_id
        and (a.starts_on is null or a.starts_on <= new.starts_at::date)
        and (a.ends_on is null or a.ends_on >= new.starts_at::date)
    ) then raise exception using errcode='23514', message='De docent is niet aan deze lesgroep gekoppeld'; end if;
  end if;
  if new.room_id is not null then
    select school_id into ref_school from public.rooms where id=new.room_id;
    if ref_school is distinct from new.school_id then raise exception using errcode='23514', message='Het lokaal hoort niet bij deze school'; end if;
  end if;

  if new.status in ('scheduled','changed') and exists (
    select 1 from public.timetable_entries t
    where t.id<>new.id and t.school_id=new.school_id and t.status in ('scheduled','changed')
      and tstzrange(t.starts_at,t.ends_at,'[)') && tstzrange(new.starts_at,new.ends_at,'[)')
      and (t.teaching_group_id=new.teaching_group_id
        or (new.teacher_profile_id is not null and t.teacher_profile_id=new.teacher_profile_id)
        or (new.room_id is not null and t.room_id=new.room_id))
  ) then raise exception using errcode='23P01', message='Roosterconflict: docent, lesgroep of lokaal is al bezet'; end if;
  new.updated_at=now();
  return new;
end;
$$;

drop trigger if exists validate_timetable_entry on public.timetable_entries;
create trigger validate_timetable_entry before insert or update on public.timetable_entries
for each row execute function public.validate_timetable_entry();

create or replace function public.validate_substitution()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare lesson public.timetable_entries%rowtype; ref_school uuid;
begin
  select * into lesson from public.timetable_entries where id=new.timetable_entry_id;
  if lesson.id is null or lesson.school_id is distinct from new.school_id then
    raise exception using errcode='23514', message='Het roosteritem hoort niet bij deze school';
  end if;
  if new.original_teacher_id is distinct from lesson.teacher_profile_id then
    raise exception using errcode='23514', message='De oorspronkelijke docent komt niet overeen met het roosteritem';
  end if;
  if new.replacement_teacher_id is not null then
    select school_id into ref_school from public.profiles where id=new.replacement_teacher_id;
    if ref_school is distinct from new.school_id then raise exception using errcode='23514', message='De vervangende docent hoort niet bij deze school'; end if;
    if new.replacement_teacher_id=lesson.teacher_profile_id then raise exception using errcode='23514', message='Kies een andere vervangende docent'; end if;
    if new.status in ('assigned','accepted') and exists (
      select 1 from public.timetable_entries t where t.school_id=new.school_id and t.id<>lesson.id
        and t.status in ('scheduled','changed') and t.teacher_profile_id=new.replacement_teacher_id
        and tstzrange(t.starts_at,t.ends_at,'[)') && tstzrange(lesson.starts_at,lesson.ends_at,'[)')
    ) then raise exception using errcode='23P01', message='Roosterconflict: de vervangende docent is al bezet'; end if;
  end if;
  new.updated_at=now(); return new;
end $$;

drop trigger if exists validate_substitution on public.substitutions;
create trigger validate_substitution before insert or update on public.substitutions
for each row execute function public.validate_substitution();
create unique index if not exists substitutions_one_active_per_entry on public.substitutions(timetable_entry_id)
where status in ('open','assigned','accepted');

create or replace function public.can_view_timetable_entry(_entry public.timetable_entries, _user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public,pg_temp as $$
  select (_user_id=auth.uid() or public.is_platform_admin(auth.uid())) and (
    public.is_platform_admin(_user_id) or (
      _entry.school_id=(select p.school_id from public.profiles p where p.id=_user_id) and (
        public.has_permission('schedule.manage',_user_id)
        or public.has_permission('schedule.create',_user_id)
        or public.has_permission('schedule.update',_user_id)
        or _entry.teacher_profile_id=_user_id
        or exists(select 1 from public.substitutions s where s.timetable_entry_id=_entry.id and s.replacement_teacher_id=_user_id and s.status in ('assigned','accepted'))
        or exists(select 1 from public.student_group_memberships m where m.teaching_group_id=_entry.teaching_group_id and m.student_profile_id=_user_id and m.status='active' and (m.starts_on is null or m.starts_on<=_entry.starts_at::date) and (m.ends_on is null or m.ends_on>=_entry.starts_at::date))
        or exists(select 1 from public.teaching_groups g join public.student_enrolments e on e.class_id=g.base_class_id and e.student_profile_id=_user_id and e.school_year_id=_entry.school_year_id and e.status='active' where g.id=_entry.teaching_group_id and (e.starts_on is null or e.starts_on<=_entry.starts_at::date) and (e.ends_on is null or e.ends_on>=_entry.starts_at::date))
        or (public.has_permission('schedule.view',_user_id) and not exists(select 1 from public.profiles p where p.id=_user_id and p.role in ('student','teacher')))
      )
    )
  )
$$;

drop policy if exists timetable_read on public.timetable_entries;
drop policy if exists timetable_manage on public.timetable_entries;
create policy timetable_read on public.timetable_entries for select to authenticated using (public.can_view_timetable_entry(timetable_entries));
create policy timetable_insert on public.timetable_entries for insert to authenticated with check (school_id=public.current_school_id() and (public.has_permission('schedule.create') or public.has_permission('schedule.manage')));
create policy timetable_update on public.timetable_entries for update to authenticated using (school_id=public.current_school_id() and (public.has_permission('schedule.update') or public.has_permission('schedule.manage'))) with check (school_id=public.current_school_id() and (public.has_permission('schedule.update') or public.has_permission('schedule.manage')));
create policy timetable_delete on public.timetable_entries for delete to authenticated using (school_id=public.current_school_id() and (public.has_permission('schedule.delete') or public.has_permission('schedule.manage')));

drop policy if exists substitution_read on public.substitutions;
drop policy if exists substitution_manage on public.substitutions;
create policy substitution_read on public.substitutions for select to authenticated using (school_id=public.current_school_id() and (public.has_permission('substitutions.view') or original_teacher_id=auth.uid() or replacement_teacher_id=auth.uid() or exists(select 1 from public.timetable_entries t where t.id=timetable_entry_id and public.can_view_timetable_entry(t))));
create policy substitution_insert on public.substitutions for insert to authenticated with check (school_id=public.current_school_id() and (public.has_permission('substitutions.create') or public.has_permission('substitutions.manage')));
create policy substitution_update on public.substitutions for update to authenticated using (school_id=public.current_school_id() and (public.has_permission('substitutions.update') or public.has_permission('substitutions.manage'))) with check (school_id=public.current_school_id() and (public.has_permission('substitutions.update') or public.has_permission('substitutions.manage')));
create policy substitution_delete on public.substitutions for delete to authenticated using (school_id=public.current_school_id() and (public.has_permission('substitutions.delete') or public.has_permission('substitutions.manage')));

revoke all on table public.timetable_entries, public.substitutions from anon;
grant select,insert,update,delete on table public.timetable_entries, public.substitutions to authenticated;
revoke execute on function public.validate_timetable_entry(), public.validate_substitution(), public.can_view_timetable_entry(public.timetable_entries,uuid) from public,anon;
grant execute on function public.can_view_timetable_entry(public.timetable_entries,uuid) to authenticated;
notify pgrst, 'reload schema';
