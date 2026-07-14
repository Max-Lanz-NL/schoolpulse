export type Role = "leerling" | "docent" | "ouder" | "teamleider" | "directie";

export const roleLabels: Record<Role, string> = {
  leerling: "Leerling",
  docent: "Docent",
  ouder: "Ouder",
  teamleider: "Teamleider",
  directie: "Directie",
};

const dicebear = (seed: string, style = "avataaars") =>
  `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,ffdfbf`;

export const roleUsers: Record<
  Role,
  { name: string; sub: string; initials: string; avatar: string }
> = {
  leerling: {
    name: "Sanne de Vries",
    sub: "4 VWO · Klas V4B",
    initials: "SV",
    avatar: dicebear("Sanne de Vries"),
  },
  docent: {
    name: "Mark Jansen",
    sub: "Docent Wiskunde",
    initials: "MJ",
    avatar: dicebear("Mark Jansen"),
  },
  ouder: {
    name: "Petra de Vries",
    sub: "Ouder van Sanne (V4B)",
    initials: "PV",
    avatar: dicebear("Petra de Vries"),
  },
  teamleider: {
    name: "Ingrid Bakker",
    sub: "Teamleider Bovenbouw",
    initials: "IB",
    avatar: dicebear("Ingrid Bakker"),
  },
  directie: {
    name: "Dr. Rob Hendriks",
    sub: "Rector",
    initials: "RH",
    avatar: dicebear("Rob Hendriks"),
  },
};

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

export type LesStatus = "aanwezig" | "afwezig" | "ziek" | "afgemeld" | "onbekend";

export type Les = {
  tijd: string;
  start: string;
  vak: string;
  lokaal: string;
  docent: string;
  docentId?: string;
  kleur: string;
  huiswerk?: string;
  wijziging?: string;
  aanwezig?: boolean;
};

export const roosterVandaag: Les[] = [
  {
    tijd: "08:30 – 09:20",
    start: "08:30",
    vak: "Wiskunde B",
    lokaal: "204",
    docent: "M. Jansen",
    docentId: "jansen",
    kleur: "bg-blue-500",
    huiswerk: "Maak §4.2 opgave 1 t/m 10",
    aanwezig: true,
  },
  {
    tijd: "09:20 – 10:10",
    start: "09:20",
    vak: "Nederlands",
    lokaal: "112",
    docent: "L. de Boer",
    docentId: "deboer",
    kleur: "bg-indigo-500",
    huiswerk: "Lees hoofdstuk 3 van 'Max Havelaar'",
    aanwezig: true,
  },
  {
    tijd: "10:30 – 11:20",
    start: "10:30",
    vak: "Scheikunde",
    lokaal: "Lab 2",
    docent: "K. Visser",
    docentId: "visser",
    kleur: "bg-emerald-500",
    wijziging: "Lokaalwissel",
    huiswerk: "Neem practicumjas mee",
    aanwezig: true,
  },
  {
    tijd: "11:20 – 12:10",
    start: "11:20",
    vak: "Engels",
    lokaal: "108",
    docent: "S. Green",
    docentId: "green",
    kleur: "bg-amber-500",
    huiswerk: "Chapter 5 vocabulary quiz",
    aanwezig: true,
  },
  {
    tijd: "13:00 – 13:50",
    start: "13:00",
    vak: "Geschiedenis",
    lokaal: "215",
    docent: "J. Peters",
    docentId: "peters",
    kleur: "bg-rose-500",
    wijziging: "Uitval — zelfstudie",
    huiswerk: "Zelfstudie §2 herhalen",
    aanwezig: false,
  },
  {
    tijd: "13:50 – 14:40",
    start: "13:50",
    vak: "Biologie",
    lokaal: "Lab 1",
    docent: "H. Mulder",
    docentId: "mulder",
    kleur: "bg-teal-500",
    huiswerk: "Practicumverslag afronden",
    aanwezig: true,
  },
];

