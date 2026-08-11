# SchoolPulse — autorisatiematrix

**Bron:** staging `ggucscfzakfvlfwyiuot`, migrations en RLS-tests, 11 augustus 2026.

`Eigen` betekent het eigen account of de eigen leerlingcontext. `Toegewezen`
betekent uitsluitend lessen, groepen en leerlingen waaraan de docent via de
officiële onderwijsrelaties is gekoppeld. Iedere toegestane schoolactie vereist
dezelfde `school_id`; de UI is alleen presentatie en nooit de beveiligingsgrens.

| Module | Student | Teacher | School admin | Platform admin | Server-side grens |
|---|---|---|---|---|---|
| School | Read relevante structuur; geen writes | Read eigen school; geen structuurwrites | CRUD eigen schoolstructuur volgens permissions | Platformbeheer volgens bestaande regels | RLS + `current_school_id()` + permissions |
| People | Eigen dossier; geen beheerwrites | Read toegewezen leerlingen/eigen personeelsrecord | CRUD eigen-school people en relaties | Platformbeheer | RLS + schoolgebonden validators/RPC's |
| Timetable | Read eigen groep | Read eigen/toegewezen lessen | CRUD eigen-school rooster, uitval en vervanging | Platformbeheer | RLS + conflict- en referentietriggers |
| Attendance | Read eigen status; eigen absentieverzoek waar toegestaan | Read/write uitsluitend toegewezen les | Read/verwerk eigen-school attendance/absence | Platformbeheer | RLS + `can_record_lesson_attendance` + validators |
| Results | Read alleen eigen gepubliceerde cijfers | Assessment/grade voor toegewezen groep | Beheer volgens eigen-school permissions | Platformbeheer | RLS + assessment/grade validators |
| Learning | Read gepubliceerde relevante opdracht; eigen tekstsubmission | CRUD opdracht voor toegewezen groep; relevante submissions | Eigen-school beheer | Platformbeheer | RLS + assignment/submission validators; uploadgate |
| Users/Roles | Eigen profiel beperkt | Eigen profiel beperkt | Schoolaccounts en rollen binnen eigen school/rang | Platformaccounts en platformbeheer | RLS, beveiligde RPC's en server-only Edge Function |

## Special actions

- MFA recovery: tweede AAL2-beheerder, nooit self; schooladmin alleen dezelfde
  school en nooit een platformadmin; server-only Auth Admin API met auditlog.
- Account blokkeren/verwijderen: alleen de bestaande beheerde adminroute; een
  geblokkeerde bestaande JWT verliest direct schoolcontext en permissions.
- Bestandsupload: centraal server-side uitgeschakeld. Geen rol kan dit via UI,
  Data API of Storage policy omzeilen.
- Publiceren: leerlingen zien alleen gepubliceerde grades/assignments; concepten
  blijven voor bevoegde medewerkers.

## Auditbevinding

De UI- en serverrollen sluiten voor de kernmodules aan op hetzelfde
permissionmodel. Er is geen kernactie gevonden die alleen door UI-verbergen wordt
beveiligd. Twee trigger-only roostervalidators hadden onnodig execute-recht voor
`authenticated`; migration `20260811144021_revoke_timetable_trigger_execute.sql`
heeft dit op staging verwijderd en regressietests bewaken dit.
