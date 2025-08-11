// src/types/sections.ts
import type { User } from './user';
import type { Grade } from './grades';

// Tipo principal para Sección (simplificado)
export interface Section {
  id: number;
  name: string;        // Ejemplo: "A", "B", "C"
  capacity: number;
  gradeId: number;     // Relación obligatoria con grado
  teacherId?: number | null; // Relación opcional con usuario (teacher)
  grade: Grade;        // Usando tu tipo Grade existente
  teacher?: User | null; // Usando tu interfaz User completa
  order?: number;    // Orden de visualización
}

// Tipo para formularios
export interface SectionFormValues {
  name: string;
  capacity: number;
  gradeId: number;
  teacherId?: number | null; // ID del usuario (teacher)
}

// Tipo para dropdowns de selección
export interface SectionOption {
  value: number;       // ID de la sección
  label: string;       // Ejemplo: "1° Primaria - A"
  gradeId: number;     // Para filtrados
}

// Tipo filtrado para teachers (opcional)
export interface TeacherOption {
  value: number;       // user.id
  label: string;       // user.givenNames + user.lastNames
  isHomeroom?: boolean // user.teacherDetails?.isHomeroomTeacher
}