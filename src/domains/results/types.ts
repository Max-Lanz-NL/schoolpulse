export type AssessmentStatus = "draft" | "scheduled" | "grading" | "published" | "cancelled";
export type GradeStatus = "draft" | "published" | "corrected";

export type ResultGroup = { id: string; name: string; subject_id: string | null };
export type ResultSubject = { id: string; name: string; code: string };

export type Assessment = {
  id: string;
  school_id: string;
  teaching_group_id: string;
  subject_id: string | null;
  title: string;
  assessment_type: string;
  occurs_at: string | null;
  maximum_score: number | null;
  weight: number;
  status: AssessmentStatus;
  created_by: string;
  group?: { name: string } | null;
  subject?: { name: string; code?: string } | null;
};

export type Grade = {
  id: string;
  school_id: string;
  assessment_id: string;
  student_profile_id: string;
  score: number | null;
  grade: number | null;
  is_excused: boolean;
  note: string | null;
  status: GradeStatus;
  graded_by: string;
  graded_at: string;
  student?: { full_name: string | null; email: string } | null;
  assessment?: Assessment | null;
};

export type GradeStudent = { id: string; full_name: string | null; email: string };
export type GradeDraft = { grade: string; note: string; is_excused: boolean };
