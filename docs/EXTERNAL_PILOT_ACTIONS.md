# SchoolPulse — externe pilotacties

**Datum:** 11 augustus 2026

Dit overzicht bevat alleen acties waarvoor een mens, leverancieraccount of
externe infrastructuur nodig is. Geen van deze punten mag met een mock of een
beveiligingsversoepeling worden afgevinkt.

| Actie | Waarom nodig | Pilotblocker | Exacte menselijke actie | Later bewijs |
|---|---|---:|---|---|
| Production migration 39 vrijgeven | Production mist de server-side, fail-closed uploadgate | YES | Release-eigenaar geeft expliciet een productionwritevenster vrij voor uitsluitend `20260811135445_pilot_file_upload_gate.sql` | Preflight blijft 0/0/0/0, migrationpariteit 39/39/39, flag `false`, bypass-tests en Security Advisor |
| Monitoringprovider activeren | Uptime- en applicatiefouten moeten bij een benoemde eigenaar aankomen | YES | Kies provider, maak EU-geschikte omgeving, stel credentials/alerts/retentie en primaire plus reserve-eigenaar in | Proefalarm ontvangen, ticket vastgelegd, persoonsgegevens ontbreken in eventpayload |
| Leaked-password protection activeren | Bekende gelekte wachtwoorden moeten voor pilotaccounts worden geweigerd | YES | Activeer de Supabase Auth-dashboardinstelling of een aantoonbaar gelijkwaardige dienst | Negatieve test met een door de provider aangewezen testwachtwoord en screenshot/config-export zonder geheimen |
| Private malware-scanner provisionen | Uploads mogen pas open na echte inhoudsscanning | NO zolang uploads uit blijven | Richt een private EU-scannerworker in, plaats endpoint/token als serversecret en benoem beheerder | Clean-, EICAR-, timeout- en scanner-failure-tests; pas daarna gate gecontroleerd activeren |
| Externe versleutelde backups inrichten | Lokale restoreproof is geen operationele off-site retentie | YES | Kies versleutelde opslag, eigenaar, retentie en toegang; plan database- en Storage-export | Geslaagde kwartaalrestore uit de externe kopie met hashes en herstelrapport |
| Hosting en DNS productie afronden | Gebruikers moeten alleen via het beheerde productiedomein en correcte Auth redirects werken | YES | Controleer Vercel-project, productievariabelen, DNS, TLS, Site URL en redirect allowlist | Login/reset/MFA op productiedomein, preview gebruikt geen productionsecret, rollbacktest |
| Privacy- en supporteigenaren benoemen | AVG-verzoeken en verhoogde supporttoegang vereisen menselijke verantwoordelijkheid | YES | Leg verwerkingsafspraken vast en wijs privacy-, security-, backup- en supporteigenaren plus vervangers aan | Ondertekende checklist, getimede inzage-/verwijderoefening en geaudite supporttoegang |

## Geen externe actie

De resterende live MFA-recoverytest is intern technisch werk: eerst volledig
fictieve stagingbeheerders provisionen en daarna de reeds gebouwde route end-to-end
bewijzen. Dit punt staat daarom niet als externe blocker in deze tabel.
