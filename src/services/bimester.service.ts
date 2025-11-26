// src/services/bimester.service.ts

import { api } from '@/config/api';
import {
  Bimester,
  BimesterWithRelations,
  SchoolCycleForBimester,
  CreateBimesterDto,
  UpdateBimesterDto,
  QueryBimestersDto,
  QueryAvailableCyclesDto,
  PaginatedBimestersResponse,
  PaginatedCyclesResponse,
} from '@/types/bimester.types';

/**
 * Service para Bimestres
 * Incluye métodos para acceder a ciclos escolares usando permisos de bimester
 */
export const bimesterService = {
  // ============================================
  // BIMESTER CRUD OPERATIONS
  // ============================================

  /**
   * Obtener todos los bimestres con paginación
   * @requires bimester:read
   */
  async getAll(query: QueryBimestersDto = {}): Promise<PaginatedBimestersResponse> {
     const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && key !== 'schoolCycleId') {
      params.append(key, value.toString());
    }
  });

  const cycleId = query.schoolCycleId;
  if (!cycleId) throw new Error('El parámetro schoolCycleId es obligatorio');


  const response = await api.get(`/api/school-cycles/${cycleId}/bimesters?${params.toString()}`);

    // ✅ VALIDACIÓN OBLIGATORIA
    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al obtener bimestres') as any;
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
   * Obtener un bimestre por ID
   * @requires bimester:read-one
   */
  async getById(id: number): Promise<BimesterWithRelations> {
    const response = await api.get(`/api/bimesters/${id}`);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al obtener el bimestre') as any;
      error.response = { data: response.data };
      throw error;
    }

    if (!response.data.data) {
      throw new Error('Bimestre no encontrado');
    }

    return response.data.data;
  },

  /**
   * Crear un nuevo bimestre en un ciclo específico
   * @requires bimester:create
   */
  async create(schoolCycleId: number, data: CreateBimesterDto): Promise<Bimester> {
    const response = await api.post(`/api/school-cycles/${schoolCycleId}/bimesters`, data);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al crear bimestre') as any;
      error.response = { data: response.data };
      throw error;
    }

    if (!response.data.data) {
      throw new Error('No se recibió el bimestre creado');
    }

    return response.data.data;
  },

  /**
   * Actualizar un bimestre existente
   * @requires bimester:update
   */
  async update(id: number, data: UpdateBimesterDto): Promise<Bimester> {
    const response = await api.patch(`/api/bimesters/${id}`, data);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al actualizar bimestre') as any;
      error.response = { data: response.data };
      throw error;
    }

    if (!response.data.data) {
      throw new Error('No se recibió el bimestre actualizado');
    }

    return response.data.data;
  },

  /**
   * Eliminar un bimestre
   * @requires bimester:delete
   */
  async delete(id: number): Promise<void> {
    const response = await api.delete(`/api/bimesters/${id}`);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al eliminar bimestre') as any;
      error.response = { data: response.data };
      throw error;
    }
  },

  // ============================================
  // SCHOOL CYCLES ENDPOINTS (para usuarios con permisos de bimester)
  // ============================================

  /**
   * 🆕 Obtener el ciclo escolar activo
   * Endpoint: GET /api/bimesters/cycles/active
   * @requires bimester:read
   * 
   * Caso de uso: Obtener el cycleId para crear/listar bimestres
   */
  async getActiveCycle(): Promise<SchoolCycleForBimester> {
    const response = await api.get('/api/bimesters/cycles/active');

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

  /**
   * 🆕 Obtener ciclos escolares disponibles (NO archivados)
   * Endpoint: GET /api/bimesters/cycles/available
   * @requires bimester:read
   * 
   * Caso de uso: Mostrar en dropdown/selector de ciclos para crear bimestres
   * Solo devuelve ciclos en los que PUEDES crear/editar bimestres
   */
  async getAvailableCycles(query: QueryAvailableCyclesDto = {}): Promise<PaginatedCyclesResponse> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/api/bimesters/cycles/available?${params.toString()}`);

    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error al obtener ciclos disponibles') as any;
      error.response = { data: response.data };
      throw error;
    }

    const data = Array.isArray(response.data.data) ? response.data.data : [];
    const meta = response.data.meta || {
      page: query.page || 1,
      limit: query.limit || 100,
      total: 0,
      totalPages: 0,
    };

    return { data, meta };
  },

  /**
   * 🆕 Obtener un ciclo escolar específico con sus bimestres
   * Endpoint: GET /api/bimesters/cycles/:id
   * @requires bimester:read
   * 
   * Caso de uso: Ver detalles completos del ciclo y sus bimestres
   */
  async getCycleById(id: number): Promise<SchoolCycleForBimester> {
    const response = await api.get(`/api/bimesters/cycles/${id}`);

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

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Validar que un bimestre esté dentro del rango de fechas del ciclo
   */
  validateBimesterDates(
    bimesterStart: string,
    bimesterEnd: string,
    cycleStart: string,
    cycleEnd: string
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const bStart = new Date(bimesterStart);
    const bEnd = new Date(bimesterEnd);
    const cStart = new Date(cycleStart);
    const cEnd = new Date(cycleEnd);

    if (bStart < cStart) {
      errors.push('La fecha de inicio del bimestre no puede ser anterior al inicio del ciclo');
    }

    if (bEnd > cEnd) {
      errors.push('La fecha de fin del bimestre no puede ser posterior al fin del ciclo');
    }

    if (bStart >= bEnd) {
      errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

export default bimesterService;
