// src/schemas/schedule.schema.ts

import { z } from 'zod';
import { DayOfWeek } from '@/types/schedules';

// Definir DayOfWeek como tipo Zod
const dayOfWeekSchema = z.number().int().min(1).max(7) as z.ZodType<DayOfWeek>;

// Esquema para validación de hora HH:MM
const timeSchema = z.string()
  .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Formato de hora inválido, debe ser HH:MM'
  });

// ✅ Base schema SIN refine
const baseScheduleSchema = z.object({
  sectionId: z.number().int().positive("Sección inválida"),
  courseId: z.number().int().positive("Curso inválido"),
  teacherId: z.number().int().positive("Profesor inválido").optional().nullable(),
  dayOfWeek: dayOfWeekSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  classroom: z.string().max(50, "Máximo 50 caracteres").optional(),
});

// ✅ Schema principal CON refine (para crear)
export const scheduleSchema = baseScheduleSchema.refine(data => {
  const [startH, startM] = data.startTime.split(':').map(Number);
  const [endH, endM] = data.endTime.split(':').map(Number);
  
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  
  return endTotal > startTotal;
}, {
  message: 'La hora de fin debe ser posterior a la hora de inicio',
  path: ['endTime']
});

// ✅ Schema para actualización (desde el base, sin refine)
export const updateScheduleSchema = baseScheduleSchema.partial();

// ✅ Schema para batch operations
export const batchScheduleSchema = z.object({
  schedules: z.array(scheduleSchema).min(1, "Debe proporcionar al menos un horario")
});

export type ScheduleFormValues = z.infer<typeof scheduleSchema>;
export type UpdateScheduleFormValues = z.infer<typeof updateScheduleSchema>;
export type BatchScheduleFormValues = z.infer<typeof batchScheduleSchema>;

export const defaultValues: ScheduleFormValues = {
  sectionId: 0,
  courseId: 0,
  teacherId: null,
  dayOfWeek: 1,
  startTime: '08:00',
  endTime: '09:00',
  classroom: '',
};

export const defaultUpdateValues: Partial<ScheduleFormValues> = {};