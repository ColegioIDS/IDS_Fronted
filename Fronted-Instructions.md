# 📋 CONTEXTO DEL PROYECTO

Estás trabajando en un **Sistema de Gestión Académica** construido con:
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: NestJS + Prisma + PostgreSQL
- **Autenticación**: JWT con cookies HTTP-only
- **Estado**: Context API + Custom Hooks
- **Validación**: Zod

El proyecto maneja módulos como: usuarios, roles, permisos, estudiantes, profesores, padres, cursos, asistencia, calificaciones, horarios, etc.

---

# 🎨 SISTEMA DE COLORES Y THEMING

## Paleta de Colores Centralizada

**Ubicación**: `src/config/theme.config.ts`
```typescript
export const APP_THEME = {
  colors: {
    // Brand colors (Azul y Morado)
    primary: { 50-900: '#eff6ff' -> '#1e3a8a' }, // Blue
    secondary: { 50-900: '#f5f3ff' -> '#4c1d95' }, // Purple
    
    // Semantic colors
    success: { light: '#d1fae5', main: '#10b981', dark: '#047857', text: '#065f46' },
    warning: { light: '#fef3c7', main: '#f59e0b', dark: '#d97706', text: '#92400e' },
    error: { light: '#fee2e2', main: '#ef4444', dark: '#dc2626', text: '#991b1b' },
    info: { light: '#dbeafe', main: '#3b82f6', dark: '#1e40af', text: '#1e3a8a' },
    
    // Módulos del sistema (12+ módulos con colores únicos)
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
      default: 'gray'
    },
    
    // Acciones CRUD
    actions: {
      create: 'emerald', // Verde
      read: 'blue',      // Azul
      update: 'amber',   // Amarillo/Naranja
      delete: 'red',     // Rojo
      manage: 'purple',  // Morado
      'read-one': 'sky',
      export: 'teal',
      import: 'orange'
    },
    
    // Estados
    statusExtended: {
      active: 'green',
      inactive: 'gray',
      system: 'purple',
      pending: 'yellow'
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

// Helpers disponibles
getModuleTheme(module: string)
getActionTheme(action: string)
getStatusTheme(status: string)
getRoleTheme(role: string)
```

### Patrón de Colores para Tailwind

Cada color tiene:
- `bg`: `bg-[color]-50 dark:bg-[color]-950/30`
- `bgHover`: `hover:bg-[color]-100 dark:hover:bg-[color]-950/50`
- `text`: `text-[color]-700 dark:text-[color]-300`
- `border`: `border-[color]-200 dark:border-[color]-800`
- `icon`: `text-[color]-600 dark:text-[color]-400`
- `gradient`: `from-[color]-500 to-[color]-600`
- `badge`: `bg-[color]-100 text-[color]-800 dark:bg-[color]-900/40 dark:text-[color]-300`

**Soporte completo para Dark Mode en TODOS los componentes.**

---

# 📁 ESTRUCTURA DE ARCHIVOS (OBLIGATORIA)
```
src/
├── app/                              # Next.js App Router
│   ├── (admin)/                      # Route group protegido
│   │   ├── (management)/             # Sub-group CRUD
│   │   │   ├── students/
│   │   │   ├── users/
│   │   │   └── courses/
│   │   ├── (academic)/               # Sub-group académico
│   │   │   ├── attendance/
│   │   │   ├── grades/
│   │   │   └── schedules/
│   │   └── layout.tsx
│   ├── (auth)/                       # Autenticación
│   │   ├── signin/
│   │   └── signup/
│   └── layout.tsx
│
├── components/
│   ├── ui/                           # shadcn/ui components (base)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ... (solo shadcn)
│   │
│   ├── shared/                       # Componentes compartidos
│   │   ├── permissions/              # Sistema de permisos
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
│   │   │   └── ProtectedRoute.tsx
│   │   └── ui/                       # UI custom (no shadcn)
│   │       ├── RoleBadge.tsx
│   │       ├── PermissionBadge.tsx
│   │       └── StatusBadge.tsx
│   │
│   └── features/                     # Features del negocio
│       ├── permissions/
│       │   ├── PermissionsPageContent.tsx
│       │   ├── PermissionsGrid.tsx
│       │   ├── PermissionModuleCard.tsx
│       │   ├── PermissionFilters.tsx
│       │   ├── PermissionStats.tsx
│       │   ├── PermissionDetailDialog.tsx
│       │   └── index.ts
│       ├── students/
│       ├── attendance/
│       └── courses/
│
├── hooks/
│   ├── data/                         # Data fetching hooks
│   │   ├── usePermissions.ts
│   │   ├── useStudents.ts
│   │   └── useCourses.ts
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
│   │   ├── client.ts                 # Axios config
│   │   ├── interceptors.ts
│   │   └── endpoints.ts
│   └── [entity].service.ts           # Por entidad
│
├── contexts/                         # Context API
│   ├── global/
│   │   ├── auth.context.tsx
│   │   ├── theme.context.tsx
│   │   └── sidebar.context.tsx
│   └── features/                     # Por feature
│       ├── attendance/
│       └── courses/
│
├── types/                            # TypeScript types
│   ├── api.types.ts
│   ├── auth.types.ts
│   ├── permissions.types.ts
│   └── [entity].types.ts
│
├── schemas/                          # Zod schemas
│   ├── auth.schema.ts
│   ├── user.schema.ts
│   └── [entity].schema.ts
│
├── lib/
│   ├── utils/                        # Utilidades
│   │   ├── dates.ts                  # Unificado (NO date.ts, dateUtils.ts)
│   │   ├── strings.ts
│   │   └── validation.ts
│   └── cn.ts                         # classnames (shadcn)
│
└── config/
    ├── api.ts                        # Axios instance
    └── theme.config.ts               # Paleta de colores
```

