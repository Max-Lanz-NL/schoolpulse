begin;
create extension if not exists pgtap with schema extensions;
select plan(16);

select ok(exists(select 1 from public.role_template_permissions where template_key='teacher' and permission_key='tests.publish'),'teacher template can publish tests');
select ok(exists(select 1 from public.role_template_permissions where template_key='teacher' and permission_key='grades.publish'),'teacher template can publish grades');

insert into public.schools(id,name) values ('51000000-0000-4000-8000-000000000001','Results A'),('52000000-0000-4000-8000-000000000002','Results B');
insert into auth.users(id,email,aud,role) values
 ('5a000000-0000-4000-8000-000000000002','res-teacher-a@test.invalid','authenticated','authenticated'),
 ('5a000000-0000-4000-8000-000000000003','res-student-a@test.invalid','authenticated','authenticated'),
 ('5b000000-0000-4000-8000-000000000002','res-teacher-b@test.invalid','authenticated','authenticated'),
 ('5b000000-0000-4000-8000-000000000003','res-student-b@test.invalid','authenticated','authenticated');
update public.profiles set school_id='51000000-0000-4000-8000-000000000001',role=case when email like '%teacher%' then 'teacher'::public.profile_role else 'student'::public.profile_role end where email like 'res-%-a@test.invalid';
update public.profiles set school_id='52000000-0000-4000-8000-000000000002',role=case when email like '%teacher%' then 'teacher'::public.profile_role else 'student'::public.profile_role end where email like 'res-%-b@test.invalid';
insert into public.role_permissions(role_id,permission_key,scope)
select r.id,p.key,'assigned' from public.school_roles r cross join public.permission_definitions p
where r.school_id in ('51000000-0000-4000-8000-000000000001','52000000-0000-4000-8000-000000000002') and r.legacy_key='teacher'
and p.key in ('tests.view','tests.create','tests.update','tests.publish','grades.view','grades.create','grades.update','grades.publish','classes.view','students.view')
on conflict(role_id,permission_key) do update set scope=excluded.scope;
insert into public.profile_role_assignments(profile_id,role_id,is_primary)
select p.id,r.id,true from public.profiles p join public.school_roles r on r.school_id=p.school_id and r.legacy_key=case when p.role='teacher' then 'teacher' else 'student' end
where p.email like 'res-%' on conflict(profile_id,role_id) do nothing;

insert into public.school_years(id,school_id,name,starts_on,ends_on,is_current) values
 ('51100000-0000-4000-8000-000000000001','51000000-0000-4000-8000-000000000001','2026 A','2026-08-01','2027-07-31',true),
 ('52100000-0000-4000-8000-000000000002','52000000-0000-4000-8000-000000000002','2026 B','2026-08-01','2027-07-31',true);
insert into public.subjects(id,school_id,name,code) values
 ('51200000-0000-4000-8000-000000000001','51000000-0000-4000-8000-000000000001','Wiskunde','WIS'),
 ('51200000-0000-4000-8000-000000000002','51000000-0000-4000-8000-000000000001','Nederlands','NED'),
 ('52200000-0000-4000-8000-000000000002','52000000-0000-4000-8000-000000000002','Engels','ENG');
insert into public.teaching_groups(id,school_id,school_year_id,subject_id,name) values
 ('51300000-0000-4000-8000-000000000001','51000000-0000-4000-8000-000000000001','51100000-0000-4000-8000-000000000001','51200000-0000-4000-8000-000000000001','Groep A'),
 ('52300000-0000-4000-8000-000000000002','52000000-0000-4000-8000-000000000002','52100000-0000-4000-8000-000000000002','52200000-0000-4000-8000-000000000002','Groep B');
insert into public.teacher_group_assignments(school_id,teacher_profile_id,teaching_group_id) values
 ('51000000-0000-4000-8000-000000000001','5a000000-0000-4000-8000-000000000002','51300000-0000-4000-8000-000000000001'),
 ('52000000-0000-4000-8000-000000000002','5b000000-0000-4000-8000-000000000002','52300000-0000-4000-8000-000000000002');
