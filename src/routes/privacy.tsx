import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ArrowLeft, Lock, Eye, FileCheck } from "lucide-react";
import logo from "@/assets/schoolpulse-logo.png";

export const Route = createFileRoute("/privacy")({ component: Privacy });

function Privacy() {
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
          <div className="flex items-start gap-4 mb-10">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary"><ShieldCheck className="h-6 w-6" /></div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Privacyverklaring</h1>
              <p className="mt-1 text-muted-foreground">Schoolpulse · Versie 1.0 · Demo omgeving</p>
            </div>
          </div>
          <div className="space-y-8 text-sm text-foreground">
            {[
              { icon: Lock, title: "Gegevensverwerking", body: "Schoolpulse verwerkt persoonsgegevens conform de AVG (Algemene Verordening Gegevensbescherming). In de demo-omgeving worden geen echte persoonsgegevens opgeslagen — alle data is fictief en wordt lokaal bewaard in uw browser." },
              { icon: Eye, title: "Welke gegevens verzamelen wij?", body: "In de productieversi worden naam, e-mailadres, rol en schoolgegevens verwerkt voor het functioneren van het platform. Gegevens worden niet gedeeld met derden zonder expliciete toestemming." },
              { icon: FileCheck, title: "Uw rechten", body: "U heeft het recht op inzage, correctie en verwijdering van uw gegevens. Neem hiervoor contact op via privacy@schoolpulse.nl." },
              { icon: ShieldCheck, title: "Beveiliging", body: "Alle communicatie is versleuteld via TLS. Wachtwoorden worden nooit opgeslagen in leesbare vorm. Optioneel is tweestapsverificatie (2FA) beschikbaar." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-primary"><Icon className="h-4 w-4" /></div>
                <div>
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-1 text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
