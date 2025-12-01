/**
 * ====================================================================
 * ATTENDANCE TYPES - Interfases y tipos para el sistema de asistencia
 * ====================================================================
 *
 * IMPORTANTE: Los estados de asistencia (AttendanceStatus) son DINÁMICOS
 * y se traen de la BD. No son enums estáticos.
 * El código del status (originalStatus, currentStatus) es un string flexible.
 */

// ====================================================================
// ENUMS - SOLO los que son verdaderamente estáticos en Prisma
// ====================================================================

/**
 * Estados de enrollment - ESTÁTICOS según Prisma schema
 */
export enum EnrollmentStatusEnum {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
  TRANSFERRED = 'TRANSFERRED',
}

// ====================================================================
// TIPOS BASE - Entidades principales
// ====================================================================

/**
 * Usuario autenticado
 */
export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  role: {
    id: number;
    name: string;
    permissions: string[];
  };
}

/**
 * Ciclo escolar
 */
export interface SchoolCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

/**
 * Bimestre
 */
export interface Bimester {
  id: number;
  name: string;
  cycleId: number;
  startDate: string;
  endDate: string;
  order: number;
}

/**
 * Grado académico
 */
export interface Grade {
  id: number;
  name: string;
  level: number;
  cycleId: number;
}

/**
 * Sección de clase
 */
export interface Section {
  id: number;
  name: string;
  gradeId: number;
  grade?: Grade;
  maxStudents: number;
  currentStudents: number;
  teacherId?: number;
}

/**
 * Estudiante (Enrollment)
 */
export interface Enrollment {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  sectionId: number;
  section?: Section;
  status: EnrollmentStatusEnum;
  enrollmentDate: string;
}

/**
 * Asignación de curso a profesor
 */
export interface CourseAssignment {
  id: number;
  courseId: number;
  courseName: string;
  teacherId: number;
  sectionId: number;
  section?: Section;
}

/**
 * Horario (Schedule)
 */
export interface Schedule {
  id: number;
  courseAssignmentId: number;
  dayOfWeek: number; // 1-7 (Lunes a Domingo)
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  sectionId: number;
}

/**
 * Estado de asistencia disponible
 * DINÁMICO - configurable por institución, viene de la BD
 * Los códigos como PRESENT, ABSENT, etc. son configurables
 */
