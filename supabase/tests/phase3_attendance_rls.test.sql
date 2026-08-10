begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

select ok(exists(select 1 from public.role_template_permissions where template_key='director' and permission_key='absences.update' and scope='school'),'director template can update absences');
select ok(exists(select 1 from public.role_template_permissions where template_key='director' and permission_key='absences.approve' and scope='school'),'director template can approve absences');

insert into public.schools(id,name) values ('41000000-0000-4000-8000-000000000001','Attendance A'),('42000000-0000-4000-8000-000000000002','Attendance B');
insert into auth.users(id,email,aud,role) values
 ('4a000000-0000-4000-8000-000000000001','att-admin-a@test.invalid','authenticated','authenticated'),
 ('4a000000-0000-4000-8000-000000000002','att-teacher-a@test.invalid','authenticated','authenticated'),
 ('4a000000-0000-4000-8000-000000000003','att-student-a@test.invalid','authenticated','authenticated'),
 ('4b000000-0000-4000-8000-000000000001','att-admin-b@test.invalid','authenticated','authenticated'),
 ('4b000000-0000-4000-8000-000000000002','att-teacher-b@test.invalid','authenticated','authenticated'),
 ('4b000000-0000-4000-8000-000000000003','att-student-b@test.invalid','authenticated','authenticated');
update public.profiles set school_id='41000000-0000-4000-8000-000000000001',role=case when email like '%admin%' then 'school_admin'::public.profile_role when email like '%teacher%' then 'teacher'::public.profile_role else 'student'::public.profile_role end where email like '%-a@test.invalid';
update public.profiles set school_id='42000000-0000-4000-8000-000000000002',role=case when email like '%admin%' then 'school_admin'::public.profile_role when email like '%teacher%' then 'teacher'::public.profile_role else 'student'::public.profile_role end where email like '%-b@test.invalid';

insert into public.role_permissions(role_id,permission_key,scope)
select r.id,p.key,case when r.legacy_key='teacher' then 'assigned' else 'school' end from public.school_roles r cross join public.permission_definitions p
where r.school_id in ('41000000-0000-4000-8000-000000000001','42000000-0000-4000-8000-000000000002')
and ((r.legacy_key='teacher' and p.key in ('attendance.view','attendance.create','attendance.update','schedule.view','students.view')) or (r.legacy_key='school_admin' and p.key in ('attendance.view','attendance.manage','absences.view','absences.update','absences.approve')))
on conflict(role_id,permission_key) do update set scope=excluded.scope;
insert into public.profile_role_assignments(profile_id,role_id,is_primary)
select p.id,r.id,true from public.profiles p join public.school_roles r on r.school_id=p.school_id and r.legacy_key=case when p.role='school_admin' then 'school_admin' when p.role='teacher' then 'teacher' else 'student' end
where p.email like 'att-%' on conflict(profile_id,role_id) do nothing;

insert into public.school_years(id,school_id,name,starts_on,ends_on,is_current) values
 ('41100000-0000-4000-8000-000000000001','41000000-0000-4000-8000-000000000001','2026 A','2026-08-01','2027-07-31',true),
 ('42100000-0000-4000-8000-000000000002','42000000-0000-4000-8000-000000000002','2026 B','2026-08-01','2027-07-31',true);
