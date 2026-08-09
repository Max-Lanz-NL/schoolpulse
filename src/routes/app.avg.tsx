import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { useState } from "react";
import { Download, ShieldCheck, AlertTriangle, Eye } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/avg")({ component: AvgPage });

const inzages = [
  {
    datum: "5 jul 2026 · 09:14",
    gebruiker: "M. Jansen (Docent)",
    data: "Leerlingdossier V4B",
    reden: "Pedagogisch overleg",
    ip: "192.168.1.***",
  },
  {
    datum: "5 jul 2026 · 08:31",
    gebruiker: "I. Bakker (Teamleider)",
    data: "Verzuimoverzicht bovenbouw",
    reden: "Verzuimcontrole",
    ip: "10.0.0.***",
  },
  {
    datum: "4 jul 2026 · 15:52",
    gebruiker: "L. de Boer (Docent)",
    data: "Berichtarchief leerling",
    reden: "Mentorgesprek",
    ip: "192.168.2.***",
  },
  {
    datum: "4 jul 2026 · 14:07",
    gebruiker: "Dr. R. Hendriks (Directie)",
    data: "Cijferrapportage schoolbreed",
    reden: "Kwaliteitsscan",
    ip: "192.168.0.***",
  },
  {
    datum: "3 jul 2026 · 11:23",
    gebruiker: "P. de Vries (Ouder)",
    data: "Leerlingprofiel Sanne de Vries",
    reden: "Inzageverzoek ouder",
    ip: "87.213.***.***",
  },
];

type InzageVerzoek = {
  id: string;
  naam: string;
  relatie: string;
  datum: string;
  data: string;
  status: "open" | "verwerkt";
};

const initVerzoeken: InzageVerzoek[] = [
  {
    id: "iv1",
    naam: "Familie Bakker",
    relatie: "Ouder van Tom Bakker (V4B)",
    datum: "3 jul 2026",
    data: "Volledig leerlingdossier inclusief correspondentie",
    status: "open",
  },
  {
    id: "iv2",
    naam: "Ouders van Ravi Kumar",
    relatie: "Ouder van Ravi Kumar (V4B)",
    datum: "4 jul 2026",
    data: "Aanwezigheidsregistratie afgelopen jaar",
    status: "open",
  },
];

