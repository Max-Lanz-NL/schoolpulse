# Databaseoverzicht

De database is multi-tenant: vrijwel iedere functionele tabel bevat `school_id`, terwijl Row Level Security bepaalt welke school en rol de rij mag zien. Historische migrations blijven onveranderd, zodat bestaande en nieuwe omgevingen exact dezelfde database kunnen opbouwen.

| Module                        | Belangrijkste tabellen                                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Kern en accounts              | `schools`, `profiles`, `platform_accounts`, `admin_audit_logs`                                                                |
| Rollen en permissies          | `school_roles`, `permission_definitions`, `role_permissions`, `profile_role_assignments`, `permission_change_requests`        |
| Schoolinrichting              | `school_years`, `school_periods`, `school_locations`, `education_programmes`, `subjects`, `school_classes`, `teaching_groups` |
| Personen                      | `student_records`, `staff_records`, `student_enrolments`, `guardian_student_links`, docent- en groepskoppelingen              |
| Onderwijs                     | `timetable_entries`, `attendance_records`, `assignments`, `assessments`, `grades`, `student_reports`                          |
| Communicatie en ondersteuning | `conversations`, `messages`, `notifications`, `student_support_notes`, `file_assets`                                          |
| Integraties en betalingen     | `integration_connections`, `integration_sync_runs`, `payment_requests`, `payment_transactions`                                |

De view `database_module_catalog` geeft dit overzicht ook rechtstreeks in SQL. `school_data_summary` toont per zichtbare school aantallen voor de belangrijkste modules en respecteert RLS.

## Werkwijze

- Voeg schemawijzigingen alleen toe als een nieuwe migration met tijdstempel.
- Bewerk of verwijder een reeds toegepaste migration nooit.
- Voeg geen echte of demo-persoonsgegevens toe aan migrations.
- Test een lege omgeving met `npx supabase db reset` voordat een migration wordt gepusht.
