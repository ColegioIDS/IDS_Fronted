# 🎯 Instrucciones Backend - Asistencia por Curso

## ✅ Frontend Completado

El **frontend está 100% implementado y compilando sin errores**. 

Ahora necesita que el backend implemente 3 endpoints para que todo funcione.

---

## 📋 Endpoints Requeridos

### 1️⃣ GET: Cursos de una Sección

**Ruta:** `GET /api/attendance/configuration/courses-for-section/:sectionId`

**Parámetros:**
- `sectionId` (URL param) - ID de la sección

**Response:**
```json
[
  {
    "id": 5,
    "courseId": 10,
    "name": "Matemáticas",
    "code": "MATH",
    "color": "#FF5733",
    "teacherId": 3,
    "teacherName": "Lic. García",
    "startTime": "08:00",
    "endTime": "09:00"
  },
  {
    "id": 6,
    "courseId": 11,
    "name": "Español",
    "code": "SPAN",
    "color": "#33FF57",
    "teacherId": 3,
    "teacherName": "Lic. García",
    "startTime": "09:00",
    "endTime": "10:00"
  },
  {
    "id": 7,
    "courseId": 12,
    "name": "Ciencias",
    "code": "SCI",
    "color": "#3357FF",
    "teacherId": 4,
    "teacherName": "Dra. López",
    "startTime": "10:00",
    "endTime": "11:00"
  }
]
```

**Descripción:**
- Retorna lista de cursos (CourseAssignments) para una sección específica
- Incluye información de horarios y maestro asignado
- Si no hay cursos, retorna array vacío
- Frontend lo usa para mostrar el selector de cursos

**Validaciones:**
- ✓ sectionId debe existir
- ✓ Permisos: El usuario debe ser maestro de la sección o admin
- ✓ Retornar solo cursos activos

---

### 2️⃣ POST: Asistencia por Múltiples Cursos

**Ruta:** `POST /api/attendance/bulk-by-courses`

**Request:**
```json
{
  "date": "2025-11-09",
  "courseAssignmentIds": [5, 6, 7],
  "attendances": [
    {
      "enrollmentId": 10,
      "attendanceStatusId": 1,
      "notes": ""
    },
    {
      "enrollmentId": 15,
      "attendanceStatusId": 1,
      "notes": ""
    },
    {
      "enrollmentId": 22,
      "attendanceStatusId": 1,
      "notes": ""
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRecords": 9,
    "courseAssignments": [5, 6, 7],
    "studentCount": 3,
    "created": 9,
    "updated": 0,
    "errors": []
  },
  "message": "Asistencia guardada para 3 cursos × 3 estudiantes (9 registros)"
}
```

**Descripción:**
- Crea registros de asistencia para múltiples estudiantes en múltiples cursos
- Para cada combinación estudiante × curso = 1 registro
- 3 estudiantes × 3 cursos = 9 registros creados
- Usa UPSERT: si ya existe registro para ese día/estudiante/curso, actualiza
- Devuelve estadísticas de lo que se creó/actualizó

**Lógica:**
```pseudo
FOR cada courseAssignmentId en courseAssignmentIds
  FOR cada attendance en attendances
    CREATE_OR_UPDATE StudentAttendance (
      enrollmentId: attendance.enrollmentId,
      date: date,
      courseAssignmentId: courseAssignmentId,
      attendanceStatusId: attendance.attendanceStatusId,
      notes: attendance.notes,
      recordedBy: currentUser.id,
      recordedAt: NOW()
    )
  END FOR
END FOR
```

**Validaciones:**
- ✓ date es válida y no es futura
- ✓ date no es día festivo (opcional, depende de política)
- ✓ Todos los courseAssignmentId existen
- ✓ Todos los enrollmentId existen y están inscritos en esos cursos
- ✓ attendanceStatusId existe
- ✓ Usuario tiene permisos para registrar asistencia en estos cursos
- ✓ Máximo 500 registros por operación (5000 / 10 cursos promedio)

**Errores posibles:**
- `400` - Datos inválidos (date, courseAssignmentIds, etc.)
- `403` - Permiso denegado
- `404` - courseAssignmentId o enrollmentId no existe
- `409` - Conflicto (ej: estudiante no está inscrito en el curso)
- `500` - Error del servidor

---

### 3️⃣ PUT: Actualizar Bulk Apply Status

**Ruta:** `PUT /api/attendance/bulk-apply-status` (o mantener POST)

**Request Actual (Debe seguir funcionando):**
```json
{
  "enrollmentIds": [10, 15, 22],
  "date": "2025-11-09",
  "attendanceStatusId": 1,
  "notes": "Evento escolar"
}
```

**Request Nuevo (Agregar soporte):**
```json
{
  "enrollmentIds": [10, 15, 22],
  "date": "2025-11-09",
  "attendanceStatusId": 1,
  "courseAssignmentIds": [5, 6, 7],
  "notes": "Evento escolar"
}
```

