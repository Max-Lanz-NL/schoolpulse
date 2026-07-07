import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { docentKlassen } from "@/lib/demo-data";
import { useState } from "react";
import { X, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/rapporten")({ component: RapportenPage });

type RapportStatus = "afwachting" | "goedgekeurd" | "afgewezen";

type Rapport = {
  id: string;
  klas: string;
  docent: string;
  vak: string;
  datum: string;
  aantalLeerlingen: number;
  status: RapportStatus;
  goedgekeurdOp?: string;
};

const initRapporten: Rapport[] = [
  { id: "r1", klas: "V4B", docent: "M. Jansen", vak: "Wiskunde B", datum: "3 jul 2026", aantalLeerlingen: 24, status: "afwachting" },
  { id: "r2", klas: "V5A", docent: "K. Visser", vak: "Scheikunde", datum: "4 jul 2026", aantalLeerlingen: 21, status: "afwachting" },
  { id: "r3", klas: "H4A", docent: "J. Peters", vak: "Geschiedenis", datum: "4 jul 2026", aantalLeerlingen: 22, status: "afwachting" },
];

const eerderGoedgekeurd: Rapport[] = [
  { id: "rg1", klas: "V4A", docent: "M. Jansen", vak: "Wiskunde B", datum: "28 jun 2026", aantalLeerlingen: 23, status: "goedgekeurd", goedgekeurdOp: "2 jul 2026" },
  { id: "rg2", klas: "V4B", docent: "L. de Boer", vak: "Nederlands", datum: "29 jun 2026", aantalLeerlingen: 24, status: "goedgekeurd", goedgekeurdOp: "2 jul 2026" },
];

// Modal leerlingen per rapport (hardcoded demo)
const rapportLeerlingen: Record<string, { naam: string; gemiddelde: number }[]> = {
  r1: docentKlassen.find((k) => k.klas === "V4B")!.leerlingen.map((l) => {
    const all = Object.values(l.cijfers).flat();
    const totW = all.reduce((a, t) => a + t.weging, 0);
    const totS = all.reduce((a, t) => a + t.cijfer * t.weging, 0);
    return { naam: l.naam, gemiddelde: totW ? totS / totW : 0 };
  }),
  r2: [
    { naam: "Lisa Peters", gemiddelde: 7.2 },
    { naam: "Daan de Wit", gemiddelde: 5.6 },
    { naam: "Sophie Bakker", gemiddelde: 8.4 },
    { naam: "Lars Meijer", gemiddelde: 6.8 },
    { naam: "Fleur van der Berg", gemiddelde: 7.6 },
  ],
  r3: [
    { naam: "Emma Visser", gemiddelde: 7.6 },
    { naam: "Noah Jansen", gemiddelde: 6.2 },
    { naam: "Anna Smits", gemiddelde: 8.2 },
    { naam: "Max de Boer", gemiddelde: 5.8 },
    { naam: "Eva Willems", gemiddelde: 7.0 },
  ],
};

function RapportenPage() {
  const [tab, setTab] = useState<"afwachting" | "goedgekeurd">("afwachting");
  const [rapporten, setRapporten] = useState<Rapport[]>(initRapporten);
  const [modalRapport, setModalRapport] = useState<Rapport | null>(null);
  const [afgewezenIds, setAfgewezenIds] = useState<Set<string>>(new Set());
  const [exportOpen, setExportOpen] = useState(false);

  const inAfwachting = rapporten.filter((r) => r.status === "afwachting");
  const goedgekeurd = [...rapporten.filter((r) => r.status === "goedgekeurd"), ...eerderGoedgekeurd];

  const keurGoed = (id: string) => {
    const nu = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
    setRapporten((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "goedgekeurd", goedgekeurdOp: nu } : r))
    );
    setModalRapport(null);
    toast.success("Rapport goedgekeurd", { description: `Klas ${id} rapport geaccordeerd` });
  };

  const keurAllesGoed = () => {
    const nu = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
    setRapporten((prev) => prev.map((r) => ({ ...r, status: "goedgekeurd", goedgekeurdOp: nu })));
    setModalRapport(null);
    toast.success("Alle rapporten goedgekeurd");
  };

  const wijs = (id: string) => {
    setAfgewezenIds((prev) => new Set([...prev, id]));
    setRapporten((prev) => prev.map((r) => (r.id === id ? { ...r, status: "afgewezen" } : r)));
    toast.error("Rapport afgewezen", { description: "Rapport teruggestuurd naar docent" });
  };

  const modalLeerlingen = modalRapport ? (rapportLeerlingen[modalRapport.id] ?? []) : [];

  return (
    <AppShell title="Rapporten" subtitle="Beoordeling en goedkeuring rapportcijfers">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          <button
            onClick={() => setTab("afwachting")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${tab === "afwachting" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            In afwachting {inAfwachting.length > 0 && `(${inAfwachting.length})`}
          </button>
          <button
            onClick={() => setTab("goedgekeurd")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${tab === "goedgekeurd" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Goedgekeurd
          </button>
        </div>
        <div className="relative">
          <button onClick={() => setExportOpen((v) => !v)} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-muted">
            <Download className="h-4 w-4" /> Exporteer
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-full z-10 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
              {[{ label: "PDF exporteren", ext: "pdf", mime: "application/pdf" }, { label: "Excel exporteren", ext: "xlsx", mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }, { label: "CSV exporteren", ext: "csv", mime: "text/csv" }].map((opt) => (
                <button key={opt.ext} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted" onClick={() => {
                  setExportOpen(false);
                  const blob = new Blob(["Rapportoverzicht SchoolPulse demo"], { type: opt.mime });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `rapporten.${opt.ext}`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success(`Rapporten geëxporteerd als ${opt.ext.toUpperCase()}`);
                }}>{opt.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {tab === "afwachting" && (
        <div className="space-y-3">
          {inAfwachting.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <CheckCircle2 className="h-10 w-10 text-success/40" />
              <div className="text-sm font-semibold text-muted-foreground">Alle rapporten zijn beoordeeld</div>
            </div>
          )}
          {inAfwachting.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
              <div>
                <div className="text-sm font-semibold">{r.vak} — {r.klas}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Docent: {r.docent} · {r.aantalLeerlingen} leerlingen · Ingediend: {r.datum}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => wijs(r.id)}
                  className="rounded-lg border border-destructive px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/5"
                >
                  Afwijzen
                </button>
                <button
                  onClick={() => setModalRapport(r)}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  Bekijk en keur goed →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "goedgekeurd" && (
        <div className="space-y-3">
          {goedgekeurd.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 opacity-80">
              <div>
                <div className="text-sm font-semibold">{r.vak} — {r.klas}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Docent: {r.docent} · {r.aantalLeerlingen} leerlingen · Ingediend: {r.datum}
                </div>
                {r.goedgekeurdOp && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-success">
                    <CheckCircle2 className="h-3 w-3" /> Goedgekeurd: {r.goedgekeurdOp}
                  </div>
                )}
              </div>
              <span className="rounded-full bg-success/15 px-3 py-1 text-[11px] font-semibold text-success">
                ✓ Goedgekeurd
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalRapport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setModalRapport(null)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <div className="text-sm font-semibold">{modalRapport.vak} — {modalRapport.klas}</div>
                <div className="text-xs text-muted-foreground">Docent: {modalRapport.docent} · {modalRapport.aantalLeerlingen} leerlingen</div>
              </div>
              <button onClick={() => setModalRapport(null)} className="rounded-lg p-1.5 hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="pb-2 pr-4">Leerling</th>
                    <th className="pb-2 pr-4">Gemiddelde</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {modalLeerlingen.map((l, i) => (
                    <tr key={i} className="text-xs">
                      <td className="py-2 pr-4 font-medium">{l.naam}</td>
                      <td className={`py-2 pr-4 font-bold ${l.gemiddelde < 5.5 ? "text-destructive" : "text-success"}`}>
                        {l.gemiddelde.toFixed(1)}
                      </td>
                      <td className="py-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${l.gemiddelde < 5.5 ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}>
                          {l.gemiddelde < 5.5 ? "Onvoldoende" : "Voldoende"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {modalLeerlingen.some((l) => l.gemiddelde < 5.5) && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
                  <div className="text-xs text-warning">
                    {modalLeerlingen.filter((l) => l.gemiddelde < 5.5).length} leerling(en) met een onvoldoende gemiddelde.
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-border p-4">
              <Link to="/app/leerlingen" className="text-xs font-semibold text-primary" onClick={() => setModalRapport(null)}>
                Bekijk dossiers →
              </Link>
              <div className="flex gap-2">
                <button
                  onClick={() => wijs(modalRapport.id)}
                  className="rounded-lg border border-destructive px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/5"
                >
                  Afwijzen
                </button>
                <button
                  onClick={() => keurGoed(modalRapport.id)}
                  className="rounded-lg bg-success px-3 py-2 text-xs font-semibold text-white"
                >
                  Keur goed
                </button>
                {inAfwachting.length > 1 && (
                  <button
                    onClick={keurAllesGoed}
                    className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    Alles goedkeuren
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
