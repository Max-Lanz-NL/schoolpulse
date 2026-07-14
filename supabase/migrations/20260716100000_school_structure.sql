-- The relational foundation every production module builds on.
-- This migration is additive: existing schools, accounts, roles and app records stay intact.

create table public.school_years (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null check (length(trim(name)) between 2 and 40),
  starts_on date not null,
  ends_on date not null,
  is_current boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint school_year_valid_range check (ends_on > starts_on),
  constraint school_year_current_not_archived check (not (is_current and is_archived)),
  unique (school_id, name)
);

create unique index school_years_one_current_per_school
  on public.school_years(school_id) where is_current;
create index school_years_school_dates on public.school_years(school_id, starts_on desc);

create table public.school_periods (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  school_year_id uuid not null references public.school_years(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 40),
  sequence integer not null check (sequence between 1 and 20),
  starts_on date not null,
  ends_on date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint school_period_valid_range check (ends_on >= starts_on),
  unique (school_year_id, name),
  unique (school_year_id, sequence)
);

create index school_periods_school_year on public.school_periods(school_id, school_year_id, sequence);

create table public.school_locations (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null check (length(trim(name)) between 2 and 100),
  code text check (code is null or length(trim(code)) between 1 and 20),
  address text,
  postal_code text,
  city text,
  is_main boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, name)
);

create unique index school_locations_one_main_per_school
  on public.school_locations(school_id) where is_main and is_active;
create unique index school_locations_unique_code
  on public.school_locations(school_id, code) where code is not null;

create table public.education_programmes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null check (length(trim(name)) between 2 and 100),
  code text check (code is null or length(trim(code)) between 1 and 20),
  sector text not null check (sector in ('po', 'vo', 'vso', 'mbo', 'other')),
  level text,
  duration_years integer check (duration_years is null or duration_years between 1 and 8),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, name)
);

create unique index education_programmes_unique_code
  on public.education_programmes(school_id, code) where code is not null;

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null check (length(trim(name)) between 2 and 100),
  code text not null check (length(trim(code)) between 1 and 20),
  color text not null default '#2563eb' check (color ~ '^#[0-9a-fA-F]{6}$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, name),
  unique (school_id, code)
);

create table public.school_classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  school_year_id uuid not null references public.school_years(id) on delete restrict,
  programme_id uuid references public.education_programmes(id) on delete set null,
  location_id uuid references public.school_locations(id) on delete set null,
  name text not null check (length(trim(name)) between 1 and 60),
  code text check (code is null or length(trim(code)) between 1 and 20),
  grade_level integer check (grade_level is null or grade_level between 1 and 8),
  capacity integer check (capacity is null or capacity between 1 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_year_id, name)
);

create index school_classes_school_year on public.school_classes(school_id, school_year_id);
create unique index school_classes_unique_code
  on public.school_classes(school_year_id, code) where code is not null;

create table public.teaching_groups (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  school_year_id uuid not null references public.school_years(id) on delete restrict,
  subject_id uuid references public.subjects(id) on delete restrict,
  base_class_id uuid references public.school_classes(id) on delete set null,
  location_id uuid references public.school_locations(id) on delete set null,
  name text not null check (length(trim(name)) between 1 and 80),
  code text check (code is null or length(trim(code)) between 1 and 30),
  group_type text not null default 'lesson' check (group_type in ('lesson', 'mentor', 'project', 'support', 'other')),
  capacity integer check (capacity is null or capacity between 1 and 500),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_year_id, name)
);

create index teaching_groups_school_year on public.teaching_groups(school_id, school_year_id);
create index teaching_groups_subject on public.teaching_groups(subject_id);
create unique index teaching_groups_unique_code
  on public.teaching_groups(school_year_id, code) where code is not null;

-- Selecting a new current year or main location automatically replaces the old one.
create or replace function public.normalize_single_school_structure_flag()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_table_name = 'school_years' and new.is_current then
    update public.school_years set is_current = false
    where school_id = new.school_id and id <> new.id and is_current;
  elsif tg_table_name = 'school_locations' and new.is_main and new.is_active then
    update public.school_locations set is_main = false
    where school_id = new.school_id and id <> new.id and is_main;
  end if;
  return new;
end;
$$;

create trigger normalize_current_school_year before insert or update on public.school_years
for each row execute function public.normalize_single_school_structure_flag();
create trigger normalize_main_school_location before insert or update on public.school_locations
for each row execute function public.normalize_single_school_structure_flag();

