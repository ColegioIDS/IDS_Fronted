/**
 * ====================================================================
 * ATTENDANCE PLANT SERVICE - Llamadas HTTP a la API
 * ====================================================================
 * 
 * Maneja todas las comunicaciones con el backend para asistencia de planta
 * Usa Axios + validación Zod
 * Errores manejados de forma centralizada
 */

import { api } from '@/config/api';
import {
  AttendancePlantRecord,
  CreateAttendancePlantPayload,
  UpdateAttendancePlantPayload,
  AttendancePlantQueryParams,
  DailyAttendanceSummary,
  AttendancePlantReport,
  AttendancePlantJustification,
  CreateJustificationPayload,
  PaginatedResponse,
  ApiResponse,
  AttendancePlantCascadeData,
  SectionStudentsResponse,
  AllowedStatusesResponse,
  RecordDailyAttendancePayload,
  AttendanceRecordResponse,
  RecordDailyAttendanceBulkPayload,
  BulkAttendanceResponse,
  SectionAttendanceResponse,
  UpdateDailyAttendancePayload,
  AttendanceHistoryResponse,
} from '@/types/attendance-plant.types';

const BASE_URL = '/api/attendance-plant';

// ====================================================================
// DATOS EN CASCADA
// ====================================================================

/**
 * Obtener datos en cascada (ciclo escolar, bimestres, semanas, usuarios)
 * GET /api/attendance-plant/cascade
 */
