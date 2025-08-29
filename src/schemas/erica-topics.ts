// schemas/erica-topics.ts
import { z } from 'zod';

// ==================== SCHEMAS PRINCIPALES ====================

// Schema para crear tema
export const createEricaTopicSchema = z.object({
  courseId: z.number().int().positive("El curso es requerido"),
  academicWeekId: z.number().int().positive("La semana académica es requerida"),
  sectionId: z.number().int().positive("La sección es requerida"),
  teacherId: z.number().int().positive("El maestro es requerido"),
  title: z.string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(200, "El título no puede exceder 200 caracteres"),
  description: z.string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional(),
  objectives: z.string()
    .max(1000, "Los objetivos no pueden exceder 1000 caracteres")
    .optional(),
  materials: z.string()
    .max(500, "Los materiales no pueden exceder 500 caracteres")
    .optional(),
  isActive: z.boolean().optional().default(true),
});

// Schema para actualizar tema (todos los campos opcionales)
export const updateEricaTopicSchema = z.object({
  courseId: z.number().int().positive("El curso debe ser válido").optional(),
  academicWeekId: z.number().int().positive("La semana académica debe ser válida").optional(),
  sectionId: z.number().int().positive("La sección debe ser válida").optional(),
  teacherId: z.number().int().positive("El maestro debe ser válido").optional(),
  title: z.string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(200, "El título no puede exceder 200 caracteres")
    .optional(),
  description: z.string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional(),
  objectives: z.string()
    .max(1000, "Los objetivos no pueden exceder 1000 caracteres")
    .optional(),
  materials: z.string()
    .max(500, "Los materiales no pueden exceder 500 caracteres")
    .optional(),
  isActive: z.boolean().optional(),
  isCompleted: z.boolean().optional(),
});

// Schema para creación en lote
export const bulkCreateEricaTopicsSchema = z.object({
  topics: z.array(createEricaTopicSchema)
    .min(1, "Debe incluir al menos un tema")
    .max(50, "No se pueden crear más de 50 temas a la vez"),
});

// Schema para marcar como completado
export const markCompleteSchema = z.object({
  isCompleted: z.boolean(),
  notes: z.string()
    .max(1000, "Las notas no pueden exceder 1000 caracteres")
    .optional(),
});

// ==================== SCHEMAS DE FILTROS ====================

export const topicFiltersSchema = z.object({
  courseId: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  academicWeekId: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  sectionId: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  teacherId: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  bimesterId: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  gradeId: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  isActive: z.string()
    .transform(val => val === 'true')
    .pipe(z.boolean())
    .optional(),
  isCompleted: z.string()
    .transform(val => val === 'true')
    .pipe(z.boolean())
    .optional(),
  search: z.string().min(1).optional(),
  dateFrom: z.string().datetime().transform(val => new Date(val)).optional(),
  dateTo: z.string().datetime().transform(val => new Date(val)).optional(),
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default("1"),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default("20"),
  orderBy: z.enum(['title', 'academicWeek', 'course', 'createdAt', 'updatedAt']).optional().default('createdAt'),
  orderDirection: z.enum(['asc', 'desc']).optional().default('desc'),
  includeRelations: z.string()
    .transform(val => val === 'true')
    .pipe(z.boolean())
    .optional()
    .default("true"),
});

// Schema para duplicar tema
export const duplicateTopicSchema = z.object({
  targetSectionId: z.number().int().positive("La sección destino debe ser válida").optional(),
  targetWeekId: z.number().int().positive("La semana destino debe ser válida").optional(),
}).refine(
  (data) => data.targetSectionId || data.targetWeekId,
  {
    message: "Debe especificar al menos una sección o semana destino",
    path: ["targetSectionId", "targetWeekId"],
  }
);

// ==================== SCHEMAS DE CONSULTAS ESPECÍFICAS ====================

export const sectionWeekQuerySchema = z.object({
  sectionId: z.string().transform(Number).pipe(z.number().int().positive()),
  weekId: z.string().transform(Number).pipe(z.number().int().positive()),
  courseId: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
});

export const teacherPendingQuerySchema = z.object({
  teacherId: z.string().transform(Number).pipe(z.number().int().positive()),
  bimesterId: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
});

export const sectionCoursePlanningQuerySchema = z.object({
  sectionId: z.string().transform(Number).pipe(z.number().int().positive()),
  courseId: z.string().transform(Number).pipe(z.number().int().positive()),
  bimesterId: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
});

