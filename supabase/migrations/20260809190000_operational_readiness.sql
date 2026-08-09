-- Operational readiness: user settings, durable document versions and auditable imports.

create table if not exists public.profile_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  school_id uuid references public.schools(id) on delete cascade,
  display_name text,
  notification_email boolean not null default true,
  notification_in_app boolean not null default true,
  notification_digest text not null default 'direct' check (notification_digest in ('direct','daily','weekly','off')),
  locale text not null default 'nl-NL',
  updated_at timestamptz not null default now()
);

create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  document_record_id uuid not null references public.app_records(id) on delete cascade,
  file_asset_id uuid not null references public.file_assets(id) on delete restrict,
  version_number integer not null check (version_number > 0),
  change_note text,
  created_by uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  created_at timestamptz not null default now(),
  unique (document_record_id, version_number),
  unique (file_asset_id)
);

create table if not exists public.import_batches (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  source_name text not null,
  source_type text not null check (source_type in ('csv','xlsx')),
  target_type text not null,
  mode text not null default 'append' check (mode in ('append','update')),
  status text not null default 'validated' check (status in ('validated','rejected','applied','rolled_back')),
  total_rows integer not null default 0 check (total_rows >= 0),
  valid_rows integer not null default 0 check (valid_rows >= 0),
  error_rows integer not null default 0 check (error_rows >= 0),
  validation_summary jsonb not null default '{}'::jsonb,
  rollback_snapshot jsonb not null default '[]'::jsonb,
  created_by uuid not null references public.profiles(id) on delete restrict default auth.uid(),
  created_at timestamptz not null default now(),
  applied_at timestamptz,
  rolled_back_at timestamptz,
  constraint import_batch_counts check (valid_rows + error_rows <= total_rows)
);

create table if not exists public.import_rows (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.import_batches(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  row_number integer not null check (row_number > 0),
  payload jsonb not null,
  errors text[] not null default '{}',
  applied_record_id uuid,
  created_at timestamptz not null default now(),
  unique (batch_id, row_number)
);

alter table public.profile_preferences enable row level security;
alter table public.document_versions enable row level security;
alter table public.import_batches enable row level security;
alter table public.import_rows enable row level security;

create policy profile_preferences_own on public.profile_preferences
  for all to authenticated
  using (profile_id = auth.uid() or public.is_platform_admin(auth.uid()))
  with check (profile_id = auth.uid() and school_id is not distinct from public.current_school_id());

create policy document_versions_read on public.document_versions
  for select to authenticated
  using (public.is_platform_admin(auth.uid()) or
    (school_id = public.current_school_id() and
      (public.has_permission('documents.view') or public.has_permission('documents.manage'))));
create policy document_versions_create on public.document_versions
  for insert to authenticated
  with check (school_id = public.current_school_id() and
    (public.has_permission('documents.create') or public.has_permission('documents.manage')));
create policy document_versions_delete on public.document_versions
  for delete to authenticated
  using (public.is_platform_admin(auth.uid()) or
    (school_id = public.current_school_id() and public.has_permission('documents.manage')));

create policy import_batches_read on public.import_batches
  for select to authenticated
  using (public.is_platform_admin(auth.uid()) or
    (school_id = public.current_school_id() and
      (public.has_permission('data_import.view') or public.has_permission('data_import.manage'))));
create policy import_batches_create on public.import_batches
  for insert to authenticated
  with check (school_id = public.current_school_id() and
    (public.has_permission('data_import.create') or public.has_permission('data_import.import') or public.has_permission('data_import.manage')));
create policy import_batches_update on public.import_batches
  for update to authenticated
  using (school_id = public.current_school_id() and
    (public.has_permission('data_import.update') or public.has_permission('data_import.manage')))
  with check (school_id = public.current_school_id());
create policy import_rows_read on public.import_rows
  for select to authenticated
  using (public.is_platform_admin(auth.uid()) or
    (school_id = public.current_school_id() and
      (public.has_permission('data_import.view') or public.has_permission('data_import.manage'))));
create policy import_rows_create on public.import_rows
  for insert to authenticated
  with check (school_id = public.current_school_id() and
    (public.has_permission('data_import.create') or public.has_permission('data_import.import') or public.has_permission('data_import.manage')));

create index if not exists idx_document_versions_document on public.document_versions(document_record_id, version_number desc);
create index if not exists idx_import_batches_school on public.import_batches(school_id, created_at desc);
create index if not exists idx_import_rows_batch on public.import_rows(batch_id, row_number);

create or replace function public.next_document_version(_document_record_id uuid)
returns integer language sql stable security invoker set search_path = public
as $$
  select coalesce(max(version_number), 0) + 1
  from public.document_versions
  where document_record_id = _document_record_id;
$$;

create or replace function public.mark_import_rolled_back(_batch_id uuid)
returns void language plpgsql security invoker set search_path = public
as $$
begin
  update public.import_batches
  set status = 'rolled_back', rolled_back_at = now()
  where id = _batch_id and school_id = public.current_school_id() and status = 'applied';
  if not found then raise exception 'Import bestaat niet, hoort bij een andere school of kan niet worden teruggedraaid'; end if;
end;
$$;

grant select, insert, update on public.profile_preferences to authenticated;
grant select, insert, delete on public.document_versions to authenticated;
grant select, insert, update on public.import_batches to authenticated;
grant select, insert on public.import_rows to authenticated;
grant execute on function public.next_document_version(uuid) to authenticated;
grant execute on function public.mark_import_rolled_back(uuid) to authenticated;
