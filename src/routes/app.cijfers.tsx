import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { cijfers } from "@/lib/demo-data";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export const Route = createFileRoute("/app/cijfers")({ component: Cijfers });

function Cijfers() {
  const totaal = cijfers.reduce((a, c) => a + c.gemiddelde, 0) / cijfers.length;
  return (
    <AppShell title="Cijfers" subtitle="Periode 2 · schooljaar 2025-2026">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-medium text-muted-foreground">Gemiddelde</div>
          <div className="mt-1 text-3xl font-bold">{totaal.toFixed(1)}</div>
          <div className="mt-1 text-xs text-success">+0.3 t.o.v. periode 1</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-medium text-muted-foreground">Onvoldoendes</div>
          <div className="mt-1 text-3xl font-bold">1</div>
          <div className="mt-1 text-xs text-muted-foreground">Scheikunde</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-medium text-muted-foreground">Hoogste cijfer</div>
          <div className="mt-1 text-3xl font-bold">8.5</div>
          <div className="mt-1 text-xs text-muted-foreground">Wiskunde — praktische opdracht</div>
        </div>
      </div>

      <Card title="Cijfers per vak">
        <div className="space-y-3">
          {cijfers.map((c) => (
            <details key={c.vak} className="group rounded-xl border border-border bg-background">
              <summary className="flex cursor-pointer items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold">{c.vak}</div>
                  <TrendIcon trend={c.trend} />
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
    </AppShell>
  );
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-success" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}
