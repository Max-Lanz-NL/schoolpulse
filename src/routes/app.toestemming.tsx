import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { useState } from "react";
import { CheckCircle2, XCircle, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/toestemming")({ component: ToestemmingPage });

type Verzoek = {
  id: string;
  titel: string;
  beschrijving: string;
  deadline: string;
  categorie: string;
  status: "open" | "akkoord" | "niet_akkoord";
  ondertekendOp?: string;
};

const initVerzoeken: Verzoek[] = [
  {
    id: "v1",
    titel: "Schoolreis Berlijn 12–16 mei",
    beschrijving:
      "Meerdaagse schoolreis naar Berlijn voor klas V4B. Programma omvat museumbezoeken, stadswandeling en culturele uitwisseling. Kosten: €320 (inclusief vervoer, verblijf en toegangskaarten).",
    deadline: "1 april 2027",
    categorie: "Deelname + foto-toestemming",
    status: "open",
  },
  {
    id: "v2",
    titel: "Excursie Artis — 3 september",
    beschrijving:
      "Dagexcursie naar Artis Amsterdam voor de vakken Biologie en Aardrijkskunde. Vertrek 08:30, terug om 16:30. Kosten: €12 (inbegrepen bij schoolbijdrage).",
    deadline: "15 augustus 2026",
    categorie: "Deelname",
    status: "open",
  },
  {
    id: "v3",
    titel: "Schoolfoto's publicatie website",
    beschrijving:
      "Toestemming voor het plaatsen van groeps- en individuele schoolfoto's op de schoolwebsite, nieuwsbrief en social media kanalen van de school.",
    deadline: "1 september 2026",
    categorie: "Foto-toestemming",
    status: "open",
  },
];

const eerderGegeven: { titel: string; datum: string; status: "akkoord" | "niet_akkoord" }[] = [
  { titel: "Toestemming medisch noodbehandeling", datum: "1 sep 2025", status: "akkoord" },
  { titel: "Schoolfoto's jaarboek 2024-2025", datum: "15 sep 2025", status: "akkoord" },
];

function ToestemmingPage() {
  const [verzoeken, setVerzoeken] = useState<Verzoek[]>(initVerzoeken);

  const beantwoord = (id: string, status: "akkoord" | "niet_akkoord") => {
    const nu = new Date().toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setVerzoeken((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status, ondertekendOp: nu } : v)),
    );
    toast.success(status === "akkoord" ? "Toestemming gegeven" : "Geweigerd", {
      description: `Digitaal ondertekend door Petra de Vries`,
    });
  };

  const open = verzoeken.filter((v) => v.status === "open");
  const beantwoordList = verzoeken.filter((v) => v.status !== "open");

  return (
    <AppShell title="Toestemming" subtitle="Digitale toestemming voor schoolactiviteiten">
      {open.length > 0 && (
        <div className="mb-6 space-y-4">
          <div className="text-sm font-semibold">Openstaand ({open.length})</div>
          {open.map((v) => (
            <div key={v.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-base font-bold">{v.titel}</div>
                  <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {v.categorie}
                  </span>
                </div>
                <div className="rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
                  Deadline: {v.deadline}
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.beschrijving}</p>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                <button
                  onClick={() => beantwoord(v.id, "akkoord")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white"
                >
                  <CheckCircle2 className="h-4 w-4" /> Akkoord
                </button>
                <button
                  onClick={() => beantwoord(v.id, "niet_akkoord")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-destructive px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/5"
                >
                  <XCircle className="h-4 w-4" /> Niet akkoord
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open.length === 0 && beantwoordList.length > 0 && (
        <div className="mb-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <ClipboardCheck className="h-8 w-8 text-success" />
          <div className="text-sm font-semibold">Alle verzoeken behandeld</div>
          <div className="text-xs text-muted-foreground">
            Er zijn geen openstaande toestemmingsverzoeken.
          </div>
        </div>
      )}

      {beantwoordList.length > 0 && (
        <Card title="Reeds ondertekend">
          <div className="space-y-2">
            {beantwoordList.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3 opacity-70"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{v.titel}</div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    Ondertekend door Petra de Vries · {v.ondertekendOp}
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    v.status === "akkoord"
                      ? "bg-success/15 text-success"
                      : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {v.status === "akkoord" ? "Akkoord" : "Geweigerd"}
                </span>
              </div>
            ))}
            {eerderGegeven.map((e, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3 opacity-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{e.titel}</div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    Ondertekend door Petra de Vries · {e.datum}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                  Akkoord
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {open.length > 0 && (
        <Card title="Eerder gegeven toestemmingen">
          <div className="space-y-2 opacity-60">
            {eerderGegeven.map((e, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-border bg-background p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{e.titel}</div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    Ondertekend · {e.datum}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                  Akkoord
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </AppShell>
  );
}
