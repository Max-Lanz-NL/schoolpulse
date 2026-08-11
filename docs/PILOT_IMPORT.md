# SchoolPulse — veilige pilotimport

Dit is geen Magister-koppeling. Het is een gecontroleerd CSV-contract voor een
eenmalige, fictief geteste pilotinvoer. Templates staan in `docs/import-templates`.

## Volgorde en sleutels

1. `subjects.csv` — unieke `code`
2. `rooms.csv` — unieke `code`
3. `classes.csv` — unieke combinatie `school_year_code,code`
4. `teaching_groups.csv` — unieke `code`, verwijst naar vak en optionele klas
5. `staff.csv` — uniek `email` en `employee_number`
6. `students.csv` — uniek `email` en `student_number`, verwijst naar klas

De CSV bevat nooit `school_id`. De server bepaalt de school uit de geverifieerde
beheerder. Externe codes worden pas tijdens validatie naar interne UUID's vertaald.

## Verplichte workflow

1. Uploadgate blijft uit; een bevoegde operator leest het bestand buiten de
   normale gebruikersuploadflow.
2. Parse naar `import_batches` en `import_rows` met status `validating`.
3. Valideer encoding, headers, lengte, enumwaarden, e-mailvorm, duplicaten binnen
   bestand en duplicaten tegen uitsluitend de actorschool.
4. Los iedere referentie schoolgebonden op. Een bekende code uit een andere school
   geldt als niet gevonden.
5. Toon preview met aantallen create/update/skip/error en fouten per rij.
6. Commit pas na expliciete bevestiging in één transactie per afhankelijk
   importdeel. Bij een fout: rollback, batch `failed`, geen half stille import.
7. Leg actor, bestandshash, tijden, totalen en resultaat vast; bewaar geen ruwe
   persoonsgegevens langer dan de afgesproken importtermijn.

## Validatieregels

- UTF-8, komma als scheiding, één headerregel; onbekende kolommen zijn een fout.
- Trim tekst; lege verplichte waarden zijn een rijfout, geen automatische default.
- `is_active` accepteert alleen `true` of `false`.
- Datums zijn ISO `YYYY-MM-DD`.
- Rollen zijn geen vrij tekstveld; deze basis maakt alleen teacher/studentprofielen.
- Preview mag geen writes naar typed domeintabellen uitvoeren.
- Herhalen met dezelfde bestandshash vraagt bevestiging en maakt geen duplicaten.

Een minimale typed importservice is bewust nog niet gebouwd: zonder gekozen
operatorflow en echte, geanonimiseerde voorbeeldexports zou dat te veel aannames
over kolomnamen en updatesemantiek maken.
