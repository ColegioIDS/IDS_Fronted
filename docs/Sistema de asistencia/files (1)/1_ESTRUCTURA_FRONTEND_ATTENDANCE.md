# 🏗️ ESTRUCTURA FRONTEND - SISTEMA DE ASISTENCIA

**Fecha:** Nov 21, 2025  
**Basado en:** Estructura ROLES + Mejoras Recomendadas  
**Status:** Listo para Implementar

---

## 📁 ESTRUCTURA COMPLETA DE CARPETAS

```
ids-frontend/
├── src/
│   ├── app/
│   │   ├── (admin)/
│   │   │   ├── layout.tsx
│   │   │   └── (management)/
│   │   │       ├── layout.tsx
│   │   │       ├── roles/
│   │   │       │   └── page.tsx
│   │   │       ├── users/
│   │   │       │   └── page.tsx
│   │   │       ├── permissions/
│   │   │       │   └── page.tsx
│   │   │       ├── attendance/                    [🆕 MÓDULO ASISTENCIA]
│   │   │       │   ├── page.tsx                   [Entrada principal]
│   │   │       │   └── layout.tsx (opcional)
│   │   │       └── ... [otras rutas]
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── not-found.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── features/
│   │   │   ├── roles/                            [EXISTENTE]
│   │   │   │   ├── index.ts
│   │   │   │   ├── RolesPageContent.tsx
│   │   │   │   ├── RolesGrid.tsx
│   │   │   │   └── ...
│   │   │   │
│   │   │   └── attendance/                       [🆕 NUEVO MÓDULO]
│   │   │       ├── index.ts                      [Barrel export]
│   │   │       ├── AttendancePageContent.tsx     [Contenedor principal]
│   │   │       ├── AttendanceTabs.tsx            [Tabs container]
│   │   │       │
│   │   │       ├── Tab1_DailyRegistration/       [TAB 1: Registro Diario]
│   │   │       │   ├── index.ts
│   │   │       │   ├── DailyRegistrationForm.tsx [Contenedor TAB 1]
│   │   │       │   ├── ValidationChecks.tsx      [Hooks de validación]
│   │   │       │   ├── StudentGrid.tsx           [Tabla de estudiantes]
│   │   │       │   ├── RegistrationSummary.tsx   [Resumen del registro]
│   │   │       │   └── StatusSelector.tsx        [Selector de estado]
│   │   │       │
│   │   │       ├── Tab2_CourseManagement/        [TAB 2: Gestión por Curso]
│   │   │       │   ├── index.ts
│   │   │       │   ├── CourseManagementForm.tsx  [Contenedor TAB 2]
│   │   │       │   ├── CourseSelector.tsx        [Selector de curso]
│   │   │       │   ├── EditableAttendanceGrid.tsx [Tabla editable]
│   │   │       │   ├── StudentAttendanceRow.tsx  [Fila editable]
│   │   │       │   ├── BulkUpdateDialog.tsx      [Modal actualización masiva]
│   │   │       │   └── AttendanceHistoryModal.tsx [Historial de cambios]
│   │   │       │
│   │   │       ├── Tab3_Reports/                 [TAB 3: Reportes]
│   │   │       │   ├── index.ts
│   │   │       │   ├── ReportsContainer.tsx      [Contenedor TAB 3]
│   │   │       │   ├── StudentSelector.tsx       [Selector de estudiante]
│   │   │       │   ├── ReportCard.tsx            [Tarjeta de resumen]
│   │   │       │   ├── AttendanceChart.tsx       [Gráfico de asistencia]
│   │   │       │   ├── AttendanceTable.tsx       [Tabla de detalles]
│   │   │       │   └── RiskIndicator.tsx         [Indicador de riesgo]
│   │   │       │
│   │   │       ├── Tab4_Validations/             [TAB 4: Validaciones]
│   │   │       │   ├── index.ts
│   │   │       │   ├── ValidationsChecker.tsx    [Contenedor TAB 4]
│   │   │       │   ├── BimesterCheck.tsx         [Validación bimestre]
│   │   │       │   ├── HolidayCheck.tsx          [Validación feriado]
│   │   │       │   ├── WeekCheck.tsx             [Validación semana]
│   │   │       │   ├── TeacherAbsenceCheck.tsx   [Validación ausencia]
│   │   │       │   ├── ConfigDisplay.tsx         [Mostrar configuración]
│   │   │       │   └── AllowedStatusesDisplay.tsx [Estados permitidos]
│   │   │       │
│   │   │       └── ESTRUCTURA.md                 [Este archivo]
│   │   │
│   │   ├── shared/
│   │   │   ├── attendance/                       [🆕 Componentes compartidos]
│   │   │   │   ├── AttendanceStatusBadge.tsx     [Badge de estado]
│   │   │   │   ├── AttendanceStatusSelect.tsx    [Select de estado]
│   │   │   │   ├── DateRangePicker.tsx           [Rango de fechas]
│   │   │   │   ├── SectionSelector.tsx           [Selector de sección]
│   │   │   │   ├── StudentInfo.tsx               [Info del estudiante]
│   │   │   │   ├── StatusIndicator.tsx           [Indicador visual]
│   │   │   │   └── AttendanceLoading.tsx         [Loading state]
│   │   │   │
│   │   │   ├── permissions/                      [EXISTENTE]
│   │   │   │   ├── ProtectedPage.tsx
│   │   │   │   ├── ProtectedButton.tsx
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── feedback/                         [EXISTENTE]
│   │   │   │   ├── ErrorAlert.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── ErrorBoundary.tsx             [🆕 NUEVO]
│   │   │   │   └── ...
│   │   │   │
│   │   │   └── ...
│   │   │
│   │   └── ui/
│   │       └── [componentes shadcn]
│   │
│   ├── hooks/
│   │   ├── data/
│   │   │   ├── useRoles.ts                       [EXISTENTE]
│   │   │   ├── useUsers.ts                       [EXISTENTE]
│   │   │   │
│   │   │   └── attendance/                       [🆕 NUEVA CARPETA]
│   │   │       ├── useAttendance.ts              [Hook principal]
│   │   │       ├── useAttendanceValidations.ts   [Validaciones]
│   │   │       ├── useAttendanceReport.ts        [Reportes]
│   │   │       ├── useAttendanceFilters.ts       [Filtros]
│   │   │       └── useDailyRegistration.ts       [Registro diario]
│   │   │
│   │   ├── useGoBack.ts                          [EXISTENTE]
│   │   ├── useLoginForm.ts                       [EXISTENTE]
│   │   └── ...
│   │
│   ├── services/
│   │   ├── roles.service.ts                      [EXISTENTE]
│   │   ├── users.service.ts                      [EXISTENTE]
│   │   │
│   │   └── attendance.service.ts                 [🆕 NUEVO]
│   │       └── Contiene todos los métodos API
│   │
│   ├── types/
│   │   ├── roles.types.ts                        [EXISTENTE]
│   │   ├── users.types.ts                        [EXISTENTE]
│   │   │
│   │   └── attendance.types.ts                   [🆕 NUEVO]
│   │       └── Todas las interfaces de asistencia
│   │
│   ├── schemas/                                  [🆕 NUEVA CARPETA]
│   │   ├── roles.schema.ts                       [Esquemas de Zod]
│   │   ├── users.schema.ts
│   │   └── attendance.schema.ts                  [Esquemas asistencia]
│   │
│   ├── middleware/                               [🆕 NUEVA CARPETA]
│   │   ├── api-handler.ts                        [Manejo de errores API]
│   │   ├── response-interceptor.ts               [Interceptor de respuestas]
│   │   └── error-interceptor.ts                  [Interceptor de errores]
│   │
│   ├── constants/
│   │   ├── roles.constants.ts                    [EXISTENTE]
│   │   │
│   │   └── attendance.constants.ts               [🆕 NUEVO]
│   │       ├── ATTENDANCE_STATUSES
│   │       ├── TABS
│   │       ├── PAGINATION
│   │       └── VALIDATION_MESSAGES
│   │
│   ├── utils/
│   │   ├── handleApiError.ts                     [EXISTENTE]
│   │   │
│   │   └── attendance-utils.ts                   [🆕 NUEVO]
│   │       ├── formatters (formatStatus, etc)
│   │       ├── validators (validarFecha, etc)
│   │       ├── calculators (minutosRetraso, etc)
│   │       └── helpers (getColorByStatus, etc)
│   │
│   ├── context/
│   │   ├── RoleContext.tsx                       [EXISTENTE]
│   │   ├── AuthContext.tsx                       [EXISTENTE]
│   │   │
│   │   └── AttendanceContext.tsx                 [🆕 OPCIONAL]
│   │       └── Para compartir estado entre TABs
│   │
│   ├── config/
│   │   ├── api.ts                                [EXISTENTE]
│   │   ├── theme.config.ts                       [EXISTENTE]
│   │   │
│   │   └── attendance.config.ts                  [🆕 NUEVO]
│   │       └── Configuración de asistencia
│   │
│   ├── layout.tsx                                [Layout raíz]
│   ├── page.tsx                                  [Home]
│   ├── middleware.ts                             [Middleware Next.js]
│   ├── globals.css
│   └── svg.d.ts
│
├── public/
│   ├── images/
│   ├── icons/
│   └── ...
│
├── tests/                                        [🆕 CARPETA TESTS]
│   ├── unit/
│   │   ├── attendance.service.test.ts
│   │   ├── attendance-utils.test.ts
│   │   └── ...
│   ├── integration/
│   │   ├── attendance-flow.test.ts
│   │   └── ...
│   └── e2e/
│       └── attendance.e2e.test.ts
│
├── components.json                               [Shadcn config]
├── eslint.config.mjs
├── next.config.ts
├── tsconfig.json
├── package.json
├── postcss.config.js
├── prettier.config.js
├── README.md
└── .env.local
```

