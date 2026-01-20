// src/schemas/erica-colors.ts

import { z } from 'zod';

/**
 * Validación para color hexadecimal
 */
export const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-F]{6}$/i, 'Color hexadecimal inválido. Formato: #RRGGBB')
  .transform((val) => val.toUpperCase());

/**
 * Validación para dimensión ERICA
 */
export const ericaDimensionSchema = z.enum([
  'EJECUTA',
  'RETIENE',
  'INTERPRETA',
  'CONOCE',
  'APLICA',
]);

/**
 * Validación para estado ERICA
 */
export const ericaStateSchema = z.enum(['E', 'B', 'P', 'C', 'N']);

/**
 * Schema para actualizar color
 */
export const updateColorSchema = z.object({
  colorHex: hexColorSchema,
});

/**
 * Schema para configuración de color
 */
export const colorConfigSchema = z.object({
  dimension: ericaDimensionSchema.optional(),
  state: ericaStateSchema.optional(),
  colorHex: hexColorSchema,
  colorRgb: z
    .object({
      r: z.number().min(0).max(255),
      g: z.number().min(0).max(255),
      b: z.number().min(0).max(255),
    })
    .optional(),
  description: z.string().optional(),
});

/**
 * Types inferidos de los schemas
 */
export type UpdateColorInput = z.infer<typeof updateColorSchema>;
export type ColorConfigInput = z.infer<typeof colorConfigSchema>;
export type EricaDimensionInput = z.infer<typeof ericaDimensionSchema>;
export type EricaStateInput = z.infer<typeof ericaStateSchema>;
