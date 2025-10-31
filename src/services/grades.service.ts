// src/services/grades.service.ts

import { api } from '@/config/api';
import {
  Grade,
  CreateGradeDto,
  UpdateGradeDto,
  QueryGradesDto,
  PaginatedGradesResponse,
  GradeStats,
} from '@/types/grades.types';

const GRADES_ENDPOINT = 'api/grades';

/**
 * 📚 Servicio para gestión de Grados Académicos
 * Alineado con el patrón de roles.service.ts y holidays.service.ts
 */
export const gradesService = {
  // ============================================
  // CRUD OPERATIONS
  // ============================================

  /**
   * Obtener lista de grados con filtros y paginación
   */
  async getAll(params?: QueryGradesDto): Promise<PaginatedGradesResponse> {
    try {
      const response = await api.get(GRADES_ENDPOINT, { params });
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener grados');
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
        throw new Error('No tienes permisos para ver los grados');
      }
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al cargar la lista de grados'
      );
    }
  },

  /**
   * Obtener un grado específico por ID
   */
  async getById(id: number): Promise<Grade> {
    try {
      const response = await api.get(`${GRADES_ENDPOINT}/${id}`);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener el grado');
      }
      
      if (!response.data.data) {
        throw new Error(`Grado con ID ${id} no encontrado`);
      }

      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Grado con ID ${id} no encontrado`);
      }
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para ver este grado');
      }
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al cargar el grado'
      );
    }
  },

  /**
   * Crear un nuevo grado
   */
  async create(data: CreateGradeDto): Promise<Grade> {
    try {
      const response = await api.post(GRADES_ENDPOINT, data);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al crear el grado');
      }
      
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error(`Ya existe un grado con el nombre "${data.name}"`);
      }
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para crear grados');
      }
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al crear el grado'
      );
    }
  },

  /**
   * Actualizar un grado existente
   */
  async update(id: number, data: UpdateGradeDto): Promise<Grade> {
    try {
      const response = await api.patch(`${GRADES_ENDPOINT}/${id}`, data);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al actualizar el grado');
      }
      
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Grado con ID ${id} no encontrado`);
      }
      if (error.response?.status === 409) {
        throw new Error(`Ya existe un grado con el nombre "${data.name}"`);
      }
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para actualizar grados');
      }
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al actualizar el grado'
      );
    }
  },

  /**
   * Eliminar un grado (permanente)
   */
  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete(`${GRADES_ENDPOINT}/${id}`);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al eliminar el grado');
      }
      
      return response.data.data || { message: 'Grado eliminado exitosamente' };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Grado con ID ${id} no encontrado`);
      }
      if (error.response?.status === 400) {
        throw new Error(
          error.response.data?.message || 
          'No se puede eliminar el grado porque tiene dependencias. Considere desactivarlo.'
        );
      }
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para eliminar grados');
      }
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al eliminar el grado'
      );
    }
  },

  // ============================================
  // SPECIAL OPERATIONS
  // ============================================

  /**
   * Desactivar un grado (soft delete)
   */
  async deactivate(id: number): Promise<Grade> {
    try {
      const response = await api.patch(`${GRADES_ENDPOINT}/${id}/deactivate`);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al desactivar el grado');
      }
      
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Grado con ID ${id} no encontrado`);
      }
      if (error.response?.status === 400) {
        throw new Error('El grado ya está desactivado');
      }
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para desactivar grados');
      }
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al desactivar el grado'
      );
    }
  },

  /**
   * Activar un grado desactivado
   */
  async activate(id: number): Promise<Grade> {
    try {
      // Usamos update para activar
      return await this.update(id, { isActive: true });
    } catch (error: any) {
      throw new Error(
        error.message || 
        'Error al activar el grado'
      );
    }
  },

  /**
   * Obtener estadísticas de un grado (secciones y ciclos asociados)
   */
  async getStats(id: number): Promise<GradeStats> {
    try {
      const response = await api.get(`${GRADES_ENDPOINT}/${id}/stats`);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener estadísticas');
      }
      
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Grado con ID ${id} no encontrado`);
      }
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para ver estadísticas');
      }
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al cargar estadísticas del grado'
      );
    }
  },

  /**
   * Obtener grados activos de un nivel específico
   */
  async getActiveByLevel(level: string): Promise<Grade[]> {
    try {
      const response = await api.get(`${GRADES_ENDPOINT}/level/${level}/active`);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener grados');
      }
      
      return Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error('No tienes permisos para ver grados');
      }
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error al cargar grados del nivel'
      );
    }
  },

  // ============================================
  // VALIDATION HELPERS
  // ============================================

  /**
   * Verificar si un grado tiene dependencias antes de eliminarlo
   */
  async hasDependencies(id: number): Promise<boolean> {
    try {
      const stats = await this.getStats(id);
      return stats.stats.sectionsCount > 0 || stats.stats.cyclesCount > 0;
    } catch (error) {
      return false;
    }
  },

  /**
   * Verificar si el nombre del grado ya existe
   */
  async nameExists(name: string, excludeId?: number): Promise<boolean> {
    try {
      const response = await this.getAll({ search: name, limit: 100 });
      return response.data.some(
        grade => grade.name.toLowerCase() === name.toLowerCase() && grade.id !== excludeId
      );
    } catch (error) {
      return false;
    }
  },
};

export default gradesService;
