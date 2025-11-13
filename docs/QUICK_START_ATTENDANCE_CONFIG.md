// docs/QUICK_START_ATTENDANCE_CONFIG.md

# Quick Start - Attendance Config

Guía rápida para integrar AttendanceConfig en tu aplicación.

## ⚡ 1 Minuto - Implementación Básica

```tsx
'use client';

import { AttendanceConfigPage } from '@/components/features/attendance-config';

export default function ConfigPage() {
  return (
    <main className="max-w-7xl mx-auto p-6">
      <AttendanceConfigPage />
    </main>
  );
}
```

**Eso es todo.** El componente maneja:
- ✅ Cargar datos
- ✅ Mostrar/Editar configuración
- ✅ Validaciones
- ✅ Errores
- ✅ Estados de carga

---

## 5 Minutos - Personalización

### Modo Compacto (para sidebars)

```tsx
<AttendanceConfigPage compact={true} />
```

### Con Layout Personalizado

```tsx
'use client';

import { AttendanceConfigPage } from '@/components/features/attendance-config';
import { Card } from '@/components/ui/card';
import { Breadcrumb } from '@/components/common/Breadcrumb';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Admin', href: '/admin' },
        { label: 'Configuración' },
      ]} />

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Configuración de Asistencia</h1>
          <p className="text-slate-600 mt-2">
            Ajusta los parámetros del sistema de asistencia
          </p>
        </div>
      </div>

      <Card className="p-6">
        <AttendanceConfigPage />
      </Card>
    </div>
  );
}
```

---

## 10 Minutos - Hook Personalizado

Usa solo la configuración en tu componente:

```tsx
'use client';

import { useActiveAttendanceConfig } from '@/hooks/useAttendanceConfig';

export function StudentRiskAlert({ studentAttendance }) {
  const { config, loading } = useActiveAttendanceConfig();

  if (loading || !config) return null;

  const isAtRisk = studentAttendance < config.riskThresholdPercentage;

  if (!isAtRisk) return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4">
      <p className="text-red-800 font-semibold">
        ⚠️ Estudiante en riesgo de reprobación
      </p>
      <p className="text-red-600 text-sm mt-1">
        Asistencia: {studentAttendance}% (Mínimo: {config.riskThresholdPercentage}%)
      </p>
    </div>
  );
}
```

---

## 15 Minutos - API Directa

Usa el servicio directamente:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { attendanceConfigService } from '@/services/attendance-config.service';
import { AttendanceConfig } from '@/types/attendance-config.types';

export function AttendanceChecker() {
  const [config, setConfig] = useState<AttendanceConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await attendanceConfigService.getCurrent();
        setConfig(data);
      } catch (error) {
        console.error('Error loading config:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (!config) return <div>No hay configuración</div>;

  return (
    <div>
      <h2>Parámetros de Asistencia</h2>
      <ul>
        <li>Umbral de riesgo: {config.riskThresholdPercentage}%</li>
        <li>Hora límite: {config.lateThresholdTime}</li>
        <li>Tardanza después de: {config.markAsTardyAfterMinutes} min</li>
      </ul>
    </div>
  );
}
```

---

## 🎨 Colores Disponibles

El módulo usa estos colores:

```typescript
// Operaciones
read: Índigo 🔵
update: Ámbar 🟡
create: Esmeralda 🟢
reset: Cian 🩵
delete: Rojo 🔴

// Secciones
threshold: Rosa 🌸
timing: Naranja 🟠
justification: Púrpura 🟣
approval: Teal 🌊

// Validaciones
error: Rojo 🔴
warning: Amarillo 🟨
success: Verde 🟢
info: Azul 🔵
```

Personaliza en `attendance-config-theme.ts`:

```typescript
export const ATTENDANCE_CONFIG_THEME = {
  operations: {
    update: {
      button: 'bg-YOUR-COLOR hover:bg-YOUR-COLOR-700',
      // ...
    },
  },
};
```

---

## 🔐 Permisos

Protege rutas según permisos:

```tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { AttendanceConfigPage } from '@/components/features/attendance-config';

export default function AdminConfig() {
  const { user } = useAuth();

  // Verificar permiso
  const canManage = user?.hasPermission('attendance_config:update');

  if (!canManage) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p>No tienes permisos para acceder a esta página</p>
      </div>
    );
  }

  return <AttendanceConfigPage />;
}
```

---

## 🧪 Testing

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { AttendanceConfigPage } from '@/components/features/attendance-config';

// Mock del servicio
jest.mock('@/services/attendance-config.service', () => ({
  attendanceConfigService: {
    getCurrent: jest.fn().mockResolvedValue({
      id: 1,
      riskThresholdPercentage: 80,
      // ... más datos
    }),
  },
}));

test('carga y muestra configuración', async () => {
  render(<AttendanceConfigPage />);
  
  await waitFor(() => {
    expect(screen.getByText(/80%/)).toBeInTheDocument();
  });
});
```

