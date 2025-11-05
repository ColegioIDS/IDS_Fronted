# 📅 BACKEND API SPECIFICATION - Schedules Module

## 🎯 Overview

Este documento especifica todos los endpoints API necesarios para soportar el módulo de horarios (Schedules) del frontend.

**Base URL**: `/api`  
**Autenticación**: Bearer Token (JWT)  
**Formato de Respuesta**: JSON con estructura `ApiResponse<T>`  
**Versionado**: v1 (incluir en URLs si aplica)

---

## 📊 Estructura de Respuestas

### ApiResponse (Estándar)
```typescript
{
  "success": boolean,
  "message": string,
  "data": T,
  "details": Array<any>,
  "errors": Array<{ field: string, message: string }>
}
```

### Ejemplo de Respuesta Exitosa
```json
{
  "success": true,
  "message": "Operación completada exitosamente",
  "data": { /* objeto o array */ }
}
```

### Ejemplo de Respuesta con Error
```json
{
  "success": false,
  "message": "Validación fallida",
  "details": [],
  "errors": [
    { "field": "courseAssignmentId", "message": "Campo requerido" }
  ]
}
```

---

## 🔐 Autenticación

Todos los endpoints requieren:
```
Authorization: Bearer {JWT_TOKEN}
```

---

## 📋 SCHEDULE CONFIG ENDPOINTS

### 1️⃣ GET /api/schedule-configs
**Descripción**: Obtener lista paginada de configuraciones de horario

**Query Parameters**:
```
page?: number (default: 1)
limit?: number (default: 10)
search?: string
sortBy?: 'sectionId' | 'createdAt'
sortOrder?: 'asc' | 'desc'
```

**Respuesta (200 OK)**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "sectionId": 5,
        "workingDays": [1, 2, 3, 4, 5],
        "startTime": "07:00",
        "endTime": "17:00",
        "classDuration": 45,
        "breakSlots": [
          { "start": "10:00", "end": "10:15", "label": "RECREO" },
          { "start": "13:15", "end": "14:00", "label": "ALMUERZO" }
        ],
        "createdAt": "2025-01-15T10:00:00Z",
        "updatedAt": "2025-01-15T10:00:00Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

**Errores Posibles**:
- `401 Unauthorized`: Token inválido o expirado
- `403 Forbidden`: Sin permisos para leer
- `500 Internal Server Error`: Error del servidor

---

### 2️⃣ GET /api/schedule-configs/:id
**Descripción**: Obtener configuración de horario por ID

**Parámetros**:
- `id` (path): ID de la configuración

