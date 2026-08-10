import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { readableDomainError } from "@/domains/shared/domain-error";
import { getResults } from "../services/results-service";
import type { Assessment, Grade } from "../types";

export function useResults(supabase: SupabaseClient) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getResults(supabase);
      setAssessments(result.assessments);
      setGrades(result.grades);
      setError(null);
    } catch (reason) {
      setError(readableDomainError(reason));
    } finally {
      setLoading(false);
    }
  }, [supabase]);
  useEffect(() => void reload(), [reload]);
  return { assessments, grades, loading, error, reload };
}