// Weekrooster (leerling) — per dag een lijst
export const weekRooster: Record<string, Les[]> = {
  Ma: [
    {
      tijd: "08:30 – 09:20",
      start: "08:30",
      vak: "Wiskunde B",
      lokaal: "204",
      docent: "M. Jansen",
      docentId: "jansen",
      kleur: "bg-blue-500",
      huiswerk: "§4.2 opgaven",
    },
    {
      tijd: "09:20 – 10:10",
      start: "09:20",
      vak: "Nederlands",
      lokaal: "112",
      docent: "L. de Boer",
      docentId: "deboer",
      kleur: "bg-indigo-500",
    },
    {
      tijd: "10:30 – 11:20",
      start: "10:30",
      vak: "Scheikunde",
      lokaal: "Lab 2",
      docent: "K. Visser",
      docentId: "visser",
      kleur: "bg-emerald-500",
    },
    {
      tijd: "11:20 – 12:10",
      start: "11:20",
      vak: "Engels",
      lokaal: "108",
      docent: "S. Green",
      docentId: "green",
      kleur: "bg-amber-500",
    },
    {
      tijd: "13:00 – 13:50",
      start: "13:00",
      vak: "Geschiedenis",
      lokaal: "215",
      docent: "J. Peters",
      docentId: "peters",
      kleur: "bg-rose-500",
    },
    {
      tijd: "13:50 – 14:40",
      start: "13:50",
      vak: "Biologie",
      lokaal: "Lab 1",
      docent: "H. Mulder",
      docentId: "mulder",
      kleur: "bg-teal-500",
    },
  ],
  Di: roosterVandaag,
  Wo: [
    {
      tijd: "09:20 – 10:10",
      start: "09:20",
      vak: "Biologie",
      lokaal: "Lab 1",
      docent: "H. Mulder",
      docentId: "mulder",
      kleur: "bg-teal-500",
    },
    {
      tijd: "10:30 – 11:20",
      start: "10:30",
      vak: "Wiskunde B",
      lokaal: "204",
      docent: "M. Jansen",
      docentId: "jansen",
      kleur: "bg-blue-500",
    },
    {
      tijd: "11:20 – 12:10",
      start: "11:20",
      vak: "Geschiedenis",
      lokaal: "215",
      docent: "J. Peters",
      docentId: "peters",
      kleur: "bg-rose-500",
    },
    {
      tijd: "13:00 – 13:50",
      start: "13:00",
      vak: "Engels",
      lokaal: "108",
      docent: "S. Green",
      docentId: "green",
      kleur: "bg-amber-500",
    },
  ],
  Do: [
    {
      tijd: "08:30 – 09:20",
      start: "08:30",
      vak: "Nederlands",
      lokaal: "112",
      docent: "L. de Boer",
      docentId: "deboer",
      kleur: "bg-indigo-500",
    },
    {
      tijd: "09:20 – 10:10",
      start: "09:20",
      vak: "Wiskunde B",
      lokaal: "204",
      docent: "M. Jansen",
      docentId: "jansen",
      kleur: "bg-blue-500",
    },
    {
      tijd: "11:20 – 12:10",
      start: "11:20",
      vak: "Biologie",
      lokaal: "Lab 1",
      docent: "H. Mulder",
      docentId: "mulder",
      kleur: "bg-teal-500",
    },
    {
      tijd: "13:00 – 13:50",
      start: "13:00",
      vak: "Scheikunde",
      lokaal: "Lab 2",
      docent: "K. Visser",
      docentId: "visser",
      kleur: "bg-emerald-500",
    },
    {
      tijd: "13:50 – 14:40",
      start: "13:50",
      vak: "Geschiedenis",
      lokaal: "215",
      docent: "J. Peters",
      docentId: "peters",
      kleur: "bg-rose-500",
    },
  ],
  Vr: [
    {
      tijd: "08:30 – 09:20",
      start: "08:30",
      vak: "Engels",
      lokaal: "108",
      docent: "S. Green",
      docentId: "green",
      kleur: "bg-amber-500",
    },
    {
      tijd: "09:20 – 10:10",
      start: "09:20",
      vak: "Geschiedenis",
      lokaal: "215",
      docent: "J. Peters",
      docentId: "peters",
      kleur: "bg-rose-500",
    },
    {
      tijd: "10:30 – 11:20",
      start: "10:30",
      vak: "Nederlands",
      lokaal: "112",
      docent: "L. de Boer",
      docentId: "deboer",
      kleur: "bg-indigo-500",
    },
    {
      tijd: "11:20 – 12:10",
      start: "11:20",
      vak: "Wiskunde B",
      lokaal: "204",
      docent: "M. Jansen",
      docentId: "jansen",
      kleur: "bg-blue-500",
    },
    {
      tijd: "13:50 – 14:40",
      start: "13:50",
      vak: "Scheikunde",
      lokaal: "Lab 2",
      docent: "K. Visser",
      docentId: "visser",
      kleur: "bg-emerald-500",
    },
  ],
};

// Sortable date field (ISO YYYY-MM-DD) plus display label
export const cijfers = [
  {
    vak: "Wiskunde B",
    laatste: 7.8,
    gemiddelde: 7.4,
    trend: "up",
    toetsen: [
      { naam: "SO Hoofdstuk 3", cijfer: 8.2, weging: 1, datum: "12 mei", iso: "2026-05-12" },
      { naam: "Proefwerk H1-H2", cijfer: 7.0, weging: 3, datum: "14 apr", iso: "2026-04-14" },
      { naam: "Praktische opdracht", cijfer: 8.5, weging: 2, datum: "24 mrt", iso: "2026-03-24" },
    ],
  },
  {
    vak: "Nederlands",
    laatste: 6.8,
    gemiddelde: 6.9,
    trend: "flat",
    toetsen: [
      { naam: "Boekverslag", cijfer: 7.2, weging: 2, datum: "20 mei", iso: "2026-05-20" },
      { naam: "Grammatica toets", cijfer: 6.4, weging: 2, datum: "5 mei", iso: "2026-05-05" },
    ],
  },
  {
    vak: "Engels",
    laatste: 8.4,
    gemiddelde: 8.1,
    trend: "up",
    toetsen: [
      { naam: "Reading test", cijfer: 8.4, weging: 2, datum: "2 jun", iso: "2026-06-02" },
      { naam: "Presentation", cijfer: 7.8, weging: 1, datum: "19 mei", iso: "2026-05-19" },
    ],
  },
  {
    vak: "Scheikunde",
    laatste: 5.4,
    gemiddelde: 5.7,
    trend: "down",
    toetsen: [
      { naam: "SO Molberekeningen", cijfer: 5.4, weging: 1, datum: "2 jun", iso: "2026-06-02" },
      { naam: "Proefwerk H2", cijfer: 5.9, weging: 3, datum: "13 mei", iso: "2026-05-13" },
    ],
  },
  {
    vak: "Biologie",
    laatste: 7.5,
    gemiddelde: 7.6,
    trend: "flat",
    toetsen: [{ naam: "Toets Cellen", cijfer: 7.5, weging: 2, datum: "28 mei", iso: "2026-05-28" }],
  },
  {
    vak: "Geschiedenis",
    laatste: 8.0,
    gemiddelde: 7.7,
    trend: "up",
    toetsen: [
      { naam: "Werkstuk WOII", cijfer: 8.0, weging: 3, datum: "19 mei", iso: "2026-05-19" },
    ],
  },
];

