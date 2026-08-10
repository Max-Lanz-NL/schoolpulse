import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AbsenceRequest, AttendanceRecord } from "@/domains/attendance/types";
import {
  getAbsenceRequests,
  getAttendanceRecords,
} from "@/domains/attendance/services/attendance-service";
import { readableDomainError } from "@/domains/shared/domain-error";

export function useAttendance(supabase: SupabaseClient, from: Date, until: Date) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [absences, setAbsences] = useState<AbsenceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fromKey = from.toISOString();
  const untilKey = until.toISOString();
  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextRecords, nextAbsences] = await Promise.all([
        getAttendanceRecords(supabase, new Date(fromKey), new Date(untilKey)),
        getAbsenceRequests(supabase),
      ]);
      setRecords(nextRecords);
      setAbsences(nextAbsences);
    } catch (reason) {
      setError(readableDomainError(reason));
    } finally {
      setLoading(false);
    }
  }, [fromKey, supabase, untilKey]);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { records, absences, loading, error, reload };
}
