# SchoolPulse 1.0 — Fase 1A acceptatierapport

Datum: 10 augustus 2026  
Status: **BLOCKED**  
Scope: uitsluitend stagingacceptatie van Fase 1 (Identity + School + People)  
Stagingproject: `schoolpulse-staging` (`ggucscfzakfvlfwyiuot`)  
Beschermd oud project: `edaotduwzyvkszcstxsa` — niet gebruikt

## A. Besluit

De stagingbasis, echte Auth-logins, tenantisolatie, getypeerde tabellen, rolbeperkingen, sessies, TOTP en responsieve werking zijn grotendeels bewezen. Fase 1A kan nog niet naar DONE omdat:

1. de verplichte herhaling van de lokale RLS-suite niet kon starten doordat Docker Desktop niet actief is;
2. de productie-UI voor schoolstructuur alleen een leesoverzicht bevat en geen CRUD-formulieren aanbiedt;
3. TOTP werkt, maar AAL2 wordt na een nieuwe login niet door de applicatie afgedwongen.

## B. Omgevingscontrole

- Actieve en gebruikte projectref: `ggucscfzakfvlfwyiuot`.
- Projectnaam: `schoolpulse-staging`.
- Status tijdens acceptatie: `ACTIVE_HEALTHY`.
- Voor elke databasewrite is de projectidentiteit opnieuw gecontroleerd.
- Het oude project `edaotduwzyvkszcstxsa` is niet gelezen of gewijzigd.
- Er is geen publieke staginghost vastgesteld. De frontend is lokaal tegen staging getest met `VITE_FORCE_PRODUCTION_APP=true`.

## C. Migraties en schema

- Staging bevat 28 migrations, chronologisch toegepast tot en met `20260809202000_harden_function_execute_privileges`.
- Alle 52 publieke basistabellen hebben RLS.
- Anonieme tabeltoegang is ingetrokken.
- Data API-toegang en functie-executierechten zijn eerder gehard en gecontroleerd.
- De acceptatiedata gebruikt uitsluitend officiële, getypeerde tabellen.

## D. Fictieve acceptatiedata

Twee volledig fictieve scholen zijn geladen:

- SchoolPulse Testcollege A
- SchoolPulse Testcollege B

Per school aanwezig: 1 schooladmin, 1 docent, 2 leerlingen, huidig schooljaar, periode, opleiding, 2 vakken, klas, lesgroep, locatie, 2 lokalen, personeelsrecords, leerlingrecords, inschrijvingen en vak-/groepstoewijzingen.

Eindtelling: 8 Auth-users, 2 scholen, 8 profielen, 4 leerlingen, 4 personeelsleden, 4 vakken, 2 klassen, 2 lesgroepen en 4 lokalen. `app_records` bleef 0.

## E. Auth-accounts en login

Alle acht stagingaccounts zijn echte, bevestigde Supabase Auth-accounts met tijdelijke wachtwoorden buiten Git. Bewezen echte logins:

- schooladmin A en B;
- docent A en B;
- leerling A1 en B1.

De overige leerlingaccounts zijn op dezelfde manier aangemaakt en gekoppeld. Profiel, school, legacyrol en officiële roltoewijzing zijn gecontroleerd.

## F. Schooladmin A

PASS:

- echte login en profiel-/schoolcontext;
- zicht op uitsluitend de 4 accounts van School A;
- officiële leerlingen-, personeels- en rechtenweergaven;
- Data API CRUD op `subjects`, `school_classes`, `teaching_groups` en `rooms`, inclusief update en verwijdering van tijdelijke records;
- alle tijdelijke CRUD-records zijn na de test verwijderd.

BLOCKED:

- dezelfde schoolstructuur-CRUD is niet via zichtbare productieformulieren uit te voeren; de pagina toont alleen tellingen.

## G. Docent A

PASS:

- echte login met docentrol;
- alleen docentmodules in navigatie;
- alleen toegewezen leerlingen, vakken en groepen via Data API;
- geen toegang tot gebruikersbeheer;
- inserts in schoolstructuur worden door RLS geweigerd;
- updates op adminprofielen of School B leveren nul gewijzigde rijen op.

