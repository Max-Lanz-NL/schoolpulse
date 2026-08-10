import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { readableDomainError } from "@/domains/shared/domain-error";
import { getTimetableWeek } from "@/domains/timetable/services/timetable-service";
import type { TimetableEntry } from "@/domains/timetable/types";

export function useTimetableWeek(supabase: SupabaseClient, weekStart: Date) {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const weekKey = weekStart.toISOString();
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEntries(await getTimetableWeek(supabase, new Date(weekKey)));
    } catch (reason) {
      setError(readableDomainError(reason));
    } finally {
      setLoading(false);
    }
  }, [supabase, weekKey]);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { entries, loading, error, reload };
}
