import { Link } from "@tanstack/react-router";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useDashboard } from "@/domains/dashboard/queries/use-dashboard";

type Props = {
  supabase: SupabaseClient;
  profile: { id: string; full_name: string | null; role: string };
};

const dateTime = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const time = new Intl.DateTimeFormat("nl-NL", { hour: "2-digit", minute: "2-digit" });

function Panel({
  title,
  icon: Icon,
  link,
  children,
}: {
  title: string;
  icon: typeof Calendar;
  link: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="flex items-center gap-2 font-semibold">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </h2>
        <Link to={link} className="text-xs font-semibold text-primary hover:underline">
          Alles bekijken
        </Link>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl bg-muted/40 px-3 py-6 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

export function DashboardWorkspace({ supabase, profile }: Props) {
  const { data, loading, error, reload } = useDashboard(supabase, profile.id);
  if (loading)
    return (
      <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
        <RefreshCw className="h-4 w-4 animate-spin" />
        Dashboard laden…
      </div>
    );
  if (error || !data)
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-center gap-2 font-semibold text-destructive">
          <AlertCircle className="h-5 w-5" />
          Dashboard kon niet worden geladen
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <button
          onClick={() => void reload()}
          className="mt-4 rounded-lg border px-3 py-2 text-sm font-semibold"
        >
          Opnieuw proberen
        </button>
      </div>
    );

  const now = Date.now();
  const upcomingLessons = data.lessons
    .filter((lesson) => new Date(lesson.ends_at).getTime() >= now)
    .slice(0, 4);
  const openAssignments = data.assignments.filter(
    (assignment) =>
      assignment.status === "published" &&
      (!assignment.due_at || new Date(assignment.due_at).getTime() >= now),
  );
  const publishedGrades = data.grades.filter((grade) => grade.status !== "draft");
  const recentGrades = publishedGrades.slice(0, 4);
  const ownAttendance = data.attendance.filter(
    (record) => profile.role !== "student" || record.student_profile_id === profile.id,
  );
  const pendingSubmissions = data.submissions.filter(
    (submission) => submission.status === "submitted",
  );
  const unregisteredLessons = data.lessons.filter(
    (lesson) =>
      lesson.status !== "cancelled" &&
      new Date(lesson.ends_at).getTime() < now &&
      !data.attendance.some((record) => record.timetable_entry_id === lesson.id),
  );
  const isStudent = profile.role === "student";
  const isSchoolLeadership = ["platform_admin", "school_admin"].includes(profile.role);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(todayStart);
    date.setDate(date.getDate() - (6 - index));
    const key = date.toLocaleDateString("nl-NL");
    const records = data.attendance.filter(
      (record) =>
        record.lesson && new Date(record.lesson.starts_at).toLocaleDateString("nl-NL") === key,
    );
    const present = records.filter((record) =>
      ["present", "late", "remote"].includes(record.status),
    ).length;
    const total = records.length;
    return {
      label: new Intl.DateTimeFormat("nl-NL", { weekday: "short" }).format(date),
      present: total ? Math.round((present / total) * 100) : 0,
      total,
    };
  });
  const attendanceMax = Math.max(100, ...weekDays.map((day) => day.present));
  const gradesBySubject = Array.from(
    publishedGrades
      .reduce((summary, grade) => {
        const name = grade.assessment?.subject?.name ?? "Overige vakken";
        const value = grade.grade ?? (grade.score !== null ? Number(grade.score) : null);
        if (value === null || !Number.isFinite(value)) return summary;
        const current = summary.get(name) ?? { total: 0, count: 0 };
        current.total += value;
        current.count += 1;
        summary.set(name, current);
        return summary;
      }, new Map<string, { total: number; count: number }>())
      .entries(),
  )
    .map(([name, values]) => ({ name, average: values.total / values.count, count: values.count }))
    .sort((a, b) => a.name.localeCompare(b.name, "nl-NL"));

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl bg-primary p-5 text-primary-foreground shadow-sm md:p-6">
        <div className="relative z-10">
          <p className="text-sm capitalize opacity-80">
            {new Intl.DateTimeFormat("nl-NL", {
              weekday: "long",
              day: "numeric",
              month: "long",
            }).format(new Date())}
          </p>
          <h1 className="mt-1 text-2xl font-bold">
            Welkom{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-sm opacity-85">
            {isStudent
              ? "Dit staat er voor jou klaar."
              : profile.role === "teacher"
                ? "Dit vraagt vandaag je aandacht."
                : "Actueel overzicht van je school."}
          </p>
        </div>
        <div className="pointer-events-none absolute -right-8 -top-20 h-56 w-56 rounded-full border-[28px] border-primary-foreground/10" />
        <div className="pointer-events-none absolute -bottom-28 right-24 h-48 w-48 rounded-full bg-primary-foreground/5" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { Icon: Calendar, value: data.lessons.length, label: "lessen vandaag" },
          {
            Icon: BookOpen,
            value: openAssignments.length,
            label: isStudent ? "open opdrachten" : "actieve opdrachten",
          },
          {
            Icon: BarChart3,
            value: publishedGrades.length,
            label: isStudent ? "gepubliceerde cijfers" : "zichtbare cijfers",
          },
          {
            Icon: CheckCircle2,
            value: isStudent
              ? ownAttendance.filter((r) => ["absent", "late"].includes(r.status)).length
              : pendingSubmissions.length + unregisteredLessons.length,
            label: isStudent ? "verzuimmeldingen" : "open acties",
          },
        ].map(({ Icon, value, label }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {isSchoolLeadership ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel
            title="Aanwezigheid · afgelopen 7 dagen"
            icon={CheckCircle2}
            link="/app/aanwezigheid"
          >
            {weekDays.some((day) => day.total > 0) ? (
              <div className="flex h-44 items-end justify-between gap-3 px-2 pt-2">
                {weekDays.map((day) => (
                  <div
                    key={day.label}
                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                    title={`${day.total} registraties`}
                  >
                    {day.total ? (
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {day.present}%
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">—</span>
                    )}
                    <div className="flex h-28 w-full items-end rounded-t-md bg-muted/50">
                      <div
                        className="w-full rounded-t-md bg-primary transition-all"
                        style={{
                          height: `${day.total ? Math.max(6, (day.present / attendanceMax) * 100) : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] capitalize text-muted-foreground">
                      {day.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <Empty>Er zijn nog geen aanwezigheidsregistraties voor deze week.</Empty>
            )}
          </Panel>

          <Panel title="Cijfergemiddelde per vak" icon={BarChart3} link="/app/cijfers">
            {gradesBySubject.length ? (
              <div className="space-y-3">
                {gradesBySubject.slice(0, 6).map((subject) => (
                  <div key={subject.name}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                      <span className="truncate font-medium">{subject.name}</span>
                      <span className="shrink-0 font-semibold">
                        {subject.average.toLocaleString("nl-NL", {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        })}{" "}
                        <span className="font-normal text-muted-foreground">
                          · {subject.count} {subject.count === 1 ? "cijfer" : "cijfers"}
                        </span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.min(100, Math.max(0, (subject.average / 10) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty>Er zijn nog geen gepubliceerde cijfers om te tonen.</Empty>
            )}
          </Panel>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title={isStudent ? "Volgende lessen" : "Lessen vandaag"}
          icon={Calendar}
          link="/app/rooster"
        >
          {upcomingLessons.length ? (
            <div className="space-y-3">
              {upcomingLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-start justify-between gap-3 rounded-xl bg-muted/40 p-3"
                >
                  <div>
                    <div className="font-semibold">
                      {lesson.subject?.name ?? lesson.group?.name ?? "Les"}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {lesson.group?.name}
                      {lesson.room ? ` · ${lesson.room.code}` : ""}
                      {lesson.substitutions?.[0]?.replacement
                        ? ` · vervanging: ${lesson.substitutions[0].replacement.full_name ?? lesson.substitutions[0].replacement.email}`
                        : ""}
                    </div>
                    {lesson.status === "cancelled" ? (
                      <span className="mt-2 inline-block rounded-full bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive">
                        Uitgevallen
                      </span>
                    ) : lesson.status === "changed" ? (
                      <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                        Gewijzigd
                      </span>
                    ) : null}
                  </div>
                  <div className="whitespace-nowrap text-sm font-semibold">
                    {time.format(new Date(lesson.starts_at))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty>Geen komende lessen vandaag.</Empty>
          )}
        </Panel>

        <Panel title="Openstaande opdrachten" icon={BookOpen} link="/app/opdrachten">
          {openAssignments.length ? (
            <div className="space-y-3">
              {openAssignments.map((assignment) => (
                <div key={assignment.id} className="rounded-xl bg-muted/40 p-3">
                  <div className="font-semibold">{assignment.title}</div>
                  <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                    <span>{assignment.subject?.name ?? "Opdracht"}</span>
                    <span>·</span>
                    <span>
                      {assignment.due_at
                        ? `deadline ${dateTime.format(new Date(assignment.due_at))}`
                        : "geen deadline"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty>Geen openstaande opdrachten.</Empty>
          )}
        </Panel>

        {isStudent ? (
          <>
            <Panel title="Recente cijfers" icon={BarChart3} link="/app/cijfers">
              {recentGrades.length ? (
                <div className="space-y-3">
                  {recentGrades.map((grade) => (
                    <div
                      key={grade.id}
                      className="flex items-center justify-between rounded-xl bg-muted/40 p-3"
                    >
                      <div>
                        <div className="font-semibold">
                          {grade.assessment?.title ?? "Beoordeling"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {grade.assessment?.subject?.name ?? "Vak"}
                        </div>
                      </div>
                      <div className="text-xl font-bold text-primary">
                        {grade.is_excused ? "Vrij" : (grade.grade ?? "–")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty>Nog geen gepubliceerde cijfers.</Empty>
              )}
            </Panel>
            <Panel title="Aanwezigheid" icon={CheckCircle2} link="/app/aanwezigheid">
              {ownAttendance.length ? (
                <div className="space-y-3">
                  {ownAttendance.slice(0, 4).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between rounded-xl bg-muted/40 p-3"
                    >
                      <div>
                        <div className="font-semibold">{record.lesson?.subject?.name ?? "Les"}</div>
                        <div className="text-xs text-muted-foreground">
                          {record.lesson ? dateTime.format(new Date(record.lesson.starts_at)) : ""}
                        </div>
                      </div>
                      <span className="rounded-full bg-background px-2 py-1 text-xs font-semibold">
                        {record.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty>Nog geen aanwezigheidsregistraties.</Empty>
              )}
            </Panel>
          </>
        ) : (
          <Panel title="Openstaande acties" icon={Clock} link="/app/aanwezigheid">
            <div className="space-y-3">
              <div className="rounded-xl bg-muted/40 p-3">
                <div className="font-semibold">
                  {unregisteredLessons.length} lessen zonder registratie
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Afgelopen lessen van vandaag zonder aanwezigheidsrecords.
                </p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <div className="font-semibold">
                  {pendingSubmissions.length} inleveringen te beoordelen
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ingezonden werk met status ingeleverd.
                </p>
              </div>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