export const opdrachten = [
  {
    vak: "Wiskunde B",
    titel: "Opgaven H4: Differentiëren",
    deadline: "Morgen 23:59",
    status: "open" as const,
    ingeleverd: false,
  },
  {
    vak: "Nederlands",
    titel: "Essay: Multatuli en de moderne tijd",
    deadline: "Vr 10 jul",
    status: "open" as const,
    ingeleverd: false,
  },
  {
    vak: "Engels",
    titel: "Book report — 1984",
    deadline: "Ma 13 jul",
    status: "concept" as const,
    ingeleverd: false,
  },
  {
    vak: "Scheikunde",
    titel: "Praktijkverslag Titratie",
    deadline: "Ingeleverd",
    status: "beoordeeld" as const,
    cijfer: 7.4,
    ingeleverd: true,
  },
  {
    vak: "Biologie",
    titel: "Onderzoeksvoorstel Ecosysteem",
    deadline: "Ingeleverd",
    status: "wachtend" as const,
    ingeleverd: true,
  },
];

// Docent-opdrachten (per klas), incl. te-laat
export type DocentOpdracht = {
  id: string;
  titel: string;
  vak: string;
  klas: string;
  deadline: string;
  weging: number;
  status: "openstaand" | "ingeleverd" | "te-laat" | "beoordeeld";
  ingeleverd: number;
  totaal: number;
  telaatLeerlingen?: { naam: string; dagenTeLaat: number }[];
};
export const docentOpdrachten: DocentOpdracht[] = [
  {
    id: "o1",
    titel: "SO Herhaling Differentiëren",
    vak: "Wiskunde B",
    klas: "V4B",
    deadline: "25 nov 23:59",
    weging: 2,
    status: "beoordeeld",
    ingeleverd: 24,
    totaal: 26,
  },
  {
    id: "o2",
    titel: "Opgaven H4: Differentiëren",
    vak: "Wiskunde B",
    klas: "V4B",
    deadline: "28 nov 23:59",
    weging: 1,
    status: "openstaand",
    ingeleverd: 12,
    totaal: 26,
  },
  {
    id: "o3",
    titel: "SO Herhaling Vectoren",
    vak: "Wiskunde B",
    klas: "V5A",
    deadline: "24 nov 23:59",
    weging: 1,
    status: "te-laat",
    ingeleverd: 22,
    totaal: 24,
    telaatLeerlingen: [
      { naam: "Tom Bakker", dagenTeLaat: 2 },
      { naam: "Julia Smit", dagenTeLaat: 1 },
    ],
  },
  {
    id: "o4",
    titel: "Praktische opdracht statistiek",
    vak: "Wiskunde B",
    klas: "V4A",
    deadline: "22 nov 23:59",
    weging: 3,
    status: "ingeleverd",
    ingeleverd: 28,
    totaal: 28,
  },
];

// Docent — klassen met leerlingen en per leerling de vakken waarin docent lesgeeft
export type Leerling = {
  id: string;
  naam: string;
  vakken: string[];
  cijfers: Record<string, { naam: string; cijfer: number; weging: number; datum: string }[]>;
};
export const docentKlassen: { klas: string; vak: string; leerlingen: Leerling[] }[] = [
  {
    klas: "V4B",
    vak: "Wiskunde B",
    leerlingen: [
      {
        id: "l1",
        naam: "Sanne de Vries",
        vakken: ["Wiskunde B"],
        cijfers: {
          "Wiskunde B": [
            { naam: "SO H3", cijfer: 8.2, weging: 1, datum: "12 nov" },
            { naam: "PW H1-H2", cijfer: 7.0, weging: 3, datum: "18 okt" },
          ],
        },
      },
      {
        id: "l2",
        naam: "Tom Bakker",
        vakken: ["Wiskunde B"],
        cijfers: {
          "Wiskunde B": [
            { naam: "SO H3", cijfer: 6.4, weging: 1, datum: "12 nov" },
            { naam: "PW H1-H2", cijfer: 5.8, weging: 3, datum: "18 okt" },
          ],
        },
      },
      {
        id: "l3",
        naam: "Julia Smit",
        vakken: ["Wiskunde B"],
        cijfers: { "Wiskunde B": [{ naam: "SO H3", cijfer: 7.8, weging: 1, datum: "12 nov" }] },
      },
      {
        id: "l4",
        naam: "Ravi Kumar",
        vakken: ["Wiskunde B"],
        cijfers: {
          "Wiskunde B": [
            { naam: "SO H3", cijfer: 9.0, weging: 1, datum: "12 nov" },
            { naam: "PW H1-H2", cijfer: 8.4, weging: 3, datum: "18 okt" },
          ],
        },
      },
    ],
  },
  {
    klas: "V4A",
    vak: "Wiskunde B",
    leerlingen: [
      {
        id: "a1",
        naam: "Emma Visser",
        vakken: ["Wiskunde B"],
        cijfers: { "Wiskunde B": [{ naam: "PW H1-H2", cijfer: 7.6, weging: 3, datum: "18 okt" }] },
      },
      {
        id: "a2",
        naam: "Noah Jansen",
        vakken: ["Wiskunde B"],
        cijfers: { "Wiskunde B": [{ naam: "PW H1-H2", cijfer: 6.2, weging: 3, datum: "18 okt" }] },
      },
    ],
  },
  {
    klas: "V5A",
    vak: "Wiskunde B",
    leerlingen: [
      {
        id: "v1",
        naam: "Lisa Peters",
        vakken: ["Wiskunde B"],
        cijfers: {
          "Wiskunde B": [{ naam: "SO Vectoren", cijfer: 7.2, weging: 1, datum: "24 nov" }],
        },
      },
      {
        id: "v2",
        naam: "Daan de Wit",
        vakken: ["Wiskunde B"],
        cijfers: {
          "Wiskunde B": [{ naam: "SO Vectoren", cijfer: 5.6, weging: 1, datum: "24 nov" }],
        },
      },
    ],
  },
];

