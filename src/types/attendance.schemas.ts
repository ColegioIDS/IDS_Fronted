/**
 * =========================
 * ATTENDANCE ZOD SCHEMAS - Validación Client-Side
 * =========================
 * 
 * Mirror of backend schemas for client-side validation
 * Ensure data integrity before sending to API
 * Aligned with createAttendanceSchema, updateAttendanceSchema, bulkTeacherAttendanceSchema
 */

import { z } from 'zod';

// ============================================================================
// UTILITY SCHEMAS
// ============================================================================

/**
 * ISO Date validation
 */
export const isoDateSchema = z
  .string({ required_error: 'Date is required' })
  .refine(
    (date) => {
      const d = new Date(date);
      return !isNaN(d.getTime());
    },
    { message: 'Must be a valid ISO date (YYYY-MM-DD)' }
  )
  .refine(
    (date) => {
      const d = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d <= today;
    },
    { message: 'Cannot register attendance for future dates' }
  );

/**
 * Time format validation (HH:MM)
 */
export const timeFormatSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Must be in HH:MM format')
  .optional()
  .nullable();

/**
 * Positive integer validation
 */
export const positiveIntSchema = z
  .number({ invalid_type_error: 'Must be a number' })
  .int('Must be an integer')
  .positive('Must be positive');

// ============================================================================
// CREATE ATTENDANCE SCHEMA
// ============================================================================

/**
 * ✅ Schema for CreateAttendancePayload
 * Aligned with backend createAttendanceSchema
 */
export const createAttendanceSchema = z.object({
  enrollmentId: positiveIntSchema,
  date: isoDateSchema,
  gradeId: positiveIntSchema,
  sectionId: positiveIntSchema,
  attendanceStatusId: positiveIntSchema,
  arrivalTime: timeFormatSchema,
  departureTime: timeFormatSchema,
  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .nullable(),
  courseAssignmentId: positiveIntSchema.optional().nullable(),
  scope: z
    .enum(['ALL', 'GRADE', 'SECTION', 'OWN', 'DEPARTMENT'])
    .optional(),
});

export type CreateAttendanceSchema = z.infer<typeof createAttendanceSchema>;

// ============================================================================
// BULK CREATE ATTENDANCE SCHEMA
// ============================================================================

/**
 * ✅ Schema for BulkCreateAttendancePayload
 */
export const bulkCreateAttendanceSchema = z.object({
  attendances: z.array(createAttendanceSchema),
  scope: z
    .enum(['ALL', 'GRADE', 'SECTION', 'OWN', 'DEPARTMENT'])
    .optional(),
});

export type BulkCreateAttendanceSchema = z.infer<typeof bulkCreateAttendanceSchema>;

// ============================================================================
// BULK TEACHER ATTENDANCE SCHEMA
// ============================================================================

/**
 * ✅ Schema for BulkTeacherAttendancePayload
 * Aligned with backend bulkTeacherAttendanceSchema
 */
export const bulkTeacherAttendanceSchema = z.object({
  date: isoDateSchema,
  gradeId: positiveIntSchema,
  sectionId: positiveIntSchema,
  attendanceStatusId: positiveIntSchema,
  arrivalTime: timeFormatSchema,
  departureTime: timeFormatSchema,
  notes: z
    .string()
    .max(1000, 'Notes cannot exceed 1000 characters')
    .optional()
    .nullable(),
  courseAssignmentIds: z
    .array(positiveIntSchema)
    .optional()
    .nullable()
    .describe(
      'If provided, only registers attendance for these courses. If null, registers for ALL courses'
    ),
});

export type BulkTeacherAttendanceSchema = z.infer<typeof bulkTeacherAttendanceSchema>;

// ============================================================================
// BULK BY SCHEDULES SCHEMA
// ============================================================================

/**
 * ✅ Schema for BulkBySchedulesPayload
 */
export const bulkBySchedulesAttendanceItemSchema = z.object({
  enrollmentId: positiveIntSchema,
  attendanceStatusId: positiveIntSchema,
  arrivalTime: timeFormatSchema,
  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .nullable(),
});

export const bulkBySchedulesSchema = z.object({
  date: isoDateSchema,
  scheduleIds: z
    .array(positiveIntSchema)
    .min(1, 'At least one schedule is required'),
  attendances: z.array(bulkBySchedulesAttendanceItemSchema),
});

export type BulkBySchedulesSchema = z.infer<typeof bulkBySchedulesSchema>;

// ============================================================================
// UPDATE ATTENDANCE SCHEMA
// ============================================================================

/**
 * ✅ Schema for UpdateAttendancePayload
 * ⚠️ changeReason is MANDATORY for audit trail
 * Aligned with backend updateAttendanceSchema
 */
export const updateAttendanceSchema = z.object({
  attendanceStatusId: positiveIntSchema.optional(),
  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .nullable(),
  arrivalTime: timeFormatSchema,
  departureTime: timeFormatSchema,
  changeReason: z
    .string({
      required_error: 'Change reason is REQUIRED (audit trail)',
      invalid_type_error: 'Change reason must be a string',
    })
    .min(5, 'Change reason must be at least 5 characters')
    .max(500, 'Change reason cannot exceed 500 characters')
    .describe(
      'Reason for change (REQUIRED). Ex: "Early departure authorized", "Registration error correction", etc.'
    ),
});

export type UpdateAttendanceSchema = z.infer<typeof updateAttendanceSchema>;

// ============================================================================
// BULK UPDATE ATTENDANCE SCHEMA
// ============================================================================

