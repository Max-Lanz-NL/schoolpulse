-- Production operations for timetable, attendance, communication, assessment,
-- student support, integrations and payments. No example records are inserted.

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  location_id uuid references public.school_locations(id) on delete set null,
  code text not null,
  name text not null,
  capacity integer check (capacity is null or capacity > 0),
  room_type text not null default 'classroom',
  is_accessible boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (school_id, code)
);

create table public.timetable_entries (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  school_year_id uuid not null references public.school_years(id) on delete restrict,
  teaching_group_id uuid not null references public.teaching_groups(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  teacher_profile_id uuid references public.profiles(id) on delete set null,
  room_id uuid references public.rooms(id) on delete set null,
  starts_at timestamptz not null, ends_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('draft','scheduled','changed','cancelled','completed')),
  note text, created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index timetable_entries_group_time on public.timetable_entries(teaching_group_id, starts_at);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  timetable_entry_id uuid not null references public.timetable_entries(id) on delete cascade,
  student_profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'present' check (status in ('present','late','absent','excused','remote')),
  minutes_late integer not null default 0 check (minutes_late >= 0),
  note text, recorded_by uuid not null default auth.uid() references public.profiles(id),
  recorded_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (timetable_entry_id, student_profile_id)
);

create table public.absence_requests (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_profile_id uuid not null references public.profiles(id) on delete cascade,
  reported_by uuid not null default auth.uid() references public.profiles(id),
  starts_at timestamptz not null, ends_at timestamptz not null,
  reason text not null,
  status text not null default 'submitted' check (status in ('draft','submitted','approved','rejected','cancelled')),
  reviewed_by uuid references public.profiles(id), reviewed_at timestamptz, review_note text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.substitutions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  timetable_entry_id uuid not null references public.timetable_entries(id) on delete cascade,
  original_teacher_id uuid references public.profiles(id), replacement_teacher_id uuid references public.profiles(id),
  status text not null default 'open' check (status in ('open','assigned','accepted','declined','cancelled')),
  note text, created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  subject text not null, kind text not null default 'direct' check (kind in ('direct','group','class','announcement')),
  created_by uuid not null default auth.uid() references public.profiles(id),
  closed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  participant_role text not null default 'member' check (participant_role in ('owner','member','observer')),
  last_read_at timestamptz, joined_at timestamptz not null default now(),
  primary key (conversation_id, profile_id)
);
create table public.messages (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null default auth.uid() references public.profiles(id), body text not null check (length(trim(body)) > 0),
  sent_at timestamptz not null default now(), edited_at timestamptz, deleted_at timestamptz
);
create index messages_conversation_time on public.messages(conversation_id, sent_at);

create table public.assignments (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  teaching_group_id uuid not null references public.teaching_groups(id) on delete cascade,
  subject_id uuid references public.subjects(id), title text not null, instructions text,
  assigned_at timestamptz not null default now(), due_at timestamptz,
  status text not null default 'draft' check (status in ('draft','published','closed','archived')),
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.assignment_submissions (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_profile_id uuid not null references public.profiles(id) on delete cascade,
  body text, storage_path text, submitted_at timestamptz,
  status text not null default 'draft' check (status in ('draft','submitted','returned','accepted')),
  feedback text, reviewed_by uuid references public.profiles(id), reviewed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assignment_id, student_profile_id)
);

