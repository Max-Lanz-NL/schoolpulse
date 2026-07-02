export type Role = "leerling" | "docent" | "ouder" | "teamleider" | "directie";

export const roleLabels: Record<Role, string> = {
  leerling: "Leerling",
  docent: "Docent",
  ouder: "Ouder",
  teamleider: "Teamleider",
  directie: "Directie",
};

// Avatar URLs via DiceBear (nette, gratis, deterministische portretten)
const dicebear = (seed: string, style = "avataaars") =>
  `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,ffdfbf`;

export const roleUsers: Record<Role, { name: string; sub: string; initials: string; avatar: string }> = {
  leerling: { name: "Sanne de Vries", sub: "4 VWO · Klas V4B", initials: "SV", avatar: dicebear("Sanne de Vries") },
  docent: { name: "Mark Jansen", sub: "Docent Wiskunde", initials: "MJ", avatar: dicebear("Mark Jansen") },
  ouder: { name: "Petra de Vries", sub: "Ouder van Sanne (V4B)", initials: "PV", avatar: dicebear("Petra de Vries") },
  teamleider: { name: "Ingrid Bakker", sub: "Teamleider Bovenbouw", initials: "IB", avatar: dicebear("Ingrid Bakker") },
  directie: { name: "Dr. Rob Hendriks", sub: "Rector", initials: "RH", avatar: dicebear("Rob Hendriks") },
};

// Vaste lesuur-tijden — mapping start-tijd → lesuur nummer
export const lesuurSchema: { uur: number; start: string; eind: string }[] = [
  { uur: 1, start: "08:30", eind: "09:20" },
  { uur: 2, start: "09:20", eind: "10:10" },
  { uur: 3, start: "10:30", eind: "11:20" },
  { uur: 4, start: "11:20", eind: "12:10" },
  { uur: 5, start: "12:10", eind: "13:00" },
  { uur: 6, start: "13:00", eind: "13:50" },
  { uur: 7, start: "13:50", eind: "14:40" },
  { uur: 8, start: "14:40", eind: "15:30" },
];
export function uurNummer(start: string): number {
  return lesuurSchema.find((l) => l.start === start)?.uur ?? 0;
}

