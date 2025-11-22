/**
 * ====================================================================
 * ATTENDANCE CONSTANTS - Constantes del módulo de asistencia
 * ====================================================================
 *
 * Define valores estáticos y configuración por defecto.
 * ⚠️ Los estados de asistencia (PRESENT, ABSENT, etc.) vienen de BD.
 *    NO son enums aquí - se cargan dinámicamente del backend.
 */

// ====================================================================
// TABS DEL MÓDULO
// ====================================================================

export const ATTENDANCE_TABS = {
  TAB_1: 'daily-registration',
  TAB_2: 'course-management',
  TAB_3: 'reports',
  TAB_4: 'validations',
} as const;

export const ATTENDANCE_TAB_LABELS = {
  [ATTENDANCE_TABS.TAB_1]: 'Registro Diario',
  [ATTENDANCE_TABS.TAB_2]: 'Gestión por Curso',
  [ATTENDANCE_TABS.TAB_3]: 'Reportes',
  [ATTENDANCE_TABS.TAB_4]: 'Validaciones',
} as const;

export const ATTENDANCE_TAB_DESCRIPTIONS = {
  [ATTENDANCE_TABS.TAB_1]: 'Registro masivo de asistencia por sección y fecha',
  [ATTENDANCE_TABS.TAB_2]: 'Edición individual de registros por curso',
  [ATTENDANCE_TABS.TAB_3]: 'Análisis y estadísticas de asistencia',
  [ATTENDANCE_TABS.TAB_4]: 'Validaciones previas antes de registrar',
} as const;

// ====================================================================
// PAGINACIÓN Y LÍMITES
// ====================================================================

export const ATTENDANCE_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  ITEMS_PER_PAGE_OPTIONS: [10, 20, 50, 100],
  STUDENTS_PER_PAGE: 30,
  REPORTS_PER_PAGE: 10,
} as const;

// ====================================================================
// VALORES POR DEFECTO
// ====================================================================

export const ATTENDANCE_DEFAULTS = {
  DEFAULT_TIME_FORMAT: 'HH:mm',
  DEFAULT_DATE_FORMAT: 'YYYY-MM-DD',
  DEFAULT_TIME_ZONE: 'America/Guatemala',
  LATE_THRESHOLD_MINUTES: 15,
  LATE_THRESHOLD_TIME: '08:30',
  RISK_THRESHOLD_PERCENTAGE: 80.0,
  CONSECUTIVE_ABSENCE_ALERT: 3,
  JUSTIFICATION_REQUIRED_AFTER: 3,
  MAX_JUSTIFICATION_DAYS: 365,
} as const;

// ====================================================================
// ROLES PERMITIDOS PARA ASISTENCIA
// ====================================================================

export const ATTENDANCE_ALLOWED_ROLES = [
  'ADMIN',
  'COORDINATOR',
  'TEACHER',
  'SECRETARY',
] as const;

// ====================================================================
// MENSAJES DE VALIDACIÓN
// ====================================================================

export const ATTENDANCE_VALIDATION_MESSAGES = {
  // Errores de autenticación
  NOT_AUTHENTICATED: 'Usuario no autenticado. Inicia sesión.',
  INVALID_ROLE: 'Tu rol no tiene permisos para acceder a asistencia.',
  INSUFFICIENT_PERMISSIONS: 'No tienes permisos para esta acción.',

  // Errores de datos
  SECTION_REQUIRED: 'Debes seleccionar una sección.',
  DATE_REQUIRED: 'Debes seleccionar una fecha.',
  INVALID_DATE: 'Fecha inválida. Debe ser YYYY-MM-DD.',
  FUTURE_DATE: 'No puedes registrar asistencia en fechas futuras.',
  PAST_DATE_LIMIT: 'No puedes registrar asistencia más de 30 días en el pasado.',

  // Errores de validación de ciclo
  CYCLE_NOT_ACTIVE: 'No hay ciclo escolar activo.',
  CYCLE_NOT_FOUND: 'Ciclo escolar no encontrado.',

  // Errores de bimestre
  BIMESTER_NOT_FOUND: 'Bimestre no encontrado para esta fecha.',
  BIMESTER_NOT_ACTIVE: 'El bimestre no está activo para esta fecha.',

  // Errores de feriados
  IS_HOLIDAY: 'Esta fecha es feriado. No se puede registrar asistencia.',

  // Errores de semana académica
  WEEK_NOT_FOUND: 'Semana académica no encontrada.',
  WEEK_IS_BREAK: 'Esta semana es BREAK académico. No se puede registrar asistencia.',
  WEEK_IS_EVALUATION: 'Esta semana es EVALUACIÓN. Verifica con coordinación.',

  // Errores de maestro
  TEACHER_ABSENT: 'No puedes registrar asistencia. El maestro está en ausencia.',
  TEACHER_NOT_FOUND: 'Maestro no encontrado.',

  // Errores de estudiantes
  NO_STUDENTS_FOUND: 'No hay estudiantes en esta sección.',
  STUDENT_NOT_ENROLLED: 'El estudiante no está matriculado en esta sección.',
  STUDENT_SUSPENDED: 'El estudiante está suspendido. Verifica con coordinación.',

  // Errores de estados
  STATUS_NOT_FOUND: 'Estado de asistencia no encontrado.',
  STATUS_NOT_ALLOWED: 'No tienes permiso para usar este estado.',
  STATUS_REQUIRES_JUSTIFICATION: 'Este estado requiere justificación.',

  // Errores de configuración
  CONFIG_NOT_FOUND: 'Configuración de asistencia no encontrada.',

  // Errores de operación
  REGISTRATION_FAILED: 'Error al registrar asistencia. Intenta nuevamente.',
  UPDATE_FAILED: 'Error al actualizar asistencia. Intenta nuevamente.',
  DELETE_FAILED: 'Error al eliminar asistencia. Intenta nuevamente.',
  LOAD_DATA_FAILED: 'Error al cargar datos. Intenta nuevamente.',

  // Errores de red
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  TIMEOUT_ERROR: 'La solicitud tardó demasiado. Intenta nuevamente.',

  // Éxito
  REGISTRATION_SUCCESS: 'Asistencia registrada correctamente.',
  UPDATE_SUCCESS: 'Asistencia actualizada correctamente.',
  DELETE_SUCCESS: 'Asistencia eliminada correctamente.',
  JUSTIFICATION_ADDED: 'Justificación agregada correctamente.',
} as const;

