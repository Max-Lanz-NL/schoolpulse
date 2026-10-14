import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Eye, FileCheck, Lock, ShieldCheck } from "lucide-react";
import logo from "@/assets/schoolpulse-logo.png";

export const Route = createFileRoute("/privacy")({ component: Privacy });

function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Schoolpulse" className="h-9 w-9" />
            <span className="text-lg font-bold tracking-tight">Schoolpulse</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Terug
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-44 bg-gradient-to-b from-primary/[0.06] to-transparent" />
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            <aside className="rounded-2xl border border-border/80 bg-card p-5 shadow-[var(--shadow-soft)] lg:sticky lg:top-24 lg:h-fit">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="h-4 w-4 text-primary" /> Privacy & schoolafspraken
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Schoolpulse · Demo en voorbereiding op ingebruikname
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <a
                  href="#gegevensverwerking"
                  className="block rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Gegevensverwerking
                </a>
                <a
                  href="#gegevenssoorten"
                  className="block rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Welke gegevens
                </a>
                <a
                  href="#rechten"
                  className="block rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Uw rechten
                </a>
                <a
                  href="#beveiliging"
                  className="block rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Beveiliging
                </a>
                <a
                  href="#schoolafspraken"
                  className="block rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Afspraken met de school
                </a>
              </div>
            </aside>

            <main className="space-y-4">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                <h1 className="text-2xl font-bold tracking-tight">
                  Duidelijkheid over gegevens en toegang
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  De openbare demo toont fictieve schoolgegevens. Voor gebruik met echte
                  schoolgegevens leggen we de verwerking, beveiliging en verantwoordelijkheden
                  vooraf vast met de school.
                </p>
              </div>
              <SectionCard
                id="gegevensverwerking"
                icon={Lock}
                title="Gegevensverwerking"
                body="Het rooster, de cijfers en de gebruikers in de ingerichte demo zijn voorbeelden. Uw gekozen schoolrol en eventueel ingevulde demoprofiel worden in uw browser bewaard. Gebruik bij het verkennen uitsluitend fictieve gegevens; vul geen echte leerlinggegevens in."
              />
              <SectionCard
                id="gegevenssoorten"
                icon={Eye}
                title="Welke gegevens verzamelen wij?"
                body="Een schoolomgeving kan accountgegevens, rollen, klasindelingen, roosters, aanwezigheid, resultaten en berichten bevatten. Welke onderdelen jullie gebruiken en welke gegevens daarvoor nodig zijn, bepalen we vooraf met de school. Ook leggen we vast welke leveranciers bij de verwerking betrokken zijn."
              />
              <SectionCard
                id="rechten"
                icon={FileCheck}
                title="Uw rechten"
                body="U heeft het recht op inzage, correctie en verwijdering van uw gegevens. Neem hiervoor contact op via privacy@schoolpulse.nl."
              />
              <SectionCard
                id="beveiliging"
                icon={ShieldCheck}
                title="Beveiliging"
                body="Bespreek vóór ingebruikname hoe toegang per schoolrol wordt ingericht, hoe beheeraccounts worden beveiligd en hoe back-ups, herstel en incidentmeldingen worden geregeld. Hostinglocatie, bewaartermijnen en operationele afspraken moeten voor jullie school worden bevestigd; de demo is geen bewijs van die productieafspraken."
              />
              <section
                id="schoolafspraken"
                className="rounded-2xl border border-border/80 bg-card p-6 shadow-[var(--shadow-soft)]"
              >
                <h2 className="text-base font-semibold">Wat leggen we vooraf vast?</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                  <li>
                    De verwerkersovereenkomst en verantwoordelijkheden van school en leverancier.
                  </li>
                  <li>
                    Hostinglocatie, betrokken leveranciers en bewaartermijnen per gegevenssoort.
                  </li>
                  <li>
                    Toegangsrechten, beheeraccounts en aanspreekpunten voor privacy en
                    ondersteuning.
                  </li>
                  <li>
                    Back-ups, herstel, incidentafhandeling en de overdracht of verwijdering van
                    gegevens bij beëindiging.
                  </li>
                </ul>
                <Link
                  to="/contact"
                  className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline"
                >
                  Bespreek de afspraken voor jullie school
                </Link>
              </section>
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionCard({
  id,
  icon: Icon,
  title,
  body,
}: {
  id: string;
  icon: typeof ShieldCheck;
  title: string;
  body: string;
}) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-border/80 bg-card p-6 shadow-[var(--shadow-soft)]"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
        </div>
      </div>
    </section>
  );
}
