// src/types/dashboard.types.ts

/**
 * ============================================
 * DASHBOARD - TEACHER STATS
 * ============================================
 */

export interface DashboardTeacherStats {
  role: string;
  totalStudents: number;
  activeCoursesToday: number;
  averageAttendance: number;
  pendingTasksToGrade: number;
}

/**
 * ============================================
 * DASHBOARD - TEACHER CLASSES
 * ============================================
 */

export interface ClassSchedule {
  startTime: string;
  endTime: string;
  classroom: string | null;
  dayOfWeek: number;
}

export interface TeacherClass {
  courseId: number;
  courseName: string;
  courseCode: string;
  courseAverage: number;
  startTime?: string;
  endTime?: string;
  classroom?: string;
  schedules?: ClassSchedule[];
}

export interface Section {
  sectionId: number;
  sectionName: string;
  capacity: number;
  studentCount: number;
  sectionAverage: number;
  classes: TeacherClass[];
}

export interface Grade {
  gradeId: number;
  gradeName: string;
  gradeLevel: number;
  gradeCapacity: number;
  gradeStudentCount: number;
  gradeAverage: number;
  sections: Section[];
}

export interface TodayClassesResponse {
  teacherId: number;
  teacherName: string;
  date: string;
  totalClasses: number;
  grades: Grade[];
}

export interface AllClassesResponse {
  teacherId: number;
  teacherName: string;
  totalClasses: number;
  grades: Grade[];
}

/**
 * ============================================
 * DASHBOARD - SCHEDULE GRID
 * ============================================
 */

export interface DayOfWeek {
  dayCode: number;
  dayName: string;
}

export interface ScheduleGridClass {
  type: 'course' | 'break';
  courseId?: number;
  courseName: string;
  courseCode?: string;
  courseColor?: string;
  sectionId?: number;
  sectionName?: string;
  gradeId?: number;
  gradeName?: string;
  gradeLevel?: string;
  startTime: string;
  endTime: string;
  classroom?: string | null;
  dayOfWeek: number;
  label?: string;
  slotType?: string;
  isClass?: boolean;
}

export interface ScheduleGridResponse {
  teacherId: number;
  teacherName: string;
  uniqueTimes: string[];
  daysOfWeek: DayOfWeek[];
  grid: Record<number, Record<string, ScheduleGridClass[]>>;
  totalSchedules: number;
}

/**
 * ============================================
 * DASHBOARD - SCHEDULE WEEKLY
 * ============================================
 */

export interface ScheduleWeeklyClass {
  type: 'course' | 'break';
  timeSlot: string;
  startTime: string;
  endTime: string;
  courseId?: number;
  courseName: string;
  courseCode?: string;
  courseColor?: string;
  sectionId?: number;
  sectionName?: string;
  gradeName?: string;
  gradeLevel?: string;
  classroom?: string | null;
  label?: string;
  slotType?: string;
  isClass?: boolean;
}

export interface ScheduleWeeklyDay {
  dayCode: number;
  dayName: string;
  classes: ScheduleWeeklyClass[];
  totalClasses: number;
}

export interface ScheduleWeeklyResponse {
  teacherId: number;
  teacherName: string;
  weeklySchedule: ScheduleWeeklyDay[];
  totalSchedules: number;
}

/**
 * ============================================
 * ATTENDANCE REPORT
 * ============================================
 */

export type AttendanceReportType = 'daily' | 'weekly' | 'bimestral';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'JUSTIFIED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TrendStatus = 'UP' | 'DOWN' | 'STABLE';
export type AttendanceStatus2 = 'EXCELLENT' | 'GOOD' | 'REGULAR' | 'POOR';

export interface AttendanceReportParams {
  type: AttendanceReportType;
  attendanceType?: 'diaria' | 'byCourse' | 'both';
  dateFrom?: string;
  dateTo?: string;
  enrollmentId?: number;
  sectionId?: number;
  courseId?: number;
  groupBy?: 'student' | 'day' | 'status' | 'course';
  includeRiskDetection?: boolean;
  includeJustifications?: boolean;
}

export interface AttendanceStatusCount {
  status: AttendanceStatus;
  count: number;
  percentage: number;
  isNegative?: boolean;
}

