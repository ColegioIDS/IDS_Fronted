// src/types/attendance.ts

export interface AttendanceStatus {
  id: number;
  code: string; // A, I, IJ, TI, TJ
  name: string;
  description?: string;
  requiresJustification: boolean;
  canHaveNotes: boolean;
  isNegative: boolean;
  isExcused: boolean;
  isTemporal: boolean;
  colorCode?: string;
  order: number;
  isActive: boolean;
}

export interface StudentAttendance {
  id: number;
  enrollmentId: number;
  date: string; // ISO Date string
  courseAssignmentId?: number;
  statusCode: string;
  notes?: string;
  arrivalTime?: string; // HH:mm format
  minutesLate?: number;
  departureTime?: string;
  hasJustification: boolean;
  justificationId?: number;
  recordedBy: number;
  recordedAt: string;
  lastModifiedBy?: number;
  lastModifiedAt: string;
  createdAt: string;
  updatedAt: string;
  status?: AttendanceStatus;
}

export interface CreateAttendanceDto {
  enrollmentId: number;
  date: string;
  statusCode: string;
  courseAssignmentId?: number;
  notes?: string;
  arrivalTime?: string;
  minutesLate?: number;
  departureTime?: string;
}

export interface UpdateAttendanceDto {
  statusCode?: string;
  notes?: string;
  arrivalTime?: string;
  minutesLate?: number;
  departureTime?: string;
}

export interface BulkCreateAttendanceDto {
  attendances: CreateAttendanceDto[];
}

export interface BulkUpdateAttendanceDto {
  updates: Array<{
    id: number;
    statusCode?: string;
    notes?: string;
    arrivalTime?: string;
    minutesLate?: number;
  }>;
}

export interface BulkDeleteAttendanceDto {
  ids: number[];
}

export interface BulkApplyStatusDto {
  enrollmentIds: number[];
  statusCode: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface AttendanceChangeRecord {
  id: number;
  studentAttendanceId: number;
  statusCodeBefore: string;
  statusCodeAfter: string;
  notesBefore?: string;
  notesAfter?: string;
  arrivalTimeBefore?: string;
  arrivalTimeAfter?: string;
  justificationAddedId?: number;
  changeReason?: string;
  changedBy: number;
  changedAt: string;
  createdAt: string;
}

export interface AttendanceResponse {
  data: StudentAttendance;
  success: boolean;
  statusCode: number;
  timestamp: string;
}

export interface AttendanceListResponse {
  data: StudentAttendance[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  success: boolean;
  statusCode: number;
  timestamp: string;
}

export interface BulkAttendanceResponse {
  created: number;
  updated: number;
  deleted: number;
  failed: number;
  results?: any[];
  errors?: any[];
  success: boolean;
  statusCode: number;
  timestamp: string;
}

export interface AttendanceFilters {
  enrollmentId?: number;
  dateFrom?: string;
  dateTo?: string;
  statusCode?: string;
  courseAssignmentId?: number;
  page?: number;
  limit?: number;
}