---

# 🎯 CONVENCIONES DE NOMENCLATURA

## Archivos
- **Componentes**: `PascalCase.tsx` → `PermissionCard.tsx`
- **Hooks**: `useCamelCase.ts` → `usePermissions.ts`
- **Services**: `camelCase.service.ts` → `permissions.service.ts`
- **Types**: `camelCase.types.ts` → `permissions.types.ts`
- **Schemas**: `camelCase.schema.ts` → `permissions.schema.ts`
- **Contexts**: `camelCase.context.tsx` → `auth.context.tsx`

## Código
- **NO usar prefijos "new"** → ❌ `newBimesterContext.tsx`
- **NO numerar archivos** → ❌ `utils2.ts`
- **Usar singular para services** → ✅ `permission.service.ts`
- **Usar plural para types** → ✅ `permissions.types.ts`

---

# 🛡️ SISTEMA DE PERMISOS

## Backend (NestJS)
```typescript
@Controller('permissions')
export class PermissionsController {
  @Get()
  @Permissions('permission', 'read')  // ← Decorador
  async findAll(@Query() query: QueryPermissionsDto) { }
}
```

## Frontend - Componentes Protegidos

### 1. Página Completa
```tsx
<ProtectedPage module="permission" action="read">
  <YourContent />
</ProtectedPage>
```

### 2. Contenido Condicional
```tsx
<ProtectedContent 
  module="permission" 
  action="create"
  hideOnNoPermission  // No muestra nada si no tiene permiso
>
  <CreateButton />
</ProtectedContent>
```

### 3. Botón Protegido
```tsx
<ProtectedButton
  module="permission"
  action="delete"
  hideOnNoPermission
  onClick={handleDelete}
>
  Eliminar
</ProtectedButton>
```

### 4. Validación en Lógica
```tsx
const { hasPermission, hasAnyPermission, can } = usePermissions();

if (can.create('student')) {
  // Mostrar botón crear
}

if (hasPermission('permission', 'read')) {
  // Cargar datos
}
```

---

# 🎨 COMPONENTES - GUÍA DE DISEÑO

## Principios
1. **Colorido pero profesional** - Usar gradientes, sombras suaves
2. **Dark mode obligatorio** - Todos los componentes deben soportarlo
3. **Animaciones sutiles** - `hover:scale-[1.01]`, `transition-all duration-300`
4. **Cards con elevación** - `shadow-lg hover:shadow-xl`
5. **Iconos descriptivos** - Usar lucide-react
6. **Badges informativos** - Colores según contexto (action, status, role)

## Patrón de Card Estándar
```tsx
<Card className="overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-all duration-300">
  {/* Header con gradiente */}
  <CardHeader className={`${moduleTheme.bg} border-b border-gray-200 dark:border-gray-700`}>
    <div className="flex items-center gap-3">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${moduleTheme.gradient} shadow-lg`}>
        <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
      </div>
      <div>
        <h3 className={`text-lg font-bold ${moduleTheme.text}`}>Título</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Descripción</p>
      </div>
    </div>
  </CardHeader>
  
  <CardContent className="p-4 bg-white dark:bg-gray-900">
    {/* Contenido */}
  </CardContent>
