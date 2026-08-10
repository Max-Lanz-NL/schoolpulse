export type AttendanceStatus = "present" | "late" | "absent" | "excused" | "remote";
export type AbsenceStatus = "draft" | "submitted" | "approved" | "rejected" | "cancelled";

export type AttendanceRecord = {
  id: string;
  school_id: string;
  timetable_entry_id: string;
  student_profile_id: string;
  status: AttendanceStatus;
  minutes_late: number;
  note: string | null;
  recorded_by: string;
  recorded_at: string;
  student: { id: string; full_name: string | null; email: string } | null;
  lesson: {
    id: string;
    starts_at: string;
    ends_at: string;
    subject: { name: string } | null;
    group: { name: string } | null;
  } | null;
};

export type AbsenceRequest = {
  id: string;
  school_id: string;
  student_profile_id: string;
  starts_at: string;
  ends_at: string;
  reason: string;
  status: AbsenceStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  student: { id: string; full_name: string | null; email: string } | null;
};

export type LessonStudent = { id: string; full_name: string | null; email: string };
export type AttendanceMark = { status: AttendanceStatus; minutes_late: number; note: string };
