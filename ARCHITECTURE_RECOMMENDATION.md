# 🏗️ Recomendación de Arquitectura: Schedules vs ScheduleConfig

## Análisis de Patrones Existentes

### Modelo de Roles (Referencia Principal)
```
roles/
├── types/
│   └── roles.types.ts          ← 1 único archivo de tipos
├── services/
│   └── roles.service.ts        ← 1 servicio unificado
├── hooks/
│   └── useRoles.ts            ← 1 hook principal
└── components/
    └── RolesPageContent.tsx
```

**Características:**
- ✅ **Tipos centralizados**: Todas las interfaces en un único archivo `roles.types.ts`
- ✅ **Servicio unificado**: `roles.service` maneja TODO (Roles + RolePermissions)
- ✅ **Un solo hook**: `useRoles()` unifica toda la lógica de datos

### Modelo de Schedules (Estado Actual - NO RECOMENDADO)
```
services/
├── schedule.ts                ← Schedules CRUD
└── ScheduleConfig.ts         ← ScheduleConfig CRUD (SEPARADO ❌)

hooks/
├── useSchedule.ts            ← Schedules
├── useScheduleConfig.ts      ← ScheduleConfig (SEPARADO ❌)
└── useScheduleIntegration.ts ← Intentaba unificar (COMPLEJO ❌)

components/schedules/         ← Desorganizado
types/
├── schedules.ts              ← Schedules types
└── schedule-config.ts        ← ScheduleConfig types (SEPARADO ❌)
```

**Problemas:**
- ❌ Tipos en 2 archivos diferentes
- ❌ Servicios separados causan redundancia de lógica
- ❌ 2-3 hooks diferentes dificultan mantenimiento
- ❌ `useScheduleIntegration.ts` intenta arreglar el problema (señal roja)

---

## 🎯 RECOMENDACIÓN: UN MISMO SERVICE

### Opción Elegida: **Modelo Unificado (Tipo Roles)**

**Razón:**
- ScheduleConfig es **1:1 con Section** (no es independiente)
- Schedule **siempre depende de ScheduleConfig** (para grid dinámico)
- Operación típica: "Configurar horarios de una sección" = crear ScheduleConfig + Schedules
- Mezclarlos en servicios separados causa **coordinar 2 servicios en componentes**

### Estructura Propuesta

```
src/
├── types/
│   └── schedules.types.ts          ← ✅ UNIFICADO (Schedules + ScheduleConfig)
│
├── services/
│   └── schedules.service.ts        ← ✅ UNIFICADO
│       ├── getScheduleConfig()
│       ├── createScheduleConfig()
│       ├── updateScheduleConfig()
│       ├── getSchedules()
│       ├── createSchedule()
│       ├── updateSchedule()
│       ├── deleteSchedule()
│       └── batchSaveSchedules()
│
├── hooks/
│   ├── useSchedules.ts            ← ✅ PRINCIPAL (combina Schedules + Config)
│   └── (useScheduleConfig.ts será deprecado)
│
└── components/features/schedules/  ← Estructura mejorada
    ├── index.ts
    ├── SchedulesPageContent.tsx
    ├── calendar/
    │   ├── index.ts
    │   ├── ScheduleGrid.tsx
    │   ├── ScheduleHeader.tsx
    │   ├── ScheduleSidebar.tsx
    │   ├── DroppableTimeSlot.tsx
    │   └── ScheduleConfigModal.tsx
    └── draggable/
        ├── index.ts
        ├── DraggableCourseAssignment.tsx  ← Renombrado
        └── DraggableSchedule.tsx
```

---

## 📋 Comparación: Servicios Separados vs Unificados

### ❌ Servicios Separados (PROBLEMA ACTUAL)

```typescript
// Componente debe coordinar 2 servicios
const config = await scheduleConfigService.getBySection(sectionId);
const schedules = await scheduleService.getBySection(sectionId);

// Si actualiza config, ¿qué pasa con schedules?
// ¿Qué pasa si el cambio de workingDays afecta los schedules existentes?
// → Componente debe manejar lógica compleja

// En pruebas: 2 mocks, 2 servicios, complejidad ↑
```

**Problemas:**
- Componentes deben orquestar 2 servicios
- Cambios en config afectan schedules → lógica dispersa
- Testing duplicado
- Inconsistencias de estado

---

### ✅ Servicio Unificado (RECOMENDADO)

