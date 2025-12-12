# Módulo de Cotejos - Documentación

## Descripción General

El módulo de Cotejos gestiona la consolidación final de calificaciones por estudiante, curso y bimestre. Calcula automáticamente componentes de evaluación formativa (ERICA) y entregas (TAREAS), mientras permite que docentes ingresen evaluaciones de comportamiento (ACTITUDINAL) y conocimiento (DECLARATIVO).

## Estructura de Puntuación (Total: 100 pts máx)

| Componente | Rango | Fuente | Ingreso |
|-----------|-------|--------|--------|
| **ERICA** | 0-40 pts | EricaEvaluationAggregate.bimestre_average × 40 | Automático |
| **TAREAS** | 0-20 pts | Sum(AssignmentSubmission.score) / Sum(maxScore) × 20 | Automático |
| **ACTITUDINAL** | 0-20 pts | Ingresado por docente | Manual |
| **DECLARATIVO** | 0-30 pts | Ingresado por docente | Manual |
| **TOTAL** | 0-100 pts | ERICA + TAREAS + ACTITUDINAL + DECLARATIVO | Calculado |

## Estructura de Archivos

```
src/
├── types/
│   └── cotejos.types.ts          # Tipos e interfaces TypeScript
├── schemas/
│   └── cotejos.schema.ts         # Schemas de validación Zod
├── services/
│   └── cotejos.service.ts        # Llamadas API
├── hooks/
│   └── useCotejos.ts             # Hooks personalizados
├── components/features/cotejos/
│   ├── index.ts                  # Exportaciones
│   ├── CotejosContent.tsx        # Componente principal
│   ├── CotejosFilters.tsx        # Filtros en cascada
│   ├── CotejosTable.tsx          # Tabla de cotejos
│   ├── CotejosRowActions.tsx     # Acciones por fila
│   ├── CotejoForm.tsx            # Formulario crear cotejo
│   ├── CotejoEditDialog.tsx      # Dialog edición
│   ├── CotejoEditActitudinal.tsx # Editar actitudinal
│   ├── CotejoEditDeclarativo.tsx # Editar declarativo
│   └── CotejoSubmit.tsx          # Finalizar cotejo
└── app/(admin)/cotejos/
    └── page.tsx                  # Página de cotejos
```

## Componentes

### CotejosContent
Componente principal que orquesta toda la funcionalidad del módulo.

**Props:** Ninguno
**Estado:** Filtros, diálogos abiertos
**Funcionalidad:**
- Carga datos en cascada (ciclo, bimestres, grados, secciones, cursos)
- Maneja filtros de sección y curso
- Muestra tabla de cotejos
- Abre dialog para generar nuevos cotejos

### CotejosFilters
Componente de filtros en cascada.

**Props:**
```typescript
{
  cascade: CascadeResponse | null;
  filters: { cycleId, bimesterId, gradeId, sectionId, courseId };
  onFilterChange: (filters) => void;
  loading: boolean;
}
```

**Funcionalidad:**
- Ciclo escolar (solo activo)
- Bimestre (desde ciclo activo)
- Grado (desde bimestre)
- Sección (desde grado)
- Curso (desde sección)

### CotejosTable
Tabla que muestra cotejos de una sección y curso.

**Columnas:**
1. Estudiante (nombre + código SIRE)
2. ERICA (pts)
3. TAREAS (pts)
4. ACTITUDINAL (pts)
5. DECLARATIVO (pts)
6. TOTAL (pts)
7. Estado (badge de color)
8. Acciones (menú desplegable)

**Estados:**
- DRAFT: Cotejo incompleto (amarillo)
- COMPLETED: Cotejo finalizado (verde)
- SUBMITTED: Cotejo enviado (azul)

### CotejosRowActions
Menú de acciones por fila.

**Opciones:**
- Editar: Abre CotejoEditDialog
- Eliminar: Solo si estado es DRAFT

### CotejoForm
Formulario para generar un nuevo cotejo.

**Campos:**
- Estudiante (select requerido)
- Comentarios (opcional, max 500 chars)

**Funcionalidad:**
- Valida que estudiante esté seleccionado
- Llama a generateCotejo service
- Cierra dialog y recarga tabla al éxito

