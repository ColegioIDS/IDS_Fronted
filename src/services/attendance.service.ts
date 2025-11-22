/**
 * ====================================================================
 * ATTENDANCE SERVICE - Llamadas HTTP a la API
 * ====================================================================
 *
 * Maneja todas las comunicaciones con el backend
 * Usa Axios + validación Zod
 * Errores manejados de forma centralizada
 */

import { api } from '@/config/api';
import {
  AttendanceRecord,
  DailyAttendanceSummary,
  AttendanceReport,
  CreateSingleAttendancePayload,
  DailyRegistrationPayload,
  UpdateAttendancePayload,
  BulkUpdateAttendancePayload,
  CreateJustificationPayload,
  UpdateJustificationPayload,
  AttendanceQueryParams,
  AttendanceStatus,
  Justification,
  ApiResponse,
  PaginatedResponse,
} from '@/types/attendance.types';
import {
  validateCreateSingleAttendance,
  validateDailyRegistration,
  validateUpdateAttendance,
  validateBulkUpdateAttendance,
  validateCreateJustification,
  validateUpdateJustification,
} from '@/schemas/attendance.schema';

const BASE_URL = '/api/attendance';

// ====================================================================
// CREAR/REGISTRAR ASISTENCIA
// ====================================================================

/**
 * Registrar asistencia individual
 * POST /api/attendance/single
 */
export const createSingleAttendance = async (
  payload: CreateSingleAttendancePayload
): Promise<AttendanceRecord> => {
  // Validar antes de enviar
  const validation = validateCreateSingleAttendance(payload);
  if (!validation.success) {
    throw new Error(`Validación fallida: ${validation.error.message}`);
  }

  const response = await api.post<ApiResponse<AttendanceRecord>>(
    `${BASE_URL}/single`,
    validation.data
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al registrar asistencia');
  }

  return response.data.data!;
};

/**
 * Registro diario masivo (TAB 1)
 * POST /api/attendance/daily-registration
 */
export const registerDailyAttendance = async (
  payload: DailyRegistrationPayload
): Promise<DailyAttendanceSummary> => {
  // Validar antes de enviar
  const validation = validateDailyRegistration(payload);
  if (!validation.success) {
    throw new Error(`Validación fallida: ${validation.error.message}`);
  }

  const response = await api.post<ApiResponse<DailyAttendanceSummary>>(
    `${BASE_URL}/daily-registration`,
    validation.data
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error en registro diario');
  }

  return response.data.data!;
};

// ====================================================================
// ACTUALIZAR ASISTENCIA
// ====================================================================

/**
 * Actualizar asistencia individual (TAB 2)
 * PATCH /api/attendance/class/:id
 */
export const updateAttendance = async (
  classAttendanceId: number,
  payload: UpdateAttendancePayload
): Promise<AttendanceRecord> => {
  // Validar antes de enviar
  const validation = validateUpdateAttendance(payload);
  if (!validation.success) {
    throw new Error(`Validación fallida: ${validation.error.message}`);
  }

  const response = await api.patch<ApiResponse<AttendanceRecord>>(
    `${BASE_URL}/class/${classAttendanceId}`,
    validation.data
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al actualizar asistencia');
  }

  return response.data.data!;
};

/**
 * Actualización masiva de asistencia
 * PATCH /api/attendance/bulk/update
 */
export const bulkUpdateAttendance = async (
  payload: BulkUpdateAttendancePayload
): Promise<{ successful: number; failed: number; total: number }> => {
  // Validar antes de enviar
  const validation = validateBulkUpdateAttendance(payload);
  if (!validation.success) {
    throw new Error(`Validación fallida: ${validation.error.message}`);
  }

  const response = await api.patch<ApiResponse<any>>(
    `${BASE_URL}/bulk/update`,
    validation.data
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error en actualización masiva');
  }

  return response.data.data || { successful: 0, failed: 0, total: 0 };
};

// ====================================================================
// OBTENER ASISTENCIA
// ====================================================================

/**
 * Obtener historial de asistencia de un estudiante
 * GET /api/attendance/enrollment/:enrollmentId
 */
