// src/services/sections.service.ts

/**
 * 🏫 Sections Service
 * 
 * Servicio para gestión de secciones (aulas/grupos)
 * Endpoints: /api/sections
 */

import { api } from '@/config/api';
import type {
  Section,
  CreateSectionDto,
  UpdateSectionDto,
  QuerySectionsDto,
  PaginatedSectionsResponse,
  SectionStats,
  AssignTeacherDto,
} from '@/types/sections.types';

const BASE_URL = 'api/sections';

export const sectionsService = {
  /**
   * Get all sections with pagination and filters
   */
  getAll: async (query: QuerySectionsDto = {}): Promise<PaginatedSectionsResponse> => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`${BASE_URL}?${params.toString()}`);

    // ✅ VALIDACIÓN OBLIGATORIA
    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al cargar secciones') as any;
      error.response = response;
      throw error;
    }

    const data = Array.isArray(response.data.data) ? response.data.data : [];
    const meta = response.data.meta || { page: 1, limit: 10, total: 0, totalPages: 0 };

    return { data, meta };
  },

  /**
   * Get available teachers for section assignment
   */
  getAvailableTeachers: async (): Promise<any[]> => {
    const response = await api.get(`${BASE_URL}/available-teachers`);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al cargar profesores disponibles') as any;
      error.response = response;
      throw error;
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Get sections by grade ID
   */
  getByGrade: async (gradeId: number): Promise<Section[]> => {
    const response = await api.get(`${BASE_URL}/grade/${gradeId}`);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al cargar secciones por grado') as any;
      error.response = response;
      throw error;
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Get section by ID
   */
  getById: async (id: number): Promise<Section> => {
    const response = await api.get(`${BASE_URL}/${id}`);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al cargar sección') as any;
      error.response = response;
      throw error;
    }

    return response.data.data;
  },

  /**
   * Get section statistics
   */
  getStats: async (id: number): Promise<SectionStats> => {
    const response = await api.get(`${BASE_URL}/${id}/stats`);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al cargar estadísticas') as any;
      error.response = response;
      throw error;
    }

    return response.data.data;
  },

  /**
   * Create new section
   */
  create: async (data: CreateSectionDto): Promise<Section> => {
    const response = await api.post(BASE_URL, data);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al crear sección') as any;
      error.response = response;
      throw error;
    }

    return response.data.data;
  },

  /**
   * Update existing section
   */
  update: async (id: number, data: UpdateSectionDto): Promise<Section> => {
    const response = await api.patch(`${BASE_URL}/${id}`, data);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al actualizar sección') as any;
      error.response = response;
      throw error;
    }

    return response.data.data;
  },

  /**
   * Delete section (only if no dependencies)
   */
  delete: async (id: number): Promise<void> => {
    const response = await api.delete(`${BASE_URL}/${id}`);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al eliminar sección') as any;
      error.response = response;
      throw error;
    }
  },

  /**
   * Assign teacher to section
   */
  assignTeacher: async (id: number, data: AssignTeacherDto): Promise<Section> => {
    const response = await api.patch(`${BASE_URL}/${id}/assign-teacher`, data);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al asignar profesor') as any;
      error.response = response;
      throw error;
    }

    return response.data.data;
  },

  /**
   * Remove teacher from section
   */
  removeTeacher: async (id: number): Promise<Section> => {
    const response = await api.patch(`${BASE_URL}/${id}/remove-teacher`);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al remover profesor') as any;
      error.response = response;
      throw error;
    }

    return response.data.data;
  },
};

export default sectionsService;
