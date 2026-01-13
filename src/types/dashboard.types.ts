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
