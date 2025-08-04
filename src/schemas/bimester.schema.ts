// src/schemas/Bimester.ts
import { z } from 'zod';

export const bimesterSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  startDate: z.coerce.date({ required_error: "La fecha de inicio es requerida" }),
  endDate: z.coerce.date({ required_error: "La fecha de fin es requerida" }),
  isActive: z.boolean(),
  weeksCount: z.number().min(1).max(12),
  number: z.number().min(1).max(4).optional(),
});


export type BimesterFormData = z.infer<typeof bimesterSchema>;

export const defaultValues: BimesterFormData = {
  name: "",
  startDate: new Date(),
  endDate: new Date(),
  isActive: false,
  weeksCount: 8,
  number: undefined,
};