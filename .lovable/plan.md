
# Schoolpulse — Grote update (Leerling + Docent + Mobiel)

Dit is een omvangrijke wijziging over meerdere modules en rollen. Hieronder de opbouw per onderdeel, met per punt wat er verandert en welke bestanden worden aangepast/toegevoegd.

## 1. Leerling — Rooster
- Dagrooster wordt de standaardweergave (nu is week de default).
- Toggle-knop toevoegen: `Dag | Week`.
- Op mobiel (breakpoint `md`): alleen dagweergave, weekknop verborgen.
- Swipe links/rechts op mobiel = volgende/vorige dag (touch handlers op de dagcontainer). Dit is de **enige** toegestane horizontale swipe in de hele app.
- Bestaande "AI-rooster suggestie" blijft verborgen voor leerling/ouder.
- Bestand: `src/routes/app.rooster.tsx`.

## 2. Leerling — Cijfers (volledig opnieuw)
Nieuwe structuur:
- **Tab 1 – Recent** (default): platte lijst van alle cijfers, gesorteerd nieuw → oud, met vak, toets, weging, datum, cijfer.
- **Tab 2 – Cijferoverzicht**: alle vakken, alle cijfers per vak, actueel gemiddelde per vak, én per onvoldoende vak de berekening:
  - "Je hebt nog X cijfer(s) nodig van minimaal Y,Z om op 5,5 uit te komen" (op basis van gewogen gemiddelde, aannemend dat resterende toetsen wegingsgewicht 1 hebben, of 1 extra toets).
  - Voor voldoende vakken toon "voldoende – geen inhaalcijfer nodig".
- Tab 3 – Heel schooljaar blijft.
- Bestand: `src/routes/app.cijfers.tsx`.

## 3. Leerling — Bestanden delen
- ShareModal uitbreiden: personen/groepen toevoegen én weer verwijderen door op de chip te klikken (chip krijgt een ✕ en toont bevestiging via klik).
- Bestand: `src/routes/app.documenten.tsx`.

## 4. Docent — Dashboard
- 4 statistiekvakken worden echte snelkoppelingen (Link naar cijfers/rooster/opdrachten/berichten).
- Meldingenkaart: elk item klikbaar → routet naar het juiste scherm (bericht opent thread, cijfermelding opent cijfers-pagina).
- Nieuw blok **"Nieuwe meldingen"** direct boven "Te beoordelen". Te beoordelen schuift omlaag.
- Bestand: `src/routes/app.index.tsx`.

## 5. Docent — Rooster
- "Bekijk voorstel" opent een modal met een concreet roosterwijzigingsvoorstel (bijv. "verplaats lokaal 204 → 118 op donderdag 5e uur").
- Bij lessen van docent zelf: knoppen "Huiswerk toevoegen / bewerken / verwijderen" in `LesDetailModal`.
- Knop **Absenties** in lesdetail: opent leerlingenlijst met toggle "absent melden". Leerlingen met status `ziek` of `afgemeld` zijn disabled met tooltip.
- Bij eigen les: geen "Bericht docent" knop. Bij les van collega: knop opent direct chat met die docent (`/app/berichten?met=<id>`).
- Aanwezigheid: docenten/teamleiders/directie kunnen nooit als aanwezig/afwezig gemarkeerd worden (filter in absentielijst). Ouders zien wel aanwezigheid eigen kind (readonly weergave).
- Bestand: `src/routes/app.rooster.tsx`.

## 6. Docent — Cijfers (nieuwe view)
Volledig aparte layout voor docenten: **Klas → Leerling → Cijfers**.
- Kies klas (bv. 4A, 4B, 5V).
- Kies leerling.
- Zie cijfers voor het/de vak(ken) waarin deze docent lesgeeft aan deze leerling. Andere vakken zijn niet zichtbaar.
- Acties: cijfer toevoegen, bewerken, verwijderen (in-memory, lokaal).
- Docentspecifieke demo-data (welke vakken/klassen docent geeft) toevoegen aan `demo-data.ts`.
- Bestand: `src/routes/app.cijfers.tsx` splitst op rol.

