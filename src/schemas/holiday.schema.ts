// src/schemas/holiday.schema.ts
import { z } from 'zod';

export const holidaySchema = z.object({
    bimesterId: z.number().int().positive(),
    date: z.date(),
    description: z.string().min(3, "La descripción debe tener al menos 3 caracteres"),
    isRecovered: z.boolean().optional()
});

export type HolidayFormData = z.infer<typeof holidaySchema>;

export const defaultValues: HolidayFormData = {
    bimesterId: 0,
    date: new Date(),
    description: '',
    isRecovered: false
};