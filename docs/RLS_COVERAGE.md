# SchoolPulse — RLS- en functiecoverage

**Live audit:** staging `ggucscfzakfvlfwyiuot`, 11 augustus 2026.

## Samenvatting

- Public tables: **53**
- RLS enabled: **53/53**
- Tabellen zonder directe policies: **1**, `runtime_feature_flags`; alle rechten
  zijn ingetrokken en alleen de fail-closed definerfunctie leest de singleton.
- Public `SECURITY DEFINER`-functies: **51**
- Met vaste `search_path`: **51/51**
- Uitvoerbaar door `anon`: **0/51**
- Trigger/interne functies uitvoerbaar door `authenticated` na hardening: **0**
- Bestaande kern-RLS-assertions: **108**; nieuwe functiegrant-assertions: **2**.

## Kerndomeinen

| Tabel(len) | RLS | Student | Teacher | Schooladmin | Platformadmin | Tenantvoorwaarde | Test |
|---|---:|---|---|---|---|---|---:|
| `schools`, `school_years`, `school_periods`, `subjects`, `rooms`, `school_classes`, `school_locations` | Ja | relevante read | eigen-school read | eigen-school CRUD | platformregels | `current_school_id`/permission | Ja |
| `profiles`, `staff_records`, `student_records` | Ja | eigen | eigen/toegewezen read | eigen-school beheer | platformregels | school + accountstatus | Ja |
| `student_enrolments`, `student_group_memberships`, `guardian_student_links` | Ja | eigen/relevant | toegewezen read | eigen-school beheer | platformregels | schoolvalidatie van beide zijden | Ja |
| `teaching_groups`, `teacher_group_assignments`, `teacher_subject_assignments` | Ja | eigen groep read | toegewezen | eigen-school beheer | platformregels | schoolreferenties | Ja |
| `timetable_entries`, `substitutions` | Ja | eigen groep | eigen/toegewezen | eigen-school CRUD | platformregels | school + assignments | Ja |
| `attendance_records`, `absence_requests` | Ja | eigen read/request | toegewezen les write | eigen-school review | platformregels | les/student/school | Ja |
| `assessments`, `grades` | Ja | eigen gepubliceerd | toegewezen groep | eigen-school beheer | platformregels | assessment/student/school | Ja |
| `assignments`, `assignment_submissions` | Ja | gepubliceerd/eigen | toegewezen groep | eigen-school beheer | platformregels | assignment/student/school | Ja |
| `file_assets`, `document_versions` | Ja | veilige eigen/relevante read | permissiongebonden | eigen-school permission | platformregels | school + owner + clean status | Ja |
| `school_roles`, `role_permissions`, `profile_role_assignments` | Ja | geen beheer | geen beheer | eigen-school en rang | platformregels | school + rang + permission | Ja |
| `admin_audit_logs` | Ja | geen | geen | beperkte eigen-school audit | platformregels | actor/context | Ja |
| `runtime_feature_flags` | Ja | geen direct | geen direct | geen direct | geen clientwrite | revoked; definer read-only | Ja |

Niet-kern/tabellen voor toekomstige of uitgeschakelde gebieden hebben eveneens
RLS, maar zijn geen vrijgave van messaging, payments, integrations of analytics.
`app_records` blijft transitional en mag geen nieuwe kernmoduledata ontvangen.

## SECURITY DEFINER-classificatie

- Trigger/internal helpers: Auth-execute ingetrokken; alleen triggers/owners.
- Policy helpers zoals `current_school_id`, `has_permission` en
  `can_access_*`: authenticated execute, vaste `search_path`, read-only context.
- Authenticated domain-RPC's: interne actor-, tenant-, relationele en
  permissioncontrole; geen anon execute.
- Admin-RPC's: rang/permission- en schoolcontrole in de functie; audit waar de
  actie verhoogde rechten gebruikt; geen anon execute.

Er zijn na migration 40 geen open anonieme definergrants of losse trigger-RPC's.
