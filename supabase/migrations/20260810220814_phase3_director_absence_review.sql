-- Directors are the default school-level reviewers for submitted absences.
insert into public.role_template_permissions(template_key,permission_key,scope)
values
  ('director','absences.update','school'),
  ('director','absences.approve','school')
on conflict do nothing;

insert into public.role_permissions(role_id,permission_key,scope)
select r.id,p.permission_key,'school'
from public.school_roles r
cross join (values ('absences.update'),('absences.approve')) p(permission_key)
where r.template_key='director' and r.is_active
on conflict do nothing;
