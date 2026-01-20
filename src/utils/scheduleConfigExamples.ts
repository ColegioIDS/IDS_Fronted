/**
 * Example: Per-Day Schedule Configuration
 * 
 * This file demonstrates the new ScheduleConfig structure that supports
 * different time slots for different days of the week.
 */

import type { ScheduleConfig, DayOfWeek } from '@/types/schedules.types';

/**
 * Example 1: Standard 5-day schedule (Lun-Vie)
 * Same break schedule for all working days
 */
export const EXAMPLE_STANDARD_CONFIG: ScheduleConfig = {
  id: 1,
  sectionId: 101,
  workingDays: [1, 2, 3, 4, 5] as DayOfWeek[],
  startTime: "07:00",
  endTime: "17:00",
  classDuration: 45,
  breakSlots: {
    "1": [ // Monday
      { start: "10:00", end: "10:15", label: "RECREO", type: "break", isClass: false },
      { start: "13:15", end: "14:00", label: "ALMUERZO", type: "lunch", isClass: false }
    ],
    "2": [ // Tuesday (same as Monday)
      { start: "10:00", end: "10:15", label: "RECREO", type: "break", isClass: false },
      { start: "13:15", end: "14:00", label: "ALMUERZO", type: "lunch", isClass: false }
    ],
    "3": [ // Wednesday (same as Monday)
      { start: "10:00", end: "10:15", label: "RECREO", type: "break", isClass: false },
      { start: "13:15", end: "14:00", label: "ALMUERZO", type: "lunch", isClass: false }
    ],
    "4": [ // Thursday (same as Monday)
      { start: "10:00", end: "10:15", label: "RECREO", type: "break", isClass: false },
      { start: "13:15", end: "14:00", label: "ALMUERZO", type: "lunch", isClass: false }
    ],
    "5": [ // Friday (same as Monday)
      { start: "10:00", end: "10:15", label: "RECREO", type: "break", isClass: false },
      { start: "13:15", end: "14:00", label: "ALMUERZO", type: "lunch", isClass: false }
    ]
  },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
};

/**
 * Example 2: Complex schedule with different configurations per day
 * 
 * - Mon-Jue: Regular breaks and lunch
 * - Viernes: Class instead of lunch + special activity
 * - Saturday: Shorter day, only one break
 */
export const EXAMPLE_COMPLEX_CONFIG: ScheduleConfig = {
  id: 2,
  sectionId: 102,
  workingDays: [1, 2, 3, 4, 5, 6] as DayOfWeek[],
  startTime: "07:00",
  endTime: "18:00",
  classDuration: 50,
  breakSlots: {
    "1": [ // Monday
      { start: "09:30", end: "09:45", label: "RECREO", type: "break", isClass: false },
      { start: "13:00", end: "14:00", label: "ALMUERZO", type: "lunch", isClass: false },
      { start: "15:30", end: "15:45", label: "RECREO", type: "break", isClass: false }
    ],
    "2": [ // Tuesday (same as Monday)
      { start: "09:30", end: "09:45", label: "RECREO", type: "break", isClass: false },
      { start: "13:00", end: "14:00", label: "ALMUERZO", type: "lunch", isClass: false },
      { start: "15:30", end: "15:45", label: "RECREO", type: "break", isClass: false }
    ],
    "3": [ // Wednesday (same as Monday)
      { start: "09:30", end: "09:45", label: "RECREO", type: "break", isClass: false },
      { start: "13:00", end: "14:00", label: "ALMUERZO", type: "lunch", isClass: false },
      { start: "15:30", end: "15:45", label: "RECREO", type: "break", isClass: false }
    ],
    "4": [ // Thursday (same as Monday)
      { start: "09:30", end: "09:45", label: "RECREO", type: "break", isClass: false },
      { start: "13:00", end: "14:00", label: "ALMUERZO", type: "lunch", isClass: false },
      { start: "15:30", end: "15:45", label: "RECREO", type: "break", isClass: false }
    ],
    "5": [ // Friday (DIFFERENT: Class instead of lunch + ACTIVIDAD CÍVICA)
      { start: "09:30", end: "09:45", label: "RECREO", type: "break", isClass: false },
      { start: "13:00", end: "13:30", label: "CLASE ESPECIAL", type: "class", isClass: true }, // Counts as class time!
      { start: "13:30", end: "14:00", label: "ACTIVIDAD CÍVICA", type: "activity", isClass: false },
      { start: "15:30", end: "15:45", label: "RECREO", type: "break", isClass: false }
    ],
    "6": [ // Saturday (Shorter day)
      { start: "09:30", end: "09:45", label: "RECREO", type: "break", isClass: false },
      { start: "12:00", end: "13:00", label: "ALMUERZO", type: "lunch", isClass: false }
    ]
  },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
};

