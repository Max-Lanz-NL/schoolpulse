import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { useRole } from "@/lib/role-context";
import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/app/absentie")({ component: AbsentiePage });

const redenen = [
  "Ziek",
  "Doktersbezoek",
  "Tandartsbezoek",
  "Familieomstandigheden",
  "Sport/Muziek",
  "Overig",
];

const eerdereMeldingen = [
  {
    datum: "Ma 30 jun",
    kind: "Sanne de Vries",
    reden: "Ziek",
    toelichting: "Koorts en keelpijn",
    status: "Goedgekeurd",
  },
  {
    datum: "Wo 18 jun",
    kind: "Sanne de Vries",
    reden: "Doktersbezoek",
    toelichting: "Controle orthopeed",
    status: "Goedgekeurd",
  },
  {
    datum: "Vr 6 jun",
    kind: "Sanne de Vries",
    reden: "Sport/Muziek",
    toelichting: "Regionaal kampioenschap zwemmen",
    status: "In behandeling",
  },
];

function AbsentiePage() {
  const { role } = useRole();

  if (role !== "ouder") {
    return (
      <AppShell title="Absentie melden" subtitle="Meld een ziekmelding of verlofaanvraag">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
          <div className="text-sm font-semibold">Niet beschikbaar</div>
          <div className="text-xs text-muted-foreground">
            Deze pagina is alleen beschikbaar voor ouders.
          </div>
        </div>
      </AppShell>
    );
  }

  return <AbsentieFormulier />;
}

function AbsentieFormulier() {
  const vandaag = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    datum: vandaag,
    tijdVan: "08:30",
    tijdTot: "15:30",
    reden: redenen[0],
    toelichting: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Absentie gemeld!", {
      description: `${form.reden} op ${form.datum} is doorgegeven aan school.`,
    });
    setForm({
      datum: vandaag,
      tijdVan: "08:30",
      tijdTot: "15:30",
      reden: redenen[0],
      toelichting: "",
    });
  };

  return (
    <AppShell title="Absentie melden" subtitle="Meld een ziekmelding of verlofaanvraag">
      <div className="max-w-lg">
        <Card title="Nieuwe melding">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Kind
              </span>
              <input
                disabled
                value="Sanne de Vries (V4B)"
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Datum
              </span>
              <input
                type="date"
                value={form.datum}
                onChange={(e) => setForm((f) => ({ ...f, datum: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tijdstip van
                </span>
                <input
                  type="time"
                  value={form.tijdVan}
                  onChange={(e) => setForm((f) => ({ ...f, tijdVan: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tijdstip tot
                </span>
                <input
                  type="time"
                  value={form.tijdTot}
                  onChange={(e) => setForm((f) => ({ ...f, tijdTot: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Reden
              </span>
              <select
                value={form.reden}
                onChange={(e) => setForm((f) => ({ ...f, reden: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                {redenen.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Toelichting{" "}
                <span className="font-normal normal-case text-muted-foreground">(optioneel)</span>
              </span>
              <textarea
                rows={3}
                value={form.toelichting}
                onChange={(e) => setForm((f) => ({ ...f, toelichting: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="Aanvullende informatie..."
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Melden
            </button>
          </form>
        </Card>

        <div className="mt-6">
          <Card title="Eerder gemeld">
            <div className="space-y-2">
              {eerdereMeldingen.map((m, i) => (
                <div key={i} className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{m.reden}</div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${m.status === "Goedgekeurd" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {m.datum} · {m.toelichting}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