// Aanwezigheid per les — alleen leerlingen (docenten/teamleiders/directie nooit)
export const lesAanwezigheid: Record<string, { naam: string; status: LesStatus }[]> = {
  default: [
    { naam: "Sanne de Vries", status: "aanwezig" },
    { naam: "Tom Bakker", status: "ziek" },
    { naam: "Julia Smit", status: "aanwezig" },
    { naam: "Ravi Kumar", status: "aanwezig" },
    { naam: "Emma Visser", status: "afgemeld" },
    { naam: "Noah Jansen", status: "onbekend" },
    { naam: "Lisa Peters", status: "aanwezig" },
    { naam: "Daan de Wit", status: "onbekend" },
  ],
};

export type BerichtType = "docent" | "groep" | "mentor" | "admin" | "collega" | "teamleider";
export type ChatBericht = {
  van: string;
  tijd: string;
  mij: boolean;
  tekst: string;
  avatar?: string;
};

export type Bericht = {
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
};

export const berichten: Bericht[] = [
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
      {
        van: "M. Jansen",
        tijd: "10:22",
        mij: false,
        tekst: "Hoi Sanne, ik zag dat je opdracht voor H4 nog niet is ingeleverd.",
      },
      {
        van: "M. Jansen",
        tijd: "10:23",
        mij: false,
        tekst: "Deadline is morgen 23:59 — lukt dat?",
      },
      { van: "Ik", tijd: "10:31", mij: true, tekst: "Ja, ik ben er vanavond mee bezig." },
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
      {
        van: "Tom",
        tijd: "09:31",
        mij: false,
        tekst: "Zijn jullie klaar met de wiskunde-opdracht?",
        avatar: dicebear("Tom"),
      },
      {
        van: "Julia",
        tijd: "09:48",
        mij: false,
        tekst: "Iemand aantekeningen van scheikunde vandaag?",
        avatar: dicebear("Julia"),
      },
      { van: "Ik", tijd: "09:52", mij: true, tekst: "Ja ik heb foto's gemaakt, stuur ik zo!" },
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
      {
        van: "L. de Boer",
        tijd: "gis 14:02",
        mij: false,
        tekst: "Hoi Sanne, fijn gesprek gehad vanmiddag.",
      },
      { van: "Ik", tijd: "gis 15:10", mij: true, tekst: "Dank u wel!" },
    ],
  },
];

// Docent-conversaties
export const docentBerichten: Bericht[] = [
  {
    id: "deboer-col",
    van: "L. de Boer",
    rol: "Collega — Nederlands",
    tijd: "11:02",
    preview: "Kan jij dinsdag mijn 3e uur overnemen?",
    ongelezen: true,
    avatar: dicebear("Linda de Boer"),
    kleur: "bg-indigo-500",
    type: "collega",
    thread: [
      {
        van: "L. de Boer",
        tijd: "10:58",
        mij: false,
        tekst: "Hoi Mark, ik heb dinsdag een afspraak in het ziekenhuis.",
      },
      { van: "L. de Boer", tijd: "11:02", mij: false, tekst: "Kan jij mijn 3e uur V4B overnemen?" },
      {
        van: "Ik",
        tijd: "11:10",
        mij: true,
        tekst: "Ja, geen probleem — stuur je de lesstof door?",
      },
    ],
  },
  {
    id: "sectie-wi",
    van: "Sectie Wiskunde",
    rol: "Groepschat · 6 docenten",
    tijd: "09:15",
    preview: "K. Visser: SE-planning staat in de gedeelde map.",
    ongelezen: true,
    avatar: dicebear("Sectie Wiskunde"),
    kleur: "bg-blue-500",
    type: "groep",
    thread: [
      {
        van: "K. Visser",
        tijd: "09:12",
        mij: false,
        tekst: "SE-planning staat in de gedeelde map.",
        avatar: dicebear("Karin Visser"),
      },
      {
        van: "J. Peters",
        tijd: "09:14",
        mij: false,
        tekst: "Bedankt! Ik loop hem vanavond door.",
        avatar: dicebear("Jan Peters"),
      },
      {
        van: "Ik",
        tijd: "09:20",
        mij: true,
        tekst: "Top, ik zet 'm op de sectievergadering agenda.",
      },
    ],
  },
  {
    id: "teamleider",
    van: "I. Bakker",
    rol: "Teamleider Bovenbouw",
    tijd: "Gisteren",
    preview: "Bedankt voor het rapport over V5A.",
    ongelezen: false,
    avatar: dicebear("Ingrid Bakker"),
    kleur: "bg-emerald-500",
    type: "teamleider",
    thread: [
      {
        van: "I. Bakker",
        tijd: "gis 15:44",
        mij: false,
        tekst: "Bedankt voor het rapport over V5A, duidelijk overzicht.",
      },
      { van: "Ik", tijd: "gis 16:02", mij: true, tekst: "Graag gedaan!" },
    ],
  },
  {
    id: "over-tom",
    van: "L. de Boer",
    rol: "Over: Tom Bakker (V4B)",
    tijd: "Ma",
    preview: "Tom scoort structureel onvoldoende, laten we overleggen.",
    ongelezen: false,
    avatar: dicebear("Linda de Boer 2"),
    kleur: "bg-amber-500",
    type: "collega",
    thread: [
      {
        van: "L. de Boer",
        tijd: "ma 10:00",
        mij: false,
        tekst:
          "Tom scoort structureel onvoldoende in verschillende vakken. Zullen we een overleg plannen met de mentor?",
      },
      { van: "Ik", tijd: "ma 10:22", mij: true, tekst: "Goed idee — donderdag na school?" },
    ],
  },
  {
    id: "surveillance",
    van: "Roostercoördinatie",
    rol: "Praktisch overleg",
    tijd: "Ma",
    preview: "Surveillance CSE tijdvak 1 — indeling",
    ongelezen: false,
    avatar: dicebear("Rooster"),
    kleur: "bg-slate-500",
    type: "admin",
    thread: [
      {
        van: "Roostercoördinatie",
        tijd: "ma 08:30",
        mij: false,
        tekst: "Surveillance CSE tijdvak 1 indeling zit in de bijlage. Graag bevestigen.",
      },
      { van: "Ik", tijd: "ma 09:00", mij: true, tekst: "Bevestigd." },
    ],
  },
];

