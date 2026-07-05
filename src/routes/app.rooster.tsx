import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { roosterVandaag, weekRooster, uurNummer, lesAanwezigheid, type Les, type LesStatus } from "@/lib/demo-data";
import { useRole } from "@/lib/role-context";
import { Sparkles, AlertTriangle, X, BookOpen, MapPin, User, CheckCircle2, XCircle, ChevronLeft, ChevronRight, MessageSquare, UserX, Pencil, Trash2, Plus, Calendar as CalIcon, Grid3x3 } from "lucide-react";
import { useState } from "react";
import { useSwipe } from "@/hooks/use-swipe";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app/rooster")({ component: Rooster });

const dagen = ["Ma", "Di", "Wo", "Do", "Vr"] as const;
const dagLabels: Record<string, string> = { Ma: "Maandag 6 jul", Di: "Dinsdag 7 jul", Wo: "Woensdag 8 jul", Do: "Donderdag 9 jul", Vr: "Vrijdag 10 jul" };

type Detail = Les & { dag?: string };

function Rooster() {
  const { role } = useRole();
  const navigate = useNavigate();
  const isDocent = role === "docent";
  const toonAI = role === "teamleider" || role === "directie";
  const [detail, setDetail] = useState<Detail | null>(null);
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
  const swipe = useSwipe(
    () => setDagIdx((i) => Math.min(dagen.length - 1, i + 1)),
    () => setDagIdx((i) => Math.max(0, i - 1)),
  );

  const openDetail = (l: Les, dag?: string) => {
    const key = (dag ?? currentDag) + l.start;
    const hw = huiswerken[key] ?? l.huiswerk;
    setDetail({ ...l, huiswerk: hw, dag });
  };

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
        onClose={() => setDetail(null)}
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
          setDetail(null);
        }}
        onDelete={() => {
          const key = (huiswerkModal.dag ?? currentDag) + huiswerkModal.start;
          setHuiswerken((s) => ({ ...s, [key]: "" }));
          setHuiswerkModal(null);
          setDetail(null);
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

function FragmentRow({ start, uur, onOpen }: { start: string; uur: number; onOpen: (l: Les, d: string) => void }) {
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
            <div className="mt-2 text-xs text-success">Verwacht effect: −1 tussenuur voor 26 leerlingen</div>
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
