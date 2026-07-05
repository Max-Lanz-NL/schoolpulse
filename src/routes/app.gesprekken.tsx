import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { gesprekken as gesprekkenData, type Gesprek } from "@/lib/demo-data";
import { useRole } from "@/lib/role-context";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Clock, User, Plus, X } from "lucide-react";

export const Route = createFileRoute("/app/gesprekken")({ component: GesprekkenPage });

function GesprekkenPage() {
  const { role } = useRole();
  const [gesprekken, setGesprekken] = useState<Gesprek[]>(() => JSON.parse(JSON.stringify(gesprekkenData)));
  const [tab, setTab] = useState<"gepland" | "beschikbaar" | "afgerond">("gepland");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ datum: "", tijd: "", onderwerp: "" });

  const gepland = gesprekken.filter((g) => g.status === "gepland");
  const beschikbaar = gesprekken.filter((g) => g.status === "beschikbaar");
  const afgerond = gesprekken.filter((g) => g.status === "afgerond");

  const boekTijdslot = (id: string) => {
    setGesprekken((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, status: "gepland" as const, onderwerp: "Nieuw gesprek — te bevestigen" }
          : g,
      ),
    );
    toast.success("Tijdslot geboekt! Je ontvangt een bevestiging.");
  };

  const annuleer = (id: string) => {
    setGesprekken((prev) => prev.filter((g) => g.id !== id));
    toast.success("Gesprek geannuleerd");
  };

  const addTijdslot = () => {
    if (!form.datum || !form.tijd) {
      toast.error("Vul datum en tijd in");
      return;
    }
    const nieuw: Gesprek = {
      id: `g${Date.now()}`,
      type: "mentor",
      datum: form.datum,
      tijd: form.tijd,
      persoon: "Jij",
      onderwerp: form.onderwerp || "Nieuw tijdslot",
      status: "beschikbaar",
    };
    setGesprekken((prev) => [...prev, nieuw]);
    setForm({ datum: "", tijd: "", onderwerp: "" });
    setModalOpen(false);
    toast.success("Tijdslot aangeboden");
  };

  return (
    <AppShell title="Gesprekken" subtitle="Mentorgesprekken en ouderavonden">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          {([
            ["gepland", `Gepland (${gepland.length})`],
            ["beschikbaar", `Beschikbaar (${beschikbaar.length})`],
            ["afgerond", "Afgerond"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${tab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {(role === "docent" || role === "teamleider") && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> Tijdslot aanbieden
          </button>
        )}
      </div>

      {tab === "gepland" && (
        <Card title="Geplande gesprekken">
          <div className="space-y-3">
            {gepland.length === 0 ? (
              <EmptyState label="Geen geplande gesprekken" />
            ) : gepland.map((g) => (
              <GesprekKaart key={g.id} gesprek={g} onAction={() => annuleer(g.id)} actionLabel="Annuleren" actionCls="text-destructive hover:bg-destructive/10" />
            ))}
          </div>
        </Card>
      )}

      {tab === "beschikbaar" && (
        <Card title="Beschikbare tijdsloten">
          <div className="space-y-3">
            {beschikbaar.length === 0 ? (
              <EmptyState label="Geen beschikbare tijdsloten" />
            ) : beschikbaar.map((g) => (
              <GesprekKaart key={g.id} gesprek={g} onAction={() => boekTijdslot(g.id)} actionLabel="Boek dit tijdslot" actionCls="bg-primary text-primary-foreground" />
            ))}
          </div>
        </Card>
      )}

      {tab === "afgerond" && (
        <Card title="Afgeronde gesprekken">
          <div className="space-y-3 opacity-70">
            {afgerond.length === 0 ? (
              <EmptyState label="Geen afgeronde gesprekken" />
            ) : afgerond.map((g) => (
              <GesprekKaart key={g.id} gesprek={g} />
            ))}
          </div>
        </Card>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="text-sm font-semibold">Nieuw tijdslot aanbieden</div>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3 p-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Datum</span>
                  <input type="date" value={form.datum} onChange={(e) => setForm((f) => ({ ...f, datum: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tijd</span>
                  <input type="time" value={form.tijd} onChange={(e) => setForm((f) => ({ ...f, tijd: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Onderwerp (optioneel)</span>
                <input value={form.onderwerp} onChange={(e) => setForm((f) => ({ ...f, onderwerp: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Bijv. Voortgangsgesprek" />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-border p-3">
              <button onClick={() => setModalOpen(false)} className="rounded-lg border border-border px-3 py-2 text-sm">Annuleren</button>
              <button onClick={addTijdslot} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Aanbieden</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function GesprekKaart({ gesprek, onAction, actionLabel, actionCls }: { gesprek: Gesprek; onAction?: () => void; actionLabel?: string; actionCls?: string }) {
  const typeLabels = { mentor: "Mentorgesprek", ouder: "Oudergesprek", teamleider: "Teamleidergesprek" };
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">{gesprek.onderwerp}</div>
            <div className="text-xs text-muted-foreground">{typeLabels[gesprek.type]} · {gesprek.persoon}</div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {gesprek.datum}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {gesprek.tijd}</span>
            </div>
          </div>
        </div>
        {onAction && actionLabel && (
          <button
            onClick={onAction}
            className={`rounded-lg border border-border px-3 py-1.5 text-xs font-semibold ${actionCls ?? ""}`}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}
