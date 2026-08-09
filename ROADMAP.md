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
- [x] Supabase-productieproject hersteld van `INACTIVE` naar `ACTIVE_HEALTHY`.
- [x] Bevestigd dat alle 21 productiemigraties zijn toegepast.
- [x] Productie-inlog en rolherkenning getest als platformbeheerder, directeur, teamleider, docent, mentor, ouder en leerling.
- [x] Tijdelijke QA-accounts en koppelingen na de productietest volledig verwijderd; de oorspronkelijke testschool en vijf testaccounts zijn behouden.
- [ ] Voeg een aparte mentorrol toe aan de demorollen, of leg vast dat mentor via de docentrol wordt gedemonstreerd.
- [x] Herstel de foutmelding na accountaanmaak: alle Edge Function-responses bevatten CORS-headers en live accountaanmaak is opnieuw succesvol getest.
- [ ] Sluit 36 `SECURITY DEFINER`-functies af voor de anonieme rol en controleer welke functies uitsluitend voor ingelogde gebruikers of platformbeheer bedoeld zijn.
- [x] Zet voor acht databasefuncties een vaste `search_path` om manipulatie via het zoekschema te voorkomen.
- [ ] Schakel Supabase-bescherming tegen gelekte wachtwoorden in zodra een betaald Supabase-abonnement wordt gekozen; deze functie is niet beschikbaar op Free.
- [ ] Stel via een veilige wachtwoordreset opnieuw bruikbare wachtwoorden in voor de vijf oorspronkelijke testaccounts; wachtwoorden staan bewust niet in de repository.
- [ ] Controleer met gevulde onderwijsrecords per productieaccount dat uitsluitend de juiste modules, schoolgegevens en gekoppelde personen zichtbaar zijn.

## Eerstvolgende prioriteiten

- [x] Controleer welke van de 21 Supabase-migraties al op productie zijn uitgevoerd: alle 21 staan op productie.
- [ ] Test de belangrijkste workflows met echte testgegevens: rooster, berichten, absentie, cijfers, opdrachten en ouder-kindkoppelingen.
- [ ] Controleer RLS-beveiliging zodat gebruikers alleen gegevens van hun eigen school en toegestane rol kunnen zien.
- [ ] Optimaliseer de Supabase-waarschuwingen: 69 niet-geïndexeerde foreign keys, 109 RLS-initplanmeldingen en 57 dubbele permissieve policies. Beoordeel 38 ongebruikte indexen pas na representatieve productiebelasting.
- [ ] Test aanmaken, wijzigen, verwijderen, publiceren en exporteren met de juiste rollen.
- [ ] Test lege statussen, foutmeldingen, verlopen sessies en trage verbindingen.

## Beoordeling voor een kleine school

Getest op 9 augustus 2026 vanuit directie-, teamleider-, docent-, ouder- en leerlingperspectief.

- [x] Iedere hoofdrol heeft een herkenbaar dashboard en een passende, beperkte menustructuur.
- [x] De demo ondersteunt begrijpelijke dagelijkse routes voor rooster, cijfers, berichten, opdrachten, absentie, toetsen, vervanging, rapporten en import.
- [x] Ouder en leerling krijgen een rustig overzicht zonder zichtbare beheerfuncties.
- [x] Docent en teamleider kunnen vanuit signaleringen direct naar de relevante werkstroom.
- [ ] Vul de productieomgeving met representatieve onderwijsgegevens en herhaal alle schrijf- en goedkeuringsprocessen met echte rolrechten.
- [ ] Maak productie-import een aantoonbaar werkende bestandsimport met validatie, foutregels, proefrun en herstelmogelijkheid; de demo toont nu vooral de gewenste ervaring.
- [ ] Maak notificaties, profielbeheer, 2FA-instellingen en documentversiebeheer volledig; delen hiervan melden nog dat ze later beschikbaar komen.
- [ ] Bevestig RLS-isolatie tussen twee afzonderlijke testscholen voordat echte persoonsgegevens worden gebruikt.
- [ ] Richt back-ups, monitoring, incidentafhandeling, privacyprocessen en gebruikerssupport in.

Conclusie: geschikt voor een afgeschermde pilot op een kleine school met parallelle administratie en fictieve of beperkte gegevens. Nog niet geschikt als enige, bedrijfskritische schooladministratie totdat de openstaande productie- en beveiligingstests zijn afgerond.

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
