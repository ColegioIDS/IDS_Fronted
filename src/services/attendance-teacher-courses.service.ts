// src/services/attendance-teacher-courses.service.ts
/**
 * Servicio para nuevos endpoints de asistencia por cursos del maestro
 * Endpoints 1 & 2 de la documentación
 */

import { api } from '@/config/api';
import {
  GetTeacherCoursesResponse,
  TeacherCourse,
  BulkTeacherAttendanceByCourseRequest,
  BulkTeacherAttendanceByCourseResponse,
} from '@/types/attendance.types';

export const attendanceTeacherCoursesService = {
  /**
   * Endpoint 1: Obtener cursos del maestro para una fecha específica
   * GET /api/attendance/teacher/courses/:date
   * 
   * @param date - Fecha en formato YYYY-MM-DD
   * @returns Array de cursos disponibles del maestro en esa fecha
   * 
   * @example
   * const courses = await attendanceTeacherCoursesService.getTeacherCoursesByDate('2025-11-20');
   * console.log(courses.courses); // Array de TeacherCourse
   */
  async getTeacherCoursesByDate(date: string): Promise<GetTeacherCoursesResponse> {
    try {
      const response = await api.get(`/api/attendance/teacher/courses/${date}`);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Error al obtener cursos del maestro'
        );
      }

      return response.data;
    } catch (error: any) {
      console.error('Error fetching teacher courses:', error);
      throw new Error(
        error.response?.data?.message || 'Error al obtener cursos del maestro'
      );
    }
  },

  /**
   * Endpoint 2: Registrar asistencia para cursos específicos seleccionados
   * POST /api/attendance/teacher/by-courses
   * 
   * @param payload - Datos del registro (date, cursos, estado, etc)
   * @returns Resumen de registros creados
   * 
   * @example
   * const result = await attendanceTeacherCoursesService.registerAttendanceByCourses({
   *   date: '2025-11-20',
   *   courseAssignmentIds: [5, 6],
   *   attendanceStatusId: 1,
   *   notes: 'Asistencia de la mañana'
   * });
   */
  async registerAttendanceByCourses(
    payload: BulkTeacherAttendanceByCourseRequest
  ): Promise<BulkTeacherAttendanceByCourseResponse> {
    try {
      // Validar payload básico
      if (!payload.date || !payload.courseAssignmentIds?.length || !payload.attendanceStatusId) {
        throw new Error('Faltan datos requeridos: date, courseAssignmentIds, attendanceStatusId');
      }

      if (payload.courseAssignmentIds.length > 10) {
        throw new Error('No puedes seleccionar más de 10 cursos a la vez');
      }

      const response = await api.post('/api/attendance/teacher/by-courses', payload);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Error al registrar asistencia'
        );
      }

      return response.data;
    } catch (error: any) {
      console.error('Error registering attendance by courses:', error);
      throw new Error(
        error.response?.data?.message || 'Error al registrar asistencia'
      );
    }
  },

  /**
   * Utilidad: Formatear fecha para API
   * @param date - Date object o string
   * @returns string en formato YYYY-MM-DD
   */
  formatDateForAPI(date: Date | string): string {
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  },

  /**
   * Utilidad: Formatear hora en HH:MM
   * @param time - string en formato HH:MM o Date
   * @returns string en formato HH:MM
   */
  formatTimeForAPI(time: string | Date): string {
    if (typeof time === 'string') return time;
    return time.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
  },

  /**
   * Utilidad: Convertir dayOfWeek (0-6) a nombre del día
   */
  getDayName(dayOfWeek: number): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayOfWeek] || 'Desconocido';
  },
};
