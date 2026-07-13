import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plus,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import logo from "@/assets/schoolpulse-logo.png";

type ProductionRole = "platform_admin" | "school_admin" | "teacher" | "student" | "parent";

type ProductionProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: ProductionRole;
  school_name: string | null;
  school_id: string | null;
};

type AppRecord = {
  id: string;
  school_id: string;
  entity_type: string;
  title: string;
  description: string | null;
  event_at: string | null;
  status: string;
  payload: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at: string;
};

const modules = [
  { path: "/app", entity: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/app/rooster", entity: "schedule", label: "Rooster", icon: Calendar },
  { path: "/app/cijfers", entity: "grade", label: "Cijfers", icon: BarChart3 },
  { path: "/app/berichten", entity: "message", label: "Berichten", icon: MessageSquare },
  { path: "/app/opdrachten", entity: "assignment", label: "Opdrachten", icon: BookOpen },
  { path: "/app/documenten", entity: "document", label: "Documenten", icon: FileText },
  { path: "/app/activiteiten", entity: "activity", label: "Activiteiten", icon: Activity },
  { path: "/app/aanwezigheid", entity: "attendance", label: "Aanwezigheid", icon: CheckCircle2 },
  { path: "/app/leerlingen", entity: "student", label: "Leerlingen", icon: Users },
] as const;

const roleLabels: Record<ProductionRole, string> = {
  platform_admin: "Platformbeheerder",
  school_admin: "Schoolbeheerder",
  teacher: "Docent",
  student: "Leerling",
  parent: "Ouder/verzorger",
};

function moduleForPath(pathname: string) {
  return (
    modules.find((module) => module.path === pathname) ?? {
      path: pathname,
      entity: pathname.replace(/^\/app\/?/, "").replaceAll("/", "_") || "dashboard",
      label: pathname.split("/").filter(Boolean).at(-1)?.replaceAll("-", " ") ?? "Dashboard",
      icon: FileText,
    }
  );
}
export function ProductionApp({
  profile,
  supabase,
  onSignOut,
}: {
  profile: ProductionProfile;
  supabase: SupabaseClient;
  onSignOut: () => Promise<void>;
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeModule = moduleForPath(pathname);
  const [records, setRecords] = useState<AppRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventAt, setEventAt] = useState("");
  const [saving, setSaving] = useState(false);

  const canManage = ["platform_admin", "school_admin", "teacher"].includes(profile.role);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: queryError } = await supabase
      .from("app_records")
      .select(
        "id,school_id,entity_type,title,description,event_at,status,payload,created_by,created_at,updated_at",
      )
      .order("event_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(
        "De productiedata kon niet worden geladen. Controleer of de nieuwste database-migratie is uitgevoerd.",
      );
      setRecords([]);
    } else {
      setRecords((data ?? []) as AppRecord[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadRecords();

    const channel = supabase
      .channel(`school-app-${profile.school_id ?? "platform"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "app_records",
          ...(profile.school_id ? { filter: `school_id=eq.${profile.school_id}` } : {}),
        },
        () => void loadRecords(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadRecords, profile.school_id, supabase]);

  const visibleRecords = useMemo(
    () =>
      activeModule.entity === "dashboard"
        ? records
        : records.filter((record) => record.entity_type === activeModule.entity),
    [activeModule.entity, records],
  );

  const saveRecord = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile.school_id || !title.trim()) return;
    setSaving(true);
    const { error: insertError } = await supabase.from("app_records").insert({
      school_id: profile.school_id,
      entity_type: activeModule.entity,
      title: title.trim(),
      description: description.trim() || null,
      event_at: eventAt ? new Date(eventAt).toISOString() : null,
      created_by: profile.id,
    });
    setSaving(false);
    if (insertError) {
      toast.error("Opslaan mislukt", { description: insertError.message });
      return;
    }
    setTitle("");
    setDescription("");
    setEventAt("");
    setEditorOpen(false);
    toast.success("Opgeslagen in Schoolpulse");
  };

  const deleteRecord = async (id: string) => {
    const { error: deleteError } = await supabase.from("app_records").delete().eq("id", id);
    if (deleteError) toast.error("Verwijderen mislukt", { description: deleteError.message });
    else toast.success("Item verwijderd");
  };

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <img src={logo} alt="Schoolpulse" className="h-9 w-9" />
          <div>
            <div className="text-sm font-bold text-white">Schoolpulse</div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              Productieomgeving
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3 pt-5">
          {modules.map((module) => {
            const Icon = module.icon;
            const active = pathname === module.path;
            return (
              <Link
                key={module.path}
                to={module.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent"}`}
              >
                <Icon className="h-4 w-4" /> {module.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="truncate text-sm font-semibold text-white">
            {profile.full_name || profile.email}
          </div>
          <div className="truncate text-xs text-sidebar-foreground/60">
            {roleLabels[profile.role]} Â· {profile.school_name || "Schoolpulse"}
          </div>
          <button
            onClick={() => void onSignOut()}
            className="mt-3 flex items-center gap-2 text-xs hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" /> Uitloggen
          </button>
        </div>
      </aside>

      <div className="min-h-screen md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-border bg-background/95 px-4 backdrop-blur md:px-8">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold capitalize">{activeModule.label}</h1>
            <p className="truncate text-xs text-muted-foreground">
              {profile.school_name || "Schoolpulse productie"} Â· live gegevens
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void loadRecords()}
              className="rounded-lg border border-border p-2 hover:bg-muted"
              aria-label="Vernieuwen"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <Bell className="h-4 w-4 text-muted-foreground" />
            <button
              onClick={() => void onSignOut()}
              className="rounded-lg border border-border px-3 py-2 text-xs font-semibold md:hidden"
            >
              Uitloggen
            </button>
          </div>
        </header>

        <main className="p-4 md:p-8">
          {activeModule.entity === "dashboard" ? (
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {modules.slice(1, 5).map((module) => (
                <Link
                  key={module.path}
                  to={module.path}
                  className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-primary"
                >
                  <div className="text-xs font-medium text-muted-foreground">{module.label}</div>
                  <div className="mt-2 text-3xl font-bold">
                    {records.filter((record) => record.entity_type === module.entity).length}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">actuele items</div>
                </Link>
              ))}
            </div>
          ) : null}

          <section className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border p-4 md:p-5">
              <div>
                <h2 className="font-semibold">
                  {activeModule.entity === "dashboard" ? "Laatste wijzigingen" : activeModule.label}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Rechtstreeks uit de Schoolpulse-database; updates verschijnen automatisch.
                </p>
              </div>
              {canManage && profile.school_id && activeModule.entity !== "dashboard" ? (
                <button
                  onClick={() => setEditorOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                >
                  <Plus className="h-4 w-4" /> Toevoegen
                </button>
              ) : null}
            </div>

            {editorOpen ? (
              <form
                onSubmit={saveRecord}
                className="grid gap-3 border-b border-border bg-muted/30 p-4 md:grid-cols-2 md:p-5"
              >
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Titel"
                  required
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <input
                  type="datetime-local"
                  value={eventAt}
                  onChange={(event) => setEventAt(event.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Omschrijving"
                  rows={3}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm md:col-span-2"
                />
                <div className="flex gap-2 md:col-span-2">
                  <button
                    disabled={saving}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    {saving ? "Opslaanâ€¦" : "Opslaan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorOpen(false)}
                    className="rounded-lg border border-border px-4 py-2 text-sm"
                  >
                    Annuleren
                  </button>
                </div>
              </form>
            ) : null}

            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Productiedata ladenâ€¦
              </div>
            ) : null}
            {error ? (
              <div className="m-5 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            ) : null}
            {!loading && !error && visibleRecords.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-sm font-semibold">Nog geen gegevens</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Deze productieomgeving toont bewust geen voorbeelddata.
                </p>
              </div>
            ) : null}
            <div className="divide-y divide-border">
              {visibleRecords.map((record) => (
                <article key={record.id} className="flex gap-4 p-4 md:p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{record.title}</h3>
                      {activeModule.entity === "dashboard" ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {record.entity_type}
                        </span>
                      ) : null}
                    </div>
                    {record.description ? (
                      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                        {record.description}
                      </p>
                    ) : null}
                    <div className="mt-2 text-[11px] text-muted-foreground">
                      {record.event_at
                        ? new Date(record.event_at).toLocaleString("nl-NL")
                        : `Bijgewerkt ${new Date(record.updated_at).toLocaleString("nl-NL")}`}
                    </div>
                  </div>
                  {canManage ? (
                    <button
                      onClick={() => void deleteRecord(record.id)}
                      className="self-start rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Verwijderen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
