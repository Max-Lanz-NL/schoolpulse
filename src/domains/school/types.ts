export type School = {
  id: string;
  name: string;
  address: string | null;
  contact_email: string | null;
};
export type SchoolYear = {
  id: string;
  school_id: string;
  name: string;
  starts_on: string;
  ends_on: string;
  is_current: boolean;
  is_archived: boolean;
};
export type SchoolPeriod = {
  id: string;
  school_id: string;
  school_year_id: string;
  name: string;
  sequence: number;
  starts_on: string;
  ends_on: string;
};
export type SchoolLocation = {
  id: string;
  school_id: string;
  name: string;
  code: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  is_main: boolean;
  is_active: boolean;
};
export type EducationProgramme = {
  id: string;
  school_id: string;
  name: string;
  code: string | null;
  sector: "po" | "vo" | "vso" | "mbo" | "other";
  level: string | null;
  duration_years: number | null;
  is_active: boolean;
};
export type Subject = {
  id: string;
  school_id: string;
  name: string;
  code: string;
  color: string;
  is_active: boolean;
};
export type SchoolClass = {
  id: string;
  school_id: string;
  school_year_id: string;
  programme_id: string | null;
  location_id: string | null;
  name: string;
  code: string | null;
  grade_level: number | null;
  capacity: number | null;
  is_active: boolean;
};
export type TeachingGroup = {
  id: string;
  school_id: string;
  school_year_id: string;
  subject_id: string | null;
  base_class_id: string | null;
  location_id: string | null;
  name: string;
  code: string | null;
  group_type: "lesson" | "mentor" | "project" | "support" | "other";
  capacity: number | null;
  is_active: boolean;
};
export type Room = {
  id: string;
  school_id: string;
  location_id: string | null;
  code: string;
  name: string | null;
  capacity: number | null;
  room_type: string;
  is_accessible: boolean;
  is_active: boolean;
};
export type SchoolStructure = {
  school: School;
  currentYear: SchoolYear | null;
  years: SchoolYear[];
  periods: SchoolPeriod[];
  locations: SchoolLocation[];
  programmes: EducationProgramme[];
  subjects: Subject[];
  classes: SchoolClass[];
  groups: TeachingGroup[];
  rooms: Room[];
};
