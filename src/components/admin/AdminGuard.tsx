import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import {
  getAdminSupabaseClient,
  getCurrentProfile,
  getReadableAdminError,
  type Profile,
} from "@/lib/admin-client";

export function AdminGuard({ children }: { children: (profile: Profile) => ReactNode }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = getAdminSupabaseClient();
    let active = true;

    const load = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;

      if (sessionError || !data.session?.user) {
        void navigate({ to: "/admin/login", replace: true });
        setLoading(false);
        return;
      }

      try {
        const currentProfile = await getCurrentProfile(data.session.user.id);
        if (!active) return;
        if (!currentProfile || currentProfile.role !== "platform_admin") {
          setError("Geen toegang: alleen platform_admin mag deze omgeving gebruiken.");
          setProfile(null);
          setLoading(false);
          return;
        }
        setProfile(currentProfile);
        setLoading(false);
      } catch (profileError) {
        if (!active) return;
        setError(getReadableAdminError(profileError, "Profiel kon niet worden geladen."));
        setLoading(false);
      }
    };

    void load();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session?.user) {
        setProfile(null);
        setError(null);
        setLoading(false);
        void navigate({ to: "/admin/login", replace: true });
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  const logout = async () => {
    const supabase = getAdminSupabaseClient();
    setSigningOut(true);
    await supabase.auth.signOut();
    setSigningOut(false);
    void navigate({ to: "/admin/login", replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-sm text-muted-foreground">Admin omgeving laden...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-[var(--shadow-elegant)]">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-warning/15 text-warning">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Geen toegang</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error ?? "Je account heeft geen rechten voor admin.schoolpulse.nl"}
          </p>
          <button
            type="button"
            onClick={logout}
            disabled={signingOut}
            className="mt-6 inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-60"
          >
            Uitloggen
          </button>
        </div>
      </div>
    );
  }

  return <>{children(profile)}</>;
}
