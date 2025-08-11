import { z } from 'zod';

export const sectionSchema = z.object({
  name: z.string()
    .min(1, "El nombre es requerido")
    .max(50, "Máximo 50 caracteres"),
  capacity: z.number()
    .int("Debe ser un número entero")
    .positive("La capacidad debe ser positiva"),
  gradeId: z.number().int().positive("Seleccione un grado válido"),
  teacherId: z.union([
    z.number().int().positive("Seleccione un profesor válido"), 
    z.null()
  ]).optional(),
});

export type SectionFormValues = z.infer<typeof sectionSchema>;

export const defaultValues: SectionFormValues = {
  name: '',
  capacity: 20,
  gradeId: 0,
  teacherId: null, // Cambiado de undefined a null para consistencia
};