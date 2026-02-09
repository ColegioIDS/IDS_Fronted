/**
 * ====================================================================
 * INDEX - Exportar todos los permisos de módulos
 * ====================================================================
 * 
 * Archivo: src/constants/modules-permissions/index.ts
 * 
 * Barril de exportación para acceder fácilmente a todos los permisos
 */

// Tipos
export type { PermissionConfig, PermissionScope } from './types';
export { CRUD_ACTIONS, SCOPE_TYPES } from './types';

// Permisos por módulo
export { ACADEMIC_WEEK_PERMISSIONS } from './academic-week/academic-week.permissions';
export { PERMISSION_PERMISSIONS } from './permission/permission.permissions';
export { ROLE_PERMISSIONS } from './role/role.permissions';
export { SCHOOL_CYCLE_PERMISSIONS } from './school-cycle/school-cycle.permissions';
export { BIMESTER_PERMISSIONS } from './bimester/bimester.permissions';
export { GRADE_PERMISSIONS } from './grade/grade.permissions';
export { GRADE_CYCLE_PERMISSIONS } from './grade-cycle/grade-cycle.permissions';
export { SECTION_PERMISSIONS } from './section/section.permissions';
export { HOLIDAY_PERMISSIONS } from './holiday/holiday.permissions';
export { STUDENT_PERMISSIONS } from './student/student.permissions';
export { USER_PERMISSIONS } from './user/user.permissions';
export { COURSE_PERMISSIONS } from './course/course.permissions';
export { COURSE_GRADE_PERMISSIONS } from './course-grade/course-grade.permissions';
export { COURSE_ASSIGNMENT_PERMISSIONS } from './course-assignment/course-assignment.permissions';
export { SCHEDULE_PERMISSIONS } from './schedule/schedule.permissions';
export { SCHEDULE_CONFIG_PERMISSIONS } from './schedule-config/schedule-config.permissions';
export { ENROLLMENT_PERMISSIONS } from './enrollment/enrollment.permissions';
export { ATTENDANCE_PERMISSIONS } from './attendance/attendance.permissions';
export { ATTENDANCE_CONFIG_PERMISSIONS } from './attendance-config/attendance-config.permissions';
export { ATTENDANCE_STATUS_PERMISSIONS } from './attendance-status/attendance-status.permissions';
export { ATTENDANCE_PERMISSIONS_PERMISSIONS } from './attendance-permissions/attendance-permissions.permissions';
export { ATTENDANCE_PLANT_PERMISSIONS } from './attendance-plant/attendance-plant.permissions';
export { SIGNATURES_PERMISSIONS } from './signatures/signatures.permissions';
export { ASSIGNMENTS_PERMISSIONS } from './assignments/assignments.permissions';
export { NOTIFICATIONS_PERMISSIONS } from './notifications/notifications.permissions';
export { NEWS_PERMISSIONS } from './news/news.permissions';
export { ERICA_HISTORY_PERMISSIONS } from './erica-history/erica-history.permissions';

/**
 * Objeto centralizado con todos los permisos por módulo
 * 
 * USO:
 * import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';
 * 
 * <ProtectedPage {...MODULES_PERMISSIONS.PERMISSION.READ}>
 */
export const MODULES_PERMISSIONS = {
  ACADEMIC_WEEK: require('./academic-week/academic-week.permissions').ACADEMIC_WEEK_PERMISSIONS,
  PERMISSION: require('./permission/permission.permissions').default,
  ROLE: require('./role/role.permissions').ROLE_PERMISSIONS,
  SCHOOL_CYCLE: require('./school-cycle/school-cycle.permissions').SCHOOL_CYCLE_PERMISSIONS,
  BIMESTER: require('./bimester/bimester.permissions').BIMESTER_PERMISSIONS,
  GRADE: require('./grade/grade.permissions').GRADE_PERMISSIONS,
  GRADE_CYCLE: require('./grade-cycle/grade-cycle.permissions').GRADE_CYCLE_PERMISSIONS,
  SECTION: require('./section/section.permissions').SECTION_PERMISSIONS,
  HOLIDAY: require('./holiday/holiday.permissions').HOLIDAY_PERMISSIONS,
  STUDENT: require('./student/student.permissions').STUDENT_PERMISSIONS,
  USER: require('./user/user.permissions').USER_PERMISSIONS,
  COURSE: require('./course/course.permissions').COURSE_PERMISSIONS,
  COURSE_GRADE: require('./course-grade/course-grade.permissions').COURSE_GRADE_PERMISSIONS,
  COURSE_ASSIGNMENT: require('./course-assignment/course-assignment.permissions').COURSE_ASSIGNMENT_PERMISSIONS,
  SCHEDULE: require('./schedule/schedule.permissions').SCHEDULE_PERMISSIONS,
  SCHEDULE_CONFIG: require('./schedule-config/schedule-config.permissions').SCHEDULE_CONFIG_PERMISSIONS,
  ENROLLMENT: require('./enrollment/enrollment.permissions').ENROLLMENT_PERMISSIONS,
  ATTENDANCE: require('./attendance/attendance.permissions').ATTENDANCE_PERMISSIONS,
  ATTENDANCE_CONFIG: require('./attendance-config/attendance-config.permissions').ATTENDANCE_CONFIG_PERMISSIONS,
  ATTENDANCE_STATUS: require('./attendance-status/attendance-status.permissions').ATTENDANCE_STATUS_PERMISSIONS,
  ATTENDANCE_PERMISSIONS: require('./attendance-permissions/attendance-permissions.permissions').ATTENDANCE_PERMISSIONS_PERMISSIONS,
  ATTENDANCE_PLANT: require('./attendance-plant/attendance-plant.permissions').ATTENDANCE_PLANT_PERMISSIONS,
  SIGNATURES: require('./signatures/signatures.permissions').SIGNATURES_PERMISSIONS,
  ASSIGNMENTS: require('./assignments/assignments.permissions').ASSIGNMENTS_PERMISSIONS,
  NOTIFICATIONS: require('./notifications/notifications.permissions').NOTIFICATIONS_PERMISSIONS,
  NEWS: require('./news/news.permissions').NEWS_PERMISSIONS,
  ERICA_HISTORY: require('./erica-history/erica-history.permissions').ERICA_HISTORY_PERMISSIONS,
} as const;
