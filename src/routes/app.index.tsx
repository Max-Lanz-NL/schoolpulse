import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { useRole } from "@/lib/role-context";
import { roleUsers, roosterVandaag, cijfers, opdrachten, berichten, meldingen, docentMeldingen, klassen, roleLabels } from "@/lib/demo-data";
import {
  Calendar, BarChart3, MessageSquare, FileCheck, TrendingUp, TrendingDown, Minus,
  ArrowUpRight, CheckCircle2, Clock, AlertCircle, Users,
} from "lucide-react";

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

function StatCard({ icon: Icon, label, value, hint, tone = "default", to }: { icon: any; label: string; value: string; hint?: string; tone?: "default" | "success" | "warning"; to?: string }) {
  const toneClass = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-muted-foreground";
  const content = (
    <>
      <div className="flex items-center justify-between">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-4 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
      {hint && <div className={`mt-1 text-xs ${toneClass}`}>{hint}</div>}
    </>
  );
  const cls = "block rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-elegant)]";
  if (to) return <Link to={to} className={cls}>{content}</Link>;
  return <div className="rounded-2xl border border-border bg-card p-5">{content}</div>;
}

function LeerlingView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard to="/app/cijfers" icon={BarChart3} label="Gemiddelde" value="7.4" hint="+0.3 t.o.v. vorige periode" tone="success" />
        <StatCard to="/app/rooster" icon={Calendar} label="Lessen vandaag" value="6" hint="1 wijziging" tone="warning" />
        <StatCard to="/app/opdrachten" icon={FileCheck} label="Openstaande taken" value="3" hint="1 deadline morgen" tone="warning" />
        <StatCard to="/app/berichten" icon={MessageSquare} label="Nieuwe berichten" value="2" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Rooster vandaag" action={<Link to="/app/rooster" className="text-xs font-semibold text-primary">Volledig rooster →</Link>}>
            <div className="space-y-2">
              {roosterVandaag.map((l) => (
                <Link
                  key={l.tijd}
                  to="/app/rooster"
                  className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:bg-muted/50"
                >
                  <div className={`h-10 w-1 rounded-full ${l.kleur}`} />
                  <div className="w-28 shrink-0 text-xs text-muted-foreground">{l.tijd}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{l.vak}</div>
                    <div className="truncate text-xs text-muted-foreground">Lokaal {l.lokaal} · {l.docent}</div>
                  </div>
                  {l.wijziging && (
                    <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">{l.wijziging}</span>
                  )}
                </Link>
              ))}
            </div>
          </Card>

          <Card title="Openstaande taken" action={<Link to="/app/opdrachten" className="text-xs font-semibold text-primary">Alle taken →</Link>}>
            <div className="space-y-2">
              {opdrachten.filter(o => !o.ingeleverd).map((o) => (
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

          <Card title="Recente cijfers" action={<Link to="/app/cijfers" className="text-xs font-semibold text-primary">Alle cijfers →</Link>}>
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
                    <span className={`text-lg font-bold ${c.laatste < 6 ? "text-destructive" : "text-foreground"}`}>{c.laatste.toFixed(1)}</span>
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
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard to="/app/cijfers" icon={Users} label="Klassen" value="5" hint="128 leerlingen" />
        <StatCard to="/app/opdrachten" icon={FileCheck} label="Te beoordelen" value="14" hint="3 achterstand" tone="warning" />
        <StatCard to="/app/rooster" icon={Calendar} label="Lessen deze week" value="22" />
        <StatCard to="/app/berichten" icon={MessageSquare} label="Ongelezen berichten" value="7" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Mijn klassen" action={<Link to="/app/cijfers" className="text-xs font-semibold text-primary">Alle klassen →</Link>}>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left">Klas</th>
                    <th className="px-4 py-2 text-left">Leerlingen</th>
                    <th className="px-4 py-2 text-left">Gemiddelde</th>
                    <th className="px-4 py-2 text-left">Aanwezigheid</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {klassen.map((k) => (
                    <tr key={k.klas} className="border-t border-border">
                      <td className="px-4 py-3 font-semibold">{k.klas}</td>
                      <td className="px-4 py-3 text-muted-foreground">{k.leerlingen}</td>
                      <td className="px-4 py-3">{k.gemiddelde.toFixed(1)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div className="h-full bg-primary" style={{ width: `${k.aanwezigheid}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{k.aanwezigheid}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right"><Link to="/app/cijfers" className="text-xs font-semibold text-primary">Open →</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Nieuwe meldingen" action={<span className="text-[11px] text-muted-foreground">{docentMeldingen.length} nieuw</span>}>
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

          <Card title="Te beoordelen" action={<Link to="/app/opdrachten" className="text-xs font-semibold text-primary">Alles →</Link>}>
            <div className="space-y-2">
              {["Praktijkverslag Titratie — V4B (18)", "Boekverslag — V5A (12)", "SO Molberekeningen — V4A (26)"].map((t) => (
                <div key={t} className="rounded-lg border border-border p-3">
                  <div className="text-sm font-medium">{t}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <Link to="/app/opdrachten" className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">Beoordelen</Link>
                    <span className="text-[11px] text-muted-foreground">binnen 3 dagen</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function OuderView() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-lg font-bold text-primary">SV</div>
          <div>
            <div className="text-lg font-bold">Sanne de Vries</div>
            <div className="text-sm text-muted-foreground">4 VWO · Klas V4B · Mentor: L. de Boer</div>
          </div>
          <div className="ml-auto flex gap-2">
            <button className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-muted">Mentor bereiken</button>
            <button className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Volledige voortgang</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={BarChart3} label="Gemiddelde" value="7.4" hint="+0.3" tone="success" />
        <StatCard icon={CheckCircle2} label="Aanwezigheid" value="96%" tone="success" />
        <StatCard icon={FileCheck} label="Openstaande taken" value="3" tone="warning" />
        <StatCard icon={AlertCircle} label="Meldingen" value="2" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Cijfers per vak">
          <div className="space-y-2">
            {cijfers.map((c) => (
              <div key={c.vak} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <div className="text-sm font-semibold">{c.vak}</div>
                  <div className="text-xs text-muted-foreground">Gemiddeld {c.gemiddelde.toFixed(1)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendIcon trend={c.trend} />
                  <span className={`text-lg font-bold ${c.laatste < 6 ? "text-destructive" : ""}`}>{c.laatste.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Berichten van school">
          <div className="space-y-3">
            {berichten.slice(0, 4).map((b) => (
              <div key={b.van} className="flex gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold">{b.avatar}</div>
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
    </div>
  );
}

function TeamleiderView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Klassen" value="12" hint="326 leerlingen" />
        <StatCard icon={AlertCircle} label="Verzuim vandaag" value="18" hint="4 zonder melding" tone="warning" />
        <StatCard icon={BarChart3} label="Gemiddelde bovenbouw" value="7.1" hint="+0.1" tone="success" />
        <StatCard icon={FileCheck} label="Openstaande rapporten" value="5" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Klassenoverzicht bovenbouw">
            <div className="grid gap-3 sm:grid-cols-2">
              {klassen.map((k) => (
                <div key={k.klas} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold">{k.klas}</div>
                    <span className="text-xs text-muted-foreground">{k.leerlingen} lln.</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-muted-foreground">Gemiddelde</div>
                      <div className="mt-0.5 text-base font-semibold">{k.gemiddelde.toFixed(1)}</div>
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
        </div>
        <Card title="Signaleringen">
          <div className="space-y-3">
            {[
              { t: "V5A — 4 leerlingen onvoldoende scheikunde", ton: "warning" },
              { t: "V4B — verzuim boven norm (8%)", ton: "warning" },
              { t: "H4A — nieuwe mentor aangesteld", ton: "info" },
              { t: "V4A — 3 leerlingen op koers voor cum laude", ton: "success" },
            ].map((s) => (
              <div key={s.t} className="flex items-start gap-2 rounded-lg border border-border p-3">
                <div className={`mt-1 h-2 w-2 rounded-full ${s.ton === "warning" ? "bg-warning" : s.ton === "success" ? "bg-success" : "bg-primary"}`} />
                <div className="text-sm">{s.t}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function DirectieView() {
  const bars = [72, 68, 75, 71, 78, 74, 80, 77, 82, 79, 84, 81];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Leerlingen totaal" value="1.284" hint="+42 dit schooljaar" tone="success" />
        <StatCard icon={BarChart3} label="Slagingspercentage" value="94%" hint="+2% t.o.v. vorig jaar" tone="success" />
        <StatCard icon={CheckCircle2} label="Aanwezigheid" value="95.2%" hint="Boven landelijke norm" tone="success" />
        <StatCard icon={AlertCircle} label="Meldingen dit jaar" value="63" hint="-12%" tone="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Cijfertrend schoolbreed" action={<span className="text-xs text-muted-foreground">Laatste 12 maanden</span>}>
            <div className="flex h-48 items-end gap-2">
              {bars.map((b, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary/60" style={{ height: `${b}%` }} />
                  <div className="text-[10px] text-muted-foreground">{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <Card title="Resultaten per afdeling">
          <div className="space-y-3">
            {[
              { a: "VWO", g: 7.6, k: "success" },
              { a: "HAVO", g: 7.2, k: "success" },
              { a: "VMBO-T", g: 6.9, k: "warning" },
              { a: "Onderbouw", g: 7.4, k: "success" },
            ].map((r) => (
              <div key={r.a}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{r.a}</span>
                  <span className="font-semibold">{r.g.toFixed(1)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full ${r.k === "warning" ? "bg-warning" : "bg-primary"}`} style={{ width: `${(r.g / 10) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

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
