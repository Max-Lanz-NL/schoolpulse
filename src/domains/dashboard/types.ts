import type { AttendanceRecord } from "@/domains/attendance/types";
import type { Assignment, Submission } from "@/domains/learning/types";
import type { Grade } from "@/domains/results/types";
import type { TimetableEntry } from "@/domains/timetable/types";

export type DashboardData = {
  lessons: TimetableEntry[];
  attendance: AttendanceRecord[];
  grades: Grade[];
  assignments: Assignment[];
  submissions: Submission[];
};
