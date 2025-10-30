// src/services/academic-week.service.ts

import { api } from '@/config/api';
import {
  AcademicWeek,
  AcademicWeekWithRelations,
  CreateAcademicWeekDto,
  UpdateAcademicWeekDto,
  QueryAcademicWeeksDto,
  QueryCyclesDto,
  QueryBimestersDto,
  PaginatedAcademicWeeksResponse,
  PaginatedCyclesResponse,
  PaginatedBimestersResponse,
  BimesterInfoResponse,
  BimesterDateRangeResponse,
} from '@/types/academic-week.types';

/**
 * 🎓 Service para Academic Weeks
 * 
 * REGLA CRÍTICA: Solo usa endpoints de /api/academic-weeks/*
 * - Para ciclos: /api/academic-weeks/helpers/cycles
 * - Para bimestres: /api/academic-weeks/helpers/bimesters
 * - Para info: /api/academic-weeks/helpers/bimesters/:id/info
 * 
 * ✅ Requiere SOLO: academic-week:read
 * ❌ NO requiere: bimester:read, cycle:read, school-cycle:read
 */
export const academicWeekService = {
  // ============================================
  // ACADEMIC WEEK CRUD OPERATIONS
  // ============================================

  /**
   * Obtener todas las semanas académicas con paginación
   * @requires academic-week:read
   */
  async getAll(query: QueryAcademicWeeksDto = {}): Promise<PaginatedAcademicWeeksResponse> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/api/academic-weeks?${params.toString()}`);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al obtener semanas académicas') as any;
      error.response = { data: response.data };
      throw error;
    }

    const data = Array.isArray(response.data.data) ? response.data.data : [];
    const meta = response.data.meta || {
      page: query.page || 1,
      limit: query.limit || 10,
      total: 0,
      totalPages: 0,
    };

    return { data, meta };
  },

  /**
   * Obtener una semana académica por ID
   * @requires academic-week:read-one
   */
  async getById(id: number): Promise<AcademicWeekWithRelations> {
    const response = await api.get(`/api/academic-weeks/${id}`);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al obtener la semana académica') as any;
      error.response = { data: response.data };
      throw error;
    }

    if (!response.data.data) {
      throw new Error('Semana académica no encontrada');
    }

    return response.data.data;
  },

  /**
   * Crear una nueva semana académica
   * @requires academic-week:create
   */
  async create(data: CreateAcademicWeekDto): Promise<AcademicWeek> {
    const response = await api.post('/api/academic-weeks', data);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al crear la semana académica') as any;
      error.response = { data: response.data };
      throw error;
    }

    return response.data.data;
  },

  /**
   * Actualizar una semana académica
   * @requires academic-week:update
   */
  async update(id: number, data: UpdateAcademicWeekDto): Promise<AcademicWeek> {
    const response = await api.patch(`/api/academic-weeks/${id}`, data);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al actualizar la semana académica') as any;
      error.response = { data: response.data };
      throw error;
    }

    return response.data.data;
  },

  /**
   * Eliminar una semana académica
   * @requires academic-week:delete
   */
  async delete(id: number): Promise<void> {
    const response = await api.delete(`/api/academic-weeks/${id}`);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al eliminar la semana académica') as any;
      error.response = { data: response.data };
      throw error;
    }
  },

  // ============================================
  // HELPER ENDPOINTS (usa permisos de academic-week)
  // ============================================

  /**
   * Obtener ciclos escolares disponibles para academic weeks
   * @requires academic-week:read
   * @endpoint /api/academic-weeks/helpers/cycles
   */
  async getAvailableCycles(query: QueryCyclesDto = {}): Promise<PaginatedCyclesResponse> {
    const params = new URLSearchParams();
    
    if (query.includeArchived !== undefined) {
      params.append('includeArchived', query.includeArchived.toString());
    }
    if (query.onlyActive !== undefined) {
      params.append('onlyActive', query.onlyActive.toString());
    }

    const response = await api.get(`/api/academic-weeks/helpers/cycles?${params.toString()}`);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al obtener ciclos') as any;
      error.response = { data: response.data };
      throw error;
    }

    const data = Array.isArray(response.data.data) ? response.data.data : [];
    const meta = response.data.meta || {
      page: 1,
      limit: 100,
      total: data.length,
      totalPages: 1,
    };

    return { data, meta };
  },

  /**
   * Obtener bimestres disponibles para academic weeks
   * @requires academic-week:read
   * @endpoint /api/academic-weeks/helpers/bimesters
   */
  async getAvailableBimesters(query: QueryBimestersDto = {}): Promise<PaginatedBimestersResponse> {
    const params = new URLSearchParams();
    
    if (query.cycleId) {
      params.append('cycleId', query.cycleId.toString());
    }
    if (query.onlyActive !== undefined) {
      params.append('onlyActive', query.onlyActive.toString());
    }

    const response = await api.get(`/api/academic-weeks/helpers/bimesters?${params.toString()}`);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al obtener bimestres') as any;
      error.response = { data: response.data };
      throw error;
    }

    const data = Array.isArray(response.data.data) ? response.data.data : [];
    const meta = response.data.meta || {
      page: 1,
      limit: 100,
      total: data.length,
      totalPages: 1,
    };

    return { data, meta };
  },

  /**
   * Obtener información detallada de un bimestre
   * @requires academic-week:read
   * @endpoint /api/academic-weeks/helpers/bimesters/:id/info
   */
  async getBimesterInfo(bimesterId: number): Promise<BimesterInfoResponse> {
    const response = await api.get(`/api/academic-weeks/helpers/bimesters/${bimesterId}/info`);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al obtener información del bimestre') as any;
      error.response = { data: response.data };
      throw error;
    }

    return response.data.data;
  },

  /**
   * Obtener rango de fechas de un bimestre
   * @requires academic-week:read
   * @endpoint /api/academic-weeks/helpers/bimesters/:id/date-range
   */
  async getBimesterDateRange(bimesterId: number): Promise<BimesterDateRangeResponse> {
    const response = await api.get(`/api/academic-weeks/helpers/bimesters/${bimesterId}/date-range`);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al obtener rango de fechas') as any;
      error.response = { data: response.data };
      throw error;
    }

    return response.data.data;
  },
};

export default academicWeekService;
