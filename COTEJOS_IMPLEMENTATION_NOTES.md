# Notas de Implementación - Módulo de Cotejos

## Estado Actual

El módulo de Cotejos está implementado en el frontend con toda la estructura necesaria:

✅ **Completado:**
- Types y Schemas (Zod)
- Service (integración API)
- Hooks personalizados
- Componentes de UI
- Sistema de filtros en cascada
- Edición por tabs
- Validaciones en frontend

⚠️ **Pendiente en Backend:**
- Implementación de endpoints API
- Cálculos automáticos de ERICA y TAREAS
- Persistencia en base de datos

## Estructura de Componentes

```
CotejosContent (Orquestador Principal)
├── CotejosFilters (Cascada: Ciclo → Bimestre → Grado → Sección → Curso)
├── CotejosTable (Tabla de listado)
│   └── CotejosRowActions
│       └── CotejoEditDialog (Modal de edición)
│           ├── CotejoEditActitudinal (Tab 1: 0-20 pts)
│           ├── CotejoEditDeclarativo (Tab 2: 0-30 pts)
│           └── CotejoSubmit (Tab 3: Finalizar)
└── Dialog para CotejoForm (Generar nuevo)
```

## Implementación Backend - TODO

### 1. Modelo Prisma

```prisma
model Cotejo {
  id                  Int       @id @default(autoincrement())
  enrollmentId        Int
  courseId            Int
  bimesterId          Int
  cycleId             Int
  teacherId           Int
  
  ericaScore          Float?    // 0-40: Calculado automáticamente
  tasksScore          Float?    // 0-20: Calculado automáticamente
  actitudinalScore    Float?    // 0-20: Ingresado por docente
  declarativoScore    Float?    // 0-30: Ingresado por docente
  totalScore          Float?    // Calculado solo al submit
  
  status              String    @default("DRAFT") // DRAFT, COMPLETED, SUBMITTED
  feedback            String?   @db.Text
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  // Relaciones
  enrollment          Enrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  course              Course     @relation(fields: [courseId], references: [id])
  bimester            Bimester   @relation(fields: [bimesterId], references: [id])
  cycle               SchoolCycle @relation(fields: [cycleId], references: [id])
  teacher             User       @relation(fields: [teacherId], references: [id])
  
  @@unique([enrollmentId, courseId, bimesterId, cycleId]) // UPSERT
  @@index([enrollmentId])
  @@index([courseId])
  @@index([bimesterId])
  @@index([status])
}
```

### 2. Endpoints a Implementar

#### GET /api/cotejos/cascade
```typescript
// Obtener estructura en cascada
app.get('/api/cotejos/cascade', async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true';
  
  // 1. Obtener ciclo activo
  const cycle = await db.schoolCycle.findFirst({
    where: { isActive: true, isArchived: false }
  });
  
  if (!cycle) {
    return res.status(200).json({
      success: false,
      errorCode: 'NO_ACTIVE_CYCLE',
      errorType: 'CONFIGURATION_ERROR',
      message: 'No hay un ciclo escolar activo',
      data: null
    });
  }
  
  // 2. Obtener bimestre activo del ciclo
  const activeBimester = await db.bimester.findFirst({
    where: { 
      cycleId: cycle.id,
      isActive: true
    }
  });
  
  // 3. Obtener semanas académicas del bimestre activo
  const weeks = await db.academicWeek.findMany({
    where: { bimesterId: activeBimester?.id }
  });
  
  // 4. Obtener grados
  const grades = await db.grade.findMany({
    where: includeInactive ? {} : { isActive: true }
  });
  
  // 5. Obtener secciones por grado
  const gradesSections = {};
  for (const grade of grades) {
    gradesSections[grade.id] = await db.section.findMany({
      where: { gradeId: grade.id },
      include: {
        teacher: true,
        courseAssignments: {
          where: { isActive: true },
          include: {
            course: true,
            teacher: true
          }
        }
      }
    });
  }
  
  res.json({
    success: true,
    errorCode: null,
    message: 'Datos en cascada obtenidos',
    data: {
      cycle,
      activeBimester,
      weeks,
      grades,
      gradesSections
    }
  });
});
```

