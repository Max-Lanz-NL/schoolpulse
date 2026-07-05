import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { importVoorbeeldData } from "@/lib/demo-data";
import { useRole } from "@/lib/role-context";
import { useState } from "react";
import { toast } from "sonner";
import { Upload, CheckCircle2, ArrowRight, Database } from "lucide-react";

export const Route = createFileRoute("/app/import")({ component: ImportPage });

type Bron = "magister" | "somtoday" | "csv" | null;
type Kolom = "Leerlingnummer" | "Naam" | "Klas" | "Geboortedatum" | "Ouder e-mail" | "Negeer";
const kolomOpties: Kolom[] = ["Leerlingnummer", "Naam", "Klas", "Geboortedatum", "Ouder e-mail", "Negeer"];

function ImportPage() {
  const { role } = useRole();

  if (role !== "directie") {
    return (
      <AppShell title="Data importeren" subtitle="Importeer leerlingendata vanuit Magister of Somtoday">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Database className="h-10 w-10 text-muted-foreground/40" />
          <div className="text-sm font-semibold text-muted-foreground">Alleen beschikbaar voor directie.</div>
        </div>
      </AppShell>
    );
  }

  return <ImportWizard />;
}

function ImportWizard() {
  const [stap, setStap] = useState(1);
  const [bron, setBron] = useState<Bron>(null);
  const [previewData, setPreviewData] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, Kolom>>({});
  const [progress, setProgress] = useState(0);
  const [klaar, setKlaar] = useState(false);

  const laadVoorbeeldData = (b: Bron) => {
    setBron(b);
    if (b === "magister") {
      setPreviewData(importVoorbeeldData.magister as unknown as Record<string, string>[]);
      setMapping({ leerlingnr: "Leerlingnummer", naam: "Naam", klas: "Klas", geboortedatum: "Geboortedatum", ouder_email: "Ouder e-mail" });
    } else if (b === "somtoday") {
      setPreviewData(importVoorbeeldData.somtoday as unknown as Record<string, string>[]);
      setMapping({ studentnummer: "Leerlingnummer", volledigenaam: "Naam", stamgroep: "Klas", email_ouder: "Ouder e-mail" });
    } else {
      setPreviewData([]);
      setMapping({});
    }
    setStap(2);
    toast.success("Voorbeelddata geladen");
  };

  const startImport = () => {
    setStap(3);
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setKlaar(true);
        toast.success("Import voltooid!");
      }
    }, 200);
  };

  const kolommen = previewData.length > 0 ? Object.keys(previewData[0]) : [];

  return (
    <AppShell title="Data importeren" subtitle="Importeer leerlingendata vanuit Magister of Somtoday">
      <div className="mb-6 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${stap >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{s}</div>
            {s < 3 && <div className={`h-px w-8 ${stap > s ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
        <div className="ml-2 text-xs text-muted-foreground">
          {stap === 1 ? "Bron kiezen" : stap === 2 ? "Mapping controleren" : "Bevestigen & importeren"}
        </div>
      </div>

      {stap === 1 && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {([
              { id: "magister" as Bron, label: "Magister CSV", desc: "Exporteer leerlingenlijst als CSV uit Magister", emoji: "🎓" },
              { id: "somtoday" as Bron, label: "Somtoday Export", desc: "Importeer via Somtoday XML/CSV export", emoji: "📋" },
              { id: "csv" as Bron, label: "Handmatig CSV", desc: "Upload een eigen CSV-bestand", emoji: "📁" },
            ]).map((opt) => (
              <button
                key={opt.id}
                onClick={() => opt.id !== "csv" ? laadVoorbeeldData(opt.id) : (setBron(opt.id), setStap(2))}
                className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-center transition-all hover:border-primary hover:shadow ${bron === opt.id ? "border-primary bg-primary/5" : "border-border bg-card"}`}
              >
                <div className="text-4xl">{opt.emoji}</div>
                <div className="text-sm font-bold">{opt.label}</div>
                <div className="text-xs text-muted-foreground">{opt.desc}</div>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
            <div className="text-sm font-semibold text-muted-foreground">Sleep een bestand hierheen of klik om te uploaden</div>
            <div className="mt-1 text-xs text-muted-foreground">Ondersteunde formaten: .csv, .xlsx, .xml</div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => laadVoorbeeldData("magister")}
              className="text-xs font-semibold text-primary underline"
            >
              Of gebruik voorbeelddata (Magister)
            </button>
          </div>
        </div>
      )}

      {stap === 2 && (
        <div className="space-y-4">
          <Card title="Kolom mapping">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="pb-2 pr-4">CSV kolom</th>
                    <th className="pb-2 pr-4">Koppel aan</th>
                    {previewData.slice(0, 3).map((_, i) => (
                      <th key={i} className="pb-2 pr-4">Rij {i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {kolommen.map((k) => (
                    <tr key={k}>
                      <td className="py-2 pr-4 font-mono text-muted-foreground">{k}</td>
                      <td className="py-2 pr-4">
                        <select
                          value={mapping[k] ?? "Negeer"}
                          onChange={(e) => setMapping((m) => ({ ...m, [k]: e.target.value as Kolom }))}
                          className="rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary"
                        >
                          {kolomOpties.map((o) => <option key={o}>{o}</option>)}
                        </select>
                      </td>
                      {previewData.slice(0, 3).map((row, i) => (
                        <td key={i} className="py-2 pr-4 text-muted-foreground">{String(row[k] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="flex justify-between">
            <button onClick={() => setStap(1)} className="rounded-lg border border-border px-4 py-2 text-sm">Terug</button>
            <button onClick={() => setStap(3)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Doorgaan <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {stap === 3 && (
        <div className="space-y-4">
          {!klaar ? (
            <>
              <Card title="Samenvatting">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><div className="text-2xl font-bold">{previewData.length || 3}</div><div className="text-xs text-muted-foreground">Leerlingen</div></div>
                  <div><div className="text-2xl font-bold">1</div><div className="text-xs text-muted-foreground">Klassen</div></div>
                  <div><div className="text-2xl font-bold">{previewData.length || 3}</div><div className="text-xs text-muted-foreground">Ouder e-mails</div></div>
                </div>
              </Card>

              <Card title="Ouder koppeling">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Elke ouder ontvangt automatisch een persoonlijke koppelcode via e-mail.
                    Na inloggen met de code worden ze direct aan hun kind gekoppeld.
                  </p>
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Voorbeeld e-mail</div>
                    <div className="space-y-2 rounded-lg border border-border bg-background p-4 text-xs">
                      <div><strong>Van:</strong> noreply@schoolpulse.nl</div>
                      <div><strong>Aan:</strong> p.devries@email.nl</div>
                      <div><strong>Onderwerp:</strong> Uw toegang tot Schoolpulse — Sanne de Vries</div>
                      <hr className="border-border" />
                      <p>Beste Petra de Vries,</p>
                      <p>Uw kind Sanne de Vries is ingeschreven op onze school. Met de onderstaande koppelcode krijgt u toegang tot het Schoolpulse ouderportaal.</p>
                      <div className="my-2 rounded-lg bg-primary/10 p-3 text-center font-mono text-base font-bold text-primary">SV2026</div>
                      <p className="text-muted-foreground">Ga naar schoolpulse.nl en voer uw code in om te beginnen.</p>
                    </div>
                  </div>
                </div>
              </Card>

              {progress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Importeren...</span>
                    <span className="font-semibold">{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all duration-200" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button onClick={() => setStap(2)} disabled={progress > 0} className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-50">Terug</button>
                <button onClick={startImport} disabled={progress > 0} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  <Upload className="h-4 w-4" /> Start import
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-success/30 bg-success/5 p-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-success" />
              <div className="text-xl font-bold">Import voltooid!</div>
              <div className="text-sm text-muted-foreground">3 leerlingen succesvol geïmporteerd. Ouders ontvangen hun koppelcode per e-mail.</div>
              <div className="mt-2 grid grid-cols-3 gap-6">
                <div><div className="text-2xl font-bold text-success">3</div><div className="text-xs text-muted-foreground">Leerlingen</div></div>
                <div><div className="text-2xl font-bold text-success">3</div><div className="text-xs text-muted-foreground">E-mails verstuurd</div></div>
                <div><div className="text-2xl font-bold text-success">1</div><div className="text-xs text-muted-foreground">Klas</div></div>
              </div>
              <button onClick={() => { setStap(1); setBron(null); setPreviewData([]); setProgress(0); setKlaar(false); }} className="mt-2 rounded-lg border border-border px-4 py-2 text-sm">
                Nieuwe import
              </button>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
