# SchoolPulse — Long Autonomous Engineering Run eindrapport

**Datum:** 11 augustus 2026

## 1. MFA Recovery

**READY FOR STAGING E2E.** Een geaudite server-only recoveryactie is gebouwd en
op staging gepubliceerd. Tweede AAL2-beheerder, rolhiërarchie, actor ≠ target,
schoolisolatie, verified factor en reden zijn verplicht. Zeven policytests slagen.
Live herstel met twee fictieve platformadmins ontbreekt nog; daarom niet DONE.

## 2. Production Alignment

**EXTERNAL RELEASE APPROVAL REQUIRED.** Production is direct vóór de poging
schoon bevonden. De officiële rollout van alleen migration 39 werd door de extra
productionwritebeveiliging geweigerd en niet omzeild. Production bleef ongewijzigd.

## 3. Security

- RLS/database: **110/110 PASS** (voorheen 108; **2 nieuwe assertions**)
- MFA-policy: **7/7 PASS** (nieuw)
- Readiness/monitoring: **6/6 PASS**
- Nieuwe securityassertions in deze run: **9**
- Totale actieve RLS + MFA securityassertions: **117**
- Staging Advisor: **0 CRITICAL, 0 HIGH, 33 WARN, 1 INFO**
- Production Advisor: **0 CRITICAL, 0 HIGH, 33 WARN, 0 INFO**

De WARNs omvatten vooral bewust authenticated `SECURITY DEFINER`-helpers/RPC's en
uitgeschakelde leaked-password protection. Twee onbedoeld uitvoerbare interne
triggerfuncties zijn via migration 40 gesloten.

## 4. Authorization

53/53 publieke tabellen hebben RLS. 51/51 definerfuncties hebben een vaste
`search_path`; 0/51 zijn uitvoerbaar door `anon`. De rol × module × actiematrix is
vastgelegd. Geen kernactie bleek uitsluitend UI-beveiligd.

## 5. Data Integrity

Twaalf live read-only controles vonden **0** orphaned kernrecords,
schoolmismatches, dubbele actieve inschrijvingen of dubbele actieve
groepslidmaatschappen. Geen onnodige constraintmigration toegevoegd.

## 6. Performance

Geen N+1 of brede `select('*')` in kernservices gevonden. Domeinrequests lopen
parallel en rooster/attendance zijn tijdgebonden. Onbegrensde historische
results/learning-loads op het dashboard zijn P1 vóór meerjarige of multi-school
schaal. Geen indexen zonder queryplanbewijs toegevoegd.

## 7. UX

Geen redesign of risicovolle responsive refactor uitgevoerd. De bestaande drie
viewports uit 1.0 blijven de acceptancebasis; deze run heeft geen nieuwe handmatige
browsermatrix herhaald. Fout-, loading- en empty-state polish blijft geschikt als
afzonderlijk vervolgpakket.

## 8. Pilot tooling

Veilig CSV-contract en fictieve templates toegevoegd voor vakken, lokalen,
klassen, groepen, personeel en leerlingen. Dry-run, rijvalidatie, preview,
transactionele commit, tenantafleiding en rerunregels zijn vastgelegd. Ook is een
praktische eerste-school onboarding/go-no-go-checklist toegevoegd. Er is geen
echte schooldata geïmporteerd en geen productionseed uitgevoerd.

## 9. Architecture

Het typed 1.0-datamodel en de grenzen voor Entra, PWA, messaging, analytics, AI en
roosteroptimalisatie in 1.1 zijn beschreven. AI krijgt later uitsluitend beperkte,
geaudite tools en nooit vrije database- of service-roletoegang. `ProductionApp.tsx`
blijft met circa 149 kB een P1 voor kleine domeinextracties, niet voor een big-bang
refactor.

## 10. Migrations

- Local: **40**
- Staging: **40**
- Production: **38**

Local = staging. Production mist uploadgate 39 en least-privilege hardening 40;
beide vereisen een expliciet productionreleasevenster in chronologische volgorde.

## 11. Production cleanliness

- Auth users: **0**
- Schools: **0**
- Profiles: **0**
- Storage objects: **0**
- `app_records`: **0**

Staging `app_records` bevat één transitional `document`-record en **0 kernmodule-
records**. Staging `file_uploads_enabled = false`.

## 12. External blockers

Volledig bijgehouden in `EXTERNAL_PILOT_ACTIONS.md`:

1. expliciete productionreleasegoedkeuring en rollout migrations 39–40;
2. echte monitoringprovider, credentials, alert owners en proefalarm;
3. leaked-password protection activeren en bewijzen;
4. externe versleutelde backupretentie plus restore;
5. hosting/DNS/Auth-redirect productiecontrole;
6. privacy-, support-, backup- en securityeigenaren benoemen;
7. private malware-scanner vóór het ooit activeren van uploads (geen blocker
   zolang uploads aantoonbaar uit blijven).

## 13. Internal blockers

1. Provision twee volledig fictieve platformadmins en twee schooladmins op staging
   en bewijs recovery, oude access/refresh-tokenweigering, nieuwe TOTP en AAL2
   end-to-end.

## 14. Technical status

`TECHNICALLY BLOCKED`

Reden: de MFA-implementatie is gereed, maar het verplichte live stagingbewijs is
nog niet uitgevoerd. Productiondrift is daarnaast nog extern geblokkeerd.

## 15. Pilot status

`BLOCKED`

Geen echte school onboarden zolang het interne MFA-bewijs ontbreekt. Daarna blijft
`EXTERNAL ACTION REQUIRED` gelden totdat de production- en operationele P0's zijn
afgetekend.

## 16. Commits uit deze run

1. `813933d` — feat(security): add audited MFA recovery command
2. `4622bec` — docs(release): record production approval gate
3. `a51ebea` — test(security): close trigger RPC grants
4. `2a7e0f9` — docs(data): record staging integrity audit
5. `3c6e1c3` — docs(performance): audit core query patterns
6. `56ad5a2` — docs(security): audit client bundle configuration
7. `208cde3` — docs(pilot): define safe CSV import contract
8. `a0bb443` — docs(pilot): add first-school onboarding gate
9. `add1dc4` — docs(architecture): document typed data model
10. `57b0e16` — docs(architecture): prepare guarded 1.1 extensions

## 17. Volgende stap

1. Rond het fictieve MFA-recoveryscenario op staging live af.
2. Laat een release-eigenaar production migrations 39–40 expliciet goedkeuren en
   rol ze na een nieuwe lege preflight uit.
3. Richt monitoring, leaked-password protection en externe backups in en doorloop
   daarna de onboardingchecklist als formele go/no-go.

Er is geen nieuwe productfeature gestart.
