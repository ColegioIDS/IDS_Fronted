# 📋 API Holidays - Especificación para Frontend

## 🔗 Base URL
```
/api/holidays
```

---

## 📊 Tipos de Datos

### Holiday
```typescript
{
  id: number;
  bimesterId: number;
  date: string;              // ISO 8601: "2025-12-25"
  description: string;
  isRecovered: boolean;
  bimester?: {
    id: number;
    name: string;
    number: number;
    startDate: string;       // ISO 8601
    endDate: string;         // ISO 8601
    cycle: {
      id: number;
      name: string;
      isArchived: boolean;
    };
  };
}
```

### Cycle (Helper)
```typescript
{
  id: number;
  name: string;
  startDate: string;         // ISO 8601
  endDate: string;           // ISO 8601
  isActive: boolean;
  isArchived: boolean;
  canEnroll: boolean;
}
```

### Bimester (Helper)
```typescript
{
  id: number;
  name: string;
  number: number;            // 1-4
  startDate: string;         // ISO 8601
  endDate: string;           // ISO 8601
  isActive: boolean;
}
```

### BreakWeek (Helper)
```typescript
{
  id: number;
  number: number;
  startDate: string;         // ISO 8601
  endDate: string;           // ISO 8601
}
```

---

## 🔌 Endpoints

### 1. Crear Día Festivo
```http
POST /api/holidays
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "bimesterId": 1,
  "date": "2025-12-25",
  "description": "Navidad",
  "isRecovered": false
}
```

**Validaciones:**
- `bimesterId`: requerido, número entero positivo
- `date`: requerido, formato ISO 8601 (YYYY-MM-DD)
- `description`: requerido, mínimo 3 caracteres
- `isRecovered`: opcional, booleano (default: false)

**Response 201 (Success):**
```json
{
  "id": 1,
  "bimesterId": 1,
  "date": "2025-12-25T00:00:00.000Z",
  "description": "Navidad",
  "isRecovered": false,
  "bimester": {
    "id": 1,
    "name": "Cuarto Bimestre",
    "number": 4,
    "startDate": "2025-10-15T00:00:00.000Z",
    "endDate": "2025-12-31T23:59:59.999Z",
    "cycle": {
      "id": 1,
      "name": "Ciclo Escolar 2025",
      "isArchived": false
    }
  }
}
```

**Response 400 (Validación Fallida):**
```json
{
  "statusCode": 400,
  "message": "La fecha 2025-12-25 está fuera del rango del bimestre (2025-10-15 - 2025-12-31)",
  "error": "Bad Request"
}
```

**Response 404 (Bimestre No Existe):**
```json
{
  "statusCode": 404,
  "message": "El bimestre con ID 99 no existe",
  "error": "Not Found"
}
```

**Response 409 (Fecha Duplicada):**
```json
{
  "statusCode": 409,
  "message": "Ya existe un día festivo registrado para la fecha 2025-12-25 en este bimestre",
  "error": "Conflict"
}
```

---

### 2. Listar Días Festivos
```http
GET /api/holidays?page=1&limit=10&bimesterId=1&year=2025
Authorization: Bearer {token}
```

**Query Parameters (todos opcionales):**
- `page`: número de página (default: 1)
- `limit`: registros por página (default: 10)
- `bimesterId`: filtrar por bimestre
- `cycleId`: filtrar por ciclo escolar
- `year`: filtrar por año (ej: 2025)
- `month`: filtrar por mes (1-12)
- `isRecovered`: filtrar por recuperables (true/false)
- `startDate`: fecha inicio del rango (ISO 8601)
- `endDate`: fecha fin del rango (ISO 8601)

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "bimesterId": 1,
      "date": "2025-12-25T00:00:00.000Z",
      "description": "Navidad",
      "isRecovered": false,
      "bimester": { /* ... */ }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 3. Obtener Día Festivo por ID
