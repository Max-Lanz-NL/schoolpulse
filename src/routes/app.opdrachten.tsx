import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import type { DocentOpdracht } from "@/lib/demo-data";
import { opdrachten, docentOpdrachten, docentKlassen, klassen } from "@/lib/demo-data";
import { useRole } from "@/lib/role-context";
import type { LucideIcon } from "lucide-react";
import {
  Upload,
  ShieldAlert,
  CheckCircle2,
  Clock,
  FileCheck,
  Plus,
  Pencil,
  Trash2,
  X,
  Sparkles,
  AlertTriangle,
  Paperclip,
  BarChart3,
  Users,
  Copy,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/opdrachten")({ component: OpdrachtenPage });

function OpdrachtenPage() {
  const { role } = useRole();
  if (role === "docent") return <DocentOpdrachten />;
  if (role === "teamleider" || role === "directie") return <ManagementOpdrachten />;
  return <LeerlingOpdrachten />;
}

// ─────────── LEERLING ───────────
const statusStyle: Record<string, { label: string; cls: string }> = {
  open: { label: "Openstaand", cls: "bg-warning/15 text-warning" },
  concept: { label: "Concept", cls: "bg-muted text-muted-foreground" },
  wachtend: { label: "Wacht op beoordeling", cls: "bg-primary/10 text-primary" },
  beoordeeld: { label: "Beoordeeld", cls: "bg-success/15 text-success" },
};

function LeerlingOpdrachten() {
  const [ingeleverdState, setIngeleverdState] = useState<Record<string, { naam: string }>>({});
  const [filterVak, setFilterVak] = useState("alle");
  const [filterDeadline, setFilterDeadline] = useState("alle");
  const [filterStatus, setFilterStatus] = useState<"alle" | "open" | "afgerond">("alle");

  const vakken = Array.from(new Set(opdrachten.map((o) => o.vak)));
  const today = new Date("2026-07-05T00:00:00");
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
  const maandIndex: Record<string, number> = {
    jan: 0,
    feb: 1,
    mrt: 2,
    apr: 3,
    mei: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    okt: 9,
    nov: 10,
    dec: 11,
  };
  const parseDeadline = (deadline: string) => {
    const lower = deadline.toLowerCase();
    if (lower.includes("morgen")) {
      const d = new Date(today);
      d.setDate(d.getDate() + 1);
      return d;
    }
    const match = lower.match(/(\d{1,2})\s+([a-z]{3})/);
    if (!match) return null;
    const month = maandIndex[match[2]];
    if (month === undefined) return null;
    return new Date(2026, month, Number(match[1]));
  };
  const filtered = opdrachten.filter((o) => {
    if (filterVak !== "alle" && o.vak !== filterVak) return false;
    if (filterStatus === "open" && (o.ingeleverd || ingeleverdState[o.titel])) return false;
    if (filterStatus === "afgerond" && !(o.ingeleverd || ingeleverdState[o.titel])) return false;
    const deadlineDate = parseDeadline(o.deadline);
    if (filterDeadline === "vandaag")
      return deadlineDate ? deadlineDate.toDateString() === today.toDateString() : false;
    if (filterDeadline === "week")
      return deadlineDate ? deadlineDate >= today && deadlineDate <= endOfWeek : false;
    if (filterDeadline === "verlopen") return deadlineDate ? deadlineDate < today : false;
    return true;
  });

  return (
    <AppShell title="Opdrachten" subtitle="Digitale inlevering en beoordeling">
      <Card title="Alle opdrachten">
        <div className="mb-4 flex flex-wrap gap-2">
          <select
            value={filterVak}
            onChange={(e) => setFilterVak(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
          >
            <option value="alle">Alle vakken</option>
            {vakken.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <select
            value={filterDeadline}
            onChange={(e) => setFilterDeadline(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
          >
            <option value="alle">Alle deadlines</option>
            <option value="vandaag">Vandaag</option>
            <option value="week">Deze week</option>
            <option value="verlopen">Verlopen</option>
          </select>
          <div className="inline-flex overflow-hidden rounded-lg border border-border">
            {(["alle", "open", "afgerond"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${filterStatus === s ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                {s === "alle" ? "Alle" : s === "open" ? "Openstaand" : "Afgerond"}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {filtered.map((o) => {
            const ingel = ingeleverdState[o.titel];
            const effectiefStatus = ingel ? "wachtend" : o.status;
            const s = statusStyle[effectiefStatus] ?? statusStyle["open"];
            return (
              <div key={o.titel} className="rounded-xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{o.titel}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {o.vak} · {ingel ? "Ingeleverd" : o.deadline}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${s.cls}`}>
                      {s.label}
                    </span>
                    {effectiefStatus === "beoordeeld" && "cijfer" in o && (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                        {o.cijfer?.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                {ingel && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-xs text-success">
                    <FileCheck className="h-4 w-4" />
                    <span className="truncate font-medium">{ingel.naam}</span>
                    <span className="text-success/70">— wacht op beoordeling</span>
                  </div>
                )}
                {!o.ingeleverd && !ingel && (
                  <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 p-4">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium">Sleep een bestand hierheen of</div>
                      <div className="text-[11px] text-muted-foreground">
                        PDF, DOCX, ZIP · max 25 MB
                      </div>
                    </div>
                    <label className="cursor-pointer rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
                      Kies bestand
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIngeleverdState((prev) => ({
                              ...prev,
                              [o.titel]: { naam: file.name },
                            }));
                            toast.success(`"${file.name}" ingeleverd voor ${o.titel}`);
                          }
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </AppShell>
  );
}

// ─────────── DOCENT ───────────
type Filter = "openstaand" | "ingeleverd" | "te-laat" | "beoordeeld" | "concept" | "alle";
type DocentOpdrachtStatus = DocentOpdracht["status"] | "concept";
type DocentOpdrachtItem = Omit<DocentOpdracht, "status"> & { status: DocentOpdrachtStatus };
type OpdrachtDraft = Pick<DocentOpdrachtItem, "titel" | "vak" | "klas" | "deadline" | "weging">;
const isConceptOpdracht = (o: DocentOpdrachtItem) => o.status === "concept";

function DocentOpdrachten() {
  const [items, setItems] = useState<DocentOpdrachtItem[]>(
    docentOpdrachten as DocentOpdrachtItem[],
  );
  const [filter, setFilter] = useState<Filter>("alle");
  const [nieuwOpen, setNieuwOpen] = useState(false);
  const [bewerkId, setBewerkId] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [beoordelenId, setBeoordelenId] = useState<string | null>(null);

  const counts = {
    openstaand: items.filter((i) => i.status === "openstaand").length,
    ingeleverd: items.filter((i) => i.status === "ingeleverd").length,
    "te-laat": items.filter((i) => i.status === "te-laat").length,
    beoordeeld: items.filter((i) => i.status === "beoordeeld").length,
    concept: items.filter((i) => i.status === "concept").length,
  };
  const zichtbaar = filter === "alle" ? items : items.filter((i) => i.status === filter);
  const bewerken = bewerkId ? items.find((i) => i.id === bewerkId) : null;
  const beoordelen = beoordelenId ? items.find((i) => i.id === beoordelenId) : null;

  const saveOpdracht = (o: OpdrachtDraft) => {
    if (bewerkId) setItems((s) => s.map((i) => (i.id === bewerkId ? { ...i, ...o } : i)));
    else
      setItems((s) => [
        ...s,
        { ...o, id: `n${Date.now()}`, status: "openstaand", ingeleverd: 0, totaal: 26 },
      ]);
    setNieuwOpen(false);
    setBewerkId(null);
  };
  const saveConceptOpdracht = (o: OpdrachtDraft) => {
    setItems((s) => [
      ...s,
      { ...o, id: `c${Date.now()}`, status: "concept", ingeleverd: 0, totaal: 26 },
    ]);
    setNieuwOpen(false);
    setBewerkId(null);
    toast.success("Concept opgeslagen");
  };
  const delOpdracht = (id: string) => setItems((s) => s.filter((i) => i.id !== id));

  return (
    <AppShell title="Opdrachten" subtitle="Beheer, beoordeel en controleer opdrachten">
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <StatBtn
          active={filter === "openstaand"}
          onClick={() => setFilter(filter === "openstaand" ? "alle" : "openstaand")}
          icon={Clock}
          label="Openstaand"
          value={counts.openstaand}
          tone="warning"
        />
        <StatBtn
          active={filter === "ingeleverd"}
          onClick={() => setFilter(filter === "ingeleverd" ? "alle" : "ingeleverd")}
          icon={FileCheck}
          label="Ingeleverd"
          value={counts.ingeleverd}
        />
        <StatBtn
          active={filter === "te-laat"}
          onClick={() => setFilter(filter === "te-laat" ? "alle" : "te-laat")}
          icon={AlertTriangle}
          label="Te laat"
          value={counts["te-laat"]}
          tone="warning"
        />
        <StatBtn
          active={filter === "beoordeeld"}
          onClick={() => setFilter(filter === "beoordeeld" ? "alle" : "beoordeeld")}
          icon={CheckCircle2}
          label="Beoordeeld"
          value={counts.beoordeeld}
          tone="success"
        />
        <StatBtn
          active={filter === "concept"}
          onClick={() => setFilter(filter === "concept" ? "alle" : "concept")}
          icon={FileCheck}
          label="Concepten"
          value={counts.concept}
        />
        <button
          onClick={() => setAiOpen(true)}
          className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-left transition-all hover:border-primary hover:bg-primary/15"
        >
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="mt-3 text-xs text-muted-foreground">AI-controle</div>
          <div className="mt-1 text-sm font-bold">Starten</div>
        </button>
      </div>

      {filter === "te-laat" && (
        <Card title="Te laat ingeleverd" className="mb-6">
          {items.filter((i) => i.telaatLeerlingen?.length).length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Geen te-late inleveringen
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left">Leerling</th>
                    <th className="px-4 py-2 text-left">Opdracht</th>
                    <th className="px-4 py-2 text-right">Te laat</th>
                  </tr>
                </thead>
                <tbody>
                  {items.flatMap((o) =>
                    (o.telaatLeerlingen ?? []).map((l, i) => (
                      <tr key={o.id + i} className="border-t border-border">
                        <td className="px-4 py-3 font-medium">{l.naam}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {o.titel} · {o.klas}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">
                            {l.dagenTeLaat}d
                          </span>
                        </td>
                      </tr>
                    )),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <Card
        title="Opdrachten"
        action={
          <button
            onClick={() => setNieuwOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Nieuwe opdracht
          </button>
        }
      >
        <div className="space-y-3">
          {zichtbaar.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Geen opdrachten in "{filter}"
            </div>
          )}
          {zichtbaar.map((o) => (
            <div key={o.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{o.titel}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {o.vak} · {o.klas} · deadline {o.deadline} · weging ×{o.weging}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Ingeleverd: <strong className="text-foreground">{o.ingeleverd}</strong> /{" "}
                    {o.totaal}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                      isConceptOpdracht(o)
                        ? "bg-violet-500/15 text-violet-700"
                        : o.status === "te-laat"
                          ? "bg-warning/15 text-warning"
                          : o.status === "beoordeeld"
                            ? "bg-success/15 text-success"
                            : o.status === "ingeleverd"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {o.status}
                  </span>
                  {isConceptOpdracht(o) && (
                    <button
                      onClick={() => {
                        setItems((s) =>
                          s.map((i) =>
                            i.id === o.id ? { ...i, status: "openstaand" as const } : i,
                          ),
                        );
                        toast.success("Opdracht gepubliceerd");
                      }}
                      className="rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Publiceer
                    </button>
                  )}
                  <button
                    onClick={() => setBeoordelenId(o.id)}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  >
                    Beoordelen
                  </button>
                  <button
                    onClick={() => {
                      const kopie: DocentOpdrachtItem = {
                        ...o,
                        id: `k${Date.now()}`,
                        titel: `Kopie: ${o.titel}`,
                        status: "concept",
                      };
                      setItems((s) => [...s, kopie]);
                      toast.success("Opdracht gedupliceerd");
                    }}
                    className="rounded-md p-1.5 hover:bg-muted"
                    aria-label="Dupliceer"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setBewerkId(o.id)}
                    className="rounded-md p-1.5 hover:bg-muted"
                    aria-label="Bewerken"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => delOpdracht(o.id)}
                    className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {(nieuwOpen || bewerken) && (
        <OpdrachtModal
          init={bewerken ?? null}
          onSave={saveOpdracht}
          onSaveConcept={saveConceptOpdracht}
          onClose={() => {
            setNieuwOpen(false);
            setBewerkId(null);
          }}
        />
      )}
      {aiOpen && <AICheckModal onClose={() => setAiOpen(false)} />}
      {beoordelen && (
        <BeoordeelModal
          opdracht={beoordelen}
          leerlingenInKlas={
            docentKlassen
              .find((k) => k.klas === beoordelen.klas)
              ?.leerlingen.map((l) => l.naam) ?? [
              "Sanne de Vries",
              "Tom Bakker",
              "Julia Smit",
              "Ravi Kumar",
            ]
          }
          onSave={() => {
            setItems((s) =>
              s.map((i) => (i.id === beoordelen.id ? { ...i, status: "beoordeeld" as const } : i)),
            );
            setBeoordelenId(null);
            toast.success("Cijfers opgeslagen");
          }}
          onClose={() => setBeoordelenId(null)}
        />
      )}
    </AppShell>
  );
}

function StatBtn({
  icon: Icon,
  label,
  value,
  tone = "default",
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone?: "default" | "warning" | "success";
  active?: boolean;
  onClick?: () => void;
}) {
  const cls =
    tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-primary";
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow ${active ? "border-primary bg-primary/5" : "border-border bg-card"}`}
    >
      <div
        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ${cls}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-3 text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </button>
  );
}

function OpdrachtModal({
  init,
  onSave,
  onSaveConcept,
  onClose,
}: {
  init: DocentOpdrachtItem | null;
  onSave: (o: OpdrachtDraft) => void;
  onSaveConcept?: (o: OpdrachtDraft) => void;
  onClose: () => void;
}) {
  const [titel, setTitel] = useState(init?.titel ?? "");
  const [vak, setVak] = useState(init?.vak ?? "Wiskunde B");
  const [klas, setKlas] = useState(init?.klas ?? "V4B");
  const [deadline, setDeadline] = useState(init?.deadline ?? "");
  const [weging, setWeging] = useState(init?.weging?.toString() ?? "1");
  const [bijlage, setBijlage] = useState<string | null>(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="text-sm font-semibold">
            {init ? "Opdracht bewerken" : "Nieuwe opdracht"}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 p-4">
          <input
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            placeholder="Titel"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={vak}
              onChange={(e) => setVak(e.target.value)}
              placeholder="Vak"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <input
              value={klas}
              onChange={(e) => setKlas(e.target.value)}
              placeholder="Klas"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <input
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            placeholder="Deadline (bv. 5 dec 23:59)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Weging
            </span>
            <input
              type="number"
              min="1"
              value={weging}
              onChange={(e) => setWeging(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-3 text-sm cursor-pointer hover:bg-muted/50">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-muted-foreground">{bijlage ?? "Bijlage toevoegen"}</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => setBijlage(e.target.files?.[0]?.name ?? null)}
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-3">
          <button onClick={onClose} className="rounded-lg border border-border px-3 py-2 text-sm">
            Annuleren
          </button>
          {onSaveConcept && !init && (
            <button
              disabled={!titel}
              onClick={() =>
                onSaveConcept({ titel, vak, klas, deadline, weging: parseInt(weging) || 1 })
              }
              className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50"
            >
              Concept
            </button>
          )}
          <button
            disabled={!titel}
            onClick={() => onSave({ titel, vak, klas, deadline, weging: parseInt(weging) || 1 })}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}

function AICheckModal({ onClose }: { onClose: () => void }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const start = performance.now();
    const duur = 2200;
    let raf = 0;
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / duur);
      setProgress(Math.round(t * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDone(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">AI-controle</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-2 flex items-baseline justify-between">
            <div className="text-xs text-muted-foreground">
              {done ? "Analyse voltooid" : "Bezig met analyseren…"}
            </div>
            <div className="text-2xl font-bold tabular-nums">{progress}%</div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          {done && (
            <div className="mt-6 space-y-2 text-sm">
              <div className="rounded-lg bg-success/10 p-3 text-success">
                <ShieldAlert className="mr-2 inline h-4 w-4" /> 18 opdrachten origineel
              </div>
              <div className="rounded-lg bg-warning/10 p-3 text-warning">
                <AlertTriangle className="mr-2 inline h-4 w-4" /> 2 verdachte overeenkomsten (42% en
                38%)
              </div>
              <div className="rounded-lg bg-muted p-3 text-muted-foreground text-xs">
                AI-detectie: geen indicatie van AI-gegenereerde tekst.
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end border-t border-border p-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
          >
            {done ? "Sluiten" : "Annuleren"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BeoordeelModal({
  opdracht,
  leerlingenInKlas,
  onSave,
  onClose,
}: {
  opdracht: { titel: string; klas: string };
  leerlingenInKlas: string[];
  onSave: () => void;
  onClose: () => void;
}) {
  const [cijfers, setCijfers] = useState<Record<string, string>>({});
  const heeftCijfers = Object.values(cijfers).some(Boolean);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <div className="text-xs text-muted-foreground">Beoordelen · {opdracht.klas}</div>
            <div className="text-sm font-semibold">{opdracht.titel}</div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="divide-y divide-border">
          {leerlingenInKlas.map((l) => (
            <div key={l} className="flex items-center gap-3 p-3">
              <div className="min-w-0 flex-1 text-sm font-medium">{l}</div>
              <input
                value={cijfers[l] ?? ""}
                onChange={(e) => setCijfers((s) => ({ ...s, [l]: e.target.value }))}
                type="number"
                step="0.1"
                min="1"
                max="10"
                placeholder="-"
                className="w-20 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-right outline-none focus:border-primary"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-3">
          <button onClick={onClose} className="rounded-lg border border-border px-3 py-2 text-sm">
            Annuleren
          </button>
          <button
            onClick={onSave}
            disabled={!heeftCijfers}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            Cijfers opslaan
          </button>
        </div>
      </div>
    </div>
  );
}

function ManagementOpdrachten() {
  return (
    <AppShell title="Opdrachten" subtitle="Overzicht per klas">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Totaal openstaand</div>
          <div className="mt-1 text-2xl font-bold">
            {docentOpdrachten.filter((o) => o.status === "openstaand").length}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Beoordeeld</div>
          <div className="mt-1 text-2xl font-bold">
            {docentOpdrachten.filter((o) => o.status === "beoordeeld").length}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Te laat</div>
          <div className="mt-1 text-2xl font-bold">
            {docentOpdrachten.filter((o) => o.status === "te-laat").length}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-4 w-4" />
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Klassen actief</div>
          <div className="mt-1 text-2xl font-bold">{klassen.length}</div>
        </div>
      </div>
      <Card title="Overzicht per klas">
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">Klas</th>
                <th className="px-4 py-2 text-left">Leerlingen</th>
                <th className="px-4 py-2 text-left">Openstaand</th>
                <th className="px-4 py-2 text-left">Ingeleverd</th>
                <th className="px-4 py-2 text-left">Beoordeeld</th>
              </tr>
            </thead>
            <tbody>
              {klassen.map((k) => {
                const klasOpdrachten = docentOpdrachten.filter((o) => o.klas === k.klas);
                return (
                  <tr key={k.klas} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-semibold">{k.klas}</td>
                    <td className="px-4 py-3 text-muted-foreground">{k.leerlingen}</td>
                    <td className="px-4 py-3">
                      {klasOpdrachten.filter((o) => o.status === "openstaand").length}
                    </td>
                    <td className="px-4 py-3">
                      {klasOpdrachten.filter((o) => o.status === "ingeleverd").length}
                    </td>
                    <td className="px-4 py-3 text-success">
                      {klasOpdrachten.filter((o) => o.status === "beoordeeld").length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