---

## 📋 DETALLES POR CARPETA

### 🆕 **features/attendance/** (15 componentes)

| Archivo | Líneas | Responsabilidad |
|---------|--------|-----------------|
| `AttendancePageContent.tsx` | ~150 | Contenedor principal, manage tabs |
| `AttendanceTabs.tsx` | ~80 | Tabs navigation |
| `Tab1_DailyRegistration/DailyRegistrationForm.tsx` | ~200 | Form contenedor TAB 1 |
| `Tab1_DailyRegistration/ValidationChecks.tsx` | ~300 | Validaciones previas (Hooks 1-8) |
| `Tab1_DailyRegistration/StudentGrid.tsx` | ~250 | Tabla de estudiantes |
| `Tab1_DailyRegistration/RegistrationSummary.tsx` | ~120 | Resumen y botón registrar |
| `Tab1_DailyRegistration/StatusSelector.tsx` | ~100 | Selector dropdown de status |
| `Tab2_CourseManagement/CourseManagementForm.tsx` | ~150 | Contenedor TAB 2 |
| `Tab2_CourseManagement/CourseSelector.tsx` | ~120 | Selector de curso |
| `Tab2_CourseManagement/EditableAttendanceGrid.tsx` | ~300 | Tabla editable |
| `Tab2_CourseManagement/StudentAttendanceRow.tsx` | ~180 | Fila individual editable |
| `Tab2_CourseManagement/BulkUpdateDialog.tsx` | ~150 | Modal actualización masiva |
| `Tab2_CourseManagement/AttendanceHistoryModal.tsx` | ~200 | Historial de cambios |
| `Tab3_Reports/ReportsContainer.tsx` | ~150 | Contenedor TAB 3 |
| `Tab3_Reports/StudentSelector.tsx` | ~100 | Selector de estudiante |
| `Tab3_Reports/ReportCard.tsx` | ~250 | Tarjeta resumen con métricas |
| `Tab3_Reports/AttendanceChart.tsx` | ~150 | Gráfico de asistencia |
| `Tab3_Reports/AttendanceTable.tsx` | ~200 | Tabla de historial |
| `Tab3_Reports/RiskIndicator.tsx` | ~120 | Indicador visual de riesgo |
| `Tab4_Validations/ValidationsChecker.tsx` | ~120 | Contenedor TAB 4 |
| `Tab4_Validations/BimesterCheck.tsx` | ~80 | Check bimestre |
| `Tab4_Validations/HolidayCheck.tsx` | ~80 | Check feriado |
| `Tab4_Validations/WeekCheck.tsx` | ~80 | Check semana |
| `Tab4_Validations/TeacherAbsenceCheck.tsx` | ~80 | Check ausencia maestro |
| `Tab4_Validations/ConfigDisplay.tsx` | ~100 | Mostrar configuración |
| `Tab4_Validations/AllowedStatusesDisplay.tsx` | ~100 | Estados permitidos |
| **TOTAL** | **~4,500 líneas** | Componentes UI |

