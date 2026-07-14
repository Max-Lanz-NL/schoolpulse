# Hosting en binnen tien minuten verhuizen

De productiebuild is een gewone Node.js-server in `.output/server/index.mjs`. Er is geen code nodig van een specifieke websitebuilder of hostingprovider.

## Snelste route: Docker

1. Clone de repository op de nieuwe host.
2. Kopieer `.env.example` naar `.env` en vul de twee Supabasewaarden en gewenste domeinen in.
3. Start met `docker compose up -d --build`.
4. Controleer `https://jouwdomein/healthz`; dit moet JSON met `status: ok` geven.
5. Zet de DNS-records naar de nieuwe host en voeg de nieuwe URL's toe aan Supabase Auth Redirect URLs.

## Zonder Docker

Gebruik Node.js 22 of nieuwer:

```bash
npm ci
npm run build
npm start
```

De host moet inkomend verkeer naar `PORT` doorsturen. Op platformen die Nitro automatisch herkent kan `NITRO_PRESET` desgewenst tijdens de build worden gezet; zonder instelling wordt de universele Node-server gebouwd.

## Database naar een ander Supabase-project

```bash
npx supabase link --project-ref NIEUWE_PROJECT_REF
npx supabase db push
```

Vervang daarna alleen `VITE_SUPABASE_URL` en `VITE_SUPABASE_PUBLISHABLE_KEY` en bouw opnieuw. Maak gebruikers via de beheerde accountflow aan; migrations bevatten expres geen persoonsgegevens of demo-accounts.

## Terugrol

Laat de oude host actief tot `/healthz`, login, admin, demo en één databasehandeling op de nieuwe host zijn getest. DNS kan dan zonder codewijziging worden teruggezet.
