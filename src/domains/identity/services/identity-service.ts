import type { SupabaseClient } from "@supabase/supabase-js";
import { DomainError, toDomainError } from "@/domains/shared/domain-error";
import type {
  AssignedRole,
  IdentityContext,
  ProductionProfile,
  ProfilePreferences,
} from "@/domains/identity/types";
import { getEffectiveAccess } from "./access-service";

export async function getCurrentIdentity(supabase: SupabaseClient): Promise<IdentityContext> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new DomainError("UNAUTHENTICATED", "Log opnieuw in om verder te gaan.", userError);
  }

  const userId = userData.user.id;
  const [profileResult, assignmentsResult, preferencesResult, access] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,email,full_name,role,school_name,school_id")
      .eq("id", userId)
      .single(),
    supabase
      .from("profile_role_assignments")
      .select("is_primary,role:school_roles!inner(id,name,rank,color)")
      .eq("profile_id", userId),
    supabase.from("profile_preferences").select("*").eq("profile_id", userId).maybeSingle(),
    getEffectiveAccess(supabase),
  ]);

  if (profileResult.error)
    throw toDomainError(profileResult.error, "Je profiel kon niet worden geladen.");
  if (assignmentsResult.error)
    throw toDomainError(assignmentsResult.error, "Je rollen konden niet worden geladen.");
  if (access.error) throw toDomainError(access.error, "Je rechten konden niet worden geladen.");

  const roles = (assignmentsResult.data ?? []).map((assignment) => {
    const role = Array.isArray(assignment.role) ? assignment.role[0] : assignment.role;
    return { ...role, is_primary: assignment.is_primary } as AssignedRole;
  });

  return {
    userId,
    profile: profileResult.data as ProductionProfile,
    schoolId: profileResult.data.school_id,
    roles,
    primaryRole: roles.find((role) => role.is_primary) ?? roles[0] ?? null,
    permissions: access.permissions,
    rank: access.rank,
    preferences: (preferencesResult.data as ProfilePreferences | null) ?? null,
  };
}

export async function listSchoolIdentities(supabase: SupabaseClient, schoolId: string) {
  const [profiles, roles, assignments] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,email,full_name,role,school_name,school_id")
      .eq("school_id", schoolId)
      .order("full_name"),
    supabase
      .from("school_roles")
      .select("id,name,rank,color")
      .eq("school_id", schoolId)
      .eq("is_active", true)
      .order("rank", { ascending: false }),
    supabase.from("profile_role_assignments").select("profile_id,role_id,is_primary"),
  ]);
  const failed = [profiles, roles, assignments].find((result) => result.error);
  if (failed?.error)
    throw toDomainError(failed.error, "Gebruikers en rollen konden niet worden geladen.");
  return {
    profiles: (profiles.data ?? []) as ProductionProfile[],
    roles: roles.data ?? [],
    assignments: assignments.data ?? [],
  };
}