export const getCascadeData = async (
  includeInactive: boolean = false
): Promise<AttendancePlantCascadeData> => {
  try {
    const response = await api.get<ApiResponse<AttendancePlantCascadeData>>(
      `${BASE_URL}/cascade`,
      {
        params: { includeInactive },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener datos en cascada');
    }

    return response.data.data!;
  } catch (error) {
    console.error('[getCascadeData] Error:', error);
    throw error;
  }
};

/**
 * Obtener estudiantes de una sección para una fecha específica
 * GET /api/attendance-plant/section-students
 */
export const getSectionStudents = async (params: {
  date: string; // YYYY-MM-DD
  cycleId: number;
  bimesterId: number;
  gradeId: number;
  sectionId: number;
}): Promise<SectionStudentsResponse> => {
  try {
    const response = await api.get<ApiResponse<SectionStudentsResponse>>(
      `${BASE_URL}/section-students`,
      { params }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener estudiantes');
    }

    return response.data.data!;
  } catch (error) {
    console.error('[getSectionStudents] Error:', error);
    throw error;
  }
};

/**
 * Obtener asistencia de una sección (estudiantes + estados de asistencia registrados)
 * GET /api/attendance-plant/section-attendance
 */
export const getSectionAttendance = async (params: {
  date: string; // YYYY-MM-DD
  cycleId: number;
  bimesterId: number;
  gradeId: number;
  sectionId: number;
}): Promise<SectionAttendanceResponse> => {
  try {
    const response = await api.get<ApiResponse<SectionAttendanceResponse>>(
      `${BASE_URL}/section-attendance`,
      { params }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener asistencia de sección');
    }

    return response.data.data!;
  } catch (error) {
    console.error('[getSectionAttendance] Error:', error);
    throw error;
  }
};

/**
 * Obtener estados de asistencia permitidos para el rol actual
 * GET /api/attendance-plant/allowed-statuses
 */
export const getAllowedStatuses = async (): Promise<AllowedStatusesResponse> => {
  try {
    const response = await api.get<ApiResponse<AllowedStatusesResponse>>(
      `${BASE_URL}/allowed-statuses`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener estados permitidos');
    }

    return response.data.data!;
  } catch (error) {
    console.error('[getAllowedStatuses] Error:', error);
    throw error;
  }
};

// ====================================================================
// CREAR/REGISTRAR ASISTENCIA
// ====================================================================

/**
 * Registrar asistencia diaria individual
 * POST /api/attendance-plant/record-daily
 */
export const recordDailyAttendance = async (
  payload: RecordDailyAttendancePayload
): Promise<AttendanceRecordResponse> => {
  try {
    const response = await api.post<ApiResponse<AttendanceRecordResponse>>(
      `${BASE_URL}/record-daily`,
      payload
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al registrar asistencia');
    }

    return response.data.data!;
  } catch (error) {
    console.error('[recordDailyAttendance] Error:', error);
    throw error;
  }
};

/**
 * Registrar asistencia diaria en bulk
 * POST /api/attendance-plant/record-daily-bulk
 */
export const recordDailyAttendanceBulk = async (
  payload: RecordDailyAttendanceBulkPayload
): Promise<BulkAttendanceResponse> => {
  try {
    const response = await api.post<ApiResponse<BulkAttendanceResponse>>(
      `${BASE_URL}/record-daily-bulk`,
      payload
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al registrar asistencia en bulk');
    }

    return response.data.data!;
  } catch (error) {
    console.error('[recordDailyAttendanceBulk] Error:', error);
    throw error;
  }
};

// ====================================================================
// CREAR/REGISTRAR ASISTENCIA (DEPRECATED)
// ====================================================================[

// ====================================================================
// LISTAR/OBTENER REGISTROS
// ====================================================================

/**
 * Obtener lista de registros de asistencia con paginación
 * GET /api/attendance-plant
 */
export const listAttendanceRecords = async (
  params?: AttendancePlantQueryParams
): Promise<PaginatedResponse<AttendancePlantRecord>> => {
  try {
    const response = await api.get<ApiResponse<PaginatedResponse<AttendancePlantRecord>>>(
      BASE_URL,
      { params }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al listar registros');
    }

    return response.data.data!;
  } catch (error) {
    console.error('[listAttendanceRecords] Error:', error);
    throw error;
  }
};

/**
 * Obtener un registro específico de asistencia
 * GET /api/attendance-plant/:id
 */
export const getAttendanceRecord = async (
  id: number
): Promise<AttendancePlantRecord> => {
  try {
    const response = await api.get<ApiResponse<AttendancePlantRecord>>(
      `${BASE_URL}/${id}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener registro');
    }

    return response.data.data!;
  } catch (error) {
    console.error('[getAttendanceRecord] Error:', error);
    throw error;
  }
};

// ====================================================================
// ACTUALIZAR REGISTROS
// ====================================================================

/**
 * Actualizar un registro de asistencia
 * PATCH /api/attendance-plant/:id
 */
export const updateAttendanceRecord = async (
  id: number,
  payload: UpdateAttendancePlantPayload
): Promise<AttendancePlantRecord> => {
  try {
    const response = await api.patch<ApiResponse<AttendancePlantRecord>>(
      `${BASE_URL}/${id}`,
      payload
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al actualizar registro');
    }

    return response.data.data!;
  } catch (error) {
    console.error('[updateAttendanceRecord] Error:', error);
    throw error;
  }
};

// ====================================================================
// ELIMINAR REGISTROS
// ====================================================================

/**
 * Eliminar un registro de asistencia
 * DELETE /api/attendance-plant/:id
 */
export const deleteAttendanceRecord = async (
  id: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete<ApiResponse<{ success: boolean }>>(
      `${BASE_URL}/${id}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al eliminar registro');
    }

    return { success: true, message: 'Registro eliminado correctamente' };
  } catch (error) {
    console.error('[deleteAttendanceRecord] Error:', error);
    throw error;
  }
};

// ====================================================================
// JUSTIFICACIONES
// ====================================================================

/**
 * Crear una justificación de ausencia
 * POST /api/attendance-plant/justification
 */
export const createJustification = async (
  payload: CreateJustificationPayload
): Promise<AttendancePlantJustification> => {
  try {
    const response = await api.post<ApiResponse<AttendancePlantJustification>>(
      `${BASE_URL}/justification`,
      payload
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al crear justificación');
    }

    return response.data.data!;
  } catch (error) {
    console.error('[createJustification] Error:', error);
    throw error;
  }
};

/**
 * Obtener justificaciones de un registro
 * GET /api/attendance-plant/:id/justifications
 */
export const getJustifications = async (
  attendanceId: number
): Promise<AttendancePlantJustification[]> => {
  try {
    const response = await api.get<ApiResponse<AttendancePlantJustification[]>>(
      `${BASE_URL}/${attendanceId}/justifications`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener justificaciones');
    }

    return response.data.data || [];
  } catch (error) {
    console.error('[getJustifications] Error:', error);
    throw error;
  }
};

// ====================================================================
// REPORTES
// ====================================================================

/**
 * Obtener resumen diario de asistencia
 * GET /api/attendance-plant/report/daily
 */
export const getDailyReport = async (
  date: string
): Promise<DailyAttendanceSummary> => {
  try {
    const response = await api.get<ApiResponse<DailyAttendanceSummary>>(
      `${BASE_URL}/report/daily`,
      { params: { date } }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener reporte diario');
    }

    return response.data.data!;
  } catch (error) {
    console.error('[getDailyReport] Error:', error);
    throw error;
  }
};

/**
 * Obtener reporte de asistencia de un usuario
 * GET /api/attendance-plant/report/user/:userId
 */
export const getUserReport = async (
  userId: number,
  startDate?: string,
  endDate?: string
): Promise<AttendancePlantReport> => {
  try {
    const response = await api.get<ApiResponse<AttendancePlantReport>>(
      `${BASE_URL}/report/user/${userId}`,
      { params: { startDate, endDate } }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener reporte de usuario');
    }

    return response.data.data!;
  } catch (error) {
    console.error('[getUserReport] Error:', error);
    throw error;
  }
};

// ====================================================================
// ESTADÍSTICAS
// ====================================================================

/**
 * Obtener estadísticas generales de asistencia
 * GET /api/attendance-plant/stats
 */
export const getAttendanceStats = async (
  params?: Partial<AttendancePlantQueryParams>
): Promise<any> => {
  try {
    const response = await api.get(`${BASE_URL}/stats`, { params });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener estadísticas');
    }

    return response.data.data;
  } catch (error) {
    console.error('[getAttendanceStats] Error:', error);
    throw error;
  }
};

