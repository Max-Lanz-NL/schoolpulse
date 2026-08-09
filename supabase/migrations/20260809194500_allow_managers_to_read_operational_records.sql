drop policy if exists document_versions_read on public.document_versions;
create policy document_versions_read on public.document_versions for select to authenticated
using (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and
  (public.has_permission('documents.view') or public.has_permission('documents.manage'))));

drop policy if exists import_batches_read on public.import_batches;
create policy import_batches_read on public.import_batches for select to authenticated
using (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and
  (public.has_permission('data_import.view') or public.has_permission('data_import.manage'))));

drop policy if exists import_rows_read on public.import_rows;
create policy import_rows_read on public.import_rows for select to authenticated
using (public.is_platform_admin(auth.uid()) or (school_id = public.current_school_id() and
  (public.has_permission('data_import.view') or public.has_permission('data_import.manage'))));
