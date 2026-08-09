import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { leerlingAanwezigheid } from "@/lib/demo-data";
import { UserCheck, UserX, AlertCircle, Calendar } from "lucide-react";

export const Route = createFileRoute("/app/aanwezigheid")({ component: AanwezigheidPage });

const statusConfig = {
  aanwezig: { label: "Aanwezig", cls: "bg-success/15 text-success" },
  afwezig: { label: "Afwezig", cls: "bg-warning/15 text-warning" },
  ziek: { label: "Ziek", cls: "bg-destructive/15 text-destructive" },
  afgemeld: { label: "Afgemeld", cls: "bg-primary/15 text-primary" },
} as const;

function AanwezigheidPage() {
  const totaal = leerlingAanwezigheid.length;
  const aanwezigCount = leerlingAanwezigheid.filter((e) => e.status === "aanwezig").length;
  const afwezigCount = leerlingAanwezigheid.filter((e) => e.status === "afwezig").length;
  const ziekCount = leerlingAanwezigheid.filter((e) => e.status === "ziek").length;
  const aanwezigPct = Math.round((aanwezigCount / totaal) * 100);

  const perVak: Record<string, { totaal: number; aanwezig: number }> = {};
  for (const entry of leerlingAanwezigheid) {
    if (!perVak[entry.vak]) perVak[entry.vak] = { totaal: 0, aanwezig: 0 };
    perVak[entry.vak].totaal++;
    if (entry.status === "aanwezig") perVak[entry.vak].aanwezig++;
  }

  return (
    <AppShell title="Aanwezigheid" subtitle="Overzicht aanwezigheidsregistratie">
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Calendar className="h-4 w-4" />
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Totaal lessen</div>
          <div className="mt-1 text-2xl font-bold">{totaal}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
            <UserCheck className="h-4 w-4" />
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Aanwezig</div>
          <div className="mt-1 text-2xl font-bold">{aanwezigPct}%</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <UserX className="h-4 w-4" />
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Afwezig</div>
          <div className="mt-1 text-2xl font-bold">{afwezigCount}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Ziek gemeld</div>
          <div className="mt-1 text-2xl font-bold">{ziekCount}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Recente aanwezigheid">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 pr-3">Datum</th>
                  <th className="pb-2 pr-3">Vak</th>
                  <th className="pb-2 pr-3">Status</th>
                  <th className="pb-2">Reden</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leerlingAanwezigheid.map((e, i) => {
                  const cfg = statusConfig[e.status];
                  return (
                    <tr key={i} className="text-xs">
                      <td className="py-2 pr-3 font-medium">{e.datum}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{e.vak}</td>
                      <td className="py-2 pr-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.cls}`}
                        >
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-2 text-muted-foreground">{e.reden ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Per vak">
          <div className="space-y-3">
            {Object.entries(perVak).map(([vak, data]) => {
              const pct = Math.round((data.aanwezig / data.totaal) * 100);
              return (
                <div key={vak}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium">{vak}</span>
                    <span
                      className={`font-semibold ${pct < 80 ? "text-destructive" : "text-success"}`}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${pct < 80 ? "bg-destructive" : "bg-success"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">
                    {data.aanwezig}/{data.totaal} lessen aanwezig
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
