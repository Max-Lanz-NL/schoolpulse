import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ClipboardCheck, FileText, Gavel, Info, Shield } from "lucide-react";
import type { ReactNode } from "react";
import logo from "@/assets/schoolpulse-logo.png";

export const Route = createFileRoute("/voorwaarden")({ component: Voorwaarden });

function Voorwaarden() {
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
                <ClipboardCheck className="h-4 w-4 text-primary" /> Algemene voorwaarden
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Schoolpulse · Versie 1.0 · Demo omgeving
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <a
                  href="#toepassing"
                  className="block rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Toepassing
                </a>
                <a
                  href="#gebruik"
                  className="block rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Gebruik van het platform
                </a>
                <a
                  href="#beschikbaarheid"
                  className="block rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Beschikbaarheid
                </a>
                <a
                  href="#aansprakelijkheid"
                  className="block rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Aansprakelijkheid
                </a>
                <a
                  href="#wijzigingen"
                  className="block rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Wijzigingen
                </a>
              </div>
            </aside>

            <main className="space-y-4">
              <Section id="toepassing" icon={Info} title="Toepassing">
                Deze voorwaarden zijn van toepassing op het gebruik van Schoolpulse door scholen en
                medewerkers.
              </Section>
              <Section id="gebruik" icon={FileText} title="Gebruik van het platform">
                Het platform is bedoeld voor schoolcommunicatie, planning en leerlingvolgsystemen.
                Misbruik, onrechtmatig gebruik of toegang door onbevoegden is niet toegestaan.
              </Section>
              <Section id="beschikbaarheid" icon={Shield} title="Beschikbaarheid en onderhoud">
                Schoolpulse streeft naar hoge beschikbaarheid. Gepland onderhoud wordt tijdig
                gecommuniceerd.
              </Section>
              <Section id="aansprakelijkheid" icon={Gavel} title="Aansprakelijkheid">
                Schoolpulse is niet aansprakelijk voor indirecte schade voortvloeiend uit het
                gebruik van het platform, tenzij wettelijk anders bepaald.
              </Section>
              <Section id="wijzigingen" icon={ClipboardCheck} title="Wijzigingen in voorwaarden">
                Deze voorwaarden kunnen periodiek worden geactualiseerd. Bij belangrijke wijzigingen
                informeren wij scholen via de gebruikelijke communicatiekanalen.
              </Section>
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: typeof ClipboardCheck;
  title: string;
  children: ReactNode;
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
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>
        </div>
      </div>
    </section>
  );
}
