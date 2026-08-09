import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { huiswerk as huiswerkData, type HuiswerkItem } from "@/lib/demo-data";
import { useState } from "react";
import { Plus, X, BookOpen, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/huiswerk")({ component: HuiswerkPage });

const vakken = [
  "Wiskunde B",
  "Nederlands",
  "Engels",
  "Scheikunde",
  "Biologie",
  "Geschiedenis",
  "Aardrijkskunde",
];

function HuiswerkPage() {
  const [items, setItems] = useState<HuiswerkItem[]>(() =>
    JSON.parse(JSON.stringify(huiswerkData)),
  );
  const [tab, setTab] = useState<"alles" | "open" | "afgerond">("alles");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    vak: vakken[0],
    omschrijving: "",
    deadline: "",
    prioriteit: "normaal" as "hoog" | "normaal",
  });

  const toggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, afgerond: !item.afgerond };
        if (next.afgerond) toast.success(`${item.vak} — gemarkeerd als afgerond`);
        return next;
      }),
    );
  };

  const addItem = () => {
    if (!form.omschrijving.trim() || !form.deadline) {
      toast.error("Vul alle verplichte velden in");
      return;
    }
    const nieuw: HuiswerkItem = {
      id: `hw${Date.now()}`,
      vak: form.vak,
      omschrijving: form.omschrijving.trim(),
      deadline: form.deadline,
      afgerond: false,
      prioriteit: form.prioriteit,
    };
    setItems((prev) => [nieuw, ...prev]);
    setForm({ vak: vakken[0], omschrijving: "", deadline: "", prioriteit: "normaal" });
    setModalOpen(false);
    toast.success("Huiswerkitem toegevoegd");
  };

  const filtered = items.filter((i) =>
    tab === "alles" ? true : tab === "open" ? !i.afgerond : i.afgerond,
  );

  const openCount = items.filter((i) => !i.afgerond).length;

  return (
    <AppShell title="Huiswerk" subtitle="Dagelijkse taakoverzicht">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          {(["alles", "open", "afgerond"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t === "alles" ? "Alles" : t === "open" ? `Open (${openCount})` : "Afgerond"}
            </button>
          ))}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> Voeg toe
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/40" />
          <div className="text-sm font-semibold text-muted-foreground">
            {tab === "afgerond" ? "Nog niets afgerond" : "Alles klaar! 🎉"}
          </div>
          {tab !== "afgerond" && (
            <div className="text-xs text-muted-foreground">Je hebt geen openstaand huiswerk.</div>
          )}
        </div>
      ) : (
        <Card title="Huiswerk overzicht">
          <div className="space-y-2">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 rounded-xl border border-border bg-background p-3 transition-opacity ${item.afgerond ? "opacity-60" : ""}`}
              >
                <button
                  onClick={() => toggle(item.id)}
                  className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary"
                  aria-label="Toggle afgerond"
                >
                  {item.afgerond ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-semibold ${item.afgerond ? "line-through" : ""}`}>
                    {item.omschrijving}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {item.vak} · Deadline: {item.deadline}
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.prioriteit === "hoog" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}
                >
                  {item.prioriteit === "hoog" ? "Hoog" : "Normaal"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="text-sm font-semibold">Huiswerk toevoegen</div>
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
                  {vakken.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Omschrijving
                </span>
                <textarea
                  value={form.omschrijving}
                  onChange={(e) => setForm((f) => ({ ...f, omschrijving: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Bijv. Maak opgave 1 t/m 5"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Deadline
                  </span>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Prioriteit
                  </span>
                  <select
                    value={form.prioriteit}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, prioriteit: e.target.value as "hoog" | "normaal" }))
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="normaal">Normaal</option>
                    <option value="hoog">Hoog</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border p-3">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              >
                Annuleren
              </button>
              <button
                onClick={addItem}
                disabled={!form.omschrijving.trim() || !form.deadline}
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
