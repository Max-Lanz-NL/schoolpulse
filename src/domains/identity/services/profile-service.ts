import type { SupabaseClient } from "@supabase/supabase-js";

export function getProfilePreferences(supabase: SupabaseClient, profileId: string) {
  return supabase.from("profile_preferences").select("*").eq("profile_id", profileId).maybeSingle();
}

export function updateProfileName(
  supabase: SupabaseClient,
  profileId: string,
  fullName: string | null,
) {
  return supabase.from("profiles").update({ full_name: fullName }).eq("id", profileId);
}

export function saveProfilePreferences(
  supabase: SupabaseClient,
  preferences: {
    profile_id: string;
    school_id: string | null;
    display_name: string | null;
    notification_email: boolean;
    notification_in_app: boolean;
    notification_digest: string;
  },
) {
  return supabase.from("profile_preferences").upsert({
    ...preferences,
    updated_at: new Date().toISOString(),
  });
}
