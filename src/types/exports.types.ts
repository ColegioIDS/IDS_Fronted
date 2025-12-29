/**
 * Tipos para el módulo de Exports
 * Exportación de datos académicos
 */

export interface ExportCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isArchived: boolean;
  academicYear: number;
}

export interface ExportBimester {
  id: number;
  cycleId: number;
  number: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  weeksCount: number;
}

export interface ExportWeek {
  id: number;
  bimesterId: number;
  number: number;
  startDate: string;
  endDate: string;
  objectives: string;
  weekType: 'REGULAR' | 'EVALUATION';
}

export interface ExportTeacher {
  id: number;
  givenNames: string;
  lastNames: string;
  email: string;
}

export interface ExportCourse {
  id: number;
  name: string;
  code: string;
  area: string;
  color: string;
  isActive: boolean;
}

export interface ExportCourseAssignment {
  id: number;
  course: ExportCourse;
  teacher: ExportTeacher;
}

export interface ExportGrade {
  id: number;
  name: string;
  level: string;
  order: number;
  isActive: boolean;
}

export interface ExportSection {
  id: number;
  name: string;
  capacity: number;
  gradeId: number;
  teacher: ExportTeacher;
  courseAssignments: ExportCourseAssignment[];
}

export interface ExportAcademicDataResponse {
  success: boolean;
  message: string;
  data: {
    cycle: ExportCycle;
    activeBimester: ExportBimester;
    weeks: ExportWeek[];
    grades: ExportGrade[];
    gradesSections: Record<number, ExportSection[]>;
  };
}

export interface ExportsStudentsFiltersQuery {
  cycleId: number;
  bimesterId: number;
  gradeId: number;
  sectionId: number;
}

// ==================== ESTUDIANTES ====================

export interface ExportStudent {
  studentId: number;
  names: {
    givenNames: string;
    lastNames: string;
  };
  birthDate: string;
  codeSIRE: string;
  enrollments: ExportEnrollment[];
  parents: ExportParent[];
  gradesByBimester: ExportGradesByBimestre[];
}

export interface ExportEnrollment {
  enrollmentId: number;
  schoolCycle: {
    id: number;
    name: string;
    academicYear: number;
    startDate: string;
    endDate: string;
  };
  grade: {
    id: number;
    name: string;
    level: string;
  };
  section: {
    id: number;
    name: string;
  };
  status: string;
}

export interface ExportParent {
  id: number;
  parentId: number;
  studentId: number;
  relationship: 'mother' | 'father' | 'guardian' | 'other';
  parent: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
}

export interface ExportGradesByBimestre {
  bimesterId: number;
  bimesterNumber: number;
  bimesterName: string;
  startDate: string;
  endDate: string;
  courses: ExportCourseGrade[];
}

export interface ExportCourseGrade {
  courseId: number;
  courseName: string;
  ericaScore: number;
  tasksScore: number;
  actitudinalScore: number;
  declarativoScore: number;
  totalScore: number;
  status: string;
  feedback?: string | null;
}

export interface ExportsStudentFilterRequest {
  cycleId?: number;
  gradeId?: number;
  sectionId?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'GRADUATED' | 'WITHDRAWN';
  includeInactive?: boolean;
  page?: number;
  limit?: number;
}

export interface ExportsStudentFilterResponse {
  success: boolean;
  message: string;
  data: ExportStudent[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
