# 🎯 Attendance Config - Guía Integrada

## Setup (1 línea)

```tsx
import { AttendanceConfigPage } from '@/components/features/attendance-config';

export default function Config() {
  return <AttendanceConfigPage />;
}
```

---

## 📚 Estructura Creada

```
src/
├── types/attendance-config.types.ts
├── services/attendance-config.service.ts
└── components/features/attendance-config/
    ├── AttendanceConfigPage.tsx          (componente principal)
    ├── attendance-config-theme.ts        (colores: rosa, naranja, púrpura, teal)
    └── components/
        ├── ConfigCard.tsx
        ├── ConfigField.tsx
        ├── ConfigDisplayView.tsx
        ├── ConfigEditView.tsx
        └── ConfigActions.tsx
```

---

## ✨ Qué Funciona

- ✅ Ver configuración
- ✅ Editar parámetros
- ✅ Guardar cambios
- ✅ Restaurar valores por defecto
- ✅ Validaciones en cliente
- ✅ Dark mode
- ✅ Responsive design

---

## 🚀 Uso Directo

```tsx
// Obtener configuración
const config = await attendanceConfigService.getCurrent();

// Actualizar
await attendanceConfigService.update(config.id, {
  riskThresholdPercentage: 85
});

// Restaurar
await attendanceConfigService.reset();
```

---

## 🎨 Colores Usados

| Operación | Color |
|-----------|-------|
| Leer | Índigo |
| Actualizar | Ámbar |
| Crear | Esmeralda |
| Restaurar | Cian |
| Eliminar | Rojo |

**Secciones:** Rosa (riesgo), Naranja (tardanza), Púrpura (justificación), Teal (aprobación)

---

## 🪝 Hook Personalizado

```tsx
const { config, loading, error, update, reset } = useAttendanceConfig();
```

---

## 🔐 Permisos Requeridos

- `attendance_config:read` - Ver
- `attendance_config:update` - Editar
- `attendance_config:delete` - Eliminar

---

## 📱 Responsive

```tsx
// Modo compacto para móvil
<AttendanceConfigPage compact={true} />
```

---

## 🧪 Validaciones

- riskThresholdPercentage: 0-100
- lateThresholdTime: formato HH:MM
- markAsTardyAfterMinutes: 1-120
- Otras validaciones automáticas

---

## 🆘 Troubleshooting

| Error | Causa | Solución |
|-------|-------|----------|
| 401 | Token inválido | Logout/login |
| 403 | Sin permisos | Contactar admin |
| 404 | Config no existe | Ejecutar seed |
| No carga | Backend down | Iniciar backend |

---

## 📖 Documentación

Ver `/docs/` para:
- `ATTENDANCE_CONFIG_INTEGRATION.md` - Referencia completa
- `ATTENDANCE_CONFIG_ADVANCED_EXAMPLES.md` - Casos avanzados (React Query, hooks, testing)

---

## ✅ Quick Checklist

- [ ] Navega a `/admin/attendance-config`
- [ ] Se carga la configuración
- [ ] Puedes editar
- [ ] Cambios se guardan
- [ ] Colores se ven bien

---

**¡Listo para usar! 🚀**
