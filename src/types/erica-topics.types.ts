// src/types/erica-topics.types.ts

/**
 * Tema ERICA base
 */
export interface EricaTopic {
  id: number;
  courseId: number;
  academicWeekId: number;
  sectionId: number;
  teacherId: number;
  title: string;
  weekTheme: string;
  description?: string;
  objectives?: string;
  materials?: string;
  isActive: boolean;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tema ERICA con relaciones
 */
export interface EricaTopicWithRelations extends EricaTopic {
  course: {
    name: string;
    code?: string;
  };
  academicWeek: {
    number: number;
    startDate: Date;
    endDate: Date;
  };
  section: {
    name: string;
  };
  teacher: {
    givenNames: string;
    lastNames: string;
  };
}

/**
 * DTO para crear tema ERICA
 */
export interface CreateEricaTopicDto {
  courseId: number;
  academicWeekId: number;
  sectionId: number;
  teacherId: number;
  title: string;
  weekTheme: string;
  description?: string;
  objectives?: string;
  materials?: string;
  isActive?: boolean;
  isCompleted?: boolean;
}

/**
 * DTO para actualizar tema ERICA
 */
export interface UpdateEricaTopicDto {
  title?: string;
  weekTheme?: string;
  description?: string;
  objectives?: string;
  materials?: string;
  isActive?: boolean;
  isCompleted?: boolean;
}

/**
 * Query parameters para filtrar temas
 */
export interface EricaTopicsQuery {
  page?: number;
  limit?: number;
  search?: string;
  courseId?: number;
  sectionId?: number;
  teacherId?: number;
  academicWeekId?: number;
  isActive?: boolean;
  isCompleted?: boolean;
  sortBy?: 'title' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Respuesta paginada de temas ERICA
 */
export interface PaginatedEricaTopics {
  data: EricaTopic[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Estadísticas de temas ERICA
 */
export interface EricaTopicStats {
  total: number;
  completed: number;
  pending: number;
  withEvaluations: number;
  completionRate: number;
  evaluationRate: number;
  // Propiedades alias para compatibilidad con el componente de UI
  totalTopics?: number;
  completedTopics?: number;
  activeTopics?: number;
  pendingTopics?: number;
  averageStudentsPerTopic?: number;
}

/**
 * DTO para duplicar tema
 */
export interface DuplicateEricaTopicDto {
  targetWeekId: number;
}

/**
 * DTO para marcar como completado
 */
export interface CompleteEricaTopicDto {
  isCompleted?: boolean;
}

// ============================================
// TIPOS PARA CASCADE DATA DE ERICA TOPICS
// ============================================

/**
 * Ciclo escolar
 */
export interface EricaSchoolCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

/**
 * Bimestre
 */
export interface EricaBimester {
  id: number;
  cycleId: number;
  number: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

/**
 * Semana académica
 */
export interface EricaAcademicWeek {
  id: number;
  bimesterId: number;
  number: number;
  startDate: string;
  endDate: string;
}

/**
 * Grado
 */
export interface EricaGrade {
  id: number;
  name: string;
  level: string;
  order: number;
  isActive: boolean;
}

/**
 * Curso básico
 */
export interface EricaCourse {
  id: number;
  code: string;
  name: string;
  area: string | null;
  color: string | null;
  isActive: boolean;
}

/**
 * Docente básico
 */
export interface EricaTeacher {
  id: number;
  givenNames: string;
  lastNames: string;
  email: string | null;
}

/**
 * Asignación de curso con docente
 */
export interface EricaCourseAssignment {
  id: number;
  course: EricaCourse;
  teacher: EricaTeacher;
}

/**
 * Sección con cursos asignados
 */
export interface EricaSection {
  id: number;
  name: string;
  capacity: number;
  gradeId: number;
  teacher: EricaTeacher | null;
  courseAssignments: EricaCourseAssignment[];
}

/**
 * Respuesta del endpoint /api/erica-topics/cascade
 */
export interface EricaCascadeDataResponse {
  cycle: EricaSchoolCycle;
  activeBimester: EricaBimester | null;
  weeks: EricaAcademicWeek[];
  grades: EricaGrade[];
  gradesSections: {
    [gradeId: string]: EricaSection[];
  };
}

/**
 * Códigos de error para cascade data
 */
export type EricaCascadeErrorCode =
  | 'NO_ACTIVE_CYCLE'
  | 'NO_ACTIVE_BIMESTER'
  | 'NO_WEEKS'
  | 'NO_GRADES'
  | 'NO_COURSES'
  | 'API_ERROR'
  | 'UNKNOWN';
