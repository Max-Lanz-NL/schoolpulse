# SchoolPulse 1.0

## Scope

SchoolPulse 1.0 supports eight domains: Identity, School, People, Timetable, Attendance, Results, Learning and Dashboard. The goal is dependable daily education workflows, not feature parity with a full SIS.

## Architecture principles

1. One official typed data source per domain.
2. Domain UI -> query/hook -> service/repository -> Supabase -> RLS/database.
3. RLS and database validation are authoritative; UI permissions are UX only.
4. `demo.schoolpulse.nl` may use mock data; `app.schoolpulse.nl` uses production data only.
5. New 1.0 work does not use `app_records` when a typed model exists.
6. The dashboard owns no data.
7. Every phase changes only its domain and declared dependencies.
8. Preserve the current visual identity; accessibility and responsive reachability are required.

## Official sources

| Domain     | Official sources                                                                   |
| ---------- | ---------------------------------------------------------------------------------- |
| Identity   | Supabase Auth, `profiles`, role and permission tables                              |
| School     | `schools`, years, periods, locations, programmes, subjects, classes, groups, rooms |
| People     | student/staff records, enrolments, guardians and teaching memberships              |
| Timetable  | `timetable_entries`, `substitutions`                                               |
| Attendance | `attendance_records`, `absence_requests`                                           |
| Results    | `assessments`, `grades`                                                            |
| Learning   | `assignments`, `assignment_submissions`, `file_assets`                             |
| Dashboard  | Reads the other domain services; no own storage                                    |

Detailed contracts live under `src/domains/*/CONTRACT.md`. The legacy mapping is in `docs/APP_RECORDS_TRANSITION.md`.

## Status per domain

| Domain     | Reset status   | Functional 1.0 status                                                             |
| ---------- | -------------- | --------------------------------------------------------------------------------- |
| Identity   | READY FOR TEST | Typed identity context, roles, permissions, preferences and school user directory |
| School     | READY FOR TEST | Typed service/query layer and production overview; existing typed admin writes    |
| People     | READY FOR TEST | Typed pupils, staff, enrolments, guardians and teaching assignments               |
| Timetable  | READY FOR TEST | Typed week views, authorised maintenance, cancellations and manual substitutions  |
| Attendance | DONE           | Typed lesson registration, own-data view and absence processing accepted on staging |
| Results    | DONE           | Typed assessments, grade entry, publication and own-result views accepted         |
| Learning   | DONE           | Typed assignments, submissions and scan-gated private files accepted              |
| Dashboard  | NOT STARTED    | Current counts are transition records, not domain aggregation                     |

`DONE` means its Definition of Done scenarios and automated controls pass. No domain is marked DONE during this reset.

## Product navigation

Primary, subject to effective permissions: Dashboard, Rooster, Cijfers, Huiswerk & opdrachten, Aanwezigheid.

Management, subject to effective permissions: Leerlingen, Personeel, Gebruikers & rechten. Classes/groups and school structure remain in the existing administration portal until their production module is implemented.

Other routes remain available transitionally but are hidden from primary 1.0 navigation. Direct URL access still requires the existing permission check and RLS.

## Definition of Done

### School administration

- Current school year, periods, programmes, classes, groups, subjects, rooms and locations are available.
- Users, pupils, guardians and staff are connected to the correct school.
- Authorised staff can maintain the required structure without cross-school access.

### Pupil

- Can sign in and open the dashboard.
- Sees only their own schedule, published results, learning work and allowed absence information.

### Teacher

- Can sign in, see their schedule and open assigned groups.
- Can record attendance, create learning work and assessments, and enter/publish results within scope.

### Administration/school management

- Can manage basic school and people data.
- Can provide or manage timetable data, process absence and manage necessary access.

### Cross-cutting acceptance

- Two-school isolation tests pass for every read and write path.
- Desktop, tablet and phone navigation reaches every permitted 1.0 module.
- No production screen silently falls back to demo data.
- Errors are actionable and do not expose sensitive data.
- Back-up/restore and incident procedures are tested before rollout.

## Roadmap

### Phase 0 — Architecture Reset — DONE

Domain contracts, official sources, transition plan, 1.0 navigation, mobile reachability, initial identity services and quality plan. No feature completion.

### Phase 1 — Identity + School + People foundation — READY FOR TEST

Complete services/queries, remove their generic production writes, connect management UI, prove tenant/role scopes and establish reusable test fixtures.

Implemented: typed domain services and hooks, production directories, explicit Data API grants, scoped RLS adjustments and a 24-assertion two-school pgTAP suite. Manual role acceptance and write-form usability remain before `DONE`.

### Phase 2 — Timetable

Typed timetable/substitution queries and writes, role-specific views, changes/cancellations and conflict feedback. No automatic planning.

### Phase 3 — Attendance — DONE

Teacher lesson registration, administrative absence processing and permitted own-data views.

### Phase 4 — Results — DONE

Typed assessments/grades, weighting, publication state and pupil access.

### Phase 5 — Learning — DONE

Assignments, homework, deadlines, submissions, safe files and usable document history.

### Phase 6 — Dashboard

Role-specific aggregation from completed domains; no generic records.

### Phase 7 — End-to-end hardening

Automated E2E/RLS tests, accessibility/mobile checks, performance, observability, backup/restore, support/privacy procedures and pilot acceptance.

## Test strategy

- **RLS/tenant:** two schools, cross-tenant identifiers, every CRUD action and privileged RPC.
- **Roles/scopes:** pupil own data, guardian linked pupils, teacher assigned groups, school admin own school and current platform rules.
- **Domain queries:** service-level tests against representative local Supabase fixtures.
- **E2E:** login and the Definition of Done journeys for pupil, teacher and administration.
- **Mobile:** 360px phone, tablet and Chromebook viewport; drawer, bottom navigation, forms and tables.
- **Quality gates:** typecheck, lint, production build and portability on every phase.

Run local database regression tests with `npm run test:rls`. This requires Docker and a running local Supabase stack. Rebuild all migrations with `npx supabase db reset --local --no-seed --yes` when needed.

## P0 before production

- Audit and explicitly revoke unintended `PUBLIC`/`anon` execution on `SECURITY DEFINER` functions.
- Prove live two-school RLS isolation.
- Ensure every required typed table is exposed to `authenticated` only as intended; Data API grants and RLS are separate controls.
- Enforce an MFA policy for privileged users.
- Add recoverable backups and test restore.
- Complete upload malware scanning before school-wide file sharing.

## Outside 1.0

AI, Microsoft 365, extended messaging, push/PWA, advanced analytics, extended LVS/care, examinations, payments, parent evenings and automatic timetable planning.
