// types/erica-topics.ts

// ==================== INTERFACES PRINCIPALES ====================

export interface EricaTopic {
  id: number;
  courseId: number;
  academicWeekId: number;
  sectionId: number;
  teacherId: number;
  title: string;
  description?: string;
  objectives?: string;
  materials?: string;
  isActive: boolean;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relaciones incluidas
  course?: {
    id: number;
    name: string;
    code: string;
  };
  academicWeek?: {
    id: number;
    number: number;
    startDate: Date;
    endDate: Date;
    bimester?: {
      id: number;
      name: string;
      number: number;
    };
  };
  section?: {
    id: number;
    name: string;
    grade?: {
      id: number;
      name: string;
    };
  };
  teacher?: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
  
  // Conteos
  _count?: {
    evaluations: number;
  };
}

// ==================== REQUESTS ====================

export interface CreateEricaTopicRequest {
  courseId: number;
  academicWeekId: number;
  sectionId: number;
  teacherId: number;
  title: string;
  description?: string;
  objectives?: string;
  materials?: string;
  isActive?: boolean;
}

export interface UpdateEricaTopicRequest {
  courseId?: number;
  academicWeekId?: number;
  sectionId?: number;
  teacherId?: number;
  title?: string;
  description?: string;
  objectives?: string;
  materials?: string;
  isActive?: boolean;
  isCompleted?: boolean;
}

export interface BulkCreateEricaTopicsRequest {
  topics: CreateEricaTopicRequest[];
}

export interface MarkCompleteRequest {
  isCompleted: boolean;
  notes?: string;
}

// ==================== FORM VALUES ====================

export interface EricaTopicFormValues {
  courseId: number;
  academicWeekId: number;
  sectionId: number;
  teacherId: number;
  title: string;
  description: string;
  objectives: string;
  materials: string;
  isActive: boolean;
}

export interface UpdateEricaTopicFormValues {
  courseId?: number;
  academicWeekId?: number;
  sectionId?: number;
  teacherId?: number;
  title?: string;
  description?: string;
  objectives?: string;
  materials?: string;
  isActive?: boolean;
  isCompleted?: boolean;
}

// ==================== FILTROS ====================

export interface EricaTopicFilters {
  courseId?: number;
  academicWeekId?: number;
  sectionId?: number;
  teacherId?: number;
  bimesterId?: number;
  gradeId?: number;
  isActive?: boolean;
  isCompleted?: boolean;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  orderBy?: 'title' | 'academicWeek' | 'course' | 'createdAt' | 'updatedAt';
  orderDirection?: 'asc' | 'desc';
  includeRelations?: boolean;
}

// ==================== RESPUESTAS ====================

export interface EricaTopicResponse {
  data: EricaTopic[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EricaTopicWithEvaluations extends EricaTopic {
  evaluations: {
    id: number;
    enrollmentId: number;
    categoryId: number;
    scaleId: number;
    points: number;
    notes?: string;
    evaluatedAt: Date;
    enrollment: {
      student: {
        givenNames: string;
        lastNames: string;
      };
    };
    category: {
      code: string;
      name: string;
    };
    scale: {
      code: string;
      name: string;
    };
  }[];
}

// ==================== CONSULTAS ESPECÍFICAS ====================

export interface SectionWeekTopics {
  section: {
    id: number;
    name: string;
    grade: {
      name: string;
    };
  };
  academicWeek: {
    id: number;
    number: number;
    startDate: Date;
    endDate: Date;
  };
  topics: EricaTopic[];
}

export interface TeacherPendingTopics {
  teacher: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
  pendingTopics: (EricaTopic & {
    pendingEvaluations?: {
      totalExpected: number;
      completed: number;
      pending: number;
    };
  })[];
  summary: {
    totalPending: number;
    totalEvaluationsNeeded: number;
    completedEvaluations: number;
  };
}

export interface SectionCoursePlanning {
  section: {
    id: number;
    name: string;
    grade: {
      name: string;
    };
  };
  course: {
    id: number;
    name: string;
    code: string;
  };
  bimester?: {
    id: number;
    name: string;
    number: number;
  };
  planning: {
    week: number;
    dates: {
      start: Date;
      end: Date;
    };
    topic?: EricaTopic;
    hasEvaluations: boolean;
    evaluationCount: number;
  }[];
  summary: {
    totalWeeks: number;
    plannedWeeks: number;
    completedWeeks: number;
    pendingWeeks: number;
    planningProgress: number;
  };
}

// ==================== ESTADÍSTICAS ====================

export interface EricaTopicStats {
  totalTopics: number;
  activeTopics: number;
  completedTopics: number;
  pendingTopics: number;
  topicsByStatus: {
    status: 'active' | 'completed' | 'inactive';
    count: number;
  }[];
  topicsByCourse: {
    courseId: number;
    courseName: string;
    count: number;
  }[];
  topicsByWeek: {
    week: number;
    count: number;
  }[];
  averageEvaluationsPerTopic: number;
  completionRate: number;
}

export interface TeacherTopicStats {
  teacher: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
  stats: {
    totalTopics: number;
    completedTopics: number;
    pendingTopics: number;
    totalEvaluations: number;
    averageEvaluationsPerTopic: number;
    completionRate: number;
    topicsByCourse: {
      courseId: number;
      courseName: string;
      total: number;
      completed: number;
    }[];
    recentActivity: {
      topicsCreatedThisWeek: number;
      topicsCompletedThisWeek: number;
      evaluationsThisWeek: number;
    };
  };
  bimester?: {
    id: number;
    name: string;
  };
}

// ==================== DUPLICATE ====================

export interface DuplicateTopicRequest {
  targetSectionId?: number;
  targetWeekId?: number;
}

export interface DuplicateTopicResponse {
  originalTopic: EricaTopic;
  duplicatedTopic: EricaTopic;
  message: string;
}

// ==================== UTILIDADES ====================

export interface TopicStatusSummary {
  pending: number;
  inProgress: number;
  completed: number;
  total: number;
}

export interface WeeklyTopicSummary {
  weekNumber: number;
  weekDates: {
    start: Date;
    end: Date;
  };
  topicsCount: number;
  completedCount: number;
  pendingCount: number;
  courses: {
    courseId: number;
    courseName: string;
    hasTopic: boolean;
    isCompleted: boolean;
  }[];
}

// ==================== GRID DE EVALUACIÓN ====================

export interface EvaluationGridStudent {
  enrollment: {
    id: number;
    student: {
      id: number;
      givenNames: string;
      lastNames: string;
    };
  };
  evaluations: {
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
  }[];
  summary: {
    totalPoints: number;
    maxPoints: number;
    completedEvaluations: number;
    totalCategories: number;
    isComplete: boolean;
    percentage: number;
  };
}

export interface EvaluationGridData {
  topic: EricaTopic;
  categories: {
    id: number;
    code: string;
    name: string;
    order: number;
  }[];
  scales: {
    id: number;
    code: string;
    name: string;
    numericValue: number;
    order: number;
  }[];
  students: EvaluationGridStudent[];
  stats: {
    totalStudents: number;
    studentsWithEvaluations: number;
    fullyEvaluatedStudents: number;
    averagePoints: number;
    completionRate: number;
    evaluationRate: number;
  };
}