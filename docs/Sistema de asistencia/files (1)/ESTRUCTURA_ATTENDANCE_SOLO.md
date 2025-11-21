# 📁 ESTRUCTURA DEL MÓDULO ATTENDANCE

**Solo la carpeta `features/attendance/` y sus dependencias**

---

## 🎯 ÁRBOL COMPLETO

```
src/
├── app/
│   └── (admin)/
│       └── (management)/
│           └── attendance/
│               ├── page.tsx                          [🎯 Entrada principal]
│               └── layout.tsx (opcional)
│
├── components/
│   └── features/
│       └── attendance/                               [📦 MÓDULO PRINCIPAL]
│           ├── index.ts                              [Barrel export]
│           │
│           ├── AttendancePageContent.tsx             [Contenedor raíz]
│           ├── AttendanceTabs.tsx                    [Tabs navigation]
│           │
│           ├── Tab1_DailyRegistration/               [TAB 1]
│           │   ├── index.ts
│           │   ├── DailyRegistrationForm.tsx         [Contenedor form]
│           │   ├── ValidationChecks.tsx              [6 validaciones]
│           │   ├── StudentGrid.tsx                   [Tabla estudiantes]
│           │   ├── RegistrationSummary.tsx           [Resumen + botón]
│           │   └── StatusSelector.tsx                [Dropdown status]
│           │
│           ├── Tab2_CourseManagement/                [TAB 2]
│           │   ├── index.ts
│           │   ├── CourseManagementForm.tsx          [Contenedor form]
│           │   ├── CourseSelector.tsx                [Selector curso]
│           │   ├── EditableAttendanceGrid.tsx        [Tabla editable]
│           │   ├── StudentAttendanceRow.tsx          [Fila editable]
│           │   ├── BulkUpdateDialog.tsx              [Modal bulk update]
│           │   └── AttendanceHistoryModal.tsx        [Historial cambios]
│           │
│           ├── Tab3_Reports/                         [TAB 3]
│           │   ├── index.ts
│           │   ├── ReportsContainer.tsx              [Contenedor reports]
│           │   ├── StudentSelector.tsx               [Selector estudiante]
│           │   ├── ReportCard.tsx                    [Tarjeta resumen]
│           │   ├── AttendanceChart.tsx               [Gráfico asistencia]
│           │   ├── AttendanceTable.tsx               [Tabla historial]
│           │   └── RiskIndicator.tsx                 [Indicador riesgo]
│           │
│           ├── Tab4_Validations/                     [TAB 4]
│           │   ├── index.ts
│           │   ├── ValidationsChecker.tsx            [Contenedor validaciones]
│           │   ├── BimesterCheck.tsx                 [Check bimestre]
│           │   ├── HolidayCheck.tsx                  [Check feriado]
│           │   ├── WeekCheck.tsx                     [Check semana]
│           │   ├── TeacherAbsenceCheck.tsx           [Check ausencia]
│           │   ├── ConfigDisplay.tsx                 [Mostrar config]
│           │   └── AllowedStatusesDisplay.tsx        [Estados permitidos]
│           │
│           └── ESTRUCTURA.md                         [Este archivo]
│
├── shared/
│   └── attendance/                                   [Componentes reutilizables]
│       ├── AttendanceStatusBadge.tsx                 [Badge de estado]
│       ├── AttendanceStatusSelect.tsx                [Select de estado]
│       ├── DateRangePicker.tsx                       [Rango de fechas]
│       ├── SectionSelector.tsx                       [Selector sección]
│       ├── StudentInfo.tsx                           [Info estudiante]
│       ├── StatusIndicator.tsx                       [Indicador visual]
│       └── AttendanceLoading.tsx                     [Loading skeleton]
│
├── hooks/
│   └── data/
│       └── attendance/                               [Hooks de asistencia]
│           ├── index.ts                              [Barrel export]
│           ├── useAttendance.ts                      [Hook principal]
│           ├── useAttendanceValidations.ts           [Validaciones]
│           ├── useAttendanceReport.ts                [Reportes]
│           ├── useAttendanceFilters.ts               [Filtros]
│           └── useDailyRegistration.ts               [Registro diario]
│
├── services/
│   └── attendance.service.ts                         [API calls]
│
├── types/
│   └── attendance.types.ts                           [Interfaces]
│
├── schemas/
│   └── attendance.schema.ts                          [Zod schemas]
│
├── middleware/
│   ├── api-handler.ts                                [Manejo errores API]
│   ├── response-interceptor.ts                       [Interceptor respuestas]
│   └── error-interceptor.ts                          [Interceptor errores]
│
├── constants/
│   └── attendance.constants.ts                       [Constantes]
│
├── utils/
│   └── attendance-utils.ts                           [Helper functions]
│
└── context/
    └── AttendanceContext.tsx                         [Context global - opcional]
```