```http
GET /api/holidays/{id}
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": 1,
  "bimesterId": 1,
  "date": "2025-12-25T00:00:00.000Z",
  "description": "Navidad",
  "isRecovered": false,
  "bimester": { /* ... */ }
}
```

**Response 404:**
```json
{
  "statusCode": 404,
  "message": "El día festivo con ID 99 no existe",
  "error": "Not Found"
}
```

---

### 4. Actualizar Día Festivo
```http
PATCH /api/holidays/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body (todos opcionales):**
```json
{
  "bimesterId": 2,
  "date": "2025-12-26",
  "description": "Día después de Navidad",
  "isRecovered": true
}
```

**Response 200:**
```json
{
  "id": 1,
  "bimesterId": 2,
  "date": "2025-12-26T00:00:00.000Z",
  "description": "Día después de Navidad",
  "isRecovered": true,
  "bimester": { /* ... */ }
}
```

---

### 5. Eliminar Día Festivo
```http
DELETE /api/holidays/{id}
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "message": "Día festivo con ID 1 eliminado exitosamente"
}
```

**Response 400 (Ciclo Archivado):**
```json
{
  "statusCode": 400,
  "message": "No se pueden eliminar días festivos de un ciclo archivado: Ciclo 2024",
  "error": "Bad Request"
}
```

---

### 6. Helper: Obtener Ciclos
```http
GET /api/holidays/helpers/cycles
Authorization: Bearer {token}
```

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Ciclo Escolar 2025",
    "startDate": "2025-01-15T00:00:00.000Z",
    "endDate": "2025-11-30T23:59:59.999Z",
    "isActive": true,
    "isArchived": false,
    "canEnroll": true
  }
]
```

---

### 7. Helper: Obtener Bimestres de Ciclo
```http
GET /api/holidays/helpers/cycles/{cycleId}/bimesters
Authorization: Bearer {token}
```

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Primer Bimestre",
    "number": 1,
    "startDate": "2025-01-15T00:00:00.000Z",
    "endDate": "2025-03-15T00:00:00.000Z",
    "isActive": true
  },
  {
    "id": 2,
    "name": "Segundo Bimestre",
    "number": 2,
    "startDate": "2025-03-16T00:00:00.000Z",
    "endDate": "2025-05-31T00:00:00.000Z",
    "isActive": false
  }
]
```

**Response 404:**
```json
{
  "statusCode": 404,
  "message": "No se encontraron bimestres para el ciclo con ID 99",
  "error": "Not Found"
}
```

---

### 8. Helper: Obtener Semanas BREAK
```http
GET /api/holidays/helpers/bimesters/{bimesterId}/break-weeks
Authorization: Bearer {token}
```

**Response 200:**
```json
[
  {
    "id": 5,
    "number": 5,
    "startDate": "2025-02-10T00:00:00.000Z",
    "endDate": "2025-02-14T23:59:59.999Z"
  }
]
```

**Response 200 (Sin semanas BREAK):**
```json
[]
```

---

## ⚠️ Reglas de Negocio

### 1. Ciclos Archivados
- ❌ No se puede crear días festivos en ciclos archivados
- ❌ No se puede modificar días festivos de ciclos archivados
- ❌ No se puede eliminar días festivos de ciclos archivados
- **Validación**: El backend verifica `cycle.isArchived === false`

### 2. Rango de Fechas
- ✅ La fecha debe estar entre `bimester.startDate` y `bimester.endDate`
- ❌ Error 400 si está fuera del rango
- **Validación Frontend**: Comparar fechas antes de enviar

### 3. Semanas BREAK
- ❌ La fecha NO puede caer en una semana de tipo BREAK
- **Validación Frontend**: 
  1. Obtener semanas BREAK con helper
  2. Validar que la fecha no esté en esos rangos
  3. Mostrar advertencia al usuario

### 4. Fechas Duplicadas
- ❌ No puede haber dos días festivos en la misma fecha dentro del mismo bimestre
- **Error 409**: Si existe duplicado

### 5. Validaciones de Entrada
- `description`: mínimo 3 caracteres
- `date`: formato ISO 8601 (YYYY-MM-DD)
- `bimesterId`: debe existir en la base de datos

---

## 🔐 Permisos Requeridos

| Endpoint | Permiso |
|----------|---------|
| POST /holidays | `holiday:create` |
| GET /holidays | `holiday:read` |
| GET /holidays/:id | `holiday:read-one` |
| PATCH /holidays/:id | `holiday:update` |
| DELETE /holidays/:id | `holiday:delete` |
| GET /helpers/* | `holiday:read` |

**Nota**: Los endpoints helper usan el mismo permiso `holiday:read` para evitar requerir permisos adicionales de otros módulos.

---

## 🎯 Flujo Recomendado Frontend

### Crear Día Festivo
```
1. Cargar ciclos: GET /helpers/cycles
2. Usuario selecciona ciclo
3. Cargar bimestres: GET /helpers/cycles/{cycleId}/bimesters
4. Usuario selecciona bimestre
5. Cargar semanas BREAK: GET /helpers/bimesters/{bimesterId}/break-weeks
6. Mostrar advertencia sobre fechas BREAK
7. Usuario ingresa fecha y descripción
8. Validar en frontend:
   - Fecha dentro del rango del bimestre
   - Fecha NO en semana BREAK
