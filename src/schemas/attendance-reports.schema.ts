import { z } from 'zod';

/**
 * School Cycle Schema
 */
export const SchoolCycleSchema = z.object({
  id: z.number(),
  name: z.string(),
  year: z.number(),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SchoolCycleValidated = z.infer<typeof SchoolCycleSchema>;

/**
 * Grade Schema
 */
export const GradeSchema = z.object({
  id: z.number(),
  name: z.string(),
  level: z.string(),
  totalSections: z.number(),
  isActive: z.boolean(),
});

export type GradeValidated = z.infer<typeof GradeSchema>;

/**
 * Section Schema
 */
export const SectionSchema = z.object({
  id: z.number(),
  name: z.string(),
  capacity: z.number(),
  totalStudents: z.number(),
  gradeId: z.number(),
  gradeName: z.string(),
  isActive: z.boolean(),
});

export type SectionValidated = z.infer<typeof SectionSchema>;

/**
 * Bimester Schema
 */
export const BimesterSchema = z.object({
  id: z.number(),
  name: z.string(),
  number: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean(),
  weeksCount: z.number(),
});

export type BimesterValidated = z.infer<typeof BimesterSchema>;

/**
 * Academic Week Schema
 */
export const AcademicWeekSchema = z.object({
  id: z.number(),
  number: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  weekType: z.string(),
  objectives: z.string(),
});

export type AcademicWeekValidated = z.infer<typeof AcademicWeekSchema>;

/**
 * Teacher Schema
 */
export const TeacherSchema = z.object({
  id: z.number(),
  givenNames: z.string(),
  lastNames: z.string(),
});

export type TeacherValidated = z.infer<typeof TeacherSchema>;

/**
 * Course Schema
 */
export const CourseSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  area: z.string(),
  color: z.string(),
  isActive: z.boolean(),
  teacher: TeacherSchema,
});

export type CourseValidated = z.infer<typeof CourseSchema>;

/**
 * Attendance Summary Stats Schema
 */
export const AttendanceSummaryStatsSchema = z.object({
  totalClasses: z.number(),
  totalAttendances: z.number(),
  totalAbsences: z.number(),
  totalLateArrivals: z.number(),
  totalJustified: z.number(),
  attendancePercentage: z.number(),
  absencePercentage: z.number(),
  lateArrivalsPercentage: z.number(),
  justifiedPercentage: z.number(),
});

export type AttendanceSummaryStatsValidated = z.infer<typeof AttendanceSummaryStatsSchema>;

/**
 * Attendance by Day Schema
 */
export const AttendanceByDaySchema = z.object({
  date: z.string(),
  present: z.number(),
  absent: z.number(),
  lateArrivals: z.number(),
  justified: z.number(),
  percentage: z.number(),
});

export type AttendanceByDayValidated = z.infer<typeof AttendanceByDaySchema>;

/**
 * Attendance by Course Schema
 */
export const AttendanceByCourseSchema = z.object({
  courseId: z.number(),
  courseName: z.string(),
  courseCode: z.string(),
  teacherName: z.string(),
  totalClasses: z.number(),
  totalAttendances: z.number(),
  totalAbsences: z.number(),
  totalLateArrivals: z.number(),
  totalJustified: z.number(),
  attendancePercentage: z.number(),
});

export type AttendanceByCourseValidated = z.infer<typeof AttendanceByCourseSchema>;

/**
 * Risk Student Schema
 */
export const RiskStudentSchema = z.object({
  studentId: z.number(),
  givenNames: z.string(),
  lastNames: z.string(),
  attendancePercentage: z.number(),
  status: z.enum(['HIGH_RISK', 'MEDIUM_RISK', 'LOW_RISK']),
});

export type RiskStudentValidated = z.infer<typeof RiskStudentSchema>;

/**
 * Section Info Schema
 */
export const SectionInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
  totalStudents: z.number(),
});

export type SectionInfoValidated = z.infer<typeof SectionInfoSchema>;

/**
 * Attendance Summary Schema
 */
export const AttendanceSummarySchema = z.object({
  section: SectionInfoSchema,
  filters: z.object({
    gradeId: z.number(),
    sectionId: z.number(),
    courseId: z.number(),
    bimesterId: z.number().nullable().optional(),
    academicWeekId: z.number().nullable().optional(),
  }),
  summary: AttendanceSummaryStatsSchema,
  byDay: z.array(AttendanceByDaySchema),
  byCourse: z.array(AttendanceByCourseSchema),
  riskStudents: z.array(RiskStudentSchema),
});

export type AttendanceSummaryValidated = z.infer<typeof AttendanceSummarySchema>;

/**
 * API Response Schema
 */
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
  message: z.string().optional(),
});

/**
 * Paginated Response Schema
 */
export const PaginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.unknown()),
  total: z.number(),
  message: z.string().optional(),
});
