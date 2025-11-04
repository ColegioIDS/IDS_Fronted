# Especificación de Endpoints para Course Assignments

## Flujo de Usuario

```
1. Usuario entra a la página
2. Sistema muestra selector de CICLO ESCOLAR
3. Usuario selecciona un ciclo
4. Sistema carga GRADOS de ese ciclo
5. Usuario selecciona un GRADO
6. Sistema muestra SECCIONES de ese grado
7. Usuario selecciona una SECCIÓN
8. Sistema carga CURSOS del grado + MAESTROS disponibles
9. Usuario asigna maestros a cada curso
10. Sistema guarda las asignaciones
```

---

## 📋 Endpoints Necesarios

### 1️⃣ GET `/api/course-assignments/form-data`

**Descripción:** Obtener datos iniciales para el formulario (ciclos escolares disponibles)

**Response:**
```json
{
  "success": true,
  "data": {
    "cycles": [
      {
        "id": 1,
        "name": "2024-2025",
        "startDate": "2024-03-01T00:00:00.000Z",
        "endDate": "2025-12-31T23:59:59.000Z",
        "isActive": true
      },
      {
        "id": 2,
        "name": "2023-2024",
        "startDate": "2023-03-01T00:00:00.000Z",
        "endDate": "2024-12-31T23:59:59.000Z",
        "isActive": false
      }
    ]
  },
  "message": "Datos obtenidos exitosamente"
}
```

**Notas:**
- Debe traer **TODOS los ciclos escolares**, no solo el activo
- El frontend permitirá seleccionar cualquier ciclo
- Por defecto, el frontend pre-seleccionará el ciclo con `isActive: true`

---

### 2️⃣ GET `/api/course-assignments/cycle/:cycleId/grades`

**Descripción:** Obtener grados con sus secciones para un ciclo específico

**Params:**
- `cycleId` (number): ID del ciclo escolar seleccionado

**Response:**
```json
{
  "success": true,
  "data": {
    "cycle": {
      "id": 1,
      "name": "2024-2025",
      "startDate": "2024-03-01T00:00:00.000Z",
      "endDate": "2025-12-31T23:59:59.000Z"
    },
    "grades": [
      {
        "id": 1,
        "name": "Primero",
        "level": "Primaria",
        "order": 1,
        "sections": [
          {
            "id": 10,
            "name": "A",
            "capacity": 30,
            "gradeId": 1,
            "teacherId": 5,
            "teacher": {
              "id": 5,
              "givenNames": "María",
              "lastNames": "González",
              "fullName": "María González",
              "email": "maria@school.com"
            }
          },
          {
            "id": 11,
            "name": "B",
            "capacity": 28,
            "gradeId": 1,
            "teacherId": 6,
            "teacher": {
              "id": 6,
              "givenNames": "Carlos",
              "lastNames": "Pérez",
              "fullName": "Carlos Pérez",
              "email": "carlos@school.com"
            }
          }
        ]
      },
      {
        "id": 2,
        "name": "Segundo",
        "level": "Primaria",
        "order": 2,
        "sections": [
          {
            "id": 20,
            "name": "A",
            "capacity": 25,
            "gradeId": 2,
            "teacherId": 7,
            "teacher": {
              "id": 7,
              "givenNames": "Ana",
              "lastNames": "López",
              "fullName": "Ana López",
              "email": "ana@school.com"
            }
          }
        ]
      }
    ]
  },
  "message": "Grados obtenidos exitosamente"
}
```

**Notas:**
- **IMPORTANTE:** Los grados deben estar relacionados con el ciclo a través de `GradeCycle`
- Cada sección ya tiene su maestro titular asignado (`teacherId`, `teacher`)
- Las secciones sin maestro titular deben tener `teacherId: null` y `teacher: null`

---

### 3️⃣ GET `/api/course-assignments/section/:sectionId/data`

**Descripción:** Obtener datos completos para asignar cursos a una sección específica

**Params:**
- `sectionId` (number): ID de la sección seleccionada

