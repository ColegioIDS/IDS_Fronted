// src/services/school-cycle.service.ts

import { api } from '@/config/api';
import {
  SchoolCycle,
  SchoolCycleStats,
  CreateSchoolCycleDto,
  UpdateSchoolCycleDto,
  QuerySchoolCyclesDto,
  PaginatedResponse,
} from '@/types/school-cycle.types';

export const schoolCycleService = {
  async getAll(query: QuerySchoolCyclesDto = {}): Promise<PaginatedResponse<SchoolCycle>> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/api/school-cycles?${params.toString()}`);

    if (!response.data) {
      throw new Error('No se recibió respuesta del servidor');
    }

    if (!response.data.success) {
      const error = new Error(response.data.message || 'Error al obtener ciclos escolares') as any;
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

  async getActive(): Promise<SchoolCycle> {
    const response = await api.get('/api/school-cycles/active');

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al obtener ciclo activo') as any;
      error.response = { data: response.data };
      throw error;
    }

    if (!response.data.data) {
      throw new Error('No hay ciclo escolar activo');
    }

    return response.data.data;
  },

  async getById(id: number): Promise<SchoolCycle> {
    const response = await api.get(`/api/school-cycles/${id}`);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al obtener el ciclo') as any;
      error.response = { data: response.data };
      throw error;
    }

    if (!response.data.data) {
      throw new Error('Ciclo escolar no encontrado');
    }

    return response.data.data;
  },

  async getStats(id: number): Promise<SchoolCycleStats> {
    const response = await api.get(`/api/school-cycles/${id}/stats`);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al obtener estadísticas') as any;
      error.response = { data: response.data };
      throw error;
    }

    if (!response.data.data) {
      throw new Error('No se pudieron obtener las estadísticas');
    }

    return response.data.data;
  },

  async create(data: CreateSchoolCycleDto): Promise<SchoolCycle> {
    const response = await api.post('/api/school-cycles', data);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al crear ciclo escolar') as any;
      error.response = { data: response.data };
      throw error;
    }

    if (!response.data.data) {
      throw new Error('No se pudo crear el ciclo escolar');
    }

    return response.data.data;
  },

  async update(id: number, data: UpdateSchoolCycleDto): Promise<SchoolCycle> {
    const response = await api.patch(`/api/school-cycles/${id}`, data);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al actualizar ciclo escolar') as any;
      error.response = { data: response.data };
      throw error;
    }

    if (!response.data.data) {
      throw new Error('No se pudo actualizar el ciclo escolar');
    }

    return response.data.data;
  },

  async activate(id: number): Promise<SchoolCycle> {
    const response = await api.patch(`/api/school-cycles/${id}/activate`);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al activar ciclo escolar') as any;
      error.response = { data: response.data };
      throw error;
    }

    if (!response.data.data) {
      throw new Error('No se pudo activar el ciclo escolar');
    }

    return response.data.data;
  },

  async archive(id: number, archiveReason?: string): Promise<SchoolCycle> {
    const response = await api.patch(`/api/school-cycles/${id}/archive`, {
      archiveReason,
    });

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al archivar ciclo escolar') as any;
      error.response = { data: response.data };
      throw error;
    }

    if (!response.data.data) {
      throw new Error('No se pudo archivar el ciclo escolar');
    }

    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    const response = await api.delete(`/api/school-cycles/${id}`);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al eliminar ciclo escolar') as any;
      error.response = { data: response.data };
      throw error;
    }
  },
};