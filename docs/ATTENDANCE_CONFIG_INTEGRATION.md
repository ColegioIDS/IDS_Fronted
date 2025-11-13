// docs/ATTENDANCE_CONFIG_INTEGRATION.md

# Guía de Integración - Attendance Config (Frontend)

Integración completa del módulo **AttendanceConfig** en el frontend, siguiendo la estructura de **Roles** con colores bonitos de **Attendance**.

## 📋 Tabla de Contenidos

1. [Estructura del Módulo](#estructura-del-módulo)
2. [Tipos de Datos](#tipos-de-datos)
3. [Servicio API](#servicio-api)
4. [Componentes UI](#componentes-ui)
5. [Hooks Personalizados](#hooks-personalizados)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Tema de Colores](#tema-de-colores)
8. [Manejo de Errores](#manejo-de-errores)

---

## Estructura del Módulo

```
src/
├── types/
│   └── attendance-config.types.ts      # Interfaces TypeScript
├── services/
│   └── attendance-config.service.ts    # Cliente API
├── hooks/
│   └── useAttendanceConfig.ts          # Hooks reutilizables
└── components/features/attendance-config/
    ├── AttendanceConfigPage.tsx        # Componente principal
    ├── attendance-config-theme.ts      # Sistema de colores
    ├── components/
    │   ├── ConfigCard.tsx              # Tarjeta temática
    │   ├── ConfigField.tsx             # Campo individual
    │   ├── ConfigDisplayView.tsx       # Vista de lectura
    │   ├── ConfigEditView.tsx          # Vista de edición
    │   ├── ConfigActions.tsx           # Botones de acción
    │   └── index.ts
    ├── index.ts
    └── README.md
```

---

## Tipos de Datos

### AttendanceConfig

```typescript
interface AttendanceConfig {
  id: number;
  riskThresholdPercentage: number;      // 0-100, default: 80
  consecutiveAbsenceAlert: number;      // ≥1, default: 3
  defaultNotesPlaceholder: string | null;
  lateThresholdTime: string;            // HH:MM, default: "08:30"
  markAsTardyAfterMinutes: number;      // 1-120, default: 15
  justificationRequiredAfter: number;   // ≥0, default: 3
  maxJustificationDays: number;         // ≥1, default: 365
  autoApproveJustification: boolean;    // default: false
  autoApprovalAfterDays: number;        // ≥1, default: 7
  isActive: boolean;                    // default: true
  createdAt: string;
  updatedAt: string;
}
```

### UpdateAttendanceConfigDto

```typescript
interface UpdateAttendanceConfigDto {
  riskThresholdPercentage?: number;
  consecutiveAbsenceAlert?: number;
  defaultNotesPlaceholder?: string | null;
  lateThresholdTime?: string;
  markAsTardyAfterMinutes?: number;
  justificationRequiredAfter?: number;
  maxJustificationDays?: number;
  autoApproveJustification?: boolean;
  autoApprovalAfterDays?: number;
  isActive?: boolean;
}
```

---

## Servicio API

El archivo `src/services/attendance-config.service.ts` proporciona todos los métodos:

```typescript
// Obtener configuración actual
const config = await attendanceConfigService.getCurrent();

// Obtener por ID
const config = await attendanceConfigService.getById(1);

// Obtener todas (paginado)
const response = await attendanceConfigService.getAll({ page: 1, limit: 10 });

// Crear nueva
const newConfig = await attendanceConfigService.create({
  riskThresholdPercentage: 85,
  consecutiveAbsenceAlert: 4,
});

// Actualizar
const updated = await attendanceConfigService.update(1, {
  riskThresholdPercentage: 90,
});

// Eliminar
await attendanceConfigService.delete(1);

// Resetear a valores por defecto
const reset = await attendanceConfigService.reset();

// Obtener valores por defecto
const defaults = await attendanceConfigService.getDefaults();
```

---

## Componentes UI

### 1. AttendanceConfigPage (Principal)

Componente que integra todo con manejo de estado.

```tsx
import { AttendanceConfigPage } from '@/components/features/attendance-config';

export default function ConfigPage() {
  return <AttendanceConfigPage />;
}
```

**Props:**
- `compact?: boolean` - Modo compacto para espacios pequeños

---

### 2. ConfigDisplayView

Vista de solo lectura con información organizada.

```tsx
import { ConfigDisplayView } from '@/components/features/attendance-config';

<ConfigDisplayView 
  config={config} 
  loading={isLoading}
/>
```

**Props:**
- `config: AttendanceConfig` - Configuración a mostrar
- `loading?: boolean` - Estado de carga

---

### 3. ConfigEditView

Formulario de edición con validaciones.

```tsx
import { ConfigEditView } from '@/components/features/attendance-config';

<ConfigEditView
  config={config}
  onSave={async (data) => {
    await attendanceConfigService.update(config.id, data);
  }}
  onCancel={() => setEditing(false)}
  loading={isLoading}
/>
```

**Props:**
- `config: AttendanceConfig` - Configuración actual
- `onSave: (data) => Promise<void>` - Callback al guardar
- `onCancel: () => void` - Callback al cancelar
- `loading?: boolean` - Estado de carga

---

### 4. ConfigCard

Tarjeta temática para agrupar configuraciones.

```tsx
import { ConfigCard } from '@/components/features/attendance-config';

<ConfigCard
  title="Umbral de Riesgo"
  type="threshold"
  description="Configuración de límites de asistencia"
  icon={AlertCircle}
>
  {/* Contenido */}
</ConfigCard>
```

**Props:**
- `title: string` - Título
- `type: 'threshold' | 'timing' | 'justification' | 'approval'` - Tipo de sección
- `description?: string` - Descripción
- `icon?: React.ComponentType` - Icono personalizado
- `compact?: boolean` - Modo compacto

---

### 5. ConfigField

Campo individual con dos modos: lectura y edición.

```tsx
import { ConfigField } from '@/components/features/attendance-config';

<ConfigField
  label="Porcentaje Mínimo"
  value={config.riskThresholdPercentage}
  editValue={editedValue}
  isEditing={true}
  onChange={(val) => setEditedValue(val)}
  type="percentage"
  min={0}
  max={100}
  error={validationError}
/>
```

**Props:**
- `label: string` - Etiqueta
- `value: string | number | boolean` - Valor actual (lectura)
- `editValue?: string | number | boolean` - Valor en edición
- `isEditing?: boolean` - Mostrar como editable
- `onChange?: (value) => void` - Callback de cambio
- `type?: 'text' | 'number' | 'time' | 'checkbox' | 'percentage'`
- `min?: number`, `max?: number`
- `helperText?: string` - Texto de ayuda
- `error?: string` - Mensaje de error

---

### 6. ConfigActions

Botones de acciones (Editar, Resetear, Eliminar, Recargar).

```tsx
import { ConfigActions } from '@/components/features/attendance-config';

<ConfigActions
  onEdit={() => setEditing(true)}
  onReset={handleReset}
  onDelete={handleDelete}
  onRefresh={handleRefresh}
  loading={isLoading}
  compact={false}
  showMore={true}
/>
```

**Props:**
- `onEdit: () => void` - Callback editar
- `onReset?: () => void` - Callback restaurar
- `onDelete?: () => void` - Callback eliminar
- `onRefresh?: () => void` - Callback recargar
- `loading?: boolean` - Estado de carga
- `compact?: boolean` - Modo compacto
- `showMore?: boolean` - Mostrar opciones adicionales

---

## Hooks Personalizados

### useAttendanceConfig

Hook principal para gestionar toda la funcionalidad.

```tsx
const {
  // Estado
  activeConfig,
  configs,
  defaults,
  isLoadingActive,
  isLoadingList,
  isUpdating,
  error,
  
  // Métodos
  fetchActiveConfig,
  fetchConfigs,
  fetchDefaults,
  create,
  update,
  deactivate,
  activate,
  resetDefaults,
  clearError,
  reset,
  
  // Utilidades
  isValidTimeFormat,
  isValidPercentage,
  isValidMinutes,
} = useAttendanceConfig();
```

---

### useActiveAttendanceConfig

Hook simplificado para obtener solo la configuración activa.

```tsx
const { config, loading, error, refetch } = useActiveAttendanceConfig();

useEffect(() => {
  if (config) {
    console.log('Riesgo:', config.riskThresholdPercentage);
  }
}, [config]);
```

**Props:**
- `autoFetch?: boolean` - Obtener automáticamente (default: true)

---

### useAttendanceConfigs

Hook para obtener lista paginada.

```tsx
const { configs, loading, pagination, error, refetch } = useAttendanceConfigs(
  { page: 1, limit: 10 }
);

configs.forEach(config => console.log(config.id));
```

---

### useAttendanceConfigDefaults

Hook para obtener valores por defecto.

```tsx
const { defaults, loading, error } = useAttendanceConfigDefaults();

console.log('Default threshold:', defaults?.riskThresholdPercentage);
```

---

## Ejemplos de Uso

### Ejemplo 1: Página Simple de Configuración

```tsx
'use client';

import { AttendanceConfigPage } from '@/components/features/attendance-config';
import { Card } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-slate-600">Gestiona los parámetros del sistema</p>
      </div>

      <Card>
        <AttendanceConfigPage />
      </Card>
    </div>
  );
}
```

---

### Ejemplo 2: Componente Personalizado

```tsx
'use client';

import { useState } from 'react';
import {
  ConfigDisplayView,
  ConfigEditView,
  ConfigActions,
} from '@/components/features/attendance-config';
import { useActiveAttendanceConfig } from '@/hooks/useAttendanceConfig';

export function CustomConfigManager() {
  const { config, loading, error, refetch } = useActiveAttendanceConfig();
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (data) => {
    // Tu lógica de guardado
    setIsEditing(false);
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!config) return <div>No existe configuración</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Configuración Activa</h2>
        <ConfigActions
          onEdit={() => setIsEditing(true)}
          onRefresh={refetch}
          compact={true}
        />
      </div>

      {isEditing ? (
        <ConfigEditView
          config={config}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <ConfigDisplayView config={config} />
      )}
    </div>
  );
}
```

---

### Ejemplo 3: Integración en Contexto

```tsx
'use client';

import { createContext, useContext } from 'react';
import { useActiveAttendanceConfig } from '@/hooks/useAttendanceConfig';
import { AttendanceConfig } from '@/types/attendance-config.types';

interface AttendanceConfigContextType {
  config: AttendanceConfig | null;
  loading: boolean;
  error: string | null;
}

const AttendanceConfigContext = createContext<AttendanceConfigContextType | null>(null);

export function AttendanceConfigProvider({ children }) {
  const { config, loading, error } = useActiveAttendanceConfig();

  return (
    <AttendanceConfigContext.Provider value={{ config, loading, error }}>
      {children}
    </AttendanceConfigContext.Provider>
  );
}

export function useAttendanceConfigContext() {
  const context = useContext(AttendanceConfigContext);
  if (!context) {
    throw new Error('useAttendanceConfigContext debe usarse dentro de AttendanceConfigProvider');
  }
  return context;
}

// Uso en componentes
function StudentAttendanceCard() {
  const { config } = useAttendanceConfigContext();

  if (!config) return null;

  return (
    <div>
      <p>Riesgo: {config.riskThresholdPercentage}%</p>
      <p>Tardanza después de: {config.markAsTardyAfterMinutes} minutos</p>
    </div>
  );
}
```

---

### Ejemplo 4: Validaciones Personalizadas

```tsx
'use client';

import { useState } from 'react';
import { UpdateAttendanceConfigDto } from '@/types/attendance-config.types';
import { attendanceConfigService } from '@/services/attendance-config.service';

export function ConfigValidator() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateConfig = (data: UpdateAttendanceConfigDto): boolean => {
    const newErrors: Record<string, string> = {};

    if (data.riskThresholdPercentage !== undefined) {
      if (data.riskThresholdPercentage < 0 || data.riskThresholdPercentage > 100) {
        newErrors.riskThresholdPercentage = 'Debe estar entre 0 y 100';
      }
    }

    if (data.lateThresholdTime !== undefined) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(data.lateThresholdTime)) {
        newErrors.lateThresholdTime = 'Formato inválido (HH:MM)';
      }
    }

    if (data.markAsTardyAfterMinutes !== undefined) {
      if (data.markAsTardyAfterMinutes < 1 || data.markAsTardyAfterMinutes > 120) {
        newErrors.markAsTardyAfterMinutes = 'Debe estar entre 1 y 120';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (data: UpdateAttendanceConfigDto, configId: number) => {
    if (!validateConfig(data)) {
      return;
    }

    try {
      await attendanceConfigService.update(configId, data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return null;
}
```

---

## Tema de Colores

Sistema de colores consistente organizado por secciones:

### Operaciones CRUD

```typescript
ATTENDANCE_CONFIG_THEME.operations = {
  read: {      // Índigo - Obtener información
    bg: 'bg-indigo-50 dark:bg-indigo-950',
    button: 'bg-indigo-600 hover:bg-indigo-700',
    // ...
  },
  update: {    // Ámbar - Actualizar
    bg: 'bg-amber-50 dark:bg-amber-950',
    button: 'bg-amber-600 hover:bg-amber-700',
    // ...
  },
  create: {    // Esmeralda - Crear
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    // ...
  },
  reset: {     // Cian - Resetear
    bg: 'bg-cyan-50 dark:bg-cyan-950',
    button: 'bg-cyan-600 hover:bg-cyan-700',
    // ...
  },
  delete: {    // Rojo - Eliminar
    bg: 'bg-red-50 dark:bg-red-950',
    button: 'bg-red-600 hover:bg-red-700',
    // ...
  },
}
```

### Secciones de Configuración

```typescript
ATTENDANCE_CONFIG_THEME.sections = {
  threshold: {},      // Rosa - Umbral de riesgo
  timing: {},         // Naranja - Horarios
  justification: {},  // Púrpura - Justificaciones
  approval: {},       // Teal - Aprobaciones
}
```

### Validaciones

```typescript
ATTENDANCE_CONFIG_THEME.validation = {
  error: {},    // Rojo
  warning: {},  // Amarillo
  success: {},  // Verde
  info: {},     // Azul
}
```

---

## Manejo de Errores

### Errores Comunes

```typescript
// 401 - No autenticado
try {
  await attendanceConfigService.getCurrent();
} catch (error) {
  // Redirigir a login
  window.location.href = '/login';
}

// 403 - Sin permisos
// El usuario no tiene el permiso 'attendance_config:read'

// 404 - No existe
// La configuración no fue encontrada
// Usar reset() para crear nueva

// 409 - Conflicto
// Ya existe una configuración activa
// Usar update() en lugar de create()
```

### Estrategia de Reintento

```typescript
async function fetchWithRetry(
  fn: () => Promise<any>,
  maxRetries = 3,
  delay = 1000
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.response?.status === 429 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      throw error;
    }
  }
}

// Uso
const config = await fetchWithRetry(() =>
  attendanceConfigService.getCurrent()
);
```

---

## Permisos Requeridos

El backend valida estos permisos según la operación:

| Operación | Permiso Requerido |
|-----------|-------------------|
| GET | `attendance_config:read` |
| POST | `attendance_config:create` |
| PATCH | `attendance_config:update` |
| DELETE | `attendance_config:delete` |

Verifica permisos antes de mostrar UI:

```tsx
function AdminConfigPanel() {
  const { user } = useAuth();
  
  if (!user?.hasPermission('attendance_config:update')) {
    return <div>No tienes permisos para editar</div>;
  }

  return <AttendanceConfigPage />;
}
```

---

## Notas Importantes

⚠️ **Una configuración activa**
- Solo existe 1 configuración en la BD
- GET siempre retorna la misma

📝 **Formato de Tiempo**
- Usar siempre HH:MM (24h)
- Validación en cliente: `/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/`

🔐 **Seguridad**
- Los tokens se envían automáticamente con cada request
- Implementar refresh token si es necesario

💾 **Caché**
- Los componentes no cachean datos
- Usar React Query o SWR para optimizar si es necesario

---

## Troubleshooting

**P: La configuración no se carga**
R: Verifica que:
1. El token de autenticación es válido
2. Tienes permiso `attendance_config:read`
3. Existe una configuración en el backend

**P: Los cambios no se guardan**
R: Revisa:
1. Las validaciones en la consola
2. Permisos (`attendance_config:update`)
3. El servidor está corriendo

**P: Quiero cachear la configuración**
R: Usa el contexto o React Query:

```tsx
const { data: config } = useQuery({
  queryKey: ['attendance-config'],
  queryFn: () => attendanceConfigService.getCurrent(),
  staleTime: 5 * 60 * 1000, // 5 minutos
});
```

---

## Recursos

- [API Docs](./ATTENDANCE_CONFIG_ENDPOINTS.md)
- [Types](../src/types/attendance-config.types.ts)
- [Service](../src/services/attendance-config.service.ts)
- [Components](../src/components/features/attendance-config/)
