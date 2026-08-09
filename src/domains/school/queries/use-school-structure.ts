import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SchoolStructure } from "@/domains/school/types";
import { getSchoolStructure } from "@/domains/school/services/school-service";
import { readableDomainError } from "@/domains/shared/domain-error";

export function useSchoolStructure(supabase: SupabaseClient, schoolId: string | null) {
  const [data, setData] = useState<SchoolStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    if (!schoolId) {
      setLoading(false);
      setError("Er is geen school aan dit account gekoppeld.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(await getSchoolStructure(supabase, schoolId));
    } catch (reason) {
      setError(readableDomainError(reason));
    } finally {
      setLoading(false);
    }
  }, [schoolId, supabase]);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}
