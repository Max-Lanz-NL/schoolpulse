begin;
create extension if not exists pgtap with schema extensions;
select plan(11);

select is(public.file_uploads_enabled(), false, 'upload gate defaults to disabled');
select is((select file_uploads_enabled from public.runtime_feature_flags where singleton), false, 'canonical flag is false');

insert into public.schools(id,name)
values ('71000000-0000-4000-8000-000000000001','Upload Gate School');
insert into auth.users(id,email,aud,role) values
  ('7a000000-0000-4000-8000-000000000001','gate-admin@test.invalid','authenticated','authenticated'),
  ('7a000000-0000-4000-8000-000000000002','gate-teacher@test.invalid','authenticated','authenticated'),
  ('7a000000-0000-4000-8000-000000000003','gate-student@test.invalid','authenticated','authenticated');
update public.profiles set
  school_id='71000000-0000-4000-8000-000000000001',
  role=case
    when email like '%admin%' then 'school_admin'::public.profile_role
    when email like '%teacher%' then 'teacher'::public.profile_role
    else 'student'::public.profile_role
  end
where email like 'gate-%@test.invalid';
insert into public.profile_role_assignments(profile_id,role_id,is_primary)
select p.id,r.id,true
from public.profiles p
join public.school_roles r
  on r.school_id=p.school_id
 and r.legacy_key=case
   when p.role='school_admin' then 'school_admin'
   when p.role='teacher' then 'teacher'
   else 'student'
 end
where p.email like 'gate-%@test.invalid'
on conflict do nothing;

insert into public.school_years(id,school_id,name,starts_on,ends_on,is_current)
values ('71100000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','2026','2026-08-01','2027-07-31',true);
insert into public.subjects(id,school_id,name,code)
values ('71200000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','Nederlands','NL');
insert into public.teaching_groups(id,school_id,school_year_id,subject_id,name)
values ('71300000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','71100000-0000-4000-8000-000000000001','71200000-0000-4000-8000-000000000001','Klas 1');
insert into public.teacher_group_assignments(school_id,teacher_profile_id,teaching_group_id)
values ('71000000-0000-4000-8000-000000000001','7a000000-0000-4000-8000-000000000002','71300000-0000-4000-8000-000000000001');
insert into public.student_group_memberships(school_id,student_profile_id,teaching_group_id,status)
values ('71000000-0000-4000-8000-000000000001','7a000000-0000-4000-8000-000000000003','71300000-0000-4000-8000-000000000001','active');

-- A pre-existing pending object remains private; this simulates metadata created
-- before the pilot gate was switched off without exposing any bytes.
insert into public.file_assets(
  id,school_id,owner_id,bucket,storage_path,file_name,visibility,scan_status
) values (
  '71700000-0000-4000-8000-000000000001',
  '71000000-0000-4000-8000-000000000001',
  '7a000000-0000-4000-8000-000000000003',
  'school-files',
  '71000000-0000-4000-8000-000000000001/7a000000-0000-4000-8000-000000000003/pending.txt',
  'pending.txt','school','pending'
);

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"7a000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select throws_like(
  $$insert into storage.objects(id,bucket_id,name,owner_id) values(gen_random_uuid(),'school-files','71000000-0000-4000-8000-000000000001/7a000000-0000-4000-8000-000000000003/submissions/student.txt','7a000000-0000-4000-8000-000000000003')$$,
  '%row-level security%',
  'student cannot upload while gate is disabled'
);
update public.file_assets set scan_status='clean'
where id='71700000-0000-4000-8000-000000000001';
select is(
  (select scan_status from public.file_assets where id='71700000-0000-4000-8000-000000000001'),
  'pending',
  'owner cannot mark pending file clean'
);

select set_config('request.jwt.claims','{"sub":"7a000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select throws_like(
  $$insert into storage.objects(id,bucket_id,name,owner_id) values(gen_random_uuid(),'school-files','71000000-0000-4000-8000-000000000001/7a000000-0000-4000-8000-000000000002/teacher.txt','7a000000-0000-4000-8000-000000000002')$$,
  '%row-level security%',
  'teacher cannot upload while gate is disabled'
);
select lives_ok(
  $$insert into public.assignments(id,school_id,teaching_group_id,subject_id,title,instructions,status,created_by)
    values('71500000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','71300000-0000-4000-8000-000000000001','71200000-0000-4000-8000-000000000001','Opdracht zonder bestand','Alleen tekst','published','7a000000-0000-4000-8000-000000000002')$$,
  'teacher creates assignment without a file'
);

select set_config('request.jwt.claims','{"sub":"7a000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
select is((select count(*) from public.assignments where id='71500000-0000-4000-8000-000000000001'),1::bigint,'student sees assignment without a file');
select lives_ok(
  $$insert into public.assignment_submissions(school_id,assignment_id,student_profile_id,body,status)
    values('71000000-0000-4000-8000-000000000001','71500000-0000-4000-8000-000000000001','7a000000-0000-4000-8000-000000000003','Tekstinlevering','submitted')$$,
  'student submits text without a file'
);

select set_config('request.jwt.claims','{"sub":"7a000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select throws_like(
  $$insert into storage.objects(id,bucket_id,name,owner_id) values(gen_random_uuid(),'school-files','71000000-0000-4000-8000-000000000001/7a000000-0000-4000-8000-000000000001/admin.txt','7a000000-0000-4000-8000-000000000001')$$,
  '%row-level security%',
  'school admin cannot bypass disabled upload gate'
);
select is((select count(*) from public.file_assets where id='71700000-0000-4000-8000-000000000001'),0::bigint,'pending file is not broadly visible to school admin');
select throws_like(
  $$insert into public.file_assets(school_id,owner_id,bucket,storage_path,file_name,visibility,scan_status)
    values('71000000-0000-4000-8000-000000000001','7a000000-0000-4000-8000-000000000001','school-files','71000000-0000-4000-8000-000000000001/7a000000-0000-4000-8000-000000000001/direct.txt','direct.txt','school','pending')$$,
  '%row-level security%',
  'school admin cannot bypass gate through file metadata'
);

reset role;
select * from finish();
rollback;
