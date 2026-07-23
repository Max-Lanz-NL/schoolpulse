import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { useState } from "react";
import { Plus, X, CalendarDays, BookOpen, Sparkles, Clock3, Target } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/studieplanner")({ component: StudieplannerPage });

const VAKKEN = ["Wiskunde B", "Nederlands", "Engels", "Scheikunde", "Biologie", "Geschiedenis"];

const TOETS_KLEUREN: Record<string, string> = {
  "Wiskunde B": "bg-blue-500",
  Engels: "bg-amber-500",
  Scheikunde: "bg-emerald-500",
  Biologie: "bg-teal-500",
  Nederlands: "bg-indigo-500",
  Geschiedenis: "bg-rose-500",
};

type ToetsItem = { id: string; vak: string; datum: string; naam: string };
type DeadlineItem = { vak: string; titel: string; datum: string };
type StudieBlok = { id: string; vak: string; datum: string };

const aankomendToetsen: ToetsItem[] = [
  { id: "t1", vak: "Wiskunde B", datum: "2026-07-08", naam: "Proefwerk H5" },
  { id: "t2", vak: "Engels", datum: "2026-07-11", naam: "Reading Comprehension" },
  { id: "t3", vak: "Scheikunde", datum: "2026-07-15", naam: "SO Atomen & Molmassa" },
  { id: "t4", vak: "Biologie", datum: "2026-07-22", naam: "Toets Genetica" },
];

const deadlines: DeadlineItem[] = [
  { vak: "Nederlands", titel: "Essay: Multatuli en de moderne tijd", datum: "2026-07-10" },
  { vak: "Engels", titel: "Book report — 1984", datum: "2026-07-13" },
];

function addDays(iso: string, n: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function buildCalCells() {
  // July 1 2026 = Tuesday; with Mon-first: startIndex=1, so Monday June 30 is the start
  const firstMonday = "2026-06-30";
  return Array.from({ length: 35 }, (_, i) => {
    const iso = addDays(firstMonday, i);
    const d = new Date(iso);
    return { iso, day: d.getDate(), inMonth: d.getMonth() === 6 };
  });
}

const calCells = buildCalCells();
const dagHeaders = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];

