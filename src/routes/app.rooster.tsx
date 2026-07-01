import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { roosterVandaag } from "@/lib/demo-data";
import { Sparkles, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/app/rooster")({ component: Rooster });

const dagen = ["Ma", "Di", "Wo", "Do", "Vr"];
const uren = ["08:30", "09:20", "10:30", "11:20", "12:10", "13:00", "13:50", "14:40"];

const week: Record<string, { vak: string; lokaal: string; kleur: string; wijziging?: string } | null>[] = [
  { Ma: { vak: "Wiskunde", lokaal: "204", kleur: "bg-blue-500" }, Di: { vak: "Wiskunde", lokaal: "204", kleur: "bg-blue-500" }, Wo: null, Do: { vak: "Nederlands", lokaal: "112", kleur: "bg-indigo-500" }, Vr: { vak: "Engels", lokaal: "108", kleur: "bg-amber-500" } },
  { Ma: { vak: "Nederlands", lokaal: "112", kleur: "bg-indigo-500" }, Di: { vak: "Nederlands", lokaal: "112", kleur: "bg-indigo-500" }, Wo: { vak: "Biologie", lokaal: "Lab 1", kleur: "bg-teal-500" }, Do: { vak: "Wiskunde", lokaal: "204", kleur: "bg-blue-500" }, Vr: { vak: "Geschiedenis", lokaal: "215", kleur: "bg-rose-500" } },
  { Ma: { vak: "Scheikunde", lokaal: "Lab 2", kleur: "bg-emerald-500" }, Di: { vak: "Scheikunde", lokaal: "Lab 2", kleur: "bg-emerald-500", wijziging: "Lokaalwissel" }, Wo: { vak: "Wiskunde", lokaal: "204", kleur: "bg-blue-500" }, Do: null, Vr: { vak: "Nederlands", lokaal: "112", kleur: "bg-indigo-500" } },
  { Ma: { vak: "Engels", lokaal: "108", kleur: "bg-amber-500" }, Di: { vak: "Engels", lokaal: "108", kleur: "bg-amber-500" }, Wo: { vak: "Geschiedenis", lokaal: "215", kleur: "bg-rose-500" }, Do: { vak: "Biologie", lokaal: "Lab 1", kleur: "bg-teal-500" }, Vr: { vak: "Wiskunde", lokaal: "204", kleur: "bg-blue-500" } },
  { Ma: null, Di: null, Wo: null, Do: null, Vr: null },
  { Ma: { vak: "Geschiedenis", lokaal: "215", kleur: "bg-rose-500" }, Di: { vak: "Geschiedenis", lokaal: "215", kleur: "bg-rose-500", wijziging: "Uitval" }, Wo: { vak: "Engels", lokaal: "108", kleur: "bg-amber-500" }, Do: { vak: "Scheikunde", lokaal: "Lab 2", kleur: "bg-emerald-500" }, Vr: null },
  { Ma: { vak: "Biologie", lokaal: "Lab 1", kleur: "bg-teal-500" }, Di: { vak: "Biologie", lokaal: "Lab 1", kleur: "bg-teal-500" }, Wo: null, Do: { vak: "Geschiedenis", lokaal: "215", kleur: "bg-rose-500" }, Vr: { vak: "Scheikunde", lokaal: "Lab 2", kleur: "bg-emerald-500" } },
  { Ma: null, Di: null, Wo: null, Do: null, Vr: null },
];

function Rooster() {
  return (
    <AppShell title="Rooster" subtitle="Week 48 · 24 – 28 november 2025">
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">AI-roosteroptimalisatie actief</div>
          <div className="text-xs text-muted-foreground">Deze week zijn 3 tussenuren automatisch opgelost. Volgende suggestie: verplaats donderdag lesuur 4 naar 2 om tussenuur voor V4B te vermijden.</div>
        </div>
        <button className="hidden shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground sm:inline-block">Bekijk voorstel</button>
      </div>

      <Card title="Weekrooster">
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-2">
              <div />
              {dagen.map((d) => (<div key={d} className="pb-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>))}
              {uren.map((u, i) => (
                <>
                  <div key={u} className="pt-2 text-right text-[11px] text-muted-foreground">{u}</div>
                  {dagen.map((d) => {
                    const cell = week[i]?.[d as keyof typeof week[0]];
                    if (!cell) return <div key={d + u} className="min-h-[52px] rounded-lg bg-muted/40" />;
                    return (
                      <div key={d + u} className={`relative min-h-[52px] rounded-lg border border-border bg-background p-2 ${cell.wijziging ? "ring-1 ring-warning" : ""}`}>
                        <div className={`absolute left-0 top-0 h-full w-1 rounded-l-lg ${cell.kleur}`} />
                        <div className="pl-2 text-xs font-semibold">{cell.vak}</div>
                        <div className="pl-2 text-[10px] text-muted-foreground">{cell.lokaal}</div>
                        {cell.wijziging && (
                          <div className="mt-0.5 flex items-center gap-1 pl-2 text-[10px] font-semibold text-warning">
                            <AlertTriangle className="h-2.5 w-2.5" /> {cell.wijziging}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <Card title="Vandaag — dinsdag 26 november">
          <div className="space-y-2">
            {roosterVandaag.map((l) => (
              <div key={l.tijd} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                <div className={`h-10 w-1 rounded-full ${l.kleur}`} />
                <div className="w-32 shrink-0 text-xs text-muted-foreground">{l.tijd}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{l.vak}</div>
                  <div className="truncate text-xs text-muted-foreground">Lokaal {l.lokaal} · {l.docent}</div>
                </div>
                {l.wijziging && <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">{l.wijziging}</span>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
