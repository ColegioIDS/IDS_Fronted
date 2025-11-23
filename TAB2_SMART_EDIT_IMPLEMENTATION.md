# TAB 2 - ACTUALIZAR ASISTENCIA (OPCIÓN C: SMART EDIT)

**Implementación completada**: Edición inline inteligente de asistencias

---

## 🎯 Especificación Implementada

### Opción C - Smart Edit (Elegida por el usuario)

La solución permite editar estados de asistencia directamente sin modal, con:
- **Edición Inline**: Haz clic en ✏️ para entrar en modo edición
- **Cambio de Estado**: Selector dropdown con estatuses permitidos
- **Razón del Cambio**: Campo de texto para capturar motivo
- **Guardar Directo**: Botón 💾 para guardar cambios
- **Cancelar**: Botón ✗ para descartar
- **Recarga Automática**: Actualiza vista después de guardar
- **Feedback**: Mensajes de éxito/error integrados

---

## 📁 Archivos Creados/Modificados

### Frontend Components

#### 1. **UpdateAttendance-Smart.tsx** (NUEVO)
```
src/components/features/attendance/Tab2_UpdateAttendance/UpdateAttendance-Smart.tsx
```
- Componente wrapper principal de TAB 2
- Maneja carga de datos consolidados
- Gestiona estatuses permitidos por rol
- Orquesta llamadas al API para actualizar
- Muestra alertas de éxito/error
- Proporciona instrucciones de uso

**Características**:
- Carga datos con `getSectionAttendanceConsolidatedView()`
- Obtiene estatuses con `getAllowedAttendanceStatusesByRole()`
- Llama a `updateAttendanceStatus()` al guardar
- Recarga automática después de actualizar
- Estados: loading, error, successMessage

#### 2. **ConsolidatedAttendanceView.tsx** (MODIFICADO)
```
src/components/features/attendance/Tab2_UpdateAttendance/ConsolidatedAttendanceView.tsx
```
**Cambios**:
- Agregada prop `onStatusUpdate` callback function
- Interfaz `EditingState` para manejar edición
- Lógica de toggle edit mode en cada curso
- Dropdown para seleccionar nuevo estado
- Input para capturar razón del cambio
- Botones Save/Cancel en modo edición
- Mantiene indicadores de modificación visual

**Estructura de Edición**:
```tsx
interface EditingState {
  courseId: number;
  newStatusId: number;
  reason: string;
  isSaving: boolean;
}
```

### Backend API

#### 3. **route.ts - API Endpoint** (NUEVO)
```
src/api/attendance/update-status/route.ts
```
- Método: `PATCH /api/attendance/update-status`
- Body esperado:
  ```json
  {
    "enrollmentId": number,
    "courseId": number,
    "statusId": number,
    "reason": string
  }
  ```
- Validación básica de campos requeridos
- TODO: Validar permisos (admin/docente)
- TODO: Conectar con base de datos

### Services

#### 4. **attendance.service.ts** (MODIFICADO)
```
src/services/attendance.service.ts
```
**Nueva función**:
```typescript
export const updateAttendanceStatus = async (
  enrollmentId: number,
  courseId: number,
  statusId: number,
  reason: string = 'Estado modificado'
): Promise<{ success: boolean; message: string; data: unknown }>
```

- Realiza `PATCH` a `/api/attendance/update-status`
- Validación de respuesta: `response.data.success`
- Manejo de errores con throw
- Logueo de errores en consola
- Exportada en default export

---

## 🔄 Flujo de Actualización

```
Usuario Abre TAB 2
    ↓
[UpdateAttendance-Smart.tsx]
    ↓
Carga datos: getSectionAttendanceConsolidatedView()
    ↓
[ConsolidatedAttendanceViewComponent]
    ↓
Usuario expande estudiante y ve cursos
    ↓
Usuario hace clic en ✏️ (Edit)
    ↓
Modo edición: Dropdown + Input razón
    ↓
Usuario selecciona nuevo estado + ingresa razón
    ↓
Usuario hace clic en 💾 (Save)
    ↓
Llamada: updateAttendanceStatus()
    ↓
PATCH /api/attendance/update-status
    ↓
Backend: Valida + Actualiza DB (TODO)
    ↓
Response: { success: true, ... }
    ↓
Recarga automática: getSectionAttendanceConsolidatedView()
    ↓
Actualiza UI con nuevos datos
    ↓
Muestra: "✓ Estado actualizado correctamente"
    ↓
Después 3s: Limpia mensaje
```

---

## 🎨 UI/UX Features

### Estados Visuales

| Modo | Apariencia | Acciones |
|------|-----------|----------|
| **Lectura** | Fila gris, estados de color | Haz clic en ✏️ |
| **Edición** | Fondo azul claro | Selector + Input visibles |
| **Guardando** | Botón deshabilitado | Loading implícito |
| **Éxito** | Alert verde (3s) | Recarga automática |
| **Error** | Alert rojo (permanente) | Retry posible |

### Indicadores

- **Original vs Actual**: Comparación lado a lado
- **⚠️ Cambió**: Badge si estado fue modificado
- **Modificado por**: Muestra usuario + timestamp previo
- **Registrado por**: Quién originalmente registró

### Colores

- **Estudiante sin cambios**: Fondo blanco
- **Estudiante con cambios**: Fondo ámbar claro
- **Modo edición activo**: Fondo azul claro
- **Indicador cambio**: Borde izquierdo ámbar en curso

---

## 🔧 Integración con Contexto

