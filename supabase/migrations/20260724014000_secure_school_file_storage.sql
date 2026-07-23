-- Private school file bucket. Database metadata and RLS decide who may read a
-- file; objects are never made public.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'school-files',
  'school-files',
  false,
  52428800,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/png',
    'image/jpeg',
    'image/webp'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists school_files_insert on storage.objects;
create policy school_files_insert
on storage.objects for insert to authenticated
with check (
  bucket_id = 'school-files'
  and (storage.foldername(name))[1] = public.current_school_id()::text
  and (storage.foldername(name))[2] = auth.uid()::text
  and (
    public.has_permission('documents.create')
    or public.has_permission('documents.manage')
    or public.is_platform_admin(auth.uid())
  )
);

drop policy if exists school_files_select on storage.objects;
create policy school_files_select
on storage.objects for select to authenticated
using (
  bucket_id = 'school-files'
  and exists (
    select 1
    from public.file_assets asset
    where asset.bucket = storage.objects.bucket_id
      and asset.storage_path = storage.objects.name
      and asset.school_id = public.current_school_id()
      and (
        asset.owner_id = auth.uid()
        or (
          asset.visibility = 'school'
          and asset.scan_status = 'clean'
          and public.has_permission('documents.view')
        )
      )
  )
);

drop policy if exists school_files_update on storage.objects;
create policy school_files_update
on storage.objects for update to authenticated
using (
  bucket_id = 'school-files'
  and owner_id = auth.uid()::text
)
with check (
  bucket_id = 'school-files'
  and (storage.foldername(name))[1] = public.current_school_id()::text
  and (storage.foldername(name))[2] = auth.uid()::text
);

drop policy if exists school_files_delete on storage.objects;
create policy school_files_delete
on storage.objects for delete to authenticated
using (
  bucket_id = 'school-files'
  and exists (
    select 1
    from public.file_assets asset
    where asset.bucket = storage.objects.bucket_id
      and asset.storage_path = storage.objects.name
      and asset.school_id = public.current_school_id()
      and (
        asset.owner_id = auth.uid()
        or public.has_permission('documents.delete')
        or public.has_permission('documents.manage')
        or public.is_platform_admin(auth.uid())
      )
  )
);
