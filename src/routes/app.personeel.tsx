import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { personeel } from "@/lib/demo-data";
import { useRole } from "@/lib/role-context";
import { useState } from "react";
import { toast } from "sonner";
import { Users, UserCheck, UserX, X, Briefcase } from "lucide-react";

export const Route = createFileRoute("/app/personeel")({ component: PersoneelPage });

function PersoneelPage() {
  const { role } = useRole();

  if (role !== "directie" && role !== "teamleider") {
    return (
      <AppShell title="Personeel" subtitle="Bezetting en taakbelasting">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="text-sm font-semibold text-muted-foreground">
            Niet beschikbaar voor jouw rol.
          </div>
        </div>
      </AppShell>
    );
  }

  return <PersoneelView />;
}

function PersoneelView() {
  const [filter, setFilter] = useState<"alle" | "aanwezig" | "afwezig">("alle");
  const [modalOpen, setModalOpen] = useState(false);
  const [verlofForm, setVerlofForm] = useState({ van: "", tot: "", reden: "" });

  const totaal = personeel.length;
  const aanwezig = personeel.filter((p) => p.aanwezig).length;
  const afwezig = personeel.filter((p) => !p.aanwezig).length;

  const filtered = personeel.filter((p) =>
    filter === "alle" ? true : filter === "aanwezig" ? p.aanwezig : !p.aanwezig,
  );

  const submitVerlof = () => {
    if (!verlofForm.van || !verlofForm.tot) {
      toast.error("Vul alle datums in");
      return;
    }
    toast.success("Verlofaanvraag ingediend!", {
      description: `Van ${verlofForm.van} t/m ${verlofForm.tot}`,
    });
    setModalOpen(false);
    setVerlofForm({ van: "", tot: "", reden: "" });
  };

  return (
    <AppShell title="Personeel" subtitle="Bezetting en taakbelasting">
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-4 w-4" />
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Totaal docenten</div>
          <div className="mt-1 text-2xl font-bold">{totaal}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
            <UserCheck className="h-4 w-4" />
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Aanwezig vandaag</div>
          <div className="mt-1 text-2xl font-bold">{aanwezig}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <UserX className="h-4 w-4" />
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Afwezig / Verlof</div>
          <div className="mt-1 text-2xl font-bold">{afwezig}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <Briefcase className="h-4 w-4" />
          </div>
          <div className="mt-3 text-xs text-muted-foreground">Openstaand verlof</div>
          <div className="mt-1 text-2xl font-bold">2</div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          {(["alle", "aanwezig", "afwezig"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f === "alle" ? "Alle" : f === "aanwezig" ? "Aanwezig" : "Afwezig/Verlof"}
            </button>
          ))}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
        >
          Verlof aanvragen
        </button>
      </div>

      <Card title="Personeelsoverzicht">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 pr-4">Naam</th>
                <th className="pb-2 pr-4">Rol</th>
                <th className="hidden pb-2 pr-4 sm:table-cell">Vakken</th>
                <th className="pb-2 pr-4">Uren/week</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="text-xs">
                  <td className="py-2.5 pr-4 font-semibold">{p.naam}</td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{p.rol}</td>
                  <td className="hidden py-2.5 pr-4 text-muted-foreground sm:table-cell">
                    {p.vakken.slice(0, 2).join(", ") || "—"}
                  </td>
                  <td className="py-2.5 pr-4">{p.uren}</td>
                  <td className="py-2.5">
                    {p.aanwezig ? (
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                        Aanwezig
                      </span>
                    ) : (
                      <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                        {p.verlof ?? "Afwezig"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

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
              <div className="text-sm font-semibold">Verlofaanvraag</div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Van
                  </span>
                  <input
                    type="date"
                    value={verlofForm.van}
                    onChange={(e) => setVerlofForm((f) => ({ ...f, van: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Tot
                  </span>
                  <input
                    type="date"
                    value={verlofForm.tot}
                    onChange={(e) => setVerlofForm((f) => ({ ...f, tot: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Reden
                </span>
                <textarea
                  rows={3}
                  value={verlofForm.reden}
                  onChange={(e) => setVerlofForm((f) => ({ ...f, reden: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Reden voor verlof..."
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
                onClick={submitVerlof}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
              >
                Indienen
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