export const teacherStatsQuerySchema = z.object({
  teacherId: z.string().transform(Number).pipe(z.number().int().positive()),
  bimesterId: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
});

// ==================== TIPOS INFERIDOS ====================

export type CreateEricaTopicFormValues = z.infer<typeof createEricaTopicSchema>;
export type UpdateEricaTopicFormValues = z.infer<typeof updateEricaTopicSchema>;
export type BulkCreateEricaTopicsFormValues = z.infer<typeof bulkCreateEricaTopicsSchema>;
export type MarkCompleteFormValues = z.infer<typeof markCompleteSchema>;
export type TopicFiltersFormValues = z.infer<typeof topicFiltersSchema>;
export type DuplicateTopicFormValues = z.infer<typeof duplicateTopicSchema>;

// ==================== VALORES POR DEFECTO ====================

export const defaultCreateTopicValues: CreateEricaTopicFormValues = {
  courseId: 0,
  academicWeekId: 0,
  sectionId: 0,
  teacherId: 0,
  title: '',
  description: '',
  objectives: '',
  materials: '',
  isActive: true,
};

export const defaultUpdateTopicValues: UpdateEricaTopicFormValues = {};

export const defaultTopicFilters: Partial<TopicFiltersFormValues> = {
  page: 1,
  limit: 20,
  orderBy: 'createdAt',
  orderDirection: 'desc',
  includeRelations: true,
  isActive: true,
};

export const defaultMarkCompleteValues: MarkCompleteFormValues = {
  isCompleted: true,
  notes: '',
};

// ==================== VALIDACIONES PERSONALIZADAS ====================

// Validación para fechas de semana académica
export const validateWeekDates = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: "La fecha de fin debe ser posterior a la fecha de inicio",
    path: ["endDate"],
  }
);

// Validación para tema completo con evaluaciones
export const validateTopicCompletion = z.object({
  isCompleted: z.boolean(),
  hasEvaluations: z.boolean(),
}).refine(
  (data) => !data.isCompleted || data.hasEvaluations,
  {
    message: "No se puede marcar como completado un tema sin evaluaciones",
    path: ["isCompleted"],
  }
);

// ==================== HELPERS DE VALIDACIÓN ====================

export const validateTopicUniqueness = (
  topics: CreateEricaTopicFormValues[]
): string[] => {
  const errors: string[] = [];
  const seen = new Set<string>();

  topics.forEach((topic, index) => {
    const key = `${topic.courseId}-${topic.academicWeekId}-${topic.sectionId}`;
    if (seen.has(key)) {
      errors.push(`Tema ${index + 1}: Ya existe un tema para este curso en esta semana y sección`);
    }
    seen.add(key);
  });

  return errors;
};

export const validateBulkTopics = (
  data: BulkCreateEricaTopicsFormValues
): { isValid: boolean; errors: string[] } => {
  try {
    bulkCreateEricaTopicsSchema.parse(data);
    const uniquenessErrors = validateTopicUniqueness(data.topics);
    
    return {
      isValid: uniquenessErrors.length === 0,
      errors: uniquenessErrors
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return {
      isValid: false,
      errors: ['Error de validación desconocido']
    };
  }
};

// ==================== TRANSFORMADORES ====================

export const transformTopicFormData = (
  formData: CreateEricaTopicFormValues
): CreateEricaTopicFormValues => {
  return {
    ...formData,
    title: formData.title.trim(),
    description: formData.description?.trim() || undefined,
    objectives: formData.objectives?.trim() || undefined,
    materials: formData.materials?.trim() || undefined,
  };
};

export const transformUpdateTopicFormData = (
  formData: UpdateEricaTopicFormValues
): UpdateEricaTopicFormValues => {
  const transformed: UpdateEricaTopicFormValues = {};
  
  if (formData.title !== undefined) {
    transformed.title = formData.title.trim();
  }
  if (formData.description !== undefined) {
    transformed.description = formData.description.trim() || undefined;
  }
  if (formData.objectives !== undefined) {
    transformed.objectives = formData.objectives.trim() || undefined;
  }
  if (formData.materials !== undefined) {
    transformed.materials = formData.materials.trim() || undefined;
  }
  
  // Copiar el resto de campos tal como están
  Object.keys(formData).forEach(key => {
    if (!['title', 'description', 'objectives', 'materials'].includes(key)) {
      (transformed as any)[key] = (formData as any)[key];
    }
  });
  
  return transformed;
};