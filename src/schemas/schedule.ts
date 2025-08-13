import { z } from 'zod';
import {DayOfWeek} from '@/types/schedules'; // Asegúrate de que este tipo esté definido en tu proyecto

// Definir DayOfWeek como tipo Zod primero
const dayOfWeekSchema = z.number().int().min(1).max(7) as z.ZodType<DayOfWeek>;

// Esquema para validación de hora HH:MM
const timeSchema = z.string()
  .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Formato de hora inválido, debe ser HH:MM'
  });

export const scheduleSchema = z.object({
  sectionId: z.number().int().positive("Sección inválida"),
  courseId: z.number().int().positive("Curso inválido"),
  teacherId: z.number().int().positive("Profesor inválido").nullable(),
  dayOfWeek: dayOfWeekSchema, // Usamos el schema con tipo específico
  startTime: timeSchema,
  endTime: timeSchema,
  classroom: z.string().max(50, "Máximo 50 caracteres").optional(),
})
.refine(data => {
  // Convertir horas a minutos para comparación
  const [startH, startM] = data.startTime.split(':').map(Number);
  const [endH, endM] = data.endTime.split(':').map(Number);
  
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  
  return endTotal > startTotal;
}, {
  message: 'La hora de fin debe ser posterior a la hora de inicio',
  path: ['endTime']
});

export type ScheduleFormValues = z.infer<typeof scheduleSchema>;

export const defaultValues: ScheduleFormValues = {
  sectionId: 0,
  courseId: 0,
  teacherId: null,
  dayOfWeek: 1, // Lunes por defecto
  startTime: '08:00',
  endTime: '09:00',
  classroom: '',
};