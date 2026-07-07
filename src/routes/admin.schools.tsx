import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  createSchool,
  deleteSchool,
  listProfiles,
  listSchools,
  updateSchool,
  type Profile,
  type School,
} from "@/lib/admin-client";

export const Route = createFileRoute("/admin/schools")({
  component: AdminSchoolsPage,
});

function AdminSchoolsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const [createName, setCreateName] = useState("");
  const [createAddress, setCreateAddress] = useState("");
  const [createEmail, setCreateEmail] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const userCounts = useMemo(() => {
    const counts = new Map<string, number>();
    profiles.forEach((profile) => {
      if (!profile.school_id) return;
      counts.set(profile.school_id, (counts.get(profile.school_id) ?? 0) + 1);
    });
    return counts;
  }, [profiles]);

  const schoolAdmins = useMemo(() => {
    const admins = new Map<string, string[]>();
    profiles.forEach((profile) => {
      if (profile.role !== "school_admin" || !profile.school_id) return;
      const list = admins.get(profile.school_id) ?? [];
      list.push(profile.full_name ?? profile.email);
      admins.set(profile.school_id, list);
    });
    return admins;
  }, [profiles]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [loadedSchools, loadedProfiles] = await Promise.all([listSchools(), listProfiles()]);
      setSchools(loadedSchools);
      setProfiles(loadedProfiles);
      setLoading(false);
    } catch {
      setError("Scholen konden niet worden geladen.");
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      setError("Schoolnaam is verplicht.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createSchool({
        name: createName,
        address: createAddress,
        contact_email: createEmail,
      });
      setCreateName("");
      setCreateAddress("");
      setCreateEmail("");
      await load();
    } catch {
      setError("School toevoegen is mislukt.");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (school: School) => {
    setEditingId(school.id);
    setEditName(school.name);
    setEditAddress(school.address ?? "");
    setEditEmail(school.contact_email ?? "");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    setError(null);
    try {
      await updateSchool(editingId, {
        name: editName,
        address: editAddress,
        contact_email: editEmail,
      });
      setEditingId(null);
      await load();
    } catch {
      setError("School wijzigen is mislukt.");
    } finally {
      setSaving(false);
    }
  };

  const removeSchool = async (schoolId: string) => {
    setSaving(true);
    setError(null);
    try {
      await deleteSchool(schoolId);
      await load();
    } catch {
      setError("School verwijderen is mislukt.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminGuard>
      {(profile) => (
        <AdminShell
          profile={profile}
          title="Scholenbeheer"
          subtitle="Beheer scholen, contactgegevens en gekoppelde gebruikers"
        >
          <div className="space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={submitCreate} className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold">Nieuwe school toevoegen</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Naam"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  value={createAddress}
                  onChange={(e) => setCreateAddress(e.target.value)}
                  placeholder="Adres"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="Contact e-mail"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                School toevoegen
              </button>
            </form>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold">Scholen</h2>
              {loading ? (
                <div className="mt-4 text-sm text-muted-foreground">Scholen laden...</div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">Naam</th>
                        <th className="px-3 py-2">Adres</th>
                        <th className="px-3 py-2">Contact</th>
                        <th className="px-3 py-2">Gebruikers</th>
                        <th className="px-3 py-2">Schoolbeheerder(s)</th>
                        <th className="px-3 py-2 text-right">Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schools.map((school) => {
                        const isEditing = editingId === school.id;
                        const admins = schoolAdmins.get(school.id) ?? [];
                        return (
                          <tr key={school.id} className="border-t border-border/70">
                            <td className="px-3 py-2">
                              {isEditing ? (
                                <input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full rounded-md border border-border bg-background px-2 py-1"
                                />
                              ) : (
                                school.name
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {isEditing ? (
                                <input
                                  value={editAddress}
                                  onChange={(e) => setEditAddress(e.target.value)}
                                  className="w-full rounded-md border border-border bg-background px-2 py-1"
                                />
                              ) : (
                                (school.address ?? "-")
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
                                (school.contact_email ?? "-")
                              )}
                            </td>
                            <td className="px-3 py-2">{userCounts.get(school.id) ?? 0}</td>
                            <td className="px-3 py-2">
                              {admins.length ? admins.join(", ") : "Nog niet gekoppeld"}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {!isEditing && (
                                <button
                                  type="button"
                                  onClick={() => startEditing(school)}
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
                                onClick={() => removeSchool(school.id)}
                                disabled={saving}
                                className="ml-1 rounded-md px-2 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60"
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
