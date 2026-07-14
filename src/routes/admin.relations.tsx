import { createFileRoute } from "@tanstack/react-router";
import { Link2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  createRelationRecord,
  deleteRelationRecord,
  getReadableAdminError,
  listProfiles,
  listSchoolRelations,
  listSchools,
  listSchoolStructure,
  updateRelationRecord,
  type Profile,
  type School,
  type SchoolRelationKind,
  type SchoolRelations,
  type SchoolStructure,
} from "@/lib/admin-client";

export const Route = createFileRoute("/admin/relations")({ component: AdminRelationsPage });

type RelationRecord = SchoolRelations[SchoolRelationKind][number];
type FormValue = string | boolean;
type FormState = Record<string, FormValue>;
type Field = {
  key: string;
  label: string;
  type?: "text" | "date" | "select" | "checkbox";
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
};

const emptyRelations: SchoolRelations = {
  students: [],
  staff: [],
  enrolments: [],
  guardians: [],
  teacherSubjects: [],
  teacherGroups: [],
  studentGroups: [],
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

const tabs: Array<{ kind: SchoolRelationKind; label: string; singular: string; help: string }> = [
  {
    kind: "students",
    label: "Leerlingen",
    singular: "leerlingdossier",
    help: "Koppel een leerlingaccount aan een uniek leerlingnummer.",
  },
  {
    kind: "enrolments",
    label: "Inschrijvingen",
    singular: "inschrijving",
    help: "Plaats een leerling in een schooljaar, opleiding en basisklas.",
  },
  {
    kind: "guardians",
    label: "Ouder-kind",
    singular: "ouder-kindkoppeling",
    help: "Bepaalt welke ouder of verzorger gegevens van welke leerling mag zien.",
  },
  {
    kind: "staff",
    label: "Personeel",
    singular: "personeelsdossier",
    help: "Koppel medewerkergegevens aan een bestaand account.",
  },
  {
    kind: "teacherSubjects",
    label: "Docent-vakken",
    singular: "docent-vakkoppeling",
    help: "Leg vast welke vakken een docent in een schooljaar geeft.",
  },
  {
    kind: "teacherGroups",
    label: "Docent-groepen",
    singular: "docent-groepkoppeling",
    help: "Koppel docenten, mentoren en assistenten aan echte lesgroepen.",
  },
  {
    kind: "studentGroups",
    label: "Groepsdeelnames",
    singular: "groepsdeelname",
    help: "Plaats leerlingen in vak-, mentor-, project- of ondersteuningsgroepen.",
  },
];

function AdminRelationsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [schoolId, setSchoolId] = useState("");
  const [structure, setStructure] = useState<SchoolStructure>(emptyStructure);
  const [relations, setRelations] = useState<SchoolRelations>(emptyRelations);
  const [kind, setKind] = useState<SchoolRelationKind>("students");
  const [editor, setEditor] = useState<{ id: string | null; values: FormState } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const schoolProfiles = useMemo(
    () => profiles.filter((profile) => profile.school_id === schoolId),
    [profiles, schoolId],
  );
  const currentTab = tabs.find((tab) => tab.kind === kind) ?? tabs[0];
  const profileLabel = (id: unknown) => {
    const profile = profiles.find((item) => item.id === id);
    return profile
      ? `${profile.full_name ?? profile.email} · ${profile.email}`
      : "Onbekend account";
  };
  const studentOptions = relations.students.map((student) => ({
    value: student.profile_id,
    label: `${profileLabel(student.profile_id)} · ${student.student_number}`,
  }));
  const staffOptions = relations.staff.map((staff) => ({
    value: staff.profile_id,
    label: profileLabel(staff.profile_id),
  }));
  const profileOptions = schoolProfiles.map((profile) => ({
    value: profile.id,
    label: `${profile.full_name ?? profile.email} · ${profile.role}`,
  }));

  const load = async (selectedSchoolId: string) => {
    if (!selectedSchoolId) {
      setRelations(emptyRelations);
      setStructure(emptyStructure);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [loadedStructure, loadedRelations] = await Promise.all([
        listSchoolStructure(selectedSchoolId),
        listSchoolRelations(selectedSchoolId),
      ]);
      setStructure(loadedStructure);
      setRelations(loadedRelations);
    } catch (loadError) {
      setError(getReadableAdminError(loadError, "Koppelingen konden niet worden geladen."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      try {
        const [loadedSchools, loadedProfiles] = await Promise.all([listSchools(), listProfiles()]);
        setSchools(loadedSchools);
        setProfiles(loadedProfiles);
        const first = loadedSchools[0]?.id ?? "";
        setSchoolId(first);
        await load(first);
      } catch (loadError) {
        setError(getReadableAdminError(loadError, "Beheergegevens konden niet worden geladen."));
        setLoading(false);
      }
    })();
  }, []);

  const fields = useMemo<Field[]>(() => {
    const years = structure.years.map((item) => ({ value: item.id, label: item.name }));
    const classes = [
      { value: "", label: "Geen basisklas" },
      ...structure.classes.map((item) => ({ value: item.id, label: item.name })),
    ];
    const programmes = [
      { value: "", label: "Geen opleiding" },
      ...structure.programmes.map((item) => ({ value: item.id, label: item.name })),
    ];
    const groups = structure.groups.map((item) => ({ value: item.id, label: item.name }));
    if (kind === "students")
      return [
        {
          key: "profile_id",
          label: "Leerlingaccount",
          type: "select",
          required: true,
          options: profileOptions,
        },
        {
          key: "student_number",
          label: "Leerlingnummer",
          required: true,
          placeholder: "L-2026-001",
        },
        { key: "preferred_name", label: "Roepnaam" },
        { key: "date_of_birth", label: "Geboortedatum", type: "date" },
        { key: "start_date", label: "Startdatum", type: "date" },
        { key: "end_date", label: "Einddatum", type: "date" },
        {
          key: "status",
          label: "Status",
          type: "select",
          required: true,
          options: [
            { value: "planned", label: "Gepland" },
            { value: "active", label: "Actief" },
            { value: "graduated", label: "Afgestudeerd" },
            { value: "withdrawn", label: "Uitgeschreven" },
          ],
        },
      ];
    if (kind === "staff")
      return [
        {
          key: "profile_id",
          label: "Medewerkersaccount",
          type: "select",
          required: true,
          options: profileOptions,
        },
        { key: "employee_number", label: "Personeelsnummer", placeholder: "P-001" },
        { key: "job_title", label: "Functie" },
        { key: "department", label: "Afdeling/team" },
        { key: "start_date", label: "Startdatum", type: "date" },
        { key: "end_date", label: "Einddatum", type: "date" },
        { key: "is_active", label: "Actief", type: "checkbox" },
      ];
    if (kind === "enrolments")
      return [
        {
          key: "student_profile_id",
          label: "Leerling",
          type: "select",
          required: true,
          options: studentOptions,
        },
        {
          key: "school_year_id",
          label: "Schooljaar",
          type: "select",
          required: true,
          options: years,
        },
        { key: "class_id", label: "Basisklas", type: "select", options: classes },
        { key: "programme_id", label: "Opleiding", type: "select", options: programmes },
        { key: "starts_on", label: "Startdatum", type: "date" },
        { key: "ends_on", label: "Einddatum", type: "date" },
        {
          key: "status",
          label: "Status",
          type: "select",
          required: true,
          options: [
            { value: "planned", label: "Gepland" },
            { value: "active", label: "Actief" },
            { value: "completed", label: "Afgerond" },
            { value: "withdrawn", label: "Uitgeschreven" },
          ],
        },
      ];
    if (kind === "guardians")
      return [
        {
          key: "guardian_profile_id",
          label: "Ouder/verzorger",
          type: "select",
          required: true,
          options: profileOptions,
        },
        {
          key: "student_profile_id",
          label: "Leerling",
          type: "select",
          required: true,
          options: studentOptions,
        },
        {
          key: "relationship",
          label: "Relatie",
          type: "select",
          required: true,
          options: [
            { value: "parent", label: "Ouder" },
            { value: "guardian", label: "Voogd" },
            { value: "foster_parent", label: "Pleegouder" },
            { value: "stepparent", label: "Stiefouder" },
            { value: "other", label: "Anders" },
          ],
        },
        { key: "has_legal_authority", label: "Wettelijk gezag", type: "checkbox" },
        { key: "receives_communication", label: "Ontvangt communicatie", type: "checkbox" },
        { key: "financial_responsibility", label: "Financieel verantwoordelijk", type: "checkbox" },
        { key: "is_active", label: "Actief", type: "checkbox" },
      ];
    if (kind === "teacherSubjects")
      return [
        {
          key: "teacher_profile_id",
          label: "Docent/medewerker",
          type: "select",
          required: true,
          options: staffOptions,
        },
        {
          key: "school_year_id",
          label: "Schooljaar",
          type: "select",
          required: true,
          options: years,
        },
        {
          key: "subject_id",
          label: "Vak",
          type: "select",
          required: true,
          options: structure.subjects.map((item) => ({ value: item.id, label: item.name })),
        },
        { key: "is_primary", label: "Hoofdvak", type: "checkbox" },
      ];
    if (kind === "teacherGroups")
      return [
        {
          key: "teacher_profile_id",
          label: "Docent/medewerker",
          type: "select",
          required: true,
          options: staffOptions,
        },
        {
          key: "teaching_group_id",
          label: "Lesgroep",
          type: "select",
          required: true,
          options: groups,
        },
        {
          key: "assignment_role",
          label: "Rol in groep",
          type: "select",
          required: true,
          options: [
            { value: "lead_teacher", label: "Hoofddocent" },
            { value: "teacher", label: "Docent" },
            { value: "mentor", label: "Mentor" },
            { value: "assistant", label: "Assistent" },
            { value: "substitute", label: "Vervanger" },
          ],
        },
        { key: "starts_on", label: "Startdatum", type: "date" },
        { key: "ends_on", label: "Einddatum", type: "date" },
      ];
    return [
      {
        key: "student_profile_id",
        label: "Leerling",
        type: "select",
        required: true,
        options: studentOptions,
      },
      {
        key: "teaching_group_id",
        label: "Lesgroep",
        type: "select",
        required: true,
        options: groups,
      },
      { key: "starts_on", label: "Startdatum", type: "date" },
      { key: "ends_on", label: "Einddatum", type: "date" },
      {
        key: "status",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { value: "planned", label: "Gepland" },
          { value: "active", label: "Actief" },
          { value: "completed", label: "Afgerond" },
          { value: "withdrawn", label: "Gestopt" },
        ],
      },
    ];
  }, [kind, profileOptions, staffOptions, studentOptions, structure]);

  const defaults = () =>
    Object.fromEntries(
      fields.map((field) => [
        field.key,
        field.type === "checkbox"
          ? !["financial_responsibility", "is_primary"].includes(field.key)
          : field.key === "status"
            ? "active"
            : field.key === "relationship"
              ? "parent"
              : field.key === "assignment_role"
                ? "teacher"
                : field.key === "school_year_id"
                  ? (structure.years.find((year) => year.is_current)?.id ??
                    structure.years[0]?.id ??
                    "")
                  : "",
      ]),
    ) as FormState;

  const openEdit = (record: RelationRecord) => {
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
    const values: Record<string, unknown> = {};
    fields.forEach((field) => {
      const value = editor.values[field.key];
      values[field.key] = field.type === "checkbox" ? Boolean(value) : value === "" ? null : value;
    });
    setSaving(true);
    setError(null);
    try {
      if (editor.id) await updateRelationRecord(kind, editor.id, values);
      else await createRelationRecord(kind, schoolId, values);
      setEditor(null);
      await load(schoolId);
    } catch (saveError) {
      setError(getReadableAdminError(saveError, "Opslaan is mislukt."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (record: RelationRecord) => {
    const source = record as unknown as Record<string, unknown>;
    if (!window.confirm("Weet je zeker dat je deze koppeling wilt verwijderen?")) return;
    setSaving(true);
    setError(null);
    try {
      await deleteRelationRecord(kind, String(source.id));
      await load(schoolId);
    } catch (deleteError) {
      setError(getReadableAdminError(deleteError, "Verwijderen is mislukt."));
    } finally {
      setSaving(false);
    }
  };

  const entityName = (id: unknown, collection: Array<{ id: string; name: string }>) =>
    collection.find((item) => item.id === id)?.name ?? "Niet ingesteld";
  const rowText = (record: RelationRecord) => {
    const item = record as unknown as Record<string, unknown>;
    if (kind === "students")
      return {
        title: profileLabel(item.profile_id),
        detail: `Leerlingnummer ${String(item.student_number)} · ${String(item.status)}`,
      };
    if (kind === "staff")
      return {
        title: profileLabel(item.profile_id),
        detail:
          [item.employee_number, item.job_title, item.department].filter(Boolean).join(" · ") ||
          "Geen functiegegevens",
      };
    if (kind === "enrolments")
      return {
        title: profileLabel(item.student_profile_id),
        detail: `${entityName(item.school_year_id, structure.years)} · ${entityName(item.class_id, structure.classes)} · ${String(item.status)}`,
      };
    if (kind === "guardians")
      return {
        title: `${profileLabel(item.guardian_profile_id)} → ${profileLabel(item.student_profile_id)}`,
        detail: `${String(item.relationship)}${item.has_legal_authority ? " · wettelijk gezag" : ""}`,
      };
    if (kind === "teacherSubjects")
      return {
        title: profileLabel(item.teacher_profile_id),
        detail: `${entityName(item.subject_id, structure.subjects)} · ${entityName(item.school_year_id, structure.years)}`,
      };
    if (kind === "teacherGroups")
      return {
        title: profileLabel(item.teacher_profile_id),
        detail: `${entityName(item.teaching_group_id, structure.groups)} · ${String(item.assignment_role)}`,
      };
    return {
      title: profileLabel(item.student_profile_id),
      detail: `${entityName(item.teaching_group_id, structure.groups)} · ${String(item.status)}`,
    };
  };

  const rows = relations[kind] as RelationRecord[];
  const prerequisitesMissing =
    schoolProfiles.length === 0 ||
    ((kind === "enrolments" || kind === "guardians" || kind === "studentGroups") &&
      !relations.students.length) ||
    ((kind === "teacherSubjects" || kind === "teacherGroups") && !relations.staff.length);

  return (
    <AdminGuard>
      {(profile) => (
        <AdminShell
          profile={profile}
          title="Inschrijvingen & koppelingen"
          subtitle="Verbind echte accounts met leerlingen, ouders, medewerkers, klassen, vakken en lesgroepen"
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
                  void load(value);
                }}
                className="mt-2 w-full max-w-xl rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-muted-foreground">
                Alleen bestaande accounts van de geselecteerde school kunnen worden gekoppeld. Maak
                ontbrekende accounts eerst aan bij Accounts.
              </p>
            </section>

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
                    <span className="ml-1 opacity-70">{relations[tab.kind].length}</span>
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
                  disabled={prerequisitesMissing}
                  onClick={() => setEditor({ id: null, values: defaults() })}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Nieuwe {currentTab.singular}
                </button>
              </div>
              {prerequisitesMissing && (
                <div className="mt-4 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-800">
                  Er ontbreken nog benodigde accounts of basisgegevens. Begin bij Accounts,
                  Schoolstructuur en daarna Leerlingen/Personeel.
                </div>
              )}
              {loading ? (
                <div className="mt-6 text-sm text-muted-foreground">Koppelingen laden…</div>
              ) : rows.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  <Link2 className="mx-auto mb-2 h-6 w-6" />
                  Nog geen {currentTab.label.toLowerCase()} ingesteld.
                </div>
              ) : (
                <div className="mt-4 divide-y divide-border">
                  {rows.map((record) => {
                    const source = record as unknown as Record<string, unknown>;
                    const text = rowText(record);
                    return (
                      <div key={String(source.id)} className="flex items-center gap-3 py-3">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">{text.title}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            {text.detail}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openEdit(record)}
                          className="rounded-lg p-2 hover:bg-muted"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(record)}
                          className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
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
                      {editor.id ? "Koppeling bewerken" : `Nieuwe ${currentTab.singular}`}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      De database controleert automatisch of alles bij dezelfde school hoort.
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
                              type={field.type ?? "text"}
                              required={field.required}
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
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                  >
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
