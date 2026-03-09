// src/schemas/grade-range.ts

import { z } from 'zod';

// Esquema para crear rango de calificaciones
export const gradeRangeSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre no puede exceder 50 caracteres"),
  description: z.string().max(200, "La descripción no puede exceder 200 caracteres").optional().nullable(),
  minScore: z.number().min(0, "La puntuación mínima debe ser 0 o mayor").max(100, "La puntuación mínima no puede exceder 100"),
  maxScore: z.number().min(0, "La puntuación máxima debe ser 0 o mayor").max(100, "La puntuación máxima no puede exceder 100"),
  hexColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "El color debe estar en formato hexadecimal válido (ej: #FF0000)"),
  level: z.enum(['Primaria', 'Secundaria', 'Preparatoria', 'all']).optional(),
  letterGrade: z.string().max(2, "La letra de calificación no puede exceder 2 caracteres").optional().nullable(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => data.minScore <= data.maxScore,
  {
    message: "La puntuación mínima debe ser menor o igual a la máxima",
    path: ["minScore"],
  }
).refine(
  (data) => !data.letterGrade || data.level === 'Preparatoria',
  {
    message: "La letra de calificación solo se puede usar con el nivel Preparatoria",
    path: ["letterGrade"],
  }
);

// Esquema para actualizar rango (todos los campos opcionales)
export const updateGradeRangeSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre no puede exceder 50 caracteres").optional(),
  description: z.string().max(200, "La descripción no puede exceder 200 caracteres").optional().nullable(),
  minScore: z.number().min(0, "La puntuación mínima debe ser 0 o mayor").max(100, "La puntuación mínima no puede exceder 100").optional(),
  maxScore: z.number().min(0, "La puntuación máxima debe ser 0 o mayor").max(100, "La puntuación máxima no puede exceder 100").optional(),
  hexColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "El color debe estar en formato hexadecimal válido").optional(),
  level: z.enum(['Primaria', 'Secundaria', 'Preparatoria', 'all']).optional(),
  letterGrade: z.string().max(2, "La letra de calificación no puede exceder 2 caracteres").optional().nullable(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => !data.minScore || !data.maxScore || data.minScore <= data.maxScore,
  {
    message: "La puntuación mínima debe ser menor o igual a la máxima",
    path: ["minScore"],
  }
).refine(
  (data) => !data.letterGrade || data.level === 'Preparatoria',
  {
    message: "La letra de calificación solo se puede usar con el nivel Preparatoria",
    path: ["letterGrade"],
  }
);

// Tipos inferidos
export type GradeRangeFormValues = z.infer<typeof gradeRangeSchema>;
export type UpdateGradeRangeFormValues = z.infer<typeof updateGradeRangeSchema>;

// Valores por defecto
export const defaultValues: GradeRangeFormValues = {
  name: '',
  description: '',
  minScore: 0,
  maxScore: 100,
  hexColor: '#0d9488',
  level: 'all',
  letterGrade: null,
  isActive: true,
};

// Valores por defecto para actualización
export const defaultUpdateValues: UpdateGradeRangeFormValues = {};
