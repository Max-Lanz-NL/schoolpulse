-- PostgreSQL does not guarantee short-circuit evaluation for record fields.
-- Read polymorphic trigger rows through JSON so each table is validated only
-- against columns it actually owns.
create or replace function public.validate_school_people_reference()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  payload jsonb := to_jsonb(new);
  profile_id uuid;
  student_id uuid;
  guardian_id uuid;
  teacher_id uuid;
  school_year_id uuid;
  class_id uuid;
  programme_id uuid;
  subject_id uuid;
  teaching_group_id uuid;
begin
  profile_id := nullif(payload->>'profile_id', '')::uuid;
  student_id := nullif(payload->>'student_profile_id', '')::uuid;
  guardian_id := nullif(payload->>'guardian_profile_id', '')::uuid;
  teacher_id := nullif(payload->>'teacher_profile_id', '')::uuid;
  school_year_id := nullif(payload->>'school_year_id', '')::uuid;
  class_id := nullif(payload->>'class_id', '')::uuid;
  programme_id := nullif(payload->>'programme_id', '')::uuid;
  subject_id := nullif(payload->>'subject_id', '')::uuid;
  teaching_group_id := nullif(payload->>'teaching_group_id', '')::uuid;

  if profile_id is not null and not exists (
    select 1 from public.profiles where id = profile_id and school_id = new.school_id
  ) then raise exception 'Het account hoort niet bij deze school'; end if;

  if student_id is not null and not exists (
    select 1 from public.profiles where id = student_id and school_id = new.school_id
  ) then raise exception 'Het leerlingaccount hoort niet bij deze school'; end if;

  if guardian_id is not null and not exists (
    select 1 from public.profiles where id = guardian_id and school_id = new.school_id
  ) then raise exception 'Het ouder- of verzorgeraccount hoort niet bij deze school'; end if;

  if teacher_id is not null and not exists (
    select 1 from public.profiles where id = teacher_id and school_id = new.school_id
  ) then raise exception 'Het medewerkersaccount hoort niet bij deze school'; end if;

  if school_year_id is not null and not exists (
    select 1 from public.school_years where id = school_year_id and school_id = new.school_id
  ) then raise exception 'Het schooljaar hoort niet bij deze school'; end if;

  if class_id is not null and not exists (
    select 1 from public.school_classes
    where id = class_id and school_id = new.school_id
      and (school_year_id is null or school_classes.school_year_id = school_year_id)
  ) then raise exception 'De klas hoort niet bij deze school en dit schooljaar'; end if;

  if programme_id is not null and not exists (
    select 1 from public.education_programmes where id = programme_id and school_id = new.school_id
  ) then raise exception 'De opleiding hoort niet bij deze school'; end if;

  if subject_id is not null and not exists (
    select 1 from public.subjects where id = subject_id and school_id = new.school_id
  ) then raise exception 'Het vak hoort niet bij deze school'; end if;

  if teaching_group_id is not null and not exists (
    select 1 from public.teaching_groups where id = teaching_group_id and school_id = new.school_id
  ) then raise exception 'De lesgroep hoort niet bij deze school'; end if;

  return new;
end;
$$;
