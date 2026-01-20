// src/types/schedules.types.ts
// ============================================================================
// 📅 Consolidated Schedules Module Types
// ============================================================================
// Single source of truth for all schedule-related data structures.
// Consolidates Schedule, ScheduleConfig, CourseAssignment types.
// ============================================================================

// ============================================================================
// 🔢 ENUMS & CONSTANTS
// ============================================================================

/** Days of week (1=Monday, 7=Sunday following ISO 8601) */
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** All days of week in order (numeric array) */
export const ALL_DAYS_OF_WEEK_NUMBERS: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 7];

/** Day names mapping */
export const DAY_NAMES: Record<DayOfWeek, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
};

/** Day short labels mapping */
export const DAY_SHORT_LABELS: Record<DayOfWeek, string> = {
  1: 'LUN',
  2: 'MAR',
  3: 'MIÉ',
  4: 'JUE',
  5: 'VIE',
  6: 'SÁB',
  7: 'DOM',
};

/** Day objects with value, label, and shortLabel for UI components */
export interface DayObject {
  value: DayOfWeek;
  label: string;
  shortLabel: string;
}

export const ALL_DAYS_OF_WEEK: DayObject[] = [
  { value: 1, label: 'Lunes', shortLabel: 'LUN' },
  { value: 2, label: 'Martes', shortLabel: 'MAR' },
  { value: 3, label: 'Miércoles', shortLabel: 'MIÉ' },
  { value: 4, label: 'Jueves', shortLabel: 'JUE' },
  { value: 5, label: 'Viernes', shortLabel: 'VIE' },
  { value: 6, label: 'Sábado', shortLabel: 'SÁB' },
  { value: 7, label: 'Domingo', shortLabel: 'DOM' },
];

// ============================================================================
// ⏰ TIME SLOTS
// ============================================================================

/**
 * Time slot configuration for schedule grid
 */
export interface TimeSlot {
  start: string;      // Format: "HH:MM"
  end: string;        // Format: "HH:MM"
  label?: string;     // Display label
  isBreak?: boolean;  // Is this a break/recreation slot?
}

/** Default time slots (7:00 AM - 5:00 PM) */
export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { start: "07:00", end: "07:45", label: "07:00 - 07:45" },
  { start: "07:45", end: "08:30", label: "07:45 - 08:30" },
  { start: "08:30", end: "09:15", label: "08:30 - 09:15" },
  { start: "09:15", end: "10:00", label: "09:15 - 10:00" },
  { start: "10:00", end: "10:15", label: "RECREO", isBreak: true },
  { start: "10:15", end: "11:00", label: "10:15 - 11:00" },
  { start: "11:00", end: "11:45", label: "11:00 - 11:45" },
  { start: "11:45", end: "12:30", label: "11:45 - 12:30" },
  { start: "12:30", end: "13:15", label: "12:30 - 13:15" },
  { start: "13:15", end: "14:00", label: "ALMUERZO", isBreak: true },
  { start: "14:00", end: "14:45", label: "14:00 - 14:45" },
  { start: "14:45", end: "15:30", label: "14:45 - 15:30" },
  { start: "15:30", end: "16:15", label: "15:30 - 16:15" },
  { start: "16:15", end: "17:00", label: "16:15 - 17:00" },
];

// ============================================================================
// 📋 SCHEDULE CONFIG TYPES
// ============================================================================

/**
 * Slot type for scheduling
 */
export type SlotType = 'activity' | 'break' | 'lunch' | 'free' | 'class' | 'custom';

/**
 * Schedule slot configuration (per day)
 * Can be a break, lunch, activity, or class
 */
export interface ScheduleSlot {
  start: string;              // Format: "HH:MM" (e.g., "09:00")
  end: string;                // Format: "HH:MM" (e.g., "09:15")
  label: string;              // Label (e.g., "RECREO", "ALMUERZO", "ACTIVIDAD CÍVICA")
  type: SlotType;             // Type of slot
  isClass?: boolean;          // If true, counts towards class duration (default: false)
  description?: string;       // Optional description
}

/**
 * Break/Recreation slot configuration (legacy, kept for compatibility)
 */
export interface BreakSlot extends ScheduleSlot {
  // Backward compatibility - ScheduleSlot is the new name
}

/**
 * Schedule configuration for a section (1:1 relationship)
 * Now supports per-day configuration
 */
export interface ScheduleConfig {
  id: number;
  sectionId: number;
  workingDays: DayOfWeek[];
  startTime: string;                          // Format: "HH:MM"
  endTime: string;                            // Format: "HH:MM"
  classDuration: number;                      // Minutes (e.g., 45)
  breakSlots: Record<string, ScheduleSlot[]>; // Key: day number (1-7), Value: slots for that day
  createdAt: string;                          // ISO 8601
  updatedAt: string;                          // ISO 8601
}

/**
 * DTO for creating ScheduleConfig
 */
