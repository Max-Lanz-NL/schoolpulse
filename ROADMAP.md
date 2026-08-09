# Schoolpulse-roadmap

Bijgewerkt op 9 augustus 2026. Dit document is de centrale werklijst. Afgeronde marketingdetails blijven daarnaast zichtbaar in `TODO-MARKETING.md`.

## Huidige basis

- [x] Schoolpulse volledig losgemaakt van externe app-builders.
- [x] Nieuwe openbare GitHub-repository gestart met één schone begincommit.
- [x] Vercel opnieuw verbonden met `Max-Lanz-NL/schoolpulse`.
- [x] Schone productieversie succesvol gebouwd en gepubliceerd via Vercel.
- [x] Productiedomeinen, TanStack Start, Node.js en Supabase-browservariabelen gecontroleerd.
- [x] Alle 21 Supabase-migraties in de repository behouden.
- [x] TypeScript, lint, portabiliteit en productie-build gecontroleerd.

## Teststatus

- [x] Publieke website op `schoolpulse.nl` opent correct.
- [x] Productielogin op `app.schoolpulse.nl` opent correct.
- [x] Demo getest als leerling, docent, ouder, teamleider en directie.
- [x] Alle 56 zichtbare rol/module-combinaties openen zonder 404 of zichtbare foutmelding.
- [ ] Voeg een aparte mentorrol toe aan de demorollen, of leg vast dat mentor via de docentrol wordt gedemonstreerd.
- [ ] Achterhaal of herstel representatieve productie-testaccounts; inloggegevens staan bewust niet in de repository.
- [ ] Test productie als platformbeheerder, directie, teamleider, docent, mentor, ouder en leerling.
- [ ] Controleer per productieaccount dat uitsluitend de juiste modules, schoolgegevens en gekoppelde personen zichtbaar zijn.

## Eerstvolgende prioriteiten

- [ ] Controleer welke van de 21 Supabase-migraties al op productie zijn uitgevoerd en pas uitsluitend ontbrekende migraties toe. De leescontrole op 9 augustus 2026 bereikte Supabase, maar liep tweemaal vast op een externe timeout bij het tijdelijke database-account; er is niets toegepast.
- [ ] Test de belangrijkste workflows met echte testgegevens: rooster, berichten, absentie, cijfers, opdrachten en ouder-kindkoppelingen.
- [ ] Controleer RLS-beveiliging zodat gebruikers alleen gegevens van hun eigen school en toegestane rol kunnen zien.
- [ ] Test aanmaken, wijzigen, verwijderen, publiceren en exporteren met de juiste rollen.
- [ ] Test lege statussen, foutmeldingen, verlopen sessies en trage verbindingen.

## Benodigde testaccounts

- [ ] Platformbeheerder met `platform_admin`.
- [ ] Directeur met schoolbrede leestoegang.
- [ ] Teamleider met team-scope.
- [ ] Docent met toegewezen klas, vak en lesgroep.
- [ ] Mentor met gekoppelde mentorleerlingen.
- [ ] Leerling met actieve inschrijving en klas.
- [ ] Ouder/verzorger met actieve koppeling aan uitsluitend de testleerling.

Gebruik unieke tijdelijke wachtwoorden en bewaar die in een wachtwoordmanager, nooit in Git, documentatie of deze roadmap.

## Marketing en verkoop

- [ ] Sluit het offerteformulier aan op de productiebackend of het gekozen CRM.
- [ ] Vervang het tijdelijke telefoonnummer en adres door gecontroleerde bedrijfsgegevens.
- [ ] Voeg drie tot zes privacyveilige screenshots toe aan “Schoolpulse in actie”.
- [ ] Test de volledige offerte- en demoflow op mobiel, tablet en desktop.
- [ ] Voer een eerste-vijf-minuten-review uit voor directie, docent, ouder en leerling.

## Voor livegang

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
- [ ] Voeg een vaste CI-controle toe voor build, lint en tests.