**Response (igual a actual):**
```json
{
  "success": true,
  "data": {
    "created": 9,
    "updated": 0,
    "skipped": 0,
    "errors": []
  },
  "message": "Asistencia actualizada"
}
```

**Descripción:**
- Actualizar endpoint existente para soportar `courseAssignmentIds` opcional
- Si `courseAssignmentIds` está presente: usar lógica de bulk-by-courses
- Si `courseAssignmentIds` está ausente o vacío: usar lógica original (sin courseAssignmentId)

**Lógica:**
```pseudo
IF courseAssignmentIds es null o vacío THEN
  // Comportamiento original: sin courseAssignmentId
  FOR cada enrollmentId en enrollmentIds
    CREATE_OR_UPDATE StudentAttendance (
      enrollmentId: enrollmentId,
      date: date,
      courseAssignmentId: NULL,  // ← NULL
      attendanceStatusId: attendanceStatusId,
      notes: notes,
      recordedBy: currentUser.id,
      recordedAt: NOW()
    )
  END FOR
ELSE
  // Comportamiento nuevo: para cada curso
  FOR cada courseAssignmentId en courseAssignmentIds
    FOR cada enrollmentId en enrollmentIds
      CREATE_OR_UPDATE StudentAttendance (
        enrollmentId: enrollmentId,
        date: date,
        courseAssignmentId: courseAssignmentId,  // ← SET
        attendanceStatusId: attendanceStatusId,
        notes: notes,
        recordedBy: currentUser.id,
        recordedAt: NOW()
      )
    END FOR
  END FOR
END IF
```

**Backward Compatibility:**
- ✅ Solicitudes sin `courseAssignmentIds` funcionan como antes
- ✅ Existing code sigue funcionando sin cambios
- ✅ Bases de datos con registros NULL en `courseAssignmentId` siguen válidas

---

## 🔄 DTOs y Validaciones (Zod)

### BulkAttendanceByCourseDto
```typescript
import { z } from 'zod';

export const BulkAttendanceByCourseDto = z.object({
  date: z.string().date('Fecha inválida').refine(
    (date) => new Date(date) <= new Date(),
    'La fecha no puede ser futura'
  ),
  courseAssignmentIds: z.array(z.number().positive()).min(1, 'Mínimo 1 curso'),
  attendances: z.array(
    z.object({
      enrollmentId: z.number().positive('Enrollment ID debe ser positivo'),
      attendanceStatusId: z.number().positive('Status ID debe ser positivo'),
      notes: z.string().optional(),
    })
  ).min(1, 'Mínimo 1 estudiante'),
});
```

### Validación Adicional
```typescript
// En el handler del endpoint:
// 1. Validar que courseAssignmentIds pertenecen a la misma sección
// 2. Validar que enrollmentId está inscrito en cada courseAssignmentId
// 3. Validar que attendanceStatusId existe y está activo
// 4. Validar permisos del usuario
```

---

## 📊 Queries SQL Útiles

### Obtener CourseAssignments de una Sección
```sql
SELECT 
  ca.id,
  ca.courseId,
  c.name,
  c.code,
  c.color,
  ca.teacherId,
  u.givenNames || ' ' || u.lastNames as teacherName,
  ss.startTime,
  ss.endTime
FROM CourseAssignment ca
JOIN Course c ON ca.courseId = c.id
JOIN User u ON ca.teacherId = u.id
JOIN SectionSchedule ss ON ss.courseAssignmentId = ca.id
WHERE ca.sectionId = ?
  AND ca.isActive = true
  AND c.isActive = true
ORDER BY ss.startTime;
```

### Verificar que Estudiante está Inscrito en Curso
```sql
SELECT 1 FROM Enrollment e
WHERE e.id = ?
  AND e.sectionId = (
    SELECT sectionId FROM CourseAssignment WHERE id = ?
  )
  AND e.status IN ('active', 'current')
LIMIT 1;
```

### Crear/Actualizar Asistencia (UPSERT)
```sql
INSERT INTO StudentAttendance (
  enrollmentId, date, courseAssignmentId, 
  attendanceStatusId, notes, recordedBy, recordedAt
)
VALUES (?, ?, ?, ?, ?, ?, ?)
ON CONFLICT (enrollmentId, date, courseAssignmentId) DO UPDATE SET
  attendanceStatusId = EXCLUDED.attendanceStatusId,
  notes = EXCLUDED.notes,
  recordedBy = EXCLUDED.recordedBy,
  recordedAt = EXCLUDED.recordedAt;
```

---

## 🧪 Testing Manual con Postman

### Test 1: Obtener Cursos
```
GET http://localhost:3000/api/attendance/configuration/courses-for-section/1

Response esperado:
Status: 200
Body: Array de cursos con campos id, name, code, color, teacherName, startTime, endTime
```

