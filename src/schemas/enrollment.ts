// src/schemas/enrollment.ts
import { z } from 'zod';
import { EnrollmentStatus } from '@/types/enrollment.types';

// ==================== ENROLLMENT SCHEMA ====================
export const enrollmentSchema = z.object({
  studentId: z.number({
    required_error: "El estudiante es requerido",
    invalid_type_error: "El estudiante debe ser un número válido"
  })
    .int("El ID del estudiante debe ser un número entero")
    .positive("El ID del estudiante debe ser positivo"),

  cycleId: z.number({
    required_error: "El ciclo escolar es requerido",
    invalid_type_error: "El ciclo escolar debe ser un número válido"
  })
    .int("El ID del ciclo debe ser un número entero")
    .positive("El ID del ciclo debe ser positivo"),

  gradeId: z.number({
    required_error: "El grado es requerido",
    invalid_type_error: "El grado debe ser un número válido"
  })
    .int("El ID del grado debe ser un número entero")
    .positive("El ID del grado debe ser positivo"),

  sectionId: z.number({
    required_error: "La sección es requerida",
    invalid_type_error: "La sección debe ser un número válido"
  })
    .int("El ID de la sección debe ser un número entero")
    .positive("El ID de la sección debe ser positivo"),

  status: z.nativeEnum(EnrollmentStatus, {
    required_error: "El estado es requerido",
    invalid_type_error: "Estado inválido"
  })
});

// ==================== UPDATE SCHEMA ====================
export const updateEnrollmentSchema = z.object({
  studentId: z.number()
    .int("El ID del estudiante debe ser un número entero")
    .positive("El ID del estudiante debe ser positivo")
    .optional(),

  cycleId: z.number()
    .int("El ID del ciclo debe ser un número entero")
    .positive("El ID del ciclo debe ser positivo")
    .optional(),

  gradeId: z.number()
    .int("El ID del grado debe ser un número entero")
    .positive("El ID del grado debe ser positivo")
    .optional(),

  sectionId: z.number()
    .int("El ID de la sección debe ser un número entero")
    .positive("El ID de la sección debe ser positivo")
    .optional(),

  status: z.nativeEnum(EnrollmentStatus)
    .optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "Al menos un campo debe ser proporcionado para actualizar",
  }
);

// ==================== FILTER SCHEMA ====================
export const enrollmentFilterSchema = z.object({
  studentId: z.number()
    .int("El ID del estudiante debe ser un número entero")
    .positive("El ID del estudiante debe ser positivo")
    .optional(),

  cycleId: z.number()
    .int("El ID del ciclo debe ser un número entero")
    .positive("El ID del ciclo debe ser positivo")
    .optional(),

  gradeId: z.number()
    .int("El ID del grado debe ser un número entero")
    .positive("El ID del grado debe ser positivo")
    .optional(),

  sectionId: z.number()
    .int("El ID de la sección debe ser un número entero")
    .positive("El ID de la sección debe ser positivo")
    .optional(),

  status: z.nativeEnum(EnrollmentStatus)
    .optional(),

  includeRelations: z.boolean()
    .optional()
    .default(true)
});

// ==================== BULK OPERATIONS SCHEMA ====================
export const bulkEnrollmentSchema = z.object({
  enrollmentIds: z.array(
    z.number()
      .int("Los IDs deben ser números enteros")
      .positive("Los IDs deben ser positivos")
  )
    .min(1, "Debe seleccionar al menos una matrícula")
    .max(100, "No se pueden procesar más de 100 matrículas a la vez"),

  action: z.enum(['graduate', 'transfer', 'reactivate', 'delete'], {
    required_error: "La acción es requerida",
    invalid_type_error: "Acción inválida"
  })
});

// ==================== QUERY PARAMS SCHEMA ====================
export const enrollmentQuerySchema = z.object({
  studentId: z.string()
    .regex(/^\d+$/, "Debe ser un número válido")
    .transform(val => parseInt(val))
    .optional(),

  cycleId: z.string()
    .regex(/^\d+$/, "Debe ser un número válido")
    .transform(val => parseInt(val))
    .optional(),

  gradeId: z.string()
    .regex(/^\d+$/, "Debe ser un número válido")
    .transform(val => parseInt(val))
    .optional(),

  sectionId: z.string()
    .regex(/^\d+$/, "Debe ser un número válido")
    .transform(val => parseInt(val))
    .optional(),

  status: z.string()
    .refine(val => Object.values(EnrollmentStatus).includes(val as EnrollmentStatus), {
      message: "Estado inválido"
    })
    .transform(val => val as EnrollmentStatus)
    .optional(),

  includeRelations: z.string()
    .transform(val => val === 'true')
    .optional(),

  page: z.string()
    .regex(/^\d+$/, "La página debe ser un número válido")
    .transform(val => parseInt(val))
    .refine(val => val > 0, "La página debe ser mayor a 0")
    .optional(),

  limit: z.string()
    .regex(/^\d+$/, "El límite debe ser un número válido")
    .transform(val => parseInt(val))
    .refine(val => val > 0 && val <= 100, "El límite debe estar entre 1 y 100")
    .optional()
});

