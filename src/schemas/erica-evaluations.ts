// schemas/erica-evaluations.ts
import { z } from 'zod';

// Base validation schemas
export const ericaScaleCodeSchema = z.enum(['E', 'B', 'P', 'C', 'N'], {
  errorMap: () => ({ message: "La escala debe ser E, B, P, C o N" })
});

export const positiveIntSchema = z.number().int().positive("Debe ser un número entero positivo");

export const optionalPositiveIntSchema = z.number().int().positive("Debe ser un número entero positivo").optional();

export const pointsSchema = z.number()
  .min(0, "Los puntos no pueden ser negativos")
  .max(1, "Los puntos no pueden ser mayor a 1");

export const notesSchema = z.string()
  .max(500, "Las notas no pueden exceder 500 caracteres")
  .optional()
  .nullable();

// Create evaluation schema
export const createEricaEvaluationSchema = z.object({
  enrollmentId: positiveIntSchema.refine((val) => val > 0, {
    message: "El ID de matrícula debe ser un número positivo"
  }),
  courseId: positiveIntSchema.refine((val) => val > 0, {
    message: "El ID del curso debe ser un número positivo"
  }),
  bimesterId: positiveIntSchema.refine((val) => val > 0, {
    message: "El ID del bimestre debe ser un número positivo"
  }),
  academicWeekId: positiveIntSchema.refine((val) => val > 0, {
    message: "El ID de la semana académica debe ser un número positivo"
  }),
  topicId: positiveIntSchema.refine((val) => val > 0, {
    message: "El ID del tema debe ser un número positivo"
  }),
  teacherId: positiveIntSchema.refine((val) => val > 0, {
    message: "El ID del maestro debe ser un número positivo"
  }),
  categoryId: positiveIntSchema.refine((val) => val > 0, {
    message: "El ID de la categoría debe ser un número positivo"
  }),
  scaleId: positiveIntSchema.refine((val) => val > 0, {
    message: "El ID de la escala debe ser un número positivo"
  }),
  points: pointsSchema,
  notes: notesSchema,
  evaluatedAt: z.date().optional()
});

// Update evaluation schema (all fields optional)
export const updateEricaEvaluationSchema = z.object({
  scaleId: optionalPositiveIntSchema,
  points: pointsSchema.optional(),
  notes: notesSchema,
  evaluatedAt: z.date().optional()
});

// Grid evaluation item schema
export const gridEvaluationItemSchema = z.object({
  enrollmentId: positiveIntSchema.refine((val) => val > 0, {
    message: "El ID de matrícula debe ser un número positivo"
  }),
  categoryId: positiveIntSchema.refine((val) => val > 0, {
    message: "El ID de categoría debe ser un número positivo"
  }),
  scaleCode: ericaScaleCodeSchema,
  notes: z.string()
    .max(500, "Las notas no pueden exceder 500 caracteres")
    .optional()
});

// Save grid schema
export const saveGridSchema = z.object({
  topicId: positiveIntSchema.refine((val) => val > 0, {
    message: "El ID del tema debe ser un número positivo"
  }),
  teacherId: positiveIntSchema.refine((val) => val > 0, {
    message: "El ID del maestro debe ser un número positivo"
  }),
  evaluations: z.array(gridEvaluationItemSchema)
    .min(1, "Debe incluir al menos una evaluación")
    .max(200, "No se pueden procesar más de 200 evaluaciones a la vez")
});

// Bulk create evaluations schema
export const bulkCreateEvaluationsSchema = z.object({
  evaluations: z.array(createEricaEvaluationSchema)
    .min(1, "Debe incluir al menos una evaluación")
    .max(100, "No se pueden crear más de 100 evaluaciones a la vez")
});

// Evaluation filters schema
export const evaluationFiltersSchema = z.object({
  enrollmentId: optionalPositiveIntSchema,
  studentId: optionalPositiveIntSchema,
  courseId: optionalPositiveIntSchema,
  topicId: optionalPositiveIntSchema,
  bimesterId: optionalPositiveIntSchema,
  academicWeekId: optionalPositiveIntSchema,
  sectionId: optionalPositiveIntSchema,
  teacherId: optionalPositiveIntSchema,
  categoryId: optionalPositiveIntSchema,
  dateFrom: z.date()
    .optional()
    .refine((date) => !date || date <= new Date(), {
      message: "La fecha 'desde' no puede ser futura"
    }),
  dateTo: z.date()
    .optional()
    .refine((date) => !date || date <= new Date(), {
      message: "La fecha 'hasta' no puede ser futura"
    }),
  minPoints: z.number()
    .min(0, "Los puntos mínimos no pueden ser negativos")
    .max(1, "Los puntos mínimos no pueden ser mayor a 1")
    .optional(),
  maxPoints: z.number()
    .min(0, "Los puntos máximos no pueden ser negativos")
    .max(1, "Los puntos máximos no pueden ser mayor a 1")
    .optional(),
  page: z.number()
    .int()
    .positive("La página debe ser un número positivo")
    .default(1)
    .optional(),
  limit: z.number()
    .int()
    .positive("El límite debe ser un número positivo")
    .max(100, "El límite no puede ser mayor a 100")
    .default(20)
    .optional(),
  orderBy: z.enum(['evaluatedAt', 'points', 'student', 'category'], {
    errorMap: () => ({ 
      message: "El orden debe ser por: evaluatedAt, points, student o category" 
    })
  }).default('evaluatedAt').optional(),
  orderDirection: z.enum(['asc', 'desc'], {
    errorMap: () => ({ 
      message: "La dirección debe ser 'asc' o 'desc'" 
    })
  }).default('desc').optional()
})
.refine((data) => {
  if (data.dateFrom && data.dateTo) {
    return data.dateFrom <= data.dateTo;
  }
  return true;
}, {
  message: "La fecha 'desde' debe ser anterior o igual a la fecha 'hasta'",
  path: ["dateFrom"]
})
.refine((data) => {
  if (data.minPoints !== undefined && data.maxPoints !== undefined) {
    return data.minPoints <= data.maxPoints;
  }
  return true;
}, {
  message: "Los puntos mínimos deben ser menores o iguales a los puntos máximos",
  path: ["minPoints"]
});

