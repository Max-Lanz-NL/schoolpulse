import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Assessment,
  Grade,
  GradeDraft,
  GradeStudent,
  ResultGroup,
  ResultSubject,
} from "../types";

export async function getResults(supabase: SupabaseClient) {
  const [assessmentResult, gradeResult] = await Promise.all([
    supabase
      .from("assessments")
      .select(
        "id,school_id,teaching_group_id,subject_id,title,assessment_type,occurs_at,maximum_score,weight,status,created_by,group:teaching_groups!assessments_teaching_group_id_fkey(name),subject:subjects!assessments_subject_id_fkey(name,code)",
      )
      .order("occurs_at", { ascending: false, nullsFirst: false }),
    supabase
      .from("grades")
      .select(
        "id,school_id,assessment_id,student_profile_id,score,grade,is_excused,note,status,graded_by,graded_at,student:profiles!grades_student_profile_id_fkey(full_name,email),assessment:assessments!grades_assessment_id_fkey(id,school_id,teaching_group_id,subject_id,title,assessment_type,occurs_at,maximum_score,weight,status,created_by,group:teaching_groups!assessments_teaching_group_id_fkey(name),subject:subjects!assessments_subject_id_fkey(name,code))",
      )
      .order("graded_at", { ascending: false }),
  ]);
  if (assessmentResult.error) throw assessmentResult.error;
  if (gradeResult.error) throw gradeResult.error;
  return {
    assessments: (assessmentResult.data ?? []) as unknown as Assessment[],
    grades: (gradeResult.data ?? []) as unknown as Grade[],
  };
}

export async function getResultOptions(supabase: SupabaseClient) {
  const [groupResult, subjectResult] = await Promise.all([
    supabase
      .from("teaching_groups")
      .select("id,name,subject_id")
      .eq("is_active", true)
      .order("name"),
    supabase.from("subjects").select("id,name,code").eq("is_active", true).order("name"),
  ]);
  if (groupResult.error) throw groupResult.error;
  if (subjectResult.error) throw subjectResult.error;
  return {
    groups: (groupResult.data ?? []) as ResultGroup[],
    subjects: (subjectResult.data ?? []) as ResultSubject[],
  };
}

export async function createAssessment(
  supabase: SupabaseClient,
  values: {
    schoolId: string;
    userId: string;
    groupId: string;
    subjectId: string;
    title: string;
    occursAt: string | null;
    weight: number;
    maximumScore: number | null;
  },
) {
  const { error } = await supabase.from("assessments").insert({
    school_id: values.schoolId,
    teaching_group_id: values.groupId,
    subject_id: values.subjectId,
    title: values.title.trim(),
    assessment_type: "test",
    occurs_at: values.occursAt,
    weight: values.weight,
    maximum_score: values.maximumScore,
    status: "draft",
    created_by: values.userId,
  });
  if (error) throw error;
}

export async function getAssessmentStudents(supabase: SupabaseClient, groupId: string) {
  const { data, error } = await supabase
    .from("student_group_memberships")
    .select(
      "student:profiles!student_group_memberships_student_profile_id_fkey(id,full_name,email)",
    )
    .eq("teaching_group_id", groupId)
    .in("status", ["planned", "active"]);
  if (error) throw error;
  return (data ?? [])
    .map((row) => (Array.isArray(row.student) ? row.student[0] : row.student))
    .filter(Boolean) as GradeStudent[];
}

export async function saveGrades(
  supabase: SupabaseClient,
  values: {
    schoolId: string;
    assessmentId: string;
    graderId: string;
    status: "draft" | "published";
    drafts: Map<string, GradeDraft>;
  },
) {
  const rows = [...values.drafts.entries()]
    .filter(([, draft]) => draft.grade !== "" || draft.is_excused)
    .map(([studentId, draft]) => ({
      school_id: values.schoolId,
      assessment_id: values.assessmentId,
      student_profile_id: studentId,
      score: draft.grade === "" ? null : Number(draft.grade),
      grade: draft.grade === "" ? null : Number(draft.grade),
      is_excused: draft.is_excused,
      note: draft.note.trim() || null,
      status: values.status,
      graded_by: values.graderId,
    }));
  if (rows.length === 0) return;
  const { error } = await supabase
    .from("grades")
    .upsert(rows, { onConflict: "assessment_id,student_profile_id" });
  if (error) throw error;
}

export async function publishAssessment(supabase: SupabaseClient, assessmentId: string) {
  const { error } = await supabase
    .from("assessments")
    .update({ status: "published" })
    .eq("id", assessmentId);
  if (error) throw error;
}
