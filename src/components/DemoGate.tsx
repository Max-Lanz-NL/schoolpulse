import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, ArrowRight } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

import logo from "@/assets/schoolpulse-logo.png";
import type { Role } from "@/lib/demo-data";
import { useRole } from "@/lib/role-context";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { ProductionApp } from "@/components/ProductionApp";
import { PrivilegedMfaGate } from "@/components/security/PrivilegedMfaGate";

export function DemoGate({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isProductionAppHost =
    mounted &&
    typeof window !== "undefined" &&
    (window.location.hostname === "app.schoolpulse.nl" ||
      import.meta.env.VITE_FORCE_PRODUCTION_APP === "true");
  const isEmailOnlyTestMode =
    mounted &&
    typeof window !== "undefined" &&
    window.location.hostname === "app.schoolpulse.nl" &&
    import.meta.env.VITE_EMAIL_ONLY_TEST_MODE !== "false";

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-sm text-muted-foreground">Schoolpulse laden...</div>
      </div>
    );
  }

  // Temporary: test identities use local demo fixtures. Disable before real users/data or Azure SSO.
  if (isEmailOnlyTestMode) {
    return <DemoAccessGate requireEmailOnly>{children}</DemoAccessGate>;
  }

  if (isProductionAppHost) return <ProductionAppGate>{children}</ProductionAppGate>;

  return <DemoAccessGate>{children}</DemoAccessGate>;
}

