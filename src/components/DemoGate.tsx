import { useState, type ReactNode } from "react";
import { useRole } from "@/lib/role-context";
import logo from "@/assets/schoolpulse-logo.png";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function DemoGate({ children }: { children: ReactNode }) {
  const { demoUser, setDemoUser } = useRole();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (demoUser) return <>{children}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) return setError("Vul je volledige naam in.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Vul een geldig e-mailadres in.");
    setError(null);
    setDemoUser({ name: name.trim(), email: email.trim() });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/70 via-background to-background px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <img src={logo} alt="Schoolpulse" className="h-11 w-11" />
          <span className="text-xl font-bold tracking-tight">Schoolpulse</span>
        </Link>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-elegant)]">
          <h1 className="text-xl font-bold tracking-tight">Toegang tot de demo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vul je naam en e-mail in om de interactieve demo te openen. Zo weten we voor wie we onze omgeving verbeteren.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">Volledige naam</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bijv. Anna Bakker"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">E-mailadres</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@school.nl"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {error && <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{error}</div>}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:bg-primary/90"
            >
              Open demo <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-[11px] text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
            <span>Je gegevens worden uitsluitend gebruikt om je toegang tot de demo te verlenen. Geen spam, geen delen met derden.</span>
          </div>
        </div>
        <div className="mt-4 text-center">
          <Link to="/" className="text-xs font-medium text-muted-foreground hover:text-foreground">← Terug naar de website</Link>
        </div>
      </div>
    </div>
  );
}
