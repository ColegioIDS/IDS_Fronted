# 📅 Schedules Module - Structure & Migration Guide

## 📋 Overview

The **Schedules Module** manages the creation and editing of class schedules within sections. It uses a **unified data architecture** combining Schedule, ScheduleConfig, and CourseAssignment types.

### Key Concept: courseAssignmentId

The `courseAssignmentId` is the **PRIMARY IDENTIFIER** linking a Schedule to a specific teacher+course combination already assigned in the course-assignments module.

```typescript
// Schedule structure
{
  id: 1,
  courseAssignmentId: 5,    // ← PRIMARY: Links to teacher+course
  teacherId: 10,            // Can differ (for substitutions)
  sectionId: 2,
  dayOfWeek: 1,             // Monday
  startTime: "08:00",
  endTime: "08:45",
  classroom: "A-101"
}
```

---

## 🗂️ Directory Structure

```
src/components/features/schedules/
├── index.ts                           # Main exports
├── README.md                          # This file
├── SchedulesPageContent.tsx           # Main page component
│
├── calendar/                          # Time grid & configuration
│   ├── index.ts
│   ├── ScheduleGrid.tsx               # Dynamic grid (days × time slots)
│   ├── ScheduleHeader.tsx             # Header with controls
│   ├── ScheduleSidebar.tsx            # CourseAssignments list for dragging
│   ├── DroppableTimeSlot.tsx          # Drop zones in grid
│   └── ScheduleConfigModal.tsx        # Configure workingDays, times, breaks
│
└── draggable/                         # Drag-drop components
    ├── index.ts
    ├── DraggableCourseAssignment.tsx  # Draggable course+teacher unit
    └── DraggableSchedule.tsx          # Draggable existing schedule
```

---

## 🔄 Data Flow

### 1. Initialization
```
User visits /schedules
     ↓
SchedulesPageContent mounts
     ↓
useSchedules() initializes:
  - loadFormData()         → CourseAssignments, Sections, Courses, Teachers
  - loadSchedulesBySection() → Existing schedules
  - loadConfig()           → ScheduleConfig for the section
```

### 2. Drag & Drop (Create)
```
User selects CourseAssignment from ScheduleSidebar
     ↓
Drags it to ScheduleGrid time slot
     ↓
Drop triggers ScheduleFormValues:
  {
    courseAssignmentId: 5,
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "08:45"
  }
     ↓
TempSchedule created in state
     ↓
User clicks Save
     ↓
createScheduleItem() → API
     ↓
Schedule saved to DB
```

### 3. Configuration
```
User clicks "Configure Schedule"
     ↓
ScheduleConfigModal opens
     ↓
Display current ScheduleConfig:
  - workingDays: [1, 2, 3, 4, 5]
  - startTime: "07:00"
  - endTime: "14:00"
  - classDuration: 45
  - breakSlots: [
      { start: "10:00", end: "10:15", label: "RECREO" }
    ]
     ↓
User modifies
     ↓
updateScheduleConfig() → API
     ↓
ScheduleGrid regenerates with new time slots
```

---

## 🪝 Using useSchedules Hook

### Basic Usage
```typescript
'use client';

import { useSchedules } from '@/hooks/useSchedules';

export function MyScheduleComponent() {
  const {
    // Data
    schedules,
    config,
    formData,
    
    // Loading
    isLoading,
    isSubmitting,
    
    // Errors
    error,
    
    // Actions
    loadSchedulesBySection,
    createScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
    loadConfig,
    
    // Utilities
    refreshAll,
    clearError
  } = useSchedules({
    autoLoadFormData: true,
    onSuccess: (msg) => console.log(msg),
    onError: (err) => console.error(err)
  });

  return (
    <div>
      {isLoading && <div>Cargando...</div>}
      {error && <div>{error}</div>}
      {/* ... */}
    </div>
  );
}
```

