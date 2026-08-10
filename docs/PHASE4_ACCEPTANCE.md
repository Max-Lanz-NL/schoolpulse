# SchoolPulse 1.0 — Fase 4 Acceptance

Status: **DONE**

Datum: 11 augustus 2026  
Omgeving: `schoolpulse-staging` (`ggucscfzakfvlfwyiuot`)

## Scope

Fase 4 gebruikt uitsluitend `assessments` en `grades`. Het bestaande schema ondersteunt groep, vak, datum, maximumscore, weging en publicatiestatus. Er is geen periodekolom; daarom is geen fictief periodeveld toegevoegd.

## Functionele acceptatie

- Docent maakt een toets voor een toegewezen lesgroep en het bijbehorende vak.
- Docent opent de toets, ziet de relevante leerlingen en voert cijfers van 0 t/m 10 in.
- Conceptcijfers kunnen worden opgeslagen; publicatie publiceert eerst de toets en daarna de cijfers.
- Een cijfer kan door de bevoegde docent worden gecorrigeerd zonder een duplicaatrecord te maken.
- Leerling ziet uitsluitend eigen gepubliceerde cijfers met vak, toets, datum en weging.
- Concepttoetsen en conceptcijfers zijn niet zichtbaar voor leerlingen.
- School A en School B tonen uitsluitend hun eigen resultaten.

## Database en security

- Lokale migrations: 35.
- Staging migrations: 35; history is gelijk.
- Acht afzonderlijke RLS-policies beschermen assessments en grades.
- Databasevalidatie dwingt school, groep, vak, leerling, beoordelaar, scoregrenzen en publicatievolgorde af.
- Uniek `(assessment_id, student_profile_id)` voorkomt dubbele cijfers.
- Cross-school assessment/grade-relaties op staging: 0.
- Results-records in `app_records`: 0.
- Security Advisor: geen HIGH of CRITICAL. De gemelde Results-WARNs betreffen bewust callable security-definer helpers/RPC's die intern opnieuw authenticatie, permissies en tenantrelaties valideren.

## Geautomatiseerde tests

`npm run test:rls`: **PASS**, 4 bestanden en 77 assertions totaal. De 16 Fase 4-assertions bewijzen onder meer:

- docent maakt en publiceert alleen voor een toegewezen groep;
- verkeerd vak en School B-referenties worden geweigerd;
- maximaal één cijfer per leerling en toets;
- cijfergrens 0–10;
- conceptresultaten blijven verborgen;
- student kan geen cijfers schrijven;
- School B kan School A-assessments en grades niet lezen.

## Kwaliteitscontroles

- Typecheck: PASS
- Lint: PASS
- Build: PASS
- Portabiliteitscontrole: PASS
- Schone databaseopbouw vanaf migration 1 t/m 35: PASS

## Responsive en gebruikersacceptatie

- `390×844`: toets aanmaken, twee cijfers invoeren/publiceren, cijfer corrigeren en leerlinginzage; geen horizontale overflow.
- `768×1024`: resultaatkaarten zonder horizontale overflow.
- `1440×900`: desktopweergave zonder horizontale overflow.

## Conclusie

Assessments typed, grades typed, docentflow, leerlinginzage, weging, publicatie, correctie en tenantisolatie zijn aantoonbaar geslaagd. Fase 4 voldoet aan alle DONE-criteria.
