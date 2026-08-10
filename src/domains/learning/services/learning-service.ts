import type { SupabaseClient } from "@supabase/supabase-js";
import type { Assignment, LearningGroup, LearningSubject, Submission } from "../types";

export async function getLearning(supabase: SupabaseClient) {
  const [a, s] = await Promise.all([
    supabase
      .from("assignments")
      .select(
        "id,school_id,teaching_group_id,subject_id,title,instructions,due_at,status,created_by,group:teaching_groups!assignments_teaching_group_id_fkey(name),subject:subjects!assignments_subject_id_fkey(name)",
      )
      .order("due_at", { ascending: true, nullsFirst: false }),
    supabase
      .from("assignment_submissions")
      .select(
        "id,school_id,assignment_id,student_profile_id,body,storage_path,submitted_at,status,feedback,reviewed_by,student:profiles!assignment_submissions_student_profile_id_fkey(full_name,email)",
      )
      .order("updated_at", { ascending: false }),
  ]);
  if (a.error) throw a.error;
  if (s.error) throw s.error;
  return {
    assignments: (a.data ?? []) as unknown as Assignment[],
    submissions: (s.data ?? []) as unknown as Submission[],
  };
}
export async function getLearningOptions(supabase: SupabaseClient) {
  const [g, s] = await Promise.all([
    supabase
      .from("teaching_groups")
      .select("id,name,subject_id")
      .eq("is_active", true)
      .order("name"),
    supabase.from("subjects").select("id,name").eq("is_active", true).order("name"),
  ]);
  if (g.error) throw g.error;
  if (s.error) throw s.error;
  return {
    groups: (g.data ?? []) as LearningGroup[],
    subjects: (s.data ?? []) as LearningSubject[],
  };
}
export async function createAssignment(
  supabase: SupabaseClient,
  v: {
    schoolId: string;
    userId: string;
    groupId: string;
    subjectId: string;
    title: string;
    instructions: string;
    dueAt: string | null;
    publish: boolean;
  },
) {
  const { error } = await supabase.from("assignments").insert({
    school_id: v.schoolId,
    teaching_group_id: v.groupId,
    subject_id: v.subjectId,
    title: v.title.trim(),
    instructions: v.instructions.trim() || null,
    due_at: v.dueAt,
    status: v.publish ? "published" : "draft",
    created_by: v.userId,
  });
  if (error) throw error;
}
export async function submitWork(
  supabase: SupabaseClient,
  v: { schoolId: string; assignmentId: string; studentId: string; body: string },
) {
  const { error } = await supabase.from("assignment_submissions").upsert(
    {
      school_id: v.schoolId,
      assignment_id: v.assignmentId,
      student_profile_id: v.studentId,
      body: v.body.trim() || null,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "assignment_id,student_profile_id" },
  );
  if (error) throw error;
}
export async function reviewSubmission(
  supabase: SupabaseClient,
  v: { id: string; reviewerId: string; status: "returned" | "accepted"; feedback: string },
) {
  const { error } = await supabase
    .from("assignment_submissions")
    .update({
      status: v.status,
      feedback: v.feedback.trim() || null,
      reviewed_by: v.reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", v.id);
  if (error) throw error;
}
