import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { opdrachten } from "@/lib/demo-data";
import { Upload, ShieldAlert, CheckCircle2, Clock, FileCheck } from "lucide-react";

export const Route = createFileRoute("/app/opdrachten")({ component: Opdrachten });

const statusStyle = {
  open: { label: "Openstaand", cls: "bg-warning/15 text-warning" },
  concept: { label: "Concept", cls: "bg-muted text-muted-foreground" },
  wachtend: { label: "Wacht op beoordeling", cls: "bg-primary/10 text-primary" },
  beoordeeld: { label: "Beoordeeld", cls: "bg-success/15 text-success" },
};

function Opdrachten() {
  return (
    <AppShell title="Opdrachten" subtitle="Digitale inlevering en beoordeling">
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat icon={Clock} label="Openstaand" value="2" tone="warning" />
        <Stat icon={FileCheck} label="Ingeleverd" value="2" />
        <Stat icon={CheckCircle2} label="Beoordeeld" value="1" tone="success" />
        <Stat icon={ShieldAlert} label="Plagiaatchecks" value="12" />
      </div>

      <Card title="Alle opdrachten">
        <div className="space-y-3">
          {opdrachten.map((o) => {
            const s = statusStyle[o.status];
            return (
              <div key={o.titel} className="rounded-xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{o.titel}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{o.vak} · {o.deadline}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${s.cls}`}>{s.label}</span>
                    {o.status === "beoordeeld" && "cijfer" in o && (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{o.cijfer?.toFixed(1)}</span>
                    )}
                  </div>
                </div>

                {!o.ingeleverd && (
                  <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 p-4">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium">Sleep een bestand hierheen of</div>
                      <div className="text-[11px] text-muted-foreground">PDF, DOCX, ZIP · max 25 MB</div>
                    </div>
                    <button className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Kies bestand</button>
                  </div>
                )}

                {o.status === "beoordeeld" && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-success/10 p-3 text-xs text-success">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Plagiaatcontrole: 3% overeenkomst — binnen normen.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mt-6">
        <Card title="Digitale toetsomgeving">
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><ShieldAlert className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Volgende toets: Wiskunde H4</div>
              <div className="text-xs text-muted-foreground">Vrijdag 28 november · 09:20 · Lokaal 204 · 60 minuten</div>
              <div className="mt-1 text-[11px] text-muted-foreground">Toezicht met AI-detectie op tab-wissel en verdachte activiteit.</div>
            </div>
            <button className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-muted">Instructies</button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value, tone = "default" }: { icon: any; label: string; value: string; tone?: "default" | "warning" | "success" }) {
  const cls = tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-primary";
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ${cls}`}><Icon className="h-4 w-4" /></div>
      <div className="mt-3 text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
