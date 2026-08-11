# SchoolPulse — Production migration alignment

**Datum:** 11 augustus 2026

**Status:** BLOCKED — production write approval required

## Preflight

Productionproject `gqemqvovdrujonlffhen` is opnieuw read-only gecontroleerd:

- Auth users: 0
- profiles: 0
- schools: 0
- Storage objects: 0
- students/staff/timetable/attendance/grades/assignments: allemaal 0

Er is geen aanwijzing voor echte of fictieve schooldata.

## Migrationcontrole

Local en staging hebben 39 migrations; production heeft 38. Een CLI dry-run op
de expliciet gecontroleerde productionref wees uitsluitend
`20260811135445_pilot_file_upload_gate.sql` aan. Er is geen repair, oude
migrationwijziging, testdata of handmatige schemahack gebruikt.

De daadwerkelijke productionwrite is door de production-releasebeveiliging
geweigerd. Deze beveiliging is niet omzeild. Production blijft daardoor op 38 en
`runtime_feature_flags` bestaat daar nog niet. De server-side uploadgate is op
production dus nog niet bewezen, ook al staat de code- en migrationbaseline
fail-closed klaar.

## Vereiste actie

Een bevoegde release-eigenaar moet een afzonderlijk productionwritevenster
goedkeuren. Herhaal daarna exact: cleanlinesspreflight → `db push --dry-run` →
alleen migration 39 → flag `false` controleren → Storage/file_assets bypass
read-only bewijzen → Security Advisor → migrationpariteit → cleanliness.
