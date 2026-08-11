# SchoolPulse — MFA recovery en sessie-intrekking

**Datum:** 11 augustus 2026

**Omgeving:** staging `ggucscfzakfvlfwyiuot`

**Status:** BLOCKED

## Bewezen bescherming

- `platform_admin` en `school_admin` worden door de bestaande app- en adminpoort
  pas bij AAL2 toegelaten.
- Staging bevat één verified fictieve TOTP-factor en actieve fictieve sessies.
- De RLS-suite bewijst dat een geblokkeerd account met een eerder uitgegeven JWT
  onmiddellijk schoolcontext, permissions en schooldata verliest.
- Supabase documenteert dat admin `deleteFactor` een verified factor verwijdert
  en alle actieve sessies van die gebruiker uitlogt. Een gewone gebruiker mag
  zichzelf alleen via de normale AAL2-beveiligde unenrollflow beheren.

## Waarom recovery nog niet DONE is

Staging bevat momenteel geen fictief `platform_admin`-profiel en er bestaat geen
server-side recoverycommand dat tegelijk actor-AAL2, tweede-beheerderprincipe,
rolhiërarchie, reden, audit en de Supabase Admin MFA-operatie afdwingt. Directe
SQL-wijziging van `auth.mfa_factors` of `auth.sessions` is bewust niet gebruikt:
dat omzeilt de ondersteunde Auth API en zou geen geldig recoverybewijs zijn.

Daarom zijn verlies-telefoon → factorverwijdering → nieuwe enrollment → opnieuw
AAL2 en directe oude-tokenchecks voor zowel platform- als schooladmin nog niet
end-to-end bewezen.

## Vereist voor afronding

1. Maak twee afzonderlijke fictieve platformadmins en twee schooladmins via de
   ondersteunde Auth Admin API.
2. Implementeer een server-only recoveryactie met service-role credentials.
3. Eis actor AAL2, actor ≠ target en platformadmin voor platformadmin-targets;
   schooladmin mag alleen een andere beheerder binnen de eigen school herstellen.
4. Gebruik `auth.admin.mfa.deleteFactor`; verifieer dat alle target-sessies zijn
   ingetrokken en leg actor, target, school/context, timestamp en reden vast.
5. Bewijs oude access- én refreshtokenweigering, nieuwe TOTP-enrollment, AAL2 en
   herstelde beheerroute. Herhaal block en delete met directe API-calls.

Student, docent, target zelf op AAL1 en cross-school schooladmin moeten in alle
gevallen server-side worden geweigerd.
