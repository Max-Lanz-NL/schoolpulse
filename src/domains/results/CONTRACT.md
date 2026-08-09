# Results contract

- **Purpose:** assessments, weighted results, publication and pupil access.
- **Sources:** `assessments`, `grades`.
- **Roles:** assigned teachers create/grade/publish; pupils and guardians read published, allowed own results; managers oversee by permission.
- **Reads:** scope-limited assessments and grades.
- **Writes:** existing assessment and grade RPCs or equally protected typed operations.
- **Dependencies:** Identity, School and People.
- **Outside 1.0:** examinations, diploma workflows and advanced analytics.
