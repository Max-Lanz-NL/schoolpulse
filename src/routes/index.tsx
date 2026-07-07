import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRole } from "@/lib/role-context";
import { roleLabels, type Role } from "@/lib/demo-data";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import logo from "@/assets/schoolpulse-logo.png";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  const pickRole = (r: Role) => {
    setRole(r);
    navigate({ to: "/app" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Schoolpulse" className="h-9 w-9" />
            <span className="text-lg font-bold tracking-tight">Schoolpulse</span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            <a href="#waarde" className="text-sm font-medium text-muted-foreground hover:text-foreground">Waarom Schoolpulse</a>
            <a href="#doelgroepen" className="text-sm font-medium text-muted-foreground hover:text-foreground">Voor wie</a>
            <a href="#vertrouwen" className="text-sm font-medium text-muted-foreground hover:text-foreground">Vertrouwen</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/contact" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted sm:inline-flex">Contact</Link>
            <Link to="/contact" className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] hover:bg-primary/90">
              Demo aanvragen <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/[0.10] via-background to-background" />
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-primary/[0.08] blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-16 md:grid-cols-[1.15fr_0.85fr] md:px-6 md:pb-24 md:pt-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/90 px-3 py-1 text-xs font-medium text-muted-foreground shadow-[var(--shadow-soft)]">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Demo-ready voor Nederlandse scholen
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Eén platform voor <span className="text-primary">rooster, communicatie en voortgang</span>.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Schoolpulse helpt schoolteams sneller schakelen, ouders beter informeren en leerlingen meer overzicht geven — zonder extra complexiteit.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition-all hover:-translate-y-0.5 hover:bg-primary/90">
                Plan een demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#demo" className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background px-5 py-3 text-sm font-semibold shadow-[var(--shadow-soft)] hover:bg-muted">
                Bekijk live demo
              </a>
            </div>
            <div className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
              <div className="rounded-lg border border-border/70 bg-background/80 px-3 py-2">Snelle implementatie</div>
              <div className="rounded-lg border border-border/70 bg-background/80 px-3 py-2">Rollen & rechten per gebruiker</div>
              <div className="rounded-lg border border-border/70 bg-background/80 px-3 py-2">Duidelijke communicatieflow</div>
            </div>
          </div>

          <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-[var(--shadow-elegant)] md:p-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Waarom scholen kiezen</div>
            <div className="mt-4 space-y-3">
              {[
                { t: "Minder losse tools", d: "Rooster, berichten, dossiers en voortgang in één omgeving." },
                { t: "Meer rust voor teams", d: "Taken en communicatie op de juiste plek per rol." },
                { t: "Betere ouderbetrokkenheid", d: "Heldere, veilige en tijdige communicatie met ouders." },
                { t: "Management-overzicht", d: "Teamleider/directie sturen op agenda, verzuim en kwaliteit." },
              ].map((item) => (
                <div key={item.t} className="rounded-xl border border-border/70 bg-background/80 p-3">
                  <div className="text-sm font-semibold">{item.t}</div>
                  <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="vertrouwen" className="border-b border-border/60 bg-muted/35 py-10">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 md:grid-cols-4 md:px-6">
          {[
            "AVG-minded ontwerp",
            "Veilig berichtenverkeer",
            "Rollen met passende toegang",
            "Demo-ready voor besluitvorming",
          ].map((item) => (
            <div key={item} className="rounded-xl border border-border/70 bg-background px-4 py-3 text-sm font-semibold text-foreground shadow-[var(--shadow-soft)]">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section id="waarde" className="py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Waardepropositie</div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Gebouwd voor de praktijk op school</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Calendar, t: "Rooster & planning", d: "Actueel rooster, management-agenda en wijzigingsinzicht in één flow." },
              { icon: MessageSquare, t: "Communicatie per rol", d: "Leerling, ouder, docent en management zien alleen relevante berichten." },
              { icon: ShieldCheck, t: "Veilig en controleerbaar", d: "Heldere rechten, privacybewuste defaults en veilige workflows." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="rounded-2xl border border-border/80 bg-card p-6 shadow-[var(--shadow-soft)]">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="doelgroepen" className="border-y border-border/60 bg-muted/35 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Per doelgroep</div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Iedereen het juiste overzicht</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { r: "directie", icon: Building2, d: "Schoolbrede inzichten, rapportages en bestuurlijke voortgang." },
              { r: "docent", icon: Users, d: "Klassenbeheer, opdrachten, cijfers en communicatie zonder ruis." },
              { r: "ouder", icon: Users, d: "Voortgang van kind, gesprekken en schoolberichten op één plek." },
              { r: "leerling", icon: GraduationCap, d: "Rooster, taken en berichten overzichtelijk en snel." },
            ].map(({ r, icon: Icon, d }) => (
              <button
                key={r}
                onClick={() => pickRole(r as Role)}
                className="group rounded-2xl border border-border/80 bg-background p-5 text-left shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:border-primary/60"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-base font-semibold">{roleLabels[r as Role]}</div>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Open demo <ArrowRight className="h-3 w-3" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="rounded-3xl border border-border/80 bg-card p-8 shadow-[var(--shadow-elegant)] md:p-10">
            <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">Volgende stap</div>
                <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Vraag een demo aan voor jouw schoolteam</h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  In een korte sessie laten we de flow zien voor directie, docenten, ouders en leerlingen. Zo zie je direct of Schoolpulse past bij jullie school.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                    Demo aanvragen <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background px-5 py-3 text-sm font-semibold hover:bg-muted">
                    Contact opnemen
                  </Link>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  "30 minuten online demo",
                  "Gericht op jullie rollen en processen",
                  "Geen technische voorbereiding nodig",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-xl border border-border/70 bg-background p-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-6 w-6" />
            <span className="text-sm text-muted-foreground">© 2026 Schoolpulse</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:justify-end">
            <Link to="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Privacy</Link>
            <Link to="/voorwaarden" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Voorwaarden</Link>
            <Link to="/contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
