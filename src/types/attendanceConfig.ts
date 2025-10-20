// src/types/attendanceConfig.ts

/**
 * Tipos para el módulo de Configuración de Asistencia (AttendanceConfig)
 * Define las estructuras de datos usadas en los endpoints de configuración
 */

// ============================================
// TIPOS BASE
// ============================================

/**
 * Configuración de Asistencia
 * Define los parámetros globales del sistema de asistencia
 * 
 * @example
 * {
 *   "id": 1,
 *   "negativeStatusCodes": ["I", "TI"],
 *   "riskThresholdPercentage": 80.0,
 *   "consecutiveAbsenceAlert": 3,
 *   "notesRequiredForStates": ["IJ", "TJ"],
 *   "defaultNotesPlaceholder": "Ingrese el motivo de la ausencia",
 *   "lateThresholdTime": "08:30",
 *   "markAsTardyAfterMinutes": 15,
 *   "justificationRequiredAfter": 3,
 *   "maxJustificationDays": 365,
 *   "autoApproveJustification": false,
 *   "autoApprovalAfterDays": 7,
 *   "isActive": true,
 *   "createdAt": "2024-01-15T10:00:00Z",
 *   "updatedAt": "2024-01-15T10:00:00Z"
 * }
 */
export interface AttendanceConfig {
  id: number;
  
  // Códigos de estado que se consideran negativos (ausencias)
  negativeStatusCodes: string[]; // e.g., ["I", "TI"]
  
  // Umbral de porcentaje para marcar estudiante como en riesgo
  riskThresholdPercentage: number; // 0-100
  
  // Número de ausencias consecutivas para disparar alerta
  consecutiveAbsenceAlert: number; // e.g., 3
  
  // Estados que requieren notas obligatorias
  notesRequiredForStates: string[]; // e.g., ["IJ", "TJ"]
  
  // Texto de placeholder para el campo de notas
  defaultNotesPlaceholder?: string | null;
  
  // Hora límite para considerar una asistencia como puntual
  lateThresholdTime: string; // Formato HH:MM, e.g., "08:30"
  
  // Minutos después de la hora límite para marcar como tardío
  markAsTardyAfterMinutes: number; // 1-120
  
  // Número de ausencias antes de requerir justificación
  justificationRequiredAfter: number; // e.g., 3
  
  // Número máximo de días para justificar una ausencia
  maxJustificationDays: number; // e.g., 365
  
  // Si se auto-aprueban justificaciones automáticamente
  autoApproveJustification: boolean;
  
  // Días después de la presentación para auto-aprobar
  autoApprovalAfterDays: number; // e.g., 7
  
  // Si esta configuración está activa (solo una puede estar activa)
  isActive: boolean;
  
  // Timestamps
  createdAt: string; // ISO DateTime
  updatedAt: string; // ISO DateTime
}

/**
 * Valores por defecto del sistema
 * Retorna los valores iniciales de una nueva configuración
 * 
 * @example
 * {
 *   "negativeStatusCodes": ["I", "TI"],
 *   "riskThresholdPercentage": 80.0,
 *   "consecutiveAbsenceAlert": 3,
 *   "notesRequiredForStates": ["IJ", "TJ"],
 *   "defaultNotesPlaceholder": null,
 *   "lateThresholdTime": "08:30",
 *   "markAsTardyAfterMinutes": 15,
 *   "justificationRequiredAfter": 3,
 *   "maxJustificationDays": 365,
 *   "autoApproveJustification": false,
 *   "autoApprovalAfterDays": 7
 * }
 */
export interface AttendanceConfigDefaults {
  negativeStatusCodes: string[];
  riskThresholdPercentage: number;
  consecutiveAbsenceAlert: number;
  notesRequiredForStates: string[];
  defaultNotesPlaceholder: string | null;
  lateThresholdTime: string;
  markAsTardyAfterMinutes: number;
  justificationRequiredAfter: number;
  maxJustificationDays: number;
  autoApproveJustification: boolean;
  autoApprovalAfterDays: number;
}

// ============================================
// TIPOS DE SOLICITUD (DTOs)
// ============================================

