# SchoolPulse 1.0 — Fase 1A acceptatierapport

Datum: 9 augustus 2026  
Status: **BLOCKED**  
Scope: staging deployment en acceptatie van Fase 1 (Identity + School + People)

## Besluit

De staging-deployment is bewust niet gestart. Het gekoppelde Supabase-project `schoolpulse Database` (`edaotduwzyvkszcstxsa`) is het enige actieve SchoolPulse-project en is niet aantoonbaar als staging ingericht. De enige andere zichtbare omgeving, `supabase-citron-dog`, is inactief, hoort bij een andere beheerde organisatie en heeft geen vastgestelde functie. Geen van beide mag zonder expliciete classificatie als veilige staging worden gebruikt.

Daarnaast wijkt de online migratiegeschiedenis af van de lokale repository. Een push kan daardoor bestaande data of schema's onbedoeld beïnvloeden. Conform de veiligheidsregel zijn geen online migraties, testaccounts, testdata, deployments of instellingen gewijzigd.

## Omgevingsmatrix

| Omgeving                 | Status                          | Bewijs                                                              | Gebruikt voor deze acceptatie                         |
| ------------------------ | ------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------- |
| Lokaal                   | Beschikbaar                     | Lokale Supabase-configuratie en migrations                          | Ja, voor reeds uitgevoerde geautomatiseerde controles |
| Staging                  | Niet beschikbaar / niet bewezen | Geen apart project, hostingconfiguratie of staging-secrets gevonden | Nee                                                   |
| Productie of gedeeld     | Beschermd                       | Gekoppeld actief project `schoolpulse Database`                     | Alleen read-only geïnspecteerd                        |
| Onbekend beheerd project | Inactief                        | `supabase-citron-dog`, andere beheerde organisatie                  | Nee                                                   |

## Migratiestatus

De lokale en online migraties komen overeen tot en met `20260809162126`. Daarna is sprake van divergentie.

Online aanwezig maar lokaal ontbrekend:

- `20260809163904`
- `20260809164245`
- `20260809165136`
- `20260809165425`

Lokaal aanwezig maar online ontbrekend:

- `20260809180724` — Fase 1 identity/school/people security
- `20260809190000`
- `20260809193000`
- `20260809194500`
- `20260809201000`

Resultaat: **niet gepusht**. Eerst moet worden vastgesteld waar de online-only migraties vandaan komen en moet een schone staging-database vanaf de lokale migratieketen kunnen worden opgebouwd.

## Acceptatiematrix

`PASS` betekent lokaal aantoonbaar geslaagd. `BLOCKED` betekent dat de vereiste live staging-acceptatie niet veilig kon worden uitgevoerd.

| Controle                                            | Admin   | Docent  | Leerling | Desktop | Mobiel  | Status  |
| --------------------------------------------------- | ------- | ------- | -------- | ------- | ------- | ------- |
| Volledige lokale migratie-reset                     | n.v.t.  | n.v.t.  | n.v.t.   | n.v.t.  | n.v.t.  | PASS    |
| Geautomatiseerde RLS-suite (24/24)                  | PASS    | PASS    | PASS     | n.v.t.  | n.v.t.  | PASS    |
| Inloggen met acceptatieaccounts                     | BLOCKED | BLOCKED | BLOCKED  | BLOCKED | BLOCKED | BLOCKED |
| Juiste school, rol en modules                       | BLOCKED | BLOCKED | BLOCKED  | BLOCKED | BLOCKED | BLOCKED |
| Schoolstructuur lezen en wijzigen                   | BLOCKED | BLOCKED | n.v.t.   | BLOCKED | BLOCKED | BLOCKED |
| Leerlingen lezen en wijzigen                        | BLOCKED | BLOCKED | BLOCKED  | BLOCKED | BLOCKED | BLOCKED |
| Personeel lezen en wijzigen                         | BLOCKED | BLOCKED | n.v.t.   | BLOCKED | BLOCKED | BLOCKED |
| Gebruikers- en rechtenbeheer                        | BLOCKED | n.v.t.  | n.v.t.   | BLOCKED | BLOCKED | BLOCKED |
| School A kan School B niet benaderen via API        | BLOCKED | BLOCKED | BLOCKED  | n.v.t.  | n.v.t.  | BLOCKED |
| Uitloggen en sessiebeëindiging                      | BLOCKED | BLOCKED | BLOCKED  | BLOCKED | BLOCKED | BLOCKED |
| Account verwijderen en sessies opnieuw gebruiken    | BLOCKED | n.v.t.  | n.v.t.   | BLOCKED | BLOCKED | BLOCKED |
| TOTP-MFA inschrijven en verifiëren                  | BLOCKED | BLOCKED | BLOCKED  | BLOCKED | BLOCKED | BLOCKED |
| Navigatie en formulieren op gangbare schermformaten | BLOCKED | BLOCKED | BLOCKED  | BLOCKED | BLOCKED | BLOCKED |