---

## 📊 DESGLOSE POR CARPETA

### 🎯 **app/(admin)/(management)/attendance/** (2 archivos)
```
attendance/
├── page.tsx              [Página principal - Importa AttendancePageContent]
└── layout.tsx (opcional) [Layout específico de asistencia]
```

**Responsabilidad:** Enrutamiento y punto de entrada Next.js

---

### 📦 **components/features/attendance/** (26 archivos)

#### Estructura base (3 archivos)
```
├── index.ts                    [Exporta todos]
├── AttendancePageContent.tsx   [Contenedor principal con tabs]
└── AttendanceTabs.tsx          [Navegación entre tabs]
```

#### TAB 1: Registro Diario (6 archivos)
```
Tab1_DailyRegistration/
├── index.ts
├── DailyRegistrationForm.tsx   [Form principal]
├── ValidationChecks.tsx        [6 validaciones previas]
├── StudentGrid.tsx             [Tabla con 30+ estudiantes]
├── RegistrationSummary.tsx     [Resumen y botón registrar]
└── StatusSelector.tsx          [Dropdown de estados]
```

#### TAB 2: Gestión por Curso (7 archivos)
```
Tab2_CourseManagement/
├── index.ts
├── CourseManagementForm.tsx    [Form principal]
├── CourseSelector.tsx          [Selector curso/fecha]
├── EditableAttendanceGrid.tsx  [Tabla editable]
├── StudentAttendanceRow.tsx    [Fila editable]
├── BulkUpdateDialog.tsx        [Modal para cambios masivos]
└── AttendanceHistoryModal.tsx  [Historial de cambios]
```

#### TAB 3: Reportes (7 archivos)
```
Tab3_Reports/
├── index.ts
├── ReportsContainer.tsx        [Form principal]
├── StudentSelector.tsx         [Selector estudiante]
├── ReportCard.tsx              [Tarjeta resumen con métricas]
├── AttendanceChart.tsx         [Gráfico pie/bar]
├── AttendanceTable.tsx         [Tabla historial paginada]
└── RiskIndicator.tsx           [Indicador visual riesgo]
```

#### TAB 4: Validaciones (8 archivos)
```
Tab4_Validations/
├── index.ts
├── ValidationsChecker.tsx      [Form principal]
├── BimesterCheck.tsx           [Validar bimestre]
├── HolidayCheck.tsx            [Validar feriado]
├── WeekCheck.tsx               [Validar semana]
├── TeacherAbsenceCheck.tsx     [Validar ausencia]
├── ConfigDisplay.tsx           [Mostrar configuración]
└── AllowedStatusesDisplay.tsx  [Estados permitidos]
```

**Total TAB components:** 26 archivos + 1 index.ts

---

### 🤝 **shared/attendance/** (7 componentes reutilizables)

Componentes que se usan en múltiples TABs:
```
├── AttendanceStatusBadge.tsx      [Badge con color por status]
├── AttendanceStatusSelect.tsx      [Select reutilizable]
├── DateRangePicker.tsx             [Picker de rango fechas]
├── SectionSelector.tsx             [Selector de sección]
├── StudentInfo.tsx                 [Card info estudiante]
├── StatusIndicator.tsx             [Indicador visual presente/ausente]
└── AttendanceLoading.tsx           [Skeleton loader]
```

