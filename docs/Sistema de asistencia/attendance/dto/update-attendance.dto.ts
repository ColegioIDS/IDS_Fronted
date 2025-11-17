import { z } from 'zod';

/**
 * DTO para EDITAR asistencia (Secretaria, Admin)
 * CRÍTICO: changeReason es OBLIGATORIO para auditoría
 */
export const updateAttendanceSchema = z.object({
  attendanceStatusId: z
    .number({
      invalid_type_error: 'attendanceStatusId debe ser un número',
    })
    .int('attendanceStatusId debe ser un entero')
    .positive('attendanceStatusId debe ser positivo')
    .optional(),

  notes: z
    .string()
    .max(500, 'notes no puede exceder 500 caracteres')
    .optional()
    .nullable(),

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

  changeReason: z
    .string({
      required_error: 'changeReason es REQUERIDO (auditoría)',
      invalid_type_error: 'changeReason debe ser un string',
    })
    .min(5, 'changeReason debe tener al menos 5 caracteres')
    .max(500, 'changeReason no puede exceder 500 caracteres')
    .describe(
      'Motivo del cambio (OBLIGATORIO). Ej: "Salida temprana autorizada", "Corrección de error de registro", etc.',
    ),
});

export type UpdateAttendanceDto = z.infer<typeof updateAttendanceSchema>;

/**
 * DTO para respuesta al actualizar asistencia
 */
export const attendanceUpdatedResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    id: z.number(),
    student: z.string(),
    status: z.string(),
    notes: z.string().nullable(),
    arrivalTime: z.string().nullable(),
    modifiedAt: z.date(),
  }),
});

export type AttendanceUpdatedResponseDto = z.infer<typeof attendanceUpdatedResponseSchema>;
