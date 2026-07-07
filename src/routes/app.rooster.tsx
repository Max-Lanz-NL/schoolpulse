import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { roosterVandaag, weekRooster, uurNummer, lesAanwezigheid, type Les, type LesStatus } from "@/lib/demo-data";
import { useRole } from "@/lib/role-context";
import { Sparkles, AlertTriangle, X, BookOpen, MapPin, User, CheckCircle2, XCircle, ChevronLeft, ChevronRight, MessageSquare, UserX, Pencil, Trash2, Plus, Calendar as CalIcon, Grid3x3 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSwipe } from "@/hooks/use-swipe";
import { useNavigate } from "@tanstack/react-router";

const dagen = ["Ma", "Di", "Wo", "Do", "Vr"] as const;
const dagLabels: Record<string, string> = { Ma: "Maandag 6 jul", Di: "Dinsdag 7 jul", Wo: "Woensdag 8 jul", Do: "Donderdag 9 jul", Vr: "Vrijdag 10 jul" };
type DagCode = typeof dagen[number];
const isDagCode = (value: unknown): value is DagCode => typeof value === "string" && (dagen as readonly string[]).includes(value);
type AgendaType = "vergadering" | "oudergesprek" | "personeel" | "operationeel";
type AgendaItem = {
  id: string;
  dag: DagCode;
  start: string;
  eind: string;
  titel: string;
  type: AgendaType;
  locatie: string;
  deelnemers: string;
  notitie?: string;
  kleur: string;
};

const agendaTypeLabel: Record<AgendaType, string> = {
  vergadering: "Vergadering",
  oudergesprek: "Oudergesprek",
  personeel: "Personeel",
  operationeel: "Operationeel",
};

const teamleiderAgenda: AgendaItem[] = [
  { id: "tl-1", dag: "Ma", start: "08:30", eind: "09:15", titel: "Dagstart bovenbouwteam", type: "vergadering", locatie: "Kamer TL-2", deelnemers: "Mentoren V4/V5", kleur: "bg-indigo-500" },
  { id: "tl-2", dag: "Ma", start: "13:30", eind: "14:15", titel: "Verzuimoverleg weekstart", type: "operationeel", locatie: "Zorglokaal", deelnemers: "Zorgcoördinator + administratie", kleur: "bg-amber-500" },
  { id: "tl-3", dag: "Di", start: "10:30", eind: "11:15", titel: "Voortgangsgesprek ouder Emma B.", type: "oudergesprek", locatie: "Gespreksruimte 1", deelnemers: "Ouder + mentor", kleur: "bg-emerald-500" },
  { id: "tl-4", dag: "Di", start: "15:00", eind: "16:00", titel: "Sectie-overleg wiskunde", type: "vergadering", locatie: "Lokaal 204", deelnemers: "Docenten Wiskunde", kleur: "bg-blue-500" },
  { id: "tl-5", dag: "Wo", start: "09:00", eind: "10:00", titel: "MT-overleg planning toetsweek", type: "vergadering", locatie: "Bestuurskamer", deelnemers: "Directie + teamleiders", kleur: "bg-rose-500" },
  { id: "tl-6", dag: "Do", start: "11:20", eind: "12:00", titel: "Functioneringsgesprek K. Visser", type: "personeel", locatie: "Kamer TL-2", deelnemers: "K. Visser", kleur: "bg-teal-500" },
  { id: "tl-7", dag: "Vr", start: "13:00", eind: "14:00", titel: "Rooster-evaluatie week 28", type: "operationeel", locatie: "Roosterbureau", deelnemers: "Roostercoördinator", kleur: "bg-slate-500" },
];

