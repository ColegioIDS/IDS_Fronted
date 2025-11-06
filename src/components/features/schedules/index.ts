// src/components/features/schedules/index.ts
// ============================================================================
// 📅 Schedules Module - Exports
// ============================================================================
// Centralized exports for the schedules module
// ============================================================================

// Main component
export { default as SchedulesPageContent } from './SchedulesPageContent';

// Calendar components
export { ScheduleGrid } from './calendar/ScheduleGrid';
export { ScheduleHeader } from './calendar/ScheduleHeader';
export { ScheduleSidebar } from './calendar/ScheduleSidebar';
export { DroppableTimeSlot } from './calendar/DroppableTimeSlot';
export { ScheduleConfigModal } from './calendar/ScheduleConfigModal';

// Draggable components
/* export { DraggableCourseAssignment } from './draggable/DraggableCourseAssignment.js';
export { DraggableSchedule } from './draggable/DraggableSchedule.js'; */

// Re-export commonly needed types for convenience
export type {
  Schedule,
  ScheduleFormValues,
  ScheduleConfig,
  CreateScheduleConfigDto,
  UpdateScheduleConfigDto,
  CourseAssignment,
  DayOfWeek,
  TimeSlot,
  ScheduleChange,
} from '@/types/schedules.types';

// Re-export hook
export { useSchedules } from '@/hooks/useSchedules';

