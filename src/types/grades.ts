// types/grades.ts
export type GradeLevel = 'Primaria' | 'Secundaria' | 'Kinder'; // Ejemplo, ajusta según tus necesidades

export interface Grade {
  id: number;
  name: string;
  level: GradeLevel;
  order: number;
  isActive: boolean;
 
}

// Tipo para crear/editar un grado (sin ID ni campos autogenerados)
export interface GradeFormValues {
  name: string;
  level: GradeLevel;
  order: number;
  isActive: boolean;
}