export interface AttendanceStatus {
  id: number;
  code: string; // PRESENT, ABSENT, TARDY, etc. - CONFIGURABLE, NO ENUM
  name: string;
  description?: string;
  requiresJustification: boolean;
  canHaveNotes: boolean;
  isNegative: boolean;
  isExcused: boolean;
  isTemporal: boolean;
  colorCode?: string; // Color en formato hex (#RRGGBB)
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Configuración de asistencia
 */
export interface AttendanceConfig {
  id: number;
  cycleId: number;
  cycle?: SchoolCycle;
  allowLateRegistration: boolean;
  lateRegistrationDays: number;
  allowModification: boolean;
  modificationDeadlineDays: number;
  requireModificationReason: boolean;
  isActive: boolean;
}

// ====================================================================
// TIPOS DE ASISTENCIA - Registros y reportes
// ====================================================================

/**
 * Registro individual de asistencia
 */
export interface AttendanceRecord {
  id: number;
  enrollmentId: number;
  enrollment?: Enrollment;
  name?: string; // ✅ NUEVO: Nombre del estudiante
  enrollmentNumber?: string; // ✅ NUEVO: Número de matrícula
  email?: string; // ✅ NUEVO: Email del estudiante
  identificationNumber?: string; // ✅ NUEVO: Cédula/SIRE del estudiante
  scheduleId: number;
  schedule?: Schedule;
  date: string; // YYYY-MM-DD
  originalStatus: string; // DINÁMICO - código del status original (PRESENT, ABSENT, etc.)
  currentStatus: string; // DINÁMICO - código del status actual
  attendanceStatusId: number; // ID del status actual en BD
  attendanceStatus?: AttendanceStatus; // Relación completa si viene en response
  arrivalTime?: string; // HH:MM
  departureTime?: string; // HH:MM
  minutesLate?: number;
  isEarlyExit: boolean;
  recordedBy: string;
  recordedAt: string; // ISO datetime
  lastModifiedBy?: string;
  lastModifiedAt?: string; // ISO datetime
  modificationReason?: string;
}

/**
 * Resumen de asistencia diaria
 * Las claves del summary son dinámicas según estados en BD
 */
export interface DailyAttendanceSummary {
  date: string;
  sectionId: number;
  sectionName: string;
  totalStudents: number;
  createdRecords: number;
  createdAttendances: number;
  recordingGroupId: string;
  summary: Record<string, number>; // Dinámico: {present: 25, absent: 3, tardy: 2, ...}
}

/**
 * Reporte de asistencia por estudiante
 */
export interface AttendanceReport {
  enrollmentId: number;
  studentName: string;
  sectionName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  tardyDays: number;
  excusedDays: number;
  earlyExitDays: number;
  attendancePercentage: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  lastRecordDate?: string;
  records: AttendanceRecord[];
}

/**
 * Historial de cambios de asistencia
 */
export interface AttendanceHistory {
  id: number;
  attendanceRecordId: number;
  previousStatus: string; // DINÁMICO - código anterior
  newStatus: string; // DINÁMICO - código nuevo
  changedBy: string;
  changedAt: string;
  reason: string;
}

/**
 * Justificación de ausencia
 */
export interface Justification {
  id: number;
  enrollmentId: number;
  enrollment?: Enrollment;
  attendanceRecordId?: number;
  date: string;
  reason: string;
  documentUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ====================================================================
// REQUEST/RESPONSE PAYLOADS
// ====================================================================

/**
 * Request para registrar asistencia individual
 */
export interface CreateSingleAttendancePayload {
  enrollmentId: number;
  scheduleId: number;
  attendanceStatusId: number; // ID del status (viene de AttendanceStatus.id)
  date: string; // YYYY-MM-DD
  arrivalTime?: string; // HH:MM
  departureTime?: string; // HH:MM
  modificationReason?: string;
}

/**
 * Request para registro diario masivo (TAB 1)
 */
export interface DailyRegistrationPayload {
  date: string; // YYYY-MM-DD
  sectionId: number;
  enrollmentStatuses: Record<number, number>; // enrollmentId -> attendanceStatusId
}

/**
 * Request para actualizar asistencia individual (TAB 2)
 */
export interface UpdateAttendancePayload {
  attendanceStatusId: number; // ID del nuevo status
  departureTime?: string; // HH:MM
  modificationReason: string; // Requerido
}

/**
 * Request para actualización masiva
 */
export interface BulkUpdateAttendancePayload {
  recordIds: number[];
  attendanceStatusId: number; // ID del nuevo status para todos
  modificationReason: string;
}

/**
 * Request para crear justificación
 */
export interface CreateJustificationPayload {
  enrollmentId: number;
  date: string;
  reason: string;
  documentUrl?: string;
}

/**
 * Request para actualizar justificación
 */
export interface UpdateJustificationPayload {
  reason?: string;
  documentUrl?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

/**
 * Parámetros de query para búsqueda
 */
export interface AttendanceQueryParams {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  statusId?: number;
  sectionId?: number;
  enrollmentId?: number;
  search?: string;
  sortBy?: 'date' | 'status' | 'student';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Response genérico de API
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

/**
 * Response paginado
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

// ====================================================================
// ESTADOS DE COMPONENTES
// ====================================================================

/**
 * Estado de carga
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Estado de validación
 */
export interface ValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

/**
 * Contexto de formulario
 */
export interface FormContextType {
  formData: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}

// ====================================================================
// TIPOS DE FILTROS Y BÚSQUEDA
// ====================================================================

/**
 * Filtros para listados
 */
export interface AttendanceFilters {
  dateRange?: {
    from: string;
    to: string;
  };
  statusId?: number[]; // IDs de statuses
  section?: number;
  student?: number;
  searchTerm?: string;
  sortBy?: 'date' | 'status' | 'student';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Opciones de paginación
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  total?: number;
}

// ====================================================================
// TIPOS DE VALIDACIÓN
// ====================================================================

/**
 * Resultado de validación
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Error de validación individual
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Reglas de validación
 */
export interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}

// ====================================================================
// TIPOS DE ESTADO GLOBAL
// ====================================================================

/**
 * Estado del módulo de asistencia
 */
export interface AttendanceState {
  currentTab: 'daily-registration' | 'course-management' | 'reports' | 'validations';
  selectedDate: string;
  selectedSection?: Section;
  selectedCourse?: CourseAssignment;
  selectedStudent?: Enrollment;
  records: AttendanceRecord[];
  availableStatuses: AttendanceStatus[]; // Estados disponibles traídos de BD
  loading: LoadingState;
  error?: string;
}

/**
 * Contexto de asistencia
 */
export interface AttendanceContextType extends AttendanceState {
  setCurrentTab: (tab: AttendanceState['currentTab']) => void;
  setSelectedDate: (date: string) => void;
  setSelectedSection: (section: Section | undefined) => void;
  setRecords: (records: AttendanceRecord[]) => void;
  setAvailableStatuses: (statuses: AttendanceStatus[]) => void;
  setLoading: (state: LoadingState) => void;
  setError: (error: string | undefined) => void;
}

// ====================================================================
// TIPOS DE UTILIDAD
// ====================================================================

/**
 * Respuesta de operación masiva
 */
export interface BulkOperationResult {
  successful: number;
  failed: number;
  total: number;
  errors?: Array<{
    recordId: number;
    error: string;
  }>;
}

/**
 * Estadísticas de asistencia
 * DINÁMICO - las claves dependen de los estados en BD
 */
export interface AttendanceStats {
  totalStudents: number;
  [key: string]: number | string; // Dinámico para cada estado posible
}

/**
 * Detalles de evento de asistencia
 */
export interface AttendanceEventDetails {
  recordId: number;
  enrollmentId: number;
  studentName: string;
  previousStatus: string; // DINÁMICO
  newStatus: string; // DINÁMICO
  changedBy: string;
  changedAt: string;
  reason?: string;
}

/**
 * Configuración de columna en tabla
 */
export interface TableColumnConfig {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: any) => any;
}

// ====================================================================
// EXPORTAR TIPOS GRUPOS POR FUNCIONALIDAD
// ====================================================================

// Entidades base
export type BaseEntity = SchoolCycle | Grade | Section | Enrollment | AttendanceStatus;

// Operaciones de asistencia
export type AttendanceOperation = 
  | CreateSingleAttendancePayload 
  | DailyRegistrationPayload 
  | UpdateAttendancePayload 
  | BulkUpdateAttendancePayload;

// Respuestas
export type AttendanceResponse = AttendanceRecord | DailyAttendanceSummary | AttendanceReport;

// Estados
export type AttendanceLoadingState = 'idle' | 'loading' | 'success' | 'error';

// ====================================================================
// VISTA CONSOLIDADA DE ASISTENCIA (Consolidated View)
// ====================================================================

/**
 * Detalles de modificación de asistencia
 */
export interface ModificationDetails {
  modifiedBy: string;
  modifiedAt: string;
  reason?: string;
}

/**
 * Asistencia de un curso para un estudiante
 */
export interface ConsolidatedCourseAttendance {
  classAttendanceId: number; // ID del registro StudentClassAttendance para PATCH
  courseId: number;
  courseName: string;
  courseCode?: string;
  courseColor?: string; // Color del curso en formato hex
  scheduleId?: number;
  courseAssignmentId?: number;
  originalStatus: string; // Código dinámico (A, I, R, etc.)
  originalStatusName: string; // Nombre para mostrar
  currentStatus: string;
  currentStatusName: string;
  hasModifications: boolean;
  modificationDetails?: ModificationDetails;
  recordedBy: string;
  recordedAt: string;
  arrivalTime?: string;
  minutesLate?: number | null;
  notes?: string | null;
}

/**
 * Asistencia consolidada de un estudiante
 */
export interface ConsolidatedStudentAttendance {
  enrollmentId: number;
  studentName: string;
  studentId: number;
  courses: ConsolidatedCourseAttendance[];
}

/**
 * Vista consolidada de asistencia por sección y fecha
 */
export interface ConsolidatedAttendanceView {
  sectionId: number;
  date: string;
  dayName: string;
  dayOfWeek: number; // 1-7 ISO 8601
  totalStudents: number;
  totalRecords: number;
  students: ConsolidatedStudentAttendance[];
}

// ====================================================================
// CONFIGURATION TYPES - Para attendance-configuration.service
// ====================================================================

/**
 * Día festivo del sistema
 */
export interface Holiday {
  id: number;
  date: string; // ISO date format
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Query parameters para configuración
 */
export interface ConfigurationQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'date' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Response con grados y secciones
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
 * Response de días festivos
 */
export interface HolidaysResponse {
  success: boolean;
  data: Holiday[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

/**
 * Response de configuración general de asistencia
 */
export interface AttendanceConfigurationResponse {
  success: boolean;
  data: {
    grades: Grade[];
    sections: Section[];
    holidays: Holiday[];
    statuses: any[];
  };
  meta?: {
    lastUpdated: string;
  };
  message?: string;
}

// ====================================================================
// TEACHER COURSES TYPES - Para attendance-teacher-courses.service
// ====================================================================

/**
 * Curso del maestro para un día específico
 */
export interface TeacherCourse {
  id: number;
  courseAssignmentId: number;
  courseName: string;
  courseCode?: string;
  sectionId: number;
  sectionName: string;
  gradeId: number;
  gradeName: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  studentCount: number;
  hasAttendanceRecorded?: boolean;
  lastRecordedAt?: string;
  attendanceStatus?: string;
  notes?: string;
}

/**
 * Response al obtener cursos del maestro por fecha
 */
export interface GetTeacherCoursesResponse {
  success: boolean;
  data: {
    date: string; // YYYY-MM-DD
    dayOfWeek: number; // 0-6 ISO 8601
    dayName: string;
    courses: TeacherCourse[];
    totalCourses: number;
  };
  message?: string;
}

/**
 * Request para registrar asistencia por cursos
 */
export interface BulkTeacherAttendanceByCourseRequest {
  date: string; // YYYY-MM-DD
  courseAssignmentIds: number[]; // Máximo 10
  attendanceStatusId: number;
  notes?: string;
  recordedBy?: string;
}

/**
 * Response al registrar asistencia por cursos
 */
export interface BulkTeacherAttendanceByCourseResponse {
  success: boolean;
  data: {
    recordsCreated: number;
    recordsFailed: number;
    courses: Array<{
      courseAssignmentId: number;
      courseName: string;
      recordsCreated: number;
      recordsFailed: number;
      errors?: string[];
    }>;
    date: string;
    timestamp: string;
  };
  message?: string;
}