---

## 📱 Responsive

El componente es responsive por defecto:

```tsx
// Desktop - vista completa
<AttendanceConfigPage />

// Mobile - vista compacta
<AttendanceConfigPage compact={true} />

// En media queries
<div className="hidden md:block">
  <AttendanceConfigPage />
</div>

<div className="block md:hidden">
  <AttendanceConfigPage compact={true} />
</div>
```

---

## 🚀 Deployment

### Checklist

- [ ] Backend está corriendo con los endpoints de AttendanceConfig
- [ ] Token de autenticación es válido
- [ ] Usuario tiene permisos `attendance_config:read`
- [ ] Existe configuración en la BD (o ejecuta seed)
- [ ] Variables de entorno están configuradas

### Verificar Conexión

```tsx
// En consola del navegador
const config = await fetch('/api/attendance-config', {
  headers: {
    'Authorization': `Bearer ${YOUR_TOKEN}`
  }
}).then(r => r.json());

console.log(config);
```

---

## 📚 Estructura de Archivos Generada

```
✅ src/types/attendance-config.types.ts
✅ src/services/attendance-config.service.ts
✅ src/components/features/attendance-config/
   ✅ AttendanceConfigPage.tsx
   ✅ attendance-config-theme.ts
   ✅ components/
      ✅ ConfigCard.tsx
      ✅ ConfigField.tsx
      ✅ ConfigDisplayView.tsx
      ✅ ConfigEditView.tsx
      ✅ ConfigActions.tsx
      ✅ index.ts
   ✅ index.ts
   ✅ README.md
✅ docs/
   ✅ ATTENDANCE_CONFIG_INTEGRATION.md (esta guía completa)
   ✅ QUICK_START_ATTENDANCE_CONFIG.md (esta guía rápida)
```

---

## 🆘 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| **Error 401** | Verifica token de autenticación |
| **Error 403** | Comprueba permiso `attendance_config:read` |
| **Error 404** | Ejecuta seed del backend para crear config |
| **No se actualiza** | Verifica permiso `attendance_config:update` |
| **Estilos raros** | Asegúrate que Tailwind está habilitado |

---

## 💬 Ejemplos por Use Case

### Mostrar en Dashboard Administrativo

```tsx
<section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <Card>
    <h3 className="font-bold mb-4">Configuración Actual</h3>
    <ConfigDisplayView config={config} />
  </Card>

  <Card>
    <h3 className="font-bold mb-4">Estadísticas</h3>
    {/* Tus gráficos */}
  </Card>
</section>
```

### En Modal de Edición

```tsx
<Modal isOpen={isOpen} onClose={onClose}>
  <ConfigEditView
    config={config}
    onSave={async (data) => {
      await attendanceConfigService.update(config.id, data);
      onClose();
    }}
    onCancel={onClose}
  />
</Modal>
```

### En Sidebar

```tsx
<aside className="w-64">
  <div className="p-4 space-y-4">
    <h3>Configuración</h3>
    <AttendanceConfigPage compact={true} />
  </div>
</aside>
```

---

## 🎓 Siguientes Pasos

1. ✅ Implementa la página básica
2. ✅ Prueba las operaciones CRUD
3. ✅ Integra en tu layout
4. ✅ Añade protección de permisos
5. ✅ Personaliza colores (opcional)
6. ✅ Deploy a producción

---

## 📖 Documentación Completa

Ver `ATTENDANCE_CONFIG_INTEGRATION.md` para:
- Documentación de API
- Todos los componentes
- Hooks avanzados
- Ejemplos complejos
- Manejo de errores

---

¡Listo! 🎉 Tu módulo de configuración está integrado.