```typescript
// AttendanceContext - Propiedades usadas
attendanceState.selectedSectionId  // ID de sección
attendanceState.selectedDate       // Fecha (YYYY-MM-DD)

// AuthContext - Propiedades usadas
user.role?.id                      // Para obtener estatuses permitidos
```

---

## 📝 Tipos TypeScript

### Interfaz EditingState
```typescript
interface EditingState {
  courseId: number;           // Curso siendo editado
  newStatusId: number;        // Estado seleccionado
  reason: string;             // Motivo del cambio
  isSaving: boolean;          // Indicador de guardado
}
```

### Props de Componente
```typescript
interface ConsolidatedAttendanceViewProps {
  data: ConsolidatedAttendanceView;
  allowedStatuses?: AttendanceStatus[];
  onStatusUpdate?: (
    enrollmentId: number,
    courseId: number,
    newStatusId: number,
    reason?: string
  ) => Promise<void>;
}
```

---

## ✅ Checklist de Implementación

- ✅ Componente wrapper `UpdateAttendance-Smart.tsx` creado
- ✅ Componente `ConsolidatedAttendanceView.tsx` mejorado con edición
- ✅ API endpoint `/api/attendance/update-status` creado
- ✅ Función `updateAttendanceStatus()` en service
- ✅ Interfaz `EditingState` para gestionar estado
- ✅ Toggle edit mode por curso
- ✅ Dropdown selector para nuevos estados
- ✅ Input para razón del cambio
- ✅ Botones Save/Cancel funcionales
- ✅ Manejo de errores
- ✅ Mensajes de éxito
- ✅ Recarga automática después de guardar
- ✅ TypeScript sin errores ✅
- ✅ Integración con contextos (Auth + Attendance)

---

## 🚀 Próximos Pasos (Backend TODO)

### En `src/api/attendance/update-status/route.ts`

1. **Validación de Permisos**
   ```typescript
   // Verificar que usuario es admin o docente de la sección
   const userRole = session?.user?.role?.code;
   if (!['ADMIN', 'TEACHER'].includes(userRole)) {
     return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
   }
   ```

2. **Conexión con Base de Datos**
   ```typescript
   // Actualizar registro de asistencia
   const updated = await db.attendance.update({
     where: {
       enrollmentId_courseId_date: {
         enrollmentId,
         courseId,
         date: currentDate,
       },
     },
     data: {
       statusId,
       modifiedBy: session?.user?.id,
       modifiedAt: new Date(),
       modificationReason: reason,
     },
   });
   ```

3. **Validaciones Adicionales**
   - Verificar que enrollment existe y está activo
   - Verificar que el status es permitido para este rol
   - Validar que la fecha está dentro del bimestre activo
   - Registrar cambio en log de auditoría

4. **Respuesta**
   ```typescript
   return NextResponse.json({
     success: true,
     message: 'Estado actualizado correctamente',
     data: {
       enrollmentId,
       courseId,
       statusId,
       updatedAt: new Date().toISOString(),
     },
   });
   ```

---

## 📖 Cómo Usar en la Aplicación

### Importar y usar TAB 2
```typescript
import { UpdateAttendanceTabSmartEdit } from '@/components/features/attendance/Tab2_UpdateAttendance/UpdateAttendance-Smart';

// En el switch de tabs
case 2:
  return <UpdateAttendanceTabSmartEdit />;
```

### Asegurar que esté disponible
- Requiere `selectedSectionId` y `selectedDate` en `AttendanceContext`
- Requiere que usuario tenga rol válido en `AuthContext`
- TAB 2 debe ser visible en la navegación de tabs

---

## 🔐 Permisos y Restricciones

- **Roles permitidos**: Admin, Docente de la sección
- **Restricciones**: Solo modificar asistencias del día actual/bimestre activo
- **Auditoría**: Registrar quién cambió, cuándo y por qué
- **Validación**: No permitir cambios a estados no permitidos para el rol

---

## 📊 Estados Posibles por Rol

| Rol | Estados Permitidos | Puede Modificar |
|-----|------------------|-----------------|
| Admin | Todos | Sí (con auditoría) |
| Docente | Configurables | Sí (de su sección) |
| Estudiante | Ninguno | No |
| Administrativo | Limitados | Según permisos |

---

## 🐛 Debugging

### Ver logs en consola del navegador
```javascript
// Cuando se carga TAB 2
console.log('Loading consolidated view...', selectedSectionId, selectedDate);

// Cuando se hace clic en Edit
console.log('Editing course:', courseId, 'Status:', newStatusId);

// Cuando se guarda
console.log('Updating status...', enrollmentId, courseId, statusId, reason);

// Cuando completa
console.log('Update successful, reloading...');
```

### Ver request/response en Network tab
- Request: `PATCH /api/attendance/update-status`
- Payload: JSON con enrollmentId, courseId, statusId, reason
- Response: `{ success: true, message: '...', data: {...} }`

---

## ✨ Características Futuras Sugeridas

1. **Edición Múltiple**: Seleccionar varios cursos y cambiar estado en batch
2. **Historial**: Ver quién y cuándo cambió cada asistencia
3. **Deshacer**: Botón para revertir últimos cambios
4. **Exportar**: Descargar reporte de cambios realizados
5. **Sincronización**: En tiempo real si hay múltiples usuarios editando
6. **Validaciones**: Advertencia si cambio requiere justificación
7. **Atajos de teclado**: Enter para guardar, Esc para cancelar

---

**Estado Final**: ✅ TAB 2 implementado con edición smart inline, listo para conectar backend
