// src/types/grade-ranges.types.ts

/**
 * 📊 Tipos para Grade Ranges (Rangos de Calificaciones)
 * 
 * Basado en API_GRADE_RANGES.md
 */

// ============================================
// ENTITIES
// ============================================

export interface GradeRange {
  id: number;
  name: string;
  description?: string;
  minScore: number;
  maxScore: number;
  hexColor: string;
  level: 'Primaria' | 'Secundaria' | 'Preparatoria' | 'all';
  letterGrade?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

export interface CreateGradeRangeDto {
  name: string;
  description?: string;
  minScore: number;
  maxScore: number;
  hexColor: string;
  level?: 'Primaria' | 'Secundaria' | 'Preparatoria' | 'all';
  letterGrade?: string | null;
  isActive?: boolean;
}

export interface UpdateGradeRangeDto {
  name?: string;
  description?: string;
  minScore?: number;
  maxScore?: number;
  hexColor?: string;
  level?: 'Primaria' | 'Secundaria' | 'Preparatoria' | 'all';
  letterGrade?: string | null;
  isActive?: boolean;
}

export interface QueryGradeRangesDto {
  page?: number;
  limit?: number;
  level?: 'Primaria' | 'Secundaria' | 'Preparatoria' | 'all';
  isActive?: boolean;
  search?: string;
  sortBy?: 'name' | 'minScore' | 'maxScore' | 'level' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// RESPONSES
// ============================================

export interface PaginatedGradeRangesResponse {
  data: GradeRange[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================
// UI HELPERS
// ============================================

export interface GradeRangeFilters {
  level?: 'Primaria' | 'Secundaria' | 'Preparatoria' | 'all';
  isActive?: boolean | 'all';
  search?: string;
}

export const EDUCATION_LEVELS = [
  'Primaria',
  'Secundaria',
  'Preparatoria',
  'all',
] as const;

export type EducationLevel = typeof EDUCATION_LEVELS[number];

// Colores predefinidos para niveles (para referencia en UI)
export const LEVEL_COLORS: Record<EducationLevel, string> = {
  'Primaria': '#10b981',    // Emerald
  'Secundaria': '#3b82f6',  // Blue
  'Preparatoria': '#8b5cf6', // Purple
  'all': '#0d9488',         // Teal
};
