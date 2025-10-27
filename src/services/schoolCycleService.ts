/**
 * Servicio para Ciclos Escolares
 * Gestiona todas las peticiones HTTP relacionadas con ciclos escolares
 */

import { api } from '@/config/api';
import {
  SchoolCycle,
  SchoolCycleWithDetails,
  SchoolCycleStatsResponse,
  CreateSchoolCycleDto,
  UpdateSchoolCycleDto,
  QuerySchoolCyclesDto,
  SchoolCyclePaginatedResponse,
} from '@/types/SchoolCycle';

const ENDPOINT = '/api/school-cycles';

class SchoolCycleService {
  /**
   * GET /api/school-cycles
   * Obtiene un listado paginado de ciclos escolares
   */
  async getAll(query: QuerySchoolCyclesDto = {}): Promise<SchoolCyclePaginatedResponse> {
    try {
      const response = await api.get<SchoolCyclePaginatedResponse>(ENDPOINT, { params: query });
      return response.data;
    } catch (error) {
      console.error('Error fetching school cycles:', error);
      throw error;
    }
  }

  /**
   * GET /api/school-cycles/active
   * Obtiene el ciclo escolar activo actual
   */
  async getActiveCycle(): Promise<SchoolCycle> {
    try {
      const response = await api.get<SchoolCycle>(`${ENDPOINT}/active`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active school cycle:', error);
      throw error;
    }
  }

  /**
   * GET /api/school-cycles/:id
   * Obtiene un ciclo escolar específico con todos sus bimestres
   */
  async getById(id: number): Promise<SchoolCycleWithDetails> {
    try {
      const response = await api.get<SchoolCycleWithDetails>(`${ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching school cycle ${id}:`, error);
      throw error;
    }
  }

  /**
   * GET /api/school-cycles/:id/stats
   * Obtiene estadísticas detalladas de un ciclo escolar
   */
  async getStats(id: number): Promise<SchoolCycleStatsResponse> {
    try {
      const response = await api.get<SchoolCycleStatsResponse>(`${ENDPOINT}/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stats for school cycle ${id}:`, error);
      throw error;
    }
  }

  /**
   * POST /api/school-cycles
   * Crea un nuevo ciclo escolar
   */
  async create(data: CreateSchoolCycleDto): Promise<SchoolCycle> {
    try {
      const response = await api.post<SchoolCycle>(ENDPOINT, data);
      return response.data;
    } catch (error) {
      console.error('Error creating school cycle:', error);
      throw error;
    }
  }

  /**
   * PATCH /api/school-cycles/:id
   * Actualiza un ciclo escolar existente
   */
  async update(id: number, data: UpdateSchoolCycleDto): Promise<SchoolCycle> {
    try {
      const response = await api.patch<SchoolCycle>(`${ENDPOINT}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating school cycle ${id}:`, error);
      throw error;
    }
  }

  /**
   * PATCH /api/school-cycles/:id/activate
   * Activa un ciclo escolar y desactiva todos los demás
   */
  async activate(id: number): Promise<SchoolCycle> {
    try {
      const response = await api.patch<SchoolCycle>(`${ENDPOINT}/${id}/activate`);
      return response.data;
    } catch (error) {
      console.error(`Error activating school cycle ${id}:`, error);
      throw error;
    }
  }

  /**
   * PATCH /api/school-cycles/:id/close
   * Cierra un ciclo escolar
   */
  async close(id: number): Promise<SchoolCycle> {
    try {
      const response = await api.patch<SchoolCycle>(`${ENDPOINT}/${id}/close`);
      return response.data;
    } catch (error) {
      console.error(`Error closing school cycle ${id}:`, error);
      throw error;
    }
  }

  /**
   * DELETE /api/school-cycles/:id
   * Elimina un ciclo escolar
   */
  async delete(id: number): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`${ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting school cycle ${id}:`, error);
      throw error;
    }
  }
}

export const schoolCycleService = new SchoolCycleService();
export default schoolCycleService;
