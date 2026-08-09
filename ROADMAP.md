# Schoolpulse roadmap

Bijgewerkt op 9 augustus 2026. Dit document is de centrale werklijst. Afgeronde marketingdetails blijven daarnaast zichtbaar in `TODO-MARKETING.md`.

## Huidige basis

- [x] Uitgebreide applicatieversie uit `.codex-push` samengevoegd met de hoofdmap.
- [x] Extra modules toegevoegd: begeleiding, betalingen, integraties, notificaties, ouderkoppelingen en rechten aanvragen.
- [x] Adminfuncties toegevoegd voor rollen, rechten, schoolstructuur, relaties en documentatie.
- [x] Alle 21 Supabase-migraties bij elkaar gebracht.
- [x] Broncode geformatteerd.
- [x] Productie-build en lintcontrole succesvol uitgevoerd.
- [x] Herstelkopie gemaakt in `artifacts/cleanup-backup-20260809`.

## Eerstvolgende prioriteiten

- [ ] Publiceer de zelfstandige app in een nieuwe, schone repository met één begincommit.
- [ ] Controleer welke van de 21 Supabase-migraties al op productie zijn uitgevoerd en pas uitsluitend ontbrekende migraties toe. De leescontrole op 9 augustus 2026 bereikte Supabase, maar liep tweemaal vast op een externe timeout bij het tijdelijke database-account; er is niets toegepast.
- [ ] Configureer en test productievariabelen voor Supabase zonder geheime waarden in de broncode op te slaan.
- [ ] Test inloggen en rechten voor beheerder, directie, teamleider, docent, ouder en leerling.
- [ ] Test de belangrijkste workflows met echte databasegegevens: rooster, berichten, absentie, cijfers, opdrachten en ouderkoppelingen.
- [ ] Controleer RLS-beveiliging zodat gebruikers alleen gegevens van hun eigen school en toegestane rol kunnen zien.

## Marketing en verkoop

- [ ] Sluit het offerteformulier aan op de productiebackend of het gekozen CRM.
- [ ] Vervang het tijdelijke telefoonnummer en adres door gecontroleerde bedrijfsgegevens.
- [ ] Voeg drie tot zes privacyveilige screenshots toe aan “Schoolpulse in actie”.
- [ ] Test de volledige offerte- en demoflow op mobiel, tablet en desktop.
- [ ] Voer een eerste-vijf-minuten-review uit voor directie, docent, ouder en leerling.

## Voor livegang

- [x] Maak Schoolpulse volledig zelfstandig met standaard Vite, TanStack Start, Node en Docker zonder platformspecifieke runtime.
- [ ] Voer een volledige acceptatietest uit met lege statussen, foutmeldingen en trage verbindingen.
- [ ] Controleer privacyteksten, algemene voorwaarden, bewaartermijnen en verwerkersafspraken.
- [ ] Richt monitoring, foutregistratie, databaseback-ups en herstelprocedures in.
- [ ] Maak een productiechecklist voor domeinen, e-mail, DNS, SSL en Supabase.

## Zodra de eerste school live is

- [ ] Voeg na schriftelijke toestemming het schoollogo en een testimonial toe.
- [ ] Maak een case study met startsituatie, implementatie en resultaat.
- [ ] Vervang algemene vertrouwensclaims door aantoonbare cijfers en praktijkbewijs.

## Later / technisch onderhoud

- [ ] Werk de zeven niet-blokkerende React Fast Refresh-waarschuwingen weg.
- [ ] Voeg geautomatiseerde tests toe voor authenticatie, rollen/rechten en kritieke gebruikersflows.
- [ ] Voeg een vaste CI-controle toe voor build, lint en tests zodra Git is hersteld.
- [ ] Verwijder `.codex-push` en de herstelkopie pas nadat de herstelde Git-versie veilig extern is opgeslagen.
