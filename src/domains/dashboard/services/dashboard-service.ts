import type { SupabaseClient } from "@supabase/supabase-js";
import { getAttendanceRecords } from "@/domains/attendance/services/attendance-service";
import { getLearning } from "@/domains/learning/services/learning-service";
import { getResults } from "@/domains/results/services/results-service";
import { getTimetableWeek } from "@/domains/timetable/services/timetable-service";
import type { DashboardData } from "../types";

export async function getDashboard(
  supabase: SupabaseClient,
  now = new Date(),
): Promise<DashboardData> {
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  const attendanceStart = new Date(dayStart);
  attendanceStart.setDate(attendanceStart.getDate() - 30);

  const [lessons, attendance, results, learning] = await Promise.all([
    getTimetableWeek(supabase, dayStart),
    getAttendanceRecords(supabase, attendanceStart, dayEnd),
    getResults(supabase),
    getLearning(supabase),
  ]);

  return {
    lessons: lessons.filter((lesson) => new Date(lesson.starts_at) < dayEnd),
    attendance,
    grades: results.grades,
    assignments: learning.assignments,
    submissions: learning.submissions,
  };
}
