import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { BookOpen, CalendarClock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useLearning } from "@/domains/learning/queries/use-learning";
import {
  createAssignment,
  getLearningOptions,
  reviewSubmission,
  submitWork,
} from "@/domains/learning/services/learning-service";
import type { Assignment, LearningGroup, LearningSubject } from "@/domains/learning/types";
import { readableDomainError } from "@/domains/shared/domain-error";
type Props = {
  supabase: SupabaseClient;
  profile: { id: string; school_id: string | null; role: string };
  canCreate: boolean;
  canReview: boolean;
  canPublish: boolean;
};
export function LearningWorkspace({ supabase, profile, canCreate, canReview, canPublish }: Props) {
  const { assignments, submissions, loading, error, reload } = useLearning(supabase);
  const [groups, setGroups] = useState<LearningGroup[]>([]);
  const [subjects, setSubjects] = useState<LearningSubject[]>([]);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [groupId, setGroupId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [body, setBody] = useState("");
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!canCreate) return;
    void getLearningOptions(supabase)
      .then((r) => {
        setGroups(r.groups);
        setSubjects(r.subjects);
      })
      .catch((e) => toast.error(readableDomainError(e)));
  }, [canCreate, supabase]);
  const chooseGroup = (id: string) => {
    setGroupId(id);
    const group = groups.find((g) => g.id === id);
    if (group?.subject_id) setSubjectId(group.subject_id);
  };
  const create = async (publish: boolean) => {
    if (!profile.school_id) return;
    if (!title.trim() || !groupId || !subjectId) return toast.error("Vul titel, groep en vak in.");
    setSaving(true);
    try {
      await createAssignment(supabase, {
        schoolId: profile.school_id,
        userId: profile.id,
        groupId,
        subjectId,
        title,
        instructions,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        publish,
      });
      toast.success(publish ? "Opdracht gepubliceerd" : "Conceptopdracht opgeslagen");
      setCreating(false);
      setTitle("");
      setInstructions("");
      await reload();
    } catch (e) {
      toast.error(readableDomainError(e));
    } finally {
      setSaving(false);
    }
  };
  const submit = async () => {
    if (!selected || !profile.school_id) return;
    if (!body.trim()) return toast.error("Vul je uitwerking in.");
    setSaving(true);
    try {
      await submitWork(supabase, {
        schoolId: profile.school_id,
        assignmentId: selected.id,
        studentId: profile.id,
        body,
      });
      toast.success("Werk ingeleverd");
      setSelected(null);
      setBody("");
      await reload();
    } catch (e) {
      toast.error(readableDomainError(e));
    } finally {
      setSaving(false);
    }
  };
  const review = async (id: string, status: "returned" | "accepted") => {
    try {
      await reviewSubmission(supabase, {
        id,
        reviewerId: profile.id,
        status,
        feedback: feedback[id] ?? "",
      });
      toast.success("Inlevering verwerkt");
      await reload();
    } catch (e) {
      toast.error(readableDomainError(e));
    }
  };
  if (selected) {
    const own = submissions.find(
      (s) => s.assignment_id === selected.id && s.student_profile_id === profile.id,
    );
    return (
      <section className="space-y-4">
        <button
          onClick={() => setSelected(null)}
          className="rounded-lg border px-3 py-2 text-sm font-semibold"
        >
          ← Terug naar opdrachten
        </button>
        <article className="space-y-3 rounded-2xl border bg-card p-5">
          <h2 className="text-xl font-semibold">{selected.title}</h2>
          <p className="text-sm text-muted-foreground">
            {selected.subject?.name} · {selected.group?.name}
          </p>
          <p className="whitespace-pre-wrap">
            {selected.instructions || "Geen aanvullende uitleg."}
          </p>
          <div className="text-sm font-semibold">
            Deadline:{" "}
            {selected.due_at ? new Date(selected.due_at).toLocaleString("nl-NL") : "Geen deadline"}
          </div>
        </article>
        {profile.role === "student" && (
          <article className="space-y-3 rounded-2xl border bg-card p-4">
            <h3 className="font-semibold">Mijn inlevering</h3>
            <div className="text-xs text-muted-foreground">
              Status: {own?.status ?? "nog niet ingeleverd"}
            </div>
            <textarea
              aria-label="Uitwerking"
              value={body || own?.body || ""}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-36 w-full rounded-lg border bg-background p-3 text-sm"
              placeholder="Schrijf hier je uitwerking"
            />
            <button
              disabled={saving}
              onClick={() => void submit()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Werk inleveren
            </button>
            <p className="text-xs text-muted-foreground">
              Bestanden worden pas met anderen gedeeld na malwarecontrole. Zolang geen scanner
              actief is, blijft een upload in scancontrole en wordt die niet breed verspreid.
            </p>
            {own?.feedback && (
              <p className="rounded-lg bg-muted p-3 text-sm">Feedback: {own.feedback}</p>
            )}
          </article>
        )}
      </section>
    );
  }
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Opdrachten</h2>
          <p className="text-sm text-muted-foreground">Huiswerk, deadlines en inleveringen.</p>
        </div>
        <div className="flex gap-2">
          <button
            aria-label="Vernieuwen"
            onClick={() => void reload()}
            className="rounded-lg border p-2"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          {canCreate && (
            <button
              onClick={() => setCreating((v) => !v)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Nieuwe opdracht
            </button>
          )}
        </div>
      </div>
      {creating && (
        <div className="grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2">
          <label className="text-xs font-semibold">
            Titel
            <input
              aria-label="Titel"
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
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
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
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold">
            Deadline
            <input
              aria-label="Deadline"
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold sm:col-span-2">
            Omschrijving
            <textarea
              aria-label="Omschrijving"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="mt-1 min-h-24 w-full rounded-lg border bg-background p-3 text-sm"
            />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button
              disabled={saving}
              onClick={() => void create(false)}
              className="rounded-lg border px-4 py-2 text-sm font-semibold"
            >
              Concept opslaan
            </button>
            {canPublish && (
              <button
                disabled={saving}
                onClick={() => void create(true)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Publiceren
              </button>
            )}
          </div>
        </div>
      )}
      {loading && (
        <div className="p-8 text-center text-sm text-muted-foreground">Opdrachten laden…</div>
      )}
      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {assignments.map((a) => (
          <article key={a.id} className="rounded-2xl border bg-card p-4">
            <div className="flex gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <div className="font-semibold">{a.title}</div>
                <div className="text-xs text-muted-foreground">
                  {a.subject?.name} · {a.group?.name}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <CalendarClock className="h-4 w-4" />
              {a.due_at ? new Date(a.due_at).toLocaleString("nl-NL") : "Geen deadline"}
            </div>
            <div className="mt-2 text-xs">
              {a.status} · {submissions.filter((s) => s.assignment_id === a.id).length} inleveringen
            </div>
            <button
              onClick={() => {
                setSelected(a);
                const own = submissions.find(
                  (s) => s.assignment_id === a.id && s.student_profile_id === profile.id,
                );
                setBody(own?.body ?? "");
              }}
              className="mt-3 w-full rounded-lg border px-3 py-2 text-sm font-semibold"
            >
              Open opdracht
            </button>
          </article>
        ))}
      </div>
      {canReview && submissions.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Inleveringen</h2>
          <div className="space-y-3">
            {submissions.map((s) => (
              <article key={s.id} className="rounded-2xl border bg-card p-4">
                <div className="font-semibold">{s.student?.full_name || s.student?.email}</div>
                <div className="mt-1 whitespace-pre-wrap text-sm">
                  {s.body || "Alleen een bestand ingeleverd"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Status: {s.status}
                  {s.storage_path ? " · bestand wacht op veilige vrijgave" : ""}
                </div>
                {s.status === "submitted" && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      aria-label={`Feedback ${s.student?.full_name || s.id}`}
                      value={feedback[s.id] ?? ""}
                      onChange={(e) => setFeedback((v) => ({ ...v, [s.id]: e.target.value }))}
                      className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
                      placeholder="Feedback"
                    />
                    <button
                      onClick={() => void review(s.id, "accepted")}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                    >
                      Accepteren
                    </button>
                    <button
                      onClick={() => void review(s.id, "returned")}
                      className="rounded-lg border px-3 py-2 text-xs font-semibold"
                    >
                      Terugsturen
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
