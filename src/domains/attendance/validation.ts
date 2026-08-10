import type { AttendanceMark } from "@/domains/attendance/types";

export function validateAttendanceMark(mark: AttendanceMark) {
  if (mark.status === "late" && (!Number.isInteger(mark.minutes_late) || mark.minutes_late < 1))
    return "Vul bij te laat minimaal één minuut in.";
  if (mark.minutes_late > 300) return "Het aantal minuten te laat is onwaarschijnlijk hoog.";
  if (mark.note.trim().length > 500) return "De toelichting mag maximaal 500 tekens bevatten.";
  return null;
}
