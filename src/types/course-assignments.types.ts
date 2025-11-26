// src/types/course-assignments.types.ts

export type AssignmentType = 'titular' | 'apoyo' | 'temporal' | 'suplente';

// ==================== BASIC TYPES ====================

export interface CourseAssignment {
  id: number;
  sectionId: number;
  courseId: number;
  teacherId: number;
  assignmentType: AssignmentType;
  isActive: boolean;
  assignedAt: Date | string;
  notes: string | null;
  section: {
    id: number;
    name: string;
    capacity: number;
    gradeId: number;
    grade: {
      id: number;
      name: string;
      level: string;
      order: number;
    };
  };
  course: {
    id: number;
    code: string;
    name: string;
    area: string | null;
    color: string | null;
    isActive: boolean;
  };
  teacher: {
    id: number;
    givenNames: string;
    lastNames: string;
    fullName: string;
    email: string | null;
  };
  _count?: {
    schedules: number;
    history: number;
  };
}

// ==================== QUERY & FILTER TYPES ====================

export interface CourseAssignmentFilters {
  page?: number;
  limit?: number;
  search?: string;
  sectionId?: number;
  courseId?: number;
  teacherId?: number;
  gradeId?: number;
  assignmentType?: AssignmentType;
  isActive?: boolean;
  sortBy?: 'assignedAt' | 'teacherName' | 'courseName' | 'sectionName' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedCourseAssignments {
  data: CourseAssignment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ==================== FORM DATA TYPES ====================

export interface AvailableSection {
  id: number;
  name: string;
  gradeId: number;
  gradeName: string;
  gradeLevel: string;
  capacity: number;
}

export interface AvailableCourse {
  id: number;
  name: string;
  code: string;
  area: string | null;
  isActive: boolean;
}

export interface AvailableTeacher {
  id: number;
  givenNames: string;
  lastNames: string;
  fullName: string;
  email: string | null;
  isActive: boolean;
}

export interface CourseAssignmentFormData {
  cycles: Array<{
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  }>;
}

// Datos del ciclo con grados y secciones
export interface CycleGradesData {
  cycle: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
  };
  grades: Array<{
    id: number;
    name: string;
    level: string;
    order: number;
    sections: Array<{
      id: number;
      name: string;
      capacity: number;
      gradeId: number;
      teacherId: number | null;
      teacher: {
        id: number;
        givenNames: string;
        lastNames: string;
        fullName: string;
        email: string | null;
      } | null;
    }>;
  }>;
}

// ==================== SECTION DATA TYPES ====================

export interface SectionAssignmentData {
  section: {
    id: number;
    name: string;
    capacity: number;
    gradeId: number;
    teacherId: number | null;
    // Soportar ambas estructuras del backend
    grade?: {
      id: number;
      name: string;
      level: string;
    };
    gradeName?: string;
    gradeLevel?: string;
    teacher: {
      id: number;
      givenNames: string;
      lastNames: string;
      fullName: string;
      email: string | null;
    } | null;
  };
  assignments: Array<{
    id: number;
    courseId: number;
    teacherId: number;
    assignmentType: AssignmentType;
    isActive: boolean;
    assignedAt: Date | string;
    notes: string | null;
    course: {
      id: number;
      code: string;
      name: string;
      area: string | null;
      color: string | null;
    };
    teacher: {
      id: number;
      givenNames: string;
      lastNames: string;
      fullName: string;
      email: string | null;
    };
    _count: {
      schedules: number;
      history: number;
    };
  }>;
  availableCourses: Array<{
    id: number;
    code: string;
    name: string;
    area: string | null;
    color: string | null;
    isActive: boolean;
  }>;
  availableTeachers: Array<{
    id: number;
    givenNames: string;
    lastNames: string;
    fullName: string;
    email: string | null;
    isActive: boolean;
    // Propiedades adicionales del backend (opcionales)
    isTitular?: boolean;
    sections?: Array<{
      id: number;
      name: string;
      gradeId: number;
      gradeName: string;
      gradeLevel: string;
    }>;
  }>;
  totalAssignments: number;
}

// ==================== DTO TYPES ====================

export interface CreateCourseAssignmentDto {
  sectionId: number;
  courseId: number;
  teacherId: number;
  assignmentType?: AssignmentType;
  notes?: string;
}

export interface UpdateCourseAssignmentDto {
  teacherId?: number;
  assignmentType?: AssignmentType;
  notes?: string;
  isActive?: boolean;
}

export interface BulkCreateCourseAssignmentDto {
  assignments: CreateCourseAssignmentDto[];
}

export interface BulkUpdateCourseAssignmentDto {
  assignments: Array<{
    id: number;
    data: UpdateCourseAssignmentDto;
  }>;
}

// ==================== RESPONSE TYPES ====================

export interface BulkOperationResponse<T> {
  created?: T[];
  updated?: T[];
  failed: Array<{
    id?: number;
    data: any;
    error: string;
  }>;
}

export interface CourseAssignmentStats {
  totalAssignments: number;
  activeAssignments: number;
  inactiveAssignments: number;
  byAssignmentType: {
    titular: number;
    apoyo: number;
    temporal: number;
    suplente: number;
  };
  teachersWithAssignments: number;
  sectionsWithAssignments: number;
  coursesAssigned: number;
}

export interface TeacherCourse {
  id: number;
  courseId: number;
  sectionId: number;
  assignmentType: AssignmentType;
  course: {
    id: number;
    code: string;
    name: string;
    area: string | null;
  };
  section: {
    id: number;
    name: string;
    grade: {
      id: number;
      name: string;
      level: string;
    };
  };
}

export interface DeleteCourseAssignmentResponse {
  message: string;
  deleted: boolean; // true = hard delete, false = soft delete
}
