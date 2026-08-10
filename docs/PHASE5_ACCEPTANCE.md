# SchoolPulse 1.0 — Fase 5 Acceptance

Status: **DONE**

Datum: 11 augustus 2026  
Omgeving: `schoolpulse-staging` (`ggucscfzakfvlfwyiuot`)

## Scope en werking

- Uitsluitend `assignments`, `assignment_submissions` en `file_assets`; geen Learning-data in `app_records`.
- Docent maakt een concept of gepubliceerde opdracht voor een toegewezen groep, vak, omschrijving en deadline.
- Leerling ziet alleen gepubliceerde relevante opdrachten, opent details en levert een tekstuitwerking in.
- Eén submission per leerling/opdracht; opnieuw inleveren werkt als update.
- Docent ziet alleen submissions van toegewezen opdrachten en kan accepteren of terugsturen met feedback.
- School A/B-isolatie is server-side bewezen.

## Bestanden

De private bucket `school-files` blijft niet-publiek en downloads gebruiken de bestaande signed-URL-flow. Een leerlingupload gebruikt uitsluitend het eigen school/user/submissions-pad. Metadata start verplicht met `scan_status=pending`. Pending bestanden zijn alleen zichtbaar voor de eigenaar en worden niet met de docent of groep gedeeld. Brede verspreiding vereist eerst `scan_status=clean` door een toekomstige malware-scanner. Omdat er nog geen scanner actief is, presenteert de UI dit expliciet en verspreidt zij pending uploads niet automatisch.

## Tests en kwaliteit

- RLS: PASS, 5 bestanden en 91 assertions totaal; 14 Learning-assertions.
- Typecheck: PASS
- Lint: PASS
- Build: PASS
- Portabiliteitscontrole: PASS
- Lege databaseopbouw met 36 migrations: PASS
- Security Advisor: geen HIGH of CRITICAL.
- Staging: 4 assignments, 3 submissions, 0 cross-school relaties, 0 legacy assignments.

## Responsive acceptatie

- `390×844`: leerling ziet deadline/details en levert werk in; geen horizontale overflow.
- `768×1024`: docent ziet submissions, beoordeelt en publiceert een opdracht; geen horizontale overflow.
- `1440×900`: desktopweergave zonder horizontale overflow.

## Conclusie

Assignmentflow, submissionflow, private scan-gated bestanden, rollen, mobiel en tenantisolatie voldoen aan de Fase 5-DONE-criteria.
