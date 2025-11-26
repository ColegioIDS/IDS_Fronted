// src/types/course-grades.types.ts

// ✅ CourseGrade base
export interface CourseGrade {
  id: number;
  courseId: number;
  gradeId: number;
  isCore: boolean;
}

// ✅ CourseGrade con relaciones
export interface CourseGradeDetail {
  id: number;
  courseId: number;
  gradeId: number;
  isCore: boolean;
  course: {
    id: number;
    code: string;
    name: string;
    description: string | null;
    area: string | null;
    isActive?: boolean;
  };
  grade: {
    id: number;
    name: string;
    level: string;
    order: number;
    isActive?: boolean;
  };
}

// ✅ Datos disponibles para selectores
export interface AvailableCourse {
  id: number;
  code: string;
  name: string;
  area: string | null;
  isActive: boolean;
}

export interface AvailableGrade {
  id: number;
  name: string;
  level: string;
  order: number;
  isActive: boolean;
}

// ✅ Estadísticas
export interface CourseGradeStats {
  courseId: number;
  totalGrades: number;
  coreGrades: number;
  electives: number;
}

// ✅ Query params
export interface CourseGradesQuery {
  page?: number;
  limit?: number;
  courseId?: number;
  gradeId?: number;
  isCore?: boolean;
  sortBy?: 'courseId' | 'gradeId' | 'isCore';
  sortOrder?: 'asc' | 'desc';
}

// ✅ Paginated response
export interface PaginatedCourseGrades {
  data: CourseGradeDetail[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ✅ Create/Update DTOs
export interface CreateCourseGradeDto {
  courseId: number;
  gradeId: number;
  isCore?: boolean;
}

export interface UpdateCourseGradeDto {
  isCore?: boolean;
}

// ✅ Response para disponibles
export interface AvailableDataResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
