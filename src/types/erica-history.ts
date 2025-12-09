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

export interface EricaHistoryEvaluation {
  id: number;
  student: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
  section: {
    id: number;
    name: string;
    grade?: {
      name: string;
    };
  };
  dimension: 'EJECUTA' | 'RETIENE' | 'INTERPRETA' | 'CONOCE' | 'AMPLIA';
  state: 'E' | 'B' | 'P' | 'C' | 'N';
  points: number;
  notes: string | null;
  evaluatedBy: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
  course: {
    id: number;
    name: string;
    code: string;
  };
  bimester: {
    id: number;
    name: string;
    number: number;
  };
  evaluatedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== TOPIC TYPES ====================

export interface EricaHistoryTopic {
  id: number;
  title: string;
  weekTheme: string;
  description?: string;
}

// ==================== ACADEMIC WEEK TYPES ====================

export interface EricaHistoryAcademicWeek {
  id: number;
  number: number;
  startDate: string;
  endDate: string;
}

// ==================== WEEK DATA TYPES ====================

export interface EricaHistoryWeekData {
  academicWeek: EricaHistoryAcademicWeek;
  topic: EricaHistoryTopic;
  evaluations: EricaHistoryEvaluation[];
}

// ==================== STATISTICS TYPES ====================

export interface EricaHistoryDimensionStats {
  EJECUTA: number;
  RETIENE: number;
  INTERPRETA: number;
  CONOCE: number;
  AMPLIA: number;
}

export interface EricaHistoryStateStats {
  E: number;
  B: number;
  P: number;
  C: number;
  N: number;
}

export interface EricaHistoryStats {
  totalEvaluations: number;
  totalStudents: number;
  totalWeeks: number;
  averagePoints: number;
  byDimension: EricaHistoryDimensionStats;
  byState: EricaHistoryStateStats;
}

// ==================== RESPONSE TYPES ====================

export interface EricaHistoryFilterResponse {
  filters: EricaHistoryFilters;
  weeks: EricaHistoryWeekData[];
  stats: EricaHistoryStats;
}

export interface EricaHistoryReport {
  success: boolean;
  message: string;
  data: EricaHistoryFilterResponse;
}

// ==================== BIMESTRE COMPLETO TYPES ====================

export interface BimesterWeekEvaluation {
  id: number;
  enrollmentId: number;
  studentName: string;
  dimension: 'EJECUTA' | 'RETIENE' | 'INTERPRETA' | 'CONOCE' | 'AMPLIA';
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
    AMPLIA: BimesterWeekEvaluation[];
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
  [key: string]: any;
}

export interface CascadeResponse {
  cycles: CascadeOption[];
  bimesters: CascadeOption[];
  academicWeeks: CascadeOption[];
  grades: CascadeOption[];
  sections: CascadeOption[];
  courses: CascadeOption[];
  topics: CascadeOption[];
}