---

### 🆕 **shared/attendance/** (7 componentes)

| Archivo | Propósito |
|---------|-----------|
| `AttendanceStatusBadge.tsx` | Badge coloreado por status |
| `AttendanceStatusSelect.tsx` | Select reutilizable de status |
| `DateRangePicker.tsx` | Selector de rango de fechas |
| `SectionSelector.tsx` | Selector de sección |
| `StudentInfo.tsx` | Card con info del estudiante |
| `StatusIndicator.tsx` | Indicador visual (presente/ausente) |
| `AttendanceLoading.tsx` | Skeleton loader |

---

### 🆕 **hooks/data/attendance/** (5 hooks)

| Hook | Retorna | Usado por |
|------|---------|----------|
| `useAttendance` | data, loading, error, methods | TAB 1, 2 |
| `useAttendanceValidations` | validations, checks | TAB 1, 4 |
| `useAttendanceReport` | report, loading | TAB 3 |
| `useAttendanceFilters` | filters, updateFilter | TAB 2, 3 |
| `useDailyRegistration` | status, register, error | TAB 1 |

---

### 🆕 **services/attendance.service.ts**

```typescript
// Métodos que debe tener:
- getBimester(cycleId, date)
- getHoliday(bimesterId, date)
- getWeek(bimesterId, date)
- getTeacherAbsence(teacherId, date)
- getConfig()
- getAllowedStatuses(roleId)
- registerDaily(data)
- getDailyRegistrationStatus(sectionId, date)
- getSectionAttendance(sectionId, cycleId, date)
- getAttendanceByDate(courseAssignmentId, date)
- updateClassAttendance(classAttendanceId, data)
- bulkUpdateAttendance(data)
- getAttendanceReport(enrollmentId)
- getStudentAttendance(enrollmentId)
- getCycleActive()
```

