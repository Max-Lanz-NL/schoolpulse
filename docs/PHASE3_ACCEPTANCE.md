# SchoolPulse 1.0 — Fase 3 Acceptance

Status: **DONE**

Datum: 11 augustus 2026  
Omgeving: `schoolpulse-staging` (`ggucscfzakfvlfwyiuot`)

## Scope

Fase 3 gebruikt uitsluitend de typed bronnen `attendance_records` en `absence_requests`. De productie-interface schrijft voor aanwezigheid en absentie niet naar `app_records`.

## Functionele acceptatie

- Docent opent een toegewezen roosterles en krijgt uitsluitend de relevante leerlingen te zien.
- Docent registreert aanwezig, afwezig, te laat, geoorloofd of op afstand en kan een registratie corrigeren.
- De unieke databaseconstraint voorkomt meer dan één record per leerling en les.
- Leerling ziet uitsluitend de eigen aanwezigheidsregistraties en absentieverzoeken en krijgt geen schrijffunctie voor attendance.
- Directeur bekijkt eigen-school attendance en verwerkt een ingediend absentieverzoek met een beoordeling.
- School A en School B tonen uitsluitend hun eigen gegevens.
- De interface gebruikt kaarten in plaats van een brede mobiele tabel.

## Database en security

- Lokale migrations: 34.
- Staging migrations: 34; history is gelijk.
- Nieuwe Fase 3-migrations: attendance-validatie/RLS, afscherming interne trigger-RPC's en directeurrechten voor absentiebeoordeling.
- Zeven policies beschermen de twee typed tabellen.
- Cross-school les-, leerling- en absentiekoppelingen op staging: 0.
- Fase 3-records in `app_records`: 0.
- Security Advisor: geen HIGH of CRITICAL; één verwachte WARN voor de beveiligde policy-helper `can_record_lesson_attendance`, die de ingelogde gebruiker server-side controleert.

## Geautomatiseerde tests

`npm run test:rls`: **PASS**, 3 bestanden en 61 assertions totaal. De 14 Fase 3-assertions bewijzen onder meer:

- docent schrijft en corrigeert alleen een toegewezen les;
- duplicate registratie wordt geweigerd;
- leerling kan attendance niet schrijven en ziet alleen zichzelf;
- schoolbeheer verwerkt alleen de eigen school;
- cross-school referenties en inzage worden geweigerd;
- de directeurtemplate bevat de vereiste beoordelingsrechten.

## Kwaliteitscontroles

- Typecheck: PASS
- Lint: PASS
- Build: PASS
- Portabiliteitscontrole: PASS
- Schone databaseopbouw vanaf migration 1 t/m 34: PASS

## Responsive en gebruikersacceptatie

- `390×844`: docentregistratie, correctie en leerlinginzage; geen horizontale overflow.
- `768×1024`: beheerinzage en absentiebeoordeling; geen horizontale overflow.
- `1440×900`: desktopbeheer; geen horizontale overflow.
- Browserconsole na de definitieve beheerflow: geen nieuwe fout.

## Conclusie

Attendance typed, absence typed, docentflow, leerlingflow, beheerflow, duplicate protection en tenantisolatie zijn aantoonbaar geslaagd. Fase 3 voldoet aan alle DONE-criteria.