create table public.file_assets (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  owner_id uuid not null default auth.uid() references public.profiles(id),
  bucket text not null, storage_path text not null, file_name text not null, mime_type text, size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  visibility text not null default 'school' check (visibility in ('private','participants','school')),
  related_type text, related_id uuid, scan_status text not null default 'pending' check (scan_status in ('pending','clean','blocked','failed')),
  created_at timestamptz not null default now(), unique (bucket, storage_path)
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  teaching_group_id uuid not null references public.teaching_groups(id) on delete cascade,
  subject_id uuid references public.subjects(id), title text not null,
  assessment_type text not null default 'test', occurs_at timestamptz, maximum_score numeric(8,2), weight numeric(8,3) not null default 1 check (weight > 0),
  status text not null default 'draft' check (status in ('draft','scheduled','grading','published','cancelled')),
  created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.grades (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  student_profile_id uuid not null references public.profiles(id) on delete cascade,
  score numeric(8,2), grade numeric(5,2), is_excused boolean not null default false, note text,
  status text not null default 'draft' check (status in ('draft','published','corrected')),
  graded_by uuid not null default auth.uid() references public.profiles(id), graded_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (assessment_id, student_profile_id), check (grade is null or (grade >= 0 and grade <= 10))
);
create table public.student_reports (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  student_profile_id uuid not null references public.profiles(id) on delete cascade,
  school_year_id uuid not null references public.school_years(id), period_id uuid references public.school_periods(id),
  title text not null, summary text, status text not null default 'draft' check (status in ('draft','review','published','archived')),
  published_at timestamptz, created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.notifications (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  title text not null, body text, kind text not null default 'info', action_path text,
  read_at timestamptz, created_at timestamptz not null default now()
);

create table public.student_support_notes (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  student_profile_id uuid not null references public.profiles(id) on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles(id),
  category text not null default 'general', title text not null, body text not null,
  confidentiality text not null default 'support_team' check (confidentiality in ('mentor','support_team','leadership')),
  follow_up_at timestamptz, resolved_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.integration_connections (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  provider text not null check (provider in ('magister','somtoday','itslearning','microsoft_365','google_workspace','other')),
  display_name text not null, status text not null default 'unconfigured' check (status in ('unconfigured','connected','paused','error')),
  settings jsonb not null default '{}'::jsonb, vault_secret_id uuid,
  last_checked_at timestamptz, created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (school_id, provider, display_name)
);
create table public.integration_sync_runs (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  connection_id uuid not null references public.integration_connections(id) on delete cascade,
  direction text not null default 'import' check (direction in ('import','export','bidirectional')),
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed','cancelled')),
  started_at timestamptz, finished_at timestamptz, records_processed integer not null default 0, error_summary text,
  created_at timestamptz not null default now()
);

create table public.payment_requests (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  student_profile_id uuid references public.profiles(id) on delete set null,
  payer_profile_id uuid references public.profiles(id) on delete set null,
  title text not null, description text, amount_cents integer not null check (amount_cents > 0), currency char(3) not null default 'EUR', due_on date,
  status text not null default 'draft' check (status in ('draft','open','paid','expired','cancelled','refunded')),
  provider text, provider_reference text, created_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.payment_transactions (
  id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade,
  payment_request_id uuid not null references public.payment_requests(id) on delete restrict,
  provider text not null, provider_transaction_id text not null, amount_cents integer not null check (amount_cents > 0),
  status text not null check (status in ('pending','paid','failed','cancelled','refunded')),
  processed_at timestamptz, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(),
  unique (provider, provider_transaction_id)
);

-- Extend the central permission library so platform management can switch every
-- new production capability on or off per school role.
insert into public.permission_definitions
  (key,category,category_label,action,action_label,description,risk_level,allowed_scopes,sort_order)
select 'payments.'||a.action,'payments','Betalingen en betaalverzoeken',a.action,a.label,
  a.label||' binnen betalingen en betaalverzoeken.',
  case when a.action in ('delete','export','manage') then 'critical' when a.action in ('update','approve') then 'sensitive' else 'normal' end,
  array['own','assigned','team','school']::text[],350+row_number() over ()
from (values ('view','Bekijken'),('create','Aanmaken'),('update','Aanpassen'),('delete','Verwijderen'),('approve','Goedkeuren'),('export','Exporteren'),('manage','Volledig beheren')) a(action,label)
on conflict (key) do update set category_label=excluded.category_label,action_label=excluded.action_label,
  description=excluded.description,risk_level=excluded.risk_level,allowed_scopes=excluded.allowed_scopes,sort_order=excluded.sort_order;

insert into public.role_permissions(role_id,permission_key,scope)
select r.id,p.permission_key,p.scope
from public.school_roles r
join (values
  ('student','notifications.view','own'),
  ('parent','notifications.view','own'),('parent','payments.view','own'),
  ('teacher','notifications.view','own'),
  ('school_admin','notifications.view','school'),('school_admin','payments.view','school')
) p(legacy_key,permission_key,scope) on p.legacy_key=r.legacy_key
on conflict (role_id,permission_key) do nothing;

-- Validate every tenant reference before data reaches the tables.
create or replace function public.validate_operation_reference() returns trigger language plpgsql set search_path=public as $$
declare
  payload jsonb := to_jsonb(new);
  column_name text;
  target_table text;
  target_id uuid;
  belongs_to_school boolean;
begin
  if new.school_id is null then raise exception 'School is verplicht'; end if;

  foreach column_name in array array[
    'student_profile_id','teacher_profile_id','original_teacher_id','replacement_teacher_id',
    'sender_id','created_by','owner_id','recipient_id','author_id','graded_by','reviewed_by',
    'payer_profile_id','reported_by','recorded_by'
  ] loop
    if payload ? column_name and payload->>column_name is not null then
      target_id := (payload->>column_name)::uuid;
      select exists(
        select 1 from public.profiles
        where id=target_id and (
          school_id=new.school_id
          or (column_name in ('created_by','owner_id','author_id','graded_by','reviewed_by','reported_by','recorded_by')
            and public.is_platform_admin(target_id))
        )
      )
        into belongs_to_school;
      if not belongs_to_school then
        raise exception 'Het gekoppelde account in % hoort niet bij deze school', column_name;
      end if;
    end if;
  end loop;

  foreach column_name in array array[
    'location_id','school_year_id','period_id','teaching_group_id','subject_id','room_id',
    'timetable_entry_id','conversation_id','assignment_id','assessment_id','connection_id','payment_request_id'
  ] loop
    if payload ? column_name and payload->>column_name is not null then
      target_id := (payload->>column_name)::uuid;
      target_table := case column_name
        when 'location_id' then 'school_locations'
        when 'school_year_id' then 'school_years'
        when 'period_id' then 'school_periods'
        when 'teaching_group_id' then 'teaching_groups'
        when 'subject_id' then 'subjects'
        when 'room_id' then 'rooms'
        when 'timetable_entry_id' then 'timetable_entries'
        when 'conversation_id' then 'conversations'
        when 'assignment_id' then 'assignments'
        when 'assessment_id' then 'assessments'
        when 'connection_id' then 'integration_connections'
        when 'payment_request_id' then 'payment_requests'
      end;
      execute format('select exists(select 1 from public.%I where id=$1 and school_id=$2)', target_table)
        into belongs_to_school using target_id,new.school_id;
      if not belongs_to_school then
        raise exception 'De koppeling in % hoort niet bij deze school', column_name;
      end if;
    end if;
  end loop;
  return new;
end $$;

create or replace function public.validate_conversation_participant() returns trigger
language plpgsql set search_path=public as $$
begin
  if not exists (
    select 1 from public.conversations c join public.profiles p on p.id=new.profile_id
    where c.id=new.conversation_id and p.school_id=c.school_id
  ) then raise exception 'De deelnemer hoort niet bij de school van dit gesprek'; end if;
  return new;
end $$;

do $$ declare t text; begin
  foreach t in array array['rooms','timetable_entries','attendance_records','absence_requests','substitutions','conversations','messages','assignments','assignment_submissions','file_assets','assessments','grades','student_reports','notifications','student_support_notes','integration_connections','integration_sync_runs','payment_requests','payment_transactions'] loop
    execute format('create trigger protect_%I_school before update on public.%I for each row execute function public.prevent_school_id_change()',t,t);
    execute format('create trigger validate_%I_reference before insert or update on public.%I for each row execute function public.validate_operation_reference()',t,t);
    execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function public.write_admin_audit_log()',t,t);
    execute format('alter table public.%I enable row level security',t);
  end loop;
  foreach t in array array['rooms','timetable_entries','attendance_records','absence_requests','substitutions','conversations','assignments','assignment_submissions','assessments','grades','student_reports','student_support_notes','integration_connections','payment_requests'] loop
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_school_structure_updated_at()',t,t);
  end loop;
end $$;
alter table public.conversation_participants enable row level security;
create trigger validate_conversation_participant before insert or update on public.conversation_participants
for each row execute function public.validate_conversation_participant();

create or replace function public.can_access_group(_group_id uuid, _user_id uuid default auth.uid()) returns boolean
language sql stable security definer set search_path=public as $$
  select (_user_id=auth.uid() or public.is_platform_admin(auth.uid())) and (
    public.is_platform_admin(_user_id)
    or exists(select 1 from public.teacher_group_assignments where teaching_group_id=_group_id and teacher_profile_id=_user_id)
    or exists(select 1 from public.student_group_memberships where teaching_group_id=_group_id and student_profile_id=_user_id and status='active')
    or exists(select 1 from public.student_group_memberships gm join public.guardian_student_links gl on gl.student_profile_id=gm.student_profile_id and gl.is_active where gm.teaching_group_id=_group_id and gl.guardian_profile_id=_user_id and gm.status='active')
    or exists(select 1 from public.teaching_groups g where g.id=_group_id and g.school_id=public.current_school_id() and (public.has_permission('classes.view') or public.has_permission('school_settings.view')))
  )
$$;

create or replace function public.is_conversation_participant(_conversation_id uuid, _user_id uuid default auth.uid()) returns boolean
language sql stable security definer set search_path=public as $$
  select (_user_id=auth.uid() or public.is_platform_admin(auth.uid())) and (
    public.is_platform_admin(_user_id) or exists (
      select 1 from public.conversation_participants where conversation_id=_conversation_id and profile_id=_user_id
    )
  )
$$;
create or replace function public.owns_conversation(_conversation_id uuid, _user_id uuid default auth.uid()) returns boolean
language sql stable security definer set search_path=public as $$
  select (_user_id=auth.uid() or public.is_platform_admin(auth.uid())) and (
    public.is_platform_admin(_user_id) or exists (
      select 1 from public.conversations where id=_conversation_id and created_by=_user_id
    )
  )
$$;

-- School-wide configuration and operational policies.
create policy rooms_read on public.rooms for select to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and public.has_permission('schedule.view')));
create policy rooms_manage on public.rooms for all to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and public.has_permission('schedule.manage'))) with check (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and public.has_permission('schedule.manage')));
create policy timetable_read on public.timetable_entries for select to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and public.can_access_group(teaching_group_id)));
create policy timetable_manage on public.timetable_entries for all to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and (public.has_permission('schedule.create') or public.has_permission('schedule.update') or public.has_permission('schedule.manage')))) with check (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and (public.has_permission('schedule.create') or public.has_permission('schedule.update') or public.has_permission('schedule.manage'))));
create policy attendance_read on public.attendance_records for select to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and public.can_access_student(student_profile_id,'attendance.view')));
create policy attendance_manage on public.attendance_records for all to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and (public.has_permission('attendance.create') or public.has_permission('attendance.update')))) with check (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and (public.has_permission('attendance.create') or public.has_permission('attendance.update'))));
create policy absence_read on public.absence_requests for select to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and public.can_access_student(student_profile_id,'absences.view')));
create policy absence_create on public.absence_requests for insert to authenticated with check (school_id=public.current_school_id() and reported_by=auth.uid() and public.can_access_student(student_profile_id,'absences.create'));
create policy absence_manage on public.absence_requests for update to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and (public.has_permission('absences.update') or public.has_permission('absences.approve')))) with check (public.is_platform_admin(auth.uid()) or school_id=public.current_school_id());
create policy substitution_read on public.substitutions for select to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and public.has_permission('substitutions.view')));
create policy substitution_manage on public.substitutions for all to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and (public.has_permission('substitutions.create') or public.has_permission('substitutions.update')))) with check (public.is_platform_admin(auth.uid()) or school_id=public.current_school_id());