---

### 🪝 **hooks/data/attendance/** (5 hooks)

```
├── index.ts                        [Barrel export]
├── useAttendance.ts                [Principal - fetch datos]
├── useAttendanceValidations.ts     [Validaciones 1-8]
├── useAttendanceReport.ts          [Reportes y cálculos]
├── useAttendanceFilters.ts         [Filtros y búsqueda]
└── useDailyRegistration.ts         [Registro diario]
```

**Responsabilidad:** State management + API calls

---

### 🔌 **services/attendance.service.ts** (1 archivo)

Métodos:
```typescript
// Validaciones (6)
- getBimester(cycleId, date)
- getHoliday(bimesterId, date)
- getWeek(bimesterId, date)
- getTeacherAbsence(teacherId, date)
- getConfig()
- getAllowedStatuses(roleId)

// TAB 1 (2)
- registerDaily(data)
- getDailyRegistrationStatus(sectionId, date)

// TAB 2 (4)
- getSectionAttendance(sectionId, cycleId, date)
- getAttendanceByDate(courseAssignmentId, date)
- updateClassAttendance(classAttendanceId, data)
- bulkUpdateAttendance(data)

// TAB 3 (2)
- getAttendanceReport(enrollmentId)
- getStudentAttendance(enrollmentId)

// Util (1)
- getCycleActive()
```

**Total:** 15 métodos

---

### 📦 **types/attendance.types.ts** (1 archivo)

Interfaces principales:
```typescript
interface Role { ... }
interface AttendanceStatus { ... }
interface StudentAttendance { ... }
interface StudentClassAttendance { ... }
interface StudentAttendanceReport { ... }
interface ValidationChecks { ... }
interface AttendanceFilters { ... }
interface DailyRegistrationData { ... }
interface BulkUpdateData { ... }
interface AttendanceConfig { ... }
interface RoleAttendancePermission { ... }
// + DTOs (CreateAttendanceDto, UpdateAttendanceDto, etc)
```

**Total:** 15+ interfaces

---

### 🔐 **schemas/attendance.schema.ts** (1 archivo)

Esquemas Zod para validación:
```typescript
export const CreateAttendanceSchema = z.object({ ... })
export const UpdateAttendanceSchema = z.object({ ... })
export const DailyRegistrationSchema = z.object({ ... })
export const BulkUpdateSchema = z.object({ ... })
export const FilterSchema = z.object({ ... })
export const DateRangeSchema = z.object({ ... })
```

**Total:** 6 esquemas

---

### 🛡️ **middleware/** (3 archivos)

```
├── api-handler.ts            [Manejo centralizado de errores]
├── response-interceptor.ts    [Normalizar respuestas]
└── error-interceptor.ts       [Capturar errores HTTP]
```

**Responsabilidad:** Capa entre services y componentes

---

### 📋 **constants/attendance.constants.ts** (1 archivo)

```typescript
export const ATTENDANCE_STATUSES = { ... }
export const TABS = { ... }
export const PAGINATION = { ... }
export const VALIDATION_MESSAGES = { ... }
export const ERROR_CODES = { ... }
export const SUCCESS_MESSAGES = { ... }
```

---

### 🛠️ **utils/attendance-utils.ts** (1 archivo)

Helper functions:
```typescript
export function formatStatus(status: string) { ... }
export function getStatusColor(status: string) { ... }
export function formatDate(date: string) { ... }
export function calculateMinutesLate(arrival, threshold) { ... }
export function getRiskLevel(percentage: number) { ... }
export function groupBy(array, key) { ... }
export function isEarlyExit(departureTime) { ... }
```

---

### 🎭 **context/AttendanceContext.tsx** (1 archivo - opcional)

Para compartir estado entre TABs sin Props Drilling:
```typescript
export const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined)
export const AttendanceProvider = ({ children }) => { ... }
export const useAttendanceContext = () => { ... }
```

---

## 📊 RESUMEN NUMÉRICO

