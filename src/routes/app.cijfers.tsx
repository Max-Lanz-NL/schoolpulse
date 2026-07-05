import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { cijfers, docentKlassen, klassen, type Leerling } from "@/lib/demo-data";
import { useRole } from "@/lib/role-context";
import { TrendingUp, TrendingDown, Minus, ArrowLeft, Plus, Pencil, Trash2, X, Users, BarChart3 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/cijfers")({ component: CijfersPage });

function CijfersPage() {
  const { role } = useRole();
  if (role === "docent") return <DocentCijfers />;
  if (role === "teamleider" || role === "directie") return <ManagementCijfers />;
  return <LeerlingCijfers />;
}

// ─────────────── LEERLING ───────────────
function LeerlingCijfers() {
  const [tab, setTab] = useState<"recent" | "overzicht">("recent");

  // Flatten en sorteer alle cijfers nieuw → oud
  const alle = cijfers.flatMap((c) => c.toetsen.map((t) => ({ ...t, vak: c.vak }))).sort((a, b) => b.iso.localeCompare(a.iso));

  return (
    <AppShell title="Cijfers" subtitle="Schooljaar 2025-2026">
      <div className="mb-6 inline-flex rounded-lg border border-border bg-card p-1">
        <button onClick={() => setTab("recent")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${tab === "recent" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Recent</button>
        <button onClick={() => setTab("overzicht")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${tab === "overzicht" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Cijferoverzicht</button>
      </div>

      {tab === "recent" ? (
        <Card title="Recente cijfers">
          <div className="space-y-2">
            {alle.map((t, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{t.vak}</div>
                  <div className="truncate text-xs text-muted-foreground">{t.naam} · ×{t.weging} · {t.datum}</div>
                </div>
                <div className={`shrink-0 rounded-lg px-3 py-1.5 text-lg font-bold ${t.cijfer < 5.5 ? "bg-destructive/15 text-destructive" : t.cijfer >= 8 ? "bg-success/15 text-success" : "bg-muted"}`}>
                  {t.cijfer.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Overzicht />
      )}
    </AppShell>
  );
}

function Overzicht() {
  const norm = 5.5;
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Voldoende-norm: 5.5.</span> Onder deze grens tel je als tekort. Hieronder zie je per vak wat je nog nodig hebt om weer voldoende te staan.
      </div>
      {cijfers.map((c) => {
        const totWeging = c.toetsen.reduce((a, t) => a + t.weging, 0);
        const totSom = c.toetsen.reduce((a, t) => a + t.cijfer * t.weging, 0);
        const gem = totSom / totWeging;
        const isOnvold = gem < norm;
        // Nodig cijfer (weging 1 extra toets) om op 5.5 te komen: (5.5 * (W+1)) − som
        const nodig = Math.max(1, Math.min(10, norm * (totWeging + 1) - totSom));

        return (
          <div key={c.vak} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold">{c.vak}</div>
                <TrendIcon trend={c.trend} />
                {isOnvold && <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold text-destructive">Tekort</span>}
              </div>
              <div className={`text-lg font-bold ${isOnvold ? "text-destructive" : ""}`}>{gem.toFixed(2)}</div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.toetsen.map((t, i) => (
                <span key={i} className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${t.cijfer < 5.5 ? "bg-destructive/15 text-destructive" : t.cijfer >= 8 ? "bg-success/15 text-success" : "bg-muted"}`}>
                  {t.cijfer.toFixed(1)} <span className="opacity-60">×{t.weging}</span>
                </span>
              ))}
            </div>

            <div className={`mt-3 rounded-lg p-3 text-xs ${isOnvold ? "bg-destructive/5 text-destructive" : "bg-success/5 text-success"}`}>
              {isOnvold ? (
                <>Je moet minimaal <strong>{nodig.toFixed(1)}</strong> halen op je volgende toets (weging 1) om weer op {norm.toFixed(1)} te komen.</>
              ) : (
                <>Voldoende — geen inhaalcijfer nodig.</>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-success" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}

// ─────────────── DOCENT ───────────────
type Cijfer = { naam: string; cijfer: number; weging: number; datum: string };

function DocentCijfers() {
  const [klasIdx, setKlasIdx] = useState<number | null>(null);
  const [leerlingId, setLeerlingId] = useState<string | null>(null);
  const [data, setData] = useState(() => JSON.parse(JSON.stringify(docentKlassen)) as typeof docentKlassen);
  const [modal, setModal] = useState<{ leerling: Leerling; index: number | null } | null>(null);

  if (klasIdx === null) {
    return (
      <AppShell title="Cijfers" subtitle="Kies een klas">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((k, i) => (
            <button key={k.klas} onClick={() => setKlasIdx(i)}
              className="rounded-2xl border border-border bg-card p-5 text-left hover:border-primary hover:shadow">
              <div className="text-lg font-bold">{k.klas}</div>
              <div className="text-xs text-muted-foreground">{k.vak} · {k.leerlingen.length} leerlingen</div>
            </button>
          ))}
        </div>
      </AppShell>
    );
  }

  const klas = data[klasIdx];

  if (leerlingId === null) {
    return (
      <AppShell title={`Cijfers · ${klas.klas}`} subtitle={klas.vak}>
        <button onClick={() => setKlasIdx(null)} className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-primary"><ArrowLeft className="h-3.5 w-3.5" /> Terug naar klassen</button>
        <Card title="Leerlingen">
          <div className="space-y-2">
            {klas.leerlingen.map((l) => {
              const c = l.cijfers[klas.vak] ?? [];
              const gem = c.length ? c.reduce((a, t) => a + t.cijfer * t.weging, 0) / c.reduce((a, t) => a + t.weging, 0) : 0;
              return (
                <button key={l.id} onClick={() => setLeerlingId(l.id)}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-background p-3 text-left hover:bg-muted/50">
                  <div className="text-sm font-semibold">{l.naam}</div>
                  <div className={`text-base font-bold ${gem < 5.5 && gem > 0 ? "text-destructive" : ""}`}>{gem ? gem.toFixed(1) : "—"}</div>
                </button>
              );
            })}
          </div>
        </Card>
      </AppShell>
    );
  }

  const leerlingIdx = klas.leerlingen.findIndex((l) => l.id === leerlingId);
  const leerling = klas.leerlingen[leerlingIdx];
  const vak = klas.vak;
  const cs = leerling.cijfers[vak] ?? [];

  const saveCijfer = (c: Cijfer, idx: number | null) => {
    setData((d) => {
      const nd = JSON.parse(JSON.stringify(d)) as typeof d;
      const list = nd[klasIdx].leerlingen[leerlingIdx].cijfers[vak] ?? [];
      if (idx === null) list.push(c);
      else list[idx] = c;
      nd[klasIdx].leerlingen[leerlingIdx].cijfers[vak] = list;
      return nd;
    });
    setModal(null);
  };
  const delCijfer = (idx: number) => {
    setData((d) => {
      const nd = JSON.parse(JSON.stringify(d)) as typeof d;
      nd[klasIdx].leerlingen[leerlingIdx].cijfers[vak].splice(idx, 1);
      return nd;
    });
  };

  return (
    <AppShell title={leerling.naam} subtitle={`${klas.klas} · ${vak}`}>
      <button onClick={() => setLeerlingId(null)} className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-primary"><ArrowLeft className="h-3.5 w-3.5" /> Terug naar leerlingen</button>
      <Card title={vak} action={
        <button onClick={() => setModal({ leerling, index: null })} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
          <Plus className="h-3.5 w-3.5" /> Cijfer toevoegen
        </button>
      }>
        {cs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Nog geen cijfers ingevoerd</div>
        ) : (
          <div className="space-y-2">
            {cs.map((t, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{t.naam}</div>
                  <div className="truncate text-xs text-muted-foreground">×{t.weging} · {t.datum}</div>
                </div>
                <div className={`shrink-0 rounded-lg px-3 py-1.5 text-lg font-bold ${t.cijfer < 5.5 ? "bg-destructive/15 text-destructive" : "bg-muted"}`}>{t.cijfer.toFixed(1)}</div>
                <button onClick={() => setModal({ leerling, index: i })} className="rounded-md p-1.5 hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => delCijfer(i)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {modal && <CijferModal
        init={modal.index !== null ? cs[modal.index] : null}
        onSave={(c) => saveCijfer(c, modal.index)}
        onClose={() => setModal(null)}
      />}
    </AppShell>
  );
}

function CijferModal({ init, onSave, onClose }: { init: Cijfer | null; onSave: (c: Cijfer) => void; onClose: () => void }) {
  const [naam, setNaam] = useState(init?.naam ?? "");
  const [cijfer, setCijfer] = useState(init?.cijfer.toString() ?? "");
  const [weging, setWeging] = useState(init?.weging.toString() ?? "1");
  const vandaag = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
  const [datum, setDatum] = useState(init?.datum ?? vandaag);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="text-sm font-semibold">{init ? "Cijfer bewerken" : "Cijfer toevoegen"}</div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3 p-4">
          <Field label="Toets"><input value={naam} onChange={(e) => setNaam(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Bijv. SO Hoofdstuk 4" /></Field>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Cijfer"><input value={cijfer} onChange={(e) => setCijfer(e.target.value)} type="number" step="0.1" min="1" max="10" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
            <Field label="Weging"><input value={weging} onChange={(e) => setWeging(e.target.value)} type="number" min="1" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
            <Field label="Datum"><input value={datum} onChange={(e) => setDatum(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" /></Field>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-3">
          <button onClick={onClose} className="rounded-lg border border-border px-3 py-2 text-sm">Annuleren</button>
          <button
            disabled={!naam || !cijfer}
            onClick={() => onSave({ naam, cijfer: parseFloat(cijfer), weging: parseInt(weging) || 1, datum })}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >Opslaan</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function ManagementCijfers() {
  return (
    <AppShell title="Cijfers" subtitle="Klassenoverzicht">
      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><BarChart3 className="h-4 w-4" /></div>
          <div className="mt-3 text-xs text-muted-foreground">Gem. bovenbouw</div>
          <div className="mt-1 text-2xl font-bold">7.1</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success"><TrendingUp className="h-4 w-4" /></div>
          <div className="mt-3 text-xs text-muted-foreground">Voldoende</div>
          <div className="mt-1 text-2xl font-bold">89%</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning"><TrendingDown className="h-4 w-4" /></div>
          <div className="mt-3 text-xs text-muted-foreground">Tekorten</div>
          <div className="mt-1 text-2xl font-bold">14</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Users className="h-4 w-4" /></div>
          <div className="mt-3 text-xs text-muted-foreground">Klassen</div>
          <div className="mt-1 text-2xl font-bold">{klassen.length}</div>
        </div>
      </div>
      <Card title="Gemiddelden per klas">
        <div className="space-y-3">
          {klassen.map((k) => (
            <div key={k.klas} className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{k.klas}</div>
                  <div className="text-xs text-muted-foreground">{k.leerlingen} leerlingen · {k.aanwezigheid}% aanwezigheid</div>
                </div>
                <div className={`text-2xl font-bold ${k.gemiddelde < 6 ? "text-destructive" : k.gemiddelde >= 7.5 ? "text-success" : ""}`}>
                  {k.gemiddelde.toFixed(1)}
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: `${(k.gemiddelde / 10) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
