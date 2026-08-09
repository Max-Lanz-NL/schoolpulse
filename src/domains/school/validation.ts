import { z } from "zod";

export const schoolYearInput = z
  .object({
    name: z.string().trim().min(2).max(40),
    starts_on: z.string().date(),
    ends_on: z.string().date(),
    is_current: z.boolean().default(false),
    is_archived: z.boolean().default(false),
  })
  .refine((value) => value.ends_on > value.starts_on, {
    message: "De einddatum moet na de startdatum liggen.",
  });
export const subjectInput = z.object({
  name: z.string().trim().min(2).max(100),
  code: z.string().trim().min(1).max(20),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#2563eb"),
  is_active: z.boolean().default(true),
});
export const namedStructureInput = z.object({
  name: z.string().trim().min(1).max(100),
  code: z.string().trim().max(30).nullable().optional(),
});
