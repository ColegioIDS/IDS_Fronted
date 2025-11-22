# 📊 GitHub Projects - Sistema de Asistencia

**Usar en:** GitHub -> Projects -> New Project (Beta) -> Choose a template -> Custom

---

## 📋 ESTRUCTURA DE PROYECTO

```
ATTENDANCE SYSTEM - FULL STACK DEVELOPMENT

Status: IN PROGRESS
Owner: @your-team
Created: Nov 20, 2025
Target Completion: Dec 31, 2025
```

---

## 🗂️ COLUMNAS EN EL PROYECTO

1. **📝 Backlog** - Tareas por hacer
2. **🔄 In Progress** - En desarrollo actualmente
3. **👀 In Review** - Esperando review
4. **✅ Done** - Completado y testeado
5. **🚨 Blocked** - Bloqueado, requiere ayuda

---

## 📋 FASES Y TAREAS

### FASE 1: ✅ BACKEND ATTENDANCE CORE

**Status:** DONE  
**Completion:** 100%

```
Tickets:
├── ✅ Schema Prisma completo
│   ├── ✅ StudentClassAttendance con campos de salida temprana
│   ├── ✅ StudentAttendanceReport con calculationSnapshot
│   └── ✅ RoleAttendancePermission integrado
│
├── ✅ Service - 10 métodos implementados
│   ├── ✅ createSingleAttendance()
│   ├── ✅ updateSingleClassAttendance()
│   ├── ✅ bulkUpdateAttendance()
│   ├── ✅ registerDailyAttendance()
│   ├── ✅ getDailyRegistrationStatus()
│   ├── ✅ getSectionAttendanceByDate()
│   ├── ✅ getAttendanceByDate()
│   ├── ✅ getStudentAttendance()
│   ├── ✅ getAttendanceReport()
│   └── ✅ recalculateReports()
│
├── ✅ Controller - 20 endpoints
│   ├── ✅ POST /single
│   ├── ✅ PATCH /class/:id
│   ├── ✅ PATCH /bulk-update
│   ├── ✅ POST /daily-registration
│   ├── ✅ GET /daily-registration/:sectionId/:date
│   ├── ✅ GET /section/:sectionId/cycle/:cycleId/date/:date
│   ├── ✅ GET /course/:courseAssignmentId/date/:date
│   ├── ✅ GET /enrollment/:enrollmentId
│   ├── ✅ GET /report/:enrollmentId
│   ├── ✅ GET /cycle/active
│   ├── ✅ GET /bimester/by-date
│   ├── ✅ GET /holiday/by-date
│   ├── ✅ GET /week/by-date
│   ├── ✅ GET /teacher-absence/:teacherId
│   ├── ✅ GET /config/active
│   ├── ✅ GET /status/allowed/role/:roleId
│   └── ✅ 4 más endpoints de datos generales
│
├── ✅ DTOs y Validación
│   ├── ✅ SingleAttendanceDto con Zod
│   ├── ✅ UpdateSingleClassAttendanceDto con Zod
│   ├── ✅ BulkUpdateAttendanceDto con Zod
│   ├── ✅ RegisterDailyAttendanceDto con Zod
│   └── ✅ Validaciones en todos los endpoints
│
├── ✅ Auditoría y Seguridad
│   ├── ✅ RoleAttendancePermission.canCreate validado
│   ├── ✅ Campos de auditoría (recordedBy, lastModifiedBy)
│   ├── ✅ Snapshot de cálculo en reportes
│   └── ✅ Preservación de estado original (immutable)
│
└── ✅ Características
    ├── ✅ Cálculo automático de minutesLate
    ├── ✅ Salida temprana soportada (departureTime, isEarlyExit)
    ├── ✅ statusBreakdown con desglose
    ├── ✅ Recalculación automática de reportes
    ├── ✅ Deduplicación en cálculos
    └── ✅ Transacciones atómicas
```

---

### FASE 2: 🔄 DOCUMENTACIÓN API

**Status:** IN PROGRESS  
**Completion:** 70%  
**Owner:** @you  
**Due:** Nov 25, 2025

