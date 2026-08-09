begin;
create extension if not exists pgtap with schema extensions;
select plan(24);

-- Deterministic two-school fixture. The transaction is rolled back at the end.
insert into public.schools (id, name) values
  ('10000000-0000-0000-0000-000000000001', 'RLS School A'),
  ('20000000-0000-0000-0000-000000000002', 'RLS School B');

insert into auth.users (id, email, aud, role) values
  ('a0000000-0000-0000-0000-000000000001', 'admin-a@rls.test', 'authenticated', 'authenticated'),
  ('a0000000-0000-0000-0000-000000000002', 'teacher-a@rls.test', 'authenticated', 'authenticated'),
  ('a0000000-0000-0000-0000-000000000003', 'student-a@rls.test', 'authenticated', 'authenticated'),
  ('b0000000-0000-0000-0000-000000000001', 'admin-b@rls.test', 'authenticated', 'authenticated'),
  ('b0000000-0000-0000-0000-000000000002', 'teacher-b@rls.test', 'authenticated', 'authenticated'),
  ('b0000000-0000-0000-0000-000000000003', 'student-b@rls.test', 'authenticated', 'authenticated');

update public.profiles set school_id = '10000000-0000-0000-0000-000000000001', role = case when email like 'admin-%' then 'school_admin'::public.profile_role when email like 'teacher-%' then 'teacher'::public.profile_role else 'student'::public.profile_role end where email like '%-a@rls.test';
update public.profiles set school_id = '20000000-0000-0000-0000-000000000002', role = case when email like 'admin-%' then 'school_admin'::public.profile_role when email like 'teacher-%' then 'teacher'::public.profile_role else 'student'::public.profile_role end where email like '%-b@rls.test';

insert into public.role_permissions (role_id, permission_key, scope)
select role.id, permission.permission_key, permission.scope
from (values
  ('10000000-0000-0000-0000-000000000001'::uuid,'school_admin','school_settings.manage','school'),
  ('10000000-0000-0000-0000-000000000001'::uuid,'school_admin','students.manage','school'),
  ('10000000-0000-0000-0000-000000000001'::uuid,'school_admin','staff.manage','school'),
  ('10000000-0000-0000-0000-000000000001'::uuid,'school_admin','classes.manage','school'),
  ('10000000-0000-0000-0000-000000000001'::uuid,'teacher','classes.view','assigned'),
  ('10000000-0000-0000-0000-000000000001'::uuid,'teacher','students.view','assigned'),
  ('20000000-0000-0000-0000-000000000002'::uuid,'school_admin','school_settings.manage','school'),
  ('20000000-0000-0000-0000-000000000002'::uuid,'school_admin','students.manage','school'),
  ('20000000-0000-0000-0000-000000000002'::uuid,'school_admin','staff.manage','school'),
  ('20000000-0000-0000-0000-000000000002'::uuid,'school_admin','classes.manage','school'),
  ('20000000-0000-0000-0000-000000000002'::uuid,'teacher','classes.view','assigned'),
  ('20000000-0000-0000-0000-000000000002'::uuid,'teacher','students.view','assigned')
) as permission(school_id, legacy_key, permission_key, scope)
join public.school_roles role on role.school_id = permission.school_id and role.legacy_key = permission.legacy_key
join public.permission_definitions definition on definition.key = permission.permission_key
on conflict (role_id, permission_key) do update set scope = excluded.scope;

insert into public.profile_role_assignments (profile_id, role_id, is_primary)
select assignment.profile_id, role.id, true
from (values
  ('a0000000-0000-0000-0000-000000000001'::uuid,'10000000-0000-0000-0000-000000000001'::uuid,'school_admin'),
  ('a0000000-0000-0000-0000-000000000002'::uuid,'10000000-0000-0000-0000-000000000001'::uuid,'teacher'),
  ('a0000000-0000-0000-0000-000000000003'::uuid,'10000000-0000-0000-0000-000000000001'::uuid,'student'),
  ('b0000000-0000-0000-0000-000000000001'::uuid,'20000000-0000-0000-0000-000000000002'::uuid,'school_admin'),
  ('b0000000-0000-0000-0000-000000000002'::uuid,'20000000-0000-0000-0000-000000000002'::uuid,'teacher'),
  ('b0000000-0000-0000-0000-000000000003'::uuid,'20000000-0000-0000-0000-000000000002'::uuid,'student')
) as assignment(profile_id, school_id, legacy_key)
join public.school_roles role on role.school_id = assignment.school_id and role.legacy_key = assignment.legacy_key
on conflict (profile_id, role_id) do update set is_primary = excluded.is_primary;

insert into public.school_years (id,school_id,name,starts_on,ends_on,is_current) values
 ('12000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','2026 A','2026-08-01','2027-07-31',true),
 ('22000000-0000-0000-0000-000000000012','20000000-0000-0000-0000-000000000002','2026 B','2026-08-01','2027-07-31',true);
