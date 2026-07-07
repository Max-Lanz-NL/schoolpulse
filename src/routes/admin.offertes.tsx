import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

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
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "all">("all");
  const [search, setSearch] = useState("");

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

  const selectedQuote = useMemo(
    () => quotes.find((quote) => quote.id === selectedQuoteId) ?? null,
    [quotes, selectedQuoteId],
  );

  const filteredQuotes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return quotes.filter((quote) => {
      if (statusFilter !== "all" && quote.status !== statusFilter) return false;
      if (!term) return true;

      return (
        quote.school_name.toLowerCase().includes(term) ||
        quote.contact_name.toLowerCase().includes(term) ||
        quote.contact_email.toLowerCase().includes(term)
      );
    });
  }, [quotes, search, statusFilter]);

  const quoteCounts = useMemo(
    () =>
      quotes.reduce(
        (acc, quote) => {
          acc.total += 1;
          if (quote.status === "new") acc.new += 1;
          if (quote.status === "in_review") acc.inReview += 1;
          if (quote.status === "quoted") acc.quoted += 1;
          return acc;
        },
        { total: 0, new: 0, inReview: 0, quoted: 0 },
      ),
    [quotes],
  );

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

            {!loading && (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatsCard label="Totaal" value={quoteCounts.total} />
                <StatsCard label="Nieuw" value={quoteCounts.new} />
                <StatsCard label="In beoordeling" value={quoteCounts.inReview} />
                <StatsCard label="Offerte verstuurd" value={quoteCounts.quoted} />
              </div>
            )}

            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold">Alle aanvragen</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-[220px_1fr]">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as QuoteStatus | "all")}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="all">Alle statussen</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Zoek op school, contactnaam of e-mail"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              {loading ? (
                <div className="mt-4 text-sm text-muted-foreground">Offertes laden...</div>
              ) : filteredQuotes.length === 0 ? (
                <div className="mt-4 text-sm text-muted-foreground">
                  {quotes.length === 0
                    ? "Nog geen offerte-aanvragen binnengekomen."
                    : "Geen offertes gevonden met deze filters."}
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[1180px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">School</th>
                        <th className="px-3 py-2">Contact</th>
                        <th className="px-3 py-2">Omvang</th>
                        <th className="px-3 py-2">Modules</th>
                        <th className="px-3 py-2">Startperiode</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Ingediend op</th>
                        <th className="px-3 py-2 text-right">Actie</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredQuotes.map((quote) => (
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
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedQuoteId(quote.id)}
                              className="rounded-md px-2 py-1 text-xs font-semibold text-primary hover:bg-muted"
                            >
                              Bekijken
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          {selectedQuote && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
              <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-background p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">Offerte bekijken</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ingediend op {new Date(selectedQuote.created_at).toLocaleString("nl-NL")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedQuoteId(null)}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
                  >
                    Sluiten
                  </button>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <InfoBlock label="Schoolnaam" value={selectedQuote.school_name} />
                  <InfoBlock label="Contactpersoon" value={selectedQuote.contact_name} />
                  <InfoBlock label="E-mail" value={selectedQuote.contact_email} />
                  <InfoBlock label="Telefoon" value={selectedQuote.contact_phone ?? "-"} />
                  <InfoBlock label="Aantal leerlingen" value={`${selectedQuote.student_count}`} />
                  <InfoBlock label="Aantal medewerkers" value={`${selectedQuote.staff_count}`} />
                  <InfoBlock label="Gewenste startperiode" value={selectedQuote.desired_start_period} />
                  <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</div>
                    <select
                      value={selectedQuote.status}
                      disabled={savingId === selectedQuote.id}
                      onChange={(e) =>
                        void changeStatus(selectedQuote.id, e.target.value as QuoteStatus)
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <LongTextBlock title="Gewenste modules" value={selectedQuote.requested_modules} />
                <LongTextBlock title="Huidige systemen" value={selectedQuote.current_systems} />
                <LongTextBlock
                  title="Aanvullende eisen en wensen"
                  value={selectedQuote.additional_requirements}
                />
              </div>
            </div>
          )}
        </AdminShell>
      )}
    </AdminGuard>
  );
}

function StatsCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="rounded-lg bg-muted/40 px-3 py-2 text-sm">{value}</div>
    </div>
  );
}

function LongTextBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="mt-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="mt-1 rounded-lg bg-muted/40 px-3 py-2 text-sm whitespace-pre-wrap">{value}</div>
    </div>
  );
}
