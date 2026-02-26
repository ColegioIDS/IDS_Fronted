// src/services/dashboard.service.ts
import { api } from '@/config/api';
import {
  DashboardTeacherStats,
  TodayClassesResponse,
  AllClassesResponse,
  ScheduleGridResponse,
  ScheduleWeeklyResponse,
  AttendanceReportParams,
  AttendanceReportResponse,
  TeacherProfileResponse,
} from '@/types/dashboard.types';

export const dashboardService = {
  /**
   * Obtener estadísticas del dashboard (cards principales)
   * GET /api/dashboard/stats
   */
  async getStats(): Promise<DashboardTeacherStats> {
    try {
      const response = await api.get('/api/dashboard/stats');

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener estadísticas');
      }

      if (!response.data.data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error en dashboardService.getStats:', error);
      throw error;
    }
  },

  /**
   * Obtener las clases del día de hoy
   * GET /api/dashboard/today-classes
   */
  async getTodayClasses(): Promise<TodayClassesResponse> {
    try {
      const response = await api.get('/api/dashboard/today-classes');

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener clases de hoy');
      }

      if (!response.data.data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error en dashboardService.getTodayClasses:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las clases
   * GET /api/dashboard/all-classes
   */
  async getAllClasses(): Promise<AllClassesResponse> {
    try {
      const response = await api.get('/api/dashboard/all-classes');

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener todas las clases');
      }

      if (!response.data.data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error en dashboardService.getAllClasses:', error);
      throw error;
    }
  },

  /**
   * Obtener horarios en formato de tabla bidimensional
   * GET /api/dashboard/schedule-grid
   */
  async getScheduleGrid(): Promise<ScheduleGridResponse> {
    try {
      const response = await api.get('/api/dashboard/schedule-grid');

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener el horario en grid');
      }

      if (!response.data.data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error en dashboardService.getScheduleGrid:', error);
      throw error;
    }
  },

  /**
   * Obtener horarios en formato semanal legible
   * GET /api/dashboard/schedule-weekly
   */
  async getScheduleWeekly(): Promise<ScheduleWeeklyResponse> {
    try {
      const response = await api.get('/api/dashboard/schedule-weekly');

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener el horario semanal');
      }

      if (!response.data.data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error en dashboardService.getScheduleWeekly:', error);
      throw error;
    }
  },

  /**
   * Obtener reporte de asistencia
   * GET /api/dashboard/attendance/report
   */
  async getAttendanceReport(params: AttendanceReportParams): Promise<AttendanceReportResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.type) queryParams.append('type', params.type);
      if (params.attendanceType) queryParams.append('attendanceType', params.attendanceType);
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);
      if (params.enrollmentId) queryParams.append('enrollmentId', params.enrollmentId.toString());
      if (params.sectionId) queryParams.append('sectionId', params.sectionId.toString());
      if (params.courseId) queryParams.append('courseId', params.courseId.toString());
      if (params.groupBy) queryParams.append('groupBy', params.groupBy);
      if (params.includeRiskDetection) queryParams.append('includeRiskDetection', 'true');
      if (params.includeJustifications) queryParams.append('includeJustifications', 'true');

      const response = await api.get(`/api/dashboard/attendance/report?${queryParams.toString()}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener reporte de asistencia');
      }

      if (!response.data.data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error en dashboardService.getAttendanceReport:', error);
      throw error;
    }
  },

  /**
   * Obtener perfil del docente
   * GET /api/dashboard/teacher-profile
   */
  async getTeacherProfile(): Promise<TeacherProfileResponse> {
    try {
      const response = await api.get('/api/dashboard/teacher-profile');

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener perfil del docente');
      }

      if (!response.data.data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error en dashboardService.getTeacherProfile:', error);
      throw error;
    }
  },

  /**
   * Obtener estudiantes destacados
   * GET /dashboard/top-students
   */
  async getTopStudents(): Promise<any> {
    try {
      const response = await api.get('/api/dashboard/top-students');

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener estudiantes destacados');
      }

      if (!response.data.data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error en dashboardService.getTopStudents:', error);
      throw error;
    }
  },

  /**
   * Obtener tareas pendientes por calificar
   * GET /api/dashboard/pending-tasks
   */
  async getPendingTasks(): Promise<any> {
    try {
      const response = await api.get('/api/dashboard/pending-tasks');

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al obtener tareas pendientes');
      }

      if (!response.data.data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error en dashboardService.getPendingTasks:', error);
      throw error;
    }
  },

  /**
   * Obtener cumpleaños de estudiantes
   * GET /api/dashboard/student-birthdays
   */
  async getStudentBirthdays(): Promise<any> {
    try {
      console.log('dashboardService - getStudentBirthdays: iniciando petición a /api/dashboard/student-birthdays');
      const response = await api.get('/api/dashboard/student-birthdays');
      console.log('dashboardService - getStudentBirthdays: respuesta recibida:', response);

      if (!response.data.success) {
        console.error('dashboardService - getStudentBirthdays: success es false, mensaje:', response.data.message);
        throw new Error(response.data.message || 'Error al obtener cumpleaños');
      }

      if (!response.data.data) {
        console.error('dashboardService - getStudentBirthdays: no hay data en la respuesta');
        throw new Error('No se recibió respuesta del servidor');
      }

      console.log('dashboardService - getStudentBirthdays: retornando data:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error en dashboardService.getStudentBirthdays - Error completo:', error);
      console.error('Error en dashboardService.getStudentBirthdays - Lanzando error...');
      throw error;
    }
  },
};
