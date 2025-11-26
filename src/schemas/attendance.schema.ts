/**
 * ====================================================================
 * ATTENDANCE SCHEMAS - Validaciones con Zod
 * ====================================================================
 *
 * Define esquemas Zod para validar datos antes de enviar al API
 * Cubre todos los payloads y filtros
 */

import { z } from 'zod';

// ====================================================================
// ESQUEMAS BASE - Validaciones de campos comunes
// ====================================================================

/**
 * Validación de fecha en formato YYYY-MM-DD
 */
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha debe ser YYYY-MM-DD')
  .refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, 'Fecha inválida');

/**
 * Validación de hora en formato HH:MM
 */
const timeSchema = z
  .string()
  .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora debe ser HH:MM')
  .optional();

/**
 * Validación de color hex
 */
const colorCodeSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe estar en formato #RRGGBB')
  .optional();

/**
 * Validación de ID (número positivo)
 */
const idSchema = z.number().int().positive('ID debe ser un número positivo');

/**
 * Validación de motivo de modificación
 */
const modificationReasonSchema = z
  .string()
  .min(3, 'Motivo debe tener al menos 3 caracteres')
  .max(500, 'Motivo no puede exceder 500 caracteres');

// ====================================================================
// ESQUEMAS DE ASISTENCIA - Crear/Actualizar
// ====================================================================

/**
 * Schema para crear asistencia individual
 * POST /api/attendance/single
 */
export const createSingleAttendanceSchema = z.object({
  enrollmentId: idSchema,
  scheduleId: idSchema,
  attendanceStatusId: idSchema,
  date: dateSchema,
  arrivalTime: timeSchema,
  departureTime: timeSchema,
  modificationReason: z.string().optional(),
});

export type CreateSingleAttendanceInput = z.infer<typeof createSingleAttendanceSchema>;

/**
 * Schema para registro diario masivo
 * POST /api/attendance/daily-registration (TAB 1)
 */
export const dailyRegistrationSchema = z.object({
  date: dateSchema,
  sectionId: idSchema,
  enrollmentStatuses: z.record(
    z.string().regex(/^\d+$/, 'Claves deben ser IDs válidos'),
    z.number().int().positive('Estado ID debe ser número positivo')
  ).refine(
    (obj) => Object.keys(obj).length > 0,
    'Debe seleccionar al menos un estudiante'
  ),
});

export type DailyRegistrationInput = z.infer<typeof dailyRegistrationSchema>;

/**
 * Schema para actualizar asistencia individual
 * PATCH /api/attendance/class/:id (TAB 2)
 */
export const updateAttendanceSchema = z.object({
  attendanceStatusId: idSchema,
  departureTime: timeSchema,
  modificationReason: modificationReasonSchema,
});

export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;

/**
 * Schema para actualización masiva
 * PATCH /api/attendance/bulk/update
 */
export const bulkUpdateAttendanceSchema = z.object({
  recordIds: z
    .array(idSchema)
    .min(1, 'Debe seleccionar al menos un registro'),
  attendanceStatusId: idSchema,
  modificationReason: modificationReasonSchema,
});

export type BulkUpdateAttendanceInput = z.infer<typeof bulkUpdateAttendanceSchema>;

// ====================================================================
// ESQUEMAS DE JUSTIFICACIÓN
// ====================================================================

/**
 * Schema para crear justificación
 * POST /api/attendance/justifications
 */
export const createJustificationSchema = z.object({
  enrollmentId: idSchema,
  date: dateSchema,
  reason: z
    .string()
    .min(5, 'Razón debe tener al menos 5 caracteres')
    .max(1000, 'Razón no puede exceder 1000 caracteres'),
  documentUrl: z.string().url('URL de documento inválida').optional(),
});

export type CreateJustificationInput = z.infer<typeof createJustificationSchema>;

/**
 * Schema para actualizar justificación
 * PATCH /api/attendance/justifications/:id
 */
export const updateJustificationSchema = z.object({
  reason: z
    .string()
    .min(5, 'Razón debe tener al menos 5 caracteres')
    .max(1000, 'Razón no puede exceder 1000 caracteres')
    .optional(),
  documentUrl: z.string().url('URL de documento inválida').optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
});

export type UpdateJustificationInput = z.infer<typeof updateJustificationSchema>;

// ====================================================================
// ESQUEMAS DE QUERY/FILTROS
// ====================================================================

/**
 * Schema para parámetros de búsqueda
 * GET /api/attendance/enrollment/:id?...
 */
export const attendanceQueryParamsSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  dateFrom: dateSchema.optional(),
  dateTo: dateSchema.optional(),
  statusId: idSchema.optional(),
  sectionId: idSchema.optional(),
  enrollmentId: idSchema.optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['date', 'status', 'student']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type AttendanceQueryParamsInput = z.infer<typeof attendanceQueryParamsSchema>;

