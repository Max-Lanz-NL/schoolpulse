import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  getReadableAdminError,
  listQuoteRequests,
  updateQuoteRequestStatus,
  type QuoteRequest,
  type QuoteStatus,
} from "@/lib/admin-client";

export const Route = createFileRoute("/admin/offertes")({
  component: AdminOffertesPage,
});

const statusOptions: { value: QuoteStatus; label: string }[] = [
  { value: "new", label: "Nieuw" },
  { value: "in_review", label: "In beoordeling" },
  { value: "quoted", label: "Offerte verstuurd" },
  { value: "closed", label: "Afgesloten" },
];

function AdminOffertesPage() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listQuoteRequests();
      setQuotes(data);
      setLoading(false);
    } catch (loadError) {
      setError(getReadableAdminError(loadError, "Offertes konden niet worden geladen."));
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const changeStatus = async (quoteId: string, status: QuoteStatus) => {
    setSavingId(quoteId);
    setError(null);
    try {
      await updateQuoteRequestStatus(quoteId, status);
      setQuotes((prev) => prev.map((q) => (q.id === quoteId ? { ...q, status } : q)));
    } catch (updateError) {
      setError(getReadableAdminError(updateError, "Status bijwerken is mislukt."));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AdminGuard>
      {(profile) => (
        <AdminShell
          profile={profile}
          title="Offerte-aanvragen"
          subtitle="Bekijk en volg alle inkomende offerte-aanvragen"
        >
          <div className="space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold">Alle aanvragen</h2>
              {loading ? (
                <div className="mt-4 text-sm text-muted-foreground">Offertes laden...</div>
              ) : quotes.length === 0 ? (
                <div className="mt-4 text-sm text-muted-foreground">Nog geen offerte-aanvragen binnengekomen.</div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[1100px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">School</th>
                        <th className="px-3 py-2">Contact</th>
                        <th className="px-3 py-2">Omvang</th>
                        <th className="px-3 py-2">Modules</th>
                        <th className="px-3 py-2">Startperiode</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Ingediend op</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotes.map((quote) => (
                        <tr key={quote.id} className="border-t border-border/70 align-top">
                          <td className="px-3 py-2 font-medium">{quote.school_name}</td>
                          <td className="px-3 py-2">
                            <div>{quote.contact_name}</div>
                            <div className="text-xs text-muted-foreground">{quote.contact_email}</div>
                            {quote.contact_phone && (
                              <div className="text-xs text-muted-foreground">{quote.contact_phone}</div>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <div>{quote.student_count} leerlingen</div>
                            <div className="text-xs text-muted-foreground">{quote.staff_count} medewerkers</div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="line-clamp-3 whitespace-pre-wrap">{quote.requested_modules}</div>
                            <div className="mt-1 text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap">
                              {quote.current_systems}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground line-clamp-2 whitespace-pre-wrap">
                              {quote.additional_requirements}
                            </div>
                          </td>
                          <td className="px-3 py-2">{quote.desired_start_period}</td>
                          <td className="px-3 py-2">
                            <select
                              value={quote.status}
                              disabled={savingId === quote.id}
                              onChange={(e) => void changeStatus(quote.id, e.target.value as QuoteStatus)}
                              className="rounded-md border border-border bg-background px-2 py-1"
                            >
                              {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {new Date(quote.created_at).toLocaleString("nl-NL")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </AdminShell>
      )}
    </AdminGuard>
  );
}
