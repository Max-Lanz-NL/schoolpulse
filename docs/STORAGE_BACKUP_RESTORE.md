# SchoolPulse — Storage Backup & Restore

**Laatste restore-oefening:** 11 augustus 2026  
**Testomgeving:** staging `ggucscfzakfvlfwyiuot`  
**Status objectrestorebewijs:** **DONE**

Databasebackups en Storage-backups zijn twee verschillende herstelstromen. Een dump van `file_assets` en `document_versions` bevat metadata en relaties, maar garandeert niet dat de objectbytes uit `storage.objects` zijn veiliggesteld. Een bruikbaar herstelpunt bestaat daarom uit een databasebackup én een afzonderlijke versleutelde objectbackup met manifest.

## Bewezen oefening

Zes volledig fictieve objecten zijn via een normale Auth-sessie, de private `school-files`-bucket en de bestaande `file_assets`-flow geplaatst. De set bevatte PDF, TXT (twee fysieke documentversies), PNG, CSV en DOCX en was samen 38.980 bytes.

De bytes zijn naar `.pilot-recovery/storage-proof/backup` gedownload. Het genegeerde manifest `.pilot-recovery/storage-proof/manifest.json` bevat per object bucket, exact objectpad, veilige bestandsnaam, grootte, MIME-type, `school_id`, eigenaar, `file_assets.id`, `scan_status` en SHA-256. Deze map staat onder de bestaande `.pilot-recovery/`-uitsluiting en wordt niet door de app geserveerd of door Git gevolgd.

Alle zes objecten zijn daarna echt uit staging verwijderd terwijl zes `file_assets`-records en twee `document_versions` behouden bleven. Storage-download en signed URL faalden tijdens het verlies. Vervolgens zijn alle zes backupbytes naar exact dezelfde paden teruggezet. Eindresultaat: **6/6 groottechecks en 6/6 SHA-256-checks gelijk, 0 afwijkingen**. Storage-metadata en `file_assets` kwamen voor alle zes objecten overeen in grootte en MIME-type.

School A en School B konden voor en na herstel ieder het eigen object downloaden en een signed URL maken. Een gebruiker van School A kon geen School B-object tekenen of downloaden en omgekeerd. Alle bestanden bleven `scan_status=pending`: daardoor was alleen de eigenaar bevoegd en ontstond geen brede verspreiding zonder malwarescan.

Een fictief document had twee `document_versions`, elk gekoppeld aan een afzonderlijk fysiek TXT-object. Beide versies zijn verwijderd, hersteld en byte-voor-byte gecontroleerd. Versiehistorie is daarmee operationeel voor bestaande fysieke versies.

## Backup-runbook

1. Bevestig projectref, omgeving, private bucket en goedgekeurd herstelpunt. Voer nooit een destructieve oefening op production uit.
2. Maak eerst de bijbehorende databasebackup zodat `file_assets`, `document_versions`, scholen en gebruikers-UUID's bij hetzelfde logische moment horen.
3. Inventariseer alle objecten per bucket. Leg exact objectpad, grootte en MIME-type vast en koppel waar mogelijk `file_assets.id`, `school_id`, eigenaar en scanstatus.
4. Download de daadwerkelijke objectbytes met een server-side backupidentiteit. Gebruik geen publieke URL en sla geen service key in het script of manifest op.
5. Bereken lokaal SHA-256 over ieder gedownload object. Noteer checksum en bytegrootte in het manifest.
6. Controleer dat objectaantal, foutenaantal en manifestregels gelijk zijn. Een gedeeltelijke export is geen geslaagde backup.
7. Versleutel de backup vóór verplaatsing naar de goedgekeurde operationele backupbestemming. Beperk toegang tot benoemde beheerders, log toegang en pas de afgesproken retentie toe.
8. Houd backupbytes, manifest en secrets buiten Git, frontendassets, gedeelde downloads en supporttickets.

Voor echte productie is nog een beheerde, versleutelde externe backupbestemming met sleutelbeheer, retentie, eigenaar en toegangslogging vereist. De lokale oefenmap bewijst de techniek, maar is geen duurzame productiebackup.

## Restore-runbook

1. Herstel eerst database/schema en applicatiedata van hetzelfde herstelpunt.
2. Controleer daarna bucketconfiguratie, RLS/policies, `file_assets`, `document_versions` en de tenant-/owner-UUID's.
3. Controleer het manifest vóór upload. Stop bij ontbrekende regels, onverwachte paden of een checksumverschil.
4. Upload elk object naar exact de manifestbucket en het exacte objectpad met het oorspronkelijke MIME-type. Gebruik standaard geen upsert; een onverwacht bestaand object vereist onderzoek.
5. Download elk hersteld object opnieuw via een geautoriseerde server- of gebruikersflow.
6. Vergelijk opnieuw SHA-256 en bytegrootte met het manifest. Controleer MIME-type tegen zowel Storage-metadata als `file_assets`.
7. Controleer dat ieder `file_assets`-record een fysiek object heeft en iedere `document_versions.file_asset_id` geldig is.
8. Test signed URLs/downloads met een bevoegde eigenaar en test cross-school weigering voor beide richtingen.
9. Deel `pending` objecten niet schoolbreed. Herstel verandert de malwarescanstatus niet; scan opnieuw wanneer het incident- of scannerbeleid dit vereist.
10. Leg datum, uitvoerder, herstelpunt, aantallen, duur, mismatches en go/no-go vast.

## Bij fouten

- **Checksum wijkt af:** publiceer of deel het object niet. Markeer de restore als mislukt, bewaar beide hashes, controleer bronbackup/transport en herstel vanuit een ander gevalideerd herstelpunt.
- **Grootte of MIME-type wijkt af:** behandel dit eveneens als mismatch; overschrijf niet blind en controleer manifest en `file_assets`.
- **Object ontbreekt maar metadata bestaat:** behoud metadata voor diagnose, blokkeer downloads en herstel het exacte pad.
- **Object bestaat zonder `file_assets`:** maak het niet publiek; onderzoek backupmoment en databasepariteit voordat metadata wordt gereconstrueerd.
- **Tenanttest faalt:** trek toegang direct in, stop de restorevrijgave en onderzoek Storage-policy, padopbouw, eigenaar en schoolkoppeling.

## Lokale verificatie

Het niet-destructieve script controleert een manifest tegen een lokale backup- of restored-map:

```powershell
node scripts/verify-storage-backup.mjs `
  --manifest .pilot-recovery/storage-proof/manifest.json `
  --directory .pilot-recovery/storage-proof/restored
```

Het script benadert Supabase niet, bevat geen secrets, verwijdert niets en retourneert een foutstatus zodra een bestand ontbreekt of grootte/SHA-256 afwijkt.

## Productioncontrole

Production `gqemqvovdrujonlffhen` is uitsluitend read-only gecontroleerd: `school-files` is private, bevat 0 objecten en heeft vier policies voor insert/select/update/delete. Er is geen productionobject aangemaakt, verwijderd of hersteld.
