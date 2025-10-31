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

const BASE_URL = '/sections';

export const sectionsService = {
  /**
   * Get all sections with pagination and filters
   */
  getAll: async (params?: QuerySectionsDto): Promise<PaginatedSectionsResponse> => {
    const response = await api.get<{ data: PaginatedSectionsResponse }>(BASE_URL, { params });
    return response.data.data;
  },

  /**
   * Get sections by grade ID
   */
  getByGrade: async (gradeId: number): Promise<Section[]> => {
    const response = await api.get<{ data: Section[] }>(`${BASE_URL}/grade/${gradeId}`);
    return response.data.data;
  },

  /**
   * Get section by ID
   */
  getById: async (id: number): Promise<Section> => {
    const response = await api.get<{ data: Section }>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  /**
   * Get section statistics
   */
  getStats: async (id: number): Promise<SectionStats> => {
    const response = await api.get<{ data: SectionStats }>(`${BASE_URL}/${id}/stats`);
    return response.data.data;
  },

  /**
   * Create new section
   */
  create: async (data: CreateSectionDto): Promise<Section> => {
    const response = await api.post<{ data: Section }>(BASE_URL, data);
    return response.data.data;
  },

  /**
   * Update existing section
   */
  update: async (id: number, data: UpdateSectionDto): Promise<Section> => {
    const response = await api.patch<{ data: Section }>(`${BASE_URL}/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete section (only if no dependencies)
   */
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete<{ data: { message: string } }>(`${BASE_URL}/${id}`);
    return response.data.data;
  },

  /**
   * Assign teacher to section
   */
  assignTeacher: async (id: number, teacherId: number): Promise<Section> => {
    const response = await api.patch<{ data: Section }>(
      `${BASE_URL}/${id}/assign-teacher`,
      { teacherId }
    );
    return response.data.data;
  },

  /**
   * Remove teacher from section
   */
  removeTeacher: async (id: number): Promise<Section> => {
    const response = await api.patch<{ data: Section }>(`${BASE_URL}/${id}/remove-teacher`);
    return response.data.data;
  },
};

export default sectionsService;