**Respuesta (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sectionId": 5,
    "workingDays": [1, 2, 3, 4, 5],
    "startTime": "07:00",
    "endTime": "17:00",
    "classDuration": 45,
    "breakSlots": [
      { "start": "10:00", "end": "10:15", "label": "RECREO" }
    ],
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

**Errores Posibles**:
- `404 Not Found`: Configuración no existe
- `401 Unauthorized`: Sin autenticación

---

### 3️⃣ GET /api/schedule-configs/section/:sectionId
**Descripción**: Obtener configuración de horario para una sección

**Parámetros**:
- `sectionId` (path): ID de la sección

**Respuesta (200 OK)**: Mismo formato que endpoint 2️⃣

**Nota**: Retorna `null` si no existe (status 200, data: null)

---

### 4️⃣ POST /api/schedule-configs
**Descripción**: Crear nueva configuración de horario

**Body (JSON)**:
```json
{
  "sectionId": 5,
  "workingDays": [1, 2, 3, 4, 5],
  "startTime": "07:00",
  "endTime": "17:00",
  "classDuration": 45,
  "breakSlots": [
    { "start": "10:00", "end": "10:15", "label": "RECREO" },
    { "start": "13:15", "end": "14:00", "label": "ALMUERZO" }
  ]
}
```

**Validaciones Requeridas**:
- ✅ `sectionId` (requerido, número, must exist)
- ✅ `workingDays` (requerido, array de 1-7, ordenado)
- ✅ `startTime` (requerido, formato "HH:MM")
- ✅ `endTime` (requerido, formato "HH:MM", > startTime)
- ✅ `classDuration` (requerido, número > 0)
- ⚠️ `breakSlots` (opcional, validar tiempos)

**Respuesta (201 Created)**:
```json
{
  "success": true,
  "message": "Configuración creada exitosamente",
  "data": { /* objeto creado */ }
}
```

**Errores Posibles**:
- `400 Bad Request`: Validación fallida
- `409 Conflict`: Ya existe configuración para esta sección
- `403 Forbidden`: Sin permisos para crear

---

### 5️⃣ PATCH /api/schedule-configs/:id
**Descripción**: Actualizar configuración de horario

**Parámetros**:
- `id` (path): ID de la configuración

**Body (JSON)** - Todos los campos opcionales:
```json
{
  "workingDays": [1, 2, 3, 4, 5, 6],
  "startTime": "08:00",
  "endTime": "17:30",
  "classDuration": 50,
  "breakSlots": [...]
}
```

**Respuesta (200 OK)**:
```json
{
  "success": true,
  "message": "Configuración actualizada exitosamente",
  "data": { /* objeto actualizado */ }
}
```

**Errores Posibles**:
- `404 Not Found`: Configuración no existe
- `400 Bad Request`: Validación fallida
- `403 Forbidden`: Sin permisos para actualizar

---

### 6️⃣ DELETE /api/schedule-configs/:id
**Descripción**: Eliminar configuración de horario

**Parámetros**:
- `id` (path): ID de la configuración

**Respuesta (200 OK)**:
```json
{
  "success": true,
  "message": "Configuración eliminada exitosamente"
}
```

**Errores Posibles**:
- `404 Not Found`: Configuración no existe
- `403 Forbidden`: Sin permisos para eliminar
- `409 Conflict`: Hay horarios vinculados (si aplica)

---

## 📅 SCHEDULE ENDPOINTS

### 7️⃣ GET /api/schedules
**Descripción**: Obtener horarios con filtros opcionales

**Query Parameters**:
```
sectionId?: number
courseAssignmentId?: number
teacherId?: number
dayOfWeek?: 1-7
```

**Respuesta (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "courseAssignmentId": 15,
      "teacherId": 3,
      "sectionId": 5,
      "dayOfWeek": 1,
      "startTime": "08:00",
      "endTime": "08:45",
      "classroom": "A-101",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z",
      "courseAssignment": {
        "id": 15,
        "sectionId": 5,
        "courseId": 7,
        "teacherId": 3,
        "assignmentType": "titular",
        "course": {
          "id": 7,
          "name": "Matemáticas",
          "code": "MAT101",
          "color": "#FF5733"
        },
        "teacher": {
          "id": 3,
          "givenNames": "Juan",
          "lastNames": "Pérez",
          "email": "juan.perez@school.edu"
        }
      },
      "section": {
        "id": 5,
        "name": "6A",
        "gradeId": 10
      }
    }
  ]
}
```

---

### 8️⃣ GET /api/schedules/:id
**Descripción**: Obtener horario específico por ID

**Parámetros**:
- `id` (path): ID del horario

**Respuesta (200 OK)**: Mismo formato que 7️⃣ (un objeto)

---

### 9️⃣ GET /api/schedules/section/:sectionId
**Descripción**: Obtener todos los horarios de una sección

**Parámetros**:
- `sectionId` (path): ID de la sección

**Respuesta (200 OK)**: Array de horarios (formato 7️⃣)

---

### 🔟 GET /api/schedules/teacher/:teacherId
**Descripción**: Obtener todos los horarios de un maestro

**Parámetros**:
- `teacherId` (path): ID del maestro

**Respuesta (200 OK)**: Array de horarios (formato 7️⃣)

---

### 1️⃣1️⃣ POST /api/schedules
**Descripción**: Crear nuevo horario

**Body (JSON)**:
```json
{
  "courseAssignmentId": 15,
  "teacherId": 3,
  "dayOfWeek": 1,
  "startTime": "08:00",
  "endTime": "08:45",
  "classroom": "A-101"
}
```

**Validaciones Requeridas**:
- ✅ `courseAssignmentId` (requerido, número, MUST EXIST - PRIMARY KEY)
- ✅ `dayOfWeek` (requerido, 1-7)
- ✅ `startTime` (requerido, formato "HH:MM")
- ✅ `endTime` (requerido, formato "HH:MM", > startTime)
- ⚠️ `teacherId` (opcional, si no se proporciona usar del courseAssignment)
- ⚠️ `classroom` (opcional)

**Lógica de Backend**:
```
1. Validar courseAssignmentId existe
2. Si teacherId no viene, usar del courseAssignment
3. Validar no hay conflicto de horario del maestro
4. Validar no hay conflicto de aula
5. Validar horario dentro de ScheduleConfig de la sección
6. Validar no sea time de recreo/almuerzo
```

**Respuesta (201 Created)**:
```json
{
  "success": true,
  "message": "Horario creado exitosamente",
  "data": { /* objeto creado */ }
}
```

**Errores Posibles**:
- `400 Bad Request`: Validación fallida
- `409 Conflict`: Conflicto de horario/aula
- `404 Not Found`: courseAssignmentId no existe

---

### 1️⃣2️⃣ PATCH /api/schedules/:id
**Descripción**: Actualizar horario existente

**Parámetros**:
- `id` (path): ID del horario

**Body (JSON)** - Campos opcionales:
```json
{
  "dayOfWeek": 2,
  "startTime": "09:00",
  "endTime": "09:45",
  "classroom": "A-102"
}
```

**Respuesta (200 OK)**:
```json
{
  "success": true,
  "message": "Horario actualizado exitosamente",
  "data": { /* objeto actualizado */ }
}
```

---

### 1️⃣3️⃣ DELETE /api/schedules/:id
**Descripción**: Eliminar horario

**Parámetros**:
- `id` (path): ID del horario

**Respuesta (200 OK)**:
```json
{
  "success": true,
  "message": "Horario eliminado exitosamente"
}
```

---

### 1️⃣4️⃣ DELETE /api/schedules/section/:sectionId
**Descripción**: Eliminar todos los horarios de una sección (con opción de preservar algunos)

**Parámetros**:
- `sectionId` (path): ID de la sección

**Body (JSON)**:
```json
{
  "keepIds": [101, 102, 103]  // IDs de horarios a preservar (opcional)
}
```

**Respuesta (200 OK)**:
```json
{
  "success": true,
  "message": "Horarios eliminados exitosamente"
}
```

---

## 🔄 BATCH OPERATIONS

### 1️⃣5️⃣ POST /api/schedules/batch
**Descripción**: Guardar múltiples horarios en una operación atómica

**Body (JSON)**:
```json
{
  "schedules": [
    {
      "courseAssignmentId": 15,
      "dayOfWeek": 1,
      "startTime": "08:00",
      "endTime": "08:45"
    },
    {
      "courseAssignmentId": 15,
      "dayOfWeek": 2,
      "startTime": "09:00",
      "endTime": "09:45"
    }
  ]
}
```

**Lógica de Backend**:
```
1. Validar cada horario individualmente
2. Si hay error en CUALQUIER horario, ROLLBACK TODO (transacción)
3. Ejecutar TODAS las operaciones o NINGUNA
4. Retornar resultado detallado
```

**Respuesta (200 OK)**:
```json
{
  "success": true,
  "data": {
    "created": [
      { "id": 101, "courseAssignmentId": 15, ... },
      { "id": 102, "courseAssignmentId": 16, ... }
    ],
    "updated": [],
    "deleted": [],
    "errors": [],
    "success": true,
    "message": "2 horarios guardados exitosamente"
  }
}
```

**Respuesta con Errores (207 Multi-Status)**:
```json
{
  "success": false,
  "data": {
    "created": [ ... ],
    "updated": [ ... ],
    "deleted": [],
    "errors": [
      {
        "itemId": "temp_1",
        "error": "Conflicto de horario para el maestro 3 el lunes 08:00"
      }
    ],
    "success": false,
    "message": "Operación completada con errores"
  }
}
```

---

## 📊 FORM DATA & UTILITIES

### 1️⃣6️⃣ GET /api/schedules/form-data
**Descripción**: Obtener datos consolidados para el formulario de horarios

**Respuesta (200 OK)**:
```json
{
  "success": true,
  "data": {
    "activeCycle": {
      "id": 1,
      "name": "2025-I",
      "startDate": "2025-01-15",
      "endDate": "2025-05-30",
      "isActive": true
    },
    "sections": [
      {
        "id": 5,
        "name": "6A",
        "capacity": 30,
        "gradeId": 10,
        "teacherId": 2
      }
    ],
    "courses": [
      {
        "id": 7,
        "code": "MAT101",
        "name": "Matemáticas",
        "area": "Ciencias",
        "color": "#FF5733",
        "isCore": true
      }
    ],
    "teachers": [
      {
        "id": 3,
        "givenNames": "Juan",
        "lastNames": "Pérez",
        "email": "juan.perez@school.edu"
      }
    ],
    "courseAssignments": [
      {
        "id": 15,
        "sectionId": 5,
        "courseId": 7,
        "teacherId": 3,
        "assignmentType": "titular",
        "createdAt": "2025-01-15T10:00:00Z",
        "updatedAt": "2025-01-15T10:00:00Z",
        "course": { ... },
        "teacher": { ... }
      }
    ],
    "scheduleConfigs": [
      {
        "id": 1,
        "sectionId": 5,
        "workingDays": [1, 2, 3, 4, 5],
        "startTime": "07:00",
        "endTime": "17:00",
        "classDuration": 45,
        "breakSlots": [ ... ]
      }
    ],
    "existingSchedules": [
      { /* schedule objects */ }
    ]
  }
}
```

---

### 1️⃣7️⃣ GET /api/schedules/teacher-availability
**Descripción**: Obtener disponibilidad/conflictos de maestros

**Respuesta (200 OK)**:
```json
{
  "success": true,
  "data": {
    "3": [
      {
        "dayOfWeek": 1,
        "startTime": "08:00",
        "endTime": "08:45"
      },
      {
        "dayOfWeek": 1,
        "startTime": "09:00",
        "endTime": "09:45"
      }
    ],
    "4": [
      {
        "dayOfWeek": 2,
        "startTime": "10:00",
        "endTime": "11:30"
      }
    ]
  }
}
```

---

## ⚠️ VALIDACIONES CRÍTICAS

### Reglas de Negocio

1. **Primary Key Schedule**: `courseAssignmentId` (siempre requerido)
2. **Maestro Dinámico**: `teacherId` puede cambiar (sustituciones)
3. **Sin Overlaps**: No puede haber dos horarios del mismo maestro en el mismo timeslot
4. **Sin Conflicto Aula**: No puede haber dos horarios en la misma aula en mismo timeslot
5. **ScheduleConfig Obligatorio**: Toda sección debe tener ScheduleConfig antes de crear horarios
6. **Dentro de Horario**: El horario debe estar dentro del rango de ScheduleConfig
7. **No en Break**: No permitir horarios en slots de recreo/almuerzo
8. **Duración Válida**: `endTime` > `startTime`
9. **DayOfWeek en Rango**: 1-7 (1=Lunes, 7=Domingo)
10. **CourseAssignment Existe**: Validar siempre que courseAssignmentId existe

---

## 🔑 Status Codes HTTP

| Código | Significado | Cuándo Usar |
|--------|------------|-----------|
| 200 | OK | GET exitoso, operación completada |
| 201 | Created | Recurso creado exitosamente (POST) |
| 400 | Bad Request | Validación fallida, datos inválidos |
| 401 | Unauthorized | Sin autenticación o token inválido |
| 403 | Forbidden | Sin permisos suficientes |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Conflicto (ej: horario duplicado, aula ocupada) |
| 500 | Internal Server Error | Error del servidor |
| 207 | Multi-Status | Batch operation con errores parciales |

---

## 📝 Ejemplo de Flujo Completo

### Scenario: Crear horarios para una sección

```
1. GET /api/schedules/form-data
   ↓ Obtiene: ciclo actual, secciones, cursos, maestros, courseAssignments
   