create policy conversations_read on public.conversations for select to authenticated using (public.is_conversation_participant(id));
create policy conversations_create on public.conversations for insert to authenticated with check (school_id=public.current_school_id() and created_by=auth.uid() and public.has_permission('messages.create'));
create policy conversations_update on public.conversations for update to authenticated using (public.is_platform_admin(auth.uid()) or created_by=auth.uid()) with check (public.is_platform_admin(auth.uid()) or created_by=auth.uid());
create policy participants_read on public.conversation_participants for select to authenticated using (public.is_platform_admin(auth.uid()) or profile_id=auth.uid() or public.owns_conversation(conversation_id));
create policy participants_manage on public.conversation_participants for all to authenticated using (public.owns_conversation(conversation_id)) with check (public.owns_conversation(conversation_id));
create policy messages_read on public.messages for select to authenticated using (public.is_conversation_participant(conversation_id));
create policy messages_create on public.messages for insert to authenticated with check (sender_id=auth.uid() and school_id=public.current_school_id() and public.is_conversation_participant(conversation_id));
create policy messages_update on public.messages for update to authenticated using (sender_id=auth.uid()) with check (sender_id=auth.uid());

create policy assignments_read on public.assignments for select to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and public.can_access_group(teaching_group_id)));
create policy assignments_manage on public.assignments for all to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and (created_by=auth.uid() or public.has_permission('assignments.update')))) with check (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and public.has_permission('assignments.create')));
create policy submissions_read on public.assignment_submissions for select to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and public.can_access_student(student_profile_id,'assignments.view')));
create policy submissions_manage on public.assignment_submissions for all to authenticated using (public.is_platform_admin(auth.uid()) or student_profile_id=auth.uid() or (school_id=public.current_school_id() and public.has_permission('assignments.update'))) with check (public.is_platform_admin(auth.uid()) or student_profile_id=auth.uid() or (school_id=public.current_school_id() and public.has_permission('assignments.update')));
create policy files_read on public.file_assets for select to authenticated using (public.is_platform_admin(auth.uid()) or owner_id=auth.uid() or (school_id=public.current_school_id() and visibility='school' and public.has_permission('documents.view')));
create policy files_manage on public.file_assets for all to authenticated using (public.is_platform_admin(auth.uid()) or owner_id=auth.uid()) with check (public.is_platform_admin(auth.uid()) or (owner_id=auth.uid() and school_id=public.current_school_id()));

