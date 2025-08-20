import { z } from 'zod';

export const academicWeekSchema = z.object({
    bimesterId: z.number()
        .int("Debe ser un número entero")
        .positive("El ID del bimestre debe ser positivo"),
    number: z.number()
        .int("Debe ser un número entero")
        .min(1, "El número de semana debe ser al menos 1")
        .max(20, "El número de semana no puede exceder 20"),
    startDate: z.string()
        .min(1, "La fecha de inicio es requerida")
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "Debe ser una fecha válida"
        }),
    endDate: z.string()
        .min(1, "La fecha de fin es requerida")
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "Debe ser una fecha válida"
        }),
    objectives: z.string()
        .min(10, "Los objetivos deben tener al menos 10 caracteres")
        .max(1000, "Los objetivos no pueden exceder 1000 caracteres")
        .optional()
}).refine(data => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return startDate < endDate;
}, {
    message: "La fecha de inicio debe ser anterior a la fecha de fin",
    path: ["endDate"]
});

export const updateAcademicWeekSchema = z.object({
    bimesterId: z.number()
        .int("Debe ser un número entero")
        .positive("El ID del bimestre debe ser positivo")
        .optional(),
    number: z.number()
        .int("Debe ser un número entero")
        .min(1, "El número de semana debe ser al menos 1")
        .max(20, "El número de semana no puede exceder 20")
        .optional(),
    startDate: z.string()
        .min(1, "La fecha de inicio es requerida")
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "Debe ser una fecha válida"
        })
        .optional(),
    endDate: z.string()
        .min(1, "La fecha de fin es requerida")
        .refine((date) => !isNaN(Date.parse(date)), {
            message: "Debe ser una fecha válida"
        })
        .optional(),
    objectives: z.string()
        .min(10, "Los objetivos deben tener al menos 10 caracteres")
        .max(1000, "Los objetivos no pueden exceder 1000 caracteres")
        .optional()
}).refine((data) => Object.keys(data).length > 0, {
    message: "Al menos un campo debe ser proporcionado para actualizar"
}).refine((data) => {
    if (data.startDate && data.endDate) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        return startDate < endDate;
    }
    return true;
}, {
    message: "La fecha de inicio debe ser anterior a la fecha de fin",
    path: ["endDate"]
});

export const generateWeeksSchema = z.object({
    weeksCount: z.number()
        .int("Debe ser un número entero")
        .min(1, "Debe generar al menos 1 semana")
        .max(20, "No puede generar más de 20 semanas")
        .default(8)
        .optional()
});

export const academicWeekFiltersSchema = z.object({
    bimesterId: z.number().int().positive().optional(),
    number: z.number().int().min(1).max(20).optional()
});

export type AcademicWeekFormValues = z.infer<typeof academicWeekSchema>;
export type UpdateAcademicWeekFormValues = z.infer<typeof updateAcademicWeekSchema>;
export type GenerateWeeksFormValues = z.infer<typeof generateWeeksSchema>;
export type AcademicWeekFiltersValues = z.infer<typeof academicWeekFiltersSchema>;

export const defaultValues: AcademicWeekFormValues = {
    bimesterId: 0,
    number: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    objectives: ""
};

export const defaultGenerateValues: GenerateWeeksFormValues = {
    weeksCount: 8
};