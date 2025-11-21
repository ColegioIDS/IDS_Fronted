# 🚀 QUICK START - Frontend Developer

**Leer en 10 minutos. Todo lo que necesitas para empezar.**

---

## ¿QUÉ TIENES?

✅ **Backend 100% funcional** con 20 endpoints  
✅ **Documentación de API** completa con ejemplos  
✅ **OpenAPI spec** para importar a Postman  

---

## PASO 1: Configura Postman (5 mins)

### 1.1 Importa la colección
```
Postman → Collections → + New → Import
Selecciona: attendance-api-openapi.json
```

### 1.2 Configura variables
```
Postman → Environments → New
Crea variables:
- baseUrl = http://localhost:3000
- token = <tu_jwt_aqui>
```

### 1.3 Prueba un endpoint
```bash
GET {{baseUrl}}/api/attendance/cycle/active
Authorization: Bearer {{token}}
```

**Deberías obtener:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "2025 - Ciclo Activo",
    ...
  }
}
```

✅ Si funciona, el backend está bien.

---

## PASO 2: Entiende los 4 TABs

### TAB 1: Registro Diario (Masivo)
```
Maestro llega → Selecciona fecha/sección → Marca todos los estudiantes
Endpoint principal: POST /api/attendance/daily-registration
```

### TAB 2: Gestión por Curso (Individual)
```
Admin ve: Asistencia de UN curso → Puede editar registros
Endpoints: GET /course/{id}/date/{date}, PATCH /class/{id}
```

### TAB 3: Reportes (Análisis)
```
Director/Admin ve: % asistencia de estudiante → Identifica riesgo
Endpoint principal: GET /api/attendance/report/{enrollmentId}
```

### TAB 4: Consulta de Validaciones (Previo a Registro)
```
Sistema valida antes de registrar:
¿Es bimestre activo? ¿Es feriado? ¿Es semana BREAK? etc.
Endpoints: 8 GET de validación (Hook 1-8)
```

---

## PASO 3: Flujo Completo TAB 1 (El principal)

### Orden de llamadas:

**1️⃣ Hook 1: Validar bimestre**
```
GET /api/attendance/bimester/by-date?cycleId=1&date=2025-11-20
Respuesta: { success: true, data: { id: 1, name: "Bimestre 1" } }
```

**2️⃣ Hook 2: Validar feriado**
```
GET /api/attendance/holiday/by-date?bimesterId=1&date=2025-11-20
Respuesta: { success: true, data: null } (No es feriado)
```

**3️⃣ Hook 3: Validar semana (¿BREAK?)**
```
GET /api/attendance/week/by-date?bimesterId=1&date=2025-11-20
Respuesta: { success: true, data: { id: 1, weekType: "REGULAR" } }
```

**4️⃣ Hook 5: Validar ausencia del maestro**
```
GET /api/attendance/teacher-absence/2?date=2025-11-20
Respuesta: { success: true, data: null } (No está en ausencia)
```

**5️⃣ Hook 6: Obtener config**
```
GET /api/attendance/config/active
Respuesta: { success: true, data: { riskThreshold: 80.0, ... } }
```

**6️⃣ Obtener estado actual**
```
GET /api/attendance/daily-registration/5/2025-11-20
Respuesta: { students: [ 
  { enrollmentId: 1, isRegistered: false, ... },
  { enrollmentId: 2, isRegistered: true, ... }
] }
```

**7️⃣ Registrar a todos**
```
POST /api/attendance/daily-registration
{
  "date": "2025-11-20",
  "sectionId": 5,
  "enrollmentStatuses": {
    "1": 1,   // Juan → Presente
    "2": 1,   // María → Presente
    "3": 2,   // Carlos → Ausente
    ...
  }
}
Respuesta: { success: true, message: "Registrado para 30 estudiantes" }
```

**8️⃣ Confirmar registro**
```
GET /api/attendance/daily-registration/5/2025-11-20
Respuesta: { registeredStudents: 30, pendingStudents: 0 }
```

---

## PASO 4: Campos Clave que Debes Saber

### Auditoría (Muy importante)
```json
{
  "originalStatus": "PRESENT",        // Lo que registró el maestro (NUNCA cambia)
  "status": "ABSENT",                 // Estado actual (puede cambiar)
  "recordedBy": 2,                    // Quién lo registró
  "recordedAt": "2025-11-20T09:15Z",  // Cuándo
  "lastModifiedBy": 5,                // Quién lo cambió
  "lastModifiedAt": "2025-11-20T14:30Z", // Cuándo se cambió
  "modificationReason": "Se fue temprano" // Por qué se cambió
}
```

### Salida Temprana (Nuevo)
```json
{
  "arrivalTime": "08:45",             // Hora de llegada
  "minutesLate": 15,                  // Calculado automáticamente
  "isEarlyExit": true,                // ¿Se fue temprano?
  "departureTime": "10:30",           // Hora exacta de salida
  "exitReason": "Cita médica"         // Motivo
}
```

### Estado Consolidado (Para UI)
```json
{
  "consolidatedStatus": "MIXED",      // Si tiene varios estados en cursos diferentes
  "statusBreakdown": {                // Desglose por status
    "PRESENT": 2,
    "ABSENT": 1,
    "TARDY": 0
  }
}
```

---

## PASO 5: Estructura de Componentes Recomendada

```tsx
// src/pages/Attendance.tsx
├── <AttendanceLayout>
│   ├── <Tabs>
│   │   ├── TAB 1: <DailyRegistration>
│   │   │   ├── <ValidationHooks>  // Calls hooks 1-8
│   │   │   ├── <StudentGrid>      // Seleccionar status
│   │   │   └── <RegistrationSummary>
│   │   │
│   │   ├── TAB 2: <CourseManagement>
│   │   │   ├── <CourseSelector>
│   │   │   ├── <EditableGrid>     // PATCH /class/:id
│   │   │   └── <BulkUpdate>       // PATCH /bulk-update
│   │   │
│   │   ├── TAB 3: <AttendanceReports>
│   │   │   ├── <StudentSelector>
│   │   │   ├── <ReportCard>       // GET /report/:id
│   │   │   └── <AttendanceChart>
│   │   │
│   │   └── TAB 4: <ValidationInfo>
│   │       ├── <BimesterStatus>   // Hook 1
│   │       ├── <HolidayStatus>    // Hook 2
│   │       ├── <WeekStatus>       // Hook 3
│   │       └── ... (más hooks)
│   │
│   └── <PermissionGate> // Bloquear si no tiene permisos
```

---

## PASO 6: Errores Más Comunes

### Error 1: "Tu rol no tiene permiso"
```json
{
  "success": false,
  "error": "FORBIDDEN",
  "message": "Tu rol no tiene permiso para registrar estado \"Ausente Justificado\""
}
```
**Causa:** El rol del usuario no tiene `canCreate` para ese status  
**Solución:** Usar solo los estados de `GET /status/allowed/role/{roleId}`

### Error 2: "No hay bimestre para esa fecha"
```json
{
  "success": false,
  "error": "BIMESTER_NOT_FOUND"
}
```
**Causa:** Fecha fuera del rango de bimestres  
**Solución:** Mostrar mensaje al usuario, bloquear registro

### Error 3: "Es feriado y NO está recuperado"
```json
{
  "success": false,
  "error": "HOLIDAY_NOT_RECOVERED"
}
```
**Causa:** Intentar registrar en feriado no recuperado  
**Solución:** Bloquear entrada en TAB 1, mostrar cuál es el feriado

### Error 4: "Semana de descanso"
```json
{
  "success": false,
  "error": "BREAK_WEEK"
}
```
**Causa:** La semana tiene `weekType: "BREAK"`  
**Solución:** Mostrar mensaje, esperar a semana regular

### Error 5: "Maestro está de ausencia"
```json
{
  "success": false,
  "error": "TEACHER_ON_LEAVE"
}
```
**Causa:** El maestro tiene TeacherAbsence aprobada  
**Solución:** No permitir que registre, sugerir otro maestro

---

## PASO 7: Mejores Prácticas

### ✅ HACER
```typescript
// 1. Validar TODOS los hooks antes de registrar
await validateBimester();
await validateHoliday();
await validateWeek();
// ... etc

