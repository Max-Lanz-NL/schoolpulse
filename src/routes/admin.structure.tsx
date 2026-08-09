import { createFileRoute } from "@tanstack/react-router";
import { Archive, CheckCircle2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  createStructureRecord,
  deleteStructureRecord,
  getReadableAdminError,
  listSchools,
  listSchoolStructure,
  updateStructureRecord,
  type School,
  type SchoolStructure,
  type SchoolStructureKind,
} from "@/lib/admin-client";

export const Route = createFileRoute("/admin/structure")({ component: AdminStructurePage });

type StructureRecord = SchoolStructure[SchoolStructureKind][number];
type FormValue = string | boolean;
type FormState = Record<string, FormValue>;
type Field = {
  key: string;
  label: string;
  type?: "text" | "date" | "number" | "color" | "select" | "checkbox";
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
};

const emptyStructure: SchoolStructure = {
  years: [],
  periods: [],
  locations: [],
  programmes: [],
  subjects: [],
  classes: [],
  groups: [],
};

const tabs: Array<{ kind: SchoolStructureKind; label: string; singular: string; help: string }> = [
  {
    kind: "years",
    label: "Schooljaren",
    singular: "schooljaar",
    help: "De tijdlijn voor roosters, klassen, cijfers en rapportages.",
  },
  {
    kind: "periods",
    label: "Periodes",
    singular: "periode",
    help: "Blokken binnen een schooljaar, zoals trimesters of rapportperiodes.",
  },
  {
    kind: "locations",
    label: "Locaties",
    singular: "locatie",
    help: "Vestigingen en gebouwen waar lessen plaatsvinden.",
  },
  {
    kind: "programmes",
    label: "Niveaus & opleidingen",
    singular: "opleiding",
    help: "Bijvoorbeeld havo, vwo, vmbo-t of een mbo-opleiding.",
  },
  {
    kind: "subjects",
    label: "Vakken",
    singular: "vak",
    help: "De centrale vakkenlijst voor lesgroepen, toetsen en cijfers.",
  },
  {
    kind: "classes",
    label: "Klassen",
    singular: "klas",
    help: "Vaste stam- of basisklassen binnen één schooljaar.",
  },
  {
    kind: "groups",
    label: "Lesgroepen",
    singular: "lesgroep",
    help: "Vak-, mentor-, project- en ondersteuningsgroepen.",
  },
];

