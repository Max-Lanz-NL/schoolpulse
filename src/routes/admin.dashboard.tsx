import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { listAuditLogs, listProfiles, listQuoteRequests, listSchools, type AdminRole } from "@/lib/admin-client";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolsCount, setSchoolsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [openQuotesCount, setOpenQuotesCount] = useState(0);
  const [roleCounts, setRoleCounts] = useState<Record<AdminRole, number>>({
    platform_admin: 0,
    school_admin: 0,
    teacher: 0,
    student: 0,
    parent: 0,
  });
  const [recentChanges, setRecentChanges] = useState<
    { id: number; action: string; table: string; created_at: string }[]
  >([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [schools, profiles, logs, quotes] = await Promise.all([
          listSchools(),
          listProfiles(),
          listAuditLogs(10),
          listQuoteRequests(),
        ]);
        if (!active) return;

        setSchoolsCount(schools.length);
        setUsersCount(profiles.length);
        setOpenQuotesCount(quotes.filter((quote) => quote.status === "new" || quote.status === "in_review").length);
        setRoleCounts(
          profiles.reduce(
            (acc, profile) => {
              acc[profile.role] += 1;
              return acc;
            },
            {
              platform_admin: 0,
              school_admin: 0,
              teacher: 0,
              student: 0,
              parent: 0,
            } as Record<AdminRole, number>,
          ),
        );
        setRecentChanges(
          logs.map((log) => ({
            id: log.id,
            action: log.action,
            table: log.table_name,
            created_at: log.created_at,
          })),
        );
        setLoading(false);
      } catch {
        if (!active) return;
        setError("Dashboard data kon niet worden geladen.");
        setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const cards = useMemo(
    () => [
      { label: "Scholen", value: schoolsCount },
      { label: "Gebruikers", value: usersCount },
      { label: "Platform admins", value: roleCounts.platform_admin },
      { label: "Open offertes", value: openQuotesCount },
    ],
    [schoolsCount, usersCount, roleCounts.platform_admin, openQuotesCount],
  );

  return (
    <AdminGuard>
      {(profile) => (
        <AdminShell
          profile={profile}
          title="Admin dashboard"
          subtitle="Overzicht van scholen, accounts en recente wijzigingen"
        >
          {loading && <div className="text-sm text-muted-foreground">Dashboard laden...</div>}
          {!loading && error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          {!loading && !error && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                  <div key={card.label} className="rounded-2xl border border-border bg-card p-5">
                    <div className="text-xs font-medium text-muted-foreground">{card.label}</div>
                    <div className="mt-2 text-3xl font-bold tracking-tight">{card.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="text-sm font-semibold">Gebruikers per rol</h2>
                  <div className="mt-4 space-y-2 text-sm">
                    {Object.entries(roleCounts).map(([role, count]) => (
                      <div
                        key={role}
                        className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2"
                      >
                        <span className="uppercase tracking-wide text-muted-foreground">
                          {role}
                        </span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="text-sm font-semibold">Recente wijzigingen</h2>
                  <div className="mt-4 space-y-2 text-sm">
                    {recentChanges.length === 0 && (
                      <div className="text-muted-foreground">Nog geen wijzigingen beschikbaar.</div>
                    )}
                    {recentChanges.map((change) => (
                      <div key={change.id} className="rounded-lg bg-muted/40 px-3 py-2">
                        <div className="font-medium">
                          {change.action} op {change.table}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(change.created_at).toLocaleString("nl-NL")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </AdminShell>
      )}
    </AdminGuard>
  );
}