create policy assessments_read on public.assessments for select to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and public.can_access_group(teaching_group_id)));
create policy assessments_manage on public.assessments for all to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and (created_by=auth.uid() or public.has_permission('tests.update')))) with check (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and public.has_permission('tests.create')));
create policy grades_read on public.grades for select to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and status<>'draft' and public.can_access_student(student_profile_id,'grades.view')) or (school_id=public.current_school_id() and public.has_permission('grades.create')));
create policy grades_manage on public.grades for all to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and (graded_by=auth.uid() or public.has_permission('grades.update')))) with check (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and public.has_permission('grades.create')));
create policy reports_read on public.student_reports for select to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and status='published' and public.can_access_student(student_profile_id,'reports.view')) or (school_id=public.current_school_id() and public.has_permission('reports.create')));
create policy reports_manage on public.student_reports for all to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and (public.has_permission('reports.create') or public.has_permission('reports.update')))) with check (public.is_platform_admin(auth.uid()) or school_id=public.current_school_id());
create policy notifications_read on public.notifications for select to authenticated using (public.is_platform_admin(auth.uid()) or recipient_id=auth.uid());
create policy notifications_update on public.notifications for update to authenticated using (recipient_id=auth.uid()) with check (recipient_id=auth.uid());
create policy notifications_create on public.notifications for insert to authenticated with check (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and public.has_permission('announcements.create')));