---

### 🆕 **types/attendance.types.ts**

```typescript
// Principales interfaces:
- AttendanceStatus
- StudentAttendance
- StudentClassAttendance
- StudentAttendanceReport
- ValidationChecks
- AttendanceFilters
- DailyRegistrationData
- BulkUpdateData
- AttendanceConfig
- RoleAttendancePermission
```

---

### 🆕 **schemas/attendance.schema.ts**

```typescript
// Zod schemas para validación:
- CreateAttendanceSchema
- UpdateAttendanceSchema
- DailyRegistrationSchema
- BulkUpdateSchema
- FilterSchema
- DateRangeSchema
```

---

### 🆕 **middleware/api-handler.ts**

```typescript
// Funciones:
- handleApiError()           // Manejo centralizado
- withRetry()               // Reintentos automáticos
- withErrorBoundary()       // Error boundary
- normalizeResponse()       // Normalizar respuestas
- refreshToken()            // Refrescar JWT
```

---

### 🆕 **constants/attendance.constants.ts**

```typescript
// Constantes:
- ATTENDANCE_STATUSES
- TABS (TAB_DAILY, TAB_COURSE, TAB_REPORTS, TAB_VALIDATION)
- PAGINATION (DEFAULT_LIMIT, MAX_LIMIT)
- VALIDATION_MESSAGES
- ERROR_CODES
- SUCCESS_MESSAGES
```

---

### 🆕 **utils/attendance-utils.ts**

```typescript
// Funciones:
- formatStatus(status)
- getStatusColor(status)
- formatDate(date)
- calculateMinutesLate(arrival, threshold)
- getRiskLevel(percentage)
- groupBy(array, key)
- isEarlyExit(departureTime)
```

---

## 🔄 FLUJO DE DATOS

