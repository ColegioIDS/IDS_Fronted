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

  const response = await api.patch<ApiResponse<{ successful: number; failed: number; total: number }>>(
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
): Promise<Record<string, unknown>> => {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(
    `${BASE_URL}/section/${sectionId}/stats`,
    { params }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener estadísticas');
  }

  return response.data.data || {};
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
export const getActiveCycle = async (): Promise<Record<string, unknown>> => {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(
    `${BASE_URL}/cycle/active`
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener ciclo activo');
  }

  return response.data.data || {};
};

/**
 * Obtener grados del ciclo activo
 * GET /api/attendance/cycle/active/grades
 */
export const getGradesFromActiveCycle = async (): Promise<Record<string, unknown>[]> => {
  const response = await api.get<ApiResponse<Record<string, unknown>[]>>(
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
export const getSectionsByGrade = async (gradeId: number): Promise<Record<string, unknown>[]> => {
  const response = await api.get<ApiResponse<Record<string, unknown>[]>>(
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
): Promise<Record<string, unknown>> => {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(
    `${BASE_URL}/holiday/by-date`,
    { params: { bimesterId, date } }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al validar feriado');
  }

  return response.data.data || {};
};

/**
 * Obtener configuración activa de asistencia
 * GET /api/attendance/config/active
 */
export const getActiveAttendanceConfig = async (): Promise<Record<string, unknown>> => {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(
    `${BASE_URL}/config/active`
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener configuración');
  }

  return response.data.data || {};
};

/**
 * Validar bimestre por fecha
 * GET /api/attendance/bimester/by-date
 */
export const validateBimesterByDate = async (
  cycleId: number,
  date: string
): Promise<Record<string, unknown>> => {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(
    `${BASE_URL}/bimester/by-date`,
    { params: { cycleId, date } }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al validar bimestre');
  }

  return response.data.data || {};
};

/**
 * Validar semana académica por fecha
 * GET /api/attendance/week/by-date
 */
export const validateAcademicWeekByDate = async (
  bimesterId: number,
  date: string
): Promise<Record<string, unknown>> => {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(
    `${BASE_URL}/week/by-date`,
    { params: { bimesterId, date } }
  );

  if (!response.data.success) {
    // Si es error BREAK_WEEK, retorna la semana del error
    const responseData = response.data as unknown as Record<string, unknown>;
    if ('week' in responseData && responseData.week) {
      return responseData.week as Record<string, unknown>;
    }
    throw new Error(response.data.message || 'Error al validar semana académica');
  }

  return response.data.data || {};
};

/**
 * Validar horarios de maestro para un día
 * GET /api/attendance/schedules/teacher/:teacherId/day/:dayOfWeek
 */
export const validateTeacherSchedules = async (
  teacherId: number,
  dayOfWeek: number,
  sectionId: number
): Promise<Record<string, unknown>[]> => {
  const response = await api.get<ApiResponse<Record<string, unknown>[]>>(
    `${BASE_URL}/schedules/teacher/${teacherId}/day/${dayOfWeek}`,
    { params: { sectionId } }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al validar horarios');
  }

  return response.data.data || [];
};

/**
 * Validar horarios de sección por día
 * GET /api/attendance/schedules/section/:sectionId/day/:dayOfWeek
 */
export const validateSectionSchedulesByDay = async (
  sectionId: number,
  dayOfWeek: number
): Promise<Record<string, unknown>[]> => {
  const response = await api.get<ApiResponse<Record<string, unknown>[]>>(
    `${BASE_URL}/schedules/section/${sectionId}/day/${dayOfWeek}`
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al validar horarios de la sección');
  }

  return response.data.data || [];
};

/**
 * Validar ausencia de maestro por fecha
 * GET /api/attendance/teacher-absence/:teacherId
 */
export const validateTeacherAbsenceByDate = async (
  teacherId: number,
  date: string
): Promise<Record<string, unknown>> => {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(
    `${BASE_URL}/teacher-absence/${teacherId}`,
    { params: { date } }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al validar ausencia');
  }

  return response.data.data || {};
};

/**
 * Obtener lista de feriados
 * GET /api/attendance/holidays
 */
export const getHolidays = async (bimesterId?: number): Promise<Record<string, unknown>[]> => {
  const params = bimesterId ? { bimesterId } : {};
  const response = await api.get<ApiResponse<Record<string, unknown>[]>>(
    `${BASE_URL}/holidays`,
    { params }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener feriados');
  }

  return response.data.data || [];
};

/**
 * Obtener bimestre activo actual
 * GET /api/attendance/bimester/active
 */
export const getActiveBimester = async (): Promise<Record<string, unknown>> => {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(
    `${BASE_URL}/bimester/active`
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener bimestre activo');
  }

  return response.data.data || {};
};

/**
 * Obtener estudiantes matriculados en una sección
 * GET /api/attendance/enrollment/section/:sectionId/students
 */
export const getEnrollmentsBySection = async (
  sectionId: number,
  includeInactive: boolean = false
): Promise<Record<string, unknown>[]> => {
  const response = await api.get<ApiResponse<Record<string, unknown>[]>>(
    `${BASE_URL}/enrollment/section/${sectionId}/students`,
    { params: { includeInactive } }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener matrículas');
  }

  return response.data.data || [];
};

/**
 * Obtener estudiantes activos de una sección en un ciclo
 * GET /api/attendance/enrollment/section/:sectionId/cycle/:cycleId/active
 */
export const getActiveEnrollmentsBySectionAndCycle = async (
  sectionId: number,
  cycleId: number,
  date?: string
): Promise<Record<string, unknown>[]> => {
  const params = date ? { date } : {};
  const response = await api.get<ApiResponse<Record<string, unknown>[]>>(
    `${BASE_URL}/enrollment/section/${sectionId}/cycle/${cycleId}/active`,
    { params }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener matrículas activas');
  }

  return response.data.data || [];
};

/**
 * Obtener cursos del maestro para una fecha
 * GET /api/attendance/teacher/courses/:date
 */
export const getTeacherCoursesByDate = async (
  date: string,
  userId: number
): Promise<Record<string, unknown>> => {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(
    `${BASE_URL}/teacher/courses/${date}`,
    { params: { userId } }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener cursos del maestro');
  }

  return response.data.data || {};
};

/**
 * Obtener cursos del maestro para HOY
 * GET /api/attendance/teacher/today-courses
 */
export const getTodayCoursesForTeacher = async (userId: number): Promise<Record<string, unknown>> => {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(
    `${BASE_URL}/teacher/today-courses`,
    { params: { userId } }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener cursos de hoy');
  }

  return response.data.data || {};
};

/**
 * Validar completitud de asistencia de un curso
 * GET /api/attendance/course/:courseAssignmentId/validate/:date
 */
export const validateAttendanceCompleteness = async (
  courseAssignmentId: number,
  date: string
): Promise<Record<string, unknown>> => {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(
    `${BASE_URL}/course/${courseAssignmentId}/validate/${date}`
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al validar completitud');
  }

  return response.data.data || {};
};

/**
 * Obtener estado de registro diario para una sección y fecha
 * GET /api/attendance/daily-registration/:sectionId/:date
 */
export const getDailyRegistrationStatus = async (
  sectionId: number,
  date: string
): Promise<Record<string, unknown>> => {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(
    `${BASE_URL}/daily-registration/${sectionId}/${date}`
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener estado de registro');
  }

  return response.data.data || {};
};

/**
 * Obtener asistencia de un curso en una fecha específica
 * GET /api/attendance/course/:courseAssignmentId/date/:date
 */
export const getAttendanceByCourseDateAndTeacher = async (
  courseAssignmentId: number,
  date: string,
  userId: number
): Promise<Record<string, unknown>> => {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(
    `${BASE_URL}/course/${courseAssignmentId}/date/${date}`,
    { params: { userId } }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener asistencia del curso');
  }

  return response.data.data || {};
};

/**
 * Obtener asistencia de una sección en una fecha (versión mejorada)
 * GET /api/attendance/section/:sectionId/cycle/:cycleId/date/:date
 */
export const getSectionAttendanceByDateAndCycle = async (
  sectionId: number,
  cycleId: number,
  date: string,
  limit?: number,
  offset?: number
): Promise<Record<string, unknown>> => {
  const params = { limit, offset };
  const response = await api.get<ApiResponse<Record<string, unknown>>>(
    `${BASE_URL}/section/${sectionId}/cycle/${cycleId}/date/${date}`,
    { params }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Error al obtener asistencia de sección');
  }

  return response.data.data || {};
};

/**
 * Obtener vista consolidada de asistencia por sección y fecha
 * Agrupa asistencias por estudiante y curso con detalles de modificaciones
 * GET /api/attendance/section/:sectionId/date/:date/consolidated-view
 */
export const getSectionAttendanceConsolidatedView = async (
  sectionId: number,
  date: string
): Promise<Record<string, unknown>> => {
  const response = await api.get<ApiResponse<Record<string, unknown>>>(
    `${BASE_URL}/section/${sectionId}/date/${date}/consolidated-view`
  );

  if (!response.data.success) {
    throw new Error(
      response.data.message || 'Error al obtener vista consolidada de asistencia'
    );
  }

  return response.data.data || {};
};

/**
 * Obtener asistencias simples agrupadas por estudiante (para TAB 1)
 * Versión simplificada del endpoint consolidado
 * GET /api/attendance/section/:sectionId/date/:date/by-student
 */
export const getSectionAttendanceByStudent = async (
  sectionId: number,
  date: string
): Promise<Record<string, unknown>> => {
  // Usar el endpoint consolidado pero extraer solo lo necesario
  const consolidatedData = await getSectionAttendanceConsolidatedView(sectionId, date);
  
  // Transformar a formato simple: { enrollmentId: statusId }
  const consolidatedView = consolidatedData as unknown as {
    students: Array<{ enrollmentId: number; courses: Array<{ currentStatus: string }> }>;
  };
  
  const result: Record<number, { statusId: number; isEarlyExit: boolean }> = {};
  
  if (consolidatedView.students) {
    consolidatedView.students.forEach(student => {
      if (student.courses.length > 0) {
        // Tomar el primer curso como referencia
        result[student.enrollmentId] = {
          statusId: 0, // Se obtendría del código de status real
          isEarlyExit: false,
        };
      }
    });
  }
  
  return result;
};

/**
 * Actualizar estado de asistencia (TAB 2 - OPCIÓN C SMART EDIT)
 * PATCH /api/attendance/update-status
 * 
 * Permite cambiar el estado de asistencia de un estudiante en un curso específico
 * con motivo del cambio registrado
 */
/**
 * Actualizar estado de asistencia de una clase específica
 * PATCH /api/attendance/class/:classAttendanceId
 * 
 * Parámetros:
 * - classAttendanceId: ID del registro StudentClassAttendance
 * - statusId: Nuevo ID de estado de asistencia
 * - reason: Motivo del cambio
 */
export const updateAttendanceStatus = async (
  classAttendanceId: number,
  attendanceStatusId: number,
  changeReason: string = 'Estado modificado'
): Promise<{ success: boolean; message: string; data: unknown }> => {
  try {
    const response = await api.patch(`${BASE_URL}/class/${classAttendanceId}`, {
      attendanceStatusId,
      changeReason,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || response.data.error || 'Error al actualizar estado');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error updating attendance status:', error);
    
    // Mantener el objeto error completo para que el componente pueda acceder a response.data
    if (error.response?.data) {
      const err = new Error(error.response.data.message || 'Error al actualizar estado');
      (err as any).response = error.response;
      throw err;
    }
    
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Error al actualizar estado de asistencia'
    );
  }
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
  getSectionAttendanceByDateAndCycle,
  getSectionAttendanceStats,
  getJustifications,
  getTeacherCoursesByDate,
  getTodayCoursesForTeacher,
  getAttendanceByCourseDateAndTeacher,
  getDailyRegistrationStatus,
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
  validateBimesterByDate,
  validateAcademicWeekByDate,
  validateTeacherSchedules,
  validateTeacherAbsenceByDate,
  validateAttendanceCompleteness,
  getActiveAttendanceConfig,
  getHolidays,
  getActiveBimester,
  getEnrollmentsBySection,
  getActiveEnrollmentsBySectionAndCycle,
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

const attendanceService = {
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
  getSectionAttendanceByDateAndCycle,
  getSectionAttendanceStats,
  getSectionAttendanceConsolidatedView,
  getSectionAttendanceByStudent,
  updateAttendanceStatus,
  getJustifications,
  getTeacherCoursesByDate,
  getTodayCoursesForTeacher,
  getAttendanceByCourseDateAndTeacher,
  getDailyRegistrationStatus,

  // Configuración y Validaciones
  getActiveCycle,
  getGradesFromActiveCycle,
  getSectionsByGrade,
  getAllowedAttendanceStatusesByRole,
  validateHolidayByDate,
  validateBimesterByDate,
  validateAcademicWeekByDate,
  validateTeacherSchedules,
  validateSectionSchedulesByDay,
  validateTeacherAbsenceByDate,
  validateAttendanceCompleteness,
  getActiveAttendanceConfig,
  getHolidays,
  getActiveBimester,
  getEnrollmentsBySection,
  getActiveEnrollmentsBySectionAndCycle,

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

export default attendanceService;


