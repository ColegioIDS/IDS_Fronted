// src/schemas/schedule-config.ts
import { z } from 'zod';

const breakSlotSchema = z.object({
  start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  label: z.string().min(1).max(50).optional()
});

export const scheduleConfigSchema = z.object({
  sectionId: z.number().int().positive("El ID de sección debe ser positivo"),
  workingDays: z.array(z.number().int().min(0).max(6)).min(1, "Debe haber al menos un día laboral"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:MM)"),
  classDuration: z.number().int().positive("La duración debe ser positiva").min(15).max(120),
  breakSlots: z.array(breakSlotSchema).optional()
});

export const defaultScheduleConfigValues: Partial<z.infer<typeof scheduleConfigSchema>> = {
  workingDays: [1, 2, 3, 4, 5], // Lunes a Viernes por defecto
  startTime: "07:00",
  endTime: "15:00",
  classDuration: 45,
  breakSlots: []
};