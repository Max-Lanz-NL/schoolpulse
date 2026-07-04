import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { documenten } from "@/lib/demo-data";
import { FileText, Download, MoreHorizontal, FolderPlus, Upload, UserPlus, X, Users } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/documenten")({ component: Bestanden });

const filters = ["Alles", "Wiskunde", "Nederlands", "Scheikunde", "Engels", "Algemeen"];

function Bestanden() {
  const [filter, setFilter] = useState<string>("Alles");
  const [shareFile, setShareFile] = useState<string | null>(null);
  const [extraShares, setExtraShares] = useState<Record<string, string[]>>({});

  const zichtbaar = documenten.filter((d) => filter === "Alles" || d.vak === filter);

  const addShare = (file: string, target: string) => {
    setExtraShares((s) => ({ ...s, [file]: [...(s[file] ?? []), target] }));
  };
  const removeShare = (file: string, target: string) => {
    setExtraShares((s) => ({ ...s, [file]: (s[file] ?? []).filter((t) => t !== target) }));
  };

  return (
    <AppShell title="Bestanden" subtitle="Centrale opslag van lesmateriaal en documenten">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
          <Upload className="h-4 w-4" /> Uploaden
        </button>
        <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold hover:bg-muted">
          <FolderPlus className="h-4 w-4" /> Nieuwe map
        </button>
        <div className="ml-auto flex flex-wrap gap-2 text-xs">
          {filters.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`rounded-full px-3 py-1 transition-colors ${filter === t ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <Card title={`Bestanden ${filter !== "Alles" ? `— ${filter}` : ""}`}>
        {zichtbaar.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Geen bestanden in categorie "{filter}".
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left">Naam</th>
                  <th className="px-4 py-2 text-left">Vak</th>
                  <th className="px-4 py-2 text-left">Gedeeld met</th>
                  <th className="px-4 py-2 text-left">Versie</th>
                  <th className="px-4 py-2 text-left">Grootte</th>
                  <th className="px-4 py-2 text-left">Datum</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {zichtbaar.map((d) => {
                  const shared = [...d.gedeeldMet, ...(extraShares[d.naam] ?? [])];
                  return (
                    <tr key={d.naam} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="h-4 w-4" /></div>
                          <span className="font-medium">{d.naam}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{d.vak}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {shared.slice(0, 2).map((s) => (
                            <span key={s} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                              <Users className="h-2.5 w-2.5" /> {s}
                            </span>
                          ))}
                          {shared.length > 2 && <span className="text-[10px] text-muted-foreground">+{shared.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">{d.versie}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{d.grootte}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d.datum}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setShareFile(d.naam)}
                            className="rounded-md p-1.5 hover:bg-muted"
                            aria-label="Delen"
                          >
                            <UserPlus className="h-4 w-4" />
                          </button>
                          <button className="rounded-md p-1.5 hover:bg-muted" aria-label="Download"><Download className="h-4 w-4" /></button>
                          <button className="rounded-md p-1.5 hover:bg-muted"><MoreHorizontal className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {shareFile && (
        <ShareModal
          file={shareFile}
          origineel={documenten.find((d) => d.naam === shareFile)?.gedeeldMet ?? []}
          extras={extraShares[shareFile] ?? []}
          onAdd={(t) => addShare(shareFile, t)}
          onRemove={(t) => removeShare(shareFile, t)}
          onClose={() => setShareFile(null)}
        />
      )}
    </AppShell>
  );
}

const suggesties = ["Klas V4A", "Klas V4B", "Klas V5A", "Klas H4A", "Sectie Wiskunde", "Sectie Nederlands", "M. Jansen", "L. de Boer", "S. Green", "K. Visser", "Bovenbouw", "Onderbouw", "Iedereen"];

function ShareModal({ file, origineel, extras, onAdd, onRemove, onClose }: {
  file: string; origineel: string[]; extras: string[];
  onAdd: (target: string) => void; onRemove: (target: string) => void; onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const shared = [...origineel, ...extras];
  const filtered = suggesties.filter((s) => s.toLowerCase().includes(q.toLowerCase()) && !shared.includes(s));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Delen</div>
            <div className="truncate text-sm font-semibold">{file}</div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Zoek een persoon, klas of groep..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            autoFocus
          />
          <div className="mt-3 max-h-56 overflow-y-auto rounded-lg border border-border">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">Geen suggesties</div>
            ) : filtered.map((s) => (
              <button
                key={s}
                onClick={() => { onAdd(s); setQ(""); }}
                className="flex w-full items-center gap-2 border-b border-border px-3 py-2 text-left text-sm last:border-b-0 hover:bg-muted"
              >
                <Users className="h-4 w-4 text-muted-foreground" /> {s}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Al gedeeld met · klik om te verwijderen</div>
            <div className="flex flex-wrap gap-1.5">
              {shared.length === 0 && <span className="text-xs text-muted-foreground">Nog niemand</span>}
              {shared.map((s) => {
                const isExtra = extras.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => isExtra && onRemove(s)}
                    disabled={!isExtra}
                    title={isExtra ? "Klik om te verwijderen" : "Standaard – niet te verwijderen"}
                    className={`group inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors ${isExtra ? "bg-primary/10 text-primary hover:bg-destructive/15 hover:text-destructive" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
                  >
                    <Users className="h-3 w-3" /> {s}
                    {isExtra && <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-3">
          <button onClick={onClose} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Klaar</button>
        </div>
      </div>
    </div>
  );
}