insert into public.school_classes (id,school_id,school_year_id,name) values
 ('13000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','12000000-0000-0000-0000-000000000001','A1'),
 ('23000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','22000000-0000-0000-0000-000000000012','B1');
insert into public.student_records (school_id,profile_id,student_number) values
 ('10000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000003','A-001'),
 ('20000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000003','B-001');
insert into public.staff_records (school_id,profile_id,employee_number) values
 ('10000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000002','TA-1'),
 ('20000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000002','TB-1');
insert into public.student_enrolments (school_id,student_profile_id,school_year_id,class_id) values
 ('10000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000003','12000000-0000-0000-0000-000000000001','13000000-0000-0000-0000-000000000001'),
 ('20000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000003','22000000-0000-0000-0000-000000000012','23000000-0000-0000-0000-000000000001');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"a0000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select is(public.current_school_id(), '10000000-0000-0000-0000-000000000001'::uuid, 'admin A resolves school A');
select is((select count(*) from public.profiles where school_id='20000000-0000-0000-0000-000000000002'),0::bigint,'admin A cannot read profiles B');
select is((select count(*) from public.school_classes where school_id='20000000-0000-0000-0000-000000000002'),0::bigint,'admin A cannot read classes B');
select is((select count(*) from public.student_records where school_id='20000000-0000-0000-0000-000000000002'),0::bigint,'admin A cannot read students B');
select is((select count(*) from public.staff_records where school_id='20000000-0000-0000-0000-000000000002'),0::bigint,'admin A cannot read staff B');
select is((select count(*) from public.student_enrolments where school_id='20000000-0000-0000-0000-000000000002'),0::bigint,'admin A cannot read enrolments B');
select lives_ok($$insert into public.school_classes(school_id,school_year_id,name) values('10000000-0000-0000-0000-000000000001','12000000-0000-0000-0000-000000000001','A2')$$,'admin A can insert class A');
select throws_like($$insert into public.school_classes(school_id,school_year_id,name) values('20000000-0000-0000-0000-000000000002','22000000-0000-0000-0000-000000000012','B2 from A')$$,'%schooljaar%','admin A cannot insert class B');
select lives_ok($$update public.staff_records set department='A team' where school_id='10000000-0000-0000-0000-000000000001'$$,'admin A can update staff A');
select is((select count(*) from public.staff_records where school_id='20000000-0000-0000-0000-000000000002' and department='A team'),0::bigint,'admin A cannot update staff B');
select lives_ok($$delete from public.student_enrolments where school_id='10000000-0000-0000-0000-000000000001'$$,'admin A can delete enrolment A');
select is((select count(*) from public.student_enrolments where school_id='20000000-0000-0000-0000-000000000002'),0::bigint,'admin A cannot delete/read enrolment B');

select set_config('request.jwt.claims','{"sub":"a0000000-0000-0000-0000-000000000003","role":"authenticated"}',true);
select is((select count(*) from public.profiles where id='a0000000-0000-0000-0000-000000000003'),1::bigint,'student A reads own profile');
select is((select count(*) from public.profiles where id='b0000000-0000-0000-0000-000000000003'),0::bigint,'student A cannot read student B profile');
select is((select count(*) from public.student_records where profile_id='a0000000-0000-0000-0000-000000000003'),1::bigint,'student A reads own student record');
select is((select count(*) from public.staff_records),0::bigint,'student A cannot read staff management data');
select throws_like($$insert into public.student_records(school_id,profile_id,student_number) values('10000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','ILLEGAL')$$,'%account%','student cannot create student management data');
select lives_ok($$update public.school_classes set name='student edit' where id='13000000-0000-0000-0000-000000000001'$$,'student update is safely filtered');
select is((select count(*) from public.school_classes where name='student edit'),0::bigint,'student cannot modify class');

select set_config('request.jwt.claims','{"sub":"a0000000-0000-0000-0000-000000000002","role":"authenticated"}',true);
select is((select count(*) from public.staff_records where profile_id='a0000000-0000-0000-0000-000000000002'),1::bigint,'teacher reads own staff record');
select is((select count(*) from public.staff_records where school_id='20000000-0000-0000-0000-000000000002'),0::bigint,'teacher A cannot read staff B');
select is((select count(*) from public.school_classes where school_id='20000000-0000-0000-0000-000000000002'),0::bigint,'teacher A cannot read classes B');
delete from public.student_records where profile_id='a0000000-0000-0000-0000-000000000003';
select set_config('request.jwt.claims','{"sub":"a0000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select is((select count(*) from public.student_records where profile_id='a0000000-0000-0000-0000-000000000003'),1::bigint,'teacher cannot delete student record');

select set_config('request.jwt.claims','{"sub":"b0000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select is(public.current_school_id(), '20000000-0000-0000-0000-000000000002'::uuid, 'admin B resolves school B independently');

reset role;
select * from finish();
rollback;
