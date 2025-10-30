# API Documentation - Academic Weeks Helpers

## 📋 Tabla de Contenidos

1. [Endpoints Principales](#endpoints-principales)
2. [Endpoints Helpers](#endpoints-helpers)
3. [Modelos de Datos](#modelos-de-datos)
4. [Reglas de Negocio](#reglas-de-negocio)
5. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🎯 Endpoints Principales

### 1. Listar Semanas Académicas

```http
GET /api/academic-weeks
```

**Permisos:** `academic-week:read`

**Query Parameters:**

| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `page` | number | ❌ | `1` | Número de página |
| `limit` | number | ❌ | `20` | Registros por página (max: 100) |
| `bimesterId` | number | ❌ | - | Filtrar por bimestre |
| `weekType` | string | ❌ | - | Tipo: `REGULAR`, `EVALUATION`, `REVIEW` |
| `number` | number | ❌ | - | Número de semana (1-20) |
| `year` | number | ❌ | - | Año (ej: 2025) |
| `month` | number | ❌ | - | Mes (1-12) |
| `sortBy` | string | ❌ | `number` | Campo para ordenar |
| `sortOrder` | string | ❌ | `asc` | Orden: `asc`, `desc` |
| `includeBimester` | boolean | ❌ | `false` | Incluir info del bimestre |

**Respuesta 200:**

```json
{
  "data": [
    {
      "id": 1,
      "bimesterId": 1,
      "number": 1,
      "startDate": "2025-01-15T00:00:00.000Z",
      "endDate": "2025-01-19T23:59:59.000Z",
      "objectives": "Introducción al tema principal",
      "weekType": "REGULAR"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "totalPages": 1
  }
}
```

---

### 2. Obtener Semana por ID

```http
GET /api/academic-weeks/:id
```

**Permisos:** `academic-week:read-one`

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID de la semana académica |

**Respuesta 200:**

```json
{
  "id": 1,
  "bimesterId": 1,
  "number": 1,
  "startDate": "2025-01-15T00:00:00.000Z",
  "endDate": "2025-01-19T23:59:59.000Z",
  "objectives": "Introducción al tema principal",
  "weekType": "REGULAR",
  "bimester": {
    "id": 1,
    "name": "Primer Bimestre",
    "number": 1,
    "cycle": {
      "id": 1,
      "name": "Ciclo Escolar 2025",
      "isArchived": false
    }
  },
  "_count": {
    "ericaEvaluations": 150,
    "ericaTopics": 12
  }
}
```

**Errores:**

- `400` - ID inválido
- `404` - Semana no encontrada

---

### 3. Obtener Semanas por Bimestre

```http
GET /api/bimesters/:bimesterId/academic-weeks
```

**Permisos:** `academic-week:read`

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `bimesterId` | number | ID del bimestre |

**Respuesta 200:**

```json
{
  "data": [
    {
      "id": 1,
      "bimesterId": 1,
      "number": 1,
      "startDate": "2025-01-15T00:00:00.000Z",
      "endDate": "2025-01-19T23:59:59.000Z",
      "objectives": "Introducción",
      "weekType": "REGULAR"
    },
    {
      "id": 2,
      "bimesterId": 1,
      "number": 2,
      "startDate": "2025-01-22T00:00:00.000Z",
      "endDate": "2025-01-26T23:59:59.000Z",
      "objectives": "Desarrollo",
      "weekType": "REGULAR"
    }
  ]
}
```

---

### 4. Estadísticas por Bimestre

```http
GET /api/bimesters/:bimesterId/academic-weeks/stats
```

**Permisos:** `academic-week:read`

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `bimesterId` | number | ID del bimestre |

**Respuesta 200:**

```json
{
  "bimesterId": 1,
  "bimesterName": "Primer Bimestre",
  "stats": {
    "total": 8,
    "regular": 6,
    "evaluation": 1,
    "review": 1
  }
}
```

---

### 5. Crear Semana Académica

```http
POST /api/bimesters/:bimesterId/academic-weeks
```

**Permisos:** `academic-week:create`

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `bimesterId` | number | ID del bimestre |

**Request Body:**

```json
{
  "number": 1,
  "startDate": "2025-01-15T00:00:00-06:00",
  "endDate": "2025-01-19T23:59:59-06:00",
  "objectives": "Introducción al tema principal",
  "weekType": "REGULAR"
}
```

**Body Schema:**

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `number` | number | ✅ | Entero positivo (1-20) |
| `startDate` | string (ISO) | ✅ | Fecha válida |
| `endDate` | string (ISO) | ✅ | Fecha válida, posterior a startDate |
| `objectives` | string | ❌ | Texto descriptivo |
| `weekType` | string | ❌ | `REGULAR`, `EVALUATION`, `REVIEW` (default: `REGULAR`) |

**Validaciones Automáticas:**

- ✅ Fechas dentro del rango del bimestre
- ✅ Número único en el bimestre
- ✅ Sin sobreposición con otras semanas
- ✅ Duración de 5-7 días
- ✅ Ciclo NO archivado

**Respuesta 201:**

```json
{
  "id": 1,
  "bimesterId": 1,
  "number": 1,
  "startDate": "2025-01-15T00:00:00.000Z",
  "endDate": "2025-01-19T23:59:59.000Z",
  "objectives": "Introducción al tema principal",
  "weekType": "REGULAR"
}
```

**Errores:**

- `400` - Validación fallida (fechas fuera de rango, duración inválida, ciclo cerrado)
- `404` - Bimestre no encontrado
- `409` - Número duplicado o fechas sobrepuestas

---

### 6. Actualizar Semana Académica

```http
PATCH /api/academic-weeks/:id
```

**Permisos:** `academic-week:update`

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID de la semana |

**Request Body (Parcial):**

```json
{
  "objectives": "Objetivos actualizados",
  "weekType": "EVALUATION"
}
```

**Campos Actualizables:**

| Campo | Tipo | Validación |
|-------|------|------------|
| `number` | number | Único en bimestre |
| `startDate` | string (ISO) | Dentro del bimestre |
| `endDate` | string (ISO) | Dentro del bimestre |
| `objectives` | string | Texto |
| `weekType` | string | `REGULAR`, `EVALUATION`, `REVIEW` |

**Respuesta 200:**

```json
{
  "id": 1,
  "bimesterId": 1,
  "number": 1,
  "startDate": "2025-01-15T00:00:00.000Z",
  "endDate": "2025-01-19T23:59:59.000Z",
  "objectives": "Objetivos actualizados",
  "weekType": "EVALUATION"
}
```

**Errores:**

- `400` - Ciclo cerrado, fechas inválidas
- `404` - Semana no encontrada
- `409` - Conflicto de datos

---

### 7. Eliminar Semana Académica

```http
DELETE /api/academic-weeks/:id
```

**Permisos:** `academic-week:delete`

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ID de la semana |

**Restricciones:**

- ❌ No se puede eliminar si tiene evaluaciones ERICA
- ❌ No se puede eliminar si tiene temas asociados
- ❌ No se puede eliminar si el ciclo está cerrado

**Respuesta 200:**

```json
{
  "message": "Semana académica 1 eliminada exitosamente"
}
```

**Errores:**

- `400` - Ciclo cerrado o tiene datos relacionados
- `404` - Semana no encontrada

---

## 🔧 Endpoints Helpers

### 1. Obtener Ciclos para Formularios

```http
GET /api/academic-weeks/helpers/cycles
```

**Permisos:** `academic-week:read`

**Query Parameters:**

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `includeArchived` | boolean | `false` | Si `true`, incluye ciclos archivados |

**Uso:**

```javascript
// Solo ciclos activos (para crear semanas)
GET /api/academic-weeks/helpers/cycles

// Todos los ciclos (para reportes)
GET /api/academic-weeks/helpers/cycles?includeArchived=true
```

**Respuesta 200:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Ciclo Escolar 2025",
      "startDate": "2025-01-15T00:00:00.000Z",
      "endDate": "2025-12-15T23:59:59.000Z",
      "isArchived": false,
      "_count": {
        "bimesters": 4
      }
    },
    {
      "id": 2,
      "name": "Ciclo Escolar 2024",
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-12-15T23:59:59.000Z",
      "isArchived": true,
      "_count": {
        "bimesters": 4
      }
    }
  ],
  "meta": {
    "total": 2,
    "open": 1,
    "archived": 1
  }
}
```

**Campos de Response:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `data` | array | Lista de ciclos |
| `data[].id` | number | ID del ciclo |
| `data[].name` | string | Nombre del ciclo |
| `data[].startDate` | string | Fecha de inicio |
| `data[].endDate` | string | Fecha de fin |
| `data[].isArchived` | boolean | Si está archivado (🔒 no editable) |
| `data[]._count.bimesters` | number | Cantidad de bimestres |
| `meta.total` | number | Total de ciclos |
| `meta.open` | number | Ciclos NO archivados |
| `meta.archived` | number | Ciclos archivados |

---

### 2. Obtener Bimestres para Formularios

```http
GET /api/academic-weeks/helpers/bimesters
```

**Permisos:** `academic-week:read`

**Query Parameters:**

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `cycleId` | number | - | Filtrar por ciclo específico |
| `includeArchived` | boolean | `false` | Si `true`, incluye bimestres de ciclos archivados |

**Uso:**

```javascript
// Todos los bimestres editables
GET /api/academic-weeks/helpers/bimesters

// Bimestres de un ciclo específico
GET /api/academic-weeks/helpers/bimesters?cycleId=1

// Bimestres históricos
GET /api/academic-weeks/helpers/bimesters?includeArchived=true

// Bimestres de un ciclo (incluyendo archivados)
GET /api/academic-weeks/helpers/bimesters?cycleId=2&includeArchived=true
```

**Respuesta 200:**

```json
{
  "data": [
    {
      "id": 1,
      "cycleId": 1,
      "name": "Primer Bimestre",
      "number": 1,
      "startDate": "2025-01-15T00:00:00.000Z",
      "endDate": "2025-03-15T23:59:59.000Z",
      "cycle": {
        "id": 1,
        "name": "Ciclo Escolar 2025",
        "isArchived": false
      },
      "_count": {
        "academicWeeks": 8
      }
    },
    {
      "id": 5,
      "cycleId": 2,
      "name": "Primer Bimestre",
      "number": 1,
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-03-15T23:59:59.000Z",
      "cycle": {
        "id": 2,
        "name": "Ciclo Escolar 2024",
        "isArchived": true
      },
      "_count": {
        "academicWeeks": 8
      }
    }
  ],
  "meta": {
    "total": 2,
    "editable": 1,
    "readonly": 1
  }
}
```

**Campos de Response:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `data` | array | Lista de bimestres |
| `data[].id` | number | ID del bimestre |
| `data[].cycleId` | number | ID del ciclo padre |
| `data[].name` | string | Nombre del bimestre |
| `data[].number` | number | Número del bimestre (1-4) |
| `data[].startDate` | string | Fecha de inicio |
| `data[].endDate` | string | Fecha de fin |
| `data[].cycle` | object | Info del ciclo padre |
| `data[].cycle.isArchived` | boolean | ⚠️ Si `true`, NO se puede crear/editar semanas |
| `data[]._count.academicWeeks` | number | Cantidad de semanas |
| `meta.editable` | number | Bimestres en ciclos abiertos |
| `meta.readonly` | number | Bimestres en ciclos archivados |

---

### 3. Obtener Info Completa de Bimestre

```http
GET /api/academic-weeks/helpers/bimesters/:bimesterId/info
```

**Permisos:** `academic-week:read`

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `bimesterId` | number | ID del bimestre |

**Uso:**

```javascript
// Obtener info completa antes de mostrar formulario
GET /api/academic-weeks/helpers/bimesters/1/info
```

**Respuesta 200 (Ciclo Abierto):**

```json
{
  "id": 1,
  "cycleId": 1,
  "name": "Primer Bimestre",
  "number": 1,
  "startDate": "2025-01-15T00:00:00.000Z",
  "endDate": "2025-03-15T23:59:59.000Z",
  "cycle": {
    "id": 1,
    "name": "Ciclo Escolar 2025",
    "startDate": "2025-01-15T00:00:00.000Z",
    "endDate": "2025-12-15T23:59:59.000Z",
    "isArchived": false
  },
  "isEditable": true,
  "warning": null
}
```

**Respuesta 200 (Ciclo Archivado):**

```json
{
  "id": 5,
  "cycleId": 2,
  "name": "Primer Bimestre",
  "number": 1,
  "startDate": "2024-01-15T00:00:00.000Z",
  "endDate": "2024-03-15T23:59:59.000Z",
  "cycle": {
    "id": 2,
    "name": "Ciclo Escolar 2024",
    "startDate": "2024-01-15T00:00:00.000Z",
    "endDate": "2024-12-15T23:59:59.000Z",
    "isArchived": true
  },
  "isEditable": false,
  "warning": "Este bimestre pertenece al ciclo 'Ciclo Escolar 2024' que está archivado. Solo lectura permitida."
}
```

**Campos de Response:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | number | ID del bimestre |
| `cycleId` | number | ID del ciclo |
| `name` | string | Nombre del bimestre |
| `number` | number | Número del bimestre |
| `startDate` | string | Fecha de inicio |
| `endDate` | string | Fecha de fin |
| `cycle` | object | Información completa del ciclo |
| `cycle.isArchived` | boolean | Estado del ciclo |
| `isEditable` | boolean | ⭐ `true` solo si ciclo NO archivado |
| `warning` | string \| null | ⚠️ Mensaje si no es editable |

**Errores:**

- `404` - Bimestre no encontrado

---

### 4. Obtener Rango de Fechas del Bimestre

```http
GET /api/academic-weeks/helpers/bimesters/:bimesterId/date-range
```

**Permisos:** `academic-week:read`

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `bimesterId` | number | ID del bimestre |

**Uso:**

```javascript
// Validación rápida de fechas en el frontend
GET /api/academic-weeks/helpers/bimesters/1/date-range
```

**Respuesta 200:**

```json
{
  "bimesterId": 1,
  "bimesterName": "Primer Bimestre",
  "startDate": "2025-01-15T00:00:00.000Z",
  "endDate": "2025-03-15T23:59:59.000Z",
  "isEditable": true,
  "cycleArchived": false,
  "allowedDuration": {
    "min": 5,
    "max": 7,
    "unit": "days"
  }
}
```

**Respuesta 200 (Ciclo Archivado):**

```json
{
  "bimesterId": 5,
  "bimesterName": "Primer Bimestre",
  "startDate": "2024-01-15T00:00:00.000Z",
  "endDate": "2024-03-15T23:59:59.000Z",
  "isEditable": false,
  "cycleArchived": true,
  "allowedDuration": {
    "min": 5,
    "max": 7,
    "unit": "days"
  },
  "warning": "Ciclo archivado: solo lectura"
}
```

**Campos de Response:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `bimesterId` | number | ID del bimestre |
| `bimesterName` | string | Nombre del bimestre |
| `startDate` | string | ⚠️ Fecha mínima permitida para semanas |
| `endDate` | string | ⚠️ Fecha máxima permitida para semanas |
| `isEditable` | boolean | Si se puede crear/editar semanas |
| `cycleArchived` | boolean | Estado del ciclo |
| `allowedDuration.min` | number | Días mínimos (5) |
| `allowedDuration.max` | number | Días máximos (7) |
| `allowedDuration.unit` | string | Unidad (`days`) |
| `warning` | string | (Opcional) Mensaje si archivado |

**Errores:**

- `404` - Bimestre no encontrado

---

## 📦 Modelos de Datos

### Semana Académica (AcademicWeek)

```typescript
interface AcademicWeek {
  id: number;
  bimesterId: number;
  number: number;              // 1-20
  startDate: string;           // ISO 8601
  endDate: string;             // ISO 8601
  objectives?: string;
  weekType: 'REGULAR' | 'EVALUATION' | 'REVIEW';
}
```

### Semana Académica con Relaciones

```typescript
interface AcademicWeekDetail extends AcademicWeek {
  bimester: {
    id: number;
    name: string;
    number: number;
    cycle: {
      id: number;
      name: string;
      isArchived: boolean;
    };
  };
  _count: {
    ericaEvaluations: number;
    ericaTopics: number;
  };
}
```

### Bimestre (Helper)

```typescript
interface BimesterHelper {
  id: number;
  cycleId: number;
  name: string;
  number: number;              // 1-4
  startDate: string;
  endDate: string;
  cycle: {
    id: number;
    name: string;
    isArchived: boolean;       // ⚠️ Clave para deshabilitar edición
  };
  _count: {
    academicWeeks: number;
  };
}
```

### Ciclo Escolar (Helper)

```typescript
interface CycleHelper {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isArchived: boolean;         // ⚠️ Clave para deshabilitar edición
  _count: {
    bimesters: number;
  };
}
```

---

## ⚖️ Reglas de Negocio

### Validaciones de Fechas

1. **Rango del Bimestre:**
   ```
   week.startDate >= bimester.startDate
   week.endDate <= bimester.endDate
   ```

2. **Duración de la Semana:**
   ```
   5 días ≤ duración ≤ 7 días
   ```

3. **Sin Sobreposición:**
   - Una semana NO puede comenzar o terminar dentro de otra semana
   - Las fechas deben ser mutuamente exclusivas

### Validaciones de Datos

1. **Número Único:**
   - El `number` debe ser único dentro del bimestre
   - Al actualizar, puede mantener su número actual

2. **Ciclo Archivado:**
   - **CREATE**: Bloqueado si `cycle.isArchived === true`
   - **UPDATE**: Bloqueado si `cycle.isArchived === true`
   - **DELETE**: Bloqueado si `cycle.isArchived === true`
   - **READ**: Permitido siempre

3. **Relaciones:**
   - No se puede eliminar si tiene evaluaciones ERICA
   - No se puede eliminar si tiene temas asociados

---

## 💻 Ejemplos de Uso

### Ejemplo 1: Formulario de Creación Completo

```typescript
// 1. Cargar ciclos al montar el componente
async function loadCycles() {
  const response = await fetch('/api/academic-weeks/helpers/cycles');
  const { data: cycles } = await response.json();
  
  // Filtrar solo ciclos no archivados en la UI (opcional, ya viene filtrado)
  const editableCycles = cycles.filter(c => !c.isArchived);
  
  return editableCycles;
}

// 2. Cuando el usuario selecciona un ciclo, cargar bimestres
async function loadBimesters(cycleId: number) {
  const response = await fetch(
    `/api/academic-weeks/helpers/bimesters?cycleId=${cycleId}`
  );
  const { data: bimesters } = await response.json();
  
  return bimesters;
}

// 3. Cuando el usuario selecciona un bimestre, validar y obtener info
async function selectBimester(bimesterId: number) {
  const response = await fetch(
    `/api/academic-weeks/helpers/bimesters/${bimesterId}/info`
  );
  const bimesterInfo = await response.json();
  
  if (!bimesterInfo.isEditable) {
    // Mostrar warning y deshabilitar formulario
    alert(bimesterInfo.warning);
    disableForm();
    return null;
  }
  
  // Obtener rango de fechas para el date picker
  const rangeResponse = await fetch(
    `/api/academic-weeks/helpers/bimesters/${bimesterId}/date-range`
  );
  const dateRange = await rangeResponse.json();
  
  // Configurar date picker con límites
  setupDatePicker({
    minDate: dateRange.startDate,
    maxDate: dateRange.endDate,
  });
  
  return bimesterInfo;
}

// 4. Validar fechas antes de enviar
function validateWeekDates(startDate: Date, endDate: Date, dateRange: any) {
  // Verificar que estén dentro del rango
  if (startDate < new Date(dateRange.startDate) || 
      endDate > new Date(dateRange.endDate)) {
    return {
      valid: false,
      error: 'Las fechas deben estar dentro del bimestre'
    };
  }
  
  // Verificar duración
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  if (days < dateRange.allowedDuration.min || days > dateRange.allowedDuration.max) {
    return {
      valid: false,
      error: `La semana debe durar entre ${dateRange.allowedDuration.min} y ${dateRange.allowedDuration.max} días`
    };
  }
  
  return { valid: true };
}

// 5. Crear la semana académica
async function createWeek(bimesterId: number, weekData: any) {
  const response = await fetch(
    `/api/bimesters/${bimesterId}/academic-weeks`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(weekData)
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
}

// Flujo completo
async function handleCreateWeek() {
  try {
    // 1. Cargar ciclos
    const cycles = await loadCycles();
    setCycles(cycles);
    
    // 2. Usuario selecciona ciclo
    const selectedCycleId = await waitForUserSelection();
    const bimesters = await loadBimesters(selectedCycleId);
    setBimesters(bimesters);
    
    // 3. Usuario selecciona bimestre
    const selectedBimesterId = await waitForUserSelection();
    const bimesterInfo = await selectBimester(selectedBimesterId);
    
    if (!bimesterInfo) return; // No editable
    
    // 4. Usuario completa formulario
    const formData = await waitForFormSubmit();
    
    // 5. Validar
    const validation = validateWeekDates(
      formData.startDate,
      formData.endDate,
      bimesterInfo
    );
    
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    
    // 6. Crear
    const newWeek = await createWeek(selectedBimesterId, formData);
    
    alert('Semana académica creada exitosamente');
    navigateTo(`/academic-weeks/${newWeek.id}`);
    
  } catch (error) {
    console.error('Error al crear semana:', error);
    alert(error.message);
  }
}
```

---

### Ejemplo 2: Componente React (TypeScript)

```tsx
import React, { useState, useEffect } from 'react';

interface CycleHelper {
  id: number;
  name: string;
  isArchived: boolean;
  _count: { bimesters: number };
}

interface BimesterHelper {
  id: number;
  name: string;
  cycle: {
    id: number;
    name: string;
    isArchived: boolean;
  };
  _count: { academicWeeks: number };
}

const AcademicWeekForm: React.FC = () => {
  const [cycles, setCycles] = useState<CycleHelper[]>([]);
  const [bimesters, setBimesters] = useState<BimesterHelper[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [selectedBimesterId, setSelectedBimesterId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<any>(null);
  const [isEditable, setIsEditable] = useState(true);
  const [warning, setWarning] = useState<string | null>(null);

  // Cargar ciclos al montar
  useEffect(() => {
    fetch('/api/academic-weeks/helpers/cycles')
      .then(res => res.json())
      .then(data => setCycles(data.data));
  }, []);

  // Cargar bimestres cuando cambia el ciclo
  useEffect(() => {
    if (!selectedCycleId) return;
    
    fetch(`/api/academic-weeks/helpers/bimesters?cycleId=${selectedCycleId}`)
      .then(res => res.json())
      .then(data => setBimesters(data.data));
  }, [selectedCycleId]);

  // Validar bimestre seleccionado
  useEffect(() => {
    if (!selectedBimesterId) return;
    
    Promise.all([
      fetch(`/api/academic-weeks/helpers/bimesters/${selectedBimesterId}/info`).then(r => r.json()),
      fetch(`/api/academic-weeks/helpers/bimesters/${selectedBimesterId}/date-range`).then(r => r.json())
    ]).then(([info, range]) => {
      setIsEditable(info.isEditable);
      setWarning(info.warning);
      setDateRange(range);
    });
  }, [selectedBimesterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBimesterId) {
      alert('Selecciona un bimestre');
      return;
    }
    
    if (!isEditable) {
      alert(warning);
      return;
    }
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    const weekData = {
      number: parseInt(formData.get('number') as string),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      objectives: formData.get('objectives'),
      weekType: formData.get('weekType') || 'REGULAR'
    };
    
    try {
      const response = await fetch(
        `/api/bimesters/${selectedBimesterId}/academic-weeks`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(weekData)
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      const newWeek = await response.json();
      alert('Semana creada exitosamente');
      
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Crear Semana Académica</h2>
      
      {/* Selector de Ciclo */}
      <div>
        <label>Ciclo Escolar:</label>
        <select 
          value={selectedCycleId || ''} 
          onChange={(e) => setSelectedCycleId(Number(e.target.value))}
          required
        >
          <option value="">Selecciona un ciclo</option>
          {cycles.map(cycle => (
            <option key={cycle.id} value={cycle.id}>
              {cycle.name} 
              {cycle.isArchived && ' (Archivado)'}
              {' '}({cycle._count.bimesters} bimestres)
            </option>
          ))}
        </select>
      </div>
      
      {/* Selector de Bimestre */}
      <div>
        <label>Bimestre:</label>
        <select 
          value={selectedBimesterId || ''} 
          onChange={(e) => setSelectedBimesterId(Number(e.target.value))}
          disabled={!selectedCycleId}
          required
        >
          <option value="">Selecciona un bimestre</option>
          {bimesters.map(bimester => (
            <option 
              key={bimester.id} 
              value={bimester.id}
              disabled={bimester.cycle.isArchived}
            >
              {bimester.name}
              {bimester.cycle.isArchived && ' 🔒 (No editable)'}
              {' '}({bimester._count.academicWeeks} semanas)
            </option>
          ))}
        </select>
      </div>
      
      {/* Advertencia si no es editable */}
      {warning && (
        <div style={{ backgroundColor: '#fff3cd', padding: '10px', borderRadius: '5px' }}>
          ⚠️ {warning}
        </div>
      )}
      
      {/* Campos del formulario */}
      <div>
        <label>Número de Semana:</label>
        <input 
          type="number" 
          name="number" 
          min="1" 
          max="20" 
          required 
          disabled={!isEditable}
        />
      </div>
      
      <div>
        <label>Fecha de Inicio:</label>
        <input 
          type="date" 
          name="startDate" 
          min={dateRange?.startDate?.split('T')[0]}
          max={dateRange?.endDate?.split('T')[0]}
          required 
          disabled={!isEditable}
        />
      </div>
      
      <div>
        <label>Fecha de Fin:</label>
        <input 
          type="date" 
          name="endDate" 
          min={dateRange?.startDate?.split('T')[0]}
          max={dateRange?.endDate?.split('T')[0]}
          required 
          disabled={!isEditable}
        />
      </div>
      
      <div>
        <label>Tipo de Semana:</label>
        <select name="weekType" disabled={!isEditable}>
          <option value="REGULAR">Regular</option>
          <option value="EVALUATION">Evaluación</option>
          <option value="REVIEW">Repaso</option>
        </select>
      </div>
      
      <div>
        <label>Objetivos:</label>
        <textarea 
          name="objectives" 
          rows={4}
          disabled={!isEditable}
        />
      </div>
      
      <button type="submit" disabled={!isEditable}>
        Crear Semana Académica
      </button>
    </form>
  );
};

export default AcademicWeekForm;
```

---

### Ejemplo 3: Vista de Reportes (con Archivados)

```typescript
async function loadHistoricalData() {
  // Cargar todos los ciclos (incluyendo archivados)
  const cyclesResponse = await fetch(
    '/api/academic-weeks/helpers/cycles?includeArchived=true'
  );
  const { data: allCycles, meta } = await cyclesResponse.json();
  
  console.log(`Total: ${meta.total}, Abiertos: ${meta.open}, Archivados: ${meta.archived}`);
  
  // Agrupar por estado
  const openCycles = allCycles.filter(c => !c.isArchived);
  const archivedCycles = allCycles.filter(c => c.isArchived);
  
  return { openCycles, archivedCycles };
}

async function generateReport(cycleId: number) {
  // Obtener bimestres del ciclo (incluyendo archivados)
  const bimestersResponse = await fetch(
    `/api/academic-weeks/helpers/bimesters?cycleId=${cycleId}&includeArchived=true`
  );
  const { data: bimesters } = await bimestersResponse.json();
  
  // Para cada bimestre, obtener estadísticas
  const report = await Promise.all(
    bimesters.map(async (bimester) => {
      const statsResponse = await fetch(
        `/api/bimesters/${bimester.id}/academic-weeks/stats`
      );
      const stats = await statsResponse.json();
      
      return {
        bimester: bimester.name,
        isArchived: bimester.cycle.isArchived,
        ...stats
      };
    })
  );
  
  return report;
}
```

---

## 🔐 Autenticación y Permisos

Todos los endpoints requieren:

1. **Token de Autenticación:**
   ```http
   Authorization: Bearer <token>
   ```

2. **Permisos Específicos:**
   - `academic-week:read` - Lectura de semanas y helpers
   - `academic-week:read-one` - Detalle de una semana
   - `academic-week:create` - Crear semanas
   - `academic-week:update` - Actualizar semanas
   - `academic-week:delete` - Eliminar semanas

**Nota:** Los endpoints helpers **NO requieren** permisos de `cycle` o `bimester`, solo de `academic-week`.

---

## ❌ Manejo de Errores

### Códigos de Estado HTTP

| Código | Significado | Cuándo Ocurre |
|--------|-------------|---------------|
| `200` | OK | Operación exitosa |
| `201` | Created | Recurso creado exitosamente |
| `400` | Bad Request | Validación fallida, datos inválidos |
| `401` | Unauthorized | Token inválido o expirado |
| `403` | Forbidden | Sin permisos suficientes |
| `404` | Not Found | Recurso no encontrado |
| `409` | Conflict | Conflicto de datos (duplicados, sobreposición) |
| `500` | Internal Server Error | Error del servidor |

### Estructura de Error

```json
{
  "success": false,
  "message": "Mensaje principal del error",
  "details": [
    "Detalle 1 del error",
    "Detalle 2 del error"
  ]
}
```

### Ejemplos de Errores Comunes

**Ciclo Archivado:**
```json
{
  "success": false,
  "message": "No se pueden crear semanas académicas en un ciclo cerrado",
  "details": [
    "El ciclo 'Ciclo Escolar 2024' está cerrado",
    "Los ciclos cerrados no permiten modificaciones"
  ]
}
```

**Fechas Fuera de Rango:**
```json
{
  "success": false,
  "message": "Las fechas de la semana están fuera del rango del bimestre",
  "details": [
    "Rango del bimestre: 15/1/2025 - 15/3/2025",
    "Rango de la semana: 10/1/2025 - 14/1/2025",
    "La semana debe estar completamente dentro del periodo del bimestre"
  ]
}
```

**Sobreposición de Fechas:**
```json
{
  "success": false,
  "message": "Las fechas de la semana se sobreponen con otras semanas existentes",
  "details": [
    "Semanas que se sobreponen: Semana 2 (22/1/2025 - 26/1/2025)",
    "Las fechas de las semanas no pueden sobreponerse",
    "Ajuste las fechas de inicio o fin de la nueva semana"
  ]
}
```

---

## 📝 Notas Finales

### Mejores Prácticas

1. **Siempre validar `isEditable`** antes de mostrar formularios de creación/edición
2. **Mostrar `warning`** cuando un ciclo/bimestre está archivado
3. **Usar `includeArchived=false`** por defecto en formularios
4. **Usar `includeArchived=true`** en reportes históricos
5. **Configurar date pickers** con los límites de `startDate`/`endDate` del bimestre
6. **Validar duración** (5-7 días) antes de enviar al backend

### Performance

- Los endpoints helpers están optimizados para carga rápida
- Use caché en el frontend para ciclos y bimestres (cambian poco)
- Revalide caché solo cuando se creen/actualicen ciclos o bimestres

### Compatibilidad

- Fechas en formato ISO 8601 (UTC)
- Compatible con todos los navegadores modernos
- TypeScript types disponibles (ver sección Modelos de Datos)

---

**Versión:** 1.0.0  
**Última actualización:** Octubre 30, 2025