function StudieplannerPage() {
  const [extraBlokken, setExtraBlokken] = useState<StudieBlok[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ vak: VAKKEN[0], datum: "" });

  const suggesties = new Set<string>();
  aankomendToetsen.forEach((t) => {
    for (let d = 1; d <= 3; d++) suggesties.add(addDays(t.datum, -d));
  });

  const userBlokDates = new Set(extraBlokken.map((b) => b.datum));

  const toetsenByDate: Record<string, ToetsItem[]> = {};
  aankomendToetsen.forEach((t) => {
    (toetsenByDate[t.datum] ??= []).push(t);
  });

  const deadlinesByDate: Record<string, DeadlineItem[]> = {};
  deadlines.forEach((d) => {
    (deadlinesByDate[d.datum] ??= []).push(d);
  });

  const addBlok = () => {
    if (!form.datum) {
      toast.error("Kies een datum");
      return;
    }
    setExtraBlokken((prev) => [
      ...prev,
      { id: `sb${Date.now()}`, vak: form.vak, datum: form.datum },
    ]);
    setModalOpen(false);
    setForm({ vak: VAKKEN[0], datum: "" });
    toast.success(`Studieblok ${form.vak} toegevoegd`);
  };

  const aankomend = [...aankomendToetsen]
    .sort((a, b) => a.datum.localeCompare(b.datum))
    .filter((t) => t.datum >= "2026-07-01");

  return (
    <AppShell title="Studieplanner" subtitle="Plan je studiemomenten en toetsvoorbereiding">
      <div className="mb-6 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card to-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Slim plannen
            </div>
            <h2 className="mt-3 text-2xl font-bold">Rust in je toetsweek</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Toetsen, deadlines en aanbevolen studiemomenten staan in één overzicht.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: CalendarDays, value: aankomend.length, label: "toetsen" },
              { icon: Clock3, value: extraBlokken.length, label: "blokken" },
              { icon: Target, value: deadlines.length, label: "deadlines" },
            ].map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="min-w-20 rounded-2xl border border-border/70 bg-background/80 p-3 text-center"
              >
                <Icon className="mx-auto h-4 w-4 text-primary" />
                <div className="mt-1 text-lg font-bold">{value}</div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Kalender */}
        <Card
          title="Juli 2026"
          action={
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              <Plus className="h-3.5 w-3.5" /> Studieblok
            </button>
          }
        >
          {/* Day headers */}
          <div className="mb-1 grid grid-cols-7 gap-1">
            {dagHeaders.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] font-semibold uppercase text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calCells.map((cell) => {
              const isToets = !!toetsenByDate[cell.iso];
              const isDeadline = !!deadlinesByDate[cell.iso];
              const isSuggestie = suggesties.has(cell.iso) && !isToets;
              const isUserBlok = userBlokDates.has(cell.iso);
              const isToday = cell.iso === "2026-07-05";

              let bg = "";
              if (!cell.inMonth) bg = "";
              else if (isToets) bg = "bg-destructive/20";
              else if (isUserBlok) bg = "bg-primary/20";
              else if (isSuggestie) bg = "bg-blue-100 dark:bg-blue-950/40";

              const userBlokken = extraBlokken.filter((b) => b.datum === cell.iso);

              return (
                <div
                  key={cell.iso}
                  className={`min-h-[56px] rounded-lg p-1 ${bg} ${!cell.inMonth ? "opacity-30" : ""} border border-border`}
                >
                  <div
                    className={`text-[11px] font-semibold ${isToday ? "text-primary" : cell.inMonth ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {cell.day}
                  </div>
                  {(toetsenByDate[cell.iso] ?? []).map((t) => (
                    <div
                      key={t.id}
                      className={`mt-0.5 rounded px-1 py-0.5 text-[9px] font-semibold text-white ${TOETS_KLEUREN[t.vak] ?? "bg-primary"} leading-tight`}
                      title={t.naam}
                    >
                      {t.vak.slice(0, 4)}
                    </div>
                  ))}
                  {(deadlinesByDate[cell.iso] ?? []).map((dl, i) => (
                    <div
                      key={i}
                      className="mt-0.5 rounded bg-warning/20 px-1 py-0.5 text-[9px] font-semibold text-warning leading-tight"
                      title={dl.titel}
                    >
                      {dl.vak.slice(0, 3)}
                    </div>
                  ))}
                  {userBlokken.map((b) => (
                    <div
                      key={b.id}
                      className="mt-0.5 rounded bg-primary/30 px-1 py-0.5 text-[9px] font-semibold text-primary leading-tight"
                    >
                      {b.vak.slice(0, 4)}
                    </div>
                  ))}
                  {isSuggestie && !userBlokDates.has(cell.iso) && cell.inMonth && (
                    <div className="mt-0.5 text-[9px] text-blue-500">studeer</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-destructive/20" /> Toets
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-warning/20" /> Deadline
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-blue-100 dark:bg-blue-950/40" /> Aangeraden
              studiedag
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded bg-primary/20" /> Mijn studieblok
            </span>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card title="Aankomende toetsen">
            <div className="space-y-2">
              {aankomend.map((t) => {
                const d = new Date(t.datum);
                const dag = d.toLocaleDateString("nl-NL", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                });
                return (
                  <div key={t.id} className="rounded-lg border border-border bg-background p-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${TOETS_KLEUREN[t.vak] ?? "bg-primary"}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold">{t.naam}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {t.vak} · {dag}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Deadlines">
            <div className="space-y-2">
              {deadlines.map((dl, i) => {
                const d = new Date(dl.datum);
                const dag = d.toLocaleDateString("nl-NL", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                });
                return (
                  <div key={i} className="rounded-lg border border-border bg-background p-2.5">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 shrink-0 text-warning" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold">{dl.titel}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {dl.vak} · {dag}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {extraBlokken.length > 0 && (
            <Card title="Mijn studieblokken">
              <div className="space-y-1">
                {extraBlokken.map((b) => {
                  const d = new Date(b.datum);
                  const dag = d.toLocaleDateString("nl-NL", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  });
                  return (
                    <div
                      key={b.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-background px-2.5 py-2"
                    >
                      <div>
                        <div className="text-xs font-semibold">{b.vak}</div>
                        <div className="text-[10px] text-muted-foreground">{dag}</div>
                      </div>
                      <button
                        onClick={() => setExtraBlokken((prev) => prev.filter((x) => x.id !== b.id))}
                        className="rounded p-0.5 hover:bg-muted"
                      >
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <div className="rounded-2xl border border-border bg-card p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              Tip: Studeer 2-3 dagen voor een toets voor het beste resultaat.
            </div>
          </div>
        </div>
      </div>

      {/* Add studieblok modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="text-sm font-semibold">Studieblok toevoegen</div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Vak
                </span>
                <select
                  value={form.vak}
                  onChange={(e) => setForm((f) => ({ ...f, vak: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {VAKKEN.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Datum
                </span>
                <input
                  type="date"
                  value={form.datum}
                  min="2026-07-01"
                  max="2026-07-31"
                  onChange={(e) => setForm((f) => ({ ...f, datum: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-border p-3">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              >
                Annuleren
              </button>
              <button
                onClick={addBlok}
                disabled={!form.datum}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                Toevoegen
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
