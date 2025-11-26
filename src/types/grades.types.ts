// src/types/grades.types.ts

/**
 * 📚 Tipos para Grades (Grados Académicos)
 * 
 * Basado en FRONTEND_INTEGRATION_GRADES.md
 */

// ============================================
// ENTITIES
// ============================================

export interface Grade {
  id: number;
  name: string;
  level: string;
  order: number;
  isActive: boolean;
}

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

export interface CreateGradeDto {
  name: string;
  level: string;
  order: number;
  isActive?: boolean;
}

export interface UpdateGradeDto {
  name?: string;
  level?: string;
  order?: number;
  isActive?: boolean;
}

export interface QueryGradesDto {
  page?: number;
  limit?: number;
  level?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: 'name' | 'level' | 'order' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// RESPONSES
// ============================================

export interface PaginatedGradesResponse {
  data: Grade[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GradeStats {
  grade: {
    id: number;
    name: string;
    level: string;
  };
  stats: {
    sectionsCount: number;
    cyclesCount: number;
  };
}

// ============================================
// UI HELPERS
// ============================================

export interface GradeFilters {
  level?: string;
  isActive?: boolean | 'all';
  search?: string;
}

export const EDUCATION_LEVELS = [
  'Primaria',
  'Secundaria',
  'Preparatoria',
] as const;

export type EducationLevel = typeof EDUCATION_LEVELS[number];
