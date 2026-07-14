import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

import logo from "@/assets/schoolpulse-logo.png";
import {
  getAdminSupabaseClient,
  getCurrentProfile,
  getReadableAdminError,
} from "@/lib/admin-client";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function getSignInErrorMessage(error: { code?: string; message?: string } | null): string {
  switch (error?.code) {
    case "email_not_confirmed":
      return "Je e-mailadres is nog niet bevestigd in Supabase Auth.";
    case "invalid_credentials":
      return "Supabase accepteert deze combinatie van e-mailadres en wachtwoord niet.";
    case "user_banned":
      return "Dit account is tijdelijk geblokkeerd in Supabase Auth.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Er zijn te veel inlogpogingen gedaan. Wacht even en probeer opnieuw.";
    case "weak_password":
      return "Dit wachtwoord voldoet niet aan de ingestelde beveiligingseisen.";
    default:
      return error?.code
        ? `Supabase-login mislukt (code: ${error.code}).`
        : "Supabase kon dit account niet inloggen.";
  }
}

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getAdminSupabaseClient();
    let active = true;

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!active) return;
        if (!data.session?.user) {
          setLoading(false);
          return;
        }
        try {
          const profile = await getCurrentProfile(data.session.user.id);
          if (!active) return;
          if (profile?.role === "platform_admin") {
            void navigate({ to: "/admin/dashboard", replace: true });
            return;
          }
          await supabase.auth.signOut();
          setLoading(false);
        } catch (profileError) {
          if (!active) return;
          await supabase.auth.signOut();
          setError(getReadableAdminError(profileError, "Profiel kon niet worden geladen."));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getAdminSupabaseClient();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Vul een geldig e-mailadres in.");
      return;
    }
    if (!password) {
      setError("Vul je wachtwoord in.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError || !data.user) {
      setSubmitting(false);
      setError(getSignInErrorMessage(signInError));
      return;
    }

    try {
      const profile = await getCurrentProfile(data.user.id);
      if (!profile || profile.role !== "platform_admin") {
        await supabase.auth.signOut();
        setSubmitting(false);
        setError("Geen toegang: alleen platform_admin accounts mogen inloggen.");
        return;
      }

      setSubmitting(false);
      void navigate({ to: "/admin/dashboard", replace: true });
    } catch (profileError) {
      await supabase.auth.signOut();
      setSubmitting(false);
      setError(getReadableAdminError(profileError, "Profielcontrole is mislukt. Probeer opnieuw."));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-sm text-muted-foreground">Admin login laden...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-muted/70 via-background to-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <img src={logo} alt="Schoolpulse" className="h-11 w-11" />
          <span className="text-xl font-bold tracking-tight">Schoolpulse Admin</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-elegant)]">
          <h1 className="text-xl font-bold tracking-tight">Platform beheer login</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Alleen platform_admin accounts hebben toegang tot admin.schoolpulse.nl.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                E-mailadres
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@schoolpulse.nl"
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
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] hover:bg-primary/90 disabled:opacity-60"
            >
              Inloggen <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-[11px] text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
            <span>Niet-platform_admin accounts worden automatisch geweigerd en uitgelogd.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
