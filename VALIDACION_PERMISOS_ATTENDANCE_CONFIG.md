# 📋 Validación de Permisos - Módulo ATTENDANCE CONFIG (Configuración de Asistencia)

## 🎯 Resumen

Este documento describe el patrón de validación de permisos implementado en el módulo de **Configuración de Asistencia** (Attendance Config). El módulo gestiona parámetros y configuración global del sistema de asistencia con **4 permisos específicos**.

---

## 📊 Permisos Definidos

| Permiso | Acción | Descripción | Scopes | Ejemplo |
|---------|--------|-------------|--------|---------|
| `VIEW` | `view` | Ver configuración de asistencia | ALL | Ver parámetros del sistema |
| `CREATE` | `create` | Crear nueva configuración | ALL | Crear nueva configuración base |
| `MODIFY` | `modify` | Modificar configuración existente | ALL | Cambiar parámetros |
| `DELETE` | `delete` | Eliminar configuración | ALL | Eliminar configuraciones |

---

## 🏗️ Estructura de Carpetas

```
src/constants/modules-permissions/
├── attendance-config/
│   ├── attendance-config.permissions.ts    ← Definición de permisos
│   └── index.ts                            ← Re-exportar
└── index.ts                                ← Exportación centralizada

src/app/(admin)/
└── attendance-config/
    └── page.tsx                            ← Página protegida con ProtectedPage

src/components/features/attendance-config/
├── AttendanceConfigPage.tsx                ← Recibe props de permisos
└── components/
    └── ConfigActions.tsx                   ← Botones con validación de permisos
```

---

## 💾 Archivo: attendance-config.permissions.ts

Define las 4 acciones del módulo con sus configuraciones y descripción.

```typescript
// src/constants/modules-permissions/attendance-config/attendance-config.permissions.ts

export const ATTENDANCE_CONFIG_PERMISSIONS = {
  VIEW: {
    module: 'attendance-config',
    action: 'view',
    description: 'Ver configuración de asistencia',
    allowedScopes: ['all'],
  },
  CREATE: {
    module: 'attendance-config',
    action: 'create',
    description: 'Crear nueva configuración de asistencia',
    allowedScopes: ['all'],
  },
  MODIFY: {
    module: 'attendance-config',
    action: 'modify',
    description: 'Modificar configuración de asistencia',
    allowedScopes: ['all'],
  },
  DELETE: {
    module: 'attendance-config',
    action: 'delete',
    description: 'Eliminar configuración de asistencia',
    allowedScopes: ['all'],
  },
} as const;
```

---

## 🔐 Página Protegida: attendance-config/page.tsx

La página usa `ProtectedPage` para validar el permiso **VIEW** (acceso base al módulo).

```typescript
// src/app/(admin)/attendance-config/page.tsx
'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';

export default function AdminAttendanceConfigPage() {
  const { can } = usePermissions();

  // Validar los 3 permisos restantes
  const canCreate = can.do(
    MODULES_PERMISSIONS.ATTENDANCE_CONFIG.CREATE.module,
    MODULES_PERMISSIONS.ATTENDANCE_CONFIG.CREATE.action
  );

  const canModify = can.do(
    MODULES_PERMISSIONS.ATTENDANCE_CONFIG.MODIFY.module,
    MODULES_PERMISSIONS.ATTENDANCE_CONFIG.MODIFY.action
  );

  const canDelete = can.do(
    MODULES_PERMISSIONS.ATTENDANCE_CONFIG.DELETE.module,
    MODULES_PERMISSIONS.ATTENDANCE_CONFIG.DELETE.action
  );

  // ProtectedPage valida VIEW automáticamente
  return (
    <ProtectedPage
      module={MODULES_PERMISSIONS.ATTENDANCE_CONFIG.VIEW.module}
      action={MODULES_PERMISSIONS.ATTENDANCE_CONFIG.VIEW.action}
    >
      <div className="space-y-6">
        <Breadcrumb />
        <AttendanceConfigPage
          canCreate={canCreate}
          canModify={canModify}
          canDelete={canDelete}
        />
      </div>
    </ProtectedPage>
  );
}
```

**¿Qué hace?**
- ✅ `ProtectedPage` valida el permiso VIEW
- ✅ Si no tiene VIEW → Muestra `NoPermissionCard`
- ✅ Si tiene VIEW → Valida los 3 permisos adicionales
- ✅ Pasa todos como props al componente hijo

---

## 🎨 Componente: AttendanceConfigPage.tsx

Recibe 3 props de permisos y los usa para:
- Deshabilitar/habilitar botones
- Renderizar condicionalmente opciones
- Pasar permisos a componentes secundarios

