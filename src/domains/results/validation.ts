import type { GradeDraft } from "./types";

export function validateAssessment(values: {
  title: string;
  groupId: string;
  subjectId: string;
  weight: string;
  maximumScore: string;
}) {
  if (!values.title.trim()) return "Vul een toetsnaam in.";
  if (!values.groupId) return "Kies een lesgroep.";
  if (!values.subjectId) return "Kies een vak.";
  const weight = Number(values.weight);
  if (!Number.isFinite(weight) || weight <= 0) return "Weging moet groter zijn dan nul.";
  if (values.maximumScore) {
    const maximum = Number(values.maximumScore);
    if (!Number.isFinite(maximum) || maximum <= 0) return "Maximumscore moet groter zijn dan nul.";
  }
  return null;
}

export function validateGrade(draft: GradeDraft) {
  if (draft.is_excused || draft.grade === "") return null;
  const grade = Number(draft.grade);
  if (!Number.isFinite(grade) || grade < 0 || grade > 10)
    return "Cijfers moeten tussen 0 en 10 liggen.";
  return null;
}
