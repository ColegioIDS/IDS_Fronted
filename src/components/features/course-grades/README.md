# 📚 Módulo Course Grades - Frontend

## 📋 Descripción

Este módulo gestiona las **asignaciones de cursos a grados escolares** en el sistema. Permite definir qué cursos se dictan en cada grado y si son obligatorios (núcleo) o electivos.

## 🏗️ Estructura del Módulo

```
src/
├── types/
│   └── course-grades.types.ts          # Interfaces TypeScript
├── services/
│   └── course-grades.service.ts        # Servicios API
└── components/
    └── features/
        └── course-grades/              # Componentes del módulo
            ├── CourseGradeCard.tsx            # Card individual
            ├── CourseGradeDetailDialog.tsx    # Modal de detalles
            ├── CourseGradeFilters.tsx         # Filtros de búsqueda
            ├── CourseGradeForm.tsx            # Formulario crear/editar
            ├── CourseGradesGrid.tsx           # Grid de cards
            ├── CourseGradesPageContent.tsx    # Contenedor principal
            ├── CourseGradeStats.tsx           # Estadísticas
            ├── DeleteCourseGradeDialog.tsx    # Modal confirmación
            └── index.ts                       # Exportaciones
```

## 🎯 Características Implementadas

### ✅ Gestión Completa CRUD
- **Crear** nuevas asignaciones curso-grado
- **Leer** asignaciones con filtros y paginación
- **Actualizar** tipo de curso (núcleo/electivo)
- **Eliminar** asignaciones

### ✅ Filtros Avanzados
- Filtrar por curso específico
- Filtrar por grado específico
- Filtrar por tipo (núcleo/electivo)
- Ordenamiento personalizado
- Búsqueda en tiempo real

### ✅ Visualización
- Grid de cards responsive
- Modal de detalles completos
- Estadísticas en tiempo real
- Badges de tipo de curso
- Estados visuales (activo/inactivo)

### ✅ UX/UI
- Loading states
- Error handling
- Validaciones en formularios
- Confirmaciones de eliminación
- Toast notifications
- Responsive design

## 🔧 Componentes Principales

### 1. **CourseGradesPageContent** (Contenedor Principal)
```tsx
import { CourseGradesPageContent } from '@/components/features/course-grades';

export default function CourseGradesPage() {
  return <CourseGradesPageContent />;
}
```

**Características:**
- Maneja todo el estado del módulo
- Integra todos los sub-componentes
- Gestiona modales y diálogos
- Implementa paginación
- Calcula estadísticas

### 2. **CourseGradeForm** (Formulario)
```tsx
<CourseGradeForm
  courseGrade={selectedCourseGrade} // null para crear, objeto para editar
  onClose={() => setShowForm(false)}
  onSuccess={() => loadData()}
/>
```

**Características:**
- Modo crear y editar
- Validaciones en tiempo real
- Carga dinámica de cursos y grados
- Manejo de errores específicos
- Radio buttons para tipo de curso

### 3. **CourseGradeFilters** (Filtros)
```tsx
<CourseGradeFilters
  filters={filters}
  onFiltersChange={handleFiltersChange}
  onReset={handleResetFilters}
/>
```

**Características:**
- Filtros colapsables
- Múltiples criterios de búsqueda
- Resumen de filtros activos
- Botón de reset
- Loading states

### 4. **CourseGradesGrid** (Grid de Asignaciones)
```tsx
<CourseGradesGrid
  courseGrades={data.data}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onViewDetails={handleViewDetails}
/>
```

**Características:**
- Layout responsive (1-3 columnas)
- Cards interactivas
- Empty state
- Acciones rápidas

### 5. **CourseGradeStats** (Estadísticas)
```tsx
<CourseGradeStats
  totalAssignments={45}
  totalCourses={15}
  totalGrades={11}
  coreAssignments={30}
  electiveAssignments={15}
/>
```

**Características:**
- 5 métricas principales
- Iconos y colores distintivos
- Responsive grid

## 🔌 Servicios API

### Métodos Disponibles

```typescript
import { courseGradesService } from '@/services/course-grades.service';

// Obtener datos disponibles
const courses = await courseGradesService.getAvailableCourses();
const grades = await courseGradesService.getAvailableGrades();

// CRUD
const assignments = await courseGradesService.getCourseGrades({ page: 1, limit: 12 });
const assignment = await courseGradesService.getCourseGradeById(1);
const created = await courseGradesService.createCourseGrade({ courseId: 1, gradeId: 5 });
const updated = await courseGradesService.updateCourseGrade(1, { isCore: false });
await courseGradesService.deleteCourseGrade(1);

// Consultas especiales
const gradesByCourse = await courseGradesService.getGradesByCourse(1);
const coursesByGrade = await courseGradesService.getCoursesByGrade(5);
const stats = await courseGradesService.getCourseStats(1);
```

## 📦 Tipos TypeScript

### Interfaces Principales

```typescript
interface CourseGradeDetail {
  id: number;
  courseId: number;
  gradeId: number;
  isCore: boolean;
  course: {
    id: number;
    code: string;
    name: string;
    description: string | null;
    area: string | null;
    isActive?: boolean;
  };
  grade: {
    id: number;
    name: string;
    level: string;
    order: number;
    isActive?: boolean;
  };
}

interface CreateCourseGradeDto {
  courseId: number;
  gradeId: number;
  isCore?: boolean; // default: true
}

interface CourseGradesQuery {
  page?: number;
  limit?: number;
  courseId?: number;
  gradeId?: number;
  isCore?: boolean;
  sortBy?: 'courseId' | 'gradeId' | 'isCore';
  sortOrder?: 'asc' | 'desc';
}
```

