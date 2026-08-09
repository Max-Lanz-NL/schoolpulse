# Phase 1 — Identity, School and People

## Production data flow

`Phase1Directory` uses domain hooks, services and Supabase. It never imports demo data. RLS and database validation remain authoritative.

- Identity: authenticated user, profile, current school, assigned and primary roles, effective permissions, rank, scopes and preferences.
- School: school, current year, periods, locations, programmes, subjects, classes, groups and rooms.
- People: pupils, staff, enrolments, guardians, teacher subjects/groups and pupil group memberships.

## Writes

Typed write services target only specialised tables. The existing platform structure and relation editors already use these tables. Generic `app_records` writes, status changes and deletion are blocked for Phase 1 entities. School-user write forms still require manual role acceptance before Phase 1 can be marked `DONE`.

## Security verification

Migration `20260809180724_phase1_identity_school_people_security.sql` adds explicit Data API grants, own-school access to the school record, room policies appropriate for School and scoped execute access for relevant authorization functions.

`supabase/tests/phase1_identity_school_people_rls.test.sql` creates two schools with admins, teachers and pupils inside a rollback-only transaction. Its 24 assertions cover cross-school reads and representative insert, update and delete behavior for profiles, classes, pupils, staff and enrolments, plus student and teacher scopes.

## Remaining P0

- Apply and re-run the migration and tests in the deployment pipeline before production rollout.
- Complete the repository-wide audit of security-definer functions outside Phase 1.
- Manually verify Phase 1 write forms per role on phone, tablet and desktop.
- Enforce MFA for privileged roles and test account-session revocation.