| Categoría | Cantidad | Archivos |
|-----------|----------|----------|
| **Componentes Feature** | 26 | feature/attendance/ |
| **Componentes Shared** | 7 | shared/attendance/ |
| **Hooks** | 5 | hooks/data/attendance/ |
| **Service** | 1 | services/ |
| **Types** | 1 | types/ |
| **Schemas** | 1 | schemas/ |
| **Middleware** | 3 | middleware/ |
| **Constants** | 1 | constants/ |
| **Utils** | 1 | utils/ |
| **Context** | 1 | context/ |
| **TOTAL** | **47 archivos** | **Módulo completo** |

---

## 🔗 DEPENDENCIAS INTERNAS

```
page.tsx (attendance/page.tsx)
    ↓ imports
AttendancePageContent
    ├─ imports: useAttendance, AttendanceTabs
    ├─ manages: activeTab, selectedRoleId
    └─ renders: AttendanceTabs
        ├─ Tab1: DailyRegistrationForm
        │   ├─ ValidationChecks
        │   ├─ StudentGrid
        │   │   └─ StatusSelector (shared)
        │   └─ RegistrationSummary
        ├─ Tab2: CourseManagementForm
        │   ├─ CourseSelector
        │   ├─ EditableAttendanceGrid
        │   │   └─ StudentAttendanceRow
        │   │       └─ AttendanceStatusSelect (shared)
        │   └─ BulkUpdateDialog
        ├─ Tab3: ReportsContainer
        │   ├─ StudentSelector
        │   ├─ ReportCard
        │   ├─ AttendanceChart
        │   └─ AttendanceTable
        └─ Tab4: ValidationsChecker
            ├─ BimesterCheck
            ├─ HolidayCheck
            ├─ WeekCheck
            ├─ TeacherAbsenceCheck
            ├─ ConfigDisplay
            └─ AllowedStatusesDisplay

All components:
├─ import from: hooks/data/attendance/
├─ use: types from types/attendance.types.ts
├─ call: attendance.service.ts methods
├─ validate with: schemas/attendance.schema.ts
└─ use: utils/attendance-utils.ts helpers
```

---

## ⏱️ ORDEN DE CREACIÓN RECOMENDADO

1. **Types** - `attendance.types.ts` (define interfaces primero)
2. **Schemas** - `attendance.schema.ts` (validación)
3. **Service** - `attendance.service.ts` (API calls)
4. **Hooks** - `hooks/data/attendance/` (5 hooks)
5. **Middleware** - `middleware/` (manejo errores)
6. **Constants** - `constants/attendance.constants.ts`
7. **Utils** - `utils/attendance-utils.ts`
8. **Shared Components** - `shared/attendance/` (7 componentes)
9. **TAB 4** - `Tab4_Validations/` (más simple)
10. **TAB 1** - `Tab1_DailyRegistration/` (lo más importante)
11. **TAB 2** - `Tab2_CourseManagement/`
12. **TAB 3** - `Tab3_Reports/`
13. **Principal** - `AttendancePageContent.tsx`

---

## 📁 COPIAR-PEGAR RÁPIDO

Si quieres crear toda la estructura de una vez:

```bash
# Crea las carpetas
mkdir -p src/components/features/attendance/{Tab1_DailyRegistration,Tab2_CourseManagement,Tab3_Reports,Tab4_Validations}
mkdir -p src/components/shared/attendance
mkdir -p src/hooks/data/attendance
mkdir -p src/services
mkdir -p src/types
mkdir -p src/schemas
mkdir -p src/middleware
mkdir -p src/constants
mkdir -p src/utils
mkdir -p src/context

# Crea los archivos
touch src/app/\(admin\)/\(management\)/attendance/page.tsx
touch src/app/\(admin\)/\(management\)/attendance/layout.tsx
touch src/components/features/attendance/index.ts
touch src/components/features/attendance/AttendancePageContent.tsx
touch src/components/features/attendance/AttendanceTabs.tsx
# ... etc (ver lista arriba)
```

---

**Listo. Este es el árbol completo del módulo de asistencia.** ✅

Úsalo como referencia mientras codeas.