/**
 * Solicitud para crear una nueva configuración
 * 
 * @example
 * {
 *   "negativeStatusCodes": ["I", "TI"],
 *   "riskThresholdPercentage": 75.0,
 *   "consecutiveAbsenceAlert": 4,
 *   "notesRequiredForStates": ["IJ", "TJ"],
 *   "lateThresholdTime": "09:00",
 *   "markAsTardyAfterMinutes": 20,
 *   "justificationRequiredAfter": 2,
 *   "maxJustificationDays": 30,
 *   "autoApproveJustification": true,
 *   "autoApprovalAfterDays": 5,
 *   "isActive": true
 * }
 */
export interface CreateAttendanceConfigDto {
  negativeStatusCodes?: string[];
  riskThresholdPercentage?: number;
  consecutiveAbsenceAlert?: number;
  notesRequiredForStates?: string[];
  defaultNotesPlaceholder?: string | null;
  lateThresholdTime?: string;
  markAsTardyAfterMinutes?: number;
  justificationRequiredAfter?: number;
  maxJustificationDays?: number;
  autoApproveJustification?: boolean;
  autoApprovalAfterDays?: number;
  isActive?: boolean;
}

/**
 * Solicitud para actualizar una configuración existente
 * Todos los campos son opcionales
 * 
 * @example
 * {
 *   "riskThresholdPercentage": 85.0,
 *   "markAsTardyAfterMinutes": 20
 * }
 */
export interface UpdateAttendanceConfigDto {
  negativeStatusCodes?: string[];
  riskThresholdPercentage?: number;
  consecutiveAbsenceAlert?: number;
  notesRequiredForStates?: string[];
  defaultNotesPlaceholder?: string | null;
  lateThresholdTime?: string;
  markAsTardyAfterMinutes?: number;
  justificationRequiredAfter?: number;
  maxJustificationDays?: number;
  autoApproveJustification?: boolean;
  autoApprovalAfterDays?: number;
  isActive?: boolean;
}

/**
 * Parámetros de query para listar configuraciones
 * 
 * @example
 * {
 *   "page": 1,
 *   "limit": 10,
 *   "isActive": true
 * }
 */
export interface AttendanceConfigQueryParams {
  page?: number; // Default: 1
  limit?: number; // Default: 10, Max: 100
  isActive?: boolean;
}

// ============================================
// TIPOS DE RESPUESTA
// ============================================

/**
 * Metadatos de paginación
 * Incluye información sobre la paginación de resultados
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Respuesta paginada para listar configuraciones
 * 
 * @example
 * {
 *   "data": [
 *     {
 *       "id": 1,
 *       "negativeStatusCodes": ["I", "TI"],
 *       ...
 *     }
 *   ],
 *   "meta": {
 *     "total": 1,
 *     "page": 1,
 *     "limit": 10,
 *     "totalPages": 1,
 *     "hasNextPage": false,
 *     "hasPreviousPage": false
 *   }
 * }
 */
export interface AttendanceConfigListResponse {
  data: AttendanceConfig[];
  meta: PaginationMeta;
}

/**
 * Respuesta para operaciones individuales
 * Puede ser una configuración única o los datos por defecto
 */
export interface AttendanceConfigResponse {
  data: AttendanceConfig | AttendanceConfigDefaults;
}

/**
 * Respuesta para obtener configuración activa
 * Retorna la única configuración activa del sistema
 * 
 * @example
 * {
 *   "id": 1,
 *   "negativeStatusCodes": ["I", "TI"],
 *   "riskThresholdPercentage": 80.0,
 *   ...
 * }
 */
export interface ActiveAttendanceConfig extends AttendanceConfig {}

/**
 * Respuesta de error de validación
 * Describe qué campos fallaron en la validación
 */
export interface ValidationError {
  statusCode: number;
  message: string;
  error: string; // "Bad Request" | "Not Found" | "Conflict"
}

// ============================================
// TIPOS DE ESTADO DE LA UI
// ============================================

/**
 * Estado de carga de configuración
 */
export interface AttendanceConfigState {
  // Configuración activa actual
  activeConfig: AttendanceConfig | null;
  
  // Todas las configuraciones
  configs: AttendanceConfig[];
  
  // Valores por defecto
  defaults: AttendanceConfigDefaults | null;
  
  // Estados de carga
  isLoadingActive: boolean;
  isLoadingList: boolean;
  isLoadingDefaults: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Errores
  error: string | null;
  validationErrors: Record<string, string> | null;
  
  // Paginación
  pagination: PaginationMeta | null;
}

/**
 * Respuesta de la API para cambios de configuración
 */
