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
  created_at: string;
  updated_at: string;
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

export async function listSchoolRoles(schoolId: string): Promise<SchoolRole[]> {
  const { data, error } = await getAdminSupabaseClient()
    .from("school_roles")
    .select(
      "id,school_id,name,description,rank,color,legacy_key,is_default,is_active,version,created_at,updated_at",
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

export async function createSchoolRole(payload: {
  school_id: string;
  name: string;
  description?: string;
  rank: number;
  color: string;
}): Promise<SchoolRole> {
  const { data, error } = await getAdminSupabaseClient()
    .from("school_roles")
    .insert({
      school_id: payload.school_id,
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
      rank: payload.rank,
      color: payload.color,
    })
    .select(
      "id,school_id,name,description,rank,color,legacy_key,is_default,is_active,version,created_at,updated_at",
    )
    .single();
  if (error) throw error;
  return data as SchoolRole;
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
  const { error } = await getAdminSupabaseClient().from("school_roles").delete().eq("id", roleId);
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
