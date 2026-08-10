# SchoolPulse 1.0 — Fase 2 eindrapport

**Status: DONE**  
**Omgeving:** `schoolpulse-staging` (`ggucscfzakfvlfwyiuot`)  
**Datum:** 10 augustus 2026

## A. Scope

Uitsluitend Timetable is geïmplementeerd. Attendance, Results, Learning en Dashboard zijn niet gestart of uitgebreid.

## B. Architectuur

De productieroute gebruikt een eigen typed timetable-laag: UI → query-hook → service → Supabase → RLS/database. `ProductionApp` kiest alleen de werkruimte; roosterlogica staat erbuiten.

## C. Officiële gegevensbron

`timetable_entries` en `substitutions` zijn de enige roosterbronnen. Staging bevat 0 rooster- of vervangrecords in `app_records`.

## D. Database en migrations

Drie additieve migrations zijn toegevoegd. Ze regelen tenantvalidatie, referentievalidatie, conflicten, vervangingen, roltoegang en beperkt leesbare roosterlabels. Alle 31 repository-migrations bouwen een lege database succesvol op. Bestaande migrations zijn niet gewijzigd.

## E. Beveiliging

RLS staat aan op beide rooster-tabellen. Beide hebben vier expliciete CRUD-policies. `anon` heeft 0 grants; `authenticated` heeft expliciete grants die altijd onder RLS vallen. School-, schooljaar-, groep-, vak-, docent-, lokaal- en vervangreferenties worden server-side gecontroleerd.

## F. Rolweergaven

- Leerling: alleen lessen via actieve groepsdeelname of actieve klasinschrijving.
- Docent: alleen eigen lessen en lessen waarop deze als vervanger staat.
- Beheerder/planner: schoolbreed rooster volgens `schedule.*`- en `substitutions.*`-permissies.

## G. Roosterbeheer

Bevoegde gebruikers kunnen lessen maken, aanpassen, annuleren en verwijderen met echte dropdowns voor schooljaar, lesgroep, vak, docent en lokaal. Annuleren bewaart het item en de reden; definitief verwijderen is een aparte, bevestigde handeling.

## H. Weekweergave en filters

De huidige, vorige en volgende week zijn bereikbaar. Beheerfilters bestaan voor docent, groep, vak en lokaal; de weekknoppen bepalen datum/week. De vijf werkdagen tonen tijd, vak, groep, lokaal, docent en status.

## I. Conflicten

Overlappende docent-, lokaal- en groepsbezetting wordt server-side geweigerd met een actiegerichte fout. Aangrenzende lessen zijn toegestaan. Geannuleerde lessen blokkeren geen nieuwe planning.

## J. Onderwijsrelaties

Een oorspronkelijke docent moet in hetzelfde schooljaar aan het vak én op de lesdatum aan de lesgroep gekoppeld zijn. Ontbrekende relaties blokkeren de opslag server-side.

## K. Annuleringen en historie

Status `cancelled` en reden blijven op het roosteritem zichtbaar. `changed` blijft als actuele wijzigingsstatus beschikbaar. Daardoor blijft de huidige toestand uitlegbaar zonder generieke historie-opslag.

## L. Vervangingen

Handmatige vervanging gebruikt `substitutions`. Oorspronkelijke en vervangende docent zijn zichtbaar; dubbele actieve vervanging, schoolgrensoverschrijding en een reeds bezette vervanger worden geweigerd.

## M. Testdata staging

Staging bevat 10 fictieve roosteritems over twee scholen en twee weken, 2 vervangingen, meerdere docenten, groepen, vakken, lokalen, wijzigingen en annuleringen. Geen echte persoonsgegevens zijn toegevoegd.

## N. Geautomatiseerde controles

- pgTAP/RLS: **47/47 PASS** (35 regressie + 12 timetable)
- Lege database-opbouw: **PASS**, 31 migrations
- Typecheck: **PASS**
- Lint: **PASS**
- Productie-build: **PASS**
- Portabiliteit: **PASS**

## O. Browseracceptatie

Beheerder, docent, leerling School A en leerling School B zijn getest. School B zag geen School A-roosterdata. Conflictfeedback is live via de productie-UI bewezen. Viewports 390×844, 768×1024 en 1440×900 hadden geen horizontale overflow en alle relevante acties bleven bereikbaar.

## P. Eindbesluit

**Fase 2: DONE.** De Definition of Done voor Timetable is gehaald op staging. Bekende algemene Supabase-advisorwaarschuwingen over bewust callable, intern autoriserende `SECURITY DEFINER`-functies en bestaande dubbele permissive policies blijven onderdeel van de bredere hardening; er is geen nieuwe kritieke timetable-bevinding.

**Kan Fase 3 — Attendance starten? YES**, maar uitsluitend na een nieuw expliciet verzoek. Fase 3 is niet automatisch gestart.
