create table if not exists public.app_records (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  entity_type text not null check (length(entity_type) between 1 and 80),
  title text not null check (length(title) between 1 and 240),
  description text,
  event_at timestamptz,
  status text not null default 'active' check (length(status) between 1 and 40),
  payload jsonb not null default '{}'::jsonb,
  created_by uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_app_records_school_entity
  on public.app_records (school_id, entity_type, event_at);

alter table public.app_records enable row level security;

create or replace function public.current_school_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select school_id from public.profiles where id = auth.uid();
$$;
create or replace function public.can_manage_school_data()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('platform_admin', 'school_admin', 'teacher')
  );
$$;

drop policy if exists "Authorized users can read their school data" on public.app_records;
create policy "Authorized users can read their school data"
  on public.app_records for select
  using (school_id = public.current_school_id() or public.is_platform_admin(auth.uid()));

drop policy if exists "School staff can insert school data" on public.app_records;
create policy "School staff can insert school data"
  on public.app_records for insert
  with check (
    public.can_manage_school_data()
    and (school_id = public.current_school_id() or public.is_platform_admin(auth.uid()))
    and created_by = auth.uid()
  );

drop policy if exists "School staff can update school data" on public.app_records;
create policy "School staff can update school data"
  on public.app_records for update
  using (public.can_manage_school_data() and (school_id = public.current_school_id() or public.is_platform_admin(auth.uid())))
  with check (public.can_manage_school_data() and (school_id = public.current_school_id() or public.is_platform_admin(auth.uid())));

drop policy if exists "School staff can delete school data" on public.app_records;
create policy "School staff can delete school data"
  on public.app_records for delete
  using (public.can_manage_school_data() and (school_id = public.current_school_id() or public.is_platform_admin(auth.uid())));

create or replace function public.set_app_record_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_app_records_updated_at on public.app_records;
create trigger trg_app_records_updated_at
  before update on public.app_records
  for each row execute function public.set_app_record_updated_at();

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'app_records'
  ) then
    alter publication supabase_realtime add table public.app_records;
  end if;
end
$$;
