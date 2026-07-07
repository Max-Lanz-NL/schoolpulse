import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  createAccount,
  deleteAccount,
  listProfiles,
  listSchools,
  updateAccount,
  type AdminRole,
  type Profile,
  type School,
} from "@/lib/admin-client";

export const Route = createFileRoute("/admin/accounts")({
  component: AdminAccountsPage,
});

const roleOptions: AdminRole[] = ["platform_admin", "school_admin", "teacher", "student", "parent"];

function AdminAccountsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [schools, setSchools] = useState<School[]>([]);

  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<AdminRole>("school_admin");
  const [createSchoolId, setCreateSchoolId] = useState<string>("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<AdminRole>("teacher");
  const [editSchoolId, setEditSchoolId] = useState<string>("");

  const schoolsById = useMemo(
    () => new Map(schools.map((school) => [school.id, school])),
    [schools],
  );

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [loadedProfiles, loadedSchools] = await Promise.all([listProfiles(), listSchools()]);
      setProfiles(loadedProfiles);
      setSchools(loadedSchools);
      setLoading(false);
    } catch {
      setError("Accounts konden niet worden geladen.");
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim() || !createEmail.trim() || !createPassword) {
      setError("Naam, e-mail en wachtwoord zijn verplicht.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const school = schoolsById.get(createSchoolId);
      await createAccount({
        full_name: createName,
        email: createEmail,
        password: createPassword,
        role: createRole,
        school_id: createSchoolId || null,
        school_name: school?.name ?? null,
      });
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateRole("school_admin");
      setCreateSchoolId("");
      await load();
    } catch {
      setError("Account aanmaken is mislukt.");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (profile: Profile) => {
    setEditingId(profile.id);
    setEditName(profile.full_name ?? "");
    setEditEmail(profile.email);
    setEditRole(profile.role);
    setEditSchoolId(profile.school_id ?? "");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    setError(null);
    try {
      const school = schoolsById.get(editSchoolId);
      await updateAccount({
        user_id: editingId,
        full_name: editName,
        email: editEmail,
        role: editRole,
        school_id: editSchoolId || null,
        school_name: school?.name ?? null,
      });
      setEditingId(null);
      await load();
    } catch {
      setError("Account wijzigen is mislukt.");
    } finally {
      setSaving(false);
    }
  };

  const removeAccount = async (userId: string) => {
    setSaving(true);
    setError(null);
    try {
      await deleteAccount(userId);
      await load();
    } catch {
      setError("Account verwijderen is mislukt.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminGuard>
      {(profile) => (
        <AdminShell
          profile={profile}
          title="Accounts beheer"
          subtitle="Beheer gebruikers, rollen en schoolkoppelingen"
        >
          <div className="space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={submitCreate} className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold">Nieuw account aanmaken</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-5">
                <input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Volledige naam"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="E-mail"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  type="password"
                  placeholder="Tijdelijk wachtwoord"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value as AdminRole)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <select
                  value={createSchoolId}
                  onChange={(e) => setCreateSchoolId(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">Geen school</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                Account toevoegen
              </button>
            </form>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold">Alle accounts</h2>
              {loading ? (
                <div className="mt-4 text-sm text-muted-foreground">Accounts laden...</div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">Naam</th>
                        <th className="px-3 py-2">E-mail</th>
                        <th className="px-3 py-2">Rol</th>
                        <th className="px-3 py-2">School</th>
                        <th className="px-3 py-2">Aangemaakt</th>
                        <th className="px-3 py-2 text-right">Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map((account) => {
                        const isEditing = editingId === account.id;
                        return (
                          <tr key={account.id} className="border-t border-border/70">
                            <td className="px-3 py-2">
                              {isEditing ? (
                                <input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full rounded-md border border-border bg-background px-2 py-1"
                                />
                              ) : (
                                (account.full_name ?? "-")
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {isEditing ? (
                                <input
                                  value={editEmail}
                                  onChange={(e) => setEditEmail(e.target.value)}
                                  className="w-full rounded-md border border-border bg-background px-2 py-1"
                                />
                              ) : (
                                account.email
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {isEditing ? (
                                <select
                                  value={editRole}
                                  onChange={(e) => setEditRole(e.target.value as AdminRole)}
                                  className="w-full rounded-md border border-border bg-background px-2 py-1"
                                >
                                  {roleOptions.map((role) => (
                                    <option key={role} value={role}>
                                      {role}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                account.role
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {isEditing ? (
                                <select
                                  value={editSchoolId}
                                  onChange={(e) => setEditSchoolId(e.target.value)}
                                  className="w-full rounded-md border border-border bg-background px-2 py-1"
                                >
                                  <option value="">Geen school</option>
                                  {schools.map((school) => (
                                    <option key={school.id} value={school.id}>
                                      {school.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                (account.school_name ?? "-")
                              )}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {new Date(account.created_at).toLocaleDateString("nl-NL")}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {!isEditing && (
                                <button
                                  type="button"
                                  onClick={() => startEditing(account)}
                                  className="rounded-md px-2 py-1 text-xs font-semibold hover:bg-muted"
                                >
                                  Bewerken
                                </button>
                              )}
                              {isEditing && (
                                <>
                                  <button
                                    type="button"
                                    onClick={saveEdit}
                                    disabled={saving}
                                    className="rounded-md px-2 py-1 text-xs font-semibold text-primary hover:bg-muted disabled:opacity-60"
                                  >
                                    Opslaan
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingId(null)}
                                    className="ml-1 rounded-md px-2 py-1 text-xs font-semibold hover:bg-muted"
                                  >
                                    Annuleren
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => removeAccount(account.id)}
                                disabled={saving || account.id === profile.id}
                                className="ml-1 rounded-md px-2 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-40"
                              >
                                Verwijderen
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </AdminShell>
      )}
    </AdminGuard>
  );
}
