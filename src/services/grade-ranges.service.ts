// src/services/grade-ranges.service.ts

import { api } from '@/config/api';
import {
  GradeRange,
  CreateGradeRangeDto,
  UpdateGradeRangeDto,
  QueryGradeRangesDto,
  PaginatedGradeRangesResponse,
} from '@/types/grade-ranges.types';

const GRADE_RANGES_ENDPOINT = 'api/grade-ranges';

/**
 * 📊 Servicio para gestión de Rangos de Calificaciones
 * Alineado con el patrón de grades.service.ts
 */
export const gradeRangesService = {
  // ============================================
  // CRUD OPERATIONS
  // ============================================

  /**
   * Obtener lista de rangos con filtros y paginación
   */
  async getAll(params?: QueryGradeRangesDto): Promise<PaginatedGradeRangesResponse> {
    try {
      const response = await api.get(GRADE_RANGES_ENDPOINT, { params });
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener rangos de calificaciones');
      }
      
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      const meta = response.data.meta || {
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 0,
      };

      return { data, meta };
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para ver los rangos de calificaciones');
      }
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al cargar la lista de rangos'
      );
    }
  },

  /**
   * Obtener un rango específico por ID
   */
  async getById(id: number): Promise<GradeRange> {
    try {
      const response = await api.get(`${GRADE_RANGES_ENDPOINT}/${id}`);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener el rango');
      }
      
      if (!response.data.data) {
        throw new Error(`Rango con ID ${id} no encontrado`);
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Rango con ID ${id} no encontrado`);
      }
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para ver este rango');
      }
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al cargar el rango'
      );
    }
  },

  /**
   * Crear un nuevo rango de calificaciones
   */
  async create(data: CreateGradeRangeDto): Promise<GradeRange> {
    try {
      const response = await api.post(GRADE_RANGES_ENDPOINT, data);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al crear el rango');
      }
      
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error(`Ya existe un rango con el nombre "${data.name}"`);
      }
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para crear rangos');
      }
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al crear el rango'
      );
    }
  },

  /**
   * Actualizar un rango existente
   */
  async update(id: number, data: UpdateGradeRangeDto): Promise<GradeRange> {
    try {
      const response = await api.patch(`${GRADE_RANGES_ENDPOINT}/${id}`, data);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al actualizar el rango');
      }
      
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Rango con ID ${id} no encontrado`);
      }
      if (error.response?.status === 409) {
        throw new Error(`Ya existe un rango con el nombre "${data.name}"`);
      }
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para actualizar rangos');
      }
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al actualizar el rango'
      );
    }
  },

  /**
   * Eliminar un rango (permanente)
   */
  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete(`${GRADE_RANGES_ENDPOINT}/${id}`);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al eliminar el rango');
      }
      
      return response.data.data || { message: 'Rango eliminado exitosamente' };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Rango con ID ${id} no encontrado`);
      }
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para eliminar rangos');
      }
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al eliminar el rango'
      );
    }
  },

  // ============================================
  // SPECIAL OPERATIONS
  // ============================================

  /**
   * Obtener rangos por nivel específico
   */
  async getByLevel(level: string): Promise<GradeRange[]> {
    try {
      const response = await api.get(`${GRADE_RANGES_ENDPOINT}/by-level/${level}`);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener rangos');
      }
      
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para ver rangos');
      }
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al cargar rangos del nivel'
      );
    }
  },

  // ============================================
  // VALIDATION HELPERS
  // ============================================

  /**
   * Verificar si el nombre del rango ya existe
   */
  async nameExists(name: string, excludeId?: number): Promise<boolean> {
    try {
      const response = await this.getAll({ search: name, limit: 100 });
      return response.data.some(
        range => range.name.toLowerCase() === name.toLowerCase() && range.id !== excludeId
      );
    } catch (error) {
      return false;
    }
  },
};

export default gradeRangesService;