```typescript
// src/components/features/attendance-config/AttendanceConfigPage.tsx

interface AttendanceConfigPageProps {
  compact?: boolean;
  canCreate?: boolean;
  canModify?: boolean;
  canDelete?: boolean;
}

export const AttendanceConfigPage: React.FC<AttendanceConfigPageProps> = ({
  compact = false,
  canCreate = true,
  canModify = true,
  canDelete = true,
}) => {
  // ...
  
  return (
    <div className={compact ? 'space-y-4' : 'space-y-6'}>
      {/* Botón crear - deshabilitado si no tiene permiso */}
      <Button
        onClick={() => setShowCreateForm(true)}
        disabled={loading || !canCreate}
        title={!canCreate ? 'No tienes permiso para crear configuración' : ''}
      >
        Crear Configuración
      </Button>

      {/* Pasar permisos a componentes secundarios */}
      <ConfigActions
        onEdit={() => setViewMode('edit')}
        onDelete={handleDelete}
        canModify={canModify}
        canDelete={canDelete}
      />
    </div>
  );
}
```

**¿Qué hace?**
- ✅ Acepta 3 props de permisos con valores por defecto `true`
- ✅ Deshabilita botones si el usuario no tiene permisos
- ✅ Muestra tooltip explicativo en botones deshabilitados
- ✅ Pasa permisos a componentes secundarios

---

## 🔑 Componente Secundario: ConfigActions.tsx

```typescript
interface ConfigActionsProps {
  onEdit: () => void;
  onDelete?: () => void;
  onReset?: () => void;
  canModify?: boolean;
  canDelete?: boolean;
}

export const ConfigActions: React.FC<ConfigActionsProps> = ({
  onEdit,
  onDelete,
  canModify = true,
  canDelete = true,
}) => {
  return (
    <div className="flex gap-2">
      {/* Botón Editar */}
      <button
        onClick={onEdit}
        disabled={loading || !canModify}
        title={!canModify ? 'No tienes permiso para modificar' : ''}
      >
        <Edit /> Editar
      </button>

      {/* Botón Eliminar */}
      {onDelete && (
        <button
          onClick={onDelete}
          disabled={loading || !canDelete}
          title={!canDelete ? 'No tienes permiso para eliminar' : ''}
        >
          <Trash2 /> Eliminar
        </button>
      )}
    </div>
  );
}
```

---

## 📋 Flujo de Validación

```
Usuario accede a /attendance-config
        ↓
ProtectedPage valida VIEW
        ↓
¿Tiene VIEW?
    ├─ NO → Muestra NoPermissionCard
    │
    └─ SÍ → Valida 3 permisos adicionales
            ↓
            AttendanceConfigPage recibe 3 flags
            ↓
            Deshabilita botones según flags
            ↓
            ConfigActions recibe permisos
            ↓
            Antes de acciones, valida permisos
```

---

## ✅ Checklist de Implementación

### Fase 1: Constantes (Completado)
- [x] Crear `attendance-config.permissions.ts` con 4 permisos
- [x] Crear `attendance-config/index.ts`
- [x] Actualizar `modules-permissions/index.ts` con export
- [x] Agregar `ATTENDANCE_CONFIG` a `MODULES_PERMISSIONS`

### Fase 2: Página Principal (Completado)
- [x] Cambiar `page.tsx` a `'use client'`
- [x] Usar `ProtectedPage` para validar VIEW
- [x] Validar 3 permisos adicionales
- [x] Pasar todos como props a `AttendanceConfigPage`

### Fase 3: Componentes (Completado)
- [x] Crear interface `AttendanceConfigPageProps` con 3 permisos
- [x] Deshabilitar botón crear si no tiene `canCreate`
- [x] Pasar permisos a `ConfigActions`
- [x] Actualizar `ConfigActions` con `canModify` y `canDelete`
- [x] Deshabilitar botones Edit y Delete según permisos

### Fase 4: Backend (Por hacer)
- [ ] Validar permisos en endpoints
- [ ] Retornar 403 si no tiene permiso
- [ ] Registrar intentos de acceso no autorizado

---

## 🎓 Características de Seguridad

1. **Frontend (UX)**: Botones deshabilitados con tooltips
2. **Validación**: Props tipados con defaults seguros
3. **Mensajes**: Tooltips informativos al pasar el mouse
4. **Backend**: Debe validar todos los endpoints
5. **Auditoría**: Registrar cambios con quién los realizó

---

## 🚀 Resultado Final

El módulo Attendance Config ahora tiene:
- ✅ Sistema de permisos granular (4 acciones)
- ✅ Validación en página principal (ProtectedPage)
- ✅ Interfaz deshabilitada según permisos
- ✅ Props tipados para permisos
- ✅ Defaults seguros
- ✅ Tooltips informativos
- ✅ Documentación clara

**Patrón reutilizable para otros módulos** ✨
