// src/types/attendance-status.types.ts

/**
 * Tipos para el módulo de Estados de Asistencia (Attendance Statuses)
 * Define las estructuras de datos usadas en los 11 endpoints de gestión de estados
 */

// ============================================
// TIPOS BASE
// ============================================

/**
 * Estado de Asistencia
 * Define un estado o marca de asistencia que puede aplicarse a estudiantes
 *
 * @example
 * {
 *   "id": 1,
 *   "code": "P",
 *   "name": "Presente",
 *   "description": "Estudiante presente en clase",
 *   "requiresJustification": false,
 *   "canHaveNotes": false,
 *   "isNegative": false,
 *   "isExcused": false,
 *   "isTemporal": false,
 *   "colorCode": "#22c55e",
 *   "order": 1,
 *   "isActive": true,
 *   "createdAt": "2024-01-15T10:00:00Z",
 *   "updatedAt": "2024-01-15T10:00:00Z"
 * }
 */
export interface AttendanceStatus {
  id: number;
  code: string; // Código único del estado (P, I, IJ, TI, TJ, etc)
  name: string; // Nombre descriptivo (Presente, Inasistencia, etc)
  description?: string; // Descripción detallada del estado
  requiresJustification: boolean; // Si requiere justificación
  canHaveNotes: boolean; // Si permite notas/comentarios
  isNegative: boolean; // Si es un estado negativo (ausencia)
  isExcused: boolean; // Si es un estado justificado
  isTemporal: boolean; // Si es un estado temporal
  colorCode?: string; // Código de color en hexadecimal (#RRGGBB)
  order: number; // Orden de presentación
  isActive: boolean; // Si el estado está activo
  createdAt?: string; // Fecha de creación (ISO 8601)
  updatedAt?: string; // Fecha de última actualización (ISO 8601)
}

/**
 * Estadísticas de un Estado de Asistencia
 * Información agregada sobre el uso de un estado
 *
 * @example
 * {
 *   "id": 1,
 *   "code": "P",
 *   "name": "Presente",
 *   "totalUsages": 1250,
 *   "usagesThisMonth": 145,
 *   "usagesThisWeek": 28,
 *   "studentsWithThisStatus": 87,
 *   "lastUsedAt": "2024-01-15T14:30:00Z",
 *   "percentage": 75.5
 * }
 */
export interface AttendanceStatusStats {
  id: number;
  code: string;
  name: string;
  totalUsages: number; // Total de veces usado
  usagesThisMonth: number; // Veces usado este mes
  usagesThisWeek: number; // Veces usado esta semana
  studentsWithThisStatus: number; // Cantidad de estudiantes con este estado
  lastUsedAt?: string; // Última vez que se usó (ISO 8601)
  percentage: number; // Porcentaje de uso respecto al total
}

// ============================================
// TIPOS DE SOLICITUD (DTOs)
// ============================================

/**
 * Solicitud para crear un nuevo Estado de Asistencia
 *
 * @example
 * {
 *   "code": "EX",
 *   "name": "Excusa Médica",
 *   "description": "Estudiante con excusa médica",
 *   "requiresJustification": true,
 *   "canHaveNotes": true,
 *   "isNegative": true,
 *   "isExcused": true,
 *   "isTemporal": false,
 *   "colorCode": "#f59e0b",
 *   "order": 5,
 *   "isActive": true
 * }
 */
export interface CreateAttendanceStatusDto {
  code: string; // Código único (requerido, max 10 caracteres)
  name: string; // Nombre descriptivo (requerido)
  description?: string; // Descripción detallada (opcional)
  requiresJustification?: boolean; // Por defecto: false
  canHaveNotes?: boolean; // Por defecto: false
  isNegative?: boolean; // Por defecto: false
  isExcused?: boolean; // Por defecto: false
  isTemporal?: boolean; // Por defecto: false
  colorCode?: string; // Formato: #RRGGBB (opcional)
  order?: number; // Por defecto: siguiente número de orden
  isActive?: boolean; // Por defecto: true
}

/**
 * Solicitud para actualizar un Estado de Asistencia
 * Todos los campos son opcionales
 *
 * @example
 * {
 *   "name": "Presente - Actualizado",
 *   "description": "Estudiante presente en clase (actualizado)",
 *   "colorCode": "#00ff00",
 *   "order": 2,
 *   "isActive": true
 * }
 */
export interface UpdateAttendanceStatusDto {
  code?: string; // Opcional - cambiar código
  name?: string; // Opcional - cambiar nombre
  description?: string; // Opcional - cambiar descripción
  requiresJustification?: boolean; // Opcional
  canHaveNotes?: boolean; // Opcional
  isNegative?: boolean; // Opcional
  isExcused?: boolean; // Opcional
  isTemporal?: boolean; // Opcional
  colorCode?: string; // Opcional
  order?: number; // Opcional
  isActive?: boolean; // Opcional
}

// ============================================
// TIPOS DE CONSULTA (Query Parameters)
// ============================================

