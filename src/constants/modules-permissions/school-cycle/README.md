## School Cycle Permissions Module

Archivo de configuración de permisos para la gestión de ciclos escolares.

### 📍 Ubicación
```
src/constants/modules-permissions/school-cycle/
```

### 📦 Exportación

```typescript
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';
import { SCHOOL_CYCLE_PERMISSIONS } from '@/constants/modules-permissions/school-cycle/school-cycle.permissions';

// Opción 1: Via MODULES_PERMISSIONS (recomendado)
const { canRead } = useAuth();
if (canRead(MODULES_PERMISSIONS.SCHOOL_CYCLE.READ.module, MODULES_PERMISSIONS.SCHOOL_CYCLE.READ.action)) {
  // Acceso permitido
}

// Opción 2: Importar directamente
if (canRead(SCHOOL_CYCLE_PERMISSIONS.READ.module, SCHOOL_CYCLE_PERMISSIONS.READ.action)) {
  // Acceso permitido
}
```

### 🔑 Permisos Disponibles

| Permiso | Acción | Descripción |
|---------|--------|-------------|
| `CREATE` | `create` | Crear nuevos ciclos escolares |
| `READ` | `read` | Listar todos los ciclos escolares |
| `READ_ONE` | `read-one` | Ver detalles de un ciclo escolar específico |
| `UPDATE` | `update` | Actualizar información de ciclos escolares |
| `DELETE` | `delete` | Eliminar ciclos escolares |
| `ACTIVATE` | `activate` | Activar un ciclo escolar (marca los demás como inactivos) |
| `CLOSE` | `close` | Cerrar un ciclo escolar (no permite más modificaciones) |
| `GENERATE_REPORT` | `generate-report` | Generar reportes estadísticos del ciclo escolar |

### 🎯 Scope

Todos los permisos de ciclos escolares utilizan scope **`all`** porque son recursos globales del sistema.

No tiene sentido limitar un ciclo escolar a un grado o sección específico.

### 🔗 Dependencias de Permisos

Aunque no se implementan en el frontend, estos permisos tienen dependencias lógicas en el backend:

- `UPDATE`: Requiere `READ_ONE`
- `DELETE`: Requiere `READ`
- `ACTIVATE`: Requiere `READ` + `UPDATE`
- `CLOSE`: Requiere `READ_ONE` + `UPDATE`
- `GENERATE_REPORT`: Requiere `READ_ONE`

### 📚 Uso en Componentes

```typescript
import { useAuth } from '@/context/AuthContext';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';

export function SchoolCycleManagement() {
  const { hasPermission } = useAuth();
  
  const canCreate = hasPermission(
    MODULES_PERMISSIONS.SCHOOL_CYCLE.CREATE.module,
    MODULES_PERMISSIONS.SCHOOL_CYCLE.CREATE.action
  );
  
  const canActivate = hasPermission(
    MODULES_PERMISSIONS.SCHOOL_CYCLE.ACTIVATE.module,
    MODULES_PERMISSIONS.SCHOOL_CYCLE.ACTIVATE.action
  );
  
  const canGenerateReport = hasPermission(
    MODULES_PERMISSIONS.SCHOOL_CYCLE.GENERATE_REPORT.module,
    MODULES_PERMISSIONS.SCHOOL_CYCLE.GENERATE_REPORT.action
  );

  return (
    <>
      {canCreate && <CreateButton />}
      {canActivate && <ActivateButton />}
      {canGenerateReport && <ReportButton />}
    </>
  );
}
```

### 🔄 Sincronización con Backend

Este archivo debe mantenerse sincronizado con:
```
src/database/seeds/modules/school-cycle/permissions.seed.ts
```

**Actions deben coincidir exactamente** (en lowercase con guiones):
- Backend: `COMMON_ACTIONS.CREATE` → `'create'`
- Frontend: `'create'`

### ✅ Checklist de Implementación

- [ ] Archivo creado: `school-cycle.permissions.ts`
- [ ] Exportado en: `index.ts`
- [ ] Permisos sincronizados con seed del backend
- [ ] Componentes actualizados para usar `MODULES_PERMISSIONS.SCHOOL_CYCLE`
- [ ] Documentación actualizada
