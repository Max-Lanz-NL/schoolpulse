# SchoolPulse — onboardingchecklist eerste pilotschool

Geen echte school wordt aangesloten totdat ieder P0-vak is afgetekend.

## Voor onboarding

- [ ] Verwerkingsovereenkomst, privacyrollen, bewaartermijnen en verzoekproces goedgekeurd
- [ ] Schoolcontact, supportcontact en security-escalatie met vervangers benoemd
- [ ] Backupowner, extern versleutelde opslag en geslaagde restore gepland
- [ ] Monitoringowner, alerts en proefalarm bewezen
- [ ] Production health, migrationpariteit en lege preflight bewezen
- [ ] Bestandsuploads server-side `false`; scannerblocker geaccepteerd
- [ ] Minimaal twee platformadmins en twee schooladmins hebben eigen MFA; recovery live bewezen
- [ ] Leaked-password protection actief
- [ ] Hosting, DNS, TLS, Auth Site URL en redirect allowlist gecontroleerd

## Schooldata

- [ ] Schooljaar en periodes
- [ ] Vakken en lokalen
- [ ] Personeel en leerlingen
- [ ] Klassen, groepen en lidmaatschappen
- [ ] Docent-vak- en docent-groeptoewijzingen
- [ ] Rooster; importpreview zonder fouten en integriteitsaudit op nul

## Fictieve testaccounts

- [ ] Schooladmin kan eigen school beheren en geen andere school zien
- [ ] Docent ziet alleen toewijzingen en kan kernflows uitvoeren
- [ ] Leerling ziet alleen eigen/relevante informatie en heeft geen beheerwrites
- [ ] Blokkeren en logout maken bestaande toegang ongeldig

## Acceptatie

- [ ] Login, refresh, logout, reset en MFA
- [ ] Dashboard en roosterwijziging/uitval/vervanging
- [ ] Attendance registratie en correctie
- [ ] Assessment, gepubliceerd cijfer en leerlinginzage
- [ ] Assignment zonder bestand en tekstsubmission
- [ ] 390×844, 768×1024 en 1440×900 zonder blokkerende UX-fout
- [ ] 110+ securityassertions, typecheck, lint, build en portabiliteit PASS
- [ ] Security Advisors beoordeeld; geen relevante HIGH/CRITICAL

## Go/No-Go

**GO** alleen wanneer: interne blockers nul zijn, alle pilot-P0's een eigenaar en
bewijs hebben, production schoon en gelijk is, uploads uitstaan en de school
schriftelijk akkoord is met scope en incidentprocedure.

**NO-GO** bij tenantisolatiefout, onverwachte productiondata, migrationdrift,
ongeteste MFA-recovery, ontbrekende monitoring/restore, open relevante
HIGH/CRITICAL of enige onduidelijkheid over privacyverantwoordelijkheid.
