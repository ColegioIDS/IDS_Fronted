import { z } from 'zod';

/**
 * Respuesta estándar para validaciones de asistencia
 */
export const validationResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string(),
});

export type ValidationResponse = z.infer<typeof validationResponseSchema>;

/**
 * DTO para respuestas de bimester
 */
export const bimesterResponseSchema = z.object({
  id: z.number(),
  cycleId: z.number(),
  number: z.number(),
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean(),
  weeksCount: z.number(),
  createdAt: z.string(),
});

export type BimesterResponse = z.infer<typeof bimesterResponseSchema>;

/**
 * DTO para respuestas de holiday
 */
export const holidayResponseSchema = z.object({
  id: z.number(),
  bimesterId: z.number(),
  date: z.string(),
  description: z.string(),
  isRecovered: z.boolean(),
  createdAt: z.string(),
});

export type HolidayResponse = z.infer<typeof holidayResponseSchema>;

/**
 * DTO para respuestas de academic week
 */
export const academicWeekResponseSchema = z.object({
  id: z.number(),
  bimesterId: z.number(),
  number: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  objectives: z.string().optional(),
  weekType: z.string(),
  createdAt: z.string(),
});

export type AcademicWeekResponse = z.infer<typeof academicWeekResponseSchema>;

/**
 * DTO para respuestas de schedule
 */
export const scheduleResponseSchema = z.object({
  id: z.number(),
  sectionId: z.number(),
  courseId: z.number(),
  courseAssignmentId: z.number(),
  dayOfWeek: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  classroom: z.string().optional(),
  teacherId: z.number().optional(),
  isSubstitution: z.boolean(),
  course: z.object({
    id: z.number(),
    code: z.string(),
    name: z.string(),
  }),
  courseAssignment: z.object({
    id: z.number(),
    isActive: z.boolean(),
  }),
});

export type ScheduleResponse = z.infer<typeof scheduleResponseSchema>;

/**
 * DTO para respuestas de teacher absence
 */
export const teacherAbsenceResponseSchema = z.object({
  id: z.number(),
  teacherId: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string(),
  status: z.string(),
  approvedAt: z.string().optional(),
});

export type TeacherAbsenceResponse = z.infer<typeof teacherAbsenceResponseSchema>;

/**
 * DTO para respuestas de attendance config
 */
export const attendanceConfigResponseSchema = z.object({
  id: z.number().optional().nullable(),
  name: z.string(),
  description: z.string().optional(),
  riskThresholdPercentage: z.number(),
  consecutiveAbsenceAlert: z.number(),
  lateThresholdTime: z.string(),
  markAsTardyAfterMinutes: z.number(),
  justificationRequiredAfter: z.number(),
  maxJustificationDays: z.number(),
  autoApproveJustification: z.boolean(),
  autoApprovalAfterDays: z.number(),
  isActive: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type AttendanceConfigResponse = z.infer<typeof attendanceConfigResponseSchema>;

/**
 * DTO para respuestas de student
 */
export const studentResponseSchema = z.object({
  id: z.number(),
  codeSIRE: z.string().optional(),
  givenNames: z.string(),
  lastNames: z.string(),
  birthDate: z.string(),
  gender: z.string().optional(),
});

export type StudentResponse = z.infer<typeof studentResponseSchema>;

/**
 * DTO para respuestas de enrollment
 */
export const enrollmentResponseSchema = z.object({
  id: z.number(),
  studentId: z.number(),
  cycleId: z.number(),
  gradeId: z.number(),
  sectionId: z.number(),
  status: z.string(),
  dateEnrolled: z.string(),
  statusChangeReason: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  student: studentResponseSchema,
});

export type EnrollmentResponse = z.infer<typeof enrollmentResponseSchema>;

/**
 * DTO para respuestas de attendance status con permission
 */
export const attendanceStatusPermissionSchema = z.object({
  canView: z.boolean(),
  canCreate: z.boolean(),
  canModify: z.boolean(),
  canDelete: z.boolean(),
  requiresNotes: z.boolean(),
});

export const attendanceStatusResponseSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  description: z.string().optional(),
  requiresJustification: z.boolean(),
  canHaveNotes: z.boolean(),
  isNegative: z.boolean(),
  isExcused: z.boolean(),
  isTemporal: z.boolean(),
  colorCode: z.string().optional(),
  order: z.number(),
  isActive: z.boolean(),
  permission: attendanceStatusPermissionSchema.optional(),
});

export type AttendanceStatusResponse = z.infer<typeof attendanceStatusResponseSchema>;
