import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ArrowLeft, CheckCircle2 } from "lucide-react";
import logo from "@/assets/schoolpulse-logo.png";

export const Route = createFileRoute("/voorwaarden")({ component: Voorwaarden });

function Voorwaarden() {
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
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="h-6 w-6" /></div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gebruiksvoorwaarden</h1>
              <p className="mt-1 text-muted-foreground">Schoolpulse · Versie 1.0 · Demo omgeving</p>
            </div>
          </div>
          <div className="space-y-6 text-sm">
            {[
              { title: "1. Gebruik van de demo", body: "De demo-omgeving van Schoolpulse is uitsluitend bedoeld voor evaluatie- en demonstratiedoeleinden. Alle weergegeven data is fictief." },
              { title: "2. Intellectueel eigendom", body: "Alle onderdelen van Schoolpulse, inclusief software, ontwerp en content, zijn eigendom van Schoolpulse B.V. en mogen niet zonder toestemming worden gebruikt of gereproduceerd." },
              { title: "3. Aansprakelijkheid", body: "Schoolpulse is niet aansprakelijk voor schade die voortvloeit uit het gebruik van de demo-omgeving. Functionaliteit kan zonder kennisgeving wijzigen." },
              { title: "4. Toepasselijk recht", body: "Op deze voorwaarden is Nederlands recht van toepassing. Eventuele geschillen worden voorgelegd aan de bevoegde rechter in Amsterdam." },
            ].map(({ title, body }) => (
              <div key={title} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
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