**Response:**
```json
{
  "success": true,
  "data": {
    "section": {
      "id": 10,
      "name": "A",
      "capacity": 30,
      "gradeId": 1,
      "grade": {
        "id": 1,
        "name": "Primero",
        "level": "Primaria"
      },
      "teacherId": 5,
      "teacher": {
        "id": 5,
        "givenNames": "María",
        "lastNames": "González",
        "fullName": "María González",
        "email": "maria@school.com"
      }
    },
    "availableCourses": [
      {
        "id": 1,
        "code": "MAT-01",
        "name": "Matemáticas",
        "area": "Ciencias Exactas",
        "isActive": true
      },
      {
        "id": 2,
        "code": "LEN-01",
        "name": "Lenguaje",
        "area": "Comunicación",
        "isActive": true
      },
      {
        "id": 3,
        "code": "COM-01",
        "name": "Computación",
        "area": "Tecnología",
        "isActive": true
      }
    ],
    "availableTeachers": [
      {
        "id": 5,
        "givenNames": "María",
        "lastNames": "González",
        "fullName": "María González",
        "email": "maria@school.com",
        "isActive": true
      },
      {
        "id": 8,
        "givenNames": "Pedro",
        "lastNames": "Ramírez",
        "fullName": "Pedro Ramírez",
        "email": "pedro@school.com",
        "isActive": true
      },
      {
        "id": 6,
        "givenNames": "Carlos",
        "lastNames": "Pérez",
        "fullName": "Carlos Pérez",
        "email": "carlos@school.com",
        "isActive": true
      }
    ],
    "assignments": [
      {
        "id": 100,
        "courseId": 1,
        "teacherId": 5,
        "assignmentType": "titular",
        "isActive": true,
        "assignedAt": "2024-11-04T10:30:00.000Z",
        "notes": null,
        "course": {
          "id": 1,
          "code": "MAT-01",
          "name": "Matemáticas",
          "area": "Ciencias Exactas",
          "color": "#3B82F6"
        },
        "teacher": {
          "id": 5,
          "givenNames": "María",
          "lastNames": "González",
          "fullName": "María González",
          "email": "maria@school.com"
        },
        "_count": {
          "schedules": 0,
          "history": 5
        }
      },
      {
        "id": 101,
        "courseId": 3,
        "teacherId": 8,
        "assignmentType": "apoyo",
        "isActive": true,
        "assignedAt": "2024-11-04T09:15:00.000Z",
        "notes": "Profesor especialista",
        "course": {
          "id": 3,
          "code": "COM-01",
          "name": "Computación",
          "area": "Tecnología",
          "color": "#8B5CF6"
        },
        "teacher": {
          "id": 8,
          "givenNames": "Pedro",
          "lastNames": "Ramírez",
          "fullName": "Pedro Ramírez",
          "email": "pedro@school.com"
        },
        "_count": {
          "schedules": 10,
          "history": 2
        }
      }
    ],
    "totalAssignments": 2
  },
  "message": "Datos de sección obtenidos exitosamente"
}
```
**Notas:**
- **`section`**: Datos completos de la sección con su grado y maestro titular
- **`availableCourses`**: Lista de cursos activos disponibles para asignar a esta sección (basados en el grado)
- **`availableTeachers`**: Lista de profesores activos disponibles para asignar cursos
  - Incluye el maestro titular de la sección
  - Incluye maestros especialistas (que no tienen sección titular)
  - Puede incluir otros maestros titulares de otras secciones si el sistema lo permite
- **`assignments`**: Asignaciones EXISTENTES para esta sección con información detallada
  - Cada asignación incluye datos del curso y profesor asignados
  - `_count.schedules` indica cuántos horarios tiene esta asignación (útil para saber si es difícil modificar)
  - `_count.history` indica cuántos registros históricos hay
  - Si un curso de `availableCourses` NO está en `assignments`, el frontend lo asignará por defecto al maestro titular
- **`totalAssignments`**: Número total de asignaciones activas para esta sección

---

### 4️⃣ PATCH `/api/course-assignments/bulk`

**Descripción:** Guardar/actualizar asignaciones masivamente para una sección

**Body:**
```json
{
  "sectionId": 10,
  "assignments": [
    {
      "courseId": 1,
      "teacherId": 5
    },
    {
      "courseId": 2,
      "teacherId": 5
    },
    {
      "courseId": 3,
      "teacherId": 8
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "created": 1,
    "updated": 2,
    "deleted": 0,
    "assignments": [
      {
        "id": 100,
        "sectionId": 10,
        "courseId": 1,
        "teacherId": 5,
        "assignmentType": "titular",
        "isActive": true,
        "assignedAt": "2024-11-04T10:30:00.000Z"
      },
      {
        "id": 101,
        "sectionId": 10,
        "courseId": 2,
        "teacherId": 5,
        "assignmentType": "titular",
        "isActive": true,
        "assignedAt": "2024-11-04T10:30:00.000Z"
      },
      {
        "id": 102,
        "sectionId": 10,
        "courseId": 3,
        "teacherId": 8,
        "assignmentType": "apoyo",
        "isActive": true,
        "assignedAt": "2024-11-04T10:30:00.000Z"
      }
    ]
  },
  "message": "Asignaciones actualizadas exitosamente"
}
```

**Lógica del Backend:**
```typescript
Para cada assignment en el body:
  1. Verificar si ya existe (sectionId + courseId)
  2. Si existe:
     - Actualizar teacherId
     - Determinar assignmentType:
       * Si teacherId == section.teacherId → "titular"
       * Si no → "apoyo" (o el tipo que se especifique)
  3. Si NO existe:
     - Crear nuevo registro
     - Determinar assignmentType igual que arriba
  
  4. Si hay asignaciones en DB que NO están en el body:
     - ELIMINARLAS (o marcar isActive: false)
```

---

## 🔄 Tipos de Asignación (`assignmentType`)