### CotejoEditDialog
Dialog principal para editar cotejo con tabs.

**Tabs:**
1. **Actitudinal:** Editar puntuación de comportamiento
2. **Declarativo:** Editar puntuación de conocimiento
3. **Finalizar:** Calcular total y cambiar estado a COMPLETED

**Validación:**
- Tab "Finalizar" solo habilitado cuando todos los componentes tienen valor

### CotejoEditActitudinal
Componente para editar puntuación actitudinal (0-20 pts).

**Controles:**
- Slider para seleccionar puntuación
- Input de número (fallback)
- Textarea para feedback (max 500 chars)

**Validación:**
- Rango 0-20
- Requerido

### CotejoEditDeclarativo
Componente para editar puntuación declarativa (0-30 pts).

**Controles:**
- Slider para seleccionar puntuación
- Input de número (fallback)
- Textarea para feedback (max 500 chars)

**Validación:**
- Rango 0-30
- Requerido

### CotejoSubmit
Componente para finalizar el cotejo.

**Funcionalidad:**
- Muestra resumen de todos los componentes
- Calcula total automáticamente
- Valida que total no exceda 100 pts
- Permite agregar comentarios finales
- Cambia estado de DRAFT a COMPLETED

**Información:**
- Desglose de ERICA (0-40), TAREAS (0-20), ACTITUDINAL (0-20), DECLARATIVO (0-30)
- Puntuación total (0-100)
- Indicador de error si total > 100

## Hooks

### useCotejo(id)
Obtiene un cotejo específico.

```typescript
const { cotejo, loading, error } = useCotejo(id);
```

### useCascade(includeInactive)
Obtiene datos en cascada.

```typescript
const { cascade, loading, error, refetch } = useCascade(false);
```

### useCotejosBySection(params)
Obtiene cotejos de una sección.

```typescript
const { cotejos, total, loading, error, refetch } = useCotejosBySection({
  sectionId, courseId, bimesterId, cycleId
});
```

### useUpdateActitudinal()
Mutación para actualizar actitudinal.

```typescript
const { mutate, loading, error } = useUpdateActitudinal();
await mutate(id, score, feedback?);
```

### useUpdateDeclarativo()
Mutación para actualizar declarativo.

```typescript
const { mutate, loading, error } = useUpdateDeclarativo();
await mutate(id, score, feedback?);
```

### useGenerateCotejo()
Mutación para generar cotejo.

```typescript
const { mutate, loading, error } = useGenerateCotejo();
await mutate(enrollmentId, courseId, bimesterId, cycleId, feedback?);
```

### useSubmitCotejo()
Mutación para finalizar cotejo.

```typescript
const { mutate, loading, error } = useSubmitCotejo();
await mutate(id, feedback?);
```

## Service

### getCascadeData(includeInactive)
```typescript
const response = await getCascadeData(false);
// Retorna: CascadeResponse
```

### generateCotejo(enrollmentId, courseId, bimesterId, cycleId, data)
```typescript
const cotejo = await generateCotejo(50, 10, 1, 1, { feedback: "..." });
// Retorna: CotejoResponse
```

### getCotejo(id)
```typescript
const cotejo = await getCotejo(1);
// Retorna: CotejoResponse
```

### getCotejosBySection(sectionId, courseId, bimesterId, cycleId)
```typescript
const result = await getCotejosBySection(1, 10, 1, 1);
// Retorna: CotejoBySectionResponse
```

### updateActitudinal(id, data)
```typescript
const updated = await updateActitudinal(1, { actitudinalScore: 18.5, feedback: "..." });
// Retorna: CotejoResponse
```

### updateDeclarativo(id, data)
```typescript
const updated = await updateDeclarativo(1, { declarativoScore: 27.0, feedback: "..." });
// Retorna: CotejoResponse
```

### submitCotejo(id, data)
```typescript
const submitted = await submitCotejo(1, { feedback: "..." });
// Retorna: CotejoResponse (status: COMPLETED, totalScore: calculado)
```

## Tipos