insert into public.subjects(id,school_id,name,code) values ('41200000-0000-4000-8000-000000000001','41000000-0000-4000-8000-000000000001','Rekenen','REK'),('42200000-0000-4000-8000-000000000002','42000000-0000-4000-8000-000000000002','Taal','TAL');
insert into public.teaching_groups(id,school_id,school_year_id,subject_id,name) values ('41300000-0000-4000-8000-000000000001','41000000-0000-4000-8000-000000000001','41100000-0000-4000-8000-000000000001','41200000-0000-4000-8000-000000000001','Groep A'),('42300000-0000-4000-8000-000000000002','42000000-0000-4000-8000-000000000002','42100000-0000-4000-8000-000000000002','42200000-0000-4000-8000-000000000002','Groep B');
insert into public.teacher_subject_assignments(school_id,teacher_profile_id,school_year_id,subject_id) values ('41000000-0000-4000-8000-000000000001','4a000000-0000-4000-8000-000000000002','41100000-0000-4000-8000-000000000001','41200000-0000-4000-8000-000000000001'),('42000000-0000-4000-8000-000000000002','4b000000-0000-4000-8000-000000000002','42100000-0000-4000-8000-000000000002','42200000-0000-4000-8000-000000000002');
insert into public.teacher_group_assignments(school_id,teacher_profile_id,teaching_group_id) values ('41000000-0000-4000-8000-000000000001','4a000000-0000-4000-8000-000000000002','41300000-0000-4000-8000-000000000001'),('42000000-0000-4000-8000-000000000002','4b000000-0000-4000-8000-000000000002','42300000-0000-4000-8000-000000000002');
insert into public.student_group_memberships(school_id,student_profile_id,teaching_group_id,status) values ('41000000-0000-4000-8000-000000000001','4a000000-0000-4000-8000-000000000003','41300000-0000-4000-8000-000000000001','active'),('42000000-0000-4000-8000-000000000002','4b000000-0000-4000-8000-000000000003','42300000-0000-4000-8000-000000000002','active');
insert into public.timetable_entries(id,school_id,school_year_id,teaching_group_id,subject_id,teacher_profile_id,starts_at,ends_at,created_by) values
 ('41500000-0000-4000-8000-000000000001','41000000-0000-4000-8000-000000000001','41100000-0000-4000-8000-000000000001','41300000-0000-4000-8000-000000000001','41200000-0000-4000-8000-000000000001','4a000000-0000-4000-8000-000000000002','2026-08-17 08:30+02','2026-08-17 09:20+02','4a000000-0000-4000-8000-000000000001'),
 ('42500000-0000-4000-8000-000000000002','42000000-0000-4000-8000-000000000002','42100000-0000-4000-8000-000000000002','42300000-0000-4000-8000-000000000002','42200000-0000-4000-8000-000000000002','4b000000-0000-4000-8000-000000000002','2026-08-17 08:30+02','2026-08-17 09:20+02','4b000000-0000-4000-8000-000000000001');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"4a000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select lives_ok($$insert into public.attendance_records(school_id,timetable_entry_id,student_profile_id,status) values('41000000-0000-4000-8000-000000000001','41500000-0000-4000-8000-000000000001','4a000000-0000-4000-8000-000000000003','present')$$,'teacher records assigned lesson');
select throws_like($$insert into public.attendance_records(school_id,timetable_entry_id,student_profile_id,status) values('41000000-0000-4000-8000-000000000001','41500000-0000-4000-8000-000000000001','4a000000-0000-4000-8000-000000000003','absent')$$,'%duplicate key%','duplicate lesson and student is rejected');
select throws_like($$insert into public.attendance_records(school_id,timetable_entry_id,student_profile_id,status) values('42000000-0000-4000-8000-000000000002','42500000-0000-4000-8000-000000000002','4b000000-0000-4000-8000-000000000003','present')$$,'%registrator%','teacher cannot record School B lesson');
select throws_like($$insert into public.attendance_records(school_id,timetable_entry_id,student_profile_id,status) values('41000000-0000-4000-8000-000000000001','41500000-0000-4000-8000-000000000001','4b000000-0000-4000-8000-000000000003','present')$$,'%leerling%','cross-school student reference is rejected');
select lives_ok($$update public.attendance_records set status='late',minutes_late=5 where timetable_entry_id='41500000-0000-4000-8000-000000000001'$$,'teacher corrects assigned attendance');

select set_config('request.jwt.claims','{"sub":"4a000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select is((select count(*) from public.attendance_records where student_profile_id='4a000000-0000-4000-8000-000000000003'),1::bigint,'student reads own attendance');
select throws_like($$insert into public.attendance_records(school_id,timetable_entry_id,student_profile_id,status) values('41000000-0000-4000-8000-000000000001','41500000-0000-4000-8000-000000000001','4a000000-0000-4000-8000-000000000003','present')$$,'%row-level security%','student cannot write attendance');
select lives_ok($$insert into public.absence_requests(id,school_id,student_profile_id,starts_at,ends_at,reason) values('41600000-0000-4000-8000-000000000001','41000000-0000-4000-8000-000000000001','4a000000-0000-4000-8000-000000000003','2026-08-18 08:00+02','2026-08-18 15:00+02','Ziek')$$,'student submits own absence');

select set_config('request.jwt.claims','{"sub":"4a000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select is((select count(*) from public.attendance_records where school_id='41000000-0000-4000-8000-000000000001'),1::bigint,'school admin reads own school attendance');
select lives_ok($$update public.absence_requests set status='approved',reviewed_by='4a000000-0000-4000-8000-000000000001',reviewed_at=now() where id='41600000-0000-4000-8000-000000000001'$$,'school admin processes own absence');
select is((select status from public.absence_requests where id='41600000-0000-4000-8000-000000000001'),'approved','approved absence is persisted');

select set_config('request.jwt.claims','{"sub":"4b000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select is((select count(*) from public.attendance_records where school_id='41000000-0000-4000-8000-000000000001'),0::bigint,'School B admin cannot read School A attendance');

reset role;
select * from finish();
rollback;
