import { getSupabaseBrowserClient } from "./supabase-client";

export type AdminRole = "platform_admin" | "school_admin" | "teacher" | "student" | "parent";

export type School = {
  id: string;
  name: string;
  address: string | null;
  contact_email: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
  school_name: string | null;
  school_id: string | null;
  created_at: string;
};

export type AuditLog = {
  id: number;
  table_name: string;
  action: string;
  record_id: string | null;
  actor_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

export type PermissionDefinition = {
  key: string;
  category: string;
  category_label: string;
  action: string;
  action_label: string;
  description: string;
  risk_level: "normal" | "sensitive" | "critical";
  allowed_scopes: Array<"own" | "assigned" | "team" | "school">;
  sort_order: number;
};

export type SchoolRole = {
  id: string;
  school_id: string;
  name: string;
  description: string | null;
  rank: number;
  color: string;
  legacy_key: AdminRole | null;
  is_default: boolean;
  is_active: boolean;
  version: number;
  organization_layer: number;
  template_key: string | null;
  template_version: number | null;
  created_at: string;
  updated_at: string;
};

export type RoleTemplate = {
  key: string;
  name: string;
  description: string;
  sectors: string[];
  organization_layer: number;
  layer_label: string;
  recommended_rank: number;
  color: string;
  is_core: boolean;
  is_active: boolean;
  version: number;
  sort_order: number;
};

export type RolePermission = {
  role_id: string;
  permission_key: string;
  scope: "own" | "assigned" | "team" | "school";
};

export type RoleAssignment = {
  profile_id: string;
  role_id: string;
  is_primary: boolean;
};

export type PermissionRequest = {
  id: string;
  school_id: string;
  requested_by: string;
  request_type: "change_role" | "new_role" | "change_rank" | "remove_access" | "advice";
  target_role_id: string | null;
  title: string;
  summary: string;
  business_reason: string;
  desired_changes: Record<string, unknown>;
  affected_people: string | null;
  urgency: "normal" | "urgent";
  requested_effective_date: string | null;
  status: string;
  platform_response: string | null;
  created_at: string;
  updated_at: string;
};

export type SchoolYear = {
  id: string;
  school_id: string;
  name: string;
  starts_on: string;
  ends_on: string;
  is_current: boolean;
  is_archived: boolean;
};

export type SchoolPeriod = {
  id: string;
  school_id: string;
  school_year_id: string;
  name: string;
  sequence: number;
  starts_on: string;
  ends_on: string;
};

export type SchoolLocation = {
  id: string;
  school_id: string;
  name: string;
  code: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  is_main: boolean;
  is_active: boolean;
};

export type EducationProgramme = {
  id: string;
  school_id: string;
  name: string;
  code: string | null;
  sector: "po" | "vo" | "vso" | "mbo" | "other";
  level: string | null;
  duration_years: number | null;
  is_active: boolean;
};

export type Subject = {
  id: string;
  school_id: string;
  name: string;
  code: string;
  color: string;
  is_active: boolean;
};

export type SchoolClass = {
  id: string;
  school_id: string;
  school_year_id: string;
  programme_id: string | null;
  location_id: string | null;
  name: string;
  code: string | null;
  grade_level: number | null;
  capacity: number | null;
  is_active: boolean;
};

export type TeachingGroup = {
  id: string;
  school_id: string;
  school_year_id: string;
  subject_id: string | null;
  base_class_id: string | null;
  location_id: string | null;
  name: string;
  code: string | null;
  group_type: "lesson" | "mentor" | "project" | "support" | "other";
  capacity: number | null;
  is_active: boolean;
};

export type SchoolStructure = {
  years: SchoolYear[];
  periods: SchoolPeriod[];
  locations: SchoolLocation[];
  programmes: EducationProgramme[];
  subjects: Subject[];
  classes: SchoolClass[];
  groups: TeachingGroup[];
};

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

export type SchoolRelations = {
  students: StudentRecord[];
  staff: StaffRecord[];
  enrolments: StudentEnrolment[];
  guardians: GuardianStudentLink[];
  teacherSubjects: TeacherSubjectAssignment[];
  teacherGroups: TeacherGroupAssignment[];
  studentGroups: StudentGroupMembership[];
};

export function getAdminSupabaseClient() {
  return getSupabaseBrowserClient();
}

function isMissingSchoolIdColumnError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const message = "message" in error ? String(error.message) : "";
  return message.includes("school_id") && message.toLowerCase().includes("column");
}

