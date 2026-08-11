begin;
create extension if not exists pgtap with schema extensions;
select plan(2);

select ok(
  not has_function_privilege('authenticated', 'public.validate_timetable_entry()', 'EXECUTE'),
  'authenticated cannot execute internal timetable trigger validator'
);
select ok(
  not has_function_privilege('authenticated', 'public.validate_substitution()', 'EXECUTE'),
  'authenticated cannot execute internal substitution trigger validator'
);

select * from finish();
rollback;
