import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  RefreshCw,
  UserCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAttendance } from "@/domains/attendance/queries/use-attendance";
import {
  getLessonStudents,
  reviewAbsenceRequest,
  saveLessonAttendance,
} from "@/domains/attendance/services/attendance-service";
import type { AttendanceMark, AttendanceStatus, LessonStudent } from "@/domains/attendance/types";
import { validateAttendanceMark } from "@/domains/attendance/validation";
import { readableDomainError } from "@/domains/shared/domain-error";
import { useTimetableWeek } from "@/domains/timetable/queries/use-timetable-week";
import type { TimetableEntry } from "@/domains/timetable/types";
import { mondayOf } from "@/domains/timetable/validation";

type Props = {
  supabase: SupabaseClient;
  profile: { id: string; school_id: string | null; role: string };
  canRecord: boolean;
  canReviewAbsence: boolean;
};

const statusLabels: Record<AttendanceStatus, string> = {
  present: "Aanwezig",
  late: "Te laat",
  absent: "Afwezig",
  excused: "Geoorloofd",
  remote: "Op afstand",
};
const statusOptions = Object.entries(statusLabels) as [AttendanceStatus, string][];

export function AttendanceWorkspace({ supabase, profile, canRecord, canReviewAbsence }: Props) {
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const weekEnd = useMemo(() => new Date(weekStart.getTime() + 7 * 86_400_000), [weekStart]);
  const { entries } = useTimetableWeek(supabase, weekStart);
  const { records, absences, loading, error, reload } = useAttendance(supabase, weekStart, weekEnd);
  const [lesson, setLesson] = useState<TimetableEntry | null>(null);
  const [students, setStudents] = useState<LessonStudent[]>([]);
  const [marks, setMarks] = useState<Map<string, AttendanceMark>>(new Map());
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [reviewDraft, setReviewDraft] = useState<{
    id: string;
    status: "approved" | "rejected";
    note: string;
  } | null>(null);

  const openLesson = async (entry: TimetableEntry) => {
    try {
      const nextStudents = await getLessonStudents(supabase, entry);
      const nextMarks = new Map<string, AttendanceMark>();
      for (const student of nextStudents) {
        const existing = records.find(
          (record) =>
            record.timetable_entry_id === entry.id && record.student_profile_id === student.id,
        );
        nextMarks.set(student.id, {
          status: existing?.status ?? "present",
          minutes_late: existing?.minutes_late ?? 0,
          note: existing?.note ?? "",
        });
      }
      setStudents(nextStudents);
      setMarks(nextMarks);
      setLesson(entry);
    } catch (reason) {
      toast.error(readableDomainError(reason));
    }
  };

  const setMark = (studentId: string, values: Partial<AttendanceMark>) => {
    setMarks((current) => {
      const next = new Map(current);
      next.set(studentId, {
        ...(next.get(studentId) ?? { status: "present", minutes_late: 0, note: "" }),
        ...values,
      });
      return next;
    });
  };

  const save = async () => {
    if (!lesson || !profile.school_id) return;
    for (const mark of marks.values()) {
      const message = validateAttendanceMark(mark);
      if (message) return toast.error(message);
    }
    setSaving(true);
    try {
      await saveLessonAttendance(supabase, profile.school_id, lesson.id, profile.id, marks);
      toast.success("Aanwezigheid opgeslagen");
      await reload();
    } catch (reason) {
      toast.error(readableDomainError(reason));
    } finally {
      setSaving(false);
    }
  };

  const review = async () => {
    if (!reviewDraft) return;
    try {
      await reviewAbsenceRequest(
        supabase,
        reviewDraft.id,
        profile.id,
        reviewDraft.status,
        reviewDraft.note,
      );
      toast.success("Absentieverzoek verwerkt");
      setReviewDraft(null);
      await reload();
    } catch (reason) {
      toast.error(readableDomainError(reason));
    }
  };

  const visibleRecords = statusFilter
    ? records.filter((record) => record.status === statusFilter)
    : records;
  const shiftWeek = (amount: number) =>
    setWeekStart((current) => new Date(current.getTime() + amount * 7 * 86_400_000));

  if (lesson) {
    return (
      <section className="space-y-4">
        <button
          onClick={() => setLesson(null)}
          className="rounded-lg border px-3 py-2 text-sm font-semibold"
        >
          ← Terug naar lessen
        </button>
        <div className="rounded-2xl border bg-card p-4">
          <h2 className="font-semibold">
            {lesson.subject?.name || "Les"} · {lesson.group?.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {new Date(lesson.starts_at).toLocaleString("nl-NL", {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="space-y-3">
          {students.length === 0 && (
            <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
              Geen actieve leerlingen in deze lesgroep.
            </div>
          )}
          {students.map((student) => {
            const mark = marks.get(student.id)!;
            return (
              <article key={student.id} className="rounded-2xl border bg-card p-4">
                <div className="mb-3">
                  <div className="font-semibold">{student.full_name || student.email}</div>
                  <div className="text-xs text-muted-foreground">{student.email}</div>
                </div>
                <div className="grid gap-2 sm:grid-cols-[180px_120px_1fr]">
                  <select
                    aria-label={`Status ${student.full_name || student.email}`}
                    value={mark.status}
                    onChange={(e) =>
                      setMark(student.id, { status: e.target.value as AttendanceStatus })
                    }
                    className="rounded-lg border bg-background px-3 py-2 text-sm"
                  >
                    {statusOptions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {mark.status === "late" ? (
                    <input
                      aria-label={`Minuten te laat ${student.full_name || student.email}`}
                      type="number"
                      min={1}
                      value={mark.minutes_late || ""}
                      onChange={(e) =>
                        setMark(student.id, { minutes_late: Number(e.target.value) })
                      }
                      placeholder="Minuten"
                      className="rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                  ) : (
                    <div />
                  )}
                  <input
                    aria-label={`Toelichting ${student.full_name || student.email}`}
                    value={mark.note}
                    onChange={(e) => setMark(student.id, { note: e.target.value })}
                    placeholder="Toelichting (optioneel)"
                    className="rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </article>
            );
          })}
        </div>
        {students.length > 0 && (
          <button
            disabled={saving}
            onClick={() => void save()}
            className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-60"
          >
            {saving ? "Opslaan…" : "Aanwezigheid opslaan"}
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-4">
        <button
          aria-label="Vorige week"
          onClick={() => shiftWeek(-1)}
          className="rounded-lg border p-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => setWeekStart(mondayOf(new Date()))}
          className="rounded-lg border px-3 py-2 text-sm font-semibold"
        >
          Deze week
        </button>
        <button
          aria-label="Volgende week"
          onClick={() => shiftWeek(1)}
          className="rounded-lg border p-2"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="min-w-48 flex-1 text-sm font-semibold">
          {weekStart.toLocaleDateString("nl-NL", { day: "numeric", month: "long" })} –{" "}
          {new Date(weekEnd.getTime() - 86_400_000).toLocaleDateString("nl-NL", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
        <button
          onClick={() => void reload()}
          aria-label="Vernieuwen"
          className="rounded-lg border p-2"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {canRecord && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Lessen registreren</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {entries
              .filter((entry) => entry.status !== "cancelled")
              .map((entry) => {
                const count = records.filter(
                  (record) => record.timetable_entry_id === entry.id,
                ).length;
                return (
                  <button
                    key={entry.id}
                    onClick={() => void openLesson(entry)}
                    className="rounded-2xl border bg-card p-4 text-left hover:border-primary"
                  >
                    <div className="text-xs font-semibold text-primary">
                      {new Date(entry.starts_at).toLocaleString("nl-NL", {
                        weekday: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="mt-1 font-semibold">{entry.subject?.name || "Les"}</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.group?.name} · {entry.room?.code || "Geen lokaal"}
                    </div>
                    <div className="mt-3 text-xs">
                      {count ? `${count} leerlingen geregistreerd` : "Nog niet geregistreerd"}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="mr-auto text-lg font-semibold">Aanwezigheid</h2>
          <select
            aria-label="Filter status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="">Alle statussen</option>
            {statusOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {loading && (
          <div className="p-8 text-center text-sm text-muted-foreground">Aanwezigheid laden…</div>
        )}
        {error && (
          <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
        )}
        {!loading && visibleRecords.length === 0 && (
          <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
            Geen registraties in deze week.
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleRecords.map((record) => (
            <article key={record.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-start gap-3">
                {record.status === "present" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : record.status === "late" ? (
                  <Clock3 className="h-5 w-5 text-amber-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-rose-600" />
                )}
                <div>
                  <div className="font-semibold">
                    {record.student?.full_name || record.student?.email || "Leerling"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {record.lesson?.subject?.name} · {record.lesson?.group?.name}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-sm font-semibold">
                {statusLabels[record.status]}
                {record.status === "late" ? ` · ${record.minutes_late} min` : ""}
              </div>
              {record.note && <p className="mt-1 text-xs text-muted-foreground">{record.note}</p>}
            </article>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Absentieverzoeken</h2>
        {absences.length === 0 && (
          <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
            Geen absentieverzoeken.
          </div>
        )}
        <div className="space-y-3">
          {absences.map((absence) => (
            <article
              key={absence.id}
              className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center"
            >
              <UserCheck className="h-5 w-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="font-semibold">
                  {absence.student?.full_name || absence.student?.email || "Leerling"}
                </div>
                <div className="text-sm">{absence.reason}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(absence.starts_at).toLocaleString("nl-NL")} –{" "}
                  {new Date(absence.ends_at).toLocaleString("nl-NL")} · {absence.status}
                </div>
                {absence.review_note && (
                  <div className="mt-1 text-xs">Beoordeling: {absence.review_note}</div>
                )}
              </div>
              {canReviewAbsence &&
                absence.status === "submitted" &&
                (reviewDraft?.id === absence.id ? (
                  <div className="w-full space-y-2 sm:max-w-xs">
                    <label className="block text-xs font-semibold" htmlFor={`review-${absence.id}`}>
                      {reviewDraft.status === "approved"
                        ? "Toelichting goedkeuring"
                        : "Reden afwijzing"}
                    </label>
                    <textarea
                      id={`review-${absence.id}`}
                      value={reviewDraft.note}
                      onChange={(event) =>
                        setReviewDraft((current) =>
                          current ? { ...current, note: event.target.value } : current,
                        )
                      }
                      className="min-h-20 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => void review()}
                        className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                      >
                        Bevestigen
                      </button>
                      <button
                        onClick={() => setReviewDraft(null)}
                        className="rounded-lg border px-3 py-2 text-xs font-semibold"
                      >
                        Annuleren
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setReviewDraft({ id: absence.id, status: "approved", note: "" })
                      }
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                    >
                      Goedkeuren
                    </button>
                    <button
                      onClick={() =>
                        setReviewDraft({ id: absence.id, status: "rejected", note: "" })
                      }
                      className="rounded-lg border px-3 py-2 text-xs font-semibold"
                    >
                      Afwijzen
                    </button>
                  </div>
                ))}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