export const getAttendanceHistory = async (
  enrollmentId: number,
  params?: AttendanceQueryParams
): Promise<PaginatedResponse<AttendanceRecord>> => {
  const response = await api.get<PaginatedResponse<AttendanceRecord>>(
    `${BASE_URL}/enrollment/${enrollmentId}`,
    { params }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener historial');
  }

  return response.data;
};

/**
 * Obtener reporte de asistencia de un estudiante (TAB 3)
 * GET /api/attendance/report/:enrollmentId
 */
export const getAttendanceReport = async (
  enrollmentId: number,
  params?: Partial<AttendanceQueryParams>
): Promise<AttendanceReport> => {
  const response = await api.get<ApiResponse<AttendanceReport>>(
    `${BASE_URL}/report/${enrollmentId}`,
    { params }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener reporte');
  }

  return response.data.data!;
};

/**
 * Obtener asistencia de una sección por fecha
 * GET /api/attendance/section/:sectionId/date/:date
 */
export const getSectionAttendanceByDate = async (
  sectionId: number,
  date: string
): Promise<AttendanceRecord[]> => {
  const response = await api.get<ApiResponse<AttendanceRecord[]>>(
    `${BASE_URL}/section/${sectionId}/date/${date}`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.message || 'Error al obtener asistencia de sección'
    );
  }

  return response.data.data || [];
};

/**
 * Obtener estadísticas de asistencia de una sección
 * GET /api/attendance/section/:sectionId/stats
 */
export const getSectionAttendanceStats = async (
  sectionId: number,
  params?: Partial<AttendanceQueryParams>
): Promise<any> => {
  const response = await api.get<ApiResponse<any>>(
    `${BASE_URL}/section/${sectionId}/stats`,
    { params }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener estadísticas');
  }

  return response.data.data;
};

// ====================================================================
// JUSTIFICACIONES
// ====================================================================

/**
 * Crear justificación de ausencia
 * POST /api/attendance/justifications
 */
export const createJustification = async (
  payload: CreateJustificationPayload
): Promise<Justification> => {
  // Validar antes de enviar
  const validation = validateCreateJustification(payload);
  if (!validation.success) {
    throw new Error(`Validación fallida: ${validation.error.message}`);
  }

  const response = await api.post<ApiResponse<Justification>>(
    `${BASE_URL}/justifications`,
    validation.data
  );

  if (!response.data.success) {
    throw new Error(
      response.data.message || 'Error al crear justificación'
    );
  }

  return response.data.data!;
};

/**
 * Actualizar justificación
 * PATCH /api/attendance/justifications/:id
 */
export const updateJustification = async (
  justificationId: number,
  payload: UpdateJustificationPayload
): Promise<Justification> => {
  // Validar antes de enviar
  const validation = validateUpdateJustification(payload);
  if (!validation.success) {
    throw new Error(`Validación fallida: ${validation.error.message}`);
  }

  const response = await api.patch<ApiResponse<Justification>>(
    `${BASE_URL}/justifications/${justificationId}`,
    validation.data
  );

  if (!response.data.success) {
    throw new Error(
      response.data.message || 'Error al actualizar justificación'
    );
  }

  return response.data.data!;
};

/**
 * Obtener justificaciones de un estudiante
 * GET /api/attendance/justifications/enrollment/:enrollmentId
 */
export const getJustifications = async (
  enrollmentId: number,
  params?: Partial<AttendanceQueryParams>
): Promise<PaginatedResponse<Justification>> => {
  const response = await api.get<PaginatedResponse<Justification>>(
    `${BASE_URL}/justifications/enrollment/${enrollmentId}`,
    { params }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener justificaciones');
  }

  return response.data;
};

// ====================================================================
// CONFIGURACIÓN Y VALIDACIONES
// ====================================================================

/**
 * Obtener ciclo escolar activo
 * GET /api/attendance/cycle/active
 */
export const getActiveCycle = async (): Promise<any> => {
  const response = await api.get<ApiResponse<any>>(
    `${BASE_URL}/cycle/active`
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener ciclo activo');
  }

  return response.data.data;
};

/**
 * Obtener grados del ciclo activo
 * GET /api/attendance/cycle/active/grades
 */
