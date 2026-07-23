-- Name/reference based RPCs let the existing production forms create records
-- in the normalized education tables without exposing cross-school IDs.

create or replace function public.resolve_school_group(_reference text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select teaching_group.id
  from public.teaching_groups teaching_group
  where teaching_group.school_id = public.current_school_id()
    and teaching_group.is_active
    and (
      lower(teaching_group.name) = lower(trim(_reference))
      or lower(coalesce(teaching_group.code, '')) = lower(trim(_reference))
    )
  order by teaching_group.name
  limit 1
$$;

create or replace function public.resolve_school_subject(_reference text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select subject.id
  from public.subjects subject
  where subject.school_id = public.current_school_id()
    and subject.is_active
    and (
      lower(subject.name) = lower(trim(_reference))
      or lower(subject.code) = lower(trim(_reference))
    )
  order by subject.name
  limit 1
$$;

create or replace function public.resolve_school_student(_reference text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select student.profile_id
  from public.student_records student
  join public.profiles profile on profile.id = student.profile_id
  where student.school_id = public.current_school_id()
    and student.status in ('planned','active')
    and (
      lower(student.student_number) = lower(trim(_reference))
      or lower(profile.email) = lower(trim(_reference))
      or lower(profile.full_name) = lower(trim(_reference))
      or lower(coalesce(student.preferred_name, '')) = lower(trim(_reference))
    )
  order by case when lower(student.student_number) = lower(trim(_reference)) then 0 else 1 end
  limit 1
$$;

create or replace function public.create_school_assessment(
  _title text,
  _group_reference text,
  _subject_reference text,
  _assessment_type text,
  _occurs_at timestamptz,
  _maximum_score numeric,
  _weight numeric,
  _status text default 'draft'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  group_id uuid := public.resolve_school_group(_group_reference);
  subject_id uuid := public.resolve_school_subject(_subject_reference);
  assessment_id uuid;
begin
  if not public.has_permission('tests.create') then raise exception 'Geen recht om toetsen aan te maken'; end if;
  if group_id is null then raise exception 'Klas of lesgroep niet gevonden'; end if;
  if trim(_subject_reference) <> '' and subject_id is null then raise exception 'Vak niet gevonden'; end if;
  if _weight is null or _weight <= 0 then raise exception 'Weging moet groter zijn dan nul'; end if;
  if _status not in ('draft','scheduled','grading','published','cancelled') then
    raise exception 'Ongeldige toetsstatus';
  end if;

  insert into public.assessments (
    school_id, teaching_group_id, subject_id, title, assessment_type,
    occurs_at, maximum_score, weight, status, created_by
  )
  values (
    public.current_school_id(), group_id, subject_id, trim(_title),
    coalesce(nullif(trim(_assessment_type), ''), 'test'), _occurs_at,
    _maximum_score, _weight, _status, auth.uid()
  )
  returning id into assessment_id;
  return assessment_id;
end;
$$;

create or replace function public.create_school_assignment(
  _title text,
  _instructions text,
  _group_reference text,
  _subject_reference text,
  _due_at timestamptz,
  _status text default 'draft'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  group_id uuid := public.resolve_school_group(_group_reference);
  subject_id uuid := public.resolve_school_subject(_subject_reference);
  assignment_id uuid;
begin
  if not public.has_permission('assignments.create') then
    raise exception 'Geen recht om opdrachten aan te maken';
  end if;
  if group_id is null then raise exception 'Klas of lesgroep niet gevonden'; end if;
  if trim(_subject_reference) <> '' and subject_id is null then raise exception 'Vak niet gevonden'; end if;
  if _status not in ('draft','published','closed','archived') then
    raise exception 'Ongeldige opdrachtstatus';
  end if;

  insert into public.assignments (
    school_id, teaching_group_id, subject_id, title, instructions,
    due_at, status, created_by
  )
  values (
    public.current_school_id(), group_id, subject_id, trim(_title), nullif(trim(_instructions), ''),
    _due_at, _status, auth.uid()
  )
  returning id into assignment_id;
  return assignment_id;
end;
$$;

create or replace function public.record_school_grade(
  _assessment_title text,
  _student_reference text,
  _score numeric,
  _grade numeric,
  _note text,
  _status text default 'draft'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  assessment_id uuid;
  student_id uuid := public.resolve_school_student(_student_reference);
  grade_id uuid;
begin
  if not (public.has_permission('grades.create') or public.has_permission('grades.update')) then
    raise exception 'Geen recht om cijfers in te voeren';
  end if;
  select assessment.id into assessment_id
  from public.assessments assessment
  join public.student_group_memberships membership
    on membership.teaching_group_id = assessment.teaching_group_id
  where assessment.school_id = public.current_school_id()
    and lower(assessment.title) = lower(trim(_assessment_title))
    and membership.student_profile_id = student_id
    and membership.status in ('planned','active')
  order by assessment.occurs_at desc nulls last, assessment.created_at desc
  limit 1;

  if student_id is null then raise exception 'Leerling niet gevonden'; end if;
  if assessment_id is null then
    raise exception 'Toets niet gevonden voor deze leerling';
  end if;
  if _grade is not null and (_grade < 0 or _grade > 10) then
    raise exception 'Cijfer moet tussen 0 en 10 liggen';
  end if;
  if _status not in ('draft','published','corrected') then raise exception 'Ongeldige cijferstatus'; end if;

  insert into public.grades (
    school_id, assessment_id, student_profile_id, score, grade, note,
    status, graded_by, graded_at
  )
  values (
    public.current_school_id(), assessment_id, student_id, _score, _grade,
    nullif(trim(_note), ''), _status, auth.uid(), now()
  )
  on conflict (assessment_id, student_profile_id) do update
  set score = excluded.score,
      grade = excluded.grade,
      note = excluded.note,
      status = excluded.status,
      graded_by = auth.uid(),
      graded_at = now(),
      updated_at = now()
  returning id into grade_id;
  return grade_id;
end;
$$;

grant execute on function public.resolve_school_group(text) to authenticated;
grant execute on function public.resolve_school_subject(text) to authenticated;
grant execute on function public.resolve_school_student(text) to authenticated;
grant execute on function public.create_school_assessment(text,text,text,text,timestamptz,numeric,numeric,text) to authenticated;
grant execute on function public.create_school_assignment(text,text,text,text,timestamptz,text) to authenticated;
grant execute on function public.record_school_grade(text,text,numeric,numeric,text,text) to authenticated;

