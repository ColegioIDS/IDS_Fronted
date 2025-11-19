import { z } from 'zod';

/**
 * DTO para obtener asistencias de una sección en una fecha específica
 */
export const sectionAttendanceSchema = z.object({
  sectionId: z.number().int().positive(),
  cycleId: z.number().int().positive(),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
});

export type SectionAttendanceDto = z.infer<typeof sectionAttendanceSchema>;

/**
 * Estructura de respuesta simple (resumen de asistencia por día)
 */
export const classAttendanceSimpleSchema = z.object({
  id: z.number(),
  scheduleId: z.number(),
  className: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  attendanceStatusId: z.number(),
  status: z.string(),
  arrivalTime: z.string().nullable(),
  notes: z.string().nullable(),
});

export type ClassAttendanceSimple = z.infer<typeof classAttendanceSimpleSchema>;

/**
 * Estructura de respuesta detallada (con todas las clases)
 */
export const studentDayAttendanceSchema = z.object({
  id: z.number(),
  enrollmentId: z.number(),
  studentId: z.number(),
  studentName: z.string(),
  date: z.string(),
  // Status general del día (calculado desde las clases)
  status: z.string().nullable(),
  arrivalTime: z.string().nullable(),
  departureTime: z.string().nullable(),
  notes: z.string().nullable(),
  isEarlyExit: z.boolean(),
  classAttendances: z.array(classAttendanceSimpleSchema),
});

export type StudentDayAttendance = z.infer<typeof studentDayAttendanceSchema>;

/**
 * Respuesta de la API
 */
export const sectionAttendanceResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(studentDayAttendanceSchema).optional(),
  message: z.string().optional(),
});

export type SectionAttendanceResponse = z.infer<typeof sectionAttendanceResponseSchema>;