const directieAgenda: AgendaItem[] = [
  { id: "dr-1", dag: "Ma", start: "09:00", eind: "10:00", titel: "Directieberaad weekstart", type: "vergadering", locatie: "Bestuurskamer", deelnemers: "Rector + conrectoren", kleur: "bg-slate-700" },
  { id: "dr-2", dag: "Ma", start: "14:00", eind: "14:45", titel: "Bestuurscall stichting", type: "vergadering", locatie: "Online", deelnemers: "College van bestuur", kleur: "bg-indigo-500" },
  { id: "dr-3", dag: "Di", start: "11:20", eind: "12:00", titel: "Escalatiegesprek ouder/verzorgers", type: "oudergesprek", locatie: "Gespreksruimte 3", deelnemers: "Ouder + teamleider", kleur: "bg-emerald-500" },
  { id: "dr-4", dag: "Wo", start: "08:30", eind: "09:30", titel: "Financieel overleg Q3", type: "operationeel", locatie: "Bestuurskamer", deelnemers: "Controller + administratie", kleur: "bg-amber-500" },
  { id: "dr-5", dag: "Wo", start: "13:50", eind: "14:40", titel: "Sollicitatiegesprek docent Engels", type: "personeel", locatie: "Directiekamer", deelnemers: "HR + sectiehoofd", kleur: "bg-teal-500" },
  { id: "dr-6", dag: "Do", start: "10:30", eind: "11:20", titel: "Inspectievoorbereiding dossier", type: "operationeel", locatie: "Kwaliteitskamer", deelnemers: "Kwaliteitszorgteam", kleur: "bg-rose-500" },
  { id: "dr-7", dag: "Vr", start: "12:10", eind: "13:00", titel: "MR-overleg", type: "vergadering", locatie: "Aula klein", deelnemers: "Medezeggenschapsraad", kleur: "bg-blue-500" },
];

export const Route = createFileRoute("/app/rooster")({
  validateSearch: (search: Record<string, unknown>) => ({
    dag: isDagCode(search.dag) ? search.dag : undefined,
    start: typeof search.start === "string" && search.start.trim() ? search.start : undefined,
  }),
  component: Rooster,
});

type Detail = Les & { dag?: string };

