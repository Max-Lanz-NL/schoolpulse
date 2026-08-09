-- Dutch education role template library and deterministic per-school ranking.
-- Only six universal roles are created automatically. Additional roles are
-- copied from centrally managed templates with safe starter permissions.

create table if not exists public.role_templates (
  key text primary key check (key ~ '^[a-z0-9_]+$'),
  name text not null,
  description text not null,
  sectors text[] not null default array['all']::text[],
  organization_layer integer not null check (organization_layer between 1 and 9),
  layer_label text not null,
  recommended_rank integer not null check (recommended_rank between 100 and 999),
  color text not null check (color ~ '^#[0-9a-fA-F]{6}$'),
  is_core boolean not null default false,
  is_active boolean not null default true,
  version integer not null default 1,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.role_template_permissions (
  template_key text not null references public.role_templates(key) on delete cascade,
  permission_key text not null references public.permission_definitions(key) on delete cascade,
  scope text not null check (scope in ('own', 'assigned', 'team', 'school')),
  primary key (template_key, permission_key)
);

alter table public.school_roles
  add column if not exists organization_layer integer not null default 3
    check (organization_layer between 1 and 9),
  add column if not exists template_key text references public.role_templates(key) on delete set null,
  add column if not exists template_version integer;

insert into public.role_templates (
  key, name, description, sectors, organization_layer, layer_label,
  recommended_rank, color, is_core, sort_order
)
values
  ('student', 'Leerling', 'Toegang tot uitsluitend de eigen schoolgegevens.', array['po','vo'], 1, 'Leerlingen en betrokkenen', 110, '#ea580c', true, 10),
  ('parent', 'Ouder/verzorger', 'Toegang tot uitsluitend gekoppelde kinderen.', array['po','vo'], 1, 'Leerlingen en betrokkenen', 150, '#059669', true, 20),
  ('teacher', 'Docent', 'Lesgevende medewerker met toegang tot toegewezen lessen en klassen.', array['po','vo','mbo'], 3, 'Onderwijs', 350, '#2563eb', true, 30),
  ('mentor', 'Mentor', 'Begeleidt een toegewezen mentorgroep en combineert deze rol meestal met Docent.', array['vo','mbo'], 4, 'Begeleiding', 450, '#0891b2', true, 40),
  ('team_leader', 'Teamleider', 'Geeft leiding aan een team of afdeling en combineert dit eventueel met Docent.', array['po','vo','mbo'], 6, 'Middenmanagement', 650, '#4f46e5', true, 50),
  ('director', 'Directeur', 'Eindverantwoordelijke schoolleider met schoolbreed inzicht.', array['po','vo','mbo'], 8, 'Schoolleiding', 850, '#7c3aed', true, 60),
  ('education_assistant', 'Onderwijsassistent', 'Ondersteunt docenten en leerlingen binnen toegewezen lessen en groepen.', array['po','vo'], 2, 'Onderwijsondersteuning', 250, '#0284c7', false, 100),
  ('instructor', 'Instructeur', 'Verzorgt praktijkinstructie binnen toegewezen onderwijsgroepen.', array['mbo'], 2, 'Onderwijsondersteuning', 245, '#0369a1', false, 110),
  ('administration', 'Administratief medewerker', 'Verwerkt administratieve school- en leerlinggegevens.', array['po','vo','mbo'], 2, 'Onderwijsondersteuning', 240, '#475569', false, 120),
  ('scheduler', 'Roostermaker', 'Beheert roosters, lokalen en vervangingen.', array['vo','mbo'], 5, 'Coördinatie en specialisten', 540, '#ca8a04', false, 130),
  ('care_coordinator', 'Zorg- of ondersteuningscoördinator', 'Coördineert leerlingondersteuning en gevoelige zorggegevens.', array['po','vo','mbo'], 5, 'Coördinatie en specialisten', 550, '#db2777', false, 140),
  ('quality_coordinator', 'Intern begeleider / kwaliteitscoördinator', 'Coördineert ondersteuning en onderwijskwaliteit in het primair onderwijs.', array['po'], 5, 'Coördinatie en specialisten', 555, '#be185d', false, 150),
  ('dean', 'Decaan', 'Begeleidt leerlingen bij profiel-, studie- en loopbaankeuzes.', array['vo'], 5, 'Coördinatie en specialisten', 530, '#0f766e', false, 160),
  ('exam_secretary', 'Examensecretaris', 'Coördineert toetsing, examinering en formele goedkeuringen.', array['vo','mbo'], 5, 'Coördinatie en specialisten', 560, '#b45309', false, 170),
  ('confidential_adviser', 'Vertrouwenspersoon', 'Behandelt vertrouwelijke meldingen met minimaal noodzakelijke toegang.', array['po','vo','mbo'], 5, 'Coördinatie en specialisten', 520, '#9333ea', false, 180),
  ('ict_coordinator', 'ICT-coördinator', 'Ondersteunt schoolbrede digitale middelen en integraties.', array['po','vo','mbo'], 5, 'Coördinatie en specialisten', 510, '#334155', false, 190),
  ('bpv_coordinator', 'BPV-coördinator', 'Coördineert beroepspraktijkvorming en gekoppelde studentbegeleiding.', array['mbo'], 5, 'Coördinatie en specialisten', 535, '#047857', false, 200),
  ('deputy_director', 'Adjunct-directeur / conrector', 'Ondersteunt de directeur en stuurt schoolbrede portefeuilles aan.', array['po','vo','mbo'], 7, 'Adjunct-schoolleiding', 750, '#6d28d9', false, 210),
  ('board_member', 'Bestuurder', 'Bovenschoolse bestuurlijke verantwoordelijkheid.', array['po','vo','mbo'], 9, 'Bestuur', 950, '#581c87', false, 220),
  ('custom_role', 'Lege aangepaste rol', 'Start zonder permissies voor een uitzonderlijke schoolspecifieke functie.', array['all'], 3, 'Onderwijs', 310, '#64748b', false, 999)
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description,
  sectors = excluded.sectors,
  organization_layer = excluded.organization_layer,
  layer_label = excluded.layer_label,
  recommended_rank = excluded.recommended_rank,
  color = excluded.color,
  is_core = excluded.is_core,
  sort_order = excluded.sort_order,
  updated_at = now();

with rules(template_key, scope, permissions) as (
  values
    ('student', 'own', array['dashboard.view','schedule.view','grades.view','attendance.view','assignments.view','homework.view','homework.update','study_planner.view','study_planner.update','messages.view','messages.create','documents.view','consent.view']::text[]),
    ('student', 'school', array['activities.view','announcements.view']::text[]),
    ('parent', 'own', array['dashboard.view','schedule.view','grades.view','attendance.view','absences.view','absences.create','assignments.view','messages.view','messages.create','documents.view','conversations.view','conversations.create','consent.view','consent.update']::text[]),
    ('parent', 'school', array['activities.view','announcements.view']::text[]),
    ('teacher', 'own', array['dashboard.view']::text[]),
    ('teacher', 'assigned', array['schedule.view','grades.view','grades.create','grades.update','tests.view','tests.create','assignments.view','assignments.create','assignments.update','homework.view','homework.create','homework.update','attendance.view','attendance.create','attendance.update','messages.view','messages.create','documents.view','students.view','classes.view']::text[]),
    ('teacher', 'school', array['activities.view','announcements.view']::text[]),
    ('mentor', 'assigned', array['dashboard.view','schedule.view','grades.view','reports.view','attendance.view','absences.view','students.view','parents.view','messages.view','messages.create','conversations.view','conversations.create','consent.view','care.view']::text[]),
    ('team_leader', 'team', array['dashboard.view','schedule.view','schedule.update','grades.view','reports.view','reports.approve','attendance.view','absences.view','absences.approve','students.view','parents.view','staff.view','classes.view','substitutions.view','substitutions.approve','messages.view','messages.create','announcements.view','announcements.create','documents.view','activities.view','agenda.view','conversations.view','audit_logs.view']::text[]),
    ('team_leader', 'school', array['permission_requests.view','permission_requests.create','roles.view']::text[]),
    ('director', 'school', array['dashboard.view','dashboard.export','schedule.view','grades.view','tests.view','reports.view','reports.approve','attendance.view','absences.view','students.view','parents.view','staff.view','classes.view','substitutions.view','messages.view','announcements.view','documents.view','activities.view','agenda.view','conversations.view','consent.view','user_management.view','roles.view','permission_requests.view','permission_requests.create','permission_requests.update','permission_requests.cancel','school_settings.view','privacy.view','audit_logs.view','security.view']::text[]),
    ('education_assistant', 'assigned', array['dashboard.view','schedule.view','assignments.view','homework.view','attendance.view','attendance.create','students.view','messages.view','documents.view','activities.view']::text[]),
    ('instructor', 'assigned', array['dashboard.view','schedule.view','tests.view','assignments.view','assignments.create','attendance.view','attendance.create','students.view','messages.view','documents.view']::text[]),
    ('administration', 'school', array['dashboard.view','schedule.view','attendance.view','absences.view','absences.update','students.view','students.create','students.update','parents.view','parents.create','parents.update','staff.view','classes.view','messages.view','documents.view','user_management.view','data_import.view','data_import.create']::text[]),
    ('scheduler', 'school', array['dashboard.view','schedule.view','schedule.create','schedule.update','schedule.delete','schedule.approve','schedule.publish','schedule.import','schedule.export','schedule.manage','classes.view','staff.view','substitutions.view','substitutions.create','substitutions.update','substitutions.delete','substitutions.approve','substitutions.publish']::text[]),
    ('care_coordinator', 'assigned', array['dashboard.view','students.view','parents.view','attendance.view','absences.view','grades.view','reports.view','conversations.view','conversations.create','consent.view','care.view','care.create','care.update','care.approve','incidents.view']::text[]),
    ('quality_coordinator', 'school', array['dashboard.view','reports.view','reports.create','reports.update','reports.approve','students.view','staff.view','classes.view','attendance.view','grades.view','care.view','audit_logs.view']::text[]),
    ('dean', 'assigned', array['dashboard.view','students.view','parents.view','grades.view','reports.view','conversations.view','conversations.create','documents.view','activities.view','agenda.view']::text[]),
    ('exam_secretary', 'school', array['dashboard.view','grades.view','grades.approve','grades.publish','tests.view','tests.create','tests.update','tests.approve','tests.publish','reports.view','reports.approve','reports.publish','documents.view','audit_logs.view']::text[]),
    ('confidential_adviser', 'assigned', array['dashboard.view','students.view','staff.view','conversations.view','conversations.create','incidents.view','incidents.create','incidents.update','care.view']::text[]),
    ('ict_coordinator', 'school', array['dashboard.view','user_management.view','integrations.view','integrations.create','integrations.update','school_settings.view','security.view','audit_logs.view']::text[]),
    ('bpv_coordinator', 'assigned', array['dashboard.view','students.view','staff.view','schedule.view','reports.view','conversations.view','conversations.create','documents.view','activities.view']::text[]),
    ('deputy_director', 'school', array['dashboard.view','dashboard.export','schedule.view','schedule.approve','grades.view','reports.view','reports.approve','attendance.view','absences.view','students.view','parents.view','staff.view','classes.view','substitutions.view','messages.view','announcements.view','announcements.approve','documents.view','activities.view','agenda.view','user_management.view','roles.view','permission_requests.view','permission_requests.create','school_settings.view','privacy.view','audit_logs.view','security.view']::text[]),
    ('board_member', 'school', array['dashboard.view','dashboard.export','reports.view','reports.approve','reports.export','students.view','staff.view','user_management.view','roles.view','permission_requests.view','school_settings.view','privacy.view','audit_logs.view','audit_logs.export','security.view']::text[])
)
insert into public.role_template_permissions(template_key, permission_key, scope)
select rules.template_key, permission_key, rules.scope
from rules
cross join lateral unnest(rules.permissions) permission_key
join public.permission_definitions definition on definition.key = permission_key
where rules.scope = any(definition.allowed_scopes)
on conflict (template_key, permission_key) do update set scope = excluded.scope;

-- Remove only the surplus roles created automatically by the previous seed.
delete from public.school_roles
where is_default
  and legacy_key is null
  and name in ('Zorgcoördinator','Onderwijsassistent','Administratie','Roostermaker','Gast/stagiair');

update public.school_roles
set name = 'Directeur', organization_layer = 8, template_key = 'director', template_version = 1
where legacy_key = 'school_admin'
  and not exists (
    select 1 from public.school_roles other
    where other.school_id = school_roles.school_id and other.name = 'Directeur' and other.id <> school_roles.id
  );
update public.school_roles set organization_layer = 3, template_key = 'teacher', template_version = 1 where legacy_key = 'teacher';
update public.school_roles set organization_layer = 1, template_key = 'parent', template_version = 1 where legacy_key = 'parent';
update public.school_roles set organization_layer = 1, template_key = 'student', template_version = 1 where legacy_key = 'student';
update public.school_roles set organization_layer = 4, template_key = 'mentor', template_version = 1 where name = 'Mentor';
update public.school_roles set organization_layer = 6, template_key = 'team_leader', template_version = 1 where name = 'Teamleider';

-- Ensure every existing school has exactly the six protected core roles.
insert into public.school_roles (
  school_id, name, description, rank, color, legacy_key, is_default,
  organization_layer, template_key, template_version
)
select school.id, template.name, template.description, template.recommended_rank, template.color,
  case template.key when 'director' then 'school_admin' when 'teacher' then 'teacher'
    when 'parent' then 'parent' when 'student' then 'student' else null end,
  true, template.organization_layer, template.key, template.version
from public.schools school
join public.role_templates template on template.is_core
where not exists (
  select 1 from public.school_roles role
  where role.school_id = school.id
    and (role.template_key = template.key
      or role.legacy_key = case template.key when 'director' then 'school_admin' when 'teacher' then 'teacher'
        when 'parent' then 'parent' when 'student' then 'student' else null end
      or role.name = template.name)
);

update public.school_roles set is_default = true
where template_key in ('student','parent','teacher','mentor','team_leader','director');

insert into public.role_permissions(role_id, permission_key, scope)
select role.id, template_permission.permission_key, template_permission.scope
from public.school_roles role
join public.role_template_permissions template_permission on template_permission.template_key = role.template_key
on conflict (role_id, permission_key) do nothing;

create or replace function public.normalize_school_role_ranks(_school_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.school_roles
    where school_id = _school_id
    group by organization_layer having count(*) > 99
  ) then
    raise exception 'Een organisatielaag kan maximaal 99 rollen bevatten';
  end if;

  with ranked as (
    select id,
      organization_layer * 100 + (100 - row_number() over (
        partition by organization_layer
        order by rank desc, created_at, id
      ))::integer as generated_rank
    from public.school_roles
    where school_id = _school_id
  )
  update public.school_roles role
  set rank = ranked.generated_rank
  from ranked
  where role.id = ranked.id and role.rank <> ranked.generated_rank;
end;
$$;

revoke all on function public.normalize_school_role_ranks(uuid) from public;

do $$
declare school_record record;
begin
  for school_record in select id from public.schools loop
    perform public.normalize_school_role_ranks(school_record.id);
  end loop;
end
$$;

create or replace function public.admin_create_role_from_template(
  _school_id uuid,
  _template_key text,
  _name text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare template_record public.role_templates%rowtype;
declare new_role_id uuid;
begin
  if not public.is_platform_admin(auth.uid()) then
    raise exception 'Alleen platformbeheer kan rollen toevoegen';
  end if;
  if not exists (select 1 from public.schools where id = _school_id) then
    raise exception 'School niet gevonden';
  end if;
  select * into template_record from public.role_templates where key = _template_key and is_active;
  if template_record.key is null then raise exception 'Roltemplate niet gevonden'; end if;
  if template_record.is_core and exists (
    select 1 from public.school_roles where school_id = _school_id and template_key = template_record.key
  ) then
    raise exception 'Deze basisrol bestaat al voor de school';
  end if;

  insert into public.school_roles (
    school_id, name, description, rank, color, is_default, organization_layer,
    template_key, template_version, created_by
  ) values (
    _school_id, coalesce(nullif(trim(_name), ''), template_record.name), template_record.description,
    template_record.recommended_rank, template_record.color, false, template_record.organization_layer,
    template_record.key, template_record.version, auth.uid()
  ) returning id into new_role_id;

  insert into public.role_permissions(role_id, permission_key, scope, created_by)
  select new_role_id, permission_key, scope, auth.uid()
  from public.role_template_permissions where template_key = template_record.key;

  perform public.normalize_school_role_ranks(_school_id);
  return new_role_id;
end;
$$;

create or replace function public.admin_move_school_role(_role_id uuid, _direction text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare role_record public.school_roles%rowtype;
declare neighbor_record public.school_roles%rowtype;
declare previous_rank integer;
begin
  if not public.is_platform_admin(auth.uid()) then
    raise exception 'Alleen platformbeheer kan de rangorde wijzigen';
  end if;
  if _direction not in ('up','down') then raise exception 'Ongeldige richting'; end if;
  select * into role_record from public.school_roles where id = _role_id;
  if role_record.id is null then raise exception 'Rol niet gevonden'; end if;

  if _direction = 'up' then
    select * into neighbor_record from public.school_roles
    where school_id = role_record.school_id
      and organization_layer = role_record.organization_layer and rank > role_record.rank
    order by rank asc limit 1;
  else
    select * into neighbor_record from public.school_roles
    where school_id = role_record.school_id
      and organization_layer = role_record.organization_layer and rank < role_record.rank
    order by rank desc limit 1;
  end if;
  if neighbor_record.id is null then return; end if;

  previous_rank := role_record.rank;
  update public.school_roles set rank = neighbor_record.rank where id = role_record.id;
  update public.school_roles set rank = previous_rank where id = neighbor_record.id;
  perform public.normalize_school_role_ranks(role_record.school_id);
end;
$$;

create or replace function public.admin_delete_school_role(_role_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare role_school_id uuid;
begin
  if not public.is_platform_admin(auth.uid()) then
    raise exception 'Alleen platformbeheer kan rollen verwijderen';
  end if;
  select school_id into role_school_id from public.school_roles where id = _role_id and not is_default;
  if role_school_id is null then raise exception 'Basisrollen kunnen niet worden verwijderd'; end if;
  delete from public.school_roles where id = _role_id;
  perform public.normalize_school_role_ranks(role_school_id);
end;
$$;

revoke all on function public.admin_create_role_from_template(uuid, text, text) from public;
revoke all on function public.admin_move_school_role(uuid, text) from public;
revoke all on function public.admin_delete_school_role(uuid) from public;
grant execute on function public.admin_create_role_from_template(uuid, text, text) to authenticated;
grant execute on function public.admin_move_school_role(uuid, text) to authenticated;
grant execute on function public.admin_delete_school_role(uuid) to authenticated;

create or replace function public.seed_school_role_templates()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.school_roles (
    school_id, name, description, rank, color, legacy_key, is_default,
    organization_layer, template_key, template_version
  )
  select new.id, template.name, template.description, template.recommended_rank, template.color,
    case template.key when 'director' then 'school_admin' when 'teacher' then 'teacher'
      when 'parent' then 'parent' when 'student' then 'student' else null end,
    true, template.organization_layer, template.key, template.version
  from public.role_templates template
  where template.is_core
  order by template.recommended_rank desc;

  insert into public.role_permissions(role_id, permission_key, scope)
  select role.id, permission.permission_key, permission.scope
  from public.school_roles role
  join public.role_template_permissions permission on permission.template_key = role.template_key
  where role.school_id = new.id;

  perform public.normalize_school_role_ranks(new.id);
  return new;
end;
$$;

alter table public.role_templates enable row level security;
alter table public.role_template_permissions enable row level security;

create policy "Authenticated users read role templates" on public.role_templates
  for select to authenticated using (true);
create policy "Platform admins manage role templates" on public.role_templates
  for all to authenticated using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));
create policy "Authenticated users read template permissions" on public.role_template_permissions
  for select to authenticated using (true);
create policy "Platform admins manage template permissions" on public.role_template_permissions
  for all to authenticated using (public.is_platform_admin(auth.uid()))
  with check (public.is_platform_admin(auth.uid()));
