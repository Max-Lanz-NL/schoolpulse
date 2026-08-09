import type { ProductionProfile } from "@/domains/identity/types";

export type StudentRecord = {
  id: string;
  school_id: string;
  profile_id: string;
  student_number: string;
  preferred_name: string | null;
  date_of_birth: string | null;
  start_date: string | null;
  end_date: string | null;
  status: "planned" | "active" | "graduated" | "withdrawn";
};
export type StaffRecord = {
  id: string;
  school_id: string;
  profile_id: string;
  employee_number: string | null;
  job_title: string | null;
  department: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
};
export type StudentEnrolment = {
  id: string;
  school_id: string;
  student_profile_id: string;
  school_year_id: string;
  class_id: string | null;
  programme_id: string | null;
  starts_on: string | null;
  ends_on: string | null;
  status: "planned" | "active" | "completed" | "withdrawn";
};
export type GuardianStudentLink = {
  id: string;
  school_id: string;
  guardian_profile_id: string;
  student_profile_id: string;
  relationship: "parent" | "guardian" | "foster_parent" | "stepparent" | "other";
  has_legal_authority: boolean;
  receives_communication: boolean;
  financial_responsibility: boolean;
  is_active: boolean;
};
export type TeacherSubjectAssignment = {
  id: string;
  school_id: string;
  teacher_profile_id: string;
  school_year_id: string;
  subject_id: string;
  is_primary: boolean;
};
export type TeacherGroupAssignment = {
  id: string;
  school_id: string;
  teacher_profile_id: string;
  teaching_group_id: string;
  assignment_role: "lead_teacher" | "teacher" | "mentor" | "assistant" | "substitute";
  starts_on: string | null;
  ends_on: string | null;
};
export type StudentGroupMembership = {
  id: string;
  school_id: string;
  student_profile_id: string;
  teaching_group_id: string;
  starts_on: string | null;
  ends_on: string | null;
  status: "planned" | "active" | "completed" | "withdrawn";
};
export type PersonProfile = Pick<
  ProductionProfile,
  "id" | "email" | "full_name" | "role" | "school_id"
>;
export type StudentSummary = StudentRecord & {
  profile: PersonProfile | null;
  enrolment: StudentEnrolment | null;
  groupMemberships: StudentGroupMembership[];
  guardianLinks: GuardianStudentLink[];
};
export type StaffSummary = StaffRecord & {
  profile: PersonProfile | null;
  subjectAssignments: TeacherSubjectAssignment[];
  groupAssignments: TeacherGroupAssignment[];
};
export type PeopleDirectory = {
  students: StudentSummary[];
  staff: StaffSummary[];
  guardians: GuardianStudentLink[];
};
