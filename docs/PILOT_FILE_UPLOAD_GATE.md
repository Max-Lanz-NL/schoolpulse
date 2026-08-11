# SchoolPulse — Pilot File Upload Gate

**Datum:** 11 augustus 2026

**Staging:** `schoolpulse-staging` (`ggucscfzakfvlfwyiuot`)

**Production:** `schoolpulse-production` (`gqemqvovdrujonlffhen`)

**Legacy:** niet benaderd

**Status:** DONE voor de uploadgate; malware scanning blijft BLOCKED

## Feature gate

De enige autoritatieve bron is
`public.runtime_feature_flags.file_uploads_enabled`. De rij is niet schrijfbaar
voor `anon` of `authenticated` en ontbrekende configuratie resulteert in
`false`. De browser gebruikt uitsluitend de read-only RPC
`file_uploads_enabled()` en behandelt ook RPC-fouten als uitgeschakeld.

Staging staat aantoonbaar op `false`. Production hoort eveneens op `false` te
staan totdat malware scanning DONE is. De migration met die standaardwaarde is
gereed, maar is wegens de bestaande productie-releasebeveiliging niet buiten
een afzonderlijk goedgekeurd releasevenster op production toegepast.

## Geblokkeerde uploadflows

Repositorybreed is één daadwerkelijke byte-upload gevonden: Documenten in
`ProductionApp`. Die file-input is disabled en toont uitsluitend:
“Bestandsuploads zijn momenteel niet beschikbaar.” Vlak vóór een upload wordt
de servergate opnieuw gelezen, zodat een verouderde UI-status geen upload kan
starten. Er bestaan geen andere `.upload()`-aanroepen. Learning bevat geen
bestandsinput en blijft bruikbaar met titel, omschrijving, deadline, groep, vak
en tekstuele inleveringen.

## Server-side bescherming

De gate is onderdeel van:

- `storage.objects` INSERT voor nieuwe objecten;
- `storage.objects` UPDATE voor vervangen/upsert van objecten;
- `public.file_assets` INSERT voor directe metadataregistratie.

Delete en bestaande veilige reads blijven onveranderd. Schoolbrede read blijft
alleen mogelijk bij `scan_status='clean'`. `pending`, `blocked` en `failed`
worden niet breed vrijgegeven. Gewone gebruikers hebben geen updatepolicy voor
`file_assets` en kunnen scanstatus dus niet naar `clean` wijzigen.

## Acceptatiebewijs

- Lokale database vanaf nul opgebouwd met 39 migrations: PASS.
- Volledige pgTAP RLS/securitysuite: **108/108 PASS**.
- Leerlingupload geblokkeerd: PASS.
- Docentupload geblokkeerd: PASS.
- Schoolbeheerder kan Storage of `file_assets` niet omzeilen: PASS.
- Opdracht zonder bestand maken en als leerling zien: PASS.
- Tekstinlevering zonder bestand: PASS.
- Bestaand pending-bestand niet breed zichtbaar: PASS.
- Eigenaar kan `scan_status` niet naar `clean` wijzigen: PASS.
- Typecheck: PASS.
- Lint: PASS.
- Portabiliteitscontrole: PASS.
- Staging migration history: 39, inclusief `pilot_file_upload_gate`.
- Staging Security Advisor: 0 HIGH, 0 CRITICAL. De bestaande WARN-categorie
  voor bewust aan authenticated blootgestelde, intern autoriserende
  `SECURITY DEFINER`-RPC's blijft aanwezig; de nieuwe RPC retourneert alleen de
  read-only boolean.

## Productieactivering later

Uploads mogen pas veilig worden geactiveerd nadat de P0
**BLOCKED — externe private scanner vereist** naar DONE is gegaan. Vereist zijn
een werkende private ClamAV-worker, quarantine, signature-health, monitoring en
geslaagde clean/EICAR/scanner-failuretests op staging. Daarna wordt in een
goedgekeurde release eerst de migration op production toegepast en vervolgens
uitsluitend de centrale serverwaarde gecontroleerd op `true` gezet.

Een pilot zonder bestandsuploads kan technisch doorgaan als de overige
pilot-P0's zijn afgerond.
