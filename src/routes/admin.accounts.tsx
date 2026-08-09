import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  createAccount,
  deleteAccount,
  getReadableAdminError,
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
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [deleteEmailInput, setDeleteEmailInput] = useState("");
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

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
    } catch (loadError) {
      setError(getReadableAdminError(loadError, "Accounts konden niet worden geladen."));
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createEmail.trim())) {
      setError("Vul een geldig e-mailadres in.");
      return;
    }
    if (createPassword.length < 8) {
      setError("Wachtwoord moet minimaal 8 tekens bevatten.");
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
    } catch (createError) {
      setError(getReadableAdminError(createError, "Account aanmaken is mislukt."));
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
    if (!editName.trim()) {
      setError("Naam is verplicht.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail.trim())) {
      setError("Vul een geldig e-mailadres in.");
      return;
    }
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
    } catch (updateError) {
      setError(getReadableAdminError(updateError, "Account wijzigen is mislukt."));
    } finally {
      setSaving(false);
    }
  };

  const removeAccount = async (userId: string) => {
    setSaving(true);
    setError(null);
    try {
      await deleteAccount(userId);
      setDeleteTarget(null);
      setDeleteEmailInput("");
      setDeleteConfirmed(false);
      await load();
    } catch (deleteError) {
      setError(getReadableAdminError(deleteError, "Account verwijderen is mislukt."));
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
                                onClick={() => {
                                  setDeleteTarget(account);
                                  setDeleteEmailInput("");
                                  setDeleteConfirmed(false);
                                }}
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
          {deleteTarget && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
              <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6">
                <h2 className="text-lg font-bold">Account verwijderen</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Deze actie is definitief. Verwijderen kan alleen na dubbele bevestiging.
                </p>
                <p className="mt-3 rounded-lg bg-muted p-3 text-sm">
                  Typ exact: <strong>{deleteTarget.email}</strong>
                </p>
                <input
                  value={deleteEmailInput}
                  onChange={(e) => setDeleteEmailInput(e.target.value)}
                  className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Bevestig account e-mail"
                />
                <label className="mt-3 inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={deleteConfirmed}
                    onChange={(e) => setDeleteConfirmed(e.target.checked)}
                  />
                  Ik begrijp dat dit definitief is en niet teruggedraaid kan worden.
                </label>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteTarget(null);
                      setDeleteEmailInput("");
                      setDeleteConfirmed(false);
                    }}
                    className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
                  >
                    Annuleren
                  </button>
                  <button
                    type="button"
                    disabled={
                      saving ||
                      !deleteConfirmed ||
                      deleteEmailInput.trim().toLowerCase() !== deleteTarget.email.toLowerCase()
                    }
                    onClick={() => void removeAccount(deleteTarget.id)}
                    className="rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground disabled:opacity-60"
                  >
                    Definitief verwijderen
                  </button>
                </div>
              </div>
            </div>
          )}
        </AdminShell>
      )}
    </AdminGuard>
  );
}
