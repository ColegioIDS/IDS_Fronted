/**
 * Tipos para el módulo de Assignments
 * Aislado y sin dependencias externas
 */

// ==================== TIPOS BASE ====================

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  courseId: number;
  bimesterId: number;
  dueDate: Date;
  maxScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  studentId: number;
  teacherId?: number;
  score?: number;
  feedback?: string;
  attachmentUrl?: string;
  notes?: string;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== TIPOS RELACIONADOS ====================

export interface Student {
  id: number;
  givenNames: string;
  lastNames: string;
  userId?: number;
}

export interface Teacher {
  id: number;
  givenNames: string;
  lastNames: string;
}

export interface Course {
  id: number;
  name: string;
  code: string;
}

export interface Bimester {
  id: number;
  name: string;
  number: number;
  startDate: Date;
  endDate: Date;
}

export interface Grade {
  id: number;
  name: string;
  level: number;
}

export interface Section {
  id: number;
  name: string;
  gradeId: number;
}

// ==================== DTOs - CREAR ====================

export interface CreateAssignmentDTO {
  title: string;
  description?: string;
  courseId: number;
  bimesterId: number;
  dueDate: string | Date;
  maxScore: number;
}

// ==================== DTOs - ACTUALIZAR ====================

export interface UpdateAssignmentDTO {
  title?: string;
  description?: string;
  dueDate?: string | Date;
  maxScore?: number;
}

// ==================== DTOs - ENTREGAS ====================

export interface SubmitAssignmentDTO {
  attachmentUrl?: string;
  notes?: string;
}

export interface GradeSubmissionDTO {
  score: number;
  feedback?: string;
}

// ==================== RESPUESTAS ====================

export interface AssignmentResponse extends Assignment {
  course?: Course;
  bimester?: Bimester;
  _count?: {
    submissions: number;
  };
}

export interface AssignmentSubmissionResponse extends AssignmentSubmission {
  student?: Student;
  teacher?: Teacher;
  assignment?: Assignment;
  enrollment?: {
    id: number;
    student: Student;
  };
  isLate?: boolean;
}

export interface SubmissionsListResponse {
  assignmentId: number;
  assignmentTitle: string;
  maxScore: number;
  dueDate: Date;
  totalSubmissions: number;
  submissions: AssignmentSubmissionResponse[];
}

// ==================== ENDPOINT: /api/assignments/course/:courseId/bimester/:bimesterId/students-submissions ====================

export interface StudentAssignmentSubmission {
  assignmentId: number;
  assignmentTitle: string;
  maxScore: number;
  score: number;
  isGraded: boolean;
}

export interface StudentSubmissionsData {
  enrollmentId: number;
  student: {
    id: number;
    givenNames: string;
    lastNames: string;
    codeSIRE: string;
  };
  section: {
    id: number;
    name: string;
  };
  assignmentSubmissions: StudentAssignmentSubmission[];
  totalScore: number;
  maxPossibleScore: number;
}

export interface StudentSubmissionsResponse {
  success: boolean;
  courseId: number;
  bimesterId: number;
  totalStudents: number;
  totalAssignments: number;
  students: StudentSubmissionsData[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== FILTROS ====================

export interface AssignmentFilters {
  courseId?: number;
  bimesterId?: number;
  page?: number;
  limit?: number;
}

export interface SubmissionFilters {
  assignmentId: number;
  page?: number;
  limit?: number;
}

// ==================== CASCADA - DATOS PARA FORMULARIO ====================

export interface GradeOption {
  id: number;
  name: string;
  level: number;
}

export interface SectionOption {
  id: number;
  name: string;
  gradeId: number;
}

export interface CourseOption {
  id: number;
  name: string;
  code: string;
  area?: string;
  color?: string;
  isActive?: boolean;
  sectionId?: number;
}

export interface BimesterOption {
  id: number;
  name: string;
  number: number;
  startDate: Date;
  endDate: Date;
  cycle?: string;
  cycleId?: number;
}

// ==================== ESTADO DEL FORMULARIO CASCADA ====================

export interface CascadeFormState {
  selectedGrade: GradeOption | null;
  selectedSection: SectionOption | null;
  selectedCourse: CourseOption | null;
  selectedBimester: BimesterOption | null;
  grades: GradeOption[];
  sections: SectionOption[];
  courses: CourseOption[];
  bimesters: BimesterOption[];
  isLoadingGrades: boolean;
  isLoadingSections: boolean;
  isLoadingCourses: boolean;
  isLoadingBimesters: boolean;
  error?: string;
  cycleName?: string;
}

export interface CascadeFormActions {
  setSelectedGrade: (grade: GradeOption | null) => void;
  setSelectedSection: (section: SectionOption | null) => void;
  setSelectedCourse: (course: CourseOption | null) => void;
  setSelectedBimester: (bimester: BimesterOption | null) => void;
  fetchGrades: () => Promise<void>;
  fetchSections: (gradeId: number) => Promise<void>;
  fetchCourses: (sectionId: number) => Promise<void>;
  fetchBimesters: (courseId: number) => Promise<void>;
  reset: () => void;
}

// ==================== RESPUESTAS DE API ====================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ==================== ENUMS ====================

export enum AssignmentStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  LATE = 'late',
}

export enum SubmissionStatus {
  NOT_SUBMITTED = 'not_submitted',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
}

// ==================== UTILIDADES ====================

export type AssignmentFormData = CreateAssignmentDTO;

export interface FormValidationError {
  field: string;
  message: string;
}
