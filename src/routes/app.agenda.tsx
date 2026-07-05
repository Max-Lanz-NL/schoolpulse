import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { weekRooster, type Les } from "@/lib/demo-data";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/app/agenda")({ component: AgendaPage });

const kinderen = [
  { naam: "Sanne de Vries", klas: "V4B" },
  { naam: "Tom de Vries", klas: "V2A" },
];

const tomRooster: Record<string, Les[]> = {
  Ma: [
    { tijd: "08:30 – 09:20", start: "08:30", vak: "Wiskunde A", lokaal: "201", docent: "P. Smit", kleur: "bg-blue-500" },
    { tijd: "09:20 – 10:10", start: "09:20", vak: "Aardrijkskunde", lokaal: "115", docent: "J. de Groot", kleur: "bg-green-500" },
    { tijd: "10:30 – 11:20", start: "10:30", vak: "Nederlands", lokaal: "112", docent: "L. de Boer", kleur: "bg-indigo-500" },
  ],
  Di: [
    { tijd: "09:20 – 10:10", start: "09:20", vak: "Engels", lokaal: "108", docent: "S. Green", kleur: "bg-amber-500" },
    { tijd: "11:20 – 12:10", start: "11:20", vak: "Wiskunde A", lokaal: "201", docent: "P. Smit", kleur: "bg-blue-500" },
    { tijd: "13:00 – 13:50", start: "13:00", vak: "Biologie", lokaal: "Lab 1", docent: "H. Mulder", kleur: "bg-teal-500" },
  ],
  Wo: [
    { tijd: "08:30 – 09:20", start: "08:30", vak: "Nederlands", lokaal: "112", docent: "L. de Boer", kleur: "bg-indigo-500" },
    { tijd: "10:30 – 11:20", start: "10:30", vak: "Aardrijkskunde", lokaal: "115", docent: "J. de Groot", kleur: "bg-green-500" },
  ],
  Do: [
    { tijd: "09:20 – 10:10", start: "09:20", vak: "Wiskunde A", lokaal: "201", docent: "P. Smit", kleur: "bg-blue-500" },
    { tijd: "13:50 – 14:40", start: "13:50", vak: "Engels", lokaal: "108", docent: "S. Green", kleur: "bg-amber-500" },
  ],
  Vr: [
    { tijd: "08:30 – 09:20", start: "08:30", vak: "Biologie", lokaal: "Lab 1", docent: "H. Mulder", kleur: "bg-teal-500" },
    { tijd: "09:20 – 10:10", start: "09:20", vak: "Nederlands", lokaal: "112", docent: "L. de Boer", kleur: "bg-indigo-500" },
    { tijd: "11:20 – 12:10", start: "11:20", vak: "Wiskunde A", lokaal: "201", docent: "P. Smit", kleur: "bg-blue-500" },
  ],
};

const weekDagen = ["Ma", "Di", "Wo", "Do", "Vr"] as const;
const baseWeekStart = new Date("2026-07-06");

function AgendaPage() {
  const [selectedKind, setSelectedKind] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const kind = kinderen[selectedKind];
  const rooster = selectedKind === 0 ? weekRooster : tomRooster;

  const weekStart = new Date(baseWeekStart);
  weekStart.setDate(baseWeekStart.getDate() + weekOffset * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 4);
  const formatDate = (d: Date) => d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });

  return (
    <AppShell title="Agenda" subtitle="Schoolagenda van uw kind">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex overflow-hidden rounded-lg border border-border">
          {kinderen.map((k, i) => (
            <button key={k.naam} onClick={() => setSelectedKind(i)} className={`px-3 py-1.5 text-xs font-semibold transition-colors ${selectedKind === i ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
              {k.naam.split(" ")[0]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset((v) => v - 1)} className="rounded-lg border border-border p-2 hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-sm font-semibold">{formatDate(weekStart)} – {formatDate(weekEnd)}</span>
          <button onClick={() => setWeekOffset((v) => v + 1)} className="rounded-lg border border-border p-2 hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
        </div>
        <div className="text-xs text-muted-foreground">{kind.naam} · {kind.klas}</div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        {weekDagen.map((dag, di) => {
          const datum = new Date(weekStart);
          datum.setDate(weekStart.getDate() + di);
          const lessen = rooster[dag] ?? [];
          return (
            <div key={dag} className="space-y-2">
              <div className="rounded-lg border border-border bg-card px-2 py-1.5 text-center">
                <div className="text-[11px] font-bold uppercase text-muted-foreground">{dag}</div>
                <div className="text-[10px] text-muted-foreground">{datum.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</div>
              </div>
              {lessen.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">Vrij</div>
              ) : (
                lessen.map((l, i) => (
                  <div key={i} className={`rounded-xl border border-border bg-background p-2 ${l.wijziging ? "border-warning/50" : ""}`}>
                    <div className={`mb-1 h-1 w-full rounded-full ${l.kleur}`} />
                    <div className="text-[11px] font-semibold">{l.vak}</div>
                    <div className="text-[10px] text-muted-foreground">{l.start} · Lok. {l.lokaal}</div>
                    <div className="text-[10px] text-muted-foreground">{l.docent}</div>
                    {l.wijziging && <div className="mt-1 text-[9px] font-semibold text-warning">{l.wijziging}</div>}
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
