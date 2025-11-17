import { z } from 'zod';

/**
 * DTO para registrar asistencia MASIVA desde un maestro
 * El maestro especifica la fecha y el sistema toma sus schedules
 * Crea automáticamente asistencia para TODOS sus cursos del día
 */
export const bulkTeacherAttendanceSchema = z.object({
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
    .max(1000, 'notes no puede exceder 1000 caracteres')
    .optional()
    .nullable(),

  courseAssignmentIds: z
    .array(
      z
        .number()
        .int('Cada ID debe ser un entero')
        .positive('Cada ID debe ser positivo'),
    )
    .optional()
    .nullable()
    .describe(
      'Si se proporciona, solo registra asistencia para estos cursos. Si es null, registra para TODOS los cursos del maestro ese día',
    ),
});

export type BulkTeacherAttendanceDto = z.infer<typeof bulkTeacherAttendanceSchema>;

/**
 * DTO para respuesta de registro masivo
 */
export const bulkAttendanceResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(
    z.object({
      id: z.number(),
      enrollmentId: z.number(),
      studentName: z.string(),
      courseName: z.string(),
      status: z.string(),
    }),
  ),
  totalCreated: z.number(),
  timestamp: z.date(),
});

export type BulkAttendanceResponseDto = z.infer<typeof bulkAttendanceResponseSchema>;