### CotejoResponse
```typescript
{
  id: number;
  enrollmentId: number;
  courseId: number;
  bimesterId: number;
  cycleId: number;
  teacherId: number;
  ericaScore: number | null;
  tasksScore: number | null;
  actitudinalScore: number | null;
  declarativoScore: number | null;
  totalScore: number | null;
  status: 'DRAFT' | 'COMPLETED' | 'SUBMITTED';
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
  // Relaciones
  enrollment?: { id: number; student: { id, givenNames, lastNames, codeSIRE } };
  course?: { id: number; name: string; };
  bimester?: { id: number; name: string; number: number; };
  teacher?: { id: number; givenNames: string; lastNames: string; };
}
```

### CascadeResponse
```typescript
{
  success: boolean;
  errorCode?: string | null;
  message: string;
  data: {
    cycle: SchoolCycle | null;
    activeBimester: Bimester | null;
    weeks: AcademicWeek[];
    grades: Grade[];
    gradesSections: Record<number, Section[]>;
  };
}
```

## Permisos

Todos los endpoints requieren permisos específicos:

| Endpoint | Permiso | Descripción |
|----------|---------|-------------|
| GET /cascade | cotejo/read | Lectura de datos para filtros |
| POST /generate | cotejo/create | Crear nuevos cotejos |
| GET /:id | cotejo/read | Lectura de cotejo |
| GET /section/:id/course/:id | cotejo/read | Lectura de cotejos por sección |
| PATCH /:id/actitudinal | cotejo/update | Actualizar actitudinal |
| PATCH /:id/declarativo | cotejo/update | Actualizar declarativo |
| PATCH /:id/submit | cotejo/update | Finalizar cotejo |

## Flujo de Trabajo Típico

1. **Docente accede al módulo**
   - Se cargan datos en cascada (ciclo, bimestres, etc.)

2. **Selecciona filtros**
   - Ciclo, Bimestre, Grado, Sección, Curso
   - Se cargan los cotejos de esa sección/curso

3. **Genera cotejos (si no existen)**
   - Abre dialog "Generar Cotejo"
   - Selecciona estudiante
   - ERICA y TAREAS se calculan automáticamente
   - Estado = DRAFT

4. **Edita componentes**
   - Abre cotejo (acción Editar)
   - Tab 1: Ingresa ACTITUDINAL (0-20)
   - Tab 2: Ingresa DECLARATIVO (0-30)

5. **Finaliza cotejo**
   - Tab 3: Visualiza total
   - Valida que total ≤ 100
   - Cambia estado a COMPLETED

## Ejemplo de Integración

```tsx
import { CotejosContent } from '@/components/features/cotejos';

export default function Page() {
  return (
    <div className="container mx-auto py-8">
      <CotejosContent />
    </div>
  );
}
```

## Notas Importantes

1. **Cálculos Automáticos:** ERICA y TAREAS se recalculan cada vez que se genera el cotejo
2. **Límite de Puntuación:** El total nunca debe exceder 100 puntos
3. **Estado Inicial:** Todo cotejo comienza en estado `DRAFT`
4. **Finalización:** Se requieren todos los componentes antes de cambiar a `COMPLETED`
5. **Auditoría:** Todos los cambios registran `createdAt` y `updatedAt`
6. **Idempotencia:** Si ya existe un cotejo para enrollment-course-bimestre, se actualiza (UPSERT)

## Consideraciones de Diseño

- **Cascada de Filtros:** Asegura que solo se muestren opciones válidas
- **Tabs para Edición:** Guía al usuario a través del flujo de ingreso
- **Validación de Total:** Previene cotejos con puntuación inválida
- **Feedback Opcional:** Permite agregar comentarios en cada componente
- **Estados Visuales:** Badges de color para identificar rápidamente estados
- **Dark Mode:** Todos los componentes soportan tema oscuro

## Problemas Conocidos

1. **CotejoForm:** Actualmente necesita integración con endpoint de estudiantes
   - El formulario muestra un array vacío de estudiantes
   - Requiere implementar GET /api/sections/:id/students en el backend

2. **Validación de Completitud:** Actualmente valida solo en frontend
   - El backend también debe validar antes de permitir submit

## Próximas Mejoras

1. Carga de estudiantes activos por sección
2. Exportar cotejos a PDF
3. Reporte resumido de calificaciones por curso
4. Validación en tiempo real de totales
5. Historial de cambios por cotejo
6. Aprobación de cotejos por director
