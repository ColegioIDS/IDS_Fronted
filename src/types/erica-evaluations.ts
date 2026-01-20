// types/erica-evaluations.ts

// =====================================================
// TIPOS DE DIMENSIONES Y ESTADOS ERICA
// =====================================================

/** Estados de desempeño ERICA con puntuación automática */
export type EricaState = 'E' | 'B' | 'P' | 'C' | 'N';

/** Dimensiones ERICA */
export type EricaDimension = 'EJECUTA' | 'RETIENE' | 'INTERPRETA' | 'CONOCE' | 'APLICA';

/** Mapeo de estados a puntos */
export const STATE_POINTS: Record<EricaState, number> = {
  E: 1.0,   // Excelente
  B: 0.75,  // Bien
  P: 0.5,   // Poco
  C: 0.25,  // Casi Nada
  N: 0.0,   // Nada
};

/** Etiquetas de estados */
export const STATE_LABELS: Record<EricaState, string> = {
  E: 'Excelente',
  B: 'Bien',
  P: 'Poco',
  C: 'Casi Nada',
  N: 'Nada',
};

/** Etiquetas de dimensiones */
export const DIMENSION_LABELS: Record<EricaDimension, string> = {
  EJECUTA: 'Ejecuta - Capacidad de aplicar conocimientos en práctica',
  RETIENE: 'Retiene - Retención de información y conceptos',
  INTERPRETA: 'Interpreta - Interpretación y análisis crítico',
  CONOCE: 'Conoce - Comprensión de conceptos fundamentales',
  APLICA: 'Aplica - Ampliación y extensión de aprendizaje',
};

// =====================================================
// TIPOS DE CASCADE (Jerarquía de navegación)
// =====================================================

/** Curso en la jerarquía */
export interface CascadeCourse {
  id: number;
  name: string;
  code?: string;
  area?: string;
  color?: string;
  isActive?: boolean;
}

/** Asignación de curso en la jerarquía */
export interface CascadeCourseAssignment {
  id: number;
  sectionId: number;
  courseId: number;
  teacherId: number;
  assignmentType: string;
  isActive: boolean;
  course: CascadeCourse;
  teacher?: {
    id: number;
    givenNames: string;
    lastNames: string;
    email: string;
  };
}

/** Sección en la jerarquía */
export interface CascadeSection {
  id: number;
  name: string;
  capacity?: number;
  gradeId?: number;
  teacherId?: number;
  teacher?: {
    id: number;
    givenNames: string;
    lastNames: string;
    email: string;
  };
  courseAssignments?: CascadeCourseAssignment[];
}

/** Grado en la jerarquía (estructura plana del backend) */
export interface CascadeGrade {
  id: number;
  name: string;
  level?: string;
  order: number;
  isActive?: boolean;
}

/** Semana académica en la jerarquía (estructura plana del backend) */
export interface CascadeWeek {
  id: number;
  bimesterId: number;
  number: number;
  startDate: string;
  endDate: string;
  objectives?: string;
  weekType?: string;
}

/** Bimestre en la jerarquía (estructura plana del backend) */
export interface CascadeBimester {
  id: number;
  cycleId: number;
  name: string;
  number: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  weeksCount?: number;
}

/** Ciclo escolar en la jerarquía */
export interface CascadeCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

/** Respuesta completa del endpoint cascade */
export interface CascadeResponse {
  cycle: CascadeCycle;
  bimesters?: CascadeBimester[];
  activeBimester: CascadeBimester | null;
  weeks: CascadeWeek[];
  grades: CascadeGrade[];
  gradesSections: Record<number, CascadeSection[]>;
}

// =====================================================
// TIPOS BASE DE EVALUACIÓN
// =====================================================

