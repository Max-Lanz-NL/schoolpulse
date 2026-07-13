-- Central, platform-managed roles and additive permissions per school.
-- Schools can inspect their configuration and submit requests, but cannot change roles directly.

create table if not exists public.permission_definitions (
  key text primary key check (key ~ '^[a-z0-9_]+\.[a-z0-9_]+$'),
  category text not null,
  category_label text not null,
  action text not null,
  action_label text not null,
  description text not null,
  risk_level text not null default 'normal' check (risk_level in ('normal', 'sensitive', 'critical')),
  allowed_scopes text[] not null default array['own', 'assigned', 'team', 'school']::text[],
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.school_roles (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null check (length(name) between 2 and 80),
  description text,
  rank integer not null check (rank between 0 and 999),
  color text not null default '#2563eb' check (color ~ '^#[0-9a-fA-F]{6}$'),
  legacy_key text check (legacy_key in ('school_admin', 'teacher', 'student', 'parent')),
  is_default boolean not null default false,
  is_active boolean not null default true,
  version integer not null default 1,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, name),
  unique (school_id, legacy_key)
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.school_roles(id) on delete cascade,
  permission_key text not null references public.permission_definitions(key) on delete cascade,
  scope text not null default 'school' check (scope in ('own', 'assigned', 'team', 'school')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_key)
);

