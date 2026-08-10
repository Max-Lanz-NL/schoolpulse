-- Phase 5: authoritative assignments, submissions and safe learning files.
create or replace function public.can_manage_assignment(_assignment_id uuid,_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select (_user_id=auth.uid() or public.is_platform_admin(auth.uid())) and exists(
  select 1 from public.assignments a where a.id=_assignment_id
   and a.school_id=(select school_id from public.profiles where id=_user_id)
   and (public.is_platform_admin(_user_id) or public.has_permission('assignments.manage',_user_id)
    or (public.can_access_group(a.teaching_group_id,_user_id) and (a.created_by=_user_id or public.has_permission('assignments.update',_user_id))))
 )
$$;

create or replace function public.validate_assignment()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare group_school uuid; group_subject uuid; subject_school uuid; creator_school uuid;
begin
 if tg_op='UPDATE' and (new.school_id is distinct from old.school_id or new.teaching_group_id is distinct from old.teaching_group_id or new.created_by is distinct from old.created_by) then raise exception using errcode='23514',message='School, lesgroep en maker van een opdracht kunnen niet worden gewijzigd'; end if;
 select school_id,subject_id into group_school,group_subject from public.teaching_groups where id=new.teaching_group_id;
 select school_id into creator_school from public.profiles where id=new.created_by;
 if new.subject_id is not null then select school_id into subject_school from public.subjects where id=new.subject_id; end if;
 if group_school is null or group_school is distinct from new.school_id then raise exception using errcode='23514',message='De lesgroep hoort niet bij deze school'; end if;
 if creator_school is null or creator_school is distinct from new.school_id then raise exception using errcode='23514',message='De maker hoort niet bij deze school'; end if;
 if new.subject_id is not null and (subject_school is null or subject_school is distinct from new.school_id) then raise exception using errcode='23514',message='Het vak hoort niet bij deze school'; end if;
 if group_subject is not null and new.subject_id is distinct from group_subject then raise exception using errcode='23514',message='Het vak hoort niet bij deze lesgroep'; end if;
 if auth.uid() is not null and new.status='published' and not (public.has_permission('assignments.publish') or public.is_platform_admin(auth.uid())) then raise exception using errcode='42501',message='Geen recht om opdrachten te publiceren'; end if;
 new.title=trim(new.title); if new.title='' then raise exception using errcode='23514',message='Opdrachttitel is verplicht'; end if;
 new.updated_at=now(); return new;
end $$;
drop trigger if exists validate_assignment on public.assignments;
create trigger validate_assignment before insert or update on public.assignments for each row execute function public.validate_assignment();

create or replace function public.validate_assignment_submission()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare assignment_school uuid; assignment_group uuid; assignment_status text; student_school uuid; reviewer_school uuid;
begin
 if tg_op='UPDATE' and (new.school_id is distinct from old.school_id or new.assignment_id is distinct from old.assignment_id or new.student_profile_id is distinct from old.student_profile_id) then raise exception using errcode='23514',message='School, opdracht en leerling van een inlevering kunnen niet worden gewijzigd'; end if;
 select school_id,teaching_group_id,status into assignment_school,assignment_group,assignment_status from public.assignments where id=new.assignment_id;
 select school_id into student_school from public.profiles where id=new.student_profile_id;
 if assignment_school is null or assignment_school is distinct from new.school_id then raise exception using errcode='23514',message='De opdracht hoort niet bij deze school'; end if;
 if student_school is null or student_school is distinct from new.school_id then raise exception using errcode='23514',message='De leerling hoort niet bij deze school'; end if;
 if not exists(select 1 from public.student_group_memberships m where m.school_id=new.school_id and m.teaching_group_id=assignment_group and m.student_profile_id=new.student_profile_id and m.status in ('planned','active')) then raise exception using errcode='23514',message='De leerling hoort niet bij de opdrachtgroep'; end if;
 if auth.uid()=new.student_profile_id and assignment_status<>'published' then raise exception using errcode='42501',message='Deze opdracht is niet beschikbaar'; end if;
 if new.reviewed_by is not null then select school_id into reviewer_school from public.profiles where id=new.reviewed_by; if reviewer_school is distinct from new.school_id then raise exception using errcode='23514',message='De beoordelaar hoort niet bij deze school'; end if; end if;
 if new.status in ('returned','accepted') and (new.reviewed_by is null or new.reviewed_at is null) then raise exception using errcode='23514',message='Een beoordeling vereist beoordelaar en datum'; end if;
 new.updated_at=now(); if new.status='submitted' and new.submitted_at is null then new.submitted_at=now(); end if; return new;
end $$;
drop trigger if exists validate_assignment_submission on public.assignment_submissions;
create trigger validate_assignment_submission before insert or update on public.assignment_submissions for each row execute function public.validate_assignment_submission();

drop policy if exists assignments_read on public.assignments; drop policy if exists assignments_manage on public.assignments;
create policy assignments_read on public.assignments for select to authenticated using(school_id=public.current_school_id() and ((status='published' and public.can_access_group(teaching_group_id)) or public.can_manage_assignment(id) or (public.has_permission('assignments.view') and not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('student','teacher','parent')))));
create policy assignments_insert on public.assignments for insert to authenticated with check(school_id=public.current_school_id() and created_by=auth.uid() and public.has_permission('assignments.create') and public.can_access_group(teaching_group_id) and (status<>'published' or public.has_permission('assignments.publish')));
create policy assignments_update on public.assignments for update to authenticated using(school_id=public.current_school_id() and public.can_manage_assignment(id)) with check(school_id=public.current_school_id() and public.can_manage_assignment(id) and (status<>'published' or public.has_permission('assignments.publish')));
create policy assignments_delete on public.assignments for delete to authenticated using(school_id=public.current_school_id() and public.can_manage_assignment(id) and (public.has_permission('assignments.delete') or public.has_permission('assignments.manage')));

