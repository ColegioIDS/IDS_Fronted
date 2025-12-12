/**
 * Tipos para el módulo de Cotejos
 * Consolidación de calificaciones por componentes
 */

// Estados del cotejo
export type CotejoStatus = 'DRAFT' | 'COMPLETED' | 'SUBMITTED';

// ==================== TIPOS BASE ====================

export interface Cotejo {
  id: number;
  enrollmentId: number;
  courseId: number;
  bimesterId: number;
  cycleId: number;
  teacherId: number;
  ericaScore: number | null;
  tasksScore: number | null;
  actitudinalScore: number | null;
  declarativoScore: number | null;
  totalScore: number | null;
  status: CotejoStatus;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: number;
  givenNames: string;
  lastNames: string;
  codeSIRE?: string;
}

export interface Enrollment {
  id: number;
  student: Student;
}

export interface Course {
  id: number;
  name: string;
  code?: string;
  area?: string;
  color?: string;
}

export interface Bimester {
  id: number;
  name: string;
  number: number;
  cycleId?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface AssignmentSubmission {
  id: number | null;
  assignmentId: number;
  assignmentTitle: string;
  maxScore: number;
  score: number | null;
  feedback: string | null;
  submittedAt: string | null;
}

export interface SchoolCycle {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isArchived?: boolean;
  description?: string;
  academicYear?: number;
}

export interface AcademicWeek {
  id: number;
  bimesterId: number;
  number: number;
  startDate: Date;
  endDate: Date;
  objectives?: string;
  weekType?: 'REGULAR' | 'EXAM' | 'HOLIDAY';
}

export interface Teacher {
  id: number;
  givenNames: string;
  lastNames: string;
  email?: string;
}

export interface Grade {
  id: number;
  name: string;
  level?: string;
  order?: number;
  isActive: boolean;
}

export interface Section {
  id: number;
  name: string;
  capacity?: number;
  gradeId: number;
  teacherId?: number;
  teacher?: Teacher;
  courseAssignments?: CourseAssignment[];
}

export interface CourseAssignment {
  id: number;
  sectionId: number;
  courseId: number;
  teacherId: number;
  assignmentType?: string;
  isActive: boolean;
  course: Course;
  teacher: Teacher;
}

// ==================== RESPUESTAS ====================

export interface CotejoResponse extends Cotejo {
  enrollment?: Enrollment;
  course?: Course;
  bimester?: Bimester;
  teacher?: Teacher;
  assignmentSubmissions?: AssignmentSubmission[];
}

export interface CascadeData {
  cycle: SchoolCycle | null;
  activeBimester: Bimester | null;
  weeks: AcademicWeek[];
  grades: Grade[];
  gradesSections: Record<number, Section[]>;
}

export interface CascadeResponse {
  success: boolean;
  errorCode?: string | null;
  errorType?: string;
  message: string;
  data: CascadeData | null;
}

export interface GenerateCotejoResponse {
  success: boolean;
  data: CotejoResponse;
}

export interface UpdateActitudinalResponse {
  success: boolean;
  data: CotejoResponse;
}

export interface UpdateDeclarativoResponse {
  success: boolean;
  data: CotejoResponse;
}

export interface SubmitCotejoResponse {
  success: boolean;
  data: CotejoResponse;
}

export interface CotejoBySectionResponse {
  sectionId: number;
  courseId: number;
  bimesterId: number;
  cycleId: number;
  total: number;
  cotejos: CotejoResponse[];
}

// Respuesta alternativa cuando el endpoint retorna array directo
export type CotejoBySectionArrayResponse = CotejoResponse[];

// ==================== DTOs ====================

export interface GenerateCotejoDTO {
  feedback?: string;
}

export interface UpdateActitudinalDTO {
  actitudinalScore: number;
  feedback?: string;
}

export interface UpdateDeclarativoDTO {
  declarativoScore: number;
  feedback?: string;
}

export interface SubmitCotejoDTO {
  feedback?: string;
}

// ==================== ERRORES ====================

export interface CotejoErrorResponse {
  success: false;
  errorCode: string;
  message: string;
  details?: Record<string, any>;
}

export interface CotejosApiErrorResponse {
  success: false;
  errorCode: string;
  errorType: string;
  message: string;
  detail?: string;
  data: null;
}

// ==================== ESTUDIANTES ====================

export interface StudentEnrollmentData {
  enrollment: {
    id: number;
    status: string;
    dateEnrolled: string;
    statusChangeReason?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    modifiedBy: string;
  };
  student: {
    id: number;
    givenNames: string;
    lastNames: string;
    fullName: string;
    codeSIRE: string;
    birthDate: string;
    gender: string;
  };
  grade: {
    id: number;
    name: string;
  };
  section: {
    id: number;
    name: string;
    grade: {
      id: number;
      name: string;
    };
  };
}

export interface GetStudentsResponse {
  cycle: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
  statusFilter: string;
  totalStudents: number;
  students: StudentEnrollmentData[];
}
