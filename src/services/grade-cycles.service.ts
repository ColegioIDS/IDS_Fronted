// src/services/grade-cycles.service.ts

import { api } from '@/config/api';
import type {
  GradeCycle,
  CreateGradeCycleDto,
  BulkCreateGradeCycleDto,
  UpdateGradeCycleDto,
  AvailableGrade,
  AvailableCycle,
  BulkCreateResponse,
  DeleteGradeCycleResponse,
} from '@/types/grade-cycles.types';

/**
 * 🔗 Grade Cycles Service
 * Servicio para gestionar relaciones entre grados y ciclos escolares
 * Usa axios (api helper) para consistencia con otros servicios
 */
export const gradeCyclesService = {
  // ============================================================================
  // CRUD Operations
  // ============================================================================

  /**
   * Crear relación individual grado-ciclo
   */
  async create(data: CreateGradeCycleDto): Promise<GradeCycle> {
    const response = await api.post('/api/grade-cycles', data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al crear relación grado-ciclo');
    }

    return response.data.data;
  },

  /**
   * Crear múltiples relaciones en bulk
   */
  async bulkCreate(data: BulkCreateGradeCycleDto): Promise<BulkCreateResponse> {
    const response = await api.post('/api/grade-cycles/bulk', data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al crear relaciones');
    }

    return response.data.data;
  },

  /**
   * Obtener grados asociados a un ciclo
   */
  async getGradesByCycle(cycleId: number): Promise<GradeCycle[]> {
    const response = await api.get(`/api/grade-cycles/by-cycle/${cycleId}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener grados del ciclo');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener ciclos asociados a un grado
   */
  async getCyclesByGrade(gradeId: number): Promise<GradeCycle[]> {
    const response = await api.get(`/api/grade-cycles/by-grade/${gradeId}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener ciclos del grado');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Actualizar relación grado-ciclo
   */
  async update(
    cycleId: number,
    gradeId: number,
    data: UpdateGradeCycleDto
  ): Promise<GradeCycle> {
    const response = await api.patch(`/api/grade-cycles/${cycleId}/${gradeId}`, data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al actualizar relación');
    }

    return response.data.data;
  },

  /**
   * Eliminar relación grado-ciclo
   */
  async delete(cycleId: number, gradeId: number): Promise<DeleteGradeCycleResponse> {
    const response = await api.delete(`/api/grade-cycles/${cycleId}/${gradeId}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al eliminar relación');
    }

    return response.data.data;
  },

  // ============================================================================
  // Helper Endpoints (Independientes - No requieren permisos de otros módulos)
  // ============================================================================

  /**
   * 🔧 HELPER: Obtener todos los grados activos
   * No requiere permisos de grades:read
   */
  async getAvailableGrades(): Promise<AvailableGrade[]> {
    const response = await api.get('/api/grade-cycles/helpers/available-grades');

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener grados disponibles');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * 🔧 HELPER: Obtener todos los ciclos activos
   * No requiere permisos de cycle:read
   */
  async getAvailableCycles(): Promise<AvailableCycle[]> {
    const response = await api.get('/api/grade-cycles/helpers/available-cycles');

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener ciclos disponibles');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * 🔧 HELPER: Obtener grados disponibles para un ciclo
   * Retorna grados que AÚN NO están asociados al ciclo
   */
  async getAvailableGradesForCycle(cycleId: number): Promise<AvailableGrade[]> {
    const response = await api.get(`/api/grade-cycles/helpers/available-grades-for-cycle/${cycleId}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener grados disponibles');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * 🔧 HELPER: Obtener ciclos disponibles para un grado
   * Retorna ciclos que AÚN NO están asociados al grado
   */
  async getAvailableCyclesForGrade(gradeId: number): Promise<AvailableCycle[]> {
    const response = await api.get(`/api/grade-cycles/helpers/available-cycles-for-grade/${gradeId}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener ciclos disponibles');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },
};
