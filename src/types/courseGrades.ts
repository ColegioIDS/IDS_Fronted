// src/types/courseGrades.ts

/**
 * Tipo para un Grado académico
 */
export interface Grade {
  id: number;
  name: string;
  level: string;
  order: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Tipo para un Curso en el contexto de course-grades
 */
export interface CourseForGrade {
  id: number;
  code: string;
  name: string;
  area?: string | null;
  color?: string | null;
  isActive: boolean;
  _count?: {
    courseGrades: number;
    assignments: number;
    studentGrades: number;
    courseAssignments: number;
    schedules: number;
  };
}

/**
 * Relación entre Curso y Grado
 */
export interface CourseGrade {
  id: number;
  courseId: number;
  gradeId: number;
  isCore: boolean;
  course?: CourseForGrade;
  grade?: Grade;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Relación con relaciones completas
 */
export interface CourseGradeWithRelations extends CourseGrade {
  course: CourseForGrade;
  grade: Grade;
  _count?: {
    courseAssignments: number;
    studentGrades: number;
  };
}

/**
 * Datos para crear una relación
 */
export interface CreateCourseGradeDto {
  courseId: number;
  gradeId: number;
  isCore?: boolean;
}

/**
 * Datos para actualizar una relación
 */
export interface UpdateCourseGradeDto {
  isCore?: boolean;
}

/**
 * Filtros para búsqueda
 */
export interface CourseGradeFilters {
  searchQuery?: string;
  courseId?: number;
  gradeId?: number;
  isCore?: boolean;
}

/**
 * Respuesta paginada
 */
export interface PaginatedCourseGrades {
  data: CourseGradeWithRelations[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Datos del formulario
 */
export interface CourseGradeFormValues {
  courseId: number;
  gradeId: number;
  isCore: boolean;
}