create table if not exists public.profile_role_assignments (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.school_roles(id) on delete cascade,
  is_primary boolean not null default false,
  assigned_by uuid references public.profiles(id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (profile_id, role_id)
);

create unique index if not exists idx_profile_one_primary_role
  on public.profile_role_assignments(profile_id)
  where is_primary;

create index if not exists idx_school_roles_school_rank on public.school_roles(school_id, rank desc);
create index if not exists idx_role_permissions_key on public.role_permissions(permission_key);
create index if not exists idx_profile_role_assignments_profile on public.profile_role_assignments(profile_id);

create table if not exists public.permission_change_requests (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  requested_by uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  request_type text not null check (request_type in ('change_role', 'new_role', 'change_rank', 'remove_access', 'advice')),
  target_role_id uuid references public.school_roles(id) on delete set null,
  title text not null check (length(title) between 3 and 160),
  summary text not null check (length(summary) between 10 and 4000),
  business_reason text not null check (length(business_reason) between 10 and 4000),
  desired_changes jsonb not null default '{}'::jsonb,
  affected_people text,
  urgency text not null default 'normal' check (urgency in ('normal', 'urgent')),
  requested_effective_date date,
  status text not null default 'submitted' check (status in ('draft', 'submitted', 'in_review', 'needs_information', 'approved', 'partially_approved', 'rejected', 'scheduled', 'completed', 'cancelled')),
  platform_response text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.permission_request_messages (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.permission_change_requests(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  message text not null check (length(message) between 1 and 4000),
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.role_configuration_versions (
  id bigint generated always as identity primary key,
  school_id uuid not null references public.schools(id) on delete cascade,
  role_id uuid references public.school_roles(id) on delete set null,
  action text not null,
  snapshot jsonb not null,
  actor_id uuid references public.profiles(id) on delete set null default auth.uid(),
  request_id uuid references public.permission_change_requests(id) on delete set null,
  created_at timestamptz not null default now()
);

-- A complete permission catalog for every current Schoolpulse module.
with modules(category, label, actions, sort_order) as (
  values
    ('dashboard', 'Dashboard en statistieken', array['view','export'], 10),
    ('schedule', 'Roosters', array['view','create','update','delete','approve','publish','import','export','manage'], 20),
    ('grades', 'Cijfers', array['view','create','update','delete','approve','publish','import','export','manage'], 30),
    ('tests', 'Toetsen', array['view','create','update','delete','approve','publish','export','manage'], 40),
    ('reports', 'Rapporten', array['view','create','update','delete','approve','publish','export','manage'], 50),
    ('assignments', 'Opdrachten', array['view','create','update','delete','approve','publish','export','manage'], 60),
    ('homework', 'Huiswerk', array['view','create','update','delete','publish','manage'], 70),
    ('study_planner', 'Studieplanner', array['view','create','update','delete','manage'], 80),
    ('messages', 'Berichten en gesprekken', array['view','create','update','delete','approve','publish','export','manage'], 90),
    ('announcements', 'Schoolbrede mededelingen', array['view','create','update','delete','approve','publish','manage'], 100),
    ('notifications', 'Notificaties', array['view','create','update','delete','publish','manage'], 110),
    ('documents', 'Documenten en bestanden', array['view','create','update','delete','approve','publish','import','export','manage'], 120),
    ('activities', 'Activiteiten', array['view','create','update','delete','approve','publish','export','manage'], 130),
    ('agenda', 'Agenda', array['view','create','update','delete','publish','export','manage'], 140),
    ('attendance', 'Aanwezigheid', array['view','create','update','delete','approve','export','manage'], 150),
    ('absences', 'Absenties en ziekmeldingen', array['view','create','update','delete','approve','export','manage'], 160),
    ('students', 'Leerlingen en dossiers', array['view','create','update','delete','approve','import','export','manage'], 170),
    ('parents', 'Ouders en gezinskoppelingen', array['view','create','update','delete','approve','import','export','manage'], 180),
    ('staff', 'Personeel', array['view','create','update','delete','approve','import','export','manage'], 190),
    ('classes', 'Klassen, groepen en vakken', array['view','create','update','delete','import','export','manage'], 200),
    ('substitutions', 'Vervanging', array['view','create','update','delete','approve','publish','manage'], 210),
    ('conversations', 'Ouder- en mentorgesprekken', array['view','create','update','delete','approve','manage'], 220),
    ('consent', 'Toestemmingen', array['view','create','update','delete','approve','export','manage'], 230),
    ('care', 'Zorggegevens', array['view','create','update','delete','approve','export','manage'], 240),
    ('incidents', 'Incidenten en veiligheid', array['view','create','update','delete','approve','export','manage'], 250),
    ('user_management', 'Accounts en gebruikers', array['view','create','update','deactivate','delete','approve','import','export','manage'], 260),
    ('roles', 'Rollen en rechten', array['view','create','update','delete','approve','assign','export','manage'], 270),
    ('permission_requests', 'Verzoeken voor rollen en rechten', array['view','create','update','cancel','review','approve','manage'], 280),
    ('school_settings', 'Schoolinstellingen en locaties', array['view','create','update','delete','approve','manage'], 290),
    ('data_import', 'Data-import', array['view','create','update','delete','approve','import','manage'], 300),
    ('integrations', 'Integraties en API', array['view','create','update','delete','approve','manage'], 310),
    ('privacy', 'AVG en privacyverzoeken', array['view','create','update','delete','approve','export','manage'], 320),
    ('audit_logs', 'Auditlogs', array['view','export'], 330),
    ('security', 'Beveiliging, sessies en 2FA', array['view','update','approve','manage'], 340)
), actions(action, label) as (
  values
    ('view','Bekijken'), ('create','Aanmaken'), ('update','Aanpassen'),
    ('deactivate','Deactiveren'), ('delete','Verwijderen'), ('approve','Goedkeuren'),
    ('publish','Publiceren'), ('import','Importeren'), ('export','Exporteren'),
    ('assign','Toewijzen'), ('cancel','Annuleren'), ('review','Beoordelen'), ('manage','Volledig beheren')
)
insert into public.permission_definitions (
  key, category, category_label, action, action_label, description, risk_level, allowed_scopes, sort_order
)
select
  modules.category || '.' || action_name,
  modules.category,
  modules.label,
  action_name,
  actions.label,
  actions.label || ' binnen ' || lower(modules.label) || '.',
  case
    when modules.category in ('care','incidents','privacy','security','roles','user_management') or action_name in ('delete','export','manage','assign') then 'critical'
    when action_name in ('approve','publish','import','update') then 'sensitive'
    else 'normal'
  end,
  case when modules.category in ('roles','permission_requests','school_settings','audit_logs','security','integrations')
    then array['school']::text[]
    else array['own','assigned','team','school']::text[]
  end,
  modules.sort_order + coalesce(array_position(modules.actions, action_name), 0)
from modules
cross join lateral unnest(modules.actions) as action_name
join actions on actions.action = action_name
on conflict (key) do update set
  category_label = excluded.category_label,
  action_label = excluded.action_label,
  description = excluded.description,
  risk_level = excluded.risk_level,
  allowed_scopes = excluded.allowed_scopes,
  sort_order = excluded.sort_order;

-- Seed a protected set of school-specific defaults for every existing school.
insert into public.school_roles (school_id, name, description, rank, color, legacy_key, is_default)
select s.id, template.name, template.description, template.rank, template.color, template.legacy_key, true
from public.schools s
cross join (values
  ('Directie', 'Bestuurlijke verantwoordelijkheid en aanvragen voor rechten.', 900, '#7c3aed', 'school_admin'),
  ('Teamleider', 'Leidinggevende voor een team of afdeling.', 600, '#4f46e5', null),
  ('Zorgcoördinator', 'Begeleiding en zorg met toegang tot gevoelige leerlinggegevens.', 500, '#db2777', null),
  ('Mentor', 'Begeleiding van toegewezen leerlingen en mentorgroepen.', 400, '#0891b2', null),
  ('Docent', 'Lesgevende medewerker met toegang tot toegewezen klassen.', 300, '#2563eb', 'teacher'),
  ('Onderwijsassistent', 'Ondersteuning binnen toegewezen lessen en groepen.', 250, '#0284c7', null),
  ('Administratie', 'Administratieve ondersteuning van de school.', 240, '#475569', null),
  ('Roostermaker', 'Beheer van roosters, lokalen en vervangingen.', 230, '#ca8a04', null),
  ('Ouder/verzorger', 'Toegang tot gekoppelde kinderen.', 100, '#059669', 'parent'),
  ('Leerling', 'Toegang tot de eigen schoolgegevens.', 50, '#ea580c', 'student'),
  ('Gast/stagiair', 'Tijdelijke, minimaal ingestelde toegang.', 20, '#64748b', null)
) as template(name, description, rank, color, legacy_key)
on conflict do nothing;

-- Directie can use the school app and submit requests, but cannot edit roles.
insert into public.role_permissions (role_id, permission_key, scope)
select r.id, p.key, 'school'
from public.school_roles r
join public.permission_definitions p on (
  r.legacy_key = 'school_admin'
  and p.key in (
    'dashboard.view','dashboard.export','schedule.view','grades.view','reports.view','attendance.view',
    'absences.view','students.view','parents.view','staff.view','classes.view','messages.view',
    'announcements.view','documents.view','activities.view','agenda.view','conversations.view',
    'consent.view','permission_requests.view','permission_requests.create','permission_requests.update',
    'permission_requests.cancel','roles.view','audit_logs.view'
  )
)
on conflict (role_id, permission_key) do nothing;

-- Teacher, parent and student starter permissions use constrained scopes.
insert into public.role_permissions (role_id, permission_key, scope)
select r.id, permission.key, permission.scope
from public.school_roles r
join (values
  ('teacher','dashboard.view','own'), ('teacher','schedule.view','assigned'),
  ('teacher','grades.view','assigned'), ('teacher','grades.create','assigned'), ('teacher','grades.update','assigned'),
  ('teacher','tests.view','assigned'), ('teacher','tests.create','assigned'), ('teacher','assignments.view','assigned'),
  ('teacher','assignments.create','assigned'), ('teacher','assignments.update','assigned'),
  ('teacher','attendance.view','assigned'), ('teacher','attendance.create','assigned'), ('teacher','attendance.update','assigned'),
  ('teacher','messages.view','assigned'), ('teacher','messages.create','assigned'), ('teacher','documents.view','assigned'),
  ('teacher','students.view','assigned'), ('teacher','activities.view','school'),
  ('parent','dashboard.view','own'), ('parent','schedule.view','own'), ('parent','grades.view','own'),
  ('parent','attendance.view','own'), ('parent','absences.view','own'), ('parent','absences.create','own'),
  ('parent','assignments.view','own'), ('parent','messages.view','own'), ('parent','messages.create','own'),
  ('parent','documents.view','own'), ('parent','activities.view','school'), ('parent','conversations.view','own'),
  ('parent','conversations.create','own'), ('parent','consent.view','own'), ('parent','consent.update','own'),
  ('student','dashboard.view','own'), ('student','schedule.view','own'), ('student','grades.view','own'),
  ('student','attendance.view','own'), ('student','assignments.view','own'), ('student','homework.view','own'),
  ('student','homework.update','own'), ('student','study_planner.view','own'), ('student','study_planner.update','own'),
  ('student','messages.view','own'), ('student','messages.create','own'), ('student','documents.view','own'),
  ('student','activities.view','school')
) as permission(legacy_key, key, scope) on permission.legacy_key = r.legacy_key
on conflict (role_id, permission_key) do nothing;

-- Every newly created school receives the same editable role templates.
create or replace function public.seed_school_role_templates()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.school_roles (school_id, name, description, rank, color, legacy_key, is_default)
  select new.id, template.name, template.description, template.rank, template.color, template.legacy_key, true
  from (values
    ('Directie', 'Bestuurlijke verantwoordelijkheid en aanvragen voor rechten.', 900, '#7c3aed', 'school_admin'),
    ('Teamleider', 'Leidinggevende voor een team of afdeling.', 600, '#4f46e5', null),
    ('Zorgcoördinator', 'Begeleiding en zorg met toegang tot gevoelige leerlinggegevens.', 500, '#db2777', null),
    ('Mentor', 'Begeleiding van toegewezen leerlingen en mentorgroepen.', 400, '#0891b2', null),
    ('Docent', 'Lesgevende medewerker met toegang tot toegewezen klassen.', 300, '#2563eb', 'teacher'),
    ('Onderwijsassistent', 'Ondersteuning binnen toegewezen lessen en groepen.', 250, '#0284c7', null),
    ('Administratie', 'Administratieve ondersteuning van de school.', 240, '#475569', null),
    ('Roostermaker', 'Beheer van roosters, lokalen en vervangingen.', 230, '#ca8a04', null),
    ('Ouder/verzorger', 'Toegang tot gekoppelde kinderen.', 100, '#059669', 'parent'),
    ('Leerling', 'Toegang tot de eigen schoolgegevens.', 50, '#ea580c', 'student'),
    ('Gast/stagiair', 'Tijdelijke, minimaal ingestelde toegang.', 20, '#64748b', null)
  ) as template(name, description, rank, color, legacy_key);

  insert into public.role_permissions (role_id, permission_key, scope)
  select r.id, p.key, 'school'
  from public.school_roles r
  join public.permission_definitions p on r.legacy_key = 'school_admin' and p.key in (
    'dashboard.view','dashboard.export','schedule.view','grades.view','reports.view','attendance.view',
    'absences.view','students.view','parents.view','staff.view','classes.view','messages.view',
    'announcements.view','documents.view','activities.view','agenda.view','conversations.view',
    'consent.view','permission_requests.view','permission_requests.create','permission_requests.update',
    'permission_requests.cancel','roles.view','audit_logs.view'
  )
  where r.school_id = new.id;

  insert into public.role_permissions (role_id, permission_key, scope)
  select r.id, permission.key, permission.scope
  from public.school_roles r
  join (values
    ('teacher','dashboard.view','own'), ('teacher','schedule.view','assigned'),
    ('teacher','grades.view','assigned'), ('teacher','grades.create','assigned'), ('teacher','grades.update','assigned'),
    ('teacher','tests.view','assigned'), ('teacher','tests.create','assigned'), ('teacher','assignments.view','assigned'),
    ('teacher','assignments.create','assigned'), ('teacher','assignments.update','assigned'),
    ('teacher','attendance.view','assigned'), ('teacher','attendance.create','assigned'), ('teacher','attendance.update','assigned'),
    ('teacher','messages.view','assigned'), ('teacher','messages.create','assigned'), ('teacher','documents.view','assigned'),
    ('teacher','students.view','assigned'), ('teacher','activities.view','school'),
    ('parent','dashboard.view','own'), ('parent','schedule.view','own'), ('parent','grades.view','own'),
    ('parent','attendance.view','own'), ('parent','absences.view','own'), ('parent','absences.create','own'),
    ('parent','assignments.view','own'), ('parent','messages.view','own'), ('parent','messages.create','own'),
    ('parent','documents.view','own'), ('parent','activities.view','school'), ('parent','conversations.view','own'),
    ('parent','conversations.create','own'), ('parent','consent.view','own'), ('parent','consent.update','own'),
    ('student','dashboard.view','own'), ('student','schedule.view','own'), ('student','grades.view','own'),
    ('student','attendance.view','own'), ('student','assignments.view','own'), ('student','homework.view','own'),
    ('student','homework.update','own'), ('student','study_planner.view','own'), ('student','study_planner.update','own'),
    ('student','messages.view','own'), ('student','messages.create','own'), ('student','documents.view','own'),
    ('student','activities.view','school')
  ) as permission(legacy_key, key, scope) on permission.legacy_key = r.legacy_key
  where r.school_id = new.id;
  return new;
end;
$$;

drop trigger if exists trg_seed_school_role_templates on public.schools;
create trigger trg_seed_school_role_templates
after insert on public.schools
for each row execute function public.seed_school_role_templates();

-- Preserve every existing account by assigning the matching school role.
insert into public.profile_role_assignments (profile_id, role_id, is_primary)
select p.id, r.id, true
from public.profiles p
join public.school_roles r on r.school_id = p.school_id and r.legacy_key = p.role::text
where p.school_id is not null and p.role <> 'platform_admin'
on conflict (profile_id, role_id) do nothing;

create or replace function public.effective_permissions(_user_id uuid default auth.uid())
returns table(permission_key text, scope text, source_roles text[])
language sql
stable
security definer
set search_path = public
as $$
  select rp.permission_key,
    (array_agg(rp.scope order by case rp.scope when 'school' then 4 when 'team' then 3 when 'assigned' then 2 else 1 end desc))[1],
    array_agg(distinct sr.name order by sr.name)
  from public.profile_role_assignments pra
  join public.school_roles sr on sr.id = pra.role_id and sr.is_active
  join public.role_permissions rp on rp.role_id = sr.id
  join public.profiles p on p.id = pra.profile_id and p.school_id = sr.school_id
  where pra.profile_id = _user_id
    and (_user_id = auth.uid() or public.is_platform_admin(auth.uid()))
  group by rp.permission_key;
$$;

create or replace function public.has_permission(_permission_key text, _user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (_user_id = auth.uid() or public.is_platform_admin(auth.uid())) and (
    public.is_platform_admin(_user_id) or exists (
    select 1 from public.effective_permissions(_user_id) ep where ep.permission_key = _permission_key
    )
  );
$$;

create or replace function public.effective_rank(_user_id uuid default auth.uid())
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case when public.is_platform_admin(_user_id) then 1000 else coalesce(max(sr.rank), 0) end
  from public.profile_role_assignments pra
  join public.school_roles sr on sr.id = pra.role_id and sr.is_active
  where pra.profile_id = _user_id
    and (_user_id = auth.uid() or public.is_platform_admin(auth.uid()));
$$;

create or replace function public.admin_replace_role_permissions(_role_id uuid, _permissions jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_platform_admin(auth.uid()) then raise exception 'Alleen platformbeheer kan permissies wijzigen'; end if;
  if not exists (select 1 from public.school_roles where id = _role_id) then raise exception 'Rol niet gevonden'; end if;

  delete from public.role_permissions where role_id = _role_id;
  insert into public.role_permissions(role_id, permission_key, scope, created_by)
  select _role_id, item ->> 'permission_key', coalesce(item ->> 'scope', 'school'), auth.uid()
  from jsonb_array_elements(coalesce(_permissions, '[]'::jsonb)) item
  join public.permission_definitions definition on definition.key = item ->> 'permission_key'
  where coalesce(item ->> 'scope', 'school') = any(definition.allowed_scopes)
  on conflict (role_id, permission_key) do update set scope = excluded.scope;
end;
$$;

create or replace function public.admin_set_profile_roles(
  _profile_id uuid,
  _role_ids uuid[],
  _primary_role_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_school_id uuid;
begin
  if not public.is_platform_admin(auth.uid()) then raise exception 'Alleen platformbeheer kan rollen toewijzen'; end if;
  select school_id into v_school_id from public.profiles where id = _profile_id;
  if v_school_id is null then raise exception 'Account is niet aan een school gekoppeld'; end if;
  if exists (
    select 1 from unnest(coalesce(_role_ids, array[]::uuid[])) role_id
    where not exists (select 1 from public.school_roles r where r.id = role_id and r.school_id = v_school_id and r.is_active)
  ) then raise exception 'Een geselecteerde rol hoort niet bij de school van dit account'; end if;
  if _primary_role_id is not null and not (_primary_role_id = any(coalesce(_role_ids, array[]::uuid[]))) then
    raise exception 'De primaire rol moet ook toegewezen zijn';
  end if;

  delete from public.profile_role_assignments where profile_id = _profile_id;
  insert into public.profile_role_assignments(profile_id, role_id, is_primary, assigned_by)
  select _profile_id, role_id, role_id = _primary_role_id, auth.uid()
  from unnest(coalesce(_role_ids, array[]::uuid[])) role_id;
end;
$$;

create or replace function public.admin_review_permission_request(
  _request_id uuid,
  _status text,
  _platform_response text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_platform_admin(auth.uid()) then raise exception 'Alleen platformbeheer kan verzoeken beoordelen'; end if;
  if _status not in ('in_review','needs_information','approved','partially_approved','rejected','scheduled','completed','cancelled') then
    raise exception 'Ongeldige verzoekstatus';
  end if;
  update public.permission_change_requests
  set status = _status, platform_response = nullif(trim(_platform_response), ''),
      reviewed_by = auth.uid(), reviewed_at = now()
  where id = _request_id;
  if not found then raise exception 'Verzoek niet gevonden'; end if;
end;
$$;

revoke all on function public.effective_permissions(uuid) from public;
revoke all on function public.has_permission(text, uuid) from public;
revoke all on function public.effective_rank(uuid) from public;
revoke all on function public.admin_replace_role_permissions(uuid, jsonb) from public;
revoke all on function public.admin_set_profile_roles(uuid, uuid[], uuid) from public;
revoke all on function public.admin_review_permission_request(uuid, text, text) from public;
grant execute on function public.effective_permissions(uuid) to authenticated;
grant execute on function public.has_permission(text, uuid) to authenticated;
grant execute on function public.effective_rank(uuid) to authenticated;
grant execute on function public.admin_replace_role_permissions(uuid, jsonb) to authenticated;
grant execute on function public.admin_set_profile_roles(uuid, uuid[], uuid) to authenticated;
grant execute on function public.admin_review_permission_request(uuid, text, text) to authenticated;

create or replace function public.set_permission_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  if tg_table_name = 'school_roles' then
    new.version = old.version + 1;
    new.updated_by = auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_school_roles_updated_at on public.school_roles;
create trigger trg_school_roles_updated_at before update on public.school_roles
for each row execute function public.set_permission_updated_at();

drop trigger if exists trg_permission_requests_updated_at on public.permission_change_requests;
create trigger trg_permission_requests_updated_at before update on public.permission_change_requests
for each row execute function public.set_permission_updated_at();

create or replace function public.capture_role_configuration_version()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_role public.school_roles;
begin
  if tg_table_name = 'school_roles' then
    v_role := case when tg_op = 'DELETE' then old else new end;
  else
    select * into v_role from public.school_roles where id = case when tg_op = 'DELETE' then old.role_id else new.role_id end;
  end if;
  if v_role.id is not null then
    insert into public.role_configuration_versions(school_id, role_id, action, snapshot, actor_id)
    values (v_role.school_id, case when tg_op = 'DELETE' and tg_table_name = 'school_roles' then null else v_role.id end, tg_table_name || ':' || tg_op,
      jsonb_build_object('role', to_jsonb(v_role), 'permissions', (
        select coalesce(jsonb_agg(jsonb_build_object('key', permission_key, 'scope', scope) order by permission_key), '[]'::jsonb)
        from public.role_permissions where role_id = v_role.id
      )), auth.uid());
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists trg_school_roles_versions on public.school_roles;
create trigger trg_school_roles_versions after insert or update or delete on public.school_roles
for each row execute function public.capture_role_configuration_version();

drop trigger if exists trg_role_permissions_versions on public.role_permissions;
create trigger trg_role_permissions_versions after insert or update or delete on public.role_permissions
for each row execute function public.capture_role_configuration_version();

alter table public.permission_definitions enable row level security;
alter table public.school_roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profile_role_assignments enable row level security;
alter table public.permission_change_requests enable row level security;
alter table public.permission_request_messages enable row level security;
alter table public.role_configuration_versions enable row level security;

create policy "Authenticated users can read permission definitions" on public.permission_definitions
  for select to authenticated using (true);
create policy "Platform admins manage permission definitions" on public.permission_definitions
  for all using (public.is_platform_admin(auth.uid())) with check (public.is_platform_admin(auth.uid()));

create policy "Users can read roles for own school" on public.school_roles
  for select using (school_id = public.current_school_id() or public.is_platform_admin(auth.uid()));
create policy "Only platform admins manage school roles" on public.school_roles
  for all using (public.is_platform_admin(auth.uid())) with check (public.is_platform_admin(auth.uid()));

create policy "Users can read permissions for own school roles" on public.role_permissions
  for select using (exists (
    select 1 from public.school_roles r where r.id = role_id
      and (r.school_id = public.current_school_id() or public.is_platform_admin(auth.uid()))
  ));
create policy "Only platform admins manage role permissions" on public.role_permissions
  for all using (public.is_platform_admin(auth.uid())) with check (public.is_platform_admin(auth.uid()));

create policy "Users can read own role assignments" on public.profile_role_assignments
  for select using (profile_id = auth.uid() or public.is_platform_admin(auth.uid()));
create policy "Only platform admins manage role assignments" on public.profile_role_assignments
  for all using (public.is_platform_admin(auth.uid())) with check (public.is_platform_admin(auth.uid()));

create policy "School users can read permission requests" on public.permission_change_requests
  for select using (school_id = public.current_school_id() or public.is_platform_admin(auth.uid()));
create policy "Authorized directors can submit permission requests" on public.permission_change_requests
  for insert with check (
    school_id = public.current_school_id() and requested_by = auth.uid()
    and public.has_permission('permission_requests.create')
  );
create policy "Requesters can update open requests" on public.permission_change_requests
  for update using (
    (requested_by = auth.uid() and status in ('draft','submitted','needs_information')) or public.is_platform_admin(auth.uid())
  ) with check (
    (requested_by = auth.uid() and school_id = public.current_school_id()
      and status in ('draft','submitted','cancelled')) or public.is_platform_admin(auth.uid())
  );
create policy "Only platform admins delete permission requests" on public.permission_change_requests
  for delete using (public.is_platform_admin(auth.uid()));

create policy "Participants can read request messages" on public.permission_request_messages
  for select using (exists (
    select 1 from public.permission_change_requests r where r.id = request_id
      and (r.school_id = public.current_school_id() or public.is_platform_admin(auth.uid()))
      and (not is_internal or public.is_platform_admin(auth.uid()))
  ));
create policy "Participants can add request messages" on public.permission_request_messages
  for insert with check (author_id = auth.uid() and (not is_internal or public.is_platform_admin(auth.uid())) and exists (
    select 1 from public.permission_change_requests r where r.id = request_id
      and (r.school_id = public.current_school_id() or public.is_platform_admin(auth.uid()))
  ));

create policy "Platform admins read role versions" on public.role_configuration_versions
  for select using (public.is_platform_admin(auth.uid()));
create policy "Platform admins manage role versions" on public.role_configuration_versions
  for all using (public.is_platform_admin(auth.uid())) with check (public.is_platform_admin(auth.uid()));

-- Replace legacy app-record authorization with the central permission engine.
create or replace function public.app_record_permission(_entity_type text, _action text)
returns text language sql immutable as $$
  select (case _entity_type
    when 'schedule' then 'schedule'
    when 'grade' then 'grades'
    when 'message' then 'messages'
    when 'assignment' then 'assignments'
    when 'document' then 'documents'
    when 'activity' then 'activities'
    when 'attendance' then 'attendance'
    when 'student' then 'students'
    when 'absence' then 'absences'
    when 'conversation' then 'conversations'
    when 'test' then 'tests'
    when 'substitution' then 'substitutions'
    when 'report' then 'reports'
    else replace(_entity_type, '-', '_')
  end) || '.' || _action;
$$;

create or replace function public.app_record_scope_allows(
  _permission_key text,
  _created_by uuid,
  _payload jsonb
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin(auth.uid()) or coalesce((
    select case ep.scope
      when 'school' then true
      when 'team' then
        _created_by = auth.uid()
        or coalesce(_payload -> 'team_member_ids', '[]'::jsonb) ? auth.uid()::text
        or coalesce(_payload -> 'assigned_user_ids', '[]'::jsonb) ? auth.uid()::text
      when 'assigned' then
        _created_by = auth.uid()
        or coalesce(_payload -> 'assigned_user_ids', '[]'::jsonb) ? auth.uid()::text
      else
        _created_by = auth.uid()
        or _payload ->> 'owner_id' = auth.uid()::text
        or _payload ->> 'profile_id' = auth.uid()::text
        or _payload ->> 'user_id' = auth.uid()::text
    end
    from public.effective_permissions(auth.uid()) ep
    where ep.permission_key = _permission_key
  ), false);
$$;

revoke all on function public.app_record_scope_allows(text, uuid, jsonb) from public;
grant execute on function public.app_record_scope_allows(text, uuid, jsonb) to authenticated;

drop policy if exists "Authorized users can read their school data" on public.app_records;
create policy "Permission engine reads school data" on public.app_records for select
  using (
    (school_id = public.current_school_id() and public.app_record_scope_allows(public.app_record_permission(entity_type, 'view'), created_by, payload))
    or public.is_platform_admin(auth.uid())
  );

drop policy if exists "School staff can insert school data" on public.app_records;
create policy "Permission engine inserts school data" on public.app_records for insert
  with check (
    school_id = public.current_school_id() and created_by = auth.uid()
    and public.app_record_scope_allows(public.app_record_permission(entity_type, 'create'), created_by, payload)
  );

drop policy if exists "School staff can update school data" on public.app_records;
create policy "Permission engine updates school data" on public.app_records for update
  using (
    (school_id = public.current_school_id() and public.app_record_scope_allows(public.app_record_permission(entity_type, 'update'), created_by, payload))
    or public.is_platform_admin(auth.uid())
  )
  with check (
    (school_id = public.current_school_id() and public.app_record_scope_allows(public.app_record_permission(entity_type, 'update'), created_by, payload))
    or public.is_platform_admin(auth.uid())
  );

drop policy if exists "School staff can delete school data" on public.app_records;
create policy "Permission engine deletes school data" on public.app_records for delete
  using (
    (school_id = public.current_school_id() and public.app_record_scope_allows(public.app_record_permission(entity_type, 'delete'), created_by, payload))
    or public.is_platform_admin(auth.uid())
  );

do $$
declare table_name text;
begin
  foreach table_name in array array['school_roles','role_permissions','profile_role_assignments','permission_change_requests','permission_request_messages']
  loop
    if not exists (
      select 1 from pg_publication_tables where pubname = 'supabase_realtime'
        and schemaname = 'public' and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end
$$;
