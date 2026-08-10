# SchoolPulse 1.0 — Final Acceptance

**Eindstatus: DONE**  
**Omgeving:** `schoolpulse-staging` (`ggucscfzakfvlfwyiuot`)  
**Datum:** 11 augustus 2026

Het oude project `edaotduwzyvkszcstxsa` is niet gebruikt of gewijzigd.

## Domeinstatus

| Domein     | Status | Bewijs                                                                                                                            |
| ---------- | ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Identity   | DONE   | Login, refresh, logout, protected route, profiel, rollen en permissions geaccepteerd in Fase 1 en opnieuw als sessieketen getest  |
| School     | DONE   | Schooljaar, periode, opleiding, vakken, klas, lesgroep en lokalen typed beheerd; actuele School-A-structuur opnieuw gecontroleerd |
| People     | DONE   | Leerlingen, personeel, enrolments en memberships typed en schoolgebonden; twee representatieve scholen aanwezig                   |
| Timetable  | DONE   | Aanmaak, wijziging, uitval, vervanging en zichtbaarheid per rol geaccepteerd in Fase 2                                            |
| Attendance | DONE   | Lesregistratie, correctie, eigen leerlinginzage en beheerverwerking geaccepteerd in Fase 3                                        |
| Results    | DONE   | Assessment, cijferinvoer, correctie, publicatie en uitsluitend eigen leerlinginzage geaccepteerd in Fase 4                        |
| Learning   | DONE   | Opdrachten, tekstinleveringen, beoordeling en scan-gated private bestanden geaccepteerd in Fase 5                                 |
| Dashboard  | DONE   | Echte rolgerichte compositie uit Timetable, Attendance, Results en Learning; geen eigen opslag, geaccepteerd in Fase 6            |

## End-to-end scenario's

1. **Schoolstructuur — PASS.** School A en B bevatten ieder een beheerder, twee docenten, twee leerlingen, twee vakken, een groep en twee lokalen. De School-A-beheerder zag en beheerde de typed structuur.
2. **Rooster — PASS.** Les, docent- en leerlingweergave, wijziging, uitval en vervanging zijn in de Fase 2-acceptatie via UI en RLS bewezen en blijven in de regressiesuite groen.
3. **Attendance — PASS.** Docentregistratie en correctie, eigen leerlingstatus en beheerinzage zijn in Fase 3 via UI, databasevalidatie en 14 specifieke securityassertions bewezen.
4. **Results — PASS.** Assessment, invoer, publicatie, correctie en eigen leerlinginzage zijn in Fase 4 via UI en 16 specifieke securityassertions bewezen.
5. **Learning — PASS.** Opdracht, deadline, leerlinginlevering en docentbeoordeling zijn in Fase 5 via UI en 14 specifieke securityassertions bewezen. Pending bestanden blijven veilig afgeschermd totdat malware scanning bestaat.
6. **Tenant isolation — PASS.** De volledige suite probeert bekende School-B-identifiers vanuit School A. Aanvullende staging-integriteitsqueries vinden 0 cross-school attendance-, grade- en submissionrelaties. Live leerlinglogin bij School B toont uitsluitend School B.
7. **Rollen — PASS.** Student heeft geen beheerwrites, teacher blijft toegewezen, schoolbeheer blijft binnen de eigen school en platformbeheer volgt de bestaande platformregels.
8. **Responsive — PASS.** Login, dashboard, rooster, attendance, cijfers, opdrachten en schoolstructuur zijn over de faseacceptaties gecontroleerd op 390×844, 768×1024 en 1440×900. Geen relevante horizontale overflow; mobiele bediening blijft bereikbaar.
9. **Sessies — PASS.** Login, sessiebehoud na refresh, logout, redirect van een protected route en geen toegang na logout zijn live getest. Blokkeren/verwijderen is veilig in Fase 1 geaccepteerd; productie-retentie blijft een operationele procedure.
10. **Data-integriteit — PASS.** Alle gecontroleerde orphan-counts en cross-school-counts zijn 0. `app_records` bevat 0 records voor de kernentiteiten van Fase 1–6. Lokaal en staging bevatten exact dezelfde 36 migrationversies.

## Security en kwaliteit

- Volledige pgTAP/RLS-suite: **PASS — 5 bestanden, 91 assertions**.
- Typecheck: PASS.
- Lint: PASS.
- Production build: PASS.
- Portabiliteitscontrole: PASS.
- Security Advisor: geen HIGH- of CRITICAL-bevindingen.
- Bestaande WARN-meldingen betreffen callable `SECURITY DEFINER`-functies die intern autoriseren en uitgeschakelde leaked-password protection. Ze zijn gedocumenteerd; de wachtwoordcontrole staat in de productiebacklog.
- Stagingproject is `ACTIVE_HEALTHY`.

## Databasestatus

- Lokale migrations: **36**.
- Staging migrations: **36**.
- Alleen lokaal: **0**.
- Alleen staging: **0**.
- Nieuwe migration in Fase 7: **geen**.
- `app_records`-kernrecords Fase 1–6: **0**.
- Orphaned kernrecords in de uitgevoerde controles: **0**.
- Cross-school foreign-keyafwijkingen in de uitgevoerde controles: **0**.

## Productie-hardening

Er is geen open functionele P0 binnen SchoolPulse 1.0. Operationele P0/P1-punten vóór een echte school staan met huidige bescherming en exitcriterium in `PRODUCTION_HARDENING_BACKLOG.md`. De belangrijkste zijn verplichte beheerders-AAL2, een bewezen restore, malware scanning vóór brede bestandsdeling, operationele monitoring, privacy-eigenaarschap, supporttoegang, account lifecycle en een geoefende productie-uitrol.

## Eindbesluit

Alle zeven fases zijn DONE, de acht typed domeinen werken samen, schoolisolatie en rollen zijn bewezen, de responsive en sessieketens slagen en alle quality gates zijn groen.

**SchoolPulse 1.0: DONE**

De logisch volgende enkele fase is **Productiepilot-readiness**: uitsluitend de gedocumenteerde operationele P0's afsluiten en daarna een gecontroleerde pilot met één kleine school voorbereiden. Deze volgende fase is niet gestart.