2. GET /api/schedule-configs/section/{sectionId}
   ↓ Obtiene configuración de horario para sección
   
3. POST /api/schedules/batch
   ↓ Crea múltiples horarios atómicamente
   
4. GET /api/schedules/section/{sectionId}
   ↓ Verifica horarios creados
```

---

## 📦 Archivos de Referencia Frontend

- **Types**: `src/types/schedules.types.ts`
- **Service**: `src/services/schedules.service.ts`
- **Hook**: `src/hooks/useSchedules.ts`

---

## 🚀 Próximos Pasos Backend

1. ✅ Crear modelo `ScheduleConfig` en Prisma
2. ✅ Crear modelo `Schedule` en Prisma (con courseAssignmentId PK)
3. ✅ Implementar controlador `/api/schedule-configs`
4. ✅ Implementar controlador `/api/schedules`
5. ✅ Implementar validaciones de negocio
6. ✅ Implementar batch operations
7. ✅ Implementar form-data endpoint
8. ✅ Implementar teacher-availability endpoint
9. ⚠️ Agregar tests unitarios
10. ⚠️ Agregar documentación Swagger/OpenAPI

---

## 💡 Notas Importantes

- **Transacciones**: Usar para operaciones batch
- **Timestamps**: Siempre incluir createdAt, updatedAt
- **Soft Delete**: Considerar para auditoría
- **Logging**: Loguear cambios de horarios (para auditoría)
- **Permisos**: Validar permisos por acción (read, create, update, delete)
- **Rate Limiting**: Considerar limitar bulk operations
- **Caching**: Cachear form-data durante sesión

---

**Documento Versión**: 1.0  
**Última Actualización**: 5 de Noviembre 2025
