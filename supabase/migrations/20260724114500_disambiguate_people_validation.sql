create or replace function public.validate_school_people_reference()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  payload jsonb := to_jsonb(new);
  v_profile_id uuid := nullif(payload->>'profile_id', '')::uuid;
  v_student_id uuid := nullif(payload->>'student_profile_id', '')::uuid;
  v_guardian_id uuid := nullif(payload->>'guardian_profile_id', '')::uuid;
  v_teacher_id uuid := nullif(payload->>'teacher_profile_id', '')::uuid;
  v_school_year_id uuid := nullif(payload->>'school_year_id', '')::uuid;
  v_class_id uuid := nullif(payload->>'class_id', '')::uuid;
  v_programme_id uuid := nullif(payload->>'programme_id', '')::uuid;
  v_subject_id uuid := nullif(payload->>'subject_id', '')::uuid;
  v_teaching_group_id uuid := nullif(payload->>'teaching_group_id', '')::uuid;
begin
  if v_profile_id is not null and not exists (
    select 1 from public.profiles p where p.id = v_profile_id and p.school_id = new.school_id
  ) then raise exception 'Het account hoort niet bij deze school'; end if;

  if v_student_id is not null and not exists (
    select 1 from public.profiles p where p.id = v_student_id and p.school_id = new.school_id
  ) then raise exception 'Het leerlingaccount hoort niet bij deze school'; end if;

  if v_guardian_id is not null and not exists (
    select 1 from public.profiles p where p.id = v_guardian_id and p.school_id = new.school_id
  ) then raise exception 'Het ouder- of verzorgeraccount hoort niet bij deze school'; end if;

  if v_teacher_id is not null and not exists (
    select 1 from public.profiles p where p.id = v_teacher_id and p.school_id = new.school_id
  ) then raise exception 'Het medewerkersaccount hoort niet bij deze school'; end if;

  if v_school_year_id is not null and not exists (
    select 1 from public.school_years sy
    where sy.id = v_school_year_id and sy.school_id = new.school_id
  ) then raise exception 'Het schooljaar hoort niet bij deze school'; end if;

  if v_class_id is not null and not exists (
    select 1 from public.school_classes c
    where c.id = v_class_id and c.school_id = new.school_id
      and (v_school_year_id is null or c.school_year_id = v_school_year_id)
  ) then raise exception 'De klas hoort niet bij deze school en dit schooljaar'; end if;

  if v_programme_id is not null and not exists (
    select 1 from public.education_programmes ep
    where ep.id = v_programme_id and ep.school_id = new.school_id
  ) then raise exception 'De opleiding hoort niet bij deze school'; end if;

  if v_subject_id is not null and not exists (
    select 1 from public.subjects s where s.id = v_subject_id and s.school_id = new.school_id
  ) then raise exception 'Het vak hoort niet bij deze school'; end if;

  if v_teaching_group_id is not null and not exists (
    select 1 from public.teaching_groups tg
    where tg.id = v_teaching_group_id and tg.school_id = new.school_id
  ) then raise exception 'De lesgroep hoort niet bij deze school'; end if;

  return new;
end;
$$;