-- Reject cross-school references even when a UUID is known.
create or replace function public.validate_school_structure_reference()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  reference_school_id uuid;
  year_start date;
  year_end date;
begin
  if tg_table_name = 'school_periods' then
    select school_id, starts_on, ends_on into reference_school_id, year_start, year_end
    from public.school_years where id = new.school_year_id;
    if reference_school_id is distinct from new.school_id then
      raise exception 'De periode en het schooljaar moeten bij dezelfde school horen';
    end if;
    if new.starts_on < year_start or new.ends_on > year_end then
      raise exception 'De periode moet volledig binnen het schooljaar vallen';
    end if;
  elsif tg_table_name in ('school_classes', 'teaching_groups') then
    select school_id into reference_school_id from public.school_years where id = new.school_year_id;
    if reference_school_id is distinct from new.school_id then
      raise exception 'Het schooljaar hoort niet bij deze school';
    end if;
  end if;

  if tg_table_name = 'school_classes' then
    if new.programme_id is not null and not exists (
      select 1 from public.education_programmes where id = new.programme_id and school_id = new.school_id
    ) then raise exception 'De opleiding hoort niet bij deze school'; end if;
    if new.location_id is not null and not exists (
      select 1 from public.school_locations where id = new.location_id and school_id = new.school_id
    ) then raise exception 'De locatie hoort niet bij deze school'; end if;
  elsif tg_table_name = 'teaching_groups' then
    if new.subject_id is not null and not exists (
      select 1 from public.subjects where id = new.subject_id and school_id = new.school_id
    ) then raise exception 'Het vak hoort niet bij deze school'; end if;
    if new.base_class_id is not null and not exists (
      select 1 from public.school_classes where id = new.base_class_id and school_id = new.school_id
        and school_year_id = new.school_year_id
    ) then raise exception 'De basisklas hoort niet bij deze school en dit schooljaar'; end if;
    if new.location_id is not null and not exists (
      select 1 from public.school_locations where id = new.location_id and school_id = new.school_id
    ) then raise exception 'De locatie hoort niet bij deze school'; end if;
  end if;
  return new;
end;
$$;

create trigger validate_school_period before insert or update on public.school_periods
for each row execute function public.validate_school_structure_reference();
create trigger validate_school_class before insert or update on public.school_classes
for each row execute function public.validate_school_structure_reference();
create trigger validate_teaching_group before insert or update on public.teaching_groups
for each row execute function public.validate_school_structure_reference();

create or replace function public.set_school_structure_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;

create or replace function public.prevent_school_id_change()
returns trigger language plpgsql as $$
begin
  if new.school_id is distinct from old.school_id then
    raise exception 'Een bestaand record kan niet naar een andere school worden verplaatst';
  end if;
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'school_years','school_periods','school_locations','education_programmes',
    'subjects','school_classes','teaching_groups'
  ] loop
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_school_structure_updated_at()', table_name, table_name);
    execute format('create trigger protect_%I_school before update on public.%I for each row execute function public.prevent_school_id_change()', table_name, table_name);
    execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function public.write_admin_audit_log()', table_name, table_name);
  end loop;
end $$;

-- School users may read the structure when one of their stacked roles allows it.
-- Writes are allowed only with the explicit manage permission; platform admins always pass.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'school_years','school_periods','school_locations','education_programmes',
    'subjects','school_classes','teaching_groups'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and (public.has_permission(''school_settings.view'') or public.has_permission(''classes.view''))))',
      'read_' || table_name, table_name
    );
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and (public.has_permission(''school_settings.manage'') or public.has_permission(''classes.manage''))))',
      'insert_' || table_name, table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and (public.has_permission(''school_settings.manage'') or public.has_permission(''classes.manage'')))) with check (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and (public.has_permission(''school_settings.manage'') or public.has_permission(''classes.manage''))))',
      'update_' || table_name, table_name
    );
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and (public.has_permission(''school_settings.manage'') or public.has_permission(''classes.manage''))))',
      'delete_' || table_name, table_name
    );
    if not exists (
      select 1 from pg_publication_tables where pubname = 'supabase_realtime'
        and schemaname = 'public' and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end $$;

-- Directors can inspect the structure. Editing remains an explicit, separately assignable right.
insert into public.role_permissions(role_id, permission_key, scope)
select r.id, p.key, 'school'
from public.school_roles r
join public.permission_definitions p on p.key in ('school_settings.view', 'classes.view')
where r.legacy_key = 'school_admin'
on conflict (role_id, permission_key) do nothing;