// Base types
export interface EricaEvaluation {
  id: number;
  enrollmentId: number;
  courseId: number;
  bimesterId: number;
  academicWeekId: number;
  topicId: number;
  teacherId: number;
  dimension: EricaDimension;
  state: EricaState;
  points: number;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Extended evaluation with relations
export interface EricaEvaluationWithRelations extends EricaEvaluation {
  enrollment: {
    id: number;
    student: {
      id: number;
      givenNames: string;
      lastNames: string;
    };
    section?: {
      name: string;
      grade?: {
        name: string;
      };
    };
  };
  course: {
    name: string;
    code?: string;
  };
  bimester: {
    name: string;
  };
  academicWeek: {
    number: number;
    startDate: Date;
    endDate: Date;
  };
  topic: {
    title: string;
    description?: string;
  };
  teacher: {
    givenNames: string;
    lastNames: string;
  };
}

// Grid related types

/** Evaluación por dimensión en el grid */
export interface DimensionEvaluation {
  id?: number;
  state: EricaState;
  points: number;
  notes?: string | null;
}

/** Grid de evaluación semanal por estudiante */
export interface EvaluationGridData {
  enrollmentId: number;
  studentName: string;
  EJECUTA: DimensionEvaluation | null;
  RETIENE: DimensionEvaluation | null;
  INTERPRETA: DimensionEvaluation | null;
  CONOCE: DimensionEvaluation | null;
  APLICA: DimensionEvaluation | null;
}

/** Respuesta del grid por enrollment/week */
export interface EvaluationGridByWeekResponse {
  enrollmentId: number;
  academicWeekId: number;
  evaluations: Record<EricaDimension, DimensionEvaluation | null>;
  weekData: {
    number: number;
    startDate: string;
    endDate: string;
  };
}

/** Respuesta del grid por topic */
export interface EvaluationGridResponse {
  topic: {
    id: number;
    courseId: number;
    academicWeekId: number;
    sectionId: number;
    teacherId: number;
    weekTheme: string;
    title: string;
    description?: string;
    objectives?: string;
    materials?: string;
    isActive: boolean;
    isCompleted: boolean;
    course: {
      name: string;
      code?: string;
    };
    section: {
      name: string;
      grade?: {
        name: string;
      };
    };
    academicWeek: {
      number: number;
      startDate: string;
      endDate: string;
    };
    teacher: {
      givenNames: string;
      lastNames: string;
    };
  };
  dimensions: Array<{
    code: string;
    name: EricaDimension;
    fullName?: string;
    description?: string;
    hexColor?: string;
  }>;
  states: Array<{
    code: string;
    name: string;
    fullName?: string;
    description?: string;
    points?: number;
    hexColor?: string;
  }>;
  students: EvaluationGridData[];
  stats: EvaluationGridStats;
}

/** Estadísticas del grid */
export interface EvaluationGridStats {
  totalStudents: number;
  studentsWithEvaluations: number;
  fullyEvaluatedStudents: number;
  averagePoints: number;
  completionRate: number;
  evaluationRate: number;
}

// Request/Response types for CRUD operations
export interface CreateEricaEvaluationRequest {
  enrollmentId: number;
  courseId: number;
  bimesterId: number;
  academicWeekId: number;
  topicId: number;
  dimension: EricaDimension;
  state: EricaState;
  notes?: string;
  teacherId: number;
}

export interface UpdateEricaEvaluationRequest {
  state?: EricaState;
  notes?: string;
}

/** Item de evaluación en SaveGridRequest */
export interface SaveGridEvaluationItem {
  enrollmentId: number;
  dimension: EricaDimension;
  state: EricaState;
  notes?: string | null;
}

export interface SaveGridRequest {
  topicId: number;
  teacherId: number;
  evaluations: SaveGridEvaluationItem[];
}

export interface SaveGridResult {
  success: boolean;
  created?: number;
  updated?: number;
  evaluations?: EricaEvaluation[];
  evaluationsProcessed?: number;
  message?: string;
}

export interface BulkCreateEvaluationsRequest {
  evaluations: CreateEricaEvaluationRequest[];
}

// Filter types
export interface EvaluationFilters {
  enrollmentId?: number;
  studentId?: number;
  courseId?: number;
  topicId?: number;
  bimesterId?: number;
  academicWeekId?: number;
  sectionId?: number;
  teacherId?: number;
  dimension?: EricaDimension;
  state?: EricaState;
  startWeek?: number;
  endWeek?: number;
  dateFrom?: Date;
  dateTo?: Date;
  minPoints?: number;
  maxPoints?: number;
  page?: number;
  limit?: number;
  orderBy?: 'createdAt' | 'points' | 'student' | 'dimension';
  orderDirection?: 'asc' | 'desc';
}

export interface GetGridFilters {
  topicId: number;
  includeEmpty?: boolean;
}

// Statistics and analytics types
export interface DimensionStats {
  E: number;
  B: number;
  P: number;
  C: number;
  N: number;
  averagePoints: number;
}

export interface TopicStats {
  topicId: number;
  totalStudents: number;
  dimensionStats: Record<EricaDimension, DimensionStats>;
  overallAverage: number;
}

export interface TopicSummary {
  topic: {
    id: number;
    title: string;
    course: { name: string };
    section: { name: string };
    academicWeek: { number: number };
  };
  summary: {
    totalStudents: number;
    totalEvaluations: number;
    averageClassPoints: number;
    studentsEvaluated: number;
    completionRate: number;
  };
  students: Array<{
    student: {
      givenNames: string;
      lastNames: string;
    };
    enrollmentId: number;
    evaluations: Array<{
      dimension: EricaDimension;
      state: EricaState;
      points: number;
      notes?: string;
    }>;
    totalPoints: number;
    averagePoints: number;
    completedDimensions: number;
  }>;
}

export interface TeacherAnalytics {
  totalEvaluations: number;
  totalTopics: number;
  completedTopics: number;
  averagePoints: number;
  completionRate: number;
}

export interface PendingTopic {
  id: number;
  title: string;
  course: { name: string };
  section: { 
    name: string; 
    grade: { name: string }; 
  };
  academicWeek: { 
    number: number; 
    startDate: Date; 
    endDate: Date; 
  };
  _count: { evaluations: number };
  pendingEvaluations: {
    totalExpected: number;
    completed: number;
    pending: number;
  };
}

// Form types (for React Hook Form compatibility)
export interface EvaluationFormValues extends CreateEricaEvaluationRequest {}

export interface UpdateEvaluationFormValues extends UpdateEricaEvaluationRequest {}

export interface SaveGridFormValues extends SaveGridRequest {}

// Response wrappers
export interface EvaluationResponse {
  data: EricaEvaluationWithRelations[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

// Utility types (for backwards compatibility if needed)
export type EricaScaleCode = EricaState;
export type EricaCategoryCode = EricaDimension;

// General statistics interface
export interface EvaluationGeneralStats {
  totalEvaluations: number;
  evaluationsByState: Record<EricaState, number>;
  evaluationsByDimension: Record<EricaDimension, number>;
  averagePoints: number;
  evaluationsByBimester: Record<string, number>;
  topTeachers: Array<{ 
    teacherId: number; 
    teacherName: string; 
    evaluationCount: number; 
  }>;
}