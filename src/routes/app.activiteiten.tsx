import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { activiteiten } from "@/lib/demo-data";
import { useRole } from "@/lib/role-context";
import { CalendarCheck, Users, Plus, X, Paperclip } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/activiteiten")({ component: Activiteiten });

type Aank = { t: string; d: string; voor: string[] | null };

function Activiteiten() {
  const { role } = useRole();
  const magBeheren = role === "docent" || role === "teamleider" || role === "directie";
  const zichtbaar = activiteiten.filter((a) => !a.zichtbaarVoor || a.zichtbaarVoor.includes(role));

  const [aangemeld, setAangemeld] = useState<Record<string, boolean>>({});
  const [pollAns, setPollAns] = useState<number | null>(null);
  const [nieuweOpen, setNieuweOpen] = useState(false);
  const [extraAank, setExtraAank] = useState<Aank[]>([]);
  const pollOpties = [
    { label: "Berlijn", stemmen: 84 },
    { label: "Praag", stemmen: 52 },
    { label: "Barcelona", stemmen: 96 },
    { label: "Rome", stemmen: 41 },
  ];
  const totaal = pollOpties.reduce((a, o) => a + o.stemmen, 0);

  const basisAank: Aank[] = [
    { t: "Herinnering ouderavond V4", d: "3 dec · doelgroep V4-ouders", voor: ["ouder", "docent", "teamleider", "directie"] },
    { t: "Nieuwe kantinekaart", d: "Vanaf maandag actief", voor: null },
    { t: "Kerstviering programma", d: "Publicatie volgende week", voor: null },
  ];
  const aankondigingen = [...extraAank, ...basisAank].filter((a) => !a.voor || a.voor.includes(role));

  return (
    <AppShell title="Activiteiten" subtitle="Aanmeldingen, polls en aankondigingen">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {zichtbaar.map((a) => {
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
              {aankondigingen.map((a) => (
                <div key={a.t} className="rounded-lg border border-border p-3">
                  <div className="text-sm font-semibold">{a.t}</div>
                  <div className="text-[11px] text-muted-foreground">{a.d}</div>
                </div>
              ))}
              {magBeheren && (
                <button onClick={() => setNieuweOpen(true)} className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border p-3 text-xs font-semibold text-muted-foreground hover:bg-muted/40">
                  <Plus className="h-3 w-3" /> Nieuwe aankondiging
                </button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {nieuweOpen && (
        <NieuweAankondigingModal
          onClose={() => setNieuweOpen(false)}
          onSave={(a) => { setExtraAank((s) => [a, ...s]); setNieuweOpen(false); }}
        />
      )}
    </AppShell>
  );
}

const doelgroepen = ["Hele school", "Bovenbouw", "Onderbouw", "V4", "V5", "H4", "Sectie Wiskunde", "Sectie Nederlands", "Ouders"];

function NieuweAankondigingModal({ onClose, onSave }: { onClose: () => void; onSave: (a: Aank) => void }) {
  const [titel, setTitel] = useState("");
  const [tekst, setTekst] = useState("");
  const [datum, setDatum] = useState("");
  const [doel, setDoel] = useState<string[]>(["Hele school"]);
  const [bijlage, setBijlage] = useState<string | null>(null);

  const toggle = (d: string) => setDoel((s) => s.includes(d) ? s.filter((x) => x !== d) : [...s, d]);
  const canSave = titel.trim().length > 0 && tekst.trim().length > 0;

  const submit = () => {
    if (!canSave) return;
    onSave({
      t: titel,
      d: `${datum || "Direct"} · ${doel.join(", ")}${bijlage ? ` · 📎 ${bijlage}` : ""}`,
      voor: null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="text-sm font-semibold">Nieuwe aankondiging</div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3 p-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Titel</label>
            <input value={titel} onChange={(e) => setTitel(e.target.value)} placeholder="Bijv. Ouderavond V4" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Bericht</label>
            <textarea value={tekst} onChange={(e) => setTekst(e.target.value)} rows={3} placeholder="Wat moet er gecommuniceerd worden?" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Datum (optioneel)</label>
              <input type="date" value={datum} onChange={(e) => setDatum(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Bijlage</label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted">
                <Paperclip className="h-4 w-4" />
                <span className="truncate text-muted-foreground">{bijlage ?? "Bestand kiezen..."}</span>
                <input type="file" className="hidden" onChange={(e) => setBijlage(e.target.files?.[0]?.name ?? null)} />
              </label>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Doelgroep</label>
            <div className="flex flex-wrap gap-1.5">
              {doelgroepen.map((d) => {
                const on = doel.includes(d);
                return (
                  <button key={d} onClick={() => toggle(d)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-3">
          <button onClick={onClose} className="rounded-lg border border-border px-3 py-2 text-sm">Annuleren</button>
          <button onClick={submit} disabled={!canSave} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">Plaatsen</button>
        </div>
      </div>
    </div>
  );
}
