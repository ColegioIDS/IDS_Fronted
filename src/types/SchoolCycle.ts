/**
 * Tipos para Ciclos Escolares
 * Define la estructura de datos del dominio de ciclos escolares
 */

export interface Bimester {
  id: number;
  number: number;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  isActive: boolean;
  weeksCount?: number;
}

export interface SchoolCycleStats {
  durationDays: number;
  totalBimesters: number;
  totalGrades: number;
  totalEnrollments: number;
}

export interface SchoolCycleDates {
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface SchoolCycleCount {
  bimesters: number;
  grades: number;
  enrollments: number;
}

export interface SchoolCycle {
  id: number;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  isActive: boolean;
  isClosed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchoolCycleWithDetails extends SchoolCycle {
  bimesters?: Bimester[];
  _count?: SchoolCycleCount;
}

export interface SchoolCycleStatsResponse {
  id: number;
  name: string;
  isActive: boolean;
  isClosed: boolean;
  stats: SchoolCycleStats;
  dates: SchoolCycleDates;
}

export interface CreateSchoolCycleDto {
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  isActive?: boolean;
}

export interface UpdateSchoolCycleDto {
  name?: string;
  startDate?: string | Date;
  endDate?: string | Date;
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

export interface SchoolCyclePaginatedResponse extends PaginatedResponse<SchoolCycle> {}

export interface SchoolCyclePayload extends Omit<SchoolCycle, 'id' | 'createdAt' | 'updatedAt'> {}
