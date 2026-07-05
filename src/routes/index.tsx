import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRole } from "@/lib/role-context";
import { roleLabels, type Role } from "@/lib/demo-data";
import {
  Calendar, BarChart3, MessageSquare, FileText, Bell, ShieldCheck,
  GraduationCap, Users, Building2, ArrowRight, CheckCircle2,
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

  const features = [
    { icon: Calendar, t: "Slim roosterbeheer", d: "AI-optimalisatie, minder tussenuren en directe melding bij lesuitval.", link: "/features/roosterbeheer" },
    { icon: BarChart3, t: "Resultaten & voortgang", d: "Realtime cijfers, gemiddelden en trends per leerling en klas.", link: "/features/voortgang" },
    { icon: MessageSquare, t: "Veilige communicatie", d: "Interne chat tussen leerlingen, docenten, ouders en mentoren.", link: "/features/communicatie" },
    { icon: FileText, t: "Opdrachten & toetsing", d: "Digitale inlevering, beoordeling en plagiaatsignalering.", link: "/features/opdrachten" },
    { icon: Bell, t: "Slimme notificaties", d: "Push voor cijfers, berichten, rooster en deadlines — instelbaar.", link: "/features/notificaties" },
    { icon: ShieldCheck, t: "AVG & 2FA", d: "Versleutelde communicatie, rollenbeheer en tweestapsverificatie.", link: "/features/veiligheid" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Schoolpulse" className="h-9 w-9" />
            <span className="text-lg font-bold tracking-tight">Schoolpulse</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">Functies</a>
            <a href="#rollen" className="text-sm font-medium text-muted-foreground hover:text-foreground">Voor wie</a>
            <a href="#veiligheid" className="text-sm font-medium text-muted-foreground hover:text-foreground">Veiligheid</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="#demo" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted sm:inline-block">Plan gesprek</a>
            <Link to="/app" className="inline-flex items-center gap-1 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground hover:bg-secondary/90">
              Bekijk demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/60 to-background" />
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-20 md:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Live demo — probeer alle rollen
            </div>
            <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
              Het digitale hart van<br />jouw school.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Roosters, cijfers, communicatie en administratie in één veilig, modern platform. Rustig ontworpen, snel in gebruik.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#demo" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:bg-primary/90">
                Ervaar Schoolpulse <ArrowRight className="h-4 w-4" />
              </a>
              <Link to="/app" className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold hover:bg-muted">
                Bekijk demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Role picker */}
      <section id="demo" className="border-t border-border bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Interactieve demo</div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Kies een rol en stap naar binnen</h2>
            <p className="mt-3 text-muted-foreground">Elke rol krijgt een eigen realistisch dashboard met echte schooldata.</p>
          </div>
          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-5">
            {([
              { r: "leerling", icon: GraduationCap, desc: "Rooster, cijfers en taken" },
              { r: "docent", icon: Users, desc: "Klassen en beoordelen" },
              { r: "ouder", icon: Users, desc: "Voortgang van je kind" },
              { r: "teamleider", icon: Building2, desc: "Klassen en verzuim" },
              { r: "directie", icon: BarChart3, desc: "Schoolbrede analytics" },
            ] as { r: Role; icon: typeof Users; desc: string }[]).map(({ r, icon: Icon, desc }) => (
              <button
                key={r}
                onClick={() => pickRole(r)}
                className="group flex flex-col items-start rounded-2xl border border-border bg-background p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-soft)]"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-base font-semibold">{roleLabels[r]}</div>
                <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Open dashboard <ArrowRight className="h-3 w-3" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Eén platform</div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Alles wat een moderne school nodig heeft</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, t, d, link }) => (
              <Link key={t} to={link} className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-card/80 cursor-pointer">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold group-hover:text-primary transition-colors">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Meer info <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Rollen */}
      <section id="rollen" className="border-t border-border bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">Voor elke rol</div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Eén platform, vijf dashboards</h2>
              <p className="mt-4 text-muted-foreground">Iedere gebruiker ziet precies wat hij of zij nodig heeft. Rustig, overzichtelijk en snel.</p>
              <ul className="mt-6 space-y-3">
                {[
                  "Leerlingen zien hun rooster, cijfers en taken in één blik.",
                  "Docenten voeren cijfers in en beoordelen digitaal.",
                  "Ouders volgen realtime de voortgang van hun kind.",
                  "Teamleiders bewaken verzuim en klassen.",
                  "Directie krijgt schoolbrede trends en rapportages.",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm text-foreground">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-border bg-background p-6 shadow-[var(--shadow-soft)]">
              <div className="grid grid-cols-2 gap-3">
                {(["leerling","docent","ouder","teamleider","directie"] as Role[]).map((r) => (
                  <button key={r} onClick={() => pickRole(r)} className="rounded-xl border border-border p-4 text-left transition-all hover:border-primary hover:bg-muted/60">
                    <div className="text-xs text-muted-foreground">Dashboard</div>
                    <div className="mt-1 text-sm font-semibold">{roleLabels[r]}</div>
                    <div className="mt-3 flex gap-1">
                      <span className="h-1 w-6 rounded-full bg-primary" />
                      <span className="h-1 w-3 rounded-full bg-primary/40" />
                      <span className="h-1 w-2 rounded-full bg-primary/20" />
                    </div>
                  </button>
                ))}
                <div className="rounded-xl bg-secondary p-4 text-secondary-foreground">
                  <div className="text-xs opacity-70">Klaar?</div>
                  <div className="mt-1 text-sm font-semibold">Start de demo</div>
                  <Link to="/app" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary-foreground">
                    Open <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="veiligheid" className="py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-secondary p-10 text-secondary-foreground md:p-14">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                <ShieldCheck className="h-3.5 w-3.5" /> AVG-proof & versleuteld
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">Veiligheid is geen extra — het is standaard.</h2>
              <p className="mt-3 text-sm text-white/70">Rollen- en rechtenbeheer, tweestapsverificatie, en versleutelde communicatie. Gebouwd volgens Nederlandse onderwijsnormen.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["AVG-proof", "2FA", "SSO", "SURF-ready"].map((b) => (
                <div key={b} className="rounded-xl bg-white/5 p-4 text-center text-sm font-semibold">{b}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-6 w-6" />
            <span className="text-sm text-muted-foreground">© 2026 Schoolpulse — demo</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:justify-end">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/voorwaarden" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Voorwaarden</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
