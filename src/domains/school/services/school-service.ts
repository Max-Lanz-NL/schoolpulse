import type { SupabaseClient } from "@supabase/supabase-js";
import { DomainError, toDomainError } from "@/domains/shared/domain-error";
import type {
  EducationProgramme,
  Room,
  School,
  SchoolClass,
  SchoolLocation,
  SchoolPeriod,
  SchoolStructure,
  SchoolYear,
  Subject,
  TeachingGroup,
} from "@/domains/school/types";

export async function getSchoolStructure(
  supabase: SupabaseClient,
  schoolId: string,
): Promise<SchoolStructure> {
  if (!schoolId)
    throw new DomainError("VALIDATION", "Er is geen school aan dit account gekoppeld.");
  const [school, years, periods, locations, programmes, subjects, classes, groups, rooms] =
    await Promise.all([
      supabase.from("schools").select("id,name,address,contact_email").eq("id", schoolId).single(),
      supabase
        .from("school_years")
        .select("id,school_id,name,starts_on,ends_on,is_current,is_archived")
        .eq("school_id", schoolId)
        .order("starts_on", { ascending: false }),
      supabase
        .from("school_periods")
        .select("id,school_id,school_year_id,name,sequence,starts_on,ends_on")
        .eq("school_id", schoolId)
        .order("sequence"),
      supabase
        .from("school_locations")
        .select("id,school_id,name,code,address,postal_code,city,is_main,is_active")
        .eq("school_id", schoolId)
        .order("name"),
      supabase
        .from("education_programmes")
        .select("id,school_id,name,code,sector,level,duration_years,is_active")
        .eq("school_id", schoolId)
        .order("name"),
      supabase
        .from("subjects")
        .select("id,school_id,name,code,color,is_active")
        .eq("school_id", schoolId)
        .order("name"),
      supabase
        .from("school_classes")
        .select(
          "id,school_id,school_year_id,programme_id,location_id,name,code,grade_level,capacity,is_active",
        )
        .eq("school_id", schoolId)
        .order("name"),
      supabase
        .from("teaching_groups")
        .select(
          "id,school_id,school_year_id,subject_id,base_class_id,location_id,name,code,group_type,capacity,is_active",
        )
        .eq("school_id", schoolId)
        .order("name"),
      supabase
        .from("rooms")
        .select("id,school_id,location_id,code,name,capacity,room_type,is_accessible,is_active")
        .eq("school_id", schoolId)
        .order("code"),
    ]);
  const failed = [
    school,
    years,
    periods,
    locations,
    programmes,
    subjects,
    classes,
    groups,
    rooms,
  ].find((result) => result.error);
  if (failed?.error)
    throw toDomainError(failed.error, "De schoolstructuur kon niet worden geladen.");
  const typedYears = (years.data ?? []) as SchoolYear[];
  return {
    school: school.data as School,
    currentYear: typedYears.find((year) => year.is_current) ?? null,
    years: typedYears,
    periods: (periods.data ?? []) as SchoolPeriod[],
    locations: (locations.data ?? []) as SchoolLocation[],
    programmes: (programmes.data ?? []) as EducationProgramme[],
    subjects: (subjects.data ?? []) as Subject[],
    classes: (classes.data ?? []) as SchoolClass[],
    groups: (groups.data ?? []) as TeachingGroup[],
    rooms: (rooms.data ?? []) as Room[],
  };
}

const schoolTables = {
  years: "school_years",
  periods: "school_periods",
  locations: "school_locations",
  programmes: "education_programmes",
  subjects: "subjects",
  classes: "school_classes",
  groups: "teaching_groups",
  rooms: "rooms",
} as const;
export type SchoolResource = keyof typeof schoolTables;
export async function createSchoolResource(
  supabase: SupabaseClient,
  resource: SchoolResource,
  schoolId: string,
  values: Record<string, unknown>,
) {
  const { error } = await supabase
    .from(schoolTables[resource])
    .insert({ ...values, school_id: schoolId });
  if (error) throw toDomainError(error);
}
export async function updateSchoolResource(
  supabase: SupabaseClient,
  resource: SchoolResource,
  id: string,
  values: Record<string, unknown>,
) {
  const { error } = await supabase.from(schoolTables[resource]).update(values).eq("id", id);
  if (error) throw toDomainError(error);
}
export async function deleteSchoolResource(
  supabase: SupabaseClient,
  resource: SchoolResource,
  id: string,
) {
  const { error } = await supabase.from(schoolTables[resource]).delete().eq("id", id);
  if (error) throw toDomainError(error);
}
