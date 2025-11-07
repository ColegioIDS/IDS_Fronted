// ATTENDANCE_MODULE_GUIDE.md

# 📖 Attendance Module - Guía de Referencia Completa

**Última Actualización:** 7 Nov 2025 | **Fase:** 2 (Refactorización)

---

## 🎯 TL;DR - Lo Esencial

```typescript
// Importar hooks
import {
  useAttendanceData,
  useAttendanceFilters,
  useAttendanceActions,
} from '@/hooks/attendance';

// En componente
'use client';
const { attendances, loading, fetchAttendances } = useAttendanceData();
const { filters, setFilter } = useAttendanceFilters();
const { createAttendance, updateAttendance } = useAttendanceActions();
```

---

## 📁 Estructura de Archivos

```
src/
├── types/attendance.types.ts                    (30+ tipos)
├── services/attendance.service.ts               (23 métodos)
└── hooks/attendance/
    ├── useAttendanceData.ts                     (fetch + pagination)
    ├── useAttendanceFilters.ts                  (filter management)
    ├── useAttendanceActions.ts                  (CRUD)
    └── index.ts                                 (exports)

components/features/attendance/
├── components/
│   ├── attendance-header/
│   ├── attendance-grid/
│   ├── attendance-controls/
│   ├── attendance-modals/
│   └── attendance-states/
└── attendance-grid.tsx                          (main wrapper)
```

---

## 🎣 Hook 1: useAttendanceData

**Propósito:** Fetch, paginación, estadísticas

```typescript
const {
  // Estado
  attendances: StudentAttendanceWithRelations[]
  stats: AttendanceStats | null
  pagination: { page, limit, total, totalPages }
  loading: boolean
  error: string | null

  // Métodos
  fetchAttendances(query?): Promise<PaginatedAttendance>
  fetchAttendanceById(id): Promise<StudentAttendanceWithRelations>
  fetchStudentAttendances(enrollmentId, query?)
  fetchSectionAttendances(sectionId, query?)
  fetchStats(query?): Promise<AttendanceStats>
  changePage(page, query?)
  changeLimit(limit, query?)
  clearState(): void
  clearError(): void
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

## 🔍 Hook 2: useAttendanceFilters

**Propósito:** Gestionar filtros sin efectos secundarios

```typescript
const {
  filters: {
    dateFrom?, dateTo?, statusCode?, sectionId?,
    courseId?, search?, hasJustification?, sortBy?, sortOrder?
  }
  setFilter(key, value): void
  setMultipleFilters(filters): void
  setDateRange(from, to): void
  setSorting(sortBy, order): void
  clearFilters(): void
  clearFilter(key): void
  getQueryParams(): AttendanceQuery
  hasActiveFilters: boolean
  getFilterDescription: string
} = useAttendanceFilters();
```

**Ejemplo:**
```typescript
const handleSearch = () => {
  const query = getQueryParams();
  fetchAttendances(query);
};
```

---

## ✏️ Hook 3: useAttendanceActions

**Propósito:** Operaciones CRUD

```typescript
const {
  loading: boolean
  error: string | null
  success: boolean

  // Individual
  createAttendance(data): Promise<StudentAttendance>
  updateAttendance(id, data): Promise<StudentAttendance>
  deleteAttendance(id): Promise<void>

  // Bulk
  bulkCreateAttendances(data): Promise<BulkAttendanceResponse>
  bulkUpdateAttendances(data): Promise<BulkAttendanceResponse>
  bulkDeleteAttendances(data): Promise<BulkAttendanceResponse>
  bulkApplyStatus(data): Promise<BulkAttendanceResponse>

  // Justificantes
  createJustification(data): Promise<StudentJustification>
  updateJustification(id, data): Promise<StudentJustification>
  approveJustification(id, userId): Promise<StudentJustification>
  rejectJustification(id, reason): Promise<StudentJustification>

  clearState(): void
  clearError(): void
} = useAttendanceActions();
```

---

## 📊 Status Codes

| Código | Significado | Uso |
|--------|-------------|-----|
| `'A'` | Presente | Asistió |
| `'I'` | Ausente | No asistió |
| `'IJ'` | Ausente Justificado | Con justificante |
| `'TI'` | Tardanza | Llegó tarde |
| `'TJ'` | Tardanza Justificada | Tarde justificada |

---

## 🔐 Permission Scopes

```typescript
AttendanceQueryWithScope {
  scope?: 'all' | 'own' | 'grade' | 'section'
  gradeId?: number
  sectionIdScope?: number
}

// Significados:
'all'     → Admin: acceso total
'section' → Teacher: solo su sección
'own'     → Student: solo suyo
'grade'   → Coordinator: su grado
```

**Uso:**
```typescript
fetchAttendances({
  scope: 'section',
  sectionIdScope: 5,
  page: 1,
});
```

---

## 📋 DTOs Principales

### CreateAttendanceDto
```typescript
{
  enrollmentId: number
  date: string                    // ISO format
  statusCode: 'A' | 'I' | 'IJ' | 'TI' | 'TJ'
  courseAssignmentId?: number
  notes?: string
  arrivalTime?: string           // HH:mm
  minutesLate?: number
}
```

### UpdateAttendanceDto
```typescript
{
  statusCode?: AttendanceStatusCode
  notes?: string
  arrivalTime?: string
  minutesLate?: number
  changeReason?: string
}
```

### BulkApplyStatusDto
```typescript
{
  enrollmentIds: number[]
  date: string
  statusCode: AttendanceStatusCode
  notes?: string
}
```

---

## ⚠️ Error Handling

```typescript
try {
  await createAttendance(data);
} catch (err) {
  const msg = err instanceof Error ? err.message : 'Unknown error';
  console.error(msg);
}

