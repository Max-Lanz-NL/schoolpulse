# SchoolPulse — MFA recovery en sessie-intrekking

**Datum:** 11 augustus 2026

**Omgeving:** staging `ggucscfzakfvlfwyiuot`

**Status:** READY FOR STAGING E2E

## Geïmplementeerde herstelroute

De bestaande server-side functie `admin-manage-user` ondersteunt nu de actie
`recover_mfa`. De functie gebruikt uitsluitend de Supabase Auth Admin API om een
verified factor te verwijderen. De functie is op 11 augustus 2026 succesvol naar
staging gepubliceerd.

De herstelroute dwingt af:

- de uitvoerende beheerder heeft een geldig, door Supabase geverifieerd access token;
- de JWT meldt op het moment van de aanvraag `aal2`;
- actor en target zijn verschillende accounts;
- alleen een tweede `platform_admin` mag een `platform_admin` herstellen;
- een `school_admin` mag alleen een andere `school_admin` uit dezelfde school herstellen;
- docent, leerling, ouder, AAL1 en cross-school aanvragen worden geweigerd;
- alleen een bestaande verified factor kan worden verwijderd;
- een concrete reden van 10–500 tekens is verplicht;
- aanvraag, actor, target, factor, schoolcontext, reden en eindstatus worden in
  `admin_audit_logs` vastgelegd;
- `auth.admin.mfa.deleteFactor` verwijdert de factor en trekt volgens de
  ondersteunde Supabase Auth-route de actieve sessies van het targetaccount in.

Directe SQL-wijzigingen van `auth.mfa_factors` of `auth.sessions` zijn bewust niet
gebruikt.

## Automatisch bewijs

`npm run test:mfa-recovery` bevat zeven beleidsgevallen en slaagt voor:

- tweede AAL2-platformbeheerder toegestaan;
- AAL1 geweigerd;
- zelfherstel geweigerd;
- tweede beheerder binnen dezelfde school toegestaan;
- cross-school geweigerd;
- schoolbeheerder naar platformbeheerder geweigerd;
- docent en leerling geweigerd.

Typecheck en lint slagen en de Edge Function is door de staging-deploymentbundler
gevalideerd.

## Nog vereist voor DONE

Staging bevat nog geen twee afzonderlijke fictieve platformbeheerders. Maak vóór
een echte pilot twee platformbeheerders en twee schoolbeheerders aan via de
ondersteunde Auth Admin-route en schrijf voor ieder een afzonderlijke TOTP-factor
in. Voer daarna in staging uit:

1. verlies-telefoon-scenario door een tweede AAL2-beheerder;
2. controle dat oude access- én refreshtokens niet meer werken;
3. nieuwe TOTP-enrollment en opnieuw AAL2;
4. controle van de beheerroute na herstel;
5. auditcontrole voor request en completed/failed;
6. negatieve live tests voor self, AAL1, docent/leerling en cross-school.

Tot dit live bewijs is uitgevoerd, is MFA-recovery niet `DONE` en blijft het een
pilotblokkade. Er zijn geen echte persoonsgegevens nodig voor deze test.