/**
 * Schema para filtros de lista
 */
export const attendanceFiltersSchema = z.object({
  dateRange: z
    .object({
      from: dateSchema,
      to: dateSchema,
    })
    .refine(
      (data) => new Date(data.from) <= new Date(data.to),
      'Fecha "desde" debe ser menor o igual a "hasta"'
    )
    .optional(),
  statusId: z.array(idSchema).optional(),
  section: idSchema.optional(),
  student: idSchema.optional(),
  searchTerm: z.string().max(100).optional(),
  sortBy: z.enum(['date', 'status', 'student']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type AttendanceFiltersInput = z.infer<typeof attendanceFiltersSchema>;

// ====================================================================
// ESQUEMAS DE RESPUESTA - Validar datos del API
// ====================================================================

/**
 * Schema para validar response del API (genérico)
 */
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    data: dataSchema.optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
        details: z.record(z.string()).optional(),
      })
      .optional(),
  });

/**
 * Schema para response paginado
 */
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  apiResponseSchema(z.array(dataSchema)).extend({
    pagination: z.object({
      page: z.number().int().min(1),
      limit: z.number().int().min(1),
      total: z.number().int().min(0),
      pages: z.number().int().min(0),
      hasMore: z.boolean(),
    }),
  });

// ====================================================================
// ESQUEMAS DE ENTIDADES - Para validar respuestas
// ====================================================================

/**
 * Schema para AttendanceStatus
 */
