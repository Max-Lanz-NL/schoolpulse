# SchoolPulse — Final technical pilot review v2

**Datum:** 11 augustus 2026

## Fasestatus

- A Monitoring: **EXTERNAL BLOCKER** — adapter/readiness gereed; provider en proefalarm ontbreken.
- B MFA recovery: **BLOCKED** — ondersteunde geaudite tweede-admin recovery en platformadminbewijs ontbreken.
- C Auth hardening: **EXTERNAL ACTION REQUIRED** — leaked-password protection staat uit; dashboardtests ontbreken.
- D Production alignment: **BLOCKED** — productionwrite geweigerd; production blijft één migration achter.
- E Release pipeline: **EXTERNAL ACTION REQUIRED** — runbook gereed; hostingbranch, credentials en DNS moeten worden bevestigd.
- F Backups: technisch **PASS/DONE**; externe encrypted bestemming operationeel open.
- G Incident/support: **DONE**.
- H Regression: **PASS**, met bekende migration-/productiongateblokkade.

## Exact technisch bewijs

- Readiness/monitoring adaptertests: **6/6 PASS**.
- RLS/securitysuite: **108/108 PASS**, 7 testbestanden.
- Typecheck, lint, production build en portabiliteit: **PASS**.
- Migrations: local **39**, staging **39**, production **38**.
- Staging Advisor: **0 HIGH, 0 CRITICAL, 35 WARN**.
- Production Advisor: **0 HIGH, 0 CRITICAL, 33 WARN**.
- Staging kern-`app_records`: **0**; typed domaincode importeert geen `app_records`.
- Production: **0 Auth users, 0 profiles, 0 schools, 0 Storage objects** en de gecontroleerde kernrecords zijn 0.

## Uploads en malware

Staging `file_uploads_enabled=false` en de server-side Storage/metadata-gate is
bewezen. Production heeft de gate-migration nog niet; daar kan disabled dus niet
server-side worden bewezen. Malware scanning blijft **EXTERNAL BLOCKER — private
scanner ontbreekt**. Dat blokkeert een pilot pas niet meer wanneer uploads in
zowel staging als production aantoonbaar server-side uitstaan.

## Remaining external actions

1. Monitoringprovider/account, endpoint/token, alert owner, retentie en proefalarm.
2. Leaked-password protection en Auth-redirects in staging/productiondashboard controleren.
3. Externe encrypted backupbestemming, sleutelhouder en contractuele retentie.
4. Hosting productionbranch, environment separation, credentials en DNS bevestigen.
5. Private ClamAV-worker voor een latere uploadrelease; niet nodig zolang uploads overal uitstaan.

## Interne blockers

1. Geaudite MFA-recovery via ondersteunde Admin API bouwen en end-to-end bewijzen.
2. Productionwrite goedkeuren, migration 39 uitrollen en uploadbypass/gate/pariteit bewijzen.

## Status

**TECHNICAL STATUS: TECHNICALLY BLOCKED**

**OPERATIONAL STATUS: EXTERNAL ACTION REQUIRED**

Er wordt geen pilotschool aangesloten voordat beide interne blockers zijn
gesloten en de operationele eigenaar de externe acties heeft afgetekend.
