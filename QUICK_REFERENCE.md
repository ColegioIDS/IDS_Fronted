// QUICK_REFERENCE.md

# ⚡ Quick Reference - Attendance Hooks & Service

## 🚀 TL;DR

```typescript
import {
  useAttendanceData,
  useAttendanceFilters,
  useAttendanceActions,
} from '@/hooks/attendance';

// Fetch data
const { attendances, stats, fetchAttendances } = useAttendanceData();

// Filter management
const { filters, setFilter, getQueryParams } = useAttendanceFilters();

// CRUD operations
const { createAttendance, updateAttendance } = useAttendanceActions();
```

---

## 📦 Tipos Principales

```typescript
// Status codes
type AttendanceStatusCode = 'A' | 'I' | 'IJ' | 'TI' | 'TJ';
//                           ↑    ↑   ↑    ↑    ↑
//                        Pres Aus JustAus Tarde JustTarde

// Main entity
StudentAttendance {
  id, enrollmentId, date, statusCode,
  recordedBy, createdAt, updatedAt, ...
}

// With relations
StudentAttendanceWithRelations extends StudentAttendance {
  enrollment?, status?, recordedByUser?, justification?, ...
}

// Pagination
PaginatedAttendance {
  data: StudentAttendanceWithRelations[]
  meta: { page, limit, total, totalPages }
  stats?: AttendanceStats
}
```

---

## 🎣 Hook: useAttendanceData

**Propósito:** Fetch, paginación, estadísticas

```typescript
const {
  // State
  attendances,      // StudentAttendanceWithRelations[]
  stats,            // AttendanceStats | null
  pagination,       // { page, limit, total, totalPages }
  loading,          // boolean
  error,            // string | null

  // Methods
  fetchAttendances,        // (query?) => Promise
  fetchAttendanceById,     // (id) => Promise
  fetchStudentAttendances, // (enrollmentId, query?) => Promise
  fetchSectionAttendances, // (sectionId, query?) => Promise
  fetchStats,              // (query?) => Promise
  changePage,              // (page, query?) => Promise
  changeLimit,             // (limit, query?) => Promise
  clearState,              // () => void
  clearError,              // () => void
} = useAttendanceData();
```

**Ejemplo:**
```typescript
useEffect(() => {
  fetchAttendances({
    sectionId: 5,
    dateFrom: '2025-11-01',
    page: 1,
    limit: 20,
  });
}, []);
```

---

## 🔍 Hook: useAttendanceFilters

**Propósito:** Gestionar filtros sin side effects

```typescript
const {
  // State
  filters, // { dateFrom?, dateTo?, statusCode?, search?, ... }

  // Setters
  setFilter,           // (key, value) => void
  setMultipleFilters,  // (obj) => void
  setDateRange,        // (from, to) => void
  setSorting,          // (sortBy, order) => void
  clearFilters,        // () => void
  clearFilter,         // (key) => void

  // Getters
  getQueryParams,      // () => AttendanceQuery
  hasActiveFilters,    // boolean
  getFilterDescription,// string
} = useAttendanceFilters();
```

**Ejemplo:**
```typescript
const handleSearch = () => {
  const query = getQueryParams();
  fetchAttendances(query);
};

<select onChange={e => setFilter('statusCode', e.target.value)}>
  <option value="A">Present</option>
  <option value="I">Absent</option>
</select>
```

---

## ✏️ Hook: useAttendanceActions

**Propósito:** CRUD operations con loading/error states

```typescript
const {
  // State
  loading,  // boolean
  error,    // string | null
  success,  // boolean

  // CRUD Individual
  createAttendance,   // (data) => Promise<StudentAttendance>
  updateAttendance,   // (id, data) => Promise<StudentAttendance>
  deleteAttendance,   // (id) => Promise<void>

  // Bulk Operations
  bulkCreateAttendances,  // (data) => Promise<BulkAttendanceResponse>
  bulkUpdateAttendances,  // (data) => Promise<BulkAttendanceResponse>
  bulkDeleteAttendances,  // (data) => Promise<BulkAttendanceResponse>
  bulkApplyStatus,        // (data) => Promise<BulkAttendanceResponse>

  // Justifications
  createJustification,    // (data) => Promise<StudentJustification>
  updateJustification,    // (id, data) => Promise<StudentJustification>
  approveJustification,   // (id, userId) => Promise<StudentJustification>
  rejectJustification,    // (id, reason) => Promise<StudentJustification>

  // Helpers
  clearState,  // () => void
  clearError,  // () => void
} = useAttendanceActions();
```

