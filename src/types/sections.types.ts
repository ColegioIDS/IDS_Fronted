// src/types/sections.types.ts

/**
 * 🏫 Types for Sections Module
 * 
 * Gestión de secciones (aulas/grupos) dentro del sistema escolar
 */

// ============================================================================
// Core Section Interface
// ============================================================================

export interface Section {
  id: number;
  name: string;
  capacity: number;
  gradeId: number;
  teacherId: number | null;
  grade?: {
    id: number;
    name: string;
    level: string;
    order: number;
  };
  teacher?: {
    id: number;
    givenNames: string;
    lastNames: string;
    email: string | null;
  };
  _count?: {
    enrollments: number;
    courseAssignments: number;
    schedules: number;
  };
}

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface CreateSectionDto {
  name: string;           // Required, 1-100 characters
  capacity: number;       // Required, 1-100
  gradeId: number;        // Required, must exist
  teacherId?: number | null;  // Optional
}

export interface UpdateSectionDto {
  name?: string;          // Optional, 1-100 characters
  capacity?: number;      // Optional, 1-100
  gradeId?: number;       // Optional, must exist
  teacherId?: number | null;  // Optional
}

export interface AssignTeacherDto {
  teacherId: number;
}

// ============================================================================
// Query & Filters
// ============================================================================

export interface SectionFilters {
  gradeId?: number;
  teacherId?: number;
  minCapacity?: number;
  maxCapacity?: number;
  hasTeacher?: boolean;
  search?: string;
}

export interface QuerySectionsDto extends SectionFilters {
  page?: number;          // Default: 1
  limit?: number;         // Default: 10, max: 100
  sortBy?: 'name' | 'capacity' | 'createdAt';  // Default: 'name'
  sortOrder?: 'asc' | 'desc';  // Default: 'asc'
}

// ============================================================================
// Pagination Response
// ============================================================================

export interface PaginatedSectionsResponse {
  data: Section[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================================================
// Statistics
// ============================================================================

export interface SectionStats {
  id: number;
  name: string;
  capacity: number;
  currentEnrollments: number;
  availableSpots: number;
  utilizationPercentage: number;
  totalCourseAssignments: number;
  totalSchedules: number;
  hasTeacher: boolean;
  teacher?: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
  grade: {
    id: number;
    name: string;
    level: string;
  };
}

// ============================================================================
// UI State Types
// ============================================================================

export type SectionSortBy = 'name' | 'capacity' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

// ============================================================================
// Validation Constants
// ============================================================================

export const SECTION_CONSTRAINTS = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  CAPACITY_MIN: 1,
  CAPACITY_MAX: 100,
} as const;

// ============================================================================
// Helper Types
// ============================================================================

export interface SectionWithUtilization extends Section {
  utilizationPercentage: number;
  availableSpots: number;
}
