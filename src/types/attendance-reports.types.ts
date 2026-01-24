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
  filters?: {
    gradeId: number;
    sectionId: number;
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
  format?: ExportFormat;
  bimesterId?: number | null;
  academicWeekId?: number | null;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

/**
 * Period Type
 */
export type PeriodType = 'day' | 'week' | 'bimonthly';

/**
 * Daily Attendance Record
 */
export interface DailyAttendanceRecord {
  date: string;
  status: string; // "A", "I", "T", "J"
  statusName: string; // "Presente", "Ausente", "Tardía", "Justificado"
}

/**
 * Student Attendance History (Day/Week view)
 */
export interface StudentAttendanceHistory {
  studentId: number;
  givenNames: string;
  lastNames: string;
  attendances: DailyAttendanceRecord[];
  totalAttended: number;
  totalDays: number;
  percentage: number;
}

/**
 * Weekly Attendance Summary
 */
export interface WeeklyAttendanceSummary {
  week: number;
  weekRange: string;
  status: 'GOOD' | 'MEDIUM' | 'LOW';
  percentage: number;
  totalAttended: number;
  totalDays: number;
}

/**
 * Student Bimonthly Attendance History
 */
export interface StudentBimonthlyAttendanceHistory {
  studentId: number;
  givenNames: string;
  lastNames: string;
  weeklyAttendances: WeeklyAttendanceSummary[];
  totalPercentage: number;
  totalAttended: number;
  totalDays: number;
}

/**
 * Course Attendance History Records
 */
export interface CourseAttendanceHistoryRecords {
  courseId: number;
  courseName: string;
  courseCode: string;
  teacherName: string;
  records: StudentAttendanceHistory[];
}

/**
 * Course Bimonthly Attendance History Records
 */
export interface CourseBimonthlyAttendanceHistoryRecords {
  courseId: number;
  courseName: string;
  courseCode: string;
  teacherName: string;
  bimonthlyRecords: StudentBimonthlyAttendanceHistory[];
}

/**
 * Period Information
 */
export interface PeriodInfo {
  type: PeriodType;
  startDate?: string;
  endDate?: string;
  displayName: string;
  bimesterId?: number;
}

/**
 * Attendance History Response (Day/Week)
 */
export interface AttendanceHistoryResponse {
  section: SectionInfo;
  period: PeriodInfo;
  courses: CourseAttendanceHistoryRecords[];
}

/**
 * Attendance History Response (Bimonthly)
 */
export interface AttendanceBimonthlyHistoryResponse {
  section: SectionInfo;
  period: PeriodInfo;
  courses: CourseBimonthlyAttendanceHistoryRecords[];
}
