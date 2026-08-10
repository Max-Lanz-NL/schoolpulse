-- Expose only teacher display profiles referenced by timetable rows the caller may already read.
create policy profiles_read_visible_timetable_teachers
on public.profiles for select to authenticated
using (
  school_id=public.current_school_id()
  and (
    exists (
      select 1 from public.timetable_entries t
      where t.teacher_profile_id=profiles.id and public.can_view_timetable_entry(t)
    )
    or exists (
      select 1 from public.substitutions s
      join public.timetable_entries t on t.id=s.timetable_entry_id
      where s.replacement_teacher_id=profiles.id
        and s.status in ('assigned','accepted')
        and public.can_view_timetable_entry(t)
    )
  )
);

notify pgrst, 'reload schema';
