import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { personeel, roosterVandaag } from "@/lib/demo-data";
import { useRole } from "@/lib/role-context";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, X, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/app/vervanging")({ component: VervangingPage });

const afwezigPersoneel = personeel.filter((p) => !p.aanwezig);
const beschikbareDocenten = personeel.filter((p) => p.aanwezig && p.vakken.length > 0);

function VervangingPage() {
  const { role } = useRole();

  if (role !== "teamleider") {
    return (
      <AppShell title="Vervanging" subtitle="Vervangingsregeling en bezetting">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="text-sm font-semibold text-muted-foreground">Alleen beschikbaar voor teamleiders.</div>
        </div>
      </AppShell>
    );
  }

  return <VervangingView />;
}

function VervangingView() {
  const [vervangingen, setVervangingen] = useState<Record<string, string>>({});
  const [selectModal, setSelectModal] = useState<{ lesKey: string; docent: string } | null>(null);

  const wijsVervanger = (lesKey: string, vervanger: string) => {
    setVervangingen((prev) => ({ ...prev, [lesKey]: vervanger }));
    setSelectModal(null);
    toast.success(`${vervanger} ingeroosterd als vervanger`);
  };

  const stuurNotificatie = (naam: string) => {
    toast.success(`Notificatie verstuurd naar ${naam}`);
  };

  const uitgevallenLessen = afwezigPersoneel.flatMap((p) => {
    const docentVak = p.vakken[0];
    if (!docentVak) return [];
    return roosterVandaag.slice(0, 2).map((les, i) => ({
      lesKey: `${p.id}-${i}`,
      docent: p.naam,
      vak: docentVak,
      tijd: les.tijd,
      lokaal: les.lokaal,
      verlof: p.verlof ?? "Afwezig",
    }));
  });

  const toegewezen = uitgevallenLessen.filter((l) => vervangingen[l.lesKey]);
  const openstaand = uitgevallenLessen.filter((l) => !vervangingen[l.lesKey]);

  return (
    <AppShell title="Vervanging" subtitle="Vervangingsregeling en bezetting">
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><AlertTriangle className="h-4 w-4" /></div>
          <div className="mt-3 text-xs text-muted-foreground">Uitgevallen docenten</div>
          <div className="mt-1 text-2xl font-bold">{afwezigPersoneel.length}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning"><RefreshCw className="h-4 w-4" /></div>
          <div className="mt-3 text-xs text-muted-foreground">Openstaande lessen</div>
          <div className="mt-1 text-2xl font-bold">{openstaand.length}</div>
        </div>
        <div className="col-span-2 rounded-2xl border border-border bg-card p-4 sm:col-span-1">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success"><CheckCircle2 className="h-4 w-4" /></div>
          <div className="mt-3 text-xs text-muted-foreground">Toegewezen</div>
          <div className="mt-1 text-2xl font-bold">{toegewezen.length}</div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-sm font-semibold">Uitgevallen vandaag</h2>
        <div className="space-y-3">
          {afwezigPersoneel.map((p) => (
            <div key={p.id} className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{p.naam}</div>
                  <div className="text-xs text-muted-foreground">{p.vakken.join(", ")} · {p.verlof}</div>
                </div>
                <button
                  onClick={() => stuurNotificatie(p.naam)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                >
                  Stuur notificatie
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card title="Lessen zonder vervanger">
        {openstaand.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Alle lessen zijn gedekt ✓
          </div>
        ) : (
          <div className="space-y-2">
            {openstaand.map((les) => (
              <div key={les.lesKey} className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                <div>
                  <div className="text-sm font-semibold">{les.vak}</div>
                  <div className="text-xs text-muted-foreground">{les.tijd} · Lokaal {les.lokaal} · i.p.v. {les.docent}</div>
                </div>
                <button
                  onClick={() => setSelectModal({ lesKey: les.lesKey, docent: les.docent })}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  Wijs vervanger toe
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {toegewezen.length > 0 && (
        <div className="mt-6">
          <Card title="Toegewezen vervangingen">
            <div className="space-y-2">
              {toegewezen.map((les) => (
                <div key={les.lesKey} className="flex items-center justify-between rounded-xl border border-success/20 bg-success/5 p-3">
                  <div>
                    <div className="text-sm font-semibold">{les.vak}</div>
                    <div className="text-xs text-muted-foreground">{les.tijd} · Vervanger: {vervangingen[les.lesKey]}</div>
                  </div>
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">Gedekt</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {selectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectModal(null)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="text-sm font-semibold">Kies een vervanger</div>
              <button onClick={() => setSelectModal(null)} className="rounded-lg p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-2 p-4">
              <div className="mb-3 text-xs text-muted-foreground">Beschikbare docenten (mogelijke tussenuren)</div>
              {beschikbareDocenten.map((d) => (
                <button
                  key={d.id}
                  onClick={() => wijsVervanger(selectModal.lesKey, d.naam)}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-background p-3 text-left hover:bg-muted/50"
                >
                  <div>
                    <div className="text-sm font-semibold">{d.naam}</div>
                    <div className="text-xs text-muted-foreground">{d.vakken.join(", ")}</div>
                  </div>
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">Beschikbaar</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
