// src/types/bimester.types.ts

/**
 * Tipos para el módulo de Bimestres
 * Incluye tipos para ciclos escolares accesibles desde permisos de bimester
 */

// ============================================
// BIMESTER BASE TYPES
// ============================================

export interface Bimester {
  id: number;
  number: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  weeksCount: number;
  schoolCycleId: number;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface BimesterWithRelations extends Bimester {
  schoolCycle?: SchoolCycleForBimester;
  _count?: {
    academicWeeks: number;
    grades: number;
  };
}

// ============================================
// SCHOOL CYCLE TYPES (para usuarios con permisos de bimester)
// ============================================

/**
 * Ciclo escolar simplificado para usuarios con permisos de bimester
 * Obtenido desde endpoints /api/bimesters/cycles/*
 */
export interface SchoolCycleForBimester {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isArchived: boolean;
  bimesters?: Bimester[];
  _count?: {
    bimesters: number;
    grades: number;
    enrollments: number;
  };
}

// ============================================
// DTOs
// ============================================

export interface CreateBimesterDto {
  number: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  weeksCount: number;
}

export interface UpdateBimesterDto {
  number?: number;
  name?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  weeksCount?: number;
}

export interface QueryBimestersDto {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  schoolCycleId?: number;
  number?: number;
  sortBy?: 'number' | 'name' | 'startDate' | 'endDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface QueryAvailableCyclesDto {
  page?: number;
  limit?: number;
}

// ============================================
// API RESPONSES
// ============================================

export interface PaginatedBimestersResponse {
  data: Bimester[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedCyclesResponse {
  data: SchoolCycleForBimester[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  details?: string[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// STATS
// ============================================

export interface BimesterStats {
  total: number;
  active: number;
  inactive: number;
  currentCycle: {
    id: number;
    name: string;
    bimestersCount: number;
  } | null;
}

// ============================================
// UI STATE
// ============================================

export interface BimesterFilters extends QueryBimestersDto {
  // Extiende QueryBimestersDto para filtros UI
}

export interface BimesterFormState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  editingBimester: Bimester | null;
}
