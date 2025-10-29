// src/schemas/school-cycle.schema.ts

import { z } from 'zod';

export const createSchoolCycleSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  description: z.string().max(500).optional(),
  academicYear: z.number().int().min(2000).max(2100).optional(),
  startDate: z.string().datetime('Fecha de inicio inválida'),
  endDate: z.string().datetime('Fecha de fin inválida'),
  isActive: z.boolean().optional().default(false),
  canEnroll: z.boolean().optional().default(false),
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  { message: 'La fecha de inicio debe ser anterior a la fecha de fin', path: ['startDate'] }
).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const durationDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return durationDays >= 180 && durationDays <= 400;
  },
  { message: 'La duración debe estar entre 180 y 400 días', path: ['endDate'] }
);

export const updateSchoolCycleSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100).optional(),
  description: z.string().max(500).optional(),
  academicYear: z.number().int().min(2000).max(2100).optional(),
  startDate: z.string().datetime('Fecha de inicio inválida').optional(),
  endDate: z.string().datetime('Fecha de fin inválida').optional(),
  isActive: z.boolean().optional(),
  canEnroll: z.boolean().optional(),
  archiveReason: z.string().max(500).optional(), // ← CHANGED: was closedReason
}).partial().refine(
  (data) => {
    if (!data.startDate || !data.endDate) return true;
    return new Date(data.startDate) < new Date(data.endDate);
  },
  { message: 'La fecha de inicio debe ser anterior a la fecha de fin', path: ['startDate'] }
).refine(
  (data) => {
    if (!data.startDate || !data.endDate) return true;
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const durationDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return durationDays >= 180 && durationDays <= 400;
  },
  { message: 'La duración debe estar entre 180 y 400 días', path: ['endDate'] }
);

export const querySchoolCyclesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  isArchived: z.coerce.boolean().optional(), // ← CHANGED: was isClosed
  canEnroll: z.coerce.boolean().optional(),
  year: z.coerce.number().int().optional(),
  sortBy: z.enum(['name', 'startDate', 'endDate', 'createdAt']).optional().default('startDate'), // ← CHANGED: default was createdAt, now startDate
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  includeBimesters: z.coerce.boolean().optional().default(false),
}).partial();