# 📊 ANÁLISIS COMPLETO DEL SISTEMA DE ASISTENCIA DE ESTUDIANTES

**Fecha:** Noviembre 13, 2025  
**Estado:** Análisis Completo - Listo para Implementación

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Flujo de Datos Completo](#flujo-de-datos-completo)
3. [Tablas Involucradas](#tablas-involucradas)
4. [Validaciones Requeridas](#validaciones-requeridas)
5. [Casos de Uso](#casos-de-uso)
6. [Errores y Excepciones](#errores-y-excepciones)
7. [Índices de Base de Datos](#índices-de-base-de-datos)
8. [Checklist de Implementación Backend](#checklist-de-implementación-backend)

---

## 🎯 RESUMEN EJECUTIVO

### Objetivo Principal
Un **maestro registra asistencia UNA SOLA VEZ** por día, y el sistema crea automáticamente registros de asistencia para todos sus cursos. Otros usuarios (secretaria, coordinador) pueden EDITAR después si hay cambios (salida temprana, etc.).

### Características Clave
- ✅ **Registro único masivo:** Maestro marca todos sus estudiantes de una vez
- ✅ **Control de scope:** Maestro ve solo lo autorizado (ALL, GRADE, SECTION)
- ✅ **Validaciones en cascada:** 17 capas de validación antes de guardar
- ✅ **Auditoría completa:** Todo cambio se registra en StudentAttendanceChange
- ✅ **Permisos granulares:** RoleAttendancePermission controla cada acción
- ✅ **Transacciones atómicas:** Todo o nada

### Complejidad
- **Tablas involucradas:** 17 tablas críticas
- **Validaciones:** 17 capas de validación
- **Casos de uso:** 8 scenarios cubiertos
- **Índices recomendados:** 8 índices
- **Errores esperados:** 15 tipos de error

---

## 🔄 FLUJO DE DATOS COMPLETO

### FASE 1: AUTENTICACIÓN
```
Request → Extraer User.id y User.roleId
    ↓
¿User existe y está activo?
    ├─ NO → 401 Unauthorized
    └─ SÍ → FASE 2
```

### FASE 2: VALIDACIÓN DE ROL Y SCOPE
```
¿User.role.roleType === TEACHER o compatible?
    ├─ NO → 403 Forbidden "Solo maestros pueden registrar"
    └─ SÍ → Obtener RolePermission
        ├─ scope = ALL → Acceso a TODO
        ├─ scope = GRADE → Solo su grado
        ├─ scope = SECTION → Solo su sección
        ├─ scope = OWN → Solo sus cursos
        └─ scope = DEPARTMENT → Su departamento
```

### FASE 3: VALIDACIÓN DE SELECCIÓN GRADO/SECCIÓN
```
Maestro selecciona: gradeId, sectionId

¿El scope permite acceso?
    ├─ ALL → SÍ
    ├─ GRADE → ¿User.guidedSections contiene?
    ├─ SECTION → ¿User.guidedSections[0].id ===?
    ├─ OWN → ¿User.courseAssignments[].section contiene?
    └─ DEPARTMENT → ¿Section.grade.department ===?
        ├─ NO → 403 Forbidden
        └─ SÍ → FASE 4
```

### FASE 4: VALIDACIÓN DE FECHA Y CICLO
```
date > today?
    ├─ SÍ → 400 "No puedes registrar en futuro"
    └─ NO → Buscar SchoolCycle activo
        ├─ NO → 400 "No existe ciclo activo"
        └─ SÍ → Validar SchoolCycle
            ├─ isActive = false → 400 "Ciclo no activo"
            ├─ isArchived = true → 400 "Ciclo archivado"
            └─ SÍ → FASE 5
```

### FASE 5: VALIDACIÓN DE BIMESTRE
```
¿Existe Bimester activo?
    - startDate ≤ date ≤ endDate
    - isActive = true
    ├─ NO → 400 "No existe bimestre"
    └─ SÍ → FASE 6
```

### FASE 6: VALIDACIÓN DE HOLIDAY
```
¿Existe Holiday en esta fecha?
    ├─ SÍ:
    │   ├─ isRecovered = true → Permitir
    │   └─ isRecovered = false → 400 "Día feriado"
    └─ NO → FASE 7
```

### FASE 7: VALIDACIÓN DE ACADEMICWEEK
```
¿Existe AcademicWeek que contenga fecha?
    ├─ SÍ:
    │   ├─ weekType = BREAK → 400 "Semana de descanso"
    │   └─ weekType ≠ BREAK → FASE 8
    └─ NO → FASE 8
```

### FASE 8: VALIDACIÓN DE SCHEDULES
```
¿Maestro tiene Schedule para ese día?
    - teacherId = User.id
    - dayOfWeek = día de semana
    - courseAssignment.isActive = true
    ├─ NO → 404 "No tienes clases programadas"
    └─ SÍ → FASE 9
```

### FASE 9: VALIDACIÓN DE ESTUDIANTES
```
Obtener Enrollments:
    - sectionId = selectedSection.id
    - cycleId = SchoolCycle.id
    - status = ACTIVE
    - dateEnrolled ≤ date

¿Hay estudiantes?
    ├─ NO → 400 "No hay estudiantes"
    └─ SÍ → FASE 10
```

### FASE 10: VALIDACIÓN DE ESTADO
```
¿AttendanceStatus existe y está activo?
    ├─ NO → 404 "Estado no existe"
    └─ SÍ → FASE 11
```

### FASE 11: VALIDACIÓN DE PERMISOS
```
¿RoleAttendancePermission(roleId, statusId)?
    ├─ NO → 403 "Permiso no existe"
    └─ SÍ:
        ├─ canCreate = false → 403 "No puedes crear"
        ├─ canModify = true → 403 "Maestros no editan"
        └─ Válido → FASE 12
```

### FASE 12: CARGAR CONFIGURACIÓN
```
Obtener AttendanceConfig activo:
    - isActive = true
    
¿Existe?
    ├─ NO → Crear DEFAULT
    └─ SÍ → Usar valores
        - lateThresholdTime
        - markAsTardyAfterMinutes
        - riskThresholdPercentage
```

### FASE 13: VALIDACIÓN DE AUSENCIA DEL MAESTRO
```
¿TeacherAbsence para esta fecha?
    - startDate ≤ date ≤ endDate
    - status IN ['approved', 'active']
    ├─ SÍ → 400 "Estás de ausencia"
    └─ NO → CREAR ASISTENCIA
```

---

## 📊 TABLAS INVOLUCRADAS

### 1. User (Maestro)
```
Campos críticos:
- id (PK)
- roleId (FK → Role)
- guidedSections[] (secciones que guía)
- courseAssignments[] (cursos asignados)
- teacherDetails (verificar es maestro)

Validaciones:
✅ Existe
✅ isActive = true
✅ teacherDetails existe
```

### 2. Role
```
Campos críticos:
- id (PK)
- roleType (TEACHER, COORDINATOR, etc.)
- isActive

Validaciones:
✅ roleType == TEACHER o similar
✅ isActive = true
```

### 3. RolePermission
```
Campos críticos:
- roleId (FK)
- permissionId (FK)
- scope (ALL, GRADE, SECTION, OWN, DEPARTMENT)
- metadata (JSON)

Validaciones:
✅ Existe (roleId + permissionId)
✅ scope válido
✅ Determina acceso a grados/secciones
```

### 4. SchoolCycle
```
Campos críticos:
- id (PK)
- startDate, endDate
- isActive
- isArchived
- canEnroll

Validaciones:
✅ Contiene fecha de asistencia
✅ isActive = true
✅ isArchived = false
```

### 5. Bimester
```
Campos críticos:
- id (PK)
- cycleId (FK)
- startDate, endDate
- isActive
- holidays[] (relación inversa)
- academicWeeks[] (relación inversa)

Validaciones:
✅ cycleId = SchoolCycle encontrado
✅ isActive = true
✅ Contiene fecha
```

### 6. Holiday
```
Campos críticos:
- id (PK)
- bimesterId (FK)
- date
- isRecovered

Validaciones:
✅ Si date = fecha asistencia:
   ├─ isRecovered = false → BLOQUEAR
   └─ isRecovered = true → PERMITIR
```

### 7. AcademicWeek
```
Campos críticos:
- id (PK)
- bimesterId (FK)
- startDate, endDate
- weekType (REGULAR, EVALUATION, REVIEW, BREAK)

Validaciones:
✅ Si startDate ≤ date ≤ endDate:
   ├─ weekType = BREAK → BLOQUEAR
   └─ Otro → PERMITIR
```

### 8. Grade
```
Campos críticos:
- id (PK)
- name, level, order
- isActive
- sections[] (relación inversa)

Validaciones:
✅ isActive = true
✅ Permitido según scope
```

### 9. Section
```
Campos críticos:
- id (PK)
- gradeId (FK)
- teacherId (FK, maestro guía)
- capacity
- enrollments[] (relación inversa)
- schedules[] (relación inversa)

Validaciones:
✅ Pertenece a grado seleccionado
✅ Permitida por scope
✅ Tiene estudiantes
✅ Tiene schedules
```

### 10. Schedule
```
Campos críticos:
- id (PK)
- sectionId (FK)
- courseId (FK)
- courseAssignmentId (FK)
- dayOfWeek (0-6)
- startTime, endTime
- teacherId (FK)

Validaciones:
✅ dayOfWeek coincide con fecha
✅ courseAssignment.isActive = true
✅ teacherId = User.id
```

### 11. CourseAssignment
```
Campos críticos:
- id (PK)
- sectionId (FK)
- courseId (FK)
- teacherId (FK)
- assignmentType (titular, apoyo, temporal, suplente)
- isActive

Validaciones:
✅ isActive = true
✅ teacherId = User.id
✅ Dentro de rango del ciclo
```

### 12. Enrollment
```
Campos críticos:
- id (PK)
- studentId (FK)
- sectionId (FK)
- cycleId (FK)
- gradeId (FK)
- status (ACTIVE, SUSPENDED, INACTIVE, TRANSFERRED)
- dateEnrolled

Validaciones:
✅ sectionId = selectedSection.id
✅ cycleId = SchoolCycle.id
✅ status = ACTIVE
✅ dateEnrolled ≤ date
```

### 13. AttendanceStatus
```
Campos críticos:
- id (PK)
- code (P, A, T, E)
- name (Presente, Ausente, etc.)
- requiresJustification
- isNegative
- colorCode
- isActive

Validaciones:
✅ isActive = true
✅ Maestro tiene RoleAttendancePermission.canCreate
```

### 14. RoleAttendancePermission
```
Campos críticos:
- id (PK)
- roleId (FK)
- attendanceStatusId (FK)
- canView, canCreate, canModify, canDelete, canApprove
- canAddJustification
- requiresNotes

Validaciones:
✅ Existe (roleId + statusId)
✅ canCreate = true (maestro)
✅ canModify = false (maestro NO edita)
```

### 15. AttendanceConfig
```
Campos críticos:
- id (PK)
- name, isActive
- lateThresholdTime ("08:30")
- markAsTardyAfterMinutes (15)
- riskThresholdPercentage (80.0)
- justificationRequiredAfter (3)
- maxJustificationDays (365)

Validaciones:
✅ isActive = true
✅ Usar para cálculos automáticos
```

### 16. TeacherAbsence
```
Campos críticos:
- id (PK)
- teacherId (FK)
- startDate, endDate
- status (pending, approved, rejected)

Validaciones:
✅ Si date dentro [startDate, endDate] y status IN ['approved', 'active']
✅ → Maestro NO puede registrar
```

### 17. StudentAttendance
```
Campos críticos:
- id (PK)
- enrollmentId (FK)
- date
- attendanceStatusId (FK)
- courseAssignmentId (FK, opcional)
- arrivalTime, minutesLate, departureTime
- recordedBy (FK → User)
- notes

Únicas:
✅ (enrollmentId, date) - Un registro por día por estudiante

Crear después de TODAS las validaciones
```

### 18. StudentClassAttendance
```
Campos críticos:
- id (PK)
- studentAttendanceId (FK)
- scheduleId (FK)
- courseAssignmentId (FK)
- status, arrivalTime, notes
- recordedBy (FK)

Crear: UNO por cada Schedule del maestro ese día

Relación:
StudentAttendance (1) → N StudentClassAttendance
```

### 19. StudentAttendanceChange
```
Campos críticos:
- id (PK)
- studentAttendanceId (FK)
- attendanceStatusIdBefore, attendanceStatusIdAfter
- notesBefore, notesAfter
- arrivalTimeBefore, arrivalTimeAfter
- changeReason (OBLIGATORIO)
- changedBy (FK → User)
- changedAt

Crear: SOLO si otro usuario EDITA (no en creación inicial)
```

### 20. StudentAttendanceReport
```
Campos críticos:
- id (PK)
- enrollmentId (FK, UNIQUE)
- bimesterId (FK)
- courseId (FK, opcional)
- countPresent, countAbsent, countAbsentJustified, countTemporal
- attendancePercentage, absencePercentage
- isAtRisk (si < 80%)
- consecutiveAbsences

Recalcular: AUTOMÁTICAMENTE después de cada operación
```

---

## ✅ VALIDACIONES REQUERIDAS

### Orden de Ejecución (CRÍTICO)
```
1️⃣  Autenticación (User existe)
2️⃣  Rol es TEACHER/COORDINATOR
3️⃣  RolePermission.scope validado
4️⃣  Grado/Sección permitidos por scope
5️⃣  Fecha no es futura
6️⃣  SchoolCycle activo existe
7️⃣  SchoolCycle no archivado
8️⃣  Bimester activo existe
9️⃣  Holiday validado (isRecovered)
🔟 AcademicWeek.weekType ≠ BREAK
1️⃣1️⃣ Schedule existe para ese día
1️⃣2️⃣ CourseAssignment.isActive
1️⃣3️⃣ Enrollments.status = ACTIVE
1️⃣4️⃣ AttendanceStatus válido
1️⃣5️⃣ RoleAttendancePermission.canCreate
1️⃣6️⃣ AttendanceConfig cargado
1️⃣7️⃣ TeacherAbsence validado

SI CUALQUIERA FALLA → Retornar error inmediatamente
```

### Matriz de Validaciones

| # | Tabla | Campo | Validación | Error |
|---|-------|-------|-----------|-------|
| 1 | User | roleId | Existe y activo | User role not found |
| 2 | User | teacherDetails | Existe | Only teachers can record |
| 3 | Role | roleType | TEACHER o compatible | Invalid role type |
| 4 | RolePermission | scope | ALL/GRADE/SECTION/OWN | Invalid scope |
| 5 | Grade | isActive | true | Grade is inactive |
| 6 | Section | gradeId | + scope | Section not allowed |
| 7 | StudentAttendance | date | No futura | Date cannot be future |
| 8 | SchoolCycle | isActive | true | Cycle not active |
| 9 | SchoolCycle | isArchived | false | Cycle is archived |
| 10 | Bimester | date range | Contiene fecha | Date outside range |
| 11 | Bimester | isActive | true | Bimester not active |
| 12 | Holiday | date | No OR isRecovered | Cannot record on holiday |
| 13 | AcademicWeek | weekType | ≠ BREAK | Cannot record during break |
| 14 | Schedule | dayOfWeek | Coincide | No schedule found |
| 15 | CourseAssignment | isActive | true | Course inactive |
| 16 | CourseAssignment | teacherId | = userId | Not your course |
| 17 | Enrollment | status | ACTIVE | Student not active |
| 18 | Enrollment | cycleId | = SchoolCycle.id | Wrong cycle |
| 19 | Enrollment | sectionId | = selectedSection | Wrong section |
| 20 | AttendanceStatus | isActive | true | Status inactive |
| 21 | RoleAttendancePermission | canCreate | true | No create permission |
| 22 | RoleAttendancePermission | canModify | false | Teachers cannot modify |
| 23 | AttendanceConfig | isActive | true | No active config |
| 24 | TeacherAbsence | date range | Fuera rango | Teacher on leave |
| 25 | StudentAttendance | (enrollment, date) | Unique | Already recorded |

---

## 🎯 CASOS DE USO

### Caso 1: EXITOSO - Maestro registra asistencia
```
1. Maestro Juan (TEACHER, scope=SECTION)
   └─ Acceso: Solo su sección 6to A
   
2. Selecciona: date=2025-11-13, section=6to A
   
3. Sistema valida TODAS las 25 validaciones ✅
   
4. Sistema muestra: Lista de 30 estudiantes
   
5. Juan marca: "Todos presentes"
   
6. Sistema crea:
   ├─ 30 × StudentAttendance
   ├─ 30 × N StudentClassAttendance
   └─ Recalcula StudentAttendanceReport
   
✅ ÉXITO: "Asistencia registrada para 30 estudiantes"
```

### Caso 2: Maestro con scope ALL
```
1. Carlos (COORDINATOR, scope=ALL)
   └─ Acceso: Todos los grados y secciones
   
2. Selecciona: 6to Primaria (cualquiera)
   
3. Sistema permite cualquier grado/sección
   
4. Resto del flujo = Caso 1
```

### Caso 3: Fecha futura
```
Intenta: date=2025-12-25 (futura)
❌ 400 Bad Request: "No puedes registrar en futuro"
```

### Caso 4: Día feriado NO recuperado
```
date=2025-11-01 (All Saints' Day)
Holiday.isRecovered=false
❌ 400 Bad Request: "No puedes registrar en día feriado"
```

### Caso 5: Día feriado SÍ recuperado
```
date=2025-11-01
Holiday.isRecovered=true
✅ PERMITIR: Continuar normal
```

### Caso 6: Semana de descanso
```
date=2025-12-20 (Semana BREAK)
❌ 400 Bad Request: "Semana de descanso"
```

### Caso 7: Maestro en ausencia
```
TeacherAbsence: 2025-11-10 a 2025-11-20, status=approved
Intenta: 2025-11-13
❌ 400 Bad Request: "Estás de ausencia"
```

### Caso 8: Edición por secretaria
```
1. Maestro registró: estudiante X presente
   
2. Secretaria ve: X se fue a las 14:30
   
3. Secretaria edita:
   ├─ statusId: 1 → 5 (SALIDA TEMPRANA)
   ├─ changeReason: "Autorizada por coordinador"
   └─ Submit
   
4. Sistema valida:
   ✅ Secretaria tiene RoleAttendancePermission.canModify=true
   
5. Sistema crea:
   └─ StudentAttendanceChange (auditoría)
   
6. Recalcula: StudentAttendanceReport
   
✅ ÉXITO: Cambio registrado y auditado
```

---

## 🚨 ERRORES Y EXCEPCIONES

| Error | HTTP | Causa | Solución |
|-------|------|-------|----------|
| User not authenticated | 401 | Token expirado/inválido | Re-autenticar |
| User not found | 404 | User ID no existe | Verificar user |
| Only teachers can register | 403 | roleType ≠ TEACHER | Cambiar rol |
| Date cannot be future | 400 | date > today | Seleccionar fecha válida |
| No active cycle for this date | 400 | SchoolCycle no existe | Crear ciclo |
| Cycle is archived | 400 | isArchived = true | Usar ciclo activo |
| No active bimester | 400 | Bimester no existe | Crear bimestre |
| Cannot register on holiday | 400 | Holiday.isRecovered=false | Usar otro día |
| Cannot register during break | 400 | weekType=BREAK | Esperar semana regular |
| Section access denied | 403 | Scope no permite | Seleccionar sección autorizada |
| No schedules found | 404 | Schedule no existe | Crear horarios |
| No active students | 400 | No Enrollment.status=ACTIVE | Matricular estudiantes |
| Invalid attendance status | 400 | AttendanceStatus no existe | Crear status |
| Insufficient permissions | 403 | RolePermission.canCreate=false | Asignar permiso |
| Teacher is on leave | 400 | TeacherAbsence activa | Cambiar maestro |
| Attendance already recorded | 409 | (enrollmentId, date) único | Editar existente |

---

## 🗄️ ÍNDICES DE BASE DE DATOS

### Índices Recomendados (Para Performance)

```sql
-- 1. School Cycles - Búsquedas por rango de fechas
CREATE INDEX idx_school_cycles_active_dates 
ON school_cycles(isActive, isArchived, startDate, endDate);

-- 2. Bimesters - Por ciclo y estado
CREATE INDEX idx_bimesters_cycle_active 
ON bimesters(cycleId, isActive);

-- 3. Holidays - Por fecha específica
CREATE INDEX idx_holidays_bimester_date 
ON holidays(bimesterId, date);

-- 4. Academic Weeks - Por rango de fechas
CREATE INDEX idx_academic_weeks_date_range 
ON academic_weeks(bimesterId, startDate, endDate);

-- 5. Schedules - Por maestro y día
CREATE INDEX idx_schedules_teacher_day 
ON schedules(teacherId, dayOfWeek);

-- 6. Enrollments - Búsquedas frecuentes
CREATE INDEX idx_enrollments_section_cycle_status 
ON enrollments(sectionId, cycleId, status);

-- 7. Teacher Absences - Por rango de fechas
CREATE INDEX idx_teacher_absences_date_range 
ON teacher_absences(teacherId, startDate, endDate, status);

-- 8. Role Attendance Permissions - Validaciones de permisos
CREATE INDEX idx_role_attendance_perms 
ON role_attendance_permissions(roleId, attendanceStatusId);
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN BACKEND

### FASE 1: CREAR DTOs Y SCHEMAS (Validación)

- [ ] **Crear carpeta:** `src/modules/attendance/dto/`

- [ ] **Archivo:** `create-attendance.dto.ts`
  - [ ] Schema Zod con validaciones
  - [ ] enrollmentId: number (positivo)
  - [ ] date: string (ISO 8601)
  - [ ] gradeId: number
  - [ ] sectionId: number
  - [ ] attendanceStatusId: number
  - [ ] arrivalTime?: string (HH:MM)
  - [ ] departureTime?: string (HH:MM)
  - [ ] notes?: string
  - [ ] courseAssignmentId?: number

- [ ] **Archivo:** `bulk-teacher-attendance.dto.ts`
  - [ ] Schema para registro masivo
  - [ ] date: string
  - [ ] attendanceStatusId: number
  - [ ] notes?: string
  - [ ] courseAssignmentIds?: number[]

- [ ] **Archivo:** `update-attendance.dto.ts`
  - [ ] attendanceStatusId?: number
  - [ ] notes?: string
  - [ ] arrivalTime?: string
  - [ ] departureTime?: string
  - [ ] changeReason: string (OBLIGATORIO)

- [ ] **Archivo:** `index.ts`
  - [ ] Exportar todos los schemas

### FASE 2: CREAR SERVICIO DE VALIDACIONES

- [ ] **Archivo:** `src/modules/attendance/services/attendance-validation.service.ts`

- [ ] **Método:** `validateUser(userId: number, roleId: number)`
  - [ ] Verificar User existe
  - [ ] Verificar isActive = true
  - [ ] Verificar teacherDetails existe
  - [ ] Retornar User completo

- [ ] **Método:** `validateRoleAndScope(roleId: number, gradeId: number, sectionId: number, scope: string)`
  - [ ] Validar role.roleType
  - [ ] Validar scope enum
  - [ ] Si ALL → permitir todo
  - [ ] Si GRADE → verificar guidedSections
  - [ ] Si SECTION → verificar sección específica
  - [ ] Si OWN → verificar courseAssignments
  - [ ] Retornar validado o lanzar excepción

- [ ] **Método:** `validateDateAndCycle(date: string)`
  - [ ] Verificar no sea futura
  - [ ] Buscar SchoolCycle activo
  - [ ] Validar isActive = true
  - [ ] Validar isArchived = false
  - [ ] Retornar SchoolCycle

- [ ] **Método:** `validateBimester(cycleId: number, date: string)`
  - [ ] Buscar Bimester en rango
  - [ ] Validar isActive = true
  - [ ] Retornar Bimester

- [ ] **Método:** `validateHoliday(bimesterId: number, date: string)`
  - [ ] Buscar Holiday en fecha
  - [ ] Si existe y isRecovered = false → excepción
  - [ ] Si isRecovered = true → permitir
  - [ ] Retornar validado

- [ ] **Método:** `validateAcademicWeek(bimesterId: number, date: string)`
  - [ ] Buscar AcademicWeek en rango
  - [ ] Si weekType = BREAK → excepción
  - [ ] Retornar validado

- [ ] **Método:** `validateSchedules(userId: number, sectionId: number, dayOfWeek: number)`
  - [ ] Buscar Schedules del maestro
  - [ ] Validar courseAssignment.isActive
  - [ ] Retornar array de Schedules o excepción

- [ ] **Método:** `validateEnrollments(sectionId: number, cycleId: number, date: string)`
  - [ ] Buscar Enrollments activos
  - [ ] Filtrar por dateEnrolled ≤ date
  - [ ] Retornar array o excepción

- [ ] **Método:** `validateAttendanceStatus(statusId: number, roleId: number)`
  - [ ] Buscar AttendanceStatus
  - [ ] Validar isActive = true
  - [ ] Buscar RoleAttendancePermission
  - [ ] Validar canCreate = true
  - [ ] Validar canModify = false (maestro)
  - [ ] Retornar validado

- [ ] **Método:** `validateAttendanceConfig()`
  - [ ] Buscar AttendanceConfig activo
  - [ ] Si no existe → crear DEFAULT
  - [ ] Retornar config

- [ ] **Método:** `validateTeacherAbsence(userId: number, date: string)`
  - [ ] Buscar TeacherAbsence en rango
  - [ ] Si status IN ['approved', 'active'] → excepción
  - [ ] Retornar validado

### FASE 3: CREAR SERVICIO PRINCIPAL DE ASISTENCIA

- [ ] **Archivo:** `src/modules/attendance/services/attendance.service.ts`

- [ ] **Método:** `createTeacherAttendance(dto: BulkTeacherAttendanceDto, user: UserContext)`
  - [ ] Inyectar validationService
  - [ ] Inyectar PrismaService
  - [ ] Validar autenticación
  - [ ] Ejecutar todas las 17 validaciones EN ORDEN
  - [ ] Iniciar transacción
    - [ ] Crear StudentAttendance (1 por estudiante)
    - [ ] Crear StudentClassAttendance (N por schedules)
    - [ ] Recalcular StudentAttendanceReport
  - [ ] Si error → rollback automático
  - [ ] Retornar resultado con lista de creados

- [ ] **Método:** `updateAttendance(attendanceId: number, dto: UpdateAttendanceDto, user: UserContext)`
  - [ ] Validar existencia de StudentAttendance
  - [ ] Validar permisos (canModify)
  - [ ] Validar changeReason OBLIGATORIO
  - [ ] Iniciar transacción
    - [ ] Crear StudentAttendanceChange (auditoría)
    - [ ] Actualizar StudentAttendance
    - [ ] Actualizar StudentClassAttendance
    - [ ] Recalcular StudentAttendanceReport
  - [ ] Retornar resultado con cambios

- [ ] **Método:** `getStudentAttendance(enrollmentId: number)`
  - [ ] Buscar todos los StudentAttendance
  - [ ] Incluir changeHistory (auditoría)
  - [ ] Incluir classAttendances (por curso)
  - [ ] Retornar paginado

- [ ] **Método:** `calculateMinutesLate(arrivalTime: string, lateThresholdTime: string, markAsTardyAfterMinutes: number): number`
  - [ ] Comparar horas
  - [ ] Calcular minutos de retraso
  - [ ] Si > markAsTardyAfterMinutes → retornar minutos
  - [ ] Si no → retornar 0

- [ ] **Método:** `recalculateAttendanceReport(enrollmentId: number, courseId?: number)`
  - [ ] Contar presentes, ausentes, justificados
  - [ ] Calcular percentaje
  - [ ] Determinar isAtRisk (< 80%)
  - [ ] Crear o actualizar StudentAttendanceReport

### FASE 4: CREAR CONTROLADOR

- [ ] **Archivo:** `src/modules/attendance/attendance.controller.ts`

- [ ] **Endpoint POST:** `/api/attendance/register`
  - [ ] @Permissions('attendance', 'create')
  - [ ] @Body(new ZodValidationPipe) dto: BulkTeacherAttendanceDto
  - [ ] Extraer user de request
  - [ ] Llamar service.createTeacherAttendance(dto, user)
  - [ ] Retornar 201 Created

- [ ] **Endpoint PATCH:** `/api/attendance/:id`
  - [ ] @Permissions('attendance', 'modify')
  - [ ] @Param('id') id: number
  - [ ] @Body(new ZodValidationPipe) dto: UpdateAttendanceDto
  - [ ] Extraer user de request
  - [ ] Llamar service.updateAttendance(id, dto, user)
  - [ ] Retornar 200 OK

- [ ] **Endpoint GET:** `/api/attendance/enrollment/:enrollmentId`
  - [ ] @Permissions('attendance', 'view')
  - [ ] Llamar service.getStudentAttendance(enrollmentId)
  - [ ] Retornar 200 OK con paginación

### FASE 5: CREAR MÓDULO

- [ ] **Archivo:** `src/modules/attendance/attendance.module.ts`
  - [ ] Importar PrismaService
  - [ ] Importar PrismaModule
  - [ ] Registrar AttendanceService
  - [ ] Registrar AttendanceValidationService
  - [ ] Registrar AttendanceController

### FASE 6: PRUEBAS UNITARIAS

- [ ] **Archivo:** `src/modules/attendance/services/attendance-validation.service.spec.ts`
  - [ ] Test validateUser success
  - [ ] Test validateUser no existe
  - [ ] Test validateDateAndCycle fecha futura
  - [ ] Test validateDateAndCycle ciclo inactivo
  - [ ] Test validateHoliday no recuperado
  - [ ] Test validateAcademicWeek BREAK
  - [ ] Test validateTeacherAbsence activa

- [ ] **Archivo:** `src/modules/attendance/services/attendance.service.spec.ts`
  - [ ] Test createTeacherAttendance exitoso
  - [ ] Test createTeacherAttendance sin permisos
  - [ ] Test updateAttendance exitoso
  - [ ] Test updateAttendance sin changeReason

- [ ] **Archivo:** `src/modules/attendance/attendance.controller.spec.ts`
  - [ ] Test POST /api/attendance/register 201
  - [ ] Test PATCH /api/attendance/:id 200
  - [ ] Test GET /api/attendance/enrollment/:id 200

### FASE 7: E2E TESTS

- [ ] **Archivo:** `test/attendance.e2e-spec.ts`

- [ ] **Suite:** Maestro registra asistencia
  - [ ] Test caso exitoso (201)
  - [ ] Test fecha futura (400)
  - [ ] Test día feriado (400)
  - [ ] Test semana BREAK (400)
  - [ ] Test sin permisos (403)
  - [ ] Test sección no permitida (403)
  - [ ] Test maestro en ausencia (400)

- [ ] **Suite:** Secretaria edita asistencia
  - [ ] Test editar exitoso (200)
  - [ ] Test sin changeReason (400)
  - [ ] Test sin permisos (403)
  - [ ] Test auditoría creada

- [ ] **Suite:** Consultar asistencia
  - [ ] Test GET /api/attendance/enrollment/:id (200)
  - [ ] Test paginación
  - [ ] Test historial de cambios

### FASE 8: CREAR ÍNDICES EN BD

- [ ] Ejecutar migración Prisma para índices
  - [ ] idx_school_cycles_active_dates
  - [ ] idx_bimesters_cycle_active
  - [ ] idx_holidays_bimester_date
  - [ ] idx_academic_weeks_date_range
  - [ ] idx_schedules_teacher_day
  - [ ] idx_enrollments_section_cycle_status
  - [ ] idx_teacher_absences_date_range
  - [ ] idx_role_attendance_perms

### FASE 9: DOCUMENTACIÓN

- [ ] Comentarios JSDoc en todos los métodos
- [ ] README en `src/modules/attendance/README.md`
- [ ] Documentación de errores
- [ ] Ejemplos de requests/responses

### FASE 10: VALIDACIÓN Y TESTING

- [ ] ✅ npm run build (sin errores)
- [ ] ✅ npm test (todas las pruebas pasen)
- [ ] ✅ npm run test:e2e (flujos completos)
- [ ] ✅ Verificar índices en BD
- [ ] ✅ Verificar transacciones atómicas
- [ ] ✅ Verificar auditoría completa
- [ ] ✅ Performance tests (queries lentas)

---

## 📝 NOTAS IMPORTANTES

### Seguridad
- ✅ NUNCA confiar en datos del cliente
- ✅ SIEMPRE validar permisos en servidor
- ✅ NUNCA permitir bypass de scope
- ✅ SIEMPRE registrar cambios (auditoría)

### Performance
- ✅ Usar índices en queries frecuentes
- ✅ Usar transacciones para atomicidad
- ✅ Usar lazy loading cuando sea apropiado
- ✅ Cachear AttendanceConfig (poco cambia)

### Mantenibilidad
- ✅ Separar validaciones del negocio
- ✅ DTOs con Zod para type safety
- ✅ Comentarios claros en lógica compleja
- ✅ Pruebas para cada caso de uso

---

**Documento finalizado:** Noviembre 13, 2025  
**Estado:** Listo para implementación  
**Próximo paso:** Iniciar FASE 1 - Crear DTOs y Schemas