export interface StudentAttendanceData {
  enrollmentId: number;
  studentName: string;
  status: AttendanceStatus;
  arrivalTime?: string;
  minutesLate?: number | null;
  notes?: string | null;
}

export interface DailyAttendanceRecord {
  date: string;
  dayOfWeek: string;
  totalStudents: number;
  byStatus: AttendanceStatusCount[];
  byStudent: StudentAttendanceData[];
}

export interface StudentDailySummary {
  enrollmentId: number;
  studentName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  justifiedDays: number;
  lateDays: number;
  attendancePercentage: number;
  justifications: Justification[];
}

export interface Justification {
  date: string;
  reason: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface DailyReportResponse {
  type: 'daily';
  dateRange: DateRange;
  byDay: DailyAttendanceRecord[];
  byStudent: StudentDailySummary[];
  byStatus: AttendanceStatusCount[];
  summary: {
    totalRecords: number;
    totalStudents: number;
    averageAttendancePercentage: number;
    averageAbsencePercentage: number;
  };
}

export interface DateRange {
  from: string;
  to: string;
}

export interface WeeklyAttendanceByDayOfWeek {
  dayOfWeek: string;
  averageAttendance: number;
  averageAbsence: number;
  averageJustified: number;
  recordCount: number;
}

export interface WeekData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  averageAttendancePercentage: number;
  trend: TrendStatus;
}

export interface StudentWeeklyData {
  week: number;
  presentDays: number;
  absentDays: number;
  justifiedDays: number;
  weekAttendancePercentage: number;
}

export interface StudentWeeklySummary {
  enrollmentId: number;
  studentName: string;
  weeklyData: StudentWeeklyData[];
}

export interface WeeklyReportResponse {
  type: 'weekly';
  dateRange: DateRange;
  byDayOfWeek: WeeklyAttendanceByDayOfWeek[];
  byWeek: WeekData[];
  byStudent: StudentWeeklySummary[];
  summary: {
    totalWeeks: number;
    averageAttendancePercentage: number;
    totalRecords: number;
  };
}

export interface BiweeklyWeekData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  presentCount: number;
  absentCount: number;
  justifiedCount: number;
  attendancePercentage: number;
}

export interface AttendanceTrend {
  week: number;
  percentage: number;
  status: AttendanceStatus2;
}

export interface RiskStudent {
  enrollmentId: number;
  studentName: string;
  attendancePercentage: number;
  consecutiveAbsences: number;
  isAtRisk: boolean;
  riskLevel: RiskLevel;
  lastAbsenceDate: string;
}

export interface BimestralReportResponse {
  type: 'bimestral';
  bimesterId: number;
  bimesterName: string;
  dateRange: DateRange;
  byWeek: BiweeklyWeekData[];
  attendanceTrend: AttendanceTrend[];
  riskStudents: RiskStudent[];
  statusDistribution: AttendanceStatusCount[];
  summary: {
    totalByStatus: {
      PRESENT: number;
      ABSENT: number;
      JUSTIFIED: number;
    };
    averageAttendancePercentage: number;
    atRiskStudentCount: number;
    atRiskPercentage: number;
    needsInterventionCount: number;
    totalRecords: number;
  };
}

export type AttendanceReportResponse =
  | DailyReportResponse
  | WeeklyReportResponse
  | BimestralReportResponse;
/**
 * ============================================
 * TEACHER PROFILE
 * ============================================
 */

export type TeacherType = 'section' | 'course';

export interface CourseAssignment {
  id: number;
  name: string;
  code: string;
}

export interface SectionAssignment {
  sectionId: number;
  sectionName: string;
  coursesCount: number;
  courses: CourseAssignment[];
}

export interface TitularProfile {
  isTitular: true;
  sectionId: number;
  sectionName: string;
  gradeLevel: string;
  gradeName: string;
  studentCount: number;
  totalCoursesOwned: number;
  assignedSections: SectionAssignment[];
}

export interface EspecialistaProfile {
  isTitular: false;
  totalCoursesOwned: number;
  assignedSections: SectionAssignment[];
}

export type TeacherProfile = TitularProfile | EspecialistaProfile;

export interface TeacherProfileResponse {
  teacherId: number;
  type: TeacherType;
  profile: TeacherProfile;
}