Samenvatting: **2 PASS, 0 FAIL, 11 BLOCKED**. De blokkades zijn geen functionele goedkeuring; de live acceptatie moet volledig opnieuw worden uitgevoerd zodra veilige staging bestaat.

## Reeds geleverd lokaal bewijs

- Een volledige lokale database-reset met de lokale migratieketen slaagde.
- De pgTAP/RLS-testset slaagde met 24 van 24 tests.
- De lokale security advisor meldde geen bevindingen.
- Typecontrole, lint, build en portability-controle slaagden tijdens Fase 1.
- De Fase 1-migratie staat lokaal in `supabase/migrations/20260809180724_phase1_identity_school_people_security.sql`.

Dit bewijs ondersteunt de status **READY FOR TEST** van de lokale Fase 1-code, maar vervangt geen staging-acceptatie.

## Accountverwijdering en sessies

De beheerfunctie verwijdert een gebruiker via Supabase Admin Auth (`deleteUser`). De referentiële gevolgen zijn lokaal in schema en tests behandeld, maar het gedrag van reeds uitgegeven access- en refresh-tokens is niet in een live stagingomgeving bewezen. Daarom mag niet worden aangenomen dat alle bestaande sessies onmiddellijk onbruikbaar zijn. De acceptatietest moet na verwijdering zowel een bestaand access-token, refreshpoging als een nieuw loginverzoek controleren.

## MFA-status en uitrolplan

De applicatie bevat TOTP-inschrijving, challenge en verificatie. Er is nog geen bewezen stagingtest en geen aantoonbare algemene AAL2-afdwinging voor gevoelige beheertaken. MFA mag daarom nog niet als afgedwongen beveiligingslaag worden gecommuniceerd.

Veilige uitrolvolgorde:

1. Test inschrijven, herstellen en verwijderen van een TOTP-factor op staging.
2. Test AAL1- en AAL2-sessies per rol en op gevoelige beheerroutes.
3. Introduceer eerst een inschrijfperiode en herstelprocedure voor beheerders.
4. Dwing daarna AAL2 af voor platform- en schoolbeheer, inclusief databasebeleid waar nodig.
5. Breid pas na support- en herstelervaring uit naar overige rollen.

## Open risico's en blokkades

1. Er is geen aantoonbaar gescheiden staging-Supabase-project.
2. Een afzonderlijke staging-hostingomgeving en bijbehorende secrets zijn niet vastgesteld.
3. De lokale en online migratiegeschiedenis divergeren.
4. Er zijn geen veilige, fictieve stagingaccounts voor twee scholen.
5. Live tenantisolatie, CRUD, logout, accountverwijdering, MFA en mobiele werking zijn niet bewezen.
6. Back-up en restore kunnen pas worden getest nadat de stagingomgeving is aangewezen.

## Vereiste vervolgstappen

1. Maak een apart Supabase-project `schoolpulse-staging` aan, zonder productiegegevens.
2. Maak een afzonderlijke staging/preview-hostingomgeving en koppel alleen de staging-secrets.
3. Leg eigenaar, projectreferentie en URL's vast in een niet-geheime omgevingsregistratie.
4. Bouw staging vanaf nul op met de lokale migratieketen; los eventuele migratiefouten op zonder productie te wijzigen.
5. Maak een back-up/restore-proef en laad daarna uitsluitend fictieve gegevens voor twee scholen.
6. Voer de volledige matrix hierboven opnieuw uit en voeg screenshots/logs zonder persoonsgegevens als bewijs toe.

Pas na een volledig geslaagde matrix kan Fase 1A naar **DONE**. Tot die tijd is Fase 2 niet veilig om te starten.
