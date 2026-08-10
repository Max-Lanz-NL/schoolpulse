begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

insert into public.schools(id,name) values ('31000000-0000-4000-8000-000000000001','Timetable A'),('32000000-0000-4000-8000-000000000002','Timetable B');
insert into auth.users(id,email,aud,role) values
 ('3a000000-0000-4000-8000-000000000001','tt-admin-a@test.invalid','authenticated','authenticated'),
 ('3a000000-0000-4000-8000-000000000002','tt-teacher-a@test.invalid','authenticated','authenticated'),
 ('3a000000-0000-4000-8000-000000000003','tt-student-a@test.invalid','authenticated','authenticated'),
 ('3a000000-0000-4000-8000-000000000004','tt-teacher2-a@test.invalid','authenticated','authenticated'),
 ('3b000000-0000-4000-8000-000000000001','tt-admin-b@test.invalid','authenticated','authenticated'),
 ('3b000000-0000-4000-8000-000000000002','tt-teacher-b@test.invalid','authenticated','authenticated');
update public.profiles set school_id='31000000-0000-4000-8000-000000000001',role=case when email like '%admin%' then 'school_admin'::public.profile_role when email like '%student%' then 'student'::public.profile_role else 'teacher'::public.profile_role end where email like '%-a@test.invalid';
update public.profiles set school_id='32000000-0000-4000-8000-000000000002',role=case when email like '%admin%' then 'school_admin'::public.profile_role else 'teacher'::public.profile_role end where email like '%-b@test.invalid';

insert into public.role_permissions(role_id,permission_key,scope)
select r.id,p.key,'school' from public.school_roles r cross join public.permission_definitions p
where r.school_id in ('31000000-0000-4000-8000-000000000001','32000000-0000-4000-8000-000000000002') and r.legacy_key='school_admin' and p.key in ('schedule.view','schedule.create','schedule.update','schedule.delete','schedule.manage','substitutions.view','substitutions.create','substitutions.update','substitutions.delete','substitutions.manage')
on conflict(role_id,permission_key) do update set scope=excluded.scope;
insert into public.profile_role_assignments(profile_id,role_id,is_primary)
select p.id,r.id,true from public.profiles p join public.school_roles r on r.school_id=p.school_id and r.legacy_key=case when p.role='school_admin' then 'school_admin' when p.role='teacher' then 'teacher' else 'student' end
where p.email like 'tt-%' on conflict(profile_id,role_id) do nothing;

insert into public.school_years(id,school_id,name,starts_on,ends_on,is_current) values
 ('31100000-0000-4000-8000-000000000001','31000000-0000-4000-8000-000000000001','2026 A','2026-08-01','2027-07-31',true),
 ('32100000-0000-4000-8000-000000000002','32000000-0000-4000-8000-000000000002','2026 B','2026-08-01','2027-07-31',true);
insert into public.subjects(id,school_id,name,code) values ('31200000-0000-4000-8000-000000000001','31000000-0000-4000-8000-000000000001','Rekenen','REK'),('32200000-0000-4000-8000-000000000002','32000000-0000-4000-8000-000000000002','Taal','TAL');
insert into public.teaching_groups(id,school_id,school_year_id,subject_id,name) values ('31300000-0000-4000-8000-000000000001','31000000-0000-4000-8000-000000000001','31100000-0000-4000-8000-000000000001','31200000-0000-4000-8000-000000000001','Groep A'),('32300000-0000-4000-8000-000000000002','32000000-0000-4000-8000-000000000002','32100000-0000-4000-8000-000000000002','32200000-0000-4000-8000-000000000002','Groep B');
insert into public.rooms(id,school_id,code,name) values ('31400000-0000-4000-8000-000000000001','31000000-0000-4000-8000-000000000001','A01','Lokaal A'),('32400000-0000-4000-8000-000000000002','32000000-0000-4000-8000-000000000002','B01','Lokaal B');
insert into public.teacher_subject_assignments(school_id,teacher_profile_id,school_year_id,subject_id) values
 ('31000000-0000-4000-8000-000000000001','3a000000-0000-4000-8000-000000000002','31100000-0000-4000-8000-000000000001','31200000-0000-4000-8000-000000000001'),
 ('31000000-0000-4000-8000-000000000001','3a000000-0000-4000-8000-000000000004','31100000-0000-4000-8000-000000000001','31200000-0000-4000-8000-000000000001'),
 ('32000000-0000-4000-8000-000000000002','3b000000-0000-4000-8000-000000000002','32100000-0000-4000-8000-000000000002','32200000-0000-4000-8000-000000000002');
insert into public.teacher_group_assignments(school_id,teacher_profile_id,teaching_group_id) values
 ('31000000-0000-4000-8000-000000000001','3a000000-0000-4000-8000-000000000002','31300000-0000-4000-8000-000000000001'),
 ('31000000-0000-4000-8000-000000000001','3a000000-0000-4000-8000-000000000004','31300000-0000-4000-8000-000000000001'),
 ('32000000-0000-4000-8000-000000000002','3b000000-0000-4000-8000-000000000002','32300000-0000-4000-8000-000000000002');
