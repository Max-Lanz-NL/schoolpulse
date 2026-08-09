import type { SupabaseClient } from "@supabase/supabase-js";
import type { EffectivePermission } from "@/domains/identity/types";

export async function getEffectiveAccess(supabase: SupabaseClient) {
  const [permissions, rank] = await Promise.all([
    supabase.rpc("effective_permissions"),
    supabase.rpc("effective_rank"),
  ]);

  return {
    permissions: (permissions.data ?? []) as EffectivePermission[],
    rank: Number(rank.data ?? 0),
    error: permissions.error,
  };
}
