// types/grades.ts
export type GradeLevel = 'Primaria' | 'Secundaria' | 'Kinder';

export interface Grade {
  id: number;
  name: string;
  level: GradeLevel;
  order: number;
  isActive: boolean;
}

// Tipo para crear un grado
export interface CreateGradeRequest {
  name: string;
  level: GradeLevel;
  order: number;
  isActive: boolean;
}

// Tipo para actualizar un grado (todos los campos opcionales)
export interface UpdateGradeRequest {
  name?: string;
  level?: GradeLevel;
  order?: number;
  isActive?: boolean;
}

// Tipo para formularios (mantener compatibilidad)
export interface GradeFormValues {
  name: string;
  level: GradeLevel;
  order: number;
  isActive: boolean;
}

// Filtros para buscar grados
export interface GradeFilters {
  level?: GradeLevel;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: 'name' | 'level' | 'order' | 'createdAt';
  orderDirection?: 'asc' | 'desc';
}

// Respuesta paginada
export interface GradeResponse {
  data: Grade[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Estadísticas de grados
export interface GradeStats {
  totalGrades: number;
  activeGrades: number;
  inactiveGrades: number;
  gradesByLevel: {
    level: GradeLevel;
    count: number;
  }[];
  averageStudentsPerGrade?: number;
}