### Specialized Hooks
```typescript
// Load schedules for specific section
const { schedules } = useSchedulesBySection(sectionId);

// Load config only
const { config } = useScheduleConfig(sectionId);
```

---

## 🎨 Component Usage Examples

### SchedulesPageContent.tsx
```typescript
export function SchedulesPageContent() {
  const [selectedSectionId, setSelectedSectionId] = useState<number>();
  const {
    schedules,
    config,
    formData,
    loadSchedulesBySection,
    createScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
    batchSave
  } = useSchedules({ autoLoadFormData: true });

  const handleSectionChange = async (sectionId: number) => {
    setSelectedSectionId(sectionId);
    await loadSchedulesBySection(sectionId);
  };

  return (
    <div>
      <ScheduleHeader
        sections={formData?.sections}
        onSectionChange={handleSectionChange}
      />
      
      <ScheduleCalendarView
        selectedSectionId={selectedSectionId}
        schedules={schedules}
        config={config}
        onCreateSchedule={createScheduleItem}
        onUpdateSchedule={updateScheduleItem}
        onDeleteSchedule={deleteScheduleItem}
        onBatchSave={batchSave}
      />
    </div>
  );
}
```

### ScheduleSidebar.tsx
```typescript
export function ScheduleSidebar({
  courseAssignments,
  onSelectAssignment
}: Props) {
  return (
    <div className="space-y-2">
      {courseAssignments.map((assignment) => (
        <DraggableCourseAssignment
          key={assignment.id}
          assignment={assignment}
          onDragStart={() => onSelectAssignment(assignment)}
        />
      ))}
    </div>
  );
}
```

### DraggableCourseAssignment.tsx
```typescript
export function DraggableCourseAssignment({
  assignment,
  onDragStart
}: Props) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('courseAssignmentId', assignment.id.toString());
    onDragStart?.();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="p-2 bg-blue-100 rounded cursor-move"
    >
      <div className="font-semibold">
        {assignment.course?.name}
      </div>
      <div className="text-sm text-gray-600">
        {assignment.teacher?.givenNames} {assignment.teacher?.lastNames}
      </div>
      <div className="text-xs text-gray-500">
        {ASSIGNMENT_TYPE_LABELS[assignment.assignmentType]}
      </div>
    </div>
  );
}
```

### DroppableTimeSlot.tsx
```typescript
export function DroppableTimeSlot({
  day,
  timeSlot,
  schedules,
  onDrop,
  onScheduleClick
}: Props) {
  const [isOver, setIsOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    
    const courseAssignmentId = e.dataTransfer.getData('courseAssignmentId');
    if (courseAssignmentId) {
      onDrop({
        courseAssignmentId: parseInt(courseAssignmentId),
        dayOfWeek: day,
        startTime: timeSlot.start,
        endTime: timeSlot.end
      });
    }
  };

  const slotSchedules = schedules.filter(
    (s) => s.dayOfWeek === day && s.startTime === timeSlot.start
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      className={`
        p-2 border-2 border-dashed min-h-12 rounded
        ${isOver ? 'bg-blue-50 border-blue-400' : 'border-gray-200'}
      `}
    >
      {slotSchedules.map((schedule) => (
        <DraggableSchedule
          key={schedule.id}
          schedule={schedule}
          onClick={() => onScheduleClick?.(schedule)}
        />
      ))}
    </div>
  );
}
```

---

## 📚 Types & Interfaces

### Core Types
```typescript
// Schedule with courseAssignmentId
interface Schedule {
  id: number;
  courseAssignmentId: number;  // PRIMARY
  teacherId: number;
  sectionId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;          // "HH:MM"
  endTime: string;            // "HH:MM"
  classroom?: string;
}

// Config for schedule grid
interface ScheduleConfig {
  id: number;
  sectionId: number;
  workingDays: DayOfWeek[];
  startTime: string;
  endTime: string;
  classDuration: number;      // minutes
  breakSlots: BreakSlot[];
}

// Course + Teacher assignment
interface CourseAssignment {
  id: number;
  sectionId: number;
  courseId: number;
  teacherId: number;
  assignmentType: 'titular' | 'apoyo' | 'temporal' | 'suplente';
}

// Form values
interface ScheduleFormValues {
  courseAssignmentId: number;  // REQUIRED
  teacherId?: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  classroom?: string;
}
```

