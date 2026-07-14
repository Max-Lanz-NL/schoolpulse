import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { useRole } from "@/lib/role-context";
import {
  roleUsers,
  roosterVandaag,
  cijfers,
  opdrachten,
  meldingen,
  docentMeldingen,
  docentOpdrachten,
  docentKlassen,
  klassen,
  roleLabels,
  weekRooster,
  personeel,
  ouderBerichten,
} from "@/lib/demo-data";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  BarChart3,
  MessageSquare,
  FileCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Search,
  Download,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/")({ component: Dashboard });

function Dashboard() {
  const { role } = useRole();
  const user = roleUsers[role];
  const greeting = `Welkom terug, ${user.name.split(" ")[0]}`;
  const subtitle = `${roleLabels[role]} · ${user.sub}`;

  return (
    <AppShell title={greeting} subtitle={subtitle}>
      {role === "leerling" && <LeerlingView />}
      {role === "docent" && <DocentView />}
      {role === "ouder" && <OuderView />}
      {role === "teamleider" && <TeamleiderView />}
      {role === "directie" && <DirectieView />}
    </AppShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
  to,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "warning";
  to?: string;
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : "text-muted-foreground";
  const content = (
    <>
      <div className="flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-4 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
      {hint && <div className={`mt-1 text-xs ${toneClass}`}>{hint}</div>}
    </>
  );
  const cls =
    "block rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-elegant)]";
  if (to)
    return (
      <Link to={to} className={cls}>
        {content}
      </Link>
    );
  return <div className="rounded-2xl border border-border bg-card p-5">{content}</div>;
}

function LeerlingView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          to="/app/cijfers"
          icon={BarChart3}
          label="Gemiddelde"
          value="7.4"
          hint="+0.3 t.o.v. vorige periode"
          tone="success"
        />
        <StatCard
          to="/app/rooster"
          icon={Calendar}
          label="Lessen vandaag"
          value="6"
          hint="1 wijziging"
          tone="warning"
        />
        <StatCard
          to="/app/opdrachten"
          icon={FileCheck}
          label="Openstaande taken"
          value="3"
          hint="1 deadline morgen"
          tone="warning"
        />
        <StatCard to="/app/berichten" icon={MessageSquare} label="Nieuwe berichten" value="2" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Rooster vandaag"
            action={
              <Link to="/app/rooster" className="text-xs font-semibold text-primary">
                Volledig rooster →
              </Link>
            }
          >
            <div className="space-y-2">
              {roosterVandaag.map((l) => (
                <Link
                  key={l.tijd}
                  to="/app/rooster"
                  className="flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-background p-3 transition-colors hover:bg-muted/50"
                >
                  <div className={`h-10 w-1 shrink-0 rounded-full ${l.kleur}`} />
                  <div className="w-28 shrink-0 text-xs text-muted-foreground">{l.tijd}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{l.vak}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      Lokaal {l.lokaal} · {l.docent}
                    </div>
                  </div>
                  {l.wijziging && (
                    <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">
                      {l.wijziging}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </Card>

          <Card
            title="Openstaande taken"
            action={
              <Link to="/app/opdrachten" className="text-xs font-semibold text-primary">
                Alle taken →
              </Link>
            }
          >
            <div className="space-y-2">
              {opdrachten
                .filter((o) => !o.ingeleverd)
                .map((o) => (
                  <Link
                    key={o.titel}
                    to="/app/opdrachten"
                    className="flex items-center justify-between rounded-xl border border-border bg-background p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{o.titel}</div>
                      <div className="text-xs text-muted-foreground">{o.vak}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-warning">
                      <Clock className="h-3.5 w-3.5" /> {o.deadline}
                    </div>
                  </Link>
                ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Meldingen">
            <div className="space-y-1">
              {meldingen.map((m) => (
                <Link
                  key={m.titel}
                  to={m.link}
                  className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                >
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{m.titel}</div>
                    <div className="text-[11px] text-muted-foreground">{m.tijd} geleden</div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card
            title="Recente cijfers"
            action={
              <Link to="/app/cijfers" className="text-xs font-semibold text-primary">
                Alle cijfers →
              </Link>
            }
          >
            <div className="space-y-2">
              {cijfers.slice(0, 4).map((c) => (
                <Link
                  key={c.vak}
                  to="/app/cijfers"
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="text-sm font-medium">{c.vak}</div>
                  <div className="flex items-center gap-2">
                    <TrendIcon trend={c.trend} />
                    <span
                      className={`text-lg font-bold ${c.laatste < 6 ? "text-destructive" : "text-foreground"}`}
                    >
                      {c.laatste.toFixed(1)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DocentView() {
  const aantalKlassen = docentKlassen.length;
  const teBeoordelen = docentOpdrachten.filter(
    (o) => o.status === "ingeleverd" || o.status === "te-laat",
  );
  const ongelezen = 2; // docentBerichten filtered ongelezen
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          to="/app/cijfers"
          icon={Users}
          label="Klassen"
          value={String(aantalKlassen)}
          hint={`${docentKlassen.reduce((s, k) => s + k.leerlingen.length, 0)} leerlingen`}
        />
        <StatCard
          to="/app/opdrachten"
          icon={FileCheck}
          label="Te beoordelen"
          value={String(teBeoordelen.length)}
          hint={
            teBeoordelen.length > 0
              ? `${teBeoordelen.filter((o) => o.status === "te-laat").length} te laat ingeleverd`
              : "Alles bijgewerkt"
          }
          tone={teBeoordelen.length > 0 ? "warning" : "success"}
        />
        <StatCard
          to="/app/rooster"
          icon={Calendar}
          label="Lessen deze week"
          value={String(
            Object.values({ Ma: 2, Di: 6, Wo: 4, Do: 5, Vr: 5 }).reduce((a, b) => a + b, 0),
          )}
        />
        <StatCard
          to="/app/berichten"
          icon={MessageSquare}
          label="Ongelezen berichten"
          value={String(ongelezen)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card
            title="Mijn klassen"
            action={
              <Link to="/app/cijfers" className="text-xs font-semibold text-primary">
                Alle klassen →
              </Link>
            }
          >
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left">Klas</th>
                    <th className="px-4 py-2 text-left">Leerlingen</th>
                    <th className="px-4 py-2 text-left">Vak</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {docentKlassen.map((k) => (
                    <tr key={k.klas} className="border-t border-border">
                      <td className="px-4 py-3 font-semibold">{k.klas}</td>
                      <td className="px-4 py-3 text-muted-foreground">{k.leerlingen.length}</td>
                      <td className="px-4 py-3 text-muted-foreground">{k.vak}</td>
                      <td className="px-4 py-3 text-right">
                        <Link to="/app/cijfers" className="text-xs font-semibold text-primary">
                          Open →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card
            title="Nieuwe meldingen"
            action={
              <span className="text-[11px] text-muted-foreground">
                {docentMeldingen.length} nieuw
              </span>
            }
          >
            <div className="space-y-1">
              {docentMeldingen.map((m) => (
                <Link
                  key={m.titel}
                  to={m.link}
                  className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                >
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{m.titel}</div>
                    <div className="text-[11px] text-muted-foreground">{m.tijd} geleden</div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card
            title="Te beoordelen"
            action={
              <Link to="/app/opdrachten" className="text-xs font-semibold text-primary">
                Alles →
              </Link>
            }
          >
            <div className="space-y-2">
              {docentOpdrachten
                .filter((o) => o.status === "ingeleverd" || o.status === "te-laat")
                .slice(0, 3)
                .map((o) => (
                  <div key={o.id} className="rounded-lg border border-border p-3">
                    <div className="text-sm font-medium">
                      {o.titel} — {o.klas} ({o.ingeleverd})
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Link
                        to="/app/opdrachten"
                        className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground"
                      >
                        Beoordelen
                      </Link>
                      <span className="text-[11px] text-muted-foreground">
                        deadline {o.deadline}
                      </span>
                    </div>
                  </div>
                ))}
              {docentOpdrachten.filter((o) => o.status === "ingeleverd" || o.status === "te-laat")
                .length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  Niets te beoordelen
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function OuderView() {
  const navigate = useNavigate();
  const [selectedKind, setSelectedKind] = useState(0);
  const kinderen = [
    {
      naam: "Sanne de Vries",
      klas: "V4B",
      niveau: "4 VWO",
      mentor: "L. de Boer",
      initials: "SV",
      gemiddelde: "7.4",
      aanwezigheid: "96%",
      taken: "3",
      meldingen: "2",
      hint_gem: "+0.3",
      hint_aanw: "",
      hint_taken: "1 deadline morgen",
      hint_meld: "",
    },
    {
      naam: "Tom de Vries",
      klas: "V2A",
      niveau: "2 VWO",
      mentor: "P. Smit",
      initials: "TV",
      gemiddelde: "6.8",
      aanwezigheid: "94%",
      taken: "2",
      meldingen: "1",
      hint_gem: "-0.1",
      hint_aanw: "",
      hint_taken: "",
      hint_meld: "",
    },
  ];
  const kind = kinderen[selectedKind];
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            {kind.initials}
          </div>
          <div>
            <div className="text-lg font-bold">{kind.naam}</div>
            <div className="text-sm text-muted-foreground">
              {kind.niveau} · Klas {kind.klas} · Mentor: {kind.mentor}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex overflow-hidden rounded-lg border border-border">
              {kinderen.map((k, i) => (
                <button
                  key={k.naam}
                  onClick={() => setSelectedKind(i)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${selectedKind === i ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  {k.naam.split(" ")[0]}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate({ to: "/app/berichten" })}
                className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-muted"
              >
                Mentor bereiken
              </button>
              <button
                onClick={() => navigate({ to: "/app/cijfers" })}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
              >
                Volledige voortgang
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          to="/app/cijfers"
          icon={BarChart3}
          label="Gemiddelde"
          value={kind.gemiddelde}
          hint={kind.hint_gem}
          tone="success"
        />
        <StatCard
          to="/app/aanwezigheid"
          icon={CheckCircle2}
          label="Aanwezigheid"
          value={kind.aanwezigheid}
          tone="success"
        />
        <StatCard
          to="/app/opdrachten"
          icon={FileCheck}
          label="Openstaande taken"
          value={kind.taken}
          hint={kind.hint_taken}
          tone="warning"
        />
        <StatCard to="/app/berichten" icon={AlertCircle} label="Meldingen" value={kind.meldingen} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Cijfers per vak">
          <div className="space-y-2">
            {cijfers.map((c) => (
              <div
                key={c.vak}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <div className="text-sm font-semibold">{c.vak}</div>
                  <div className="text-xs text-muted-foreground">
                    Gemiddeld {c.gemiddelde.toFixed(1)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendIcon trend={c.trend} />
                  <span className={`text-lg font-bold ${c.laatste < 6 ? "text-destructive" : ""}`}>
                    {c.laatste.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Berichten van school">
          <div className="space-y-3">
            {ouderBerichten.slice(0, 3).map((b) => (
              <div key={b.van} className="flex gap-3">
                <img
                  src={b.avatar}
                  alt={b.van}
                  className="h-9 w-9 shrink-0 rounded-full bg-muted object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-semibold">{b.van}</div>
                    <div className="shrink-0 text-[11px] text-muted-foreground">{b.tijd}</div>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{b.preview}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title={`Weekoverzicht ${kind.naam.split(" ")[0]} — week 28`}>
        <div className="grid grid-cols-5 gap-2">
          {[
            {
              dag: "Ma",
              datum: "7 jul",
              lessen: weekRooster["Ma"].length,
              toets: null,
              deadline: null,
              afwezig: false,
            },
            {
              dag: "Di",
              datum: "8 jul",
              lessen: weekRooster["Di"].length,
              toets: null,
              deadline: "Wiskunde H4",
              afwezig: true,
              afwezigVak: "Scheikunde",
            },
            {
              dag: "Wo",
              datum: "9 jul",
              lessen: weekRooster["Wo"].length,
              toets: null,
              deadline: null,
              afwezig: false,
            },
            {
              dag: "Do",
              datum: "10 jul",
              lessen: weekRooster["Do"].length,
              toets: null,
              deadline: null,
              afwezig: false,
            },
            {
              dag: "Vr",
              datum: "11 jul",
              lessen: weekRooster["Vr"].length,
              toets: null,
              deadline: "Nederlands essay",
              afwezig: false,
            },
          ].map((d) => (
            <div
              key={d.dag}
              className={`rounded-xl border p-2 text-center ${d.afwezig ? "border-warning/40 bg-warning/5" : "border-border bg-background"}`}
            >
              <div className="text-[11px] font-bold uppercase text-muted-foreground">{d.dag}</div>
              <div className="text-[10px] text-muted-foreground">{d.datum}</div>
              <div className="mt-2 text-lg font-bold">{d.lessen}</div>
              <div className="text-[10px] text-muted-foreground">lessen</div>
              {d.deadline && (
                <div className="mt-1 rounded bg-warning/10 px-1 py-0.5 text-[9px] font-semibold text-warning leading-tight">
                  {d.deadline}
                </div>
              )}
              {d.afwezig && (
                <div className="mt-1 rounded bg-destructive/10 px-1 py-0.5 text-[9px] font-semibold text-destructive leading-tight">
                  {"afwezigVak" in d ? d.afwezigVak : "Afwezig"}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function TeamleiderView() {
  const [searchQ, setSearchQ] = useState("");
  const docentenAfwezig = personeel.filter((p) => !p.aanwezig);
  const filteredKlassen = searchQ.trim()
    ? klassen.filter((k) => k.klas.toLowerCase().includes(searchQ.toLowerCase()))
    : klassen;
  const filteredPersoneel = searchQ.trim()
    ? personeel.filter((p) => p.naam.toLowerCase().includes(searchQ.toLowerCase()))
    : personeel;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          to="/app/leerlingen"
          icon={AlertCircle}
          label="Leerlingen afwezig"
          value="18"
          hint="4 zonder melding"
          tone="warning"
        />
        <StatCard
          to="/app/leerlingen"
          icon={Users}
          label="Zonder melding"
          value="4"
          hint="Direct actie vereist"
          tone="warning"
        />
        <StatCard
          to="/app/personeel"
          icon={Users}
          label="Docenten afwezig"
          value={String(docentenAfwezig.length)}
          hint={docentenAfwezig.map((p) => p.naam.split(" ")[0]).join(", ")}
          tone="warning"
        />
        <StatCard
          to="/app/vervanging"
          icon={AlertCircle}
          label="Openstaande vervangingen"
          value="1"
          hint="Regelen vereist"
          tone="warning"
        />
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder="Zoek klas of docent..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card title="Klassenoverzicht bovenbouw">
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredKlassen.map((k) => (
                <div key={k.klas} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold">{k.klas}</div>
                    <span className="text-xs text-muted-foreground">{k.leerlingen} lln.</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-muted-foreground">Gemiddelde</div>
                      <div className="mt-0.5 text-base font-semibold">
                        {k.gemiddelde.toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Aanwezigheid</div>
                      <div className="mt-0.5 text-base font-semibold">{k.aanwezigheid}%</div>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${k.aanwezigheid}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Verzuim vandaag — leerlingen">
            <div className="space-y-2">
              {[
                { naam: "Tom Bakker", klas: "V4B", reden: "Zonder melding" },
                { naam: "Daan de Wit", klas: "V5A", reden: "Ziek gemeld" },
                { naam: "Emma Visser", klas: "V4A", reden: "Zonder melding" },
                { naam: "Noah Jansen", klas: "V4B", reden: "Zonder melding" },
                { naam: "Anna Smits", klas: "H4A", reden: "Afgemeld" },
              ].map((l) => (
                <div
                  key={l.naam}
                  className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2"
                >
                  <div>
                    <div className="text-sm font-medium">{l.naam}</div>
                    <div className="text-[11px] text-muted-foreground">{l.klas}</div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${l.reden === "Zonder melding" ? "bg-destructive/15 text-destructive" : l.reden === "Ziek gemeld" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground"}`}
                  >
                    {l.reden}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Docenten afwezig vandaag">
            <div className="space-y-2">
              {filteredPersoneel.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2"
                >
                  <div>
                    <div className="text-sm font-medium">{p.naam}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {p.verlof ?? (p.aanwezig ? "Aanwezig" : "Afwezig")}
                    </div>
                  </div>
                  {p.aanwezig ? (
                    <span className="rounded-lg bg-success/10 px-2.5 py-1.5 text-[11px] font-semibold text-success">
                      Beschikbaar
                    </span>
                  ) : (
                    <Link
                      to="/app/vervanging"
                      className="rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground"
                    >
                      Regelen →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
        <Card title="Signaleringen">
          <div className="space-y-3">
            {klassen.map((k) => {
              const isLowGem = k.gemiddelde < 7.0;
              const isLowAanw = k.aanwezigheid < 95;
              const tone = isLowGem || isLowAanw ? "warning" : "success";
              const tekst = isLowGem
                ? `${k.klas} — gemiddelde onder 7.0 (${k.gemiddelde.toFixed(1)})`
                : isLowAanw
                  ? `${k.klas} — aanwezigheid onder norm (${k.aanwezigheid}%)`
                  : `${k.klas} — op koers (∅ ${k.gemiddelde.toFixed(1)}, ${k.aanwezigheid}% aanwezig)`;
              return (
                <div key={k.klas} className="rounded-lg border border-border p-3">
                  <div className="flex items-start gap-2">
                    <div
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${tone === "warning" ? "bg-warning" : "bg-success"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm">{tekst}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Link to="/app/leerlingen" className="text-[11px] font-semibold text-primary">
                      Bekijk dossier →
                    </Link>
                    {isLowAanw && (
                      <Link
                        to="/app/vervanging"
                        className="text-[11px] font-semibold text-muted-foreground"
                      >
                        Vervanging →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function DirectieView() {
  const [barDetail, setBarDetail] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const bars = [72, 68, 75, 71, 78, 74, 80, 77, 82, 79, 84, 81];
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div className="relative">
          <button
            onClick={() => setExportOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-muted"
          >
            <Download className="h-4 w-4" /> Exporteer rapport
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-full z-10 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
              {[
                { label: "PDF exporteren", ext: "pdf", mime: "application/pdf" },
                {
                  label: "Excel exporteren",
                  ext: "xlsx",
                  mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                },
                { label: "CSV exporteren", ext: "csv", mime: "text/csv" },
              ].map((opt) => (
                <button
                  key={opt.ext}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => {
                    setExportOpen(false);
                    const blob = new Blob(["Schoolrapport data..."], { type: opt.mime });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `schoolrapport.${opt.ext}`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success(`Schoolrapport geëxporteerd als ${opt.ext.toUpperCase()}`);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          to="/app/leerlingen"
          icon={Users}
          label="Leerlingen totaal"
          value="1.284"
          hint="+42 dit schooljaar"
          tone="success"
        />
        <StatCard
          to="/app/rapporten"
          icon={BarChart3}
          label="Slagingspercentage"
          value="94%"
          hint="+2% t.o.v. vorig jaar"
          tone="success"
        />
        <StatCard
          to="/app/aanwezigheid"
          icon={CheckCircle2}
          label="Aanwezigheid"
          value="95.2%"
          hint="Boven landelijke norm"
          tone="success"
        />
        <StatCard
          to="/app/berichten"
          icon={AlertCircle}
          label="Meldingen dit jaar"
          value="63"
          hint="-12%"
          tone="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card
            title="Cijfertrend schoolbreed"
            action={<span className="text-xs text-muted-foreground">Laatste 12 maanden</span>}
          >
            <div className="flex h-48 items-end gap-2">
              {bars.map((b, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary/60"
                    style={{ height: `${b}%` }}
                  />
                  <div className="text-[10px] text-muted-foreground">
                    {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <Card title="Slagingspercentage per afdeling">
          <div className="space-y-2">
            {[
              { a: "VWO", pct: 97, avg: 7.6, onvold: 12 },
              { a: "HAVO", pct: 92, avg: 7.2, onvold: 28 },
              { a: "VMBO", pct: 88, avg: 6.9, onvold: 41 },
            ].map((r) => (
              <button
                key={r.a}
                onClick={() => setBarDetail(barDetail === r.a ? null : r.a)}
                className="w-full rounded-lg p-1 text-left transition-colors hover:bg-muted/30"
              >
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{r.a}</span>
                  <span className="font-semibold">{r.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
                {barDetail === r.a && (
                  <div className="mt-2 space-y-1 rounded-lg bg-muted/50 p-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gemiddeld cijfer</span>
                      <span className="font-semibold">{r.avg}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aantal onvoldoendes</span>
                      <span className="font-semibold text-destructive">{r.onvold}</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Schooldoelstellingen">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: "Slagingspercentage", doel: 95, huidig: 94, eenheid: "%", status: "Op koers" },
            {
              label: "Gemiddeld schoolcijfer",
              doel: 7.5,
              huidig: 7.2,
              eenheid: "",
              status: "Aandacht vereist",
            },
            {
              label: "Verzuimpercentage",
              doel: 5,
              huidig: 4.8,
              eenheid: "%",
              status: "Op koers",
              lager: true,
            },
            {
              label: "Oudertevredenheid",
              doel: 8.0,
              huidig: 7.6,
              eenheid: "",
              status: "Aandacht vereist",
            },
          ].map((kpi) => {
            const onKoers = kpi.status === "Op koers";
            const pct = kpi.lager
              ? Math.max(0, Math.min(100, (1 - (kpi.huidig - kpi.doel) / kpi.doel) * 100))
              : Math.min(100, (kpi.huidig / kpi.doel) * 100);
            return (
              <div key={kpi.label} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{kpi.label}</div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${onKoers ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}
                  >
                    {kpi.status}
                  </span>
                </div>
                <div className="mt-2 flex items-end gap-2">
                  <div className="text-2xl font-bold">
                    {kpi.huidig}
                    {kpi.eenheid}
                  </div>
                  <div className="mb-0.5 text-xs text-muted-foreground">
                    doel: {kpi.doel}
                    {kpi.eenheid}
                  </div>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${onKoers ? "bg-success" : "bg-warning"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card
        title="Verzuim per maand"
        action={<span className="text-xs text-muted-foreground">2026</span>}
      >
        <div className="flex h-40 items-end gap-1.5">
          {[
            { m: "Jan", p: 5.2 },
            { m: "Feb", p: 4.8 },
            { m: "Mrt", p: 5.5 },
            { m: "Apr", p: 4.2 },
            { m: "Mei", p: 6.1 },
            { m: "Jun", p: 5.8 },
            { m: "Jul", p: 4.5 },
          ].map((r) => (
            <button
              key={r.m}
              onClick={() => setBarDetail(barDetail === `verzuim-${r.m}` ? null : `verzuim-${r.m}`)}
              className="group flex flex-1 flex-col items-center gap-1"
            >
              {barDetail === `verzuim-${r.m}` && (
                <div className="absolute -translate-y-full rounded border border-border bg-popover px-2 py-1 text-[10px] shadow">
                  {r.p}%
                </div>
              )}
              <div className="relative w-full">
                <div
                  className="w-full rounded-t-sm bg-primary/70 transition-colors group-hover:bg-primary"
                  style={{ height: `${r.p * 12}px` }}
                />
              </div>
              <div className="text-[9px] text-muted-foreground">{r.m}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Beleidsagenda">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { t: "Evaluatie nieuw curriculum", s: "Q1 2026", p: 60 },
            { t: "Docentenontwikkelingsplan", s: "Loopt", p: 35 },
            { t: "AVG-audit", s: "Afgerond", p: 100 },
          ].map((b) => (
            <div key={b.t} className="rounded-xl border border-border p-4">
              <div className="text-sm font-semibold">{b.t}</div>
              <div className="text-xs text-muted-foreground">{b.s}</div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: `${b.p}%` }} />
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">{b.p}%</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-success" />;
  if (trend === "down") return <TrendingDown className="h-4 w-4 text-destructive" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
}
