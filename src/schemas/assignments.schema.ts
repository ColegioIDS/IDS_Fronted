/**
 * DTOs con validación para el módulo de Assignments
 */

import { z } from 'zod';

// ==================== SCHEMAS DE VALIDACIÓN ====================

export const createAssignmentSchema = z.object({
  title: z.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(255, 'El título no puede exceder 255 caracteres'),
  description: z.string()
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .optional(),
  courseId: z.number()
    .int('El ID del curso debe ser un número entero')
    .positive('El ID del curso debe ser mayor a 0'),
  bimesterId: z.number()
    .int('El ID del bimestre debe ser un número entero')
    .positive('El ID del bimestre debe ser mayor a 0'),
  dueDate: z.union([z.string().datetime(), z.date()])
    .transform(val => new Date(val))
    .refine(date => date > new Date(), 'La fecha de entrega debe ser futura'),
  maxScore: z.number()
    .positive('El puntaje máximo debe ser mayor a 0')
    .max(9999, 'El puntaje máximo no puede exceder 9999'),
});

export const updateAssignmentSchema = z.object({
  title: z.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(255, 'El título no puede exceder 255 caracteres')
    .optional(),
  description: z.string()
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .optional(),
  dueDate: z.union([z.string().datetime(), z.date()])
    .transform(val => new Date(val))
    .optional(),
  maxScore: z.number()
    .positive('El puntaje máximo debe ser mayor a 0')
    .max(9999, 'El puntaje máximo no puede exceder 9999')
    .optional(),
}).strict();

export const submitAssignmentSchema = z.object({
  attachmentUrl: z.string()
    .url('La URL del archivo no es válida')
    .optional(),
  notes: z.string()
    .max(1000, 'Las notas no pueden exceder 1000 caracteres')
    .optional(),
});

export const gradeSubmissionSchema = z.object({
  score: z.number()
    .min(0, 'El puntaje no puede ser negativo')
    .refine(score => score % 0.5 === 0 || score % 1 === 0, 'El puntaje debe ser válido'),
  feedback: z.string()
    .max(2000, 'El feedback no puede exceder 2000 caracteres')
    .optional(),
}).strict();

export const assignmentFiltersSchema = z.object({
  courseId: z.number().int().positive().optional(),
  bimesterId: z.number().int().positive().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

// ==================== TIPOS VALIDADOS ====================

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
export type SubmitAssignmentInput = z.infer<typeof submitAssignmentSchema>;
export type GradeSubmissionInput = z.infer<typeof gradeSubmissionSchema>;
export type AssignmentFiltersInput = z.infer<typeof assignmentFiltersSchema>;

// ==================== FUNCIONES DE VALIDACIÓN ====================

export function validateCreateAssignment(data: unknown): {
  success: boolean;
  data?: CreateAssignmentInput;
  errors?: Record<string, string[]>;
} {
  try {
    const validated = createAssignmentSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: ['Error de validación desconocido'] } };
  }
}

export function validateUpdateAssignment(data: unknown): {
  success: boolean;
  data?: UpdateAssignmentInput;
  errors?: Record<string, string[]>;
} {
  try {
    const validated = updateAssignmentSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: ['Error de validación desconocido'] } };
  }
}

export function validateSubmitAssignment(data: unknown): {
  success: boolean;
  data?: SubmitAssignmentInput;
  errors?: Record<string, string[]>;
} {
  try {
    const validated = submitAssignmentSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: ['Error de validación desconocido'] } };
  }
}

export function validateGradeSubmission(data: unknown): {
  success: boolean;
  data?: GradeSubmissionInput;
  errors?: Record<string, string[]>;
} {
  try {
    const validated = gradeSubmissionSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: ['Error de validación desconocido'] } };
  }
}

export function validateAssignmentFilters(data: unknown): {
  success: boolean;
  data?: AssignmentFiltersInput;
  errors?: Record<string, string[]>;
} {
  try {
    const validated = assignmentFiltersSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: ['Error de validación desconocido'] } };
  }
}