// O usar hook state
if (error) {
  return <Alert>{error}</Alert>;
}
```

---

## 🔗 Service Methods (23 total)

**Lectura:**
- `getAttendances(query)` - Listado paginado
- `getAttendanceById(id)` - Detalle
- `getStudentAttendances(enrollmentId, query)`
- `getSectionAttendances(sectionId, query)`
- `getAttendanceStats(query)` - Estadísticas

**CRUD:**
- `createAttendance(data)`
- `updateAttendance(id, data)`
- `deleteAttendance(id)`

**Bulk:**
- `bulkCreateAttendances(data)`
- `bulkUpdateAttendances(data)`
- `bulkDeleteAttendances(data)`
- `bulkApplyStatus(data)` - Aplicar status a múltiples

**Justificantes:**
- `getJustifications(query)`
- `createJustification(data)`
- `updateJustification(id, data)`
- `approveJustification(id, userId)`
- `rejectJustification(id, reason)`
- `deleteJustification(id)`

**Reportes:**
- `generateAttendanceReport(query)`
- `exportAttendancesToCSV(query)`
- `getAttendanceChangeHistory(id)`

---

## 💡 Patrones Comunes

### Patrón 1: Cargar & Mostrar
```typescript
const { attendances, loading, error, fetchAttendances } = useAttendanceData();

useEffect(() => {
  fetchAttendances({ sectionId: 5, page: 1, limit: 20 });
}, []);

if (loading) return <Spinner />;
if (error) return <Alert>{error}</Alert>;
return <AttendanceTable data={attendances} />;
```

### Patrón 2: Filtrar
```typescript
const { filters, setFilter, getQueryParams } = useAttendanceFilters();
const { fetchAttendances } = useAttendanceData();

const handleFilter = () => {
  const query = getQueryParams();
  fetchAttendances(query);
};
```

### Patrón 3: CRUD
```typescript
const { createAttendance, loading } = useAttendanceActions();
const { fetchAttendances } = useAttendanceData();

const handleCreate = async (data) => {
  await createAttendance(data);
  await fetchAttendances();
};
```

### Patrón 4: Bulk Operations
```typescript
const { bulkApplyStatus } = useAttendanceActions();

const applyToAll = async (enrollmentIds, status) => {
  await bulkApplyStatus({
    enrollmentIds,
    date: new Date().toISOString(),
    statusCode: status,
  });
  await fetchAttendances();
};
```

---

## 🚀 Fase 2: Refactorización de Componentes

### Componentes a Refactorizar

1. **AttendanceGrid** (Main component)
   - Usar `useAttendanceData` para listar
   - Usar `useAttendanceActions` para cambiar status
   - Integrar paginación

2. **AttendanceHeader** (Filtros y selectors)
   - Usar `useAttendanceFilters` para gestionar filtros
   - Mostrar estadísticas desde `useAttendanceData`

3. **AttendanceTable/Cards** (Visualización)
   - Consumir datos paginados
   - Integrar cambio de status individual

4. **AttendanceModals** (Diálogos)
   - BulkEdit: usar `bulkUpdateAttendances`
   - Justification: usar `createJustification`
   - Reports: usar `generateReport`

### Template Refactorizado

```typescript
'use client';

import {
  useAttendanceData,
  useAttendanceFilters,
  useAttendanceActions,
} from '@/hooks/attendance';
import { useEffect } from 'react';

interface Props {
  sectionId?: number;
}

export function RefactoredComponent({ sectionId }: Props) {
  const { attendances, loading, error, fetchAttendances, pagination } =
    useAttendanceData();
  const { filters, setFilter, getQueryParams } = useAttendanceFilters();
  const { updateAttendance, loading: actionLoading } = useAttendanceActions();

  // Load inicial
  useEffect(() => {
    const query = getQueryParams();
    fetchAttendances({
      ...query,
      sectionId,
      page: 1,
      limit: 20,
    });
  }, [sectionId]);

  // Handlers
  const handleStatusChange = async (id: number, status: any) => {
    try {
      await updateAttendance(id, { statusCode: status });
      await fetchAttendances(getQueryParams());
    } catch (err) {
      console.error(err);
    }
  };

  // Render
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (attendances.length === 0) return <EmptyState />;

  return (
    <div>
      {/* Contenido */}
    </div>
  );
}
```

---

## 📌 Notas Importantes

1. **Sin dependencias externas** - Hooks solo usan `attendanceService`
2. **Memoización** - Todo usa `useCallback` para evitar re-renders
3. **Errores** - Se lanzan excepciones, usar try/catch
4. **Permisos** - Backend valida, frontend filtra UI
5. **Paginación** - Siempre activada, máximo recomendado 50 por página

---

## ⏱️ Estimación Fase 2

- AttendanceGrid: 4-6 horas
- AttendanceHeader: 2-3 horas
- Modals: 3-4 horas
- Permisos: 4-6 horas
- Testing: 4-6 horas
- **TOTAL: 20-30 horas**

---

## 🔗 Referencias Rápidas

| Concepto | Ubicación |
|----------|-----------|
| Tipos | `src/types/attendance.types.ts` |
| Servicio | `src/services/attendance.service.ts` |
| Hooks | `src/hooks/attendance/` |
| Componentes | `src/components/features/attendance/` |

---

## ✅ Checklist Refactorización

- [ ] AttendanceGrid refactorizado
- [ ] AttendanceHeader refactorizado
- [ ] Modales funcionales
- [ ] Permisos validados
- [ ] Sin console errors
- [ ] Tests pasando
- [ ] Performance aceptable

---

**Status:** Fase 2 Iniciada ✅  
**Próximo:** Refactorizar AttendanceGrid  