// 2. Mostrar loading durante requests
setLoading(true);
try {
  await registerDaily(data);
} finally {
  setLoading(false);
}

// 3. Mostrar errores al usuario
if (error.message) {
  showNotification(error.message, 'error');
}

// 4. Preservar estado original en UI
<span className={getColorByStatus(originalStatus)}>
  {originalStatus}
</span>

// 5. Recalcular reportes tras cambios
await refetchReport(enrollmentId);
```

### ❌ NO HACER
```typescript
// 1. No saltarse validaciones
POST /daily-registration  // Sin validar hooks antes

// 2. No confundir originalStatus con status
if (status === 'PRESENT')  // ← Podría haber cambiado
if (originalStatus === 'PRESENT')  // ✅ Correcto

// 3. No olvidar modificationReason en ediciones
PATCH /class/123 { "attendanceStatusId": 2 }  // ← Falta reason

// 4. No hacer cambios sin auditoría
// Siempre registrar por qué cambiaste

// 5. No ignorar errores de permisos
// Mostrar claramente qué estado no puede usar
```

---

## PASO 8: Variables de Estado Recomendadas

```typescript
// Selecciones
const [date, setDate] = useState<string>('2025-11-20');
const [sectionId, setSectionId] = useState<number>(5);
const [courseId, setCourseId] = useState<number>(12);
const [studentId, setStudentId] = useState<number>(1);

