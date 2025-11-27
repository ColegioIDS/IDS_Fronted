/**
 * Active School Cycle
 */
export interface SchoolCycle {
  id: number;
  name: string;
  year: number;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Grade
 */
export interface Grade {
  id: number;
  name: string;
  level: string;
  totalSections: number;
  isActive: boolean;
}

/**
 * Section
 */
export interface Section {
  id: number;
  name: string;
  capacity: number;
  totalStudents: number;
  gradeId: number;
  gradeName: string;
  isActive: boolean;
}

/**
 * Bimester
 */
export interface Bimester {
  id: number;
  name: string;
  number: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  weeksCount: number;
}

/**
 * Academic Week
 */
export interface AcademicWeek {
  id: number;
  number: number;
  startDate: string;
  endDate: string;
  weekType: string;
  objectives: string;
}

/**
 * Teacher
 */
export interface Teacher {
  id: number;
  givenNames: string;
  lastNames: string;
}

/**
 * Course
 */
export interface Course {
  id: number;
  code: string;
  name: string;
  area: string;
  color: string;
  isActive: boolean;
  teacher: Teacher;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
}

/**
 * Attendance Summary Statistics
 */
export interface AttendanceSummaryStats {
  totalClasses: number;
  totalAttendances: number;
  totalAbsences: number;
  totalLateArrivals: number;
  totalJustified: number;
  attendancePercentage: number;
  absencePercentage: number;
  lateArrivalsPercentage: number;
  justifiedPercentage: number;
}

/**
 * Attendance by Day
 */
export interface AttendanceByDay {
  date: string;
  present: number;
  absent: number;
  lateArrivals: number;
  justified: number;
  percentage: number;
}

/**
 * Attendance by Course
 */
export interface AttendanceByCourse {
  courseId: number;
  courseName: string;
  courseCode: string;
  teacherName: string;
  totalClasses: number;
  totalAttendances: number;
  totalAbsences: number;
  totalLateArrivals: number;
  totalJustified: number;
  attendancePercentage: number;
}

/**
 * Risk Student
 */
export interface RiskStudent {
  studentId: number;
  givenNames: string;
  lastNames: string;
  attendancePercentage: number;
  status: 'HIGH_RISK' | 'MEDIUM_RISK' | 'LOW_RISK';
}

/**
 * Attendance Count
 */
export interface AttendanceCount {
  code: string;
  name: string;
  count: number;
  colorCode?: string;
}

/**
 * Student Attendance Detail
 */
export interface StudentAttendanceDetail {
  studentId: number;
  givenNames: string;
  lastNames: string;
  totalClasses: number;
  attendanceCounts: AttendanceCount[];
  attendancePercentage: number;
  riskStatus: 'NORMAL' | 'HIGH_RISK' | 'MEDIUM_RISK' | 'LOW_RISK';
}

/**
 * Course Info for Students Attendance
 */
export interface CourseInfo {
  id: number;
  code: string;
  name: string;
  teacher: Teacher;
}

/**
 * Students Attendance Response
 */
export interface StudentsAttendanceResponse {
  section: SectionInfo;
  course: CourseInfo;
  filters?: {
    gradeId: number;
    sectionId: number;
    courseId: number;
    bimesterId?: number | null;
    academicWeekId?: number | null;
  };
  summary: {
    totalStudents: number;
    totalClasses: number;
    averageAttendance: number;
    studentsWithHighRisk: number;
    studentsWithMediumRisk: number;
  };
  students: StudentAttendanceDetail[];
}

/**
 * Section Info for Attendance
 */
export interface SectionInfo {
  id: number;
  name: string;
  totalStudents: number;
}

/**
 * Attendance Summary Response
 */
export interface AttendanceSummary {
  section: SectionInfo;
  filters: {
    gradeId: number;
    sectionId: number;
    courseId: number;
    bimesterId?: number | null;
    academicWeekId?: number | null;
  };
  summary: AttendanceSummaryStats;
  byDay: AttendanceByDay[];
  byCourse: AttendanceByCourse[];
  riskStudents: RiskStudent[];
}

/**
 * Export Format Types
 */
export type ExportFormat = 'excel' | 'pdf' | 'csv';

/**
 * Export Parameters
 */
export interface ExportParams {
  gradeId: number;
  sectionId: number;
  courseId: number;
  format?: ExportFormat;
  bimesterId?: number | null;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}
