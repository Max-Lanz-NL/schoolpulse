import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, ArrowLeft, MapPin, Phone } from "lucide-react";
import logo from "@/assets/schoolpulse-logo.png";

export const Route = createFileRoute("/contact")({ component: Contact });

function Contact() {
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
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Contact</h1>
            <p className="mt-3 text-muted-foreground">Vragen over Schoolpulse? Wij helpen je graag.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {[
              { icon: Mail, label: "E-mail", value: "info@schoolpulse.nl" },
              { icon: Phone, label: "Telefoon", value: "+31 20 123 4567" },
              { icon: MapPin, label: "Adres", value: "Amsterdam, Nederland" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-border bg-card p-6 text-center">
                <div className="mx-auto grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</div>
                <div className="mt-1 text-sm font-medium">{value}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-lg font-semibold mb-4">Stuur een bericht</h2>
            <div className="space-y-3">
              <input disabled placeholder="Naam" className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm cursor-not-allowed" />
              <input disabled placeholder="E-mailadres" className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm cursor-not-allowed" />
              <textarea disabled rows={4} placeholder="Uw bericht..." className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm cursor-not-allowed resize-none" />
              <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                📋 In de demo-omgeving is het contactformulier uitgeschakeld. Gebruik het e-mailadres hierboven.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
