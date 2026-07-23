-- Complete the local workflow permissions for the production app.
-- This migration is additive: it preserves school-specific grants and only adds
-- actions that belong to the centrally maintained role templates.

with additions(template_key, scope, permissions) as (
  values
    (
      'student',
      'own',
      array[
        'agenda.view','notifications.view','reports.view'
      ]::text[]
    ),
    (
      'parent',
      'own',
      array[
        'absences.update','agenda.view','notifications.view','reports.view',
        'payments.view'
      ]::text[]
    ),
    (
      'teacher',
      'assigned',
      array[
        'grades.delete','grades.publish','tests.update','tests.delete','tests.publish',
        'tests.export','assignments.delete','assignments.publish','assignments.export',
        'homework.create','homework.update','homework.delete','homework.publish',
        'conversations.view','conversations.create','conversations.update',
        'documents.create','documents.update','reports.view'
      ]::text[]
    ),
    (
      'teacher',
      'own',
      array['notifications.view']::text[]
    ),
    (
      'mentor',
      'assigned',
      array[
        'conversations.update','reports.create','reports.update','care.create',
        'care.update','notifications.view'
      ]::text[]
    ),
    (
      'education_assistant',
      'assigned',
      array[
        'attendance.update','messages.create','notifications.view'
      ]::text[]
    ),
    (
      'instructor',
      'assigned',
      array[
        'assignments.update','tests.create','attendance.update','messages.create',
        'notifications.view'
      ]::text[]
    ),
    (
      'administration',
      'school',
      array[
        'students.manage','parents.manage','classes.update','conversations.view',
        'conversations.create','user_management.create','user_management.update',
        'user_management.deactivate','data_import.update','data_import.approve',
        'notifications.view'
      ]::text[]
    ),
    (
      'scheduler',
      'school',
      array[
        'notifications.view','notifications.create'
      ]::text[]
    ),
    (
      'care_coordinator',
      'assigned',
      array[
        'care.export','conversations.update','reports.create','reports.update',
        'notifications.view'
      ]::text[]
    ),
    (
      'quality_coordinator',
      'school',
      array[
        'reports.export','notifications.view'
      ]::text[]
    ),
    (
      'dean',
      'assigned',
      array[
        'conversations.update','agenda.create','agenda.update','reports.create',
        'notifications.view'
      ]::text[]
    ),
    (
      'exam_secretary',
      'school',
      array[
        'grades.update','grades.export','tests.delete','tests.export','reports.export',
        'notifications.view'
      ]::text[]
    ),
    (
      'confidential_adviser',
      'assigned',
      array[
        'conversations.update','incidents.approve','notifications.view'
      ]::text[]
    ),
    (
      'ict_coordinator',
      'school',
      array[
        'integrations.approve','security.update','notifications.view'
      ]::text[]
    ),
    (
      'team_leader',
      'team',
      array[
        'activities.create','activities.update','activities.delete','activities.approve',
        'activities.publish','activities.export','staff.update','conversations.create',
        'conversations.update','substitutions.create','substitutions.update',
        'substitutions.delete','substitutions.publish','reports.export',
        'documents.create','documents.update','notifications.view','notifications.create'
      ]::text[]
    ),
    (
      'deputy_director',
      'school',
      array[
        'activities.manage','staff.update','staff.approve','user_management.create',
        'user_management.update','user_management.deactivate','data_import.view',
        'data_import.create','data_import.update','data_import.approve','privacy.update',
        'privacy.approve','reports.export','notifications.view','notifications.create'
      ]::text[]
    ),
    (
      'director',
      'school',
      array[
        'activities.manage','staff.manage','user_management.manage','data_import.manage',
        'privacy.manage','reports.export','conversations.create','conversations.update',
        'documents.create','documents.update','documents.approve','integrations.view',
        'payments.view','payments.approve','notifications.view','notifications.manage'
      ]::text[]
    ),
    (
      'board_member',
      'school',
      array[
        'payments.view','notifications.view'
      ]::text[]
    )
),
valid_additions as (
  select additions.template_key, definition.key as permission_key, additions.scope
  from additions
  cross join lateral unnest(additions.permissions) requested_permission
  join public.permission_definitions definition on definition.key = requested_permission
  where additions.scope = any(definition.allowed_scopes)
)
insert into public.role_template_permissions(template_key, permission_key, scope)
select template_key, permission_key, scope
from valid_additions
on conflict (template_key, permission_key) do update set scope = excluded.scope;

-- Apply the same additions to roles that already exist at schools.
insert into public.role_permissions(role_id, permission_key, scope)
select role.id, template_permission.permission_key, template_permission.scope
from public.school_roles role
join public.role_template_permissions template_permission
  on template_permission.template_key = role.template_key
where role.template_key is not null
on conflict (role_id, permission_key) do nothing;

update public.role_templates
set version = version + 1, updated_at = now()
where key in (
  'student','parent','teacher','mentor','education_assistant','instructor',
  'administration','scheduler','care_coordinator','quality_coordinator','dean',
  'exam_secretary','confidential_adviser','ict_coordinator','team_leader',
  'deputy_director','director','board_member'
);
