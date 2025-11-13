/**
 * =========================
 * ATTENDANCE TYPES - Sistema de Asistencia
 * =========================
 * 
 * Aligned with backend DTOs and best practices
 * Uses numerical IDs for all references
 * Includes full audit trail support
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export enum AttendanceStatusCode {
  PRESENT = 'P',
  ABSENT = 'I',
  ABSENT_JUSTIFIED = 'IJ',
  TARDY = 'T',
  TARDY_JUSTIFIED = 'TJ',
  EXCUSED = 'E',
  MEDICAL = 'M',
  ABSENCE = 'A',
}

export enum JustificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum AttendanceReportStatus {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

export type AttendanceScope = 'ALL' | 'GRADE' | 'SECTION' | 'OWN' | 'DEPARTMENT';

// ============================================================================
// BASE TYPES FROM BACKEND
// ============================================================================

/**
 * AttendanceStatus - Información del estado de asistencia
 * Viene directamente de la BD (tabla AttendanceStatus)
 */
export interface AttendanceStatusInfo {
  id: number;
  code: AttendanceStatusCode;
  name: string;
  description?: string | null;
  requiresJustification: boolean;
  canHaveNotes: boolean;
  isNegative: boolean;
  isExcused: boolean;
  isTemporal: boolean;
  colorCode?: string | null;
  order: number;
  isActive: boolean;
}

// ============================================================================
// STUDENT ATTENDANCE RECORDS
// ============================================================================

/**
 * StudentAttendance - Registro base de asistencia
 * Representa un único registro de asistencia de un estudiante en una fecha
 */
export interface StudentAttendance {
  id: number;
  enrollmentId: number;
  date: string; // ISO format (YYYY-MM-DD)
  courseAssignmentId?: number | null;
  attendanceStatusId: number; // ✅ ID numérico (no código string)
  notes?: string | null;
  arrivalTime?: string | null; // HH:mm format
  minutesLate?: number | null;
  departureTime?: string | null; // HH:mm format
  hasJustification: boolean;
  justificationId?: number | null;
  recordedBy: number;
  recordedAt: string; // ISO datetime
  lastModifiedBy?: number | null;
  lastModifiedAt: string; // ISO datetime
  createdAt: string;
  updatedAt: string;
}

/**
 * StudentAttendanceWithRelations - Registro con relaciones cargadas
 * Incluye información del estudiante, estado, usuario que registró, etc.
 */
export interface StudentAttendanceWithRelations extends StudentAttendance {
  enrollment?: {
    id: number;
    student?: {
      id: number;
      givenNames: string;
      lastNames: string;
    };
    section?: {
      id: number;
      name: string;
    };
  };
  attendanceStatus?: AttendanceStatusInfo;
  recordedByUser?: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
  modifiedByUser?: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
  justification?: StudentJustification;
  changeHistory?: StudentAttendanceChange[];
}

/**
 * StudentClassAttendance - Asistencia por clase específica
 * Permite registrar asistencia más granular por clase dentro de un horario
 */
