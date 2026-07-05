import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { docentKlassen, leerlingAanwezigheid, type Leerling } from "@/lib/demo-data";
import { useRole } from "@/lib/role-context";
import { useState } from "react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/leerlingen")({ component: LeerlingenPage });

function LeerlingenPage() {
  const { role } = useRole();

  if (role !== "docent" && role !== "teamleider") {
    return (
      <AppShell title="Leerlingen" subtitle="Dossier en voortgang per leerling">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="text-sm font-semibold text-muted-foreground">Niet beschikbaar voor jouw rol.</div>
        </div>
      </AppShell>
    );
  }

  return <LeerlingenView />;
}

function LeerlingenView() {
  const [klas, setKlas] = useState("V4B");
  const [selectedLeerling, setSelectedLeerling] = useState<Leerling | null>(null);
  const [notities, setNotities] = useState<Record<string, string>>({});
  const [notitieInput, setNotitieInput] = useState("");

  const klasData = docentKlassen.find((k) => k.klas === klas);
  const leerlingen = klasData?.leerlingen ?? [];

  const getGem = (l: Leerling) => {
    const all = Object.values(l.cijfers).flat();
    if (!all.length) return 0;
    const totW = all.reduce((a, t) => a + t.weging, 0);
    const totS = all.reduce((a, t) => a + t.cijfer * t.weging, 0);
    return totS / totW;
  };

  const openDetail = (l: Leerling) => {
    setSelectedLeerling(l);
    setNotitieInput(notities[l.id] ?? "");
  };

  const saveNotitie = () => {
    if (selectedLeerling) {
      setNotities((n) => ({ ...n, [selectedLeerling.id]: notitieInput }));
      toast.success("Notitie opgeslagen");
    }
  };

  return (
    <AppShell title="Leerlingen" subtitle="Dossier en voortgang per leerling">
      <div className="mb-4 flex items-center gap-3">
        <label className="text-xs font-semibold text-muted-foreground">Klas:</label>
        <select
          value={klas}
          onChange={(e) => { setKlas(e.target.value); setSelectedLeerling(null); }}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        >
          {docentKlassen.map((k) => <option key={k.klas}>{k.klas}</option>)}
        </select>
      </div>

      {selectedLeerling ? (
        <LeerlingDetail
          leerling={selectedLeerling}
          klas={klas}
          notitie={notitieInput}
          onNotitieChange={setNotitieInput}
          onSaveNotitie={saveNotitie}
          onBack={() => setSelectedLeerling(null)}
          getGem={getGem}
        />
      ) : (
        <Card title={`Leerlingen — ${klas}`}>
          <div className="space-y-2">
            {leerlingen.map((l) => {
              const gem = getGem(l);
              const aanwPct = Math.round((leerlingAanwezigheid.filter((e) => e.status === "aanwezig").length / leerlingAanwezigheid.length) * 100);
              return (
                <button
                  key={l.id}
                  onClick={() => openDetail(l)}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-background p-3 text-left hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{l.naam}</div>
                    <div className="text-xs text-muted-foreground">{aanwPct}% aanwezig</div>
                  </div>
                  <div className={`text-base font-bold ${gem < 5.5 && gem > 0 ? "text-destructive" : ""}`}>
                    {gem ? gem.toFixed(1) : "—"}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}
    </AppShell>
  );
}

function LeerlingDetail({
  leerling, klas, notitie, onNotitieChange, onSaveNotitie, onBack, getGem,
}: {
  leerling: Leerling; klas: string; notitie: string;
  onNotitieChange: (v: string) => void; onSaveNotitie: () => void;
  onBack: () => void; getGem: (l: Leerling) => number;
}) {
  const gem = getGem(leerling);
  const aanwPct = Math.round((leerlingAanwezigheid.filter((e) => e.status === "aanwezig").length / leerlingAanwezigheid.length) * 100);
  const signaleringen: string[] = [];
  if (gem < 5.5 && gem > 0) signaleringen.push(`Gemiddeld onvoldoende (${gem.toFixed(1)})`);
  if (aanwPct < 90) signaleringen.push(`Hoog verzuim (${100 - aanwPct}% afwezig)`);

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
        <ArrowLeft className="h-3.5 w-3.5" /> Terug naar leerlingen
      </button>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="text-lg font-bold">{leerling.naam}</div>
        <div className="text-xs text-muted-foreground">{klas} · Mentor: L. de Boer</div>
      </div>

      {signaleringen.length > 0 && (
        <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-warning">
            <AlertTriangle className="h-4 w-4" /> Signaleringen
          </div>
          {signaleringen.map((s, i) => (
            <div key={i} className="text-xs text-warning/80">• {s}</div>
          ))}
        </div>
      )}

      <Card title="Cijfers per vak">
        <div className="space-y-2">
          {Object.entries(leerling.cijfers).map(([vak, toetsen]) => {
            const totW = toetsen.reduce((a, t) => a + t.weging, 0);
            const totS = toetsen.reduce((a, t) => a + t.cijfer * t.weging, 0);
            const vakGem = totW ? totS / totW : 0;
            return (
              <div key={vak} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{vak}</div>
                  <div className={`font-bold ${vakGem < 5.5 ? "text-destructive" : "text-success"}`}>{vakGem.toFixed(1)}</div>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {toetsen.map((t, i) => (
                    <span key={i} className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${t.cijfer < 5.5 ? "bg-destructive/15 text-destructive" : "bg-muted"}`}>
                      {t.naam}: {t.cijfer.toFixed(1)} ×{t.weging}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Aanwezigheid">
        <div className="text-sm">{aanwPct}% aanwezig van de afgelopen lessen</div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div className={`h-full rounded-full ${aanwPct < 90 ? "bg-destructive" : "bg-success"}`} style={{ width: `${aanwPct}%` }} />
        </div>
      </Card>

      <Card title="Notitie docent/mentor">
        <textarea
          rows={4}
          value={notitie}
          onChange={(e) => onNotitieChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          placeholder="Voeg een notitie toe over deze leerling..."
        />
        <div className="mt-2 flex justify-end">
          <button onClick={onSaveNotitie} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
            Opslaan
          </button>
        </div>
      </Card>
    </div>
  );
}
