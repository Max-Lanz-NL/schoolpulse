import type { SupabaseClient } from "@supabase/supabase-js";
import { DomainError, toDomainError } from "@/domains/shared/domain-error";
import type {
  GuardianStudentLink,
  PeopleDirectory,
  PersonProfile,
  StaffRecord,
  StaffSummary,
  StudentEnrolment,
  StudentGroupMembership,
  StudentRecord,
  StudentSummary,
  TeacherGroupAssignment,
  TeacherSubjectAssignment,
} from "@/domains/people/types";

export async function getPeopleDirectory(
  supabase: SupabaseClient,
  schoolId: string,
): Promise<PeopleDirectory> {
  if (!schoolId)
    throw new DomainError("VALIDATION", "Er is geen school aan dit account gekoppeld.");
  const [
    profiles,
    students,
    staff,
    enrolments,
    guardians,
    teacherSubjects,
    teacherGroups,
    studentGroups,
  ] = await Promise.all([
    supabase.from("profiles").select("id,email,full_name,role,school_id").eq("school_id", schoolId),
    supabase
      .from("student_records")
      .select(
        "id,school_id,profile_id,student_number,preferred_name,date_of_birth,start_date,end_date,status",
      )
      .eq("school_id", schoolId)
      .order("student_number"),
    supabase
      .from("staff_records")
      .select(
        "id,school_id,profile_id,employee_number,job_title,department,start_date,end_date,is_active",
      )
      .eq("school_id", schoolId)
      .order("employee_number"),
    supabase
      .from("student_enrolments")
      .select(
        "id,school_id,student_profile_id,school_year_id,class_id,programme_id,starts_on,ends_on,status",
      )
      .eq("school_id", schoolId),
    supabase
      .from("guardian_student_links")
      .select(
        "id,school_id,guardian_profile_id,student_profile_id,relationship,has_legal_authority,receives_communication,financial_responsibility,is_active",
      )
      .eq("school_id", schoolId),
    supabase
      .from("teacher_subject_assignments")
      .select("id,school_id,teacher_profile_id,school_year_id,subject_id,is_primary")
      .eq("school_id", schoolId),
    supabase
      .from("teacher_group_assignments")
      .select("id,school_id,teacher_profile_id,teaching_group_id,assignment_role,starts_on,ends_on")
      .eq("school_id", schoolId),
    supabase
      .from("student_group_memberships")
      .select("id,school_id,student_profile_id,teaching_group_id,starts_on,ends_on,status")
      .eq("school_id", schoolId),
  ]);
  const failed = [
    profiles,
    students,
    staff,
    enrolments,
    guardians,
    teacherSubjects,
    teacherGroups,
    studentGroups,
  ].find((result) => result.error);
  if (failed?.error) throw toDomainError(failed.error, "Personen konden niet worden geladen.");
  const profileMap = new Map(
    ((profiles.data ?? []) as PersonProfile[]).map((profile) => [profile.id, profile]),
  );
  const typedEnrolments = (enrolments.data ?? []) as StudentEnrolment[];
  const typedGuardians = (guardians.data ?? []) as GuardianStudentLink[];
  const typedStudentGroups = (studentGroups.data ?? []) as StudentGroupMembership[];
  const typedSubjects = (teacherSubjects.data ?? []) as TeacherSubjectAssignment[];
  const typedTeacherGroups = (teacherGroups.data ?? []) as TeacherGroupAssignment[];
  const studentSummaries: StudentSummary[] = ((students.data ?? []) as StudentRecord[]).map(
    (student) => ({
      ...student,
      profile: profileMap.get(student.profile_id) ?? null,
      enrolment:
        typedEnrolments.find(
          (item) => item.student_profile_id === student.profile_id && item.status === "active",
        ) ?? null,
      groupMemberships: typedStudentGroups.filter(
        (item) => item.student_profile_id === student.profile_id && item.status === "active",
      ),
      guardianLinks: typedGuardians.filter(
        (item) => item.student_profile_id === student.profile_id && item.is_active,
      ),
    }),
  );
  const staffSummaries: StaffSummary[] = ((staff.data ?? []) as StaffRecord[]).map((member) => ({
    ...member,
    profile: profileMap.get(member.profile_id) ?? null,
    subjectAssignments: typedSubjects.filter(
      (item) => item.teacher_profile_id === member.profile_id,
    ),
    groupAssignments: typedTeacherGroups.filter(
      (item) => item.teacher_profile_id === member.profile_id,
    ),
  }));
  return { students: studentSummaries, staff: staffSummaries, guardians: typedGuardians };
}

export async function getStudentDetail(
  supabase: SupabaseClient,
  schoolId: string,
  profileId: string,
) {
  const directory = await getPeopleDirectory(supabase, schoolId);
  const student = directory.students.find((item) => item.profile_id === profileId);
  if (!student) throw new DomainError("NOT_FOUND", "De leerling is niet gevonden.");
  return student;
}
export async function getStaffDetail(
  supabase: SupabaseClient,
  schoolId: string,
  profileId: string,
) {
  const directory = await getPeopleDirectory(supabase, schoolId);
  const member = directory.staff.find((item) => item.profile_id === profileId);
  if (!member) throw new DomainError("NOT_FOUND", "De medewerker is niet gevonden.");
  return member;
}

const peopleTables = {
  students: "student_records",
  staff: "staff_records",
  enrolments: "student_enrolments",
  guardians: "guardian_student_links",
  teacherSubjects: "teacher_subject_assignments",
  teacherGroups: "teacher_group_assignments",
  studentGroups: "student_group_memberships",
} as const;
export type PeopleResource = keyof typeof peopleTables;
export async function createPeopleResource(
  supabase: SupabaseClient,
  resource: PeopleResource,
  schoolId: string,
  values: Record<string, unknown>,
) {
  const { error } = await supabase
    .from(peopleTables[resource])
    .insert({ ...values, school_id: schoolId });
  if (error) throw toDomainError(error);
}
export async function updatePeopleResource(
  supabase: SupabaseClient,
  resource: PeopleResource,
  id: string,
  values: Record<string, unknown>,
) {
  const { error } = await supabase.from(peopleTables[resource]).update(values).eq("id", id);
  if (error) throw toDomainError(error);
}
export async function deletePeopleResource(
  supabase: SupabaseClient,
  resource: PeopleResource,
  id: string,
) {
  const { error } = await supabase.from(peopleTables[resource]).delete().eq("id", id);
  if (error) throw toDomainError(error);
}
