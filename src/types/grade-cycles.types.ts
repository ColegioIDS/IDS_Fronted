// src/types/grade-cycles.types.ts

/**
 * 🔗 Types for GradeCycles Module
 * 
 * Gestión de relaciones entre grados y ciclos escolares
 */

// ============================================================================
// Core GradeCycle Interface
// ============================================================================

export interface GradeCycle {
  id: number;
  cycleId: number;
  gradeId: number;
  grade: {
    id: number;
    name: string;
    level: string;
    order: number;
  };
  cycle: {
    id: number;
    name: string;
    startDate: Date | string;
    endDate: Date | string;
    isActive: boolean;
  };
}

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface CreateGradeCycleDto {
  cycleId: number;
  gradeId: number;
}

export interface BulkCreateGradeCycleDto {
  cycleId: number;
  gradeIds: number[];
}

export interface UpdateGradeCycleDto {
  cycleId?: number;
  gradeId?: number;
}

// ============================================================================
// Helper Interfaces (Available Data)
// ============================================================================

export interface AvailableGrade {
  id: number;
  name: string;
  level: string;
  order: number;
  isActive: boolean;
}

export interface AvailableCycle {
  id: number;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  isActive: boolean;
  canEnroll: boolean;
}

// ============================================================================
// Response Interfaces
// ============================================================================

export interface BulkCreateResponse {
  success: boolean;
  cycleId: number;
  created: number;
  results: Array<{
    gradeId: number;
    gradeName: string;
    status: 'created' | 'exists' | 'error';
    message?: string;
  }>;
}

export interface DeleteGradeCycleResponse {
  message: string;
  cycleId: number;
  gradeId: number;
}

// ============================================================================
// API Response Wrapper
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
