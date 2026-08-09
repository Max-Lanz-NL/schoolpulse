import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { IdentityContext } from "@/domains/identity/types";
import { getCurrentIdentity } from "@/domains/identity/services/identity-service";
import { readableDomainError } from "@/domains/shared/domain-error";

export function useIdentity(supabase: SupabaseClient) {
  const [data, setData] = useState<IdentityContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getCurrentIdentity(supabase)
      .then((identity) => active && setData(identity))
      .catch((reason) => active && setError(readableDomainError(reason)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [supabase]);

  return { data, loading, error };
}
