import { z } from 'zod';

/**
 * Schemas de validación para el módulo de Cotejos
 */

// ==================== SCHEMAS BASE ====================

export const ActitudinalScoreSchema = z
  .number()
  .min(0, 'La puntuación actitudinal no puede ser menor a 0')
  .max(20, 'La puntuación actitudinal no puede ser mayor a 20');

export const DeclarativoScoreSchema = z
  .number()
  .min(0, 'La puntuación declarativa no puede ser menor a 0')
  .max(30, 'La puntuación declarativa no puede ser mayor a 30');

export const FeedbackSchema = z
  .string()
  .max(500, 'El feedback no puede exceder 500 caracteres')
  .optional();

// ==================== GENERATE COTEJO ====================

export const GenerateCotejoSchema = z.object({
  feedback: FeedbackSchema,
});

export type GenerateCotejoInput = z.infer<typeof GenerateCotejoSchema>;

// ==================== UPDATE ACTITUDINAL ====================

export const UpdateActitudinalSchema = z.object({
  actitudinalScore: ActitudinalScoreSchema,
  feedback: FeedbackSchema,
});

export type UpdateActitudinalInput = z.infer<typeof UpdateActitudinalSchema>;

// ==================== UPDATE DECLARATIVO ====================

export const UpdateDeclarativoSchema = z.object({
  declarativoScore: DeclarativoScoreSchema,
  feedback: FeedbackSchema,
});

export type UpdateDeclarativoInput = z.infer<typeof UpdateDeclarativoSchema>;

// ==================== SUBMIT COTEJO ====================

export const SubmitCotejoSchema = z.object({
  feedback: FeedbackSchema,
});

export type SubmitCotejoInput = z.infer<typeof SubmitCotejoSchema>;

// ==================== QUERY VALIDATORS ====================

export const CascadeQuerySchema = z.object({
  includeInactive: z.enum(['true', 'false']).optional().default('false'),
});

export type CascadeQueryInput = z.infer<typeof CascadeQuerySchema>;

export const CotejoBySectionQuerySchema = z.object({
  bimesterId: z.string().regex(/^\d+$/, 'bimesterId debe ser un número'),
  cycleId: z.string().regex(/^\d+$/, 'cycleId debe ser un número'),
});

export type CotejoBySectionQueryInput = z.infer<typeof CotejoBySectionQuerySchema>;
