# Estructura de Componentes - Roles

## Descripción General
Conjunto de componentes para la gestión de roles en la aplicación. Utiliza un sistema modular con componentes reutilizables de UI (Card, Badge, Button, Dialog, etc.) y servicios centralizados.

---

## 📑 Tabla de Contenidos

1. [Archivos y Estructura](#archivos-y-estructura)
2. [Dependencias Principales](#dependencias-principales)
3. [Hooks Personalizados](#-hooks-personalizados)
4. [Types](#-types)
5. [Services](#-services)
6. [Estructura de Ubicaciones](#-estructura-de-ubicaciones)
7. [Árbol de Rutas](#-árbol-de-rutas)
8. [Flujo de Datos](#flujo-de-datos-general)
9. [Tabla Props y Callbacks](#-tabla-de-props-y-callbacks)
10. [Flujos Detallados](#-flujos-detallados)
11. [Notas Técnicas](#notas-técnicas)

---

## Archivos y Estructura

### 📄 index.ts
**Punto de entrada (barrel export)** - Facilita imports limpios desde otros módulos

**Exporta:** RolesPageContent, RolesGrid, RoleCard, RoleFilters, RoleStats, RoleDetailDialog, DeleteRoleDialog, RoleForm

---

### 🖼️ RolesPageContent.tsx (199 líneas)
**Contenedor principal - Cliente**
- Estado: Tab activo, rol siendo editado
- Hook: useRoles para gestionar datos
- Funcionalidad: Tabs (lista/formulario), integración de todos los componentes

**Props:** Ninguno (componente root)

---

### 📋 RolesGrid.tsx (219 líneas)
**Grilla de visualización paginada - Cliente**

**Props:**
```typescript
interface RolesGridProps {
  roles: (Role & { _count?: { users: number; permissions: number } })[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  onPageChange: (page: number) => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  onUpdate?: () => void;
  onEdit?: (roleId: number) => void;
}
```

---

### 🗂️ RoleCard.tsx (410 líneas)
**Tarjeta individual de rol - Cliente**

**Props:**
```typescript
interface RoleCardProps {
  role: Role & { _count?: { users: number; permissions: number } };
  onUpdate?: () => void;
  onEdit?: (roleId: number) => void;
}
```

**Callbacks:** onUpdate(), onEdit(roleId)
**Features:** Dropdown acciones, badges, tooltips, contadores

---

### 🔍 RoleFilters.tsx (418 líneas)
**Panel de filtrado y búsqueda - Cliente**

**Props:**
```typescript
interface RoleFiltersProps {
  query: RolesQuery;
  onQueryChange: (query: Partial<RolesQuery>) => void;
  onReset: () => void;
  totalResults?: number;
}
```

**Callbacks:** onQueryChange(query), onReset()
**Features:** Búsqueda, filtros estado/tipo, ordenamiento, reset

---

### 📊 RoleStats.tsx (99 líneas)
**Tarjetas de estadísticas - Cliente**

**Props:**
```typescript
interface RoleStatsProps {
  total: number;      // Total de roles
  active: number;     // Roles activos
  inactive: number;   // Roles inactivos
  system: number;     // Roles del sistema
}
```

---

### 📝 RoleForm.tsx (725 líneas)
**Formulario creación/edición - Cliente**

**Props:**
```typescript
interface RoleFormProps {
  roleId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}
```

**Callbacks:** onSuccess(), onCancel()
**Features:** Validación Zod + React Hook Form, gestión de permisos, acordeones

---

### 👁️ RoleDetailDialog.tsx (374 líneas)
**Modal de detalle - Cliente**

**Props:**
```typescript
interface RoleDetailDialogProps {
  roleId: number;
  open: boolean;
  onClose: () => void;
}
```

**Callbacks:** onClose()
**Features:** Información completa, permisos, auditoría, ScrollArea

---

### 🗑️ DeleteRoleDialog.tsx (125 líneas)
**Modal de confirmación - Cliente**

**Props:**
```typescript
interface DeleteRoleDialogProps {
  role: Role;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
```

**Callbacks:** onClose(), onSuccess()

---

## Dependencias Principales

| Tipo | Módulos |
|------|---------|
| **UI Components** | Card, Badge, Button, Dialog, Select, Input, Switch, Checkbox, Tabs, Textarea, Alert, ScrollArea, Accordion |
| **Icons** | lucide-react (Shield, Users, Key, Eye, Edit, Trash2, etc.) |
| **Services** | rolesService, permissionsService |
| **Hooks** | useRoles |
| **Validation** | react-hook-form, zod |
| **Notifications** | sonner (toast) |
| **Config** | theme.config.ts |

---

## 🪝 Hooks Personalizados

### useRoles (src/hooks/data/useRoles.ts)
**Gestiona estado y fetching de roles paginados con filtros**

```typescript
function useRoles(initialQuery?: RolesQuery)

// Retorna:
{
  data: PaginatedRoles | null,
  isLoading: boolean,
  error: string | null,
  query: RolesQuery,
  updateQuery: (newQuery: Partial<RolesQuery>) => void,
  refresh: () => void
}
```

**Features:**
- Fetching automático al cambiar query
- Prevención de memory leaks (isMounted)
- Manejo de errores
- Refresh manual
- Lógica debounce en queries

---

## 📦 Types (src/types/roles.types.ts)

### RoleType
```typescript
type RoleType = 'ADMIN' | 'TEACHER' | 'COORDINATOR' | 'PARENT' | 'STUDENT' | 'STAFF' | 'CUSTOM'
```

### Role (Base)
```typescript
interface Role {
  id: number;
  name: string;
  description: string | null;
  roleType: RoleType;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: number | null;
  modifiedById: number | null;
}
```

### RoleWithRelations
```typescript
interface RoleWithRelations extends Role {
  permissions: RolePermission[];
  _count: { users: number; permissions: number };
  createdBy?: { id: number; givenNames: string; lastNames: string };
  modifiedBy?: { id: number; givenNames: string; lastNames: string };
}
```

### RolePermission
```typescript
interface RolePermission {
  permissionId: number;
  scope: 'all' | 'own' | 'grade' | 'section';
  metadata?: Record<string, any>;
  createdAt: string;
  permission: {
    id: number;
    module: string;
    action: string;
    description: string | null;
    isActive: boolean;
  };
}
```

### RolesQuery (Búsqueda)
```typescript
interface RolesQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isSystem?: boolean;
  roleType?: RoleType;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
```

### PaginatedRoles
```typescript
interface PaginatedRoles {
  data: Role[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### RoleStats
```typescript
interface RoleStats {
  totalPermissions: number;
  permissionsByModule: Record<string, number>;
  userCount: number;
  lastModified: string;
}
```

### DTOs
```typescript
interface CreateRoleDto {
  name: string;
  description?: string;
  roleType: RoleType;
  isActive?: boolean;
  permissions?: AssignPermissionDto[];
}

interface UpdateRoleDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

interface AssignPermissionDto {
  permissionId: number;
  scope?: 'all' | 'own' | 'grade' | 'section';
  metadata?: Record<string, any>;
}
```

---

## 🔌 Services

### rolesService (src/services/roles.service.ts)

| Método | Descripción | Retorna |
|--------|-------------|---------|
| getRoleTypes() | Tipos de roles disponibles | RoleTypeInfo[] |
| getRoles(query) | Roles paginados + filtros | PaginatedRoles |
| getRoleById(id) | Un rol con relaciones | RoleWithRelations |
| getRoleStats(id) | Estadísticas del rol | RoleStats |
| createRole(data) | Crear nuevo rol | Role |
| updateRole(id, data) | Actualizar rol | Role |
| deleteRole(id) | Eliminar rol | void |
| assignPermission(roleId, dto) | Asignar permiso | RolePermission |
| assignMultiplePermissions(roleId, dto) | Múltiples permisos | RolePermission[] |
| removeMultiplePermissions(roleId, dto) | Remover permisos | void |

**Usado en:** RoleForm, RoleDetailDialog, DeleteRoleDialog

### permissionsService

| Método | Usado en |
|--------|----------|
| getPermissions(query) | RoleForm (cargar opciones) |

---

## 📍 Estructura de Ubicaciones

```
src/
├── hooks/data/useRoles.ts
├── services/
│   ├── roles.service.ts
│   └── permissions.service.ts
├── types/roles.types.ts
└── components/features/roles/
    ├── index.ts
    ├── RolesPageContent.tsx
    ├── RolesGrid.tsx
    ├── RoleCard.tsx
    ├── RoleFilters.tsx
    ├── RoleStats.tsx
    ├── RoleForm.tsx
    ├── RoleDetailDialog.tsx
    ├── DeleteRoleDialog.tsx
    └── ESTRUCTURA.md
```

---

## 🛣️ Árbol de Rutas

### Navegación Next.js
```
/admin/management/roles
  └── src/app/(admin)/(management)/roles/page.tsx
      └── RolesPageContent
          ├── Tabs (list/form)
          │   ├── List: RoleStats + RoleFilters + RolesGrid
          │   └── Form: RoleForm (create/edit)
          └── ProtectedPage (verificación permisos)
```

### Archivo Página
```typescript
import { RolesPageContent } from '@/components/features/roles/RolesPageContent';

export const metadata = {
  title: 'Roles | Sistema de Gestión',
  description: 'Gestión de roles y permisos del sistema',
};

export default function RolesPage() {
  return <RolesPageContent />;
}
```

---

## Flujo de Datos General

```
RolesPageContent
├── RoleStats (muestra métricas)
├── RoleFilters (búsqueda/filtrado)
├── RolesGrid (lista paginada)
│   └── RoleCard[] (items individuales)
│       ├── RoleDetailDialog (ver detalles)
│       └── DeleteRoleDialog (confirmar eliminación)
└── RoleForm (crear/editar)
```

---

## 📊 Tabla de Props y Callbacks

| Componente | Recibe Props | Callbacks | Estado | API |
|-----------|--------|-----------|--------|-----|
| RolesPageContent | ✗ | - | tab, id | useRoles |
| RolesGrid | ✓ | onPageChange, onClearFilters, onUpdate, onEdit | - | - |
| RoleCard | ✓ | onUpdate, onEdit | showDetail, showEdit, showDelete | - |
| RoleFilters | ✓ | onQueryChange, onReset | search, filters | - |
| RoleStats | ✓ | - | - | - |
| RoleForm | ✓ | onSuccess, onCancel | permisos, validación | rolesService, permissionsService |
| RoleDetailDialog | ✓ | onClose | role, stats | rolesService |
| DeleteRoleDialog | ✓ | onClose, onSuccess | isLoading | rolesService |

---

## 🔄 Flujos Detallados

### 1. Carga Inicial
```
RolesPageContent monta
  ↓ useRoles(initialQuery)
  ↓ rolesService.getRoles()
  ↓ RolesPageContent recibe { data, isLoading, error }
  ↓ Renderiza: RoleStats + RoleFilters + RolesGrid
```

### 2. Búsqueda/Filtrado
```
RoleFilters: usuario interactúa
  ↓ onQueryChange(newQuery)
  ↓ RolesPageContent: updateQuery()
  ↓ useRoles detecta cambio
  ↓ rolesService.getRoles(newQuery)
  ↓ RolesGrid se actualiza
```

### 3. Edición
```
RoleCard: usuario hace clic "Editar"
  ↓ onEdit(roleId)
  ↓ RolesPageContent: setEditingRoleId(roleId)
  ↓ setActiveTab('form')
  ↓ RoleForm carga: rolesService.getRoleById()
  ↓ Usuario modifica y guarda
  ↓ rolesService.updateRole()
  ↓ onSuccess() → refresh() → tab='list'
```

### 4. Eliminación
```
RoleCard: usuario hace clic "Eliminar"
  ↓ DeleteRoleDialog abre (open=true)
  ↓ Usuario confirma
  ↓ rolesService.deleteRole(id)
  ↓ onSuccess() → refresh()
  ↓ RolesGrid se actualiza
```

### 5. Creación
```
RolesPageContent: tab='form'
  ↓ RoleForm sin roleId
  ↓ Usuario completa formulario
  ↓ rolesService.createRole(data)
  ↓ onSuccess() → refresh() → tab='list'
```

---

## Notas Técnicas

- ✅ Todos componentes **client-side** ('use client')
- ✅ **TypeScript** tipado completo
- ✅ **Servicios centralizados** para API calls
- ✅ **Temas dinámicos** via configuración
- ✅ **Manejo de errores** consistente
- ✅ **Protección de rutas** con ProtectedPage
- ✅ **Layout groups** (admin) y (management)
- ✅ **Metadata** para SEO en página
- ✅ **Paginación** integrada en useRoles
- ✅ **Validación** con Zod en formularios
- ✅ **Notificaciones** con Sonner toast
- ✅ **Memory leak prevention** en useRoles

---

## 🌳 Árbol Completo de Estructura

```
ids-fronted/
├── src/
│   ├── app/
│   │   └── (admin)/
│   │       ├── layout.tsx
│   │       └── (management)/
│   │           ├── layout.tsx
│   │           ├── roles/
│   │           │   ├── page.tsx                 [🎯 PUNTO DE ENTRADA]
│   │           │   └── layout.tsx (si existe)
│   │           ├── users/
│   │           ├── permissions/
│   │           ├── courses/
│   │           └── ... [otras rutas]
│   │
│   ├── components/
│   │   ├── features/
│   │   │   └── roles/
│   │   │       ├── index.ts                     [Barrel export]
│   │   │       ├── RolesPageContent.tsx         [🖼️ Contenedor principal]
│   │   │       ├── RolesGrid.tsx                [📋 Grilla paginada]
│   │   │       ├── RoleCard.tsx                 [🗂️ Tarjeta individual]
│   │   │       ├── RoleFilters.tsx              [🔍 Panel filtrado]
│   │   │       ├── RoleStats.tsx                [📊 Estadísticas]
│   │   │       ├── RoleForm.tsx                 [📝 Formulario]
│   │   │       ├── RoleDetailDialog.tsx         [👁️ Modal detalles]
│   │   │       ├── DeleteRoleDialog.tsx         [🗑️ Modal eliminar]
│   │   │       └── ESTRUCTURA.md                [📖 Este archivo]
│   │   │
│   │   ├── shared/
│   │   │   ├── permissions/
│   │   │   │   ├── ProtectedPage.tsx
│   │   │   │   ├── ProtectedButton.tsx
│   │   │   │   └── ...
│   │   │   ├── feedback/
│   │   │   │   ├── ErrorAlert.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   └── ...
│   │   │   └── ...
│   │   │
│   │   └── ui/
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── tabs.tsx
│   │       ├── scroll-area.tsx
│   │       ├── accordion.tsx
│   │       └── ...
│   │
│   ├── hooks/
│   │   ├── data/
│   │   │   ├── useRoles.ts                      [🪝 Hook roles]
│   │   │   ├── useUsers.ts
│   │   │   ├── usePermissions.ts
│   │   │   └── ...
│   │   ├── useGoBack.ts
│   │   ├── useLoginForm.ts
│   │   ├── useUser.ts
│   │   └── ...
│   │
│   ├── services/
│   │   ├── roles.service.ts                     [🔌 Service roles]
│   │   ├── permissions.service.ts
│   │   ├── users.service.ts
│   │   ├── courses.service.ts
│   │   ├── auth.service.ts
│   │   └── ...
│   │
│   ├── types/
│   │   ├── roles.types.ts                       [📦 Types roles]
│   │   ├── permissions.types.ts
│   │   ├── users.types.ts
│   │   ├── courses.types.ts
│   │   ├── auth.types.ts
│   │   └── ...
│   │
│   ├── schemas/
│   │   ├── Roles.ts
│   │   ├── Permissions.ts
│   │   ├── Users.ts
│   │   ├── Courses.ts
│   │   └── ...
│   │
│   ├── context/
│   │   ├── RoleContext.tsx
│   │   ├── AuthContext.tsx
│   │   ├── UserContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── ...
│   │
│   ├── config/
│   │   ├── api.ts
│   │   ├── theme.config.ts
│   │   ├── school-cycles.config.ts
│   │   └── ...
│   │
│   ├── utils/
│   │   ├── handleApiError.ts
│   │   ├── ... [utilidades]
│   │   └── ...
│   │
│   ├── constants/
│   │   ├── attendanceStatuses.ts
│   │   ├── rolesTable.ts
│   │   └── ...
│   │
│   ├── layout.tsx                               [Layout raíz]
│   ├── page.tsx                                 [Home]
│   ├── not-found.tsx
│   ├── globals.css
│   ├── middleware.ts
│   └── svg.d.ts
│
├── public/
│   ├── images/
│   ├── icons/
│   └── ...
│
├── components.json                              [Shadcn config]
├── eslint.config.mjs
├── next.config.ts
├── next-env.d.ts
├── package.json
├── postcss.config.js
├── prettier.config.js
├── tsconfig.json
├── schema.prisma
├── jsvectormap.d.ts
├── LICENSE
├── README.md
└── project-structure.json
```

---

## 📊 Resumen de Estructura Roles

### Contenedor Principal
```
src/app/(admin)/(management)/roles/
└── page.tsx
    └── RolesPageContent (el contenedor que gestiona todo)
```

### Componentes (9 archivos)
```
src/components/features/roles/
├── index.ts                    [Barrel export - re-exporta todos]
├── RolesPageContent.tsx        [Componente raíz con Tabs]
├── RolesGrid.tsx               [Grilla con paginación]
├── RoleCard.tsx                [Tarjeta individual]
├── RoleFilters.tsx             [Panel de búsqueda/filtros]
├── RoleStats.tsx               [Métricas/estadísticas]
├── RoleForm.tsx                [Formulario crear/editar]
├── RoleDetailDialog.tsx        [Modal de detalles]
└── DeleteRoleDialog.tsx        [Modal de confirmación]
```

### Datos y Lógica
```
src/
├── hooks/data/
│   └── useRoles.ts             [Fetching y state management]
│
├── services/
│   └── roles.service.ts        [API calls]
│
└── types/
    └── roles.types.ts          [Tipos e interfaces]
```

### Dependencias Internas
```
API Layer (services/)
    ↑
Data Layer (hooks/ + types/)
    ↑
Component Layer (components/features/roles/)
    ↑
Page Layer (app/(admin)/(management)/roles/)
```

### Flujo de Importaciones
```
page.tsx (RolesPage)
    ↓ imports
RolesPageContent (root container)
    ├─ imports useRoles hook
    ├─ renders RoleStats
    ├─ renders RoleFilters
    ├─ renders RolesGrid
    │   ├─ renders RoleCard[]
    │   │   ├─ RoleDetailDialog
    │   │   └─ DeleteRoleDialog
    │   └─ pagination logic
    ├─ renders RoleForm (tab 2)
    └─ all use types from roles.types.ts
       and call rolesService methods

rolesService.ts (API client)
    ├─ calls /api/roles endpoints
    ├─ uses types from roles.types.ts
    └─ handles responses/errors

useRoles hook
    ├─ calls rolesService.getRoles()
    ├─ manages state (data, loading, error)
    └─ returns to RolesPageContent
```

### Casos de Uso
```
1. VER LISTA DE ROLES
   RolesPageContent → useRoles → rolesService.getRoles()
   → RolesGrid → RoleCard[]

2. BUSCAR/FILTRAR
   RoleFilters → onQueryChange() → updateQuery()
   → useRoles re-fetch → RolesGrid actualiza

3. VER DETALLES
   RoleCard → RoleDetailDialog → rolesService.getRoleById()

4. CREAR ROL
   RolesPageContent tab=form → RoleForm
   → rolesService.createRole() → refresh() → tab=list

5. EDITAR ROL
   RoleCard → onEdit() → setEditingRoleId() → RoleForm
   → rolesService.getRoleById() + rolesService.updateRole()

6. ELIMINAR ROL
   RoleCard → DeleteRoleDialog → rolesService.deleteRole()
   → refresh() → RolesGrid actualiza
```

---

## 📈 Estadísticas

| Categoría | Cantidad | Líneas |
|-----------|----------|--------|
| **Componentes** | 8 | ~2,100 |
| **Hooks** | 1 | ~70 |
| **Services** | 2 | ~400+ |
| **Types** | 1 | ~123 |
| **Total** | 12 archivos | ~2,700+ líneas |

---

## 🔗 Dependencias Entre Archivos

```
RolesPageContent.tsx
├─ imports: useRoles, RoleStats, RoleFilters, RolesGrid, RoleForm, ProtectedPage
├─ types: RolesQuery, PaginatedRoles
└─ uses: hook estado, tab management

RolesGrid.tsx
├─ imports: RoleCard
├─ types: Role, RolesGridProps
└─ props: roles[], callbacks

RoleCard.tsx
├─ imports: RoleDetailDialog, DeleteRoleDialog, ProtectedButton
├─ types: Role, RoleCardProps
└─ callbacks: onUpdate, onEdit

RoleFilters.tsx
├─ types: RolesQuery, RoleFiltersProps
└─ callbacks: onQueryChange, onReset

RoleStats.tsx
├─ types: RoleStatsProps
└─ props: metrics (total, active, inactive, system)

RoleForm.tsx
├─ imports: rolesService, permissionsService
├─ types: CreateRoleDto, UpdateRoleDto, RoleFormProps
└─ callbacks: onSuccess, onCancel

RoleDetailDialog.tsx
├─ imports: rolesService
├─ types: RoleWithRelations, RoleStats, RoleDetailDialogProps
└─ callbacks: onClose

DeleteRoleDialog.tsx
├─ imports: rolesService
├─ types: Role, DeleteRoleDialogProps
└─ callbacks: onClose, onSuccess

useRoles.ts
├─ imports: rolesService
├─ types: RolesQuery, PaginatedRoles
└─ returns: data, isLoading, error, query, updateQuery, refresh

rolesService.ts
├─ types: Role, RoleWithRelations, RoleStats, DTOs, etc.
└─ API endpoints: /api/roles/*

permissionsService.ts
└─ API endpoints: /api/permissions/*

roles.types.ts
└─ exports: Role, RoleWithRelations, RolesQuery, DTOs, etc.
```