### Test 2: Crear Asistencia por Cursos
```
POST http://localhost:3000/api/attendance/bulk-by-courses

Headers:
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "date": "2025-11-09",
  "courseAssignmentIds": [5, 6, 7],
  "attendances": [
    { "enrollmentId": 10, "attendanceStatusId": 1 },
    { "enrollmentId": 15, "attendanceStatusId": 1 },
    { "enrollmentId": 22, "attendanceStatusId": 1 }
  ]
}

Response esperado:
Status: 201
Body:
{
  "success": true,
  "data": {
    "totalRecords": 9,
    "courseAssignments": [5, 6, 7],
    "studentCount": 3,
    "created": 9,
    "updated": 0,
    "errors": []
  }
}

Verificación en BD:
SELECT COUNT(*) FROM StudentAttendance 
WHERE date = '2025-11-09' 
  AND enrollmentId IN (10, 15, 22)
  AND courseAssignmentId IN (5, 6, 7);
-- Debe retornar: 9
```

### Test 3: Verificar Registros en BD
```sql
SELECT 
  sa.id,
  e.id as enrollmentId,
  s.givenNames || ' ' || s.lastNames as studentName,
  sa.date,
  ca.courseId,
  c.name as courseName,
  ast.name as statusName,
  sa.recordedAt
FROM StudentAttendance sa
JOIN Enrollment e ON sa.enrollmentId = e.id
JOIN Student s ON e.studentId = s.id
JOIN CourseAssignment ca ON sa.courseAssignmentId = ca.id
JOIN Course c ON ca.courseId = c.id
JOIN AttendanceStatus ast ON sa.attendanceStatusId = ast.id
WHERE sa.date = '2025-11-09'
ORDER BY e.id, ca.courseId;

-- Resultado esperado:
-- 9 registros (3 estudiantes × 3 cursos)
-- Cada combinación estudiante-curso = 1 registro
```

---

## ⚠️ Consideraciones Importantes

### Permisos y Seguridad
- ✓ Validar que usuario es maestro de la sección
- ✓ O que usuario es administrador
- ✓ Registrar quién hizo el cambio (`recordedBy`)
- ✓ Registrar cuándo se hizo (`recordedAt`)

### Performance
- ✓ Soportar hasta 500 registros por operación
- ✓ Usar transacciones para atomicidad
- ✓ Indexar: `(enrollmentId, date, courseAssignmentId)`
- ✓ Cachear lista de cursos por 5 minutos

### Error Handling
- ✓ Retornar errores específicos (400, 403, 404, 409)
- ✓ Incluir mensajes descriptivos
- ✓ Logging de errores
- ✓ No exponer detalles internos de BD

### Backward Compatibility
- ✓ Endpoint `bulk-apply-status` sigue funcionando como antes
- ✓ Nuevos campos en request son opcionales
- ✓ Nuevos registros con `courseAssignmentId` conviven con registros antiguos NULL

---

## 🚀 Orden Recomendado de Implementación

1. **Día 1:** GET courses-for-section (simple query)
2. **Día 2:** POST bulk-by-courses (con validaciones)
3. **Día 3:** Actualizar PUT bulk-apply-status (backward compatible)
4. **Día 4:** Testing completo y refinamientos

---

## ✅ Checklist de Implementación

- [ ] GET /api/attendance/configuration/courses-for-section/:sectionId
  - [ ] Query a BD funciona
  - [ ] Retorna datos correctos
  - [ ] Validaciones de permisos
  - [ ] Testing en Postman
  
- [ ] POST /api/attendance/bulk-by-courses
  - [ ] Validación de entrada con Zod
  - [ ] Lógica UPSERT funciona
  - [ ] Crea 9 registros para 3×3
  - [ ] Retorna respuesta correcta
  - [ ] Testing en Postman
  - [ ] Verificación en BD
  
- [ ] Actualizar POST /api/attendance/bulk-apply-status
  - [ ] Soporta courseAssignmentIds opcionales
  - [ ] Sin courseAssignmentIds sigue funcionando como antes
  - [ ] Con courseAssignmentIds usa lógica nueva
  - [ ] Validaciones correctas
  - [ ] Testing en Postman
  - [ ] Testing backward compatibility

- [ ] Testing completo
  - [ ] Frontend conecta correctamente
  - [ ] Cursos se cargan
  - [ ] Selección múltiple funciona
  - [ ] Registros se crean en BD
  - [ ] Información se muestra en UI

---

## 📞 Soporte

Si tienes preguntas sobre:
- **Frontend:** Ver `FRONTEND_IMPLEMENTATION_COMPLETE.md`
- **Arquitectura:** Ver `INTEGRATION_PLAN_ATTENDANCE_BY_COURSE.md`
- **Schema BD:** Ver `ATTENDANCE_BY_COURSE_ANALYSIS.md`

El frontend está **100% listo** esperando estos endpoints. 🚀

---

**Última actualización:** 2025-11-09  
**Estado frontend:** ✅ COMPLETADO  
**Estado backend:** ⏳ EN PROGRESO
