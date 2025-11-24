/**
 * ====================================================================
 * ATTENDANCE REPORTS SERVICE
 * ====================================================================
 *
 * Service para consumir todos los endpoints de reportes de asistencia
 */

import { api } from '@/config/api';
import {
  AttendanceSummary,
  AttendanceByStatusResponse,
  AttendanceStatistics,
  StudentAttendanceReport,
  SectionAttendanceReport,
  GradeAttendanceReport,
  GradeSectionBreakdown,
  WeeklyAttendanceResponse,
  WeeklyDetailBySection,
  BimesterAttendanceReport,
  CycleAttendanceReport,
  ActiveCycleInfo,
  BimesterInfo,
  WeekInfo,
  ReportQueryParams,
} from '@/types/attendance-reports.types';

// ====================================================================
// TIPOS PARA SELECTORES EN CASCADA
// ====================================================================

export interface BimesterOption {
  id: number;
  number: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface GradeOption {
  id: number;
  name: string;
  level: string;
  totalSections: number;
  totalStudents: number;
}

export interface SectionOption {
  id: number;
  name: string;
  gradeId: number;
  gradeName: string;
  totalStudents: number;
}

export interface WeekOption {
  id: number;
  number: number;
  startDate: string;
  endDate: string;
  objectives?: string;
}

export interface BimesterOptionsResponse {
  bimesters: BimesterOption[];
  total: number;
  cycleName: string;
}

export interface GradeOptionsResponse {
  grades: GradeOption[];
  total: number;
  bimesterName: string;
}

export interface SectionOptionsResponse {
  sections: SectionOption[];
  total: number;
  gradeName: string;
  bimesterId: number;
}

export interface WeekOptionsResponse {
  weeks: WeekOption[];
  total: number;
  bimesterName: string;
}

// ====================================================================
// SERVICE
// ====================================================================

export const attendanceReportsService = {
  /**
   * ====================================================================
   * OPCIONES PARA SELECTORES EN CASCADA
   * ====================================================================
   */

  /**
   * Obtiene opciones de bimestres para un ciclo
   */
  async getBimesterOptions(cycleId: number): Promise<BimesterOptionsResponse> {
    const response = await api.get(`/api/attendance-reports/options/bimesters/${cycleId}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener bimestres');
    }

    return {
      bimesters: response.data.bimesters || [],
      total: response.data.total || 0,
      cycleName: response.data.cycleName || '',
    };
  },

  /**
   * Obtiene opciones de grados para un bimestre
   */
  async getGradeOptions(bimesterId: number): Promise<GradeOptionsResponse> {
    const response = await api.get(`/api/attendance-reports/options/grades/${bimesterId}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener grados');
    }

    return {
      grades: response.data.grades || [],
      total: response.data.total || 0,
      bimesterName: response.data.bimesterName || '',
    };
  },

  /**
   * Obtiene opciones de secciones para un grado en un bimestre
   */
  async getSectionOptions(gradeId: number, bimesterId: number): Promise<SectionOptionsResponse> {
    const response = await api.get(
      `/api/attendance-reports/options/sections/${gradeId}/${bimesterId}`
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener secciones');
    }

    return {
      sections: response.data.sections || [],
      total: response.data.total || 0,
      gradeName: response.data.gradeName || '',
      bimesterId: bimesterId,
    };
  },

  /**
   * Obtiene opciones de semanas para un bimestre
   */
  async getWeekOptions(bimesterId: number): Promise<WeekOptionsResponse> {
    const response = await api.get(`/api/attendance-reports/options/weeks/${bimesterId}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener semanas');
    }

    return {
      weeks: response.data.weeks || [],
      total: response.data.total || 0,
      bimesterName: response.data.bimesterName || '',
    };
  },

  /**
   * ====================================================================
   * DATOS DE REPORTES PRINCIPALES
   * ====================================================================
   */

  /**
   * Obtiene estadísticas generales de asistencia del sistema
   */
  async getSummary(params?: Partial<ReportQueryParams>): Promise<AttendanceSummary> {
    console.log('📊 [AttendanceService] getSummary called with params:', params);
    
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.bimesterId) queryParams.append('bimesterId', params.bimesterId.toString());
    if (params?.sectionId) queryParams.append('sectionId', params.sectionId.toString());
    if (params?.gradeId) queryParams.append('gradeId', params.gradeId.toString());

    console.log('📊 [AttendanceService] Making API call to: /api/attendance-reports/summary?', queryParams.toString());
    
    const response = await api.get(`/api/attendance-reports/summary?${queryParams}`);

    console.log('📊 [AttendanceService] API response received:', {
      status: response.status,
      dataStructure: {
        hasData: !!response.data,
        hasSuccess: !!response.data?.success,
        hasDataField: !!response.data?.data,
        keys: Object.keys(response.data || {}).slice(0, 5),
      },
      fullResponse: response.data,
    });

    if (!response.data?.success) {
      console.error('📊 [AttendanceService] API returned success=false:', response.data?.message);
      throw new Error(response.data?.message || 'Error al obtener el resumen');
    }

    // Intentar acceder primero a data.data, luego a data directamente
    const summaryData = response.data.data || response.data;
    console.log('📊 [AttendanceService] Returning summary data:', summaryData);
    
    return summaryData;
  },

  /**
   * Obtiene cantidad de registros para cada estado de asistencia
   */
  async getByStatus(params?: Partial<ReportQueryParams>): Promise<AttendanceByStatusResponse> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await api.get(`/api/attendance-reports/by-status?${queryParams}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener asistencia por estado');
    }

    return response.data.data;
  },

  /**
   * Obtiene estadísticas detalladas incluyendo promedios y tendencias
   */
  async getStatistics(params?: Partial<ReportQueryParams>): Promise<AttendanceStatistics> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.period) queryParams.append('period', params.period);
    if (params?.includeTrends) queryParams.append('includeTrends', 'true');

