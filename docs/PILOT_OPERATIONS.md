# SchoolPulse — operationeel pilotrunbook

Dit runbook is een technische en operationele pilotbasis, geen juridisch advies. Een pilotschool wijst vóór onboarding benoemde verantwoordelijken aan en tekent de open P0/P1-punten af.

## Rollen en verantwoordelijkheden

- **Verwerkingsverantwoordelijke:** de pilotschool; bepaalt doelen, grondslagen, toegang en bewaartermijnen.
- **Verwerker:** de SchoolPulse-organisatie; verwerkt uitsluitend volgens de schriftelijke afspraken met de school.
- **Technisch beheerder:** een persoonlijk aangewezen SchoolPulse-beheerder; beheert releases, incidenten en herstel. Geen gedeeld account.
- **Privacycontact school:** beoordeelt inzage, verwijdering, datalekken en wettelijke bewaarplichten.

## Minimale supporttoegang

Platformsupport heeft standaard geen opdracht om leerlingdossiers te openen. Voor iedere supporthandeling wordt vooraf een ticket vastgelegd met:

1. ticketnummer, concrete reden en minimale benodigde gegevens;
2. school, persoonlijke supportmedewerker en toestemminggever van de school;
3. begin- en eindtijd, maximaal vier uur zonder nieuwe toestemming;
4. uitgevoerde handelingen en geraadpleegde recordtypen;
5. afsluiting, uitkomst en bevestiging dat tijdelijke toegang is ingetrokken.

Totdat automatische just-in-time supporttoegang bestaat, gebruikt support een persoonlijk platformaccount, werkt een bevoegde schoolmedewerker mee tijdens het venster en wordt geen data geëxporteerd zonder afzonderlijke toestemming. De platformbeheerder controleert `admin_audit_logs` na afloop. Spoedtoegang volgt hetzelfde logproces en wordt binnen één werkdag achteraf beoordeeld.

## Account- en sessielevenscyclus

- **Aanmaken:** alleen via de beheerde accountflow; tijdelijke uitnodiging via veilig kanaal; minimaal noodzakelijke rol.
- **Blokkeren:** Auth-ban én `profiles.is_blocked=true`. De database geeft een bestaande JWT daarna geen schoolcontext of permissions meer. Blokkeren is omkeerbaar.
- **Deblokkeren:** alleen na identiteits- en autorisatiecontrole; Auth-ban en profielstatus worden samen hersteld.
- **Wachtwoordherstel:** alleen naar het geregistreerde adres. Support ziet of kiest geen wachtwoord.
- **MFA-herstel:** een tweede aangewezen platformbeheerder verifieert de identiteit via de school, trekt actieve sessies in, verwijdert de verloren factor via de beheerde Supabase Auth-beheerroute en verplicht directe herinschrijving. Iedere stap komt in het incident-/supportticket. Dit proces moet nog als echte oefening worden bewezen.
- **Verwijderen:** eerst bewaarplicht en relaties beoordelen, sessies intrekken, exportbesluit vastleggen en pas daarna Auth-account verwijderen. Verwijderen is geen alternatief voor blokkeren.
- **Periodieke review:** maandelijks tijdens de pilot: beheerders, geblokkeerde accounts, ongebruikte accounts en MFA-status.

## MFA-beleid

`platform_admin` en `school_admin` komen na wachtwoordlogin alleen door de app- of adminpoort wanneer `getAuthenticatorAssuranceLevel()` huidig `aal2` meldt. Bij AAL1 moet een bestaande verified TOTP-factor worden geverifieerd of een nieuwe TOTP-factor worden ingeschreven. Docenten, leerlingen en ouders vallen niet onder de verplichte pilotpoort.

Minimaal twee afzonderlijke platformbeheerders moeten vóór de pilot hun eigen factor op verschillende beheerde apparaten hebben. Er worden geen TOTP-secrets, QR-codes of herstelcodes in tickets of broncode bewaard.

## Gegevenscategorieën en voorlopig bewaarbeleid