// Ouder-berichten (Petra de Vries ↔ school)
export const ouderBerichten: Bericht[] = [
  {
    id: "mentor-ouder",
    van: "L. de Boer",
    rol: "Mentor V4B",
    tijd: "14:32",
    preview: "Fijn om bij te praten over Sanne's voortgang.",
    ongelezen: true,
    avatar: dicebear("Linda de Boer"),
    kleur: "bg-emerald-500",
    type: "mentor",
    thread: [
      {
        van: "L. de Boer",
        tijd: "14:30",
        mij: false,
        tekst:
          "Goedemiddag mevrouw De Vries, ik wilde even contact opnemen over Sanne's voortgang.",
      },
      {
        van: "L. de Boer",
        tijd: "14:31",
        mij: false,
        tekst:
          "Ze doet het over het algemeen goed, maar bij scheikunde zijn de cijfers wat aan de lage kant. Zou u volgende week een moment hebben voor een gesprek?",
      },
      {
        van: "Ik",
        tijd: "14:45",
        mij: true,
        tekst: "Dank voor het bericht. Woensdag om 16:00 schikt mij goed.",
      },
    ],
  },
  {
    id: "school-aankondiging-ouder",
    van: "Scholengemeenschap De Horizon",
    rol: "Schoolbericht",
    tijd: "Gisteren",
    preview: "Ouderavond V4 — 8 oktober 2026 inschrijving open.",
    ongelezen: false,
    avatar: dicebear("School"),
    kleur: "bg-primary",
    type: "admin",
    thread: [
      {
        van: "Scholengemeenschap De Horizon",
        tijd: "gis 09:00",
        mij: false,
        tekst:
          "Beste ouder/verzorger, de inschrijving voor de ouderavond V4 op 8 oktober 2026 is nu open. U kunt een tijdslot reserveren via de Activiteiten pagina.",
      },
    ],
  },
  {
    id: "teamleider-ouder",
    van: "I. Bakker",
    rol: "Teamleider Bovenbouw",
    tijd: "Ma",
    preview: "Betreft het voortgangsgesprek van 9 juli.",
    ongelezen: false,
    avatar: dicebear("Ingrid Bakker"),
    kleur: "bg-amber-500",
    type: "teamleider",
    thread: [
      {
        van: "I. Bakker",
        tijd: "ma 09:15",
        mij: false,
        tekst:
          "Geachte mevrouw De Vries, ik wil u informeren dat het voortgangsgesprek op 9 juli om 16:00 bij de mentor doorgang vindt.",
      },
      { van: "Ik", tijd: "ma 10:00", mij: true, tekst: "Dank voor de bevestiging." },
    ],
  },
];

// Teamleider-berichten (Ingrid Bakker ↔ directie/collega's)
export const teamleiderBerichten: Bericht[] = [
  {
    id: "directie-tl",
    van: "Dr. R. Hendriks",
    rol: "Rector",
    tijd: "10:15",
    preview: "Graag je input voor de teamvergadering van donderdag.",
    ongelezen: true,
    avatar: dicebear("Rob Hendriks"),
    kleur: "bg-slate-600",
    type: "admin",
    thread: [
      {
        van: "Dr. R. Hendriks",
        tijd: "10:12",
        mij: false,
        tekst:
          "Goedemorgen Ingrid, voor de teamvergadering donderdag heb ik jouw input nodig over de resultaten bovenbouw.",
      },
      {
        van: "Dr. R. Hendriks",
        tijd: "10:15",
        mij: false,
        tekst: "Kun je een kort overzicht sturen van de klassen met aandachtspunten?",
      },
      {
        van: "Ik",
        tijd: "10:30",
        mij: true,
        tekst: "Komt voor elkaar, ik stuur het voor woensdag 17:00 door.",
      },
    ],
  },
  {
    id: "jansen-tl",
    van: "M. Jansen",
    rol: "Docent Wiskunde",
    tijd: "09:02",
    preview: "Tom Bakker scoort structureel onvoldoende — overleg?",
    ongelezen: true,
    avatar: dicebear("Mark Jansen"),
    kleur: "bg-blue-500",
    type: "collega",
    thread: [
      {
        van: "M. Jansen",
        tijd: "09:00",
        mij: false,
        tekst:
          "Hoi Ingrid, ik maak me zorgen over Tom Bakker (V4B). Hij scoort nu drie toetsen op rij onvoldoende voor wiskunde.",
      },
      {
        van: "M. Jansen",
        tijd: "09:02",
        mij: false,
        tekst: "Kunnen we een multidisciplinair overleg plannen met de mentor?",
      },
      {
        van: "Ik",
        tijd: "09:20",
        mij: true,
        tekst: "Goed idee — ik plan het voor donderdag na schooltijd.",
      },
    ],
  },
  {
    id: "sectie-bovenbouw",
    van: "Bovenbouw Overleg",
    rol: "Groepschat · 8 docenten",
    tijd: "Gisteren",
    preview: "Agenda sectievergadering 10 juli staat online.",
    ongelezen: false,
    avatar: dicebear("Bovenbouw sectie"),
    kleur: "bg-indigo-500",
    type: "groep",
    thread: [
      {
        van: "I. Bakker",
        tijd: "gis 14:00",
        mij: true,
        tekst:
          "De agenda voor de sectievergadering op 10 juli staat nu in de gedeelde map. Graag punten aanleveren voor woensdag.",
      },
      {
        van: "M. Jansen",
        tijd: "gis 14:22",
        mij: false,
        tekst: "Ontvangen, dank!",
        avatar: dicebear("Mark Jansen"),
      },
      {
        van: "L. de Boer",
        tijd: "gis 14:45",
        mij: false,
        tekst: "Ik voeg het mentorpunt nog toe.",
        avatar: dicebear("Linda de Boer"),
      },
    ],
  },
  {
    id: "rooster-tl",
    van: "Roostercoördinatie",
    rol: "Praktisch overleg",
    tijd: "Ma",
    preview: "Vervangingsrooster week 28 ter goedkeuring.",
    ongelezen: false,
    avatar: dicebear("Rooster"),
    kleur: "bg-slate-500",
    type: "admin",
    thread: [
      {
        van: "Roostercoördinatie",
        tijd: "ma 08:00",
        mij: false,
        tekst: "Het vervangingsrooster voor week 28 is klaar. Graag uw goedkeuring voor 09:00.",
      },
      { van: "Ik", tijd: "ma 08:45", mij: true, tekst: "Goedgekeurd." },
    ],
  },
];

