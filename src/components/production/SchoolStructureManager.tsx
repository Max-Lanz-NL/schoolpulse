import { useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  createSchoolResource,
  deleteSchoolResource,
  updateSchoolResource,
  type SchoolResource,
} from "@/domains/school/services/school-service";
import type { SchoolStructure } from "@/domains/school/types";
import { readableDomainError } from "@/domains/shared/domain-error";

type ManagedResource = Exclude<SchoolResource, "locations">;
type StructureRecord = SchoolStructure[ManagedResource][number];
type FormValue = string | boolean;
type FormState = Record<string, FormValue>;
type Field = {
  key: string;
  label: string;
  type?: "text" | "date" | "number" | "color" | "select" | "checkbox";
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
};

const tabs: Array<{ resource: ManagedResource; label: string; singular: string }> = [
  { resource: "years", label: "Schooljaren", singular: "schooljaar" },
  { resource: "periods", label: "Periodes", singular: "periode" },
  { resource: "programmes", label: "Opleidingen", singular: "opleiding" },
  { resource: "subjects", label: "Vakken", singular: "vak" },
  { resource: "classes", label: "Klassen", singular: "klas" },
  { resource: "groups", label: "Lesgroepen", singular: "lesgroep" },
  { resource: "rooms", label: "Lokalen", singular: "lokaal" },
];