```typescript
// Componente usa UN servicio unificado
const { config, schedules } = await schedulesService.getScheduleData(sectionId);

// Actualizar es atómico
await schedulesService.updateScheduleConfig(sectionId, newConfig);
// → Servicio decide qué hacer con schedules existentes

// En pruebas: 1 mock, 1 servicio, simpler
```

**Ventajas:**
- ✅ Componentes simples (un solo punto de entrada)
- ✅ Lógica de negocio centralizada
- ✅ Cambios atómicos (si config cambia, schedules se adaptan)
- ✅ Testing más simple
- ✅ Mantenimiento fácil

---

## 🔄 Patrón del Service (Estilo Roles)

```typescript
// schedules.service.ts

export const schedulesService = {
  // ========== SCHEDULE CONFIG ==========
  async getScheduleConfigs(query?: ScheduleConfigQuery): Promise<PaginatedScheduleConfigs> {
    // ...
  },

  async getScheduleConfigById(id: number): Promise<ScheduleConfigWithRelations> {
    // ...
  },

  async getScheduleConfigBySection(sectionId: number): Promise<ScheduleConfig> {
    // ...
  },

  async createScheduleConfig(data: CreateScheduleConfigDto): Promise<ScheduleConfig> {
    // Validar, crear, retornar
  },

  async updateScheduleConfig(id: number, data: UpdateScheduleConfigDto): Promise<ScheduleConfig> {
    // Actualizar config
    // Nota: ¿Debo validar schedules existentes?
    // ← Lógica centralizada
  },

  async deleteScheduleConfig(id: number): Promise<void> {
    // ...
  },

  // ========== SCHEDULES ==========
  async getSchedules(filters?: ScheduleFilters): Promise<Schedule[]> {
    // ...
  },

  async getSchedulesBySection(sectionId: number): Promise<Schedule[]> {
    // ...
  },

  async createSchedule(data: ScheduleFormValues): Promise<Schedule> {
    // Validar:
    // - courseAssignmentId válido
    // - No conflictos de maestro
    // - ScheduleConfig existe para la sección
    // ← Lógica centralizada
  },

  async updateSchedule(id: number, data: Partial<ScheduleFormValues>): Promise<Schedule> {
    // ...
  },

  async deleteSchedule(id: number): Promise<void> {
    // ...
  },

  async batchSaveSchedules(schedules: ScheduleFormValues[]): Promise<{ created: Schedule[], updated: Schedule[], deleted: Schedule[] }> {
    // ...
  },

  // ========== OPERACIONES COMPLEJAS ==========
  async getScheduleData(sectionId: number): Promise<{
    config: ScheduleConfig;
    schedules: Schedule[];
    formData: ScheduleFormData;
  }> {
    // Una llamada que trae TODO lo necesario
    // Más eficiente que 3 llamadas separadas
  },

  async validateScheduleConflicts(schedule: ScheduleFormValues, excludeId?: number): Promise<TimeConflict[]> {
    // Lógica centralizada de validación
  }
};
```

---

## 📊 Tipos Unificados

```typescript
// types/schedules.types.ts

// ========== SCHEDULE CONFIG ==========
export interface ScheduleConfig {
  id: number;
  sectionId: number;
  workingDays: DayOfWeek[];
  startTime: string;      // "08:00"
  endTime: string;        // "14:00"
  classDuration: number;  // minutos (45)
  breakSlots: BreakSlot[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleConfigDto {
  sectionId: number;
  workingDays: DayOfWeek[];
  startTime: string;
  endTime: string;
  classDuration: number;
  breakSlots?: BreakSlot[];
}

export interface UpdateScheduleConfigDto {
  workingDays?: DayOfWeek[];
  startTime?: string;
  endTime?: string;
  classDuration?: number;
  breakSlots?: BreakSlot[];
}

// ========== SCHEDULE ==========
export interface Schedule {
  id: number;
  courseAssignmentId: number;  // ✅ CLAVE
  teacherId: number;           // Puede diferir del assignment (sustituciones)
  sectionId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  classroom?: string;
  createdAt: string;
  updatedAt: string;
  // Relaciones
  courseAssignment?: CourseAssignment;
  section?: Section;
}

export interface ScheduleFormValues {
  courseAssignmentId: number;  // ✅ SIEMPRE incluir
  teacherId?: number;          // Opcional (usa del assignment si no se proporciona)
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  classroom?: string;
}

// ========== QUERY TYPES ==========
export interface ScheduleConfigQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'sectionId' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ScheduleFilters {
  sectionId?: number;
  courseAssignmentId?: number;
  teacherId?: number;
  dayOfWeek?: DayOfWeek;
}

export interface PaginatedScheduleConfigs {
  data: ScheduleConfig[];
  meta: PaginationMeta;
}

// ========== FORM DATA ==========
export interface ScheduleFormData {
  courseAssignments: CourseAssignment[];
  scheduleConfig: ScheduleConfig | null;
  existingSchedules: Schedule[];
  sections: Section[];
}
```