## 7. Docent — Berichten
- Nieuwe demo-conversaties voor docenten toevoegen naast bestaande set:
  - Collega Nederlands (1-op-1)
  - Groep Sectie Wiskunde
  - Teamleider onderbouw
  - Chat over specifieke leerling
  - Praktisch overleg (bv. surveillance)
- Bestand: `src/lib/demo-data.ts` + `src/routes/app.berichten.tsx` (kiest set o.b.v. rol).

## 8. Docent — Opdrachten
- Volledig andere weergave voor docenten:
  - Lijst opdrachten met acties: **Aanmaken / Bewerken / Verwijderen / Bijlage / Weging / Beoordelen**.
  - "Nieuwe opdracht" modal met titel, vak, klas, deadline, weging, bijlage.
  - Per opdracht "Beoordelen" opent lijst leerlingen met cijferinvoer.
- **AI-controle** knop → modal met professionele progress bar (0→100% in ~2s, `animate-[progress_2s_ease-out]`), daarna resultaatoverzicht (bv. "3 opdrachten: 2 origineel, 1 verdacht 42%").
- Dashboard bovenaan: 4 klikbare vakken:
  - Openstaand · Ingeleverd · **Te laat** (nieuw, tussen Ingeleverd en Beoordeeld) · Beoordeeld · AI-controle (bestaand blijft aparte kaart of vak).
  - Klik filtert de lijst op status.
- **Te laat** overzicht toont leerling, opdracht, hoeveel te laat (dagen/uren).
- Leerlingview blijft grotendeels zoals nu.
- Bestand: `src/routes/app.opdrachten.tsx` + demo-data.

## 9. Activiteiten — Aankondigingen
- Knop "Nieuwe aankondiging" zichtbaar voor **docent / teamleider / directie** (blijft verborgen voor leerling/ouder — al zo).
- Klik opent modal met velden: titel, bericht, bijlage (file input), datum (optioneel), doelgroep (chips: hele school / klas / leerjaar / sectie).
- Aankondiging wordt lokaal toegevoegd aan lijst.
- Bestand: `src/routes/app.activiteiten.tsx`.

## 10. Mobiele UI (globaal)
- Alle pagina's krijgen `overflow-x-hidden` op de main container en `min-w-0` waar nodig.
- Tabellen wrappen in `overflow-x-auto` waar echt nodig, maar cijfers/rooster/opdrachten worden op mobiel omgezet naar kaartlijsten i.p.v. brede tabellen.
- Berichtenlijst blijft dual-pane op ≥md, maar op mobiel wordt het één kolom (lijst → detail via klik, back-knop terug).
- Rooster: docentweekrooster blijft scrollbaar op mobiel? → Nee: docent op mobiel toont ook dagweergave (met dag-picker, geen swipe).
- Enige uitzondering: leerling-dagrooster met horizontale swipe tussen dagen.
- Bestanden: `AppShell.tsx`, alle route-bestanden.

## Technische aanpak
- Nieuwe helper `src/lib/notifications.ts` met gerichte routelinks per meldingtype.
- `demo-data.ts` uitgebreid met:
  - `docentBerichten` (aparte set)
  - `docentKlassen` (klas → leerlingen → vakken)
  - `docentOpdrachten` incl. `status: "te-laat"` en `dagenTeLaat`
  - `leerlingAanwezigheid` per les
- `useSwipe` hook (`src/hooks/use-swipe.tsx`) voor dagrooster mobiel.
- Nieuwe modals als losse componenten in `src/components/`: `HuiswerkModal`, `AbsentiesModal`, `RoosterVoorstelModal`, `NieuweOpdrachtModal`, `BeoordeelModal`, `AICheckModal`, `NieuweAankondigingModal`.
- Rolgebaseerde splitsing in `app.cijfers.tsx` en `app.opdrachten.tsx`: `if (role === "docent") return <DocentX />; else return <LeerlingX />;`.

## Scope-notitie
Dit is een grote bulk-update: ca. 8–10 bestanden aangepast en ~7 nieuwe componenten. Alles blijft frontend/mock-data — geen backend-wijzigingen. Ik implementeer alles in één batch en verifieer daarna dat de build slaagt en de belangrijkste flows werken.
