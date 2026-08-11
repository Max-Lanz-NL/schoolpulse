# SchoolPulse — Auth en password hardening

**Datum:** 11 augustus 2026

**Staging:** `ggucscfzakfvlfwyiuot` (`ACTIVE_HEALTHY`, EU West)

**Status:** EXTERNAL ACTION REQUIRED

## Bevindingen

De actuele staging Security Advisor bevestigt dat leaked-password protection
uit staat. De beschikbare connector en CLI bieden in deze omgeving geen veilige
Auth-configuratie-write voor deze dashboardinstelling. De instelling is daarom
niet via een omweg of directe Auth-schemahack gewijzigd.

Dashboardactie: zet in staging onder Authentication password security
**Leaked password protection** aan. Herhaal daarna in een gecontroleerd
productionreleasevenster. Test met uitsluitend een bekend gelekt testwachtwoord
en een nieuw sterk fictief wachtwoord; gebruik nooit een echt gebruikerswachtwoord.

## Bestaande flows

- Wachtwoordlogin, logout, refresh en protected routes bestaan.
- Reset en change-password gebruiken de ondersteunde Supabase Auth-flow.
- Block is applicatie-side onmiddellijk fail-closed, ook voor een nog geldige JWT.
- Delete en Auth-sessionresten moeten na MFA-recovery nog end-to-end via de
  ondersteunde Admin API worden bewezen; zie `MFA_RECOVERY.md`.
- Beheerrollen worden na login door de bestaande AAL2-poort geleid.

## Redirectaudit

De repository definieert afzonderlijke productie-origins voor app en admin;
productiecode is niet afhankelijk van localhost. Vóór hostingvrijgave moeten in
beide Supabase-projecten expliciet worden gecontroleerd:

- staging Site URL en allowlist bevatten alleen staging/preview en noodzakelijke
  lokale ontwikkelcallbacks;
- production Site URL is `https://app.schoolpulse.nl`;
- production allowlist bevat de app- en admincallbacks voor verificatie,
  password reset en MFA, zonder staging als default;
- e-maillinks gebruiken HTTPS en geen localhost-default.

Een dashboardexport van deze redirectinstellingen was via de beschikbare
configuratie-API niet beschikbaar. De daadwerkelijke dashboardcontrole en de
vier wachtwoordtests blijven daarom concrete externe acties.
