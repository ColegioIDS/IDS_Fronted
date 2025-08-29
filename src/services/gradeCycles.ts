import { z } from 'zod';
// Esquemas de validación
export const createGradeCycleSchema = z.object({
  cycleId: z.number().int().positive("El ID del ciclo debe ser positivo"),
  gradeId: z.number().int().positive("El ID del grado debe ser positivo")
});

export const bulkCreateGradeCycleSchema = z.object({
  cycleId: z.number().int().positive("El ID del ciclo debe ser positivo"),
  gradeIds: z.array(z.number().int().positive())
    .min(1, "Debe seleccionar al menos un grado")
    .max(20, "Máximo 20 grados por ciclo")
});

// Tipos para formularios
export type CreateGradeCycleRequest = z.infer<typeof createGradeCycleSchema>;
export type BulkCreateGradeCycleRequest = z.infer<typeof bulkCreateGradeCycleSchema>;

// Filtros
export interface GradeCycleFilters {
  cycleId?: number;
  gradeId?: number;
}

// Valores por defecto
export const defaultGradeCycleValues: CreateGradeCycleRequest = {
  cycleId: 0,
  gradeId: 0
};

export const defaultBulkGradeCycleValues: BulkCreateGradeCycleRequest = {
  cycleId: 0,
  gradeIds: []
};