    const response = await api.get(`/api/attendance-reports/statistics?${queryParams}`);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener estadísticas');
    }

    return response.data.data;
  },

  /**
   * Obtiene asistencia agrupada por grado y sección
   */
  async getByGradeSection(
    params?: Partial<ReportQueryParams>
  ): Promise<GradeSectionBreakdown> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.cycleId) queryParams.append('cycleId', params.cycleId.toString());
    if (params?.bimesterId) queryParams.append('bimesterId', params.bimesterId.toString());

    const response = await api.get(
      `/api/attendance-reports/by-grade-section?${queryParams}`
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener desglose por grado/sección');
    }

    return response.data.data;
  },

  /**
   * Obtiene reporte de asistencia por sección
   */
  async getSectionReport(
    sectionId: number,
    params?: Partial<ReportQueryParams>
  ): Promise<SectionAttendanceReport> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.bimesterId) queryParams.append('bimesterId', params.bimesterId.toString());

    console.log('📍 [Service] getSectionReport called with sectionId:', sectionId, 'params:', params);
    const response = await api.get(
      `/api/attendance-reports/section/${sectionId}?${queryParams}`
    );

    console.log('📍 [Service] getSectionReport response:', response);
    console.log('📍 [Service] Response structure - success:', response.data?.success);
    console.log('📍 [Service] Response data.data:', response.data?.data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener reporte de sección');
    }

    const sectionData = response.data.data;
    console.log('📍 [Service] Returning section data with students count:', sectionData?.students?.length || 0);
    return sectionData;
  },

  /**
   * ====================================================================
   * INFORMACIÓN ACADÉMICA
   * ====================================================================
   */

  /**
   * Obtiene el ciclo escolar actualmente activo
   */
  async getActiveCycle(): Promise<ActiveCycleInfo> {
    const response = await api.get('/api/attendance-reports/active-cycle');

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener ciclo activo');
    }

    return response.data.data;
  },

  /**
   * Obtiene todos los bimestres del ciclo activo
   */
  async getActiveCycleBimesters(): Promise<BimesterInfo[]> {
    const response = await api.get('/api/attendance-reports/active-cycle/bimesters');

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener bimestres');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtiene todas las semanas de un bimestre específico
   */
  async getBimesterWeeks(bimesterId: number): Promise<WeekInfo[]> {
    const response = await api.get(
      `/api/attendance-reports/bimester/${bimesterId}/weeks`
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener semanas del bimestre');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  /**
   * Obtiene asistencia semanal (para gráfico de tendencia)
   */
  async getWeeklyAttendance(params?: Partial<ReportQueryParams>): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.cycleId) queryParams.append('cycleId', params.cycleId.toString());
    if (params?.bimesterId) queryParams.append('bimesterId', params.bimesterId.toString());

    console.log('📈 [Service] getWeeklyAttendance called with params:', params);

    const response = await api.get(`/api/attendance-reports/weekly?${queryParams}`);

    console.log('📈 [Service] getWeeklyAttendance response:', response.data);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener asistencia semanal');
    }

    return Array.isArray(response.data.data) ? response.data.data : [];
  },
};
