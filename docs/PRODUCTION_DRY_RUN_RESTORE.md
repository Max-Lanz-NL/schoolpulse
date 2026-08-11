# SchoolPulse — Production Dry Run & Restore Proof

**Datum:** 11 augustus 2026  
**Production:** `schoolpulse-production` (`gqemqvovdrujonlffhen`)  
**Staging:** `schoolpulse-staging` (`ggucscfzakfvlfwyiuot`)  
**Resultaat:** **PASS**

Het legacyproject `edaotduwzyvkszcstxsa` is niet als target gebruikt en niet gewijzigd.

## Schone production-opbouw

Voor deployment bevatte production 0 migrations, 0 publieke tabellen, 0 Auth-gebruikers, 0 Storage-objecten en 0 buckets. Alle 38 lokale migrations zijn chronologisch toegepast zonder `migration repair`, handmatige schemawijziging of wijziging van bestaande migrations.

Na deployment bevatten local, staging en production elk 38 migrationversies. Er zijn geen alleen-local, alleen-staging of alleen-production versies. Production bevat 52 publieke tabellen; RLS staat op alle 52. De private bucket `school-files` is door migrations aangemaakt. De Security Advisor rapporteerde 0 HIGH en 0 CRITICAL; 33 WARN-meldingen betreffen geïnventariseerde `SECURITY DEFINER`-RPC's die door de bestaande RLS-suite worden afgedekt. Anon kan geen publieke `SECURITY DEFINER`-functie uitvoeren.

## Production smoke en tenantisolatie

Twee expliciet tijdelijke, fictieve scholen en vier tijdelijke fictieve accounts zijn aangemaakt. Bewezen zijn:

- password-authenticatie, profielkoppeling, schoolcontext en `school_admin`-rol;
- schooljaar, vak, klas, lesgroep en lokaal;
- leerling- en personeelsdossier, inschrijving en onderwijsrelaties;
- één roosterles, attendance-record, assessment, gepubliceerd cijfer en opdracht;
- School A zag via de Data API uitsluitend School A; een write met een bekend School B-ID werd server-side geweigerd.

Na de test zijn alle afhankelijke onderwijs- en rolrecords, scholen en Auth-gebruikers transactioneel verwijderd. Eindcontrole production: 0 Auth-gebruikers, 0 scholen, 0 profielen, 0 leerlingen, 0 personeelsrecords, 0 rooster-, attendance-, assessment-, grade- en assignmentrecords en 0 Storage-objecten. Alleen schema, migrations en de lege private bucket blijven bestaan.

## Databasebackup en afzonderlijke restore

De genegeerde lokale export `.pilot-recovery/staging-public-data.sql` bevat uitsluitend fictieve publieke stagingdata en geen Auth-schema, wachtwoordhashes, tokens of sessies. De herstelproef gebruikte een afzonderlijke lokale Supabase/Postgres-database:

1. database volledig leeg opnieuw opgebouwd met 38 migrations;
2. tien gesanitiseerde Auth-identiteiten met dezelfde UUID's aangemaakt, zonder bruikbare wachtwoorden of sessiemateriaal;
3. publieke applicatiedata geïmporteerd;
4. globale, door migrations beheerde catalogi (`role_templates`, `permission_definitions`, `role_template_permissions`) niet opnieuw geïmporteerd;
5. aantallen, school-IDs, foreign keys en tenantrelaties vergeleken.

De eerste proefimport bewees waarom catalogidata moet worden uitgesloten: PostgreSQL weigerde terecht een dubbele `role_templates`-sleutel. Na een nieuwe volledig schone rebuild slaagde de gedocumenteerde applicatiedatarestore.

| Domein | Voor backup | Na restore |
| --- | ---: | ---: |
| Scholen | 2 | 2 |
| Profielen | 10 | 10 |
| Leerlingen | 4 | 4 |
| Personeel | 6 | 6 |
| Inschrijvingen | 4 | 4 |
| Klassen | 2 | 2 |
| Groepen | 2 | 2 |
| Rooster | 10 | 10 |
| Attendance | 6 | 6 |
| Assessments | 4 | 4 |
| Grades | 7 | 7 |
| Assignments | 4 | 4 |

De twee school-UUID's kwamen exact overeen. Er waren 0 verweesde leerling-, personeels- of inschrijvingsrecords en 0 cross-school rooster-, attendance- of graderelaties. **Database restore: PASS.**

## Auth, Storage en omgevingen

De databaseprocedure bewijst herstel van publieke applicatiedata, niet volledige Supabase Auth recovery. Auth vereist een beheerde platformrestore of gecontroleerde accountreprovisioning en daaropvolgende wachtwoordreset/MFA-herinschrijving. Password hashes, refresh tokens, sessies, verificatietokens en TOTP-secrets horen niet in de applicatie-export of Git.

Storage-schema, private bucket en policies zijn aanwezig. Objectbackup en -restore zijn niet bewezen omdat er bewust geen objecten in production zijn geplaatst. Hiervoor blijft een afzonderlijke P0 open met versleutelde objectkopie, manifest en checksumvergelijking.

Voor hosting geldt het volgende releaseplan:

- `main` / Vercel Production gebruikt uitsluitend production URL en production publishable key voor `gqemqvovdrujonlffhen`;
- previews/staging gebruiken uitsluitend staging URL en staging publishable key voor `ggucscfzakfvlfwyiuot`;
- service-role, database-, mail- en monitoringsgeheimen blijven server-side en per omgeving gescheiden;
- `app.schoolpulse.nl` wordt pas omgeschakeld na controle van Production-variabelen, Auth Site URL en redirect allowlist voor login, e-mailverificatie, reset en MFA.

De bestaande hosting is in deze dry run niet blind gewijzigd. De repository ondersteunt de scheiding via `VITE_SUPABASE_URL` en `VITE_SUPABASE_PUBLISHABLE_KEY`; geen secrets zijn toegevoegd.

## Quality en security

- RLS/security: **PASS — 6 bestanden, 97 assertions**
- Typecheck: **PASS**
- Lint: **PASS**
- Productiebuild: **PASS**
- Portabiliteit: **PASS**
- Production Security Advisor: **0 HIGH, 0 CRITICAL, 33 WARN**

## Conclusie

De nieuwe productiondatabase kan reproduceerbaar vanaf nul worden opgebouwd, de production-like kernflow en tenantisolatie zijn bewezen, production is weer datavrij en publieke staging-applicatiedata is succesvol in een afzonderlijke database hersteld. Deze opdracht is **PASS**. De totale pilotvrijgave blijft **BLOCKED** door andere operationele P0's.
