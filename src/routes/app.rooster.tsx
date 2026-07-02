import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { roosterVandaag, uurNummer } from "@/lib/demo-data";
import { useRole } from "@/lib/role-context";
import { Sparkles, AlertTriangle, X, BookOpen, MapPin, User, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/rooster")({ component: Rooster });

const dagen = ["Ma", "Di", "Wo", "Do", "Vr"];

type Cell = { vak: string; lokaal: string; kleur: string; docent: string; wijziging?: string; huiswerk?: string; aanwezig?: boolean } | null;

const week: Record<string, Cell>[] = [
  // uur 1 (08:30)
  { Ma: { vak: "Wiskunde", lokaal: "204", kleur: "bg-blue-500", docent: "M. Jansen", huiswerk: "§4.2 opgaven" }, Di: { vak: "Wiskunde", lokaal: "204", kleur: "bg-blue-500", docent: "M. Jansen" }, Wo: null, Do: { vak: "Nederlands", lokaal: "112", kleur: "bg-indigo-500", docent: "L. de Boer" }, Vr: { vak: "Engels", lokaal: "108", kleur: "bg-amber-500", docent: "S. Green" } },
  // uur 2 (09:20)
  { Ma: { vak: "Nederlands", lokaal: "112", kleur: "bg-indigo-500", docent: "L. de Boer" }, Di: { vak: "Nederlands", lokaal: "112", kleur: "bg-indigo-500", docent: "L. de Boer" }, Wo: { vak: "Biologie", lokaal: "Lab 1", kleur: "bg-teal-500", docent: "H. Mulder" }, Do: { vak: "Wiskunde", lokaal: "204", kleur: "bg-blue-500", docent: "M. Jansen" }, Vr: { vak: "Geschiedenis", lokaal: "215", kleur: "bg-rose-500", docent: "J. Peters" } },
  // uur 3 (10:30)
  { Ma: { vak: "Scheikunde", lokaal: "Lab 2", kleur: "bg-emerald-500", docent: "K. Visser" }, Di: { vak: "Scheikunde", lokaal: "Lab 2", kleur: "bg-emerald-500", docent: "K. Visser", wijziging: "Lokaalwissel" }, Wo: { vak: "Wiskunde", lokaal: "204", kleur: "bg-blue-500", docent: "M. Jansen" }, Do: null, Vr: { vak: "Nederlands", lokaal: "112", kleur: "bg-indigo-500", docent: "L. de Boer" } },
  // uur 4 (11:20)
  { Ma: { vak: "Engels", lokaal: "108", kleur: "bg-amber-500", docent: "S. Green" }, Di: { vak: "Engels", lokaal: "108", kleur: "bg-amber-500", docent: "S. Green" }, Wo: { vak: "Geschiedenis", lokaal: "215", kleur: "bg-rose-500", docent: "J. Peters" }, Do: { vak: "Biologie", lokaal: "Lab 1", kleur: "bg-teal-500", docent: "H. Mulder" }, Vr: { vak: "Wiskunde", lokaal: "204", kleur: "bg-blue-500", docent: "M. Jansen" } },
  // uur 5 pauze
  { Ma: null, Di: null, Wo: null, Do: null, Vr: null },
  // uur 6 (13:00)
  { Ma: { vak: "Geschiedenis", lokaal: "215", kleur: "bg-rose-500", docent: "J. Peters" }, Di: { vak: "Geschiedenis", lokaal: "215", kleur: "bg-rose-500", docent: "J. Peters", wijziging: "Uitval" }, Wo: { vak: "Engels", lokaal: "108", kleur: "bg-amber-500", docent: "S. Green" }, Do: { vak: "Scheikunde", lokaal: "Lab 2", kleur: "bg-emerald-500", docent: "K. Visser" }, Vr: null },
  // uur 7 (13:50)
  { Ma: { vak: "Biologie", lokaal: "Lab 1", kleur: "bg-teal-500", docent: "H. Mulder" }, Di: { vak: "Biologie", lokaal: "Lab 1", kleur: "bg-teal-500", docent: "H. Mulder" }, Wo: null, Do: { vak: "Geschiedenis", lokaal: "215", kleur: "bg-rose-500", docent: "J. Peters" }, Vr: { vak: "Scheikunde", lokaal: "Lab 2", kleur: "bg-emerald-500", docent: "K. Visser" } },
];

const uren = ["08:30", "09:20", "10:30", "11:20", "12:10", "13:00", "13:50"];

type Detail = { start: string; vak: string; lokaal: string; kleur: string; docent: string; wijziging?: string; huiswerk?: string; aanwezig?: boolean };

function Rooster() {
  const { role } = useRole();
  const toonAI = role !== "leerling" && role !== "ouder";
  const [detail, setDetail] = useState<Detail | null>(null);

  return (
    <AppShell title="Rooster" subtitle="Week 48 · 24 – 28 november 2025">
      {toonAI && (
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
      )}

      <Card title="Weekrooster">
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[90px_repeat(5,1fr)] gap-2">
              <div />
              {dagen.map((d) => (<div key={d} className="pb-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>))}
              {uren.map((u, i) => (
                <FragmentRow key={u} u={u} i={i} onOpen={setDetail} />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <Card title="Vandaag — dinsdag 26 november">
          <div className="space-y-2">
            {roosterVandaag.map((l) => {
              const nr = uurNummer(l.start);
              return (
                <button
                  key={l.tijd}
                  onClick={() => setDetail({ start: l.start, vak: l.vak, lokaal: l.lokaal, kleur: l.kleur, docent: l.docent, wijziging: l.wijziging, huiswerk: l.huiswerk, aanwezig: l.aanwezig })}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition-colors hover:bg-muted/50"
                >
                  <div className={`h-10 w-1 rounded-full ${l.kleur}`} />
                  <div className="w-8 shrink-0 text-center">
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground">uur</div>
                    <div className="text-sm font-bold">{nr}</div>
                  </div>
                  <div className="w-28 shrink-0 text-xs text-muted-foreground">{l.tijd}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{l.vak}</div>
                    <div className="truncate text-xs text-muted-foreground">Lokaal {l.lokaal} · {l.docent}</div>
                  </div>
                  {l.wijziging && <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">{l.wijziging}</span>}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {detail && <LesDetailModal detail={detail} onClose={() => setDetail(null)} />}
    </AppShell>
  );
}

function FragmentRow({ u, i, onOpen }: { u: string; i: number; onOpen: (d: Detail) => void }) {
  const nr = uurNummer(u);
  return (
    <>
      <div className="pt-2 text-right">
        <div className="text-[10px] font-semibold text-muted-foreground">Uur {nr}</div>
        <div className="text-[11px] text-muted-foreground">{u}</div>
      </div>
      {dagen.map((d) => {
        const cell = week[i]?.[d as keyof typeof week[0]];
        if (!cell) return <div key={d + u} className="min-h-[64px] rounded-lg bg-muted/40" />;
        return (
          <button
            key={d + u}
            onClick={() => onOpen({ start: u, vak: cell.vak, lokaal: cell.lokaal, kleur: cell.kleur, docent: cell.docent, wijziging: cell.wijziging, huiswerk: cell.huiswerk })}
            className={`relative min-h-[64px] rounded-lg border border-border bg-background p-2 text-left transition-colors hover:border-primary/50 hover:bg-muted/40 ${cell.wijziging ? "ring-1 ring-warning" : ""}`}
          >
            <div className={`absolute left-0 top-0 h-full w-1 rounded-l-lg ${cell.kleur}`} />
            <div className="pl-2 text-xs font-semibold">{cell.vak}</div>
            <div className="pl-2 text-[10px] text-muted-foreground">{cell.lokaal} · {cell.docent}</div>
            {cell.wijziging && (
              <div className="mt-0.5 flex items-center gap-1 pl-2 text-[10px] font-semibold text-warning">
                <AlertTriangle className="h-2.5 w-2.5" /> {cell.wijziging}
              </div>
            )}
          </button>
        );
      })}
    </>
  );
}

function LesDetailModal({ detail, onClose }: { detail: Detail; onClose: () => void }) {
  const nr = uurNummer(detail.start);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className={`h-2 w-full ${detail.kleur}`} />
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Uur {nr} · {detail.start}</div>
              <div className="mt-1 text-lg font-bold">{detail.vak}</div>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>

          {detail.wijziging && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-warning/15 px-3 py-2 text-xs font-semibold text-warning">
              <AlertTriangle className="h-3.5 w-3.5" /> {detail.wijziging}
            </div>
          )}

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> Lokaal {detail.lokaal}</div>
            <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> {detail.docent}</div>
            {detail.aanwezig !== undefined && (
              <div className="flex items-center gap-2">
                {detail.aanwezig
                  ? <><CheckCircle2 className="h-4 w-4 text-success" /> <span className="text-success">Aanwezig geregistreerd</span></>
                  : <><XCircle className="h-4 w-4 text-muted-foreground" /> <span className="text-muted-foreground">Nog niet geregistreerd</span></>}
              </div>
            )}
          </div>

          {detail.huiswerk && (
            <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5" /> Huiswerk
              </div>
              <div className="text-sm">{detail.huiswerk}</div>
            </div>
          )}

          <div className="mt-5 flex gap-2">
            <button className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Bericht docent</button>
            <button className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-muted" onClick={onClose}>Sluiten</button>
          </div>
        </div>
      </div>
    </div>
  );
}
