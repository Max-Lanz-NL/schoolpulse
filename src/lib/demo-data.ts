export type Role = "leerling" | "docent" | "ouder" | "teamleider" | "directie";

export const roleLabels: Record<Role, string> = {
  leerling: "Leerling",
  docent: "Docent",
  ouder: "Ouder",
  teamleider: "Teamleider",
  directie: "Directie",
};

export const roleUsers: Record<Role, { name: string; sub: string; initials: string }> = {
  leerling: { name: "Sanne de Vries", sub: "4 VWO · Klas V4B", initials: "SV" },
  docent: { name: "Mark Jansen", sub: "Docent Wiskunde", initials: "MJ" },
  ouder: { name: "Petra de Vries", sub: "Ouder van Sanne (V4B)", initials: "PV" },
  teamleider: { name: "Ingrid Bakker", sub: "Teamleider Bovenbouw", initials: "IB" },
  directie: { name: "Dr. Rob Hendriks", sub: "Rector", initials: "RH" },
};

export const roosterVandaag = [
  { tijd: "08:30 – 09:20", vak: "Wiskunde B", lokaal: "204", docent: "M. Jansen", kleur: "bg-blue-500" },
  { tijd: "09:20 – 10:10", vak: "Nederlands", lokaal: "112", docent: "L. de Boer", kleur: "bg-indigo-500" },
  { tijd: "10:30 – 11:20", vak: "Scheikunde", lokaal: "Lab 2", docent: "K. Visser", kleur: "bg-emerald-500", wijziging: "Lokaalwissel" },
  { tijd: "11:20 – 12:10", vak: "Engels", lokaal: "108", docent: "S. Green", kleur: "bg-amber-500" },
  { tijd: "13:00 – 13:50", vak: "Geschiedenis", lokaal: "215", docent: "J. Peters", kleur: "bg-rose-500", wijziging: "Uitval — zelfstudie" },
  { tijd: "13:50 – 14:40", vak: "Biologie", lokaal: "Lab 1", docent: "H. Mulder", kleur: "bg-teal-500" },
];

export const cijfers = [
  { vak: "Wiskunde B", laatste: 7.8, gemiddelde: 7.4, trend: "up", toetsen: [
    { naam: "SO Hoofdstuk 3", cijfer: 8.2, weging: 1, datum: "12 nov" },
    { naam: "Proefwerk H1-H2", cijfer: 7.0, weging: 3, datum: "18 okt" },
    { naam: "Praktische opdracht", cijfer: 8.5, weging: 2, datum: "02 okt" },
  ]},
  { vak: "Nederlands", laatste: 6.8, gemiddelde: 6.9, trend: "flat", toetsen: [
    { naam: "Boekverslag", cijfer: 7.2, weging: 2, datum: "20 nov" },
    { naam: "Grammatica toets", cijfer: 6.4, weging: 2, datum: "05 nov" },
  ]},
  { vak: "Engels", laatste: 8.4, gemiddelde: 8.1, trend: "up", toetsen: [
    { naam: "Reading test", cijfer: 8.4, weging: 2, datum: "22 nov" },
    { naam: "Presentation", cijfer: 7.8, weging: 1, datum: "10 nov" },
  ]},
  { vak: "Scheikunde", laatste: 5.9, gemiddelde: 6.3, trend: "down", toetsen: [
    { naam: "SO Molberekeningen", cijfer: 5.9, weging: 1, datum: "25 nov" },
    { naam: "Proefwerk H2", cijfer: 6.6, weging: 3, datum: "01 nov" },
  ]},
  { vak: "Biologie", laatste: 7.5, gemiddelde: 7.6, trend: "flat", toetsen: [
    { naam: "Toets Cellen", cijfer: 7.5, weging: 2, datum: "19 nov" },
  ]},
  { vak: "Geschiedenis", laatste: 8.0, gemiddelde: 7.7, trend: "up", toetsen: [
    { naam: "Werkstuk WOII", cijfer: 8.0, weging: 3, datum: "15 nov" },
  ]},
];

