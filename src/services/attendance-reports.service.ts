'use client';

import { api } from '@/config/api';
import {
  SchoolCycle,
  ApiResponse,
  Grade,
  Section,
  Bimester,
  AcademicWeek,
  Course,
} from '@/types/attendance-reports.types';

const BASE_URL = '/api/attendance-reports';

class AttendanceReportsService {
  /**
   * Get active school cycle
   */
  async getActiveCycle(): Promise<SchoolCycle> {
    try {
      const response = await api.get<ApiResponse<SchoolCycle>>(
        `${BASE_URL}/active-cycle`
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener ciclo activo');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error en getActiveCycle:', error);
      throw error;
    }
  }

  /**
   * Get grades by cycle
   */
  async getGradesByCycle(cycleId: number): Promise<Grade[]> {
    try {
      const response = await api.get<ApiResponse<Grade[]>>(
        `${BASE_URL}/cycles/${cycleId}/grades`
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener grados');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error en getGradesByCycle:', error);
      throw error;
    }
  }

  /**
   * Get sections by grade
   */
  async getSectionsByGrade(gradeId: number): Promise<Section[]> {
    try {
      const response = await api.get<ApiResponse<Section[]>>(
        `${BASE_URL}/grades/${gradeId}/sections`
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener secciones');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error en getSectionsByGrade:', error);
      throw error;
    }
  }

  /**
   * Get bimesters by cycle
   */
  async getBimestersByCycle(cycleId: number): Promise<Bimester[]> {
    try {
      const response = await api.get<ApiResponse<Bimester[]>>(
        `${BASE_URL}/cycles/${cycleId}/bimesters`
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener bimestres');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error en getBimestersByCycle:', error);
      throw error;
    }
  }

  /**
   * Get academic weeks by bimester
   */
  async getAcademicWeeksByBimester(bimesterId: number): Promise<AcademicWeek[]> {
    try {
      const response = await api.get<ApiResponse<AcademicWeek[]>>(
        `${BASE_URL}/bimesters/${bimesterId}/academic-weeks`
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener semanas académicas');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error en getAcademicWeeksByBimester:', error);
      throw error;
    }
  }

  /**
   * Get courses by section
   */
  async getCoursesBySection(sectionId: number): Promise<Course[]> {
    try {
      const response = await api.get<ApiResponse<Course[]>>(
        `${BASE_URL}/sections/${sectionId}/courses`
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener cursos');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error en getCoursesBySection:', error);
      throw error;
    }
  }
}

export const attendanceReportsService = new AttendanceReportsService();
