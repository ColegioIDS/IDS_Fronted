## Sistema de Manejo de Errores - Módulo Cotejos

### Descripción General

Se ha implementado un sistema robusto de manejo de errores para el módulo Cotejos que incluye:

1. **Constantes de errores** (`cotejos-errors.constants.ts`)
2. **Utilidades de error** (`cotejos-error.utils.ts`)
3. **Componente de alerta de error** (`CotejosErrorAlert.tsx`)
4. **Hook para notificaciones** (`useCotejosErrorToast.ts`)
5. **Integración en hooks y servicios**

### Error Codes por Endpoint

#### GET /api/cotejos/cascade
- **NO_ACTIVE_CYCLE**: No hay un ciclo escolar activo
  - Mensaje: "No hay un ciclo escolar activo en este momento. Por favor, contacta al administrador."
  - Recuperable: ❌ No (el usuario no puede hacer nada)

#### POST /api/cotejos/:enrollmentId/course/:courseId/generate
- **COTEJO_ALREADY_COMPLETED**: El cotejo ya fue completado
  - Mensaje: "Este cotejo ya ha sido completado y no puede ser modificado..."
  - Recuperable: ❌ No
- **ENROLLMENT_NOT_FOUND**: Inscripción no encontrada
  - Recuperable: ❌ No
- **COURSE_NOT_FOUND**: Curso no encontrado
  - Recuperable: ❌ No
- **BIMESTER_NOT_FOUND**: Bimestre no encontrado
  - Recuperable: ❌ No

#### GET /api/cotejos/:id
- **COTEJO_NOT_FOUND**: Cotejo no encontrado
  - Recuperable: ❌ No
  - Mensaje: "El cotejo no fue encontrado. Intenta recargar la página."

#### PATCH /api/cotejos/:id/actitudinal
- **COTEJO_NOT_FOUND**: Cotejo no encontrado
  - Recuperable: ❌ No
- **INVALID_SCORE_RANGE**: Puntuación fuera del rango permitido
  - Mensaje: "La puntuación está fuera del rango permitido. Verifica el rango válido para este componente."
  - Recuperable: ✅ Sí (el usuario puede reintentarlo con otro valor)

#### PATCH /api/cotejos/:id/declarativo
- **COTEJO_NOT_FOUND**: Cotejo no encontrado
  - Recuperable: ❌ No
- **INVALID_SCORE_RANGE**: Puntuación fuera del rango permitido
  - Recuperable: ✅ Sí

#### PATCH /api/cotejos/:id/submit
- **COTEJO_NOT_FOUND**: Cotejo no encontrado
  - Recuperable: ❌ No
- **INCOMPLETE_COTEJO**: Cotejo incompleto
  - Mensaje: "El cotejo no está completo. Asegúrate de completar todos los componentes..."
  - Recuperable: ✅ Sí (completa los campos faltantes)
- **SCORE_EXCEEDS_MAXIMUM**: Suma de puntuaciones excede 100
  - Mensaje: "La suma total de puntuaciones no puede exceder 100 puntos."
  - Recuperable: ✅ Sí

### Estructura de Error de API

```json
{
  "success": false,
  "errorCode": "CODIGO_DEL_ERROR",
  "errorType": "TIPO_DE_ERROR",
  "message": "Mensaje legible para el usuario",
  "detail": "Detalles técnicos adicionales",
  "data": null
}
```

### Uso en Componentes

#### Mostrar Alert de Error
```tsx
import { CotejosErrorAlert } from '@/components/features/cotejos/CotejosErrorAlert';

<CotejosErrorAlert
  errorCode={error.code}
  message={error.message}
  detail={error.detail}
  onRetry={() => { /* reintentar */ }}
  onDismiss={() => { /* descartar */ }}
  showDetail={false}
/>
```

#### Mostrar Toast de Error
```tsx
import { useCotejosErrorToast } from '@/hooks/useCotejosErrorToast';

const { showError, showRecoverableError } = useCotejosErrorToast();

// Error simple
showError('COTEJO_NOT_FOUND');

// Error con opción de reintentar
showRecoverableError('INVALID_SCORE_RANGE', undefined, () => {
  // función para reintentar
});
```

#### Usar en Hooks
```tsx
const { mutate, loading, error } = useUpdateActitudinal();

// Si hay error, se proporciona con este formato:
// error = {
//   message: string,
//   code: string,
//   detail?: string
// }
```

### Tipos de Error

El hook `extractCotejosError` convierte cualquier tipo de error (Axios, desconocido, etc.) a `CotejosError`:

```typescript
class CotejosError extends Error {
  errorCode: string;      // Código del error (ej: "COTEJO_NOT_FOUND")
  errorType: string;      // Tipo (ej: "NOT_FOUND_ERROR")
  message: string;        // Mensaje amigable
  detail?: string;        // Detalles técnicos
}
```

### Recuperabilidad de Errores

**Errores NO recuperables** (mostrar mensaje, sin botón reintentar):
- COTEJO_ALREADY_COMPLETED
- COTEJO_NOT_FOUND
- ENROLLMENT_NOT_FOUND
- COURSE_NOT_FOUND
- BIMESTER_NOT_FOUND

**Errores recuperables** (mostrar botón reintentar):
- INVALID_SCORE_RANGE
- INCOMPLETE_COTEJO
- SCORE_EXCEEDS_MAXIMUM
- NETWORK_ERROR

### Logging

Todos los errores se registran automáticamente en la consola:

```
[Cotejos] useUpdateActitudinal(123): {
  errorCode: "INVALID_SCORE_RANGE",
  detail: "Score must be between 0 and 20",
  timestamp: "2025-12-11T21:45:00.000Z"
}
```

### Mejores Prácticas

1. **En servicios**: Lanzar errores extraídos con `throw extractCotejosError(error)`
2. **En hooks**: Capturar y transformar errores a `ApiError` antes de guardarlos en estado
3. **En componentes**: Mostrar `CotejosErrorAlert` para errores críticos, `Toast` para notificaciones
4. **No exponer errores técnicos**: El usuario ve mensajes amigables automáticamente