function normalizeProfileRecord(
  record: Omit<Profile, "school_id"> & { school_id?: string | null },
): Profile {
  return {
    ...record,
    school_id: record.school_id ?? null,
  };
}

export function getReadableAdminError(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") return fallback;
  const message = "message" in error ? String(error.message) : "";
  if (!message) return fallback;
  if (isMissingSchoolIdColumnError(error)) {
    return "Database migraties zijn nog niet volledig uitgevoerd (profiles.school_id ontbreekt).";
  }
  return message;
}

export async function getCurrentProfile(userId: string): Promise<Profile | null> {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,school_name,school_id,created_at")
    .eq("id", userId)
    .maybeSingle();

  if (!error) return data ? normalizeProfileRecord(data as Profile) : null;
  if (!isMissingSchoolIdColumnError(error)) throw error;

  const fallback = await supabase
    .from("profiles")
    .select("id,email,full_name,role,school_name,created_at")
    .eq("id", userId)
    .maybeSingle();
  if (fallback.error) throw fallback.error;

  return fallback.data ? normalizeProfileRecord(fallback.data as Omit<Profile, "school_id">) : null;
}

export async function listProfiles(): Promise<Profile[]> {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,school_name,school_id,created_at")
    .order("created_at", { ascending: false });

  if (!error) return (data ?? []).map((row) => normalizeProfileRecord(row as Profile));
  if (!isMissingSchoolIdColumnError(error)) throw error;

  const fallback = await supabase
    .from("profiles")
    .select("id,email,full_name,role,school_name,created_at")
    .order("created_at", { ascending: false });
  if (fallback.error) throw fallback.error;

  return (fallback.data ?? []).map((row) =>
    normalizeProfileRecord(row as Omit<Profile, "school_id">),
  );
}

export async function listSchools(): Promise<School[]> {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from("schools")
    .select("id,name,address,contact_email,created_at")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as School[];
}

