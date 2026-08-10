export type TimetableStatus = "draft" | "scheduled" | "changed" | "cancelled" | "completed";
export type SubstitutionStatus = "open" | "assigned" | "accepted" | "declined" | "cancelled";

export type TimetableEntry = {
  id: string;
  school_id: string;
  school_year_id: string;
  teaching_group_id: string;
  subject_id: string | null;
  teacher_profile_id: string | null;
  room_id: string | null;
  starts_at: string;
  ends_at: string;
  status: TimetableStatus;
  note: string | null;
  group: { id: string; name: string; code: string | null; base_class_id: string | null } | null;
  subject: { id: string; name: string; code: string; color: string } | null;
  teacher: { id: string; full_name: string | null; email: string } | null;
  room: { id: string; code: string; name: string | null } | null;
  substitutions: Substitution[];
};

export type Substitution = {
  id: string;
  timetable_entry_id: string;
  original_teacher_id: string | null;
  replacement_teacher_id: string | null;
  status: SubstitutionStatus;
  note: string | null;
  replacement: { id: string; full_name: string | null; email: string } | null;
};

export type TimetableDraft = {
  school_year_id: string;
  teaching_group_id: string;
  subject_id: string;
  teacher_profile_id: string;
  room_id: string;
  starts_at: string;
  ends_at: string;
  status: TimetableStatus;
  note: string;
};
