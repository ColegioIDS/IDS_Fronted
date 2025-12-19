# 📋 Validación de Permisos - Módulo ATTENDANCE (Asistencia)

## 🎯 Resumen

Este documento describe el patrón de validación de permisos implementado en el módulo de **Asistencia** (Attendance). El módulo gestiona registros de asistencia de estudiantes con **8 permisos específicos**.

---

## 📊 Permisos Definidos

| Permiso | Acción | Descripción | Scopes | Ejemplo |
|---------|--------|-------------|--------|---------|
| `READ` | `read` | Listar todos los registros de asistencia con filtros | ALL, COORDINATOR, OWN | Ver lista de registros |
| `READ_ONE` | `read-one` | Ver detalles de un registro específico | ALL, COORDINATOR, OWN | Ver un registro en detalle |
| `READ_CONFIG` | `read-config` | Acceder a configuración del sistema | ALL | Calificaciones, secciones, estudiantes |
| `READ_STATS` | `read-stats` | Ver estadísticas de asistencia | ALL, COORDINATOR, OWN | Porcentaje, reportes |
| `CREATE` | `create` | Crear un nuevo registro individual | ALL, COORDINATOR, OWN | Registrar un estudiante |
| `CREATE_BULK` | `create-bulk` | Crear múltiples registros en lote | ALL, COORDINATOR, OWN | Carga masiva, importación |
| `UPDATE` | `update` | Actualizar un registro existente | ALL, COORDINATOR, OWN | Cambiar estado o notas |
| `DELETE` | `delete` | Eliminar un registro | ALL | Eliminar completamente |
| `VALIDATE` | `validate` | Validar datos de asistencia antes de procesar | ALL | Verificar integridad de datos |

---

## 🏗️ Estructura de Carpetas

```
src/constants/modules-permissions/
├── attendance/
│   ├── attendance.permissions.ts    ← Definición de permisos
│   └── index.ts                     ← Re-exportar
└── index.ts                         ← Exportación centralizada

src/app/(admin)/(management)/
└── attendance/
    └── page.tsx                     ← Página protegida con ProtectedPage

src/components/features/attendance/
├── AttendancePageContent.tsx        ← Recibe props de permisos
├── Tab1_DailyRegistration/
│   └── DailyRegistration.tsx        ← Recibe canCreate, canCreateBulk
└── Tab2_UpdateAttendance/
    └── UpdateAttendance-Smart.tsx   ← Recibe canUpdate, canDelete
```

---

## 💾 Archivo: attendance.permissions.ts

Define las 8 acciones del módulo con sus configuraciones y descripción.

```typescript
// src/constants/modules-permissions/attendance/attendance.permissions.ts

export const ATTENDANCE_PERMISSIONS = {
  READ: {
    module: 'attendance',
    action: 'read',
    description: 'Listar todos los registros de asistencia con filtros',
    allowedScopes: ['all', 'coordinator', 'own'],
  },
  READ_ONE: {
    module: 'attendance',
    action: 'read-one',
    description: 'Ver detalles de un registro de asistencia específico',
    allowedScopes: ['all', 'coordinator', 'own'],
  },
  READ_CONFIG: {
    module: 'attendance',
    action: 'read-config',
    description: 'Acceder a configuración de asistencia',
    allowedScopes: ['all'],
  },
  READ_STATS: {
    module: 'attendance',
    action: 'read-stats',
    description: 'Ver estadísticas de asistencia de un estudiante',
    allowedScopes: ['all', 'coordinator', 'own'],
  },
  CREATE: {
    module: 'attendance',
    action: 'create',
    description: 'Crear un nuevo registro de asistencia individual',
    allowedScopes: ['all', 'coordinator', 'own'],
  },
  CREATE_BULK: {
    module: 'attendance',
    action: 'create-bulk',
    description: 'Crear múltiples registros de asistencia en lote',
    allowedScopes: ['all', 'coordinator', 'own'],
  },
  UPDATE: {
    module: 'attendance',
    action: 'update',
    description: 'Actualizar información de un registro de asistencia',
    allowedScopes: ['all', 'coordinator', 'own'],
  },
  DELETE: {
    module: 'attendance',
    action: 'delete',
    description: 'Eliminar un registro de asistencia',
    allowedScopes: ['all'],
  },
} as const;
```

---

## 🔐 Página Protegida: attendance/page.tsx

La página usa `ProtectedPage` para validar el permiso **READ** (acceso base al módulo).