function DemoAccessGate({
  children,
  requireEmailOnly = false,
}: {
  children: ReactNode;
  requireEmailOnly?: boolean;
}) {
  const { demoUser, setDemoUser } = useRole();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [accessGranted, setAccessGranted] = useState(false);

  if (requireEmailOnly ? accessGranted : demoUser) {
    return (
      <>
        {requireEmailOnly && (
          <div className="bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-950">
            TESTMODUS — fictieve voorbeeldgegevens; er is niet gecontroleerd of dit e-mailadres van
            jou is.
          </div>
        )}
        {children}
      </>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireEmailOnly && (!name.trim() || name.trim().length < 2)) {
      return setError("Vul je volledige naam in.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("Vul een geldig e-mailadres in.");
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    setDemoUser({
      name: requireEmailOnly ? normalizedEmail.split("@")[0] : name.trim(),
      email: normalizedEmail,
    });
    setAccessGranted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/70 via-background to-background px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <img src={logo} alt="Schoolpulse" className="h-11 w-11" />
          <span className="text-xl font-bold tracking-tight">Schoolpulse</span>
        </Link>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-elegant)]">
          <h1 className="text-xl font-bold tracking-tight">
            {requireEmailOnly ? "Tijdelijke testtoegang" : "Toegang tot de demo"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {requireEmailOnly
              ? "Vul een e-mailadres in om de app met fictieve testgegevens te openen. Er wordt geen e-mail verstuurd en het adres wordt niet geverifieerd."
              : "Vul je naam en e-mail in om de interactieve demo te openen. Zo weten we voor wie we onze omgeving verbeteren."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {!requireEmailOnly && (
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
            )}
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                E-mailadres
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={requireEmailOnly ? "test@schoolpulse.nl" : "naam@school.nl"}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoFocus={requireEmailOnly}
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
              {requireEmailOnly ? "Open testapp" : "Open demo"}
              <ArrowRight className="h-4 w-4" />
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

type ProductionRole = "platform_admin" | "school_admin" | "teacher" | "student" | "parent";

type ProductionProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: ProductionRole;
  school_name: string | null;
  school_id: string | null;
  created_at: string;
};

const allowedProductionRoles = new Set<ProductionRole>([
  "platform_admin",
  "school_admin",
  "teacher",
  "student",
  "parent",
]);

function toDemoRole(role: ProductionRole): Role {
  const roleMap: Record<ProductionRole, Role> = {
    platform_admin: "directie",
    school_admin: "teamleider",
    teacher: "docent",
    student: "leerling",
    parent: "ouder",
  };
  return roleMap[role];
}

function ProductionAppGate({ children }: { children: ReactNode }) {
  const { setRole } = useRole();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<ProductionProfile | null>(null);
  const [supabase, setSupabase] = useState<ReturnType<typeof getSupabaseBrowserClient> | null>(
    null,
  );

  useEffect(() => {
    try {
      setSupabase(getSupabaseBrowserClient());
    } catch (clientError) {
      setError((clientError as Error).message);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!profile) return;
    setRole(toDemoRole(profile.role));
  }, [profile, setRole]);

  useEffect(() => {
    if (!supabase) return;

    let active = true;

    const loadProfile = async (userId: string): Promise<ProductionProfile | null> => {
      const { data: loadedProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id,email,full_name,role,school_name,school_id,created_at,is_blocked")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        setError("Profiel kon niet worden geladen. Neem contact op met je beheerder.");
        return null;
      }

      if (!loadedProfile) {
        setError("Je account heeft nog geen Schoolpulse profiel. Vraag toegang bij je beheerder.");
        return null;
      }

      if (loadedProfile.is_blocked) {
        setError("Dit account is geblokkeerd. Neem contact op met je beheerder.");
        return null;
      }

      if (!allowedProductionRoles.has(loadedProfile.role as ProductionRole)) {
        setError("Je accountrol is ongeldig. Neem contact op met je beheerder.");
        return null;
      }

      if (!loadedProfile.school_id && loadedProfile.role !== "platform_admin") {
        setError(
          "Je account is nog niet aan een school gekoppeld. Vraag je beheerder om dit te regelen.",
        );
        return null;
      }

      return loadedProfile as ProductionProfile;
    };

    const syncSession = async (session: Session | null) => {
      if (!active) return;
      if (!session?.user) {
        setIsLoggedIn(false);
        setProfile(null);
        setReady(true);
        return;
      }

      setIsLoggedIn(true);
      const loadedProfile = await loadProfile(session.user.id);
      if (!active) return;
      setProfile(loadedProfile);
      setReady(true);
    };

    supabase.auth
      .getSession()
      .then(async ({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) {
          setError("Sessie kon niet worden geladen.");
          setIsLoggedIn(false);
          setProfile(null);
          setReady(true);
          return;
        }

        await syncSession(data.session);
      })
      .catch(() => {
        if (!active) return;
        setError("Sessie kon niet worden geladen.");
        setIsLoggedIn(false);
        setProfile(null);
        setReady(true);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session);
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
    setBusy(true);
    setError(null);
    setNotice(null);

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}${window.location.pathname}${window.location.search}`,
      },
    });

    if (signInError) {
      setBusy(false);
      setError(
        "De inloglink kon niet worden verstuurd. Controleer je e-mailadres en probeer opnieuw.",
      );
      return;
    }

    setBusy(false);
    setNotice("Als dit e-mailadres bij een Schoolpulse-account hoort, ontvang je een inloglink.");
  };

  const signOut = async () => {
    if (!supabase) return;
    setBusy(true);
    await supabase.auth.signOut();
    setBusy(false);
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/70 via-background to-background px-4 py-10">
        <div className="text-sm text-muted-foreground">Schoolpulse Login laden...</div>
      </div>
    );
  }

  if (isLoggedIn && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/70 via-background to-background px-4 py-10">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-[var(--shadow-elegant)]">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-warning/15 text-warning">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Geen toegang tot Schoolpulse</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Je bent ingelogd, maar je profiel is niet gekoppeld of heeft geen geldige rol.
          </p>
          {error && (
            <div className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
              {error}
            </div>
          )}
          <button
            type="button"
            onClick={signOut}
            disabled={busy}
            className="mt-6 inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-60"
          >
            Uitloggen
          </button>
        </div>
      </div>
    );
  }

  if (isLoggedIn && profile) {
    const app = <ProductionApp profile={profile} supabase={supabase!} onSignOut={signOut} />;
    return ["platform_admin", "school_admin"].includes(profile.role) ? (
      <PrivilegedMfaGate supabase={supabase!} onSignOut={signOut}>
        {app}
      </PrivilegedMfaGate>
    ) : (
      app
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/70 via-background to-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <img src={logo} alt="Schoolpulse" className="h-11 w-11" />
          <span className="text-xl font-bold tracking-tight">Schoolpulse Login</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-elegant)]">
          <h1 className="text-xl font-bold tracking-tight">Inloggen met schoolaccount</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vul je e-mailadres in. We sturen je een eenmalige inloglink; een wachtwoord is niet
            nodig.
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
            {notice && (
              <div
                role="status"
                className="rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-foreground"
              >
                {notice}
              </div>
            )}
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
              {busy ? "Inloglink versturen..." : "Stuur inloglink"}{" "}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-[11px] text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
            <span>
              Gebruik het e-mailadres dat aan je officiële schoolaccount is gekoppeld. Alleen
              bestaande accounts kunnen inloggen.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
