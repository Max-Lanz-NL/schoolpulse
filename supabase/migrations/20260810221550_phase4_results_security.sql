-- Phase 4: authoritative assessment/grade relationships, publication and role scopes.

alter table public.assessments
  add constraint assessments_maximum_score_positive check (maximum_score is null or maximum_score > 0);

create or replace function public.can_manage_assessment(
  _assessment_id uuid,
  _user_id uuid default auth.uid()
) returns boolean
language sql stable security definer set search_path=public,pg_temp as $$
  select (_user_id=auth.uid() or public.is_platform_admin(auth.uid())) and exists (
    select 1 from public.assessments a
    where a.id=_assessment_id
      and a.school_id=(select p.school_id from public.profiles p where p.id=_user_id)
      and (
        public.is_platform_admin(_user_id)
        or public.has_permission('grades.manage',_user_id)
        or (
          public.can_access_group(a.teaching_group_id,_user_id)
          and (a.created_by=_user_id or public.has_permission('tests.update',_user_id))
        )
      )
  )
$$;

create or replace function public.validate_assessment()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare group_school uuid; group_subject uuid; subject_school uuid; creator_school uuid;
begin
  if tg_op='UPDATE' and (new.school_id is distinct from old.school_id or new.teaching_group_id is distinct from old.teaching_group_id or new.created_by is distinct from old.created_by) then
    raise exception using errcode='23514',message='School, lesgroep en maker van een toets kunnen niet worden gewijzigd';
  end if;
  select school_id,subject_id into group_school,group_subject from public.teaching_groups where id=new.teaching_group_id;
  select school_id into creator_school from public.profiles where id=new.created_by;
  if new.subject_id is not null then select school_id into subject_school from public.subjects where id=new.subject_id; end if;
  if group_school is null or group_school is distinct from new.school_id then raise exception using errcode='23514',message='De lesgroep hoort niet bij deze school'; end if;
  if creator_school is null or creator_school is distinct from new.school_id then raise exception using errcode='23514',message='De maker hoort niet bij deze school'; end if;
  if new.subject_id is not null and (subject_school is null or subject_school is distinct from new.school_id) then raise exception using errcode='23514',message='Het vak hoort niet bij deze school'; end if;
  if group_subject is not null and new.subject_id is distinct from group_subject then raise exception using errcode='23514',message='Het vak hoort niet bij deze lesgroep'; end if;
  if auth.uid() is not null and new.status='published' and not (public.has_permission('tests.publish') or public.is_platform_admin(auth.uid())) then raise exception using errcode='42501',message='Geen recht om toetsen te publiceren'; end if;
  new.title=trim(new.title); if new.title='' then raise exception using errcode='23514',message='Toetstitel is verplicht'; end if;
  new.updated_at=now(); return new;
end $$;

drop trigger if exists validate_assessment on public.assessments;
create trigger validate_assessment before insert or update on public.assessments
for each row execute function public.validate_assessment();

create or replace function public.validate_grade()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare assessment_school uuid; assessment_group uuid; assessment_status text; maximum numeric; student_school uuid; grader_school uuid;
begin
  if tg_op='UPDATE' and (new.school_id is distinct from old.school_id or new.assessment_id is distinct from old.assessment_id or new.student_profile_id is distinct from old.student_profile_id) then
    raise exception using errcode='23514',message='School, toets en leerling van een cijfer kunnen niet worden gewijzigd';
  end if;
  select school_id,teaching_group_id,status,maximum_score into assessment_school,assessment_group,assessment_status,maximum from public.assessments where id=new.assessment_id;
  select school_id into student_school from public.profiles where id=new.student_profile_id;
  select school_id into grader_school from public.profiles where id=new.graded_by;
  if assessment_school is null or assessment_school is distinct from new.school_id then raise exception using errcode='23514',message='De toets hoort niet bij deze school'; end if;
  if student_school is null or student_school is distinct from new.school_id then raise exception using errcode='23514',message='De leerling hoort niet bij deze school'; end if;
  if grader_school is null or grader_school is distinct from new.school_id then raise exception using errcode='23514',message='De beoordelaar hoort niet bij deze school'; end if;
  if not exists(select 1 from public.student_group_memberships m where m.school_id=new.school_id and m.teaching_group_id=assessment_group and m.student_profile_id=new.student_profile_id and m.status in ('planned','active'))
     and not exists(select 1 from public.teaching_groups tg join public.student_enrolments e on e.school_id=tg.school_id and e.class_id=tg.base_class_id and e.student_profile_id=new.student_profile_id and e.status='active' where tg.id=assessment_group) then
    raise exception using errcode='23514',message='De leerling hoort niet bij de toetsgroep';
  end if;
  if new.score is not null and (new.score<0 or (maximum is not null and new.score>maximum)) then raise exception using errcode='23514',message='Score valt buiten de toegestane grenzen'; end if;
  if new.status in ('published','corrected') and assessment_status<>'published' then raise exception using errcode='23514',message='Publiceer eerst de toets'; end if;
  if auth.uid() is not null and new.status in ('published','corrected') and not (public.has_permission('grades.publish') or public.is_platform_admin(auth.uid())) then raise exception using errcode='42501',message='Geen recht om cijfers te publiceren'; end if;
  new.updated_at=now(); new.graded_at=now(); return new;
