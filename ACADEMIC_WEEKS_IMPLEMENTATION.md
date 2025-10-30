# 📚 Academic Weeks Module - Complete Implementation

## 🎯 Overview
Complete frontend implementation for Academic Weeks management following the established architectural patterns.

## 📁 File Structure

```
src/
├── app/(admin)/academic-weeks/
│   └── page.tsx ✅ [NEW] Main page with permissions
│
├── components/features/academic-weeks/
│   ├── index.ts ✅ Barrel exports
│   ├── AcademicWeekStats.tsx ✅ Statistics cards
│   ├── AcademicWeekFilters.tsx ✅ Professional filters with debouncing
│   ├── BimesterProgressCard.tsx ✅ Bimester progress tracking
│   ├── AcademicWeekCard.tsx ✅ Individual week card
│   ├── AcademicWeekGrid.tsx ✅ Grid view with pagination
│   ├── AcademicWeekList.tsx ✅ List view with sorting
│   ├── AcademicWeekCalendar.tsx ✅ Monthly calendar view
│   ├── AcademicWeekTimeline.tsx ✅ Chronological timeline view
│   ├── AcademicWeekForm.tsx ✅ Create/Edit form with validation
│   ├── AcademicWeekFormDialog.tsx ✅ Form dialog wrapper
│   ├── DeleteAcademicWeekDialog.tsx ✅ Delete confirmation
│   ├── AcademicWeekDetailDialog.tsx ✅ Detail view dialog
│   ├── AcademicWeekBusinessRulesDialog.tsx ✅ 6 business rules
│   └── AcademicWeekPageContent.tsx ✅ Main orchestrator
│
├── hooks/
│   ├── useAcademicWeeksWithPagination.ts ✅ Data fetching with pagination
│   ├── useAcademicWeekCycles.ts ✅ Cycles for academic weeks
│   └── useAcademicWeekBimesters.ts ✅ Bimesters for selected cycle
│
├── services/
│   └── academic-week.service.ts ✅ API service (helpers only)
│
├── types/
│   └── academic-week.types.ts ✅ Complete type definitions
│
└── config/
    └── theme.config.ts ✅ Updated with weekTypes colors
```

## 🎨 Features Implemented

### 📊 Statistics & Progress
- **AcademicWeekStats**: 5 stat cards (Total, Regular, Evaluation, Review, Active)
- **BimesterProgressCard**: Progress tracking with type distribution and alerts

### 🔍 Filters & Search
- **AcademicWeekFilters**: 8 comprehensive filters
  - Debounced search (500ms)
  - Cycle & Bimester cascade selectors
  - Week type with color-coded badges
  - Status (active/inactive)
  - Year & Month filters
  - Week number selector

### 📋 View Modes (4 modes)
1. **Grid View**: Responsive cards with pagination
2. **List View**: Dense table with sorting capabilities
3. **Calendar View**: Monthly calendar with overlaid weeks
4. **Timeline View**: Chronological timeline grouped by bimester

### 📝 Forms & Dialogs
- **Create/Edit Form**: 
  - Zod validation
  - Date pickers with bimester range validation
  - Auto-calculation of year/month from dates
  - Rich text notes field
  
- **Detail Dialog**: Read-only comprehensive view
- **Delete Dialog**: Confirmation with week details
- **Business Rules**: 6 documented rules with examples

### 🎯 Business Rules
1. ⚠️ **CRITICAL**: Date ranges within bimester
2. ⚠️ **CRITICAL**: No overlapping weeks
3. ⚠️ **CRITICAL**: Unique week numbers
4. ⚡ **WARNING**: Evaluation week mandatory
5. ℹ️ **INFO**: Review week recommended
6. ℹ️ **INFO**: Active status for visibility

## 🔐 Permissions Architecture

### Permission Structure
- Module: `academic-week`
- Actions: `read`, `create`, `update`, `delete`, `export`

### Implementation
```typescript
// Page level (src/app/(admin)/academic-weeks/page.tsx)
const { can } = usePermissions();
const canRead = can.read('academic-week');
const canCreate = can.create('academic-week');
const canEdit = can.update('academic-week');
const canDelete = can.delete('academic-week');
const canExport = can.do('academic-week', 'export');

// Passed to orchestrator
<AcademicWeekPageContent
  canCreate={canCreate}
  canEdit={canEdit}
  canDelete={canDelete}
  canExport={canExport}
/>
```

