import type { TimetableDraft } from "@/domains/timetable/types";

export function validateTimetableDraft(value: TimetableDraft) {
  if (!value.school_year_id || !value.teaching_group_id || !value.subject_id)
    return "Kies een schooljaar, lesgroep en vak.";
  if (!value.teacher_profile_id) return "Kies een docent.";
  if (!value.starts_at || !value.ends_at) return "Vul een begin- en eindtijd in.";
  if (new Date(value.ends_at) <= new Date(value.starts_at))
    return "De eindtijd moet na de begintijd liggen.";
  if (value.note.trim().length > 500) return "De toelichting mag maximaal 500 tekens bevatten.";
  return null;
}

export function mondayOf(date: Date) {
  const value = new Date(date);
  const day = value.getDay() || 7;
  value.setDate(value.getDate() - day + 1);
  value.setHours(0, 0, 0, 0);
  return value;
}
