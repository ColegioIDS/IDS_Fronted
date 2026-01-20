# Per-Day Schedule Configuration - Developer Guide

## Quick Start

### For End Users (School Administrators)

1. **Creating a New Schedule Configuration**:
   - Click "Configurar Horario" button in the schedules section
   - Select which days are working days (e.g., Mon-Fri)
   - Set start and end times (e.g., 07:00 - 17:00)
   - Set class duration in minutes (e.g., 45)
   - Click on each day tab to configure breaks/activities for that day
   - For each day, click "Agregar Slot" to add breaks, lunch, activities, etc.
   - Fill in: Start time, End time, Label, Type
   - Optional: Check "Es Clase" if the slot should count toward available class time
   - Use "Copiar a Todos los Días" to apply the same slots to all working days
   - Click "Guardar" to save

2. **Common Configurations**:
   - **Standard 5-day (Mon-Fri)**: Use presets or manually create with copy feature
   - **Different Friday schedule**: Add slots to Friday separately before saving
   - **Assembly days**: Add special activities to specific days

### For Developers

#### 1. Understanding the Data Structure

The core data structure changed from:
```typescript
// OLD (Array - same for all days)
breakSlots: [
  { start: "10:00", end: "10:15", label: "RECREO" },
  { start: "13:15", end: "14:00", label: "ALMUERZO" }
]

// NEW (Record - per-day)
breakSlots: {
  "1": [ // Monday
    { start: "10:00", end: "10:15", label: "RECREO", type: "break", isClass: false },
    { start: "13:15", end: "14:00", label: "ALMUERZO", type: "lunch", isClass: false }
  ],
  "2": [ // Tuesday
    { ... }
  ],
  // ... etc for days 3-7
}
```

#### 2. Key Types

```typescript
type SlotType = 'activity' | 'break' | 'lunch' | 'free' | 'class' | 'custom';

interface ScheduleSlot {
  start: string;              // "HH:MM" format
  end: string;                // "HH:MM" format
  label: string;              // Display label
  type: SlotType;             // Type of slot
  isClass?: boolean;          // If true, counts toward class time (not a break)
  description?: string;       // Optional description
}

interface ScheduleConfig {
  id: number;
  sectionId: number;
  workingDays: DayOfWeek[];
  startTime: string;
  endTime: string;
  classDuration: number;
  breakSlots: Record<string, ScheduleSlot[]>; // KEY CHANGE
  createdAt: string;
  updatedAt: string;
}
```

#### 3. Using Conversion Utilities

When dealing with configs loaded from API that might be in old format:

```typescript
import { convertOldConfigToNew, getSlotsForDay } from '@/utils/scheduleConfigConverter';

// Load from API (might be old format)
const config = await fetchScheduleConfig(sectionId);

// Convert if needed (auto-detects format)
const modernConfig = convertOldConfigToNew(config);

// Get slots for a specific day
const fridaySlots = getSlotsForDay(modernConfig.breakSlots, 5); // 5 = Friday

// Update slots for a day
const updatedConfig = {
  ...modernConfig,
  breakSlots: updateSlotsForDay(
    modernConfig.breakSlots,
    5, // Friday
    newSlotsList
  )
};
```

#### 4. Time Slot Generation

The time slot generator now supports per-day configuration:

```typescript
import { ScheduleTimeGenerator } from '@/types/schedules.types';

const config = await fetchScheduleConfig(sectionId);

// Generate slots for a specific day (RECOMMENDED)
const fridaySlots = ScheduleTimeGenerator.generateTimeSlotsForDay(config, 5);

// Or for backward compatibility (uses first working day)
const slots = ScheduleTimeGenerator.generateTimeSlots(config);
```

#### 5. Working with the Modal

The `ScheduleConfigModal` component handles all per-day editing:

```typescript
import { ScheduleConfigModal } from '@/components/features/schedules/calendar/ScheduleConfigModal';

export function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<ScheduleConfig | null>(null);

  const handleSave = async (config: ScheduleConfig) => {
    await saveConfig(config);
    toast.success('Configuration saved!');
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Configure Schedule</Button>
      <ScheduleConfigModal
        isOpen={isOpen}
        sectionId={1}
        sectionName="Section A"
        currentConfig={selectedConfig}
        onSave={handleSave}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
```

## Common Patterns

### Pattern 1: Copy Same Slots to All Days

```typescript
const defaultSlots: ScheduleSlot[] = [
  { start: "10:00", end: "10:15", label: "RECREO", type: "break", isClass: false },
  { start: "13:15", end: "14:00", label: "ALMUERZO", type: "lunch", isClass: false }
];

const breakSlots = applySlotsToDays(
  config.breakSlots,
  config.workingDays, // Apply to all working days
  defaultSlots
);
```

### Pattern 2: Custom Configuration per Day

```typescript
const breakSlots: Record<string, ScheduleSlot[]> = {};

// Monday-Thursday: Regular schedule
const regularSlots: ScheduleSlot[] = [
  { start: "10:00", end: "10:15", label: "RECREO", type: "break", isClass: false },
  { start: "13:15", end: "14:00", label: "ALMUERZO", type: "lunch", isClass: false }
];

[1, 2, 3, 4].forEach(day => {
  breakSlots[day.toString()] = regularSlots;
});

// Friday: Different schedule
breakSlots["5"] = [
  { start: "10:00", end: "10:15", label: "RECREO", type: "break", isClass: false },
  { start: "13:00", end: "13:30", label: "CLASE", type: "class", isClass: true },
];
```

### Pattern 3: Check if Day is Special

```typescript
import { getSlotsForDay } from '@/utils/scheduleConfigConverter';

function isSpecialDay(config: ScheduleConfig, day: DayOfWeek): boolean {
  const slots = getSlotsForDay(config.breakSlots, day);
  
  // Check if has any special activities or classes
  return slots.some(s => s.type === 'activity' || s.isClass);
}
```

### Pattern 4: Calculate Available Classes

```typescript
function getAvailableClasses(config: ScheduleConfig, day: DayOfWeek): number {
  const startTime = new Date(`2000-01-01T${config.startTime}:00`);
  const endTime = new Date(`2000-01-01T${config.endTime}:00`);
  
  const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  
  const slots = getSlotsForDay(config.breakSlots, day);
  const breakMinutes = slots.reduce((total, slot) => {
    const slotStart = new Date(`2000-01-01T${slot.start}:00`);
    const slotEnd = new Date(`2000-01-01T${slot.end}:00`);
    const duration = (slotEnd.getTime() - slotStart.getTime()) / (1000 * 60);
    
    // Don't count slots marked as class
    return total + (slot.isClass ? 0 : duration);
  }, 0);
  
  return Math.floor((totalMinutes - breakMinutes) / config.classDuration);
}
```

## Migration Guide

### For Existing Implementations

If you have existing code using the old format:

1. **Loading Configs**:
   ```typescript
   // OLD: Direct use of breakSlots array
   const slots = config.breakSlots.map(slot => ...)
   
   // NEW: Convert first
   const newConfig = convertOldConfigToNew(config);
   const monday = getSlotsForDay(newConfig.breakSlots, 1);
   ```

2. **Saving Configs**:
   ```typescript
   // Make sure you're saving the Record format
   const configToSave: ScheduleConfig = {
     ...config,
     breakSlots: {} as Record<string, ScheduleSlot[]>
   };
   ```

3. **Updating Modal Props**:
   ```typescript
   // OLD:
   <ScheduleConfigModal {...props} />
   
   // NEW: Same component, but handles new format internally
   <ScheduleConfigModal {...props} />
   // Modal automatically converts old -> new on load
   ```

## Troubleshooting

### Issue: Config loading as old format

