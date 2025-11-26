import { z } from 'zod';

/**
 * School Cycle Schema
 */
export const SchoolCycleSchema = z.object({
  id: z.number(),
  name: z.string(),
  year: z.number(),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SchoolCycleValidated = z.infer<typeof SchoolCycleSchema>;

/**
 * Grade Schema
 */
export const GradeSchema = z.object({
  id: z.number(),
  name: z.string(),
  level: z.string(),
  totalSections: z.number(),
  isActive: z.boolean(),
});

export type GradeValidated = z.infer<typeof GradeSchema>;

/**
 * Section Schema
 */
export const SectionSchema = z.object({
  id: z.number(),
  name: z.string(),
  capacity: z.number(),
  totalStudents: z.number(),
  gradeId: z.number(),
  gradeName: z.string(),
  isActive: z.boolean(),
});

export type SectionValidated = z.infer<typeof SectionSchema>;

/**
 * Bimester Schema
 */
export const BimesterSchema = z.object({
  id: z.number(),
  name: z.string(),
  number: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean(),
  weeksCount: z.number(),
});

export type BimesterValidated = z.infer<typeof BimesterSchema>;

/**
 * Academic Week Schema
 */
export const AcademicWeekSchema = z.object({
  id: z.number(),
  number: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  weekType: z.string(),
  objectives: z.string(),
});

export type AcademicWeekValidated = z.infer<typeof AcademicWeekSchema>;

/**
 * Teacher Schema
 */
export const TeacherSchema = z.object({
  id: z.number(),
  givenNames: z.string(),
  lastNames: z.string(),
});

export type TeacherValidated = z.infer<typeof TeacherSchema>;

/**
 * Course Schema
 */
export const CourseSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  area: z.string(),
  color: z.string(),
  isActive: z.boolean(),
  teacher: TeacherSchema,
});

export type CourseValidated = z.infer<typeof CourseSchema>;

/**
 * API Response Schema
 */
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
  message: z.string().optional(),
});

/**
 * Paginated Response Schema
 */
export const PaginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.unknown()),
  total: z.number(),
  message: z.string().optional(),
});