export interface StudentClassAttendance {
  id: number;
  studentAttendanceId: number;
  scheduleId: number;
  courseAssignmentId: number;
  status: string;
  arrivalTime?: string | null; // HH:mm format
  notes?: string | null;
  recordedBy?: number | null;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// JUSTIFICATIONS
// ============================================================================

/**
 * StudentJustification - Justificante de ausencia/tardanza
 */
export interface StudentJustification {
  id: number;
  enrollmentId: number;
  startDate: string; // ISO format
  endDate: string; // ISO format
  type: string;
  reason: string;
  description?: string | null;
  documentUrl?: string | null;
  documentType?: string | null;
  documentName?: string | null;
  status: JustificationStatus;
  approvedBy?: number | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  needsFollowUp: boolean;
  followUpNotes?: string | null;
  submittedBy: number;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// AUDIT TRAIL
// ============================================================================

/**
 * StudentAttendanceChange - Registro de cambios en asistencia (Audit Trail)
 * Mantiene historial completo de todas las modificaciones
 */
export interface StudentAttendanceChange {
  id: number;
  studentAttendanceId: number;
  attendanceStatusIdBefore: number; // ✅ ID, no código
  attendanceStatusIdAfter: number; // ✅ ID, no código
  notesBefore?: string | null;
  notesAfter?: string | null;
  arrivalTimeBefore?: string | null;
  arrivalTimeAfter?: string | null;
  departureTimeBefore?: string | null;
  departureTimeAfter?: string | null;
  justificationAddedId?: number | null;
  changeReason?: string | null; // ✅ MANDATORY para cambios
  changedBy: number;
  changedAt: string; // ISO datetime
  createdAt: string;
  changedByUser?: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * AttendanceStats - Estadísticas de asistencia agregadas
 */
export interface AttendanceStats {
  total: number;
  present: number; // P
  absent: number; // I
  absentJustified: number; // IJ
  late: number; // T
  lateJustified: number; // TJ
  excused: number; // E
  medical: number; // M
  percentage?: number;
  byStatus?: Record<string, number>;
}

// ============================================================================
// DTOs - CREATE OPERATIONS
// ============================================================================

/**
 * CreateAttendancePayload - DTO para crear un registro de asistencia
 * ✅ Alineado con backend createAttendanceSchema
 */
export interface CreateAttendancePayload {
  enrollmentId: number;
  date: string; // ISO format (YYYY-MM-DD)
  gradeId: number;
  sectionId: number;
  attendanceStatusId: number; // ✅ ID, no código
  arrivalTime?: string; // HH:mm format
  departureTime?: string; // HH:mm format
  notes?: string;
  courseAssignmentId?: number | null;
  scope?: AttendanceScope;
}

/**
 * BulkCreateAttendancePayload - DTO para crear múltiples registros
 */
export interface BulkCreateAttendancePayload {
  attendances: CreateAttendancePayload[];
  scope?: AttendanceScope;
}

/**
 * BulkTeacherAttendancePayload - DTO para registro masivo desde maestro
 * ✅ Alineado con backend bulkTeacherAttendanceSchema
 */
export interface BulkTeacherAttendancePayload {
  date: string; // ISO format
  gradeId: number;
  sectionId: number;
  attendanceStatusId: number;
  arrivalTime?: string; // HH:mm format
  departureTime?: string; // HH:mm format
  notes?: string;
  courseAssignmentIds?: number[] | null; // null = todos los cursos
}

/**
 * BulkBySchedulesAttendanceItem - Item individual para registro por horarios
 */
export interface BulkBySchedulesAttendanceItem {
  enrollmentId: number;
  attendanceStatusId: number;
  arrivalTime?: string; // HH:mm format
  notes?: string;
}

/**
 * BulkBySchedulesPayload - DTO para registro masivo por horarios
 */
export interface BulkBySchedulesPayload {
  date: string; // ISO format
  scheduleIds: number[];
  attendances: BulkBySchedulesAttendanceItem[];
}

// ============================================================================
// DTOs - UPDATE OPERATIONS
// ============================================================================

/**
 * UpdateAttendancePayload - DTO para actualizar un registro
 * ✅ Alineado con backend updateAttendanceSchema
 * ⚠️ changeReason es OBLIGATORIO (auditoría)
 */
export interface UpdateAttendancePayload {
  attendanceStatusId?: number; // ✅ ID, no código
  notes?: string;
  arrivalTime?: string; // HH:mm format
  departureTime?: string; // HH:mm format
  changeReason: string; // ✅ MANDATORY - min 5, max 500 chars
}

/**
 * BulkUpdateAttendancePayload - DTO para actualizar múltiples registros
 */
export interface BulkUpdateAttendancePayload {
  ids: number[];
  attendanceStatusId?: number;
  notes?: string;
  changeReason: string; // ✅ MANDATORY
}

/**
 * BulkApplyStatusPayload - DTO para aplicar estado a múltiples estudiantes
 */
export interface BulkApplyStatusPayload {
  enrollmentIds: number[];
  date: string; // ISO format
  attendanceStatusId: number;
  courseAssignmentIds?: number[];
  notes?: string;
}

// ============================================================================
// DTOs - DELETE OPERATIONS
// ============================================================================

/**
 * BulkDeleteAttendancePayload - DTO para eliminar múltiples registros
 */
export interface BulkDeleteAttendancePayload {
  ids: number[];
  changeReason?: string; // Opcional para auditoría
}

// ============================================================================
// DTOs - JUSTIFICATION OPERATIONS
// ============================================================================

/**
 * CreateJustificationPayload - DTO para crear justificante
 */
export interface CreateJustificationPayload {
  enrollmentId: number;
  startDate: string; // ISO format
  endDate: string; // ISO format
  type: string;
  reason: string;
  description?: string;
  documentUrl?: string;
  documentType?: string;
  documentName?: string;
}

/**
 * UpdateJustificationPayload - DTO para actualizar justificante
 */
export interface UpdateJustificationPayload {
  status?: JustificationStatus;
  approvedBy?: number;
  rejectionReason?: string;
  needsFollowUp?: boolean;
  followUpNotes?: string;
}

// ============================================================================
// QUERY & FILTERING
// ============================================================================

/**
 * AttendanceQueryParams - Parámetros para listar asistencias
 */
export interface AttendanceQueryParams {
  page?: number;
  limit?: number;
  enrollmentId?: number;
  studentId?: number;
  sectionId?: number;
  courseId?: number;
  bimesterId?: number;
  dateFrom?: string;
  dateTo?: string;
  attendanceStatusId?: number; // ✅ ID, no código
  hasJustification?: boolean;
  search?: string;
  sortBy?: 'date' | 'studentName' | 'status' | 'recordedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * AttendanceQueryWithScope - Query params con validaciones de scope
 */
export interface AttendanceQueryWithScope extends AttendanceQueryParams {
  scope?: AttendanceScope;
  gradeId?: number;
  departmentId?: number;
}

/**
 * ConfigurationQuery - Query para cargar configuración
 */
export interface ConfigurationQuery {
  schoolCycleId?: number;
  bimesterId?: number;
  includeInactive?: boolean;
}

// ============================================================================
// RESPONSES - PAGINATED
// ============================================================================

/**
 * PaginatedAttendanceResponse - Respuesta paginada de asistencias
 */
export interface PaginatedAttendanceResponse {
  data: StudentAttendanceWithRelations[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: AttendanceStats;
}

/**
 * AttendanceListResponse - Respuesta de lista simple
 */
export interface AttendanceListResponse {
  data: StudentAttendanceWithRelations[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * BulkAttendanceResponse - Respuesta de operaciones bulk
 */
export interface BulkAttendanceResponse {
  success: boolean;
  message: string;
  created?: number;
  updated?: number;
  deleted?: number;
  skipped?: number;
  totalRecords?: number;
  data?: StudentAttendanceWithRelations[];
  errors?: Array<{
    id?: number;
    error: string;
  }>;
  timestamp?: string;
}

/**
 * BulkBySchedulesResponse - Respuesta de registro por horarios
 */
export interface BulkBySchedulesResponse {
  success: boolean;
  message: string;
  data?: {
    totalRecords: number;
    schedules: number[];
    studentCount: number;
    created: number;
    updated: number;
    errors?: Array<{
      enrollmentId?: number;
      scheduleId?: number;
      error: string;
    }>;
  };
}

// ============================================================================
// REPORTS
// ============================================================================

/**
 * AttendanceReport - Reporte consolidado de asistencia
 */
export interface AttendanceReport {
  enrollmentId: number;
  studentName: string;
  studentId: number;
  sectionName: string;
  periodName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  justifiedAbsences: number;
  justifiedLates: number;
  attendancePercentage: number;
  status: AttendanceReportStatus;
  isAtRisk: boolean;
  lastUpdated: string;
}

/**
 * AttendanceReportResponse - Respuesta con reporte
 */
export interface AttendanceReportResponse {
  success: boolean;
  data: AttendanceReport;
  message?: string;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Grade - Grado escolar
 */
export interface Grade {
  id: number;
  name: string;
  level: string; // PRIMARIA, SECUNDARIA, etc.
  abbreviation?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Section - Sección dentro de un grado
 */
export interface Section {
  id: number;
  name: string;
  gradeId: number;
  grade?: Grade;
  capacity?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Holiday - Día festivo o no laborable
 */
export interface Holiday {
  id: number;
  date: string; // ISO format
  name: string;
  description?: string;
  isRecovered: boolean;
  recoveryDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Schedule - Horario de clase
 */
export interface Schedule {
  id: number;
  sectionId: number;
  courseAssignmentId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroom?: string | null;
  course?: {
    name: string;
    code?: string;
  };
  teacher?: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
}

/**
 * AttendanceCourse - Curso disponible para una sección
 */
export interface AttendanceCourse {
  id: number;
  courseId: number;
  name: string;
  code: string;
  color?: string;
  teacherId: number;
  teacherName: string;
  startTime?: string;
  endTime?: string;
}

// ============================================================================
// CONFIGURATION RESPONSES
// ============================================================================

/**
 * GradesAndSectionsResponse - Respuesta con grados y secciones
 */
export interface GradesAndSectionsResponse {
  success: boolean;
  data: {
    grades: Grade[];
    sections: Section[];
  };
  message?: string;
}

/**
 * HolidaysResponse - Respuesta con días festivos
 */
export interface HolidaysResponse {
  success: boolean;
  data: Holiday[];
  message?: string;
}

/**
 * AttendanceConfigurationResponse - Respuesta con configuración completa
 */
export interface AttendanceConfigurationResponse {
  success: boolean;
  data: {
    grades: Grade[];
    sections: Section[];
    holidays: Holiday[];
    attendanceStatuses: AttendanceStatusInfo[];
    schoolCycle?: {
      id: number;
      name: string;
      startDate: string;
      endDate: string;
    };
    bimester?: {
      id: number;
      name: string;
      startDate: string;
      endDate: string;
    };
  };
  message?: string;
}

// ============================================================================
// PERMISSIONS & AUTHORIZATION
// ============================================================================

/**
 * AttendancePermissionScope - Información de scope de permisos
 */
export interface AttendancePermissionScope {
  scope: AttendanceScope;
  gradeId?: number;
  sectionId?: number;
  departmentId?: number;
  userId?: number;
  metadata?: Record<string, any>;
}

/**
 * UserAttendancePermissions - Permisos del usuario para asistencia
 */
export interface UserAttendancePermissions {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canViewAll: boolean;
  canViewOwnOnly: boolean;
  scopes: AttendanceScope[];
  restrictedGradeIds?: number[];
  restrictedSectionIds?: number[];
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * AttendanceError - Error estandarizado
 */
export interface AttendanceError {
  message: string;
  code?: string;
  details?: any;
  statusCode?: number;
}

/**
 * ValidationError - Error de validación Zod
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * AttendanceErrorResponse - Respuesta de error
 */
export interface AttendanceErrorResponse {
  success: false;
  error: AttendanceError;
  errors?: ValidationError[];
}

// ============================================================================
// TYPE UTILITIES
// ============================================================================

/**
 * Utilidad para extraer tipo de respuesta de operación
 */
export type AttendanceOperationResult<T> = {
  success: boolean;
  data?: T;
  error?: AttendanceError;
};

/**
 * Utilidad para respuestas con auditoría
 */
export interface AuditedAttendanceRecord extends StudentAttendance {
  audit: {
    changes: StudentAttendanceChange[];
    lastModifiedBy: {
      id: number;
      name: string;
    };
    lastModifiedAt: string;
  };
}
