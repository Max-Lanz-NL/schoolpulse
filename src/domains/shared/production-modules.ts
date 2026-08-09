export type SchoolPulseDomain =
  | "identity"
  | "school"
  | "people"
  | "timetable"
  | "attendance"
  | "results"
  | "learning"
  | "dashboard"
  | "transition";

export type ProductionModule = {
  path: string;
  entity: string;
  permission: string;
  label: string;
  icon: "dashboard" | "calendar" | "results" | "learning" | "attendance" | "people" | "settings";
  domain: SchoolPulseDomain;
  navigation: "primary" | "management" | "hidden";
};

export const productionModules: ProductionModule[] = [
  {
    path: "/app",
    entity: "dashboard",
    permission: "dashboard.view",
    label: "Dashboard",
    icon: "dashboard",
    domain: "dashboard",
    navigation: "primary",
  },
  {
    path: "/app/rooster",
    entity: "schedule",
    permission: "schedule.view",
    label: "Rooster",
    icon: "calendar",
    domain: "timetable",
    navigation: "primary",
  },
  {
    path: "/app/cijfers",
    entity: "grade",
    permission: "grades.view",
    label: "Cijfers",
    icon: "results",
    domain: "results",
    navigation: "primary",
  },
  {
    path: "/app/opdrachten",
    entity: "assignment",
    permission: "assignments.view",
    label: "Huiswerk & opdrachten",
    icon: "learning",
    domain: "learning",
    navigation: "primary",
  },
  {
    path: "/app/aanwezigheid",
    entity: "attendance",
    permission: "attendance.view",
    label: "Aanwezigheid",
    icon: "attendance",
    domain: "attendance",
    navigation: "primary",
  },
  {
    path: "/app/leerlingen",
    entity: "student",
    permission: "students.view",
    label: "Leerlingen",
    icon: "people",
    domain: "people",
    navigation: "management",
  },
  {
    path: "/app/schoolstructuur",
    entity: "school_structure",
    permission: "school_settings.view",
    label: "Schoolstructuur",
    icon: "settings",
    domain: "school",
    navigation: "management",
  },
  {
    path: "/app/personeel",
    entity: "staff",
    permission: "staff.view",
    label: "Personeel",
    icon: "people",
    domain: "people",
    navigation: "management",
  },
  {
    path: "/app/gebruikersbeheer",
    entity: "user_management",
    permission: "user_management.view",
    label: "Gebruikers & rechten",
    icon: "settings",
    domain: "identity",
    navigation: "management",
  },

  // Transitionele routes blijven werken, maar horen niet bij de primaire SchoolPulse 1.0-navigatie.
  {
    path: "/app/berichten",
    entity: "message",
    permission: "messages.view",
    label: "Berichten",
    icon: "learning",
    domain: "transition",
    navigation: "hidden",
  },
  {
    path: "/app/documenten",
    entity: "document",
    permission: "documents.view",
    label: "Documenten",
    icon: "learning",
    domain: "learning",
    navigation: "hidden",
  },
  {
    path: "/app/activiteiten",
    entity: "activity",
    permission: "activities.view",
    label: "Activiteiten",
    icon: "calendar",
    domain: "transition",
    navigation: "hidden",
  },
  {
    path: "/app/ouderkoppelingen",
    entity: "parent_link",
    permission: "parents.view",
    label: "Ouder-kindkoppelingen",
    icon: "people",
    domain: "people",
    navigation: "hidden",
  },
  {
    path: "/app/huiswerk",
    entity: "homework",
    permission: "homework.view",
    label: "Huiswerk",
    icon: "learning",
    domain: "learning",
    navigation: "hidden",
  },
  {
    path: "/app/studieplanner",
    entity: "study_planner",
    permission: "study_planner.view",
    label: "Studieplanner",
    icon: "calendar",
    domain: "transition",
    navigation: "hidden",
  },
  {
    path: "/app/agenda",
    entity: "agenda",
    permission: "agenda.view",
    label: "Agenda",
    icon: "calendar",
    domain: "transition",
    navigation: "hidden",
  },
  {
    path: "/app/absentie",
    entity: "absence",
    permission: "absences.view",
    label: "Absentie",
    icon: "attendance",
    domain: "attendance",
    navigation: "hidden",
  },
  {
    path: "/app/gesprekken",
    entity: "conversation",
    permission: "conversations.view",
    label: "Gesprekken",
    icon: "learning",
    domain: "transition",
    navigation: "hidden",
  },
  {
    path: "/app/toestemming",
    entity: "consent",
    permission: "consent.view",
    label: "Toestemming",
    icon: "attendance",
    domain: "transition",
    navigation: "hidden",
  },
  {
    path: "/app/toetsen",
    entity: "test",
    permission: "tests.view",
    label: "Toetsen",
    icon: "results",
    domain: "results",
    navigation: "hidden",
  },
  {
    path: "/app/vervanging",
    entity: "substitution",
    permission: "substitutions.view",
    label: "Vervanging",
    icon: "calendar",
    domain: "timetable",
    navigation: "hidden",
  },
  {
    path: "/app/rapporten",
    entity: "report",
    permission: "reports.view",
    label: "Rapporten",
    icon: "results",
    domain: "transition",
    navigation: "hidden",
  },
  {
    path: "/app/notificaties",
    entity: "notification",
    permission: "notifications.view",
    label: "Notificaties",
    icon: "attendance",
    domain: "transition",
    navigation: "hidden",
  },
  {
    path: "/app/begeleiding",
    entity: "care",
    permission: "care.view",
    label: "Begeleiding",
    icon: "people",
    domain: "transition",
    navigation: "hidden",
  },
  {
    path: "/app/integraties",
    entity: "integration",
    permission: "integrations.view",
    label: "Integraties",
    icon: "settings",
    domain: "transition",
    navigation: "hidden",
  },
  {
    path: "/app/betalingen",
    entity: "payment",
    permission: "payments.view",
    label: "Betalingen",
    icon: "settings",
    domain: "transition",
    navigation: "hidden",
  },
  {
    path: "/app/import",
    entity: "data_import",
    permission: "data_import.view",
    label: "Gegevens importeren",
    icon: "settings",
    domain: "transition",
    navigation: "hidden",
  },
  {
    path: "/app/avg",
    entity: "privacy",
    permission: "privacy.view",
    label: "AVG & privacy",
    icon: "settings",
    domain: "transition",
    navigation: "hidden",
  },
  {
    path: "/app/rechten-aanvragen",
    entity: "permission_requests",
    permission: "permission_requests.create",
    label: "Rechten aanvragen",
    icon: "settings",
    domain: "identity",
    navigation: "hidden",
  },
];

export function moduleForPath(pathname: string) {
  return productionModules.find((module) => module.path === pathname) ?? productionModules[0];
}