**Ejemplo:**
```typescript
const handleCreate = async () => {
  try {
    await createAttendance({
      enrollmentId: 123,
      date: '2025-11-07',
      statusCode: 'A',
    });
  } catch (err) {
    console.error(err);
  }
};
```

---

## 🔗 Service: attendanceService

**Localización:** `src/services/attendance.service.ts`

### Lectura
```typescript
attendanceService.getAttendances(query)           // Paginado
attendanceService.getAttendanceById(id)           // Por ID
attendanceService.getStudentAttendances(enrollmentId)
attendanceService.getSectionAttendances(sectionId)
attendanceService.getAttendanceStats(query)
```

### CRUD
```typescript
attendanceService.createAttendance(dto)
attendanceService.updateAttendance(id, dto)
attendanceService.deleteAttendance(id)
```

### Bulk
```typescript
attendanceService.bulkCreateAttendances(data)
attendanceService.bulkUpdateAttendances(data)
attendanceService.bulkDeleteAttendances(data)
attendanceService.bulkApplyStatus(data)
```

### Justificantes
```typescript
attendanceService.getJustifications(query)
attendanceService.createJustification(dto)
attendanceService.approveJustification(id, userId)
attendanceService.rejectJustification(id, reason)
```

### Reportes
```typescript
attendanceService.generateAttendanceReport(query)
attendanceService.exportAttendancesToCSV(query)
attendanceService.getAttendanceChangeHistory(id)
```

---

## 📊 Status Codes Reference

| Código | Significado | Variable |
|--------|-------------|----------|
| **A** | Presente | `statusCode: 'A'` |
| **I** | Ausente | `statusCode: 'I'` |
| **IJ** | Ausente Justificado | `statusCode: 'IJ'` |
| **TI** | Tardanza | `statusCode: 'TI'` |
| **TJ** | Tardanza Justificada | `statusCode: 'TJ'` |

---

## 🔐 Permission Scopes

```typescript
// Query with scope
fetchAttendances({
  scope: 'section',      // 'all' | 'own' | 'grade' | 'section'
  sectionIdScope: 5,
  gradeId: 10,
});

// Scope meanings
'all'     → Admin: acceso total
'section' → Teacher: solo su sección
'own'     → Student: solo suyo
'grade'   → Coordinator: su grado
```

---

## 📋 Common DTOs

### CreateAttendanceDto
```typescript
{
  enrollmentId: number,
  date: string,              // ISO format
  statusCode: 'A' | 'I' | ...,
  courseAssignmentId?: number,
  notes?: string,
  arrivalTime?: string,      // HH:mm
  minutesLate?: number,
}
```

### UpdateAttendanceDto
```typescript
{
  statusCode?: AttendanceStatusCode,
  notes?: string,
  arrivalTime?: string,
  minutesLate?: number,
  changeReason?: string,
}
```

### BulkApplyStatusDto
```typescript
{
  enrollmentIds: number[],
  date: string,
  statusCode: AttendanceStatusCode,
  notes?: string,
}
```

---

## 🚨 Error Handling

```typescript
try {
  const result = await createAttendance(data);
  console.log('Success:', result);
} catch (err) {
  // Hook already sets error state
  const errorMsg = err instanceof Error ? err.message : 'Unknown error';
  console.error(errorMsg);
}

// Or use hook state
if (error) {
  return <div className="error">{error}</div>;
}
```

---

## 💡 Common Patterns

### Pattern 1: Load & Display
```typescript
const { attendances, loading, error, fetchAttendances } = useAttendanceData();

useEffect(() => {
  fetchAttendances({ page: 1, limit: 10 });
}, []);

return (
  <>
    {loading && <Spinner />}
    {error && <Alert>{error}</Alert>}
    {attendances.map(att => <AttendanceRow key={att.id} data={att} />)}
  </>
);
```

