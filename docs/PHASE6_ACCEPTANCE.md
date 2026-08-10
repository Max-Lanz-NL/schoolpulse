# SchoolPulse 1.0 — Fase 6 Acceptance

## Status

**DONE**

## Scope en architectuur

- Het dashboard heeft geen eigen tabel, migration of schrijfflow gekregen.
- De compositieservice leest uitsluitend de typed bronnen `timetable_entries`, `attendance_records`, `assessments`/`grades` en `assignments`/`assignment_submissions` via de bestaande domeinservices.
- Alle resultaten blijven door de RLS-regels van het brondomein begrensd.
- De oude generieke dashboardtelling op `app_records` is verwijderd.
- De vier domeinen worden als één gecachte TanStack Query opgehaald (60 seconden stale time, refresh bij vensterfocus) met een gebruikersgebonden cache key.

## Acceptatie per rol

### Leerling

- Volgende lessen van vandaag, inclusief uitval, wijziging en vervanging.
- Openstaande gepubliceerde opdrachten en deadlines.
- Recente eigen gepubliceerde cijfers.
- Eigen recente aanwezigheidsregistraties en verzuimsamenvatting.

### Docent

- Lessen van vandaag en de eerstvolgende relevante les.
- Actieve opdrachten.
- Betrouwbaar afgeleide open acties: verstreken lessen zonder aanwezigheidsrecords en ingeleverde opdrachten die beoordeling vragen.

### Beheer

- Dezelfde eenvoudige operationele compositie, zonder analytics of dubbele opslag.

## UX en responsive

- Loading-, fout-, retry- en empty states zijn aanwezig.
- Acties verwijzen naar het eigenaar-domein; het dashboard schrijft zelf niets.
- Browseracceptatie uitgevoerd op 390×844, 768×1024 en 1440×900.
- Op alle drie viewports is geen horizontale pagina-overflow vastgesteld.
- Docent- en leerlingdashboard zijn met echte fictieve stagingdata gecontroleerd.

## Quality en security

- Typecheck: PASS
- Lint: PASS
- Production build: PASS
- Portabiliteitscontrole: PASS
- Volledige RLS-suite: PASS — 5 bestanden, 91 assertions
- Nieuwe databasewrites: geen
- Nieuwe migrations: geen
- Nieuwe `app_records`-data: geen

## Conclusie

Fase 6 voldoet aan de acceptancecriteria. Het dashboard is een responsive, rolgerichte compositie van echte typed domeindata en introduceert geen eigen opslag.