| Categorie                | Voorlopige pilottermijn                                            | Verwijder-/exportregel                                                  |
| ------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Identiteit en contact    | contractduur + maximaal 3 maanden                                  | Exporteer bij vertrek; verwijder of anonimiseer na bewaarplichtcontrole |
| Inschrijving en relaties | lopend schooljaar + 1 schooljaar                                   | School beslist over wettelijke dossierplicht                            |
| Rooster                  | lopend + vorig schooljaar                                          | Daarna verwijderen tenzij incident-/verantwoordingsgrond                |
| Aanwezigheid/verzuim     | volgens vastgesteld schoolbeleid, voorlopig maximaal 2 schooljaren | Alleen privacycontact kan uitzonderingen goedkeuren                     |
| Cijfers/resultaten       | volgens onderwijs- en archiefplicht van de school                  | Niet automatisch verwijderen bij accountdelete                          |
| Opdrachten/inleveringen  | einde schooljaar + 3 maanden                                       | Leerlingexport vóór verwijdering waar vereist                           |
| Bestanden                | gelijk aan gekoppeld record                                        | Storage-object én `file_assets` samen behandelen                        |
| Auditgegevens            | 12 maanden                                                         | Alleen platformbeheer; niet wijzigbaar door eindgebruikers              |
| Support-/incidentlogs    | 12 maanden, datalekdossier volgens toepasselijk beleid             | Minimaliseer persoonsgegevens en bewaar geen secrets                    |

De school vervangt deze voorlopige termijnen vóór livegang door schriftelijk goedgekeurde termijnen. Bij contracteinde: toegang blokkeren, volledige school-/gebruikersexport aanbieden, retentie- of verwijderbesluit vastleggen, backups volgens hetzelfde besluit laten verlopen en tenantverwijdering alleen met vier-ogen-goedkeuring uitvoeren.

## Inzage, export en datalek

Een gebruikersinzage wordt op `profile.id` en `school_id` verzameld uit profiel, leerling/personeelsrecord, enrolments/memberships, rooster, attendance, grades, assignments/submissions, `file_assets` en relevante auditverwijzingen. Een tweede bevoegde medewerker controleert tenant en volledigheid voordat de versleutelde export wordt verstrekt.

Bij een mogelijk datalek: toegang beperken, geen bewijs verwijderen, tijdlijn en categorieën noteren, technisch beheerder en privacycontact direct informeren, impact en betrokkenen beoordelen en de mogelijke 72-uurs meldtermijn door de verwerkingsverantwoordelijke laten beoordelen.

## Backup en restore

- Database en Storage zijn twee afzonderlijke backupprocessen; databasebackup bevat geen Storage-objectbytes.
- Voor iedere release/import: versleutelde logische database-export naar een goedgekeurde opslaglocatie, maximaal twee beheerders.
- Storage: versleutelde objectkopie plus manifest met bucket, pad, grootte en checksum. Nooit publieke links gebruiken.
- Wekelijks vier weken, maandelijks twaalf maanden, tenzij de goedgekeurde categorie-termijn korter is.
- Kwartaalrestore in een geïsoleerd project: Auth-materiaal nooit via onbeveiligde dump kopiëren; gebruik beheerde restore/snapshot of gesanitiseerde testidentiteiten.
- Controleer na restore aantallen en foreign keys voor people, rooster, attendance, grades, assignments, submissions en bestanden; leg duur en checksums vast.

De production-dry-run heeft de genegeerde public-data-export van fictieve stagingdata na een volledig lege lokale schema-opbouw succesvol hersteld. Door migrations beheerde globale catalogi worden niet als applicatiedata teruggezet. Aantallen, school-IDs, foreign keys en tenantrelaties zijn gelijk gecontroleerd. De afzonderlijke Storage-oefening heeft 6/6 objecten na echt verlies met gelijke grootte en SHA-256 hersteld. De technische restore is bewezen; de versleutelde externe productiebackupbestemming en verantwoordelijkheden moeten nog operationeel worden ingericht.

