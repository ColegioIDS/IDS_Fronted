# Cascade Data - Respuestas y Errores Estandarizados

## Formato de Respuesta Exitosa (200 OK)

Todas las respuestas exitosas siguen el siguiente formato:

```json
{
  "success": true,
  "message": "Descripción clara de lo que se obtuvo",
  "data": {
    // Los datos solicitados
  }
}
```

### Ejemplo: Ciclo Activo

**Solicitud:**
```bash
GET /api/cascade-data/active-cycle
```

**Respuesta (200 OK - Éxito):**
```json
{
  "success": true,
  "message": "Ciclo escolar activo obtenido correctamente",
  "data": {
    "id": 1,
    "name": "2025-2026",
    "startDate": "2025-01-13T00:00:00Z",
    "endDate": "2026-01-10T23:59:59Z",
    "isActive": true,
    "isArchived": false,
    "academicYear": 2025
  }
}
```

---

## Formato de Respuesta con Error (200 OK - Sin datos)

Cuando no hay datos pero la solicitud es válida:

```json
{
  "success": false,
  "message": "Mensaje descriptivo del error",
  "data": null
}
```

### Ejemplos de Errores Comunes

#### 1. No hay ciclo escolar activo

**Respuesta:**
```json
{
  "success": false,
  "message": "No hay un ciclo escolar activo en el sistema",
  "data": null
}
```

**Componente Frontend:**
```typescript
// EmptyState component muestra:
// Icon: Calendar
// Título: "Sin ciclo escolar activo"
// Descripción: "No hay un ciclo escolar activo en el sistema. 
//              Contacta al administrador para activar un ciclo."
```

---

#### 2. No hay bimestre activo

**Solicitud:**
```bash
GET /api/cascade-data/active-bimester/1
```

**Respuesta:**
```json
{
  "success": false,
  "message": "No hay bimestre activo para el ciclo 1",
  "data": null
}
```

**Componente Frontend:**
```typescript
// EmptyState component muestra:
// Icon: Clock
// Título: "Sin bimestre activo"
// Descripción: "No hay un bimestre activo para el ciclo escolar actual."
```

---

#### 3. No hay semanas académicas

**Solicitud:**
```bash
GET /api/cascade-data/weeks/5
```

**Respuesta:**
```json
{
  "success": false,
  "message": "Error al obtener las semanas académicas",
  "data": null
}
```

**O** (si hay semanas pero vacías):

```json
{
  "success": true,
  "message": "Semanas académicas obtenidas correctamente",
  "data": []
}
```

**Componente Frontend:**
```typescript
// EmptyState component muestra:
// Icon: Calendar
// Título: "Sin semanas académicas"
// Descripción: "No hay semanas académicas registradas para este bimestre."
```

---

#### 4. No hay grados disponibles

**Solicitud:**
```bash
GET /api/cascade-data/grades/1
```

**Respuesta:**
```json
{
  "success": false,
  "message": "Error al obtener los grados",
  "data": null
}
```

**Componente Frontend:**
```typescript
// EmptyState component muestra:
// Icon: BookOpen
// Título: "Sin grados disponibles"
// Descripción: "No hay grados registrados para este ciclo escolar."
```

---

#### 5. No hay cursos disponibles

**Solicitud:**
```bash
GET /api/cascade-data/courses/1
```

**Respuesta:**
```json
{
  "success": false,
  "message": "Error al obtener los cursos",
  "data": null
}
```

**Componente Frontend:**
```typescript
// EmptyState component muestra:
// Icon: Users
// Título: "Sin cursos disponibles"
// Descripción: "No hay cursos registrados para este grado."
```

---

## Formato de Respuesta del Endpoint Principal

### Éxito

```json
{
  "success": true,
  "message": "Datos en cascada obtenidos correctamente",
  "data": {
    "cycle": { /* SchoolCycle */ },
    "activeBimester": { /* Bimester */ },
    "weeks": [ /* AcademicWeek[] */ ],
    "grades": [ /* Grade[] */ ],
    "gradesCourses": {
      "1": [ /* Course[] */ ],
      "2": [ /* Course[] */ ]
    }
  }
}
```

### Sin ciclo activo

```json
{
  "success": false,
  "message": "No hay un ciclo escolar activo en el sistema",
  "data": null
}
```

### Error general

```json
{
  "success": false,
  "message": "Error al obtener los datos en cascada",
  "data": null
}
```

---

## Mapeo de Errores en Frontend

El servicio `cascade-data.service.ts` estandariza todos los errores con tipos específicos:

```typescript
type CascadeErrorType =
  | 'NO_ACTIVE_CYCLE'      // Sin ciclo activo
  | 'NO_ACTIVE_BIMESTER'   // Sin bimestre activo
  | 'NO_WEEKS'             // Sin semanas
  | 'NO_GRADES'            // Sin grados
  | 'NO_COURSES'           // Sin cursos
  | 'INVALID_ID'           // ID inválido
  | 'API_ERROR'            // Error del servidor
  | 'NETWORK_ERROR'        // Error de red
  | 'UNKNOWN_ERROR'        // Error desconocido
```

