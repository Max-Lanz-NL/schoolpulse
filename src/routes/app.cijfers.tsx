import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { cijfers } from "@/lib/demo-data";
import { TrendingUp, TrendingDown, Minus, Calendar, LayoutGrid } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/cijfers")({ component: Cijfers });

// Volledig schooljaar-overzicht (fictief maar realistisch)
const jaarCijfers = [
  { periode: "Periode 1", vakken: [
    { vak: "Wiskunde B", cijfers: [6.8, 7.2, 7.4] },
    { vak: "Nederlands", cijfers: [7.0, 6.6] },
    { vak: "Engels", cijfers: [7.8, 8.0] },
    { vak: "Scheikunde", cijfers: [6.4, 7.0] },
    { vak: "Biologie", cijfers: [7.6, 7.8] },
    { vak: "Geschiedenis", cijfers: [7.4, 8.0] },
  ]},
  { periode: "Periode 2", vakken: [
    { vak: "Wiskunde B", cijfers: [7.0, 8.5, 8.2, 7.8] },
    { vak: "Nederlands", cijfers: [6.4, 7.2] },
    { vak: "Engels", cijfers: [7.8, 8.4] },
    { vak: "Scheikunde", cijfers: [6.6, 5.9] },
    { vak: "Biologie", cijfers: [7.5] },
    { vak: "Geschiedenis", cijfers: [8.0] },
  ]},
];

function Cijfers() {
  const [tab, setTab] = useState<"periode" | "jaar">("periode");

  const totaal = cijfers.reduce((a, c) => a + c.gemiddelde, 0) / cijfers.length;
  const tekorten = cijfers.filter((c) => c.gemiddelde < 6).length;
  const twijfels = cijfers.filter((c) => c.gemiddelde >= 6 && c.gemiddelde < 6.5).length;
  const hoogste = Math.max(...cijfers.flatMap((c) => c.toetsen.map((t) => t.cijfer)));
  const laagste = Math.min(...cijfers.flatMap((c) => c.toetsen.map((t) => t.cijfer)));

  return (
    <AppShell title="Cijfers" subtitle="Schooljaar 2025-2026">
      {/* Tabs */}
      <div className="mb-6 inline-flex rounded-lg border border-border bg-card p-1">
        <button
          onClick={() => setTab("periode")}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold ${tab === "periode" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <LayoutGrid className="h-3.5 w-3.5" /> Periode 2
        </button>
        <button
          onClick={() => setTab("jaar")}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold ${tab === "jaar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Calendar className="h-3.5 w-3.5" /> Heel schooljaar
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-medium text-muted-foreground">Gemiddelde</div>
          <div className="mt-1 text-3xl font-bold">{totaal.toFixed(1)}</div>
          <div className="mt-1 text-xs text-success">+0.3 t.o.v. periode 1</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-medium text-muted-foreground">Onvoldoendes</div>
          <div className={`mt-1 text-3xl font-bold ${tekorten > 0 ? "text-destructive" : ""}`}>{tekorten}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {twijfels > 0 ? `${twijfels} vak op de rand (6.0 – 6.5)` : "Geen twijfelvakken"}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-medium text-muted-foreground">Hoogste cijfer</div>
          <div className="mt-1 text-3xl font-bold text-success">{hoogste.toFixed(1)}</div>
          <div className="mt-1 text-xs text-muted-foreground">Beste prestatie dit jaar</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-medium text-muted-foreground">Laagste cijfer</div>
          <div className={`mt-1 text-3xl font-bold ${laagste < 6 ? "text-destructive" : ""}`}>{laagste.toFixed(1)}</div>
          <div className="mt-1 text-xs text-muted-foreground">Aandachtspunt</div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="text-sm font-semibold">Voldoende-norm</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Minimaal <strong className="text-foreground">5.5</strong> per vak voor een voldoende. Bij een gemiddelde onder <strong className="text-foreground">6.0</strong> geldt het vak als tekort. Compensatie is mogelijk met vakken die op <strong className="text-foreground">7.0</strong> of hoger staan.
        </div>
      </div>

      {tab === "periode" ? (
        <Card title="Cijfers per vak — periode 2">
          <div className="space-y-3">
            {cijfers.map((c) => (
              <details key={c.vak} className="group rounded-xl border border-border bg-background">
                <summary className="flex cursor-pointer items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold">{c.vak}</div>
                    <TrendIcon trend={c.trend} />
                    {c.gemiddelde < 6 && <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold text-destructive">Tekort</span>}
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-muted-foreground">Gem. <span className="font-semibold text-foreground">{c.gemiddelde.toFixed(1)}</span></div>
                    <div className={`text-xl font-bold ${c.laatste < 6 ? "text-destructive" : ""}`}>{c.laatste.toFixed(1)}</div>
                  </div>
                </summary>
                <div className="border-t border-border p-4">
                  <table className="w-full text-sm">
                    <thead className="text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="py-2 text-left">Toets</th>
                        <th className="py-2 text-left">Datum</th>
                        <th className="py-2 text-left">Weging</th>
                        <th className="py-2 text-right">Cijfer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.toetsen.map((t) => (
                        <tr key={t.naam} className="border-t border-border">
                          <td className="py-2">{t.naam}</td>
                          <td className="py-2 text-muted-foreground">{t.datum}</td>
                          <td className="py-2 text-muted-foreground">×{t.weging}</td>
                          <td className={`py-2 text-right font-semibold ${t.cijfer < 6 ? "text-destructive" : ""}`}>{t.cijfer.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {jaarCijfers.map((p) => (
            <Card key={p.periode} title={p.periode}>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 text-left">Vak</th>
                      <th className="px-4 py-2 text-left">Cijfers</th>
                      <th className="px-4 py-2 text-right">Gemiddelde</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.vakken.map((v) => {
                      const gem = v.cijfers.reduce((a, b) => a + b, 0) / v.cijfers.length;
                      return (
                        <tr key={v.vak} className="border-t border-border">
                          <td className="px-4 py-3 font-medium">{v.vak}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {v.cijfers.map((c, i) => (
                                <span key={i} className={`rounded-md px-2 py-0.5 text-xs font-semibold ${c < 6 ? "bg-destructive/15 text-destructive" : c >= 8 ? "bg-success/15 text-success" : "bg-muted text-foreground"}`}>{c.toFixed(1)}</span>
                              ))}
                            </div>
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${gem < 6 ? "text-destructive" : ""}`}>{gem.toFixed(1)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-success" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}
