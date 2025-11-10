# ✅ Análisis: Asistencia por Curso y Selección Múltiple

## 📊 Estado Actual del Schema

Tu schema **SÍ TIENE SOPORTE COMPLETO** para:
1. ✅ Asistencia por curso
2. ✅ Selección múltiple de cursos
3. ✅ Auditoría y cambios históricos

---

## 🏗️ Arquitectura de Asistencia por Curso

### Modelos Involucrados

```
StudentAttendance (General/Diaria)
    ↓
    ├─ enrollmentId (Matrícula del estudiante)
    ├─ date (Fecha)
    ├─ courseAssignmentId (OPCIONAL - Curso específico)
    ├─ attendanceStatusId (Estado: P, I, T, etc)
    └─ classAttendances[] (Detalles por clase)
        ↓
        StudentClassAttendance (Específico por Clase)
            ├─ scheduleId (Horario/Clase específica)
            ├─ courseAssignmentId (Curso)
            ├─ status (Estado en esa clase)
            └─ arrivalTime (Hora de llegada)
```

---

## 📋 Comparativa de Dos Enfoques

### Enfoque 1: Asistencia General (Actual)
```prisma
// Una asistencia para todo el día
StudentAttendance {
  enrollmentId: 10
  date: "2025-11-09"
  courseAssignmentId: null  // SIN especificar curso
  attendanceStatusId: 1     // Presente todo el día
}
```

**Cuándo usar:**
- Asistencia general del día
- No diferencias por curso
- Rápido, simple

---

### Enfoque 2: Asistencia por Curso (Recomendado)
```prisma
// Una asistencia POR CADA CURSO del estudiante
StudentAttendance {
  enrollmentId: 10
  date: "2025-11-09"
  courseAssignmentId: 5   // ← Matemáticas
  attendanceStatusId: 1   // Presente en Matemáticas
}

StudentAttendance {
  enrollmentId: 10
  date: "2025-11-09"
  courseAssignmentId: 6   // ← Español
  attendanceStatusId: 2   // Ausente en Español
}

StudentAttendance {
  enrollmentId: 10
  date: "2025-11-09"
  courseAssignmentId: 7   // ← Ciencias
  attendanceStatusId: 4   // Tardanza en Ciencias
}
```

**Cuándo usar:**
- Asistencia detallada por materia
- Estudiantes con cursos diferentes
- Análisis preciso por materia
- **¡ESTO ES LO QUE NECESITAS!**

---

## 🎯 Constraint Único que Lo Permite

En tu schema tienes:
```prisma
@@unique([enrollmentId, date, courseAssignmentId], name: "unique_student_attendance")
```

**¿Qué significa?**
- `enrollmentId` + `date` + `courseAssignmentId` = ÚNICA combinación
- Permite MÚLTIPLES registros por día (uno por curso)
- Impide duplicados de la misma asistencia en el mismo curso

**Ejemplo de lo permitido:**
```
✅ (enrollmentId: 10, date: 2025-11-09, courseAssignmentId: 5)  → Matemáticas
✅ (enrollmentId: 10, date: 2025-11-09, courseAssignmentId: 6)  → Español
✅ (enrollmentId: 10, date: 2025-11-09, courseAssignmentId: 7)  → Ciencias
❌ (enrollmentId: 10, date: 2025-11-09, courseAssignmentId: 5)  → ERROR: Duplicado
```

---

## 🔍 Estructura Detallada

### StudentAttendance
```prisma
model StudentAttendance {
  id                Int
  enrollmentId      Int           // ¿Qué estudiante?
  date              DateTime      // ¿Qué día?
  
  courseAssignmentId Int?         // ✨ CLAVE: ¿Qué curso?
  
  attendanceStatusId Int          // ¿Qué estado? (P, I, T, etc)
  
  notes             String?       // Notas adicionales
  arrivalTime       String?       // Hora de llegada
  minutesLate       Int?          // Minutos de tardanza
  departureTime     String?       // Hora de salida
  
  hasJustification  Boolean       // ¿Tiene justificación?
  justificationId   Int?          // Referencia a justificación
  
  recordedBy        Int           // ¿Quién registró?
  recordedAt        DateTime      // ¿Cuándo se registró?
  
  lastModifiedBy    Int?          // ¿Quién modificó último?
  lastModifiedAt    DateTime      // ¿Cuándo se modificó?
  
  classAttendances  StudentClassAttendance[] // Detalles por clase
}
```

### StudentClassAttendance
```prisma
model StudentClassAttendance {
  id                 Int
  studentAttendanceId Int          // Referencia a asistencia general
  scheduleId         Int           // ¿Qué horario/clase?
  courseAssignmentId Int           // ¿Qué curso?
  
  status             String        // Estado en esa clase
  arrivalTime        String?       // Hora exacta de llegada
  notes              String?       // Notas de esa clase
  
  recordedBy         Int?          // Registrado por
  recordedAt         DateTime      // Cuándo
}
```

---

## 💡 Flujo de Selección Múltiple

### Caso: Tomar asistencia a 3 cursos a la vez

