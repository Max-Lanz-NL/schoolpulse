import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { documenten } from "@/lib/demo-data";
import { FileText, Download, MoreHorizontal, FolderPlus, Upload } from "lucide-react";

export const Route = createFileRoute("/app/documenten")({ component: Documenten });

function Documenten() {
  return (
    <AppShell title="Documenten" subtitle="Centrale opslag van lesmateriaal en bestanden">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
          <Upload className="h-4 w-4" /> Uploaden
        </button>
        <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold hover:bg-muted">
          <FolderPlus className="h-4 w-4" /> Nieuwe map
        </button>
        <div className="ml-auto flex gap-2 text-xs">
          {["Alles", "Wiskunde", "Nederlands", "Scheikunde", "Engels", "Algemeen"].map((t, i) => (
            <button key={t} className={`rounded-full px-3 py-1 ${i === 0 ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>{t}</button>
          ))}
        </div>
      </div>

      <Card title="Recente documenten">
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">Naam</th>
                <th className="px-4 py-2 text-left">Vak</th>
                <th className="px-4 py-2 text-left">Versie</th>
                <th className="px-4 py-2 text-left">Grootte</th>
                <th className="px-4 py-2 text-left">Datum</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {documenten.map((d) => (
                <tr key={d.naam} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="h-4 w-4" /></div>
                      <span className="font-medium">{d.naam}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.vak}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">{d.versie}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.grootte}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.datum}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button className="rounded-md p-1.5 hover:bg-muted"><Download className="h-4 w-4" /></button>
                      <button className="rounded-md p-1.5 hover:bg-muted"><MoreHorizontal className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
