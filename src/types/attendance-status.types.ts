// src/types/attendance-status.types.ts

/**
 * Estados de Asistencia - Tipos TypeScript
 * Integración con backend API
 */

// ✅ Estado base
export interface AttendanceStatus {
  id: number;
  code: string;
  name: string;
  description: string | null;
  requiresJustification: boolean;
  canHaveNotes: boolean;
  isNegative: boolean;
  isExcused: boolean;
  isTemporal: boolean;
  colorCode: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ✅ Respuesta paginada
export interface PaginatedAttendanceStatuses {
  data: AttendanceStatus[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ✅ Query parameters
export interface AttendanceStatusQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isNegative?: boolean;
  isExcused?: boolean;
  requiresJustification?: boolean;
  sortBy?: 'code' | 'name' | 'order' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// ✅ Estadísticas
export interface AttendanceStatusStats {
  totalAttendances: number;
  totalPermissions: number;
}

// ✅ DTOs
export interface CreateAttendanceStatusDto {
  code: string;
  name: string;
  description?: string;
  isNegative?: boolean;
  isExcused?: boolean;
  isTemporal?: boolean;
  requiresJustification?: boolean;
  canHaveNotes?: boolean;
  colorCode?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateAttendanceStatusDto {
  code?: string;
  name?: string;
  description?: string;
  isNegative?: boolean;
  isExcused?: boolean;
  isTemporal?: boolean;
  requiresJustification?: boolean;
  canHaveNotes?: boolean;
  colorCode?: string;
  order?: number;
  isActive?: boolean;
}

// ✅ Constantes predefinidas
export const ATTENDANCE_STATUS_CODES = {
  PRESENT: 'P',
  ABSENT: 'I',
  ABSENT_JUSTIFIED: 'IJ',
  TARDY: 'R',
  TARDY_JUSTIFIED: 'RJ',
  TEMPORARY_WITHDRAWAL: 'TI',
  TEMPORARY_WITHDRAWAL_JUSTIFIED: 'TJ',
  EXCUSED: 'E',
} as const;

// ✅ Colores por defecto (oscuro y claro)
export const ATTENDANCE_STATUS_COLORS = {
  present: { light: '#4CAF50', dark: '#66BB6A' },
  absent: { light: '#F44336', dark: '#EF5350' },
  tardy: { light: '#FF9800', dark: '#FFA726' },
  excused: { light: '#2196F3', dark: '#42A5F5' },
  temporary: { light: '#9C27B0', dark: '#AB47BC' },
  neutral: { light: '#9E9E9E', dark: '#BDBDBD' },
} as const;
