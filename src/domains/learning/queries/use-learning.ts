import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { readableDomainError } from "@/domains/shared/domain-error";
import { getLearning } from "../services/learning-service";
import type { Assignment, Submission } from "../types";
export function useLearning(supabase: SupabaseClient) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getLearning(supabase);
      setAssignments(r.assignments);
      setSubmissions(r.submissions);
      setError(null);
    } catch (e) {
      setError(readableDomainError(e));
    } finally {
      setLoading(false);
    }
  }, [supabase]);
  useEffect(() => void reload(), [reload]);
  return { assignments, submissions, loading, error, reload };
}
