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
  createdById?: number | null;
  modifiedById?: number | null;
}

export interface CourseWithRelations extends Course {
  _count?: {
    schedules: number;
    students: number;
  };
  cycles?: Array<{ id: number; name: string }>;
  courseGrades?: CourseGradeRelation[];
  schedules?: CourseSchedule[];
  createdBy?: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
  modifiedBy?: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
}

// Relación curso-grado
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

// Filtros
export interface CourseFilters {
  isActive?: boolean;
  area?: CourseArea;
  searchQuery?: string;
  gradeId?: number;
}

// Horarios del curso
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

// Formulario de curso
export interface CourseFormValues {
  code: string;
  name: string;
  area?: CourseArea | null;
  color?: string | null;
  isActive: boolean;
}

// DTOs
export interface CreateCourseDto {
  code: string;
  name: string;
  area?: CourseArea | null;
  color?: string | null;
  isActive?: boolean;
}

export interface UpdateCourseDto {
  code?: string;
  name?: string;
  area?: CourseArea | null;
  color?: string | null;
  isActive?: boolean;
}

export interface PaginatedCourses {
  data: Course[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CourseGradeFormValues {
  gradeId: number;
  isCore: boolean;
}
