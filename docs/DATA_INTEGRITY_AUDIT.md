# SchoolPulse — data-integriteitsaudit

**Omgeving:** staging `ggucscfzakfvlfwyiuot`  
**Datum:** 11 augustus 2026  
**Resultaat:** PASS

De audit was volledig read-only. Er zijn geen records, constraints of migrations
gewijzigd.

| Controle | Overtredingen |
|---|---:|
| Profiel verwijst naar ontbrekende school | 0 |
| Leerlingrecord mist profiel of heeft andere school | 0 |
| Personeelsrecord mist profiel of heeft andere school | 0 |
| Inschrijving heeft ontbrekende/cross-school leerling, jaar of klas | 0 |
| Groepslidmaatschap heeft ontbrekende/cross-school leerling of groep | 0 |
| Voogdlink heeft ontbrekende/cross-school profielen | 0 |
| Roosteritem heeft ontbrekende/cross-school jaar, groep, vak, docent of lokaal | 0 |
| Attendance heeft ontbrekende/cross-school les of leerling | 0 |
| Grade heeft ontbrekende/cross-school assessment of leerling | 0 |
| Submission heeft ontbrekende/cross-school assignment of leerling | 0 |
| Dubbel actief groepslidmaatschap | 0 |
| Dubbele actieve inschrijving per leerling en schooljaar | 0 |

## Beoordeling

De representatieve fictieve stagingdata bevat geen aangetroffen orphaned
kernrecords, tenantmismatches of functionele duplicaten. Bestaande foreign keys,
unieke constraints, relationele validatietriggers en 110 RLS/securityassertions
dekken de belangrijkste regressierisico's. Er is daarom geen nieuwe constraint
toegevoegd: zonder gevonden defect zou dat onnodig migratierisico introduceren.

Herhaal deze audit vóór iedere pilotimport en vóór productie-go/no-go. Een resultaat
groter dan nul is een stopconditie; herstel eerst de bronimport of relatie en
verwijder niet automatisch gegevens.
