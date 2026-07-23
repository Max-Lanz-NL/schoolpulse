import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { activiteiten } from "@/lib/demo-data";
import { useRole } from "@/lib/role-context";
import { CalendarCheck, Users, Plus, X, Paperclip } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/activiteiten")({ component: Activiteiten });

type Aank = { t: string; d: string; tekst?: string; voor: string[] | null };

function formatDatum(iso: string): string {
  if (!iso) return "Direct";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}

function Activiteiten() {
  const { role } = useRole();
  const magBeheren = role === "docent" || role === "teamleider" || role === "directie";
  const zichtbaar = activiteiten.filter((a) => !a.zichtbaarVoor || a.zichtbaarVoor.includes(role));

  const [aangemeld, setAangemeld] = useState<Record<string, boolean>>({});
  const [deelnemersDelta, setDeelnemersDelta] = useState<Record<string, number>>({});
  const [pollAns, setPollAns] = useState<number | null>(null);
  const [nieuweOpen, setNieuweOpen] = useState(false);
  const [extraAank, setExtraAank] = useState<Aank[]>([]);
  const [beheerActiviteiten, setBeheerActiviteiten] = useState([
    {
      id: "a1",
      titel: "Excursie Rijksmuseum",
      soort: "Excursie",
      datum: "16 sep · 09:00",
      locatie: "Amsterdam",
      deelnemers: 84,
      begeleiders: 6,
      budget: 4200,
      status: "Ter goedkeuring",
      aanwezigheid: false,
      document: "Draaiboek.pdf",
    },
    {
      id: "a2",
      titel: "Projectweek duurzaamheid",
      soort: "Project",
      datum: "5–9 okt",
      locatie: "Schoolbreed",
      deelnemers: 312,
      begeleiders: 18,
      budget: 6800,
      status: "Goedgekeurd",
      aanwezigheid: false,
      document: "Projectplan.docx",
    },
    {
      id: "a3",
      titel: "Ouderavond bovenbouw",
      soort: "Evenement",
      datum: "8 okt · 19:00",
      locatie: "Aula",
      deelnemers: 146,
      begeleiders: 12,
      budget: 750,
      status: "Gepland",
      aanwezigheid: true,
      document: "Plattegrond.pdf",
    },
  ]);
  const [beheerFormOpen, setBeheerFormOpen] = useState(false);
  const [beheerForm, setBeheerForm] = useState({ titel: "", datum: "", locatie: "", budget: "0" });

  const pollOpties = [
    { label: "Berlijn", stemmen: 84 },
    { label: "Praag", stemmen: 52 },
    { label: "Barcelona", stemmen: 96 },
    { label: "Rome", stemmen: 41 },
  ];
  const totaal = pollOpties.reduce((a, o) => a + o.stemmen, 0);
  const heeftGestemd = pollAns !== null;

  const toggleAanmelden = (titel: string) => {
    const wasIn = !!aangemeld[titel];
    setAangemeld((s) => ({ ...s, [titel]: !s[titel] }));
    setDeelnemersDelta((s) => ({ ...s, [titel]: (s[titel] ?? 0) + (wasIn ? -1 : 1) }));
    toast.success(wasIn ? `Afgemeld voor ${titel}` : `Aangemeld voor ${titel}`);
  };

  const basisAank: Aank[] = [
    {
      t: "Herinnering ouderavond V4",
      d: "8 okt · doelgroep V4-ouders",
      tekst:
        "Vergeet niet de ouderavond van 8 oktober te noteren. Aanmelding via de schoolapp vereist.",
      voor: ["ouder", "docent", "teamleider", "directie"],
    },
    {
      t: "Nieuwe kantinekaart",
      d: "Vanaf maandag actief",
      tekst:
        "De nieuwe kantinekaarten zijn beschikbaar bij de administratie. Breng je oude kaart in voor omruil.",
      voor: null,
    },
    {
      t: "Kerstviering programma",
      d: "Publicatie volgende week",
      tekst: "Het programma van de kerstviering wordt volgende week gepubliceerd op de schoolsite.",
      voor: null,
    },
  ];
  const aankondigingen = [...extraAank, ...basisAank].filter(
    (a) => !a.voor || a.voor.includes(role),
  );

  return (
    <AppShell title="Activiteiten" subtitle="Aanmeldingen, polls en aankondigingen">
      {(role === "teamleider" || role === "directie") && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Activiteitenbeheer</h2>
              <p className="text-xs text-muted-foreground">
                Planning, deelnemers, begeleiders en documenten
              </p>
            </div>
            <button
              onClick={() => setBeheerFormOpen((v) => !v)}
              className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
            >
              <Plus className="mr-1 inline h-3 w-3" /> Activiteit aanmaken
            </button>
          </div>
          {beheerFormOpen && (
            <div className="grid gap-2 rounded-xl border border-border bg-card p-4 sm:grid-cols-5">
              <input
                placeholder="Titel"
                value={beheerForm.titel}
                onChange={(e) => setBeheerForm((f) => ({ ...f, titel: e.target.value }))}
                className="rounded-lg border bg-background px-3 py-2 text-xs"
              />
              <input
                type="date"
                value={beheerForm.datum}
                onChange={(e) => setBeheerForm((f) => ({ ...f, datum: e.target.value }))}
                className="rounded-lg border bg-background px-3 py-2 text-xs"
              />
              <input
                placeholder="Locatie"
                value={beheerForm.locatie}
                onChange={(e) => setBeheerForm((f) => ({ ...f, locatie: e.target.value }))}
                className="rounded-lg border bg-background px-3 py-2 text-xs"
              />
              <input
                type="number"
                placeholder="Budget"
                value={beheerForm.budget}
                onChange={(e) => setBeheerForm((f) => ({ ...f, budget: e.target.value }))}
                className="rounded-lg border bg-background px-3 py-2 text-xs"
              />
              <button
                disabled={!beheerForm.titel}
                onClick={() => {
                  setBeheerActiviteiten((items) => [
                    {
                      id: `a${Date.now()}`,
                      titel: beheerForm.titel,
                      soort: "Activiteit",
                      datum: beheerForm.datum,
                      locatie: beheerForm.locatie,
                      deelnemers: 0,
                      begeleiders: 0,
                      budget: Number(beheerForm.budget),
                      status: role === "directie" ? "Goedgekeurd" : "Ter goedkeuring",
                      aanwezigheid: false,
                      document: "Nog geen document",
                    },
                    ...items,
                  ]);
                  setBeheerFormOpen(false);
                  setBeheerForm({ titel: "", datum: "", locatie: "", budget: "0" });
                  toast.success("Activiteit aangemaakt");
                }}
                className="rounded-lg bg-success px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                Opslaan
              </button>
            </div>
          )}
          <div className="grid gap-3 lg:grid-cols-3">
            {beheerActiviteiten.map((a) => (
              <div key={a.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-primary">
                      {a.soort}
                    </span>
                    <div className="font-semibold">{a.titel}</div>
                    <div className="text-xs text-muted-foreground">
                      {a.datum} · {a.locatie}
                    </div>
                  </div>
                  <span className="h-fit rounded-full bg-muted px-2 py-1 text-[10px]">
                    {a.status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded bg-muted/50 p-2">
                    <strong>{a.deelnemers}</strong>
                    <br />
                    deelnemers
                  </div>
                  <div className="rounded bg-muted/50 p-2">
                    <strong>{a.begeleiders}</strong>
                    <br />
                    begeleiders
                  </div>
                  <div className="rounded bg-muted/50 p-2">
                    <strong>€{a.budget}</strong>
                    <br />
                    budget
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  <Paperclip className="mr-1 inline h-3 w-3" />
                  {a.document}
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {role === "directie" && a.status === "Ter goedkeuring" && (
                    <button
                      onClick={() =>
                        setBeheerActiviteiten((xs) =>
                          xs.map((x) => (x.id === a.id ? { ...x, status: "Goedgekeurd" } : x)),
                        )
                      }
                      className="rounded bg-success px-2 py-1 text-[10px] text-white"
                    >
                      Goedkeuren
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setBeheerActiviteiten((xs) =>
                        xs.map((x) =>
                          x.id === a.id
                            ? {
                                ...x,
                                locatie: x.locatie.includes("gewijzigd")
                                  ? x.locatie
                                  : `${x.locatie} · gewijzigd`,
                                begeleiders: x.begeleiders + 1,
                              }
                            : x,
                        ),
                      )
                    }
                    className="rounded border px-2 py-1 text-[10px]"
                  >
                    Bewerken / begeleider +
                  </button>
                  <button
                    onClick={() =>
                      setBeheerActiviteiten((xs) =>
                        xs.map((x) =>
                          x.id === a.id ? { ...x, aanwezigheid: !x.aanwezigheid } : x,
                        ),
                      )
                    }
                    className="rounded border px-2 py-1 text-[10px]"
                  >
                    {a.aanwezigheid ? "Aanwezigheid geregistreerd" : "Aanwezigheid registreren"}
                  </button>
                  <button
                    onClick={() => setBeheerActiviteiten((xs) => xs.filter((x) => x.id !== a.id))}
                    className="rounded border border-destructive/30 px-2 py-1 text-[10px] text-destructive"
                  >
                    Verwijderen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {zichtbaar.map((a) => {
            const currentDeelnemers = a.deelnemers + (deelnemersDelta[a.titel] ?? 0);
            const pct = Math.round((currentDeelnemers / a.plekken) * 100);
            const isIn = aangemeld[a.titel];
            return (
              <div key={a.titel} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                      <CalendarCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-base font-semibold">{a.titel}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.datum} · {a.doel}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleAanmelden(a.titel)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${isIn ? "border border-success bg-success/10 text-success" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                  >
                    {isIn ? "Aangemeld ✓" : "Aanmelden"}
                  </button>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3" /> {currentDeelnemers} / {a.plekken} deelnemers
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <Card title="Poll: bestemming schoolreis">
            <div className="space-y-2">
              {pollOpties.map((o, i) => {
                const stemmenNa = i === pollAns ? o.stemmen + 1 : o.stemmen;
                const totaalNa = heeftGestemd ? totaal + 1 : totaal;
                const pct = Math.round((stemmenNa / totaalNa) * 100);
                const gekozen = pollAns === i;
                return (
                  <button
                    key={o.label}
                    onClick={() => !heeftGestemd && setPollAns(i)}
                    disabled={heeftGestemd}
                    className={`relative w-full overflow-hidden rounded-lg border p-3 text-left transition-colors ${gekozen ? "border-primary bg-primary/5" : "border-border"} ${heeftGestemd ? "cursor-default" : "hover:bg-muted/40"}`}
                  >
                    {heeftGestemd && (
                      <div
                        className="absolute inset-0 bg-primary/10 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    )}
                    <div className="relative flex items-center justify-between">
                      <span className="text-sm font-medium">{o.label}</span>
                      {heeftGestemd && (
                        <span className="text-xs font-semibold text-muted-foreground">{pct}%</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground">
              {pollAns !== null
                ? `${totaal + 1} stemmen · sluit vrijdag`
                : "Klik op een optie om te stemmen · sluit vrijdag"}
            </div>
          </Card>

          <Card title="Aankondigingen">
            <div className="space-y-3">
              {aankondigingen.map((a) => (
                <div key={a.t} className="rounded-lg border border-border p-3">
                  <div className="text-sm font-semibold">{a.t}</div>
                  <div className="text-[11px] text-muted-foreground">{a.d}</div>
                  {a.tekst && (
                    <div className="mt-1.5 text-xs text-foreground/80 leading-relaxed">
                      {a.tekst}
                    </div>
                  )}
                </div>
              ))}
              {magBeheren && (
                <button
                  onClick={() => setNieuweOpen(true)}
                  className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border p-3 text-xs font-semibold text-muted-foreground hover:bg-muted/40"
                >
                  <Plus className="h-3 w-3" /> Nieuwe aankondiging
                </button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {nieuweOpen && (
        <NieuweAankondigingModal
          onClose={() => setNieuweOpen(false)}
          onSave={(a) => {
            setExtraAank((s) => [a, ...s]);
            setNieuweOpen(false);
          }}
        />
      )}
    </AppShell>
  );
}

const doelgroepen = [
  "Hele school",
  "Bovenbouw",
  "Onderbouw",
  "V4",
  "V5",
  "H4",
  "Sectie Wiskunde",
  "Sectie Nederlands",
  "Ouders",
];

const doelgroepNaarRollen = (doel: string[]): string[] | null => {
  if (doel.includes("Hele school")) return null;
  const rollen: string[] = [];
  if (doel.includes("Ouders")) rollen.push("ouder");
  if (doel.some((d) => d.startsWith("Sectie"))) rollen.push("docent", "teamleider", "directie");
  if (doel.some((d) => ["Bovenbouw", "Onderbouw", "V4", "V5", "H4"].includes(d))) {
    rollen.push("leerling", "docent", "teamleider", "directie");
    if (!rollen.includes("ouder")) rollen.push("ouder");
  }
  return rollen.length ? [...new Set(rollen)] : null;
};

function NieuweAankondigingModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (a: Aank) => void;
}) {
  const [titel, setTitel] = useState("");
  const [tekst, setTekst] = useState("");
  const [datum, setDatum] = useState("");
  const [doel, setDoel] = useState<string[]>(["Hele school"]);
  const [bijlage, setBijlage] = useState<string | null>(null);

  const toggle = (d: string) =>
    setDoel((s) => (s.includes(d) ? s.filter((x) => x !== d) : [...s, d]));
  const canSave = titel.trim().length > 0 && tekst.trim().length > 0;

  const submit = () => {
    if (!canSave) return;
    const datumLabel = datum ? formatDatum(datum) : "Direct";
    const voor = doelgroepNaarRollen(doel);
    onSave({
      t: titel,
      d: `${datumLabel} · ${doel.join(", ")}${bijlage ? ` · 📎 ${bijlage}` : ""}`,
      tekst,
      voor,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="text-sm font-semibold">Nieuwe aankondiging</div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 p-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Titel</label>
            <input
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              placeholder="Bijv. Ouderavond V4"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Bericht
            </label>
            <textarea
              value={tekst}
              onChange={(e) => setTekst(e.target.value)}
              rows={3}
              placeholder="Wat moet er gecommuniceerd worden?"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Datum (optioneel)
              </label>
              <input
                type="date"
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Bijlage
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted">
                <Paperclip className="h-4 w-4" />
                <span className="truncate text-muted-foreground">
                  {bijlage ?? "Bestand kiezen..."}
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setBijlage(e.target.files?.[0]?.name ?? null)}
                />
              </label>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Doelgroep
            </label>
            <div className="flex flex-wrap gap-1.5">
              {doelgroepen.map((d) => {
                const on = doel.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => toggle(d)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border p-3">
          <button onClick={onClose} className="rounded-lg border border-border px-3 py-2 text-sm">
            Annuleren
          </button>
          <button
            onClick={submit}
            disabled={!canSave}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            Plaatsen
          </button>
        </div>
      </div>
    </div>
  );
}