export const attendanceStatusSchema = z.object({
  id: z.number().int().positive(),
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  requiresJustification: z.boolean(),
  canHaveNotes: z.boolean(),
  isNegative: z.boolean(),
  isExcused: z.boolean(),
  isTemporal: z.boolean(),
  colorCode: colorCodeSchema,
  order: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type AttendanceStatusOutput = z.infer<typeof attendanceStatusSchema>;

/**
 * Schema para AttendanceRecord
 */
export const attendanceRecordSchema = z.object({
  id: z.number().int().positive(),
  enrollmentId: z.number().int().positive(),
  enrollment: z.object({}).optional(),
  scheduleId: z.number().int().positive(),
  schedule: z.object({}).optional(),
  date: dateSchema,
  originalStatus: z.string(),
  currentStatus: z.string(),
  attendanceStatusId: z.number().int().positive(),
  attendanceStatus: z.object({}).optional(),
  arrivalTime: timeSchema,
  departureTime: timeSchema,
  minutesLate: z.number().int().min(0).optional(),
  isEarlyExit: z.boolean(),
  recordedBy: z.string(),
  recordedAt: z.string(),
  lastModifiedBy: z.string().optional(),
  lastModifiedAt: z.string().optional(),
  modificationReason: z.string().optional(),
});

export type AttendanceRecordOutput = z.infer<typeof attendanceRecordSchema>;

/**
 * Schema para DailyAttendanceSummary
 */
export const dailyAttendanceSummarySchema = z.object({
  date: dateSchema,
  sectionId: z.number().int().positive(),
  sectionName: z.string(),
  totalStudents: z.number().int().min(0),
  createdRecords: z.number().int().min(0),
  createdAttendances: z.number().int().min(0),
  recordingGroupId: z.string(),
  summary: z.record(z.number().int().min(0)),
});

export type DailyAttendanceSummaryOutput = z.infer<typeof dailyAttendanceSummarySchema>;

/**
 * Schema para AttendanceReport
 */
export const attendanceReportSchema = z.object({
  enrollmentId: z.number().int().positive(),
  studentName: z.string(),
  sectionName: z.string(),
  totalDays: z.number().int().min(0),
  presentDays: z.number().int().min(0),
  absentDays: z.number().int().min(0),
  tardyDays: z.number().int().min(0),
  excusedDays: z.number().int().min(0),
  earlyExitDays: z.number().int().min(0),
  attendancePercentage: z.number().min(0).max(100),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  trend: z.enum(['IMPROVING', 'STABLE', 'DECLINING']),
  lastRecordDate: z.string().optional(),
  records: z.array(attendanceRecordSchema),
});

export type AttendanceReportOutput = z.infer<typeof attendanceReportSchema>;

/**
 * Schema para Justification
 */
export const justificationSchema = z.object({
  id: z.number().int().positive(),
  enrollmentId: z.number().int().positive(),
  enrollment: z.object({}).optional(),
  attendanceRecordId: z.number().int().positive().optional(),
  date: dateSchema,
  reason: z.string(),
  documentUrl: z.string().url().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type JustificationOutput = z.infer<typeof justificationSchema>;

// ====================================================================
// FUNCIONES DE VALIDACIÓN - Helpers para usar en componentes
// ====================================================================

/**
 * Valida y transforma input de crear asistencia individual
 */
export const validateCreateSingleAttendance = (data: unknown) => {
  return createSingleAttendanceSchema.safeParse(data);
};

/**
 * Valida y transforma input de registro diario
 */
export const validateDailyRegistration = (data: unknown) => {
  return dailyRegistrationSchema.safeParse(data);
};

/**
 * Valida y transforma input de actualizar asistencia
 */
export const validateUpdateAttendance = (data: unknown) => {
  return updateAttendanceSchema.safeParse(data);
};

/**
 * Valida y transforma input de actualización masiva
 */
export const validateBulkUpdateAttendance = (data: unknown) => {
  return bulkUpdateAttendanceSchema.safeParse(data);
};

/**
 * Valida y transforma input de crear justificación
 */
export const validateCreateJustification = (data: unknown) => {
  return createJustificationSchema.safeParse(data);
};

/**
 * Valida y transforma input de actualizar justificación
 */
export const validateUpdateJustification = (data: unknown) => {
  return updateJustificationSchema.safeParse(data);
};

/**
 * Valida y transforma query parameters
 */
export const validateAttendanceQueryParams = (data: unknown) => {
  return attendanceQueryParamsSchema.safeParse(data);
};

/**
 * Valida y transforma filtros
 */
export const validateAttendanceFilters = (data: unknown) => {
  return attendanceFiltersSchema.safeParse(data);
};

/**
 * Valida response de AttendanceRecord
 */
export const validateAttendanceRecord = (data: unknown) => {
  return attendanceRecordSchema.safeParse(data);
};

/**
 * Valida response de DailyAttendanceSummary
 */
export const validateDailyAttendanceSummary = (data: unknown) => {
  return dailyAttendanceSummarySchema.safeParse(data);
};

/**
 * Valida response de AttendanceReport
 */
export const validateAttendanceReport = (data: unknown) => {
  return attendanceReportSchema.safeParse(data);
};

/**
 * Valida response de Justification
 */
export const validateJustification = (data: unknown) => {
  return justificationSchema.safeParse(data);
};

// ====================================================================
// UTILIDADES - Manejo de errores de validación
// ====================================================================

/**
 * Formatea errores de Zod en un objeto legible
 * @param errors - Array de errores de Zod
 * @returns Objeto con fieldName: errorMessage
 */
export const formatZodErrors = (
  errors: z.ZodError['errors']
): Record<string, string> => {
  return errors.reduce((acc, error) => {
    const path = error.path.join('.');
    const message = error.message;
    acc[path] = message;
    return acc;
  }, {} as Record<string, string>);
};

/**
 * Obtiene el primer error de validación
 * @param result - SafeParse result
 * @returns Primer mensaje de error o null
 */
export const getFirstValidationError = (
  result: ReturnType<typeof createSingleAttendanceSchema.safeParse>
): string | null => {
  if (result.success) return null;
  return result.error.errors[0]?.message || 'Error de validación';
};

/**
 * Verifica si hay errores en un campo específico
 * @param errors - Objeto de errores
 * @param field - Nombre del campo
 * @returns Mensaje de error o null
 */
export const getFieldError = (
  errors: Record<string, string>,
  field: string
): string | null => {
  return errors[field] || null;
};

// ====================================================================
// EXPORT DE SCHEMAS EN GRUPOS
// ====================================================================

/**
 * Todos los schemas de input (para crear/actualizar)
 */
export const inputSchemas = {
  createSingleAttendance: createSingleAttendanceSchema,
  dailyRegistration: dailyRegistrationSchema,
  updateAttendance: updateAttendanceSchema,
  bulkUpdateAttendance: bulkUpdateAttendanceSchema,
  createJustification: createJustificationSchema,
  updateJustification: updateJustificationSchema,
  attendanceQueryParams: attendanceQueryParamsSchema,
  attendanceFilters: attendanceFiltersSchema,
};

/**
 * Todos los schemas de output (para validar respuestas)
 */
export const outputSchemas = {
  attendanceStatus: attendanceStatusSchema,
  attendanceRecord: attendanceRecordSchema,
  dailyAttendanceSummary: dailyAttendanceSummarySchema,
  attendanceReport: attendanceReportSchema,
  justification: justificationSchema,
};

/**
 * Todas las funciones de validación
 */
export const validators = {
  createSingleAttendance: validateCreateSingleAttendance,
  dailyRegistration: validateDailyRegistration,
  updateAttendance: validateUpdateAttendance,
  bulkUpdateAttendance: validateBulkUpdateAttendance,
  createJustification: validateCreateJustification,
  updateJustification: validateUpdateJustification,
  attendanceQueryParams: validateAttendanceQueryParams,
  attendanceFilters: validateAttendanceFilters,
  attendanceRecord: validateAttendanceRecord,
  dailyAttendanceSummary: validateDailyAttendanceSummary,
  attendanceReport: validateAttendanceReport,
  justification: validateJustification,
};