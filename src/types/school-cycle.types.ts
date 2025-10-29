// src/types/school-cycle.types.ts

export interface Bimester {
  id: number;
  number: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  weeksCount: number;
}

export interface User {
  id: number;
  givenNames: string;
  lastNames: string;
}

export interface SchoolCycleCounts {
  bimesters: number;
  grades: number;
  enrollments: number;
}

export interface SchoolCycle {
  id: number;
  name: string;
  description?: string | null;
  academicYear?: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isArchived: boolean; // ← CHANGED: was isClosed
  canEnroll: boolean;
  
  // Campos de auditoría de archivo (renombrado de cierre)
  archivedAt?: string | null; // ← CHANGED: was closedAt
  archivedBy?: number | null; // ← CHANGED: was closedBy
  archiveReason?: string | null; // ← CHANGED: was closedReason
  
  // Campos de auditoría general
  createdById?: number | null;
  modifiedById?: number | null;
  createdAt: string;
  updatedAt?: string | null;
  
  // Relaciones
  bimesters?: Bimester[];
  _count?: SchoolCycleCounts;
  
  // Usuarios relacionados
  createdBy?: User | null;
  modifiedBy?: User | null;
  archivedByUser?: User | null; // ← CHANGED: was closedByUser
}

export interface SchoolCycleStats {
  id: number;
  name: string;
  isActive: boolean;
  isArchived: boolean; // ← CHANGED: was isClosed
  stats: {
    durationDays: number;
    totalBimesters: number;
    totalGrades: number;
    totalEnrollments: number;
  };
  dates: {
    startDate: string;
    endDate: string;
    createdAt: string;
  };
}

export interface CreateSchoolCycleDto {
  name: string;
  description?: string;
  academicYear?: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  canEnroll?: boolean;
}

export interface UpdateSchoolCycleDto {
  name?: string;
  description?: string;
  academicYear?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  canEnroll?: boolean;
  archiveReason?: string; // ← CHANGED: was closedReason
}

export interface QuerySchoolCyclesDto {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isArchived?: boolean; // ← CHANGED: was isClosed
  canEnroll?: boolean;
  year?: number;
  sortBy?: 'name' | 'startDate' | 'endDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  includeBimesters?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: any;
}