9. Si válido: POST /holidays
```

### Validación de Fecha en BREAK (Frontend)
```typescript
function isDateInBreakWeek(date: string, breakWeeks: BreakWeek[]): boolean {
  const selectedDate = new Date(date);
  return breakWeeks.some(week => {
    const start = new Date(week.startDate);
    const end = new Date(week.endDate);
    return selectedDate >= start && selectedDate <= end;
  });
}
```

### Validación de Rango (Frontend)
```typescript
function isDateInBimesterRange(
  date: string,
  bimesterStart: string,
  bimesterEnd: string
): boolean {
  const selectedDate = new Date(date);
  const start = new Date(bimesterStart);
  const end = new Date(bimesterEnd);
  return selectedDate >= start && selectedDate <= end;
}
```

---

## 🚨 Manejo de Errores

### Códigos de Estado
- **200**: Éxito (GET, PATCH, DELETE)
- **201**: Creado (POST)
- **400**: Validación fallida o regla de negocio violada
- **404**: Recurso no encontrado
- **409**: Conflicto (fecha duplicada)
- **401**: No autenticado
- **403**: Sin permisos

### Estructura de Error
```json
{
  "statusCode": 400,
  "message": "Descripción del error",
  "error": "Bad Request"
}
```

---

## 📦 Ejemplo Completo de Integración

```typescript
// 1. Cargar datos iniciales
const cycles = await GET('/holidays/helpers/cycles');

// 2. Seleccionar ciclo y cargar bimestres
const bimesters = await GET(`/holidays/helpers/cycles/${cycleId}/bimesters`);

// 3. Seleccionar bimestre y cargar semanas BREAK
const breakWeeks = await GET(`/holidays/helpers/bimesters/${bimesterId}/break-weeks`);

// 4. Validar fecha antes de crear
if (isDateInBreakWeek(date, breakWeeks)) {
  showError('No se puede crear en semana BREAK');
  return;
}

if (!isDateInBimesterRange(date, bimester.startDate, bimester.endDate)) {
  showError('Fecha fuera del rango del bimestre');
  return;
}

// 5. Crear día festivo
const holiday = await POST('/holidays', {
  bimesterId,
  date: '2025-12-25',
  description: 'Navidad',
  isRecovered: false
});

// 6. Listar con filtros
const result = await GET('/holidays', {
  params: { bimesterId, year: 2025, page: 1, limit: 10 }
});
```

---

**Última actualización:** 31 de Octubre, 2025  
**Versión API:** 1.0.0

