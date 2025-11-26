# Course Assignments Module

## 📁 Estructura del Módulo

```
src/components/features/course-assignments/
├── README.md                           # Este archivo
├── index.ts                            # Exportaciones principales
├── course-assignments-content.tsx      # Componente principal del módulo
└── components/
    ├── index.ts                        # Exportaciones de componentes
    ├── assignment-summary.tsx          # Resumen de asignaciones
    ├── bulk-save-actions.tsx           # Acciones de guardado masivo
    ├── course-teacher-table.tsx        # Tabla de asignación curso-maestro
    └── grade-section-selector.tsx      # Selector de grado y sección
```

## 🎯 Propósito

Este módulo gestiona la **asignación de cursos y maestros** a las secciones escolares. Permite:

- ✅ Seleccionar ciclo escolar, grado y sección
- ✅ Visualizar y editar asignaciones de cursos a maestros
- ✅ Diferenciar entre maestros titulares y especialistas
- ✅ Guardar cambios masivos (bulk update)
- ✅ Visualizar resumen de asignaciones con estadísticas

## 📦 Componentes

### `CourseAssignmentsContent`

Componente principal que orquesta todo el flujo de asignación.

**Características:**
- Selector de ciclo escolar con indicador de ciclo activo
- Progress indicator que muestra el flujo paso a paso
- Información de días restantes y progreso del ciclo
- Gestión completa del estado de selección (ciclo → grado → sección)

### `GradeSectionSelector`

Selector en dos pasos para grado y sección.

**Props:**
```typescript
{
  cycleGradesData: CycleGradesData;
  selectedGradeId: number | null;
  selectedSectionId: number | null;
  onGradeChange: (gradeId: number) => void;
  onSectionChange: (sectionId: number) => void;
}
```

### `CourseTeacherTable`

Tabla principal de asignación con dropdowns categorizados.

**Props:**
```typescript
{
  gradeId: number;
  sectionId: number;
  canUpdate?: boolean;        // Permiso para editar
  canBulkUpdate?: boolean;    // Permiso para guardado masivo
}
```

**Características:**
- Categorización automática de maestros:
  - **Titular**: Maestro asignado a la sección actual
  - **Especialistas**: Maestros sin sección asignada
  - **Otros Titulares**: Maestros de otras secciones
- Indicadores visuales de cambios pendientes
- Colores de curso personalizados
- Badges de tipo de asignación (Titular, Apoyo, Temporal, Suplente)
- Estados de asignación (Asignado, Modificado, Sin asignar)

### `BulkSaveActions`

Barra de acciones para guardar o cancelar cambios pendientes.

**Props:**
```typescript
{
  hasChanges: boolean;
  isSubmitting: boolean;
  modifiedCount: number;
  onSave: () => Promise<void>;
  onReset: () => void;
}
```

### `AssignmentSummary`

Resumen visual con estadísticas y barra de progreso.

**Props:**
```typescript
{
  totalCourses: number;
  assignedCourses: number;
  titularCourses: number;
  specialistCourses: number;
  hasChanges: boolean;
}
```

## 🔧 Uso

### Importación desde index

```typescript
// Importar todo desde el módulo
import { 
  CourseAssignmentsContent,
  CourseTeacherTable,
  GradeSectionSelector,
  AssignmentSummary,
  BulkSaveActions
} from '@/components/features/course-assignments';

// O importar solo el componente principal
import { CourseAssignmentsContent } from '@/components/features/course-assignments';
```

### Uso en páginas

```typescript
// src/app/(admin)/course-teachers/page.tsx
import dynamic from 'next/dynamic';

const CourseAssignmentsContent = dynamic(
  () => import('@/components/features/course-assignments').then(
    mod => ({ default: mod.CourseAssignmentsContent })
  ),
  { loading: () => <ProfileSkeleton type="meta" /> }
);

export default function CourseAssignmentsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb pageTitle="Asignación de Cursos y Maestros" />
      <CourseAssignmentsContent />
    </div>
  );
}
```

## 🎨 Características Visuales

### Colores y Temas

- **Dark Mode**: Soporte completo para modo oscuro
- **Colores de Curso**: Los cursos muestran su color personalizado en:
  - Círculo indicador
  - Nombre del curso (bold)
  - Color por defecto: `#6B7280` (gris) si no hay color asignado

### Estados Visuales

| Estado | Color | Descripción |
|--------|-------|-------------|
| **Titular** | Azul | Maestro asignado como titular |
| **Apoyo/Especialista** | Morado | Maestro de apoyo o especialista |
| **Modificado** | Naranja | Cambio pendiente sin guardar |
| **Asignado** | Verde | Curso con maestro asignado |
| **Sin asignar** | Gris | Curso sin maestro |

### Progress Indicator

Muestra el progreso del ciclo escolar con:
- Porcentaje de progreso visual
- Días restantes del ciclo
- Indicador de ciclo activo/inactivo

## 🔐 Permisos

El módulo respeta los permisos del usuario:

```typescript
const canRead = hasPermission('course-assignment', 'read');
const canUpdate = hasPermission('course-assignment', 'update');
const canBulkUpdate = hasPermission('course-assignment', 'bulk-update');
```

## 📊 Tipos de Asignación

Según el esquema Prisma:

```typescript
export type AssignmentType = 
  | 'titular'   // Maestro titular de la sección
  | 'apoyo'     // Maestro de apoyo/especialista
  | 'temporal'  // Asignación temporal
  | 'suplente'  // Maestro suplente
```

## 🔄 Flujo de Trabajo

1. **Selección de Ciclo**: Usuario selecciona el ciclo escolar
2. **Carga de Grados**: Se cargan los grados disponibles para ese ciclo
3. **Selección de Grado**: Usuario selecciona un grado
4. **Selección de Sección**: Usuario selecciona una sección del grado
5. **Carga de Datos**: Se cargan cursos, maestros y asignaciones existentes
6. **Edición**: Usuario modifica las asignaciones según necesite
7. **Guardado Masivo**: Todos los cambios se guardan de una vez

## 🐛 Troubleshooting

### El maestro titular aparece como especialista

**Solución**: Verificar que `section.teacherId` coincida con el `teacher.id` en la respuesta del backend.

### Colores no se muestran

**Solución**: Asegurarse que los cursos tengan el campo `color` en la respuesta de `availableCourses` o `assignments.course.color`.

### Cambios no se guardan

**Solución**: Verificar que el usuario tenga el permiso `course-assignment:bulk-update`.

## 📝 Notas de Migración

Este módulo fue migrado desde `src/components/course-assignments` a `src/components/features/course-assignments` para:

- ✅ Mejor organización modular
- ✅ Separación de features
- ✅ Exportaciones centralizadas
- ✅ Mantenimiento más fácil

**Archivos migrados:**
- `course-assignments-content.tsx`
- `components/assignment-summary.tsx`
- `components/bulk-save-actions.tsx`
- `components/course-teacher-table.tsx`
- `components/grade-section-selector.tsx`

**Cambios necesarios:**
- Actualizar imports en páginas: `@/components/course-assignments` → `@/components/features/course-assignments`

## 🚀 Futuras Mejoras

- [ ] Filtros avanzados por área de curso
- [ ] Exportación de asignaciones a PDF/Excel
- [ ] Historial de cambios de asignaciones
- [ ] Notificaciones a maestros al ser asignados
- [ ] Validación de carga horaria de maestros
- [ ] Vista de calendario de horarios por maestro
