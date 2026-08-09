import { z } from "zod";

const optionalDate = z.string().date().nullable().optional();
export const studentRecordInput = z.object({
  profile_id: z.string().uuid(),
  student_number: z.string().trim().min(1).max(40),
  preferred_name: z.string().trim().max(100).nullable().optional(),
  date_of_birth: optionalDate,
  start_date: optionalDate,
  end_date: optionalDate,
  status: z.enum(["planned", "active", "graduated", "withdrawn"]).default("active"),
});
export const staffRecordInput = z.object({
  profile_id: z.string().uuid(),
  employee_number: z.string().trim().max(40).nullable().optional(),
  job_title: z.string().trim().max(100).nullable().optional(),
  department: z.string().trim().max(100).nullable().optional(),
  start_date: optionalDate,
  end_date: optionalDate,
  is_active: z.boolean().default(true),
});
export const enrolmentInput = z.object({
  student_profile_id: z.string().uuid(),
  school_year_id: z.string().uuid(),
  class_id: z.string().uuid().nullable().optional(),
  programme_id: z.string().uuid().nullable().optional(),
  starts_on: optionalDate,
  ends_on: optionalDate,
  status: z.enum(["planned", "active", "completed", "withdrawn"]).default("active"),
});
