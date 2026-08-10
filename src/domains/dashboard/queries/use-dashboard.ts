import type { SupabaseClient } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { readableDomainError } from "@/domains/shared/domain-error";
import { getDashboard } from "../services/dashboard-service";

export function useDashboard(supabase: SupabaseClient, profileId: string) {
  const query = useQuery({
    queryKey: ["dashboard", profileId],
    queryFn: () => getDashboard(supabase),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error ? readableDomainError(query.error) : null,
    reload: query.refetch,
  };
}
