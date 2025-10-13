// schemas/academicWeek.schema.ts
import { z } from 'zod';

// ✅ Schema para WeekType
export const weekTypeSchema = z.enum(['REGULAR', 'EVALUATION', 'REVIEW']);

// ✅ Schema principal para crear semana académica
export const academicWeekSchema = z.object({
    bimesterId: z.number()
        .int("Debe ser un número entero")
        .positive("El ID del bimestre debe ser positivo"),
    number: z.number()
        .int("Debe ser un número entero")
        .min(1, "El número de semana debe ser al menos 1")
        .max(9, "El número de semana no puede exceder 9"), // ✅ Cambiado a 9
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
        .optional(),
    
    // ✅ NUEVO: Tipo de semana
    weekType: weekTypeSchema.default('REGULAR'),
})
.refine(data => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return startDate < endDate;
}, {
    message: "La fecha de inicio debe ser anterior a la fecha de fin",
    path: ["endDate"]
})
.refine(data => {
    // ✅ Si es EVALUATION, debe ser número 9
    if (data.weekType === 'EVALUATION' && data.number !== 9) {
        return false;
    }
    return true;
}, {
    message: "Las semanas de evaluación deben tener el número 9",
    path: ["number"]
})
.refine(data => {
    // ✅ Si es REGULAR o REVIEW, debe ser 1-8
    if ((data.weekType === 'REGULAR' || data.weekType === 'REVIEW') && data.number > 8) {
        return false;
    }
    return true;
}, {
    message: "Las semanas regulares y de repaso deben tener números del 1 al 8",
    path: ["number"]
});

// ✅ Schema para actualizar semana académica
export const updateAcademicWeekSchema = z.object({
    bimesterId: z.number()
        .int("Debe ser un número entero")
        .positive("El ID del bimestre debe ser positivo")
        .optional(),
    number: z.number()
        .int("Debe ser un número entero")
        .min(1, "El número de semana debe ser al menos 1")
        .max(9, "El número de semana no puede exceder 9") // ✅ Cambiado a 9
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
        .optional(),
    
    // ✅ NUEVO: Permitir actualizar el tipo
    weekType: weekTypeSchema.optional(),
})
.refine((data) => Object.keys(data).length > 0, {
    message: "Al menos un campo debe ser proporcionado para actualizar"
})
.refine((data) => {
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

// ✅ Schema para generar semanas
export const generateWeeksSchema = z.object({
    weeksCount: z.number()
        .int("Debe ser un número entero")
        .min(1, "Debe generar al menos 1 semana")
        .max(8, "No puede generar más de 8 semanas") // ✅ Cambiado a 8
        .default(8)
        .optional(),
    
    // ✅ NUEVO: Opción para incluir semana de evaluación
    includeEvaluationWeek: z.boolean()
        .default(true)
        .optional()
});

// ✅ Schema para filtros
export const academicWeekFiltersSchema = z.object({
    bimesterId: z.number().int().positive().optional(),
    number: z.number().int().min(1).max(9).optional(), // ✅ Cambiado a 9
    weekType: weekTypeSchema.optional(), // ✅ NUEVO
});

// ✅ Tipos exportados
export type WeekType = z.infer<typeof weekTypeSchema>;
export type AcademicWeekFormValues = z.infer<typeof academicWeekSchema>;
export type UpdateAcademicWeekFormValues = z.infer<typeof updateAcademicWeekSchema>;
export type GenerateWeeksFormValues = z.infer<typeof generateWeeksSchema>;
export type AcademicWeekFiltersValues = z.infer<typeof academicWeekFiltersSchema>;

// ✅ Valores por defecto
export const defaultValues: AcademicWeekFormValues = {
    bimesterId: 0,
    number: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    objectives: "",
    weekType: 'REGULAR' // ✅ NUEVO
};

export const defaultGenerateValues: GenerateWeeksFormValues = {
    weeksCount: 8,
    includeEvaluationWeek: true // ✅ NUEVO
};

// ✅ NUEVO: Constantes útiles
export const WEEK_TYPE_OPTIONS = [
    { value: 'REGULAR', label: 'Semana Regular' },
    { value: 'EVALUATION', label: 'Semana de Evaluación' },
    { value: 'REVIEW', label: 'Semana de Repaso' },
] as const;

export const MAX_REGULAR_WEEKS = 8;
export const EVALUATION_WEEK_NUMBER = 9;