### Uso en Componentes

```typescript
import { useCascadeData } from '@/hooks/useCascadeData';
import { EmptyState } from '@/components/shared/EmptyState';

export function MiComponente() {
  const { data, loading, error, errorType } = useCascadeData();

  if (loading) return <div>Cargando...</div>;

  if (error) {
    if (errorType === 'NO_ACTIVE_CYCLE') {
      return <EmptyState type="no-active-cycle" />;
    }
    if (errorType === 'NO_ACTIVE_BIMESTER') {
      return <EmptyState type="no-active-bimester" />;
    }
    return <EmptyState type="error" message={error} />;
  }

  return <div>{/* contenido con data */}</div>;
}
```

---

## Componentes Compartidos para Errores

### EmptyState Component

Ubicación: `src/components/shared/EmptyState.tsx`

**Tipos soportados:**
- `no-active-cycle` - No hay ciclo escolar activo
- `no-active-bimester` - No hay bimestre activo
- `no-weeks` - No hay semanas académicas
- `no-grades` - No hay grados disponibles
- `no-courses` - No hay cursos disponibles
- `no-data` - Sin datos genéricos
- `error` - Error genérico

**Uso:**
```tsx
import { EmptyState } from '@/components/shared/EmptyState';

<EmptyState 
  type="no-active-cycle"
  action={{
    label: "Contactar Administrador",
    onClick: () => { /* ... */ }
  }}
/>
```

---

## Validaciones en Servicio

Todas las validaciones en `cascade-data.service.ts` siguen este patrón:

```typescript
async getActiveCycle(): Promise<SchoolCycle> {
  const response = await api.get('/api/cascade-data/active-cycle');

  // ✅ VALIDACIÓN: success debe ser true
  if (!response.data?.success || !response.data?.data) {
    throw new Error(
      response.data?.message || 
      'No hay un ciclo escolar activo en el sistema'
    );
  }

  return response.data.data;
}
```

---

## Constantes de Errores

Ubicación: `src/constants/cascade-data-errors.ts`

Proporciona:
- `CASCADE_ERROR_CODES` - Códigos de error estandarizados
- `CASCADE_ERROR_MESSAGES` - Mensajes por código
- `detectCascadeErrorType(message)` - Detecta tipo de error del mensaje
- `getCascadeErrorMessage(errorType)` - Obtiene mensaje por tipo

**Uso:**
```typescript
import { 
  CASCADE_ERROR_CODES,
  detectCascadeErrorType,
  getCascadeErrorMessage 
} from '@/constants/cascade-data-errors';

const errorType = detectCascadeErrorType(errorMessage);
const message = getCascadeErrorMessage(errorType);
```

---

## Flujo de Manejo de Errores

```
1. Backend retorna respuesta con success: false
   ↓
2. Servicio (cascade-data.service.ts) lanza Error con mensaje
   ↓
3. Hook (useCascadeData.ts) captura error
   ↓
4. Hook detecta tipo de error (errorType)
   ↓
5. Componente recibe { error, errorType }
   ↓
6. Componente muestra EmptyState apropiado
```

---

## HTTP Status Codes

| Código | Significado | Cuando |
|--------|-------------|--------|
| 200 | OK | Solicitud exitosa (success: true o false) |
| 400 | Bad Request | Parámetros inválidos |
| 401 | Unauthorized | Token inválido/expirado |
| 404 | Not Found | Endpoint no existe (raro en cascade-data) |
| 500 | Server Error | Error interno del servidor |

**Nota:** `cascade-data` típicamente retorna 200 con `success: false` en lugar de 404.

---

## Testing

### Test de Ciclo sin Activo

```typescript
test('muestra EmptyState cuando no hay ciclo activo', async () => {
  mockApi.get('/api/cascade-data/all').rejectOnce(
    new Error('No hay un ciclo escolar activo en el sistema')
  );

  render(<EricaTopicForm />);

  await waitFor(() => {
    expect(screen.getByText('Sin ciclo escolar activo')).toBeInTheDocument();
  });
});
```

### Test de Error Genérico

```typescript
test('muestra EmptyState con error genérico', async () => {
  mockApi.get('/api/cascade-data/all').rejectOnce(
    new Error('Error al obtener los datos en cascada')
  );

  render(<EricaTopicsListEnhanced topics={[]} />);

  await waitFor(() => {
    expect(screen.getByText('Error al cargar datos')).toBeInTheDocument();
  });
});
```

---

## Best Practices

✅ **DO:**
- Usar tipos específicos de error (`errorType`) para decidir qué mostrar
- Mostrar `EmptyState` en lugar de alertas rojas para errores previstos
- Implementar retry en caso de `NETWORK_ERROR`
- Cachear datos cuando sea posible para mejorar UX

❌ **DON'T:**
- Mostrar mensajes técnicos al usuario
- Usar solo `success: false` sin más contexto
- Ignorar la estructura de cascada (siempre validar en orden)
- Hacer múltiples requests cuando `/cascade-data/all` existe
