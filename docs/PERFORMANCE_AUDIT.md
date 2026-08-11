# SchoolPulse — query- en performance-audit

**Datum:** 11 augustus 2026  
**Scope:** dashboard, rooster, attendance, results en learning.

## Bevindingen

| Gebied | Waarneming | Risico | Besluit/bewijs |
|---|---|---|---|
| Dashboard | Vier domeinen laden parallel via één TanStack Query | Laag bij pilotomvang | Geen N+1; parallelisatie behouden |
| Dashboard results/learning | Domeinservices halen alle via RLS zichtbare grades, assessments, assignments en submissions op | Middel bij groei over meerdere jaren | Voor pilot acceptabel; vóór schaaltest aparte begrensde dashboardqueries met datum/status/limit bouwen |
| Rooster | Weekquery gebruikt een tijdvenster en server-side filters | Laag | Juiste begrenzing; niet verbreden |
| Attendance | Records worden op lesdatum begrensd; leerlinglijsten gebruiken twee parallelle relationele queries en dedupliceren profielen | Laag | Geen query per leerling; huidige aanpak behouden |
| Results | Assessments en grades laden parallel met expliciete kolommen | Middel bij grote cijferhistorie | Voeg periode/paginering toe vóór meerjarige productiebelasting |
| Learning | Assignments en submissions laden parallel met expliciete kolommen | Middel bij langlopende historie | Filter dashboard op open/recent; archiveer/pagineer in module bij schaalgroei |
| Queryvorm | Kernservices gebruiken expliciete selectlijsten, geen brede `select('*')` gevonden | Laag | Positief bewijs uit repositoryscan |
| Cache | Dashboard heeft één stabiele querykey en refetch bij windowfocus | Laag | Voorkomt losse redundante widgetrequests; herladen is functioneel gewenst |
| UI-grens | `ProductionApp.tsx` blijft groot (circa 149 kB) | Onderhoudbaarheid, niet direct DB-performance | Verder per domein extraheren in kleine 1.1-refactors; geen risicovolle big-bang refactor |

## Indexbeoordeling

De Supabase Performance Advisor meldt diverse ontbrekende foreign-key-indexen als
`INFO`. Dit is geen bewijs dat ieder genoemd veld een index nodig heeft. Voor de
daadwerkelijke kernqueries zijn school-, tijd-, status- en relationele filters het
belangrijkst. Omdat staging klein is en er in deze run geen representatieve
`EXPLAIN (ANALYZE, BUFFERS)`-belasting beschikbaar is, zijn niet blind tientallen
indexen toegevoegd.

## Aanbevolen meetpoort vóór opschalen

1. Laad een fictieve dataset op verwachte pilotschaal.
2. Meet p50/p95 voor dashboard, roosterweek, lesleerlingen, grades en assignments.
3. Leg per trage query het daadwerkelijke plan vast.
4. Voeg alleen een nieuwe migration toe voor indexen die een gemeten scan of join
   verbeteren; herhaal daarna write-, RLS- en buildtests.

Er is geen P0-performancefout aangetroffen voor één kleine pilot. De twee
onbegrensde historische domeinloads zijn een concrete P1 vóór meerdere scholen of
meerjarige data.
