// types/erica-evaluations.ts

// Base types
export interface EricaEvaluation {
  id: number;
  enrollmentId: number;
  courseId: number;
  bimesterId: number;
  academicWeekId: number;
  topicId: number;
  teacherId: number;
  categoryId: number;
  scaleId: number;
  points: number;
  notes?: string | null;
  evaluatedAt: Date;
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
  category: {
    code: string;
    name: string;
  };
  scale: {
    code: string;
    name: string;
    numericValue: number;
  };
  teacher: {
    givenNames: string;
    lastNames: string;
  };
}

// Grid related types
export interface EvaluationGridData {
  enrollment: {
    id: number;
    student: {
      id: number;
      givenNames: string;
      lastNames: string;
    };
  };
  evaluations: Array<{
    categoryId: number;
    categoryCode: string;
    categoryName: string;
    evaluation: {
      id: number;
      scaleCode: string;
      scaleName: string;
      points: number;
      notes?: string;
      evaluatedAt: Date;
      createdAt: Date;
    } | null;
  }>;
  summary: {
    totalPoints: number;
    maxPoints: number;
    completedEvaluations: number;
    totalCategories: number;
    isComplete: boolean;
    percentage: number;
  };
}

export interface EvaluationGridResponse {
  topic: {
    id: number;
    title: string;
    course: { name: string; code: string };
    section: { 
      name: string; 
      grade: { name: string }; 
    };
    academicWeek: { 
      number: number; 
      startDate: Date; 
      endDate: Date; 
    };
    teacher: { 
      givenNames: string; 
      lastNames: string; 
    };
  };
  categories: Array<{
    id: number;
    code: string;
    name: string;
    order: number;
  }>;
  scales: Array<{
    id: number;
    code: string;
    name: string;
    numericValue: number;
    order: number;
  }>;
  students: EvaluationGridData[];
  stats: {
    totalStudents: number;
    studentsWithEvaluations: number;
    fullyEvaluatedStudents: number;
    averagePoints: number;
    completionRate: number;
    evaluationRate: number;
  };
}

// Request/Response types for CRUD operations
export interface CreateEricaEvaluationRequest {
  enrollmentId: number;
  courseId: number;
  bimesterId: number;
  academicWeekId: number;
  topicId: number;
  teacherId: number;
  categoryId: number;
  scaleId: number;
  points: number;
  notes?: string;
  evaluatedAt?: Date;
}

export interface UpdateEricaEvaluationRequest {
  scaleId?: number;
  points?: number;
  notes?: string;
  evaluatedAt?: Date;
}

export interface SaveGridRequest {
  topicId: number;
  teacherId: number;
  evaluations: Array<{
    enrollmentId: number;
    categoryId: number;
    scaleCode: string;
    notes?: string;
  }>;
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
  categoryId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  minPoints?: number;
  maxPoints?: number;
  page?: number;
  limit?: number;
  orderBy?: 'evaluatedAt' | 'points' | 'student' | 'category';
  orderDirection?: 'asc' | 'desc';
}

export interface GetGridFilters {
  topicId: number;
  includeEmpty?: boolean;
}

// Statistics and analytics types
export interface TopicStats {
  totalEvaluations: number;
  averagePoints: number;
  categoryStats: Array<{
    category: {
      id: number;
      code: string;
      name: string;
    };
    totalEvaluations: number;
    averagePoints: number;
    scaleDistribution: Record<string, number>;
  }>;
  scaleDistribution: Array<{
    scaleCode: string;
    count: number;
    percentage: number;
  }>;
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
      category: { code: string; name: string; order: number };
      scale: { code: string; name: string };
      points: number;
      notes?: string;
    }>;
    totalPoints: number;
    averagePoints: number;
    completedCategories: number;
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

// Utility types
export type EricaScaleCode = 'E' | 'B' | 'P' | 'C' | 'N';

export type EricaCategoryCode = 'ERICA_1' | 'ERICA_2' | 'ERICA_3' | 'ERICA_4' | 'ERICA_5';

export interface SaveGridResult {
  success: boolean;
  evaluationsProcessed: number;
  evaluations: Array<{
    id: number;
    enrollment: {
      student: { givenNames: string; lastNames: string };
    };
    category: { code: string; name: string };
    scale: { code: string; name: string };
  }>;
  message: string;
}

// General statistics interface
export interface EvaluationGeneralStats {
  totalEvaluations: number;
  evaluationsByScale: Record<string, number>;
  evaluationsByCategory: Record<string, number>;
  averagePoints: number;
  evaluationsByBimester: Record<string, number>;
  topTeachers: Array<{ 
    teacherId: number; 
    teacherName: string; 
    evaluationCount: number; 
  }>;
}