function Rooster() {
  const { role } = useRole();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const isDocent = role === "docent";
  const isManagement = role === "teamleider" || role === "directie";
  const toonAI = isManagement;
  const agendaItems = role === "directie" ? directieAgenda : teamleiderAgenda;
  const [detail, setDetail] = useState<Detail | null>(null);
  const [agendaDetail, setAgendaDetail] = useState<AgendaItem | null>(null);
  const [view, setView] = useState<"dag" | "week">("dag");
  const [aiOpen, setAiOpen] = useState(false);
  const [dagIdx, setDagIdx] = useState(1); // di default
  const [huiswerkModal, setHuiswerkModal] = useState<Detail | null>(null);
  const [absentiesLes, setAbsentiesLes] = useState<Detail | null>(null);
  const [aanwezigheidState, setAanwezigheidState] = useState<Record<string, LesStatus>>(() => {
    const s: Record<string, LesStatus> = {};
    lesAanwezigheid.default.forEach((l) => { s[l.naam] = l.status; });
    return s;
  });
  const [huiswerken, setHuiswerken] = useState<Record<string, string>>({});

  const currentDag = dagen[dagIdx];
  const dagLessen = weekRooster[currentDag] ?? roosterVandaag;
  const dagAgenda = agendaItems.filter((a) => a.dag === currentDag).sort((a, b) => a.start.localeCompare(b.start));
  const swipe = useSwipe(
    () => setDagIdx((i) => Math.min(dagen.length - 1, i + 1)),
    () => setDagIdx((i) => Math.max(0, i - 1)),
  );

  const openDetail = (l: Les, dag?: DagCode) => {
    const targetDag = dag ?? currentDag;
    const key = targetDag + l.start;
    const hw = huiswerken[key] ?? l.huiswerk;
    setDetail({ ...l, huiswerk: hw, dag: targetDag });
    navigate({
      search: (prev) => ({ ...prev, dag: targetDag, start: l.start }),
      replace: true,
    });
  };

  const closeDetail = () => {
    setDetail(null);
    navigate({
      search: (prev) => ({ ...prev, start: undefined }),
      replace: true,
    });
  };

  useEffect(() => {
    if (!search.dag) return;
    const idx = dagen.indexOf(search.dag);
    if (idx >= 0 && idx !== dagIdx) setDagIdx(idx);
  }, [dagIdx, search.dag]);

  useEffect(() => {
    if (isManagement) return;
    if (!search.start) return;
    const targetDag = search.dag ?? currentDag;
    const les = (weekRooster[targetDag] ?? []).find((l) => l.start === search.start);
    if (!les) return;
    if (detail?.start === les.start && detail?.dag === targetDag) return;
    const key = targetDag + les.start;
    const hw = huiswerken[key] ?? les.huiswerk;
    setDetail({ ...les, huiswerk: hw, dag: targetDag });
  }, [currentDag, detail?.dag, detail?.start, huiswerken, search.dag, search.start]);

  if (isManagement) {
    return (
      <AppShell title="Agenda" subtitle="Week 28 · Vergaderingen en schoolbrede overleggen">
        <div className="mb-4 flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-border bg-card p-1">
            <button onClick={() => setView("dag")} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${view === "dag" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              <CalIcon className="h-3.5 w-3.5" /> Dag
            </button>
            <button onClick={() => setView("week")} className={`hidden md:inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${view === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              <Grid3x3 className="h-3.5 w-3.5" /> Week
            </button>
          </div>
        </div>

        {view === "dag" ? (
          <Card title={dagLabels[currentDag]} action={
            <div className="flex items-center gap-1">
              <button onClick={() => setDagIdx((i) => Math.max(0, i - 1))} disabled={dagIdx === 0} className="rounded-md p-1 hover:bg-muted disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setDagIdx((i) => Math.min(dagen.length - 1, i + 1))} disabled={dagIdx === dagen.length - 1} className="rounded-md p-1 hover:bg-muted disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            </div>
          }>
            <div className="mb-3 flex gap-1 overflow-x-auto pb-1 md:hidden">
              {dagen.map((d, i) => (
                <button key={d} onClick={() => setDagIdx(i)} className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold ${i === dagIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{d}</button>
              ))}
            </div>
            <div className="hidden gap-1 md:flex">
              {dagen.map((d, i) => (
                <button key={d} onClick={() => setDagIdx(i)} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${i === dagIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{d}</button>
              ))}
            </div>

            <div className="mt-3 space-y-2 select-none" {...swipe}>
              {dagAgenda.length === 0 && <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Geen afspraken op deze dag</div>}
              {dagAgenda.map((a) => (
                <button key={a.id} onClick={() => setAgendaDetail(a)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-left hover:bg-muted/50">
                  <div className={`h-10 w-1 rounded-full ${a.kleur}`} />
                  <div className="w-20 shrink-0 text-xs font-semibold text-muted-foreground">{a.start}–{a.eind}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{a.titel}</div>
                    <div className="truncate text-xs text-muted-foreground">{agendaTypeLabel[a.type]} · {a.locatie}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-3 text-center text-[11px] text-muted-foreground md:hidden">← Swipe om van dag te wisselen →</div>
          </Card>
        ) : (
          <Card title="Weekkalender management">
            <div className="grid gap-3 md:grid-cols-5">
              {dagen.map((d) => {
                const items = agendaItems.filter((a) => a.dag === d).sort((a, b) => a.start.localeCompare(b.start));
                return (
                  <div key={d} className="rounded-xl border border-border bg-background p-3">
                    <div className="mb-2 text-xs font-semibold text-muted-foreground">{dagLabels[d]}</div>
                    <div className="space-y-2">
                      {items.length === 0 && <div className="rounded-md bg-muted p-2 text-[11px] text-muted-foreground">Geen afspraken</div>}
                      {items.map((a) => (
                        <button key={a.id} onClick={() => setAgendaDetail(a)} className="w-full rounded-md border border-border p-2 text-left hover:bg-muted/50">
                          <div className="text-[11px] font-semibold">{a.start}–{a.eind}</div>
                          <div className="mt-0.5 text-xs font-medium">{a.titel}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {agendaDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setAgendaDetail(null)}>
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className={`h-2 w-full ${agendaDetail.kleur}`} />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{dagLabels[agendaDetail.dag]} · {agendaDetail.start}–{agendaDetail.eind}</div>
                    <div className="mt-1 text-lg font-bold">{agendaDetail.titel}</div>
                  </div>
                  <button onClick={() => setAgendaDetail(null)} className="rounded-lg p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2"><CalIcon className="h-4 w-4 text-muted-foreground" /> {agendaTypeLabel[agendaDetail.type]}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {agendaDetail.locatie}</div>
                  <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> {agendaDetail.deelnemers}</div>
                  {agendaDetail.notitie && <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-foreground/90">{agendaDetail.notitie}</div>}
                </div>
                <div className="mt-5 flex justify-end">
                  <button className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-muted" onClick={() => setAgendaDetail(null)}>Sluiten</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </AppShell>
    );
  }

  return (
    <AppShell title="Rooster" subtitle="Week 28 · 6 – 10 juli 2026">
      {toonAI && (
        <div className="mb-6 flex flex-wrap items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">AI-roosteroptimalisatie actief</div>
            <div className="text-xs text-muted-foreground">Deze week zijn 3 tussenuren automatisch opgelost. Volgende suggestie: verplaats donderdag lesuur 4 naar 2 om tussenuur voor V4B te vermijden.</div>
          </div>
          <button onClick={() => setAiOpen(true)} className="shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Bekijk voorstel</button>
        </div>
      )}

      {/* Toggle */}
      <div className="mb-4 flex items-center gap-3">
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          <button onClick={() => setView("dag")} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${view === "dag" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <CalIcon className="h-3.5 w-3.5" /> Dag
          </button>
          <button onClick={() => setView("week")} className={`hidden md:inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${view === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <Grid3x3 className="h-3.5 w-3.5" /> Week
          </button>
        </div>
      </div>

      {view === "dag" ? (
        <Card title={dagLabels[currentDag]} action={
          <div className="flex items-center gap-1">
            <button onClick={() => setDagIdx((i) => Math.max(0, i - 1))} disabled={dagIdx === 0} className="rounded-md p-1 hover:bg-muted disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setDagIdx((i) => Math.min(dagen.length - 1, i + 1))} disabled={dagIdx === dagen.length - 1} className="rounded-md p-1 hover:bg-muted disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          </div>
        }>
          <div className="mb-3 flex gap-1 overflow-x-auto pb-1 md:hidden">
            {dagen.map((d, i) => (
              <button key={d} onClick={() => setDagIdx(i)} className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold ${i === dagIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{d}</button>
            ))}
          </div>
          <div className="hidden gap-1 md:flex">
            {dagen.map((d, i) => (
              <button key={d} onClick={() => setDagIdx(i)} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${i === dagIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{d}</button>
            ))}
          </div>

          <div className="mt-3 space-y-2 select-none" {...swipe}>
            {dagLessen.length === 0 && <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Geen lessen deze dag</div>}
            {dagLessen.map((l) => {
              const nr = uurNummer(l.start);
              return (
                <button key={l.start} onClick={() => openDetail(l, currentDag)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-background p-3 text-left hover:bg-muted/50">
                  <div className={`h-10 w-1 rounded-full ${l.kleur}`} />
                  <div className="w-8 shrink-0 text-center">
                    <div className="text-[10px] font-semibold uppercase text-muted-foreground">uur</div>
                    <div className="text-sm font-bold">{nr}</div>
                  </div>
                  <div className="w-24 shrink-0 text-xs text-muted-foreground">{l.tijd}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{l.vak}</div>
                    <div className="truncate text-xs text-muted-foreground">Lokaal {l.lokaal} · {l.docent}</div>
                  </div>
                  {l.wijziging && <span className="hidden sm:inline rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">{l.wijziging}</span>}
                </button>
              );
            })}
          </div>
          <div className="mt-3 text-center text-[11px] text-muted-foreground md:hidden">← Swipe om van dag te wisselen →</div>
        </Card>
      ) : (
        <Card title="Weekrooster">
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[90px_repeat(5,1fr)] gap-2">
                <div />
                {dagen.map((d) => <div key={d} className="pb-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>)}
                {[1,2,3,4,6,7,8].map((uur) => {
                  const start = { 1:"08:30",2:"09:20",3:"10:30",4:"11:20",6:"13:00",7:"13:50",8:"14:40" }[uur]!;
                  return (
                    <FragmentRow key={uur} start={start} uur={uur} onOpen={openDetail} />
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      {detail && <LesDetailModal
        detail={detail}
        isDocent={isDocent}
        selfName="M. Jansen"
        onClose={closeDetail}
        onHuiswerk={() => setHuiswerkModal(detail)}
        onAbsenties={() => setAbsentiesLes(detail)}
        onBericht={() => {
          setDetail(null);
          navigate({ to: "/app/berichten" });
        }}
      />}

      {aiOpen && <AIVoorstelModal onClose={() => setAiOpen(false)} />}

      {huiswerkModal && <HuiswerkModal
        les={huiswerkModal}
        huidig={huiswerken[(huiswerkModal.dag ?? currentDag) + huiswerkModal.start] ?? huiswerkModal.huiswerk ?? ""}
        onSave={(t) => {
          const key = (huiswerkModal.dag ?? currentDag) + huiswerkModal.start;
          setHuiswerken((s) => ({ ...s, [key]: t }));
          setHuiswerkModal(null);
          closeDetail();
        }}
        onDelete={() => {
          const key = (huiswerkModal.dag ?? currentDag) + huiswerkModal.start;
          setHuiswerken((s) => ({ ...s, [key]: "" }));
          setHuiswerkModal(null);
          closeDetail();
        }}
        onClose={() => setHuiswerkModal(null)}
      />}

      {absentiesLes && <AbsentiesModal
        les={absentiesLes}
        state={aanwezigheidState}
        onToggle={(naam) => setAanwezigheidState((s) => {
          const cur = s[naam];
          if (cur === "ziek" || cur === "afgemeld") return s;
          return { ...s, [naam]: cur === "afwezig" ? "aanwezig" : "afwezig" };
        })}
        onClose={() => setAbsentiesLes(null)}
      />}
    </AppShell>
  );
}

function FragmentRow({ start, uur, onOpen }: { start: string; uur: number; onOpen: (l: Les, d: DagCode) => void }) {
  return (
    <>
      <div className="pt-2 text-right">
        <div className="text-[10px] font-semibold text-muted-foreground">Uur {uur}</div>
        <div className="text-[11px] text-muted-foreground">{start}</div>
      </div>
      {dagen.map((d) => {
        const cell = weekRooster[d]?.find((l) => l.start === start);
        if (!cell) return <div key={d + start} className="min-h-[64px] rounded-lg bg-muted/40" />;
        return (
          <button key={d + start} onClick={() => onOpen(cell, d)}
            className={`relative min-h-[64px] rounded-lg border border-border bg-background p-2 text-left hover:border-primary/50 ${cell.wijziging ? "ring-1 ring-warning" : ""}`}>
            <div className={`absolute left-0 top-0 h-full w-1 rounded-l-lg ${cell.kleur}`} />
            <div className="pl-2 text-xs font-semibold">{cell.vak}</div>
            <div className="pl-2 text-[10px] text-muted-foreground">{cell.lokaal} · {cell.docent}</div>
            {cell.wijziging && <div className="mt-0.5 flex items-center gap-1 pl-2 text-[10px] font-semibold text-warning"><AlertTriangle className="h-2.5 w-2.5" /> {cell.wijziging}</div>}
          </button>
        );
      })}
    </>
  );
}

function LesDetailModal({ detail, isDocent, selfName, onClose, onHuiswerk, onAbsenties, onBericht }: {
  detail: Detail; isDocent: boolean; selfName: string;
  onClose: () => void; onHuiswerk: () => void; onAbsenties: () => void; onBericht: () => void;
}) {
  const nr = uurNummer(detail.start);
  const isEigenLes = isDocent && detail.docent === selfName;

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
            <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> {detail.docent}{isEigenLes && <span className="text-xs text-muted-foreground">(jij)</span>}</div>
            {detail.aanwezig !== undefined && !isDocent && (
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

          {isEigenLes && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={onHuiswerk} className="inline-flex items-center justify-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
                <Pencil className="h-3.5 w-3.5" /> Huiswerk
              </button>
              <button onClick={onAbsenties} className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
                <UserX className="h-3.5 w-3.5" /> Absenties
              </button>
            </div>
          )}

          <div className="mt-5 flex gap-2">
            {!isEigenLes && (
              <button onClick={onBericht} className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
                <MessageSquare className="h-3.5 w-3.5" /> Bericht docent
              </button>
            )}
            <button className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-muted" onClick={onClose}>Sluiten</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIVoorstelModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> <span className="text-sm font-semibold">Roosterwijzigingsvoorstel</span></div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3 p-5 text-sm">
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="text-xs font-semibold text-muted-foreground">Voorstel #1 — donderdag</div>
            <div className="mt-1">Verplaats <strong>Wiskunde B (V4B)</strong> van uur 4 (11:20) naar uur 2 (09:20) om een tussenuur op te lossen.</div>
            <div className="mt-2 text-xs text-success">Verwacht effect: −1 tussenuur voor 24 leerlingen</div>
          </div>
          <div className="rounded-xl border border-border bg-background p-3">
            <div className="text-xs font-semibold text-muted-foreground">Voorstel #2 — vrijdag</div>
            <div className="mt-1">Wissel lokaal <strong>204 → 118</strong> voor uur 3 (Scheikunde). Lokaal 204 is dubbel geboekt.</div>
            <div className="mt-2 text-xs text-primary">Automatisch conflict-vrij</div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-3">
          <button onClick={onClose} className="rounded-lg border border-border px-3 py-2 text-sm">Later beslissen</button>
          <button onClick={onClose} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Voorstel doorvoeren</button>
        </div>
      </div>
    </div>
  );
}

function HuiswerkModal({ les, huidig, onSave, onDelete, onClose }: { les: Les; huidig: string; onSave: (t: string) => void; onDelete: () => void; onClose: () => void }) {
  const [tekst, setTekst] = useState(huidig);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="text-sm font-semibold">Huiswerk — {les.vak}</div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-4">
          <textarea value={tekst} onChange={(e) => setTekst(e.target.value)} rows={4} placeholder="Beschrijf het huiswerk..."
            className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary" />
        </div>
        <div className="flex justify-between gap-2 border-t border-border p-3">
          <button onClick={onDelete} className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10">
            <Trash2 className="h-3.5 w-3.5" /> Verwijderen
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg border border-border px-3 py-2 text-sm">Annuleren</button>
            <button onClick={() => onSave(tekst)} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Opslaan</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AbsentiesModal({ les, state, onToggle, onClose }: {
  les: Les; state: Record<string, LesStatus>; onToggle: (naam: string) => void; onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <div className="text-xs text-muted-foreground">Absenties</div>
            <div className="text-sm font-semibold">{les.vak} · {les.tijd}</div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-96 divide-y divide-border overflow-y-auto">
          {lesAanwezigheid.default.map((l) => {
            const status = state[l.naam] ?? "onbekend";
            const locked = status === "ziek" || status === "afgemeld";
            const isAfw = status === "afwezig";
            return (
              <div key={l.naam} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{l.naam}</div>
                  {locked && <div className="text-[11px] text-muted-foreground">{status === "ziek" ? "Ziek gemeld" : "Afgemeld"}</div>}
                </div>
                <button
                  disabled={locked}
                  onClick={() => onToggle(l.naam)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    locked ? "cursor-not-allowed bg-muted text-muted-foreground" :
                    isAfw ? "bg-destructive text-destructive-foreground" : "border border-border hover:bg-muted"
                  }`}
                >
                  {locked ? status : isAfw ? "Absent" : "Markeer absent"}
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end border-t border-border p-3">
          <button onClick={onClose} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Opslaan</button>
        </div>
      </div>
    </div>
  );
}
