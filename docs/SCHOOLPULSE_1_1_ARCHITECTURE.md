# SchoolPulse 1.1 — veilige uitbreidingsarchitectuur

Dit document reserveert grenzen; het start geen 1.1-feature.

| Gebied | Afhankelijkheden / nieuw domein | Hergebruik | Securitygrens | Teststrategie |
|---|---|---|---|---|
| Microsoft Entra login | Tenantregistratie, OIDC/SAML-config, accountlinking | `auth.users`, `profiles`, accountstatus | IdP-claim bepaalt nooit zelf school/rol; server-side mapping en domeinallowlist | linking, deprovisioning, wrong tenant, MFA/AAL, rollback naar lokale admin |
| Notifications/PWA | notification preferences, delivery attempts, service worker | `notifications`, `profile_preferences` | alleen server maakt deliveryjobs; payload minimaliseren, geen gevoelige lockscreeninhoud | opt-in/out, tenant, retry, revoked device, offline/update |
| Messaging | gesprekken, deelnemers, moderatie/retentie | bestaande conversation/message-tabellen na heraudit | deelnemerschap server-side; geen schoolbrede enumeratie; misbruik/audit | participantmatrix, cross-school, delete/retentie, attachments gate |
| Management analytics | begrensde readmodels/aggregaties | typed domeinen | minimum cohortgrootte, eigen school, geen individuele data zonder doel | RLS, suppressie kleine groepen, bronreconciliatie, performance |
| AI Tutor | apart tool-/policydomein | geselecteerde learning/resultcontext | geen onbeperkte DB of service role; tools leveren minimale leerlingcontext, consent en audit | prompt-injection, tenant, dataminimalisatie, human override, evaluaties |
| AI management assistant | aparte geaudite readtools | geaggregeerde typed domeinen | geen directe SQL, geen autonome writes, geen persoonsprofilering zonder grondslag | toolallowlist, schoolgrens, small-cohort privacy, hallucination/evidence |
| Timetable optimizer | voorstel-/constraintdomein | rooster, ruimtes, groepen, docenten | optimizer schrijft nooit direct live rooster; bevoegde mens publiceert voorstel | conflicts, determinisme, rollback, tenant, performance, handmatige acceptatie |

## Algemene ontwerpregels

- Nieuwe domeinen krijgen typed tabellen, contract, migrations, RLS en negatieve
  tenanttests; nooit kernopslag in `app_records`.
- Externe systemen krijgen minimale, roteerbare servercredentials en geen browser-
  of onbeperkte databaseaccess.
- AI werkt later uitsluitend via beperkte, geaudite tools/services met expliciete
  inputs en outputcontrole. Een model krijgt nooit service-role of vrije SQL.
- Iedere feature begint met bedreigingsmodel, dataretentie, fout-/rollbackpad en
  meetbare acceptance. Production volgt pas na stagingbewijs en releasegoedkeuring.
