# SchoolPulse — Productiepilot Readiness Acceptance

**Datum:** 11 augustus 2026  
**Staging:** `schoolpulse-staging` (`ggucscfzakfvlfwyiuot`)  
**Eindstatus:** **BLOCKED**

Het oude project `edaotduwzyvkszcstxsa` is niet gebruikt of gewijzigd.

## Acceptatiematrix

| Onderdeel              | Status             | Bewijs / blocker                                                                                                                                                   |
| ---------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Auth                   | PASS               | Login, refresh, logout en protected route eerder geaccepteerd; beheerpoort gebruikt actuele Auth-sessie                                                            |
| MFA/AAL2               | PASS               | `platform_admin` en `school_admin` worden vóór app/admin verplicht naar AAL2 geleid; live schooladmin met bestaande factor stopte aantoonbaar op verificatiescherm |
| MFA recovery           | BLOCKED            | Procedure is vastgelegd, maar factorreset + sessie-intrekking door tweede platformbeheerder is nog niet end-to-end geoefend                                        |
| Account lifecycle      | PASS               | Auth-ban is gekoppeld aan `profiles.is_blocked`; bestaande fictieve sessie verloor live toegang; 6 nieuwe databaseassertions slagen                                |
| Password reset/change  | BLOCKED            | Resetflow bestaat, maar leaked-password protection en volledige reset/change-acceptatie zijn niet aantoonbaar geconfigureerd                                       |
| Database backup        | PASS               | Genegeerde, lokale public-data-export van uitsluitend fictieve stagingdata is gemaakt; geen Auth-secrets gekopieerd                                                |
| Database restore       | BLOCKED            | Schone lokale schema-opbouw met 37 migrations is bewezen, maar volledige stagingdatarestore in een aparte veilige restoreomgeving niet                             |
| Storage backup/restore | BLOCKED            | Aparte procedure en manifest/checksum-eis zijn vastgelegd; objectverlies en herstel zijn nog niet met een echte backupbestemming bewezen                           |
| Malware protection     | BLOCKED            | Pending uploads zijn fail-closed en niet breed zichtbaar; echte scanner en clean/infected-uitvoering ontbreken                                                     |
| Monitoring             | BLOCKED            | Liveness en zes-uurlijkse uptimecontrole bestaan; centrale error sink, alerts en readiness ontbreken                                                               |
| Audit logging          | PASS               | Profiel/account-, rol- en schoolstructuurmutaties hebben beschermde audittriggers; eindgebruikers kunnen auditlogs niet wijzigen                                   |
| Privacy/AVG-basis      | PASS               | Rollen, categorieën, voorlopige termijnen, vertrek/contracteinde, inzage/export en datalekprocedure zijn vastgelegd                                                |
| Supporttoegang         | PASS (procedureel) | Persoonsgebonden, schoolgebonden, gemotiveerd venster van maximaal vier uur met toestemming en auditcontrole; nog geen automatische JIT-flow                       |
| Environment separation | PASS (ontwerp)     | Local/staging/new-production, variabelen en secrets zijn expliciet gescheiden; oud project uitgesloten                                                             |
| Staging → production   | BLOCKED            | Lokale clean rebuild slaagt; geen nieuw extern production-like project/app-koppeling en rollbackrestore bewezen                                                    |
| Pilot onboarding       | PASS               | Typed handmatige/importvolgorde en rol-smoke-test staan in `PILOT_OPERATIONS.md`                                                                                   |
| Pilot rollback         | PASS (procedureel) | Blokkeren, sessie-intrekking, export, retentie, tenantgoedkeuring en backupafloop zijn beschreven                                                                  |

## Technische wijzigingen

- Herbruikbare AAL2-poort voor zowel de schoolapp als platformadmin.
- Nieuwe additieve migration `pilot_account_lifecycle_hardening`.
- `profiles.is_blocked` als server-side autorisatiebron naast de Auth-ban.
- `current_school_id`, platformbeheer- en permissionhelpers geven geblokkeerde accounts geen context.
- Accountbeheer schrijft Auth-ban en profielstatus als één herstellende operatie.
- Nieuwe lifecycle/RLS-regressietest met 6 assertions.

## Tests

- Schone lokale database vanaf nul: **PASS — 37 migrations**.
- RLS/security: **PASS — 6 bestanden, 97 assertions**.
- Live bestaande-sessieblokkade op staging: **PASS**; fictief testaccount daarna hersteld.
- Live AAL1-schooladmin vóór dashboard gestopt: **PASS**.
- Typecheck: PASS.
- Lint: PASS.
- Build: PASS.
- Portabiliteitscontrole: PASS.
- Security Advisor na stagingmigratie: **0 HIGH, 0 CRITICAL**; bestaande WARN-punten blijven gedocumenteerd.

## Open security/functionele P0

1. Volledige database-restore in een afzonderlijke veilige restoreomgeving bewijzen.
2. Storage-objectbackup en herstel met checksum bewijzen.
3. Echte malware-scanner aansluiten en clean/infected/quarantine end-to-end testen.
4. Centrale productie-observability met eigenaar, alerts, proefalarm en veilige retentie activeren.
5. MFA recovery en sessie-intrekking end-to-end oefenen.
6. Leaked-password protection activeren en reset/change testen.
7. Schone externe production-like Supabase- en hostingdry-run uitvoeren.

## Besluit

Meerdere harde Definition-of-Done-punten zijn nog niet aantoonbaar behaald. De bestaande fail-closed opslagbescherming is goed, maar vervangt geen malware scanner of hersteltest.

**Productiepilot-readiness: BLOCKED**

**Kan één kleine school nu veilig een gecontroleerde SchoolPulse-pilot starten? NO**