// ====================================================================
// COLORES POR DEFECTO DE ESTADOS
// ====================================================================

export const ATTENDANCE_STATUS_COLORS = {
  // Estos son colores por defecto. Los verdaderos vienen de BD (AttendanceStatus.colorCode)
  default: '#9CA3AF', // gray
  present: '#10B981', // green
  absent: '#EF4444', // red
  late: '#F59E0B', // amber
  excused: '#3B82F6', // blue
  justified: '#8B5CF6', // purple
  pending: '#6B7280', // gray-500
} as const;

// ====================================================================
// CAMPOS IMPORTANTES EN REGISTROS
// ====================================================================

export const ATTENDANCE_RECORD_FIELDS = {
  // Status original (auditoría)
  ORIGINAL_STATUS: 'originalStatus',
  // Status actual (lo que se muestra)
  CURRENT_STATUS: 'currentStatus',
  // Consolidado (después de cálculos)
  CONSOLIDATED_STATUS: 'consolidatedStatus',
  // Nota adicional
  NOTES: 'notes',
  // Modificado por
  MODIFIED_BY: 'lastModifiedBy',
  // Razón de modificación
  MODIFICATION_REASON: 'modificationReason',
  // Auditoría
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
} as const;

// ====================================================================
// ÍNDICES Y MAPEOS
// ====================================================================

export const ATTENDANCE_STATUS_CATEGORY = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
  JUSTIFIED: 'justified',
} as const;

// ====================================================================
// CONFIGURACIÓN DE FORMULARIOS
// ====================================================================

export const ATTENDANCE_FORM_CONFIG = {
  // Límite de caracteres
  MIN_NOTES_LENGTH: 5,
  MAX_NOTES_LENGTH: 500,
  
  // Validaciones
  MAX_BULK_UPDATE_ITEMS: 100,
  MAX_DAILY_REGISTRATION_ITEMS: 100,
  
  // Timeouts
  DEBOUNCE_SEARCH: 300, // ms
  DEBOUNCE_FILTER: 500, // ms
  REQUEST_TIMEOUT: 30000, // ms
} as const;

// ====================================================================
// RUTAS Y ENDPOINTS (Referencias, no URLs completas)
// ====================================================================

export const ATTENDANCE_ENDPOINTS = {
  // Validaciones (Hooks)
  GET_BIMESTER: '/api/attendance/bimester/by-date',
  GET_HOLIDAY: '/api/attendance/holiday/by-date',
  GET_WEEK: '/api/attendance/week/by-date',
  GET_TEACHER_ABSENCE: '/api/attendance/teacher-absence/:teacherId/by-date',
  GET_CONFIG: '/api/attendance/config/active',
  GET_ALLOWED_STATUSES: '/api/attendance/status/allowed/:roleId',

  // TAB 1: Registro Diario
  POST_DAILY_REGISTRATION: '/api/attendance/daily-registration',
  GET_DAILY_REGISTRATION_STATUS: '/api/attendance/daily-registration/:sectionId/by-date',

  // TAB 2: Gestión por Curso
  GET_SECTION_ATTENDANCE: '/api/attendance/section/:sectionId/cycle/:cycleId/by-date',
  GET_ATTENDANCE_BY_DATE: '/api/attendance/course-assignment/:courseAssignmentId/by-date',
  PATCH_CLASS_ATTENDANCE: '/api/attendance/class/:id',
  PATCH_BULK_ATTENDANCE: '/api/attendance/bulk-update',

  // TAB 3: Reportes
  GET_ATTENDANCE_REPORT: '/api/attendance/report/:enrollmentId',
  GET_STUDENT_ATTENDANCE: '/api/attendance/student/:enrollmentId',

  // Ciclo activo
  GET_ACTIVE_CYCLE: '/api/attendance/cycle/active',
} as const;