create policy support_read on public.student_support_notes for select to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and public.can_access_student(student_profile_id,'care.view')));
create policy support_manage on public.student_support_notes for all to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and (author_id=auth.uid() or public.has_permission('care.update')))) with check (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and public.has_permission('care.create')));
create policy integrations_admin on public.integration_connections for all to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and public.has_permission('integrations.view'))) with check (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and (public.has_permission('integrations.create') or public.has_permission('integrations.update'))));
create policy sync_admin on public.integration_sync_runs for all to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and public.has_permission('integrations.view'))) with check (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and public.has_permission('integrations.update')));
create policy payments_read on public.payment_requests for select to authenticated using (public.is_platform_admin(auth.uid()) or payer_profile_id=auth.uid() or student_profile_id=auth.uid() or (school_id=public.current_school_id() and public.has_permission('payments.view')));
create policy payments_manage on public.payment_requests for all to authenticated using (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and public.has_permission('payments.manage'))) with check (public.is_platform_admin(auth.uid()) or (school_id=public.current_school_id() and (public.has_permission('payments.create') or public.has_permission('payments.manage'))));
create policy transactions_read on public.payment_transactions for select to authenticated using (public.is_platform_admin(auth.uid()) or exists(select 1 from public.payment_requests pr where pr.id=payment_request_id and (pr.payer_profile_id=auth.uid() or pr.student_profile_id=auth.uid() or (pr.school_id=public.current_school_id() and public.has_permission('payments.view')))));
create policy transactions_platform on public.payment_transactions for all to authenticated using (public.is_platform_admin(auth.uid())) with check (public.is_platform_admin(auth.uid()));

