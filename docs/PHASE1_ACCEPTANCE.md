# SchoolPulse 1.0 — Fase 1 eindrapport

Datum: 10 augustus 2026

Staging: `schoolpulse-staging` (`ggucscfzakfvlfwyiuot`)

Oud project: `edaotduwzyvkszcstxsa` — niet gebruikt

Status: **DONE**

## A. CRUD

De productie-interface bevat nu zichtbare create/read/update/delete-bediening voor:

- schooljaren;
- periodes;
- opleidingen;
- vakken;
- klassen;
- lesgroepen;
- lokalen.

De formulieren gebruiken uitsluitend de bestaande typed School-service. Ze bieden loading- en savingstatus, succesfeedback, veldvalidatie, verwijderbevestiging en veilige foutmeldingen. Een relationeel gebruikt schooljaar kon niet worden verwijderd en gaf correct de melding dat het onderdeel nog door andere schoolgegevens wordt gebruikt. Er zijn geen cascade deletes toegevoegd.

## B. Permissions

- `school_admin`: create, update en delete op eigen schoolstructuur bewezen via de zichtbare UI.
- `teacher`: geen beheerroute en writes door RLS geweigerd.
- `student`: geen beheerroute en writes door RLS geweigerd.
- cross-school: admin, docent en leerling van School A wijzigden 0 rijen bij een bekende School-B-ID.

De UI toont beheerknoppen alleen bij `school_settings.manage` of `classes.manage`. RLS blijft beslissend.

## C. Typed tables

De UI heeft tijdens acceptatie geschreven naar:

- `school_years`;
- `school_periods`;
- `education_programmes`;
- `subjects`;
- `school_classes`;
- `teaching_groups`;
- `rooms`.

Alle tijdelijke CRUD-records zijn na de test verwijderd. De oorspronkelijke fictieve School-A- en School-B-baseline bleef intact.

## D. app_records

Na alle CRUD-tests bevat `app_records` exact **0** rijen. Geen schoolstructuurflow schrijft naar `app_records`.

## E. Mobiel

Gecontroleerde viewports:

- 390 × 844: formulierdialog past binnen het scherm en geen horizontale overflow;
- 768 × 1024: beheerinterface bruikbaar en geen horizontale overflow;
- 1440 × 900: desktopinterface bruikbaar en geen horizontale overflow.

## F. RLS

Exact resultaat van `npm run test:rls`:

```text
All tests successful.
Files=1, Tests=35
Result: PASS
```

Het script gebruikt vastgepind Supabase CLI `2.113.0`, omdat CLI `2.109.0` na een inhoudelijke PASS ten onrechte exitcode 1 gaf door een PostHog-afsluittimeout.

## G. Quality

| Controle | Resultaat |
| --- | --- |
| Typecheck | PASS |
| Lint | PASS |
| Build | PASS |
| Portabiliteitscontrole | PASS |
| RLS 35/35 | PASS |

## H. MFA

`school_admin AAL2 enforcement = NOT YET REQUIRED AFTER NEW LOGIN`

TOTP-inschrijving en AAL2-verificatie werken. Verplichte AAL2 na een nieuwe login blijft een productie-hardeningpunt vóór echte schoolgebruikers, maar blokkeert Fase 2 volgens de vastgestelde acceptatieregel niet.

## I. Fase 1 status

**DONE**

Er bestaat geen nieuwe Fase 1-blocker. Alle Definition-of-Done-punten zijn aantoonbaar behaald.

## J. Fase 2

Kan Fase 2 — Timetable nu veilig starten? **YES**

Fase 2 is niet automatisch gestart.
