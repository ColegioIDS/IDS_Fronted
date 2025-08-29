// ==========================================
// src/schemas/gradeCycle.ts
// ==========================================

import { z } from 'zod';

// Esquema para crear relación grado-ciclo individual
export const gradeCycleSchema = z.object({
  cycleId: z.number().int().positive("El ID del ciclo debe ser positivo"),
  gradeId: z.number().int().positive("El ID del grado debe ser positivo")
});

// Esquema para configuración masiva de grados en un ciclo
export const bulkGradeCycleSchema = z.object({
  cycleId: z.number().int().positive("El ID del ciclo debe ser positivo"),
  gradeIds: z.array(z.number().int().positive())
    .min(1, "Debe seleccionar al menos un grado")
    .max(20, "Máximo 20 grados por ciclo")
});

// Esquema para filtros (opcional)
export const gradeCycleFiltersSchema = z.object({
  cycleId: z.number().int().positive().optional(),
  gradeId: z.number().int().positive().optional()
}).optional();

// Tipos inferidos
export type GradeCycleFormValues = z.infer<typeof gradeCycleSchema>;
export type BulkGradeCycleFormValues = z.infer<typeof bulkGradeCycleSchema>;
export type GradeCycleFiltersValues = z.infer<typeof gradeCycleFiltersSchema>;

// Valores por defecto
export const defaultGradeCycleValues: GradeCycleFormValues = {
  cycleId: 0,
  gradeId: 0
};

export const defaultBulkGradeCycleValues: BulkGradeCycleFormValues = {
  cycleId: 0,
  gradeIds: []
};