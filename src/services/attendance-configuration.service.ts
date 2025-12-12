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

const BASE_URL = '/api/attendance-config';

export const attendanceConfigurationService = {
  /**
   * Obtener todos los grados del sistema
   * @returns Array de grados activos
   */
  async getGrades(query?: ConfigurationQuery): Promise<Grade[]> {
    try {
      // Use the attendance API endpoint that returns grades from active cycle
      const url = `/api/attendance/cycle/active/grades`;
      const response = await api.get<{ success: boolean; data: any[]; message?: string }>(url);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al cargar grados');
      }

      // Extract grade objects from the response
      // The API returns array of objects with {grade, ...} structure
      const gradesData = response.data.data || [];
      const grades = gradesData.map((item: any) => item.grade || item);

      return grades;
    } catch (error) {
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
      const url = `/api/attendance/grades/${gradeId}/sections`;
      const response = await api.get<{ success: boolean; data: Section[]; message?: string }>(url);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al cargar secciones');
      }

      return response.data.data || [];
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener estudiantes matriculados en una sección
   * @param sectionId ID de la sección
   * @returns Array de estudiantes con datos de matrícula (vacío si no hay)
   */
  async getStudentsBySection(sectionId: number): Promise<any[]> {
    try {
      const url = `/api/attendance/enrollment/section/${sectionId}/students`;

      const response = await api.get<{ success: boolean; data: any[]; message?: string }>(url);


      if (!response.data?.success) {
        // 404 es OK - significa que no hay estudiantes, no es un error
        if (response.status === 404) {
          return [];
        }
        throw new Error(response.data?.message || 'Error al cargar estudiantes');
      }

    

      return response.data.data || [];
    } catch (error: any) {
      // If it's a 404, it's not really an error - just no students
      if (error.response?.status === 404) {
        return [];
      }

      // Return empty array instead of throwing, so UI doesn't break
      return [];
    }
  },

  /**
   * Obtener todos los grados y secciones
   * @returns Objeto con grados y secciones agrupadas
   */
  async getGradesAndSections(query?: ConfigurationQuery): Promise<GradesAndSectionsResponse> {
    try {
      // Get grades from active cycle
      const gradesUrl = '/api/attendance/cycle/active/grades';
      const gradesResponse = await api.get<{ success: boolean; data: any[]; message?: string }>(gradesUrl);

      if (!gradesResponse.data?.success) {
        throw new Error(gradesResponse.data?.message || 'Error al cargar grados');
      }

      const gradesData = gradesResponse.data.data || [];
      const grades = gradesData.map((item: any) => item.grade || item);

      return {
        success: true,
        data: {
          grades,
          sections: [],
        },
      };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener todos los días festivos
   * @returns Array de días festivos
   */
  async getHolidays(query?: ConfigurationQuery): Promise<Holiday[]> {
    try {
      const url = '/api/attendance/holidays';
      const response = await api.get<{ success: boolean; data: Holiday[]; message?: string }>(url);


      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al cargar días festivos');
      }

      return response.data.data || [];
    } catch (error) {
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
      const url = `/api/attendance/holiday/by-date`;
      const response = await api.get<{ success: boolean; data: Holiday | null }>(url, {
        params: { date },
      });


      if (!response.data?.success) {
        return null;
      }

      return response.data.data || null;
    } catch (error) {
      return null;
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
      localStorage.removeItem('attendance_statuses_cache');
    } catch (error) {
    }
  },

  /**
   * Obtener estados de asistencia desde el backend
   * Endpoint: GET /api/attendance-config/statuses
   * @returns Array de estados de asistencia disponibles
   */
  async getAttendanceStatuses(): Promise<any[]> {
    try {
      const url = `${BASE_URL}/statuses`;
      const response = await api.get<{ success: boolean; data: any[]; message?: string }>(url);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al cargar estados de asistencia');
      }

      return response.data.data || [];
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cachear estados en localStorage
   */
  setCachedStatuses(statuses: any[], ttlMinutes: number = 60): void {
    try {
      const cache = {
        data: statuses,
        timestamp: Date.now(),
        ttl: ttlMinutes * 60 * 1000,
      };
      localStorage.setItem('attendance_statuses_cache', JSON.stringify(cache));
    } catch (error) {
    }
  },

  /**
   * Obtener estados en caché si existen y no han expirado
   */
  getCachedStatuses(): any[] | null {
    try {
      const cached = localStorage.getItem('attendance_statuses_cache');
      if (!cached) return null;
      
      const { data, timestamp, ttl } = JSON.parse(cached);
      if (Date.now() - timestamp > ttl) {
        localStorage.removeItem('attendance_statuses_cache');
        return null;
      }
      
      return data;
    } catch (error) {
      return null;
    }
  },
};
