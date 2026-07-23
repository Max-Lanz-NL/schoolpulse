-- Safe self-service workflow for school administrators to connect an existing
-- guardian account to an existing student record.

create or replace function public.manage_guardian_student_link(
  _guardian_email text,
  _student_reference text,
  _relationship text default 'parent',
  _has_legal_authority boolean default true,
  _receives_communication boolean default true,
  _financial_responsibility boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_school_id uuid := public.current_school_id();
  guardian_id uuid;
  student_id uuid;
  link_id uuid;
begin
  if actor_school_id is null then
    raise exception 'Je account is niet aan een school gekoppeld';
  end if;
  if not (
    public.is_platform_admin(auth.uid())
    or public.has_permission('parents.manage')
    or public.has_permission('parents.create')
    or public.has_permission('parents.update')
  ) then
    raise exception 'Je hebt geen recht om ouder-kindkoppelingen te beheren';
  end if;
  if _relationship not in ('parent','guardian','foster_parent','stepparent','other') then
    raise exception 'Ongeldig relatietype';
  end if;

  select profile.id into guardian_id
  from public.profiles profile
  where profile.school_id = actor_school_id
    and lower(profile.email) = lower(trim(_guardian_email))
  limit 1;

  if guardian_id is null then
    raise exception 'Ouderaccount niet gevonden binnen deze school';
  end if;

  select student.profile_id into student_id
  from public.student_records student
  join public.profiles profile on profile.id = student.profile_id
  where student.school_id = actor_school_id
    and (
      lower(student.student_number) = lower(trim(_student_reference))
      or lower(profile.email) = lower(trim(_student_reference))
      or lower(profile.full_name) = lower(trim(_student_reference))
      or lower(coalesce(student.preferred_name, '')) = lower(trim(_student_reference))
    )
  order by
    case when lower(student.student_number) = lower(trim(_student_reference)) then 0 else 1 end
  limit 1;

  if student_id is null then
    raise exception 'Leerling niet gevonden binnen deze school';
  end if;
  if guardian_id = student_id then
    raise exception 'Een account kan niet aan zichzelf worden gekoppeld';
  end if;

  insert into public.guardian_student_links (
    school_id,
    guardian_profile_id,
    student_profile_id,
    relationship,
    has_legal_authority,
    receives_communication,
    financial_responsibility,
    is_active
  )
  values (
    actor_school_id,
    guardian_id,
    student_id,
    _relationship,
    _has_legal_authority,
    _receives_communication,
    _financial_responsibility,
    true
  )
  on conflict (guardian_profile_id, student_profile_id) do update
  set relationship = excluded.relationship,
      has_legal_authority = excluded.has_legal_authority,
      receives_communication = excluded.receives_communication,
      financial_responsibility = excluded.financial_responsibility,
      is_active = true,
      updated_at = now()
  returning id into link_id;

  return link_id;
end;
$$;

revoke all on function public.manage_guardian_student_link(text,text,text,boolean,boolean,boolean)
  from public;
grant execute on function public.manage_guardian_student_link(text,text,text,boolean,boolean,boolean)
  to authenticated;

create or replace function public.deactivate_guardian_student_link(_link_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (
    public.is_platform_admin(auth.uid())
    or public.has_permission('parents.manage')
    or public.has_permission('parents.delete')
    or public.has_permission('parents.update')
  ) then
    raise exception 'Je hebt geen recht om ouder-kindkoppelingen te beheren';
  end if;

  update public.guardian_student_links
  set is_active = false, updated_at = now()
  where id = _link_id
    and (public.is_platform_admin(auth.uid()) or school_id = public.current_school_id());

  if not found then raise exception 'Ouder-kindkoppeling niet gevonden'; end if;
end;
$$;

revoke all on function public.deactivate_guardian_student_link(uuid) from public;
grant execute on function public.deactivate_guardian_student_link(uuid) to authenticated;

