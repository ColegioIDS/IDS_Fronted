# Crear Configuración de Asistencia

## 📋 Resumen

Cuando la base de datos no tiene una configuración de asistencia, el frontend ahora permite **crear una directamente** sin necesidad de ejecutar seeds en el backend.

## 🚀 Cómo Usar

### Paso 1: Navega al módulo
```
/admin/attendance-config
```

### Paso 2: Verás una de estas opciones:

#### Opción A: Si no hay error
- Aparece un mensaje **"No hay configuración"**
- Hay un botón **"Crear Configuración"**
- Click en el botón para abrir el formulario

#### Opción B: Si hay error
- Aparece el error de carga
- Hay dos botones:
  - **"Reintentar"** - Intenta cargar nuevamente
  - **"Crear Configuración"** - Abre el formulario de creación

### Paso 3: Completa el formulario
Se pre-rellenan los valores por defecto:
- **Umbral de Riesgo**: 80%
- **Alerta de Ausencias Consecutivas**: 3
- **Hora Límite de Tardanza**: 08:30
- **Marcar como Tardío después de**: 15 minutos
- **Requiere Justificación después de**: 3 ausencias
- **Días máximos para justificar**: 365
- **Auto-aprobar justificaciones**: No
- **Días antes de auto-aprobación**: 7
- **Activa**: Sí

### Paso 4: Guarda
- Click en **"Guardar"** para crear
- El sistema llama a `POST /api/attendance-config`
- Si es exitoso, verás el mensaje de éxito

## 🔄 Flujo Completo

```
┌─────────────────────────┐
│ Acceder a módulo        │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ ¿Config existe?                 │
└────────┬──────────────┬─────────┘
         │No            │Sí
         ▼              │
┌──────────────────┐    │
│ Sin config       │    │
│                  │    ▼
│ Crear   Reintentar   Config
│                      Display
└────────┬─────────┘
         │
         ▼
    Crear config
```

## 🛠️ Componentes Involucrados

**AttendanceConfigPage.tsx**
- Maneja el estado `showCreateForm`
- Renderiza el formulario de creación
- Llama a `handleCreate()` para guardar

**ConfigEditView.tsx**
- Acepta tanto `UpdateAttendanceConfigDto` como `CreateAttendanceConfigDto`
- Valida los datos del formulario
- Maneja errores de validación

## ✅ Validaciones

El formulario valida:
- **Porcentaje**: 0-100
- **Tiempo (HH:MM)**: Formato válido
- **Minutos**: 1-120
- **Lógica**: Si auto-aprobar está activo, debe haber días de aprobación

## 📡 API Endpoint

```bash
POST /api/attendance-config
Content-Type: application/json

{
  "riskThresholdPercentage": 80,
  "consecutiveAbsenceAlert": 3,
  "lateThresholdTime": "08:30",
  "markAsTardyAfterMinutes": 15,
  "justificationRequiredAfter": 3,
  "maxJustificationDays": 365,
  "autoApproveJustification": false,
  "autoApprovalAfterDays": 7,
  "isActive": true
}
```

## 🔐 Permisos Requeridos

- `attendance-config:create` - Para crear
- `attendance-config:view` - Para ver la página

Usa `useAuth()` para validar antes de mostrar botones:

```tsx
const { hasPermission } = useAuth();

if (hasPermission('attendance-config', 'create')) {
  // Mostrar botón de crear
}
```

## 🐛 Troubleshooting

### Error: "No tienes permiso"
- Verifica que tu usuario tenga el role correcto
- Contacta al administrador

### Error: "Error al crear configuración"
- Revisa la consola del navegador (DevTools)
- Verifica que el backend esté corriendo
- Comprueba que los datos sean válidos

### El formulario no se abre
- Recarga la página (F5)
- Limpia el cache (Ctrl+Shift+Del)
- Verifica que no haya error en la consola

