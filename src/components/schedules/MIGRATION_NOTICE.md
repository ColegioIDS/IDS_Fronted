# ⚠️ MIGRATION NOTICE - Schedules Module

## Status: DEPRECATED ✗

This directory contains **LEGACY components** that have been migrated to the new unified architecture.

**All new code should import from:** `@/components/features/schedules`

---

## Migration Timeline

### PASO 0-4 (✅ COMPLETED):
- **PASO 0**: Created unified `schedules.types.ts`, `schedules.service.ts`, `useSchedules.ts`
- **PASO 1**: Created new directory structure: `features/schedules/{calendar,draggable}`
- **PASO 2**: Migrated calendar components (ScheduleGrid, ScheduleHeader, etc.)
- **PASO 3**: Refactored drag & drop (DraggableCourseAssignment)
- **PASO 4**: Migrated main component (SchedulesPageContent.tsx)

### PASO 5-8 (🔄 IN-PROGRESS):
- **PASO 5**: ✅ Verified ScheduleCalendarView has no external uses
- **PASO 6**: ✅ Verified page imports already updated
- **PASO 7**: 🔄 Cleaning legacy components
- **PASO 8**: 🔄 Archiving this directory

---

## Files to Remove/Archive

| File | Status | Reason |
|------|--------|--------|
| `ContentSchedules.tsx` | DEPRECATED | Replaced by `SchedulesPageContent.tsx` |
| `ScheduleCalendarView.tsx` | DEPRECATED | Functionality merged into main component |
| `calendar/*.tsx` | DEPRECATED | Migrated to `features/schedules/calendar/` |
| `draggable/*.tsx` | DEPRECATED | Migrated to `features/schedules/draggable/` |

---

## New Imports Structure

### ❌ OLD (Do NOT use):
```typescript
import { ContentSchedules } from '@/components/schedules/ContentSchedules';
import { ScheduleCalendarView } from '@/components/schedules/ScheduleCalendarView';
import { ScheduleGrid } from '@/components/schedules/calendar/ScheduleGrid';
```

### ✅ NEW (Use this):
```typescript
import { SchedulesPageContent } from '@/components/features/schedules';
import { ScheduleGrid, ScheduleHeader } from '@/components/features/schedules/calendar';
import { DraggableSchedule, DraggableCourseAssignment } from '@/components/features/schedules/draggable';
import { useSchedules } from '@/hooks/useSchedules';
```

---

## Key Architectural Changes

### 1. Unified Hook
- **OLD**: `useSchedule()` (singular, limited scope)
- **NEW**: `useSchedules()` (unified, 50+ methods)

### 2. Unified Service
- **OLD**: Multiple services (schedule, config, etc.)
- **NEW**: `schedulesService` (singleton, all operations)

### 3. Unified Types
- **OLD**: Scattered in `@/types/schedules`
- **NEW**: Consolidated in `@/types/schedules.types`

### 4. Primary Identifier
- **OLD**: courseId + teacherId (separate)
- **NEW**: courseAssignmentId (unified, PRIMARY KEY)

### 5. Component Model
- **OLD**: DraggableCourse + DraggableTeacher (separate)
- **NEW**: DraggableCourseAssignment (unified, shows both)

---

## Timeline for Complete Removal

- **Phase 1 (Current)**: Mark as deprecated, document migration
- **Phase 2 (Next Release)**: Remove from codebase
- **Phase 3 (Future)**: Delete directory entirely

---

## Questions?

See: `@/components/features/schedules/README.md` for complete documentation.