```typescript
type AssignmentType = 
  | 'titular'    // El maestro titular de la sección imparte el curso
  | 'apoyo'      // Maestro de apoyo/auxiliar
  | 'temporal'   // Asignación temporal (suplente temporal)
  | 'suplente';  // Maestro suplente
```

**Regla:**
- Si `courseAssignment.teacherId === section.teacherId` → `assignmentType = 'titular'`
- Si no, el backend decide el tipo (puede ser 'apoyo', 'temporal', 'suplente')

---

## 📊 Relaciones de Base de Datos

```
SchoolCycle (Ciclo Escolar)
    ↓
GradeCycle (Relación Grado-Ciclo)
    ↓
Grade (Grado)
    ↓
Section (Sección) → teacherId (Maestro Titular)
    ↓
CourseAssignment
    ├─ courseId → Course (del CourseGrade)
    ├─ teacherId → Teacher
    └─ assignmentType
```

---

## ✅ Checklist de Validaciones Backend

### Endpoint 1: `/api/course-assignments/form-data`
- [ ] Retornar TODOS los ciclos (activos e inactivos)
- [ ] Ordenar por fecha de inicio DESC (más reciente primero)

### Endpoint 2: `/api/course-assignments/cycle/:cycleId/grades`
- [ ] Validar que el ciclo existe
- [ ] Traer SOLO grados que tienen GradeCycle para ese ciclo
- [ ] Incluir secciones de cada grado
- [ ] Incluir maestro titular de cada sección (si existe)

### Endpoint 3: `/api/course-assignments/section/:sectionId/data`
- [ ] Validar que la sección existe
- [ ] Traer cursos del GRADO (CourseGrade)
- [ ] Traer TODOS los maestros activos, categorizados:
  - [ ] Maestro titular de esta sección (`isTitular: true`)
  - [ ] Maestros especialistas sin sección (`sections: []`)
  - [ ] Otros maestros titulares de otras secciones
- [ ] Traer asignaciones existentes para esta sección

### Endpoint 4: `/api/course-assignments/bulk`
- [ ] Validar que la sección existe
- [ ] Para cada curso en body:
  - [ ] Verificar si existe asignación previa
  - [ ] Si existe, actualizar teacherId
  - [ ] Si no existe, crear nueva
  - [ ] Calcular assignmentType automáticamente
- [ ] Eliminar/desactivar asignaciones que ya no están en el body
- [ ] Retornar resumen (created, updated, deleted)

---

## 🎯 Ejemplo de Flujo Completo

### 1. Usuario carga la página
```http
GET /api/course-assignments/form-data

Response:
{
  "cycles": [
    { "id": 1, "name": "2024-2025", "isActive": true },
    { "id": 2, "name": "2023-2024", "isActive": false }
  ]
}
```

### 2. Usuario selecciona ciclo "2024-2025" (id: 1)
```http
GET /api/course-assignments/cycle/1/grades

Response:
{
  "cycle": { "id": 1, "name": "2024-2025" },
  "grades": [
    {
      "id": 1,
      "name": "Primero",
      "sections": [
        { "id": 10, "name": "A", "teacher": {...} },
        { "id": 11, "name": "B", "teacher": {...} }
      ]
    }
  ]
}
```

### 3. Usuario selecciona "Primero - Sección A" (id: 10)
```http
GET /api/course-assignments/section/10/data

Response:
{
  "section": { "id": 10, "name": "A", "teacher": {...} },
  "courses": [
    { "id": 1, "name": "Matemáticas" },
    { "id": 2, "name": "Lenguaje" },
    { "id": 3, "name": "Computación" }
  ],
  "teachers": [
    { "id": 5, "fullName": "María González", "isTitular": true },
    { "id": 8, "fullName": "Pedro Ramírez", "isTitular": false }
  ],
  "assignments": [
    { "courseId": 1, "teacherId": 5, "assignmentType": "titular" }
  ]
}
```

### 4. Usuario asigna maestros y guarda
```http
PATCH /api/course-assignments/bulk

Body:
{
  "sectionId": 10,
  "assignments": [
    { "courseId": 1, "teacherId": 5 },  // Matemáticas → María (titular)
    { "courseId": 2, "teacherId": 5 },  // Lenguaje → María (titular)
    { "courseId": 3, "teacherId": 8 }   // Computación → Pedro (apoyo)
  ]
}

Response:
{
  "success": true,
  "data": {
    "created": 2,
    "updated": 1,
    "assignments": [...]
  }
}
```

---

## 🚨 Notas Importantes

1. **NO usar servicios de otros módulos** (como `CycleContext` o `useCycles`)
2. Los ciclos deben venir del endpoint de course-assignments
3. El `assignmentType` debe calcularse automáticamente en el backend
4. Los maestros especialistas NO deben tener sección asignada
5. Por defecto, todos los cursos se asignan al maestro titular
6. El usuario puede cambiar manualmente cualquier asignación

---

¿Necesitas alguna aclaración o modificación en algún endpoint?
