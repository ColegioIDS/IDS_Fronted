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
  totalTopics: number;
  activeTopics: number;
  completedTopics: number;
  completionRate: number;
  averageStudentsPerTopic: number;
}

/**
 * DTO para duplicar tema
 */
export interface DuplicateEricaTopicDto {
  newWeekId: number;
}

/**
 * DTO para marcar como completado
 */
export interface CompleteEricaTopicDto {
  completed: boolean;
}