/**
 * Example 3: Intensive morning schedule with activities
 * 
 * Short working day with special morning activity assembly
 */
export const EXAMPLE_INTENSIVE_CONFIG: ScheduleConfig = {
  id: 3,
  sectionId: 103,
  workingDays: [1, 2, 3, 4, 5] as DayOfWeek[],
  startTime: "07:30",
  endTime: "13:00",
  classDuration: 50,
  breakSlots: {
    "1": [ // Monday (Regular day)
      { start: "09:00", end: "09:15", label: "RECREO", type: "break", isClass: false },
      { start: "11:00", end: "11:30", label: "ALMUERZO", type: "lunch", isClass: false }
    ],
    "2": [ // Tuesday (Assembly day - different from others!)
      { start: "07:30", end: "08:00", label: "ASAMBLEA CÍVICA", type: "activity", isClass: false },
      { start: "09:00", end: "09:15", label: "RECREO", type: "break", isClass: false },
      { start: "11:00", end: "11:30", label: "ALMUERZO", type: "lunch", isClass: false }
    ],
    "3": [ // Wednesday (Regular day)
      { start: "09:00", end: "09:15", label: "RECREO", type: "break", isClass: false },
      { start: "11:00", end: "11:30", label: "ALMUERZO", type: "lunch", isClass: false }
    ],
    "4": [ // Thursday (Regular day)
      { start: "09:00", end: "09:15", label: "RECREO", type: "break", isClass: false },
      { start: "11:00", end: "11:30", label: "ALMUERZO", type: "lunch", isClass: false }
    ],
    "5": [ // Friday (Regular day)
      { start: "09:00", end: "09:15", label: "RECREO", type: "break", isClass: false },
      { start: "11:00", end: "11:30", label: "ALMUERZO", type: "lunch", isClass: false }
    ]
  },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
};

/**
 * Example 4: Old format config (backward compatibility)
 * 
 * This is the old format that will be automatically converted
 * to the new per-day format when loaded
 */
export const EXAMPLE_OLD_FORMAT_CONFIG = {
  id: 4,
  sectionId: 104,
  workingDays: [1, 2, 3, 4, 5],
  startTime: "07:00",
  endTime: "17:00",
  classDuration: 45,
  breakSlots: [ // OLD FORMAT: Array instead of Record
    { start: "10:00", end: "10:15", label: "RECREO" },
    { start: "13:15", end: "14:00", label: "ALMUERZO" }
  ],
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z"
};

/**
 * How to use these examples:
 * 
 * 1. Creating a new config:
 *    - Use the ScheduleConfigModal
 *    - Select working days
 *    - Configure start/end times and class duration
 *    - Switch to each day tab
 *    - Add slots for that day
 *    - Save
 * 
 * 2. Converting old config:
 *    ```typescript
 *    import { convertOldConfigToNew } from '@/utils/scheduleConfigConverter';
 *    
 *    const newConfig = convertOldConfigToNew(EXAMPLE_OLD_FORMAT_CONFIG);
 *    // Now newConfig.breakSlots is in new Record format
 *    ```
 * 
 * 3. Copying slots between days:
 *    ```typescript
 *    import { applySlotsToDays } from '@/utils/scheduleConfigConverter';
 *    
 *    const mondaySlots = [
 *      { start: "10:00", end: "10:15", label: "RECREO", type: "break", isClass: false },
 *      { start: "13:15", end: "14:00", label: "ALMUERZO", type: "lunch", isClass: false }
 *    ];
 *    
 *    // Copy Monday slots to all other days
 *    const updatedBreakSlots = applySlotsToDays(
 *      config.breakSlots,
 *      [2, 3, 4, 5], // Days to apply to
 *      mondaySlots
 *    );
 *    ```
 * 
 * 4. Generating time slots for a specific day:
 *    ```typescript
 *    import { ScheduleTimeGenerator } from '@/types/schedules.types';
 *    
 *    const fridaySlots = ScheduleTimeGenerator.generateTimeSlotsForDay(config, 5);
 *    // Returns TimeSlot[] for Friday with proper handling of per-day configuration
 *    ```
 * 
 * Key differences from old format:
 * 
 * OLD:
 * - breakSlots: BreakSlot[] (same for all days)
 * - Limited flexibility for per-day customization
 * - Special days required duplicate configs
 * 
 * NEW:
 * - breakSlots: Record<string, ScheduleSlot[]> (per-day configuration)
 * - Full flexibility for different daily schedules
 * - New field: type (activity, break, lunch, free, class, custom)
 * - New field: isClass (distinguishes between classes and breaks)
 * - New field: description (optional additional info)
 * - Automatic conversion for existing configs
 * 
 */
