-- SECURITY DEFINER functions must never inherit PostgreSQL's default PUBLIC
-- execute privilege. Browser-callable RPCs are granted back explicitly below.

revoke execute on function public.admin_create_role_from_template(uuid,text,text) from public, anon, authenticated;
revoke execute on function public.admin_delete_school_role(uuid) from public, anon, authenticated;
revoke execute on function public.admin_move_school_role(uuid,text) from public, anon, authenticated;
revoke execute on function public.admin_replace_role_permissions(uuid,jsonb) from public, anon, authenticated;
revoke execute on function public.admin_review_permission_request(uuid,text,text) from public, anon, authenticated;
revoke execute on function public.admin_set_profile_roles(uuid,uuid[],uuid) from public, anon, authenticated;
revoke execute on function public.app_record_scope_allows(text,uuid,jsonb) from public, anon, authenticated;
revoke execute on function public.can_access_group(uuid,uuid) from public, anon, authenticated;
revoke execute on function public.can_access_student(uuid,text,uuid) from public, anon, authenticated;
revoke execute on function public.can_change_app_record(public.app_records,text,uuid) from public, anon, authenticated;
revoke execute on function public.can_manage_school_data() from public, anon, authenticated;
revoke execute on function public.can_view_app_record(public.app_records,uuid) from public, anon, authenticated;
revoke execute on function public.capture_role_configuration_version() from public, anon, authenticated;
revoke execute on function public.create_school_assessment(text,text,text,text,timestamptz,numeric,numeric,text) from public, anon, authenticated;
revoke execute on function public.create_school_assignment(text,text,text,text,timestamptz,text) from public, anon, authenticated;
revoke execute on function public.create_school_conversation(text,text,text[],text) from public, anon, authenticated;
revoke execute on function public.current_school_id() from public, anon, authenticated;
revoke execute on function public.deactivate_guardian_student_link(uuid) from public, anon, authenticated;
revoke execute on function public.effective_permissions(uuid) from public, anon, authenticated;
revoke execute on function public.effective_rank(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_updated_user() from public, anon, authenticated;
revoke execute on function public.has_permission(text,uuid) from public, anon, authenticated;
revoke execute on function public.is_conversation_participant(uuid,uuid) from public, anon, authenticated;
revoke execute on function public.is_platform_admin(uuid) from public, anon, authenticated;
revoke execute on function public.manage_guardian_student_link(text,text,text,boolean,boolean,boolean) from public, anon, authenticated;
revoke execute on function public.normalize_school_role_ranks(uuid) from public, anon, authenticated;
revoke execute on function public.owns_conversation(uuid,uuid) from public, anon, authenticated;
revoke execute on function public.prevent_linked_profile_school_change() from public, anon, authenticated;
revoke execute on function public.record_school_grade(text,text,numeric,numeric,text,text) from public, anon, authenticated;
revoke execute on function public.resolve_school_group(text) from public, anon, authenticated;
revoke execute on function public.resolve_school_student(text) from public, anon, authenticated;
revoke execute on function public.resolve_school_subject(text) from public, anon, authenticated;
revoke execute on function public.seed_school_role_templates() from public, anon, authenticated;
revoke execute on function public.send_school_message(uuid,text) from public, anon, authenticated;
revoke execute on function public.validate_operation_reference() from public, anon, authenticated;
revoke execute on function public.write_admin_audit_log() from public, anon, authenticated;

-- A teacher may only create education records for a group they can access.
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
  if auth.uid() is null then raise exception 'Aanmelden is verplicht'; end if;
  if not public.has_permission('tests.create') then raise exception 'Geen recht om toetsen aan te maken'; end if;
  if group_id is null then raise exception 'Klas of lesgroep niet gevonden'; end if;
  if not public.can_access_group(group_id) then raise exception 'Geen toegang tot deze lesgroep'; end if;
  if trim(_subject_reference) <> '' and subject_id is null then raise exception 'Vak niet gevonden'; end if;
  if _weight is null or _weight <= 0 then raise exception 'Weging moet groter zijn dan nul'; end if;
  if _status not in ('draft','scheduled','grading','published','cancelled') then
    raise exception 'Ongeldige toetsstatus';
  end if;

  insert into public.assessments (
    school_id, teaching_group_id, subject_id, title, assessment_type,
    occurs_at, maximum_score, weight, status, created_by
  ) values (
    public.current_school_id(), group_id, subject_id, trim(_title),
    coalesce(nullif(trim(_assessment_type), ''), 'test'), _occurs_at,
    _maximum_score, _weight, _status, auth.uid()
  ) returning id into assessment_id;
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
  if auth.uid() is null then raise exception 'Aanmelden is verplicht'; end if;
  if not public.has_permission('assignments.create') then raise exception 'Geen recht om opdrachten aan te maken'; end if;
  if group_id is null then raise exception 'Klas of lesgroep niet gevonden'; end if;
  if not public.can_access_group(group_id) then raise exception 'Geen toegang tot deze lesgroep'; end if;
  if trim(_subject_reference) <> '' and subject_id is null then raise exception 'Vak niet gevonden'; end if;
  if _status not in ('draft','published','closed','archived') then raise exception 'Ongeldige opdrachtstatus'; end if;

  insert into public.assignments (
    school_id, teaching_group_id, subject_id, title, instructions,
    due_at, status, created_by
  ) values (
    public.current_school_id(), group_id, subject_id, trim(_title), nullif(trim(_instructions), ''),
    _due_at, _status, auth.uid()
  ) returning id into assignment_id;
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
  assessment_group_id uuid;
  student_id uuid := public.resolve_school_student(_student_reference);
  grade_id uuid;
begin
  if auth.uid() is null then raise exception 'Aanmelden is verplicht'; end if;
  if not (public.has_permission('grades.create') or public.has_permission('grades.update')) then
    raise exception 'Geen recht om cijfers in te voeren';
  end if;
  if student_id is null then raise exception 'Leerling niet gevonden'; end if;

  select assessment.id, assessment.teaching_group_id
  into assessment_id, assessment_group_id
  from public.assessments assessment
  join public.student_group_memberships membership
    on membership.teaching_group_id = assessment.teaching_group_id
  where assessment.school_id = public.current_school_id()
    and lower(assessment.title) = lower(trim(_assessment_title))
    and membership.student_profile_id = student_id
    and membership.status in ('planned','active')
  order by assessment.occurs_at desc nulls last, assessment.created_at desc
  limit 1;

  if assessment_id is null then raise exception 'Toets niet gevonden voor deze leerling'; end if;
  if not public.can_access_group(assessment_group_id) then raise exception 'Geen toegang tot deze lesgroep'; end if;
  if _grade is not null and (_grade < 0 or _grade > 10) then raise exception 'Cijfer moet tussen 0 en 10 liggen'; end if;
  if _status not in ('draft','published','corrected') then raise exception 'Ongeldige cijferstatus'; end if;

  insert into public.grades (
    school_id, assessment_id, student_profile_id, score, grade, note,
    status, graded_by, graded_at
  ) values (
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

-- RLS/helper functions needed while processing authenticated queries.
grant execute on function public.app_record_scope_allows(text,uuid,jsonb) to authenticated;
grant execute on function public.can_access_group(uuid,uuid) to authenticated;
grant execute on function public.can_access_student(uuid,text,uuid) to authenticated;
grant execute on function public.can_change_app_record(public.app_records,text,uuid) to authenticated;
grant execute on function public.can_manage_school_data() to authenticated;
grant execute on function public.can_view_app_record(public.app_records,uuid) to authenticated;
grant execute on function public.current_school_id() to authenticated;
grant execute on function public.has_permission(text,uuid) to authenticated;
grant execute on function public.is_conversation_participant(uuid,uuid) to authenticated;
grant execute on function public.is_platform_admin(uuid) to authenticated;
grant execute on function public.owns_conversation(uuid,uuid) to authenticated;

-- Deliberate application RPCs. Each performs its own auth, tenant and permission checks.
grant execute on function public.effective_permissions(uuid) to authenticated;
grant execute on function public.effective_rank(uuid) to authenticated;
grant execute on function public.manage_guardian_student_link(text,text,text,boolean,boolean,boolean) to authenticated;
grant execute on function public.deactivate_guardian_student_link(uuid) to authenticated;
grant execute on function public.create_school_conversation(text,text,text[],text) to authenticated;
grant execute on function public.send_school_message(uuid,text) to authenticated;
grant execute on function public.create_school_assessment(text,text,text,text,timestamptz,numeric,numeric,text) to authenticated;
grant execute on function public.create_school_assignment(text,text,text,text,timestamptz,text) to authenticated;
grant execute on function public.record_school_grade(text,text,numeric,numeric,text,text) to authenticated;

-- Admin UI RPCs remain callable only after their server-side platform_admin check.
grant execute on function public.admin_create_role_from_template(uuid,text,text) to authenticated;
grant execute on function public.admin_delete_school_role(uuid) to authenticated;
grant execute on function public.admin_move_school_role(uuid,text) to authenticated;
grant execute on function public.admin_replace_role_permissions(uuid,jsonb) to authenticated;
grant execute on function public.admin_review_permission_request(uuid,text,text) to authenticated;
grant execute on function public.admin_set_profile_roles(uuid,uuid[],uuid) to authenticated;

-- Nothing in public tables is required before login. Authenticated table grants
-- remain unchanged because the browser uses PostgREST directly and RLS is the row boundary.
revoke all privileges on all tables in schema public from anon;
