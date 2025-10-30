// src/types/academic-week.types.ts

/**
 * 📚 Tipos para Academic Weeks
 * 
 * Basado en el documento API_ACADEMIC_WEEKS_HELPERS.md
 * Actualizado para usar los endpoints /api/academic-weeks/helpers/*
 */

// ============================================
// ENUMS
// ============================================

export enum WeekType {
  REGULAR = 'REGULAR',
  EVALUATION = 'EVALUATION',
  REVIEW = 'REVIEW',
}

export enum AcademicMonth {
  JANUARY = 'JANUARY',
  FEBRUARY = 'FEBRUARY',
  MARCH = 'MARCH',
  APRIL = 'APRIL',
  MAY = 'MAY',
  JUNE = 'JUNE',
  JULY = 'JULY',
  AUGUST = 'AUGUST',
  SEPTEMBER = 'SEPTEMBER',
  OCTOBER = 'OCTOBER',
  NOVEMBER = 'NOVEMBER',
  DECEMBER = 'DECEMBER',
}

// ============================================
// ENTITIES
// ============================================

export interface AcademicWeek {
  id: number;
  bimesterId: number;
  weekNumber: number;
  weekType: WeekType;
  name: string;
  startDate: string;
  endDate: string;
  year: number;
  month: AcademicMonth;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicWeekWithRelations extends AcademicWeek {
  bimester: BimesterForAcademicWeek;
}

// ============================================
// HELPER TYPES (desde /helpers endpoints)
// ============================================

export interface CycleForAcademicWeek {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isArchived: boolean;
  bimesters?: BimesterForAcademicWeek[];
  _count?: {
    bimesters: number;
  };
}

export interface BimesterForAcademicWeek {
  id: number;
  schoolCycleId: number;
  number: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  academicWeeks?: AcademicWeek[];
  _count?: {
    academicWeeks: number;
  };
}

export interface BimesterInfoResponse {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  totalWeeks: number;
  existingWeeks: number;
  weekNumbers: number[];
  isEditable: boolean;
  warning?: string;
}

export interface BimesterDateRangeResponse {
  bimesterId: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  isValid: boolean;
  message?: string;
}

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

export interface CreateAcademicWeekDto {
  bimesterId: number;
  weekNumber: number;
  weekType: WeekType;
  name: string;
  startDate: string;
  endDate: string;
  year: number;
  month: AcademicMonth;
  notes?: string;
}

export interface UpdateAcademicWeekDto {
  weekNumber?: number;
  weekType?: WeekType;
  name?: string;
  startDate?: string;
  endDate?: string;
  year?: number;
  month?: AcademicMonth;
  isActive?: boolean;
  notes?: string;
}

export interface QueryAcademicWeeksDto {
  page?: number;
  limit?: number;
  search?: string;
  bimesterId?: number;
  cycleId?: number;
  weekType?: WeekType;
  isActive?: boolean;
  year?: number;
  month?: AcademicMonth;
  weekNumber?: number;
  sortBy?: 'weekNumber' | 'startDate' | 'endDate' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface QueryCyclesDto {
  includeArchived?: boolean;
  onlyActive?: boolean;
}

export interface QueryBimestersDto {
  cycleId?: number;
  onlyActive?: boolean;
}

// ============================================
// API RESPONSES
// ============================================

export interface PaginatedAcademicWeeksResponse {
  data: AcademicWeek[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedCyclesResponse {
  data: CycleForAcademicWeek[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedBimestersResponse {
  data: BimesterForAcademicWeek[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// UI HELPERS
// ============================================

export interface WeekTypeConfig {
  label: string;
  color: string;
  bgLight: string;
  bgDark: string;
  textLight: string;
  textDark: string;
  icon: string;
  description: string;
}

export interface MonthConfig {
  label: string;
  shortLabel: string;
  number: number;
  season: 'spring' | 'summer' | 'fall' | 'winter';
}

// ============================================
// CONSTANTS
// ============================================

export const WEEK_TYPE_LABELS: Record<WeekType, string> = {
  [WeekType.REGULAR]: 'Regular',
  [WeekType.EVALUATION]: 'Evaluación',
  [WeekType.REVIEW]: 'Repaso',
};

export const MONTH_LABELS: Record<AcademicMonth, string> = {
  [AcademicMonth.JANUARY]: 'Enero',
  [AcademicMonth.FEBRUARY]: 'Febrero',
  [AcademicMonth.MARCH]: 'Marzo',
  [AcademicMonth.APRIL]: 'Abril',
  [AcademicMonth.MAY]: 'Mayo',
  [AcademicMonth.JUNE]: 'Junio',
  [AcademicMonth.JULY]: 'Julio',
  [AcademicMonth.AUGUST]: 'Agosto',
  [AcademicMonth.SEPTEMBER]: 'Septiembre',
  [AcademicMonth.OCTOBER]: 'Octubre',
  [AcademicMonth.NOVEMBER]: 'Noviembre',
  [AcademicMonth.DECEMBER]: 'Diciembre',
};

export const MONTH_SHORT_LABELS: Record<AcademicMonth, string> = {
  [AcademicMonth.JANUARY]: 'Ene',
  [AcademicMonth.FEBRUARY]: 'Feb',
  [AcademicMonth.MARCH]: 'Mar',
  [AcademicMonth.APRIL]: 'Abr',
  [AcademicMonth.MAY]: 'May',
  [AcademicMonth.JUNE]: 'Jun',
  [AcademicMonth.JULY]: 'Jul',
  [AcademicMonth.AUGUST]: 'Ago',
  [AcademicMonth.SEPTEMBER]: 'Sep',
  [AcademicMonth.OCTOBER]: 'Oct',
  [AcademicMonth.NOVEMBER]: 'Nov',
  [AcademicMonth.DECEMBER]: 'Dic',
};

// ============================================
// LEGACY TYPES (mantener por compatibilidad)
// ============================================

/** @deprecated Usar AcademicWeek */
export type WeekType_Legacy = 'REGULAR' | 'EVALUATION' | 'REVIEW';

/** @deprecated Usar BimesterForAcademicWeek */
export interface BimesterInfo {
  id: number;
  name: string;
  number: number;
  cycle?: {
    id: number;
    name: string;
  };
}

/** @deprecated Usar CreateAcademicWeekDto */
export interface AcademicWeekFormValues {
  bimesterId: number;
  number: number;
  startDate: string;
  endDate: string;
  objectives?: string;
  weekType?: WeekType_Legacy;
}

/** @deprecated Usar UpdateAcademicWeekDto */
export interface UpdateAcademicWeekFormValues {
  bimesterId?: number;
  number?: number;
  startDate?: string;
  endDate?: string;
  objectives?: string;
  weekType?: WeekType_Legacy;
}

/** @deprecated Usar QueryAcademicWeeksDto */
export interface AcademicWeekFilters {
  bimesterId?: number;
  number?: number;
  weekType?: WeekType_Legacy;
}


export const MAX_REGULAR_WEEKS = 8;
export const EVALUATION_WEEK_NUMBER = 9;