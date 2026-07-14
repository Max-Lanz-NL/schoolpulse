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
  ShieldQuestion,
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
  updated_at: string;
};

const legacyEditableEntities = new Set([
  "activity",
  "homework",
  "study_planner",
  "agenda",
  "consent",
]);

const realtimeTables = [
  "app_records",
  "timetable_entries",
  "attendance_records",
  "absence_requests",
  "messages",
  "assignments",
  "file_assets",
  "assessments",
  "grades",
  "student_reports",
  "notifications",
  "student_support_notes",
  "payment_requests",
] as const;

type EffectivePermission = {
  permission_key: string;
  scope: "own" | "assigned" | "team" | "school";
  source_roles: string[];
};

const modules = [
  {
    path: "/app",
    entity: "dashboard",
    permission: "dashboard.view",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/app/rooster",
    entity: "schedule",
    permission: "schedule.view",
    label: "Rooster",
    icon: Calendar,
  },
  {
    path: "/app/cijfers",
    entity: "grade",
    permission: "grades.view",
    label: "Cijfers",
    icon: BarChart3,
  },
  {
    path: "/app/berichten",
    entity: "message",
    permission: "messages.view",
    label: "Berichten",
    icon: MessageSquare,
  },
  {
    path: "/app/opdrachten",
    entity: "assignment",
    permission: "assignments.view",
    label: "Opdrachten",
    icon: BookOpen,
  },
  {
    path: "/app/documenten",
    entity: "document",
    permission: "documents.view",
    label: "Documenten",
    icon: FileText,
  },
  {
    path: "/app/activiteiten",
    entity: "activity",
    permission: "activities.view",
    label: "Activiteiten",
    icon: Activity,
  },
  {
    path: "/app/aanwezigheid",
    entity: "attendance",
    permission: "attendance.view",
    label: "Aanwezigheid",
    icon: CheckCircle2,
  },
  {
    path: "/app/leerlingen",
    entity: "student",
    permission: "students.view",
    label: "Leerlingen",
    icon: Users,
  },
  {
    path: "/app/huiswerk",
    entity: "homework",
    permission: "homework.view",
    label: "Huiswerk",
    icon: BookOpen,
  },
  {
    path: "/app/studieplanner",
    entity: "study_planner",
    permission: "study_planner.view",
    label: "Studieplanner",
    icon: Calendar,
  },
  {
    path: "/app/agenda",
    entity: "agenda",
    permission: "agenda.view",
    label: "Agenda",
    icon: Calendar,
  },
  {
    path: "/app/absentie",
    entity: "absence",
    permission: "absences.view",
    label: "Absentie",
    icon: Bell,
  },
  {
    path: "/app/gesprekken",
    entity: "conversation",
    permission: "conversations.view",
    label: "Gesprekken",
    icon: MessageSquare,
  },
  {
    path: "/app/toestemming",
    entity: "consent",
    permission: "consent.view",
    label: "Toestemming",
    icon: CheckCircle2,
  },
  {
    path: "/app/toetsen",
    entity: "test",
    permission: "tests.view",
    label: "Toetsen",
    icon: FileText,
  },
  {
    path: "/app/personeel",
    entity: "staff",
    permission: "staff.view",
    label: "Personeel",
    icon: Users,
  },
  {
    path: "/app/vervanging",
    entity: "substitution",
    permission: "substitutions.view",
    label: "Vervanging",
    icon: RefreshCw,
  },
  {
    path: "/app/rapporten",
    entity: "report",
    permission: "reports.view",
    label: "Rapporten",
    icon: BarChart3,
  },
  {
    path: "/app/notificaties",
    entity: "notification",
    permission: "notifications.view",
    label: "Notificaties",
    icon: Bell,
  },
  {
    path: "/app/begeleiding",
    entity: "care",
    permission: "care.view",
    label: "Begeleiding",
    icon: ShieldQuestion,
  },
  {
    path: "/app/integraties",
    entity: "integration",
    permission: "integrations.view",
    label: "Integraties",
    icon: RefreshCw,
  },
  {
    path: "/app/betalingen",
    entity: "payment",
    permission: "payments.view",
    label: "Betalingen",
    icon: FileText,
  },
  {
    path: "/app/gebruikersbeheer",
    entity: "user_management",
    permission: "user_management.view",
    label: "Gebruikersbeheer",
    icon: Users,
  },
  {
    path: "/app/import",
    entity: "data_import",
    permission: "data_import.view",
    label: "Gegevens importeren",
    icon: FileText,
  },
  {
    path: "/app/avg",
    entity: "privacy",
    permission: "privacy.view",
    label: "AVG & privacy",
    icon: ShieldQuestion,
  },
  {
    path: "/app/rechten-aanvragen",
    entity: "permission_requests",
    permission: "permission_requests.create",
    label: "Rechten aanvragen",
    icon: ShieldQuestion,
  },
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
      permission: `${pathname.replace(/^\/app\/?/, "").replaceAll("/", "_") || "dashboard"}.view`,
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
  const [effectivePermissions, setEffectivePermissions] = useState<EffectivePermission[]>([]);
  const [effectiveRank, setEffectiveRank] = useState(0);
  const [accessLoading, setAccessLoading] = useState(true);

  const permissionMap = useMemo(
    () =>
      new Map(effectivePermissions.map((permission) => [permission.permission_key, permission])),
    [effectivePermissions],
  );
  const can = useCallback(
    (permissionKey: string) =>
      profile.role === "platform_admin" || permissionMap.has(permissionKey),
    [permissionMap, profile.role],
  );

  const loadAccess = useCallback(async () => {
    setAccessLoading(true);
    const [{ data: permissionData, error: permissionError }, { data: rankData }] =
      await Promise.all([supabase.rpc("effective_permissions"), supabase.rpc("effective_rank")]);
    if (permissionError) {
      setError(
        "Je rollen en rechten konden niet worden geladen. Controleer of de permissiemigratie is uitgevoerd.",
      );
      setEffectivePermissions([]);
    } else {
      setEffectivePermissions((permissionData ?? []) as EffectivePermission[]);
      setEffectiveRank(Number(rankData ?? 0));
    }
    setAccessLoading(false);
  }, [supabase]);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: queryError } = await supabase
      .from("production_module_items")
      .select("id,school_id,entity_type,title,description,event_at,status,updated_at")
      .order("event_at", { ascending: true, nullsFirst: false })
      .order("updated_at", { ascending: false });

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
    void loadAccess();
    void loadRecords();

    let channel = supabase.channel(`school-app-${profile.school_id ?? "platform"}`);
    realtimeTables.forEach((table) => {
      channel = channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          ...(profile.school_id ? { filter: `school_id=eq.${profile.school_id}` } : {}),
        },
        () => void loadRecords(),
      );
    });
    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profile_role_assignments" },
        () => void loadAccess(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "role_permissions" },
        () => void loadAccess(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "school_roles",
          ...(profile.school_id ? { filter: `school_id=eq.${profile.school_id}` } : {}),
        },
        () => void loadAccess(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadAccess, loadRecords, profile.school_id, supabase]);

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

  const recordPermissionCategory = (entity: string) =>
    ({
      grade: "grades",
      message: "messages",
      assignment: "assignments",
      document: "documents",
      activity: "activities",
      student: "students",
    })[entity] ?? entity;

  const visibleModules = modules.filter((module) => can(module.permission));
  const editableLegacyModule = legacyEditableEntities.has(activeModule.entity);
  const canCreate =
    editableLegacyModule && can(`${recordPermissionCategory(activeModule.entity)}.create`);
  const canDelete =
    editableLegacyModule && can(`${recordPermissionCategory(activeModule.entity)}.delete`);

  if (accessLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 text-sm text-muted-foreground">
        Rollen en rechten laden…
      </div>
    );
  }

  if (!can(activeModule.permission)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <ShieldQuestion className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 text-xl font-bold">Geen toegang tot dit onderdeel</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Geen van je toegewezen rollen verleent deze permissie. Vraag de directie of
            platformbeheerder om hulp.
          </p>
          <Link
            to="/app"
            className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Naar dashboard
          </Link>
        </div>
      </div>
    );
  }

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
          {visibleModules.map((module) => {
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
            {effectivePermissions
              .flatMap((permission) => permission.source_roles)
              .filter((value, index, values) => values.indexOf(value) === index)
              .join(" + ") || roleLabels[profile.role]}{" "}
            · rang {effectiveRank}
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
              {profile.school_name || "Schoolpulse productie"} · live gegevens
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
          {activeModule.entity === "permission_requests" ? (
            <PermissionRequestWizard profile={profile} supabase={supabase} />
          ) : activeModule.entity === "dashboard" ? (
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visibleModules
                .filter(
                  (module) =>
                    module.entity !== "dashboard" && module.entity !== "permission_requests",
                )
                .slice(0, 4)
                .map((module) => (
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

          {activeModule.entity !== "permission_requests" ? (
            <section className="rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border p-4 md:p-5">
                <div>
                  <h2 className="font-semibold">
                    {activeModule.entity === "dashboard"
                      ? "Laatste wijzigingen"
                      : activeModule.label}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Rechtstreeks uit de Schoolpulse-database; updates verschijnen automatisch.
                  </p>
                </div>
                {canCreate && profile.school_id && activeModule.entity !== "dashboard" ? (
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
                    {canDelete ? (
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
          ) : null}
        </main>
      </div>
    </div>
  );
}

type RequestType = "change_role" | "new_role" | "change_rank" | "remove_access" | "advice";

type RequestRole = {
  id: string;
  name: string;
  description: string | null;
  rank: number;
  color: string;
};

type PermissionRequestSummary = {
  id: string;
  title: string;
  status: string;
  summary: string;
  platform_response: string | null;
  urgency: "normal" | "urgent";
  created_at: string;
};

const requestTypes: Array<{ value: RequestType; label: string; help: string }> = [
  {
    value: "change_role",
    label: "Bestaande rol aanpassen",
    help: "Iemand iets extra laten bekijken, aanpassen of goedkeuren.",
  },
  {
    value: "new_role",
    label: "Nieuwe rol aanvragen",
    help: "Bijvoorbeeld zorgcoördinator, stagiair of afdelingsleider.",
  },
  {
    value: "change_rank",
    label: "Rangorde aanpassen",
    help: "Veranderen wie onder welke functie valt.",
  },
  {
    value: "remove_access",
    label: "Toegang beperken",
    help: "Een bestaand recht veilig laten verwijderen.",
  },
  {
    value: "advice",
    label: "Ik weet het nog niet",
    help: "Beschrijf de situatie; platformbeheer denkt mee.",
  },
];

const plainPermissionOptions = [
  [
    "students.view",
    "Leerlinggegevens bekijken",
    "Bepaalde of alle leerlingdossiers kunnen inzien.",
  ],
  ["grades.view", "Cijfers bekijken", "Cijfers bekijken binnen het gewenste bereik."],
  ["grades.create", "Cijfers invoeren", "Nieuwe cijfers voor leerlingen kunnen invoeren."],
  ["grades.publish", "Cijfers publiceren", "Ingevoerde cijfers definitief zichtbaar maken."],
  ["attendance.update", "Aanwezigheid registreren", "Aanwezigheid en afwezigheid bijwerken."],
  ["absences.approve", "Absenties goedkeuren", "Ziekmeldingen en absenties beoordelen."],
  [
    "messages.create",
    "Berichten versturen",
    "Veilig berichten naar leerlingen, ouders of medewerkers sturen.",
  ],
  ["announcements.publish", "Schoolbrede mededelingen", "Berichten voor grote groepen publiceren."],
  [
    "documents.export",
    "Documenten exporteren",
    "Bestanden buiten Schoolpulse downloaden of exporteren.",
  ],
  ["reports.export", "Rapportages exporteren", "School- of afdelingsrapportages exporteren."],
  ["staff.view", "Personeel bekijken", "Personeelsinformatie binnen team of school zien."],
  ["user_management.manage", "Accounts beheren", "Accounts aanmaken, aanpassen en deactiveren."],
] as const;

const requestStatusLabels: Record<string, string> = {
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

function PermissionRequestWizard({
  profile,
  supabase,
}: {
  profile: ProductionProfile;
  supabase: SupabaseClient;
}) {
  const [step, setStep] = useState(1);
  const [requestType, setRequestType] = useState<RequestType>("change_role");
  const [roles, setRoles] = useState<RequestRole[]>([]);
  const [requests, setRequests] = useState<PermissionRequestSummary[]>([]);
  const [targetRoleId, setTargetRoleId] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedChanges, setSelectedChanges] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [reason, setReason] = useState("");
  const [affectedPeople, setAffectedPeople] = useState("");
  const [urgency, setUrgency] = useState<"normal" | "urgent">("normal");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!profile.school_id) return;
    const [rolesResult, requestsResult] = await Promise.all([
      supabase
        .from("school_roles")
        .select("id,name,description,rank,color")
        .eq("school_id", profile.school_id)
        .eq("is_active", true)
        .order("rank", { ascending: false }),
      supabase
        .from("permission_change_requests")
        .select("id,title,status,summary,platform_response,urgency,created_at")
        .eq("school_id", profile.school_id)
        .order("created_at", { ascending: false }),
    ]);
    if (!rolesResult.error) setRoles((rolesResult.data ?? []) as RequestRole[]);
    if (!requestsResult.error)
      setRequests((requestsResult.data ?? []) as PermissionRequestSummary[]);
  }, [profile.school_id, supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedRole = roles.find((role) => role.id === targetRoleId);
  const requestTypeInfo = requestTypes.find((type) => type.value === requestType)!;
  const canContinue =
    step === 1 ||
    (step === 2 &&
      (requestType === "new_role"
        ? newRoleName.trim().length >= 2
        : requestType === "advice" || Boolean(targetRoleId))) ||
    (step === 3 &&
      (selectedChanges.length > 0 || requestType === "change_rank" || requestType === "advice")) ||
    (step === 4 && summary.trim().length >= 10 && reason.trim().length >= 10);

  const submit = async () => {
    if (!profile.school_id || !canContinue) return;
    setSubmitting(true);
    const title =
      requestType === "new_role"
        ? `Nieuwe rol: ${newRoleName.trim()}`
        : `${requestTypeInfo.label}${selectedRole ? ` voor ${selectedRole.name}` : ""}`;
    const { error } = await supabase.from("permission_change_requests").insert({
      school_id: profile.school_id,
      requested_by: profile.id,
      request_type: requestType,
      target_role_id: targetRoleId || null,
      title,
      summary: summary.trim(),
      business_reason: reason.trim(),
      desired_changes: {
        requested_role_name: newRoleName.trim() || null,
        permission_keys: selectedChanges,
        plain_language_selections: plainPermissionOptions
          .filter(([key]) => selectedChanges.includes(key))
          .map(([, label]) => label),
      },
      affected_people: affectedPeople.trim() || null,
      urgency,
      requested_effective_date: effectiveDate || null,
      status: "submitted",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Verzoek kon niet worden ingediend", { description: error.message });
      return;
    }
    toast.success("Verzoek veilig ingediend bij platformbeheer");
    setStep(1);
    setTargetRoleId("");
    setNewRoleName("");
    setSelectedChanges([]);
    setSummary("");
    setReason("");
    setAffectedPeople("");
    setUrgency("normal");
    setEffectiveDate("");
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-5">
        <div className="flex gap-3">
          <ShieldQuestion className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
          <div>
            <h2 className="font-semibold">Wij helpen je stap voor stap</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Je verandert hier nog geen rechten. Je beschrijft wat de school nodig heeft;
              platformbeheer controleert veiligheid, privacy en gevolgen voordat iets wordt
              aangepast.
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Nieuwe aanvraag</h2>
              <p className="text-xs text-muted-foreground">Stap {step} van 5</p>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((number) => (
                <span
                  key={number}
                  className={`h-2 w-8 rounded-full ${number <= step ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="p-5">
          {step === 1 ? (
            <div>
              <h3 className="text-lg font-bold">Wat wil je veranderen?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Kies wat het beste past. Je kunt later alles toelichten.
              </p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {requestTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setRequestType(type.value)}
                    className={`rounded-xl border p-4 text-left ${requestType === type.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}
                  >
                    <div className="font-semibold">{type.label}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{type.help}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h3 className="text-lg font-bold">Voor welke rol?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                De rang staat erbij ter informatie. Platformbeheer controleert de uiteindelijke
                positie.
              </p>
              {requestType === "new_role" ? (
                <label className="mt-5 block">
                  <span className="mb-1 block text-sm font-semibold">
                    Gewenste naam van de nieuwe rol
                  </span>
                  <input
                    value={newRoleName}
                    onChange={(event) => setNewRoleName(event.target.value)}
                    placeholder="Bijvoorbeeld Zorgcoördinator"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
              ) : requestType === "advice" ? (
                <div className="mt-5 rounded-xl bg-muted/40 p-4 text-sm">
                  Je hoeft nog geen rol te kiezen. Beschrijf in stap 4 gewoon het probleem of de
                  gewenste werkwijze.
                </div>
              ) : (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setTargetRoleId(role.id)}
                      className={`rounded-xl border p-4 text-left ${targetRoleId === role.id ? "border-primary bg-primary/5" : "border-border"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: role.color }}
                        />
                        <span className="font-semibold">{role.name}</span>
                        <span className="ml-auto text-xs font-bold text-muted-foreground">
                          rang {role.rank}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {role.description || "Schoolrol"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <h3 className="text-lg font-bold">Wat moet deze rol kunnen?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Kies in gewone taal. Je aanvraag geeft nog geen directe toegang.
              </p>
              {requestType === "change_rank" || requestType === "advice" ? (
                <div className="mt-5 rounded-xl bg-muted/40 p-4 text-sm">
                  Je hoeft hier niets aan te vinken. Beschrijf de gewenste rangorde of situatie in
                  de volgende stap.
                </div>
              ) : (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {plainPermissionOptions.map(([key, label, help]) => {
                    const checked = selectedChanges.includes(key);
                    return (
                      <label
                        key={key}
                        className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${checked ? "border-primary bg-primary/5" : "border-border"}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) =>
                            setSelectedChanges((current) =>
                              event.target.checked
                                ? [...current, key]
                                : current.filter((value) => value !== key),
                            )
                          }
                          className="mt-1"
                        />
                        <span>
                          <span className="font-semibold">{label}</span>
                          <span className="mt-1 block text-xs text-muted-foreground">{help}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <h3 className="text-lg font-bold">Leg de situatie kort uit</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Een concreet praktijkvoorbeeld helpt ons een veilige oplossing voor te stellen.
              </p>
              <div className="mt-5 grid gap-4">
                <label>
                  <span className="mb-1 block text-sm font-semibold">
                    Wat moet er precies veranderen?
                  </span>
                  <textarea
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    rows={4}
                    placeholder="Bijvoorbeeld: mentoren moeten ziekmeldingen van hun eigen mentorklas kunnen controleren, maar geen cijfers kunnen aanpassen."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-sm font-semibold">Waarom is dit nodig?</span>
                  <textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={3}
                    placeholder="Beschrijf het huidige probleem en wat dit voor de school oplost."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>
                <div className="grid gap-3 md:grid-cols-3">
                  <label>
                    <span className="mb-1 block text-xs font-semibold">
                      Voor welke medewerkers?
                    </span>
                    <input
                      value={affectedPeople}
                      onChange={(event) => setAffectedPeople(event.target.value)}
                      placeholder="Bijv. 8 mentoren"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-semibold">Gewenste ingangsdatum</span>
                    <input
                      type="date"
                      value={effectiveDate}
                      onChange={(event) => setEffectiveDate(event.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-semibold">Urgentie</span>
                    <select
                      value={urgency}
                      onChange={(event) => setUrgency(event.target.value as "normal" | "urgent")}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="normal">Normaal</option>
                      <option value="urgent">Dringend</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          ) : null}

          {step === 5 ? (
            <div>
              <h3 className="text-lg font-bold">Controleer je aanvraag</h3>
              <div className="mt-5 space-y-3 rounded-xl border border-border bg-muted/30 p-5 text-sm">
                <div>
                  <span className="font-semibold">Type:</span> {requestTypeInfo.label}
                </div>
                <div>
                  <span className="font-semibold">Rol:</span>{" "}
                  {newRoleName || selectedRole?.name || "Advies gevraagd"}
                </div>
                <div>
                  <span className="font-semibold">Gewenste mogelijkheden:</span>{" "}
                  {plainPermissionOptions
                    .filter(([key]) => selectedChanges.includes(key))
                    .map(([, label]) => label)
                    .join(", ") || "Zie toelichting"}
                </div>
                <div>
                  <span className="font-semibold">Verandering:</span> {summary}
                </div>
                <div>
                  <span className="font-semibold">Reden:</span> {reason}
                </div>
              </div>
              <div className="mt-4 flex gap-2 rounded-lg bg-primary/5 p-3 text-xs text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                Na indienen beoordeelt platformbeheer het verzoek. Er worden nu nog geen permissies
                gewijzigd.
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-between border-t border-border p-5">
          <button
            onClick={() => setStep((current) => Math.max(1, current - 1))}
            disabled={step === 1 || submitting}
            className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40"
          >
            Vorige
          </button>
          {step < 5 ? (
            <button
              onClick={() => setStep((current) => Math.min(5, current + 1))}
              disabled={!canContinue}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              Volgende
            </button>
          ) : (
            <button
              onClick={() => void submit()}
              disabled={submitting || !canContinue}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              {submitting ? "Indienen…" : "Verzoek indienen"}
            </button>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Mijn schoolverzoeken</h2>
        <div className="mt-4 space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="min-w-0 flex-1 font-semibold">{request.title}</div>
                {request.urgency === "urgent" ? (
                  <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-bold text-warning">
                    DRINGEND
                  </span>
                ) : null}
                <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold">
                  {requestStatusLabels[request.status] ?? request.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{request.summary}</p>
              {request.platform_response ? (
                <div className="mt-3 rounded-lg bg-primary/5 p-3 text-sm">
                  <span className="font-semibold">Reactie platformbeheer:</span>{" "}
                  {request.platform_response}
                </div>
              ) : null}
              <div className="mt-2 text-[11px] text-muted-foreground">
                Ingediend op {new Date(request.created_at).toLocaleString("nl-NL")}
              </div>
            </div>
          ))}
          {!requests.length ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nog geen verzoeken ingediend.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