// ==================== FORM VALIDATION SCHEMAS ====================

// Schema para formulario de creación con validaciones adicionales
export const enrollmentFormSchema = enrollmentSchema.superRefine(async (data, ctx) => {
  // Aquí podrías agregar validaciones custom como:
  // - Verificar que el estudiante no tenga ya una matrícula activa en el ciclo
  // - Validar que la sección tenga capacidad disponible
  // - Verificar que el grado y la sección sean compatibles
  
  // Ejemplo de validación custom (comentado para evitar errores sin API)
  /*
  try {
    const existingEnrollment = await checkExistingEnrollment(data.studentId, data.cycleId);
    if (existingEnrollment && existingEnrollment.status === 'ACTIVE') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El estudiante ya tiene una matrícula activa en este ciclo",
        path: ["studentId"]
      });
    }
  } catch (error) {
    // Manejar error de validación
  }
  */
});

// Schema para formulario de edición
export const enrollmentEditFormSchema = updateEnrollmentSchema;

// ==================== DEFAULT VALUES ====================
export const defaultEnrollmentValues = {
  studentId: 0,
  cycleId: 0,
  gradeId: 0,
  sectionId: 0,
  status: EnrollmentStatus.ACTIVE
} as const;

export const defaultEnrollmentFilterValues = {
  studentId: undefined,
  cycleId: undefined,
  gradeId: undefined,
  sectionId: undefined,
  status: undefined,
  includeRelations: true
} as const;

// ==================== TYPE EXPORTS ====================
export type EnrollmentFormData = z.infer<typeof enrollmentSchema>;
export type UpdateEnrollmentFormData = z.infer<typeof updateEnrollmentSchema>;
export type EnrollmentFilterFormData = z.infer<typeof enrollmentFilterSchema>;
export type BulkEnrollmentFormData = z.infer<typeof bulkEnrollmentSchema>;
export type EnrollmentQueryFormData = z.infer<typeof enrollmentQuerySchema>;

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Valida los datos de creación de matrícula
 */
export const validateEnrollmentData = (data: unknown) => {
  return enrollmentSchema.safeParse(data);
};

/**
 * Valida los datos de actualización de matrícula
 */
export const validateUpdateEnrollmentData = (data: unknown) => {
  return updateEnrollmentSchema.safeParse(data);
};

/**
 * Valida los filtros de matrícula
 */
export const validateEnrollmentFilters = (data: unknown) => {
  return enrollmentFilterSchema.safeParse(data);
};

/**
 * Valida los parámetros de query
 */
export const validateEnrollmentQuery = (data: unknown) => {
  return enrollmentQuerySchema.safeParse(data);
};

/**
 * Valida operaciones en lote
 */
export const validateBulkOperation = (data: unknown) => {
  return bulkEnrollmentSchema.safeParse(data);
};

// ==================== HELPER SCHEMAS ====================

// Schema para validar solo el ID de matrícula
export const enrollmentIdSchema = z.number()
  .int("El ID debe ser un número entero")
  .positive("El ID debe ser positivo");

// Schema para validar estado de matrícula
export const enrollmentStatusSchema = z.nativeEnum(EnrollmentStatus);

// Schema para validar múltiples IDs
export const enrollmentIdsSchema = z.array(enrollmentIdSchema)
  .min(1, "Debe proporcionar al menos un ID")
  .max(100, "No se pueden procesar más de 100 IDs a la vez");

// ==================== CUSTOM VALIDATIONS ====================

/**
 * Valida que un estudiante pueda ser matriculado en un ciclo específico
 */
export const validateStudentEnrollment = z.object({
  studentId: z.number().positive(),
  cycleId: z.number().positive(),
  currentEnrollmentId: z.number().positive().optional() // Para edición
});

/**
 * Valida compatibilidad entre grado y sección
 */
export const validateGradeSection = z.object({
  gradeId: z.number().positive(),
  sectionId: z.number().positive()
});

/**
 * Valida capacidad de sección
 */
export const validateSectionCapacity = z.object({
  sectionId: z.number().positive(),
  excludeEnrollmentId: z.number().positive().optional() // Para edición
});

// ==================== ERROR MESSAGES ====================
export const enrollmentErrorMessages = {
  studentRequired: "Debe seleccionar un estudiante",
  cycleRequired: "Debe seleccionar un ciclo escolar",
  gradeRequired: "Debe seleccionar un grado",
  sectionRequired: "Debe seleccionar una sección",
  statusRequired: "Debe seleccionar un estado",
  duplicateEnrollment: "El estudiante ya tiene una matrícula activa en este ciclo",
  sectionFull: "La sección ha alcanzado su capacidad máxima",
  incompatibleGradeSection: "El grado y la sección no son compatibles",
  invalidStatus: "Estado de matrícula inválido",
  cannotEdit: "No se puede editar una matrícula en este estado",
  cannotDelete: "No se puede eliminar una matrícula con registros asociados"
} as const;