export const roosterVandaag = [
  { tijd: "08:30 – 09:20", start: "08:30", vak: "Wiskunde B", lokaal: "204", docent: "M. Jansen", kleur: "bg-blue-500", huiswerk: "Maak §4.2 opgave 1 t/m 10", aanwezig: true },
  { tijd: "09:20 – 10:10", start: "09:20", vak: "Nederlands", lokaal: "112", docent: "L. de Boer", kleur: "bg-indigo-500", huiswerk: "Lees hoofdstuk 3 van 'Max Havelaar'", aanwezig: true },
  { tijd: "10:30 – 11:20", start: "10:30", vak: "Scheikunde", lokaal: "Lab 2", docent: "K. Visser", kleur: "bg-emerald-500", wijziging: "Lokaalwissel", huiswerk: "Neem practicumjas mee", aanwezig: true },
  { tijd: "11:20 – 12:10", start: "11:20", vak: "Engels", lokaal: "108", docent: "S. Green", kleur: "bg-amber-500", huiswerk: "Chapter 5 vocabulary quiz", aanwezig: true },
  { tijd: "13:00 – 13:50", start: "13:00", vak: "Geschiedenis", lokaal: "215", docent: "J. Peters", kleur: "bg-rose-500", wijziging: "Uitval — zelfstudie", huiswerk: "Zelfstudie §2 herhalen", aanwezig: false },
  { tijd: "13:50 – 14:40", start: "13:50", vak: "Biologie", lokaal: "Lab 1", docent: "H. Mulder", kleur: "bg-teal-500", huiswerk: "Practicumverslag afronden", aanwezig: true },
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

export type BerichtType = "docent" | "groep" | "mentor" | "admin";
export type ChatBericht = { van: string; tijd: string; mij: boolean; tekst: string; avatar?: string };

export const berichten: {
  id: string;
  van: string;
  rol: string;
  tijd: string;
  preview: string;
  ongelezen: boolean;
  avatar: string;
  kleur: string;
  type: BerichtType;
  thread: ChatBericht[];
}[] = [
  {
    id: "jansen",
    van: "M. Jansen",
    rol: "Docent Wiskunde",
    tijd: "10:24",
    preview: "Vergeet niet dat je opdracht voor morgen om 23:59 ingeleverd moet zijn.",
    ongelezen: true,
    avatar: dicebear("Mark Jansen"),
    kleur: "bg-blue-500",
    type: "docent",
    thread: [
      { van: "M. Jansen", tijd: "10:22", mij: false, tekst: "Hoi Sanne, ik zag dat je opdracht voor H4 nog niet is ingeleverd." },
      { van: "M. Jansen", tijd: "10:23", mij: false, tekst: "Deadline is morgen 23:59 — lukt dat?" },
      { van: "Ik", tijd: "10:31", mij: true, tekst: "Ja, ik ben er vanavond mee bezig. Vraag 6 snap ik niet helemaal — mag ik morgen even langskomen?" },
      { van: "M. Jansen", tijd: "10:32", mij: false, tekst: "Prima, kom rond 12:00 langs bij lokaal 204. Dan kijken we samen." },
      { van: "Ik", tijd: "10:33", mij: true, tekst: "Top, tot morgen!" },
    ],
  },
  {
    id: "v4b",
    van: "Klas V4B",
    rol: "Groepschat · 24 leden",
    tijd: "09:48",
    preview: "Julia: Iemand aantekeningen van scheikunde vandaag?",
    ongelezen: true,
    avatar: dicebear("V4B klas"),
    kleur: "bg-indigo-500",
    type: "groep",
    thread: [
      { van: "Tom", tijd: "09:31", mij: false, tekst: "Zijn jullie klaar met de wiskunde-opdracht?", avatar: dicebear("Tom") },
      { van: "Julia", tijd: "09:45", mij: false, tekst: "Ik nog niet, ga vanavond beginnen 😅", avatar: dicebear("Julia") },
      { van: "Julia", tijd: "09:48", mij: false, tekst: "Iemand aantekeningen van scheikunde vandaag?", avatar: dicebear("Julia") },
      { van: "Ik", tijd: "09:52", mij: true, tekst: "Ja ik heb foto's gemaakt, stuur ik zo!" },
      { van: "Ravi", tijd: "09:55", mij: false, tekst: "Top Sanne 🙌", avatar: dicebear("Ravi") },
    ],
  },
  {
    id: "deboer",
    van: "L. de Boer",
    rol: "Mentor",
    tijd: "Gisteren",
    preview: "Fijn gesprek gehad. Ik zet de vervolgafspraak in de agenda.",
    ongelezen: false,
    avatar: dicebear("Linda de Boer"),
    kleur: "bg-emerald-500",
    type: "mentor",
    thread: [
      { van: "L. de Boer", tijd: "gis 14:02", mij: false, tekst: "Hoi Sanne, fijn gesprek gehad vanmiddag." },
      { van: "L. de Boer", tijd: "gis 14:03", mij: false, tekst: "Ik zet de vervolgafspraak volgende week donderdag om 15:00 in de agenda." },
      { van: "Ik", tijd: "gis 15:10", mij: true, tekst: "Dank u wel, dat komt goed uit!" },
    ],
  },
  {
    id: "admin",
    van: "Administratie",
    rol: "Schoolkantoor",
    tijd: "Ma",
    preview: "Herinnering: ouderavond dinsdag 3 december om 19:00.",
    ongelezen: false,
    avatar: dicebear("Administratie", "shapes"),
    kleur: "bg-slate-500",
    type: "admin",
    thread: [
      { van: "Administratie", tijd: "ma 08:00", mij: false, tekst: "Beste Sanne, dit is een automatische herinnering." },
      { van: "Administratie", tijd: "ma 08:00", mij: false, tekst: "De ouderavond voor V4 vindt plaats op dinsdag 3 december om 19:00 in de aula." },
    ],
  },
  {
    id: "green",
    van: "S. Green",
    rol: "Docent Engels",
    tijd: "Ma",
    preview: "Nice work on your presentation, Sanne!",
    ongelezen: false,
    avatar: dicebear("Sarah Green"),
    kleur: "bg-amber-500",
    type: "docent",
    thread: [
      { van: "S. Green", tijd: "ma 11:20", mij: false, tekst: "Hi Sanne, nice work on your presentation this morning!" },
      { van: "S. Green", tijd: "ma 11:21", mij: false, tekst: "Your pronunciation has really improved. Keep it up!" },
      { van: "Ik", tijd: "ma 12:05", mij: true, tekst: "Thank you so much!" },
    ],
  },
];

export type Activiteit = {
  titel: string;
  datum: string;
  deelnemers: number;
  plekken: number;
  doel: string;
  status: string;
  zichtbaarVoor?: Role[]; // undefined = iedereen
};

export const activiteiten: Activiteit[] = [
  { titel: "Schoolreis Berlijn", datum: "12 – 16 mei 2026", deelnemers: 148, plekken: 180, doel: "Bovenbouw", status: "open" },
  { titel: "Ouderavond V4", datum: "3 december 2025", deelnemers: 62, plekken: 90, doel: "Ouders V4", status: "open", zichtbaarVoor: ["ouder", "docent", "teamleider", "directie"] },
  { titel: "Sportdag onderbouw", datum: "18 december 2025", deelnemers: 210, plekken: 240, doel: "Klas 1-3", status: "open" },
  { titel: "Open Dag 2026", datum: "24 januari 2026", deelnemers: 0, plekken: 500, doel: "Externe bezoekers", status: "aankondiging", zichtbaarVoor: ["docent", "teamleider", "directie"] },
];

export type Bestand = {
  naam: string;
  vak: string;
  grootte: string;
  datum: string;
  versie: string;
  gedeeldMet: string[];
};

export const documenten: Bestand[] = [
  { naam: "Wiskunde H4 — Uitwerkingen.pdf", vak: "Wiskunde", grootte: "1.2 MB", datum: "Vandaag", versie: "v3", gedeeldMet: ["Klas V4B", "M. Jansen"] },
  { naam: "Leeslijst Nederlands 2025-2026.docx", vak: "Nederlands", grootte: "84 KB", datum: "Ma", versie: "v2", gedeeldMet: ["Sectie Nederlands"] },
  { naam: "Practicum handleiding — Titratie.pdf", vak: "Scheikunde", grootte: "540 KB", datum: "18 nov", versie: "v1", gedeeldMet: ["Klas V4A", "Klas V4B"] },
  { naam: "Studiewijzer Engels periode 2.pdf", vak: "Engels", grootte: "320 KB", datum: "12 nov", versie: "v4", gedeeldMet: ["Bovenbouw"] },
  { naam: "Schoolgids 2025-2026.pdf", vak: "Algemeen", grootte: "3.4 MB", datum: "01 sep", versie: "v1", gedeeldMet: ["Iedereen"] },
];

export const klassen = [
  { klas: "V4A", leerlingen: 28, gemiddelde: 7.2, aanwezigheid: 96 },
  { klas: "V4B", leerlingen: 26, gemiddelde: 7.4, aanwezigheid: 94 },
  { klas: "V5A", leerlingen: 24, gemiddelde: 6.9, aanwezigheid: 92 },
  { klas: "H4A", leerlingen: 30, gemiddelde: 7.0, aanwezigheid: 95 },
];

export const meldingen: { titel: string; tijd: string; type: "cijfer" | "rooster" | "bericht" | "deadline"; link: string }[] = [
  { titel: "Nieuw cijfer: Engels 8.4", tijd: "10 min", type: "cijfer", link: "/app/cijfers" },
  { titel: "Roosterwijziging — Geschiedenis uitval", tijd: "1 u", type: "rooster", link: "/app/rooster" },
  { titel: "Bericht van M. Jansen", tijd: "2 u", type: "bericht", link: "/app/berichten" },
  { titel: "Deadline morgen — Wiskunde H4", tijd: "3 u", type: "deadline", link: "/app/opdrachten" },
];
