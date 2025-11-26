# 📅 Plan de Trabajo - Attendance Reports

## Fase 1: Fundación (✅ COMPLETADO)

### Sprint 1.1: Diseño y Arquitectura
- [x] Análisis de requerimientos
- [x] Diseño de endpoints section-specific
- [x] Definición de DTOs y validaciones con Zod
- [x] Diseño de respuestas estructuradas

**Deliverables:**
- `dto/attendance-report-filters.dto.ts` - Validaciones con Zod
- `dto/attendance-report-responses.dto.ts` - Tipos de respuesta

### Sprint 1.2: Capa de Persistencia
- [x] Implementación de repository
- [x] Queries Prisma optimizadas
- [x] Métodos de obtención de datos por sección
- [x] Relaciones con CourseAssignment y StudentClassAttendance

**Deliverables:**
- `repositories/attendance-reports.repository.ts` - Data access layer

### Sprint 1.3: Capa de Negocio
- [x] Implementación de servicio
- [x] Métodos de validación de sección/curso
- [x] Lógica de cálculo de estadísticas
- [x] Manejo de errores

**Deliverables:**
- `services/attendance-reports.service.ts` - Business logic

### Sprint 1.4: Capa de Presentación
- [x] Implementación de 5 endpoints
- [x] Documentación Swagger
- [x] Guardias de autenticación y permisos
- [x] Manejo de excepciones

**Deliverables:**
- `attendance-reports.controller.ts` - HTTP layer

### Sprint 1.5: Integración e Integración
- [x] Módulo NestJS configurado
- [x] Importación en `app.module.ts`
- [x] Compilación sin errores
- [x] Exportaciones correctas

**Deliverables:**
- `attendance-reports.module.ts` - Module configuration

---

## Fase 2: Implementación de Lógica (⏳ EN PROGRESO)

### Sprint 2.1: Estadísticas de Sección (Semana 1-2)
**Objetivo:** Completar el método `getSectionSummaryReport()`

**Tareas:**
- [ ] Obtener datos de estudiantes de sección
- [ ] Calcular distribución de estados (Presente/Ausente/Justificado)
- [ ] Calcular porcentajes de asistencia
- [ ] Clasificar estudiantes por riesgo (LOW/MEDIUM/HIGH)
- [ ] Retornar respuesta estructurada

**Dependencias:** Repository (✅ lista)

**Entrada:**
```typescript
{
  sectionId: number,
  courseId?: number,
  bimesterId?: number,
  academicWeekId?: number,
  enrollmentStatus?: 'ACTIVE' | 'INACTIVE'
}
```

**Salida:**
```typescript
{
  success: true,
  data: {
    section: { /* datos sección */ },
    statusBreakdown: [ /* desglose de estados */ ],
    riskBreakdown: [ /* desglose de riesgo */ ],
    filters: { /* filtros aplicados */ }
  }
}
```

**Checklist:**
- [ ] Consulta de estudiantes de sección
- [ ] Lectura de registros de asistencia
- [ ] Cálculo de totales (presente/ausente/justificado)
- [ ] Cálculo de porcentajes
- [ ] Clasificación de riesgo por porcentaje ausencias
- [ ] Validación de respuesta contra DTO
- [ ] Testing unitario

---

### Sprint 2.2: Reporte Detallado (Semana 2-3)
**Objetivo:** Completar el método `getSectionDetailedReport()`

**Tareas:**
- [ ] Obtener lista completa de estudiantes
- [ ] Calcular estadísticas individuales por estudiante
- [ ] Opcionalmente incluir registro de cada clase
- [ ] Aplicar filtros opcionales (bimestre, semana, etc.)
- [ ] Paginación si es necesario
- [ ] Retornar respuesta con nivel de detalle

**Dependencias:** Sprint 2.1

**Entrada:**
```typescript
{
  sectionId: number,
  courseId?: number,
  bimesterId?: number,
  academicWeekId?: number,
  enrollmentStatus?: 'ACTIVE' | 'INACTIVE',
  includeClasses?: boolean
}
```

**Salida:**
```typescript
{
  success: true,
  data: {
    section: { /* datos sección */ },
    students: [
      {
        enrollmentId, studentId, studentCode, firstName, lastName,
        codeSIRE, totalClasses, totalPresent, totalAbsent,
        attendancePercentage, riskLevel,
        classes?: [ /* si includeClasses=true */ ]
      }
    ],
    filters: { /* filtros aplicados */ }
  }
}
```

---

### Sprint 2.3: Reporte por Curso (Semana 3)
**Objetivo:** Completar el método `getSectionByCourseReport()`

**Tareas:**
- [ ] Validar que curso esté en sección
- [ ] Obtener datos específicos del curso
- [ ] Calcular estadísticas del curso
- [ ] Listar estudiantes con asistencia en ese curso
- [ ] Desglose de estados para el curso
- [ ] Retornar respuesta enfocada en curso

**Dependencias:** Sprint 2.1

