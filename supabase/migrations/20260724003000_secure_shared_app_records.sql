-- Replace the original technical-role policies on app_records with permission-
-- and scope-aware policies. These records are the shared bridge for modules
-- that do not yet have a dedicated domain table.

alter table public.app_records
  add column if not exists owner_profile_id uuid references public.profiles(id) on delete set null,
  add column if not exists audience_profile_ids uuid[] not null default '{}'::uuid[],
  add column if not exists visibility text not null default 'private'
    check (visibility in ('private','assigned','team','school')),
  add column if not exists version integer not null default 1 check (version > 0);

update public.app_records
set owner_profile_id = created_by
where owner_profile_id is null;

create index if not exists idx_app_records_owner
  on public.app_records (school_id, owner_profile_id, entity_type);
create index if not exists idx_app_records_audience
  on public.app_records using gin (audience_profile_ids);

create or replace function public.app_record_permission_category(_entity_type text)
returns text
language sql
immutable
as $$
  select case _entity_type
    when 'grade' then 'grades'
    when 'message' then 'messages'
    when 'assignment' then 'assignments'
    when 'document' then 'documents'
    when 'activity' then 'activities'
    when 'student' then 'students'
    when 'parent_link' then 'parents'
    when 'absence' then 'absences'
    when 'conversation' then 'conversations'
    when 'consent' then 'consent'
    when 'test' then 'tests'
    when 'substitution' then 'substitutions'
    when 'data_import' then 'data_import'
    when 'user_management' then 'user_management'
    else _entity_type
  end
$$;

create or replace function public.can_view_app_record(
  _record public.app_records,
  _user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_platform_admin(_user_id)
    or (
      _record.school_id = (select school_id from public.profiles where id = _user_id)
      and (
        _record.created_by = _user_id
        or _record.owner_profile_id = _user_id
        or _user_id = any(_record.audience_profile_ids)
        or exists (
          select 1
          from public.effective_permissions(_user_id) permission
          where permission.permission_key =
            public.app_record_permission_category(_record.entity_type) || '.view'
            and (
              permission.scope = 'school'
              or (
                permission.scope = 'team'
                and _record.visibility in ('team','school')
              )
              or (
                permission.scope = 'assigned'
                and _record.visibility = 'assigned'
              )
            )
        )
      )
    )
$$;

create or replace function public.can_change_app_record(
  _record public.app_records,
  _action text,
  _user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_platform_admin(_user_id)
    or (
      _record.school_id = (select school_id from public.profiles where id = _user_id)
      and (
        public.has_permission(
          public.app_record_permission_category(_record.entity_type) || '.manage',
          _user_id
        )
        or public.has_permission(
          public.app_record_permission_category(_record.entity_type) || '.' || _action,
          _user_id
        )
      )
    )
$$;

drop policy if exists "Authorized users can read their school data" on public.app_records;
drop policy if exists "School staff can insert school data" on public.app_records;
drop policy if exists "School staff can update school data" on public.app_records;
drop policy if exists "School staff can delete school data" on public.app_records;

create policy app_records_select
  on public.app_records for select to authenticated
  using (public.can_view_app_record(app_records));

create policy app_records_insert
  on public.app_records for insert to authenticated
  with check (
    created_by = auth.uid()
    and school_id = public.current_school_id()
    and public.can_change_app_record(app_records, 'create')
  );

create policy app_records_update
  on public.app_records for update to authenticated
  using (public.can_change_app_record(app_records, 'update'))
  with check (
    school_id = public.current_school_id()
    and public.can_change_app_record(app_records, 'update')
  );

create policy app_records_delete
  on public.app_records for delete to authenticated
  using (public.can_change_app_record(app_records, 'delete'));

create or replace function public.set_app_record_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  new.version = old.version + 1;
  return new;
end;
$$;

grant execute on function public.can_view_app_record(public.app_records, uuid) to authenticated;
grant execute on function public.can_change_app_record(public.app_records, text, uuid) to authenticated;

