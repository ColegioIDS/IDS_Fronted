// src/types/erica-history.ts

// ==================== FILTER TYPES ====================

export interface EricaHistoryFilters {
  bimesterId?: number;
  weekId?: number;
  gradeId?: number;
  sectionId?: number;
  courseId?: number;
  teacherId?: number;
}

// ==================== EVALUATION TYPES ====================

export type DimensionType = 'EJECUTA' | 'RETIENE' | 'INTERPRETA' | 'CONOCE' | 'APLICA';

export interface EricaHistoryEvaluation {
  id: number;
  studentId: number;
  studentName: string;
  dimension: DimensionType;
  state: string; // E | B | P | C | N
  score: number;
  observation?: string | null;
  evaluationDate: string;
  teacherId?: number;
  teacherName?: string;
}

// ==================== DIMENSION SCORES ====================

export interface DimensionScores {
  ejecuta?: number;
  retiene?: number;
  interpreta?: number;
  conoce?: number;
  aplica?: number;
  average: number;
}

// ==================== STUDENT EVALUATION DATA ====================

export interface StudentPeriodData {
  studentId: number;
  studentName: string;
  totalScore: number;
  averageScore: number;
  evaluationCount?: number;
  dimensions?: DimensionScores;
  evaluations?: EricaHistoryEvaluation[];
}

export interface StudentWeekData extends StudentPeriodData {
  evaluations: EricaHistoryEvaluation[];
}

// ==================== PERIOD TYPES ====================

export interface EricaHistoryWeekData {
  weekId: number;
  weekNumber: number;
  weekTheme: string;
  startDate: string;
  endDate: string;
  students: StudentWeekData[];
}

export interface QnaData {
  qnaId: string;
  qnaNumber: number;
  weeks: number[];
  students: Array<{
    studentId: number;
    studentName: string;
    ejecuta: number;
    retiene: number;
    interpreta: number;
    conoce: number;
    aplica: number;
    average: number;
  }>;
}

export interface MonthData {
  monthId: string;
  monthNumber: number;
  qnas: string[];
  students: StudentPeriodData[];
}

export interface BimesterData {
  months: string[];
  students: StudentPeriodData[];
}

// ==================== RESPONSE TYPES ====================

export interface EricaHistoryFilterResponse {
  filters: EricaHistoryFilters;
  weeks: EricaHistoryWeekData[];
  qnas: QnaData[];
  months: MonthData[];
  bimester: BimesterData;
  summary: EricaHistorySummary;
}

// ==================== SUMMARY TYPES ====================

export interface EricaHistorySummary {
  totalWeeks: number;
  totalEvaluations: number;
  totalStudents: number;
}

// ==================== RESPONSE TYPES ====================

export interface EricaHistoryFilterResponse {
  filters: EricaHistoryFilters;
  weeks: EricaHistoryWeekData[];
  summary: EricaHistorySummary;
}

// ==================== BIMESTRE COMPLETO TYPES ====================

export interface BimesterWeekEvaluation {
  id: number;
  enrollmentId: number;
  studentName: string;
  dimension: 'EJECUTA' | 'RETIENE' | 'INTERPRETA' | 'CONOCE' | 'APLICA';
  state: 'E' | 'B' | 'P' | 'C' | 'N';
  points: number;
  notes?: string;
  evaluatedAt: string;
}

export interface BimesterWeekTopic {
  id: number;
  weekTheme: string;
  title?: string;
  description?: string;
  course?: {
    id: number;
    name: string;
    code: string;
  };
  section?: {
    id: number;
    name: string;
  };
  teacher?: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
}

export interface BimesterWeek {
  weekNumber: number;
  startDate: string;
  endDate: string;
  weekType: string;
  topic: BimesterWeekTopic | null;
  evaluations: {
    EJECUTA: BimesterWeekEvaluation[];
    RETIENE: BimesterWeekEvaluation[];
    INTERPRETA: BimesterWeekEvaluation[];
    CONOCE: BimesterWeekEvaluation[];
    APLICA: BimesterWeekEvaluation[];
  };
}

export interface BimesterCompleteSummary {
  totalWeeks: number;
  weeksWithTopic: number;
  weeksWithoutTopic: number;
  totalEvaluations: number;
}

export interface BimesterCompleteResponse {
  bimestre: {
    id: number;
    number: number;
    name: string;
    startDate: string;
    endDate: string;
    weeksCount: number;
  };
  filters: {
    courseId: number;
    sectionId: number;
  };
  weeks: BimesterWeek[];
  summary: BimesterCompleteSummary;
}

export interface BimesterCompleteReport {
  success: boolean;
  message: string;
  data: BimesterCompleteResponse;
}

// ==================== CASCADE TYPES (for cascading filters) ====================

export interface CascadeOption {
  id: number;
  name?: string;
  number?: number;
  code?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  weeksCount?: number;
  bimesterId?: number;
  gradeId?: number;
  sectionId?: number;
  [key: string]: any;
}

export interface CascadeResponse {
  cycle?: CascadeOption; // Singular (como viene del endpoint)
  cycles?: CascadeOption[]; // Array (normalizado en el hook)
  bimesters: CascadeOption[];
  academicWeeks: CascadeOption[];
  grades: CascadeOption[];
  sections: CascadeOption[];
  courses: CascadeOption[];
  topics?: CascadeOption[];
}