// ====================================================================
// HISTORIAL DE ASISTENCIA
// ====================================================================

/**
 * Obtener historial de asistencia del estudiante por bimestre
 * GET /api/attendance-plant/history-bimester
 */
export const getAttendanceHistoryBimester = async (params: {
  gradeId: number;
  sectionId: number;
  bimesterId: number;
  cycleId: number;
}): Promise<AttendanceHistoryResponse> => {
  try {
    const response = await api.get<ApiResponse<AttendanceHistoryResponse>>(
      `${BASE_URL}/history-bimester`,
      { params }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener historial de asistencia');
    }

    return response.data.data!;
  } catch (error) {
    console.error('[getAttendanceHistoryBimester] Error:', error);
    throw error;
  }
};

// ====================================================================
// ACTUALIZAR ASISTENCIA
// ====================================================================

interface UpdateAttendancePayload {
  newAttendanceStatusId: number;
  notes?: string;
  arrivalTime?: string;
  departureTime?: string;
  minutesLate?: number;
  isEarlyExit?: boolean;
  modificationReason?: string;
}

/**
 * Actualizar registro de asistencia diaria
 * PATCH /api/attendance-plant/attendance/:dailyAttendanceId
 */
export const updateDailyAttendance = async (
  dailyAttendanceId: number,
  payload: UpdateAttendancePayload,
  document?: File | null
): Promise<any> => {
  try {
    // Preparar FormData si hay documento
    const formData = new FormData();
    formData.append('newAttendanceStatusId', payload.newAttendanceStatusId.toString());

    if (payload.notes) {
      formData.append('notes', payload.notes);
    }

    if (payload.arrivalTime) {
      formData.append('arrivalTime', payload.arrivalTime);
    }

    if (payload.departureTime) {
      formData.append('departureTime', payload.departureTime);
    }

    if (payload.minutesLate !== undefined) {
      formData.append('minutesLate', payload.minutesLate.toString());
    }

    if (payload.isEarlyExit !== undefined) {
      formData.append('isEarlyExit', payload.isEarlyExit.toString());
    }

    if (payload.modificationReason) {
      formData.append('modificationReason', payload.modificationReason);
    }

    if (document) {
      formData.append('document', document);
    }

    // Hacer la llamada PATCH
    const response = await api.patch<ApiResponse<any>>(
      `${BASE_URL}/attendance/${dailyAttendanceId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data.success) {
      // Crear un error que preserve la data del servidor
      const error: any = new Error(response.data.message || 'Error al actualizar la asistencia');
      error.response = { data: response.data };
      throw error;
    }

    return response.data.data;
  } catch (error: any) {
    console.error('[updateDailyAttendance] Error:', error);
    throw error;
  }
};

// ====================================================================
// OBTENER JUSTIFICACIÓN DE ASISTENCIA
// ====================================================================

/**
 * Obtener justificación de un registro de asistencia
 * GET /api/attendance-plant/attendance/:dailyAttendanceId/justification
 */
export const getAttendanceJustification = async (
  dailyAttendanceId: number
): Promise<any | null> => {
  try {
    const response = await api.get<ApiResponse<any>>(
      `${BASE_URL}/attendance/${dailyAttendanceId}/justification`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener la justificación');
    }

    // Si no hay datos, retorna null (sin justificación)
    return response.data.data || null;
  } catch (error) {
    console.error('[getAttendanceJustification] Error:', error);
    throw error;
  }
};
