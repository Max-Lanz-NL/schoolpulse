# School contract

- **Purpose:** stable school structure used by all educational processes.
- **Sources:** `schools`, `school_years`, `school_periods`, `school_locations`, `education_programmes`, `subjects`, `school_classes`, `teaching_groups`, `rooms`.
- **Roles:** school administration and platform administration write; educational roles read the structure needed for their work.
- **Reads:** active year, periods, locations, programmes, classes, groups, subjects and rooms within the tenant.
- **Writes:** authorised school-structure management only.
- **Dependencies:** Identity for actor and tenant.
- **Outside 1.0:** advanced curriculum and examination configuration.
