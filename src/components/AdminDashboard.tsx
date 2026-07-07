import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Building2, Shield, UserCog, RefreshCw, Trash2, Save, LogOut } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/schoolpulse-logo.png";
import { Card } from "@/components/Card";

type School = {
  id: string;
  name: string;
  brin_code: string | null;
  city: string | null;
  is_active: boolean;
  created_at: string;
};

type PlatformAccountRole = "platform_admin" | "school_admin" | "support";

type PlatformAccount = {
  id: string;
  full_name: string;
  email: string;
  role: PlatformAccountRole;
  school_id: string | null;
  is_active: boolean;
  created_at: string;
};

type Props = {
  supabase: SupabaseClient;
  onSignOut: () => Promise<void>;
};

type SchoolForm = {
  name: string;
  brinCode: string;
  city: string;
  isActive: boolean;
};

type AccountForm = {
  fullName: string;
  email: string;
  role: PlatformAccountRole;
  schoolId: string;
  isActive: boolean;
};

const emptySchoolForm: SchoolForm = {
  name: "",
  brinCode: "",
  city: "",
  isActive: true,
};

const emptyAccountForm: AccountForm = {
  fullName: "",
  email: "",
  role: "school_admin",
  schoolId: "",
  isActive: true,
};

export function AdminDashboard({ supabase, onSignOut }: Props) {
  const [loading, setLoading] = useState(true);
  const [savingSchool, setSavingSchool] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [schools, setSchools] = useState<School[]>([]);
  const [accounts, setAccounts] = useState<PlatformAccount[]>([]);

  const [schoolForm, setSchoolForm] = useState<SchoolForm>(emptySchoolForm);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);

  const [accountForm, setAccountForm] = useState<AccountForm>(emptyAccountForm);
  const [editingAccounts, setEditingAccounts] = useState<Record<string, AccountForm>>({});

  const [deleteTarget, setDeleteTarget] = useState<School | null>(null);
  const [deleteSchoolName, setDeleteSchoolName] = useState("");
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [deletingSchool, setDeletingSchool] = useState(false);

  const resetSchoolForm = () => {
    setSchoolForm(emptySchoolForm);
    setEditingSchoolId(null);
  };

  const resetAccountForm = () => {
    setAccountForm(emptyAccountForm);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
    setDeleteSchoolName("");
    setDeleteConfirmed(false);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [schoolsResult, accountsResult] = await Promise.all([
      supabase
        .from("schools")
        .select("id,name,brin_code,city,is_active,created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("platform_accounts")
        .select("id,full_name,email,role,school_id,is_active,created_at")
        .order("created_at", { ascending: false }),
    ]);

    if (schoolsResult.error) {
      setError(`Scholen laden mislukt: ${schoolsResult.error.message}`);
      setLoading(false);
      return;
    }

    if (accountsResult.error) {
      setError(`Accounts laden mislukt: ${accountsResult.error.message}`);
      setLoading(false);
      return;
    }

    const loadedSchools = (schoolsResult.data ?? []) as School[];
    const loadedAccounts = (accountsResult.data ?? []) as PlatformAccount[];

    setSchools(loadedSchools);
    setAccounts(loadedAccounts);

    const nextEditingAccounts: Record<string, AccountForm> = {};
    for (const account of loadedAccounts) {
      nextEditingAccounts[account.id] = {
        fullName: account.full_name,
        email: account.email,
        role: account.role,
        schoolId: account.school_id ?? "",
        isActive: account.is_active,
      };
    }
    setEditingAccounts(nextEditingAccounts);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const saveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolForm.name.trim()) {
      setError("Schoolnaam is verplicht.");
      return;
    }

    setSavingSchool(true);
    setError(null);

    const payload = {
      name: schoolForm.name.trim(),
      brin_code: schoolForm.brinCode.trim() || null,
      city: schoolForm.city.trim() || null,
      is_active: schoolForm.isActive,
    };

    const result = editingSchoolId
      ? await supabase.from("schools").update(payload).eq("id", editingSchoolId)
      : await supabase.from("schools").insert(payload);

    if (result.error) {
      setSavingSchool(false);
      setError(`School opslaan mislukt: ${result.error.message}`);
      return;
    }

    toast.success(editingSchoolId ? "School bijgewerkt." : "School aangemaakt.");
    resetSchoolForm();
    setSavingSchool(false);
    void loadData();
  };

  const saveNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.fullName.trim()) {
      setError("Naam is verplicht.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountForm.email.trim())) {
      setError("Vul een geldig e-mailadres in.");
      return;
    }

    setSavingAccount(true);
    setError(null);

    const result = await supabase.from("platform_accounts").insert({
      full_name: accountForm.fullName.trim(),
      email: accountForm.email.trim().toLowerCase(),
      role: accountForm.role,
      school_id: accountForm.schoolId || null,
      is_active: accountForm.isActive,
    });

    if (result.error) {
      setSavingAccount(false);
      setError(`Account aanmaken mislukt: ${result.error.message}`);
      return;
    }

    toast.success("Account aangemaakt.");
    resetAccountForm();
    setSavingAccount(false);
    void loadData();
  };

  const saveAccount = async (accountId: string) => {
    const edit = editingAccounts[accountId];
    if (!edit) return;

    if (!edit.fullName.trim()) {
      setError("Naam is verplicht.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(edit.email.trim())) {
      setError("Vul een geldig e-mailadres in.");
      return;
    }

    setError(null);
    const result = await supabase
      .from("platform_accounts")
      .update({
        full_name: edit.fullName.trim(),
        email: edit.email.trim().toLowerCase(),
        role: edit.role,
        school_id: edit.schoolId || null,
        is_active: edit.isActive,
      })
      .eq("id", accountId);

    if (result.error) {
      setError(`Account bijwerken mislukt: ${result.error.message}`);
      return;
    }

    toast.success("Account bijgewerkt.");
    void loadData();
  };

  const deleteAccount = async (accountId: string) => {
    const result = await supabase.from("platform_accounts").delete().eq("id", accountId);
    if (result.error) {
      setError(`Account verwijderen mislukt: ${result.error.message}`);
      return;
    }
    toast.success("Account verwijderd.");
    void loadData();
  };

  const deleteSchool = async () => {
    if (!deleteTarget) return;
    setDeletingSchool(true);
    setError(null);

    const result = await supabase.from("schools").delete().eq("id", deleteTarget.id);
    if (result.error) {
      setDeletingSchool(false);
      setError(`School verwijderen mislukt: ${result.error.message}`);
      return;
    }

    toast.success("School verwijderd.");
    setDeletingSchool(false);
    closeDeleteDialog();
    void loadData();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:px-8">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Schoolpulse" className="h-9 w-9" />
          <div>
            <div className="text-sm font-bold tracking-tight">Schoolpulse Admin</div>
            <div className="text-xs text-muted-foreground">Platform beheer & databescherming</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadData()}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Ververs
          </button>
          <button
            onClick={() => void onSignOut()}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
          >
            <LogOut className="h-3.5 w-3.5" /> Uitloggen
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-4 md:p-8">
        {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></div>
            <div className="mt-3 text-xs text-muted-foreground">Scholen</div>
            <div className="mt-1 text-2xl font-bold">{schools.length}</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><UserCog className="h-5 w-5" /></div>
            <div className="mt-3 text-xs text-muted-foreground">Accounts</div>
            <div className="mt-1 text-2xl font-bold">{accounts.length}</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Shield className="h-5 w-5" /></div>
            <div className="mt-3 text-xs text-muted-foreground">Platform admins</div>
            <div className="mt-1 text-2xl font-bold">{accounts.filter((account) => account.role === "platform_admin").length}</div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card title={editingSchoolId ? "School wijzigen" : "Nieuwe school aanmaken"}>
            <form onSubmit={saveSchool} className="grid gap-3">
              <input
                value={schoolForm.name}
                onChange={(e) => setSchoolForm((current) => ({ ...current, name: e.target.value }))}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="Schoolnaam"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={schoolForm.brinCode}
                  onChange={(e) => setSchoolForm((current) => ({ ...current, brinCode: e.target.value }))}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="BRIN code"
                />
                <input
                  value={schoolForm.city}
                  onChange={(e) => setSchoolForm((current) => ({ ...current, city: e.target.value }))}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Plaats"
                />
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={schoolForm.isActive}
                  onChange={(e) => setSchoolForm((current) => ({ ...current, isActive: e.target.checked }))}
                />
                Actief
              </label>
              <div className="flex gap-2">
                <button disabled={savingSchool} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60">
                  <Save className="h-3.5 w-3.5" /> {editingSchoolId ? "Opslaan" : "Aanmaken"}
                </button>
                {editingSchoolId && (
                  <button type="button" onClick={resetSchoolForm} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
                    Annuleren
                  </button>
                )}
              </div>
            </form>
          </Card>

          <Card title="Nieuwe account aanmaken">
            <form onSubmit={saveNewAccount} className="grid gap-3">
              <input
                value={accountForm.fullName}
                onChange={(e) => setAccountForm((current) => ({ ...current, fullName: e.target.value }))}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="Volledige naam"
              />
              <input
                value={accountForm.email}
                onChange={(e) => setAccountForm((current) => ({ ...current, email: e.target.value }))}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="E-mailadres"
                type="email"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={accountForm.role}
                  onChange={(e) => setAccountForm((current) => ({ ...current, role: e.target.value as PlatformAccountRole }))}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="platform_admin">platform_admin</option>
                  <option value="school_admin">school_admin</option>
                  <option value="support">support</option>
                </select>
                <select
                  value={accountForm.schoolId}
                  onChange={(e) => setAccountForm((current) => ({ ...current, schoolId: e.target.value }))}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option value="">Geen school</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={accountForm.isActive}
                  onChange={(e) => setAccountForm((current) => ({ ...current, isActive: e.target.checked }))}
                />
                Actief
              </label>
              <button disabled={savingAccount} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60">
                <Save className="h-3.5 w-3.5" /> Account aanmaken
              </button>
            </form>
          </Card>
        </div>

        <Card title="Scholen beheren">
          {loading ? (
            <div className="text-sm text-muted-foreground">Laden...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Naam</th>
                    <th className="px-3 py-2 text-left">BRIN</th>
                    <th className="px-3 py-2 text-left">Plaats</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-right">Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((school) => (
                    <tr key={school.id} className="border-t border-border">
                      <td className="px-3 py-2 font-medium">{school.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{school.brin_code ?? "-"}</td>
                      <td className="px-3 py-2 text-muted-foreground">{school.city ?? "-"}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${school.is_active ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                          {school.is_active ? "Actief" : "Inactief"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingSchoolId(school.id);
                              setSchoolForm({
                                name: school.name,
                                brinCode: school.brin_code ?? "",
                                city: school.city ?? "",
                                isActive: school.is_active,
                              });
                            }}
                            className="rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-muted"
                          >
                            Wijzigen
                          </button>
                          <button
                            onClick={() => setDeleteTarget(school)}
                            className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-2 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Verwijderen
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Accounts beheren">
          {loading ? (
            <div className="text-sm text-muted-foreground">Laden...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Naam</th>
                    <th className="px-3 py-2 text-left">E-mail</th>
                    <th className="px-3 py-2 text-left">Rol</th>
                    <th className="px-3 py-2 text-left">School</th>
                    <th className="px-3 py-2 text-left">Actief</th>
                    <th className="px-3 py-2 text-right">Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => {
                    const edit = editingAccounts[account.id];
                    if (!edit) return null;
                    return (
                      <tr key={account.id} className="border-t border-border">
                        <td className="px-3 py-2">
                          <input
                            value={edit.fullName}
                            onChange={(e) =>
                              setEditingAccounts((current) => ({
                                ...current,
                                [account.id]: { ...current[account.id], fullName: e.target.value },
                              }))
                            }
                            className="w-full rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={edit.email}
                            onChange={(e) =>
                              setEditingAccounts((current) => ({
                                ...current,
                                [account.id]: { ...current[account.id], email: e.target.value },
                              }))
                            }
                            className="w-full rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={edit.role}
                            onChange={(e) =>
                              setEditingAccounts((current) => ({
                                ...current,
                                [account.id]: {
                                  ...current[account.id],
                                  role: e.target.value as PlatformAccountRole,
                                },
                              }))
                            }
                            className="rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary"
                          >
                            <option value="platform_admin">platform_admin</option>
                            <option value="school_admin">school_admin</option>
                            <option value="support">support</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={edit.schoolId}
                            onChange={(e) =>
                              setEditingAccounts((current) => ({
                                ...current,
                                [account.id]: { ...current[account.id], schoolId: e.target.value },
                              }))
                            }
                            className="rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary"
                          >
                            <option value="">Geen school</option>
                            {schools.map((school) => (
                              <option key={school.id} value={school.id}>{school.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={edit.isActive}
                            onChange={(e) =>
                              setEditingAccounts((current) => ({
                                ...current,
                                [account.id]: { ...current[account.id], isActive: e.target.checked },
                              }))
                            }
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => void saveAccount(account.id)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-semibold hover:bg-muted">
                              <Save className="h-3.5 w-3.5" /> Opslaan
                            </button>
                            <button
                              onClick={() => void deleteAccount(account.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-2 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Verwijderen
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-background p-6">
            <h2 className="text-lg font-bold">School verwijderen</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Deze actie is definitief. Verwijderen kan alleen na dubbele bevestiging.
            </p>
            <p className="mt-3 rounded-lg bg-muted p-3 text-sm">
              Typ exact: <strong>{deleteTarget.name}</strong>
            </p>
            <input
              value={deleteSchoolName}
              onChange={(e) => setDeleteSchoolName(e.target.value)}
              className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Bevestig schoolnaam"
            />
            <label className="mt-3 inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={deleteConfirmed}
                onChange={(e) => setDeleteConfirmed(e.target.checked)}
              />
              Ik begrijp dat dit definitief is en data kan beïnvloeden.
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={closeDeleteDialog} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
                Annuleren
              </button>
              <button
                disabled={
                  deletingSchool ||
                  !deleteConfirmed ||
                  deleteSchoolName.trim() !== deleteTarget.name
                }
                onClick={() => void deleteSchool()}
                className="inline-flex items-center gap-1 rounded-lg bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" /> Definitief verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
