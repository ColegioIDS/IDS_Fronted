// ==========================================
// src/types/gradeCycles.ts
// ==========================================

// Tipo base para GradeCycle
export interface GradeCycle {
  id: number;
  cycleId: number;
  gradeId: number;
  grade: {
    id: number;
    name: string;
    level: string;
    order: number;
    isActive: boolean;
  };
  cycle: {
    id: number;
    name: string;
    isActive: boolean;
  };
}

// GradeCycle con información de secciones y capacidad
export interface GradeCycleWithSections extends GradeCycle {
  grade: GradeCycle['grade'] & {
    sections: {
      id: number;
      name: string;
      capacity: number;
      enrolledCount: number;
      availableSpaces: number;
      isFull: boolean;
    }[];
  };
  totalCapacity: number;
  totalEnrolled: number;
}

// Estadísticas de un ciclo
export interface CycleStats {
  gradeId: number;
  gradeName: string;
  level: string;
  sectionsCount: number;
  totalCapacity: number;
  enrolledCount: number;
  availableSpaces: number;
  occupancyRate: number;
}

// Resumen de configuración de un ciclo
export interface CycleSummary {
  cycle: {
    id: number;
    name: string;
    isActive: boolean;
    startDate: string;
    endDate: string;
  };
  gradesConfigured: number;
  totalEnrollments: number;
  isConfigured: boolean;
  hasEnrollments: boolean;
}

// Cursos disponibles para un ciclo
export interface CourseForCycle {
  id: number;
  code: string;
  name: string;
  area?: string;
  color?: string;
  isActive: boolean;
  courseGrades: {
    courseId: number;
    gradeId: number;
    isCore: boolean;
    grade: {
      id: number;
      name: string;
      level: string;
      order: number;
    };
  }[];
}

// Tipos para requests
export interface CreateGradeCycleRequest {
  cycleId: number;
  gradeId: number;
}

export interface BulkCreateGradeCycleRequest {
  cycleId: number;
  gradeIds: number[];
}

// Filtros para consultas
export interface GradeCycleFilters {
  cycleId?: number;
  gradeId?: number;
}