# People contract

- **Purpose:** pupils, staff, enrolments, guardians and teaching relationships.
- **Sources:** `student_records`, `staff_records`, `student_enrolments`, `guardian_student_links`, `teacher_subject_assignments`, `teacher_group_assignments`, `student_group_memberships`.
- **Roles:** pupils/guardians read their own relations; teachers assigned groups; authorised administration manages records.
- **Reads:** scope-limited person and relationship data.
- **Writes:** authorised administration; guardian workflow through existing RPCs.
- **Dependencies:** Identity and School.
- **Outside 1.0:** extended HR, alumni and full guardian communication workflows.
