# SchoolPulse productiebeheer

Dit document is het praktische minimumproces voor een kleine pilotschool. In productie worden alleen noodzakelijke persoonsgegevens verwerkt; de meegeleverde pilotdata zijn volledig fictief.

## Dagelijkse en wekelijkse controle

- GitHub Actions controleert elke zes uur of website, app en beheeromgeving bereikbaar zijn.
- De beheerder bekijkt op werkdagen mislukte productiedeploys en fouten in Supabase Auth, API, Database, Storage en Edge Functions.
- Wekelijks worden openstaande privacyverzoeken, incidenten, mislukte imports en geblokkeerde accounts bekeken.
- Iedere wijziging krijgt een duidelijke commit-titel en beschrijving met aanleiding, effect en uitgevoerde controles.

## Back-up en herstel

SchoolPulse gebruikt momenteel het gratis Supabase-plan. Automatisch herstelbare dagelijkse back-ups zijn contractueel alleen beschikbaar op betaalde plannen. Daarom geldt voor de pilot:

1. Maak vóór iedere grote import of schemawijziging een logische database-export met `supabase db dump`.
2. Bewaar de export versleuteld buiten Supabase, met toegang voor maximaal twee aangewezen beheerders.
3. Exporteer Storage-bestanden afzonderlijk; een databaseback-up bevat alleen de bestandsregistratie.
4. Bewaar wekelijkse exports vier weken en maandexports twaalf maanden, tenzij het verwerkingsregister een kortere termijn voorschrijft.
5. Test elk kwartaal herstel in een aparte, niet-productieomgeving en leg datum, uitvoerder, duur en uitkomst vast.

Een automatische database-export kan pas veilig worden aangezet nadat een versleutelde opslaglocatie en een databasegeheim als GitHub Secret zijn ingericht. Geen databasewachtwoord wordt in broncode opgeslagen.

## Incident en support

- Normale support: `info@schoolpulse.nl`, met URL, rol, tijdstip, verwachting, werkelijke uitkomst en een veilige schermafbeelding.
- Privacyvragen: `privacy@schoolpulse.nl`.
- Stuur nooit wachtwoorden, herstelcodes, databaseverbindingen of volledige leerlingdossiers mee.
- Bij een mogelijk datalek: beperk toegang, verwijder geen bewijs, noteer tijdlijn en betrokken gegevenstypen en informeer direct de privacyverantwoordelijke van de school.
- De privacyverantwoordelijke beoordeelt of melding bij de Autoriteit Persoonsgegevens binnen 72 uur nodig is.

## Privacyverzoeken

1. Registreer verzoektype: inzage, correctie, verwijdering, beperking of dataportabiliteit.
2. Verifieer de identiteit via het bestaande schoolproces; vraag geen extra gegevens die niet nodig zijn.
3. Wijs een behandelaar en uiterste datum toe.
4. Verzamel alleen gegevens van de juiste school en persoon.
5. Laat een tweede bevoegde medewerker de export of wijziging controleren.
6. Leg beslissing en uitvoering vast. Verwijder niets waarvoor een wettelijke bewaarplicht geldt.

## Vrijgavecheck kleine school

- Twee afzonderlijke schoolaccounts kunnen uitsluitend hun eigen schoolgegevens lezen en wijzigen.
- Leerling, ouder, docent, mentor en schoolbeheerder zijn getest op lezen, schrijven, goedkeuren en verwijderen.
- Een gemengd CSV- en XLSX-bestand levert dezelfde geldige regels en dezelfde foutmeldingen op.
- Een toegepaste testimport is volledig teruggedraaid en aantallen zijn voor en na gecontroleerd.
- 2FA is minimaal voor beheerders ingeschakeld; herstel of een tweede factor is buiten het primaire apparaat veilig geregeld.
- De monitoringtest is groen en een hersteloefening is vastgelegd.

