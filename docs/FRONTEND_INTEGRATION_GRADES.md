# 📋 API Grades - Especificación para Frontend

## 🔗 Base URL
```
/api/grades
```

---

## 📊 Tipos de Datos

### Grade
```typescript
interface Grade {
  id: number;
  name: string;
  level: string;
  order: number;
  isActive: boolean;
}
```

### PaginatedGradesResponse
```typescript
interface PaginatedGradesResponse {
  data: Grade[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

### GradeStats
```typescript
interface GradeStats {
  grade: {
    id: number;
    name: string;
    level: string;
  };
  stats: {
    sectionsCount: number;
    cyclesCount: number;
  };
}
```

---

## 🔌 Endpoints

### 1. Crear Grado
```http
POST /api/grades
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Primer Grado",
  "level": "Primaria",
  "order": 1,
  "isActive": true
}
```

**Validaciones:**
- `name`: requerido, string, 2-100 caracteres, único en el sistema
- `level`: requerido, string, 2-50 caracteres (ej: Primaria, Secundaria)
- `order`: requerido, número entero positivo
- `isActive`: opcional, booleano (default: true)

**Response 201 (Success):**
```json
{
  "id": 1,
  "name": "Primer Grado",
  "level": "Primaria",
  "order": 1,
  "isActive": true
}
```

**Response 409 (Conflicto - Nombre Duplicado):**
```json
{
  "statusCode": 409,
  "message": "Ya existe un grado con el nombre \"Primer Grado\"",
  "error": "Conflict"
}
```

---

### 2. Listar Grados (con Filtros y Paginación)
```http
GET /api/grades?page=1&limit=10&level=Primaria&isActive=true&search=Primer&sortBy=order&sortOrder=asc
Authorization: Bearer {token}
```

**Query Parameters:**
| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `page` | number | No | 1 | Número de página |
| `limit` | number | No | 10 | Elementos por página (max: 100) |
| `level` | string | No | - | Filtrar por nivel educativo |
| `isActive` | boolean | No | - | Filtrar por estado (true/false) |
| `search` | string | No | - | Búsqueda por nombre o nivel |
| `sortBy` | string | No | order | Campo para ordenar (name, level, order, createdAt) |
| `sortOrder` | string | No | asc | Orden (asc/desc) |

**Ejemplos de Uso:**
```http
# Todos los grados activos de Primaria ordenados
GET /api/grades?level=Primaria&isActive=true&sortBy=order&sortOrder=asc

# Búsqueda con paginación
GET /api/grades?search=Primer&page=1&limit=5

# Solo grados inactivos
GET /api/grades?isActive=false
```

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Primer Grado",
      "level": "Primaria",
      "order": 1,
      "isActive": true
    },
    {
      "id": 2,
      "name": "Segundo Grado",
      "level": "Primaria",
      "order": 2,
      "isActive": true
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

---

### 3. Obtener un Grado Específico
```http
GET /api/grades/:id
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "id": 1,
  "name": "Primer Grado",
  "level": "Primaria",
  "order": 1,
  "isActive": true
}
```

**Response 404:**
```json
{
  "statusCode": 404,
  "message": "Grado con ID 99 no encontrado",
  "error": "Not Found"
}
```

---

### 4. Actualizar Grado
```http
PATCH /api/grades/:id
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body (todos los campos son opcionales):**
```json
{
  "name": "1er Grado",
  "level": "Primaria",
  "order": 2,
  "isActive": false
}
```

**Response 200:**
```json
{
  "id": 1,
  "name": "1er Grado",
  "level": "Primaria",
  "order": 2,
  "isActive": false
}
```

**Response 409 (Nombre duplicado):**
```json
{
  "statusCode": 409,
  "message": "Ya existe un grado con el nombre \"1er Grado\"",
  "error": "Conflict"
}
```

---

### 5. Eliminar Grado (Permanente)
```http
DELETE /api/grades/:id
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "message": "Grado eliminado exitosamente"
}
```

**Response 400 (Con dependencias):**
```json
{
  "statusCode": 400,
  "message": "No se puede eliminar el grado porque tiene 5 secciones y 3 ciclos asociados. Considere desactivarlo en su lugar.",
  "error": "Bad Request"
}
```

---

### 6. Desactivar Grado (Soft Delete)
```http
PATCH /api/grades/:id/deactivate
Authorization: Bearer {token}
```

**Descripción:**  
Desactiva un grado sin eliminarlo del sistema. Útil cuando el grado tiene secciones o ciclos asociados pero ya no debe usarse.

**Response 200:**
```json
{
  "id": 1,
  "name": "Primer Grado",
  "level": "Primaria",
  "order": 1,
  "isActive": false
}
```

**Response 400 (Ya desactivado):**
```json
{
  "statusCode": 400,
  "message": "El grado ya está desactivado",
  "error": "Bad Request"
}
```

---

### 7. Obtener Estadísticas de un Grado
```http
GET /api/grades/:id/stats
Authorization: Bearer {token}
```

**Descripción:**  
Retorna información sobre cuántas secciones y ciclos están asociados al grado.

