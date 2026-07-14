-- Make the production schema easier to inspect without rewriting migration history.
-- Views use the caller's permissions, so existing Row Level Security remains authoritative.

comment on schema public is 'Schoolpulse production data, isolated per school through Row Level Security.';
comment on table public.schools is 'Tenants (schools) using Schoolpulse.';
comment on table public.profiles is 'Application profile belonging to an authenticated user.';
comment on table public.school_roles is 'School-specific roles; accounts may receive multiple roles.';
comment on table public.role_permissions is 'Permission switches and scopes assigned to a school role.';
comment on table public.profile_role_assignments is 'Many-to-many role assignments for accounts within a school.';
comment on table public.permission_change_requests is 'Requests from school leadership for centrally managed role changes.';
comment on table public.student_records is 'School-specific student administration linked to a profile.';
comment on table public.staff_records is 'School-specific staff administration linked to a profile.';
comment on table public.integration_connections is 'Configuration metadata for external school integrations; secrets belong in Vault.';

create or replace view public.database_module_catalog
with (security_invoker = true)
as
select *
from (values
  ('core', 'Kern en accounts', array['schools','profiles','platform_accounts','admin_audit_logs']::text[], 'Scholen, accounts en platformbeheer'),
  ('authorization', 'Rollen en permissies', array['school_roles','permission_definitions','role_permissions','profile_role_assignments','permission_change_requests','permission_request_messages','role_templates']::text[], 'Centrale rolconfiguratie en wijzigingsverzoeken'),
  ('structure', 'Schoolinrichting', array['school_years','school_periods','school_locations','education_programmes','subjects','school_classes','teaching_groups','rooms']::text[], 'Jaren, locaties, opleidingen, vakken en groepen'),
  ('people', 'Personen en relaties', array['student_records','staff_records','student_enrolments','guardian_student_links','teacher_subject_assignments','teacher_group_assignments','student_group_memberships']::text[], 'Leerlingen, medewerkers, ouders en onderwijsrelaties'),
  ('education', 'Onderwijs', array['timetable_entries','attendance_records','absence_requests','substitutions','assignments','assignment_submissions','assessments','grades','student_reports']::text[], 'Rooster, aanwezigheid, opdrachten en resultaten'),
  ('communication', 'Communicatie en zorg', array['conversations','conversation_participants','messages','notifications','student_support_notes','file_assets']::text[], 'Berichten, meldingen, bestanden en leerlingondersteuning'),
  ('operations', 'Integraties en betalingen', array['integration_connections','integration_sync_runs','payment_requests','payment_transactions']::text[], 'Externe koppelingen, synchronisatie en betalingen')
) as modules(module_key, module_name, table_names, description);

comment on view public.database_module_catalog is 'Human-readable catalog of the Schoolpulse database modules.';
grant select on public.database_module_catalog to authenticated;

create or replace view public.school_data_summary
with (security_invoker = true)
as
select
  s.id as school_id,
  s.name as school_name,
  (select count(*) from public.profiles p where p.school_id = s.id) as account_count,
  (select count(*) from public.school_roles r where r.school_id = s.id) as role_count,
  (select count(*) from public.school_years y where y.school_id = s.id) as school_year_count,
  (select count(*) from public.school_classes c where c.school_id = s.id) as class_count,
  (select count(*) from public.teaching_groups g where g.school_id = s.id) as teaching_group_count,
  (select count(*) from public.student_records sr where sr.school_id = s.id) as student_count,
  (select count(*) from public.staff_records st where st.school_id = s.id) as staff_count,
  (select count(*) from public.assignments a where a.school_id = s.id) as assignment_count,
  (select count(*) from public.assessments a where a.school_id = s.id) as assessment_count,
  (select count(*) from public.conversations c where c.school_id = s.id) as conversation_count,
  (select count(*) from public.payment_requests p where p.school_id = s.id) as payment_request_count
from public.schools s;

comment on view public.school_data_summary is 'RLS-aware per-school counts for operational database checks.';
grant select on public.school_data_summary to authenticated;

-- PostgreSQL does not automatically index foreign-key columns. These tenant indexes
-- keep school-scoped RLS checks and administration screens predictable as data grows.
create index if not exists idx_profiles_school_id on public.profiles(school_id);
create index if not exists idx_school_roles_school_id on public.school_roles(school_id);
create index if not exists idx_permission_change_requests_school_id on public.permission_change_requests(school_id);
create index if not exists idx_school_locations_school_id on public.school_locations(school_id);
create index if not exists idx_education_programmes_school_id on public.education_programmes(school_id);
create index if not exists idx_subjects_school_id on public.subjects(school_id);
create index if not exists idx_student_records_school_id on public.student_records(school_id);
create index if not exists idx_staff_records_school_id on public.staff_records(school_id);
create index if not exists idx_student_enrolments_school_id on public.student_enrolments(school_id);
create index if not exists idx_guardian_student_links_school_id on public.guardian_student_links(school_id);
create index if not exists idx_teacher_subject_assignments_school_id on public.teacher_subject_assignments(school_id);
create index if not exists idx_teacher_group_assignments_school_id on public.teacher_group_assignments(school_id);
create index if not exists idx_student_group_memberships_school_id on public.student_group_memberships(school_id);
create index if not exists idx_rooms_school_id on public.rooms(school_id);
create index if not exists idx_timetable_entries_school_id on public.timetable_entries(school_id);
create index if not exists idx_attendance_records_school_id on public.attendance_records(school_id);
create index if not exists idx_absence_requests_school_id on public.absence_requests(school_id);
create index if not exists idx_substitutions_school_id on public.substitutions(school_id);
create index if not exists idx_conversations_school_id on public.conversations(school_id);
create index if not exists idx_messages_school_id on public.messages(school_id);
create index if not exists idx_assignments_school_id on public.assignments(school_id);
create index if not exists idx_assignment_submissions_school_id on public.assignment_submissions(school_id);
create index if not exists idx_file_assets_school_id on public.file_assets(school_id);
create index if not exists idx_assessments_school_id on public.assessments(school_id);
create index if not exists idx_grades_school_id on public.grades(school_id);
create index if not exists idx_student_reports_school_id on public.student_reports(school_id);
create index if not exists idx_notifications_school_id on public.notifications(school_id);
create index if not exists idx_student_support_notes_school_id on public.student_support_notes(school_id);
create index if not exists idx_integration_connections_school_id on public.integration_connections(school_id);
create index if not exists idx_integration_sync_runs_school_id on public.integration_sync_runs(school_id);
create index if not exists idx_payment_requests_school_id on public.payment_requests(school_id);
create index if not exists idx_payment_transactions_school_id on public.payment_transactions(school_id);
