import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { personeel } from "@/lib/demo-data";
import { useRole } from "@/lib/role-context";
import { useState } from "react";
import { toast } from "sonner";
import {
  Users,
  UserCheck,
  UserX,
  X,
  Briefcase,
  Search,
  MessageSquare,
  FileText,
} from "lucide-react";

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

  return <PersoneelView role={role} />;
}

function PersoneelView({ role }: { role: "teamleider" | "directie" }) {
  const [filter, setFilter] = useState<"alle" | "aanwezig" | "afwezig">("alle");
  const [zoek, setZoek] = useState("");
  const [afdeling, setAfdeling] = useState("alle");
  const [geselecteerd, setGeselecteerd] = useState<(typeof personeel)[number] | null>(null);
  const [verlofStatus, setVerlofStatus] = useState<Record<string, string>>({
    p3: "Openstaand",
    p6: "Openstaand",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [verlofForm, setVerlofForm] = useState({ van: "", tot: "", reden: "" });

  const totaal = personeel.length;
  const aanwezig = personeel.filter((p) => p.aanwezig).length;
  const afwezig = personeel.filter((p) => !p.aanwezig).length;

  const afdelingVoor = (p: (typeof personeel)[number]) =>
    p.vakken.some((v) => ["Wiskunde A", "Wiskunde B", "Scheikunde", "Biologie"].includes(v))
      ? "Bèta"
      : p.vakken.some((v) => ["Nederlands", "Engels"].includes(v))
        ? "Talen"
        : "Mens & maatschappij";
  const filtered = personeel.filter((p) => {
    if (filter !== "alle" && (filter === "aanwezig") !== p.aanwezig) return false;
    if (
      zoek &&
      !`${p.naam} ${p.rol} ${p.vakken.join(" ")}`.toLowerCase().includes(zoek.toLowerCase())
    )
      return false;
    return afdeling === "alle" || afdelingVoor(p) === afdeling;
  });

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
        <div className="relative min-w-52 flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            placeholder="Zoek medewerker..."
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-xs"
          />
        </div>
        <select
          value={afdeling}
          onChange={(e) => setAfdeling(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-xs"
        >
          <option value="alle">Alle afdelingen</option>
          <option>Bèta</option>
          <option>Talen</option>
          <option>Mens & maatschappij</option>
        </select>
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
                <tr
                  key={p.id}
                  onClick={() => setGeselecteerd(p)}
                  className="cursor-pointer text-xs hover:bg-muted/40"
                >
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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Verlofaanvragen">
          <div className="space-y-2">
            {personeel
              .filter((p) => !p.aanwezig)
              .map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border p-3 text-xs"
                >
                  <div>
                    <strong>{p.naam}</strong>
                    <div className="text-muted-foreground">{p.verlof ?? "Verlof"} · 8–10 juli</div>
                  </div>
                  <div className="flex gap-1">
                    {role === "directie" && verlofStatus[p.id] === "Openstaand" ? (
                      <>
                        <button
                          onClick={() => setVerlofStatus((s) => ({ ...s, [p.id]: "Goedgekeurd" }))}
                          className="rounded bg-success px-2 py-1 text-white"
                        >
                          Goedkeuren
                        </button>
                        <button
                          onClick={() => setVerlofStatus((s) => ({ ...s, [p.id]: "Afgewezen" }))}
                          className="rounded border px-2 py-1"
                        >
                          Afwijzen
                        </button>
                      </>
                    ) : (
                      <span className="rounded bg-muted px-2 py-1">
                        {verlofStatus[p.id] ?? "In behandeling"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </Card>
        <Card title={role === "directie" ? "Formatie & vacatures" : "Afdelingstaken"}>
          <div className="space-y-2 text-xs">
            {(role === "directie"
              ? [
                  "Vacature docent Nederlands · 0,8 fte",
                  "Aanstelling onderwijsassistent · in controle",
                  "Formatie 2026-2027 · 94% ingevuld",
                ]
              : [
                  "Toetsplanning periode 2 · Linda de Boer",
                  "Mentoraat V4A · Mark Jansen",
                  "Projectweek · Karin Visser",
                ]
            ).map((x) => (
              <div key={x} className="flex justify-between rounded-xl border p-3">
                <span>{x}</span>
                <button
                  onClick={() => toast.success("Onderdeel geopend")}
                  className="font-semibold text-primary"
                >
                  Beheren
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

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
      {geselecteerd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setGeselecteerd(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border bg-card p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold">{geselecteerd.naam}</h3>
                <p className="text-xs text-muted-foreground">
                  {geselecteerd.rol} · {afdelingVoor(geselecteerd)}
                </p>
              </div>
              <button onClick={() => setGeselecteerd(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              {[
                ["Vakken", geselecteerd.vakken.join(", ") || "Management"],
                ["Uren", `${geselecteerd.uren} per week`],
                [
                  "Beschikbaarheid",
                  geselecteerd.aanwezig
                    ? "Vandaag beschikbaar"
                    : (geselecteerd.verlof ?? "Afwezig"),
                ],
                ["Klassen", "V4A, V4B, V5A"],
                ["Rooster", "18 lessen · 3 tussenuren"],
                ["Beoordeling", "Voortgangsgesprek 18 sep"],
              ].map(([l, v]) => (
                <div key={l} className="rounded-xl bg-muted/50 p-3">
                  <div className="text-muted-foreground">{l}</div>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => toast.success(`Bericht aan ${geselecteerd.naam} geopend`)}
                className="inline-flex gap-1 rounded-lg bg-primary px-3 py-2 text-xs text-primary-foreground"
              >
                <MessageSquare className="h-3 w-3" />
                Contact
              </button>
              <button
                onClick={() => toast.success("Personeelsdocumenten geopend")}
                className="inline-flex gap-1 rounded-lg border px-3 py-2 text-xs"
              >
                <FileText className="h-3 w-3" />
                Documenten
              </button>
              <button
                onClick={() => toast.success("Gesprek ingepland")}
                className="rounded-lg border px-3 py-2 text-xs"
              >
                Gesprek / beoordeling
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
