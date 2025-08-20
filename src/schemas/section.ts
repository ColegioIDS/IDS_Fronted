// src/schemas/section.schemas.ts
import { z } from 'zod';

// Schema para crear sección
export const createSectionSchema = z.object({
  name: z.string()
    .min(1, "El nombre es requerido")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .regex(/^[A-Za-z0-9\s]+$/, "El nombre solo puede contener letras, números y espacios"),
  
  capacity: z.number()
    .min(1, "La capacidad debe ser mayor a 0")
    .max(100, "La capacidad no puede exceder 100 estudiantes"),
  
  gradeId: z.string()
    .min(1, "El grado es requerido")
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Debe seleccionar un grado válido"
    }),
  
  teacherId: z.string().optional()
});

// Schema para actualizar sección
export const updateSectionSchema = z.object({
  name: z.string()
    .min(1, "El nombre es requerido")
    .max(10, "El nombre no puede exceder 10 caracteres")
    .regex(/^[A-Za-z0-9\s]+$/, "El nombre solo puede contener letras, números y espacios")
    .optional(),
  
  capacity: z.number()
    .min(1, "La capacidad debe ser mayor a 0")
    .max(100, "La capacidad no puede exceder 100 estudiantes")
    .optional(),
  
  gradeId: z.string()
    .min(1, "El grado es requerido")
    .refine(val => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Debe seleccionar un grado válido"
    })
    .optional(),
  
  teacherId: z.string().optional()
});

// Valores por defecto para formularios
export const defaultSectionValues = {
  name: '',
  capacity: 30,
  gradeId: '',
  teacherId: 'no-teacher'
};

// Schema para filtros
export const sectionFiltersSchema = z.object({
  gradeId: z.number().optional(),
  teacherId: z.number().optional(),
  search: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional()
});

// Tipos inferidos
export type CreateSectionSchemaType = z.infer<typeof createSectionSchema>;
export type UpdateSectionSchemaType = z.infer<typeof updateSectionSchema>;
export type SectionFiltersSchemaType = z.infer<typeof sectionFiltersSchema>;