// Datos de API
const [students, setStudents] = useState([]);
const [attendances, setAttendances] = useState([]);
const [report, setReport] = useState(null);
const [validations, setValidations] = useState({
  bimester: null,
  holiday: null,
  week: null,
  teacherAbsence: null,
  config: null
});

// UI
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [selectedTab, setSelectedTab] = useState('tab1');

// Forma
const [enrollmentStatuses, setEnrollmentStatuses] = useState({});
```

---

## PASO 9: Servicios/API Client

```typescript
// src/services/attendance.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/attendance',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

export const attendanceService = {
  // Validaciones
  getBimester: (cycleId: number, date: string) =>
    api.get(`/bimester/by-date?cycleId=${cycleId}&date=${date}`),
  
  getHoliday: (bimesterId: number, date: string) =>
    api.get(`/holiday/by-date?bimesterId=${bimesterId}&date=${date}`),
  
  getWeek: (bimesterId: number, date: string) =>
    api.get(`/week/by-date?bimesterId=${bimesterId}&date=${date}`),
  
  // TAB 1
  registerDaily: (data) =>
    api.post(`/daily-registration`, data),
  
  getDailyStatus: (sectionId: number, date: string) =>
    api.get(`/daily-registration/${sectionId}/${date}`),
  
  // TAB 2
  getSectionAttendance: (sectionId: number, cycleId: number, date: string) =>
    api.get(`/section/${sectionId}/cycle/${cycleId}/date/${date}`),
  
  updateClassAttendance: (classAttendanceId: number, data) =>
    api.patch(`/class/${classAttendanceId}`, data),
  
  // TAB 3
  getReport: (enrollmentId: number) =>
    api.get(`/report/${enrollmentId}`),
};
```

---

## PASO 10: Empezar HOY

**Orden recomendado:**
1. ✅ Lee este archivo (ya hecho)
2. ✅ Abre `API_ENDPOINTS_DOCUMENTATION.md` en otra ventana
3. ✅ Importa OpenAPI spec a Postman
4. ✅ Prueba 3 endpoints en Postman:
   - GET /cycle/active
   - GET /bimester/by-date
   - GET /daily-registration/5/2025-11-20
5. ✅ Crea estructura React
6. ✅ Conecta TAB 1 primero
7. ✅ Luego TAB 2, 3, 4

---

## 📞 PREGUNTAS?

- **¿Qué es `originalStatus`?** → Auditoría, nunca cambia
- **¿Qué es `consolidatedStatus`?** → Estado actual, puede cambiar
- **¿Cómo manejar salida temprana?** → Usa `isEarlyExit`, `departureTime`, `exitReason`
- **¿Dónde ver todos los campos?** → `API_ENDPOINTS_DOCUMENTATION.md`
- **¿Cómo testear sin maestro?** → Usa `GET /status/allowed/role/{roleId}` para ver qué puedes hacer

---

**¡Buena suerte! Tarda ~5 horas la TAB 1 si sigues este flujo.**

Listo Nov 20, 2025
