//src\schemas\courses.ts
import { z } from 'zod';

// Definición de áreas permitidas (ajusta según tus necesidades)
const courseAreas = [
  'Científica',
  'Humanística',
  'Sociales',
  'Tecnológica',
  'Artística',
  'Idiomas',
  'Educación Física'
] as const;

// Esquema principal para el formulario de cursos
export const courseSchema = z.object({
  code: z.string()
    .min(3, "El código debe tener al menos 3 caracteres")
    .max(20, "El código no puede exceder 20 caracteres")
    .regex(/^[A-Z0-9-]+$/, "Solo letras mayúsculas, números y guiones"),
  name: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  area: z.enum(courseAreas).optional().nullable(),
  color: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
      message: 'Color debe ser un código HEX válido (ej: #FF5733 o #f53)'
    })
    .optional()
    .nullable(),
  isActive: z.boolean()
});

// Tipo inferido del esquema
export type CourseFormValues = z.infer<typeof courseSchema>;

// Valores por defecto para el formulario
export const defaultCourseValues: CourseFormValues = {
  code: '',
  name: '',
  area: null,
  color: null,
  isActive: true
};

// Esquema extendido para la relación con grados
export const courseGradeRelationSchema = z.object({
  gradeId: z.number().int().positive(),
  isCore: z.boolean().default(true)
});

// Tipo para el formulario de relación curso-grado
export type CourseGradeRelationValues = z.infer<typeof courseGradeRelationSchema>;