function AdminStructurePage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolId, setSchoolId] = useState("");
  const [structure, setStructure] = useState<SchoolStructure>(emptyStructure);
  const [kind, setKind] = useState<SchoolStructureKind>("years");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ id: string | null; values: FormState } | null>(null);

  const selectedSchool = schools.find((school) => school.id === schoolId);
  const currentTab = tabs.find((tab) => tab.kind === kind) ?? tabs[0];

  const loadStructure = async (selectedId: string) => {
    if (!selectedId) {
      setStructure(emptyStructure);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setStructure(await listSchoolStructure(selectedId));
    } catch (loadError) {
      setError(getReadableAdminError(loadError, "Schoolstructuur kon niet worden geladen."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      try {
        const loaded = await listSchools();
        setSchools(loaded);
        const first = loaded[0]?.id ?? "";
        setSchoolId(first);
        await loadStructure(first);
      } catch (loadError) {
        setError(getReadableAdminError(loadError, "Scholen konden niet worden geladen."));
        setLoading(false);
      }
    })();
  }, []);

  const fields = useMemo<Field[]>(() => {
    const yearOptions = structure.years.map((year) => ({ value: year.id, label: year.name }));
    const locationOptions = [
      { value: "", label: "Geen locatie" },
      ...structure.locations.map((item) => ({ value: item.id, label: item.name })),
    ];
    const programmeOptions = [
      { value: "", label: "Geen opleiding" },
      ...structure.programmes.map((item) => ({ value: item.id, label: item.name })),
    ];
    if (kind === "years")
      return [
        { key: "name", label: "Naam", required: true, placeholder: "2026-2027" },
        { key: "starts_on", label: "Begindatum", type: "date", required: true },
        { key: "ends_on", label: "Einddatum", type: "date", required: true },
        { key: "is_current", label: "Huidig schooljaar", type: "checkbox" },
        { key: "is_archived", label: "Gearchiveerd", type: "checkbox" },
      ];
    if (kind === "periods")
      return [
        {
          key: "school_year_id",
          label: "Schooljaar",
          type: "select",
          required: true,
          options: yearOptions,
        },
        { key: "name", label: "Naam", required: true, placeholder: "Periode 1" },
        { key: "sequence", label: "Volgnummer", type: "number", required: true },
        { key: "starts_on", label: "Begindatum", type: "date", required: true },
        { key: "ends_on", label: "Einddatum", type: "date", required: true },
      ];
    if (kind === "locations")
      return [
        { key: "name", label: "Naam", required: true, placeholder: "Hoofdlocatie" },
        { key: "code", label: "Korte code", placeholder: "HL" },
        { key: "address", label: "Adres" },
        { key: "postal_code", label: "Postcode" },
        { key: "city", label: "Plaats" },
        { key: "is_main", label: "Hoofdlocatie", type: "checkbox" },
        { key: "is_active", label: "Actief", type: "checkbox" },
      ];
    if (kind === "programmes")
      return [
        { key: "name", label: "Naam", required: true, placeholder: "Havo" },
        { key: "code", label: "Code", placeholder: "HAVO" },
        {
          key: "sector",
          label: "Onderwijssector",
          type: "select",
          required: true,
          options: [
            { value: "po", label: "Primair onderwijs" },
            { value: "vo", label: "Voortgezet onderwijs" },
            { value: "vso", label: "Voortgezet speciaal onderwijs" },
            { value: "mbo", label: "Mbo" },
            { value: "other", label: "Anders" },
          ],
        },
        { key: "level", label: "Niveau/richting", placeholder: "havo" },
        { key: "duration_years", label: "Duur in jaren", type: "number" },
        { key: "is_active", label: "Actief", type: "checkbox" },
      ];
    if (kind === "subjects")
      return [
        { key: "name", label: "Naam", required: true, placeholder: "Nederlands" },
        { key: "code", label: "Code", required: true, placeholder: "NE" },
        { key: "color", label: "Kleur", type: "color" },
        { key: "is_active", label: "Actief", type: "checkbox" },
      ];
    if (kind === "classes")
      return [
        {
          key: "school_year_id",
          label: "Schooljaar",
          type: "select",
          required: true,
          options: yearOptions,
        },
        { key: "name", label: "Naam", required: true, placeholder: "2HA" },
        { key: "code", label: "Code", placeholder: "2HA" },
        { key: "programme_id", label: "Opleiding", type: "select", options: programmeOptions },
        { key: "location_id", label: "Locatie", type: "select", options: locationOptions },
        { key: "grade_level", label: "Leerjaar", type: "number" },
        { key: "capacity", label: "Capaciteit", type: "number" },
        { key: "is_active", label: "Actief", type: "checkbox" },
      ];
    return [
      {
        key: "school_year_id",
        label: "Schooljaar",
        type: "select",
        required: true,
        options: yearOptions,
      },
      { key: "name", label: "Naam", required: true, placeholder: "Wiskunde 2HA" },
      { key: "code", label: "Code" },
      {
        key: "group_type",
        label: "Soort groep",
        type: "select",
        required: true,
        options: [
          { value: "lesson", label: "Lesgroep" },
          { value: "mentor", label: "Mentorgroep" },
          { value: "project", label: "Projectgroep" },
          { value: "support", label: "Ondersteuningsgroep" },
          { value: "other", label: "Anders" },
        ],
      },
      {
        key: "subject_id",
        label: "Vak",
        type: "select",
        options: [
          { value: "", label: "Geen vak" },
          ...structure.subjects.map((item) => ({ value: item.id, label: item.name })),
        ],
      },
      {
        key: "base_class_id",
        label: "Basisklas",
        type: "select",
        options: [
          { value: "", label: "Geen basisklas" },
          ...structure.classes.map((item) => ({ value: item.id, label: item.name })),
        ],
      },
      { key: "location_id", label: "Locatie", type: "select", options: locationOptions },
      { key: "capacity", label: "Capaciteit", type: "number" },
      { key: "is_active", label: "Actief", type: "checkbox" },
    ];
  }, [kind, structure]);

  const defaults = () =>
    Object.fromEntries(
      fields.map((field) => [
        field.key,
        field.type === "checkbox"
          ? field.key === "is_active"
          : field.type === "color"
            ? "#2563eb"
            : field.key === "sector"
              ? "vo"
              : field.key === "group_type"
                ? "lesson"
                : field.key === "sequence"
                  ? "1"
                  : field.key === "school_year_id"
                    ? (structure.years.find((year) => year.is_current)?.id ??
                      structure.years[0]?.id ??
                      "")
                    : "",
      ]),
    ) as FormState;

  const openCreate = () => setEditor({ id: null, values: defaults() });
  const openEdit = (record: StructureRecord) => {
    const source = record as unknown as Record<string, unknown>;
    setEditor({
      id: String(source.id),
      values: Object.fromEntries(
        fields.map((field) => [
          field.key,
          typeof source[field.key] === "boolean"
            ? source[field.key]
            : source[field.key] == null
              ? ""
              : String(source[field.key]),
        ]),
      ) as FormState,
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editor || !schoolId) return;
    setSaving(true);
    setError(null);
    const values: Record<string, unknown> = {};
    for (const field of fields) {
      const value = editor.values[field.key];
      values[field.key] =
        field.type === "checkbox"
          ? Boolean(value)
          : field.type === "number"
            ? value === ""
              ? null
              : Number(value)
            : value === ""
              ? null
              : value;
    }
    try {
      if (editor.id) await updateStructureRecord(kind, editor.id, values);
      else await createStructureRecord(kind, schoolId, values);
      setEditor(null);
      await loadStructure(schoolId);
    } catch (saveError) {
      setError(getReadableAdminError(saveError, "Opslaan is mislukt."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (record: StructureRecord) => {
    const source = record as unknown as Record<string, unknown>;
    if (!window.confirm(`Weet je zeker dat je “${String(source.name)}” wilt verwijderen?`)) return;
    setSaving(true);
    setError(null);
    try {
      await deleteStructureRecord(kind, String(source.id));
      await loadStructure(schoolId);
    } catch (deleteError) {
      setError(
        getReadableAdminError(
          deleteError,
          "Verwijderen is mislukt. Mogelijk wordt dit onderdeel al gebruikt.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const rows = structure[kind] as StructureRecord[];
  const yearName = (id: unknown) =>
    structure.years.find((year) => year.id === id)?.name ?? "Onbekend schooljaar";
  const rowDetails = (record: StructureRecord) => {
    const item = record as unknown as Record<string, unknown>;
    if (kind === "years") return `${String(item.starts_on)} t/m ${String(item.ends_on)}`;
    if (kind === "periods")
      return `${yearName(item.school_year_id)} · ${String(item.starts_on)} t/m ${String(item.ends_on)}`;
    if (kind === "locations")
      return (
        [item.code, item.city, item.address].filter(Boolean).join(" · ") || "Geen adresgegevens"
      );
    if (kind === "programmes")
      return [String(item.sector).toUpperCase(), item.level, item.code].filter(Boolean).join(" · ");
    if (kind === "subjects") return `Vakcode ${String(item.code)}`;
    if (kind === "classes")
      return `${yearName(item.school_year_id)}${item.grade_level ? ` · leerjaar ${String(item.grade_level)}` : ""}`;
    return `${yearName(item.school_year_id)} · ${String(item.group_type)}`;
  };

  return (
    <AdminGuard>
      {(profile) => (
        <AdminShell
          profile={profile}
          title="Schoolstructuur"
          subtitle="De echte basis voor roosters, leerlingen, vakken, cijfers en aanwezigheid"
        >
          <div className="space-y-5">
            {error && (
              <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <section className="rounded-2xl border border-border bg-card p-5">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                School
              </label>
              <select
                value={schoolId}
                onChange={(event) => {
                  const value = event.target.value;
                  setSchoolId(value);
                  setEditor(null);
                  void loadStructure(value);
                }}
                className="mt-2 w-full max-w-xl rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
              {selectedSchool && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Je beheert nu de structuur van {selectedSchool.name}. Alle onderdelen zijn strikt
                  aan deze school gekoppeld.
                </p>
              )}
            </section>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {tabs.slice(0, 4).map((tab) => (
                <div key={tab.kind} className="rounded-xl border border-border bg-card p-4">
                  <div className="text-2xl font-bold">{structure[tab.kind].length}</div>
                  <div className="text-xs text-muted-foreground">{tab.label}</div>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto rounded-xl border border-border bg-card p-2">
              <div className="flex min-w-max gap-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.kind}
                    type="button"
                    onClick={() => {
                      setKind(tab.kind);
                      setEditor(null);
                    }}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold ${kind === tab.kind ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    {tab.label}{" "}
                    <span className="ml-1 opacity-70">{structure[tab.kind].length}</span>
                  </button>
                ))}
              </div>
            </div>

            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{currentTab.label}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{currentTab.help}</p>
                </div>
                <button
                  type="button"
                  onClick={openCreate}
                  disabled={
                    !schoolId ||
                    ((kind === "periods" || kind === "classes" || kind === "groups") &&
                      !structure.years.length)
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Nieuwe {currentTab.singular}
                </button>
              </div>
              {(kind === "periods" || kind === "classes" || kind === "groups") &&
                !structure.years.length && (
                  <div className="mt-4 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-800">
                    Maak eerst een schooljaar aan. Deze gegevens moeten altijd aan een schooljaar
                    gekoppeld zijn.
                  </div>
                )}
              {loading ? (
                <div className="mt-6 text-sm text-muted-foreground">Gegevens laden…</div>
              ) : rows.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  Nog geen {currentTab.label.toLowerCase()} ingesteld.
                </div>
              ) : (
                <div className="mt-4 divide-y divide-border">
                  {rows.map((record) => {
                    const item = record as unknown as Record<string, unknown>;
                    const inactive = item.is_active === false || item.is_archived === true;
                    return (
                      <div key={String(item.id)} className="flex items-center gap-3 py-3">
                        {kind === "subjects" && (
                          <span
                            className="h-8 w-2 rounded-full"
                            style={{ backgroundColor: String(item.color) }}
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold">
                              {String(item.name)}
                            </span>
                            {item.is_current === true && (
                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                Huidig
                              </span>
                            )}
                            {inactive && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                                <Archive className="h-3 w-3" />
                                Niet actief
                              </span>
                            )}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {rowDetails(record)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openEdit(record)}
                          className="rounded-lg p-2 hover:bg-muted"
                          title="Bewerken"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(record)}
                          className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
                          title="Verwijderen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {editor && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
              <form
                onSubmit={submit}
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-background p-6 shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold">
                      {editor.id ? "Bewerken" : `Nieuwe ${currentTab.singular}`}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Velden met een sterretje zijn verplicht.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditor(null)}
                    className="rounded-lg p-2 hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {fields.map((field) => (
                    <label
                      key={field.key}
                      className={
                        field.type === "checkbox"
                          ? "flex items-center gap-2 self-end rounded-lg border border-border px-3 py-2.5 text-sm"
                          : "text-xs font-semibold"
                      }
                    >
                      {field.type === "checkbox" ? (
                        <>
                          <input
                            type="checkbox"
                            checked={Boolean(editor.values[field.key])}
                            onChange={(event) =>
                              setEditor({
                                ...editor,
                                values: { ...editor.values, [field.key]: event.target.checked },
                              })
                            }
                          />
                          {field.label}
                        </>
                      ) : (
                        <>
                          {field.label}
                          {field.required ? " *" : ""}
                          {field.type === "select" ? (
                            <select
                              required={field.required}
                              value={String(editor.values[field.key] ?? "")}
                              onChange={(event) =>
                                setEditor({
                                  ...editor,
                                  values: { ...editor.values, [field.key]: event.target.value },
                                })
                              }
                              className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
                            >
                              <option value="" disabled={field.required}>
                                Kies…
                              </option>
                              {field.options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              required={field.required}
                              type={field.type ?? "text"}
                              min={field.type === "number" ? 1 : undefined}
                              value={String(editor.values[field.key] ?? "")}
                              placeholder={field.placeholder}
                              onChange={(event) =>
                                setEditor({
                                  ...editor,
                                  values: { ...editor.values, [field.key]: event.target.value },
                                })
                              }
                              className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
                            />
                          )}
                        </>
                      )}
                    </label>
                  ))}
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditor(null)}
                    className="rounded-lg border border-border px-4 py-2 text-xs font-semibold"
                  >
                    Annuleren
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {saving ? "Opslaan…" : "Opslaan"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </AdminShell>
      )}
    </AdminGuard>
  );
}