insert into public.student_group_memberships(school_id,student_profile_id,teaching_group_id,status) values ('31000000-0000-4000-8000-000000000001','3a000000-0000-4000-8000-000000000003','31300000-0000-4000-8000-000000000001','active');

insert into public.timetable_entries(id,school_id,school_year_id,teaching_group_id,subject_id,teacher_profile_id,room_id,starts_at,ends_at,created_by) values
 ('31500000-0000-4000-8000-000000000001','31000000-0000-4000-8000-000000000001','31100000-0000-4000-8000-000000000001','31300000-0000-4000-8000-000000000001','31200000-0000-4000-8000-000000000001','3a000000-0000-4000-8000-000000000002','31400000-0000-4000-8000-000000000001','2026-08-17 08:30+02','2026-08-17 09:20+02','3a000000-0000-4000-8000-000000000001'),
 ('32500000-0000-4000-8000-000000000002','32000000-0000-4000-8000-000000000002','32100000-0000-4000-8000-000000000002','32300000-0000-4000-8000-000000000002','32200000-0000-4000-8000-000000000002','3b000000-0000-4000-8000-000000000002','32400000-0000-4000-8000-000000000002','2026-08-17 08:30+02','2026-08-17 09:20+02','3b000000-0000-4000-8000-000000000001');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"3a000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select is((select count(*) from public.timetable_entries where school_id='31000000-0000-4000-8000-000000000001'),1::bigint,'admin reads own school timetable');
select is((select count(*) from public.timetable_entries where school_id='32000000-0000-4000-8000-000000000002'),0::bigint,'admin cannot read other school timetable');
select throws_like($$insert into public.timetable_entries(school_id,school_year_id,teaching_group_id,subject_id,teacher_profile_id,room_id,starts_at,ends_at) values('31000000-0000-4000-8000-000000000001','31100000-0000-4000-8000-000000000001','31300000-0000-4000-8000-000000000001','31200000-0000-4000-8000-000000000001','3a000000-0000-4000-8000-000000000002','31400000-0000-4000-8000-000000000001','2026-08-17 09:00+02','2026-08-17 10:00+02')$$,'%Roosterconflict%','overlapping teacher/group/room is rejected');
select lives_ok($$insert into public.timetable_entries(id,school_id,school_year_id,teaching_group_id,subject_id,teacher_profile_id,room_id,starts_at,ends_at) values('31500000-0000-4000-8000-000000000003','31000000-0000-4000-8000-000000000001','31100000-0000-4000-8000-000000000001','31300000-0000-4000-8000-000000000001','31200000-0000-4000-8000-000000000001','3a000000-0000-4000-8000-000000000002','31400000-0000-4000-8000-000000000001','2026-08-17 09:20+02','2026-08-17 10:10+02')$$,'adjacent lessons are allowed');
select throws_like($$insert into public.timetable_entries(school_id,school_year_id,teaching_group_id,subject_id,teacher_profile_id,starts_at,ends_at) values('31000000-0000-4000-8000-000000000001','32100000-0000-4000-8000-000000000002','31300000-0000-4000-8000-000000000001','31200000-0000-4000-8000-000000000001','3a000000-0000-4000-8000-000000000002','2026-08-18 08:30+02','2026-08-18 09:20+02')$$,'%school_year_id%','cross-school reference is rejected');
select lives_ok($$insert into public.substitutions(school_id,timetable_entry_id,original_teacher_id,replacement_teacher_id,status) values('31000000-0000-4000-8000-000000000001','31500000-0000-4000-8000-000000000001','3a000000-0000-4000-8000-000000000002','3a000000-0000-4000-8000-000000000004','assigned')$$,'valid manual substitution is accepted');
select throws_like($$insert into public.substitutions(school_id,timetable_entry_id,original_teacher_id,replacement_teacher_id,status) values('32000000-0000-4000-8000-000000000002','31500000-0000-4000-8000-000000000001','3a000000-0000-4000-8000-000000000002','3b000000-0000-4000-8000-000000000002','assigned')$$,'%roosteritem%','cross-school substitution is rejected');

select set_config('request.jwt.claims','{"sub":"3a000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select is((select count(*) from public.timetable_entries where id='31500000-0000-4000-8000-000000000001'),1::bigint,'student reads assigned group lesson');
select is((select count(*) from public.timetable_entries where school_id='32000000-0000-4000-8000-000000000002'),0::bigint,'student cannot read other school timetable');
select set_config('request.jwt.claims','{"sub":"3a000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select is((select count(*) from public.timetable_entries where teacher_profile_id='3a000000-0000-4000-8000-000000000002'),2::bigint,'teacher reads own lessons');
select is((select count(*) from public.timetable_entries where teacher_profile_id='3b000000-0000-4000-8000-000000000002'),0::bigint,'teacher cannot read other school lesson');
select is((select count(*) from public.substitutions where original_teacher_id='3a000000-0000-4000-8000-000000000002'),1::bigint,'original teacher sees substitution state');

reset role;
select * from finish();
rollback;
