begin;
create extension if not exists pgtap with schema extensions;
select plan(6);

insert into public.schools(id,name)
values ('71000000-0000-4000-8000-000000000001','Pilot lifecycle school');

insert into auth.users(id,email,aud,role)
values ('71a00000-0000-4000-8000-000000000001','blocked-admin@pilot.test','authenticated','authenticated');

update public.profiles
set school_id='71000000-0000-4000-8000-000000000001', role='school_admin', is_blocked=false
where id='71a00000-0000-4000-8000-000000000001';

insert into public.profile_role_assignments(profile_id,role_id,is_primary)
select '71a00000-0000-4000-8000-000000000001',id,true
from public.school_roles
where school_id='71000000-0000-4000-8000-000000000001' and legacy_key='school_admin';

select set_config('request.jwt.claim.sub','71a00000-0000-4000-8000-000000000001',true);
set local role authenticated;

select is(public.current_school_id(),'71000000-0000-4000-8000-000000000001'::uuid,'active account receives its school context');
select is(public.can_manage_school_data(),true,'active administrator receives management context');

reset role;
update public.profiles set is_blocked=true where id='71a00000-0000-4000-8000-000000000001';
set local role authenticated;

select is(public.current_school_id(),null::uuid,'blocked existing session loses school context');
select is(public.has_permission('school_settings.manage'),false,'blocked existing session loses permissions');
select is((select count(*) from public.schools),0::bigint,'blocked existing session cannot read its school');
update public.profiles set is_blocked=false where id='71a00000-0000-4000-8000-000000000001';
reset role;
select is(
  (select is_blocked from public.profiles where id='71a00000-0000-4000-8000-000000000001'),
  true,
  'blocked account cannot unblock itself'
);

select * from finish();
rollback;
