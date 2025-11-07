// ARCHITECTURE_DIAGRAM.md

# 🏗️ Arquitectura del Módulo Attendance - Fase 1

## 📊 Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────────┐
│                   COMPONENTES (React)                           │
│  ┌──────────────────────┬──────────────────────┬───────────────┐
│  │ AttendanceHeader     │ AttendanceGrid       │ AttendanceModal
│  └──────────────────────┴──────────────────────┴───────────────┘
└──────────────────────────────┬──────────────────────────────────┘
                               │ Consumen
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                        HOOKS (Fase 1)                           │
│  ┌──────────────────┬──────────────────┬─────────────────────┐ │
│  │ useAttendance    │ useAttendance    │ useAttendance      │ │
│  │     Data         │    Filters       │    Actions         │ │
│  │                  │                  │                    │ │
│  │ • Fetch          │ • setFilter      │ • Create           │ │
│  │ • Pagination     │ • clearFilters   │ • Update           │ │
│  │ • Stats          │ • getQuery       │ • Delete           │ │
│  │ • Loading/Error  │ • hasActive      │ • Bulk ops         │ │
│  │                  │                  │ • Justifications   │ │
│  └──────────────────┴──────────────────┴─────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────┘
                               │ Usan
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICIO (Service)                         │
│              src/services/attendance.service.ts                 │
│                                                                 │
│  • getAttendances()          • bulkCreateAttendances()         │
│  • getAttendanceById()        • bulkUpdateAttendances()        │
│  • createAttendance()         • bulkDeleteAttendances()        │
│  • updateAttendance()         • bulkApplyStatus()              │
│  • deleteAttendance()         • getJustifications()            │
│  • getStudentAttendances()    • createJustification()          │
│  • getSectionAttendances()    • updateJustification()          │
│  • getAttendanceStats()       • approveJustification()         │
│  • getClassAttendances()      • rejectJustification()          │
│  • generateReport()           • exportCSV()                     │
└──────────────────────────────┬──────────────────────────────────┘
                               │ Llama a
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                     API CLIENT (Axios)                          │
│                    src/config/api.ts                           │
│                                                                 │
│  • GET    /api/attendance                                      │
│  • GET    /api/attendance/:id                                  │
│  • POST   /api/attendance                                      │
│  • PATCH  /api/attendance/:id                                  │
│  • DELETE /api/attendance/:id                                  │
│  • POST   /api/attendance/bulk                                 │
│  • GET    /api/attendance/stats                                │
│  • GET    /api/attendance/justifications                       │
│  • ...y más                                                     │
└──────────────────────────────┬──────────────────────────────────┘
                               │ Conecta con
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (API REST)                          │
│                                                                 │
│  Node.js / Express / NestJS (dependiendo tu stack)            │
│                                                                 │
│  • Autenticación & Autorización                                │
│  • Validación de datos                                         │
│  • Lógica de negocio                                           │
│  • Base de datos (PostgreSQL + Prisma)                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos

### 1. Lectura de Datos

```
Component Mount
      ↓
useAttendanceData.fetchAttendances()
      ↓
attendanceService.getAttendances()
      ↓
api.get('/api/attendance?params')
      ↓
Backend API
      ↓
Database Query
      ↓
Response (PaginatedAttendance)
      ↓
Hook State Update
      ↓
Component Re-render
```

### 2. Filtrado

```
User Changes Filter
      ↓
useAttendanceFilters.setFilter()
      ↓
Filter State Updated (sin fetch automático)
      ↓
Component obtiene getQueryParams()
      ↓
Component llama fetchAttendances(query)
      ↓
[Flujo de lectura...]
```

### 3. Creación/Actualización

```
User Submits Form
      ↓
useAttendanceActions.createAttendance(data)
      ↓
attendanceService.createAttendance(data)
      ↓
api.post('/api/attendance', data)
      ↓
Backend Validates & Creates
      ↓
Response (StudentAttendance)
      ↓
Hook State: loading = false, success = true
      ↓
Component: Refrescar datos con fetchAttendances()
```

---

## 🔐 Flujo de Permisos

```
User Login
      ↓
usePermissions() → Obtiene permisos y scope
      ↓
scope = 'section' ✓
sectionId = 5
      ↓
fetchAttendances({
  scope: 'section',
  sectionIdScope: 5
})
      ↓
Backend filtra por scope
      ↓
User solo ve asistencia de su sección
```

---

## 📦 Estructura de Tipos

