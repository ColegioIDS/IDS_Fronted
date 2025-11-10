# Integración Estados de Asistencia - Frontend

## 📋 Estructura Creada

```
src/
├── types/
│   └── attendance-status.types.ts       # Tipos TypeScript
├── services/
│   └── attendance-statuses.service.ts   # Servicio API
├── hooks/
│   └── data/
│       ├── useAttendanceStatuses.ts     # Hooks de datos
│       ├── useAttendanceStatusPermissions.ts  # Validación permisos
│       └── index.ts
└── components/
    └── features/
        └── attendance-statuses/
            ├── AttendanceStatusCard.tsx         # Componente tarjeta
            ├── AttendanceStatusTable.tsx        # Componente tabla
            ├── AttendanceStatusForm.tsx         # Componente formulario
            ├── AttendanceStatusFilters.tsx      # Componente filtros
            ├── DeleteStatusDialog.tsx           # Diálogo de eliminación
            ├── AttendanceStatusesPageContent.tsx # Página completa
            └── index.ts
```

## 🚀 Uso Básico

### 1. Importar el componente principal

```typescript
import { AttendanceStatusesPageContent } from '@/components/features/attendance-statuses';

export default function AttendanceStatusesPage() {
  return (
    <div className="p-6">
      <AttendanceStatusesPageContent />
    </div>
  );
}
```

### 2. Usar hooks individuales

```typescript
'use client';

import {
  useAttendanceStatuses,
  useCreateAttendanceStatus,
  useAttendanceStatusPermissions,
} from '@/hooks/data';

export function MyComponent() {
  // Obtener estados con paginación
  const { data, isLoading, error } = useAttendanceStatuses({
    page: 1,
    limit: 10,
    isActive: true,
    sortBy: 'order',
    sortOrder: 'asc',
  });

  // Crear nuevo estado
  const createMutation = useCreateAttendanceStatus();

  // Validar permisos
  const { canCreateStatus, canDeleteStatus } = useAttendanceStatusPermissions();

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        code: 'P',
        name: 'Presente',
        colorCode: '#4CAF50',
        order: 1,
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!canCreateStatus) {
    return <p>No tienes permisos para crear estados</p>;
  }

  return (
    <div>
      {isLoading && <p>Cargando...</p>}
      {error && <p>Error: {error.message}</p>}
      {data?.data.map((status) => (
        <div key={status.id}>{status.name}</div>
      ))}
      <button onClick={handleCreate} disabled={createMutation.isPending}>
        Crear
      </button>
    </div>
  );
}
```

## 🎨 Características

### Dark Mode
- ✅ Soporte automático para dark/light mode
- ✅ Colores optimizados para ambas temáticas
- ✅ Transiciones suaves

### Componentes

#### AttendanceStatusCard
Tarjeta individual para ver un estado

```typescript
<AttendanceStatusCard
  status={status}
  onEdit={(status) => console.log('Editar:', status)}
  onDelete={(id) => console.log('Eliminar:', id)}
  isCompact={false}
/>
```

#### AttendanceStatusTable
Tabla completa con opciones inline

```typescript
<AttendanceStatusTable
  statuses={statuses}
  loading={isLoading}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onToggleActive={handleToggle}
/>
```

#### AttendanceStatusForm
Formulario para crear/editar

```typescript
<AttendanceStatusForm
  initialData={editingStatus}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  isLoading={isLoading}
/>
```

#### AttendanceStatusFilters
Panel de filtros y búsqueda

```typescript
<AttendanceStatusFilters
  filters={filters}
  onFilterChange={handleFilterChange}
/>
```

## 📡 API Endpoints

Todos los endpoints están mapeados en `attendanceStatusesService`:

- `GET /api/attendance-statuses` - Listar paginado
- `GET /api/attendance-statuses/active` - Activos
- `GET /api/attendance-statuses/negative` - Negativos
- `GET /api/attendance-statuses/justifiable` - Justificables
- `GET /api/attendance-statuses/:id` - Por ID
- `GET /api/attendance-statuses/code/:code` - Por código
- `GET /api/attendance-statuses/:id/stats` - Estadísticas
- `POST /api/attendance-statuses` - Crear
- `PATCH /api/attendance-statuses/:id` - Actualizar
- `PATCH /api/attendance-statuses/:id/activate` - Activar
- `PATCH /api/attendance-statuses/:id/deactivate` - Desactivar
- `DELETE /api/attendance-statuses/:id` - Eliminar

## 🔐 Permisos

Los permisos se validan automáticamente:

```typescript
const {
  canViewStatuses,      // Ver lista
  canCreateStatus,      // Crear nuevo
  canUpdateStatus,      // Editar existente
  canDeleteStatus,      // Eliminar
  canManagePermissions, // Gestionar permisos
  user,                 // Usuario actual
} = useAttendanceStatusPermissions();
```

## 🎯 Query Keys

Para invalidar caché manualmente:

```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Invalidar todo
queryClient.invalidateQueries({ queryKey: ['attendance-statuses'] });

// Invalidar específico
queryClient.invalidateQueries({ queryKey: ['attendance-statuses', 'list', filters] });
queryClient.invalidateQueries({ queryKey: ['attendance-statuses', 'active'] });
```

## 🎨 Personalización de Colores

Edita `ATTENDANCE_STATUS_COLORS` en `src/types/attendance-status.types.ts`:

```typescript
export const ATTENDANCE_STATUS_COLORS = {
  present: { light: '#4CAF50', dark: '#66BB6A' },
  absent: { light: '#F44336', dark: '#EF5350' },
  tardy: { light: '#FF9800', dark: '#FFA726' },
  // ...
};
```

## ⚙️ Configuración Requerida

1. **AuthContext**: Debe proporcionar usuario con permisos
2. **React Query**: Provider configurado en la app
3. **Next Themes**: Provider para dark mode
4. **Lucide Icons**: Librería de iconos

## 🧪 Testing

```typescript
// Prueba de hooks
import { renderHook } from '@testing-library/react';
import { useAttendanceStatuses } from '@/hooks/data';

const { result } = renderHook(() => useAttendanceStatuses());
expect(result.current.data).toBeDefined();

// Prueba de componentes
import { render, screen } from '@testing-library/react';
import { AttendanceStatusCard } from '@/components/features/attendance-statuses';

render(<AttendanceStatusCard status={mockStatus} />);
expect(screen.getByText(mockStatus.name)).toBeInTheDocument();
```

## 📝 Notas Importantes

- ✅ Los códigos son únicos por estado
- ✅ La eliminación es permanente (considera usar soft-delete)
- ✅ Los permisos se validan en cada operación
- ✅ Las transiciones son suaves y responsive
- ✅ Soporte completo para móviles
- ✅ Validación de formularios integrada
- ✅ Manejo de errores automático
