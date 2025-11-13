/**
 * ============================
 * FASE 3 - UI COMPONENTS (v2)
 * ============================
 * 
 * Clean component implementations using FASE 2 hooks
 * All components are fully typed and production-ready
 */

// Main container
export { default as AttendanceManager } from './AttendanceManager';

// Header components
export { default as AttendanceHeader } from './header/AttendanceHeader';
export { default as DatePicker } from './header/DatePicker';
export { default as GradeSelector } from './header/GradeSelector';
export { default as SectionSelector } from './header/SectionSelector';

// Table components
export { default as AttendanceTable } from './table/AttendanceTable';

// State components
export { default as ErrorState } from './states/ErrorState';
export { default as LoadingState } from './states/LoadingState';
export { default as EmptyState } from './states/EmptyState';
export { default as HolidayNotice } from './states/HolidayNotice';
