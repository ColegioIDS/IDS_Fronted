import { z } from 'zod';

export const gradeSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    level: z.enum(['Primaria', 'Secundaria', 'Kinder']),
    order: z.number().int().positive("El orden debe ser un número positivo"),
    isActive: z.boolean(),
});
export type GradeFormValues = z.infer<typeof gradeSchema>;

export const defaultValues: z.infer<typeof gradeSchema> = {
    name: '',
    level: 'Primaria',
    order: 1,
    isActive: true,
};



