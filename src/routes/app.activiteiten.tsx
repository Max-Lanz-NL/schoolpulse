import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { activiteiten } from "@/lib/demo-data";
import { CalendarCheck, Users, Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/activiteiten")({ component: Activiteiten });

function Activiteiten() {
  const [aangemeld, setAangemeld] = useState<Record<string, boolean>>({});
  const [pollAns, setPollAns] = useState<number | null>(null);
  const pollOpties = [
    { label: "Berlijn", stemmen: 84 },
    { label: "Praag", stemmen: 52 },
    { label: "Barcelona", stemmen: 96 },
    { label: "Rome", stemmen: 41 },
  ];
  const totaal = pollOpties.reduce((a, o) => a + o.stemmen, 0);

  return (
    <AppShell title="Activiteiten" subtitle="Aanmeldingen, polls en aankondigingen">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {activiteiten.map((a) => {
            const pct = Math.round((a.deelnemers / a.plekken) * 100);
            const isIn = aangemeld[a.titel];
            return (
              <div key={a.titel} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><CalendarCheck className="h-5 w-5" /></div>
                    <div>
                      <div className="text-base font-semibold">{a.titel}</div>
                      <div className="text-xs text-muted-foreground">{a.datum} · {a.doel}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setAangemeld((s) => ({ ...s, [a.titel]: !s[a.titel] }))}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${isIn ? "border border-success bg-success/10 text-success" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                  >
                    {isIn ? "Aangemeld ✓" : "Aanmelden"}
                  </button>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {a.deelnemers} / {a.plekken} deelnemers</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <Card title="Poll: bestemming schoolreis">
            <div className="space-y-2">
              {pollOpties.map((o, i) => {
                const pct = Math.round((o.stemmen / totaal) * 100);
                const gekozen = pollAns === i;
                return (
                  <button
                    key={o.label}
                    onClick={() => setPollAns(i)}
                    className={`relative w-full overflow-hidden rounded-lg border p-3 text-left transition-colors ${gekozen ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}
                  >
                    <div className="absolute inset-0 bg-primary/10" style={{ width: `${pct}%` }} />
                    <div className="relative flex items-center justify-between">
                      <span className="text-sm font-medium">{o.label}</span>
                      <span className="text-xs font-semibold text-muted-foreground">{pct}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground">{totaal} stemmen · sluit vrijdag</div>
          </Card>

          <Card title="Aankondigingen">
            <div className="space-y-3">
              {[
                { t: "Herinnering ouderavond V4", d: "3 dec · doelgroep V4-ouders" },
                { t: "Nieuwe kantinekaart", d: "Vanaf maandag actief" },
                { t: "Kerstviering programma", d: "Publicatie volgende week" },
              ].map((a) => (
                <div key={a.t} className="rounded-lg border border-border p-3">
                  <div className="text-sm font-semibold">{a.t}</div>
                  <div className="text-[11px] text-muted-foreground">{a.d}</div>
                </div>
              ))}
              <button className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border p-3 text-xs font-semibold text-muted-foreground hover:bg-muted/40">
                <Plus className="h-3 w-3" /> Nieuwe aankondiging
              </button>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
