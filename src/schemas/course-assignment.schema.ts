
// ==================== SCHEMAS ====================
// schemas/course-assignment.schema.ts

import { z } from 'zod';

// Esquema para crear asignación
export const courseAssignmentSchema = z.object({
  sectionId: z.number().int().positive("El ID de sección debe ser positivo"),
  courseId: z.number().int().positive("El ID de curso debe ser positivo"),
  teacherId: z.number().int().positive("El ID de maestro debe ser positivo"),
  assignmentType: z.enum(['titular', 'specialist']).default('titular'),
  isActive: z.boolean().default(true),
});

// Esquema para actualizar asignación
export const updateCourseAssignmentSchema = z.object({
  teacherId: z.number().int().positive().optional(),
  assignmentType: z.enum(['titular', 'specialist']).optional(),
  isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Al menos un campo debe ser proporcionado para actualizar',
});

// Esquema para actualización masiva
export const bulkUpdateSchema = z.object({
  gradeId: z.number().int().positive("El ID de grado debe ser positivo"),
  assignments: z.array(z.object({
    sectionId: z.number().int().positive(),
    courseId: z.number().int().positive(),
    teacherId: z.number().int().positive(),
  })).min(1, "Debe proporcionar al menos una asignación"),
});

// Esquema para filtros
export const courseAssignmentFiltersSchema = z.object({
  sectionId: z.number().int().positive().optional(),
  teacherId: z.number().int().positive().optional(),
  courseId: z.number().int().positive().optional(),
  assignmentType: z.enum(['titular', 'specialist']).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  orderBy: z.enum(['course', 'teacher', 'section', 'assignmentType', 'createdAt']).optional(),
  orderDirection: z.enum(['asc', 'desc']).optional(),
});

// Tipos inferidos
export type CourseAssignmentFormValues = z.infer<typeof courseAssignmentSchema>;
export type UpdateCourseAssignmentFormValues = z.infer<typeof updateCourseAssignmentSchema>;
export type BulkUpdateFormValues = z.infer<typeof bulkUpdateSchema>;
export type CourseAssignmentFiltersFormValues = z.infer<typeof courseAssignmentFiltersSchema>;

// Valores por defecto
export const defaultValues: CourseAssignmentFormValues = {
  sectionId: 0,
  courseId: 0,
  teacherId: 0,
  assignmentType: 'titular',
  isActive: true,
};

export const defaultUpdateValues: UpdateCourseAssignmentFormValues = {};

export const defaultFilters: CourseAssignmentFiltersFormValues = {
  page: 1,
  limit: 20,
  orderBy: 'course',
  orderDirection: 'asc',
  isActive: true,
};