---

## 🔄 State Management Pattern

```typescript
// ✅ USE THIS PATTERN

// 1. Load form data once
const { formData } = useSchedules({ autoLoadFormData: true });

// 2. When section changes
const handleSectionChange = async (sectionId: number) => {
  await loadSchedulesBySection(sectionId);
};

// 3. Drag & drop creates TempSchedule
const handleDrop = (formValues: ScheduleFormValues) => {
  // Optimistically show temp schedule
  // Then save to DB
};

// 4. Batch save on form submit
const handleSave = async (pendingChanges: ScheduleChange[]) => {
  await batchSave(pendingChanges.map(c => c.schedule as ScheduleFormValues));
};

// ❌ DON'T DO THIS
// - Load data multiple times
// - Use multiple hooks for config and schedules
// - Manage state outside the hook
```

---

## ✅ Checklist for New Components

When creating new components in this module:

- [ ] Import `useSchedules` hook
- [ ] Use `schedules` from hook state
- [ ] Use `config` for ScheduleConfig data
- [ ] Use `courseAssignments` from `formData`
- [ ] Pass `courseAssignmentId` (not separate courseId + teacherId)
- [ ] Handle loading states with `isLoading`
- [ ] Handle errors with `error` state
- [ ] Use `createScheduleItem`, `updateScheduleItem`, `deleteScheduleItem`
- [ ] For batch: use `batchSave` with `ScheduleFormValues[]`
- [ ] Add TypeScript types for all props
- [ ] Use shadcn/ui components from `@/components/ui`
- [ ] Apply dark mode support with `next-themes`

---

## 🚀 API Endpoints

All calls go through `schedules.service.ts`:

```
GET    /api/schedules                      # List schedules
GET    /api/schedules/:id                  # Get by ID
POST   /api/schedules                      # Create (requires courseAssignmentId)
PATCH  /api/schedules/:id                  # Update
DELETE /api/schedules/:id                  # Delete

GET    /api/schedule-configs               # List configs
GET    /api/schedule-configs/:id           # Get config
GET    /api/schedule-configs/section/:sectionId  # Get for section
POST   /api/schedule-configs               # Create config
PATCH  /api/schedule-configs/:id           # Update config
DELETE /api/schedule-configs/:id           # Delete config

POST   /api/schedules/batch                # Batch create/update
DELETE /api/schedules/section/:sectionId   # Delete section schedules

GET    /api/schedules/form-data            # Get init data
GET    /api/schedules/teacher-availability # Get teacher conflicts
```

---

## 🔍 Troubleshooting

### "courseAssignmentId is required"
- Ensure you're passing it when creating schedules
- Check that CourseAssignments are loaded in formData

### "Schedule config not found"
- Call `loadConfig(sectionId)` first
- Or check if ScheduleConfig exists for the section

### "Teacher conflicts showing"
- Call `loadAvailability()` from hook
- Check `teacherAvailability` state for conflicts

### Grid not updating
- Ensure `loadSchedulesBySection()` is called after section change
- Check that `config` is loaded (for time slots)

---

## 📚 Related Modules

- **course-assignments**: Where teachers are assigned to courses
- **sections**: Contains section details
- **grades**: Grouping for sections

---

## 📝 Notes

1. Always use `courseAssignmentId` - it's the primary identifier
2. `teacherId` can differ from assignment's teacherId (substitutions)
3. One ScheduleConfig per section (1:1 relationship)
4. Time slots are generated dynamically from ScheduleConfig
5. Grids can have partial schedules (empty slots are OK)

---

**Last Updated**: November 5, 2025  
**Version**: 1.0 (Consolidated Architecture)
