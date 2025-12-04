// src/services/erica-topics.service.ts
import { api } from '@/config/api';
import {
  EricaTopic,
  EricaTopicWithRelations,
  CreateEricaTopicDto,
  UpdateEricaTopicDto,
  EricaTopicsQuery,
  PaginatedEricaTopics,
  EricaTopicStats,
  DuplicateEricaTopicDto,
  CompleteEricaTopicDto,
} from '@/types/erica-topics.types';

export const ericaTopicsService = {
  /**
   * Crear un nuevo tema ERICA
   */
  async createEricaTopic(data: CreateEricaTopicDto): Promise<EricaTopic> {
    // ✅ VALIDACIÓN
    if (!data.courseId || data.courseId <= 0) {
      throw new Error('ID de curso inválido');
    }
    if (!data.academicWeekId || data.academicWeekId <= 0) {
      throw new Error('ID de semana académica inválido');
    }
    if (!data.sectionId || data.sectionId <= 0) {
      throw new Error('ID de sección inválido');
    }
    if (!data.teacherId || data.teacherId <= 0) {
      throw new Error('ID de docente inválido');
    }
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Título es requerido');
    }
    if (!data.weekTheme || data.weekTheme.trim().length === 0) {
      throw new Error('Tema de la semana es requerido');
    }

    const response = await api.post('/api/erica-topics', data);

    // ✅ VALIDACIÓN
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al crear tema ERICA');
    }

    return response.data.data;
  },

  /**
   * Obtener todos los temas ERICA con filtros y paginación
   */
  async getEricaTopics(query: EricaTopicsQuery = {}): Promise<PaginatedEricaTopics> {
    const params = new URLSearchParams();

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.courseId) params.append('courseId', query.courseId.toString());
    if (query.sectionId) params.append('sectionId', query.sectionId.toString());
    if (query.teacherId) params.append('teacherId', query.teacherId.toString());
    if (query.academicWeekId) params.append('academicWeekId', query.academicWeekId.toString());
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query.isCompleted !== undefined) params.append('isCompleted', query.isCompleted.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.sortOrder) params.append('sortOrder', query.sortOrder);

    const response = await api.get(`/api/erica-topics?${params.toString()}`);

    // ✅ VALIDACIÓN
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener temas ERICA');
    }

    // ✅ VALIDACIÓN: data puede ser array vacío
    const data = Array.isArray(response.data.data) ? response.data.data : [];

    // ✅ VALIDACIÓN: meta con valores por defecto
    const meta = response.data.meta || {
      page: query.page || 1,
      limit: query.limit || 10,
      total: 0,
      totalPages: 0,
    };

    return { data, meta };
  },

  /**
   * Obtener un tema ERICA por ID
   */
  async getEricaTopicById(id: number): Promise<EricaTopicWithRelations> {
    // ✅ VALIDACIÓN
    if (!id || id <= 0) {
      throw new Error('ID de tema inválido');
    }

    const response = await api.get(`/api/erica-topics/${id}`);

    // ✅ VALIDACIÓN
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Tema ERICA no encontrado');
    }

    return response.data.data;
  },

  /**
   * Actualizar un tema ERICA
   */
  async updateEricaTopic(id: number, data: UpdateEricaTopicDto): Promise<EricaTopic> {
    // ✅ VALIDACIÓN
    if (!id || id <= 0) {
      throw new Error('ID de tema inválido');
    }
    if (Object.keys(data).length === 0) {
      throw new Error('No hay datos para actualizar');
    }

    const response = await api.put(`/api/erica-topics/${id}`, data);

    // ✅ VALIDACIÓN
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al actualizar tema ERICA');
    }

    return response.data.data;
  },

  /**
   * Eliminar un tema ERICA
   */
  async deleteEricaTopic(id: number): Promise<EricaTopic> {
    // ✅ VALIDACIÓN
    if (!id || id <= 0) {
      throw new Error('ID de tema inválido');
    }

    const response = await api.delete(`/api/erica-topics/${id}`);

    // ✅ VALIDACIÓN
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al eliminar tema ERICA');
    }

    return response.data.data;
  },

  /**
   * Obtener temas por docente
   */
  async getEricaTopicsByTeacher(teacherId: number, query: Omit<EricaTopicsQuery, 'teacherId'> = {}): Promise<EricaTopic[]> {
    // ✅ VALIDACIÓN
    if (!teacherId || teacherId <= 0) {
      throw new Error('ID de docente inválido');
    }

    const params = new URLSearchParams();
    params.append('teacherId', teacherId.toString());

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query.isCompleted !== undefined) params.append('isCompleted', query.isCompleted.toString());

    const response = await api.get(`/api/erica-topics/teacher/${teacherId}?${params.toString()}`);

    // ✅ VALIDACIÓN
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener temas del docente');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener temas por sección
   */
  async getEricaTopicsBySection(sectionId: number, query: Omit<EricaTopicsQuery, 'sectionId'> = {}): Promise<EricaTopic[]> {
    // ✅ VALIDACIÓN
    if (!sectionId || sectionId <= 0) {
      throw new Error('ID de sección inválido');
    }

    const params = new URLSearchParams();
    params.append('sectionId', sectionId.toString());

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    const response = await api.get(`/api/erica-topics/section/${sectionId}?${params.toString()}`);

    // ✅ VALIDACIÓN
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener temas de la sección');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener temas por semana académica
   */
  async getEricaTopicsByWeek(weekId: number, query: Omit<EricaTopicsQuery, 'academicWeekId'> = {}): Promise<EricaTopic[]> {
    // ✅ VALIDACIÓN
    if (!weekId || weekId <= 0) {
      throw new Error('ID de semana inválido');
    }

    const params = new URLSearchParams();
    params.append('academicWeekId', weekId.toString());

    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());

    const response = await api.get(`/api/erica-topics/week/${weekId}?${params.toString()}`);

    // ✅ VALIDACIÓN
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener temas de la semana');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Duplicar tema a nueva semana
   */
  async duplicateEricaTopic(id: number, data: DuplicateEricaTopicDto): Promise<EricaTopic> {
    // ✅ VALIDACIÓN
    if (!id || id <= 0) {
      throw new Error('ID de tema inválido');
    }
    if (!data.newWeekId || data.newWeekId <= 0) {
      throw new Error('ID de nueva semana inválido');
    }

    const response = await api.post(`/api/erica-topics/${id}/duplicate`, data);

    // ✅ VALIDACIÓN
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al duplicar tema ERICA');
    }

    return response.data.data;
  },

  /**
   * Marcar tema como completado
   */
  async completeEricaTopic(id: number, data: CompleteEricaTopicDto): Promise<EricaTopic> {
    // ✅ VALIDACIÓN
    if (!id || id <= 0) {
      throw new Error('ID de tema inválido');
    }

    const response = await api.patch(`/api/erica-topics/${id}/complete`, data);

    // ✅ VALIDACIÓN
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al marcar tema como completado');
    }

    return response.data.data;
  },

  /**
   * Obtener estadísticas del docente
   */
  async getEricaTopicStats(teacherId: number): Promise<EricaTopicStats> {
    // ✅ VALIDACIÓN
    if (!teacherId || teacherId <= 0) {
      throw new Error('ID de docente inválido');
    }

    const response = await api.get(`/api/erica-topics/teacher/${teacherId}/stats`);

    // ✅ VALIDACIÓN
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener estadísticas');
    }

    return response.data.data;
  },
};
