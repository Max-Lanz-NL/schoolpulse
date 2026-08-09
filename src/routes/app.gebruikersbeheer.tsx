import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { personeel, roleUsers, type Role } from "@/lib/demo-data";
import { useState } from "react";
import { Search, UserCog, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/gebruikersbeheer")({ component: GebruikersbeheerPage });

type UserStatus = "actief" | "inactief";
type UserRecord = {
  id: string;
  naam: string;
  rol: Role;
  status: UserStatus;
  aangemaakt: string;
  koppeling?: string;
};

const initUsers: UserRecord[] = [
  ...personeel.map((p) => ({
    id: p.id,
    naam: p.naam,
    rol: (p.rol.toLowerCase().includes("teamleider") ? "teamleider" : "docent") as Role,
    status: (p.aanwezig ? "actief" : "inactief") as UserStatus,
    aangemaakt: "1 sep 2025",
  })),
  {
    id: "demo-leerling",
    naam: roleUsers.leerling.name,
    rol: "leerling",
    status: "actief",
    aangemaakt: "1 sep 2025",
  },
  {
    id: "demo-ouder",
    naam: roleUsers.ouder.name,
    rol: "ouder",
    status: "actief",
    aangemaakt: "1 sep 2025",
  },
  {
    id: "demo-directie",
    naam: roleUsers.directie.name,
    rol: "directie",
    status: "actief",
    aangemaakt: "1 aug 2025",
  },
];

const rolLabels: Record<Role, string> = {
  leerling: "Leerling",
  docent: "Docent",
  ouder: "Ouder",
  teamleider: "Teamleider",
  directie: "Directie",
};

function GebruikersbeheerPage() {
  const [users, setUsers] = useState<UserRecord[]>(initUsers);
  const [searchQ, setSearchQ] = useState("");
  const [filterTab, setFilterTab] = useState<"alle" | "actief" | "inactief">("alle");
  const [nieuwOpen, setNieuwOpen] = useState(false);
  const [nieuw, setNieuw] = useState({ naam: "", rol: "leerling" as Role, koppeling: "V4A" });
  const [log, setLog] = useState([
    "Directie wijzigde rol van demo-account",
    "Systeem blokkeerde 2 mislukte inlogpogingen",
  ]);

  const filtered = users.filter((u) => {
    if (filterTab === "actief" && u.status !== "actief") return false;
    if (filterTab === "inactief" && u.status !== "inactief") return false;
    if (
      searchQ.trim() &&
      !u.naam.toLowerCase().includes(searchQ.toLowerCase()) &&
      !u.rol.includes(searchQ.toLowerCase())
    )
      return false;
    return true;
  });

  const totaal = users.length;
  const actief = users.filter((u) => u.status === "actief").length;
  const inactief = users.filter((u) => u.status === "inactief").length;
  const admins = users.filter((u) => u.rol === "directie" || u.rol === "teamleider").length;

  const updateRol = (id: string, rol: Role) => {
    setUsers((s) => s.map((u) => (u.id === id ? { ...u, rol } : u)));
    setLog((l) => [`Rol gewijzigd naar ${rol}`, ...l]);
  };
  const toggleStatus = (id: string) =>
    setUsers((s) =>
      s.map((u) =>
        u.id === id ? { ...u, status: u.status === "actief" ? "inactief" : "actief" } : u,
      ),
    );

  return (
    <AppShell title="Gebruikersbeheer" subtitle="Accounts, rollen en toegangsrechten">
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Totaal accounts", value: totaal },
          { label: "Actief", value: actief },
          { label: "Inactief", value: inactief },
          { label: "Admins / Beheerders", value: admins },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserCog className="h-4 w-4" />
            </div>
            <div className="mt-3 text-xs text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Zoek gebruiker..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="inline-flex overflow-hidden rounded-lg border border-border">
          {(["alle", "actief", "inactief"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterTab(t)}
              className={`px-3 py-1.5 text-xs font-semibold capitalize ${filterTab === t ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => setNieuwOpen((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
        >
          <Plus className="h-3 w-3" />
          Account aanmaken
        </button>
      </div>
      {nieuwOpen && (
        <div className="mb-4 grid gap-2 rounded-xl border bg-card p-4 sm:grid-cols-4">
          <input
            value={nieuw.naam}
            onChange={(e) => setNieuw((n) => ({ ...n, naam: e.target.value }))}
            placeholder="Naam"
            className="rounded-lg border bg-background px-3 py-2 text-xs"
          />
          <select
            value={nieuw.rol}
            onChange={(e) => setNieuw((n) => ({ ...n, rol: e.target.value as Role }))}
            className="rounded-lg border bg-background px-3 py-2 text-xs"
          >
            {Object.entries(rolLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <input
            value={nieuw.koppeling}
            onChange={(e) => setNieuw((n) => ({ ...n, koppeling: e.target.value }))}
            placeholder="Klas of afdeling"
            className="rounded-lg border bg-background px-3 py-2 text-xs"
          />
          <button
            disabled={!nieuw.naam}
            onClick={() => {
              setUsers((u) => [
                {
                  id: `u${Date.now()}`,
                  naam: nieuw.naam,
                  rol: nieuw.rol,
                  status: "actief",
                  aangemaakt: "Vandaag",
                  koppeling: nieuw.koppeling,
                },
                ...u,
              ]);
              setLog((l) => [`Account ${nieuw.naam} aangemaakt`, ...l]);
              setNieuwOpen(false);
              setNieuw({ naam: "", rol: "leerling", koppeling: "V4A" });
              toast.success("Account aangemaakt");
            }}
            className="rounded-lg bg-success px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            Opslaan
          </button>
        </div>
      )}

      <Card title="Alle gebruikers">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">Naam</th>
                <th className="px-4 py-2 text-left">Rol</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Aangemaakt</th>
                <th className="px-4 py-2 text-left">Klas / afdeling</th>
                <th className="px-4 py-2 text-right">Acties</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{u.naam}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.rol}
                      onChange={(e) => updateRol(u.id, e.target.value as Role)}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary"
                    >
                      {(["leerling", "docent", "ouder", "teamleider", "directie"] as Role[]).map(
                        (r) => (
                          <option key={r} value={r}>
                            {rolLabels[r]}
                          </option>
                        ),
                      )}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${u.status === "actief" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.aangemaakt}</td>
                  <td className="px-4 py-3">
                    <input
                      value={u.koppeling ?? (u.rol === "leerling" ? "V4A" : "Bovenbouw")}
                      onChange={(e) =>
                        setUsers((xs) =>
                          xs.map((x) => (x.id === u.id ? { ...x, koppeling: e.target.value } : x)),
                        )
                      }
                      className="w-24 rounded border bg-background px-2 py-1 text-xs"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className={`rounded-lg px-2 py-1 text-xs font-semibold ${u.status === "actief" ? "bg-muted hover:bg-destructive/10 hover:text-destructive" : "bg-success/10 text-success hover:bg-success/20"}`}
                      >
                        {u.status === "actief" ? "Deactiveren" : "Activeren"}
                      </button>
                      <button
                        onClick={() => {
                          setUsers((xs) => xs.filter((x) => x.id !== u.id));
                          setLog((l) => [`Account ${u.naam} verwijderd`, ...l]);
                          toast.success("Account verwijderd");
                        }}
                        className="rounded-lg border border-destructive/30 p-1 text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => toast.success(`Reset e-mail verstuurd naar ${u.naam}`)}
                        className="rounded-lg border border-border px-2 py-1 text-xs hover:bg-muted"
                      >
                        Ww reset
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Geen gebruikers gevonden
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="mt-6">
        <Card title="Activiteitenlogboek">
          <div className="space-y-2">
            {log.map((x, i) => (
              <div key={`${x}-${i}`} className="flex justify-between rounded-lg border p-2 text-xs">
                <span>{x}</span>
                <span className="text-muted-foreground">
                  Vandaag · {10 + i}:2{i}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
