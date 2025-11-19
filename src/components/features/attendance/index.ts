// src/components/features/attendance/index.ts
/**
 * Central exports for all attendance-related components and pages
 */

// Grid components
export { default as AttendanceGrid } from './attendance-grid';

// Pages
export { AttendanceBySchedulesPage, AttendanceTeacherPage } from './pages';

// Components
export {
  AttendanceManager,
  AttendanceHeader,
  DatePicker,
  GradeSelector,
  SectionSelector,
  AttendanceTable,
  ErrorState,
  LoadingState,
  EmptyState,
  HolidayNotice,
  StatusSelector,
  ChangeReasonInput,
  ConfirmationModal,
  PermissionGuard,
  CourseSelectionGrid,
  AttendanceStatusSelector,
} from './components';
