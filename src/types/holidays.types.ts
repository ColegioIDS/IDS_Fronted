// src/types/holidays.types.ts

/**
 * 📅 Tipos para Holidays (Días Festivos)
 * 
 * Basado en FRONTEND_INTEGRATION_HOLIDAYS.md
 */

// ============================================
// ENTITIES
// ============================================

export interface Holiday {
  id: number;
  bimesterId: number;
  date: string; // ISO 8601: "2025-12-25T00:00:00.000Z"
  description: string;
  isRecovered: boolean;
  bimester?: {
    id: number;
    name: string;
    number: number;
    startDate: string;
    endDate: string;
    cycle: {
      id: number;
      name: string;
      isArchived: boolean;
    };
  };
}

// ============================================
// HELPER TYPES
// ============================================

export interface CycleForHoliday {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isArchived: boolean;
  canEnroll: boolean;
}

export interface BimesterForHoliday {
  id: number;
  name: string;
  number: number; // 1-4
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface BreakWeek {
  id: number;
  number: number;
  startDate: string;
  endDate: string;
}

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

export interface CreateHolidayDto {
  bimesterId: number;
  date: string; // ISO 8601: "YYYY-MM-DD"
  description: string;
  isRecovered?: boolean;
}

export interface UpdateHolidayDto {
  bimesterId?: number;
  date?: string;
  description?: string;
  isRecovered?: boolean;
}

export interface QueryHolidaysDto {
  page?: number;
  limit?: number;
  bimesterId?: number;
  cycleId?: number;
  year?: number;
  month?: number; // 1-12
  isRecovered?: boolean;
  startDate?: string;
  endDate?: string;
}

// ============================================
// RESPONSES
// ============================================

export interface PaginatedHolidaysResponse {
  data: Holiday[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DeleteHolidayResponse {
  message: string;
}

// ============================================
// STATS & SUMMARIES
// ============================================

export interface HolidayStats {
  total: number;
  recovered: number;
  notRecovered: number;
  byMonth: Record<number, number>; // { 1: 2, 2: 3, ... }
  byCycle: Record<number, number>;
}

// ============================================
// FILTERS
// ============================================

export interface HolidayFilters {
  cycleId?: number;
  bimesterId?: number;
  year?: number;
  month?: number;
  isRecovered?: boolean | 'all';
  startDate?: string;
  endDate?: string;
  search?: string;
}

// ============================================
// CONSTANTS
// ============================================

export const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
] as const;

export const MONTH_LABELS: Record<number, string> = {
  1: 'Enero',
  2: 'Febrero',
  3: 'Marzo',
  4: 'Abril',
  5: 'Mayo',
  6: 'Junio',
  7: 'Julio',
  8: 'Agosto',
  9: 'Septiembre',
  10: 'Octubre',
  11: 'Noviembre',
  12: 'Diciembre',
};

export const MONTH_SHORT_LABELS: Record<number, string> = {
  1: 'Ene',
  2: 'Feb',
  3: 'Mar',
  4: 'Abr',
  5: 'May',
  6: 'Jun',
  7: 'Jul',
  8: 'Ago',
  9: 'Sep',
  10: 'Oct',
  11: 'Nov',
  12: 'Dic',
};
