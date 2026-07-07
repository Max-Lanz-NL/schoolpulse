import { useEffect, useState, type ReactNode } from "react";
import { useRole } from "@/lib/role-context";
import logo from "@/assets/schoolpulse-logo.png";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { DOMAIN_ORIGINS } from "@/lib/domains";
import type { Session } from "@supabase/supabase-js";

function hasPlatformAdminRole(session: Session | null): boolean {
  if (!session?.user) return false;

  const appMetadataRole = session.user.app_metadata?.role;
  const userMetadataRole = session.user.user_metadata?.role;
  const appMetadataRoles = session.user.app_metadata?.roles;
  const userMetadataRoles = session.user.user_metadata?.roles;

  if (appMetadataRole === "platform_admin" || userMetadataRole === "platform_admin") {
    return true;
  }

  if (Array.isArray(appMetadataRoles) && appMetadataRoles.includes("platform_admin")) {
    return true;
  }

  if (Array.isArray(userMetadataRoles) && userMetadataRoles.includes("platform_admin")) {
    return true;
  }

  return false;
}

export function DemoGate({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isProductionAppHost =
    mounted &&
    typeof window !== "undefined" &&
    (window.location.hostname === "app.schoolpulse.nl" ||
      window.location.hostname === "admin.schoolpulse.nl");

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-sm text-muted-foreground">Schoolpulse laden...</div>
      </div>
    );
  }

  if (isProductionAppHost) return <ProductionAppGate>{children}</ProductionAppGate>;

  return <DemoAccessGate>{children}</DemoAccessGate>;
}

function DemoAccessGate({ children }: { children: ReactNode }) {
  const { demoUser, setDemoUser } = useRole();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (demoUser) return <>{children}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) return setError("Vul je volledige naam in.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("Vul een geldig e-mailadres in.");
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
            Vul je naam en e-mail in om de interactieve demo te openen. Zo weten we voor wie we onze
            omgeving verbeteren.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                Volledige naam
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Bijv. Anna Bakker"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                E-mailadres
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@school.nl"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {error && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:bg-primary/90"
            >
              Open demo <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-[11px] text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
            <span>
              Je gegevens worden uitsluitend gebruikt om je toegang tot de demo te verlenen. Geen
              spam, geen delen met derden.
            </span>
          </div>
        </div>
        <div className="mt-4 text-center">
          <Link to="/" className="text-xs font-medium text-muted-foreground hover:text-foreground">
            ← Terug naar de website
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProductionAppGate({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [supabase, setSupabase] = useState<ReturnType<typeof getSupabaseBrowserClient> | null>(
    null,
  );
  const isAdminHost =
    typeof window !== "undefined" && window.location.hostname === "admin.schoolpulse.nl";

  useEffect(() => {
    try {
      setSupabase(getSupabaseBrowserClient());
    } catch (clientError) {
      setError((clientError as Error).message);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;
    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) {
          setError("Sessie kon niet worden geladen.");
          setIsLoggedIn(false);
          setIsPlatformAdmin(false);
          setReady(true);
          return;
        }

        const session = data.session;
        setIsLoggedIn(Boolean(session?.user));
        setIsPlatformAdmin(hasPlatformAdminRole(session));
        setReady(true);
      })
      .catch(() => {
        if (!active) return;
        setError("Sessie kon niet worden geladen.");
        setIsLoggedIn(false);
        setIsPlatformAdmin(false);
        setReady(true);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setIsLoggedIn(Boolean(session?.user));
      setIsPlatformAdmin(hasPlatformAdminRole(session));
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Vul een geldig schoolaccount e-mailadres in.");
      return;
    }
    if (password.length < 8) {
      setError("Vul je wachtwoord in.");
      return;
    }

    setBusy(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError) {
      setBusy(false);
      setError("Inloggen mislukt. Controleer je schoolaccount of vraag toegang aan de beheerder.");
      return;
    }

    setBusy(false);
    setPassword("");

    if (isAdminHost && typeof window !== "undefined") {
      window.location.assign("/app");
    }
  };

  useEffect(() => {
    if (!supabase || !ready || !isAdminHost || !isLoggedIn || isPlatformAdmin) {
      return;
    }

    void supabase.auth.signOut().finally(() => {
      if (typeof window !== "undefined") {
        window.location.replace(DOMAIN_ORIGINS.marketing);
      }
    });
  }, [isAdminHost, isLoggedIn, isPlatformAdmin, ready, supabase]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/70 via-background to-background px-4 py-10">
        <div className="text-sm text-muted-foreground">Schoolpulse Login laden...</div>
      </div>
    );
  }

  if (isAdminHost && isLoggedIn && !isPlatformAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/70 via-background to-background px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-7 text-center shadow-[var(--shadow-elegant)]">
          <h1 className="text-xl font-bold tracking-tight">Admin omgeving afgesloten</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Alleen accounts met de rol <strong>platform_admin</strong> hebben toegang. Je wordt om
            privacy- en databescherming teruggestuurd.
          </p>
        </div>
      </div>
    );
  }

  if (isLoggedIn) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/70 via-background to-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <img src={logo} alt="Schoolpulse" className="h-11 w-11" />
          <span className="text-xl font-bold tracking-tight">Schoolpulse Login</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-elegant)]">
          <h1 className="text-xl font-bold tracking-tight">
            {isAdminHost ? "Admin inloggen" : "Inloggen met schoolaccount"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdminHost
              ? "Alleen platform_admin accounts hebben toegang tot admin.schoolpulse.nl."
              : "Alleen geregistreerde Schoolpulse accounts hebben toegang tot de productieomgeving."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                Schoolaccount (e-mail)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@school.nl"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoFocus
                autoComplete="username"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">Wachtwoord</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy || !supabase}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:bg-primary/90 disabled:opacity-60"
            >
              Inloggen <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-[11px] text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
            <span>
              Gebruik alleen je officiële schoolaccount. Niet-geregistreerde accounts worden
              geweigerd.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