**Response 200:**
```json
{
  "grade": {
    "id": 1,
    "name": "Primer Grado",
    "level": "Primaria"
  },
  "stats": {
    "sectionsCount": 5,
    "cyclesCount": 3
  }
}
```

---

### 8. Obtener Grados Activos por Nivel
```http
GET /api/grades/level/:level/active
Authorization: Bearer {token}
```

**Descripción:**  
Retorna solo los grados activos de un nivel educativo específico, ordenados por el campo `order`.

**Ejemplo:**
```http
GET /api/grades/level/Primaria/active
```

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Primer Grado",
    "level": "Primaria",
    "order": 1,
    "isActive": true
  },
  {
    "id": 2,
    "name": "Segundo Grado",
    "level": "Primaria",
    "order": 2,
    "isActive": true
  },
  {
    "id": 3,
    "name": "Tercer Grado",
    "level": "Primaria",
    "order": 3,
    "isActive": true
  }
]
```

**Response 200 (Sin grados activos):**
```json
[]
```

---

## 🔐 Permisos Requeridos

| Endpoint | Permiso |
|----------|---------|
| POST /grades | `grade:create` |
| GET /grades | `grade:read` |
| GET /grades/:id | `grade:read-one` |
| PATCH /grades/:id | `grade:update` |
| DELETE /grades/:id | `grade:delete` |
| PATCH /grades/:id/deactivate | `grade:update` |
| GET /grades/:id/stats | `grade:read-one` |
| GET /grades/level/:level/active | `grade:read` |

---

## ⚠️ Reglas de Negocio

### 1. Nombres Únicos
- ❌ No pueden existir dos grados con el mismo nombre
- ✅ Validación en creación y actualización
- **Manejo Frontend**: Mostrar error específico al usuario

### 2. Eliminación Segura
- ❌ No se puede eliminar un grado con secciones o ciclos asociados
- ✅ Se debe usar desactivación (soft delete) en su lugar
- **Recomendación Frontend**: 
  - Verificar estadísticas antes de intentar eliminar
  - Si tiene dependencias, sugerir desactivación

### 3. Ordenamiento
- ✅ El campo `order` determina el orden de visualización
- ✅ Los números pueden repetirse pero no es recomendable
- **Recomendación Frontend**: Validar orden secuencial (1, 2, 3...)

### 4. Niveles Educativos
- ✅ Los niveles son strings libres
- ✅ Niveles comunes: `Primaria`, `Secundaria`, `Preparatoria`
- **Recomendación Frontend**: Usar un select con opciones predefinidas

### 5. Estado Activo/Inactivo
- ✅ Grados inactivos no deben mostrarse en selects de creación
- ✅ Grados inactivos pueden visualizarse en listados con filtro
- **Recomendación Frontend**: Filtrar por `isActive=true` por defecto

---

## 🎯 Flujo Recomendado Frontend

### Crear Grado
```
1. Usuario selecciona nivel educativo (dropdown)
2. Usuario ingresa nombre del grado
3. Sistema sugiere próximo número de orden automáticamente
4. Usuario confirma si el grado estará activo
5. POST /api/grades
6. Manejar errores de nombre duplicado
7. Mostrar éxito y actualizar lista
```

### Editar Grado
```
1. Cargar grado: GET /api/grades/:id
2. Mostrar formulario con datos actuales
3. Usuario modifica campos
4. PATCH /api/grades/:id
5. Manejar errores de validación
6. Mostrar éxito y actualizar lista
```

### Eliminar Grado
```
1. Verificar dependencias: GET /api/grades/:id/stats
2. Si tiene dependencias:
   - Mostrar advertencia con estadísticas
   - Ofrecer opción de desactivar: PATCH /api/grades/:id/deactivate
3. Si no tiene dependencias:
   - Confirmar eliminación permanente
   - DELETE /api/grades/:id
4. Actualizar lista
```

### Listar Grados por Nivel (para Selects)
```
1. Usuario selecciona nivel en otro formulario
2. GET /api/grades/level/{nivel}/active
3. Poblar select con grados activos ordenados
```

---

## 📦 Ejemplo Completo de Integración

### TypeScript/React Example

```typescript
// types.ts
export interface Grade {
  id: number;
  name: string;
  level: string;
  order: number;
  isActive: boolean;
}

export interface CreateGradeDto {
  name: string;
  level: string;
  order: number;
  isActive?: boolean;
}

