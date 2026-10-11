import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Check, Clock3, RefreshCw, X } from "lucide-react";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminSupabaseClient, getReadableAdminError, type Profile } from "@/lib/admin-client";

export const Route = createFileRoute("/admin/logins")({
  component: AdminLoginsPage,
});

type LoginRequest = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  school_name: string | null;
  status: "pending";
  created_at: string;
  expires_at: string;
};

function AdminLoginsPage() {
  const [requests, setRequests] = useState<LoginRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: loadError } = await getAdminSupabaseClient().functions.invoke(
      "login-access",
      {
        body: { action: "list" },
      },
    );
    if (loadError) {
      setError(getReadableAdminError(loadError, "Loginverzoeken konden niet worden geladen."));
      setRequests([]);
    } else {
      setRequests((data?.requests ?? []) as LoginRequest[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 10_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const resolve = async (request: LoginRequest, action: "approve" | "deny") => {
    setBusyId(request.id);
    setError(null);
    setNotice(null);
    const { error: resolveError } = await getAdminSupabaseClient().functions.invoke(
      "login-access",
      {
        body: { action, request_id: request.id },
      },
    );
    if (resolveError) {
      setError(
        getReadableAdminError(resolveError, "Het loginverzoek kon niet worden afgehandeld."),
      );
    } else {
      setNotice(
        action === "approve"
          ? `Login voor ${request.email} is goedgekeurd.`
          : `Login voor ${request.email} is afgewezen.`,
      );
    }
    setBusyId(null);
    await load();
  };

  return (
    <AdminGuard>
      {(profile: Profile) => (
        <AdminShell
          profile={profile}
          title="Loginverzoeken"
          subtitle="Keur testaccount-logins goed of wijs ze af"
        >
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-950">
              <div>
                <div className="font-semibold">Tijdelijke testlogin</div>
                <p className="mt-1 text-xs">
                  Na goedkeuring wordt de aanvrager automatisch ingelogd in de browser. Er wordt
                  geen e-mail verstuurd.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void load()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-400/60 bg-white px-3 py-2 text-xs font-semibold hover:bg-amber-100 disabled:opacity-60"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Vernieuwen
              </button>
            </div>

            {notice && (
              <div role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm">
                {notice}
              </div>
            )}
            {error && (
              <div
                role="alert"
                className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            {loading ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Loginverzoeken laden...
              </div>
            ) : requests.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <Clock3 className="mx-auto h-8 w-8 text-muted-foreground/60" />
                <h2 className="mt-3 text-sm font-semibold">Geen openstaande verzoeken</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Nieuwe verzoeken verschijnen hier zolang ze niet verlopen zijn.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <article
                    key={request.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold">{request.full_name || request.email}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{request.email}</div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full bg-muted px-2 py-1">{request.role}</span>
                        {request.school_name && (
                          <span className="rounded-full bg-muted px-2 py-1">
                            {request.school_name}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3 w-3" />
                          {new Date(request.created_at).toLocaleString("nl-NL")}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busyId !== null}
                        onClick={() => void resolve(request, "deny")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted disabled:opacity-60"
                      >
                        <X className="h-3.5 w-3.5" /> Afwijzen
                      </button>
                      <button
                        type="button"
                        disabled={busyId !== null}
                        onClick={() => void resolve(request, "approve")}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                      >
                        <Check className="h-3.5 w-3.5" /> Goedkeuren
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </AdminShell>
      )}
    </AdminGuard>
  );
}
