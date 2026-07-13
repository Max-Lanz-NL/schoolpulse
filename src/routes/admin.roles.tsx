import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  createSchoolRole,
  deleteSchoolRole,
  getReadableAdminError,
  listPermissionDefinitions,
  listPermissionRequests,
  listProfiles,
  listRoleAssignments,
  listRolePermissions,
  listSchoolRoles,
  listSchools,
  replaceRolePermissions,
  reviewPermissionRequest,
  setProfileRoles,
  updateSchoolRole,
  type PermissionDefinition,
  type PermissionRequest,
  type Profile,
  type RoleAssignment,
  type RolePermission,
  type School,
  type SchoolRole,
} from "@/lib/admin-client";

export const Route = createFileRoute("/admin/roles")({ component: AdminRolesPage });

type Tab = "roles" | "assignments" | "requests";
type Scope = RolePermission["scope"];

const scopeLabels: Record<Scope, string> = {
  own: "Alleen eigen gegevens",
  assigned: "Toegewezen klassen/personen",
  team: "Eigen team of afdeling",
  school: "Hele school",
};

const requestStatusLabels: Record<string, string> = {
  draft: "Concept",
  submitted: "Ingediend",
  in_review: "In behandeling",
  needs_information: "Meer informatie nodig",
  approved: "Goedgekeurd",
  partially_approved: "Gedeeltelijk goedgekeurd",
  rejected: "Afgewezen",
  scheduled: "Ingepland",
  completed: "Uitgevoerd",
  cancelled: "Geannuleerd",
};