---

## 🪝 Hook Unificado

```typescript
// hooks/useSchedules.ts

interface UseSchedulesOptions {
  sectionId?: number;
  autoLoad?: boolean;
}

interface UseSchedulesReturn {
  // Data
  config: ScheduleConfig | null;
  schedules: Schedule[];
  formData: ScheduleFormData | null;

  // Loading
  isLoading: boolean;
  isSubmitting: boolean;

  // Error
  error: string | null;

  // Config actions
  loadConfig: (sectionId: number) => Promise<void>;
  createConfig: (data: CreateScheduleConfigDto) => Promise<ScheduleConfig | null>;
  updateConfig: (id: number, data: UpdateScheduleConfigDto) => Promise<ScheduleConfig | null>;
  deleteConfig: (id: number) => Promise<boolean>;

  // Schedule actions
  loadSchedules: (sectionId: number) => Promise<void>;
  createSchedule: (data: ScheduleFormValues) => Promise<Schedule | null>;
  updateSchedule: (id: number, data: Partial<ScheduleFormValues>) => Promise<Schedule | null>;
  deleteSchedule: (id: number) => Promise<boolean>;
  batchSave: (schedules: ScheduleFormValues[]) => Promise<boolean>;

  // Utilities
  validateConflicts: (schedule: ScheduleFormValues) => Promise<TimeConflict[]>;
  refreshAll: () => Promise<void>;
}

export function useSchedules(options: UseSchedulesOptions = {}): UseSchedulesReturn {
  // Un solo hook que coordina TODO
  // Internamente llama a schedulesService unificado
}
```

---

## 🗂️ Estructura de Carpetas

```
src/components/features/schedules/
├── index.ts
├── SchedulesPageContent.tsx      ← Punto de entrada
├── README.md
├── calendar/
│   ├── index.ts
│   ├── ScheduleGrid.tsx
│   ├── ScheduleHeader.tsx
│   ├── ScheduleSidebar.tsx       ← Ahora muestra CourseAssignments
│   ├── DroppableTimeSlot.tsx
│   └── ScheduleConfigModal.tsx
└── draggable/
    ├── index.ts
    ├── DraggableCourseAssignment.tsx  ← Renombrado (era DraggableCourse)
    └── DraggableSchedule.tsx
```

---

## 🎬 Plan de Migración

### PASO 0: Preparar (Hoy)
1. ✅ Decidir arquitectura → **UNIFICADA** (este documento)
2. Crear `types/schedules.types.ts` con todas las interfaces
3. Crear `services/schedules.service.ts` con todos los métodos

### PASO 1-9: (Próximos pasos)
1. Crear estructura `features/schedules`
2. Migrar componentes de calendar
3. Refactorizar drag-and-drop
4. Actualizar ScheduleSidebar
5. Migrar componente principal
6. Crear índices
7. Actualizar imports
8. Documentación
9. Verificar errores y pruebas

---

## ✅ Decisión Final

### Recomendación: **UN MISMO SERVICE (schedules.service.ts)**

**Por qué:**
1. **Simplicidad**: Componentes usan UN punto de entrada
2. **Mantenibilidad**: Lógica centralizada, fácil de entender
3. **Consistencia**: Patrón igual a roles.service.ts
4. **Eficiencia**: Operaciones atómicas (config + schedules)
5. **Testing**: Más fácil de mockear y testear

**Estructura:**
- `types/schedules.types.ts` ← TODAS las interfaces
- `services/schedules.service.ts` ← TODAS las operaciones
- `hooks/useSchedules.ts` ← UN hook principal
- `components/features/schedules/` ← Componentes organizados

---

## 🚀 Próximo Paso
¿Procedemos con esta estructura? Comenzamos creando:
1. `types/schedules.types.ts` completo
2. `services/schedules.service.ts` completo
3. `hooks/useSchedules.ts` completo

Luego migramos componentes con esta base sólida.
