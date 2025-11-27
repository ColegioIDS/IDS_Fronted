// src/services/holidays.service.ts

import { api } from '@/config/api';
import { isDateInRange, compareDateParts } from '@/utils/dateUtils';
import type {
  Holiday,
  CreateHolidayDto,
  UpdateHolidayDto,
  QueryHolidaysDto,
  PaginatedHolidaysResponse,
  DeleteHolidayResponse,
  CycleForHoliday,
  BimesterForHoliday,
  BreakWeek,
} from '@/types/holidays.types';

/**
 * 📅 Servicio para gestión de días festivos
 * 
 * Endpoints:
 * - CRUD completo de holidays
 * - Helpers para ciclos, bimestres y semanas BREAK
 */
export const holidaysService = {
  /**
   * Obtener todos los días festivos con filtros y paginación
   */
  async getAll(query: QueryHolidaysDto = {}): Promise<PaginatedHolidaysResponse> {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.cycleId) params.append('cycleId', query.cycleId.toString());
    if (query.bimesterId) params.append('bimesterId', query.bimesterId.toString());
    if (query.year) params.append('year', query.year.toString());
    if (query.month) params.append('month', query.month.toString());
    if (query.isRecovered !== undefined) params.append('isRecovered', query.isRecovered.toString());
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);

    const response = await api.get(`/api/holidays?${params.toString()}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener días festivos');
    }

    const data = Array.isArray(response.data.data) ? response.data.data : [];
    const meta = response.data.meta || {
      page: query.page || 1,
      limit: query.limit || 20,
      total: 0,
      totalPages: 0,
    };

    return { data, meta };
  },

  /**
   * Obtener un día festivo por ID
   */
  async getById(id: number): Promise<Holiday> {
    const response = await api.get(`/api/holidays/${id}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener el día festivo');
    }

    if (!response.data.data) {
      throw new Error('Día festivo no encontrado');
    }

    return response.data.data;
  },

  /**
   * Crear un nuevo día festivo
   */
  async create(data: CreateHolidayDto): Promise<Holiday> {
    const response = await api.post('/api/holidays', data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al crear el día festivo');
    }

    return response.data.data;
  },

  /**
   * Actualizar un día festivo existente
   */
  async update(id: number, data: UpdateHolidayDto): Promise<Holiday> {
    const response = await api.patch(`/api/holidays/${id}`, data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al actualizar el día festivo');
    }

    return response.data.data;
  },

  /**
   * Eliminar un día festivo
   */
  async delete(id: number): Promise<void> {
    const response = await api.delete(`/api/holidays/${id}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al eliminar el día festivo');
    }
  },

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Obtener ciclos escolares disponibles
   */
  async getAvailableCycles(): Promise<CycleForHoliday[]> {
    const response = await api.get('/api/holidays/helpers/cycles');

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener ciclos escolares');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener bimestres de un ciclo específico
   */
  async getBimestersByCycle(cycleId: number): Promise<BimesterForHoliday[]> {
    const response = await api.get(`/api/holidays/helpers/cycles/${cycleId}/bimesters`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener bimestres');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtener semanas de tipo BREAK de un ciclo
   * @param cycleId - ID del ciclo escolar
   * @param bimesterId - ID del bimestre (opcional, para filtrar)
   */
  async getBreakWeeks(cycleId: number, bimesterId?: number): Promise<BreakWeek[]> {
    const params = new URLSearchParams();
    if (bimesterId) {
      params.append('bimesterId', bimesterId.toString());
    }

    const url = `/api/holidays/helpers/cycles/${cycleId}/break-weeks${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get(url);

    if (!response.data?.success) {
      // Si no hay semanas BREAK, devolver array vacío en lugar de error
      return [];
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // ============================================
  // VALIDATION HELPERS (Frontend)
  // ============================================

  /**
   * Validar si una fecha está en un rango de bimestre
   * Usa comparación de strings YYYY-MM-DD para evitar problemas de timezone
   */
  isDateInBimesterRange(
    date: string,
    bimesterStart: string,
    bimesterEnd: string
  ): boolean {
    return isDateInRange(date, bimesterStart, bimesterEnd);
  },

  /**
   * Validar si una fecha cae en una semana BREAK
   * Usa comparación de strings YYYY-MM-DD para evitar problemas de timezone
   */
  isDateInBreakWeek(date: string, breakWeeks: BreakWeek[]): boolean {
    if (!Array.isArray(breakWeeks) || breakWeeks.length === 0) return false;
    
    return breakWeeks.some((week) =>
      isDateInRange(date, week.startDate, week.endDate)
    );
  },

  /**
   * Obtener el nombre del mes de una fecha ISO
   */
  getMonthName(date: string): string {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const datePart = date.split('T')[0]; // Extraer YYYY-MM-DD
    const [, monthStr] = datePart.split('-');
    const month = parseInt(monthStr, 10) - 1;
    return monthNames[month];
  },

  /**
   * Formatear fecha ISO para display
   */
  formatDate(date: string, format: 'full' | 'short' = 'full'): string {
    const datePart = date.split('T')[0]; // Extraer YYYY-MM-DD
    const [yearStr, monthStr, dayStr] = datePart.split('-');
    const day = parseInt(dayStr, 10);
    const month = format === 'full' 
      ? this.getMonthName(date)
      : this.getMonthName(date).substring(0, 3);
    const year = yearStr;

    return format === 'full' 
      ? `${day} de ${month}, ${year}`
      : `${day} ${month} ${year}`;
  },
};

export default holidaysService;