## 🎨 Diseño y Estilos

### Paleta de Colores
- **Primary**: Acciones principales
- **Success**: Cursos núcleo, estados activos
- **Warning**: Cursos electivos
- **Danger**: Eliminaciones, estados inactivos
- **Bodydark**: Texto secundario

### Componentes UI
- Cards con hover effects
- Badges informativos
- Botones con estados disabled
- Spinners de carga
- Modales responsive
- Grid adaptativo

## 🚀 Uso en una Página

### Opción 1: Usar el Contenedor Principal (Recomendado)
```tsx
// app/(admin)/course-grades/page.tsx
import { CourseGradesPageContent } from '@/components/features/course-grades';

export default function CourseGradesPage() {
  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <CourseGradesPageContent />
    </div>
  );
}
```

### Opción 2: Componentes Individuales
```tsx
import {
  CourseGradeForm,
  CourseGradesGrid,
  CourseGradeFilters,
  CourseGradeStats,
} from '@/components/features/course-grades';

export default function CustomPage() {
  // Tu lógica personalizada
  return (
    <div>
      <CourseGradeStats {...stats} />
      <CourseGradeFilters {...filterProps} />
      <CourseGradesGrid {...gridProps} />
    </div>
  );
}
```

## 📝 Ejemplos de Uso

### Crear Asignación
```typescript
try {
  const newAssignment = await courseGradesService.createCourseGrade({
    courseId: 1,      // Matemáticas
    gradeId: 5,       // 5to Primaria
    isCore: true,     // Curso obligatorio
  });
  toast.success('Asignación creada exitosamente');
} catch (error) {
  toast.error(error.message);
}
```

### Actualizar Tipo de Curso
```typescript
try {
  await courseGradesService.updateCourseGrade(1, {
    isCore: false, // Cambiar de núcleo a electivo
  });
  toast.success('Tipo de curso actualizado');
} catch (error) {
  toast.error(error.message);
}
```

### Obtener Currícula de un Grado
```typescript
const curriculum = await courseGradesService.getCoursesByGrade(5);
const coreCourses = curriculum.filter(c => c.isCore);
const electives = curriculum.filter(c => !c.isCore);

console.log('Cursos obligatorios:', coreCourses.length);
console.log('Cursos electivos:', electives.length);
```

## ⚠️ Validaciones

### En el Frontend
- ✅ Curso y grado requeridos al crear
- ✅ IDs deben ser números positivos
- ✅ No permite duplicados (mismo curso-grado)
- ✅ Validación de formularios antes de enviar

### En el Backend (API)
- ✅ Unicidad de combinación curso-grado
- ✅ Existencia de curso y grado
- ✅ Validación de permisos
- ✅ Soft delete

## 🔐 Permisos Requeridos

```typescript
// Para usar este módulo se requieren:
- 'course-grade:read'       // Ver listados
- 'course-grade:read-one'   // Ver detalles
- 'course-grade:create'     // Crear asignaciones
- 'course-grade:update'     // Actualizar asignaciones
- 'course-grade:delete'     // Eliminar asignaciones
```

## 🐛 Manejo de Errores

### Errores Comunes
```typescript
// 409 - Conflicto (asignación duplicada)
if (error.message.includes('existe')) {
  toast.error('Esta combinación de curso y grado ya existe');
}

// 404 - No encontrado
if (error.response?.status === 404) {
  toast.error('Asignación no encontrada');
}

// 400 - Datos inválidos
if (error.response?.status === 400) {
  toast.error('Datos inválidos. Verifique el formulario');
}
```

## 📊 Estadísticas Calculadas

```typescript
interface Stats {
  totalAssignments: number;      // Total de asignaciones
  totalCourses: number;          // Cursos únicos asignados
  totalGrades: number;           // Grados únicos con cursos
  coreAssignments: number;       // Asignaciones de cursos núcleo
  electiveAssignments: number;   // Asignaciones de cursos electivos
}
```

## 🔄 Estados de Componentes

### Loading States
- Spinner global al cargar datos
- Botones deshabilitados durante operaciones
- Loading en selectores

### Empty States
- Grid vacío con mensaje amigable
- Sin filtros activos
- Sugerencias de acción

### Error States
- Toast notifications
- Mensajes inline en formularios
- Errores de validación

## 🎯 Mejoras Futuras (Sugerencias)

- [ ] Bulk actions (asignar curso a múltiples grados)
- [ ] Exportar asignaciones a CSV/Excel
- [ ] Importar desde archivo
- [ ] Vista de tabla además de grid
- [ ] Drag & drop para reordenar
- [ ] Historial de cambios
- [ ] Duplicar asignaciones de un grado a otro

## 📚 Documentación Relacionada

- **API Documentation**: Ver `docs/FRONTEND_INTEGRATION_COURSE_GRADES.md`
- **Backend Endpoints**: `/api/course-grades/*`
- **Tipos**: `src/types/course-grades.types.ts`
- **Servicios**: `src/services/course-grades.service.ts`

## 🤝 Contribuir

Al agregar nuevas funcionalidades, seguir el patrón establecido:
1. Agregar tipos en `course-grades.types.ts`
2. Agregar método en `course-grades.service.ts`
3. Crear/actualizar componente necesario
4. Actualizar exportaciones en `index.ts`
5. Probar y documentar

---

**Desarrollado siguiendo el patrón del módulo Roles**  
**Última actualización**: Noviembre 2025