export interface QueryGradesDto {
  page?: number;
  limit?: number;
  level?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: 'name' | 'level' | 'order' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// api.ts
const API_BASE = '/api/grades';

export const gradesApi = {
  // Listar con filtros
  async list(params: QueryGradesDto) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_BASE}?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Obtener uno
  async getOne(id: number) {
    const response = await fetch(`${API_BASE}/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Crear
  async create(data: CreateGradeDto) {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return response.json();
  },

  // Actualizar
  async update(id: number, data: Partial<CreateGradeDto>) {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return response.json();
  },

  // Eliminar
  async delete(id: number) {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return response.json();
  },

  // Desactivar
  async deactivate(id: number) {
    const response = await fetch(`${API_BASE}/${id}/deactivate`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Estadísticas
  async getStats(id: number) {
    const response = await fetch(`${API_BASE}/${id}/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Grados activos por nivel
  async getActiveByLevel(level: string) {
    const response = await fetch(`${API_BASE}/level/${level}/active`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

// Ejemplo de uso en componente
async function handleCreate(formData: CreateGradeDto) {
  try {
    const newGrade = await gradesApi.create(formData);
    console.log('Grado creado:', newGrade);
    // Actualizar UI
  } catch (error) {
    if (error.message.includes('Ya existe')) {
      showError('El nombre del grado ya está en uso');
    } else {
      showError('Error al crear el grado');
    }
  }
}

// Verificar antes de eliminar
async function handleDelete(id: number) {
  try {
    const stats = await gradesApi.getStats(id);
    
    if (stats.stats.sectionsCount > 0 || stats.stats.cyclesCount > 0) {
      const confirm = await showConfirm(
        `Este grado tiene ${stats.stats.sectionsCount} secciones y ${stats.stats.cyclesCount} ciclos asociados. ` +
        '¿Desea desactivarlo en lugar de eliminarlo?'
      );
      
      if (confirm) {
        await gradesApi.deactivate(id);
        showSuccess('Grado desactivado exitosamente');
      }
    } else {
      const confirm = await showConfirm('¿Está seguro de eliminar este grado?');
      if (confirm) {
        await gradesApi.delete(id);
        showSuccess('Grado eliminado exitosamente');
      }
    }
  } catch (error) {
    showError('Error al procesar la solicitud');
  }
}
```

---

## 🎨 Sugerencias de UI/UX

### Vista de Lista
- ✅ Mostrar tabla con columnas: Nombre, Nivel, Orden, Estado
- ✅ Agregar filtros rápidos por nivel (chips/tabs)
- ✅ Toggle para mostrar/ocultar inactivos
- ✅ Barra de búsqueda en tiempo real
- ✅ Iconos de estado (activo: ✓ verde, inactivo: ✗ gris)
- ✅ Acciones rápidas: Editar, Desactivar/Activar, Ver Stats

### Formulario de Creación/Edición
- ✅ Select para nivel con opciones: Primaria, Secundaria, Preparatoria
- ✅ Input de texto para nombre con validación en tiempo real
- ✅ Number input para orden con sugerencia automática
- ✅ Switch/Toggle para estado activo
- ✅ Mostrar contadores si se está editando (X secciones, Y ciclos)

### Modal de Estadísticas
- ✅ Tarjeta visual con íconos
- ✅ Número grande para secciones y ciclos
- ✅ Lista detallada opcional (expandible)
- ✅ Advertencia visual si tiene dependencias

### Mensajes de Error
```typescript
const errorMessages = {
  409: 'Ya existe un grado con ese nombre',
  400: 'Datos inválidos. Revise el formulario',
  404: 'Grado no encontrado',
  403: 'No tiene permisos para esta acción',
  default: 'Error al procesar la solicitud'
};
```

---

## 🔄 Estados de la Aplicación

### Estado de Carga
```typescript
interface GradesState {
  grades: Grade[];
  loading: boolean;
  error: string | null;
  filters: QueryGradesDto;
  selectedGrade: Grade | null;
}
```

### Acciones Comunes
```typescript
// Cargar grados activos de un nivel
dispatch(loadActiveGradesByLevel('Primaria'));

// Búsqueda con debounce
const debouncedSearch = debounce((search: string) => {
  dispatch(searchGrades({ search, page: 1 }));
}, 500);

// Actualizar estado
dispatch(toggleGradeStatus(gradeId));
```

---

## 📊 Validaciones Frontend (Opcional pero Recomendadas)

```typescript
const validateGrade = (data: CreateGradeDto) => {
  const errors: Record<string, string> = {};
  
  if (!data.name || data.name.length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres';
  }
  
  if (data.name.length > 100) {
    errors.name = 'El nombre no puede exceder 100 caracteres';
  }
  
  if (!data.level || data.level.length < 2) {
    errors.level = 'El nivel es requerido';
  }
  
  if (!data.order || data.order < 1) {
    errors.order = 'El orden debe ser un número positivo';
  }
  
  return errors;
};
```

---

## 🚨 Manejo de Errores

| Status | Error | Acción Frontend |
|--------|-------|-----------------|
| 400 | Bad Request | Mostrar errores de validación en formulario |
| 401 | Unauthorized | Redirigir a login |
| 403 | Forbidden | Mostrar mensaje "Sin permisos" |
| 404 | Not Found | Mostrar "Grado no encontrado" |
| 409 | Conflict | Mostrar "Nombre duplicado, elija otro" |
| 500 | Server Error | Mostrar "Error del servidor, intente más tarde" |

---

**Fecha de creación:** 31 de Octubre de 2025  
**Versión API:** 1.0  
**Estado:** ✅ Documentación completa