</Card>
```

## Stats Cards
```tsx
<Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
  <CardContent className="relative p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Label</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">Value</p>
      </div>
      <div className={`${bg} p-4 rounded-2xl`}>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
    </div>
  </CardContent>
</Card>
```

## Badges
```tsx
// Action badge
<Badge className={getActionTheme(action).badge}>
  {action}
</Badge>

// Status badge
<Badge className={getStatusTheme('active').badge}>
  <CheckCircle className="w-3 h-3 mr-1" />
  Activo
</Badge>

// Role badge
<Badge className={getRoleTheme(role).badge}>
  <Shield className="w-3 h-3 mr-1" />
  {roleName}
</Badge>
```

---

# 🔄 PATRÓN DE SERVICIO CON VALIDACIÓN
```typescript
// src/services/[entity].service.ts
import { api } from '@/config/api';

export const entityService = {
  async getAll(query: QueryDto = {}): Promise<PaginatedResponse> {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });

    const response = await api.get(`/api/entity?${params.toString()}`);
    
    // ✅ VALIDACIÓN OBLIGATORIA
    if (!response.data) {
      throw new Error('No se recibió respuesta del servidor');
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'Error al obtener datos');
    }

    const data = Array.isArray(response.data.data) ? response.data.data : [];
    const meta = response.data.meta || {
      page: query.page || 1,
      limit: query.limit || 10,
      total: 0,
      totalPages: 0,
    };

    return { data, meta };
  },
  
  async getById(id: number): Promise<Entity> {
    const response = await api.get(`/api/entity/${id}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al obtener el registro');
    }

    if (!response.data.data) {
      throw new Error('Registro no encontrado');
    }

    return response.data.data;
  },
  
  async create(data: CreateDto): Promise<Entity> {
    const response = await api.post('/api/entity', data);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al crear');
    }

    return response.data.data;
  },
  
  async update(id: number, data: UpdateDto): Promise<Entity> {
    const response = await api.patch(`/api/entity/${id}`, data);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al actualizar');
    }

    return response.data.data;
  },
  
  async delete(id: number): Promise<void> {
    const response = await api.delete(`/api/entity/${id}`);
    
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Error al eliminar');
    }
  },
};
```

---

# 🪝 PATRÓN DE CUSTOM HOOK
```typescript
// src/hooks/data/use[Entity].ts
import { useState, useEffect, useCallback } from 'react';
import { entityService } from '@/services/entity.service';

export function useEntity(initialQuery: QueryDto = {}) {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<QueryDto>(initialQuery);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await entityService.getAll(query);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateQuery = (newQuery: Partial<QueryDto>) => {
    setQuery((prev) => ({ ...prev, ...newQuery }));
  };

  const refresh = () => loadData();

  return {
    data,
    isLoading,
    error,
    query,
    updateQuery,
    refresh,
  };
}
```

---

# 📦 ESTRUCTURA DE FEATURE COMPLETA

Cada feature debe tener:
```
features/[entity]/
├── [Entity]PageContent.tsx      # Componente principal
├── [Entity]Grid.tsx             # Grid/Lista
├── [Entity]Card.tsx             # Card individual
├── [Entity]Filters.tsx          # Filtros
├── [Entity]Stats.tsx            # Estadísticas
├── [Entity]DetailDialog.tsx    # Modal detalle
├── [Entity]Form.tsx             # Formulario (create/update)
└── index.ts                     # Barrel export
```

---

# 🎯 COMPONENTES GENÉRICOS DISPONIBLES

## EmptyState
```tsx
import { EmptyState, EmptySearchResults, EmptyDataState } from '@/components/shared/feedback/EmptyState';

// Búsqueda sin resultados
<EmptySearchResults onClearFilters={handleClear} />

// Sin datos
<EmptyDataState 
  title="No hay registros"
  onCreate={handleCreate}
  createLabel="Crear nuevo"
/>

// Custom
<EmptyState
  variant="info"
  icon={InfoIcon}
  title="Título"
  description="Descripción"
  action={{ label: "Acción", onClick: handleAction }}
/>
```

## ProtectedContent
```tsx
<ProtectedContent module="student" action="create" hideOnNoPermission>
  <CreateButton />
</ProtectedContent>
```

## Badges
```tsx
<RoleBadge roleName="admin" size="md" showIcon />
<PermissionBadge action="create" size="sm" />
<StatusBadge status="active" />
```

---

# ⚡ OPTIMIZACIONES Y BUENAS PRÁCTICAS

## Performance
1. **Usar React.memo()** para componentes pesados
2. **useCallback()** para funciones en dependencias
3. **useMemo()** para cálculos costosos
4. **Lazy loading** para rutas: `const Page = lazy(() => import('./Page'))`

## UX
1. **Loading states** - Skeletons o spinners
2. **Error boundaries** - Capturar errores
3. **Optimistic updates** - UI actualiza antes de respuesta
4. **Debounce** en búsquedas (500ms)
5. **Scroll to top** al cambiar página

## Accesibilidad
1. **aria-labels** en iconos
2. **role** en elementos interactivos
3. **keyboard navigation** (Tab, Enter, Escape)
4. **focus states** visibles

---

# 🚫 ANTI-PATRONES (EVITAR)

❌ **NO crear archivos con prefijos "new"**
❌ **NO numerar archivos** (utils2.ts)
❌ **NO mezclar hooks en services/**
❌ **NO duplicar utilidades** (3 archivos de dates)
❌ **NO hardcodear colores** (usar theme.config)
❌ **NO crear contexts innecesarios** (máximo 10)
❌ **NO ignorar validaciones de API**
❌ **NO olvidar dark mode**
❌ **NO usar any** (usar tipos específicos)
❌ **NO repetir código** (DRY principle)

---

# ✅ CHECKLIST PARA NUEVAS FEATURES
```
ANTES DE EMPEZAR:
□ Definir tipos en types/[entity].types.ts
□ Crear schema Zod en schemas/[entity].schema.ts
□ Verificar permisos necesarios en backend

ESTRUCTURA:
□ Crear service en services/[entity].service.ts
□ Crear hook en hooks/data/use[Entity].ts
□ Crear carpeta features/[entity]/
□ Crear componentes necesarios
□ Crear barrel export (index.ts)

COMPONENTES:
□ PageContent (principal)
□ Grid/List con paginación
□ Filters con debounce
□ Stats cards
□ Detail dialog
□ Form (create/update)

VALIDACIONES:
□ Validar response.data.success
□ Manejar arrays vacíos
□ Manejar errores con try/catch
□ Mostrar EmptyState cuando corresponda

UX:
□ Loading states (skeletons)
□ Error states
□ Empty states
□ Protección de permisos
□ Dark mode completo
□ Responsive design

TESTING:
□ Probar con datos vacíos
□ Probar sin permisos
□ Probar con errores de API
□ Probar en dark mode
□ Probar en mobile
```

---

# 🎓 PROMPT DE CONTINUACIÓN

Cuando necesites continuar el proyecto en otro chat, usa este prompt:
```
Estoy trabajando en un Sistema de Gestión Académica con Next.js 15 + TypeScript.

**Arquitectura establecida:**
- Estructura: features/ para componentes de negocio, shared/ para compartidos, ui/ solo shadcn
- Hooks: data/ (API), features/ (lógica), ui/ (interacción)
- Services: validación obligatoria de response.data.success
- Colores: Centralizados en theme.config.ts con helpers
- Permisos: ProtectedPage, ProtectedContent, ProtectedButton
- Dark mode: Soporte completo obligatorio

**Convenciones:**
- Componentes: PascalCase.tsx
- Hooks: useCamelCase.ts
- Services: entity.service.ts
- Types: entity.types.ts
- NO prefijos "new", NO numeración, NO duplicados

**Necesito ayuda con:** [DESCRIBE TU TAREA AQUÍ]

**Contexto adicional:** [AGREGA DETALLES SI ES NECESARIO]

Por favor, sigue las convenciones establecidas y mantén la arquitectura limpia.
```

---

# 📚 RECURSOS RÁPIDOS

## Imports Comunes
```typescript
// UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';

// Shared
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { EmptyState } from '@/components/shared/feedback/EmptyState';
import { RoleBadge } from '@/components/shared/ui/RoleBadge';

// Hooks
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';

// Config
import { getModuleTheme, getActionTheme } from '@/config/theme.config';

// Icons (lucide-react)
import { Shield, Users, Eye, Edit, Trash, Plus, X, Search } from 'lucide-react';
```

---

**FIN DEL PROMPT MAESTRO**

Este documento es tu guía completa para mantener la arquitectura, diseño y buenas prácticas del proyecto.
Guárdalo y úsalo como referencia en cualquier momento. 🚀