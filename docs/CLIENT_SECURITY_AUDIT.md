# SchoolPulse — production bundle- en clientsecurity-audit

**Datum:** 11 augustus 2026  
**Resultaat:** PASS met externe configuratiecontrole vóór release.

## Repositorybewijs

- Alleen `.env.example` is door Git gevolgd; echte `.env`-bestanden niet.
- Clientconfiguratie accepteert uitsluitend Supabase URL plus publishable/legacy
  anon key. Deze waarden zijn publiek bedoeld en beveiliging rust op RLS.
- `SUPABASE_SERVICE_ROLE_KEY` komt alleen voor in de server-side Edge Function en
  wordt daar uit de beheerde runtimeomgeving gelezen.
- Geen hardcoded `sb_secret`, databaseconnectionstring, private key of
  service-role waarde gevonden in gevolgde applicatiecode.
- Geen tokenlogging of handmatige opslag van access-/refreshtokens gevonden.
- Monitoringcredentials gebruiken server-only namen zonder `VITE_`.
- Vite publiceert geen custom `define`-secrets en schakelt geen expliciete
  productie-sourcemaps in.
- Foutmeldingen naar eindgebruikers bevatten geen credentials; serverfuncties
  retourneren begrensde foutteksten.

## Releasecontrole

Een repositoryscan kan de daadwerkelijke Vercel-variabelen niet bewijzen. De
release-eigenaar controleert daarom vóór productiondeploy:

1. geen service role, databasewachtwoord, monitor-token of private API-key heeft
   een `VITE_`-prefix;
2. production gebruikt project `gqemqvovdrujonlffhen`, preview/staging gebruikt
   nooit productioncredentials;
3. buildlogs en source maps bevatten geen environmentwaarden;
4. monitoring scrubt Authorization, cookies, MFA-materiaal en requestbodies;
5. gecompromitteerde oude variabelen worden geroteerd, niet alleen verwijderd.

Er is geen verdachte secret gevonden die tijdens deze run geroteerd moet worden.