**Pantalla del profesor:**
```
┌─────────────────────────────────────┐
│ Asistencia - 9 de Noviembre, 2025   │
├─────────────────────────────────────┤
│ Sección: 6to Grado A                │
│                                     │
│ ☑ Matemáticas (8:00-9:00)          │
│ ☑ Español (9:00-10:00)             │
│ ☑ Ciencias (10:00-11:00)           │
│                                     │
│ [Seleccionar todo] [Limpiar]       │
│                                     │
│ Estudiantes: (lista aquí)           │
├─────────────────────────────────────┤
│ [Guardar Asistencia]                │
└─────────────────────────────────────┘
```

**Lo que pasa al hacer click en "Guardar Asistencia":**

```javascript
// 1. Usuario selecciona 3 cursos
selectedCourses = [5, 6, 7]  // IDs de CourseAssignment

// 2. Usuario marca asistencia en los estudiantes
studentAttendance = [
  { enrollmentId: 10, status: "P" },
  { enrollmentId: 15, status: "I" },
  { enrollmentId: 22, status: "T" }
]

// 3. Backend crea 9 registros (3 cursos × 3 estudiantes)
StudentAttendance {
  // Para Matemáticas (courseAssignmentId: 5)
  (enrollmentId: 10, date: 2025-11-09, courseAssignmentId: 5, status: P)
  (enrollmentId: 15, date: 2025-11-09, courseAssignmentId: 5, status: I)
  (enrollmentId: 22, date: 2025-11-09, courseAssignmentId: 5, status: T)
  
  // Para Español (courseAssignmentId: 6)
  (enrollmentId: 10, date: 2025-11-09, courseAssignmentId: 6, status: P)
  (enrollmentId: 15, date: 2025-11-09, courseAssignmentId: 6, status: I)
  (enrollmentId: 22, date: 2025-11-09, courseAssignmentId: 6, status: T)
  
  // Para Ciencias (courseAssignmentId: 7)
  (enrollmentId: 10, date: 2025-11-09, courseAssignmentId: 7, status: P)
  (enrollmentId: 15, date: 2025-11-09, courseAssignmentId: 7, status: I)
  (enrollmentId: 22, date: 2025-11-09, courseAssignmentId: 7, status: T)
}
```

---

## 🔌 Endpoints Recomendados

### 1. Obtener cursos disponibles (para un profesor)
```
GET /api/attendance/courses-for-section/:sectionId
Response: 
[
  { id: 5, courseId: 10, name: "Matemáticas", teacher: "Lic. García" },
  { id: 6, courseId: 11, name: "Español", teacher: "Lic. García" },
  { id: 7, courseId: 12, name: "Ciencias", teacher: "Lic. García" }
]
```

### 2. Obtener estudiantes de una sección
```
GET /api/attendance/students-for-section/:sectionId
Response:
[
  { enrollmentId: 10, studentName: "María García", codeSIRE: "2025001" },
  { enrollmentId: 15, studentName: "Juan López", codeSIRE: "2025002" },
  { enrollmentId: 22, studentName: "Ana Martínez", codeSIRE: "2025003" }
]
```

### 3. Guardar asistencia por cursos (BULK)
```
POST /api/attendance/bulk-by-courses
Body:
{
  "date": "2025-11-09",
  "courseAssignmentIds": [5, 6, 7],  // Múltiples cursos
  "attendances": [
    {
      "enrollmentId": 10,
      "attendanceStatusId": 1,
      "notes": "Presente"
    },
    {
      "enrollmentId": 15,
      "attendanceStatusId": 2,
      "notes": "Ausente"
    },
    {
      "enrollmentId": 22,
      "attendanceStatusId": 4,
      "notes": "Tardanza"
    }
  ]
}

Response:
{
  "success": true,
  "message": "Asistencia guardada para 3 cursos × 3 estudiantes (9 registros)",
  "data": {
    "createdCount": 9,
    "courseAssignments": [5, 6, 7],
    "studentCount": 3
  }
}
```

---

## 📊 Queries útiles

### Asistencia de un estudiante en un día
```sql
SELECT * FROM student_attendances 
WHERE enrollmentId = 10 
AND date = '2025-11-09'
-- Retorna: 3 registros (1 por curso)
```

### Asistencia de un estudiante por curso
```sql
SELECT * FROM student_attendances 
WHERE enrollmentId = 10 
AND courseAssignmentId = 5  -- Solo Matemáticas
ORDER BY date DESC
```

### Tasa de asistencia por curso
```sql
SELECT 
  sa.courseAssignmentId,
  c.name as course,
  COUNT(*) as total_days,
  SUM(CASE WHEN ast.code = 'P' THEN 1 ELSE 0 END) as present_days,
  ROUND(100.0 * SUM(CASE WHEN ast.code = 'P' THEN 1 ELSE 0 END) / COUNT(*), 2) as attendance_percent
FROM student_attendances sa
JOIN course_assignments ca ON sa.courseAssignmentId = ca.id
JOIN courses c ON ca.courseId = c.id
JOIN attendance_statuses ast ON sa.attendanceStatusId = ast.id
WHERE sa.enrollmentId = 10
GROUP BY sa.courseAssignmentId, c.name
```

