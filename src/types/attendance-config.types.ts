// src/types/attendance-config.types.ts

/**
 * ✅ Configuración base de asistencia
 * Define todos los parámetros globales del sistema
 */
export interface AttendanceConfig {
  id: number;
  name: string;
  description: string | null;
  riskThresholdPercentage: number;
  consecutiveAbsenceAlert: number;
  defaultNotesPlaceholder: string | null;
  lateThresholdTime: string;
  markAsTardyAfterMinutes: number;
  justificationRequiredAfter: number;
  maxJustificationDays: number;
  autoApproveJustification: boolean;
  autoApprovalAfterDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * ✅ Configuración con metadatos completos
 */
export interface AttendanceConfigWithMetadata extends AttendanceConfig {
  createdByUser?: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
  modifiedByUser?: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
}

/**
 * ✅ DTOs para crear/actualizar
 */
export interface CreateAttendanceConfigDto {
  name: string;
  description?: string | null;
  riskThresholdPercentage?: number;
  consecutiveAbsenceAlert?: number;
  defaultNotesPlaceholder?: string | null;
  lateThresholdTime?: string;
  markAsTardyAfterMinutes?: number;
  justificationRequiredAfter?: number;
  maxJustificationDays?: number;
  autoApproveJustification?: boolean;
  autoApprovalAfterDays?: number;
  isActive?: boolean;
}

export interface UpdateAttendanceConfigDto extends CreateAttendanceConfigDto {}

/**
 * ✅ Query parameters
 */
export interface AttendanceConfigQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * ✅ Respuesta paginada
 */
export interface PaginatedAttendanceConfig {
  data: AttendanceConfig[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * ✅ Valores por defecto del sistema
 */
export interface AttendanceConfigDefaults {
  riskThresholdPercentage: number;
  consecutiveAbsenceAlert: number;
  defaultNotesPlaceholder: string | null;
  lateThresholdTime: string;
  markAsTardyAfterMinutes: number;
  justificationRequiredAfter: number;
  maxJustificationDays: number;
  autoApproveJustification: boolean;
  autoApprovalAfterDays: number;
  isActive: boolean;
}

/**
 * ✅ Respuesta genérica de API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: any;
}
