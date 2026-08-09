# Timetable contract

- **Purpose:** timetable display, changes, cancellations and basic substitutions.
- **Sources:** `timetable_entries`, `substitutions`.
- **Roles:** pupils and teachers read their own/assigned schedule; authorised staff manage school schedule data.
- **Reads:** entries joined to year, group, subject, teacher and room within RLS scope.
- **Writes:** authorised timetable maintenance and substitutions.
- **Dependencies:** Identity, School and People.
- **Outside 1.0:** automatic generation, optimisation and Microsoft calendar synchronisation.
