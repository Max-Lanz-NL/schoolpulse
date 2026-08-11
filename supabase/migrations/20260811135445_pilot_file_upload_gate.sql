-- One server-authoritative, fail-closed switch for every normal file upload.
-- Only trusted database operators may change this row. Production stays false
-- until the external private malware scanner has passed its acceptance gate.
create table public.runtime_feature_flags (
  singleton boolean primary key default true check (singleton),
  file_uploads_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.runtime_feature_flags(singleton, file_uploads_enabled)
values (true, false)
on conflict (singleton) do nothing;

alter table public.runtime_feature_flags enable row level security;
revoke all on table public.runtime_feature_flags from public, anon, authenticated;

create or replace function public.file_uploads_enabled()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select flags.file_uploads_enabled
       from public.runtime_feature_flags flags
      where flags.singleton),
    false
  )
$$;

revoke all on function public.file_uploads_enabled() from public, anon;
grant execute on function public.file_uploads_enabled() to authenticated;

drop policy if exists files_insert on public.file_assets;
create policy files_insert
on public.file_assets for insert to authenticated
with check (
  public.file_uploads_enabled()
  and school_id = public.current_school_id()
  and owner_id = auth.uid()
  and bucket = 'school-files'
  and scan_status = 'pending'
);

drop policy if exists school_files_insert on storage.objects;
create policy school_files_insert
on storage.objects for insert to authenticated
with check (
  public.file_uploads_enabled()
  and bucket_id = 'school-files'
  and (storage.foldername(name))[1] = public.current_school_id()::text
  and (storage.foldername(name))[2] = auth.uid()::text
  and (
    public.has_permission('documents.create')
    or public.has_permission('documents.manage')
    or (
      (storage.foldername(name))[3] = 'submissions'
      and exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'student'
      )
    )
  )
);

-- Replacing an existing object is also an upload and must obey the same gate.
drop policy if exists school_files_update on storage.objects;
create policy school_files_update
on storage.objects for update to authenticated
using (
  public.file_uploads_enabled()
  and bucket_id = 'school-files'
  and owner_id = auth.uid()::text
)
with check (
  public.file_uploads_enabled()
  and bucket_id = 'school-files'
  and (storage.foldername(name))[1] = public.current_school_id()::text
  and (storage.foldername(name))[2] = auth.uid()::text
);

notify pgrst, 'reload schema';
