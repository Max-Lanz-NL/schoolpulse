# Omgevingsvariabelen

Alle hostafhankelijke instellingen staan buiten de broncode. Kopieer `.env.example` naar `.env` voor lokaal gebruik en zet dezelfde waarden in het dashboard van de gekozen host.

| Variabele                       | Betekenis                                       | Vereist             |
| ------------------------------- | ----------------------------------------------- | ------------------- |
| `VITE_SUPABASE_URL`             | Publieke URL van het Supabase-project           | Ja                  |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publieke publishable key van Supabase           | Ja                  |
| `VITE_*_ORIGIN`                 | Publieke oorsprong van ieder Schoolpulse-domein | Voor productie      |
| `VITE_EMAIL_ONLY_TEST_MODE`     | Tijdelijke e-mail-only demo op `app.schoolpulse.nl` | Alleen testfase |
| `PORT`                          | Poort van de Node-server                        | Nee, standaard 3000 |

De e-mail-only testmodus gebruikt uitsluitend fictieve browserdemo-gegevens en maakt geen Supabase-sessie aan. De modus staat standaard aan op `app.schoolpulse.nl`; zet `VITE_EMAIL_ONLY_TEST_MODE=false` vóór echte accounts, schoolgegevens of Azure-aanmelding worden gebruikt.

Voor bestaande omgevingen blijft `VITE_SUPABASE_ANON_KEY` als terugwaarts compatibele fallback werken. Variabelen met `VITE_` worden tijdens de build in browsercode gezet. Plaats daarom nooit een databasewachtwoord, JWT signing key of Supabase service-role key in zo'n variabele.

Supabase Auth-redirects horen bij de databaseomgeving. Voeg na een domeinwijziging de nieuwe app-, admin- en demo-URL toe onder Authentication > URL Configuration voordat DNS wordt omgezet.

## Gescheiden omgevingen

| Omgeving  | Doel                                   | Data                                                | Regels                                                                                |
| --------- | -------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Lokaal    | Ontwikkeling en geautomatiseerde tests | Uitsluitend fictieve fixtures                       | Mag volledig worden gereset                                                           |
| Staging   | Acceptatie van een releasekandidaat    | Uitsluitend fictieve, representatieve onderwijsdata | Eigen Supabase-project, eigen hosting en eigen secrets; nooit gekoppeld aan productie |
| Productie | Dagelijks gebruik door scholen         | Echte persoonsgegevens                              | Alleen wijzigen via een expliciet goedgekeurde release en na back-up                  |

Een project is pas staging als het aantoonbaar als zodanig is ingericht en de projectreferentie, hostingomgeving en secrets afzonderlijk zijn vastgelegd. Een onbekend, gedeeld of alleen als `SchoolPulse` benoemd project geldt als productie totdat het tegendeel is bewezen.

### Vereisten voor staging

- Een afzonderlijk Supabase-project met een herkenbare naam, bijvoorbeeld `schoolpulse-staging`.
- Afzonderlijke `VITE_SUPABASE_URL` en `VITE_SUPABASE_PUBLISHABLE_KEY` in een Preview/Staging-hostingomgeving.
- Geen productie-export of echte persoonsgegevens; alleen fictieve acceptatiedata.
- Een gedocumenteerde eigenaar, back-up/restore-procedure en migratieprocedure.
- Een gecontroleerde migratiegeschiedenis die overeenkomt met de repository voordat `db push` wordt uitgevoerd.
- Auth-redirects die uitsluitend naar de staging-URL's verwijzen.

De actuele acceptatiestatus en gevonden omgevingsblokkades staan in [`PHASE1_ACCEPTANCE.md`](./PHASE1_ACCEPTANCE.md).
