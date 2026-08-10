export type Assignment = {
  id: string;
  school_id: string;
  teaching_group_id: string;
  subject_id: string | null;
  title: string;
  instructions: string | null;
  due_at: string | null;
  status: "draft" | "published" | "closed" | "archived";
  created_by: string;
  group?: { name: string } | null;
  subject?: { name: string } | null;
};
export type Submission = {
  id: string;
  school_id: string;
  assignment_id: string;
  student_profile_id: string;
  body: string | null;
  storage_path: string | null;
  submitted_at: string | null;
  status: "draft" | "submitted" | "returned" | "accepted";
  feedback: string | null;
  reviewed_by: string | null;
  student?: { full_name: string | null; email: string } | null;
};
export type LearningGroup = { id: string; name: string; subject_id: string | null };
export type LearningSubject = { id: string; name: string };