**Entrada:**
```typescript
{
  sectionId: number,
  courseId: number,
  bimesterId?: number,
  academicWeekId?: number,
  enrollmentStatus?: 'ACTIVE' | 'INACTIVE'
}
```

**Salida:**
```typescript
{
  success: true,
  data: {
    section: { /* datos sección */ },
    course: {
      courseId, courseName, courseCode, courseArea, courseColor,
      totalStudents, totalClasses, averageAttendance,
      statusBreakdown: [ /* desglose */ ],
      students: [ /* estudiantes del curso */ ]
    },
    filters: { /* filtros aplicados */ }
  }
}
```

---

### Sprint 2.4: Estudiantes en Riesgo (Semana 4)
**Objetivo:** Completar el método `getSectionAtRiskStudents()`

**Tareas:**
- [ ] Obtener estudiantes con porcentaje de ausencia > umbral
- [ ] Clasificar por nivel de riesgo
- [ ] Calcular score de riesgo
- [ ] Determinar prioridad de intervención
- [ ] Incluir historial de ausencias recientes
- [ ] Implementar paginación
- [ ] Retornar respuesta ordenada por prioridad

**Dependencias:** Sprint 2.1, Sprint 2.2

**Entrada:**
```typescript
{
  sectionId: number,
  minimumAbsencePercentage?: number (default: 75),
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH',
  page?: number (default: 1),
  limit?: number (default: 20)
}
```

**Salida:**
```typescript
{
  success: true,
  data: {
    section: { /* datos sección */ },
    students: [
      {
        enrollmentId, studentId, studentCode, firstName, lastName,
        attendancePercentage, riskLevel, riskScore,
        interventionPriority,
        guardianEmail, guardianPhone,
        consecutiveAbsences,
        absenceHistory: [ { date, courseId, courseName, reason } ]
      }
    ],
    pagination: { page, limit, total, totalPages },
    filters: { /* filtros aplicados */ }
  }
}
```

---

### Sprint 2.5: Opciones de Filtros (Semana 4)
**Objetivo:** Completar el método `getSectionFilterOptions()`

**Tareas:**
- [ ] Obtener cursos activos de sección
- [ ] Obtener bimestres del ciclo académico
- [ ] Obtener semanas académicas
- [ ] Contar estudiantes por curso
- [ ] Retornar respuesta con selectores

**Dependencias:** Sprint 1.3

**Entrada:**
```typescript
{
  sectionId: number
}
```

**Salida:**
```typescript
{
  success: true,
  data: {
    section: { id, name, gradeName },
    courses: [
      { id, name, code, area, totalStudents, isActive }
    ],
    bimesters: [
      { id, name, number, startDate, endDate }
    ],
    academicWeeks: [
      { id, number, startDate, endDate }
    ]
  }
}
```

---

## Fase 3: Testing y Validación (⏳ PENDIENTE)

### Sprint 3.1: Testing Unitario (Semana 5)
**Objetivo:** 95% de cobertura en lógica de negocio

**Tareas:**
- [ ] Tests del servicio (5 métodos principales)
- [ ] Tests del repository (6 métodos de queries)
- [ ] Tests de validaciones de DTOs
- [ ] Tests de casos edge (datos vacíos, filtros inválidos, etc.)
- [ ] Cobertura de errores y excepciones

**Dependencias:** Fase 2

**Entregables:**
- `services/attendance-reports.service.spec.ts`
- `repositories/attendance-reports.repository.spec.ts`

---

### Sprint 3.2: Testing de Integración (Semana 5-6)
**Objetivo:** Verificar flujo end-to-end de cada endpoint

**Tareas:**
- [ ] Tests E2E para cada endpoint
- [ ] Validación de respuestas contra esquema
- [ ] Pruebas de paginación
- [ ] Pruebas de filtros combinados
- [ ] Pruebas de autenticación y permisos
- [ ] Pruebas de casos de error

**Dependencias:** Sprint 3.1

**Entregables:**
- `attendance-reports.e2e-spec.ts`

---

### Sprint 3.3: Testing de Rendimiento (Semana 6)
**Objetivo:** Optimizar queries y respuesta de endpoints

**Tareas:**
- [ ] Análisis de queries lentas
- [ ] Optimización de índices en Prisma
- [ ] Implementación de caching si es necesario
- [ ] Pruebas de carga (1000+ registros)
- [ ] Monitoreo de memoria
- [ ] Documentación de optimizaciones

**Dependencias:** Sprint 3.2

---

## Fase 4: Documentación Completa (⏳ PENDIENTE)

### Sprint 4.1: Documentación Técnica
**Tareas:**
- [ ] Swagger actualizado con ejemplos
- [ ] README del módulo
- [ ] Guía de arquitectura
- [x] Referencia completa de endpoints
- [ ] Diagramas de flujo

**Entregables:**
- `ENDPOINTS_REFERENCE.md` (✅ completado)
- `ARCHITECTURE.md`
- `TESTING_GUIDE.md`