export interface CreateScheduleConfigDto {
  sectionId: number;
  workingDays: DayOfWeek[];
  startTime: string;
  endTime: string;
  classDuration: number;
  breakSlots?: Record<string, ScheduleSlot[]>;
}

/**
 * DTO for updating ScheduleConfig
 */
export interface UpdateScheduleConfigDto {
  workingDays?: DayOfWeek[];
  startTime?: string;
  endTime?: string;
  classDuration?: number;
  breakSlots?: Record<string, ScheduleSlot[]>;
}

// ============================================================================
// 📚 SCHEDULE TYPES
// ============================================================================

/**
 * Individual schedule entry
 * CRITICAL: courseAssignmentId is the PRIMARY identifier
 */
export interface Schedule {
  id: number;
  courseAssignmentId: number;  // PRIMARY KEY
  teacherId: number;           // Can differ (substitutions)
  sectionId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;           // Format: "HH:MM"
  endTime: string;             // Format: "HH:MM"
  classroom?: string | null;
  createdAt: string;           // ISO 8601
  updatedAt: string;           // ISO 8601
  courseAssignment?: CourseAssignment;
  section?: {
    id: number;
    name: string;
    gradeId: number;
  };
}

/**
 * Form values for creating/updating schedule
 */
export interface ScheduleFormValues {
  courseAssignmentId: number;  // REQUIRED
  teacherId?: number | null;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  classroom?: string;
}

/**
 * Temporary schedule (unsaved, in drag-drop)
 */
export interface TempSchedule {
  id: string;                  // Temporary ID (UUID or "temp_" + timestamp)
  courseAssignmentId: number;
  teacherId: number;
  sectionId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  classroom?: string | null;
  isPending: boolean;
}

/**
 * Change record for batch operations
 */
export interface ScheduleChange {
  action: 'create' | 'update' | 'delete';
  schedule: Schedule | TempSchedule;
  originalSchedule?: Schedule;
}

/**
 * Result of batch save operation
 * New structure: success flag + data object with stats and items
 */
export interface BatchSaveResult {
  success: boolean;
  message: string;
  data: {
    stats: {
      created: number;
      updated: number;
      deleted: number;
      errors: number;
    };
    items: {
      created: Schedule[];
      updated: Schedule[];
      deleted: number[];
      errors: Array<{
        itemId: string | number;
        error: string;
        details?: string[];
      }>;
    };
  };
}

// ============================================================================
// 👨‍💼 COURSE ASSIGNMENT TYPES
// ============================================================================

/**
 * Assignment of teacher to course in a section
 * This is what gets dragged into schedule slots
 */
export interface CourseAssignment {
  id: number;
  sectionId: number;
  courseId: number;
  teacherId: number;
  assignmentType: AssignmentType;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: number;
    name: string;
    code: string;
    color?: string | null;
  };
  teacher?: {
    id: number;
    givenNames: string;
    lastNames: string;
    email?: string;
  };
}

export type AssignmentType = 'titular' | 'apoyo' | 'temporal' | 'suplente';

// ============================================================================
// 🎨 UI/DRAG-DROP TYPES
// ============================================================================

/**
 * Item being dragged
 */
export interface DragItem {
  id: number;
  type: 'courseAssignment' | 'schedule';
  courseAssignmentId?: number;
  courseName?: string;
  teacherName?: string;
}



/**
 * Drag & drop state
 */
export interface DragState {
  isDragging: boolean;
  dragItem: DragItem | null;
  dragElement: HTMLElement | null;
  startPosition: { x: number; y: number };
}

// ============================================================================
// 🏫 RELATED TYPES
// ============================================================================

export interface Section {
  id: number;
  name: string;
  capacity: number;
  gradeId: number;
  teacherId?: number | null;
  courseAssignments?: CourseAssignment[];  // Nested for convenience
}

export interface Grade {
  id: number;
  name: string;
  level: string;
  order: number;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  area?: string | null;
  color?: string | null;
  isCore: boolean;
}

export interface Teacher {
  id: number;
  givenNames: string;
  lastNames: string;
  email?: string;
}

export interface SchoolCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// ============================================================================
// 📊 FORM DATA & AVAILABILITY TYPES
// ============================================================================

/**
 * Consolidated data for schedule form
 * Structure C: Clean mapping with gradeCycles junction table
 * 
 * Allows flexible filtering:
 * - Ciclo → (buscar en gradeCycles) → Grados → Secciones
 * - Ciclo + Grado → Secciones del grado
 * - Sección directa
 */
export interface ScheduleFormData {
  activeCycle?: SchoolCycle;
  cycles: SchoolCycle[];
  gradeCycles: Array<{ cycleId: number; gradeId: number }>;
  grades: Grade[];
  sections: Section[];
  scheduleConfigs: ScheduleConfig[];
  existingSchedules: Schedule[];
}

/**
 * Teacher availability/conflicts
 */
export interface TeacherAvailability {
  [teacherId: number]: {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
  }[];
}