export interface AttendanceConfigChangeResponse {
  success: boolean;
  message: string;
  data: AttendanceConfig;
  timestamp: string;
}

// ============================================
// TIPOS DE VALIDACIÓN
// ============================================

/**
 * Reglas de validación para AttendanceConfig
 * Define los rangos y restricciones válidas
 */
export interface AttendanceConfigValidationRules {
  // negativeStatusCodes: Array de strings 1-10 chars
  negativeStatusCodesMin: number; // 0
  negativeStatusCodesMax: number; // Infinity
  negativeStatusCodesItemLength: [number, number]; // [1, 10]
  
  // riskThresholdPercentage: 0-100
  riskThresholdMin: number; // 0
  riskThresholdMax: number; // 100
  
  // consecutiveAbsenceAlert: >= 1
  consecutiveAbsenceMin: number; // 1
  
  // notesRequiredForStates: Array de strings 1-10 chars
  notesRequiredForStatesItemLength: [number, number]; // [1, 10]
  
  // lateThresholdTime: Formato HH:MM
  lateThresholdTimeFormat: string; // "HH:MM"
  
  // markAsTardyAfterMinutes: 1-120
  markAsTardyMin: number; // 1
  markAsTardyMax: number; // 120
  
  // justificationRequiredAfter: >= 1
  justificationRequiredMin: number; // 1
  
  // maxJustificationDays: >= justificationRequiredAfter, max 1825 (5 años)
  maxJustificationMin: number; // 1
  maxJustificationMax: number; // 1825
  
  // autoApprovalAfterDays: >= 1 si autoApprove es true
  autoApprovalMin: number; // 1
}

// ============================================
// TIPOS DE ERROR
// ============================================

/**
 * Errores específicos de AttendanceConfig
 */
export enum AttendanceConfigErrorType {
  NOT_FOUND = 'ATTENDANCE_CONFIG_NOT_FOUND',
  INVALID_TIME_FORMAT = 'INVALID_TIME_FORMAT',
  INVALID_PERCENTAGE = 'INVALID_PERCENTAGE',
  INVALID_RANGE = 'INVALID_RANGE',
  ALREADY_INACTIVE = 'ALREADY_INACTIVE',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  UNKNOWN = 'UNKNOWN_ERROR',
}

/**
 * Error de AttendanceConfig con tipo específico
 */
export interface AttendanceConfigError extends Error {
  type: AttendanceConfigErrorType;
  statusCode?: number;
  details?: Record<string, any>;
}

// ============================================
// TIPOS DE CACHÉ
// ============================================

/**
 * Estructura para cachear configuración
 */
export interface CachedAttendanceConfig {
  data: AttendanceConfig;
  timestamp: number; // milliseconds
  expiresIn: number; // milliseconds
}

/**
 * Respuesta con información de caché
 */
export interface AttendanceConfigWithCache {
  data: AttendanceConfig;
  cachedAt?: string;
  expiresAt?: string;
  isFromCache: boolean;
}

// ============================================
// TIPOS DE FILTROS AVANZADOS
// ============================================

/**
 * Filtros para búsqueda avanzada de configuraciones
 */
export interface AttendanceConfigFilters {
  isActive?: boolean;
  createdAfter?: string; // ISO Date
  createdBefore?: string; // ISO Date
  updatedAfter?: string; // ISO Date
  updatedBefore?: string; // ISO Date
  searchText?: string; // Búsqueda en descripción
  sortBy?: 'createdAt' | 'updatedAt' | 'id';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// TIPOS PARA HISTORIAL DE CAMBIOS
// ============================================

/**
 * Registro de cambios en la configuración
 */
export interface AttendanceConfigChangeLog {
  id: number;
  configId: number;
  previousValue: Partial<AttendanceConfig>;
  newValue: Partial<AttendanceConfig>;
  changedBy: number;
  changedAt: string;
  reason?: string;
}

// ============================================
// TIPOS EXPORTADOS COMBINADOS
// ============================================

/**
 * Unión de tipos de actualización
 */
export type AttendanceConfigUpdatePayload = Partial<CreateAttendanceConfigDto>;

/**
 * Unión de tipos de respuesta
 */
export type AttendanceConfigApiResponse = 
  | AttendanceConfig 
  | AttendanceConfigListResponse 
  | AttendanceConfigDefaults
  | AttendanceConfigChangeResponse;