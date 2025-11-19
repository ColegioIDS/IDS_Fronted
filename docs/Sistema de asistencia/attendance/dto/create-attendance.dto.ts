import { z } from 'zod';

/**
 * DTO para registrar asistencia individual de un estudiante POR CLASE
 * ✨ CAMBIO: Ahora StudentClassAttendance es autónoma (no depende de StudentAttendance)
 * Cada registro representa una clase específica del estudiante
 */
export const createAttendanceSchema = z.object({
  enrollmentId: z
    .number({
      required_error: 'enrollmentId es requerido',
      invalid_type_error: 'enrollmentId debe ser un número',
    })
    .int('enrollmentId debe ser un entero')
    .positive('enrollmentId debe ser positivo')
    .describe('ID de la matrícula del estudiante'),

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
    )
    .describe('Fecha de la clase (YYYY-MM-DD)'),

  scheduleId: z
    .number({
      required_error: 'scheduleId es requerido',
      invalid_type_error: 'scheduleId debe ser un número',
    })
    .int('scheduleId debe ser un entero')
    .positive('scheduleId debe ser positivo')
    .describe('ID del horario de la clase'),

  courseAssignmentId: z
    .number({
      required_error: 'courseAssignmentId es requerido',
      invalid_type_error: 'courseAssignmentId debe ser un número',
    })
    .int('courseAssignmentId debe ser un entero')
    .positive('courseAssignmentId debe ser positivo')
    .describe('ID de la asignación del curso'),

  attendanceStatusId: z
    .number({
      required_error: 'attendanceStatusId es requerido',
      invalid_type_error: 'attendanceStatusId debe ser un número',
    })
    .int('attendanceStatusId debe ser un entero')
    .positive('attendanceStatusId debe ser positivo')
    .describe('ID del estado de asistencia (presente, ausente, etc)'),

  arrivalTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'arrivalTime debe estar en formato HH:MM')
    .optional()
    .nullable()
    .describe('Hora de llegada a la clase (HH:MM)'),

  notes: z
    .string()
    .max(500, 'notes no puede exceder 500 caracteres')
    .optional()
    .nullable()
    .describe('Notas adicionales sobre la asistencia'),
});


export type CreateAttendanceDto = z.infer<typeof createAttendanceSchema>;

/**
 * DTO para respuesta al crear asistencia
 */
export const attendanceCreatedResponseSchema = z.object({
  id: z.number().describe('ID del registro de asistencia'),
  enrollmentId: z.number().describe('ID de la matrícula'),
  date: z.date().describe('Fecha de la clase'),
  scheduleId: z.number().describe('ID del horario'),
  status: z.string().describe('Código del estado de asistencia'),
  recordedBy: z.number().describe('ID del usuario que registró'),
  recordedAt: z.date().describe('Timestamp del registro'),
  createdAt: z.date().describe('Fecha de creación del registro'),
});

export type AttendanceCreatedResponseDto = z.infer<typeof attendanceCreatedResponseSchema>;
