// src/types/courses.ts
export type CourseArea = 'Científica' | 'Humanística' | 'Sociales' | 'Tecnológica' | 'Artística' | 'Idiomas' | 'Educación Física';

export interface Course {
  id: number;
  code: string;
  name: string;
  area?: CourseArea | null;
  color?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseWithRelations extends Course {
  cycles?: Array<{ id: number; name: string }>;
  courseGrades?: CourseGradeRelation[];
  schedules?: CourseSchedule[];
}

// Añade esta interfaz para la relación curso-grado
export interface CourseGradeRelation {
  id: number;
  courseId: number;
  gradeId: number;
  isCore: boolean;
  grade?: {
    id: number;
    name: string;
    level: string;
  };
}

// Añade esta interfaz para los filtros
export interface CourseFilters {
  isActive?: boolean;
  area?: CourseArea;
  searchQuery?: string;
  gradeId?: number;
}

export interface CourseSchedule {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroom?: string;
  section: {
    id: number;
    name: string;
    grade: {
      id: number;
      name: string;
    };
  };
  teacher?: {
    id: number;
    name: string;
  };
}

export interface CourseFormValues {
  code: string;
  name: string;
  area?: CourseArea | null;
  color?: string | null;
  isActive: boolean;
}

export interface CourseGradeFormValues {
  gradeId: number;
  isCore: boolean;
}