export function SchoolStructureManager({
  supabase,
  schoolId,
  structure,
  canManage,
  onReload,
}: {
  supabase: SupabaseClient;
  schoolId: string;
  structure: SchoolStructure;
  canManage: boolean;
  onReload: () => Promise<void>;
}) {
  const [resource, setResource] = useState<ManagedResource>("years");
  const [editor, setEditor] = useState<{ id: string | null; values: FormState } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tab = tabs.find((item) => item.resource === resource) ?? tabs[0];

  const fields = useMemo<Field[]>(() => {
    const years = structure.years.map((item) => ({ value: item.id, label: item.name }));
    const locations = [
      { value: "", label: "Geen locatie" },
      ...structure.locations.map((item) => ({ value: item.id, label: item.name })),
    ];
    if (resource === "years")
      return [
        { key: "name", label: "Naam", required: true },
        { key: "starts_on", label: "Begindatum", type: "date", required: true },
        { key: "ends_on", label: "Einddatum", type: "date", required: true },
        { key: "is_current", label: "Huidig schooljaar", type: "checkbox" },
      ];
    if (resource === "periods")
      return [
        {
          key: "school_year_id",
          label: "Schooljaar",
          type: "select",
          required: true,
          options: years,
        },
        { key: "name", label: "Naam", required: true },
        { key: "sequence", label: "Volgorde", type: "number", required: true },
        { key: "starts_on", label: "Begindatum", type: "date", required: true },
        { key: "ends_on", label: "Einddatum", type: "date", required: true },
      ];
    if (resource === "programmes")
      return [
        { key: "name", label: "Naam", required: true },
        { key: "code", label: "Code" },
        {
          key: "sector",
          label: "Sector",
          type: "select",
          required: true,
          options: ["po", "vo", "vso", "mbo", "other"].map((value) => ({
            value,
            label: value.toUpperCase(),
          })),
        },
        { key: "level", label: "Niveau" },
        { key: "duration_years", label: "Duur (jaren)", type: "number" },
        { key: "is_active", label: "Actief", type: "checkbox" },
      ];
    if (resource === "subjects")
      return [
        { key: "name", label: "Naam", required: true },
        { key: "code", label: "Code", required: true },
        { key: "color", label: "Kleur", type: "color" },
        { key: "is_active", label: "Actief", type: "checkbox" },
      ];
    if (resource === "classes")
      return [
        {
          key: "school_year_id",
          label: "Schooljaar",
          type: "select",
          required: true,
          options: years,
        },
        { key: "name", label: "Naam", required: true },
        { key: "code", label: "Code" },
        {
          key: "programme_id",
          label: "Opleiding",
          type: "select",
          options: [
            { value: "", label: "Geen opleiding" },
            ...structure.programmes.map((item) => ({ value: item.id, label: item.name })),
          ],
        },
        { key: "location_id", label: "Locatie", type: "select", options: locations },
        { key: "grade_level", label: "Leerjaar", type: "number" },
        { key: "capacity", label: "Capaciteit", type: "number" },
        { key: "is_active", label: "Actief", type: "checkbox" },
      ];
    if (resource === "groups")
      return [
        {
          key: "school_year_id",
          label: "Schooljaar",
          type: "select",
          required: true,
          options: years,
        },
        { key: "name", label: "Naam", required: true },
        { key: "code", label: "Code" },
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
        { key: "location_id", label: "Locatie", type: "select", options: locations },
        {
          key: "group_type",
          label: "Type",
          type: "select",
          required: true,
          options: ["lesson", "mentor", "project", "support", "other"].map((value) => ({
            value,
            label: value,
          })),
        },
        { key: "capacity", label: "Capaciteit", type: "number" },
        { key: "is_active", label: "Actief", type: "checkbox" },
      ];
    return [
      { key: "code", label: "Nummer/code", required: true },
      { key: "name", label: "Naam" },
      { key: "location_id", label: "Locatie", type: "select", options: locations },
      { key: "capacity", label: "Capaciteit", type: "number" },
      { key: "room_type", label: "Type", required: true },
      { key: "is_accessible", label: "Toegankelijk", type: "checkbox" },
      { key: "is_active", label: "Actief", type: "checkbox" },
    ];
  }, [resource, structure]);

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
                : field.key === "room_type"
                  ? "classroom"
                  : field.key === "sequence"
                    ? "1"
                    : field.key === "school_year_id"
                      ? (structure.currentYear?.id ?? structure.years[0]?.id ?? "")
                      : "",
      ]),
    ) as FormState;

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
    setError(null);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editor) return;
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
    setSaving(true);
    setError(null);
    try {
      if (editor.id) await updateSchoolResource(supabase, resource, editor.id, values);
      else await createSchoolResource(supabase, resource, schoolId, values);
      toast.success(`${tab.singular[0].toUpperCase()}${tab.singular.slice(1)} opgeslagen`);
      setEditor(null);
      await onReload();
    } catch (saveError) {
      setError(readableDomainError(saveError));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (record: StructureRecord) => {
    const source = record as unknown as Record<string, unknown>;
    if (
      !window.confirm(
        `Weet je zeker dat je “${String(source.name ?? source.code)}” wilt verwijderen?`,
      )
    )
      return;
    setSaving(true);
    setError(null);
    try {
      await deleteSchoolResource(supabase, resource, String(source.id));
      toast.success("Onderdeel verwijderd");
      await onReload();
    } catch (deleteError) {
      setError(readableDomainError(deleteError));
    } finally {
      setSaving(false);
    }
  };

  const rows = structure[resource] as StructureRecord[];
  const detail = (record: StructureRecord) => {
    const item = record as unknown as Record<string, unknown>;
    if (resource === "years" || resource === "periods")
      return `${String(item.starts_on)} – ${String(item.ends_on)}`;
    if (resource === "subjects") return `Code ${String(item.code)}`;
    if (resource === "rooms")
      return [item.code, item.capacity ? `${String(item.capacity)} plaatsen` : null]
        .filter(Boolean)
        .join(" · ");
    return (
      [item.code, item.level, item.capacity ? `${String(item.capacity)} plaatsen` : null]
        .filter(Boolean)
        .join(" · ") || "Actief schoolonderdeel"
    );
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Schoolstructuur beheren</h2>
          <p className="text-xs text-muted-foreground">Officiële getypeerde schoolgegevens.</p>
        </div>
        {canManage ? (
          <button
            onClick={() => {
              setEditor({ id: null, values: defaults() });
              setError(null);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Nieuw {tab.singular}
          </button>
        ) : null}
      </div>
      <div
        className="flex gap-2 overflow-x-auto border-b border-border p-3"
        role="tablist"
        aria-label="Schoolstructuuronderdelen"
      >
        {tabs.map((item) => (
          <button
            key={item.resource}
            role="tab"
            aria-selected={resource === item.resource}
            onClick={() => {
              setResource(item.resource);
              setEditor(null);
              setError(null);
            }}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${resource === item.resource ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {error ? (
        <div className="m-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      {rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          Nog geen {tab.label.toLowerCase()} beschikbaar.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {rows.map((record) => {
            const item = record as unknown as Record<string, unknown>;
            return (
              <div
                key={String(item.id)}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{String(item.name ?? item.code)}</div>
                  <div className="truncate text-xs text-muted-foreground">{detail(record)}</div>
                </div>
                {canManage ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(record)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Wijzigen
                    </button>
                    <button
                      disabled={saving}
                      onClick={() => void remove(record)}
                      className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-semibold text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Verwijderen
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
      {editor ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${editor.id ? "Wijzig" : "Nieuw"} ${tab.singular}`}
        >
          <form
            onSubmit={(event) => void submit(event)}
            className="my-6 w-full max-w-xl rounded-2xl bg-card p-5 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold">
                {editor.id ? "Wijzig" : "Nieuw"} {tab.singular}
              </h3>
              <button
                type="button"
                aria-label="Sluiten"
                onClick={() => setEditor(null)}
                className="rounded-lg p-2 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <label
                  key={field.key}
                  className={
                    field.type === "checkbox"
                      ? "flex items-center gap-2 text-sm sm:col-span-2"
                      : "grid gap-1 text-sm"
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
                      />{" "}
                      {field.label}
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{field.label}</span>
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
                          className="rounded-lg border border-border bg-background px-3 py-2"
                        >
                          <option value="" disabled={field.required}>
                            Maak een keuze
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
                          value={String(editor.values[field.key] ?? "")}
                          onChange={(event) =>
                            setEditor({
                              ...editor,
                              values: { ...editor.values, [field.key]: event.target.value },
                            })
                          }
                          className="rounded-lg border border-border bg-background px-3 py-2"
                        />
                      )}
                    </>
                  )}
                </label>
              ))}
            </div>
            {error ? (
              <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditor(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> {saving ? "Opslaan…" : "Opslaan"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