// Directie-berichten (Dr. Rob Hendriks ↔ teamleider/administratie)
export const directieBerichten: Bericht[] = [
  {
    id: "bakker-dir",
    van: "I. Bakker",
    rol: "Teamleider Bovenbouw",
    tijd: "11:03",
    preview: "Overzicht bovenbouw resultaten — ter voorbereiding vergadering.",
    ongelezen: true,
    avatar: dicebear("Ingrid Bakker"),
    kleur: "bg-amber-500",
    type: "teamleider",
    thread: [
      {
        van: "I. Bakker",
        tijd: "11:00",
        mij: false,
        tekst:
          "Goedemorgen Rob, bijgaand het overzicht van de bovenbouwresultaten als voorbereiding op de vergadering van donderdag.",
      },
      {
        van: "I. Bakker",
        tijd: "11:03",
        mij: false,
        tekst: "Aandachtspunt: V4B scheikunde gemiddelde onder de grens.",
      },
      {
        van: "Ik",
        tijd: "11:20",
        mij: true,
        tekst: "Bedankt, ik heb het bekeken. Laten we dit donderdag bespreken.",
      },
    ],
  },
  {
    id: "admin-rooster-dir",
    van: "Administratie",
    rol: "Roosterwijziging",
    tijd: "09:30",
    preview: "3 openstaande roosterwijzigingen wachten op goedkeuring.",
    ongelezen: true,
    avatar: dicebear("Administratie"),
    kleur: "bg-slate-500",
    type: "admin",
    thread: [
      {
        van: "Administratie",
        tijd: "09:28",
        mij: false,
        tekst:
          "Geachte rector, er zijn 3 roosterwijzigingsverzoeken ingediend die uw goedkeuring vereisen.",
      },
      {
        van: "Administratie",
        tijd: "09:30",
        mij: false,
        tekst: "Het betreft wisseluren dinsdag en donderdag week 29. Zie bijgevoegd overzicht.",
      },
    ],
  },
  {
    id: "directie-overleg",
    van: "Directie Overleg",
    rol: "Groepschat · Directie & MT",
    tijd: "Gisteren",
    preview: "Notulen vergadering 4 juli beschikbaar.",
    ongelezen: false,
    avatar: dicebear("Directie overleg"),
    kleur: "bg-slate-700",
    type: "groep",
    thread: [
      {
        van: "Secretariaat",
        tijd: "gis 10:00",
        mij: false,
        tekst: "De notulen van de MT-vergadering van 4 juli zijn beschikbaar in de gedeelde map.",
        avatar: dicebear("Secretariaat"),
      },
      {
        van: "Ik",
        tijd: "gis 11:00",
        mij: true,
        tekst: "Dank. Volgende vergadering is 11 juli om 09:00.",
      },
    ],
  },
  {
    id: "teamleider-onderbouw",
    van: "P. Smit",
    rol: "Teamleider Onderbouw",
    tijd: "Ma",
    preview: "Verzoek extra ondersteuning klas H3A.",
    ongelezen: false,
    avatar: dicebear("Pieter Smit"),
    kleur: "bg-teal-500",
    type: "teamleider",
    thread: [
      {
        van: "P. Smit",
        tijd: "ma 09:00",
        mij: false,
        tekst:
          "Beste Rob, klas H3A vraagt om extra ondersteuning vanwege een hoog ziekteverzuim de afgelopen weken. Kunnen we dit oppakken?",
      },
      {
        van: "Ik",
        tijd: "ma 10:15",
        mij: true,
        tekst: "Ik stem dit af met de zorgcoördinator en kom bij je terug.",
      },
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
  zichtbaarVoor?: Role[];
};

export const activiteiten: Activiteit[] = [
  {
    titel: "Schoolreis Berlijn",
    datum: "12 – 16 mei 2026",
    deelnemers: 148,
    plekken: 180,
    doel: "Bovenbouw",
    status: "open",
  },
  {
    titel: "Ouderavond V4",
    datum: "8 oktober 2026",
    deelnemers: 62,
    plekken: 90,
    doel: "Ouders V4",
    status: "open",
    zichtbaarVoor: ["ouder", "docent", "teamleider", "directie"],
  },
  {
    titel: "Sportdag onderbouw",
    datum: "11 december 2026",
    deelnemers: 210,
    plekken: 240,
    doel: "Klas 1-3",
    status: "open",
  },
  {
    titel: "Open Dag 2027",
    datum: "23 januari 2027",
    deelnemers: 0,
    plekken: 500,
    doel: "Externe bezoekers",
    status: "aankondiging",
    zichtbaarVoor: ["docent", "teamleider", "directie"],
  },
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
  {
    naam: "Wiskunde H4 — Uitwerkingen.pdf",
    vak: "Wiskunde",
    grootte: "1.2 MB",
    datum: "Vandaag",
    versie: "v3",
    gedeeldMet: ["Klas V4B", "M. Jansen"],
  },
  {
    naam: "Leeslijst Nederlands 2025-2026.docx",
    vak: "Nederlands",
    grootte: "84 KB",
    datum: "Ma",
    versie: "v2",
    gedeeldMet: ["Sectie Nederlands"],
  },
  {
    naam: "Practicum handleiding — Titratie.pdf",
    vak: "Scheikunde",
    grootte: "540 KB",
    datum: "3 jun",
    versie: "v1",
    gedeeldMet: ["Klas V4A", "Klas V4B"],
  },
  {
    naam: "Studiewijzer Engels periode 2.pdf",
    vak: "Engels",
    grootte: "320 KB",
    datum: "28 mei",
    versie: "v4",
    gedeeldMet: ["Bovenbouw"],
  },
  {
    naam: "Schoolgids 2025-2026.pdf",
    vak: "Algemeen",
    grootte: "3.4 MB",
    datum: "01 sep",
    versie: "v1",
    gedeeldMet: ["Iedereen"],
  },
];

export const klassen = [
  { klas: "V4A", leerlingen: 28, gemiddelde: 7.2, aanwezigheid: 96 },
  { klas: "V4B", leerlingen: 26, gemiddelde: 7.4, aanwezigheid: 94 },
  { klas: "V5A", leerlingen: 24, gemiddelde: 6.9, aanwezigheid: 92 },
  { klas: "H4A", leerlingen: 30, gemiddelde: 7.0, aanwezigheid: 95 },
];

export const meldingen: {
  titel: string;
  tijd: string;
  type: "cijfer" | "rooster" | "bericht" | "deadline";
  link: string;
}[] = [
  { titel: "Nieuw cijfer: Engels 8.4", tijd: "10 min", type: "cijfer", link: "/app/cijfers" },
  {
    titel: "Roosterwijziging — Geschiedenis uitval",
    tijd: "1 u",
    type: "rooster",
    link: "/app/rooster",
  },
  { titel: "Bericht van M. Jansen", tijd: "2 u", type: "bericht", link: "/app/berichten" },
  {
    titel: "Deadline morgen — Wiskunde H4",
    tijd: "3 u",
    type: "deadline",
    link: "/app/opdrachten",
  },
];

export const docentMeldingen = [
  { titel: "Nieuwe inlevering: Tom Bakker — Opgaven H4", tijd: "5 min", link: "/app/opdrachten" },
  { titel: "Bericht van L. de Boer", tijd: "22 min", link: "/app/berichten" },
  { titel: "Verzoek roosterwijziging donderdag", tijd: "1 u", link: "/app/rooster" },
  { titel: "3 nieuwe cijferwijzigingen goedgekeurd", tijd: "2 u", link: "/app/cijfers" },
];

export const teamleiderMeldingen = [
  { titel: "Docent R. Visser ziek gemeld — 3e uur V4", tijd: "15 min", link: "/app/rooster" },
  { titel: "Ouder vraagt gesprek over voortgang Emma B.", tijd: "45 min", link: "/app/berichten" },
  { titel: "2 klassen zonder toetscijfer deze week", tijd: "2 u", link: "/app/cijfers" },
  { titel: "Roosterwijziging ingediend door M. Jansen", tijd: "3 u", link: "/app/rooster" },
  { titel: "Nieuwe opdracht aangemaakt in klas V4B", tijd: "4 u", link: "/app/opdrachten" },
];

export const directieMeldingen = [
  { titel: "Maandrapport beschikbaar — juni 2026", tijd: "1 u", link: "/app/cijfers" },
  { titel: "3 openstaande roosterwijzigingen ter goedkeuring", tijd: "2 u", link: "/app/rooster" },
  { titel: "Bericht van teamleider: bezetting donderdag", tijd: "2 u", link: "/app/berichten" },
  { titel: "Schoolgemiddelde gedaald — actie vereist", tijd: "5 u", link: "/app/cijfers" },
  { titel: "Nieuwe docent toegevoegd aan systeem", tijd: "1 d", link: "/app/berichten" },
];

// Huiswerk data
export type HuiswerkItem = {
  id: string;
  vak: string;
  omschrijving: string;
  deadline: string;
  afgerond: boolean;
  prioriteit: "hoog" | "normaal";
};
export const huiswerk: HuiswerkItem[] = [
  {
    id: "hw1",
    vak: "Wiskunde B",
    omschrijving: "Maak §4.2 opgave 1 t/m 10",
    deadline: "Morgen",
    afgerond: false,
    prioriteit: "hoog",
  },
  {
    id: "hw2",
    vak: "Engels",
    omschrijving: "Vocabulary chapter 6 leren",
    deadline: "Overmorgen",
    afgerond: false,
    prioriteit: "normaal",
  },
  {
    id: "hw3",
    vak: "Scheikunde",
    omschrijving: "Practicumverslag titratie afmaken",
    deadline: "Vr 10 jul",
    afgerond: false,
    prioriteit: "hoog",
  },
  {
    id: "hw4",
    vak: "Nederlands",
    omschrijving: "Hoofdstuk 4 lezen Max Havelaar",
    deadline: "Vr 10 jul",
    afgerond: true,
    prioriteit: "normaal",
  },
  {
    id: "hw5",
    vak: "Biologie",
    omschrijving: "Aantekeningen uitwerken les 3",
    deadline: "Ma 13 jul",
    afgerond: false,
    prioriteit: "normaal",
  },
];

// Aanwezigheidshistorie leerling (eigen view)
export type AanwezigheidEntry = {
  datum: string;
  vak: string;
  status: "aanwezig" | "afwezig" | "ziek" | "afgemeld";
  reden?: string;
};
export const leerlingAanwezigheid: AanwezigheidEntry[] = [
  { datum: "Di 7 jul", vak: "Wiskunde B", status: "aanwezig" },
  { datum: "Di 7 jul", vak: "Nederlands", status: "aanwezig" },
  { datum: "Di 7 jul", vak: "Scheikunde", status: "afwezig", reden: "Vergeten" },
  { datum: "Ma 6 jul", vak: "Engels", status: "aanwezig" },
  { datum: "Ma 6 jul", vak: "Biologie", status: "ziek", reden: "Doktersbezoek" },
  { datum: "Vr 4 jul", vak: "Geschiedenis", status: "aanwezig" },
  { datum: "Vr 4 jul", vak: "Wiskunde B", status: "aanwezig" },
  { datum: "Do 3 jul", vak: "Nederlands", status: "afgemeld", reden: "Sportdag" },
  { datum: "Do 3 jul", vak: "Scheikunde", status: "aanwezig" },
  { datum: "Wo 2 jul", vak: "Engels", status: "aanwezig" },
];

// Gesprekken (mentorgesprekken, oudergesprekken)
export type Gesprek = {
  id: string;
  type: "mentor" | "ouder" | "teamleider";
  datum: string;
  tijd: string;
  persoon: string;
  onderwerp: string;
  status: "gepland" | "afgerond" | "beschikbaar";
};
export const gesprekken: Gesprek[] = [
  {
    id: "g1",
    type: "mentor",
    datum: "Di 8 jul",
    tijd: "14:30",
    persoon: "L. de Boer",
    onderwerp: "Voortgangsgesprek periode 2",
    status: "gepland",
  },
  {
    id: "g2",
    type: "ouder",
    datum: "Wo 9 jul",
    tijd: "16:00",
    persoon: "Ouders de Vries",
    onderwerp: "Resultaten scheikunde",
    status: "gepland",
  },
  {
    id: "g3",
    type: "mentor",
    datum: "Ma 14 jul",
    tijd: "15:00",
    persoon: "L. de Boer",
    onderwerp: "Beschikbaar tijdslot",
    status: "beschikbaar",
  },
  {
    id: "g4",
    type: "mentor",
    datum: "Di 15 jul",
    tijd: "14:00",
    persoon: "L. de Boer",
    onderwerp: "Beschikbaar tijdslot",
    status: "beschikbaar",
  },
  {
    id: "g5",
    type: "mentor",
    datum: "Do 3 jul",
    tijd: "14:30",
    persoon: "L. de Boer",
    onderwerp: "Introductiegesprek schooljaar",
    status: "afgerond",
  },
];

// Personeel (voor directie/teamleider)
export type Personeelslid = {
  id: string;
  naam: string;
  rol: string;
  vakken: string[];
  uren: number;
  aanwezig: boolean;
  verlof?: string;
};
export const personeel: Personeelslid[] = [
  {
    id: "p1",
    naam: "Mark Jansen",
    rol: "Docent",
    vakken: ["Wiskunde B", "Wiskunde A"],
    uren: 28,
    aanwezig: true,
  },
  {
    id: "p2",
    naam: "Linda de Boer",
    rol: "Docent / Mentor",
    vakken: ["Nederlands"],
    uren: 26,
    aanwezig: true,
  },
  {
    id: "p3",
    naam: "Karin Visser",
    rol: "Docent",
    vakken: ["Scheikunde", "Biologie"],
    uren: 24,
    aanwezig: false,
    verlof: "Ziek gemeld",
  },
  { id: "p4", naam: "Steve Green", rol: "Docent", vakken: ["Engels"], uren: 22, aanwezig: true },
  {
    id: "p5",
    naam: "Jan Peters",
    rol: "Docent",
    vakken: ["Geschiedenis", "Aardrijkskunde"],
    uren: 20,
    aanwezig: true,
  },
  {
    id: "p6",
    naam: "Hans Mulder",
    rol: "Docent",
    vakken: ["Biologie"],
    uren: 18,
    aanwezig: false,
    verlof: "Studieverlof",
  },
  {
    id: "p7",
    naam: "Ingrid Bakker",
    rol: "Teamleider Bovenbouw",
    vakken: [],
    uren: 32,
    aanwezig: true,
  },
];

// Ouder-leerling koppelcodes (voor onboarding)
export const koppelcodes: Record<
  string,
  { leerling: string; klas: string; ouderNaam: string; gebruikt: boolean }
> = {
  SV2026: { leerling: "Sanne de Vries", klas: "V4B", ouderNaam: "Petra de Vries", gebruikt: true },
  TB2026: { leerling: "Tom Bakker", klas: "V4B", ouderNaam: "Familie Bakker", gebruikt: false },
  JS2026: { leerling: "Julia Smit", klas: "V4B", ouderNaam: "Familie Smit", gebruikt: false },
};

// Import mapping voor Magister/Somtoday
export const importVoorbeeldData = {
  magister: [
    {
      leerlingnr: "24001",
      naam: "Sanne de Vries",
      klas: "V4B",
      geboortedatum: "2008-03-12",
      ouder_email: "p.devries@email.nl",
    },
    {
      leerlingnr: "24002",
      naam: "Tom Bakker",
      klas: "V4B",
      geboortedatum: "2008-07-22",
      ouder_email: "bakker.familie@email.nl",
    },
    {
      leerlingnr: "24003",
      naam: "Julia Smit",
      klas: "V4B",
      geboortedatum: "2007-11-05",
      ouder_email: "smit.ouders@email.nl",
    },
  ],
  somtoday: [
    {
      studentnummer: "24001",
      volledigenaam: "de Vries, Sanne",
      stamgroep: "V4B",
      email_ouder: "p.devries@email.nl",
    },
    {
      studentnummer: "24002",
      volledigenaam: "Bakker, Tom",
      stamgroep: "V4B",
      email_ouder: "bakker.familie@email.nl",
    },
  ],
};