-- Safe, read-only feed used by app.schoolpulse.nl. Source-table RLS remains active.
create or replace view public.production_module_items with (security_invoker=true) as
select t.id,t.school_id,'schedule'::text entity_type,coalesce(s.name,'Les') title,coalesce(g.name,'')||coalesce(' · '||r.code,'') description,t.starts_at event_at,t.status,t.updated_at from public.timetable_entries t left join public.subjects s on s.id=t.subject_id join public.teaching_groups g on g.id=t.teaching_group_id left join public.rooms r on r.id=t.room_id
union all select a.id,a.school_id,'attendance',coalesce(p.full_name,p.email),a.status||case when a.minutes_late>0 then ' · '||a.minutes_late||' min te laat' else '' end,t.starts_at,a.status,a.updated_at from public.attendance_records a join public.profiles p on p.id=a.student_profile_id join public.timetable_entries t on t.id=a.timetable_entry_id
union all select id,school_id,'absence',reason,'Absentiemelding',starts_at,status,updated_at from public.absence_requests
union all select m.id,m.school_id,'message',c.subject,left(m.body,240),m.sent_at,case when m.deleted_at is null then 'sent' else 'deleted' end,coalesce(m.edited_at,m.sent_at) from public.messages m join public.conversations c on c.id=m.conversation_id
union all select id,school_id,'assignment',title,instructions,due_at,status,updated_at from public.assignments
union all select id,school_id,'document',file_name,coalesce(mime_type,'Bestand'),created_at,scan_status,created_at from public.file_assets
union all select id,school_id,'test',title,assessment_type,occurs_at,status,updated_at from public.assessments
union all select g.id,g.school_id,'grade',a.title,coalesce('Cijfer '||g.grade::text,'Score '||g.score::text),g.graded_at,g.status,g.updated_at from public.grades g join public.assessments a on a.id=g.assessment_id
union all select id,school_id,'report',title,summary,published_at,status,updated_at from public.student_reports
union all select id,school_id,'conversation',subject,kind,created_at,case when closed_at is null then 'open' else 'closed' end,updated_at from public.conversations
union all select id,school_id,'substitution','Vervanging',note,created_at,status,updated_at from public.substitutions
union all select id,school_id,'notification',title,body,created_at,case when read_at is null then 'unread' else 'read' end,coalesce(read_at,created_at) from public.notifications
union all select id,school_id,'care',title,body,follow_up_at,case when resolved_at is null then 'open' else 'resolved' end,updated_at from public.student_support_notes
union all select id,school_id,'integration',display_name,provider,last_checked_at,status,updated_at from public.integration_connections
union all select id,school_id,'payment',title,description,due_on::timestamptz,status,updated_at from public.payment_requests
union all select id,school_id,entity_type,title,description,event_at,status,updated_at from public.app_records where entity_type in ('activity','homework','study_planner','agenda','consent','privacy','data_import','user_management','student','staff');

grant select on public.production_module_items to authenticated;
grant execute on function public.can_access_group(uuid,uuid) to authenticated;
grant execute on function public.is_conversation_participant(uuid,uuid) to authenticated;
grant execute on function public.owns_conversation(uuid,uuid) to authenticated;

do $$ declare t text; begin
  foreach t in array array['rooms','timetable_entries','attendance_records','absence_requests','substitutions','conversations','conversation_participants','messages','assignments','assignment_submissions','file_assets','assessments','grades','student_reports','notifications','student_support_notes','integration_connections','integration_sync_runs','payment_requests','payment_transactions'] loop
    execute format('grant select,insert,update,delete on public.%I to authenticated',t);
  end loop;
end $$;

do $$ declare t text; begin
  foreach t in array array['timetable_entries','attendance_records','absence_requests','messages','assignments','assignment_submissions','assessments','grades','student_reports','notifications','student_support_notes','payment_requests'] loop
    begin execute format('alter publication supabase_realtime add table public.%I',t); exception when duplicate_object then null; end;
  end loop;
end $$;

-- Integration credentials belong in Supabase Vault; browser clients only see settings and status.
comment on column public.integration_connections.vault_secret_id is 'Reference to a secret in Supabase Vault; never store credentials in settings.';
comment on table public.payment_transactions is 'Provider references only; raw card or bank credentials are forbidden.';
