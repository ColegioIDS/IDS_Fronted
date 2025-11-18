import { z } from 'zod';

/**
 * DTO para registrar asistencia de UN ESTUDIANTE ESPECÍFICO
 * Para cuando necesitas registrar a un estudiante individual
 * (ej: tardío, que llega después del registro masivo)
 */
export const singleAttendanceSchema = z.object({
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
      'Si se proporciona, solo registra asistencia para estos cursos. Si es null, registra para TODOS los cursos del estudiante ese día',
    ),
});

export type SingleAttendanceDto = z.infer<typeof singleAttendanceSchema>;

/**
 * DTO para actualizar UN REGISTRO de StudentClassAttendance
 * Para modificar la asistencia de una clase específica
 */
export const updateSingleClassAttendanceSchema = z.object({
  classAttendanceId: z
    .number({
      required_error: 'classAttendanceId es requerido',
      invalid_type_error: 'classAttendanceId debe ser un número',
    })
    .int('classAttendanceId debe ser un entero')
    .positive('classAttendanceId debe ser positivo'),

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

  notes: z
    .string()
    .max(1000, 'notes no puede exceder 1000 caracteres')
    .optional()
    .nullable(),

  changeReason: z
    .string({
      required_error: 'changeReason es requerido para auditoría',
    })
    .min(5, 'changeReason debe tener al menos 5 caracteres')
    .max(500, 'changeReason no puede exceder 500 caracteres'),
});

export type UpdateSingleClassAttendanceDto = z.infer<
  typeof updateSingleClassAttendanceSchema
>;

/**
 * DTO para actualizar MÚLTIPLES registros de StudentClassAttendance
 * Para cambios en lote (ej: cambiar a todos los ausentes a presentes)
 */
export const bulkUpdateAttendanceSchema = z.object({
  updates: z
    .array(
      z.object({
        classAttendanceId: z
          .number()
          .int('Cada ID debe ser un entero')
          .positive('Cada ID debe ser positivo'),

        attendanceStatusId: z
          .number()
          .int('attendanceStatusId debe ser un entero')
          .positive('attendanceStatusId debe ser positivo'),

        arrivalTime: z
          .string()
          .regex(/^\d{2}:\d{2}$/, 'arrivalTime debe estar en formato HH:MM')
          .optional()
          .nullable(),

        notes: z
          .string()
          .max(1000, 'notes no puede exceder 1000 caracteres')
          .optional()
          .nullable(),
      }),
    )
    .min(1, 'Al menos un registro debe ser actualizado')
    .max(1000, 'No puedes actualizar más de 1000 registros a la vez'),

  changeReason: z
    .string({
      required_error: 'changeReason es requerido para auditoría',
    })
    .min(5, 'changeReason debe tener al menos 5 caracteres')
    .max(500, 'changeReason no puede exceder 500 caracteres')
    .describe('Razón del cambio en lote - se aplicará a todos los registros'),
});

export type BulkUpdateAttendanceDto = z.infer<
  typeof bulkUpdateAttendanceSchema
>;
