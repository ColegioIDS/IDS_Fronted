import { z } from 'zod';

export const courseGradeSchema = z.object({
  courseId: z.number().min(1, "Se requiere un curso"),
  gradeId: z.number().min(1, "Se requiere un grado"),
  isCore: z.boolean()
});

// Define el tipo explícitamente
export type CourseGradeFormData = z.infer<typeof courseGradeSchema>;

export const defaultValues: CourseGradeFormData = {
  courseId: 0,
  gradeId: 0,
  isCore: true, // Valor por defecto explícito
};