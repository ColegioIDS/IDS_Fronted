# Per-Day Schedule Configuration Implementation

## Overview
This document describes the implementation of per-day schedule configuration (Option A) which allows different time slots to be configured for different days of the week.

## Problem Statement
The original ScheduleConfig system used a global array of break slots that applied to all working days. This didn't support scenarios where:
- Different days need different break/lunch schedules
- Special activities need to be scheduled on specific days only
- Dynamic adjustment of daily schedules without creating separate CourseAssignments

## Solution Architecture

### 1. Type System Changes

**File**: `src/types/schedules.types.ts`

#### New Type Definitions:
```typescript
export type SlotType = 'activity' | 'break' | 'lunch' | 'free' | 'class' | 'custom';

export interface ScheduleSlot {
  start: string;              // "HH:MM"
  end: string;                // "HH:MM"
  label: string;              // "RECREO", "ALMUERZO", etc.
  type: SlotType;             // Type of slot
  isClass?: boolean;          // If true, counts as class time (doesn't reduce available classes)
  description?: string;       // Optional description
}

export interface ScheduleConfig {
  // ... existing fields ...
  breakSlots: Record<string, ScheduleSlot[]>; // Key: day number (1-7), Value: slots for that day
}
```

### 2. Time Generation Updates

**File**: `src/types/schedules.types.ts`

#### ScheduleTimeGenerator Class:
- **New Method**: `generateTimeSlotsForDay(config: ScheduleConfig, day: DayOfWeek): TimeSlot[]`
  - Generates time slots for a specific day
  - Respects per-day slot configuration
  - Handles overlapping slots correctly
  - Marks slots based on `isClass` flag
  
- **Backward Compatibility**: `generateTimeSlots(config: ScheduleConfig): TimeSlot[]`
  - Uses first working day as default
  - Ensures existing code continues to work

### 3. Conversion Utilities

**File**: `src/utils/scheduleConfigConverter.ts` (NEW)

Key functions:
- `convertOldConfigToNew(config)` - Converts legacy array format to new Record format
- `initializeBreakSlotsForDays(workingDays, slots)` - Creates per-day slot structure
- `getSlotsForDay(breakSlots, day)` - Gets slots for specific day
- `updateSlotsForDay(breakSlots, day, slots)` - Updates slots for day
- `applySlotsToDays(breakSlots, days, slots)` - Copies slots to multiple days
- `addSlotToDay(breakSlots, day, slot)` - Adds single slot to day
- `removeSlotFromDay(breakSlots, day, index)` - Removes slot by index
- `updateSlotInDay(breakSlots, day, index, updates)` - Updates specific slot
- `copySlotsBetweenDays(breakSlots, sourceDay, targetDays)` - Copies between days

### 4. Modal Component Updates

**File**: `src/components/features/schedules/calendar/ScheduleConfigModal.tsx`

#### State Changes:
```typescript
const [formData, setFormData] = useState({
  workingDays: [1, 2, 3, 4, 5] as DayOfWeek[],
  startTime: '07:00',
  endTime: '17:00',
  classDuration: 45,
  breakSlots: {} as Record<string, ScheduleSlot[]>, // NEW: Record format
});

const [selectedDay, setSelectedDay] = useState<DayOfWeek>(1);
```

#### Handlers:
- `handleAddSlotToDay()` - Adds new slot to selected day
- `handleRemoveSlotFromDay(index)` - Removes slot from selected day
- `handleUpdateSlot(index, field, value)` - Updates slot property (start, end, label, type, isClass, description)
- `handleCopySlotsToAllDays()` - Copies current day slots to all working days
- `handleCopySlotsToOtherDays(targetDays)` - Copies to specific days
- `calculateTotalSlotsForDay(day)` - Calculates available class slots (respects isClass flag)

#### UI Features:
- **Day Tabs**: Switch between days to configure their slots individually
- **Slot Editor**: 
  - Start/end time inputs
  - Label field (RECREO, ALMUERZO, etc.)
  - Type dropdown (activity, break, lunch, free, class, custom)
  - "Is Class" checkbox - if checked, slot counts as class time
  - Delete button per slot
- **Copy Options**: 
  - Copy all slots from current day to all other working days
  - Copy to specific days (future enhancement)

#### Validation (in handleSave):
- Validates all working days have valid slots
- Checks for slot overlap within each day
- Ensures slots are within working hours
- Verifies slot end time > start time
- Friendly error messages with day names

### 5. Backward Compatibility

The implementation includes automatic conversion:

```typescript
// Old format loaded from database
const oldConfig = {
  breakSlots: [
    { start: "10:00", end: "10:15", label: "RECREO" },
    { start: "13:15", end: "14:00", label: "ALMUERZO" }
  ]
};

// Automatically converted to new format
const newConfig = convertOldConfigToNew(oldConfig);
// Result: breakSlots: { "1": [...slots], "2": [...slots], ... }
```