export const getGradesFromActiveCycle = async (): Promise<any[]> => {
  const response = await api.get<ApiResponse<any[]>>(
    `${BASE_URL}/cycle/active/grades`
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener grados');
  }

  return response.data.data || [];
};

/**
 * Obtener secciones de un grado
 * GET /api/attendance/grades/:gradeId/sections
 */
export const getSectionsByGrade = async (gradeId: number): Promise<any[]> => {
  const response = await api.get<ApiResponse<any[]>>(
    `${BASE_URL}/grades/${gradeId}/sections`
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener secciones');
  }

  return response.data.data || [];
};

/**
 * Obtener estados de asistencia permitidos para un rol
 * GET /api/attendance/status/allowed/role/:roleId
 */
export const getAllowedAttendanceStatusesByRole = async (
  roleId: number
): Promise<AttendanceStatus[]> => {
  const response = await api.get<ApiResponse<AttendanceStatus[]>>(
    `${BASE_URL}/status/allowed/role/${roleId}`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.message || 'Error al obtener estados permitidos'
    );
  }

  return response.data.data || [];
};

/**
 * Validar si una fecha es feriado
 * GET /api/attendance/holiday/by-date
 */
export const validateHolidayByDate = async (
  bimesterId: number,
  date: string
): Promise<any> => {
  const response = await api.get<ApiResponse<any>>(
    `${BASE_URL}/holiday/by-date`,
    { params: { bimesterId, date } }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al validar feriado');
  }

  return response.data.data;
};

/**
 * Obtener configuración activa de asistencia
 * GET /api/attendance/config/active
 */
export const getAttendanceConfig = async (): Promise<any> => {
  const response = await api.get<ApiResponse<any>>(
    `${BASE_URL}/config/active`
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener configuración');
  }

  return response.data.data;
};

// ====================================================================
// UTILIDADES
// ====================================================================

/**
 * Formatea errores de la API para mostrar al usuario
 */
export const formatAttendanceError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Error desconocido al procesar asistencia';
};

/**
 * Verifica si es un error de validación
 */
export const isValidationError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.includes('Validación fallida');
  }
  return false;
};

// ====================================================================
// AGRUPAR MÉTODOS POR FUNCIONALIDAD
// ====================================================================

/**
 * Operaciones de creación/registro
 */
export const attendanceCreation = {
  createSingleAttendance,
  registerDailyAttendance,
  createJustification,
};

/**
 * Operaciones de actualización
 */
export const attendanceUpdates = {
  updateAttendance,
  bulkUpdateAttendance,
  updateJustification,
};

/**
 * Operaciones de lectura
 */
export const attendanceQueries = {
  getAttendanceHistory,
  getAttendanceReport,
  getSectionAttendanceByDate,
  getSectionAttendanceStats,
  getJustifications,
};

/**
 * Configuración y validaciones
 */
export const attendanceConfig = {
  getActiveCycle,
  getGradesFromActiveCycle,
  getSectionsByGrade,
  getAllowedAttendanceStatusesByRole,
  validateHolidayByDate,
  getAttendanceConfig,
};

/**
 * Utilidades
 */
export const attendanceUtils = {
  formatAttendanceError,
  isValidationError,
};

// ====================================================================
// EXPORT DEFECTO - Objeto con todos los métodos
// ====================================================================

export default {
  // Creación
  createSingleAttendance,
  registerDailyAttendance,
  createJustification,

  // Actualización
  updateAttendance,
  bulkUpdateAttendance,
  updateJustification,

  // Lectura
  getAttendanceHistory,
  getAttendanceReport,
  getSectionAttendanceByDate,
  getSectionAttendanceStats,
  getJustifications,

  // Configuración
  getActiveCycle,
  getGradesFromActiveCycle,
  getSectionsByGrade,
  getAllowedAttendanceStatusesByRole,
  validateHolidayByDate,
  getAttendanceConfig,

  // Utilidades
  formatAttendanceError,
  isValidationError,

  // Agrupados
  creation: attendanceCreation,
  updates: attendanceUpdates,
  queries: attendanceQueries,
  config: attendanceConfig,
  utils: attendanceUtils,
};