// Get grid schema
export const getGridSchema = z.object({
  topicId: positiveIntSchema.refine((val) => val > 0, {
    message: "El ID del tema debe ser un número positivo"
  }),
  includeEmpty: z.boolean().default(false).optional()
});

// Validation schema
export const validateEvaluationDataSchema = z.object({
  enrollmentId: positiveIntSchema.refine((val) => val > 0, {
    message: "El ID de matrícula debe ser un número positivo"
  }),
  topicId: positiveIntSchema.refine((val) => val > 0, {
    message: "El ID del tema debe ser un número positivo"
  }),
  categoryId: positiveIntSchema.refine((val) => val > 0, {
    message: "El ID de categoría debe ser un número positivo"
  }),
  teacherId: positiveIntSchema.refine((val) => val > 0, {
    message: "El ID del maestro debe ser un número positivo"
  })
});

// Teacher analytics filters schema
export const teacherAnalyticsFiltersSchema = z.object({
  bimesterId: optionalPositiveIntSchema,
  courseId: optionalPositiveIntSchema
});

// Search and pagination schemas
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1).optional(),
  limit: z.number().int().positive().max(100).default(20).optional()
});

export const searchSchema = z.object({
  search: z.string().min(2, "La búsqueda debe tener al menos 2 caracteres").optional(),
  searchFields: z.array(z.enum(['student', 'topic', 'category', 'notes']))
    .default(['student', 'topic'])
    .optional()
});

// Date range schema (reusable)
export const dateRangeSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional()
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.startDate <= data.endDate;
  }
  return true;
}, {
  message: "La fecha de inicio debe ser anterior o igual a la fecha final",
  path: ["startDate"]
});

// Complex filters schema (combining multiple filter types)
export const complexFiltersSchema = evaluationFiltersSchema
  .merge(searchSchema)
  .merge(paginationSchema);

// Inferred types from schemas
export type CreateEricaEvaluationDto = z.infer<typeof createEricaEvaluationSchema>;
export type UpdateEricaEvaluationDto = z.infer<typeof updateEricaEvaluationSchema>;
export type GridEvaluationItemDto = z.infer<typeof gridEvaluationItemSchema>;
export type SaveGridDto = z.infer<typeof saveGridSchema>;
export type BulkCreateEvaluationsDto = z.infer<typeof bulkCreateEvaluationsSchema>;
export type EvaluationFiltersDto = z.infer<typeof evaluationFiltersSchema>;
export type GetGridDto = z.infer<typeof getGridSchema>;
export type ValidateEvaluationDataDto = z.infer<typeof validateEvaluationDataSchema>;
export type TeacherAnalyticsFiltersDto = z.infer<typeof teacherAnalyticsFiltersSchema>;
export type PaginationDto = z.infer<typeof paginationSchema>;
export type SearchDto = z.infer<typeof searchSchema>;
export type DateRangeDto = z.infer<typeof dateRangeSchema>;
export type ComplexFiltersDto = z.infer<typeof complexFiltersSchema>;

// Default values for forms
export const defaultEvaluationValues: CreateEricaEvaluationDto = {
  enrollmentId: 0,
  courseId: 0,
  bimesterId: 0,
  academicWeekId: 0,
  topicId: 0,
  teacherId: 0,
  categoryId: 0,
  scaleId: 0,
  points: 0,
  notes: null
};

export const defaultUpdateEvaluationValues: UpdateEricaEvaluationDto = {};

export const defaultGridItemValues: GridEvaluationItemDto = {
  enrollmentId: 0,
  categoryId: 0,
  scaleCode: 'N',
  notes: undefined
};

export const defaultSaveGridValues: SaveGridDto = {
  topicId: 0,
  teacherId: 0,
  evaluations: []
};

export const defaultEvaluationFilters: EvaluationFiltersDto = {
  page: 1,
  limit: 20,
  orderBy: 'evaluatedAt',
  orderDirection: 'desc'
};

export const defaultGetGridValues: GetGridDto = {
  topicId: 0,
  includeEmpty: false
};

export const defaultPaginationValues: PaginationDto = {
  page: 1,
  limit: 20
};

export const defaultSearchValues: SearchDto = {
  searchFields: ['student', 'topic']
};

// Validation helpers
export const isValidEricaScale = (scale: string): scale is 'E' | 'B' | 'P' | 'C' | 'N' => {
  return ['E', 'B', 'P', 'C', 'N'].includes(scale);
};

export const isValidPoints = (points: number): boolean => {
  return points >= 0 && points <= 1;
};

export const isValidDateRange = (startDate?: Date, endDate?: Date): boolean => {
  if (!startDate || !endDate) return true;
  return startDate <= endDate;
};