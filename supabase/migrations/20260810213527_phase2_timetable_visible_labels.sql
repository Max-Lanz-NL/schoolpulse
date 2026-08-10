-- Read labels only when they belong to an already-visible timetable entry.
create policy subjects_read_visible_timetable
on public.subjects for select to authenticated
using (
  school_id=public.current_school_id()
  and exists (
    select 1 from public.timetable_entries t
    where t.subject_id=subjects.id and public.can_view_timetable_entry(t)
  )
);

create policy teaching_groups_read_visible_timetable
on public.teaching_groups for select to authenticated
using (
  school_id=public.current_school_id()
  and exists (
    select 1 from public.timetable_entries t
    where t.teaching_group_id=teaching_groups.id and public.can_view_timetable_entry(t)
  )
);

notify pgrst, 'reload schema';
