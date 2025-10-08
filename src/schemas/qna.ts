// ============================================
// 2. SCHEMAS ZOD - src/schemas/qna.ts
// ============================================

import { z } from 'zod';

// Esquema para crear configuración ERICA
export const createConfigSchema = z.object({
  configType: z.enum(['color_ranges', 'system', 'scales']),
  configKey: z.string().min(1, "La clave de configuración es requerida"),
  configValue: z.string().min(1, "El valor de configuración es requerido"),
  description: z.string().optional(),
  category: z.enum(['colors', 'system', 'scales']).optional(),
  isActive: z.boolean().default(true)
});

// Esquema para actualizar configuración ERICA
export const updateConfigSchema = z.object({
  configType: z.enum(['color_ranges', 'system', 'scales']).optional(),
  configKey: z.string().min(1, "La clave de configuración es requerida").optional(),
  configValue: z.string().min(1, "El valor de configuración es requerido").optional(),
  description: z.string().optional(),
  category: z.enum(['colors', 'system', 'scales']).optional(),
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Al menos un campo debe ser proporcionado para actualizar',
});

// Esquema para obtener grid QNA
export const getQnaGridSchema = z.object({
  cycleId: z.number().int().positive(),
  bimesterId: z.number().int().positive(),
  gradeId: z.number().int().positive(),
  sectionId: z.number().int().positive(),
  courseId: z.number().int().positive(),
  teacherId: z.number().int().positive(),
  includeCalculated: z.boolean().optional().default(true),
  forceRecalculate: z.boolean().optional().default(false)
});

// Esquema para recalcular QNA
export const recalculateQnaSchema = z.object({
  enrollmentIds: z.array(z.number().int().positive()).optional(),
  calculationTypes: z.array(z.enum(['QNA1', 'QNA2', 'QNA3', 'QNA4', 'MONTHLY1', 'MONTHLY2', 'BIMESTRAL'])).optional(),
  bimesterId: z.number().int().positive(),
  courseId: z.number().int().positive()
});

// Tipos inferidos
export type CreateConfigFormValues = z.infer<typeof createConfigSchema>;
export type UpdateConfigFormValues = z.infer<typeof updateConfigSchema>;
export type GetQnaGridFormValues = z.infer<typeof getQnaGridSchema>;
export type RecalculateQnaFormValues = z.infer<typeof recalculateQnaSchema>;

// Valores por defecto
export const defaultConfigValues: CreateConfigFormValues = {
  configType: 'system',
  configKey: '',
  configValue: '',
  description: '',
  category: 'system',
  isActive: true
};

export const defaultUpdateConfigValues: UpdateConfigFormValues = {};

export const defaultGridValues: GetQnaGridFormValues = {
  cycleId: 0,
  bimesterId: 0,
  gradeId: 0,
  sectionId: 0,
  courseId: 0,
  teacherId: 0,
  includeCalculated: true,
  forceRecalculate: false
};