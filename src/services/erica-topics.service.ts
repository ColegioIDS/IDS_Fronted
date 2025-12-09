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
  EricaCascadeDataResponse,
  EricaCascadeErrorCode,
} from '@/types/erica-topics.types';

/**
 * Error personalizado para cascade data de ERICA
 */
export class EricaCascadeError extends Error {
  code: EricaCascadeErrorCode;
  
  constructor(message: string, code: EricaCascadeErrorCode) {
    super(message);
    this.name = 'EricaCascadeError';
    this.code = code;
  }
}

/**
 * Helper para extraer mensaje de error, especialmente para errores de permisos
 */
function extractErrorMessage(responseData: any, defaultMessage: string): string {
  if (responseData?.reason === 'INSUFFICIENT_PERMISSIONS') {
    // Si hay detalles, usarlos (ej: "No tiene permiso para: erica-topic.mark-complete")
    if (responseData?.details?.length > 0) {
      return responseData.details.join(', ');
    }
    return responseData?.message || 'No tiene permisos para realizar esta acción';
  }
  return responseData?.message || defaultMessage;
}

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

    try {
      const response = await api.post('/api/erica-topics', data);

      // ✅ VALIDACIÓN
      if (!response.data?.success) {
        throw new Error(extractErrorMessage(response.data, 'Error al crear tema ERICA'));
      }

      return response.data.data;
    } catch (error: any) {
      // Capturar errores de axios (403, 401, etc.)
      if (error.response?.data) {
        throw new Error(extractErrorMessage(error.response.data, 'Error al crear tema ERICA'));
      }
      throw error;
    }
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

    try {
      const response = await api.get(`/api/erica-topics?${params.toString()}`);

      // ✅ VALIDACIÓN
      if (!response.data?.success) {
        throw new Error(extractErrorMessage(response.data, 'Error al obtener temas ERICA'));
      }

      // ✅ VALIDACIÓN: data puede ser array vacío
      const data = Array.isArray(response.data.data) ? response.data.data : [];

      // ✅ VALIDACIÓN: meta con valores por defecto
      // El backend puede devolver meta en diferentes estructuras, así que normalizamos
      const backendMeta = response.data.meta || {};
      const page = backendMeta.page || query.page || 1;
      const limit = backendMeta.limit || query.limit || 10;
      const total = backendMeta.total !== undefined ? backendMeta.total : data.length;
      const totalPages = Math.ceil(total / limit);

      const meta = {
        page,
        limit,
        total,
        totalPages,
      };

      return { data, meta };
    } catch (error: any) {
      // Capturar errores de axios (403, 401, etc.)
      if (error.response?.data) {
        throw new Error(extractErrorMessage(error.response.data, 'Error al obtener temas ERICA'));
      }
      throw error;
    }
  },

  /**
   * Obtener un tema ERICA por ID
   */
  async getEricaTopicById(id: number): Promise<EricaTopicWithRelations> {
    // ✅ VALIDACIÓN
    if (!id || id <= 0) {
      throw new Error('ID de tema inválido');
    }

    try {
      const response = await api.get(`/api/erica-topics/${id}`);

      // ✅ VALIDACIÓN
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Tema ERICA no encontrado');
      }

      return response.data.data;
    } catch (error: any) {
      // Capturar errores de axios (403, 401, etc.)
      if (error.response?.data) {
        throw new Error(extractErrorMessage(error.response.data, 'Error al obtener tema ERICA'));
      }
      throw error;
    }
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

    try {
      const response = await api.patch(`/api/erica-topics/${id}`, data);

      // ✅ VALIDACIÓN
      if (!response.data?.success) {
        throw new Error(extractErrorMessage(response.data, 'Error al actualizar tema ERICA'));
      }

      return response.data.data;
    } catch (error: any) {
      // Capturar errores de axios (403, 401, etc.)
      if (error.response?.data) {
        throw new Error(extractErrorMessage(error.response.data, 'Error al actualizar tema ERICA'));
      }
      throw error;
    }
  },

  /**
   * Eliminar un tema ERICA
   */
  async deleteEricaTopic(id: number): Promise<EricaTopic> {
    // ✅ VALIDACIÓN
    if (!id || id <= 0) {
      throw new Error('ID de tema inválido');
    }

    try {
      const response = await api.delete(`/api/erica-topics/${id}`);

      // ✅ VALIDACIÓN
      if (!response.data?.success) {
        throw new Error(extractErrorMessage(response.data, 'Error al eliminar tema ERICA'));
      }

      return response.data.data;
    } catch (error: any) {
      // Capturar errores de axios (403, 401, etc.)
      if (error.response?.data) {
        throw new Error(extractErrorMessage(error.response.data, 'Error al eliminar tema ERICA'));
      }
      throw error;
    }
  },

  /**
   * Obtener temas por docente (usa endpoint principal con filtro)
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

    try {
      // Usa el endpoint principal con filtro de teacherId
      const response = await api.get(`/api/erica-topics?${params.toString()}`);

      // ✅ VALIDACIÓN
      if (!response.data?.success) {
        throw new Error(extractErrorMessage(response.data, 'Error al obtener temas del docente'));
      }

      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error: any) {
      // Capturar errores de axios (403, 401, etc.)
      if (error.response?.data) {
        throw new Error(extractErrorMessage(error.response.data, 'Error al obtener temas del docente'));
      }
      throw error;
    }
  },

  /**
   * Obtener temas por sección (usa endpoint principal con filtro)
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

    try {
      // Usa el endpoint principal con filtro de sectionId
      const response = await api.get(`/api/erica-topics?${params.toString()}`);

      // ✅ VALIDACIÓN
      if (!response.data?.success) {
        throw new Error(extractErrorMessage(response.data, 'Error al obtener temas de la sección'));
      }

      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error: any) {
      // Capturar errores de axios (403, 401, etc.)
      if (error.response?.data) {
        throw new Error(extractErrorMessage(error.response.data, 'Error al obtener temas de la sección'));
      }
      throw error;
    }
  },

  /**
   * Obtener temas por semana académica (usa endpoint principal con filtro)
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

    try {
      // Usa el endpoint principal con filtro de academicWeekId
      const response = await api.get(`/api/erica-topics?${params.toString()}`);

      // ✅ VALIDACIÓN
      if (!response.data?.success) {
        throw new Error(extractErrorMessage(response.data, 'Error al obtener temas de la semana'));
      }

      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error: any) {
      // Capturar errores de axios (403, 401, etc.)
      if (error.response?.data) {
        throw new Error(extractErrorMessage(error.response.data, 'Error al obtener temas de la semana'));
      }
      throw error;
    }
  },

  /**
   * Duplicar tema a nueva semana
   */
  async duplicateEricaTopic(id: number, data: DuplicateEricaTopicDto): Promise<EricaTopic> {
    // ✅ VALIDACIÓN
    if (!id || id <= 0) {
      throw new Error('ID de tema inválido');
    }
    if (!data.targetWeekId || data.targetWeekId <= 0) {
      throw new Error('ID de nueva semana inválido');
    }

    try {
      const response = await api.post(`/api/erica-topics/${id}/duplicate`, data);

      // ✅ VALIDACIÓN
      if (!response.data?.success) {
        throw new Error(extractErrorMessage(response.data, 'Error al duplicar tema ERICA'));
      }

      return response.data.data;
    } catch (error: any) {
      // Capturar errores de axios (403, 401, etc.)
      if (error.response?.data) {
        throw new Error(extractErrorMessage(error.response.data, 'Error al duplicar tema ERICA'));
      }
      throw error;
    }
  },

  /**
   * Marcar tema como completado
   */
  async completeEricaTopic(id: number, data: CompleteEricaTopicDto): Promise<EricaTopic> {
    // ✅ VALIDACIÓN
    if (!id || id <= 0) {
      throw new Error('ID de tema inválido');
    }

    try {
      const response = await api.patch(`/api/erica-topics/${id}/complete`, data);

      // ✅ VALIDACIÓN
      if (!response.data?.success) {
        throw new Error(extractErrorMessage(response.data, 'Error al marcar tema como completado'));
      }

      return response.data.data;
    } catch (error: any) {
      // Capturar errores de axios (403, 401, etc.)
      if (error.response?.data) {
        throw new Error(extractErrorMessage(error.response.data, 'Error al marcar tema como completado'));
      }
      throw error;
    }
  },

  /**
   * Obtener estadísticas del docente
   */
  async getEricaTopicStats(teacherId: number): Promise<EricaTopicStats> {
    // ✅ VALIDACIÓN
    if (!teacherId || teacherId <= 0) {
      throw new Error('ID de docente inválido');
    }

    try {
      // Endpoint correcto: /erica-topics/stats/teacher/:teacherId
      const response = await api.get(`/api/erica-topics/stats/teacher/${teacherId}`);

      // ✅ VALIDACIÓN
      if (!response.data?.success) {
        throw new Error(extractErrorMessage(response.data, 'Error al obtener estadísticas'));
      }

      return response.data.data;
    } catch (error: any) {
      // Capturar errores de axios (403, 401, etc.)
      if (error.response?.data) {
        throw new Error(extractErrorMessage(error.response.data, 'Error al obtener estadísticas'));
      }
      throw error;
    }
  },

  /**
   * Obtener datos en cascada para ERICA Topics
   * Incluye: ciclo activo, bimestre activo, semanas, grados y secciones con cursos/docentes
   */
  async getCascadeData(): Promise<EricaCascadeDataResponse> {
    const response = await api.get('/api/erica-topics/cascade');

    // ✅ VALIDACIÓN: success debe ser true
    if (!response.data?.success) {
      // Detectar códigos de error específicos del backend
      const errorCode = response.data?.errorCode || response.data?.reason;
      
      if (errorCode === 'NO_ACTIVE_CYCLE') {
        throw new EricaCascadeError(
          response.data?.message || 'No hay un ciclo escolar activo en el sistema',
          'NO_ACTIVE_CYCLE'
        );
      }
      if (errorCode === 'NO_ACTIVE_BIMESTER') {
        throw new EricaCascadeError(
          response.data?.message || 'No hay un bimestre activo para el ciclo escolar actual',
          'NO_ACTIVE_BIMESTER'
        );
      }
      if (errorCode === 'NO_WEEKS') {
        throw new EricaCascadeError(
          response.data?.message || 'No hay semanas académicas registradas para este bimestre',
          'NO_WEEKS'
        );
      }
      if (errorCode === 'NO_GRADES') {
        throw new EricaCascadeError(
          response.data?.message || 'No hay grados registrados para este ciclo escolar',
          'NO_GRADES'
        );
      }

      throw new EricaCascadeError(
        response.data?.message || 'Error al obtener datos en cascada',
        'API_ERROR'
      );
    }

    // ✅ VALIDACIÓN: data debe existir
    if (!response.data?.data) {
      throw new EricaCascadeError(
        'No hay datos disponibles en el sistema',
        'API_ERROR'
      );
    }

    const data = response.data.data;

    // ✅ Asegurar que gradesSections siempre exista como objeto
    if (!data.gradesSections || typeof data.gradesSections !== 'object') {
      data.gradesSections = {};
    }

    return data;
  },
};
