// src/components/features/attendance-config/README.md

# Attendance Config Module

Módulo completo para gestionar la configuración global del sistema de asistencia.

## 📋 Contenido

- **Types** - Interfaces TypeScript para la configuración
- **Service** - Cliente API para consumir endpoints
- **Components** - Componentes UI reutilizables
- **Theme** - Sistema de colores consistente con attendance

## 🎯 Características

✅ Gestión completa de configuración (CRUD)
✅ Vista de solo lectura con información clara
✅ Modo de edición con validaciones
✅ Reset a valores por defecto
✅ Tema de colores bonito y consistente
✅ Soporte responsive (desktop y mobile)
✅ Estados de carga y error

## 📦 Componentes

### AttendanceConfigPage
Componente principal que integra toda la funcionalidad.

```tsx
import { AttendanceConfigPage } from '@/components/features/attendance-config';

export default function ConfigPage() {
  return <AttendanceConfigPage />;
}
```

### ConfigDisplayView
Vista de solo lectura con información organizada.

```tsx
<ConfigDisplayView config={config} loading={false} />
```

### ConfigEditView
Formulario de edición con validaciones.

```tsx
<ConfigEditView
  config={config}
  onSave={handleSave}
  onCancel={() => {}}
  loading={false}
/>
```

### ConfigActions
Botones de acciones (Editar, Resetear, Eliminar, Recargar).

```tsx
<ConfigActions
  onEdit={() => {}}
  onReset={() => {}}
  onDelete={() => {}}
  onRefresh={() => {}}
  loading={false}
  compact={false}
  showMore={true}
/>
```

### ConfigCard
Tarjeta temática para agrupar configuraciones.

```tsx
<ConfigCard
  title="Título"
  type="threshold"
  description="Descripción"
>
  Contenido
</ConfigCard>
```

### ConfigField
Campo individual con vista de solo lectura y edición.

```tsx
<ConfigField
  label="Umbral"
  value={80}
  editValue={85}
  isEditing={true}
  onChange={(val) => {}}
  type="number"
  error="Validación fallida"
/>
```

## 🎨 Tema de Colores

El módulo utiliza un sistema de temas consistente con colores bonitos:

```typescript
ATTENDANCE_CONFIG_THEME.operations = {
  read: { /* Índigo */ },
  update: { /* Ámbar */ },
  create: { /* Esmeralda */ },
  reset: { /* Cian */ },
  delete: { /* Rojo */ },
}

ATTENDANCE_CONFIG_THEME.sections = {
  threshold: { /* Rosa */ },
  timing: { /* Naranja */ },
  justification: { /* Púrpura */ },
  approval: { /* Teal */ },
}
```

## 🔧 Integración con API

El servicio `attendanceConfigService` maneja todos los endpoints:

```typescript
// Obtener configuración actual
const config = await attendanceConfigService.getCurrent();

// Actualizar
await attendanceConfigService.update(1, { riskThresholdPercentage: 85 });

// Resetear a valores por defecto
await attendanceConfigService.reset();

// Eliminar
await attendanceConfigService.delete(1);

// Obtener valores por defecto
const defaults = await attendanceConfigService.getDefaults();
```

## 📝 Tipos

```typescript
// Configuración básica
interface AttendanceConfig {
  id: number;
  riskThresholdPercentage: number;
  consecutiveAbsenceAlert: number;
  defaultNotesPlaceholder: string | null;
  lateThresholdTime: string; // HH:MM
  markAsTardyAfterMinutes: number;
  justificationRequiredAfter: number;
  maxJustificationDays: number;
  autoApproveJustification: boolean;
  autoApprovalAfterDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Para crear/actualizar
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

## 🚀 Uso Básico

```tsx
'use client';

import { AttendanceConfigPage } from '@/components/features/attendance-config';

export default function SettingsPage() {
  return (
    <main className="max-w-7xl mx-auto p-6">
      <AttendanceConfigPage />
    </main>
  );
}
```

## 📱 Responsive

- **Desktop**: Vista completa con todas las opciones
- **Tablet**: Ajustes de espaciado y tamaño
- **Mobile**: Versión compacta con menú desplegable de acciones

Usa la prop `compact={true}` para adaptar a espacios más pequeños:

```tsx
<AttendanceConfigPage compact={true} />
```

## ⚡ Permisos Requeridos

El backend requiere estos permisos según la operación:

- `attendance_config:read` - Para obtener
- `attendance_config:create` - Para crear
- `attendance_config:update` - Para actualizar
- `attendance_config:delete` - Para eliminar

## 🔄 Estado y Manejo de Errores

El componente maneja automáticamente:

- **Estados de carga** - Spinner mientras carga
- **Errores** - Mensajes de error con opción de reintentar
- **Validaciones** - Validación en cliente con mensajes específicos
- **Success messages** - Confirmación de acciones completadas

## 💡 Ejemplo Completo

```tsx
'use client';

import { AttendanceConfigPage } from '@/components/features/attendance-config';
import { Card } from '@/components/ui/card';

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Administración</h1>
        <p className="text-slate-600">Gestiona la configuración del sistema</p>
      </div>

      <Card className="p-6">
        <AttendanceConfigPage />
      </Card>
    </div>
  );
}
```

## 📚 Referencias

- Documentación API: `/docs/Attendance_Config_Integration_Guide.md`
- Tipos: `/src/types/attendance-config.types.ts`
- Servicio: `/src/services/attendance-config.service.ts`