### Pattern 2: Filter & Search
```typescript
const { filters, setFilter, getQueryParams } = useAttendanceFilters();
const { fetchAttendances } = useAttendanceData();

const handleFilter = () => {
  const query = getQueryParams();
  fetchAttendances(query);
};

return (
  <>
    <DatePicker onChange={date => setFilter('dateFrom', date)} />
    <StatusSelect onChange={status => setFilter('statusCode', status)} />
    <button onClick={handleFilter}>Search</button>
  </>
);
```

### Pattern 3: CRUD Operations
```typescript
const { createAttendance, loading, success } = useAttendanceActions();
const { fetchAttendances } = useAttendanceData();

const handleSubmit = async (formData) => {
  try {
    await createAttendance(formData);
    await fetchAttendances(); // Refresh
    resetForm();
  } catch (err) {
    // Error already in hook state
  }
};

return (
  <form onSubmit={handleSubmit}>
    {/* ... form fields ... */}
    <button disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
    {success && <Alert type="success">Created!</Alert>}
  </form>
);
```

### Pattern 4: Pagination
```typescript
const { pagination, changePage } = useAttendanceData();

return (
  <>
    <Table data={attendances} />
    <Pagination
      current={pagination.page}
      total={pagination.totalPages}
      onPageChange={changePage}
    />
  </>
);
```

### Pattern 5: Bulk Operations
```typescript
const { bulkApplyStatus } = useAttendanceActions();

const handleBulkStatus = async (enrollmentIds, status) => {
  await bulkApplyStatus({
    enrollmentIds,
    date: new Date().toISOString(),
    statusCode: status,
    notes: 'Aplicado masivamente',
  });
  await fetchAttendances(); // Refresh
};
```

---

## 🧠 Memory Aids

### Status Codes (Mnemonic)
```
A  = Asistió (Present)
I  = Inasistencia (Absent)
IJ = Inasistencia Justificada (Justified Absent)
TI = Tardanza (Late)
TJ = Tardanza Justificada (Justified Late)
```

### Scopes (Mnemonic)
```
'all'     = Administrator (All access)
'own'     = Owner only (Personal)
'section' = Section teacher
'grade'   = Grade coordinator
```

### Hook Names
```
Data    = Fetch data, pagination, stats
Filters = Filter management
Actions = CRUD operations
```

---

## ⏰ Performance Tips

1. **Memoize callbacks** (already done in hooks)
2. **Use pagination** - Never load all at once
3. **Debounce search** - Add delay in filter changes
4. **Batch updates** - Use bulk methods
5. **Clear state** - On unmount with useEffect cleanup

---

## 🔗 File Locations

```
📁 Types
└─ src/types/attendance.types.ts

📁 Service
└─ src/services/attendance.service.ts

📁 Hooks
├─ src/hooks/attendance/useAttendanceData.ts
├─ src/hooks/attendance/useAttendanceFilters.ts
├─ src/hooks/attendance/useAttendanceActions.ts
└─ src/hooks/attendance/index.ts

📁 Documentation
├─ USAGE_GUIDE.md (detailed)
├─ QUICK_REFERENCE.md (this file)
├─ ARCHITECTURE_DIAGRAM.md (diagrams)
└─ PHASE_2_NEXT_STEPS.md (next phase)
```

---

## 📞 Common Issues

### Issue: Loading never stops
**Solution:** Check that API call is completing. Check network tab.

### Issue: Filters not applying
**Solution:** Call `fetchAttendances(getQueryParams())` after setting filters

### Issue: State not updating
**Solution:** Make sure you're awaiting promises. Hooks update after completion.

### Issue: Permission denied
**Solution:** Check user scope and role. Add error logging to see backend response.

---

## 🎯 Next: Refactor Components (Phase 2)

When ready to integrate:
1. Replace old data fetching with `useAttendanceData`
2. Replace old filtering with `useAttendanceFilters`
3. Replace old CRUD with `useAttendanceActions`
4. Add permission checks with scope validation
5. Test thoroughly

**Estimated:** 20-30 hours for full refactor

---

**Last Updated:** 7 Nov 2025  
**Version:** Phase 1 Complete  
**Status:** ✅ Ready for Use
