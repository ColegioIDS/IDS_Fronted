/**
 * Utility functions to convert between old and new ScheduleConfig formats
 */

import type { ScheduleConfig, ScheduleSlot, DayOfWeek } from '@/types/schedules.types';

/**
 * Convert old format (breakSlots: []) to new format (breakSlots: { "1": [], "2": [] })
 * Used for backward compatibility when loading existing configs
 */
export function convertOldConfigToNew(config: any): ScheduleConfig {
  if (!config) return config;
  
  // If already in new format (Record with numeric string keys), return as-is
  if (config.breakSlots && typeof config.breakSlots === 'object' && !Array.isArray(config.breakSlots)) {
    // Check if it has any numeric string keys (1-7)
    const keys = Object.keys(config.breakSlots);
    if (keys.length > 0 && keys.some(k => !isNaN(Number(k)))) {
      return config;
    }
  }

  // If in old format (array), convert to new format
  if (config.breakSlots && Array.isArray(config.breakSlots)) {
    const newBreakSlots: Record<string, ScheduleSlot[]> = {};

    // Apply the same slots to all working days
    config.workingDays.forEach((day: DayOfWeek) => {
      newBreakSlots[day.toString()] = config.breakSlots.map((slot: any) => ({
        start: slot.start,
        end: slot.end,
        label: slot.label || 'BREAK',
        type: slot.type || 'break',
        isClass: slot.isClass ?? false,
        description: slot.description,
      }));
    });

    return {
      ...config,
      breakSlots: newBreakSlots,
    };
  }

  // If no breakSlots, initialize empty
  return {
    ...config,
    breakSlots: {},
  };
}

/**
 * Initialize breakSlots for all working days with default values
 */
export function initializeBreakSlotsForDays(
  workingDays: DayOfWeek[],
  defaultSlots: ScheduleSlot[] = []
): Record<string, ScheduleSlot[]> {
  const breakSlots: Record<string, ScheduleSlot[]> = {};

  workingDays.forEach((day) => {
    breakSlots[day.toString()] = defaultSlots.map((slot) => ({ ...slot }));
  });

  return breakSlots;
}

/**
 * Get slots for a specific day
 */
export function getSlotsForDay(
  breakSlots: Record<string, ScheduleSlot[]>,
  day: DayOfWeek
): ScheduleSlot[] {
  return breakSlots[day.toString()] || [];
}

/**
 * Update slots for a specific day
 */
export function updateSlotsForDay(
  breakSlots: Record<string, ScheduleSlot[]>,
  day: DayOfWeek,
  slots: ScheduleSlot[]
): Record<string, ScheduleSlot[]> {
  return {
    ...breakSlots,
    [day.toString()]: slots,
  };
}

/**
 * Add a slot to a specific day
 */
export function addSlotToDay(
  breakSlots: Record<string, ScheduleSlot[]>,
  day: DayOfWeek,
  slot: ScheduleSlot
): Record<string, ScheduleSlot[]> {
  const currentSlots = getSlotsForDay(breakSlots, day);
  return updateSlotsForDay(breakSlots, day, [...currentSlots, slot]);
}

/**
 * Remove a slot from a specific day by index
 */
export function removeSlotFromDay(
  breakSlots: Record<string, ScheduleSlot[]>,
  day: DayOfWeek,
  index: number
): Record<string, ScheduleSlot[]> {
  const currentSlots = getSlotsForDay(breakSlots, day);
  return updateSlotsForDay(
    breakSlots,
    day,
    currentSlots.filter((_, i) => i !== index)
  );
}

/**
 * Update a specific slot in a day
 */
export function updateSlotInDay(
  breakSlots: Record<string, ScheduleSlot[]>,
  day: DayOfWeek,
  index: number,
  updates: Partial<ScheduleSlot>
): Record<string, ScheduleSlot[]> {
  const currentSlots = getSlotsForDay(breakSlots, day);
  const updated = currentSlots.map((slot, i) =>
    i === index ? { ...slot, ...updates } : slot
  );
  return updateSlotsForDay(breakSlots, day, updated);
}

/**
 * Copy slots from one day to another
 */
export function copySlotsBetweenDays(
  breakSlots: Record<string, ScheduleSlot[]>,
  fromDay: DayOfWeek,
  toDays: DayOfWeek[]
): Record<string, ScheduleSlot[]> {
  const sourceSlots = getSlotsForDay(breakSlots, fromDay);
  let result = { ...breakSlots };

  toDays.forEach((day) => {
    result = updateSlotsForDay(result, day, sourceSlots.map((slot) => ({ ...slot })));
  });

  return result;
}

/**
 * Apply slots to multiple days at once
 */
export function applySlotsToDays(
  breakSlots: Record<string, ScheduleSlot[]>,
  days: DayOfWeek[],
  slots: ScheduleSlot[]
): Record<string, ScheduleSlot[]> {
  let result = { ...breakSlots };

  days.forEach((day) => {
    result = updateSlotsForDay(result, day, slots.map((slot) => ({ ...slot })));
  });

  return result;
}
