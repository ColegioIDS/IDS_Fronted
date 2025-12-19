# 🔐 Validación de Permisos - Módulo Enrollments (Matrículas)

## 📋 Flujo General de Validación de Permisos

```
┌─────────────────────────────────────────────────────────────────┐
│ 1️⃣  CONSTANTES DE PERMISOS (Define qué permisos existen)      │
│     src/constants/modules-permissions/enrollment/               │
│     enrollment.permissions.ts                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2️⃣  PÁGINA (Valida permisos antes de renderizar)              │
│     src/app/(admin)/enrollments/page.tsx                        │
│     - Verifica 8 permisos diferentes                            │
│     - Muestra "Acceso Denegado" si no tiene READ               │
│     - Pasa flags de permisos al componente                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3️⃣  COMPONENTES (Utiliza flags para renderizar UI)            │
│     src/components/features/enrollments/                        │
│     EnrollmentsPageContent.tsx                                  │
│     - Recibe 8 permisos específicos                             │
│     - Renderiza botones según permisos                         │
│     - Pasa permisos a componentes hijo                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4️⃣  COMPONENTES HIJO (Mostrar/Ocultar funcionalidades)        │
│     - EnrollmentTable.tsx                                       │
│     - Buttons/Actions específicas                              │
│     - Validación en dropdown de acciones                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ PERMISOS DEFINIDOS

**Archivo:** `src/constants/modules-permissions/enrollment/enrollment.permissions.ts`

### Estructura Completa

```typescript
export const ENROLLMENT_PERMISSIONS = {
  // Lectura
  READ: {
    module: 'enrollments',
    action: 'read',
    description: 'Listar todas las matrículas con filtros y paginación',
  },
  
  READ_ONE: {
    module: 'enrollments',
    action: 'read-one',
    description: 'Ver detalles completos de una matrícula específica',
  },
  
  // Creación
  CREATE: {
    module: 'enrollments',
    action: 'create',
    description: 'Crear nueva matrícula de estudiante',
  },
  
  // Actualizaciones
  UPDATE_STATUS: {
    module: 'enrollments',
    action: 'update-status',
    description: 'Cambiar estado (active, suspended, inactive)',
  },
  
  UPDATE_PLACEMENT: {
    module: 'enrollments',
    action: 'update-placement',
    description: 'Cambiar grado y/o sección de matrícula',
  },
  
  TRANSFER: {
    module: 'enrollments',
    action: 'transfer',
    description: 'Transferir estudiante a nuevo ciclo académico',
  },
  
  // Eliminación
  DELETE: {
    module: 'enrollments',
    action: 'delete',
    description: 'Eliminar matrícula del sistema',
  },
  
  // Reportes
  VIEW_STATISTICS: {
    module: 'enrollments',
    action: 'view-statistics',
    description: 'Ver estadísticas de matrículas',
  },
  
  EXPORT: {
    module: 'enrollments',
    action: 'export',
    description: 'Exportar listado de matrículas en Excel o PDF',
  },
}
```

---

## 2️⃣ VALIDACIÓN EN LA PÁGINA

**Archivo:** `src/app/(admin)/enrollments/page.tsx`

### Paso 1: Importar herramientas
```typescript
import { usePermissions } from '@/hooks/usePermissions';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';
import { NoPermissionCard } from '@/components/shared/permissions/NoPermissionCard';
```

### Paso 2: Obtener permisos del contexto
```typescript
export default function EnrollmentPage() {
  const { can } = usePermissions();
```

### Paso 3: Verificar cada permiso específico
```typescript
  // Lectura y visualización
  const canRead = can.do(
    MODULES_PERMISSIONS.ENROLLMENT.READ.module,
    MODULES_PERMISSIONS.ENROLLMENT.READ.action
  );
  
  const canView = can.do(
    MODULES_PERMISSIONS.ENROLLMENT.READ_ONE.module,
    MODULES_PERMISSIONS.ENROLLMENT.READ_ONE.action
  );
  
  // Creación
  const canCreate = can.do(
    MODULES_PERMISSIONS.ENROLLMENT.CREATE.module,
    MODULES_PERMISSIONS.ENROLLMENT.CREATE.action
  );
  
  // Actualizaciones
  const canUpdateStatus = can.do(
    MODULES_PERMISSIONS.ENROLLMENT.UPDATE_STATUS.module,
    MODULES_PERMISSIONS.ENROLLMENT.UPDATE_STATUS.action
  );
  
  const canUpdatePlacement = can.do(
    MODULES_PERMISSIONS.ENROLLMENT.UPDATE_PLACEMENT.module,
    MODULES_PERMISSIONS.ENROLLMENT.UPDATE_PLACEMENT.action
  );
  
  const canTransfer = can.do(
    MODULES_PERMISSIONS.ENROLLMENT.TRANSFER.module,
    MODULES_PERMISSIONS.ENROLLMENT.TRANSFER.action
  );
  
  // Eliminación
  const canDelete = can.do(
    MODULES_PERMISSIONS.ENROLLMENT.DELETE.module,
    MODULES_PERMISSIONS.ENROLLMENT.DELETE.action
  );
  
  // Reportes
  const canViewStats = can.do(
    MODULES_PERMISSIONS.ENROLLMENT.VIEW_STATISTICS.module,
    MODULES_PERMISSIONS.ENROLLMENT.VIEW_STATISTICS.action
  );
  
  const canExport = can.do(
    MODULES_PERMISSIONS.ENROLLMENT.EXPORT.module,
    MODULES_PERMISSIONS.ENROLLMENT.EXPORT.action
  );
```

### Paso 4: Guard - Control de acceso
```typescript
  // Si no tiene permiso de lectura, mostrar error
  if (!canRead) {
    return (
      <NoPermissionCard
        module={MODULES_PERMISSIONS.ENROLLMENT.READ.module}
        action={MODULES_PERMISSIONS.ENROLLMENT.READ.action}
        title="Acceso Denegado"
        description="No tienes permisos para acceder a la gestión de matrículas."
        variant="page"
      />
    );
  }
```

### Paso 5: Pasar permisos al componente
```typescript
  return (
    <div className="space-y-6">
      <EnrollmentsPageContent
        canView={canView}
        canCreate={canCreate}
        canUpdateStatus={canUpdateStatus}
        canUpdatePlacement={canUpdatePlacement}
        canTransfer={canTransfer}
        canDelete={canDelete}
        canViewStats={canViewStats}
        canExport={canExport}
      />
    </div>
  );
}
```

---

## 3️⃣ USO DE PERMISOS EN COMPONENTES

**Archivo:** `src/components/features/enrollments/EnrollmentsPageContent.tsx`

### Interfaz de Props
```typescript
interface EnrollmentsPageContentProps {
  canView?: boolean;
  canCreate?: boolean;
  canUpdateStatus?: boolean;
  canUpdatePlacement?: boolean;
  canTransfer?: boolean;
  canDelete?: boolean;
  canViewStats?: boolean;
  canExport?: boolean;
}