export async function listAuditLogs(limit = 12): Promise<AuditLog[]> {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from("admin_audit_logs")
    .select("id,table_name,action,record_id,actor_id,details,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as AuditLog[];
}

export async function createSchool(payload: {
  name: string;
  address?: string;
  contact_email?: string;
}): Promise<void> {
  const supabase = getAdminSupabaseClient();
  const { error } = await supabase.from("schools").insert({
    name: payload.name.trim(),
    address: payload.address?.trim() || null,
    contact_email: payload.contact_email?.trim() || null,
  });
  if (error) throw error;
}

export async function updateSchool(
  schoolId: string,
  payload: { name: string; address?: string; contact_email?: string },
): Promise<void> {
  const supabase = getAdminSupabaseClient();
  const { error } = await supabase
    .from("schools")
    .update({
      name: payload.name.trim(),
      address: payload.address?.trim() || null,
      contact_email: payload.contact_email?.trim() || null,
    })
    .eq("id", schoolId);
  if (error) throw error;
}

export async function deleteSchool(schoolId: string): Promise<void> {
  const supabase = getAdminSupabaseClient();
  const { error } = await supabase.from("schools").delete().eq("id", schoolId);
  if (error) throw error;
}

export async function listSchoolStructure(schoolId: string): Promise<SchoolStructure> {
  const supabase = getAdminSupabaseClient();
  const [years, periods, locations, programmes, subjects, classes, groups] = await Promise.all([
    supabase
      .from("school_years")
      .select("id,school_id,name,starts_on,ends_on,is_current,is_archived")
      .eq("school_id", schoolId)
      .order("starts_on", { ascending: false }),
    supabase
      .from("school_periods")
      .select("id,school_id,school_year_id,name,sequence,starts_on,ends_on")
      .eq("school_id", schoolId)
      .order("sequence"),
    supabase
      .from("school_locations")
      .select("id,school_id,name,code,address,postal_code,city,is_main,is_active")
      .eq("school_id", schoolId)
      .order("name"),
    supabase
      .from("education_programmes")
      .select("id,school_id,name,code,sector,level,duration_years,is_active")
      .eq("school_id", schoolId)
      .order("name"),
    supabase
      .from("subjects")
      .select("id,school_id,name,code,color,is_active")
      .eq("school_id", schoolId)
      .order("name"),
    supabase
      .from("school_classes")
      .select(
        "id,school_id,school_year_id,programme_id,location_id,name,code,grade_level,capacity,is_active",
      )
      .eq("school_id", schoolId)
      .order("name"),
    supabase
      .from("teaching_groups")
      .select(
        "id,school_id,school_year_id,subject_id,base_class_id,location_id,name,code,group_type,capacity,is_active",
      )
      .eq("school_id", schoolId)
      .order("name"),
  ]);
  const failed = [years, periods, locations, programmes, subjects, classes, groups].find(
    (result) => result.error,
  );
  if (failed?.error) throw failed.error;
  return {
    years: (years.data ?? []) as SchoolYear[],
    periods: (periods.data ?? []) as SchoolPeriod[],
    locations: (locations.data ?? []) as SchoolLocation[],
    programmes: (programmes.data ?? []) as EducationProgramme[],
    subjects: (subjects.data ?? []) as Subject[],
    classes: (classes.data ?? []) as SchoolClass[],
    groups: (groups.data ?? []) as TeachingGroup[],
  };
}

const structureTables = {
  years: "school_years",
  periods: "school_periods",
  locations: "school_locations",
  programmes: "education_programmes",
  subjects: "subjects",
  classes: "school_classes",
  groups: "teaching_groups",
} as const;

export type SchoolStructureKind = keyof typeof structureTables;

export async function createStructureRecord(
  kind: SchoolStructureKind,
  schoolId: string,
  values: Record<string, unknown>,
): Promise<void> {
  const { error } = await getAdminSupabaseClient()
    .from(structureTables[kind])
    .insert({ ...values, school_id: schoolId });
  if (error) throw error;
}

export async function updateStructureRecord(
  kind: SchoolStructureKind,
  id: string,
  values: Record<string, unknown>,
): Promise<void> {
  const { error } = await getAdminSupabaseClient()
    .from(structureTables[kind])
    .update(values)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteStructureRecord(kind: SchoolStructureKind, id: string): Promise<void> {
  const { error } = await getAdminSupabaseClient()
    .from(structureTables[kind])
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function listSchoolRelations(schoolId: string): Promise<SchoolRelations> {
  const supabase = getAdminSupabaseClient();
  const [students, staff, enrolments, guardians, teacherSubjects, teacherGroups, studentGroups] =
    await Promise.all([
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
        .select(
          "id,school_id,teacher_profile_id,teaching_group_id,assignment_role,starts_on,ends_on",
        )
        .eq("school_id", schoolId),
      supabase
        .from("student_group_memberships")
        .select("id,school_id,student_profile_id,teaching_group_id,starts_on,ends_on,status")
        .eq("school_id", schoolId),
    ]);
  const failed = [
    students,
    staff,
    enrolments,
    guardians,
    teacherSubjects,
    teacherGroups,
    studentGroups,
  ].find((result) => result.error);
  if (failed?.error) throw failed.error;
  return {
    students: (students.data ?? []) as StudentRecord[],
    staff: (staff.data ?? []) as StaffRecord[],
    enrolments: (enrolments.data ?? []) as StudentEnrolment[],
    guardians: (guardians.data ?? []) as GuardianStudentLink[],
    teacherSubjects: (teacherSubjects.data ?? []) as TeacherSubjectAssignment[],
    teacherGroups: (teacherGroups.data ?? []) as TeacherGroupAssignment[],
    studentGroups: (studentGroups.data ?? []) as StudentGroupMembership[],
  };
}

const relationTables = {
  students: "student_records",
  staff: "staff_records",
  enrolments: "student_enrolments",
  guardians: "guardian_student_links",
  teacherSubjects: "teacher_subject_assignments",
  teacherGroups: "teacher_group_assignments",
  studentGroups: "student_group_memberships",
} as const;

export type SchoolRelationKind = keyof typeof relationTables;

export async function createRelationRecord(
  kind: SchoolRelationKind,
  schoolId: string,
  values: Record<string, unknown>,
): Promise<void> {
  const { error } = await getAdminSupabaseClient()
    .from(relationTables[kind])
    .insert({ ...values, school_id: schoolId });
  if (error) throw error;
}

export async function updateRelationRecord(
  kind: SchoolRelationKind,
  id: string,
  values: Record<string, unknown>,
): Promise<void> {
  const { error } = await getAdminSupabaseClient()
    .from(relationTables[kind])
    .update(values)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteRelationRecord(kind: SchoolRelationKind, id: string): Promise<void> {
  const { error } = await getAdminSupabaseClient().from(relationTables[kind]).delete().eq("id", id);
  if (error) throw error;
}

type ManageUserPayload =
  | {
      action: "create_user";
      email: string;
      password: string;
      full_name: string;
      role: AdminRole;
      school_id: string | null;
      school_name: string | null;
    }
  | {
      action: "update_user";
      user_id: string;
      email: string;
      full_name: string;
      role: AdminRole;
      school_id: string | null;
      school_name: string | null;
    }
  | {
      action: "delete_user";
      user_id: string;
    };

async function invokeManageUser(payload: ManageUserPayload): Promise<void> {
  const supabase = getAdminSupabaseClient();
  const { error } = await supabase.functions.invoke("admin-manage-user", { body: payload });
  if (error) throw error;
}

export async function createAccount(payload: {
  email: string;
  password: string;
  full_name: string;
  role: AdminRole;
  school_id: string | null;
  school_name: string | null;
}): Promise<void> {
  await invokeManageUser({
    action: "create_user",
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    full_name: payload.full_name.trim(),
    role: payload.role,
    school_id: payload.school_id,
    school_name: payload.school_name,
  });
}

export async function updateAccount(payload: {
  user_id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  school_id: string | null;
  school_name: string | null;
}): Promise<void> {
  await invokeManageUser({
    action: "update_user",
    user_id: payload.user_id,
    email: payload.email.trim().toLowerCase(),
    full_name: payload.full_name.trim(),
    role: payload.role,
    school_id: payload.school_id,
    school_name: payload.school_name,
  });
}

export async function deleteAccount(userId: string): Promise<void> {
  await invokeManageUser({
    action: "delete_user",
    user_id: userId,
  });
}

export async function listPermissionDefinitions(): Promise<PermissionDefinition[]> {
  const { data, error } = await getAdminSupabaseClient()
    .from("permission_definitions")
    .select(
      "key,category,category_label,action,action_label,description,risk_level,allowed_scopes,sort_order",
    )
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as PermissionDefinition[];
}

export async function listRoleTemplates(): Promise<RoleTemplate[]> {
  const { data, error } = await getAdminSupabaseClient()
    .from("role_templates")
    .select(
      "key,name,description,sectors,organization_layer,layer_label,recommended_rank,color,is_core,is_active,version,sort_order",
    )
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as RoleTemplate[];
}

export async function listSchoolRoles(schoolId: string): Promise<SchoolRole[]> {
  const { data, error } = await getAdminSupabaseClient()
    .from("school_roles")
    .select(
      "id,school_id,name,description,rank,color,legacy_key,is_default,is_active,version,organization_layer,template_key,template_version,created_at,updated_at",
    )
    .eq("school_id", schoolId)
    .order("rank", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SchoolRole[];
}

export async function listRolePermissions(roleIds: string[]): Promise<RolePermission[]> {
  if (!roleIds.length) return [];
  const { data, error } = await getAdminSupabaseClient()
    .from("role_permissions")
    .select("role_id,permission_key,scope")
    .in("role_id", roleIds);
  if (error) throw error;
  return (data ?? []) as RolePermission[];
}

export async function createSchoolRoleFromTemplate(
  schoolId: string,
  templateKey: string,
  name?: string,
): Promise<string> {
  const { data, error } = await getAdminSupabaseClient().rpc("admin_create_role_from_template", {
    _school_id: schoolId,
    _template_key: templateKey,
    _name: name?.trim() || null,
  });
  if (error) throw error;
  return data as string;
}

export async function moveSchoolRole(roleId: string, direction: "up" | "down"): Promise<void> {
  const { error } = await getAdminSupabaseClient().rpc("admin_move_school_role", {
    _role_id: roleId,
    _direction: direction,
  });
  if (error) throw error;
}

export async function updateSchoolRole(
  roleId: string,
  payload: {
    name: string;
    description?: string;
    rank: number;
    color: string;
    is_active: boolean;
  },
): Promise<void> {
  const { error } = await getAdminSupabaseClient()
    .from("school_roles")
    .update({
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
      rank: payload.rank,
      color: payload.color,
      is_active: payload.is_active,
    })
    .eq("id", roleId);
  if (error) throw error;
}

export async function deleteSchoolRole(roleId: string): Promise<void> {
  const { error } = await getAdminSupabaseClient().rpc("admin_delete_school_role", {
    _role_id: roleId,
  });
  if (error) throw error;
}

export async function replaceRolePermissions(
  roleId: string,
  permissions: Array<{ permission_key: string; scope: RolePermission["scope"] }>,
): Promise<void> {
  const { error } = await getAdminSupabaseClient().rpc("admin_replace_role_permissions", {
    _role_id: roleId,
    _permissions: permissions,
  });
  if (error) throw error;
}

export async function listRoleAssignments(profileIds: string[]): Promise<RoleAssignment[]> {
  if (!profileIds.length) return [];
  const { data, error } = await getAdminSupabaseClient()
    .from("profile_role_assignments")
    .select("profile_id,role_id,is_primary")
    .in("profile_id", profileIds);
  if (error) throw error;
  return (data ?? []) as RoleAssignment[];
}

export async function setProfileRoles(
  profileId: string,
  roleIds: string[],
  primaryRoleId: string | null,
): Promise<void> {
  const { error } = await getAdminSupabaseClient().rpc("admin_set_profile_roles", {
    _profile_id: profileId,
    _role_ids: roleIds,
    _primary_role_id: primaryRoleId,
  });
  if (error) throw error;
}

export async function listPermissionRequests(schoolId?: string): Promise<PermissionRequest[]> {
  let query = getAdminSupabaseClient()
    .from("permission_change_requests")
    .select(
      "id,school_id,requested_by,request_type,target_role_id,title,summary,business_reason,desired_changes,affected_people,urgency,requested_effective_date,status,platform_response,created_at,updated_at",
    )
    .order("created_at", { ascending: false });
  if (schoolId) query = query.eq("school_id", schoolId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as PermissionRequest[];
}

export async function reviewPermissionRequest(
  requestId: string,
  status: string,
  platformResponse: string,
): Promise<void> {
  const { error } = await getAdminSupabaseClient().rpc("admin_review_permission_request", {
    _request_id: requestId,
    _status: status,
    _platform_response: platformResponse,
  });
  if (error) throw error;
}