end $$;

drop trigger if exists validate_grade on public.grades;
create trigger validate_grade before insert or update on public.grades
for each row execute function public.validate_grade();

drop policy if exists assessments_read on public.assessments;
drop policy if exists assessments_manage on public.assessments;
create policy assessments_read on public.assessments for select to authenticated using (
  school_id=public.current_school_id() and (
    (status='published' and public.can_access_group(teaching_group_id))
    or public.can_manage_assessment(id)
    or (public.has_permission('tests.view') and not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('student','teacher','parent')))
  )
);
create policy assessments_insert on public.assessments for insert to authenticated with check (
  school_id=public.current_school_id() and created_by=auth.uid() and public.has_permission('tests.create') and public.can_access_group(teaching_group_id)
  and (status<>'published' or public.has_permission('tests.publish'))
);
create policy assessments_update on public.assessments for update to authenticated using (
  school_id=public.current_school_id() and public.can_manage_assessment(id)
) with check (
  school_id=public.current_school_id() and public.can_manage_assessment(id) and public.can_access_group(teaching_group_id)
  and (status<>'published' or public.has_permission('tests.publish'))
);
create policy assessments_delete on public.assessments for delete to authenticated using (
  school_id=public.current_school_id() and public.can_manage_assessment(id) and (public.has_permission('tests.delete') or public.has_permission('grades.manage'))
);

drop policy if exists grades_read on public.grades;
drop policy if exists grades_manage on public.grades;
create policy grades_read on public.grades for select to authenticated using (
  school_id=public.current_school_id() and (
    (student_profile_id=auth.uid() and status in ('published','corrected') and exists(select 1 from public.assessments a where a.id=assessment_id and a.status='published'))
    or (public.can_manage_assessment(assessment_id) and public.has_permission('grades.view'))
    or (status in ('published','corrected') and public.has_permission('grades.view') and public.can_access_student(student_profile_id,'grades.view') and not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='teacher'))
    or (public.has_permission('grades.view') and not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('student','teacher','parent')))
  )
);
create policy grades_insert on public.grades for insert to authenticated with check (
  school_id=public.current_school_id() and graded_by=auth.uid() and public.can_manage_assessment(assessment_id) and public.has_permission('grades.create')
  and (status='draft' or public.has_permission('grades.publish'))
);
create policy grades_update on public.grades for update to authenticated using (
  school_id=public.current_school_id() and public.can_manage_assessment(assessment_id) and public.has_permission('grades.update')
) with check (
  school_id=public.current_school_id() and graded_by=auth.uid() and public.can_manage_assessment(assessment_id)
  and (status='draft' or public.has_permission('grades.publish'))
);
create policy grades_delete on public.grades for delete to authenticated using (
  school_id=public.current_school_id() and public.can_manage_assessment(assessment_id) and (public.has_permission('grades.delete') or public.has_permission('grades.manage'))
);

insert into public.role_template_permissions(template_key,permission_key,scope)
values ('teacher','tests.update','assigned'),('teacher','tests.publish','assigned'),('teacher','grades.publish','assigned')
on conflict do nothing;
insert into public.role_permissions(role_id,permission_key,scope)
select r.id,p.permission_key,'assigned' from public.school_roles r
cross join (values ('tests.update'),('tests.publish'),('grades.publish')) p(permission_key)
where r.template_key='teacher' and r.is_active on conflict do nothing;

revoke all on table public.assessments,public.grades from anon;
revoke all on table public.assessments,public.grades from authenticated;
grant select,insert,update,delete on table public.assessments,public.grades to authenticated;
revoke execute on function public.can_manage_assessment(uuid,uuid),public.validate_assessment(),public.validate_grade() from public,anon,authenticated;
grant execute on function public.can_manage_assessment(uuid,uuid) to authenticated;
notify pgrst,'reload schema';