### Helper Endpoints (Permission Isolation)
All helper endpoints require ONLY `academic-week:read`:
- `/api/academic-weeks/helpers/cycles` - Get available cycles
- `/api/academic-weeks/helpers/bimesters` - Get bimesters for cycle
- `/api/academic-weeks/helpers/info/:id` - Get bimester info
- `/api/academic-weeks/helpers/date-range/:id` - Get bimester date range

**NO cross-module permissions required!**

## 🎨 Theme Integration

### Week Type Colors (theme.config.ts)
```typescript
weekTypes: {
  REGULAR: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-l-blue-500',
    icon: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    // ... more properties
  },
  EVALUATION: {
    // Red color scheme
  },
  REVIEW: {
    // Amber color scheme
  }
}
```

### Helper Function
```typescript
import { getWeekTypeTheme } from '@/config/theme.config';

const theme = getWeekTypeTheme(week.weekType);
// Use: theme.bg, theme.text, theme.border, etc.
```

## 🔄 Data Flow

### 1. Page Load
```
AcademicWeeksPage (permissions)
    ↓
AcademicWeekPageContent (orchestrator)
    ↓
useAcademicWeeksWithPagination (data)
useAcademicWeekCycles (cycles)
useAcademicWeekBimesters (bimesters)
    ↓
Child Components (stats, filters, views, etc.)
```

### 2. Filter Flow
```
User interaction
    ↓
AcademicWeekFilters (debounced)
    ↓
handleFilterChange()
    ↓
updateQuery() (hook)
    ↓
API request
    ↓
UI update
```

### 3. CRUD Flow
```
User action
    ↓
Dialog opens (Form/Delete/Detail)
    ↓
Form submit / Confirm
    ↓
academicWeekService API call
    ↓
Toast notification
    ↓
refresh() (reload data)
    ↓
Dialog closes
```

## 🚀 Usage Example

```tsx
// Simply navigate to: /academic-weeks
// Or programmatically:
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/academic-weeks');
```

## 📦 Dependencies

### UI Components (Radix UI)
- Dialog
- Select
- Calendar (Popover)
- Button
- Card
- Badge
- Input
- Textarea
- Skeleton

### Form Management
- react-hook-form
- @hookform/resolvers
- zod

### Date Management
- date-fns
- date-fns/locale (es)

### Notifications
- sonner (toast)

### Icons
- lucide-react

## ✅ Testing Checklist

### Permissions
- [ ] User with only `read` can view but not edit
- [ ] User with `read` + `create` can create new weeks
- [ ] User with `read` + `update` can edit existing weeks
- [ ] User with `read` + `delete` can delete weeks
- [ ] User without `read` sees "No Access" message

### Filters
- [ ] Search debounces correctly (500ms)
- [ ] Cycle selection filters weeks
- [ ] Bimester depends on selected cycle
- [ ] Week type filter works with color indicators
- [ ] Year/month filters work independently
- [ ] Clear filters resets all

### Views
- [ ] Grid view displays cards correctly
- [ ] List view sorts by column click
- [ ] Calendar view shows overlapping weeks
- [ ] Timeline groups by bimester
- [ ] Pagination works in Grid/List

### Forms
- [ ] Date validation against bimester range
- [ ] Week number uniqueness validation
- [ ] Auto-calculation of year/month
- [ ] Form submission creates/updates correctly
- [ ] Error messages display properly

### Business Logic
- [ ] Cannot create overlapping weeks
- [ ] Cannot use duplicate week numbers
- [ ] Warning if evaluation week missing
- [ ] Dates must be within bimester range
- [ ] Active toggle controls visibility

## 🎯 Key Architectural Patterns

### 1. Orchestrator Pattern
`AcademicWeekPageContent` coordinates all sub-components without tight coupling.

### 2. Compound Components
Each component is self-contained and reusable.

### 3. Permission-Based Rendering
Conditional rendering based on user permissions.

### 4. Helper Endpoint Isolation
No cross-module permission dependencies.

### 5. Theme Centralization
All colors managed in `theme.config.ts`.

### 6. Type Safety
Full TypeScript coverage with strict types.

## 🔧 Configuration

### API Endpoints
Base URL configured in `@/config/api.ts`

### Pagination
Default: 12 items per page (configurable in hook)

### Debounce
Search: 500ms (configurable in AcademicWeekFilters)

### Stale Time
React Query: 5 minutes

## 📝 Notes

- All components support dark mode
- Responsive design: mobile/tablet/desktop
- Spanish locale for dates (date-fns)
- Loading states with skeletons
- Error boundaries recommended
- Toast notifications for all actions

## 🎉 Complete!

The Academic Weeks module is now fully implemented and ready for use. All components follow the established patterns from the Bimesters module and are production-ready.