## Uploadquarantaine

Uploads blijven private en starten als `scan_status=pending`. Alleen de eigenaar kan pending data zien. Brede toegang vereist `scan_status=clean`; `infected` of `suspicious` mag nooit een signed download-URL krijgen. Alleen een vertrouwde serverfunctie met service credentials mag scanstatus wijzigen. Er is nog geen echte scanner aangesloten: uploaddeling blijft daarom fail-closed en de pilot mag geen bestandsinlevering activeren.

## Monitoring, health en logging

- `/healthz` is liveness: alleen `{status, service}`, zonder configuratie.
- `/readyz` controleert fail-closed de Data API en Auth en geeft alleen `healthy`, `degraded` of `unhealthy` met technische dependencylabels; configuratie en foutdetails worden niet vrijgegeven.
- GitHub Actions controleert iedere zes uur publieke webbereikbaarheid.
- Frontendfouten geven het geminimaliseerde `schoolpulse:error`-event; serverfouten gaan naar runtime stderr; Supabase Auth/API/Postgres/Storage-logs staan in Supabase.
- Er is nog geen actieve centrale error sink met alertontvangers, bewaartermijn en bewezen proefalarm. Dit blijft P0 voor pilotvrijgave; zie `MONITORING_AND_ALERTING.md`.
- Logs bevatten geen wachtwoorden, tokens, TOTP-codes, opdrachtinhoud of leerlingnamen. Gebruik alleen ticket-, school- en technische record-ID's wanneer noodzakelijk.

## Omgevings- en secretsscheiding

| Omgeving   | Supabase               | Hosting/Vercel                           | Data                                  |
| ---------- | ---------------------- | ---------------------------------------- | ------------------------------------- |
| Local      | lokale Supabase stack  | lokale `.env`, nooit committen           | fictieve tests, resetbaar             |
| Staging    | `ggucscfzakfvlfwyiuot` | Preview/Staging-variabelen               | uitsluitend fictieve acceptatiedata   |
| Production | `gqemqvovdrujonlffhen` | uitsluitend Vercel Production-variabelen | schema aanwezig; data pas na go/no-go |

Per omgeving bestaan eigen `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, Auth redirects en origins. `VITE_*` is altijd browserpubliek. Databasewachtwoord, service role, signing secrets en monitoringtokens bestaan uitsluitend in de server-/platformsecretstore. Preview krijgt nooit production secrets; production krijgt nooit stagingrefs. Het oude project `edaotduwzyvkszcstxsa` is geen baseline en wordt niet gebruikt.

## Productie dry run en rollback

De releasevolgorde is: repository tag → schone productiondatabase → alle migrations → advisors/RLS → fictieve smoke test → cleanup → afzonderlijke hostingbuild → go/no-go. De externe database-dry-run op `gqemqvovdrujonlffhen` en applicatie-API-koppeling zijn bewezen; Vercel Production en de production Auth-URL's zijn nog niet omgeschakeld.

Rollback bij een mislukte technische release gebruikt eerst hostingrollback. Databasewijzigingen zijn voorwaarts-herstellend; vóór release bestaat een herstelbaar snapshot/dump. Bij pilotstop: alle schoolaccounts blokkeren, sessies intrekken, export aanbieden, data volgens het schoolbesluit behouden, tenant pas na goedkeuring verwijderen en backup-expiratie vastleggen.

## Eerste pilotschool invoeren

1. Maak school en actueel schooljaar handmatig aan.
2. Voeg vakken, klassen, groepen en lokalen via typed beheerschermen of de bestaande gevalideerde importflow toe.
3. Nodig twee beheerders uit en rond AAL2 af.
4. Importeer daarna docenten en leerlingen met minimale velden; controleer foutregels en rollback vóór toepassen.
5. Leg enrolments, group memberships en teacher assignments vast.
6. Laat één beheerder, docent en leerling de tenantisolatie-smoke test uitvoeren.
7. Activeer bestanden niet zolang malware scanning niet operationeel is.