---

### Sprint 4.2: Documentación de Usuario
**Tareas:**
- [ ] Guía de uso de reportes
- [ ] Ejemplos de curl
- [ ] Ejemplos en Postman
- [ ] FAQ de problemas comunes
- [ ] Vídeos demostrativos (opcional)

**Entregables:**
- `USER_GUIDE.md`
- `POSTMAN_COLLECTION.json`

---

## Fase 5: Deployment y Mantenimiento (⏳ PENDIENTE)

### Sprint 5.1: Pre-Producción
**Tareas:**
- [ ] Configuración en staging
- [ ] Pruebas finales en ambiente similar a producción
- [ ] Checklist de seguridad
- [ ] Verificación de logs y monitoreo
- [ ] Plan de rollback

---

### Sprint 5.2: Producción
**Tareas:**
- [ ] Deploy a producción
- [ ] Monitoreo en tiempo real
- [ ] Soporte a usuarios
- [ ] Recopilación de feedback
- [ ] Ajustes post-deploy

---

### Sprint 5.3: Mejoras y Mantenimiento Continuo
**Tareas:**
- [ ] Optimizaciones basadas en uso real
- [ ] Parches de seguridad
- [ ] Nuevas características solicitadas
- [ ] Mejora de rendimiento
- [ ] Actualización de dependencias

---

## Métricas de Éxito

| Métrica | Objetivo | Estado |
|---------|----------|--------|
| Endpoints Funcionales | 5/5 | ✅ (API layer) |
| Tests Unitarios | 95% cobertura | ⏳ Pendiente |
| Tests Integración | 100% endpoints | ⏳ Pendiente |
| Tiempo Respuesta | < 200ms (90%) | ⏳ A medir |
| Disponibilidad | 99.9% | ⏳ A medir |
| Documentación | 100% completa | 60% |

---

## Timeline Estimado

```
Fase 1 (Fundación):        ✅ Completada (1-2 semanas)
├── Sprint 1.1-1.5:        ✅ DONE

Fase 2 (Implementación):   ⏳ En Progreso (4 semanas)
├── Sprint 2.1:            🚀 A iniciar
├── Sprint 2.2:            🚀 Semana 2-3
├── Sprint 2.3:            🚀 Semana 3
├── Sprint 2.4:            🚀 Semana 4
└── Sprint 2.5:            🚀 Semana 4

Fase 3 (Testing):          ⏳ Pendiente (2 semanas)
├── Sprint 3.1:            🚀 Semana 5
├── Sprint 3.2:            🚀 Semana 5-6
└── Sprint 3.3:            🚀 Semana 6

Fase 4 (Documentación):    ⏳ Pendiente (1 semana)
└── Sprint 4.1-4.2:        🚀 Semana 7

Fase 5 (Deployment):       ⏳ Pendiente (1 semana)
├── Sprint 5.1:            🚀 Pre-producción
├── Sprint 5.2:            🚀 Producción
└── Sprint 5.3:            🚀 Continuo

TOTAL ESTIMADO: 8-10 semanas de desarrollo activo
```

---

## Próximas Acciones Inmediatas

1. **Iniciar Sprint 2.1** - Implementar método `getSectionSummaryReport()`
2. **Crear tests unitarios** - Para validar lógica de cálculos
3. **Documentación de API** - Actualizar Swagger con ejemplos reales
4. **Feedback de usuarios** - Recopilar requisitos adicionales

---

## Recursos Disponibles

- Backend: NestJS + TypeScript + Prisma
- Base de datos: PostgreSQL
- Validación: Zod
- Testing: Jest
- Documentación: Swagger + Markdown
- Versionado: Git + GitHub

---

## Consideraciones Especiales

### ⭐ Restricción Crítica
**"SIEMPRE por sección o Curso... NO ENDPOINTS GENERALES"**

Esto significa:
- ✅ `/sections/:sectionId/summary` - VÁLIDO
- ✅ `/sections/:sectionId/courses/:courseId/report` - VÁLIDO
- ❌ `/summary` - INVÁLIDO
- ❌ `/all-students` - INVÁLIDO

Todos los endpoints DEBEN especificar sección en URL.

### 🔐 Seguridad
- [ ] Validar que usuario solo vea datos de su institución
- [ ] Validar que usuario solo vea datos de secciones asignadas
- [ ] Encriptar datos sensibles (codeSIRE, teléfono de tutor)
- [ ] Auditoría de accesos

### 📊 Performance
- [ ] Queries indexadas correctamente
- [ ] Paginación en resultados grandes
- [ ] Caching de datos estáticos (cursos, bimestres)
- [ ] Monitoreo de queries lentas

### 📱 Escalabilidad
- [ ] Preparar para 10,000+ estudiantes
- [ ] Exportación a CSV/Excel (futura mejora)
- [ ] Reports programados (futura mejora)
- [ ] Notificaciones automáticas (futura mejora)

