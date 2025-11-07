// src/services/attendance-configuration.service.ts
// ✅ SERVICIO ISOLATION - Solo attendance, sin usar otros módulos
import { api } from '@/config/api';
import {
  Grade,
  Section,
  Holiday,
  ConfigurationQuery,
  GradesAndSectionsResponse,
  HolidaysResponse,
  AttendanceConfigurationResponse,
} from '@/types/attendance.types';

/**
 * Servicio de configuración para el módulo de asistencia
 * - Carga grados, secciones, días festivos
 * - AISLADO: NO usa hooks/context/services de otros módulos
 */

const BASE_URL = '/api/attendance';

export const attendanceConfigurationService = {
  /**
   * Obtener todos los grados del sistema
   * @returns Array de grados activos
   */
  async getGrades(query?: ConfigurationQuery): Promise<Grade[]> {
    try {
      const params = new URLSearchParams();
      if (query?.includeInactive) params.append('includeInactive', 'true');
      
      const url = `${BASE_URL}/configuration/grades${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.get<{ success: boolean; data: Grade[]; message?: string }>(url);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al cargar grados');
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error loading grades:', error);
      throw error;
    }
  },

  /**
   * Obtener secciones por grado
   * @param gradeId ID del grado
   * @returns Array de secciones del grado
   */
  async getSectionsByGrade(gradeId: number): Promise<Section[]> {
    try {
      const url = `${BASE_URL}/configuration/grades/${gradeId}/sections`;
      const response = await api.get<{ success: boolean; data: Section[]; message?: string }>(url);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al cargar secciones');
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error(`Error loading sections for grade ${gradeId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener todos los grados y secciones
   * @returns Objeto con grados y secciones agrupadas
   */
  async getGradesAndSections(query?: ConfigurationQuery): Promise<GradesAndSectionsResponse> {
    try {
      const params = new URLSearchParams();
      if (query?.includeInactive) params.append('includeInactive', 'true');
      if (query?.schoolCycleId) params.append('schoolCycleId', query.schoolCycleId.toString());
      
      const url = `${BASE_URL}/configuration/grades-and-sections${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.get<GradesAndSectionsResponse>(url);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al cargar configuración');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error loading grades and sections:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los días festivos
   * @returns Array de días festivos
   */
  async getHolidays(query?: ConfigurationQuery): Promise<Holiday[]> {
    try {
      const params = new URLSearchParams();
      if (query?.schoolCycleId) params.append('schoolCycleId', query.schoolCycleId.toString());
      if (query?.includeInactive) params.append('includeInactive', 'true');
      
      const url = `${BASE_URL}/configuration/holidays${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.get<{ success: boolean; data: Holiday[]; message?: string }>(url);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al cargar días festivos');
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error loading holidays:', error);
      throw error;
    }
  },

  /**
   * Verificar si una fecha es día festivo
   * @param date Fecha ISO string
   * @returns Holiday object o null
   */
  async getHolidayByDate(date: string): Promise<Holiday | null> {
    try {
      const url = `${BASE_URL}/configuration/holidays/by-date`;
      const response = await api.get<{ success: boolean; data: Holiday | null }>(url, {
        params: { date },
      });
      
      if (!response.data?.success) {
        return null;
      }
      
      return response.data.data || null;
    } catch (error) {
      console.error(`Error checking holiday for date ${date}:`, error);
      return null;
    }
  },

  /**
   * Obtener próximos días festivos
   * @param fromDate Fecha inicial (ISO string)
   * @param daysAhead Cantidad de días a verificar
   * @returns Array de próximos días festivos
   */
  async getUpcomingHolidays(fromDate: string, daysAhead: number = 30): Promise<Holiday[]> {
    try {
      const url = `${BASE_URL}/configuration/holidays/upcoming`;
      const response = await api.get<{ success: boolean; data: Holiday[]; message?: string }>(url, {
        params: { fromDate, daysAhead },
      });
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al cargar próximos días festivos');
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error loading upcoming holidays:', error);
      throw error;
    }
  },

  /**
   * Obtener configuración completa del sistema
   * @returns Grados, secciones, días festivos y ciclos
   */
  async getCompleteConfiguration(query?: ConfigurationQuery): Promise<AttendanceConfigurationResponse> {
    try {
      const params = new URLSearchParams();
      if (query?.schoolCycleId) params.append('schoolCycleId', query.schoolCycleId.toString());
      if (query?.bimesterId) params.append('bimesterId', query.bimesterId.toString());
      if (query?.includeInactive) params.append('includeInactive', 'true');
      
      const url = `${BASE_URL}/configuration/complete${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.get<AttendanceConfigurationResponse>(url);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al cargar configuración completa');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error loading complete configuration:', error);
      throw error;
    }
  },

  /**
   * Cachear grados en localStorage para evitar llamadas repetidas
   */
  setCachedGrades(grades: Grade[], ttlMinutes: number = 60): void {
    try {
      const cache = {
        data: grades,
        timestamp: Date.now(),
        ttl: ttlMinutes * 60 * 1000,
      };
      localStorage.setItem('attendance_grades_cache', JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to cache grades:', error);
    }
  },

  /**
   * Obtener grados en caché si existen y no han expirado
   */
  getCachedGrades(): Grade[] | null {
    try {
      const cached = localStorage.getItem('attendance_grades_cache');
      if (!cached) return null;
      
      const { data, timestamp, ttl } = JSON.parse(cached);
      if (Date.now() - timestamp > ttl) {
        localStorage.removeItem('attendance_grades_cache');
        return null;
      }
      
      return data;
    } catch (error) {
      console.warn('Failed to retrieve cached grades:', error);
      return null;
    }
  },

  /**
   * Limpiar cache
   */
  clearCache(): void {
    try {
      localStorage.removeItem('attendance_grades_cache');
      localStorage.removeItem('attendance_sections_cache');
      localStorage.removeItem('attendance_holidays_cache');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  },
};
