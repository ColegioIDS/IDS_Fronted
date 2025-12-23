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
    courseId: number,
    bimesterId?: number | null,
    academicWeekId?: number | null
  ): Promise<AttendanceSummary> {
    try {
      const params = new URLSearchParams({
        gradeId: gradeId.toString(),
        courseId: courseId.toString(),
      });

      if (bimesterId !== null && bimesterId !== undefined) {
        params.append('bimesterId', bimesterId.toString());
      }

      if (academicWeekId !== null && academicWeekId !== undefined) {
        params.append('academicWeekId', academicWeekId.toString());
      }

      const url = `${BASE_URL}/sections/${sectionId}/attendance-summary?${params.toString()}`;
      console.log('📊 Fetching attendance summary:', { url, gradeId, sectionId, courseId, bimesterId, academicWeekId });

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
    courseId: number,
    bimesterId?: number | null,
    academicWeekId?: number | null
  ): Promise<StudentsAttendanceResponse> {
    try {
      const params = new URLSearchParams({
        gradeId: gradeId.toString(),
        courseId: courseId.toString(),
      });

      if (bimesterId !== null && bimesterId !== undefined) {
        params.append('bimesterId', bimesterId.toString());
      }

      if (academicWeekId !== null && academicWeekId !== undefined) {
        params.append('academicWeekId', academicWeekId.toString());
      }

      const url = `${BASE_URL}/sections/${sectionId}/students-attendance?${params.toString()}`;
      console.log('👥 Fetching students attendance:', { url, gradeId, sectionId, courseId, bimesterId, academicWeekId });

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
   * Export student attendance report (Excel, PDF, CSV)
   */
  async exportStudentReport(
    studentId: number,
    params: ExportParams
  ): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams({
        gradeId: params.gradeId.toString(),
        sectionId: params.sectionId.toString(),
        courseId: params.courseId.toString(),
        format: params.format || 'excel',
      });

      if (params.bimesterId !== null && params.bimesterId !== undefined) {
        queryParams.append('bimesterId', params.bimesterId.toString());
      }

      if (params.startDate) {
        queryParams.append('startDate', params.startDate);
      }

      if (params.endDate) {
        queryParams.append('endDate', params.endDate);
      }

      const response = await api.get<Blob>(
        `${BASE_URL}/export/student/${studentId}?${queryParams.toString()}`,
        {
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Export section attendance report (Excel, PDF, CSV)
   */
  async exportSectionReport(
    sectionId: number,
    params: Omit<ExportParams, 'sectionId'>
  ): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams({
        gradeId: params.gradeId.toString(),
        courseId: params.courseId.toString(),
        format: params.format || 'excel',
      });

      if (params.bimesterId !== null && params.bimesterId !== undefined) {
        queryParams.append('bimesterId', params.bimesterId.toString());
      }

      if (params.startDate) {
        queryParams.append('startDate', params.startDate);
      }

      if (params.endDate) {
        queryParams.append('endDate', params.endDate);
      }

      const response = await api.get<Blob>(
        `${BASE_URL}/export/section/${sectionId}?${queryParams.toString()}`,
        {
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const attendanceReportsService = new AttendanceReportsService();
