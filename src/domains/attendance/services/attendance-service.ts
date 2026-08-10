import type { SupabaseClient } from "@supabase/supabase-js";
import { toDomainError } from "@/domains/shared/domain-error";
import type { TimetableEntry } from "@/domains/timetable/types";
import type {
  AbsenceRequest,
  AttendanceMark,
  AttendanceRecord,
  LessonStudent,
} from "@/domains/attendance/types";

export async function getAttendanceRecords(supabase: SupabaseClient, from: Date, until: Date) {
  const { data, error } = await supabase
    .from("attendance_records")
    .select(
      "id,school_id,timetable_entry_id,student_profile_id,status,minutes_late,note,recorded_by,recorded_at,student:profiles!attendance_records_student_profile_id_fkey(id,full_name,email),lesson:timetable_entries!inner(id,starts_at,ends_at,subject:subjects(name),group:teaching_groups(name))",
    )
    .gte("lesson.starts_at", from.toISOString())
    .lt("lesson.starts_at", until.toISOString())
    .order("recorded_at", { ascending: false });
  if (error) throw toDomainError(error, "Aanwezigheidsregistraties konden niet worden geladen.");
  return (data ?? []) as unknown as AttendanceRecord[];
}

export async function getAbsenceRequests(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("absence_requests")
    .select(
      "id,school_id,student_profile_id,starts_at,ends_at,reason,status,reviewed_by,reviewed_at,review_note,student:profiles!absence_requests_student_profile_id_fkey(id,full_name,email)",
    )
    .order("starts_at", { ascending: false });
  if (error) throw toDomainError(error, "Absentieverzoeken konden niet worden geladen.");
  return (data ?? []) as unknown as AbsenceRequest[];
}

export async function getLessonStudents(supabase: SupabaseClient, lesson: TimetableEntry) {
  const groupRequest = supabase
    .from("student_group_memberships")
    .select(
      "student:profiles!student_group_memberships_student_profile_id_fkey(id,full_name,email)",
    )
    .eq("teaching_group_id", lesson.teaching_group_id)
    .eq("status", "active");
  const classRequest = lesson.group?.base_class_id
    ? supabase
        .from("student_enrolments")
        .select("student:profiles!student_enrolments_student_profile_id_fkey(id,full_name,email)")
        .eq("class_id", lesson.group.base_class_id)
        .eq("school_year_id", lesson.school_year_id)
        .eq("status", "active")
    : Promise.resolve({ data: [], error: null });
  const [groups, classes] = await Promise.all([groupRequest, classRequest]);
  if (groups.error || classes.error)
    throw toDomainError(
      groups.error ?? classes.error,
      "De leerlingenlijst kon niet worden geladen.",
    );
  const profiles = [...(groups.data ?? []), ...(classes.data ?? [])]
    .flatMap((row) => (Array.isArray(row.student) ? row.student : [row.student]))
    .filter((student): student is LessonStudent => Boolean(student));
  return [...new Map(profiles.map((student) => [student.id, student])).values()].sort((a, b) =>
    (a.full_name || a.email).localeCompare(b.full_name || b.email, "nl"),
  );
}

export async function saveLessonAttendance(
  supabase: SupabaseClient,
  schoolId: string,
  lessonId: string,
  recordedBy: string,
  marks: Map<string, AttendanceMark>,
) {
  const rows = [...marks].map(([studentId, mark]) => ({
    school_id: schoolId,
    timetable_entry_id: lessonId,
    student_profile_id: studentId,
    status: mark.status,
    minutes_late: mark.status === "late" ? mark.minutes_late : 0,
    note: mark.note.trim() || null,
    recorded_by: recordedBy,
  }));
  const { error } = await supabase
    .from("attendance_records")
    .upsert(rows, { onConflict: "timetable_entry_id,student_profile_id" });
  if (error) throw toDomainError(error, error.message);
}

export async function reviewAbsenceRequest(
  supabase: SupabaseClient,
  id: string,
  reviewerId: string,
  status: "approved" | "rejected",
  note: string,
) {
  const { error } = await supabase
    .from("absence_requests")
    .update({
      status,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      review_note: note.trim() || null,
    })
    .eq("id", id);
  if (error) throw toDomainError(error, error.message);
}
