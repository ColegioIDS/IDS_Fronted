// Hooks de clases y configuración general del dashboard
export {
  useDashboardClasses,
  useTodayClasses,
  useScheduleGrid,
  useScheduleWeekly,
  useAttendanceReport,
  useDailyAttendanceReport,
  useWeeklyAttendanceReport,
  useBimestralAttendanceReport,
  useTeacherProfile,
} from './useDashboardClasses';

// Hooks para docentes titulares
export { useTopStudents } from './useTopStudents';

// Hooks para ambos tipos de docentes
export { usePendingTasks } from './usePendingTasks';
export { useBirthdays } from './useBirthdays';
