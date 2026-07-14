# Schoolpulse

Schoolpulse is een zelfstandige TanStack Start-app met Supabase als database- en authenticatielaag. De applicatie gebruikt standaard Node.js-uitvoer en kan zonder platform-specifieke code op iedere Node- of Dockerhost draaien.

## Lokaal starten

```bash
cp .env.example .env
npm ci
npm run dev
```

Vul eerst `VITE_SUPABASE_URL` en `VITE_SUPABASE_PUBLISHABLE_KEY` in. De app draait standaard op `http://localhost:3000`.

## Controles

```bash
npm run typecheck
npm run build
npm run portability:check
```

## Documentatie

- [Hosting en verhuizen](docs/HOSTING.md)
- [Omgevingsvariabelen](docs/ENVIRONMENT.md)
- [Databaseoverzicht](docs/DATABASE.md)

De database wordt uitsluitend opgebouwd via de oplopende bestanden in `supabase/migrations`. Er wordt bewust geen demo- of seeddata geladen.