### Reportes por curso (para estadísticas)
```sql
SELECT 
  ca.id,
  c.name as course,
  COUNT(DISTINCT sa.enrollmentId) as students_tracked,
  COUNT(*) as attendance_records,
  ROUND(100.0 * SUM(CASE WHEN ast.code IN ('P') THEN 1 ELSE 0 END) / COUNT(*), 2) as avg_attendance
FROM student_attendances sa
JOIN course_assignments ca ON sa.courseAssignmentId = ca.id
JOIN courses c ON ca.courseId = c.id
JOIN attendance_statuses ast ON sa.attendanceStatusId = ast.id
WHERE sa.date >= '2025-11-01' AND sa.date <= '2025-11-30'
GROUP BY ca.id, c.name
ORDER BY avg_attendance DESC
```

---

## ✨ Ventajas de Esta Arquitectura

| Característica | Beneficio |
|---|---|
| **Múltiples registros/día/estudiante** | Asistencia específica por materia |
| **courseAssignmentId OPCIONAL** | Backwards compatible (asistencia general) |
| **unique() constraint** | Evita duplicados automáticamente |
| **StudentClassAttendance** | Detalles granulares (hora exacta, clase) |
| **Auditoría completa** | recordedBy, lastModifiedBy, timestamps |
| **Historial de cambios** | StudentAttendanceChange para auditoría |

---

## ⚠️ Lo que SÍ necesitas

### En el Backend

1. **Crear endpoint para selección múltiple:**
   ```
   POST /api/attendance/bulk-by-courses
   ```

2. **Modificar validaciones:**
   - Verificar que `courseAssignmentId` existe
   - Verificar que todos pertenecen a la misma sección
   - Verificar que el profesor tiene permiso

3. **Lógica de creación:**
   ```typescript
   for (const courseAssignmentId of courseAssignmentIds) {
     for (const attendance of attendances) {
       await StudentAttendance.create({
         enrollmentId: attendance.enrollmentId,
         date,
         courseAssignmentId,  // ← Diferente por cada curso
         attendanceStatusId: attendance.attendanceStatusId,
         recordedBy: userId
       });
     }
   }
   ```

### En el Frontend

1. **UI para seleccionar múltiples cursos:**
   - Checkboxes con los cursos disponibles
   - Botón "Seleccionar todos"
   - Mostrar cuántos cursos seleccionados

2. **Tabla con estudiantes:**
   - Una sola tabla (no múltiples)
   - Estado es el MISMO para todos los cursos seleccionados
   - Optimización: Aplicar estado a múltiples estudiantes + múltiples cursos

3. **Request optimizado:**
   ```javascript
   const payload = {
     date: "2025-11-09",
     courseAssignmentIds: [5, 6, 7],
     attendances: [
       { enrollmentId: 10, attendanceStatusId: 1 },
       { enrollmentId: 15, attendanceStatusId: 2 },
       { enrollmentId: 22, attendanceStatusId: 4 }
     ]
   };
   ```

---

## 🎓 Ejemplo Completo: Flujo Usuario

### 1. Profesor abre módulo de asistencia
```
- Sistema obtiene sección del profesor: 6to Grado A
- Obtiene cursos que enseña en esa sección
  → Matemáticas (9:00-10:00)
  → Español (10:00-11:00)
  → Ciencias (11:00-12:00)
```

### 2. Profesor selecciona cursos
```
☑ Matemáticas
☑ Español
☑ Ciencias

Estado: "Tiene 3 cursos seleccionados"
```

### 3. Profesor marca asistencia
```
| Estudiante | Estado |
|---|---|
| María García | P |
| Juan López | I |
| Ana Martínez | T |
```

### 4. Backend recibe y procesa
```javascript
// POST /api/attendance/bulk-by-courses
{
  date: "2025-11-09",
  courseAssignmentIds: [5, 6, 7],
  attendances: [
    { enrollmentId: 10, attendanceStatusId: 1 },
    { enrollmentId: 15, attendanceStatusId: 2 },
    { enrollmentId: 22, attendanceStatusId: 4 }
  ]
}

// Backend crea 9 registros (3 cursos × 3 estudiantes)
// ✅ 3 registros para Matemáticas
// ✅ 3 registros para Español
// ✅ 3 registros para Ciencias
```

### 5. Respuesta exitosa
```
✅ "Asistencia guardada para 3 cursos × 3 estudiantes"
```

---

## 🚀 Resumen

**Tu schema SÍ SOPORTA COMPLETAMENTE:**
- ✅ Asistencia por curso individual
- ✅ Asistencia por múltiples cursos simultáneamente
- ✅ Constraint único para evitar duplicados
- ✅ Auditoría completa
- ✅ Historial de cambios

**Lo que falta es el endpoint backend** para procesar la selección múltiple de cursos. El endpoint debería:
1. Recibir array de `courseAssignmentIds`
2. Crear un registro de asistencia POR CADA combinación de (estudiante × curso)
3. Retornar resumen de registros creados

¿Quieres que te ayude a diseñar ese endpoint o a actualizar el frontend para soportar esta funcionalidad?
