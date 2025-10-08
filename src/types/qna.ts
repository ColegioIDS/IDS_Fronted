// ============================================
// 1. TYPES - src/types/qna.ts
// ============================================

// Tipos base para configuraciones ERICA
export type ConfigType = 'color_ranges' | 'system' | 'scales';
export type ConfigCategory = 'colors' | 'system' | 'scales';
export type CalculationType = 'QNA1' | 'QNA2' | 'QNA3' | 'QNA4' | 'MONTHLY1' | 'MONTHLY2' | 'BIMESTRAL';
export type CompetencyColor = 'green' | 'yellow' | 'red';
export type CompetencyCode = 'E' | 'R' | 'I' | 'C' | 'A';

// Configuración ERICA
export interface EricaConfig {
  id: number;
  configType: ConfigType;
  configKey: string;
  configValue: string;
  description?: string;
  category?: ConfigCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Resultado calculado
export interface CalculatedResult {
  id: number;
  enrollmentId: number;
  bimesterId: number;
  courseId: number;
  calculationType: CalculationType;
  resultE: number;
  resultR: number;
  resultI: number;
  resultC: number;
  resultA: number;
  colorE?: CompetencyColor;
  colorR?: CompetencyColor;
  colorI?: CompetencyColor;
  colorC?: CompetencyColor;
  colorA?: CompetencyColor;
  calculationDate: string;
  sourceWeeks?: string;
  createdAt: string;
  updatedAt: string;
}

// Semana académica con temas
export interface AcademicWeekWithTopics {
  id: number;
  bimesterId: number;
  number: number;
  startDate: string;
  endDate: string;
  objectives?: string;
  ericaTopics: Array<{
    id: number;
    title: string;
    description?: string;
  }>;
}

// Categoría ERICA
export interface EricaCategory {
  id: number;
  code: CompetencyCode;
  name: string;
  description?: string;
  isActive: boolean;
  order: number;
}

// Escala ERICA
export interface EricaScale {
  id: number;
  code: string;
  name: string;
  description?: string;
  numericValue: number;
  colorCode: string;
  isActive: boolean;
  order: number;
}

// Estudiante en el grid
export interface QnaGridStudent {
  enrollment: {
    id: number;
    student: {
      id: number;
      codeSIRE?: string;
      givenNames: string;
      lastNames: string;
    };
  };
  weeklyEvaluations: Record<number, Record<string, any>>;
  calculatedResults: Record<string, CalculatedResult>;
  summary: {
    totalEvaluations: number;
    maxPossibleEvaluations: number;
    completionPercentage: number;
    totalPoints: number;
    averagePoints: number;
    calculatedResultsCount: number;
  };
}

// Grid QNA completo
export interface QnaGrid {
  academicWeeks: AcademicWeekWithTopics[];
  categories: EricaCategory[];
  scales: EricaScale[];
  students: QnaGridStudent[];
  calculatedResults: CalculatedResult[];
  stats: {
    totalStudents: number;
    weeksCount: number;
    categoriesCount: number;
    totalPossibleEvaluations: number;
    completedEvaluations: number;
    completionPercentage: number;
    averageStudentCompletion: number;
  };
}

// ============================================
// REQUEST TYPES
// ============================================

// Crear configuración ERICA
export interface CreateEricaConfigRequest {
  configType: ConfigType;
  configKey: string;
  configValue: string;
  description?: string;
  category?: ConfigCategory;
  isActive?: boolean;
}

// Actualizar configuración ERICA
export interface UpdateEricaConfigRequest {
  configType?: ConfigType;
  configKey?: string;
  configValue?: string;
  description?: string;
  category?: ConfigCategory;
  isActive?: boolean;
}

// Obtener grid QNA
export interface GetQnaGridRequest {
  cycleId: number;
  bimesterId: number;
  gradeId: number;
  sectionId: number;
  courseId: number;
  teacherId: number;
  includeCalculated?: boolean;
  forceRecalculate?: boolean;
}

// Recalcular resultados
export interface RecalculateQnaRequest {
  enrollmentIds?: number[];
  calculationTypes?: CalculationType[];
  bimesterId: number;
  courseId: number;
}

// ============================================
// RESPONSE TYPES
// ============================================

// Resultado de estudiante
export interface StudentResultsResponse {
  enrollmentId: number;
  bimesterId: number;
  courseId: number;
  results: Array<{
    calculationType: CalculationType;
    competencies: {
      E: { result: number; color?: CompetencyColor };
      R: { result: number; color?: CompetencyColor };
      I: { result: number; color?: CompetencyColor };
      C: { result: number; color?: CompetencyColor };
      A: { result: number; color?: CompetencyColor };
    };
    calculationDate: string;
    sourceWeeks?: string;
  }>;
  summary: Record<string, {
    average: number;
    min: number;
    max: number;
    colorDistribution: Record<string, number>;
  }>;
}

// Resumen de bimestre y curso
export interface BimesterCourseSummaryResponse {
  bimesterId: number;
  courseId: number;
  sectionId?: number;
  statistics: Array<{
    calculationType: CalculationType;
    competencyStats: Array<{
      competency: CompetencyCode;
      average: number;
      min: number;
      max: number;
      colorDistribution: Record<string, number>;
      totalStudents: number;
    }>;
    totalStudents: number;
  }>;
  totalResults: number;
  calculationTypes: string[];
}

// Estadísticas de sección
export interface BimesterSectionStatsResponse {
  section: {
    id: number;
    name: string;
    grade: {
      name: string;
      level: string;
    };
  };
  bimesterId: number;
  courseId?: number;
  stats: {
    totalStudents: number;
    studentsWithResults: number;
    studentsWithEvaluations: number;
    completionRate: number;
    evaluationRate: number;
    totalResults: number;
    totalEvaluations: number;
  };
  calculationTypeStats: Record<string, any>;
  colorDistribution: Record<string, number>;
}

// Analíticas de profesor
export interface TeacherAnalyticsResponse {
  teacher: {
    id: number;
    name: string;
    teacherDetails?: any;
  };
  bimesterId: number;
  courseId?: number;
  sectionId?: number;
  analytics: Record<number, any>;
  summary: {
    totalCourses: number;
    totalResults: number;
    totalEvaluations: number;
    studentsImpacted: number;
  };
}

// Salud del bimestre
export interface BimesterHealthResponse {
  bimester: {
    id: number;
    name: string;
    cycle: string;
    weeksCount: number;
  };
  health: {
    status: 'healthy' | 'issues';
    issues: string[];
    recommendations: string[];
    configsCount: number;
  };
}

// ============================================
// FILTER TYPES
// ============================================

export interface ConfigFilters {
  configType?: ConfigType;
  category?: ConfigCategory;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================
// FORM VALUES
// ============================================

export interface ConfigFormValues {
  configType: ConfigType;
  configKey: string;
  configValue: string;
  description: string;
  category: ConfigCategory;
  isActive: boolean;
}

export interface UpdateConfigFormValues {
  configType?: ConfigType;
  configKey?: string;
  configValue?: string;
  description?: string;
  category?: ConfigCategory;
  isActive?: boolean;
}