#### POST /api/cotejos/:enrollmentId/course/:courseId/generate
```typescript
app.post('/api/cotejos/:enrollmentId/course/:courseId/generate', async (req, res) => {
  const { enrollmentId, courseId } = req.params;
  const { bimesterId, cycleId } = req.query;
  const { feedback } = req.body;
  
  // 1. Validar que existen enrollment, course, bimester, cycle
  const enrollment = await db.enrollment.findUnique({ where: { id: parseInt(enrollmentId) } });
  const course = await db.course.findUnique({ where: { id: parseInt(courseId) } });
  const bimester = await db.bimester.findUnique({ where: { id: parseInt(bimesterId) } });
  const cycle = await db.schoolCycle.findUnique({ where: { id: parseInt(cycleId) } });
  
  if (!enrollment || !course || !bimester || !cycle) {
    return res.status(404).json({ success: false, message: 'Recurso no encontrado' });
  }
  
  // 2. Calcular ERICA: EricaEvaluationAggregate.bimestre_average × 40
  const ericaAggregate = await db.ericaEvaluationAggregate.findFirst({
    where: {
      enrollmentId: parseInt(enrollmentId),
      bimesterId: parseInt(bimesterId)
    }
  });
  const ericaScore = ericaAggregate?.bimestre_average 
    ? ericaAggregate.bimestre_average * 40 / 100 
    : 0;
  
  // 3. Calcular TAREAS: Sum(score) / Sum(maxScore) × 20
  const submissions = await db.assignmentSubmission.findMany({
    where: {
      enrollmentId: parseInt(enrollmentId),
      assignment: {
        courseAssignment: {
          courseId: parseInt(courseId)
        }
      }
    },
    include: {
      assignment: true
    }
  });
  
  const totalScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
  const maxTotalScore = submissions.reduce((sum, s) => sum + (s.assignment.maxScore || 0), 0);
  const tasksScore = maxTotalScore > 0 
    ? (totalScore / maxTotalScore) * 20 
    : 0;
  
  // 4. Obtener teacherId de la sección
  const courseAssignment = await db.courseAssignment.findFirst({
    where: {
      courseId: parseInt(courseId),
      section: {
        id: enrollment.sectionId
      }
    }
  });
  
  // 5. UPSERT cotejo
  const cotejo = await db.cotejo.upsert({
    where: {
      enrollmentId_courseId_bimesterId_cycleId: {
        enrollmentId: parseInt(enrollmentId),
        courseId: parseInt(courseId),
        bimesterId: parseInt(bimesterId),
        cycleId: parseInt(cycleId)
      }
    },
    create: {
      enrollmentId: parseInt(enrollmentId),
      courseId: parseInt(courseId),
      bimesterId: parseInt(bimesterId),
      cycleId: parseInt(cycleId),
      teacherId: courseAssignment?.teacherId || enrollment.sectionId,
      ericaScore,
      tasksScore,
      status: 'DRAFT',
      feedback
    },
    update: {
      ericaScore,
      tasksScore,
      feedback
    },
    include: {
      enrollment: { include: { student: true } },
      course: true,
      bimester: true,
      teacher: true
    }
  });
  
  res.status(201).json({
    success: true,
    data: cotejo
  });
});
```

#### PATCH /api/cotejos/:id/actitudinal
```typescript
app.patch('/api/cotejos/:id/actitudinal', async (req, res) => {
  const { id } = req.params;
  const { actitudinalScore, feedback } = req.body;
  
  // Validar rango
  if (actitudinalScore < 0 || actitudinalScore > 20) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_RANGE',
      message: 'La puntuación debe estar entre 0 y 20'
    });
  }
  
  const updated = await db.cotejo.update({
    where: { id: parseInt(id) },
    data: {
      actitudinalScore,
      feedback: feedback || undefined
    },
    include: {
      enrollment: { include: { student: true } },
      course: true,
      teacher: true
    }
  });
  
  res.json({ success: true, data: updated });
});
```

#### PATCH /api/cotejos/:id/declarativo
```typescript
app.patch('/api/cotejos/:id/declarativo', async (req, res) => {
  const { id } = req.params;
  const { declarativoScore, feedback } = req.body;
  
  // Validar rango
  if (declarativoScore < 0 || declarativoScore > 30) {
    return res.status(400).json({
      success: false,
      errorCode: 'INVALID_RANGE',
      message: 'La puntuación debe estar entre 0 y 30'
    });
  }
  
  const updated = await db.cotejo.update({
    where: { id: parseInt(id) },
    data: {
      declarativoScore,
      feedback: feedback || undefined
    },
    include: {
      enrollment: { include: { student: true } },
      course: true,
      teacher: true
    }
  });
  
  res.json({ success: true, data: updated });
});
```