insert into public.student_group_memberships(school_id,student_profile_id,teaching_group_id,status) values
 ('51000000-0000-4000-8000-000000000001','5a000000-0000-4000-8000-000000000003','51300000-0000-4000-8000-000000000001','active'),
 ('52000000-0000-4000-8000-000000000002','5b000000-0000-4000-8000-000000000003','52300000-0000-4000-8000-000000000002','active');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"5a000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select lives_ok($$insert into public.assessments(id,school_id,teaching_group_id,subject_id,title,maximum_score,weight,status,created_by) values('51500000-0000-4000-8000-000000000001','51000000-0000-4000-8000-000000000001','51300000-0000-4000-8000-000000000001','51200000-0000-4000-8000-000000000001','Proefwerk 1',10,2,'draft','5a000000-0000-4000-8000-000000000002')$$,'teacher creates assigned assessment');
select throws_like($$insert into public.assessments(school_id,teaching_group_id,subject_id,title,weight,status,created_by) values('52000000-0000-4000-8000-000000000002','52300000-0000-4000-8000-000000000002','52200000-0000-4000-8000-000000000002','School B',1,'draft','5a000000-0000-4000-8000-000000000002')$$,'%maker%','teacher cannot create School B assessment');
select throws_like($$insert into public.assessments(school_id,teaching_group_id,subject_id,title,weight,status,created_by) values('51000000-0000-4000-8000-000000000001','51300000-0000-4000-8000-000000000001','51200000-0000-4000-8000-000000000002','Verkeerd vak',1,'draft','5a000000-0000-4000-8000-000000000002')$$,'%vak%lesgroep%','assessment subject must match group');
select lives_ok($$update public.assessments set status='published' where id='51500000-0000-4000-8000-000000000001'$$,'teacher publishes assigned assessment');
select lives_ok($$insert into public.grades(id,school_id,assessment_id,student_profile_id,grade,score,status,graded_by) values('51600000-0000-4000-8000-000000000001','51000000-0000-4000-8000-000000000001','51500000-0000-4000-8000-000000000001','5a000000-0000-4000-8000-000000000003',7.5,7.5,'published','5a000000-0000-4000-8000-000000000002')$$,'teacher publishes group grade');
select throws_like($$insert into public.grades(school_id,assessment_id,student_profile_id,grade,status,graded_by) values('51000000-0000-4000-8000-000000000001','51500000-0000-4000-8000-000000000001','5a000000-0000-4000-8000-000000000003',8,'published','5a000000-0000-4000-8000-000000000002')$$,'%duplicate key%','one grade per assessment and student');
select throws_like($$insert into public.grades(school_id,assessment_id,student_profile_id,grade,status,graded_by) values('51000000-0000-4000-8000-000000000001','51500000-0000-4000-8000-000000000001','5b000000-0000-4000-8000-000000000003',8,'published','5a000000-0000-4000-8000-000000000002')$$,'%leerling%','cross-school student grade rejected');
select throws_like($$update public.grades set grade=11 where id='51600000-0000-4000-8000-000000000001'$$,'%grades_grade_check%','grade above ten rejected');
select lives_ok($$insert into public.assessments(id,school_id,teaching_group_id,subject_id,title,maximum_score,status,created_by) values('51500000-0000-4000-8000-000000000002','51000000-0000-4000-8000-000000000001','51300000-0000-4000-8000-000000000001','51200000-0000-4000-8000-000000000001','Concepttoets',10,'draft','5a000000-0000-4000-8000-000000000002')$$,'teacher creates draft assessment');
select lives_ok($$insert into public.grades(id,school_id,assessment_id,student_profile_id,grade,status,graded_by) values('51600000-0000-4000-8000-000000000002','51000000-0000-4000-8000-000000000001','51500000-0000-4000-8000-000000000002','5a000000-0000-4000-8000-000000000003',6,'draft','5a000000-0000-4000-8000-000000000002')$$,'teacher saves draft grade');

select set_config('request.jwt.claims','{"sub":"5a000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select is((select count(*) from public.grades),1::bigint,'student sees only own published grade');
select throws_like($$insert into public.grades(school_id,assessment_id,student_profile_id,grade,status,graded_by) values('51000000-0000-4000-8000-000000000001','51500000-0000-4000-8000-000000000001','5a000000-0000-4000-8000-000000000003',8,'published','5a000000-0000-4000-8000-000000000003')$$,'%Geen recht%','student cannot write grades');
select set_config('request.jwt.claims','{"sub":"5b000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select is((select count(*) from public.grades where school_id='51000000-0000-4000-8000-000000000001'),0::bigint,'School B student cannot read School A grade');
select set_config('request.jwt.claims','{"sub":"5b000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select is((select count(*) from public.assessments where school_id='51000000-0000-4000-8000-000000000001'),0::bigint,'School B teacher cannot read School A assessments');

reset role;
select * from finish();
rollback;
