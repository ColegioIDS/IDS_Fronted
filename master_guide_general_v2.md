# 📚 MASTER GUIDE: Sistema de Gestión Académica

**Última actualización:** 2025-01-27  
**Versión:** 2.0 - Arquitectura General + Patrones Implementados  
**Aplicable a:** Todos los módulos del sistema

---

## 📋 ÍNDICE

1. [Contexto del Proyecto](#contexto-del-proyecto)
2. [Arquitectura General](#arquitectura-general)
3. [Sistema de Colores y Theming](#sistema-de-colores-y-theming)
4. [Estructura de Archivos](#estructura-de-archivos)
5. [Sistema de Errores Mejorado](#sistema-de-errores-mejorado)
6. [Patrones de Implementación](#patrones-de-implementación)
7. [Permisos y Seguridad](#permisos-y-seguridad)
8. [Componentes Genéricos](#componentes-genéricos)
9. [Convenciones y Nomenclatura](#convenciones-y-nomenclatura)
10. [Checklist para Nuevos Módulos](#checklist-para-nuevos-módulos)

---

## 🎯 CONTEXTO DEL PROYECTO

**Stack Tecnológico:**
- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** NestJS + Prisma + PostgreSQL
- **Autenticación:** JWT con cookies HTTP-only
- **Estado:** Context API + Custom Hooks
- **Validación:** Zod
- **Toasts:** Sonner
- **Icons:** Lucide React

**Módulos del Sistema:**
- ✅ Ciclos Escolares (School Cycles) - COMPLETADO
- ⏳ Bimestres, Grados, Estudiantes, Profesores, Padres, Cursos, Asistencia, Calificaciones, Horarios, etc.

---

## 🏗️ ARQUITECTURA GENERAL

### Principios Fundamentales

1. **Separación de Responsabilidades**
   - Services: Lógica de API + validación
   - Hooks: Manejo de datos + estado
   - Componentes: UI + presentación
   - Contextos: Estado global

2. **Validación en Capas**
   - Client: Zod schemas
   - API: Axios interceptors
   - Backend: NestJS decorators

3. **Manejo de Errores Centralizado**
   - `handleApiError.ts`: Extrae mensaje + detalles
   - Muestra toast automáticamente
   - Retorna objeto para UI

4. **Dark Mode Obligatorio**
   - Todos los componentes soportan dark mode
   - Paleta centralizada en `theme.config.ts`
   - Clases `dark:` en todo el código

5. **Permisos en Múltiples Niveles**
   - `ProtectedPage`: Protege ruta completa
   - `ProtectedContent`: Protege UI específica
   - `ProtectedButton`: Protege botones
   - Verificación programática: `hasPermission()`

---

## 🎨 SISTEMA DE COLORES Y THEMING

### Paleta Centralizada

**Ubicación:** `src/config/theme.config.ts`

```typescript
export const APP_THEME = {
  colors: {
    // Brand colors (Azul y Morado)
    primary: { 50-900: '#eff6ff' → '#1e3a8a' },    // Blue
    secondary: { 50-900: '#f5f3ff' → '#4c1d95' },  // Purple
    
    // Semantic colors
    success: { light: '#d1fae5', main: '#10b981', dark: '#047857', text: '#065f46' },
    warning: { light: '#fef3c7', main: '#f59e0b', dark: '#d97706', text: '#92400e' },
    error: { light: '#fee2e2', main: '#ef4444', dark: '#dc2626', text: '#991b1b' },
    info: { light: '#dbeafe', main: '#3b82f6', dark: '#1e40af', text: '#1e3a8a' },
    
    // Módulos (cada uno con color único)
    modules: {
      user: 'blue',
      role: 'purple',
      permission: 'indigo',
      student: 'emerald',
      teacher: 'cyan',
      parent: 'teal',
      course: 'rose',
      attendance: 'pink',
      grade: 'amber',
      schedule: 'violet',
      enrollment: 'orange',
      section: 'fuchsia',
      'school-cycle': 'blue',  // Ejemplo: School Cycles
      default: 'gray'
    },
    
    // Acciones CRUD
    actions: {
      create: 'emerald',  // Verde
      read: 'blue',       // Azul
      update: 'amber',    // Amarillo/Naranja
      delete: 'red',      // Rojo
      manage: 'purple',   // Morado
      'read-one': 'sky',
      'archive': 'gray',  // Nuevo: Archive
      export: 'teal',
      import: 'orange'
    },
    
    // Estados
    statusExtended: {
      active: 'green',
      inactive: 'gray',
      system: 'purple',
      pending: 'yellow',
      archived: 'gray'  // Nuevo: Archived
    }
  },
  
  // Roles UI
  roles: {
    admin: 'purple',
    teacher: 'blue',
    student: 'green',
    parent: 'amber'
  },
  
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
  radius: { sm: '0.375rem', md: '0.5rem', lg: '0.75rem', full: '9999px' }
};

// Helpers
getModuleTheme(module: string)   // Retorna tema del módulo
getActionTheme(action: string)   // Retorna tema de acción
getStatusTheme(status: string)   // Retorna tema de estado
getRoleTheme(role: string)       // Retorna tema de rol
```

### Patrón de Color para Tailwind

```typescript
// Cada color tiene estos patrones:
- bg: 'bg-[color]-50 dark:bg-[color]-950/30'
- bgHover: 'hover:bg-[color]-100 dark:hover:bg-[color]-950/50'
- text: 'text-[color]-700 dark:text-[color]-300'
- border: 'border-[color]-200 dark:border-[color]-800'
- icon: 'text-[color]-600 dark:text-[color]-400'
- gradient: 'from-[color]-500 to-[color]-600'
- badge: 'bg-[color]-100 text-[color]-800 dark:bg-[color]-900/40 dark:text-[color]-300'
```

---

## 📁 ESTRUCTURA DE ARCHIVOS (OBLIGATORIA)

### Árbol Completo

```
src/
├── app/                              # Next.js App Router
│   ├── (admin)/                      # Route group protegido
│   │   ├── (management)/             # CRUD operations
│   │   │   ├── students/
│   │   │   ├── users/
│   │   │   ├── courses/
│   │   │   └── school-cycles/        # Ejemplo: Ciclos Escolares
│   │   ├── (academic)/               # Academic operations
│   │   │   ├── attendance/
│   │   │   ├── grades/
│   │   │   └── schedules/
│   │   └── layout.tsx
│   ├── (auth)/                       # Authentication
│   │   ├── signin/
│   │   └── signup/
│   └── layout.tsx
│
├── components/
│   ├── ui/                           # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── badge.tsx
│   │   └── ... (solo shadcn/ui)
│   │
│   ├── shared/                       # Componentes compartidos
│   │   ├── permissions/              # Permission system
│   │   │   ├── ProtectedPage.tsx
│   │   │   ├── ProtectedContent.tsx
│   │   │   ├── ProtectedButton.tsx
│   │   │   └── NoPermissionCard.tsx
│   │   ├── feedback/                 # Feedback UI
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── ErrorAlert.tsx
│   │   ├── layout/                   # Layout components
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/                       # Custom UI (no shadcn)
│   │       ├── RoleBadge.tsx
│   │       ├── PermissionBadge.tsx
│   │       ├── StatusBadge.tsx
│   │       └── ModuleBadge.tsx
│   │
│   └── features/                     # Business features (módulos)
│       ├── school-cycles/            # Ejemplo: Ciclos Escolares
│       │   ├── SchoolCyclePageContent.tsx
│       │   ├── SchoolCycleGrid.tsx
│       │   ├── SchoolCycleCard.tsx
│       │   ├── SchoolCycleFilters.tsx
│       │   ├── SchoolCycleStats.tsx
│       │   ├── SchoolCycleDetailDialog.tsx
│       │   ├── SchoolCycleForm.tsx
│       │   ├── ArchiveReasonDialog.tsx
│       │   └── index.ts
│       ├── students/
│       ├── teachers/
│       ├── courses/
│       └── permissions/
│
├── hooks/
│   ├── data/                         # Data fetching hooks
│   │   ├── useSchoolCycles.ts        # Ejemplo
│   │   ├── useStudents.ts
│   │   ├── useCourses.ts
│   │   └── usePermissions.ts
│   ├── features/                     # Business logic hooks
│   │   ├── useAttendanceLogic.ts
│   │   └── useScheduleManager.ts
│   └── ui/                           # UI interaction hooks
│       ├── useModal.ts
│       ├── usePagination.ts
│       └── useDebounce.ts
│
├── services/                         # API calls (axios)
│   ├── api/
│   │   ├── client.ts                 # Axios config with validateStatus
│   │   ├── interceptors.ts           # Request/response interceptors
│   │   └── endpoints.ts              # Centralized endpoints
│   ├── school-cycle.service.ts       # Ejemplo
│   ├── student.service.ts
│   ├── permission.service.ts
│   └── [entity].service.ts
│
├── contexts/                         # Context API
│   ├── global/
│   │   ├── auth.context.tsx
│   │   ├── theme.context.tsx
│   │   └── sidebar.context.tsx
│   └── features/                     # Per-feature contexts
│       ├── attendance/
│       └── courses/
│
├── types/                            # TypeScript types
│   ├── api.types.ts
│   ├── auth.types.ts
│   ├── permissions.types.ts
│   ├── school-cycle.types.ts         # Ejemplo
│   └── [entity].types.ts
│
├── schemas/                          # Zod validation schemas
│   ├── auth.schema.ts
│   ├── user.schema.ts
│   ├── school-cycle.schema.ts        # Ejemplo
│   └── [entity].schema.ts
│
├── utils/                            # Utilities
│   ├── handleApiError.ts             # ✅ IMPORTANTE: Error handling
│   ├── dates.ts                      # Date utilities (centralizado)
│   ├── strings.ts
│   ├── validation.ts
│   └── cn.ts                         # classnames helper
│
├── lib/
│   └── (utilities moved to utils/)
│
└── config/
    ├── api.ts                        # ✅ CRÍTICO: validateStatus: () => true
    ├── theme.config.ts               # Color palette
    ├── constants.ts                  # App constants
    └── [module].config.ts            # Per-module config (ej: school-cycles.config.ts)
```

---

## 🚨 SISTEMA DE ERRORES MEJORADO

### 1. Configuración API (CRÍTICO)

**Archivo:** `src/config/api.ts`

```typescript
import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 30000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  validateStatus: () => true,  // ⚠️ CRÍTICO: Retorna TODAS las respuestas
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use((response) => response);

export { api };
```

**¿Por qué `validateStatus: () => true`?**
- Sin esto: Status 400-599 → axios LANZA excepción, no accedes a response.data
- Con esto: Status 400-599 → retorna response, puedes validar response.data.success

---

### 2. Manejo Centralizado

**Archivo:** `src/utils/handleApiError.ts`

```typescript
import { toast } from 'sonner';

interface HandledError {
  message: string;
  details: string[];
}

export function handleApiError(
  error: any,
  defaultMessage = 'Error inesperado'
): HandledError {
  let message = defaultMessage;
  let details: string[] = [];

  // Extraer del response del backend
  if (error.response?.data) {
    const data = error.response.data;
    message = data.message || message;
    details = Array.isArray(data.details) ? data.details : [];
  } else if (error.message) {
    message = error.message;
  }

  // Mostrar toast automáticamente
  toast.error(message, {
    description: details.length > 0 ? details[0] : undefined,
    duration: 5000,
  });

  return { message, details };
}

export function handleApiSuccess(message: string, details?: string[]) {
  toast.success(message, {
    description: details?.[0],
    duration: 3000,
  });
}
```

---

### 3. Uso en Componentes

```typescript
// En catch blocks
catch (err: any) {
  const handled = handleApiError(err, 'Error al guardar');
  setGlobalError({
    title: 'Error al guardar',
    message: handled.message,
    details: handled.details,  // Array de detalles
  });
}

// En JSX
{globalError && (
  <ErrorAlert
    title={globalError.title}
    message={globalError.message}
    details={globalError.details}
  />
)}
```

---

## 🔧 PATRONES DE IMPLEMENTACIÓN

### 1. Service Pattern

```typescript
// src/services/[entity].service.ts
import { api } from '@/config/api';

export const entityService = {
  async getAll(query = {}): Promise<PaginatedResponse> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });

    const response = await api.get(`/api/entity?${params.toString()}`);

    // ✅ VALIDACIÓN OBLIGATORIA
    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error') as any;
      error.response = { data: response.data };
      throw error;
    }

    const data = Array.isArray(response.data.data) ? response.data.data : [];
    const meta = response.data.meta || { page: 1, limit: 10, total: 0, totalPages: 0 };

    return { data, meta };
  },

  async getById(id: number): Promise<Entity> {
    const response = await api.get(`/api/entity/${id}`);
    
    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error') as any;
      error.response = { data: response.data };
      throw error;
    }

    return response.data.data;
  },

  async create(data: CreateDto): Promise<Entity> {
    const response = await api.post('/api/entity', data);
    
    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error') as any;
      error.response = { data: response.data };
      throw error;
    }

    return response.data.data;
  },

  async update(id: number, data: UpdateDto): Promise<Entity> {
    const response = await api.patch(`/api/entity/${id}`, data);
    
    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error') as any;
      error.response = { data: response.data };
      throw error;
    }

    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    const response = await api.delete(`/api/entity/${id}`);
    
    if (!response.data?.success) {
      const error = new Error(response.data?.message || 'Error') as any;
      error.response = { data: response.data };
      throw error;
    }
  },
};
```

---

### 2. Custom Hook Pattern

```typescript
// src/hooks/data/use[Entity].ts
import { useState, useEffect, useCallback } from 'react';
import { entityService } from '@/services/entity.service';

export function useEntity(initialQuery = {}) {
  const [data, setData] = useState<Entity[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(initialQuery);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await entityService.getAll(query);
      setData(result.data);
      setMeta(result.meta);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
      console.error('Error loading data:', err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateQuery = useCallback((newQuery: Partial<typeof query>) => {
    setQuery((prev) => ({ ...prev, ...newQuery, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => loadData(), [loadData]);

  return { data, meta, isLoading, error, query, updateQuery, setPage, refresh };
}
```

---

### 3. Dialog Pattern (NUEVO: Archive/Modal)

```typescript
// src/components/features/[entity]/[Entity]ReasonDialog.tsx
interface ReasonDialogProps {
  entity: Entity | null;
  open: boolean;
  onConfirm: (reason: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  dialogTitle: string;
  dialogDescription: string;
  reasonLabel: string;
  buttonLabel: string;
}

export function ReasonDialog({
  entity,
  open,
  onConfirm,
  onCancel,
  isLoading = false,
  dialogTitle,
  dialogDescription,
  reasonLabel,
  buttonLabel,
}: ReasonDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (reason.length > 500) {
      setError('Máximo 500 caracteres');
      return;
    }
    setError(null);
    await onConfirm(reason);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        setReason('');
        setError(null);
        onCancel();
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{reasonLabel}</Label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
              maxLength={500}
              placeholder="Razón (opcional)"
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            />
            <p className="text-xs text-gray-600">{reason.length} / 500</p>
          </div>
          {error && <p className="text-sm text-red-600">⚠️ {error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Procesando...' : buttonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### 4. PageContent Orchestrator Pattern

```typescript
// src/components/features/[entity]/[Entity]PageContent.tsx
export function EntityPageContent() {
  const { hasPermission } = usePermissions();
  const { data, meta, isLoading, error, query, updateQuery, setPage, refresh } = useEntity();
  
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [entityToAction, setEntityToAction] = useState<Entity | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [globalError, setGlobalError] = useState<ApiError | null>(null);

  // Permisos
  const canRead = hasPermission('entity', 'read');
  const canCreate = hasPermission('entity', 'create');
  const canUpdate = hasPermission('entity', 'update');
  const canDelete = hasPermission('entity', 'delete');
  const canArchive = hasPermission('entity', 'archive');

  // Handlers
  const handleFilterChange = useCallback((filters: Partial<Query>) => {
    updateQuery(filters);
  }, [updateQuery]);

  const handleEdit = useCallback((entity: Entity) => {
    setEditingEntity(entity);
    setFormDialogOpen(true);
  }, []);

  const handleArchiveClick = useCallback((entity: Entity) => {
    setEntityToAction(entity);
    setActionDialogOpen(true);
  }, []);

  const handleArchiveConfirm = useCallback(
    async (reason: string) => {
      if (!entityToAction) return;
      try {
        setActionLoading(true);
        setGlobalError(null);
        await entityService.archive(entityToAction.id, reason);
        refresh();
        setActionDialogOpen(false);
        setEntityToAction(null);
      } catch (err: any) {
        const handled = handleApiError(err, 'Error al archivar');
        setGlobalError({
          title: 'Error',
          message: handled.message,
          details: handled.details,
        });
      } finally {
        setActionLoading(false);
      }
    },
    [entityToAction, refresh]
  );

  if (!canRead) {
    return <NoPermissionCard title="Acceso Denegado" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Título del Módulo</h1>
        <ProtectedContent module="entity" action="create" hideOnNoPermission>
          <Button onClick={() => setFormDialogOpen(true)}>Crear</Button>
        </ProtectedContent>
      </div>

      {/* Stats */}
      <EntityStats data={data} isLoading={isLoading} />

      {/* Errors */}
      {error && <ErrorAlert title="Error" message={error} />}
      {globalError && <ErrorAlert {...globalError} />}

      {/* Filters */}
      <EntityFilters onFilterChange={handleFilterChange} isLoading={isLoading || actionLoading} />

      {/* Grid */}
      <EntityGrid
        data={data}
        isLoading={isLoading}
        onEdit={canUpdate ? handleEdit : undefined}
        onArchive={canArchive ? handleArchiveClick : undefined}
        onViewDetails={(entity) => {
          setSelectedEntity(entity);
          setDetailDialogOpen(true);
        }}
      />

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <Pagination meta={meta} onPageChange={setPage} isLoading={isLoading} />
      )}

      {/* Dialogs */}
      <EntityFormDialog
        open={formDialogOpen}
        entity={editingEntity}
        onSuccess={() => {
          setFormDialogOpen(false);
          setEditingEntity(null);
          refresh();
        }}
        onCancel={() => setFormDialogOpen(false)}
        isLoading={actionLoading}
      />

      <EntityDetailDialog
        entity={selectedEntity}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

      <ArchiveReasonDialog
        entity={entityToAction}
        open={actionDialogOpen}
        onConfirm={handleArchiveConfirm}
        onCancel={() => {
          setActionDialogOpen(false);
          setEntityToAction(null);
        }}
        isLoading={actionLoading}
      />
    </div>
  );
}
```

---

## 🔐 PERMISOS Y SEGURIDAD

### Niveles de Protección

**1. Página Completa**
```tsx
<ProtectedPage module="entity" action="read">
  <EntityPageContent />
</ProtectedPage>
```

**2. Contenido Condicional**
```tsx
<ProtectedContent module="entity" action="create" hideOnNoPermission>
  <CreateButton />
</ProtectedContent>
```

**3. Botón Específico**
```tsx
<ProtectedButton module="entity" action="delete" onClick={handleDelete}>
  Eliminar
</ProtectedButton>
```

**4. Lógica Programática**
```tsx
const { hasPermission } = usePermissions();
const canDelete = hasPermission('entity', 'delete');

if (canDelete) {
  // Mostrar botón
}
```

### Permisos Estándar por Módulo

| Permiso | Scope | Ejemplo |
|---------|-------|---------|
| `[module]:read` | Listar + ver | `school-cycle:read` |
| `[module]:read-one` | Ver detalles | `school-cycle:read-one` |
| `[module]:create` | Crear nuevo | `school-cycle:create` |
| `[module]:update` | Editar | `school-cycle:update` |
| `[module]:delete` | Eliminar | `school-cycle:delete` |
| `[module]:archive` | Archivar/Cerrar | `school-cycle:archive` |
| `[module]:manage` | Control total | `school-cycle:manage` |

---

## 🎨 COMPONENTES GENÉRICOS DISPONIBLES

### EmptyState
```tsx
import { EmptyState, EmptySearchResults, EmptyDataState } from '@/components/shared/feedback/EmptyState';

<EmptySearchResults onClearFilters={handleClear} />
<EmptyDataState title="No hay registros" onCreate={handleCreate} />
<EmptyState variant="info" title="Título" description="Descripción" />
```

### Protected Components
```tsx
<ProtectedPage module="entity" action="read">...</ProtectedPage>
<ProtectedContent module="entity" action="create">...</ProtectedContent>
<ProtectedButton module="entity" action="delete">...</ProtectedButton>
<NoPermissionCard title="Acceso Denegado" />
```

### Badges
```tsx
<RoleBadge roleName="admin" size="md" showIcon />
<PermissionBadge action="create" size="sm" />
<StatusBadge status="active" />
<ModuleBadge module="school-cycle" />
```

### Feedback
```tsx
<ErrorAlert title="Error" message="Mensaje" details={[...]} />
<LoadingSpinner />
<EmptyState variant="info" />
```

---

## 📋 CONVENCIONES Y NOMENCLATURA

### Archivos

```typescript
// Componentes: PascalCase.tsx
✅ SchoolCycleForm.tsx
✅ PermissionCard.tsx
✅ ArchiveReasonDialog.tsx

// Hooks: useCamelCase.ts
✅ useSchoolCycles.ts
✅ usePermissions.ts
✅ useModal.ts

// Services: camelCase.service.ts
✅ school-cycle.service.ts
✅ permission.service.ts
✅ student.service.ts

// Types: camelCase.types.ts
✅ school-cycle.types.ts
✅ permission.types.ts

// Schemas: camelCase.schema.ts
✅ school-cycle.schema.ts
✅ auth.schema.ts

// Utils: camelCase.ts
✅ handleApiError.ts
✅ dates.ts
✅ validation.ts

// Contexts: camelCase.context.tsx
✅ auth.context.tsx
✅ theme.context.tsx
```

### Código

```typescript
// NO usar prefijos "new"
❌ newCycleContext.tsx
✅ cycle.context.tsx

// NO numerar archivos
❌ utils2.ts
❌ dates2.ts
✅ dates.ts (centralizado)

// Usar singular para services
✅ school-cycle.service.ts (no school-cycles.service.ts)

// Usar plural para types
✅ school-cycle.types.ts
```

---

## 📁 ESTRUCTURA DE FEATURE COMPLETA

**Cada módulo debe tener esta estructura:**

```
features/[entity]/
├── [Entity]PageContent.tsx      # Componente principal (orquestador)
├── [Entity]Grid.tsx             # Grid/Lista con paginación
├── [Entity]Card.tsx             # Card individual
├── [Entity]Filters.tsx          # Filtros avanzados
├── [Entity]Stats.tsx            # Tarjetas de estadísticas
├── [Entity]DetailDialog.tsx     # Modal de detalles
├── [Entity]Form.tsx             # Formulario (create/update)
├── [Entity]ReasonDialog.tsx     # Dialog para razón (archive/close/etc)
└── index.ts                     # Barrel export (para imports limpios)
```

**Ejemplo con School Cycles:**
```
features/school-cycles/
├── SchoolCyclePageContent.tsx
├── SchoolCycleGrid.tsx
├── SchoolCycleCard.tsx
├── SchoolCycleFilters.tsx
├── SchoolCycleStats.tsx
├── SchoolCycleDetailDialog.tsx
├── SchoolCycleForm.tsx
├── ArchiveReasonDialog.tsx
└── index.ts
```

---

## 🎯 ANTIPATRONES (EVITAR)

```typescript
❌ NO crear archivos con prefijos "new"
   newCycleContext.tsx → ✅ cycle.context.tsx

❌ NO numerar archivos
   utils2.ts, dates2.ts → ✅ dates.ts (centralizado)

❌ NO mezclar hooks en services/
   services/useHook.ts → ✅ hooks/data/useHook.ts

❌ NO duplicar utilidades
   3 archivos de dates → ✅ 1 archivo centralizado

❌ NO hardcodear colores
   bg-blue-500 → ✅ getModuleTheme('module').bg

❌ NO crear contexts innecesarios
   Máximo 10 contexts globales

❌ NO ignorar validaciones de API
   Siempre validar response.data.success

❌ NO olvidar dark mode
   Todos los componentes deben soportarlo

❌ NO usar 'any'
   any → ✅ tipos específicos

❌ NO repetir código
   DRY principle - Reutilizar componentes
```

---

## ⚡ OPTIMIZACIONES Y MEJORES PRÁCTICAS

### Performance

```typescript
// 1. React.memo para componentes pesados
const HeavyComponent = React.memo(({ data }: Props) => {
  return <div>{data}</div>;
});

// 2. useCallback para funciones en dependencias
const handleClick = useCallback(() => {
  doSomething(data);
}, [data]);

// 3. useMemo para cálculos costosos
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// 4. Lazy loading de rutas
const Page = lazy(() => import('./Page'));
```

### UX

```typescript
// 1. Loading states
{isLoading ? <Skeleton /> : <Content />}

// 2. Error boundaries
<ErrorBoundary>
  <Component />
</ErrorBoundary>

// 3. Optimistic updates
setState(optimisticValue);
service.update(id, data).catch(() => setState(previousValue));

// 4. Debounce en búsquedas
const debouncedSearch = useDebounce(searchTerm, 500);

// 5. Scroll to top al cambiar página
useEffect(() => window.scrollTo(0, 0), [page]);
```

### Accesibilidad

```typescript
// 1. aria-labels en iconos
<Icon aria-label="Eliminar" />

// 2. role en elementos interactivos
<div role="button" onClick={handleClick} />

// 3. Keyboard navigation
<input onKeyDown={(e) => {
  if (e.key === 'Enter') handleSubmit();
}} />

// 4. Focus states visibles
<button className="focus:outline-2 focus:outline-blue-500" />
```

---

## 🧪 TESTING MANUAL CHECKLIST

### Por cada nuevo módulo

```
CRUD OPERATIONS:
☐ Crear nuevo registro
☐ Editar registro existente
☐ Ver detalles completos
☐ Eliminar/Archivar registro
☐ Listar con paginación

FILTROS Y BÚSQUEDA:
☐ Filtro por nombre/búsqueda
☐ Filtro por estado
☐ Ordenamiento ascendente/descendente
☐ Limpiar filtros

PERMISOS:
☐ Usuario sin permisos ve NoPermissionCard
☐ Usuario con permisos puede acceder
☐ Botones protegidos se ocultan/deshabilitan

ERROR HANDLING:
☐ Error API muestra mensaje
☐ Error API muestra detalles
☐ Toast aparece con error
☐ ErrorAlert se renderiza correctamente

UX/UI:
☐ Dark mode funciona completamente
☐ Responsive en mobile (375px)
☐ Responsive en tablet (768px)
☐ Responsive en desktop (1920px)
☐ Loading states muestran skeletons
☐ Empty states se muestran correctamente
☐ Animaciones suaves (no jarring)

DIALOGS:
☐ Dialog abre al hacer clic
☐ Dialog se cierra al cancelar
☐ Dialog se cierra al confirmar
☐ Form valida antes de enviar
☐ Contador de caracteres funciona

VALIDACIÓN:
☐ Campos requeridos validan
☐ Máximo de caracteres valida
☐ Formato de email valida
☐ Errores muestran por campo
```

---

## 📞 PROMPT DE CONTINUACIÓN

Para iniciar trabajo en nuevo módulo:

```
Estoy trabajando en un Sistema de Gestión Académica con Next.js 15 + TypeScript.

**Arquitectura establecida:**
- Frontend: Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Backend: NestJS + Prisma + PostgreSQL
- Autenticación: JWT con cookies HTTP-only

**Convenciones implementadas:**
- Estructura: features/ (negocio), shared/ (compartido), ui/ (base shadcn)
- Services: Validación obligatoria de response.data.success
- Errores: handleApiError centralizado + toasts automáticos
- Colores: theme.config.ts con helpers
- Permisos: ProtectedPage, ProtectedContent, ProtectedButton
- Dark mode: Soporte completo en todo
- API Config: validateStatus: () => true en axios

**Módulos completados:**
- ✅ School Cycles (con Archive Dialog)

**Módulo a crear:**
- [NOMBRE DEL MÓDULO]

**Endpoints disponibles:**
- [LISTAR ENDPOINTS DEL BACKEND]

**Necesito:**
1. Types en school-cycle.types.ts
2. Schema Zod en school-cycle.schema.ts
3. Service con validación
4. Hook personalizado
5. Componentes: PageContent, Grid, Card, Filters, Stats, DetailDialog, Form
6. Página en app/(admin)/(management)/[entity]/page.tsx

Por favor, sigue las convenciones establecidas y usa los patrones del módulo School Cycles como referencia.
```

---

## 🚀 MÓDULOS EN PIPELINE

```
✅ COMPLETADOS:
   - School Cycles (con Archive Dialog, Validación Centralizada)

⏳ EN PROGRESO:
   - (Próximo módulo a determinar)

⏭️ PRÓXIMOS:
   - Bimestres (depends on: School Cycles)
   - Grados
   - Estudiantes
   - Profesores
   - Padres
   - Cursos
   - Asistencia
   - Calificaciones
   - Horarios
   - Matrículas
   - Secciones
```

---

## 📚 RECURSOS Y DOCUMENTACIÓN

### Dependencias

```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "typescript": "^5.3.0",
  "tailwindcss": "^3.3.0",
  "shadcn/ui": "latest",
  "zod": "^3.22.0",
  "axios": "^1.6.0",
  "sonner": "^1.2.0",
  "lucide-react": "latest",
  "date-fns": "^2.30.0"
}
```

### Documentación Externa

- **Shadcn/ui:** https://ui.shadcn.com/
- **Tailwind CSS:** https://tailwindcss.com/
- **React Hooks:** https://react.dev/reference/react/hooks
- **Zod:** https://zod.dev/
- **Axios:** https://axios-http.com/
- **Date-fns:** https://date-fns.org/
- **Sonner:** https://sonner.emilkowal.ski/
- **Lucide React:** https://lucide.dev/

---

## 🔍 QUICK REFERENCE: Imports Comunes

```typescript
// UI Components (shadcn/ui)
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Shared Components
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { ProtectedContent } from '@/components/shared/permissions/ProtectedContent';
import { ProtectedButton } from '@/components/shared/permissions/ProtectedButton';
import { NoPermissionCard } from '@/components/shared/permissions/NoPermissionCard';
import { ErrorAlert } from '@/components/shared/feedback/ErrorAlert';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { LoadingSpinner } from '@/components/shared/feedback/LoadingSpinner';
import { RoleBadge } from '@/components/shared/ui/RoleBadge';
import { StatusBadge } from '@/components/shared/ui/StatusBadge';

// Hooks
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { useEntity } from '@/hooks/data/useEntity';

// Services
import { entityService } from '@/services/entity.service';
import { handleApiError, handleApiSuccess } from '@/utils/handleApiError';

// Config
import { getModuleTheme, getActionTheme, getStatusTheme } from '@/config/theme.config';
import { api } from '@/config/api';

// Icons (lucide-react)
import {
  Shield, Users, Eye, Edit, Trash2, Plus, X, Search,
  Calendar, Check, AlertCircle, Info, Lock, Zap
} from 'lucide-react';

// Utils
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
```

---

## ✅ MASTER CHECKLIST FINAL

### Antes de iniciar nuevo módulo

```
PREPARACIÓN:
☐ Endpoints backend documentados
☐ Permisos definidos
☐ Modelos de datos definidos
☐ DTOs backend revisados

TIPOS Y ESQUEMAS:
☐ Types en [entity].types.ts
☐ Schemas Zod en [entity].schema.ts
☐ Validación de campos correcta

SERVICE:
☐ service.[entity].ts creado
☐ Validación response.data.success en todos
☐ Métodos: getAll, getById, create, update, delete, (archive si aplica)
☐ Adjuntar response.data a errores

HOOK:
☐ hooks/data/use[Entity].ts creado
☐ Estados: data, meta, isLoading, error, query
☐ Métodos: updateQuery, setPage, refresh

COMPONENTES:
☐ [Entity]PageContent.tsx (orquestador)
☐ [Entity]Grid.tsx (lista responsiva)
☐ [Entity]Card.tsx (item individual)
☐ [Entity]Filters.tsx (filtros avanzados)
☐ [Entity]Stats.tsx (tarjetas estadísticas)
☐ [Entity]DetailDialog.tsx (modal detalles)
☐ [Entity]Form.tsx (formulario create/update)
☐ [Entity]ReasonDialog.tsx (si aplica archive/close)
☐ index.ts (barrel export)

PÁGINA:
☐ app/(admin)/(management)/[entity]/page.tsx
☐ ProtectedPage envuelve contenido
☐ Metadata correcta

CONFIG:
☐ [entity].config.ts con constantes (opcional)

TESTING:
☐ CRUD completo funciona
☐ Filtros funcionan
☐ Permisos se respetan
☐ Dark mode OK
☐ Responsive OK
☐ Errores se muestran con detalles
☐ Toast aparecen correctamente
```

---

## 🎉 CONCLUSIÓN

Este Master Guide es la referencia única para:
- Arquitectura del proyecto
- Patrones de implementación
- Convenciones de nomenclatura
- Sistema de errores mejorado
- Manejo de permisos
- Mejores prácticas

**Úsalo como template para todos los nuevos módulos.**

---

**Última actualización:** 2025-01-27  
**Versión:** 2.0 - General + Patrones Consolidados  
**Estado:** Listo para producción 🚀