```
Tickets:
├── ✅ OpenAPI/Swagger spec generado
│   └── Archivo: attendance-api-openapi.json
│
├── ✅ MD de todos los endpoints
│   ├── CREACIÓN - Registrar
│   ├── MODIFICACIÓN - Actualizar
│   ├── CONSULTA - Obtener
│   ├── REPORTES - Análisis
│   └── VALIDACIONES - Hooks
│
├── 🔄 Swagger setup en NestJS (IN PROGRESS)
│   ├── [ ] npm install @nestjs/swagger swagger-ui-express
│   ├── [ ] Configurar DocumentBuilder en main.ts
│   ├── [ ] Agregar decoradores @ApiOperation en endpoints
│   └── [ ] Verificar en http://localhost:3000/api-docs
│
├── [ ] Postman collection
│   ├── [ ] Crear variables de entorno ({{token}}, {{baseUrl}})
│   ├── [ ] Tests de validación en cada endpoint
│   └── [ ] Pre-request scripts para auth
│
├── [ ] Casos de uso documentados
│   ├── [ ] TAB 1: Registro diario masivo
│   ├── [ ] TAB 2: Gestión por curso
│   ├── [ ] TAB 3: Reportes y análisis
│   └── [ ] TAB 4: Validaciones
│
└── [ ] Video tutorial (Opcional)
    ├── [ ] Demostración de flujo completo
    └── [ ] Explicación de validaciones
```

---

### FASE 3: ⬜ FRONTEND

**Status:** NOT STARTED  
**Completion:** 0%  
**Owner:** @frontend-team  
**Due:** Dec 15, 2025

```
Tickets:
├── [ ] Configuración del proyecto React
│   ├── [ ] Create React App / Vite
│   ├── [ ] Instalar dependencias (axios, zustand, tailwind)
│   └── [ ] Estructura de carpetas
│
├── [ ] Autenticación
│   ├── [ ] Login page
│   ├── [ ] JWT token management
│   └── [ ] Session persistence
│
├── [ ] TAB 1: Registro Diario
│   ├── [ ] Validaciones previas (Hook 1-8)
│   ├── [ ] Selector de fecha/sección
│   ├── [ ] Grilla con lista de estudiantes
│   ├── [ ] Selector de status (Presente/Ausente/Tardío)
│   ├── [ ] Barra de progreso (X/30 registrados)
│   ├── [ ] Botón "Registrar Todos"
│   ├── [ ] Confirmación de registro
│   └── [ ] Visualización de resumen
│
├── [ ] TAB 2: Gestión por Curso
│   ├── [ ] Selector de curso y fecha
│   ├── [ ] Grilla editable de asistencia
│   ├── [ ] Columnas: Nombre, Status Original, Status Actual, Hora Llegada, Salida
│   ├── [ ] Edición inline de status
│   ├── [ ] Modal para cambiar motivo
│   ├── [ ] Botón "Guardar Cambios"
│   ├── [ ] Bulk update de registros
│   └── [ ] Historial de modificaciones
│
├── [ ] TAB 3: Reportes
│   ├── [ ] Selector de estudiante/fecha
│   ├── [ ] Tarjeta de resumen
│   │   ├── Nombre del estudiante
│   │   ├── % Asistencia (verde si >80%, rojo si ≤80%)
│   │   ├── Conteos (Presente/Ausente/Justificado)
│   │   └── Status de riesgo
│   ├── [ ] Gráfico de asistencia (pie chart)
│   ├── [ ] Tabla de historial de asistencias
│   └── [ ] Exportar a PDF
│
├── [ ] TAB 4: Validaciones (Consulta)
│   ├── [ ] Selector de fecha
│   ├── [ ] Mostrar validaciones activas
│   ├── [ ] Indicadores de:
│   │   ├── Bimestre activo
│   │   ├── ¿Es feriado?
│   │   ├── ¿Es semana de descanso?
│   │   ├── ¿Maestro está en ausencia?
│   │   └── Estados permitidos por rol
│   └── [ ] Mensajes de bloqueo
│
└── [ ] UI/UX General
    ├── [ ] Diseño responsive
    ├── [ ] Tema de colores (brand guidelines)
    ├── [ ] Loading states
    ├── [ ] Error handling y mensajes
    ├── [ ] Success notifications
    └── [ ] Dark mode (opcional)
```

---

### FASE 4: 🚨 TESTING

**Status:** WAITING  
**Completion:** 0%  
**Owner:** @qa-team  
**Due:** Dec 28, 2025  
**Blocked by:** Frontend completado