/**
 * Parámetros de consulta para listar Estados de Asistencia con filtros
 *
 * @example
 * {
 *   "page": 1,
 *   "limit": 10,
 *   "search": "presente",
 *   "isActive": true,
 *   "isNegative": false,
 *   "isExcused": false,
 *   "sortBy": "code",
 *   "sortOrder": "asc"
 * }
 */
export interface AttendanceStatusQuery {
  page?: number; // Número de página (por defecto: 1)
  limit?: number; // Límite de resultados (por defecto: 10)
  search?: string; // Búsqueda por código, nombre o descripción (opcional)
  isActive?: boolean; // Filtrar por estado activo (opcional)
  isNegative?: boolean; // Filtrar por estados negativos (opcional)
  isExcused?: boolean; // Filtrar por estados justificados (opcional)
  requiresJustification?: boolean; // Filtrar por estados que requieren justificación (opcional)
  sortBy?: 'code' | 'name' | 'order' | 'createdAt' | 'updatedAt'; // Campo de ordenamiento
  sortOrder?: 'asc' | 'desc'; // Orden ascendente o descendente
}

// ============================================
// TIPOS DE RESPUESTA (Response)
// ============================================

/**
 * Respuesta paginada con metadatos
 *
 * @example
 * {
 *   "data": [
 *     {
 *       "id": 1,
 *       "code": "P",
 *       "name": "Presente",
 *       ...
 *     }
 *   ],
 *   "meta": {
 *     "page": 1,
 *     "limit": 10,
 *     "total": 45,
 *     "totalPages": 5,
 *     "hasNextPage": true,
 *     "hasPreviousPage": false
 *   }
 * }
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Respuesta paginada con Estados de Asistencia
 */
export interface PaginatedAttendanceStatuses {
  data: AttendanceStatus[];
  meta: PaginationMeta;
}

/**
 * Respuesta de API genérica
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  statusCode: number;
  message?: string;
  timestamp?: string;
}

/**
 * Respuesta paginada de API
 */
export interface ApiPaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  success: boolean;
  statusCode: number;
  message?: string;
  timestamp?: string;
}

// ============================================
// TIPOS PARA OPERACIONES EN LOTE
// ============================================

/**
 * Resultado de operación en lote
 */
export interface BulkOperationResult {
  created?: number;
  updated?: number;
  deleted?: number;
  activated?: number;
  deactivated?: number;
  succeeded: number;
  failed: number;
  errors?: Array<{
    index: number;
    id?: number;
    message: string;
  }>;
}

/**
 * IDs para operaciones en lote de eliminación
 */
export interface BulkDeleteDto {
  ids: number[];
}

/**
 * IDs para operaciones en lote de activación
 */
export interface BulkActivateDto {
  ids: number[];
}

/**
 * IDs para operaciones en lote de desactivación
 */
export interface BulkDeactivateDto {
  ids: number[];
}

// ============================================
// TIPOS PARA ESTADO DE UI
// ============================================

/**
 * Estado del hook useAttendanceStatuses
 */
export interface AttendanceStatusesState {
  statuses: AttendanceStatus[];
  loading: boolean;
  error: string | null;
  pagination: PaginationMeta | null;
}

/**
 * Estado completo del módulo
 */
export interface AttendanceStatusesModuleState {
  list: AttendanceStatusesState;
  current: AttendanceStatus | null;
  stats: AttendanceStatusStats | null;
  filters: AttendanceStatusQuery;
  isModalOpen: boolean;
  isDeleting: boolean;
}

// ============================================
// TIPOS PARA CACHÉ
// ============================================

/**
 * Entrada de caché para estados activos
 */
export interface CachedActiveStatuses {
  data: AttendanceStatus[];
  timestamp: number;
  expiresIn: number; // milisegundos
}

/**
 * Entrada de caché para estados negativos
 */
export interface CachedNegativeStatuses {
  data: AttendanceStatus[];
  timestamp: number;
  expiresIn: number; // milisegundos
}

// ============================================
// TIPOS PARA INTEGRACIÓN CON OTROS MÓDULOS
// ============================================

/**
 * Estado de asistencia con información de relaciones
 */
export interface AttendanceStatusWithRelations extends AttendanceStatus {
  usageCount?: number;
  lastUsedAt?: string;
  relatedPermissions?: {
    roleId: number;
    permissionId: number;
  }[];
}

/**
 * Respuesta de búsqueda por código
 */
export interface AttendanceStatusByCodeResponse {
  data: AttendanceStatus | null;
  found: boolean;
}

// ============================================
// TIPOS PARA FORMULARIOS
// ============================================

/**
 * Datos de formulario para crear/editar estado
 * (con validaciones adicionales para UI)
 */
export interface AttendanceStatusFormData {
  code: string;
  name: string;
  description?: string;
  requiresJustification?: boolean;
  canHaveNotes?: boolean;
  isNegative?: boolean;
  isExcused?: boolean;
  isTemporal?: boolean;
  colorCode?: string;
  order?: number;
  isActive?: boolean;
}

/**
 * Estado de validación de formulario
 */
export interface AttendanceStatusFormState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
}
