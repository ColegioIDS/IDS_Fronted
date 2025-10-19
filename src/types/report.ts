// src/types/report.ts

export interface StudentAttendanceReport {
  id: number;
  enrollmentId: number;
  bimesterId: number;
  courseId?: number;
  countPresent: number;
  countAbsent: number;
  countAbsentJustified: number;
  countTemporal: number;
  countTemporalJustified: number;
  totalSchoolDays: number;
  totalMarkDays: number;
  attendancePercentage: number;
  absencePercentage: number;
  consecutiveAbsences: number;
  isAtRisk: boolean;
  needsIntervention: boolean;
  notes?: string;
  calculatedAt: string;
  lastRecalculatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportWithStudent extends StudentAttendanceReport {
  enrollment: {
    id: number;
    student: {
      givenNames: string;
      lastNames: string;
    };
  };
  bimester?: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
  };
  course?: {
    id: number;
    name: string;
    code: string;
  };
}

export interface AttendanceStats {
  totalReports: number;
  atRisk: number;
  healthy: number;
  averageAttendance: number;
}

export interface BimesterSummary {
  total: number;
  atRisk: number;
  needsIntervention: number;
  averageAttendance: number;
  averageAbsence: number;
}

export interface ReportResponse {
  data: StudentAttendanceReport;
  success: boolean;
  statusCode: number;
  timestamp: string;
}

export interface ReportListResponse {
  data: ReportWithStudent[];
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

export interface ReportStatisticsResponse {
  data: AttendanceStats;
  success: boolean;
  statusCode: number;
  timestamp: string;
}

export interface ReportSummaryResponse {
  data: BimesterSummary;
  success: boolean;
  statusCode: number;
  timestamp: string;
}

export interface RecalculateReportDto {
  enrollmentId: number;
  bimesterId: number;
  courseId?: number;
}

export interface ReportFilters {
  bimesterId?: number;
  courseId?: number;
  isAtRisk?: boolean;
  needsIntervention?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'attendance' | 'absences' | 'consecutive' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface AtRiskStudent {
  enrollmentId: number;
  studentName: string;
  attendancePercentage: number;
  absencePercentage: number;
  consecutiveAbsences: number;
  lastAbsenceDate?: string;
  interventionRequired: boolean;
}

export interface InterventionStudent {
  enrollmentId: number;
  studentName: string;
  consecutiveAbsences: number;
  reason: 'risk' | 'consecutive' | 'both';
  lastModified: string;
  assignedTo?: string;
}

export interface SectionReport {
  sectionId: number;
  sectionName: string;
  bimesterId: number;
  students: ReportWithStudent[];
  summary: {
    total: number;
    atRisk: number;
    averageAttendance: number;
    averageAbsence: number;
  };
}

export interface AttendanceTrend {
  date: string;
  present: number;
  absent: number;
  justified: number;
  tardy: number;
  percentage: number;
}

export interface StudentReportDetail {
  report: StudentAttendanceReport;
  student: {
    id: number;
    name: string;
    email?: string;
  };
  trend: AttendanceTrend[];
  recommendations: string[];
}