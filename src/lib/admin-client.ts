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

export type QuoteStatus = "new" | "in_review" | "quoted" | "closed";

export type QuoteRequest = {
  id: string;
  school_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  student_count: number;
  staff_count: number;
  requested_modules: string;
  desired_start_period: string;
  current_systems: string;
  additional_requirements: string;
  status: QuoteStatus;
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

export async function createQuoteRequest(payload: {
  school_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  student_count: number;
  staff_count: number;
  requested_modules: string;
  desired_start_period: string;
  current_systems: string;
  additional_requirements: string;
}): Promise<void> {
  const supabase = getAdminSupabaseClient();
  const { error } = await supabase.from("quote_requests").insert({
    school_name: payload.school_name.trim(),
    contact_name: payload.contact_name.trim(),
    contact_email: payload.contact_email.trim().toLowerCase(),
    contact_phone: payload.contact_phone?.trim() || null,
    student_count: payload.student_count,
    staff_count: payload.staff_count,
    requested_modules: payload.requested_modules.trim(),
    desired_start_period: payload.desired_start_period.trim(),
    current_systems: payload.current_systems.trim(),
    additional_requirements: payload.additional_requirements.trim(),
  });
  if (error) throw error;
}

export async function listQuoteRequests(): Promise<QuoteRequest[]> {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from("quote_requests")
    .select(
      "id,school_name,contact_name,contact_email,contact_phone,student_count,staff_count,requested_modules,desired_start_period,current_systems,additional_requirements,status,created_at,updated_at",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as QuoteRequest[];
}

export async function updateQuoteRequestStatus(
  quoteRequestId: string,
  status: QuoteStatus,
): Promise<void> {
  const supabase = getAdminSupabaseClient();
  const { error } = await supabase
    .from("quote_requests")
    .update({ status })
    .eq("id", quoteRequestId);
  if (error) throw error;
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