```typescript
// Base
StudentAttendance
├── id: number
├── enrollmentId: number
├── date: string
├── statusCode: AttendanceStatusCode ('A'|'I'|'IJ'|'TI'|'TJ')
├── recordedBy: number
└── ... más campos

// Con Relaciones
StudentAttendanceWithRelations extends StudentAttendance
├── enrollment?: {
│   student: { givenNames, lastNames }
│   section?: { name }
├── status?: AttendanceStatusInfo
├── recordedByUser?: User
├── justification?: StudentJustification
├── changeHistory?: StudentAttendanceChange[]
└── classAttendances?: StudentClassAttendance[]

// Estadísticas
AttendanceStats
├── total: number
├── present: number ('A')
├── absent: number ('I')
├── absentJustified: number ('IJ')
├── late: number ('TI')
├── lateJustified: number ('TJ')
└── percentage?: number

// Query
AttendanceQuery
├── page?: number
├── limit?: number
├── enrollmentId?: number
├── dateFrom?: string
├── dateTo?: string
├── statusCode?: AttendanceStatusCode
├── search?: string
└── sortBy?: 'date'|'studentName'|'status'|'recordedAt'

// Con Scope
AttendanceQueryWithScope extends AttendanceQuery
├── scope?: 'all'|'own'|'grade'|'section'
├── gradeId?: number
└── sectionIdScope?: number
```

---

## 🎯 Estados de los Hooks

### useAttendanceData State

```typescript
{
  attendances: StudentAttendanceWithRelations[]
  stats: AttendanceStats | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  loading: boolean
  error: string | null
}
```

### useAttendanceFilters State

```typescript
{
  dateFrom?: string
  dateTo?: string
  statusCode?: AttendanceStatusCode
  sectionId?: number
  courseId?: number
  search?: string
  hasJustification?: boolean
  sortBy?: 'date' | 'studentName' | 'status' | 'recordedAt'
  sortOrder?: 'asc' | 'desc'
}
```

### useAttendanceActions State

```typescript
{
  loading: boolean
  error: string | null
  success: boolean
}
```

---

## 🔗 Dependencias

### Sin Dependencias Externas
✅ Independiente de otros hooks (auth, context, etc.)
✅ Solo depende de `attendanceService`
✅ Solo depende de tipos `attendance.types.ts`

### Compatibilidad
✅ Funciona con React 18+
✅ Compatible con TypeScript 4.5+
✅ Requiere Axios (ya instalado)

---

## 🧮 Operaciones Soportadas

### CRUD Individual
```
CREATE: attendanceService.createAttendance(dto)
READ:   attendanceService.getAttendanceById(id)
UPDATE: attendanceService.updateAttendance(id, dto)
DELETE: attendanceService.deleteAttendance(id)
LIST:   attendanceService.getAttendances(query)
```

### Operaciones Bulk
```
BULK CREATE: bulkCreateAttendances(data)
BULK UPDATE: bulkUpdateAttendances(data)
BULK DELETE: bulkDeleteAttendances(data)
APPLY STATUS: bulkApplyStatus(data)  → Aplicar status a múltiples estudiantes
```

### Justificantes
```
CRUD: create/read/update/delete
APPROVE: approveJustification(id, userId)
REJECT: rejectJustification(id, reason)
```

### Reportes
```
STATS: getAttendanceStats(query)
REPORT: generateAttendanceReport(query)
EXPORT: exportAttendancesToCSV(query)
```

---

## 📈 Casos de Uso

### 1. Docente tomando asistencia
```
Componente: AttendanceGrid
Hooks: useAttendanceData + useAttendanceActions
Flujo:
1. Carga lista de estudiantes (fetchAttendances)
2. Selecciona estado para cada uno (updateAttendance)
3. O aplica estado a todos (bulkApplyStatus)
```

### 2. Coordinador viendo reportes
```
Componente: AttendanceReport
Hooks: useAttendanceData + useAttendanceFilters
Flujo:
1. Filtra por fecha/sección (setFilter)
2. Carga datos (fetchAttendances)
3. Ve estadísticas (stats)
4. Exporta CSV (exportAttendancesToCSV)
```

### 3. Estudiante justificando inasistencia
```
Componente: JustificationForm
Hooks: useAttendanceActions
Flujo:
1. Rellena formulario
2. Crea justificante (createJustification)
3. Adjunta documento
```

---

## 🚀 Performance

### Optimizaciones Incluidas
✅ `useCallback` en todos los métodos → Evita re-renders
✅ Estados separados → No recalcula todo cambio
✅ Memoización de `getQueryParams()` → Evita renders
✅ Paginación → No carga todo de una vez

### Mejoras Futuras
⏳ React Query / SWR para caché automático
⏳ Debounce en búsqueda
⏳ Infinite scroll
⏳ Optimistic updates

---

## 🔄 Integración con Otros Módulos

```
Attendance Module
    ↓
    ├── Usa: Enrollments (enrollmentId)
    ├── Usa: Students (via enrollment)
    ├── Usa: Sections (sectionId)
    ├── Usa: Users (recordedBy)
    ├── Usa: Permissions (scope validation)
    └── Usa: Roles (para acceso)

Próximo:
    └── Fase 2: Integración de permisos en componentes
```

---

## 📚 Documentación Disponible

- **USAGE_GUIDE.md** → Ejemplos de código
- **PHASE_1_COMPLETE.md** → Resumen de completude
- **attendance.types.ts** → Definiciones de tipos
- **attendance.service.ts** → Métodos disponibles
- **useAttendance*.ts** → Implementación de hooks

---

**Diagrama Actualizado:** 7 de Noviembre, 2025
**Versión:** Fase 1 Completada
**Status:** ✅ Listo para Fase 2