#### PATCH /api/cotejos/:id/submit
```typescript
app.patch('/api/cotejos/:id/submit', async (req, res) => {
  const { id } = req.params;
  const { feedback } = req.body;
  
  // 1. Obtener cotejo actual
  const cotejo = await db.cotejo.findUnique({
    where: { id: parseInt(id) }
  });
  
  if (!cotejo) {
    return res.status(404).json({ success: false, message: 'Cotejo no encontrado' });
  }
  
  // 2. Validar que todos los componentes tengan valor
  if (cotejo.ericaScore === null || 
      cotejo.tasksScore === null ||
      cotejo.actitudinalScore === null ||
      cotejo.declarativoScore === null) {
    return res.status(400).json({
      success: false,
      errorCode: 'INCOMPLETE_COTEJO',
      message: 'No se puede finalizar. Faltan componentes.',
      details: {
        ericaScore: cotejo.ericaScore,
        tasksScore: cotejo.tasksScore,
        actitudinalScore: cotejo.actitudinalScore,
        declarativoScore: cotejo.declarativoScore,
        missingFields: [
          cotejo.ericaScore === null && 'ericaScore',
          cotejo.tasksScore === null && 'tasksScore',
          cotejo.actitudinalScore === null && 'actitudinalScore',
          cotejo.declarativoScore === null && 'declarativoScore'
        ].filter(Boolean)
      }
    });
  }
  
  // 3. Calcular total
  const totalScore = 
    cotejo.ericaScore + 
    cotejo.tasksScore + 
    cotejo.actitudinalScore + 
    cotejo.declarativoScore;
  
  // 4. Validar que total no exceda 100
  if (totalScore > 100) {
    return res.status(400).json({
      success: false,
      errorCode: 'SCORE_EXCEEDS_MAXIMUM',
      message: 'La puntuación total no puede exceder 100 puntos',
      details: {
        ericaScore: cotejo.ericaScore,
        tasksScore: cotejo.tasksScore,
        actitudinalScore: cotejo.actitudinalScore,
        declarativoScore: cotejo.declarativoScore,
        totalScore,
        maximum: 100
      }
    });
  }
  
  // 5. Actualizar cotejo
  const submitted = await db.cotejo.update({
    where: { id: parseInt(id) },
    data: {
      totalScore,
      status: 'COMPLETED',
      feedback: feedback || cotejo.feedback
    },
    include: {
      enrollment: { include: { student: true } },
      course: true,
      bimester: true,
      teacher: true
    }
  });
  
  res.json({ success: true, data: submitted });
});
```

## Mejoras Futuras

1. **Reporte PDF:** Exportar cotejos a PDF
2. **Aprobación:** Workflow de aprobación por director
3. **Historial:** Registro de cambios en cada cotejo
4. **Bulk Operations:** Generar/finalizar cotejos en lote
5. **Notificaciones:** Alertar docentes de cotejos pendientes
6. **Permisos Granulares:** Control a nivel de estudiante/sección
7. **Auditoría:** Registro completo de quién editó qué y cuándo
8. **Exportación:** A Excel/Google Sheets
9. **Sincronización:** Con sistemas externos
10. **Análisis:** Dashboard de estadísticas por grado/sección

## Notas Técnicas

- **Endpoints esperados:** Los hooks asumen que los endpoints retornan respuestas en el formato especificado
- **Validación Cliente:** El frontend valida, pero el backend debe validar nuevamente
- **Errores API:** Los componentes manejan errores genéricamente, customizar según backend
- **Loading States:** Todos los componentes tienen manejo de loading y error
- **TypeScript:** Completamente tipado, asegurar consistency en backend

## Permisos Requeridos

```typescript
{
  module: 'cotejo',
  actions: ['create', 'read', 'update', 'delete', 'submit']
}
```

Actualizar tabla de permisos en base de datos según permisos del módulo.

## Testing

Crear tests para:
- ✅ Validaciones de Zod
- ✅ Hooks (loading, error states)
- ✅ Componentes de UI
- ⏳ Integration tests (E2E)
- ⏳ API mocking con MSW

## Deploy Checklist

- [ ] Backend implementado y testeado
- [ ] Endpoints API funcionando
- [ ] Permisos configurados en base de datos
- [ ] Modelos Prisma creados y migrados
- [ ] Frontend integrado y testeado
- [ ] Dark mode verificado
- [ ] Responsive design verificado
- [ ] Permisos en ProtectedNavItem funcionando
- [ ] Documentación actualizada
- [ ] Training para docentes
