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
  AttendanceSummary,
  StudentsAttendanceResponse,
  ExportParams,
  AttendanceHistoryResponse,
  AttendanceBimonthlyHistoryResponse,
  PeriodType,
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
      throw error;
    }
  }

  /**
   * Get attendance summary with optional filters
   */
  async getAttendanceSummary(
    gradeId: number,
    sectionId: number,
    bimesterId?: number | null,
    academicWeekId?: number | null
  ): Promise<AttendanceSummary> {
    try {
      const params = new URLSearchParams({
        gradeId: gradeId.toString(),
        sectionId: sectionId.toString(),
      });

      if (bimesterId !== null && bimesterId !== undefined) {
        params.append('bimesterId', bimesterId.toString());
      }

      if (academicWeekId !== null && academicWeekId !== undefined) {
        params.append('academicWeekId', academicWeekId.toString());
      }

      const url = `${BASE_URL}/sections/${sectionId}/attendance-summary?${params.toString()}`;
      console.log('📊 Fetching attendance summary:', { url, gradeId, sectionId, bimesterId, academicWeekId });

      const response = await api.get<ApiResponse<AttendanceSummary>>(url);

      console.log('📊 Attendance summary response:', response.data);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener resumen de asistencia');
      }

      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching attendance summary:', error);
      throw error;
    }
  }

  /**
   * Get students attendance with optional filters
   */
  async getStudentsAttendance(
    gradeId: number,
    sectionId: number,
    bimesterId?: number | null,
    academicWeekId?: number | null
  ): Promise<StudentsAttendanceResponse> {
    try {
      const params = new URLSearchParams({
        gradeId: gradeId.toString(),
        sectionId: sectionId.toString(),
      });

      if (bimesterId !== null && bimesterId !== undefined) {
        params.append('bimesterId', bimesterId.toString());
      }

      if (academicWeekId !== null && academicWeekId !== undefined) {
        params.append('academicWeekId', academicWeekId.toString());
      }

      const url = `${BASE_URL}/sections/${sectionId}/students-attendance?${params.toString()}`;
      console.log('👥 Fetching students attendance:', { url, gradeId, sectionId, bimesterId, academicWeekId });

      const response = await api.get<ApiResponse<StudentsAttendanceResponse>>(url);

      console.log('👥 Students attendance response:', response.data);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener asistencia de estudiantes');
      }

      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching students attendance:', error);
      throw error;
    }
  }

  /**
   * Get attendance history for a section (Day/Week/Bimonthly)
   */
  async getAttendanceHistory(
    gradeId: number,
    sectionId: number,
    periodType: PeriodType,
    date?: string, // YYYY-MM-DD for day view
    weekStart?: string, // YYYY-MM-DD for week view
    bimesterId?: number
  ): Promise<AttendanceHistoryResponse | AttendanceBimonthlyHistoryResponse> {
    try {
      const queryParams = new URLSearchParams({
        gradeId: gradeId.toString(),
        periodType: periodType,
      });

      if (periodType === 'day' && date) {
        queryParams.append('date', date);
      }

      if (periodType === 'week' && weekStart) {
        queryParams.append('weekStart', weekStart);
      }

      if (periodType === 'bimonthly' && bimesterId) {
        queryParams.append('bimesterId', bimesterId.toString());
      }

      const response = await api.get<ApiResponse<AttendanceHistoryResponse | AttendanceBimonthlyHistoryResponse>>(
        `${BASE_URL}/sections/${sectionId}/attendance-history?${queryParams.toString()}`
      );

      console.log('📊 Attendance history response:', response.data);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener historial de asistencia');
      }

      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching attendance history:', error);
      throw error;
    }
  }

  /**
   * Get academic weeks for the current cycle/bimester
   */
  async getAcademicWeeks() {
    try {
      const response = await api.get<ApiResponse<{
        schoolCycle: SchoolCycle;
        bimester: Bimester;
        weeks: AcademicWeek[];
      }>>(`${BASE_URL}/academic-weeks`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error al obtener semanas académicas');
      }

      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
}

export const attendanceReportsService = new AttendanceReportsService();