## Implementation Flow

### 1. Creating New Schedule Config
```
User clicks "Configurar Horario"
  → ScheduleConfigModal opens
  → User selects working days
  → User configures start/end times and class duration
  → User selects day tab
  → User adds slots for that day (RECREO, ALMUERZO, etc.)
  → User can copy to all days or other specific days
  → User clicks Save
  → Modal validates all days
  → Config is saved to database
```

### 2. Editing Existing Config
```
User clicks "Editar Configuración"
  → Modal opens with current config
  → If config is old format, convertOldConfigToNew() is called
  → UI shows current settings
  → User switches between day tabs
  → User can add/remove/modify slots per day
  → User clicks Save
  → Validation runs
  → Config is updated in database
```

### 3. Using Config in Schedule Grid
```
SchedulesPageContent loads config
  → If old format, convertOldConfigToNew() is called
  → ScheduleTimeGenerator.generateTimeSlots(config) is called
  → Returns time slots for first working day
  → (Future: should use generateTimeSlotsForDay for each day)
  → ScheduleGrid displays time slots
```

## Database Considerations

### Migration Strategy
When deploying to production:
1. Add migration to update ScheduleConfig schema
2. Add data migration to convert existing configs:
   ```typescript
   existing configs where breakSlots is array
   → convert to { "1": [...], "2": [...], ... }
   ```
3. Run migrations on production database
4. Deploy updated application code

### Schema Change
```
Before:
breakSlots: BreakSlot[]

After:
breakSlots: Record<string, ScheduleSlot[]>
```

## Usage Examples

### Example 1: Standard Schedule (Mon-Fri same)
```json
{
  "workingDays": [1, 2, 3, 4, 5],
  "startTime": "07:00",
  "endTime": "17:00",
  "classDuration": 45,
  "breakSlots": {
    "1": [
      { start: "10:00", end: "10:15", label: "RECREO", type: "break" },
      { start: "13:15", end: "14:00", label: "ALMUERZO", type: "lunch" }
    ],
    "2": [...same as Monday...],
    "3": [...same as Monday...],
    "4": [...same as Monday...],
    "5": [
      { start: "10:00", end: "10:15", label: "RECREO", type: "break" },
      { start: "13:00", end: "13:30", label: "CLASE", type: "class", isClass: true },
      // No almuerzo on Friday, class slot instead
    ]
  }
}
```

### Example 2: With Special Activities
```json
{
  "workingDays": [1, 2, 3, 4, 5],
  "breakSlots": {
    "1": [...regular slots...],
    "2": [...regular slots...],
    "3": [...regular slots...],
    "4": [...regular slots...],
    "5": [
      { start: "07:30", end: "08:00", label: "ACTIVIDAD CÍVICA", type: "activity" },
      // ... other slots ...
    ]
  }
}
```

## Testing Checklist

- [ ] Create new config with day-specific slots
- [ ] Edit existing config (old format auto-converts)
- [ ] Copy slots between days works
- [ ] Validation catches overlapping slots per day
- [ ] Validation catches slots outside working hours
- [ ] Schedule grid displays correctly with new config
- [ ] calculateTotalSlotsForDay respects isClass flag
- [ ] Old configs continue to work after migration
- [ ] Preset loading works with new format

## Future Enhancements

1. **Per-Day UI Improvements**:
   - Visual timeline showing slots
   - Drag-to-resize slots in UI
   - Template copying between days

2. **Advanced Features**:
   - Recurring patterns (e.g., "same as Monday")
   - Holiday/special date exceptions
   - Multiple schedule presets per school
   - Import/export functionality

3. **Performance**:
   - Cache time slot generation
   - Lazy load slot configuration
   - Optimize grid rendering for multiple days

4. **Backend Integration**:
   - API updates to handle new format
   - Batch operations for schedule changes
   - Audit logging for config changes

## Files Modified

1. **src/types/schedules.types.ts**
   - Added SlotType, updated ScheduleSlot interface
   - Updated ScheduleConfig.breakSlots type
   - Updated ScheduleTimeGenerator class
   - Updated DTOs

2. **src/utils/scheduleConfigConverter.ts** (NEW)
   - 8 conversion/utility functions

3. **src/components/features/schedules/calendar/ScheduleConfigModal.tsx**
   - Updated state to use Record<string, ScheduleSlot[]>
   - Added day selector and per-day editor UI
   - Rewrote all handlers for per-day operations
   - Updated validation logic

## Rollback Plan

If issues arise:
1. Revert code changes to previous version
2. Run reverse data migration to convert back to array format
3. Reset application
4. Notify users of configuration reset if needed

