import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { docentKlassen } from "@/lib/demo-data";
import { useState } from "react";
import {
  Plus,
  X,
  CheckCircle2,
  PlayCircle,
  Pencil,
  Trash2,
  Copy,
  Download,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/toetsen")({ component: ToetsenPage });

type Vraag = { tekst: string; opties: [string, string, string, string]; correct: number };

type Toets = {
  id: string;
  naam: string;
  klas: string;
  vak: string;
  datum: string;
  periode: string;
  vragen: number;
  gemiddelde: number | null;
  status: string;
  beschrijving?: string;
  weging?: number;
  rubric?: string;
};

const bestaandeToetsen: Toets[] = [
  {
    id: "bt1",
    naam: "Wiskunde B — Proefwerk H4",
    klas: "V4B",
    vak: "Wiskunde B",
    datum: "18 jun 2026",
    periode: "Periode 4",
    vragen: 8,
    gemiddelde: 7.2,
    status: "nagekeken",
  },
  {
    id: "bt2",
    naam: "Wiskunde B — SO Vectoren",
    klas: "V5A",
    vak: "Wiskunde B",
    datum: "24 jun 2026",
    periode: "Periode 4",
    vragen: 5,
    gemiddelde: 6.8,
    status: "nagekeken",
  },
  {
    id: "bt3",
    naam: "Wiskunde B — Differentiëren H5",
    klas: "V4B",
    vak: "Wiskunde B",
    datum: "2 jul 2026",
    periode: "Periode 4",
    vragen: 10,
    gemiddelde: null,
    status: "gepland",
  },
];

const nakijkLeerlingen = [
  { naam: "Sanne de Vries", score: 8.2 },
  { naam: "Tom Bakker", score: 5.6 },
  { naam: "Julia Smit", score: 7.8 },
  { naam: "Ravi Kumar", score: 9.0 },
  { naam: "Emma Visser", score: 7.4 },
  { naam: "Noah Jansen", score: 6.2 },
  { naam: "Lisa Peters", score: 7.0 },
  { naam: "Daan de Wit", score: 5.4 },
  { naam: "Sophie Bakker", score: 8.4 },
  { naam: "Lars Meijer", score: 7.6 },
  { naam: "Fleur van der Berg", score: 6.8 },
  { naam: "Tim Hoekstra", score: 7.2 },
  { naam: "Anna Smits", score: 8.8 },
  { naam: "Max de Boer", score: 6.0 },
  { naam: "Eva Willems", score: 7.4 },
  { naam: "Sam Hendriks", score: 5.8 },
  { naam: "Lotte Prins", score: 8.0 },
  { naam: "Robin van Dam", score: 7.6 },
  { naam: "Jade Mulder", score: 6.6 },
  { naam: "Finn Peters", score: 7.0 },
  { naam: "Noor Visser", score: 8.2 },
  { naam: "Bo Janssen", score: 7.8 },
  { naam: "Cas van Leeuwen", score: 6.4 },
  { naam: "Zoë Vermeer", score: 7.2 },
];

function legeVraag(): Vraag {
  return { tekst: "", opties: ["", "", "", ""], correct: 0 };
}

function ToetsenPage() {
  const [tab, setTab] = useState<"mijn" | "nieuw" | "nakijken">("mijn");
  const [toetsen, setToetsen] = useState<Toets[]>(bestaandeToetsen);
  const [filterKlas, setFilterKlas] = useState("alle");
  const [filterVak, setFilterVak] = useState("alle");

  // Nieuw toets form
  const [toetsnaam, setToetsnaam] = useState("");
  const [selectedKlas, setSelectedKlas] = useState(docentKlassen[0].klas);
  const [selectedVak, setSelectedVak] = useState(docentKlassen[0].vak);
  const [vragen, setVragen] = useState<Vraag[]>([legeVraag()]);
  const [toetsDatum, setToetsDatum] = useState("");
  const [beschrijving, setBeschrijving] = useState("");
  const [weging, setWeging] = useState("1");
  const [rubric, setRubric] = useState("");

  // Nakijken
  const [nakijkStatus, setNakijkStatus] = useState<"idle" | "loading" | "done">("idle");

  const slaOpToets = () => {
    if (!toetsnaam.trim()) {
      toast.error("Vul een toetsnaam in");
      return;
    }
    const incomplete = vragen.some((v) => !v.tekst.trim());
    if (incomplete) {
      toast.error("Vul alle vraagteksten in");
      return;
    }
    toast.success(`Toets "${toetsnaam}" opgeslagen`, {
      description: `${vragen.length} vragen · ${selectedKlas}`,
    });
    setToetsen((items) => [
      ...items,
      {
        id: `toets-${Date.now()}`,
        naam: toetsnaam,
        klas: selectedKlas,
        vak: selectedVak,
        datum: toetsDatum || "Nog te plannen",
        periode: "Periode 4",
        vragen: vragen.length,
        gemiddelde: null,
        status: "gepland",
        beschrijving,
        weging: Number(weging) || 1,
        rubric,
      },
    ]);
    setToetsnaam("");
    setVragen([legeVraag()]);
    setToetsDatum("");
    setBeschrijving("");
    setWeging("1");
    setRubric("");
  };

  const startNakijken = () => {
    setNakijkStatus("loading");
    toast.loading("Nakijken in uitvoering...", { id: "nakijk" });
    setTimeout(() => {
      setNakijkStatus("done");
      toast.success("Nakijken voltooid!", {
        id: "nakijk",
        description: "24 toetsen automatisch nagekeken",
      });
    }, 2200);
  };

  const updateVraag = (i: number, field: keyof Vraag, val: unknown) => {
    setVragen((prev) => prev.map((v, j) => (j === i ? { ...v, [field]: val } : v)));
  };

  const updateOptie = (qi: number, oi: number, val: string) => {
    setVragen((prev) =>
      prev.map((v, j) => {
        if (j !== qi) return v;
        const opties = [...v.opties] as [string, string, string, string];
        opties[oi] = val;
        return { ...v, opties };
      }),
    );
  };

  const tabs = [
    { id: "mijn" as const, label: "Mijn toetsen" },
    { id: "nieuw" as const, label: "Nieuwe toets" },
    { id: "nakijken" as const, label: "Nakijken" },
  ];

  return (
    <AppShell title="Toetsen" subtitle="Digitale toetsafname en automatisch nakijken">
      <div className="mb-4 inline-flex rounded-lg border border-border bg-card p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "mijn" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-3">
            <select
              value={filterKlas}
              onChange={(e) => setFilterKlas(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="alle">Alle klassen</option>
              {docentKlassen.map((klas) => (
                <option key={klas.klas}>{klas.klas}</option>
              ))}
            </select>
            <select
              value={filterVak}
              onChange={(e) => setFilterVak(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="alle">Alle vakken</option>
              <option>Wiskunde A</option>
              <option>Wiskunde B</option>
            </select>
            <label className="ml-auto inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold">
              <Upload className="h-3.5 w-3.5" /> Importeren
              <input
                type="file"
                className="hidden"
                onChange={() => toast.success("Toets geïmporteerd")}
              />
            </label>
            <button
              onClick={() => toast.success("Toetsen geëxporteerd")}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
            >
              <Download className="h-3.5 w-3.5" /> Exporteren
            </button>
          </div>
          {toetsen
            .filter((toets) => filterKlas === "alle" || toets.klas === filterKlas)
            .filter((toets) => filterVak === "alle" || toets.vak === filterVak)
            .map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card p-4"
              >
                <div>
                  <div className="text-sm font-semibold">{t.naam}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {t.klas} · {t.vragen} vragen · {t.datum}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {t.gemiddelde !== null && (
                    <div
                      className={`text-base font-bold ${t.gemiddelde < 6 ? "text-destructive" : "text-success"}`}
                    >
                      ∅ {t.gemiddelde.toFixed(1)}
                    </div>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      t.status === "nagekeken"
                        ? "bg-success/15 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {t.status === "nagekeken" ? "Nagekeken" : "Gepland"}
                  </span>
                  <button
                    onClick={() => {
                      setToetsnaam(t.naam);
                      setSelectedKlas(t.klas);
                      setSelectedVak(t.vak);
                      setToetsDatum(t.datum);
                      setBeschrijving(t.beschrijving ?? "");
                      setWeging(String(t.weging ?? 1));
                      setRubric(t.rubric ?? "");
                      setTab("nieuw");
                    }}
                    className="rounded-md p-1.5 hover:bg-muted"
                    aria-label="Toets bewerken"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      setToetsen((items) => [
                        ...items,
                        {
                          ...t,
                          id: `kopie-${Date.now()}`,
                          naam: `Kopie · ${t.naam}`,
                          status: "gepland",
                        },
                      ])
                    }
                    className="rounded-md p-1.5 hover:bg-muted"
                    aria-label="Toets kopiëren"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setToetsen((items) => items.filter((item) => item.id !== t.id))}
                    className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
                    aria-label="Toets verwijderen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {tab === "nieuw" && (
        <Card title="Nieuwe toets opstellen">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Toetsnaam
                </span>
                <input
                  value={toetsnaam}
                  onChange={(e) => setToetsnaam(e.target.value)}
                  placeholder="Bijv. Proefwerk H5"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Klas
                </span>
                <select
                  value={selectedKlas}
                  onChange={(e) => setSelectedKlas(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {docentKlassen.map((k) => (
                    <option key={k.klas}>{k.klas}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Vak
                </span>
                <select
                  value={selectedVak}
                  onChange={(e) => setSelectedVak(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {docentKlassen.map((k) => (
                    <option key={k.vak}>{k.vak}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Toetsdatum
                </span>
                <input
                  type="date"
                  value={toetsDatum}
                  onChange={(e) => setToetsDatum(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Weging
                </span>
                <input
                  type="number"
                  min="1"
                  value={weging}
                  onChange={(e) => setWeging(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Rubric
                </span>
                <select
                  value={rubric}
                  onChange={(e) => setRubric(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Geen rubric</option>
                  <option>Wiskundige aanpak</option>
                  <option>Probleemoplossend vermogen</option>
                  <option>Presentatie en onderbouwing</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Beschrijving
              </span>
              <textarea
                value={beschrijving}
                onChange={(e) => setBeschrijving(e.target.value)}
                rows={3}
                placeholder="Leerdoelen, hulpmiddelen en instructies voor leerlingen..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>

            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Vragen
              </div>
              <div className="space-y-4">
                {vragen.map((v, qi) => (
                  <div key={qi} className="rounded-xl border border-border bg-background p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Vraag {qi + 1}
                      </span>
                      {vragen.length > 1 && (
                        <button
                          onClick={() => setVragen((prev) => prev.filter((_, j) => j !== qi))}
                          className="rounded p-0.5 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <input
                      value={v.tekst}
                      onChange={(e) => updateVraag(qi, "tekst", e.target.value)}
                      placeholder="Vraagtekst..."
                      className="mb-3 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      {v.opties.map((opt, oi) => (
                        <label key={oi} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qi}`}
                            checked={v.correct === oi}
                            onChange={() => updateVraag(qi, "correct", oi)}
                            className="accent-primary"
                          />
                          <input
                            value={opt}
                            onChange={(e) => updateOptie(qi, oi, e.target.value)}
                            placeholder={`Antwoord ${String.fromCharCode(65 + oi)}`}
                            className="flex-1 rounded border border-border bg-card px-2 py-1 text-xs outline-none focus:border-primary"
                          />
                          {v.correct === oi && (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setVragen((prev) => [...prev, legeVraag()])}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary"
              >
                <Plus className="h-3.5 w-3.5" /> Vraag toevoegen
              </button>
            </div>

            <div className="flex justify-end border-t border-border pt-4">
              <button
                onClick={slaOpToets}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Toets opslaan
              </button>
            </div>
          </div>
        </Card>
      )}

      {tab === "nakijken" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
            <div>
              <div className="text-sm font-semibold">Wiskunde B — Differentiëren H5</div>
              <div className="text-xs text-muted-foreground">Klas V4B · Afname 8 jul 2026</div>
              <div className="mt-2 text-sm">
                <span className="font-bold text-success">24</span>
                <span className="text-muted-foreground"> / 26 toetsen ingeleverd</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right text-xs text-muted-foreground">
                <div className="font-semibold text-warning">2 ontbreken</div>
                <div>Tom Bakker · Noah Jansen</div>
              </div>
              {nakijkStatus === "idle" && (
                <button
                  onClick={startNakijken}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                >
                  <PlayCircle className="h-4 w-4" /> Automatisch nakijken
                </button>
              )}
              {nakijkStatus === "loading" && (
                <div className="text-xs text-muted-foreground">Bezig...</div>
              )}
              {nakijkStatus === "done" && (
                <span className="rounded-full bg-success/15 px-3 py-1.5 text-xs font-semibold text-success">
                  ✓ Nagekeken
                </span>
              )}
            </div>
          </div>

          {nakijkStatus === "done" && (
            <Card title="Resultaten — V4B Differentiëren H5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="pb-2 pr-4">Leerling</th>
                      <th className="pb-2 pr-4">Score</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {nakijkLeerlingen.map((l, i) => (
                      <tr key={i} className="text-xs">
                        <td className="py-2 pr-4 font-medium">{l.naam}</td>
                        <td
                          className={`py-2 pr-4 font-bold ${l.score < 5.5 ? "text-destructive" : "text-success"}`}
                        >
                          {l.score.toFixed(1)}
                        </td>
                        <td className="py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${l.score < 5.5 ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}
                          >
                            {l.score < 5.5 ? "Onvoldoende" : "Voldoende"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Gemiddelde:{" "}
                {(
                  nakijkLeerlingen.reduce((s, l) => s + l.score, 0) / nakijkLeerlingen.length
                ).toFixed(1)}{" "}
                · hoogste {Math.max(...nakijkLeerlingen.map((l) => l.score)).toFixed(1)}
                {" · "}laagste {Math.min(...nakijkLeerlingen.map((l) => l.score)).toFixed(1)}
                {" · "}
                {nakijkLeerlingen.filter((l) => l.score < 5.5).length} onvoldoende
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                <button
                  onClick={() => toast.success("Inleveringen geopend voor feedback en annotatie")}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-semibold"
                >
                  Inleveringen & feedback
                </button>
                <button
                  onClick={() =>
                    toast.success("Onvoldoende toetsen teruggestuurd voor verbetering")
                  }
                  className="rounded-lg border border-warning/40 px-3 py-2 text-xs font-semibold text-warning"
                >
                  Terugsturen
                </button>
                <button
                  onClick={() => toast.success("Definitieve cijfers gepubliceerd")}
                  className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                >
                  Cijfers publiceren
                </button>
              </div>
            </Card>
          )}
        </div>
      )}
    </AppShell>
  );
}