function AdminRolesPage() {
  const [tab, setTab] = useState<Tab>("roles");
  const [schools, setSchools] = useState<School[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [definitions, setDefinitions] = useState<PermissionDefinition[]>([]);
  const [roles, setRoles] = useState<SchoolRole[]>([]);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [requests, setRequests] = useState<PermissionRequest[]>([]);
  const [schoolId, setSchoolId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBase = async () => {
    setLoading(true);
    setError(null);
    try {
      const [loadedSchools, loadedDefinitions, loadedProfiles, loadedRequests] = await Promise.all([
        listSchools(),
        listPermissionDefinitions(),
        listProfiles(),
        listPermissionRequests(),
      ]);
      setSchools(loadedSchools);
      setDefinitions(loadedDefinitions);
      setProfiles(loadedProfiles);
      setRequests(loadedRequests);
      setSchoolId((current) => current || loadedSchools[0]?.id || "");
    } catch (loadError) {
      setError(
        getReadableAdminError(loadError, "Rollen en permissies konden niet worden geladen."),
      );
    } finally {
      setLoading(false);
    }
  };

  const loadSchool = useCallback(
    async (selectedSchoolId: string) => {
      if (!selectedSchoolId) {
        setRoles([]);
        setPermissions([]);
        setAssignments([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const loadedRoles = await listSchoolRoles(selectedSchoolId);
        const schoolProfiles = profiles.filter((profile) => profile.school_id === selectedSchoolId);
        const [loadedPermissions, loadedAssignments, loadedRequests] = await Promise.all([
          listRolePermissions(loadedRoles.map((role) => role.id)),
          listRoleAssignments(schoolProfiles.map((profile) => profile.id)),
          listPermissionRequests(selectedSchoolId),
        ]);
        setRoles(loadedRoles);
        setPermissions(loadedPermissions);
        setAssignments(loadedAssignments);
        setRequests(loadedRequests);
        setSelectedRoleId((current) =>
          loadedRoles.some((role) => role.id === current) ? current : (loadedRoles[0]?.id ?? null),
        );
      } catch (loadError) {
        setError(getReadableAdminError(loadError, "Schoolconfiguratie kon niet worden geladen."));
      } finally {
        setLoading(false);
      }
    },
    [profiles],
  );

  useEffect(() => {
    void loadBase();
  }, []);

  useEffect(() => {
    if (schoolId && profiles.length) void loadSchool(schoolId);
  }, [loadSchool, schoolId, profiles.length]);

  const selectedSchool = schools.find((school) => school.id === schoolId);
  const schoolProfiles = profiles.filter((profile) => profile.school_id === schoolId);

  return (
    <AdminGuard>
      {(profile) => (
        <AdminShell
          profile={profile}
          title="Rollen & rangen"
          subtitle="Centraal beheer van gestapelde rollen en alle Schoolpulse-permissies"
        >
          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-end gap-4">
                <label className="min-w-72 flex-1">
                  <span className="mb-1 block text-xs font-semibold">Selecteer een school</span>
                  <select
                    value={schoolId}
                    onChange={(event) => setSchoolId(event.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="rounded-lg bg-muted px-4 py-2 text-xs text-muted-foreground">
                  {roles.length} rollen · {schoolProfiles.length} accounts · {definitions.length}{" "}
                  permissies
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                {(
                  [
                    ["roles", "Rollen & permissies", ShieldCheck],
                    ["assignments", "Roltoewijzingen", Users],
                    ["requests", "Verzoeken", AlertTriangle],
                  ] as const
                ).map(([value, label, Icon]) => (
                  <button
                    key={value}
                    onClick={() => setTab(value)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${tab === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                  >
                    <Icon className="h-4 w-4" /> {label}
                    {value === "requests" &&
                    requests.filter((request) =>
                      ["submitted", "in_review", "needs_information"].includes(request.status),
                    ).length > 0 ? (
                      <span className="rounded-full bg-background/20 px-1.5 text-[10px]">
                        {
                          requests.filter((request) =>
                            ["submitted", "in_review", "needs_information"].includes(
                              request.status,
                            ),
                          ).length
                        }
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}
            {loading ? (
              <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                Configuratie laden…
              </div>
            ) : null}

            {!loading && schoolId && tab === "roles" ? (
              <RolesEditor
                schoolId={schoolId}
                roles={roles}
                definitions={definitions}
                permissions={permissions}
                selectedRoleId={selectedRoleId}
                onSelectRole={setSelectedRoleId}
                saving={saving}
                setSaving={setSaving}
                onReload={() => loadSchool(schoolId)}
                onError={setError}
              />
            ) : null}

            {!loading && schoolId && tab === "assignments" ? (
              <AssignmentsEditor
                profiles={schoolProfiles}
                roles={roles}
                assignments={assignments}
                onReload={() => loadSchool(schoolId)}
                onError={setError}
              />
            ) : null}

            {!loading && schoolId && tab === "requests" ? (
              <RequestsEditor
                requests={requests}
                profiles={profiles}
                roles={roles}
                schoolName={selectedSchool?.name ?? "school"}
                onReload={() => loadSchool(schoolId)}
                onError={setError}
              />
            ) : null}
          </div>
        </AdminShell>
      )}
    </AdminGuard>
  );
}

function RolesEditor({
  schoolId,
  roles,
  definitions,
  permissions,
  selectedRoleId,
  onSelectRole,
  saving,
  setSaving,
  onReload,
  onError,
}: {
  schoolId: string;
  roles: SchoolRole[];
  definitions: PermissionDefinition[];
  permissions: RolePermission[];
  selectedRoleId: string | null;
  onSelectRole: (id: string | null) => void;
  saving: boolean;
  setSaving: (value: boolean) => void;
  onReload: () => Promise<void>;
  onError: (message: string | null) => void;
}) {
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rank, setRank] = useState(300);
  const [color, setColor] = useState("#2563eb");
  const [active, setActive] = useState(true);
  const [permissionDraft, setPermissionDraft] = useState<Map<string, Scope>>(new Map());
  const [query, setQuery] = useState("");
  const [onlyEnabled, setOnlyEnabled] = useState(false);
  const [newRoleOpen, setNewRoleOpen] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!selectedRole) return;
    setName(selectedRole.name);
    setDescription(selectedRole.description ?? "");
    setRank(selectedRole.rank);
    setColor(selectedRole.color);
    setActive(selectedRole.is_active);
    setPermissionDraft(
      new Map(
        permissions
          .filter((permission) => permission.role_id === selectedRole.id)
          .map((permission) => [permission.permission_key, permission.scope]),
      ),
    );
  }, [permissions, selectedRole]);

  const groups = useMemo(() => {
    const result = new Map<string, PermissionDefinition[]>();
    for (const definition of definitions) {
      if (
        query &&
        !`${definition.category_label} ${definition.action_label} ${definition.description}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
        continue;
      if (onlyEnabled && !permissionDraft.has(definition.key)) continue;
      const list = result.get(definition.category_label) ?? [];
      list.push(definition);
      result.set(definition.category_label, list);
    }
    return result;
  }, [definitions, onlyEnabled, permissionDraft, query]);

  const save = async () => {
    if (!selectedRole || !name.trim()) return;
    setSaving(true);
    onError(null);
    try {
      await updateSchoolRole(selectedRole.id, {
        name,
        description,
        rank,
        color,
        is_active: active,
      });
      await replaceRolePermissions(
        selectedRole.id,
        [...permissionDraft].map(([permission_key, scope]) => ({ permission_key, scope })),
      );
      toast.success("Rol en permissies opgeslagen");
      await onReload();
    } catch (saveError) {
      onError(getReadableAdminError(saveError, "Rol opslaan is mislukt."));
    } finally {
      setSaving(false);
    }
  };

  const create = async (clone = false) => {
    if (!newName.trim()) return;
    setSaving(true);
    onError(null);
    try {
      const created = await createSchoolRole({
        school_id: schoolId,
        name: newName,
        description: clone ? `Kopie van ${selectedRole?.name ?? "rol"}` : "Nieuwe schoolrol",
        rank: clone ? rank : 300,
        color: clone ? color : "#2563eb",
      });
      if (clone && selectedRole) {
        await replaceRolePermissions(
          created.id,
          [...permissionDraft].map(([permission_key, scope]) => ({ permission_key, scope })),
        );
      }
      setNewName("");
      setNewRoleOpen(false);
      await onReload();
      onSelectRole(created.id);
      toast.success(clone ? "Rol gekopieerd" : "Rol aangemaakt");
    } catch (createError) {
      onError(getReadableAdminError(createError, "Rol aanmaken is mislukt."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selectedRole || selectedRole.is_default) return;
    if (!window.confirm(`Rol “${selectedRole.name}” definitief verwijderen?`)) return;
    setSaving(true);
    try {
      await deleteSchoolRole(selectedRole.id);
      onSelectRole(null);
      await onReload();
      toast.success("Rol verwijderd");
    } catch (deleteError) {
      onError(
        getReadableAdminError(
          deleteError,
          "Rol verwijderen is mislukt. Controleer of de rol nog aan accounts is toegewezen.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Rangorde</h2>
          <button
            onClick={() => setNewRoleOpen((value) => !value)}
            className="rounded-lg bg-primary p-2 text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {newRoleOpen ? (
          <div className="mt-3 space-y-2 rounded-xl border border-border bg-muted/30 p-3">
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Naam van de rol"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                disabled={!newName.trim() || saving}
                onClick={() => void create(false)}
                className="flex-1 rounded-lg bg-primary px-2 py-2 text-xs font-semibold text-primary-foreground"
              >
                Leeg maken
              </button>
              <button
                disabled={!newName.trim() || !selectedRole || saving}
                onClick={() => void create(true)}
                className="flex items-center gap-1 rounded-lg border border-border px-2 py-2 text-xs"
              >
                <Copy className="h-3.5 w-3.5" /> Kopiëren
              </button>
            </div>
          </div>
        ) : null}
        <div className="mt-3 space-y-2">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className={`w-full rounded-xl border p-3 text-left ${selectedRoleId === role.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
            >
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: role.color }} />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{role.name}</span>
                <span className="text-xs font-bold text-muted-foreground">{role.rank}</span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                {permissions.filter((permission) => permission.role_id === role.id).length} rechten
                · v{role.version}
              </div>
            </button>
          ))}
        </div>
      </aside>

      {selectedRole ? (
        <section className="space-y-5">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap gap-3">
              <label className="min-w-56 flex-1">
                <span className="mb-1 block text-xs font-semibold">Rolnaam</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="w-32">
                <span className="mb-1 block text-xs font-semibold">Rang</span>
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={rank}
                  onChange={(event) => setRank(Number(event.target.value))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="w-28">
                <span className="mb-1 block text-xs font-semibold">Kleur</span>
                <input
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background p-1"
                />
              </label>
            </div>
            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-semibold">Omschrijving</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <div className="mt-3 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) => setActive(event.target.checked)}
                />{" "}
                Rol actief
              </label>
              <div className="flex gap-2">
                {!selectedRole.is_default ? (
                  <button
                    onClick={() => void remove()}
                    disabled={saving}
                    className="flex items-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-sm text-destructive"
                  >
                    <Trash2 className="h-4 w-4" /> Verwijderen
                  </button>
                ) : null}
                <button
                  onClick={() => void save()}
                  disabled={saving || !name.trim()}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  <Save className="h-4 w-4" /> {saving ? "Opslaan…" : "Alles opslaan"}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-64 flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Zoek in alle permissies…"
                    className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={onlyEnabled}
                    onChange={(event) => setOnlyEnabled(event.target.checked)}
                  />{" "}
                  Alleen ingeschakeld
                </label>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {permissionDraft.size} actief
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Rechten worden bij meerdere rollen opgeteld. Uit betekent: deze rol verleent het
                recht niet; een andere rol kan het nog steeds geven.
              </p>
            </div>
            <div className="max-h-[700px] divide-y divide-border overflow-y-auto">
              {[...groups].map(([category, categoryDefinitions]) => (
                <div key={category} className="p-5">
                  <h3 className="mb-3 text-sm font-semibold">{category}</h3>
                  <div className="space-y-2">
                    {categoryDefinitions.map((definition) => {
                      const enabled = permissionDraft.has(definition.key);
                      const scope =
                        permissionDraft.get(definition.key) ??
                        definition.allowed_scopes.at(-1) ??
                        "school";
                      return (
                        <div
                          key={definition.key}
                          className={`grid gap-3 rounded-xl border p-3 md:grid-cols-[minmax(0,1fr)_230px] ${enabled ? "border-primary/40 bg-primary/[0.03]" : "border-border"}`}
                        >
                          <label className="flex cursor-pointer gap-3">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={(event) =>
                                setPermissionDraft((current) => {
                                  const next = new Map(current);
                                  if (event.target.checked)
                                    next.set(definition.key, scope as Scope);
                                  else next.delete(definition.key);
                                  return next;
                                })
                              }
                              className="mt-1"
                            />
                            <span>
                              <span className="text-sm font-semibold">
                                {definition.action_label}
                              </span>
                              <span
                                className={`ml-2 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${definition.risk_level === "critical" ? "bg-destructive/10 text-destructive" : definition.risk_level === "sensitive" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}
                              >
                                {definition.risk_level}
                              </span>
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                {definition.description}
                              </span>
                              <code className="mt-1 block text-[10px] text-muted-foreground">
                                {definition.key}
                              </code>
                            </span>
                          </label>
                          <select
                            disabled={!enabled}
                            value={scope}
                            onChange={(event) =>
                              setPermissionDraft((current) =>
                                new Map(current).set(definition.key, event.target.value as Scope),
                              )
                            }
                            className="h-10 rounded-lg border border-border bg-background px-3 text-xs disabled:opacity-40"
                          >
                            {definition.allowed_scopes.map((allowedScope) => (
                              <option key={allowedScope} value={allowedScope}>
                                {scopeLabels[allowedScope]}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Maak of selecteer een rol.
        </div>
      )}
    </div>
  );
}

function AssignmentsEditor({
  profiles,
  roles,
  assignments,
  onReload,
  onError,
}: {
  profiles: Profile[];
  roles: SchoolRole[];
  assignments: RoleAssignment[];
  onReload: () => Promise<void>;
  onError: (message: string | null) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold">Meerdere rollen per account</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Alle permissies worden automatisch gestapeld. De hoogste rang wordt de effectieve rang; de
        primaire rol bepaalt alleen de standaardweergave.
      </p>
      <div className="mt-5 space-y-3">
        {profiles.map((profile) => (
          <AssignmentRow
            key={profile.id}
            profile={profile}
            roles={roles}
            assignments={assignments.filter((assignment) => assignment.profile_id === profile.id)}
            onReload={onReload}
            onError={onError}
          />
        ))}
        {!profiles.length ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Deze school heeft nog geen accounts.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AssignmentRow({
  profile,
  roles,
  assignments,
  onReload,
  onError,
}: {
  profile: Profile;
  roles: SchoolRole[];
  assignments: RoleAssignment[];
  onReload: () => Promise<void>;
  onError: (message: string | null) => void;
}) {
  const [selected, setSelected] = useState<string[]>(
    assignments.map((assignment) => assignment.role_id),
  );
  const [primary, setPrimary] = useState(
    assignments.find((assignment) => assignment.is_primary)?.role_id ??
      assignments[0]?.role_id ??
      "",
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelected(assignments.map((assignment) => assignment.role_id));
    setPrimary(
      assignments.find((assignment) => assignment.is_primary)?.role_id ??
        assignments[0]?.role_id ??
        "",
    );
  }, [assignments]);

  const save = async () => {
    setSaving(true);
    onError(null);
    try {
      await setProfileRoles(
        profile.id,
        selected,
        selected.includes(primary) ? primary : (selected[0] ?? null),
      );
      await onReload();
      toast.success(`Rollen van ${profile.full_name ?? profile.email} opgeslagen`);
    } catch (saveError) {
      onError(getReadableAdminError(saveError, "Rollen toewijzen is mislukt."));
    } finally {
      setSaving(false);
    }
  };

  const effectiveRank = Math.max(
    0,
    ...roles.filter((role) => selected.includes(role.id)).map((role) => role.rank),
  );

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-56 flex-1">
          <div className="text-sm font-semibold">{profile.full_name ?? profile.email}</div>
          <div className="text-xs text-muted-foreground">{profile.email}</div>
        </div>
        <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
          Effectieve rang {effectiveRank}
        </div>
        <button
          onClick={() => void save()}
          disabled={saving}
          className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
        >
          {saving ? "Opslaan…" : "Toewijzing opslaan"}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {roles
          .filter((role) => role.is_active)
          .map((role) => {
            const checked = selected.includes(role.id);
            return (
              <label
                key={role.id}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs ${checked ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) =>
                    setSelected((current) =>
                      event.target.checked
                        ? [...current, role.id]
                        : current.filter((id) => id !== role.id),
                    )
                  }
                />
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: role.color }}
                />
                {role.name}
                {checked ? (
                  <input
                    type="radio"
                    name={`primary-${profile.id}`}
                    checked={primary === role.id}
                    onChange={() => setPrimary(role.id)}
                    title="Primaire rol"
                  />
                ) : null}
              </label>
            );
          })}
      </div>
    </div>
  );
}

function RequestsEditor({
  requests,
  profiles,
  roles,
  schoolName,
  onReload,
  onError,
}: {
  requests: PermissionRequest[];
  profiles: Profile[];
  roles: SchoolRole[];
  schoolName: string;
  onReload: () => Promise<void>;
  onError: (message: string | null) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Verzoeken van {schoolName}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Een verzoek verandert nooit automatisch rechten. Alleen jouw beslissing en daaropvolgende
          configuratiewijziging kunnen toegang aanpassen.
        </p>
      </div>
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          requester={profiles.find((profile) => profile.id === request.requested_by)}
          role={roles.find((role) => role.id === request.target_role_id)}
          onReload={onReload}
          onError={onError}
        />
      ))}
      {!requests.length ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Geen verzoeken voor deze school.
        </div>
      ) : null}
    </div>
  );
}

function RequestCard({
  request,
  requester,
  role,
  onReload,
  onError,
}: {
  request: PermissionRequest;
  requester?: Profile;
  role?: SchoolRole;
  onReload: () => Promise<void>;
  onError: (message: string | null) => void;
}) {
  const [status, setStatus] = useState(request.status);
  const [response, setResponse] = useState(request.platform_response ?? "");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      await reviewPermissionRequest(request.id, status, response);
      await onReload();
      toast.success("Verzoek bijgewerkt");
    } catch (saveError) {
      onError(getReadableAdminError(saveError, "Verzoek bijwerken is mislukt."));
    } finally {
      setSaving(false);
    }
  };
  return (
    <article
      className={`rounded-2xl border bg-card p-5 ${request.urgency === "urgent" ? "border-warning" : "border-border"}`}
    >
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{request.title}</h3>
            {request.urgency === "urgent" ? (
              <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-bold text-warning">
                DRINGEND
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {requester?.full_name ?? requester?.email ?? "Onbekend"} ·{" "}
            {role?.name ?? "Nieuwe/algemene rol"} ·{" "}
            {new Date(request.created_at).toLocaleString("nl-NL")}
          </div>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
          {requestStatusLabels[request.status] ?? request.status}
        </span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg bg-muted/40 p-3">
          <div className="text-[10px] font-bold uppercase text-muted-foreground">
            Gewenste wijziging
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm">{request.summary}</p>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <div className="text-[10px] font-bold uppercase text-muted-foreground">Reden</div>
          <p className="mt-1 whitespace-pre-wrap text-sm">{request.business_reason}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[240px_minmax(0,1fr)_auto]">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          {[
            "in_review",
            "needs_information",
            "approved",
            "partially_approved",
            "rejected",
            "scheduled",
            "completed",
            "cancelled",
          ].map((value) => (
            <option key={value} value={value}>
              {requestStatusLabels[value]}
            </option>
          ))}
        </select>
        <textarea
          value={response}
          onChange={(event) => setResponse(event.target.value)}
          rows={2}
          placeholder="Reactie voor de directie…"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={() => void save()}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Check className="h-4 w-4" /> Opslaan
        </button>
      </div>
    </article>
  );
}