/**
 * ✅ Schema for BulkUpdateAttendancePayload
 */
export const bulkUpdateAttendanceSchema = z.object({
  ids: z
    .array(positiveIntSchema)
    .min(1, 'At least one ID is required'),
  attendanceStatusId: positiveIntSchema.optional(),
  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .nullable(),
  changeReason: z
    .string({
      required_error: 'Change reason is REQUIRED',
      invalid_type_error: 'Change reason must be a string',
    })
    .min(5, 'Change reason must be at least 5 characters')
    .max(500, 'Change reason cannot exceed 500 characters'),
});

export type BulkUpdateAttendanceSchema = z.infer<typeof bulkUpdateAttendanceSchema>;

// ============================================================================
// BULK APPLY STATUS SCHEMA
// ============================================================================

/**
 * ✅ Schema for BulkApplyStatusPayload
 */
export const bulkApplyStatusSchema = z.object({
  enrollmentIds: z
    .array(positiveIntSchema)
    .min(1, 'At least one enrollment is required'),
  date: isoDateSchema,
  attendanceStatusId: positiveIntSchema,
  courseAssignmentIds: z.array(positiveIntSchema).optional(),
  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .nullable(),
});

export type BulkApplyStatusSchema = z.infer<typeof bulkApplyStatusSchema>;

// ============================================================================
// BULK DELETE ATTENDANCE SCHEMA
// ============================================================================

/**
 * ✅ Schema for BulkDeleteAttendancePayload
 */
export const bulkDeleteAttendanceSchema = z.object({
  ids: z
    .array(positiveIntSchema)
    .min(1, 'At least one ID is required'),
  changeReason: z
    .string()
    .max(500, 'Change reason cannot exceed 500 characters')
    .optional(),
});

export type BulkDeleteAttendanceSchema = z.infer<typeof bulkDeleteAttendanceSchema>;

// ============================================================================
// JUSTIFICATION SCHEMAS
// ============================================================================

/**
 * ✅ Schema for CreateJustificationPayload
 */
export const createJustificationSchema = z.object({
  enrollmentId: positiveIntSchema,
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  type: z.string().min(1, 'Type is required'),
  reason: z.string().min(1, 'Reason is required'),
  description: z.string().optional(),
  documentUrl: z.string().url('Must be a valid URL').optional(),
  documentType: z.string().optional(),
  documentName: z.string().optional(),
});

export type CreateJustificationSchema = z.infer<typeof createJustificationSchema>;

/**
 * ✅ Schema for UpdateJustificationPayload
 */
export const updateJustificationSchema = z.object({
  status: z
    .enum(['pending', 'approved', 'rejected'])
    .optional(),
  approvedBy: positiveIntSchema.optional(),
  rejectionReason: z.string().optional(),
  needsFollowUp: z.boolean().optional(),
  followUpNotes: z.string().optional(),
});

export type UpdateJustificationSchema = z.infer<typeof updateJustificationSchema>;

// ============================================================================
// QUERY PARAMETER SCHEMAS
// ============================================================================

/**
 * ✅ Schema for AttendanceQueryParams
 */
export const attendanceQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  enrollmentId: positiveIntSchema.optional(),
  studentId: positiveIntSchema.optional(),
  sectionId: positiveIntSchema.optional(),
  courseId: positiveIntSchema.optional(),
  bimesterId: positiveIntSchema.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  attendanceStatusId: positiveIntSchema.optional(),
  hasJustification: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(['date', 'studentName', 'status', 'recordedAt'])
    .optional(),
  sortOrder: z
    .enum(['asc', 'desc'])
    .optional(),
});

export type AttendanceQuerySchema = z.infer<typeof attendanceQuerySchema>;

/**
 * ✅ Schema for AttendanceQueryWithScope
 */
export const attendanceQueryWithScopeSchema = attendanceQuerySchema.extend({
  scope: z
    .enum(['ALL', 'GRADE', 'SECTION', 'OWN', 'DEPARTMENT'])
    .optional(),
  gradeId: positiveIntSchema.optional(),
  departmentId: positiveIntSchema.optional(),
});

export type AttendanceQueryWithScopeSchema = z.infer<typeof attendanceQueryWithScopeSchema>;

// ============================================================================
// HELPER VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate create attendance payload
 * @param data - Payload to validate
 * @returns Validation result
 */
export function validateCreateAttendance(data: unknown) {
  return createAttendanceSchema.safeParse(data);
}

/**
 * Validate update attendance payload
 * @param data - Payload to validate
 * @returns Validation result
 */
export function validateUpdateAttendance(data: unknown) {
  return updateAttendanceSchema.safeParse(data);
}

/**
 * Validate bulk create payload
 * @param data - Payload to validate
 * @returns Validation result
 */
export function validateBulkCreate(data: unknown) {
  return bulkCreateAttendanceSchema.safeParse(data);
}

/**
 * Validate bulk teacher attendance payload
 * @param data - Payload to validate
 * @returns Validation result
 */
export function validateBulkTeacherAttendance(data: unknown) {
  return bulkTeacherAttendanceSchema.safeParse(data);
}

/**
 * Validate bulk by schedules payload
 * @param data - Payload to validate
 * @returns Validation result
 */
export function validateBulkBySchedules(data: unknown) {
  return bulkBySchedulesSchema.safeParse(data);
}

/**
 * Format validation errors into readable messages
 * @param error - Zod validation error
 * @returns Array of formatted error messages
 */
export function formatValidationErrors(error: z.ZodError): string[] {
  return error.errors.map((err) => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });
}
