// Tipo base para CourseGrade
export interface CourseGrade {
  id: number;
  courseId: number;
  gradeId: number;
  isCore: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Tipo extendido con relaciones (para cuando incluyes course y grade en las consultas)
export interface CourseGradeWithRelations extends CourseGrade {
  course: {
    id: number;
    name: string;
    code?: string;
    color: string;
    // Agrega otros campos de Course que necesites
  };
  grade: {
    id: number;
    name: string;
    level: string;
    order: number;
    isActive: boolean;
    // Agrega otros campos de Grade que necesites
  };
}

// Tipo para crear un nuevo CourseGrade
export interface CreateCourseGradeDto {
  courseId: number;
  gradeId: number;
  isCore?: boolean;
}

// Tipo para actualizar un CourseGrade
export interface UpdateCourseGradeDto {
  isCore?: boolean;
}

// Tipo para los filtros de búsqueda
export interface CourseGradeFilters {
  courseId?: number;
  gradeId?: number;
  isCore?: boolean;
}

// Tipo para la respuesta paginada (si usas paginación)
export interface PaginatedCourseGradeResponse {
  data: CourseGradeWithRelations[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

// Tipo para los datos de formulario
export interface CourseGradeFormValues {
  courseId: number | null;
  gradeId: number | null;
  isCore: boolean;
}

// Enums útiles
export enum CourseGradeCoreStatus {
  CORE = 'true',
  ELECTIVE = 'false',
  ALL = 'all',
}


export interface CourseGradeFilters {
  search?: string;
  level?: string;
  type?: 'core' | 'elective' | 'all';
  courseId?: number;
  gradeId?: number;
}



interface CourseGradeTableProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}
