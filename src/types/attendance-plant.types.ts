/**
 * ====================================================================
 * ATTENDANCE PLANT TYPES - Asistencia de Planta
 * ====================================================================
 * 
 * Tipos e interfaces para la gestión de asistencia de empleados/personal
 * en la planta o instalaciones.
 */

// ====================================================================
// TIPOS BASE - Entidades principales
// ====================================================================

/**
 * Registro de asistencia de planta
 */
export interface AttendancePlantRecord {
  id: number;
  userId: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  date: string; // ISO format: YYYY-MM-DD
  entryTime: string; // HH:mm:ss
  exitTime?: string | null; // HH:mm:ss
  status: AttendancePlantStatus; // 'present', 'absent', 'late', 'early-exit', etc.
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy?: number | null;
}

/**
 * Estados de asistencia de planta
 */
export type AttendancePlantStatus = 
  | 'present'
  | 'absent'
  | 'late'
  | 'early-exit'
  | 'justified-absence'
  | 'pending-justification';

/**
 * DTO para crear un registro de asistencia
 */
export interface CreateAttendancePlantPayload {
  userId: number;
  date: string; // YYYY-MM-DD
  entryTime: string; // HH:mm:ss
  exitTime?: string | null;
  status: AttendancePlantStatus;
  notes?: string;
}

/**
 * DTO para actualizar un registro de asistencia
 */
export interface UpdateAttendancePlantPayload {
  entryTime?: string;
  exitTime?: string | null;
  status?: AttendancePlantStatus;
  notes?: string;
}

/**
 * Parámetros para consultas de asistencia
 */
export interface AttendancePlantQueryParams {
  page?: number;
  pageSize?: number;
  userId?: number;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  status?: AttendancePlantStatus;
  sortBy?: 'date' | 'user' | 'status';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Respuesta paginada de registros
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Respuesta genérica de la API
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errorCode?: string;
}

/**
 * Resumen diario de asistencia
 */
export interface DailyAttendanceSummary {
  date: string;
  totalEmployees: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  justifiedAbsenceCount: number;
  attendanceRate: number; // porcentaje
}

/**
 * Justificación de ausencia
 */
export interface AttendancePlantJustification {
  id: number;
  attendanceId: number;
  attendance: AttendancePlantRecord;
  reason: string;
  documentUrl?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: number | null;
  approvalNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para crear justificación
 */
export interface CreateJustificationPayload {
  attendanceId: number;
  reason: string;
  documentUrl?: string;
}

/**
 * Datos en cascada para la interfaz (similar a erica-history)
 */
export interface AttendancePlantCascadeData {
  cycle: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    academicYear: number;
  };
  activeBimester: {
    id: number;
    cycleId: number;
    number: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    weeksCount: number;
  };
  weeks: Array<{
    id: number;
    bimesterId: number;
    number: number;
    startDate: string;
    endDate: string;
    objectives: string;
    weekType: string;
  }>;
  grades: Array<{
    id: number;
    name: string;
    level: string;
    order: number;
    isActive: boolean;
  }>;
  gradesSections: Record<number, Array<{
    id: number;
    name: string;
    capacity: number;
    gradeId: number;
    teacherId: number;
    teacher: {
      id: number;
      givenNames: string;
      lastNames: string;
      email: string;
    };
  }>>;
}

/**
 * Reporte de asistencia
 */
export interface AttendancePlantReport {
  userId: number;
  userName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  justifiedAbsences: number;
  attendancePercentage: number;
  lastAttendanceDate: string;
}
/**
 * Estudiante en una sección
 */
