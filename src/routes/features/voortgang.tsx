import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, ArrowLeft, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import logo from "@/assets/schoolpulse-logo.png";
import { DEMO_APP_URL } from "@/lib/domains";

export const Route = createFileRoute("/features/voortgang")({
  component: FeatureVoortgang,
});

function FeatureVoortgang() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Schoolpulse" className="h-9 w-9" />
            <span className="text-lg font-bold tracking-tight">Schoolpulse</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Terug
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/60 to-background" />
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Resultaten & voortgang</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Realtime inzicht in cijfers, gemiddelden en trends per leerling en klas
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-8">
              <h3 className="text-lg font-semibold">Voor leerlingen & ouders</h3>
              <ul className="mt-4 space-y-3">
                {[
                  "Realtime inzicht in alle cijfers en gemiddelden",
                  "Trendanalyse per vak — stijgend, dalend of stabiel",
                  "Automatische berekening van benodigde inhaalcijfers",
                  "Overzicht van ontbrekende of te late opdrachten",
                  "Voortgangsrapport per periode",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8">
              <h3 className="text-lg font-semibold">Voor docenten & schoolleiding</h3>
              <ul className="mt-4 space-y-3">
                {[
                  "Klassenoverzicht met gemiddelden en spreiding",
                  "Signalering van leerlingen met meerdere tekorten",
                  "Vergelijking van prestaties over klassen en perioden",
                  "Export van rapportcijfers naar gangbare formaten",
                  "Schoolbrede analysegrafieken voor de directie",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                    <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-border bg-muted/40 p-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <div className="text-sm font-semibold">AVG-conform en veilig</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Cijfergegevens worden versleuteld opgeslagen en zijn alleen toegankelijk voor bevoegde gebruikers.
                  Ouders zien uitsluitend de resultaten van hun eigen kind.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <a
              href={DEMO_APP_URL}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Bekijk in de demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
