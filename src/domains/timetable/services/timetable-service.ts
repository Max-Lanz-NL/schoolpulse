import type { SupabaseClient } from "@supabase/supabase-js";
import { DomainError, toDomainError } from "@/domains/shared/domain-error";
import type { TimetableDraft, TimetableEntry } from "@/domains/timetable/types";

const timetableSelect = `id,school_id,school_year_id,teaching_group_id,subject_id,teacher_profile_id,room_id,starts_at,ends_at,status,note,
  group:teaching_groups(id,name,code,base_class_id),subject:subjects(id,name,code,color),
  teacher:profiles!timetable_entries_teacher_profile_id_fkey(id,full_name,email),room:rooms(id,code,name),
  substitutions(id,timetable_entry_id,original_teacher_id,replacement_teacher_id,status,note,replacement:profiles!substitutions_replacement_teacher_id_fkey(id,full_name,email))`;

export async function getTimetableWeek(supabase: SupabaseClient, weekStart: Date) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const { data, error } = await supabase
    .from("timetable_entries")
    .select(timetableSelect)
    .gte("starts_at", weekStart.toISOString())
    .lt("starts_at", weekEnd.toISOString())
    .order("starts_at");
  if (error) throw toDomainError(error, "Het rooster kon niet worden geladen.");
  return (data ?? []) as unknown as TimetableEntry[];
}

export async function saveTimetableEntry(
  supabase: SupabaseClient,
  schoolId: string,
  draft: TimetableDraft,
  id?: string,
) {
  const values = {
    ...draft,
    school_id: schoolId,
    subject_id: draft.subject_id || null,
    teacher_profile_id: draft.teacher_profile_id || null,
    room_id: draft.room_id || null,
    note: draft.note.trim() || null,
  };
  const result = id
    ? await supabase.from("timetable_entries").update(values).eq("id", id)
    : await supabase.from("timetable_entries").insert(values);
  if (result.error) throw toDomainError(result.error, result.error.message);
}

export async function cancelTimetableEntry(supabase: SupabaseClient, id: string, note: string) {
  const { error } = await supabase
    .from("timetable_entries")
    .update({ status: "cancelled", note: note.trim() || "Les geannuleerd" })
    .eq("id", id);
  if (error) throw toDomainError(error, error.message);
}

export async function deleteTimetableEntry(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("timetable_entries").delete().eq("id", id);
  if (error) throw toDomainError(error);
}

export async function assignSubstitute(
  supabase: SupabaseClient,
  schoolId: string,
  entry: TimetableEntry,
  replacementTeacherId: string,
  note: string,
) {
  if (!entry.teacher_profile_id)
    throw new DomainError("VALIDATION", "Dit roosteritem heeft geen oorspronkelijke docent.");
  const { error } = await supabase.from("substitutions").insert({
    school_id: schoolId,
    timetable_entry_id: entry.id,
    original_teacher_id: entry.teacher_profile_id,
    replacement_teacher_id: replacementTeacherId,
    status: "assigned",
    note: note.trim() || null,
  });
  if (error) throw toDomainError(error, error.message);
}
