// Enums
export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  GRADUATED = 'GRADUATED',
  TRANSFERRED = 'TRANSFERRED',
}

// Interfaces - Base
export interface EnrollmentBase {
  id: number;
  studentId: number;
  cycleId: number;
  gradeId: number;
  sectionId: number;
  status: string; // ACTIVE, INACTIVE, GRADUATED, TRANSFERRED
  dateEnrolled: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  statusChangeReason?: string | null;
  createdById?: number | null;
  modifiedById?: number | null;
}

// Interfaces - Relacionadas
export interface StudentSummary {
  id: number;
  givenNames: string;
  lastNames: string;
  codeSIRE: string;
  pictures?: any[];
}

export interface CycleSummary {
  id: number;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  isActive: boolean;
  canEnroll?: boolean;
}

export interface GradeSummary {
  id: number;
  name: string;
  level?: string;
}

export interface SectionSummary {
  id: number;
  name: string;
  capacity: number;
}

// Interfaces - Respuestas
export interface EnrollmentResponse extends EnrollmentBase {
  student: StudentSummary;
  cycle: CycleSummary;
  grade: GradeSummary;
  section: SectionSummary;
}

export interface EnrollmentDetailResponse extends EnrollmentResponse {
  history?: EnrollmentHistoryItem[];
}

export interface EnrollmentHistoryItem {
  id: number;
  action: 'status_change' | 'transfer' | 'created' | 'deleted';
  fromStatus?: string;
  toStatus?: string;
  reason?: string;
  changedBy: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
  changedAt: string;
}

// Interfaces - Estadísticas
export interface EnrollmentStatistics {
  total: number;
  byStatus: Record<string, number>;
  byCycle: Record<string, number>;
  byGrade: Array<{
    gradeId: number;
    gradeName: string;
    count: number;
  }>;
  bySection?: Array<{
    sectionId: number;
    sectionName: string;
    count: number;
    capacity: number;
  }>;
  utilizationPercentage?: number;
}

export interface SectionCapacity {
  sectionId: number;
  sectionName: string;
  capacity: number;
  enrolled: number;
  available: number;
}

export interface CycleCapacity {
  cycleId: number;
  cycleName: string;
  grades: Array<{
    gradeId: number;
    gradeName: string;
    sections: SectionCapacity[];
  }>;
}

// Interfaces - Queries y Filters
export interface EnrollmentsQuery {
  page?: number;
  limit?: number;
  cycleId?: number;
  gradeId?: number;
  sectionId?: number;
  status?: EnrollmentStatus | string;
  search?: string;
  sortBy?: 'student' | 'enrollmentDate' | 'status' | 'cycle';
  sortOrder?: 'asc' | 'desc';
}

// Interfaces - DTOs
export interface CreateEnrollmentDto {
  studentId: number;
  cycleId: number;
  gradeId: number;
  sectionId: number;
  status?: EnrollmentStatus | string;
}

export interface UpdateEnrollmentStatusDto {
  status: EnrollmentStatus | string;
  reason: string;
  effectiveDate?: Date | string;
  notes?: string;
}

export interface TransferEnrollmentDto {
  newCycleId?: number;
  newGradeId: number;
  newSectionId: number;
  reason: string;
  notes?: string;
}

// Interfaces - Paginación
export interface PaginatedEnrollments {
  data: EnrollmentResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Interfaces - API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: any;
}