drop policy if exists submissions_read on public.assignment_submissions; drop policy if exists submissions_manage on public.assignment_submissions;
create policy submissions_read on public.assignment_submissions for select to authenticated using(school_id=public.current_school_id() and (student_profile_id=auth.uid() or public.can_manage_assignment(assignment_id)));
create policy submissions_insert on public.assignment_submissions for insert to authenticated with check(school_id=public.current_school_id() and student_profile_id=auth.uid() and exists(select 1 from public.assignments a where a.id=assignment_id and a.status='published' and public.can_access_group(a.teaching_group_id)));
create policy submissions_update_student on public.assignment_submissions for update to authenticated using(school_id=public.current_school_id() and student_profile_id=auth.uid() and status in ('draft','submitted','returned')) with check(school_id=public.current_school_id() and student_profile_id=auth.uid() and status in ('draft','submitted'));
create policy submissions_update_teacher on public.assignment_submissions for update to authenticated using(school_id=public.current_school_id() and public.can_manage_assignment(assignment_id)) with check(school_id=public.current_school_id() and public.can_manage_assignment(assignment_id));

drop policy if exists files_read on public.file_assets; drop policy if exists files_manage on public.file_assets;
create policy files_read on public.file_assets for select to authenticated using(school_id=public.current_school_id() and (owner_id=auth.uid() or (scan_status='clean' and ((related_type='assignment' and exists(select 1 from public.assignments a where a.id=related_id and a.status='published' and public.can_access_group(a.teaching_group_id))) or (related_type='assignment_submission' and exists(select 1 from public.assignment_submissions s where s.id=related_id and public.can_manage_assignment(s.assignment_id)))))));
create policy files_insert on public.file_assets for insert to authenticated with check(school_id=public.current_school_id() and owner_id=auth.uid() and bucket='school-files' and scan_status='pending');
create policy files_delete on public.file_assets for delete to authenticated using(school_id=public.current_school_id() and (owner_id=auth.uid() or public.has_permission('documents.manage')));

drop policy if exists school_files_insert on storage.objects;
create policy school_files_insert on storage.objects for insert to authenticated with check(bucket_id='school-files' and (storage.foldername(name))[1]=public.current_school_id()::text and (storage.foldername(name))[2]=auth.uid()::text and (public.has_permission('documents.create') or public.has_permission('documents.manage') or ((storage.foldername(name))[3]='submissions' and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='student'))));

insert into public.role_template_permissions(template_key,permission_key,scope) values('teacher','assignments.publish','assigned') on conflict do nothing;
insert into public.role_permissions(role_id,permission_key,scope) select id,'assignments.publish','assigned' from public.school_roles where template_key='teacher' and is_active on conflict do nothing;
revoke all on table public.assignments,public.assignment_submissions,public.file_assets from anon,authenticated;
grant select,insert,update,delete on public.assignments,public.assignment_submissions,public.file_assets to authenticated;
revoke execute on function public.can_manage_assignment(uuid,uuid),public.validate_assignment(),public.validate_assignment_submission() from public,anon,authenticated;
grant execute on function public.can_manage_assignment(uuid,uuid) to authenticated;
notify pgrst,'reload schema';