```
Page (attendance/page.tsx)
    ↓
AttendancePageContent (root container)
    ├─ useAttendance (fetch datos)
    ├─ useState (tab activo)
    └─ renders AttendanceTabs
        ├─ Tab1: DailyRegistrationForm
        │   ├─ ValidationChecks (6 validaciones)
        │   ├─ StudentGrid (tabla estudiantes)
        │   ├─ RegistrationSummary (resumen)
        │   └─ POST /daily-registration
        │
        ├─ Tab2: CourseManagementForm
        │   ├─ CourseSelector
        │   ├─ EditableAttendanceGrid
        │   │   ├─ StudentAttendanceRow[]
        │   │   └─ PATCH /class/:id
        │   └─ BulkUpdateDialog
        │       └─ PATCH /bulk-update
        │
        ├─ Tab3: ReportsContainer
        │   ├─ StudentSelector
        │   ├─ ReportCard (GET /report/:id)
        │   ├─ AttendanceChart (visualización)
        │   └─ AttendanceTable (historial)
        │
        └─ Tab4: ValidationsChecker
            ├─ BimesterCheck (GET /bimester/by-date)
            ├─ HolidayCheck (GET /holiday/by-date)
            ├─ WeekCheck (GET /week/by-date)
            ├─ TeacherAbsenceCheck (GET /teacher-absence/:id)
            ├─ ConfigDisplay (GET /config/active)
            └─ AllowedStatusesDisplay (GET /status/allowed/role/:id)

API Layer (services/attendance.service.ts)
    ↓
HTTP Client (axios + middleware)
    ↓
Backend API (/api/attendance/*)
```

---

## 📊 RESUMEN ESTADÍSTICAS

| Categoría | Cantidad | Líneas |
|-----------|----------|--------|
| **Componentes Feature** | 26 | ~4,500 |
| **Componentes Shared** | 7 | ~600 |
| **Hooks** | 5 | ~500 |
| **Services** | 1 | ~300 |
| **Types** | 1 | ~400 |
| **Schemas** | 1 | ~200 |
| **Middleware** | 3 | ~250 |
| **Constants** | 1 | ~100 |
| **Utils** | 1 | ~200 |
| **Tests** | ~15 | ~2,000 |
| **TOTAL** | **61 archivos** | **~9,050 líneas** |

---

## 🎯 VENTAJAS DE ESTA ESTRUCTURA

✅ **Escalable** → Agregar funcionalidad es simple  
✅ **Mantenible** → Cambios impactan mínimo  
✅ **Reutilizable** → Shared components se usan en otros módulos  
✅ **Testeable** → Cada layer se testa por separado  
✅ **Limpio** → Imports cortos gracias a barrel exports  
✅ **Type-safe** → TypeScript en todas partes  
✅ **Documentado** → Cada archivo tiene propósito claro  

---

## 📦 DEPENDENCIAS A INSTALAR

```bash
# Ya deberías tener:
- next
- react
- tailwindcss
- shadcn/ui
- typescript
- zod
- react-hook-form

# Nuevas a considerar:
npm install axios                    # HTTP client
npm install recharts                 # Gráficos
npm install date-fns                 # Fechas
npm install clsx                     # Condicional className
npm install zustand                  # Estado global (opcional)
npm install react-query @tanstack/react-query  # Data fetching (opcional)
npm install sonner                   # Toasts (ya lo usas)
npm install vitest                   # Tests
npm install @testing-library/react   # Testing
npm install @testing-library/user-event
npm install msw                      # Mock Service Worker para tests
```

---

## ✨ MEJORAS vs ESTRUCTURA ROLES

| Aspecto | ROLES | ATTENDANCE |
|---------|-------|-----------|
| **Componentes** | 8 | 26 |
| **Hooks** | 1 | 5 |
| **Services** | 2 | 1 |
| **Tipos** | 1 | 1 |
| **Schemas** | Inline | Centralizados |
| **Middleware** | No | Sí |
| **Constants** | No | Sí |
| **Utils** | Inline | Centralizados |
| **Tests** | No | Sí |
| **Context** | No | Sí (opcional) |

---

Este es el blueprint. Listo para implementar. 🚀
