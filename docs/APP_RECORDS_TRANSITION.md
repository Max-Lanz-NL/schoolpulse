# `app_records` transition plan

`app_records` is legacy/transition infrastructure. It is not removed during the architecture reset because existing production routes still depend on it.

## Current use

`ProductionApp.tsx` still loads `app_records` and uses it for generic create, update, publish, cancel, delete, history, filtering and CSV export. The typed guardian, message, assessment, assignment and grade records are merged into the same view model.

## Replacement map

| Current entity                                                                                       | Official source                                        | Planned phase                           |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------- |
| schedule, substitution                                                                               | `timetable_entries`, `substitutions`                   | Phase 2                                 |
| attendance, absence                                                                                  | `attendance_records`, `absence_requests`               | Phase 3                                 |
| grade, test                                                                                          | `grades`, `assessments`                                | Phase 4                                 |
| homework, assignment, document                                                                       | `assignments`, `assignment_submissions`, `file_assets` | Phase 5                                 |
| student, staff, parent_link                                                                          | People tables                                          | Phase 1                                 |
| dashboard                                                                                            | Aggregated domain queries                              | Phase 6                                 |
| messages, activities, agenda, consent, reports, notifications, care, integrations, payments, privacy | Outside the primary 1.0 scope                          | Keep transitionally; reassess after 1.0 |

## Rules

1. Do not add a new 1.0 entity to `app_records` when a typed table exists.
2. Migrate one domain at a time, with role/RLS and end-to-end tests.
3. Do not delete legacy records until production migration, reconciliation and rollback have been proven.
4. The dashboard never becomes a new source of truth.
