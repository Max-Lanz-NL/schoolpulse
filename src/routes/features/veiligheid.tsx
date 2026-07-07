import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ArrowLeft, Lock, UserCheck, FileCheck } from "lucide-react";
import logo from "@/assets/schoolpulse-logo.png";
import { DEMO_APP_URL } from "@/lib/domains";

export const Route = createFileRoute("/features/veiligheid")({
  component: FeatureDetail,
});

function FeatureDetail() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Schoolpulse" className="h-9 w-9" />
            <span className="text-lg font-bold tracking-tight">Schoolpulse</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted/60 to-background" />
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                AVG & 2FA
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Enterprise-grade veiligheid en privacybescherming voor onderwijs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-12 md:grid-cols-2">
            {/* Features */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Wat je krijgt</h2>
              {[
                {
                  icon: Lock,
                  title: "Versleutelde communicatie",
                  desc: "End-to-end encryptie voor alle berichten en gevoelige data",
                },
                {
                  icon: UserCheck,
                  title: "Tweestapsverificatie (2FA)",
                  desc: "Veilige inlog met wachtwoord + SMS/authenticator app",
                },
                {
                  icon: FileCheck,
                  title: "Rollen- en rechtenbeheer",
                  desc: "Granulaire controle over wie welke data ziet en mag wijzigen",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Details */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <h3 className="text-lg font-semibold">Compliance</h3>
              <ul className="mt-4 space-y-3">
                {[
                  "✓ AVG-proof (GDPR compliant)",
                  "✓ Nederlandse onderwijsnormen",
                  "✓ Audit logs & controletrails",
                  "✓ Gegevensbescherming op serverniveau",
                  "✓ SURF-ready voor samenwerking",
                  "✓ Regelmatige veiligheidsaudits",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 rounded-2xl border border-border bg-muted/40 p-8 text-center">
            <h3 className="text-xl font-semibold">Beveilig je schooldata nu?</h3>
            <a
              href={DEMO_APP_URL}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Bekijk Schoolpulse demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 mt-20">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Schoolpulse — AVG & 2FA</p>
        </div>
      </footer>
    </div>
  );
}