## H. Leerling A1

PASS:

- echte login en eigen identiteit;
- alleen leerlingmodules in navigatie;
- alleen eigen profiel, leerlingrecord, inschrijving en groepslidmaatschap;
- geen toegang tot de leerlingenbeheerpagina;
- inserts in schoolstructuur worden door RLS geweigerd;
- updates op adminprofielen of School B leveren nul gewijzigde rijen op.

## I. Tenantisolatie School A/B

Voor admin A, docent A en leerling A1 zijn bekende School-B-ID's opgevraagd voor scholen, profielen, vakken, klassen, lesgroepen, lokalen en leerlingrecords. Iedere combinatie leverde 0 rijen op, zonder dat School-B-data uitlekte. Cross-school updates leverden eveneens 0 gewijzigde rijen op.

Conclusie: tenantisolatie voor de geteste Fase 1-tabellen is live via de publieke Data API bewezen.

## J. Getypeerde tabellen

De app leest School A uit `profiles`, `student_records`, `staff_records`, `school_years`, `school_periods`, `education_programmes`, `subjects`, `school_classes`, `teaching_groups`, `rooms`, `student_enrolments`, `teacher_subject_assignments`, `teacher_group_assignments` en `student_group_memberships`.

`app_records` bevatte voor, tijdens en na de acceptatie 0 rijen.

## K. Schermformaten

De productie-UI is in de in-app browser getest op:

- 390 × 844: mobiel menu aanwezig, geen horizontale overflow;
- 768 × 1024: dashboard bruikbaar, geen horizontale overflow;
- 1440 × 900: desktopdashboard bruikbaar, geen horizontale overflow.

De tijdelijke viewportoverride is na de test teruggezet.

## L. Sessies, logout en accountverwijdering

PASS:

- actieve sessie vastgesteld;
- refresh-tokenflow geslaagd;
- logout geslaagd en lokale sessie daarna afwezig;
- verboden routes tonen een duidelijke pagina “Geen toegang tot dit onderdeel”;
- een extra fictief verwijderaccount is aangemaakt en daarna verwijderd;
- zowel de Auth-user als het gekoppelde profiel waren daarna afwezig;
- de vaste acht acceptatieaccounts bleven behouden.

## M. TOTP en AAL

PASS:

- TOTP-factor voor schooladmin A ingeschreven;
- challenge en codeverificatie geslaagd;
- factorstatus `verified`;
- sessie ging van AAL1 naar AAL2.

Na uitloggen en opnieuw inloggen was `currentLevel=aal1` en `nextLevel=aal2`. De applicatie liet de wachtwoordlogin toe zonder verplichte tweede challenge.

**AAL2 enforced: NO.**

## N. Geautomatiseerde kwaliteit

| Controle | Resultaat |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS |
| `npm run portability:check` | PASS |
| `npm run test:rls` | BLOCKED — lokale Postgres niet bereikbaar |
| Lokale Supabase-start | BLOCKED — Docker Desktop niet actief |

De RLS-suite was in de voorafgaande hardeningrun 35/35 groen, maar de expliciet gevraagde herhaling in deze acceptatieronde is niet voltooid en telt daarom niet als nieuwe PASS.

## O. Eindstatus en vervolg

Eindstatus: **BLOCKED**

Fase 2 (rooster) veilig starten: **NO**.

Benodigd voor herbeoordeling:

1. Docker Desktop starten en `npm run test:rls` opnieuw 35/35 laten slagen.
2. Zichtbare CRUD-formulieren voor vakken, klassen, lesgroepen en lokalen toevoegen of de acceptatie-eis expliciet beperken tot Data API CRUD.
3. AAL2 afdwingen voor ten minste schooladmin- en platformadminflows en herlogin testen.
4. Daarna deze volledige matrix opnieuw beoordelen; Fase 2 niet automatisch starten.