export const EnrollmentsPageContent = ({
  canView = false,
  canCreate = false,
  canUpdateStatus = false,
  canUpdatePlacement = false,
  canTransfer = false,
  canDelete = false,
  canViewStats = false,
  canExport = false,
}: EnrollmentsPageContentProps) => {
```

### Ejemplo 1: Mostrar/Ocultar Botón de Crear
```typescript
  {canCreate && (
    <Button
      onClick={() => window.location.href = '/enrollments/create'}
      className="bg-indigo-600 hover:bg-indigo-700"
    >
      <Plus className="h-4 w-4 mr-2" />
      Nueva Matrícula
    </Button>
  )}
```

**Lógica:**
- Si `canCreate = true` → Muestra botón "Nueva Matrícula"
- Si `canCreate = false` → Botón no se renderiza

### Ejemplo 2: Mostrar/Ocultar Botón de Exportar
```typescript
  {canExport && (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={loading || actionLoading}
    >
      <FileSpreadsheet className="h-4 w-4 mr-2" />
      Exportar
    </Button>
  )}
```

### Ejemplo 3: Pasar permisos a tabla
```typescript
  <EnrollmentTable
    enrollments={enrollments}
    isLoading={isLoading}
    canView={canView}
    canUpdateStatus={canUpdateStatus}
    canUpdatePlacement={canUpdatePlacement}
    canTransfer={canTransfer}
    canDelete={canDelete}
    onView={handleView}
    onStatusChange={handleStatusChange}
    onTransfer={handleTransfer}
  />
```

---

## 4️⃣ TABLA - EnrollmentTable

**Archivo:** `src/components/features/enrollments/EnrollmentTable.tsx`

```typescript
interface EnrollmentTableProps {
  enrollments: EnrollmentResponse[];
  loading?: boolean;
  canView?: boolean;
  canUpdateStatus?: boolean;
  canUpdatePlacement?: boolean;
  canTransfer?: boolean;
  canDelete?: boolean;
  onView?: (enrollment: EnrollmentResponse) => void;
  onEdit?: (enrollment: EnrollmentResponse) => void;
  onDelete?: (enrollment: EnrollmentResponse) => void;
  onTransfer?: (enrollment: EnrollmentResponse) => void;
  onStatusChange?: (enrollment: EnrollmentResponse) => void;
}
```

### Dropdown de Acciones Condicionadas
```typescript
<DropdownMenuContent align="end" className="w-48">
  {/* Ver detalles */}
  {canView && onView && (
    <DropdownMenuItem onClick={() => onView(enrollment)}>
      <Eye className="h-4 w-4" />
      <span>Ver detalle</span>
    </DropdownMenuItem>
  )}
  
  {/* Cambiar grado/sección */}
  {canUpdatePlacement && onEdit && (
    <DropdownMenuItem onClick={() => onEdit(enrollment)}>
      <Edit className="h-4 w-4" />
      <span>Cambiar grado/sección</span>
    </DropdownMenuItem>
  )}
  
  {/* Cambiar estado */}
  {canUpdateStatus && onStatusChange && (
    <DropdownMenuItem onClick={() => onStatusChange(enrollment)}>
      <CheckCircle2 className="h-4 w-4" />
      <span>Cambiar estado</span>
    </DropdownMenuItem>
  )}
  
  {/* Transferir */}
  {canTransfer && onTransfer && (
    <DropdownMenuItem onClick={() => onTransfer(enrollment)}>
      <ArrowRight className="h-4 w-4" />
      <span>Transferir</span>
    </DropdownMenuItem>
  )}
  
  {/* Separador */}
  {(canDelete || canUpdateStatus) && <DropdownMenuSeparator />}
  
  {/* Eliminar */}
  {canDelete && onDeleteClick && (
    <DropdownMenuItem 
      onClick={() => onDeleteClick(enrollment)}
      className="text-destructive"
    >
      <Trash2 className="h-4 w-4" />
      <span>Eliminar</span>
    </DropdownMenuItem>
  )}
</DropdownMenuContent>
```

---

## 🔄 Flujo de Acciones

### Crear Nueva Matrícula
```
1. Usuario hace clic en "Nueva Matrícula"
   (Solo visible si canCreate = true)
   ↓
2. Navega a /enrollments/create
   ↓
3. EnrollmentForm renderiza
   ↓
4. Usuario completa y envía formulario
   ↓
5. Service: enrollmentsService.create(data)
   ↓
6. API valida permisos en backend
   │
   ├─ ✅ Si autorizado:
   │     - Matrícula creada
   │     - Toast: "Matrícula creada"
   │     - refresh() → Recarga lista
   │
   └─ ❌ Si no autorizado:
       - 403 Forbidden
       - Toast: "No tienes permisos"
```

### Cambiar Estado
```
1. Usuario hace clic en dropdown de acciones
   (Si canUpdateStatus = true, opción visible)
   ↓
2. Selecciona "Cambiar estado"
   ↓
3. EnrollmentStatusDialog se abre
   ↓
4. Usuario selecciona nuevo estado y confirma
   ↓
5. enrollmentsService.updateEnrollmentStatus()
   ↓
6. API valida en backend y actualiza
```

### Cambiar Grado/Sección
```
1. Usuario hace clic en "Cambiar grado/sección"
   (Solo visible si canUpdatePlacement = true)
   ↓
2. EnrollmentForm dialoga con nuevo grado/sección
   ↓
3. enrollmentsService.updatePlacement()
   ↓
4. Backend valida capacidad de nueva sección
   ↓
5. Se actualiza la matrícula
```

### Transferir a Nuevo Ciclo
```
1. Usuario hace clic en "Transferir"
   (Solo visible si canTransfer = true)
   ↓
2. EnrollmentTransferDialog se abre
   ↓
3. Selecciona ciclo destino y grado
   ↓
4. enrollmentsService.transfer()
   ↓
5. Backend crea nueva matrícula en nuevo ciclo
```

---

## 📊 Matriz de Permisos - Enrollments

| Acción | READ | READ_ONE | CREATE | UPDATE_STATUS | UPDATE_PLACEMENT | TRANSFER | DELETE | VIEW_STATS | EXPORT |
|--------|:----:|:--------:|:------:|:-------------:|:----------------:|:--------:|:------:|:----------:|:------:|
| Ver lista | ✅ | - | - | - | - | - | - | - | - |
| Ver detalles | ✅ | ✅ | - | - | - | - | - | - | - |
| Crear matrícula | - | - | ✅ | - | - | - | - | - | - |
| Cambiar estado | - | ✅ | - | ✅ | - | - | - | - | - |
| Cambiar grado/sección | - | ✅ | - | - | ✅ | - | - | - | - |
| Transferir | - | ✅ | - | - | - | ✅ | - | - | - |
| Eliminar | - | ✅ | - | - | - | - | ✅ | - | - |
| Ver estadísticas | ✅ | - | - | - | - | - | - | ✅ | - |
| Exportar | ✅ | - | - | - | - | - | - | - | ✅ |

---

## 🔗 Archivos Relacionados

```
src/
├── app/(admin)/enrollments/
│   └── page.tsx                    ← Página principal (validación)
│
├── components/features/enrollments/
│   ├── EnrollmentsPageContent.tsx  ← Componente principal
│   ├── EnrollmentTable.tsx         ← Tabla con permisos
│   ├── EnrollmentDetailDialog.tsx  ← Diálogo de detalles
│   ├── EnrollmentStatusDialog.tsx  ← Cambio de estado
│   ├── EnrollmentTransferDialog.tsx ← Transferencia
│   ├── EnrollmentFilters.tsx       ← Filtros
│   ├── EnrollmentStatistics.tsx    ← Estadísticas
│   └── index.ts                    ← Exporta componentes
│
├── constants/modules-permissions/enrollment/
│   ├── enrollment.permissions.ts   ← Definición de permisos
│   └── index.ts                    ← Exporta permisos
│
├── hooks/
│   └── usePermissions.ts           ← Hook para verificar permisos
│
└── services/
    └── enrollments.service.ts      ← Llamadas a API
```

---

## 🎯 Resumen: 3 Niveles de Validación

### Nivel 1: Frontend (UX)
- **Dónde:** Página y componentes
- **Qué:** Mostrar/ocultar botones y funcionalidades
- **Por qué:** Mejor experiencia de usuario
- **Seguridad:** BAJA

```typescript
{canCreate && <Button>Nueva Matrícula</Button>}
```

### Nivel 2: Headers (Token JWT)
- **Dónde:** En cada petición HTTP
- **Qué:** Se envía token del usuario autenticado
- **Por qué:** Identificación
- **Seguridad:** MEDIA

```typescript
headers: {
  Authorization: `Bearer ${token}`
}
```

### Nivel 3: Backend (Autorización)
- **Dónde:** API Server
- **Qué:** Validar permisos antes de procesar
- **Por qué:** Máxima seguridad
- **Seguridad:** ALTA

```javascript
POST /api/enrollments/create
if (!user.hasPermission('enrollments', 'create')) {
  return 403 Forbidden
}
```

---

## ✅ Implementación Checklist

Cuando agregues nuevas funcionalidades:

- [ ] Verificar permisos en página (`page.tsx`)
- [ ] Pasar flags a componentes
- [ ] Renderizar botones condicionalmente
- [ ] Validar en tabla/grid
- [ ] Verificar en backend (API)
- [ ] Testing de permisos negados
- [ ] Logging de intentos no autorizados
- [ ] Documentación de permisos

---

## 📝 Notas Importantes

1. **Frontend es solo presentación**: No es seguridad real
2. **Siempre validar en backend**: Cada acción DEBE validarse en el servidor
3. **Granularidad**: Cada acción tiene su propio permiso
4. **Constantes centralizadas**: Un solo lugar para cambios
5. **Fallback seguro**: Denegar por defecto (default = false)

