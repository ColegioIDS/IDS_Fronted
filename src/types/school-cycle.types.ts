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

export interface SchoolCycleCounts {
  bimesters: number;
  grades: number;
  enrollments: number;
}

export interface SchoolCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isClosed: boolean;
  createdAt: string;
  bimesters?: Bimester[];
  _count?: SchoolCycleCounts;
}

export interface SchoolCycleStats {
  id: number;
  name: string;
  isActive: boolean;
  isClosed: boolean;
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
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface UpdateSchoolCycleDto {
  name?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface QuerySchoolCyclesDto {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isClosed?: boolean;
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