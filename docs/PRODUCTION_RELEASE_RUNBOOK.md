# SchoolPulse — Production release runbook

**Status:** EXTERNAL ACTION REQUIRED voor hostingrelease

## Reproduceerbare volgorde

1. Werk op `main` is gereviewd, commits zijn afzonderlijk en werkmap is schoon.
2. Draai readiness/unit, 108 RLS-assertions, typecheck, lint, build en portability.
3. Beoordeel uitsluitend nieuwe officiële migrations; geen repair of oude edits.
4. Deploy code en migrations naar staging `ggucscfzakfvlfwyiuot`.
5. Smoke test login, protected route, `/healthz`, `/readyz` en uploads disabled.
6. Bevestig database- en Storage-recovery readiness en release-eigenaren.
7. Controleer productioncleanliness en voer migrations met dry-run en vier ogen uit.
8. Deploy exact dezelfde commit/build naar productionhosting.
9. Smoke test production zonder schooldata en controleer het productionprojectref.
10. Leg go/no-go, release-ID, migrationcount en rollbackbesluit vast.

## Code en hosting

De repository bevat een multi-stage Node 22 Dockerbuild en een liveness
HEALTHCHECK. De enige GitHub Actions-workflow controleert elke zes uur publieke
bereikbaarheid; er is geen aantoonbare workflow die een productiondeployment
triggert. Welke branch of hostingintegratie production publiceert moet in het
hostingdashboard door de release-eigenaar worden bevestigd.

## Database en omgevingen

Preview/staging gebruikt uitsluitend staging URL en publishable key; production
uitsluitend `gqemqvovdrujonlffhen`. `VITE_` bevat alleen browserveilige waarden.
Service-role, databasewachtwoord, monitoringtoken en scannersecret blijven
server-only. Preview mag nooit productionwaarden erven.

Migrations worden na stagingacceptatie en vóór app-omschakeling op production
toegepast. Voor iedere write worden projectref en cleanliness opnieuw bewezen.

## Verificatie en rollback

Go/no-go vereist: health 200, readiness healthy, loginpagina, protected-route
redirect, juiste Supabase target en uploads server-side disabled.

- Frontend/server: hostingrollback naar het vorige onveranderde release-artifact.
- Database: geen destructieve downmigration; maak een forward-fix als eerste keus.
- Onomkeerbare fout: writes stoppen en gecontroleerd databaseherstel gebruiken.
- Storage: herstel objectbytes en manifest volgens `STORAGE_BACKUP_RESTORE.md`.

Stop direct bij tenantisolatiefout, onverwachte data, migrationdrift, readiness
failure of verkeerde omgevingsref. DNS, domeinkoppeling, production branch en
hostingcredentials zijn **EXTERNAL ACTION REQUIRED**; niets blind overschrijven.
