import { z } from 'zod';

/**
 * DTO para registrar asistencia individual de un estudiante
 * Usado por endpoints que registran asistencia de un estudiante específico
 */
export const createAttendanceSchema = z.object({
  enrollmentId: z
    .number({
      required_error: 'enrollmentId es requerido',
      invalid_type_error: 'enrollmentId debe ser un número',
    })
    .int('enrollmentId debe ser un entero')
    .positive('enrollmentId debe ser positivo'),

  date: z
    .string({ required_error: 'date es requerido' })
    .refine(
      (date) => {
        const d = new Date(date);
        return !isNaN(d.getTime());
      },
      { message: 'date debe ser una fecha válida (ISO 8601)' },
    )
    .refine(
      (date) => {
        const d = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d <= today;
      },
      { message: 'No puedes registrar asistencia en fecha futura' },
    ),

  gradeId: z
    .number({
      required_error: 'gradeId es requerido',
      invalid_type_error: 'gradeId debe ser un número',
    })
    .int('gradeId debe ser un entero')
    .positive('gradeId debe ser positivo'),

  sectionId: z
    .number({
      required_error: 'sectionId es requerido',
      invalid_type_error: 'sectionId debe ser un número',
    })
    .int('sectionId debe ser un entero')
    .positive('sectionId debe ser positivo'),

  attendanceStatusId: z
    .number({
      required_error: 'attendanceStatusId es requerido',
      invalid_type_error: 'attendanceStatusId debe ser un número',
    })
    .int('attendanceStatusId debe ser un entero')
    .positive('attendanceStatusId debe ser positivo'),

  arrivalTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'arrivalTime debe estar en formato HH:MM')
    .optional()
    .nullable(),

  departureTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'departureTime debe estar en formato HH:MM')
    .optional()
    .nullable(),

  notes: z
    .string()
    .max(500, 'notes no puede exceder 500 caracteres')
    .optional()
    .nullable(),

  courseAssignmentId: z
    .number()
    .int('courseAssignmentId debe ser un entero')
    .positive('courseAssignmentId debe ser positivo')
    .optional()
    .nullable(),
});

export type CreateAttendanceDto = z.infer<typeof createAttendanceSchema>;

/**
 * DTO para respuesta al crear asistencia
 */
export const attendanceCreatedResponseSchema = z.object({
  id: z.number(),
  enrollmentId: z.number(),
  date: z.date(),
  attendanceStatusId: z.number(),
  recordedBy: z.number(),
  recordedAt: z.date(),
  createdAt: z.date(),
});

export type AttendanceCreatedResponseDto = z.infer<typeof attendanceCreatedResponseSchema>;