**Solution**: Ensure `convertOldConfigToNew()` is called:
```typescript
useEffect(() => {
  if (currentConfig) {
    const modernConfig = convertOldConfigToNew(currentConfig);
    // Use modernConfig
  }
}, [currentConfig]);
```

### Issue: Slots not appearing for specific day

**Solution**: Check the day value and key formatting:
```typescript
// Days are 1-7 (Monday-Sunday)
// Keys in Record should be string: "1", "2", etc.

const slots = getSlotsForDay(breakSlots, 5); // Friday
// NOT: getSlotsForDay(breakSlots, "friday")
```

### Issue: calculateTotalSlotsForDay returns 0

**Solution**: Make sure the `isClass` flag is correctly set:
```typescript
// If isClass is true, slot doesn't reduce available classes
const slot = {
  start: "13:00",
  end: "13:30",
  label: "CLASE",
  type: "class",
  isClass: true // Important!
};
```

## Testing

### Unit Test Example

```typescript
import { getSlotsForDay, applySlotsToDays } from '@/utils/scheduleConfigConverter';

describe('ScheduleConfig', () => {
  it('should get slots for specific day', () => {
    const breakSlots = {
      "1": [{ start: "10:00", end: "10:15", label: "RECREO", type: "break" }],
      "5": [{ start: "10:00", end: "10:15", label: "RECREO", type: "break" }]
    };
    
    const fridaySlots = getSlotsForDay(breakSlots, 5);
    expect(fridaySlots).toHaveLength(1);
  });

  it('should copy slots to multiple days', () => {
    const slots = [{ start: "10:00", end: "10:15", label: "RECREO", type: "break" }];
    const updated = applySlotsToDays({}, [1, 2, 3, 4, 5], slots);
    
    expect(Object.keys(updated)).toEqual(['1', '2', '3', '4', '5']);
  });
});
```

### Integration Test Example

```typescript
describe('ScheduleConfigModal', () => {
  it('should convert old format on load', async () => {
    const oldConfig = {
      breakSlots: [{ start: "10:00", end: "10:15", label: "RECREO" }]
    };
    
    render(<ScheduleConfigModal currentConfig={oldConfig} {...props} />);
    
    // Modal should load and convert automatically
    expect(screen.getByText('Configurar Slots por Día')).toBeInTheDocument();
  });

  it('should save per-day configuration', async () => {
    const onSave = jest.fn();
    
    render(<ScheduleConfigModal onSave={onSave} {...props} />);
    
    // Add slots to Monday
    // Copy to other days
    // Save
    
    // onSave should be called with Record format
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        breakSlots: expect.any(Object) // Record type
      })
    );
  });
});
```

## Performance Considerations

1. **Time Slot Generation**: `generateTimeSlotsForDay()` is efficient but should be cached if called frequently
   ```typescript
   const timeSlots = useMemo(
     () => ScheduleTimeGenerator.generateTimeSlotsForDay(config, selectedDay),
     [config, selectedDay]
   );
   ```

2. **Large Numbers of Days**: If supporting many special dates, consider lazy loading day configurations

3. **Slot Validation**: Validation happens on save and is O(n²) for checking overlaps - acceptable for typical schedules

## Future Enhancements

- [ ] Visual slot editor (drag/resize in UI)
- [ ] Template system for recurring patterns
- [ ] Per-day slot preview before saving
- [ ] Slot conflict detection and auto-resolution
- [ ] Import/export functionality
- [ ] Slot scheduling with teacher assignments

## Related Files

- `src/types/schedules.types.ts` - Type definitions
- `src/utils/scheduleConfigConverter.ts` - Conversion utilities
- `src/utils/scheduleConfigExamples.ts` - Example configurations
- `src/components/features/schedules/calendar/ScheduleConfigModal.tsx` - Editor component
- `src/components/features/schedules/SchedulesPageContent.tsx` - Integration example

