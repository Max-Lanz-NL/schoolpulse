# SchoolPulse — Monitoring, alerts en readiness

**Datum:** 11 augustus 2026

**Status:** EXTERNAL BLOCKER

## Uitkomst

Liveness, dependency-readiness en een server-side provideradapter zijn technisch beschikbaar, maar er is geen
echte centrale monitoringdienst, DSN/API-token, alert route of ontvanger
geconfigureerd. Frontend- en serverfouten komen daardoor nog niet samen in een
extern beheerde sink en een proefalarm kan niet eerlijk worden bewezen. Volgens
Fase A blijft daarom een EXTERNAL BLOCKER. Onafhankelijke fases gaan volgens run v2 wel door.

## Endpoints

- `/healthz` is uitsluitend liveness en retourneert alleen status en servicenaam.
- `/readyz` controleert runtimeconfiguratie, Supabase Data API en Auth. De
  uitkomst is `healthy`, `degraded` of `unhealthy`; niet-healthy geeft HTTP 503.
- Readiness retourneert nooit URL's, keys, credentials, gebruikersdata,
  stacktraces of interne foutteksten. Responses zijn `no-store`.
- Storage wordt niet geprobed: uploads staan voor de pilot uit en Database/API
  plus Auth zijn de kritieke afhankelijkheden.

## Logging en privacy

Huidige locaties:

- frontend: geminimaliseerd lokaal `schoolpulse:error`-event;
- server/runtime: hosting-stderr;
- database, Auth en Storage: Supabase-projectlogs;
- deployment: hosting- en GitHub Actions-logs.

Niet loggen: cijfers, absentieredenen, opdrachtinhoud, documenten, wachtwoorden,
access-/refresh-tokens, MFA-secrets of volledige requestpayloads. Alleen eventtype,
omgeving, release-ID en strikt noodzakelijke technische IDs zijn toegestaan.

Toegang, retentie en verantwoordelijke moeten in de echte provider worden
ingericht volgens least privilege. Ze zijn niet in broncode gehardcodeerd.

## Vereiste centrale events en alerts

Events: `frontend_runtime_error`, `server_runtime_error`, `auth_failure_spike`,
`database_failure`, `readiness_failure`, `deployment_failure` en de voorbereide
scanner-events `infected_detected`, `scan_failed`, `scanner_unavailable`,
`signature_stale`.

Alerts: applicatie onbereikbaar, readiness niet healthy en hoog foutniveau.
Ontvangers moeten via providerconfiguratie worden beheerd. Een proefalarm moet
na aansluiting als duidelijk gelabeld testevent de sink én alertontvanger
bereiken.

## Aansluitvoorwaarden

Server-only configuratienamen zijn voorbereid in `.env.example`:

- `SCHOOLPULSE_MONITORING_PROVIDER`
- `SCHOOLPULSE_MONITORING_ENDPOINT`
- `SCHOOLPULSE_MONITORING_TOKEN`
- `SCHOOLPULSE_MONITORING_ALERT_ROUTE`
- `SCHOOLPULSE_ENVIRONMENT`
- `SCHOOLPULSE_RELEASE`

Deze mogen nooit `VITE_` krijgen. Voor status DONE zijn nog vereist: provider en
account kiezen, credentials veilig in staging/production secretstores zetten,
frontend en server SDK aansluiten met payloadscrubbing, alerts/retentie/toegang
configureren en een proefalarm end-to-end bewijzen.

## Testbewijs

De geautomatiseerde readinessset controleert healthy, dependency failure,
ontbrekende configuratie en secretlekkage. De volledige RLS/securitysuite en
kwaliteitscontroles worden bij deze fase opnieuw uitgevoerd.
