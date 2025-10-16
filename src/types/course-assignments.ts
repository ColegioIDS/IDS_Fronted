// types/course-assignments.ts

export type AssignmentType = 'titular' | 'specialist';

// ==================== TYPES BÁSICOS ====================

export interface Teacher {
  id: number;
  givenNames: string;
  lastNames: string;
  email?: string;
  fullName?: string;
}

export interface Course {
  id: number;
  name: string;
  code: string;
  area?: string | null;
  color?: string | null;
}

export interface Section {
  id: number;
  name: string;
  capacity: number;
  gradeId: number;
  teacherId: number | null;
  grade: {
    id: number;
    name: string;
    level: string;
    order: number;
  };
  teacher?: Teacher | null;
}

export interface Grade {
  id: number;
  name: string;
  level: string;
  order: number;
  sections: Section[];
}

export interface SchoolCycle {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

// ==================== ASIGNACIONES ====================

export interface CourseAssignment {
  id: number;
  sectionId: number;
  courseId: number;
  teacherId: number;
  assignmentType: AssignmentType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  section: Section;
  course: Course;
  teacher: Teacher;
}

// ==================== NUEVOS TIPOS CONSOLIDADOS ====================

// ✅ NUEVO: Datos del formulario (ciclo, grados, secciones, maestros)
export interface CourseAssignmentFormData {
  activeCycle: SchoolCycle;
  grades: Grade[];
  teachers: TeacherWithSections[];
}

// ✅ NUEVO: Maestro con sus secciones asignadas
export interface TeacherWithSections extends Teacher {
  fullName: string;
  sections: {
    id: number;
    name: string;
    gradeId: number;
    gradeName: string;
    gradeLevel: string;
  }[];
}

// ✅ NUEVO: Datos completos de una sección para asignación
export interface SectionAssignmentData {
  section: {
    id: number;
    name: string;
    capacity: number;
    gradeId: number;
    gradeName: string;
    gradeLevel: string;
    teacherId: number | null;
    teacher: Teacher | null;
  };
  courses: {
    id: number;
    code: string;
    name: string;
    area: string | null;
    color: string | null;
    isCore: boolean;
  }[];
  assignments: {
    id: number;
    courseId: number;
    courseName: string;
    courseCode: string;
    teacherId: number;
    teacherName: string;
    assignmentType: AssignmentType;
    isActive: boolean;
  }[];
  teachers: {
    id: number;
    givenNames: string;
    lastNames: string;
    fullName: string;
    email: string;
    isTitular: boolean;
    sections: {
      id: number;
      name: string;
      gradeId: number;
    }[];
  }[];
}

// ==================== TIPOS EXISTENTES ====================

export interface TeacherCourse extends Course {
  sectionId: number;
  sectionName: string;
  assignmentType: AssignmentType;
  assignmentId: number;
}

export interface GradeCourseConfig {
  id: number;
  name: string;
  teacher: Teacher;
  courseAssignments: {
    id: number;
    course: Course;
    teacher: Teacher;
    assignmentType: AssignmentType;
    isActive: boolean;
  }[];
}

export interface CreateCourseAssignmentRequest {
  sectionId: number;
  courseId: number;
  teacherId: number;
  isActive?: boolean;
}

export interface UpdateCourseAssignmentRequest {
  teacherId?: number;
  assignmentType?: AssignmentType;
  isActive?: boolean;
}

export interface BulkUpdateRequest {
  gradeId: number;
  assignments: {
    sectionId: number;
    courseId: number;
    teacherId: number;
  }[];
}

export interface CourseAssignmentFilters {
  sectionId?: number;
  teacherId?: number;
  courseId?: number;
  assignmentType?: AssignmentType;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: 'course' | 'teacher' | 'section' | 'assignmentType' | 'createdAt';
  orderDirection?: 'asc' | 'desc';
}

export interface CourseAssignmentResponse {
  data: CourseAssignment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CourseAssignmentStats {
  totalAssignments: number;
  titularAssignments: number;
  specialistAssignments: number;
  activeAssignments: number;
  inactiveAssignments: number;
  assignmentsByType: {
    type: AssignmentType;
    count: number;
  }[];
  teachersWithSpecialties: number;
}