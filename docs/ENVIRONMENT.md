# Omgevingsvariabelen

Alle hostafhankelijke instellingen staan buiten de broncode. Kopieer `.env.example` naar `.env` voor lokaal gebruik en zet dezelfde waarden in het dashboard van de gekozen host.

| Variabele                       | Betekenis                                       | Vereist             |
| ------------------------------- | ----------------------------------------------- | ------------------- |
| `VITE_SUPABASE_URL`             | Publieke URL van het Supabase-project           | Ja                  |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publieke publishable key van Supabase           | Ja                  |
| `VITE_*_ORIGIN`                 | Publieke oorsprong van ieder Schoolpulse-domein | Voor productie      |
| `PORT`                          | Poort van de Node-server                        | Nee, standaard 3000 |

Voor bestaande omgevingen blijft `VITE_SUPABASE_ANON_KEY` als terugwaarts compatibele fallback werken. Variabelen met `VITE_` worden tijdens de build in browsercode gezet. Plaats daarom nooit een databasewachtwoord, JWT signing key of Supabase service-role key in zo'n variabele.

Supabase Auth-redirects horen bij de databaseomgeving. Voeg na een domeinwijziging de nieuwe app-, admin- en demo-URL toe onder Authentication > URL Configuration voordat DNS wordt omgezet.