```typescript
// src/app/(admin)/(management)/attendance/page.tsx
'use client';

import { usePermissions } from '@/hooks/usePermissions';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';
import { AttendancePageContent } from '@/components/features/attendance/AttendancePageContent';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';

export default function AttendancePage() {
  const { can } = usePermissions();

  // Validar los 7 permisos restantes
  const canReadOne = can.do(
    MODULES_PERMISSIONS.ATTENDANCE.READ_ONE.module,
    MODULES_PERMISSIONS.ATTENDANCE.READ_ONE.action
  );

  const canReadStats = can.do(
    MODULES_PERMISSIONS.ATTENDANCE.READ_STATS.module,
    MODULES_PERMISSIONS.ATTENDANCE.READ_STATS.action
  );

  const canCreate = can.do(
    MODULES_PERMISSIONS.ATTENDANCE.CREATE.module,
    MODULES_PERMISSIONS.ATTENDANCE.CREATE.action
  );

  const canCreateBulk = can.do(
    MODULES_PERMISSIONS.ATTENDANCE.CREATE_BULK.module,
    MODULES_PERMISSIONS.ATTENDANCE.CREATE_BULK.action
  );

  const canUpdate = can.do(
    MODULES_PERMISSIONS.ATTENDANCE.UPDATE.module,
    MODULES_PERMISSIONS.ATTENDANCE.UPDATE.action
  );

  const canDelete = can.do(
    MODULES_PERMISSIONS.ATTENDANCE.DELETE.module,
    MODULES_PERMISSIONS.ATTENDANCE.DELETE.action
  );

  // ProtectedPage valida READ automáticamente
  return (
    <ProtectedPage
      module={MODULES_PERMISSIONS.ATTENDANCE.READ.module}
      action={MODULES_PERMISSIONS.ATTENDANCE.READ.action}
    >
      <main className="space-y-6 p-6">
        <AttendancePageContent
          canReadOne={canReadOne}
          canReadConfig={canReadConfig}
          canReadStats={canReadStats}
          canCreate={canCreate}
          canCreateBulk={canCreateBulk}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      </main>
    </ProtectedPage>
  );
}
```

**¿Qué hace?**
- ✅ `ProtectedPage` valida el permiso READ
- ✅ Si no tiene READ → Muestra `NoPermissionCard`
- ✅ Si tiene READ → Valida los 7 permisos adicionales
- ✅ Pasa todos como props al componente hijo

---

## 🎨 Componente: AttendancePageContent.tsx

Recibe 8 props de permisos y los usa para:
- Habilitar/deshabilitar TABs
- Renderizar condicionalmente secciones
- Pasar permisos a componentes secundarios

```typescript
// src/components/features/attendance/AttendancePageContent.tsx

interface AttendancePageContentProps {
  canReadOne?: boolean;
  canReadConfig?: boolean;
  canReadStats?: boolean;
  canCreate?: boolean;
  canCreateBulk?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canValidate?: boolean;  // NUEVO: para TAB 3
}

function AttendancePageContentInner({
  canReadOne = true,
  canReadConfig = true,
  canReadStats = true,
  canCreate = true,
  canCreateBulk = true,
  canUpdate = true,
  canDelete = true,
}: AttendancePageContentProps) {
  // ...
  
  return (
    <div className="space-y-6 p-6">
      {/* Tabs con permisos */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 gap-2">
          {/* TAB 1: CREAR - disabled si no tiene canCreate && canCreateBulk */}
          <TabsTrigger
            value={ATTENDANCE_TABS.TAB_1}
            disabled={!canCreate && !canCreateBulk}
          >
            Registro Diario
          </TabsTrigger>

          {/* TAB 2: ACTUALIZAR - disabled si no tiene canUpdate */}
          <TabsTrigger
            value={ATTENDANCE_TABS.TAB_2}
            disabled={!canUpdate}
          >
            Actualizar
          </TabsTrigger>

          {/* TAB 3: ESTADÍSTICAS - disabled si no tiene canValidate */}
          <TabsTrigger
            value={ATTENDANCE_TABS.TAB_3}
            disabled={!canValidate}
          >
            Validaciones
          </TabsTrigger>
        </TabsList>

        {/* Renderizar TAB solo si tiene permiso */}
        {(canCreate || canCreateBulk) && (
          <TabsContent value={ATTENDANCE_TABS.TAB_1} className="space-y-6">
            <DailyRegistration 
              canCreate={canCreate} 
              canCreateBulk={canCreateBulk} 
            />
          </TabsContent>
        )}

        {canUpdate && (
          <TabsContent value={ATTENDANCE_TABS.TAB_2} className="space-y-6">
            <UpdateAttendanceTabSmartEdit 
              canUpdate={canUpdate} 
              canDelete={canDelete} 
            />
          </TabsContent>
        )}

        {canValidate && (
          <TabsContent value={ATTENDANCE_TABS.TAB_3} className="space-y-6">
            <ValidationsChecker {...props} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
```

**¿Qué hace?**
- ✅ Acepta 8 props de permisos con valores por defecto `true`
- ✅ Deshabilita TABs si el usuario no tiene permisos
- ✅ Renderiza condicionalmente cada TAB según permisos
- ✅ Pasa permisos a componentes secundarios

---

## 🔑 Componentes Secundarios

### Tab1_DailyRegistration.tsx

```typescript
interface DailyRegistrationProps {
  canCreate?: boolean;
  canCreateBulk?: boolean;
}

export function DailyRegistration({ 
  canCreate = true, 
  canCreateBulk = true 
}: DailyRegistrationProps) {
  // Usar estos permisos para:
  // - Mostrar/ocultar botón "Registrar Individual"
  // - Mostrar/ocultar botón "Carga Masiva"
}
```