// ============================================================================
// 🔍 QUERY & FILTER TYPES
// ============================================================================

export interface ScheduleConfigQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'sectionId' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ScheduleFilters {
  sectionId?: number;
  courseAssignmentId?: number;
  teacherId?: number;
  dayOfWeek?: DayOfWeek;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedScheduleConfigs {
  data: ScheduleConfig[];
  meta: PaginationMeta;
}

// ============================================================================
// ⚠️ CONFLICT/VALIDATION TYPES
// ============================================================================

export interface TimeConflict {
  type: 'teacher' | 'classroom';
  teacherId?: number;
  classroom?: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  message: string;
}

export interface ScheduleValidationError {
  field: string;
  message: string;
  code: string;
}

// ============================================================================
// 🎯 HELPERS & UTILITIES
// ============================================================================

/**
 * Generate time slots based on ScheduleConfig
 * Now supports per-day configuration
 */
export class ScheduleTimeGenerator {
  /**
   * Generate time slots for a specific day
   * @param config - ScheduleConfig
   * @param day - DayOfWeek (1-7)
   */
  static generateTimeSlotsForDay(config: ScheduleConfig, day: DayOfWeek): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const [startHour, startMin] = config.startTime.split(':').map(Number);
    const [endHour, endMin] = config.endTime.split(':').map(Number);

    let currentHours = startHour;
    let currentMins = startMin;
    const endTotalMins = endHour * 60 + endMin;

    // Get slots for this specific day
    const daySlotsRecord = config.breakSlots as Record<string, ScheduleSlot[]>;
    const daySlots = daySlotsRecord[day.toString()] || [];

    while (currentHours * 60 + currentMins < endTotalMins) {
      const nextMins = currentMins + config.classDuration;
      const nextHours = currentHours + Math.floor(nextMins / 60);
      const nextTotalMins = nextHours * 60 + (nextMins % 60);

      if (nextTotalMins > endTotalMins) break;

      const startStr = `${String(currentHours).padStart(2, '0')}:${String(currentMins).padStart(2, '0')}`;
      const endStr = `${String(nextHours).padStart(2, '0')}:${String(nextMins % 60).padStart(2, '0')}`;

      const slotStartMins = currentHours * 60 + currentMins;
      const slotEndMins = nextTotalMins;

      // Check if this slot overlaps with any slot for this day (including classes)
      const overlappingSlot = daySlots.find((s) => {
        const [sStartHour, sStartMin] = s.start.split(':').map(Number);
        const [sEndHour, sEndMin] = s.end.split(':').map(Number);
        const slotStartMinsDay = sStartHour * 60 + sStartMin;
        const slotEndMinsDay = sEndHour * 60 + sEndMin;

        return slotStartMins < slotEndMinsDay && slotEndMins > slotStartMinsDay;
      });

      // If it's a class slot or doesn't overlap with any configured slot, add it
      if (!overlappingSlot) {
        slots.push({
          start: startStr,
          end: endStr,
          label: `${startStr} - ${endStr}`,
          isBreak: false,
        });
      }

      currentHours = nextHours;
      currentMins = nextMins % 60;
    }

    // Add all configured slots for this day
    daySlots.forEach((slot) => {
      slots.push({
        start: slot.start,
        end: slot.end,
        label: slot.label,
        isBreak: slot.type !== 'class' && !slot.isClass,
      });
    });

    // Sort slots by start time
    slots.sort((a, b) => {
      const aTime = parseInt(a.start.replace(':', ''));
      const bTime = parseInt(b.start.replace(':', ''));
      return aTime - bTime;
    });

    return slots;
  }

  /**
   * Generate time slots for all working days with per-day configuration
   */
  static generateTimeSlots(config: ScheduleConfig): TimeSlot[] {
    // If breakSlots is a Record, generate slots for each day and merge
    if (config.workingDays && config.workingDays.length > 0) {
      // For per-day config, we need to return the slots for the first day
      // The ScheduleGrid will handle per-day rendering
      return this.generateTimeSlotsForDay(config, config.workingDays[0]);
    }
    
    // Fallback to first day (Monday)
    return this.generateTimeSlotsForDay(config, 1 as DayOfWeek);
  }

  /**
   * Generate time slots for all working days, organized by day
   * Returns Record<DayOfWeek, TimeSlot[]>
   */
  static generateTimeSlotsPerDay(config: ScheduleConfig): Record<number, TimeSlot[]> {
    const slotsByDay: Record<number, TimeSlot[]> = {};
    
    if (!config.workingDays || config.workingDays.length === 0) {
      return slotsByDay;
    }

    // Generate slots for each working day
    config.workingDays.forEach(day => {
      slotsByDay[day] = this.generateTimeSlotsForDay(config, day);
    });

    return slotsByDay;
  }
}

// ============================================================================
// 📤 API RESPONSE TYPES
// ============================================================================

export interface ApiScheduleResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}