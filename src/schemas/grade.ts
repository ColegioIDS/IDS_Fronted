import { z } from 'zod';

// Esquema para crear grado
export const gradeSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    level: z.enum(['Primaria', 'Secundaria', 'Kinder']),
    order: z.number().int().positive("El orden debe ser un número positivo"),
    isActive: z.boolean(),
});

// Esquema para actualizar grado (todos los campos opcionales)
export const updateGradeSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").optional(),
    level: z.enum(['Primaria', 'Secundaria', 'Kinder']).optional(),
    order: z.number().int().positive("El orden debe ser un número positivo").optional(),
    isActive: z.boolean().optional(),
});

// Tipos inferidos
export type GradeFormValues = z.infer<typeof gradeSchema>;
export type UpdateGradeFormValues = z.infer<typeof updateGradeSchema>;

// Valores por defecto
export const defaultValues: GradeFormValues = {
    name: '',
    level: 'Primaria',
    order: 1,
    isActive: true,
};

// Valores por defecto para actualización (vacío)
export const defaultUpdateValues: UpdateGradeFormValues = {};