### Tab2_UpdateAttendance/UpdateAttendance-Smart.tsx

```typescript
interface UpdateAttendanceTabSmartEditProps {
  canUpdate?: boolean;
  canDelete?: boolean;
}

export function UpdateAttendanceTabSmartEdit({
  canUpdate = true,
  canDelete = true,
}: UpdateAttendanceTabSmartEditProps) {
  // Usar estos permisos para:
  // - Mostrar/ocultar botón "Editar"
  // - Mostrar/ocultar botón "Eliminar"
  // - Validar antes de hacer request
}
```

---

## 🔄 Flujo de Validación

```
Usuario accede a /attendance
        ↓
ProtectedPage valida READ
        ↓
¿Tiene READ?
    ├─ NO → Muestra NoPermissionCard
    │
    └─ SÍ → Valida 7 permisos adicionales
            ↓
            AttendancePageContent recibe 7 flags
            ↓
            Habilita/deshabilita features según flags
            ↓
            Componentes secundarios reciben permisos
            ↓
            Antes de hacer requests, validan permisos
```

---

## ✅ Checklist de Implementación

### Fase 1: Constantes (Completado)
- [x] Crear `attendance.permissions.ts` con 8 permisos
- [x] Crear `attendance/index.ts`
- [x] Actualizar `modules-permissions/index.ts` con export
- [x] Agregar `ATTENDANCE` a `MODULES_PERMISSIONS`

### Fase 2: Página Principal (Completado)
- [x] Cambiar `page.tsx` a 'use client'
- [x] Usar `ProtectedPage` para validar READ
- [x] Validar 7 permisos adicionales
- [x] Pasar todos como props a `AttendancePageContent`

### Fase 3: Componente Principal (Completado)
- [x] Crear interface `AttendancePageContentProps` con 7 permisos
- [x] Deshabilitar TABs según permisos
- [x] Renderizar condicionalmente TABs
- [x] Pasar permisos a componentes secundarios

### Fase 4: Componentes Secundarios (Completado)
- [x] `DailyRegistration` recibe `canCreate`, `canCreateBulk`
- [x] `UpdateAttendanceTabSmartEdit` recibe `canUpdate`, `canDelete`
- [x] Actualizar interfaces de componentes

### Fase 5: Backend (Por hacer)
- [ ] Validar permisos en endpoints
- [ ] Retornar 403 si no tiene permiso
- [ ] Registrar intentos de acceso no autorizado

---

## 🎓 Cómo Agregar Más Permisos

Si necesitas agregar un nuevo permiso (ej: `EXPORT`):

### 1. Actualizar constantes
```typescript
// attendance.permissions.ts
export const ATTENDANCE_PERMISSIONS = {
  // ... otros permisos
  EXPORT: {
    module: 'attendance',
    action: 'export',
    description: 'Exportar registros a Excel/PDF',
    allowedScopes: ['all', 'coordinator'],
  },
};
```

### 2. Actualizar la página
```typescript
// attendance/page.tsx
const canExport = can.do(
  MODULES_PERMISSIONS.ATTENDANCE.EXPORT.module,
  MODULES_PERMISSIONS.ATTENDANCE.EXPORT.action
);

<AttendancePageContent
  // ... otros props
  canExport={canExport}
/>
```

### 3. Actualizar el componente principal
```typescript
// AttendancePageContent.tsx
interface AttendancePageContentProps {
  // ... otros props
  canExport?: boolean;
}

function AttendancePageContentInner({
  // ... otros props
  canExport = true,
}: AttendancePageContentProps) {
  // Usar canExport para mostrar botón de exportar
}
```

---

## 📝 Notas Importantes

1. **Permisos por defecto**: Si no pasas un permiso, el componente lo asume como `true`
   ```typescript
   // Esto es seguro porque los componentes tienen valores por defecto true
   <AttendancePageContent canCreate={false} />
   // canReadOne, canReadConfig, etc. serán true
   ```

2. **ProtectedPage es el gate principal**: Siempre valida READ
   ```typescript
   // Si no tienes READ, nunca llegas al contenido
   <ProtectedPage module="attendance" action="read">
     {/* Esto nunca se renderiza sin READ */}
   </ProtectedPage>
   ```

3. **Backend debe validar también**: Estos permisos son UX, el backend debe validar
   ```typescript
   // El frontend puede ocultar botones, pero el backend debe validar
   POST /api/attendance/register
   // Backend: ¿Tiene permiso CREATE? Si no → 403
   ```

4. **Auditoría**: Considera registrar intentos de acceso denegado
   ```typescript
   // En el backend o en logs
   Usuario X intentó acceder a DELETE sin permisos
   ```

---

## 🚀 Resultado Final

El módulo Attendance ahora tiene:
- ✅ Sistema de permisos granular (8 acciones)
- ✅ Validación en página principal (ProtectedPage)
- ✅ Rendimiento condicional según permisos
- ✅ Props tipados para permisos
- ✅ Defaults seguros
- ✅ Documentación clara

**Patrones reutilizables para otros módulos** ✨