export interface SectionStudent {
  enrollmentId: number;
  studentId: number;
  cui: string;
  codeSIRE: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

/**
 * Información de validación de la consulta de estudiantes
 */
export interface SectionStudentsValidationInfo {
  date: string;
  cycle: {
    id: number;
    name: string;
  };
  bimester: {
    id: number;
    name: string;
  };
  academicWeek: {
    id: number;
    number: number;
    type: string;
  };
  section: {
    id: number;
    gradeId: number;
  };
}

/**
 * Respuesta de estudiantes por sección
 */
export interface SectionStudentsResponse {
  validationInfo: SectionStudentsValidationInfo;
  students: SectionStudent[];
  totalStudents: number;
}

/**
 * Permiso de estado de asistencia
 */
export interface StatusPermission {
  canView: boolean;
  canCreate: boolean;
  canModify: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canAddJustification: boolean;
  requiresNotes: boolean;
  minNotesLength: number | null;
  maxNotesLength: number | null;
  notes: string | null;
  justificationRequired: boolean;
}

/**
 * Estado de asistencia permitido
 */
export interface AttendanceStatus {
  id: number;
  code: string;
  name: string;
  description: string;
  colorCode: string;
  isNegative: boolean;
  isExcused: boolean;
  isTemporal: boolean;
  order: number;
  permissions: StatusPermission;
}

/**
 * Respuesta de estados permitidos
 */
export interface AllowedStatusesResponse {
  role: {
    id: number;
    name: string;
  };
  statuses: AttendanceStatus[];
  totalStatuses: number;
}

// ====================================================================
// ASISTENCIA DE SECCIÓN
// ====================================================================

/**
 * Información de asistencia registrada para un estudiante
 */
export interface StudentAttendanceInfo {
  id: number;
  status: string;
  statusInfo: {
    id: number;
    code: string;
    name: string;
    colorCode: string;
  };
  arrivalTime?: string;
  departureTime?: string;
  minutesLate?: number;
  notes?: string;
  recordedAt: string;
}

/**
 * Estudiante con información de asistencia
 */
export interface SectionAttendanceStudent {
  enrollmentId: number;
  fullName: string;
  attendance?: StudentAttendanceInfo;
}

/**
 * Respuesta de asistencia de sección
 */
export interface SectionAttendanceResponse {
  students: SectionAttendanceStudent[];
  totalStudents: number;
  registeredCount: number;
  pendingCount: number;
}

// ====================================================================
// REGISTRO DE ASISTENCIA DIARIA
// ====================================================================

/**
 * Payload para registrar asistencia individual
 */
export interface RecordDailyAttendancePayload {
  enrollmentId: number;
  sectionId: number;
  date: string; // YYYY-MM-DD
  attendanceStatusId: number;
  arrivalTime?: string; // HH:mm
  departureTime?: string; // HH:mm
  notes?: string;
  recordingType: 'TEACHER' | 'COORDINATOR' | 'ADMIN';
}

/**
 * Payload para actualizar asistencia existente
 */
export interface UpdateDailyAttendancePayload {
  attendanceStatusId: number;
  arrivalTime?: string;
  departureTime?: string;
  notes?: string;
}

/**
 * Respuesta de registro individual exitoso
 */
export interface AttendanceRecordResponse {
  id: number;
  enrollmentId: number;
  date: string;
  status: string;
  statusName: string;
  recordedBy: number;
  recordedAt: string;
  isUpdate: boolean;
}

/**
 * Item individual en bulk
 */
export interface BulkAttendanceItem {
  enrollmentId: number;
  sectionId: number;
  date: string;
  attendanceStatusId: number;
  notes?: string;
}

/**
 * Payload para registrar asistencia en bulk
 */
export interface RecordDailyAttendanceBulkPayload {
  recordingType: 'TEACHER' | 'COORDINATOR' | 'ADMIN';
  attendances: BulkAttendanceItem[];
}

/**
 * Error en bulk
 */
export interface BulkAttendanceError {
  index: number;
  enrollmentId: number;
  error: string;
}

/**
 * Respuesta de registro bulk
 */
export interface BulkAttendanceResponse {
  success: boolean;
  totalProcessed: number;
  successful: number;
  failed: number;
  errors?: BulkAttendanceError[];
  data?: AttendanceRecordResponse[];
}

/**
 * Error de API con información detallada
 */
export interface AttendanceApiError {
  success: false;
  errorCode: string;
  errorType: string;
  message: string;
  detail?: string;
  data: null;
}
// ====================================================================
// HISTORIAL DE ASISTENCIA
// ====================================================================

export interface HistoryDayAttendance {
  id: number;
  status: string;
  statusName: string;
  colorCode: string;
  recordedAt: string;
  recordedBy: string;
}

export interface HistoryDay {
  date: string;
  dayOfWeek: string;
  attendance: HistoryDayAttendance | null;
}

export interface HistoryWeek {
  weekId: number;
  weekNumber: number;
  weekType: string;
  startDate: string;
  endDate: string;
  days: HistoryDay[];
}

export interface BimesterInfo {
  id: number;
  number: number;
  name: string;
  startDate: string;
  endDate: string;
}

export interface StudentInfo {
  id: number;
  name: string;
}

export interface AttendanceStatistics {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  justifiedDays?: number;
  pendingDays: number;
  attendancePercentage: string;
}

export interface StudentHistoryData {
  student: StudentInfo;
  weeks: HistoryWeek[];
  statistics: AttendanceStatistics;
}

export interface SectionInfo {
  gradeId: number;
  gradeName: string;
  sectionId: number;
  sectionName: string;
}

export interface AttendanceHistoryResponse {
  section: SectionInfo;
  bimester: BimesterInfo;
  students: StudentHistoryData[];
  totalStudents: number;
}