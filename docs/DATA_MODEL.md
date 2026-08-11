# SchoolPulse — datamodel 1.0

Iedere typed kernrij is tenantgebonden via `school_id`. Auth-identiteit leeft in
`auth.users`; `profiles.id` gebruikt dezelfde UUID en vormt de publieke identiteit.

## Domeinen

| Domein | Officiële bronnen | Belangrijkste relaties |
|---|---|---|
| Identity | `profiles`, `profile_preferences`, `platform_accounts` | profiel ↔ Auth user; accountstatus beïnvloedt alle contexthelpers |
| Authorization | `school_roles`, `role_permissions`, `profile_role_assignments`, templates/versions | assignment koppelt profiel aan schoolrol; permissions en rang bepalen acties |
| School | `schools`, `school_years`, `school_periods`, `subjects`, `rooms`, `school_classes`, `school_locations`, `education_programmes` | alle structuur hoort bij één school; klas/perioden horen bij schooljaar |
| People | `student_records`, `staff_records`, `student_enrolments`, `guardian_student_links` | record koppelt profiel aan school; enrolment koppelt leerling, jaar, klas en programma |
| Groups | `teaching_groups`, `student_group_memberships`, `teacher_group_assignments`, `teacher_subject_assignments` | onderwijscontext voor rooster, attendance, results en learning |
| Timetable | `timetable_entries`, `substitutions` | les koppelt jaar, groep, vak, docent, optioneel lokaal; substitution koppelt vervanger |
| Attendance | `attendance_records`, `absence_requests` | unieke leerling+lesregistratie; verzoek hoort bij eigen leerling en school |
| Results | `assessments`, `grades` | assessment hoort bij groep/vak; unieke grade per assessment+leerling |
| Learning | `assignments`, `assignment_submissions` | opdracht hoort bij groep/vak; unieke submission per opdracht+leerling |
| Files | `file_assets`, `document_versions`, private `storage.objects` | metadata en objectpad zijn school/ownergebonden; alleen clean-status deelbaar |
| Audit/import | `admin_audit_logs`, `import_batches`, `import_rows` | actor/context en per-rij validatieresultaat |

## Grenzen

- Foreign keys en validatietriggers voorkomen cross-school relaties; RLS bepaalt
  welke rijen een actor kan lezen of schrijven.
- Docenttoegang wordt afgeleid uit onderwijsrelaties, niet uit een door de client
  aangeleverde rolclaim.
- Publicatievelden op assessments, grades en assignments bepalen leerlinginzage.
- Dashboard heeft geen eigen tabel; het composeert Timetable, Attendance, Results
  en Learning.
- Storage is private. Een signed URL is tijdelijke toegang, geen bronrecord.

## Transitional en buiten 1.0

`app_records` is legacy/transitional. Geen Identity-, School-, People-, Timetable-,
Attendance-, Results-, Learning- of Dashboardfunctie mag er nieuwe data in
schrijven. Messaging, payments, integrations en uitgebreide analytics zijn niet
vrijgegeven door het bestaan van tabellen; ze blijven buiten SchoolPulse 1.0.
