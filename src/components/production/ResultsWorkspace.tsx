import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { BookOpenCheck, CalendarDays, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useResults } from "@/domains/results/queries/use-results";
import {
  createAssessment,
  getAssessmentStudents,
  getResultOptions,
  publishAssessment,
  saveGrades,
} from "@/domains/results/services/results-service";
import type {
  Assessment,
  GradeDraft,
  GradeStudent,
  ResultGroup,
  ResultSubject,
} from "@/domains/results/types";
import { validateAssessment, validateGrade } from "@/domains/results/validation";
import { readableDomainError } from "@/domains/shared/domain-error";

type Props = {
  supabase: SupabaseClient;
  profile: { id: string; school_id: string | null; role: string };
  canCreate: boolean;
  canGrade: boolean;
  canPublish: boolean;
};

export function ResultsWorkspace({ supabase, profile, canCreate, canGrade, canPublish }: Props) {
  const { assessments, grades, loading, error, reload } = useResults(supabase);
  const [groups, setGroups] = useState<ResultGroup[]>([]);
  const [subjects, setSubjects] = useState<ResultSubject[]>([]);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Assessment | null>(null);
  const [students, setStudents] = useState<GradeStudent[]>([]);
  const [drafts, setDrafts] = useState<Map<string, GradeDraft>>(new Map());
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [groupId, setGroupId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [occursAt, setOccursAt] = useState("");
  const [weight, setWeight] = useState("1");
  const [maximumScore, setMaximumScore] = useState("10");

  useEffect(() => {
    if (!canCreate) return;
    void getResultOptions(supabase)
      .then((result) => {
        setGroups(result.groups);
        setSubjects(result.subjects);
      })
      .catch((reason) => toast.error(readableDomainError(reason)));
  }, [canCreate, supabase]);

  const ownGrades = useMemo(
    () => grades.filter((grade) => grade.student_profile_id === profile.id),
    [grades, profile.id],
  );

  const chooseGroup = (value: string) => {
    setGroupId(value);
    const group = groups.find((item) => item.id === value);
    if (group?.subject_id) setSubjectId(group.subject_id);
  };

  const submitAssessment = async () => {
    const message = validateAssessment({ title, groupId, subjectId, weight, maximumScore });
    if (message || !profile.school_id) return toast.error(message || "Schoolcontext ontbreekt.");
    setSaving(true);
    try {
      await createAssessment(supabase, {
        schoolId: profile.school_id,
        userId: profile.id,
        groupId,
        subjectId,
        title,
        occursAt: occursAt ? new Date(occursAt).toISOString() : null,
        weight: Number(weight),
        maximumScore: maximumScore ? Number(maximumScore) : null,
      });
      setCreating(false);
      setTitle("");
      setOccursAt("");
      toast.success("Toets aangemaakt");
      await reload();
    } catch (reason) {
      toast.error(readableDomainError(reason));
    } finally {
      setSaving(false);
    }
  };

  const openAssessment = async (assessment: Assessment) => {
    try {
      const nextStudents = await getAssessmentStudents(supabase, assessment.teaching_group_id);
      const nextDrafts = new Map<string, GradeDraft>();
      for (const student of nextStudents) {
        const existing = grades.find(
          (grade) =>
            grade.assessment_id === assessment.id && grade.student_profile_id === student.id,
        );
        nextDrafts.set(student.id, {
          grade:
            existing?.grade === null || existing?.grade === undefined ? "" : String(existing.grade),
          note: existing?.note ?? "",
          is_excused: existing?.is_excused ?? false,
        });
      }
      setStudents(nextStudents);
      setDrafts(nextDrafts);
      setSelected(assessment);
    } catch (reason) {
      toast.error(readableDomainError(reason));
    }
  };

  const setDraft = (studentId: string, values: Partial<GradeDraft>) =>
    setDrafts((current) => {
      const next = new Map(current);
      next.set(studentId, {
        ...(next.get(studentId) ?? { grade: "", note: "", is_excused: false }),
        ...values,
      });
      return next;
    });

  const save = async (publish: boolean) => {
    if (!selected || !profile.school_id) return;
    for (const draft of drafts.values()) {
      const message = validateGrade(draft);
      if (message) return toast.error(message);
    }
    setSaving(true);
    try {
      if (publish && selected.status !== "published")
        await publishAssessment(supabase, selected.id);
      await saveGrades(supabase, {
        schoolId: profile.school_id,
        assessmentId: selected.id,
        graderId: profile.id,
        status: publish ? "published" : "draft",
        drafts,
      });
      toast.success(publish ? "Toets en cijfers gepubliceerd" : "Cijfers opgeslagen");
      setSelected(null);
      await reload();
    } catch (reason) {
      toast.error(readableDomainError(reason));
    } finally {
      setSaving(false);
    }
  };

  if (selected) {
    return (
      <section className="space-y-4">
        <button
          onClick={() => setSelected(null)}
          className="rounded-lg border px-3 py-2 text-sm font-semibold"
        >
          ← Terug naar toetsen
        </button>
        <div className="rounded-2xl border bg-card p-4">
          <h2 className="font-semibold">{selected.title}</h2>
          <p className="text-sm text-muted-foreground">
            {selected.subject?.name} · {selected.group?.name} · weging {selected.weight}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {students.map((student) => {
            const draft = drafts.get(student.id) ?? { grade: "", note: "", is_excused: false };
            return (
              <article key={student.id} className="space-y-3 rounded-2xl border bg-card p-4">
                <div>
                  <div className="font-semibold">{student.full_name || student.email}</div>
                  <div className="text-xs text-muted-foreground">{student.email}</div>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                  <label className="text-xs font-semibold">
                    Cijfer
                    <input
                      aria-label={`Cijfer ${student.full_name || student.email}`}
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      disabled={draft.is_excused}
                      value={draft.grade}
                      onChange={(event) => setDraft(student.id, { grade: event.target.value })}
                      className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-base"
                    />
                  </label>
                  <label className="flex items-end gap-2 pb-2 text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={draft.is_excused}
                      onChange={(event) =>
                        setDraft(student.id, { is_excused: event.target.checked })
                      }
                    />
                    Vrijstelling
                  </label>
                </div>
                <label className="block text-xs font-semibold">
                  Notitie
                  <input
                    aria-label={`Notitie ${student.full_name || student.email}`}
                    value={draft.note}
                    onChange={(event) => setDraft(student.id, { note: event.target.value })}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </label>
              </article>
            );
          })}
        </div>
        {students.length === 0 && (
          <div className="rounded-2xl border p-8 text-center text-sm">
            Geen leerlingen in deze groep.
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            disabled={saving}
            onClick={() => void save(false)}
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            Concept opslaan
          </button>
          {canPublish && (
            <button
              disabled={saving}
              onClick={() => void save(true)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Publiceren
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Cijfers en toetsen</h2>
          <p className="text-sm text-muted-foreground">
            Typed resultaten uit assessments en grades.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void reload()}
            className="rounded-lg border p-2"
            aria-label="Vernieuwen"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          {canCreate && (
            <button
              onClick={() => setCreating((value) => !value)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Nieuwe toets
            </button>
          )}
        </div>
      </div>

      {creating && (
        <div className="grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-xs font-semibold">
            Naam
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold">
            Lesgroep
            <select
              aria-label="Lesgroep"
              value={groupId}
              onChange={(e) => chooseGroup(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">Kies groep</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold">
            Vak
            <select
              aria-label="Vak"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="">Kies vak</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold">
            Datum
            <input
              type="datetime-local"
              value={occursAt}
              onChange={(e) => setOccursAt(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold">
            Weging
            <input
              type="number"
              min="0.001"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold">
            Maximumscore
            <input
              type="number"
              min="0.01"
              step="0.1"
              value={maximumScore}
              onChange={(e) => setMaximumScore(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </label>
          <button
            disabled={saving}
            onClick={() => void submitAssessment()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground sm:col-span-2 lg:col-span-3"
          >
            Toets opslaan
          </button>
        </div>
      )}

      {loading && (
        <div className="p-8 text-center text-sm text-muted-foreground">Resultaten laden…</div>
      )}
      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}

      {profile.role === "student" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ownGrades.map((grade) => (
            <article key={grade.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{grade.assessment?.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {grade.assessment?.subject?.name} · {grade.assessment?.group?.name}
                  </div>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="mt-4 text-3xl font-bold">
                {grade.is_excused ? "Vrijstelling" : (grade.grade?.toLocaleString("nl-NL") ?? "–")}
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                {grade.assessment?.occurs_at
                  ? new Date(grade.assessment.occurs_at).toLocaleDateString("nl-NL")
                  : "Geen datum"}{" "}
                · weging {grade.assessment?.weight}
              </div>
              {grade.note && <p className="mt-2 text-sm">{grade.note}</p>}
            </article>
          ))}
          {!loading && ownGrades.length === 0 && (
            <div className="rounded-2xl border p-8 text-center text-sm text-muted-foreground sm:col-span-2">
              Nog geen gepubliceerde cijfers.
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {assessments.map((assessment) => (
            <article key={assessment.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-start gap-3">
                <BookOpenCheck className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold">{assessment.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {assessment.subject?.name} · {assessment.group?.name}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-sm">
                {assessment.status} · weging {assessment.weight}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {grades.filter((grade) => grade.assessment_id === assessment.id).length} cijfers
                ingevoerd
              </div>
              {canGrade && (
                <button
                  onClick={() => void openAssessment(assessment)}
                  className="mt-3 w-full rounded-lg border px-3 py-2 text-sm font-semibold"
                >
                  Cijfers invoeren
                </button>
              )}
            </article>
          ))}
          {!loading && assessments.length === 0 && (
            <div className="rounded-2xl border p-8 text-center text-sm text-muted-foreground sm:col-span-2">
              Nog geen toetsen.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
