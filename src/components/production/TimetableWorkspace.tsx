import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  UserRoundCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getPeopleDirectory } from "@/domains/people/services/people-service";
import type { PeopleDirectory } from "@/domains/people/types";
import { getSchoolStructure } from "@/domains/school/services/school-service";
import type { SchoolStructure } from "@/domains/school/types";
import { readableDomainError } from "@/domains/shared/domain-error";
import { useTimetableWeek } from "@/domains/timetable/queries/use-timetable-week";
import {
  assignSubstitute,
  cancelTimetableEntry,
  deleteTimetableEntry,
  saveTimetableEntry,
} from "@/domains/timetable/services/timetable-service";
import type { TimetableDraft, TimetableEntry } from "@/domains/timetable/types";
import { mondayOf, validateTimetableDraft } from "@/domains/timetable/validation";

type Props = {
  supabase: SupabaseClient;
  profile: { id: string; school_id: string | null; role: string };
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canSubstitute: boolean;
};
const days = ["ma", "di", "wo", "do", "vr"];
const emptyDraft: TimetableDraft = {
  school_year_id: "",
  teaching_group_id: "",
  subject_id: "",
  teacher_profile_id: "",
  room_id: "",
  starts_at: "",
  ends_at: "",
  status: "scheduled",
  note: "",
};
const localInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function TimetableWorkspace({
  supabase,
  profile,
  canCreate,
  canUpdate,
  canDelete,
  canSubstitute,
}: Props) {
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const { entries, loading, error, reload } = useTimetableWeek(supabase, weekStart);
  const [structure, setStructure] = useState<SchoolStructure | null>(null);
  const [people, setPeople] = useState<PeopleDirectory | null>(null);
  const [editing, setEditing] = useState<TimetableEntry | null>(null);
  const [draft, setDraft] = useState<TimetableDraft>(emptyDraft);
  const [showForm, setShowForm] = useState(false);
  const [filterTeacher, setFilterTeacher] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterRoom, setFilterRoom] = useState("");

  useEffect(() => {
    if (!profile.school_id || !(canCreate || canUpdate || canSubstitute)) return;
    void Promise.all([
      getSchoolStructure(supabase, profile.school_id),
      getPeopleDirectory(supabase, profile.school_id),
    ])
      .then(([s, p]) => {
        setStructure(s);
        setPeople(p);
      })
      .catch((reason) => toast.error(readableDomainError(reason)));
  }, [canCreate, canSubstitute, canUpdate, profile.school_id, supabase]);

  const filtered = useMemo(
    () =>
      entries.filter(
        (e) =>
          (!filterTeacher || e.teacher_profile_id === filterTeacher) &&
          (!filterGroup || e.teaching_group_id === filterGroup) &&
          (!filterSubject || e.subject_id === filterSubject) &&
          (!filterRoom || e.room_id === filterRoom),
      ),
    [entries, filterGroup, filterRoom, filterSubject, filterTeacher],
  );
  const teachers =
    people?.staff.filter(
      (s) => s.profile && (s.profile.role === "teacher" || s.subjectAssignments.length > 0),
    ) ?? [];
  const shiftWeek = (amount: number) =>
    setWeekStart((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + amount * 7);
      return next;
    });
  const openCreate = () => {
    setEditing(null);
    setDraft({
      ...emptyDraft,
      school_year_id: structure?.currentYear?.id ?? "",
      starts_at: localInput(new Date(weekStart.getTime() + 8.5 * 3600000).toISOString()),
      ends_at: localInput(new Date(weekStart.getTime() + 9.5 * 3600000).toISOString()),
    });
    setShowForm(true);
  };
  const openEdit = (e: TimetableEntry) => {
    setEditing(e);
    setDraft({
      school_year_id: e.school_year_id,
      teaching_group_id: e.teaching_group_id,
      subject_id: e.subject_id ?? "",
      teacher_profile_id: e.teacher_profile_id ?? "",
      room_id: e.room_id ?? "",
      starts_at: localInput(e.starts_at),
      ends_at: localInput(e.ends_at),
      status: e.status,
      note: e.note ?? "",
    });
    setShowForm(true);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile.school_id) return;
    const validation = validateTimetableDraft(draft);
    if (validation) {
      toast.error(validation);
      return;
    }
    try {
      await saveTimetableEntry(
        supabase,
        profile.school_id,
        {
          ...draft,
          starts_at: new Date(draft.starts_at).toISOString(),
          ends_at: new Date(draft.ends_at).toISOString(),
        },
        editing?.id,
      );
      toast.success(editing ? "Roosteritem bijgewerkt" : "Roosteritem toegevoegd");
      setShowForm(false);
      await reload();
    } catch (reason) {
      toast.error(readableDomainError(reason));
    }
  };
  const cancel = async (e: TimetableEntry) => {
    const reason = window.prompt("Reden van annulering", e.note ?? "");
    if (reason === null) return;
    try {
      await cancelTimetableEntry(supabase, e.id, reason);
      toast.success("Les geannuleerd");
      await reload();
    } catch (err) {
      toast.error(readableDomainError(err));
    }
  };
  const remove = async (e: TimetableEntry) => {
    if (!window.confirm("Dit roosteritem definitief verwijderen? Annuleren bewaart de historie."))
      return;
    try {
      await deleteTimetableEntry(supabase, e.id);
      toast.success("Roosteritem verwijderd");
      await reload();
    } catch (err) {
      toast.error(readableDomainError(err));
    }
  };
  const substitute = async (e: TimetableEntry) => {
    if (!profile.school_id) return;
    const replacement = window.prompt(
      `Vervangende docent-id:\n${teachers.map((t) => `${t.profile?.full_name || t.profile?.email}: ${t.profile_id}`).join("\n")}`,
    );
    if (!replacement) return;
    const note = window.prompt("Toelichting (optioneel)", "") ?? "";
    try {
      await assignSubstitute(supabase, profile.school_id, e, replacement, note);
      toast.success("Vervanger toegewezen");
      await reload();
    } catch (err) {
      toast.error(readableDomainError(err));
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-4">
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
        <div className="min-w-44 flex-1 text-sm font-semibold">
          {weekStart.toLocaleDateString("nl-NL", { day: "numeric", month: "long" })} –{" "}
          {new Date(weekStart.getTime() + 6 * 86400000).toLocaleDateString("nl-NL", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
        <button
          onClick={() => void reload()}
          className="rounded-lg border p-2"
          aria-label="Vernieuwen"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        {canCreate && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Les
          </button>
        )}
      </div>
      {(canCreate || canUpdate) && (
        <div className="grid gap-2 rounded-2xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Filter
            value={filterTeacher}
            set={setFilterTeacher}
            label="Alle docenten"
            options={teachers.map((t) => [
              t.profile_id,
              t.profile?.full_name || t.profile?.email || "Docent",
            ])}
          />
          <Filter
            value={filterGroup}
            set={setFilterGroup}
            label="Alle groepen"
            options={(structure?.groups ?? []).map((x) => [x.id, x.name])}
          />
          <Filter
            value={filterSubject}
            set={setFilterSubject}
            label="Alle vakken"
            options={(structure?.subjects ?? []).map((x) => [x.id, x.name])}
          />
          <Filter
            value={filterRoom}
            set={setFilterRoom}
            label="Alle lokalen"
            options={(structure?.rooms ?? []).map((x) => [x.id, x.code])}
          />
        </div>
      )}
      {showForm && (
        <form
          onSubmit={submit}
          className="grid gap-3 rounded-2xl border border-primary/30 bg-card p-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <Select
            value={draft.school_year_id}
            set={(v) => setDraft({ ...draft, school_year_id: v })}
            label="Schooljaar"
            options={(structure?.years ?? []).map((x) => [x.id, x.name])}
          />
          <Select
            value={draft.teaching_group_id}
            set={(v) => setDraft({ ...draft, teaching_group_id: v })}
            label="Lesgroep"
            options={(structure?.groups ?? []).map((x) => [x.id, x.name])}
          />
          <Select
            value={draft.subject_id}
            set={(v) => setDraft({ ...draft, subject_id: v })}
            label="Vak"
            options={(structure?.subjects ?? []).map((x) => [x.id, x.name])}
          />
          <Select
            value={draft.teacher_profile_id}
            set={(v) => setDraft({ ...draft, teacher_profile_id: v })}
            label="Docent"
            options={teachers.map((t) => [
              t.profile_id,
              t.profile?.full_name || t.profile?.email || "Docent",
            ])}
          />
          <Select
            value={draft.room_id}
            set={(v) => setDraft({ ...draft, room_id: v })}
            label="Lokaal (optioneel)"
            options={(structure?.rooms ?? []).map((x) => [x.id, x.code])}
            optional
          />
          <Select
            value={draft.status}
            set={(v) => setDraft({ ...draft, status: v as TimetableDraft["status"] })}
            label="Status"
            options={[
              ["draft", "Concept"],
              ["scheduled", "Gepland"],
              ["changed", "Gewijzigd"],
              ["cancelled", "Geannuleerd"],
            ].map((x) => x as [string, string])}
          />
          <label className="text-xs font-semibold">
            Start
            <input
              type="datetime-local"
              value={draft.starts_at}
              onChange={(e) => setDraft({ ...draft, starts_at: e.target.value })}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold">
            Einde
            <input
              type="datetime-local"
              value={draft.ends_at}
              onChange={(e) => setDraft({ ...draft, ends_at: e.target.value })}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold">
            Toelichting
            <input
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </label>
          <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Opslaan
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Sluiten
            </button>
          </div>
        </form>
      )}
      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      )}
      {loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">Rooster laden…</div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-5">
          {days.map((day, index) => {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + index);
            const list = filtered.filter(
              (e) => new Date(e.starts_at).toDateString() === date.toDateString(),
            );
            return (
              <div key={day} className="min-w-0 rounded-2xl border bg-card">
                <div className="border-b p-3 text-sm font-bold capitalize">
                  {day} {date.getDate()}
                </div>
                <div className="space-y-2 p-2">
                  {list.length === 0 && (
                    <p className="p-3 text-xs text-muted-foreground">Geen lessen</p>
                  )}
                  {list.map((e) => (
                    <Lesson
                      key={e.id}
                      entry={e}
                      canUpdate={canUpdate}
                      canDelete={canDelete}
                      canSubstitute={canSubstitute}
                      edit={() => openEdit(e)}
                      cancel={() => void cancel(e)}
                      remove={() => void remove(e)}
                      substitute={() => void substitute(e)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Lesson({
  entry,
  canUpdate,
  canDelete,
  canSubstitute,
  edit,
  cancel,
  remove,
  substitute,
}: {
  entry: TimetableEntry;
  canUpdate: boolean;
  canDelete: boolean;
  canSubstitute: boolean;
  edit: () => void;
  cancel: () => void;
  remove: () => void;
  substitute: () => void;
}) {
  const replacement = entry.substitutions?.find((s) => ["assigned", "accepted"].includes(s.status));
  return (
    <article
      className={`rounded-xl border-l-4 p-3 shadow-sm ${entry.status === "cancelled" ? "border-l-destructive bg-muted opacity-70" : "border-l-primary bg-background"}`}
    >
      <div className="text-xs font-bold">
        {new Date(entry.starts_at).toLocaleTimeString("nl-NL", {
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        –{" "}
        {new Date(entry.ends_at).toLocaleTimeString("nl-NL", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
      <div className="mt-1 text-sm font-semibold">{entry.subject?.name || "Les"}</div>
      <div className="text-xs text-muted-foreground">
        {entry.group?.name} · {entry.room?.code || "Geen lokaal"}
      </div>
      <div className="mt-1 text-xs">
        {replacement ? (
          <>
            <span className="line-through">{entry.teacher?.full_name || entry.teacher?.email}</span>
            <br />
            <span className="font-semibold text-primary">
              Vervanging: {replacement.replacement?.full_name || replacement.replacement?.email}
            </span>
          </>
        ) : (
          entry.teacher?.full_name || entry.teacher?.email || "Geen docent"
        )}
      </div>
      {entry.status === "cancelled" && (
        <div className="mt-2 text-xs font-semibold text-destructive">
          Geannuleerd · {entry.note}
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-1">
        {canUpdate && (
          <button onClick={edit} aria-label="Bewerken" className="rounded border p-1">
            <Pencil className="h-3 w-3" />
          </button>
        )}
        {canUpdate && entry.status !== "cancelled" && (
          <button onClick={cancel} aria-label="Annuleren" className="rounded border p-1">
            <XCircle className="h-3 w-3" />
          </button>
        )}
        {canSubstitute && entry.status !== "cancelled" && !replacement && (
          <button onClick={substitute} aria-label="Vervanger" className="rounded border p-1">
            <UserRoundCheck className="h-3 w-3" />
          </button>
        )}
        {canDelete && (
          <button
            onClick={remove}
            aria-label="Verwijderen"
            className="rounded border p-1 text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    </article>
  );
}
function Select({
  value,
  set,
  label,
  options,
  optional = false,
}: {
  value: string;
  set: (v: string) => void;
  label: string;
  options: [string, string][];
  optional?: boolean;
}) {
  return (
    <label className="text-xs font-semibold">
      {label}
      <select
        value={value}
        onChange={(e) => set(e.target.value)}
        className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
      >
        <option value="">{optional ? "Geen" : `Kies ${label.toLowerCase()}`}</option>
        {options.map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
function Filter({
  value,
  set,
  label,
  options,
}: {
  value: string;
  set: (v: string) => void;
  label: string;
  options: [string, string][];
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => set(e.target.value)}
      className="rounded-lg border bg-background px-3 py-2 text-sm"
    >
      <option value="">{label}</option>
      {options.map(([id, name]) => (
        <option key={id} value={id}>
          {name}
        </option>
      ))}
    </select>
  );
}
