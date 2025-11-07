// src/types/attendance.types.ts

/**
 * ============================================
 * ATTENDANCE TYPES - Sistema de Asistencia
 * ============================================
 */

// ✅ Status de asistencia
export type AttendanceStatusCode = 'A' | 'I' | 'IJ' | 'TI' | 'TJ';

export interface AttendanceStatusInfo {
  code: AttendanceStatusCode;
  name: string;
  description: string | null;
  color?: string;
  isActive: boolean;
}

// ✅ Asistencia base
export interface StudentAttendance {
  id: number;
  enrollmentId: number;
  date: string; // ISO format
  courseAssignmentId?: number | null;
  statusCode: AttendanceStatusCode;
  notes?: string | null;
  arrivalTime?: string | null; // HH:mm format
  minutesLate?: number | null;
  departureTime?: string | null;
  hasJustification: boolean;
  justificationId?: number | null;
  recordedBy: number;
  recordedAt: string;
  lastModifiedBy?: number | null;
  lastModifiedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ✅ Asistencia con relaciones
export interface StudentAttendanceWithRelations extends StudentAttendance {
  enrollment?: {
    id: number;
    student: {
      id: number;
      givenNames: string;
      lastNames: string;
    };
    section?: {
      id: number;
      name: string;
    };
  };
  status?: AttendanceStatusInfo;
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
  classAttendances?: StudentClassAttendance[];
}

// ✅ Asistencia por clase
export interface StudentClassAttendance {
  id: number;
  studentAttendanceId: number;
  scheduleId: number;
  courseAssignmentId: number;
  status: string;
  arrivalTime?: string | null;
  notes?: string | null;
  recordedBy?: number | null;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ✅ Justificante de asistencia
export interface StudentJustification {
  id: number;
  enrollmentId: number;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  description?: string | null;
  documentUrl?: string | null;
  documentType?: string | null;
  documentName?: string | null;
  status: 'pending' | 'approved' | 'rejected';
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

// ✅ Cambios en asistencia (audit trail)
export interface StudentAttendanceChange {
  id: number;
  studentAttendanceId: number;
  statusCodeBefore: AttendanceStatusCode;
  statusCodeAfter: AttendanceStatusCode;
  notesBefore?: string | null;
  notesAfter?: string | null;
  arrivalTimeBefore?: string | null;
  arrivalTimeAfter?: string | null;
  justificationAddedId?: number | null;
  changeReason?: string | null;
  changedBy: number;
  changedAt: string;
  createdAt: string;
  changedByUser?: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
}

// ✅ Estadísticas de asistencia
export interface AttendanceStats {
  total: number;
  present: number; // 'A'
  absent: number; // 'I'
  absentJustified: number; // 'IJ'
  late: number; // 'TI'
  lateJustified: number; // 'TJ'
  percentage?: number;
  byStatus?: Record<AttendanceStatusCode, number>;
}

// ✅ Query params
export interface AttendanceQuery {
  page?: number;
  limit?: number;
  enrollmentId?: number;
  studentId?: number;
  sectionId?: number;
  courseId?: number;
  dateFrom?: string;
  dateTo?: string;
  statusCode?: AttendanceStatusCode;
  hasJustification?: boolean;
  search?: string;
  sortBy?: 'date' | 'studentName' | 'status' | 'recordedAt';
  sortOrder?: 'asc' | 'desc';
}

// ✅ Query params con permisos
export interface AttendanceQueryWithScope extends AttendanceQuery {
  scope?: 'all' | 'own' | 'grade' | 'section';
  gradeId?: number;
  sectionIdScope?: number;
}

// ✅ Paginated response
export interface PaginatedAttendance {
  data: StudentAttendanceWithRelations[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: AttendanceStats;
}

// ✅ Respuesta de lista
export interface AttendanceListResponse {
  data: StudentAttendanceWithRelations[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ✅ DTOs - Crear asistencia
export interface CreateAttendanceDto {
  enrollmentId: number;
  date: string; // ISO format
  statusCode: AttendanceStatusCode;
  courseAssignmentId?: number;
  notes?: string;
  arrivalTime?: string; // HH:mm format
  minutesLate?: number;
  departureTime?: string;
}

// ✅ DTOs - Actualizar asistencia
export interface UpdateAttendanceDto {
  statusCode?: AttendanceStatusCode;
  notes?: string;
  arrivalTime?: string;
  minutesLate?: number;
  departureTime?: string;
  changeReason?: string;
}

// ✅ DTOs - Crear múltiples asistencias
export interface BulkCreateAttendanceDto {
  attendances: CreateAttendanceDto[];
}

// ✅ DTOs - Actualizar múltiples
export interface BulkUpdateAttendanceDto {
  ids: number[];
  statusCode?: AttendanceStatusCode;
  notes?: string;
  changeReason?: string;
}

// ✅ DTOs - Eliminar múltiples
export interface BulkDeleteAttendanceDto {
  ids: number[];
}

// ✅ DTOs - Aplicar status a múltiples
export interface BulkApplyStatusDto {
  enrollmentIds: number[];
  date: string;
  statusCode: AttendanceStatusCode;
  notes?: string;
}

// ✅ Respuesta de operaciones bulk
export interface BulkAttendanceResponse {
  created?: number;
  updated?: number;
  deleted?: number;
  skipped?: number;
  errors?: Array<{
    id: number;
    error: string;
  }>;
}

// ✅ DTO - Crear justificante
export interface CreateJustificationDto {
  enrollmentId: number;
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
  description?: string;
  documentUrl?: string;
  documentType?: string;
  documentName?: string;
}

// ✅ DTO - Actualizar justificante
export interface UpdateJustificationDto {
  status?: 'approved' | 'rejected';
  approvedBy?: number;
  rejectionReason?: string;
  needsFollowUp?: boolean;
  followUpNotes?: string;
}

// ✅ DTO - Crear asistencia por clase
export interface CreateClassAttendanceDto {
  studentAttendanceId: number;
  scheduleId: number;
  courseAssignmentId: number;
  status: string;
  arrivalTime?: string;
  notes?: string;
}

// ✅ Reportes de asistencia
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
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

// ✅ Filtros de permisos por scope
export interface AttendancePermissionScope {
  scope: 'all' | 'own' | 'grade' | 'section';
  gradeId?: number;
  sectionId?: number;
  userId?: number;
  metadata?: Record<string, any>;
}

// ✅ Respuesta de error estandarizada
export interface AttendanceError {
  message: string;
  code?: string;
  details?: any;
  statusCode?: number;
}

// ============================================
// CONFIGURATION TYPES - Configuración del Sistema
// ============================================

// ✅ Grado Escolar
export interface Grade {
  id: number;
  name: string;
  level: string; // e.g., 'PRIMARIA', 'SECUNDARIA'
  abbreviation?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ✅ Sección
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

// ✅ Día Festivo
export interface Holiday {
  id: number;
  date: string; // ISO date format
  name: string;
  description?: string;
  isRecovered: boolean; // Si será día de recuperación
  recoveryDate?: string; // Fecha en que se recupera
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// CONFIGURATION QUERY & RESPONSE TYPES
// ============================================

// ✅ Query para cargar configuración
export interface ConfigurationQuery {
  schoolCycleId?: number;
  bimesterId?: number;
  includeInactive?: boolean;
}

// ✅ Respuesta con grados y secciones
export interface GradesAndSectionsResponse {
  success: boolean;
  data: {
    grades: Grade[];
    sections: Section[];
  };
  message?: string;
}

// ✅ Respuesta con días festivos
export interface HolidaysResponse {
  success: boolean;
  data: Holiday[];
  message?: string;
}

// ✅ Respuesta con configuración completa
export interface AttendanceConfigurationResponse {
  success: boolean;
  data: {
    grades: Grade[];
    sections: Section[];
    holidays: Holiday[];
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

