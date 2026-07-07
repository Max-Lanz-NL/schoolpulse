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

export function getAdminSupabaseClient() {
  return getSupabaseBrowserClient();
}

export async function getCurrentProfile(userId: string): Promise<Profile | null> {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,school_name,school_id,created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}

export async function listProfiles(): Promise<Profile[]> {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,school_name,school_id,created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Profile[];
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