export const opdrachten = [
  { vak: "Wiskunde B", titel: "Opgaven H4: Differentiëren", deadline: "Morgen 23:59", status: "open" as const, ingeleverd: false },
  { vak: "Nederlands", titel: "Essay: Multatuli en de moderne tijd", deadline: "Vr 28 nov", status: "open" as const, ingeleverd: false },
  { vak: "Engels", titel: "Book report — 1984", deadline: "Ma 1 dec", status: "concept" as const, ingeleverd: false },
  { vak: "Scheikunde", titel: "Praktijkverslag Titratie", deadline: "Ingeleverd", status: "beoordeeld" as const, cijfer: 7.4, ingeleverd: true },
  { vak: "Biologie", titel: "Onderzoeksvoorstel Ecosysteem", deadline: "Ingeleverd", status: "wachtend" as const, ingeleverd: true },
];

export const berichten = [
  { van: "M. Jansen", rol: "Docent Wiskunde", tijd: "10:24", preview: "Vergeet niet dat je opdracht voor morgen om 23:59 ingeleverd moet zijn.", ongelezen: true, avatar: "MJ" },
  { van: "Klas V4B", rol: "Groepschat · 24 leden", tijd: "09:48", preview: "Julia: Iemand aantekeningen van scheikunde vandaag?", ongelezen: true, avatar: "V4" },
  { van: "L. de Boer", rol: "Mentor", tijd: "Gisteren", preview: "Fijn gesprek gehad. Ik zet de vervolgafspraak in de agenda.", ongelezen: false, avatar: "LB" },
  { van: "Administratie", rol: "Schoolkantoor", tijd: "Ma", preview: "Herinnering: ouderavond dinsdag 3 december om 19:00.", ongelezen: false, avatar: "AD" },
  { van: "S. Green", rol: "Docent Engels", tijd: "Ma", preview: "Nice work on your presentation, Sanne!", ongelezen: false, avatar: "SG" },
];

export const activiteiten = [
  { titel: "Schoolreis Berlijn", datum: "12 – 16 mei 2026", deelnemers: 148, plekken: 180, doel: "Bovenbouw", status: "open" },
  { titel: "Ouderavond V4", datum: "3 december 2025", deelnemers: 62, plekken: 90, doel: "Ouders V4", status: "open" },
  { titel: "Sportdag onderbouw", datum: "18 december 2025", deelnemers: 210, plekken: 240, doel: "Klas 1-3", status: "open" },
  { titel: "Open Dag 2026", datum: "24 januari 2026", deelnemers: 0, plekken: 500, doel: "Externe bezoekers", status: "aankondiging" },
];

export const documenten = [
  { naam: "Wiskunde H4 — Uitwerkingen.pdf", vak: "Wiskunde", grootte: "1.2 MB", datum: "Vandaag", versie: "v3" },
  { naam: "Leeslijst Nederlands 2025-2026.docx", vak: "Nederlands", grootte: "84 KB", datum: "Ma", versie: "v2" },
  { naam: "Practicum handleiding — Titratie.pdf", vak: "Scheikunde", grootte: "540 KB", datum: "18 nov", versie: "v1" },
  { naam: "Studiewijzer Engels periode 2.pdf", vak: "Engels", grootte: "320 KB", datum: "12 nov", versie: "v4" },
  { naam: "Schoolgids 2025-2026.pdf", vak: "Algemeen", grootte: "3.4 MB", datum: "01 sep", versie: "v1" },
];

export const klassen = [
  { klas: "V4A", leerlingen: 28, gemiddelde: 7.2, aanwezigheid: 96 },
  { klas: "V4B", leerlingen: 26, gemiddelde: 7.4, aanwezigheid: 94 },
  { klas: "V5A", leerlingen: 24, gemiddelde: 6.9, aanwezigheid: 92 },
  { klas: "H4A", leerlingen: 30, gemiddelde: 7.0, aanwezigheid: 95 },
];

export const meldingen = [
  { titel: "Nieuw cijfer: Engels 8.4", tijd: "10 min", type: "cijfer" as const },
  { titel: "Roosterwijziging — Geschiedenis uitval", tijd: "1 u", type: "rooster" as const },
  { titel: "Bericht van M. Jansen", tijd: "2 u", type: "bericht" as const },
  { titel: "Deadline morgen — Wiskunde H4", tijd: "3 u", type: "deadline" as const },
];