function AvgPage() {
  const [verzoeken, setVerzoeken] = useState<InzageVerzoek[]>(initVerzoeken);
  const [bewaartermijn, setBewaartermijn] = useState("2 jaar na uitschrijving");
  const [toestemmingen, setToestemmingen] = useState({
    foto: true,
    excursie: true,
    onderzoek: false,
  });
  const [incidenten, setIncidenten] = useState<string[]>([]);

  const verwerkVerzoek = (id: string) => {
    setVerzoeken((prev) => prev.map((v) => (v.id === id ? { ...v, status: "verwerkt" } : v)));
    toast.success("Verzoek verwerkt", { description: "Ouder ontvangt bevestiging per e-mail" });
  };

  const exportRapport = () => {
    toast.loading("Rapport genereren...", { id: "export" });
    setTimeout(() => {
      const inhoud = `SchoolPulse AVG-compliancerapport\nOpenstaande verzoeken: ${openVerzoeken.length}\nBewaartermijn: ${bewaartermijn}\nIncidenten: ${incidenten.length}`;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([inhoud], { type: "text/plain" }));
      link.download = "avg-compliance-rapport-jul-2026.txt";
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success("Rapport gedownload", {
        id: "export",
        description: "avg-compliance-rapport-jul-2026.pdf",
      });
    }, 1800);
  };

  const openVerzoeken = verzoeken.filter((v) => v.status === "open");

  return (
    <AppShell title="AVG & Privacy" subtitle="Compliance, data-inzage en privacybeheer">
      {/* StatCards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            icon: Eye,
            label: "Data-inzages deze maand",
            value: "47",
            cls: "bg-primary/10 text-primary",
          },
          {
            icon: AlertTriangle,
            label: "Openstaande verzoeken",
            value: String(openVerzoeken.length),
            cls: "bg-warning/10 text-warning",
          },
          {
            icon: ShieldCheck,
            label: "Incidenten",
            value: String(incidenten.length),
            cls: incidenten.length
              ? "bg-destructive/10 text-destructive"
              : "bg-success/10 text-success",
          },
          {
            icon: Download,
            label: "Export-aanvragen",
            value: "3",
            cls: "bg-primary/10 text-primary",
          },
        ].map(({ icon: Icon, label, value, cls }) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4">
            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${cls}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="mt-3 text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 text-2xl font-bold">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recente data-inzages */}
        <Card title="Recente data-inzages">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 pr-3">Datum</th>
                  <th className="pb-2 pr-3">Gebruiker</th>
                  <th className="pb-2 pr-3">Data</th>
                  <th className="pb-2">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inzages.map((e, i) => (
                  <tr key={i} className="text-xs">
                    <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">{e.datum}</td>
                    <td className="py-2 pr-3 font-medium">{e.gebruiker}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{e.data}</td>
                    <td className="py-2 text-muted-foreground">{e.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          {/* Openstaande verzoeken */}
          <Card
            title={`Openstaande inzageverzoeken ${openVerzoeken.length > 0 ? `(${openVerzoeken.length})` : ""}`}
          >
            {openVerzoeken.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                Geen openstaande verzoeken
              </div>
            ) : (
              <div className="space-y-3">
                {verzoeken.map((v) => (
                  <div
                    key={v.id}
                    className={`rounded-xl border border-border bg-background p-3 ${v.status === "verwerkt" ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold">{v.naam}</div>
                        <div className="text-[11px] text-muted-foreground">{v.relatie}</div>
                        <div className="mt-1 text-[11px] text-muted-foreground">
                          Gevraagd: {v.data}
                        </div>
                        <div className="mt-0.5 text-[10px] text-muted-foreground">
                          Ontvangen: {v.datum}
                        </div>
                      </div>
                      {v.status === "open" ? (
                        <button
                          onClick={() => verwerkVerzoek(v.id)}
                          className="shrink-0 rounded-lg bg-primary px-2 py-1.5 text-[11px] font-semibold text-primary-foreground"
                        >
                          Verwerken
                        </button>
                      ) : (
                        <span className="shrink-0 rounded-full bg-success/15 px-2 py-1 text-[10px] font-semibold text-success">
                          Verwerkt
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Datalekken */}
          <Card title="Datalekken & incidenten">
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <ShieldCheck className="h-8 w-8 text-success/60" />
              <div className="text-sm font-semibold text-success">
                {incidenten.length
                  ? `${incidenten.length} incident(en) geregistreerd`
                  : "Geen incidenten geregistreerd"}
              </div>
              <div className="text-xs text-muted-foreground">
                {incidenten.length
                  ? incidenten.join(" · ")
                  : "Er zijn dit schooljaar geen datalekken of privacyincidenten geregistreerd."}
              </div>
            </div>
          </Card>
          <button
            onClick={() => {
              const melding = `Datalek ${new Date().toLocaleDateString("nl-NL")} · onderzoek gestart`;
              setIncidenten((x) => [melding, ...x]);
              toast.success("Datalek geregistreerd en privacycoördinator geïnformeerd");
            }}
            className="w-full rounded-lg border border-destructive/30 px-3 py-2 text-xs font-semibold text-destructive"
          >
            Datalek registreren
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Privacy-instellingen">
          <label className="text-xs font-semibold">
            Standaard bewaartermijn
            <select
              value={bewaartermijn}
              onChange={(e) => setBewaartermijn(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 font-normal"
            >
              <option>1 jaar na uitschrijving</option>
              <option>2 jaar na uitschrijving</option>
              <option>5 jaar na uitschrijving</option>
            </select>
          </label>
          <button
            onClick={() => toast.success("Bewaartermijn opgeslagen")}
            className="mt-3 rounded-lg bg-primary px-3 py-2 text-xs text-primary-foreground"
          >
            Instellingen opslaan
          </button>
        </Card>
        <Card title="Toestemmingen ouders & leerlingen">
          <div className="space-y-2">
            {Object.entries(toestemmingen).map(([k, v]) => (
              <label
                key={k}
                className="flex items-center justify-between rounded-lg border p-2 text-xs capitalize"
              >
                {k}
                <input
                  type="checkbox"
                  checked={v}
                  onChange={() => setToestemmingen((s) => ({ ...s, [k]: !v }))}
                />
              </label>
            ))}
          </div>
        </Card>
        <Card title="Verwerkingsregister">
          <div className="space-y-2 text-xs">
            {[
              "Leerlingdossiers · onderwijsuitvoering",
              "Contactgegevens · communicatie",
              "Cijfers · wettelijke onderwijstaak",
              "Aanwezigheid · zorgplicht",
            ].map((x) => (
              <div key={x} className="rounded-lg border p-2">
                {x}
              </div>
            ))}
          </div>
          <button
            onClick={() => toast.success("Privacyverklaring geopend")}
            className="mt-3 text-xs font-semibold text-primary"
          >
            Privacyverklaringen bekijken
          </button>
        </Card>
      </div>

      {/* Export */}
      <div className="mt-6 flex items-center justify-between rounded-2xl border border-border bg-card p-4">
        <div>
          <div className="text-sm font-semibold">Compliance rapport exporteren</div>
          <div className="text-xs text-muted-foreground">
            Genereer een volledig AVG-rapport inclusief inzagelogboek
          </div>
        </div>
        <button
          onClick={exportRapport}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Download className="h-4 w-4" /> Export compliance rapport
        </button>
      </div>
    </AppShell>
  );
}
