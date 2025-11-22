# 📚 API Asistencia - Documentación de Endpoints

**Base URL:** `http://localhost:3000/api/attendance`  
**Autenticación:** Bearer Token (JWT)  
**Content-Type:** `application/json`

---

## 📋 TABLA DE CONTENIDOS

- [CREACIÓN - Registrar Asistencia](#creación)
- [MODIFICACIÓN - Actualizar Asistencia](#modificación)
- [CONSULTA - Obtener Asistencia](#consulta)
- [REPORTES - Análisis de Datos](#reportes)
- [VALIDACIONES - Hooks para Validar](#validaciones)

---

## 🔵 CREACIÓN

### 1. POST `/single` - Registrar Asistencia Individual

**Propósito:** Registrar asistencia para UN estudiante (tardíos, llegadas atrasadas)

**Permisos:** `attendance:create`

**Request:**
```bash
POST /api/attendance/single
Authorization: Bearer <token>
Content-Type: application/json

{
  "enrollmentId": 1,
  "scheduleId": 12,
  "attendanceStatusId": 1,
  "date": "2025-11-20",
  "arrivalTime": "08:45",
  "modificationReason": "Llegada tarde por tráfico"
}
```

**Response 201 Created:**
```json
{
  "success": true,
  "message": "Registro de asistencia creado exitosamente",
  "data": {
    "id": 123,
    "enrollmentId": 1,
    "date": "2025-11-20",
    "status": "PRESENT",
    "statusName": "Presente",
    "recordedBy": "Prof. García",
    "recordedAt": "2025-11-20T09:15:00Z"
  }
}
```

**Validaciones:**
- ✅ enrollmentId debe existir y estar ACTIVE
- ✅ scheduleId debe existir y pertenencer a la sección
- ✅ attendanceStatusId debe existir
- ✅ Rol debe tener permiso `canCreate` para este status
- ✅ Calcula automáticamente `minutesLate` si se proporciona arrivalTime
- ✅ Fecha no puede ser futura

**Errores Posibles:**
```json
{
  "400": "enrollmentId, scheduleId, attendanceStatusId, date son requeridos",
  "403": "Tu rol no tiene permiso para registrar estado \"Presente\"",
  "404": "Enrollment 1 no encontrado"
}
```

---

### 2. POST `/daily-registration` - Registro Diario Masivo

**Propósito:** Registra asistencia para TODOS los estudiantes de una sección en UN día (TAB 1)

**Permisos:** `attendance:create`

**Request:**
```bash
POST /api/attendance/daily-registration
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2025-11-20",
  "sectionId": 5,
  "enrollmentStatuses": {
    "1": 1,
    "2": 1,
    "3": 2,
    "4": 1,
    "5": 3
  }
}
```

**Explicación:**
- `date`: Fecha del registro
- `sectionId`: Sección de estudiantes
- `enrollmentStatuses`: Map donde:
  - Key = enrollmentId
  - Value = attendanceStatusId (1=Presente, 2=Ausente, 3=Tardío, etc.)

**Response 201 Created:**
```json
{
  "success": true,
  "message": "Registro diario completado",
  "date": "2025-11-20",
  "sectionId": 5,
  "sectionName": "6to A",
  "totalStudents": 30,
  "createdRecords": 30,
  "createdAttendances": 90,
  "recordingGroupId": "enr_*_2025-11-20",
  "summary": {
    "present": 25,
    "absent": 3,
    "tardy": 2
  }
}
```

**Cálculos Internos:**
- Crea 1 registro por estudiante (enrollmentId)
- Crea N registros por cada courseAssignment del profesor en esa sección
- Preserva `originalStatus` (NUNCA cambia)
- Genera `recordingGroupId` para agrupar registros iniciales

**Validaciones:**
- ✅ Profesor debe tener cursos en esa sección
- ✅ Todos los enrollmentIds deben existir y estar ACTIVE
- ✅ Todos los statusIds deben existir
- ✅ Rol debe tener permiso para CADA status
- ✅ Todo en transacción atómica (todo o nada)

---

## 🟡 MODIFICACIÓN

### 3. PATCH `/class/:classAttendanceId` - Actualizar Registro Individual

**Propósito:** Modifica UN registro de asistencia con auditoría completa (TAB 2)

**Permisos:** `attendance:modify`

**Request:**
```bash
PATCH /api/attendance/class/550
Authorization: Bearer <token>
Content-Type: application/json

{
  "attendanceStatusId": 2,
  "modificationReason": "Se fue temprano - Cita médica autorizada"
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Registro de asistencia actualizado",
  "data": {
    "id": 550,
    "enrollmentId": 1,
    "studentName": "Juan Pérez",
    "date": "2025-11-20",
    "originalStatus": "PRESENT",
    "currentStatus": "ABSENT",
    "currentStatusName": "Ausente",
    "modificationReason": "Se fue temprano - Cita médica autorizada",
    "modifiedBy": "Coordinador López",
    "modifiedAt": "2025-11-20T14:30:00Z"
  }
}
```

**Auditoría Registrada:**
- ✅ `lastModifiedBy` = quién hizo el cambio
- ✅ `lastModifiedAt` = cuándo
- ✅ `modificationReason` = por qué
- ✅ `originalStatus` = preservado INMUTABLE para comparación

**Validaciones:**
- ✅ Registro debe existir
- ✅ Solo maestro propietario puede editar
- ✅ Nuevo status debe existir
- ✅ Rol debe tener permiso para nuevo status
- ✅ Recalcula reportes automáticamente

**Errores Posibles:**
```json
{
  "400": "attendanceStatusId es requerido",
  "403": "No tienes permiso para modificar este registro",
  "404": "StudentClassAttendance 550 no encontrado"
}
```

---

### 4. PATCH `/bulk-update` - Actualizar Múltiples Registros

**Propósito:** Actualiza VARIOS registros en lote con manejo de errores parciales

**Permisos:** `attendance:modify`

**Request:**
```bash
PATCH /api/attendance/bulk-update
Authorization: Bearer <token>
Content-Type: application/json

{
  "updates": [
    {
      "classAttendanceId": 550,
      "attendanceStatusId": 2,
      "arrivalTime": "08:45"
    },
    {
      "classAttendanceId": 551,
      "attendanceStatusId": 2
    },
    {
      "classAttendanceId": 552,
      "attendanceStatusId": 3
    }
  ],
  "changeReason": "Corrección de error administrativo del 19/11"
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Actualización completada",
  "updated": 45,
  "failed": 2,
  "results": [
    {
      "id": 550,
      "enrollmentId": 1,
      "status": "ABSENT",
      "statusName": "Ausente",
      "modificationReason": "Corrección de error administrativo del 19/11",
      "modifiedAt": "2025-11-20T14:30:00Z"
    },
    {
      "id": 551,
      "enrollmentId": 2,
      "status": "ABSENT",
      "statusName": "Ausente",
      "modificationReason": "Corrección de error administrativo del 19/11",
      "modifiedAt": "2025-11-20T14:30:00Z"
    }
  ],
  "errors": [
    {
      "id": 570,
      "error": "No tienes permiso para cambiar a \"Ausente Justificado\""
    },
    {
      "id": 571,
      "error": "StudentClassAttendance no encontrado"
    }
  ]
}
```

**Características:**
- ✅ Continúa si uno falla (no es todo-o-nada)
- ✅ Deduplicación: Recalcula reportes una sola vez por enrollment
- ✅ Retorna sucessos y errores separadamente
- ✅ Todos con auditoría completa

**Validaciones por cada registro:**
- ✅ Registro existe
- ✅ Maestro es propietario
- ✅ Nuevo status existe
- ✅ Rol tiene permiso

---

## 🟢 CONSULTA

### 5. GET `/daily-registration/:sectionId/:date` - Estado de Registro Diario

**Propósito:** Retorna quién fue registrado y quién no en una sección para una fecha (TAB 1)

**Permisos:** `attendance:read`

**Request:**
```bash
GET /api/attendance/daily-registration/5/2025-11-20
Authorization: Bearer <token>
```

**Response 200 OK:**
```json
{
  "success": true,
  "date": "2025-11-20",
  "sectionId": 5,
  "sectionName": "6to A",
  "totalStudents": 30,
  "registeredStudents": 25,
  "pendingStudents": 5,
  "percentage": 83,
  "students": [
    {
      "enrollmentId": 1,
      "studentName": "Juan Pérez",
      "studentId": 101,
      "originalStatus": "PRESENT",
      "consolidatedStatus": "PRESENT",
      "isRegistered": true,
      "hasModifications": false,
      "modificationCount": 0,
      "recordedAt": "2025-11-20T09:15:00Z"
    },
    {
      "enrollmentId": 2,
      "studentName": "María García",
      "studentId": 102,
      "originalStatus": "PRESENT",
      "consolidatedStatus": "MIXED",
      "isRegistered": true,
      "hasModifications": true,
      "modificationCount": 1,
      "modificationDetails": {
        "modifiedCourses": 1,
        "totalCourses": 3,
        "message": "Inglés: cambió a ABSENT (se fue temprano)"
      },
      "recordedAt": "2025-11-20T09:16:00Z"
    },
    {
      "enrollmentId": 50,
      "studentName": "Paula Fernández",
      "studentId": 150,
      "originalStatus": null,
      "consolidatedStatus": null,
      "isRegistered": false,
      "hasModifications": false,
      "modificationCount": 0,
      "recordedAt": null
    }
  ]
}
```

**Interpretación:**
- `originalStatus` = Lo que registró el profesor (NUNCA cambia)
- `consolidatedStatus` = Estado actual (puede cambiar)
  - Si es MIXED = Algunos cursos tienen status diferente
- `hasModifications` = ¿Alguien cambió algo después del registro inicial?
- `isRegistered` = ¿Existe al menos 1 registro para este estudiante?

---

### 6. GET `/section/:sectionId/cycle/:cycleId/date/:date` - Asistencia Completa de Sección

**Propósito:** Retorna asistencia de TODOS los estudiantes por TODAS sus clases en una fecha (TAB 2)

**Permisos:** `attendance:read`

**Request:**
```bash
GET /api/attendance/section/5/cycle/1/date/2025-11-20
Authorization: Bearer <token>
```

**Response 200 OK:**
```json
{
  "success": true,
  "date": "2025-11-20",
  "sectionId": 5,
  "sectionName": "6to A",
  "cycleId": 1,
  "totalStudents": 30,
  "recordedCount": 28,
  "pendingCount": 2,
  "students": [
    {
      "id": 1,
      "enrollmentId": 123,
      "studentId": 456,
      "studentName": "Juan Pérez García",
      "status": "PRESENT",
      "classAttendances": [
        {
          "id": 550,
          "scheduleId": 12,
          "courseName": "Matemáticas",
          "courseAssignmentId": 5,
          "status": "PRESENT",
          "statusCode": "P",
          "arrivalTime": "08:00",
          "departureTime": null,
          "isEarlyExit": false,
          "minutesLate": 0,
          "originalStatus": "PRESENT",
          "modificationReason": null,
          "recordedAt": "2025-11-20T09:15:00Z"
        },
        {
          "id": 551,
          "scheduleId": 13,
          "courseName": "Español",
          "courseAssignmentId": 6,
          "status": "PRESENT",
          "statusCode": "P",
          "arrivalTime": "08:45",
          "departureTime": null,
          "isEarlyExit": false,
          "minutesLate": 0,
          "originalStatus": "PRESENT",
          "modificationReason": null,
          "recordedAt": "2025-11-20T09:16:00Z"
        },
        {
          "id": 552,
          "scheduleId": 14,
          "courseName": "Inglés",
          "courseAssignmentId": 7,
          "status": "ABSENT",
          "statusCode": "A",
          "arrivalTime": null,
          "departureTime": "10:30",
          "isEarlyExit": true,
          "exitReason": "Cita médica",
          "minutesLate": null,
          "originalStatus": "PRESENT",
          "modificationReason": "Se fue temprano - Cita médica autorizada",
          "recordedAt": "2025-11-20T09:17:00Z",
          "modifiedAt": "2025-11-20T14:30:00Z"
        }
      ]
    }
  ]
}
```

**Campos Importantes:**
- `status` = Estado general del estudiante en el día
- `classAttendances` = Desglose por CADA clase/curso
- `isEarlyExit` = Salida temprana registrada
- `departureTime` = Hora exacta de salida
- `minutesLate` = Minutos de retraso (calculado automáticamente)

---

### 7. GET `/course/:courseAssignmentId/date/:date` - Asistencia por Curso

**Propósito:** Retorna asistencia de UN curso en una fecha específica (TAB 2)

**Permisos:** `attendance:read`

**Request:**
```bash
GET /api/attendance/course/5/date/2025-11-20
Authorization: Bearer <token>
```

**Response 200 OK:**
```json
{
  "success": true,
  "courseName": "Matemáticas",
  "sectionName": "6to A",
  "date": "2025-11-20",
  "recordedCount": 26,
  "totalStudents": 28,
  "completenessPercentage": 93,
  "attendanceRecords": [
    {
      "enrollmentId": 1,
      "studentName": "Juan Pérez",
      "status": "PRESENT",
      "statusName": "Presente",
      "originalStatus": "PRESENT",
      "lastModifiedBy": null,
      "modificationReason": null,
      "arrivalTime": "08:00",
      "minutesLate": 0,
      "recordedAt": "2025-11-20T09:15:00Z"
    },
    {
      "enrollmentId": 2,
      "studentName": "María García",
      "status": "ABSENT",
      "statusName": "Ausente",
      "originalStatus": "PRESENT",
      "lastModifiedBy": "Coordinador López",
      "modificationReason": "Se fue temprano",
      "arrivalTime": null,
      "minutesLate": null,
      "recordedAt": "2025-11-20T09:16:00Z",
      "modifiedAt": "2025-11-20T14:30:00Z"
    }
  ]
}
```

---

### 8. GET `/enrollment/:enrollmentId` - Historial de Estudiante

**Propósito:** Retorna TODO el historial de asistencia de un estudiante

**Permisos:** `attendance:read`

**Query Parameters:**
- `limit` (opcional, default=50) - Cantidad de registros
- `offset` (opcional, default=0) - Paginación

**Request:**
```bash
GET /api/attendance/enrollment/123?limit=20&offset=0
Authorization: Bearer <token>
```

**Response 200 OK:**
```json
{
  "success": true,
  "enrollmentId": 123,
  "studentName": "Juan Pérez",
  "total": 45,
  "limit": 20,
  "offset": 0,
  "attendances": [
    {
      "id": 550,
      "date": "2025-11-20",
      "status": "PRESENT",
      "originalStatus": "PRESENT",
      "courseName": "Matemáticas",
      "arrivalTime": "08:00",
      "minutesLate": 0,
      "isEarlyExit": false,
      "modificationReason": null,
      "recordedAt": "2025-11-20T09:15:00Z"
    }
  ]
}
```

---

## 📊 REPORTES

### 9. GET `/report/:enrollmentId` - Reporte Consolidado de Asistencia

**Propósito:** Retorna reporte de asistencia con análisis (TAB 3)

**Permisos:** `attendance:read`

**Request:**
```bash
GET /api/attendance/report/123
Authorization: Bearer <token>
```

**Response 200 OK:**
```json
{
  "success": true,
  "enrollmentId": 123,
  "studentName": "Juan Pérez García",
  "sectionName": "6to A",
  "gradeLevel": "6to Primaria",
  "bimesterId": 1,
  "bimesterName": "Bimestre 1",
  "totalSchoolDays": 20,
  "totalMarkDays": 20,
  "countPresent": 18,
  "countAbsent": 1,
  "countAbsentJustified": 1,
  "countTemporal": 0,
  "countTemporalJustified": 0,
  "attendancePercentage": 95.0,
  "absencePercentage": 5.0,
  "consecutiveAbsences": 0,
  "isAtRisk": false,
  "needsIntervention": false,
  "notes": "Estudiante con muy buena asistencia",
  "calculationSnapshot": {
    "calculatedAt": "2025-11-20T15:30:00Z",
    "method": "automatic_calculation",
    "counts": {
      "present": 18,
      "absent": 1,
      "justifiedAbsent": 1,
      "totalDays": 20
    },
    "formula": "(present + temporalJustified) / totalDays * 100",
    "riskThreshold": 80.0
  }
}
```

**Interpretación:**
- `attendancePercentage` > 80% = ✅ Normal
- `attendancePercentage` ≤ 80% = ⚠️ En riesgo
- `consecutiveAbsences` ≥ 3 = 🚨 Crítico
- `calculationSnapshot` = Auditoría de cómo se calculó

---

## 🔒 VALIDACIONES (Hooks)

Estos endpoints se usan en el **flujo de validación previo al registro**.

### Hook 1: GET `/bimester/by-date` - Validar Bimestre

```bash
GET /api/attendance/bimester/by-date?cycleId=1&date=2025-11-20
Authorization: Bearer <token>
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "cycleId": 1,
    "number": 1,
    "name": "Bimestre 1",
    "startDate": "2025-09-01",
    "endDate": "2025-10-31",
    "isActive": true
  }
}
```

**Response 400 Bad Request:**
```json
{
  "success": false,
  "error": "BIMESTER_NOT_FOUND",
  "message": "No active bimester found for this date"
}
```

---

### Hook 2: GET `/holiday/by-date` - Validar Feriado

```bash
GET /api/attendance/holiday/by-date?bimesterId=1&date=2025-11-01
Authorization: Bearer <token>
```

**Response 200 OK (No es feriado):**
```json
{
  "success": true,
  "data": null,
  "message": "Date is not a holiday"
}
```

**Response 400 Bad Request (Es feriado NO recuperado):**
```json
{
  "success": false,
  "error": "HOLIDAY_NOT_RECOVERED",
  "message": "Cannot record attendance on non-recovered holiday",
  "holiday": {
    "date": "2025-11-01",
    "description": "Día de Muertos",
    "isRecovered": false
  }
}
```

---

### Hook 3: GET `/week/by-date` - Validar Semana Académica

```bash
GET /api/attendance/week/by-date?bimesterId=1&date=2025-12-20
Authorization: Bearer <token>
```

**Response 400 Bad Request (Semana BREAK):**
```json
{
  "success": false,
  "error": "BREAK_WEEK",
  "message": "Cannot record attendance during break week",
  "week": {
    "number": 8,
    "startDate": "2025-12-20",
    "endDate": "2025-12-24",
    "weekType": "BREAK"
  }
}
```

---

### Hook 5: GET `/teacher-absence/:teacherId` - Validar Ausencia

```bash
GET /api/attendance/teacher-absence/2?date=2025-11-15
Authorization: Bearer <token>
```

**Response 400 Bad Request:**
```json
{
  "success": false,
  "error": "TEACHER_ON_LEAVE",
  "message": "Teacher is on approved absence for this date",
  "absence": {
    "startDate": "2025-11-10",
    "endDate": "2025-11-20",
    "reason": "Capacitación profesional",
    "status": "approved"
  }
}
```

---

### Hook 6: GET `/config/active` - Obtener Configuración

```bash
GET /api/attendance/config/active
Authorization: Bearer <token>
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "riskThresholdPercentage": 80.0,
    "lateThresholdTime": "08:30",
    "markAsTardyAfterMinutes": 15,
    "justificationRequiredAfter": 3
  }
}
```

---

### Hook 8: GET `/status/allowed/role/:roleId` - Estados Permitidos

```bash
GET /api/attendance/status/allowed/role/3
Authorization: Bearer <token>
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "P",
      "name": "Presente",
      "permission": {
        "canCreate": true,
        "canModify": false
      }
    },
    {
      "id": 2,
      "code": "A",
      "name": "Ausente",
      "permission": {
        "canCreate": true,
        "canModify": false
      }
    }
  ]
}
```

---

## 🔑 AUTENTICACIÓN

Todos los endpoints requieren:

```http
Authorization: Bearer <jwt_token>
```

Obtener token:
```bash
POST /api/auth/login
{
  "email": "teacher@school.com",
  "password": "password123"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "email": "teacher@school.com",
    "roleId": 3,
    "givenNames": "Carlos"
  }
}
```

---

## 📱 FLUJO FRONTEND (Usar estos endpoints en este orden)

### **TAB 1: Registro Diario**
1. GET `/cycle/active` - Obtener ciclo
2. GET `/bimester/by-date?cycleId=...&date=...` - Validar bimestre
3. GET `/holiday/by-date?bimesterId=...&date=...` - Validar feriado
4. GET `/week/by-date?bimesterId=...&date=...` - Validar semana
5. GET `/teacher-absence/:teacherId?date=...` - Validar ausencia maestro
6. GET `/daily-registration/:sectionId/:date` - Ver quién fue registrado
7. POST `/daily-registration` - Registrar a todos
8. GET `/daily-registration/:sectionId/:date` - Confirmar registro

### **TAB 2: Gestión por Curso**
1. GET `/course/:courseAssignmentId/date/:date` - Ver asistencia del curso
2. PATCH `/class/:classAttendanceId` - Modificar registro individual (si necesario)
3. PATCH `/bulk-update` - Cambios masivos (opcional)

### **TAB 3: Reportes**
1. GET `/report/:enrollmentId` - Ver reporte de estudiante
2. GET `/enrollment/:enrollmentId` - Ver historial completo

---

## 🚀 Importar a Postman/Insomnia

1. Descarga `attendance-api-openapi.json`
2. En Postman: `Import > Upload Files > attendance-api-openapi.json`
3. Configura variable `{{token}}` en environments
4. ¡Listo! Todos los endpoints listos para usar