```
Tickets:
├── [ ] Unit Tests - Backend
│   ├── [ ] createSingleAttendance()
│   ├── [ ] updateSingleClassAttendance()
│   ├── [ ] bulkUpdateAttendance()
│   ├── [ ] registerDailyAttendance()
│   ├── [ ] getDailyRegistrationStatus()
│   ├── [ ] Validaciones de permisos
│   ├── [ ] Cálculo de minutesLate
│   └── [ ] recalculateReports()
│
├── [ ] Integration Tests
│   ├── [ ] Flujo completo: Validaciones → Registro → Reporte
│   ├── [ ] Transacciones atómicas
│   ├── [ ] Deduplicación de recálculos
│   ├── [ ] Manejo de errores
│   └── [ ] Permisos y seguridad
│
├── [ ] E2E Tests - Frontend
│   ├── [ ] Login → TAB 1 → Registro diario
│   ├── [ ] TAB 2 → Modificar registro
│   ├── [ ] TAB 3 → Ver reportes
│   ├── [ ] Validaciones bloqueadoras
│   └── [ ] Errores y recuperación
│
├── [ ] Performance Tests
│   ├── [ ] Bulk update con 1000+ registros
│   ├── [ ] Recalculación de reportes
│   └── [ ] Queries de historial con offset
│
├── [ ] Manual Testing Checklist
│   ├── [ ] Crear 5+ casos de prueba
│   ├── [ ] Probar en navegadores diferentes
│   ├── [ ] Probar en mobile
│   ├── [ ] Validar datos en BD
│   └── [ ] Documentar bugs encontrados
│
└── [ ] Staging Deployment
    ├── [ ] Deploy a servidor staging
    ├── [ ] Verificar todas las validaciones
    ├── [ ] Load testing
    └── [ ] Rollback plan
```

---

## 📅 TIMELINE

```
Nov 20 - Nov 25: Documentación API + Setup Swagger
Nov 25 - Dec 10: Frontend desarrollo (TAB 1, 2, 3, 4)
Dec 10 - Dec 20: Testing y fixes
Dec 20 - Dec 25: Performance & Security Review
Dec 25 - Dec 31: Deployment a producción
```

---

## 🎯 MILESTONES

| Milestone | Due Date | Status |
|-----------|----------|--------|
| Backend 100% | ✅ Nov 20 | DONE |
| API Documentation | Nov 25 | IN PROGRESS |
| Frontend TABs 1-2 | Dec 5 | NOT STARTED |
| Full Testing | Dec 20 | WAITING |
| Production Ready | Dec 31 | WAITING |

---

## 🔗 ENLACE A DOCUMENTACIÓN

- **API Endpoints:** `API_ENDPOINTS_DOCUMENTATION.md`
- **OpenAPI Spec:** `attendance-api-openapi.json` (importar a Postman)
- **Backend Code:** `/src/modules/attendance/`
- **Schema:** `/prisma/schema.prisma`

---

## 👥 EQUIPO

| Rol | Persona | Contacto |
|-----|---------|----------|
| Backend | @you | alexander@company.com |
| Frontend | @frontend-dev | dev@company.com |
| QA | @qa-engineer | qa@company.com |
| Project Manager | @pm | pm@company.com |

---

## 📝 NOTAS IMPORTANTES

### Para Frontend Developers:
1. **Lee primero:** `API_ENDPOINTS_DOCUMENTATION.md`
2. **Importa:** `attendance-api-openapi.json` a Postman
3. **Usa:** Los "Hooks" en el orden especificado (1 → 2 → 3 → ... → 8)
4. **Verifica:** Los campos de auditoría (`originalStatus`, `lastModifiedBy`, etc.)
5. **Cuidado:** Los campos de salida temprana (`isEarlyExit`, `departureTime`, `exitReason`)

### Para QA:
1. **Test cases:** Creados basados en "VALIDACIONES REQUERIDAS" del MD
2. **Casos críticos:**
   - Usuario sin permiso intenta crear status no permitido
   - Registro duplicado en la misma fecha
   - Salida temprana registrada correctamente
   - Recalculación de reportes tras modificación

### Para Backend (Si necesitas cambios):
1. **Cambios en schema.prisma:** Crear migración con `npx prisma migrate dev`
2. **Cambios en service:** Actualizar tests correspondientes
3. **Cambios en endpoints:** Actualizar OpenAPI spec
4. **Cambios en DTOs:** Validar con Zod schemas

---

## 📞 CONTATO & ESCALATIONS

- **Bug crítico:** Crear issue con label `critical`
- **Bloqueo:** Mover a columna `🚨 Blocked` + comentar razón
- **Preguntas:** Crear discussion en el repo
- **Design Review:** Mencionar en PR

---

Generado: Nov 20, 2025  
Última actualización: Nov 20, 2025
