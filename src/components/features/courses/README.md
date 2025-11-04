# Componentes de Cursos - Documentación

## 📋 Descripción General

Se ha refactorizado completamente la estructura de componentes de cursos en `src/components/features/courses/`, replicando exactamente la arquitectura superior del módulo de roles. La nueva estructura sigue patrones de **Next.js 15+**, **shadcn/ui**, **Tailwind CSS**, con soporte completo para **dark mode** y **responsividad**.

## 🏗️ Estructura de Archivos

```
src/components/features/courses/
├── CourseCard.tsx              # Tarjeta individual del curso
├── CourseDetailDialog.tsx      # Dialog para ver detalles
├── CourseFilters.tsx           # Componente de filtros avanzados
├── CourseForm.tsx              # Formulario de crear/editar
├── CoursesGrid.tsx             # Grid responsiva con paginación
├── CoursesPageContent.tsx      # Componente principal (Page)
├── CourseStats.tsx             # Estadísticas de cursos
├── DeleteCourseDialog.tsx      # Dialog de confirmación de eliminación
└── index.ts                    # Exportaciones
```

## 🎯 Componentes Principales

### 1. **CourseCard.tsx**
Tarjeta visual de un curso con:
- ✅ Icono con color personalizado
- ✅ Nombre, código y área del curso
- ✅ Badges de estado (Activo/Inactivo)
- ✅ Preview de color hexadecimal
- ✅ Estadísticas (horarios, estudiantes)
- ✅ Menú de acciones (dropdown)
- ✅ Dark mode y responsive

**Props:**
```typescript
interface CourseCardProps {
  course: Course & { _count?: { schedules: number; students: number } };
  onUpdate?: () => void;
  onEdit?: (courseId: number) => void;
}
```

### 2. **CourseFilters.tsx**
Sistema avanzado de filtros con:
- 🔍 Búsqueda por nombre/código (debounced 500ms)
- 📚 Filtro por área del curso
- ✅ Filtro por estado (Activo/Inactivo)
- 🏷️ Visualización de filtros activos
- 🔄 Botón de limpiar todos los filtros
- 📊 Contador de resultados

**Props:**
```typescript
interface CourseFiltersProps {
  filters: CourseFilters;
  onFiltersChange: (filters: CourseFilters) => void;
  onReset: () => void;
  totalResults?: number;
}
```

### 3. **CourseForm.tsx**
Formulario de crear/editar cursos con:
- ✅ Validación con **Zod**
- ✅ Integración con **React Hook Form**
- 📝 Campos: Código, Nombre, Área, Color, Estado
- 🎨 Selector de color con preview en vivo
- ⚠️ Validaciones en tiempo real
- 🌙 Dark mode completo

**Props:**
```typescript
interface CourseFormProps {
  courseId?: number;
  initialData?: Course;
  onSuccess?: () => void;
  onCancel?: () => void;
}
```

### 4. **CoursesGrid.tsx**
Grid responsiva de cursos con:
- 📱 Responsive: 1 columna (mobile), 2 (tablet), 3 (desktop)
- 🔄 Paginación con botones de navegación
- ⏳ Estados de carga (skeleton)
- ❌ Estados de error
- 🔍 Estados vacíos (sin filtros / con filtros)
- 📊 Contador de resultados

### 5. **CourseStats.tsx**
Panel de estadísticas con 5 cards:
- 📊 Total de cursos
- ✅ Cursos activos
- ⏸️ Cursos inactivos
- 📅 Total de horarios
- 👥 Estudiantes inscritos

### 6. **CoursesPageContent.tsx**
Componente principal que integra todo:
- 🔀 Tabs para lista y formulario
- 🔐 Protección por permisos
- 🔄 Sincronización automática
- 🎯 Gestión de estado centralizada

### 7. **CourseDetailDialog.tsx**
Dialog modal para ver detalles del curso:
- 📖 Vista completa de información
- 🎨 Preview de color
- 📅 Fechas de creación/actualización
- ⚠️ Manejo de errores y carga

### 8. **DeleteCourseDialog.tsx**
Dialog de confirmación con:
- ⚠️ Advertencia clara
- 📝 Información del curso a eliminar
- 🔄 Estados de carga

## 📦 Types y Interfaces

Ubicación: `src/types/courses.ts`

```typescript
// Tipos principales
export interface Course {
  id: number;
  code: string;
  name: string;
  area?: CourseArea | null;
  color?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// DTOs para API
export interface CreateCourseDto {
  code: string;
  name: string;
  area?: CourseArea | null;
  color?: string | null;
  isActive?: boolean;
}

export interface UpdateCourseDto {
  code?: string;
  name?: string;
  area?: CourseArea | null;
  color?: string | null;
  isActive?: boolean;
}

// Filtros
export interface CourseFilters {
  isActive?: boolean;
  area?: CourseArea;
  searchQuery?: string;
  gradeId?: number;
}

// Áreas disponibles
export type CourseArea = 
  | 'Científica'
  | 'Humanística'
  | 'Sociales'
  | 'Tecnológica'
  | 'Artística'
  | 'Idiomas'
  | 'Educación Física';
```

## 🔧 Services

Ubicación: `src/services/courses.service.ts`

```typescript
export const coursesService = {
  // Obtener cursos paginados con filtros
  async getCourses(query: CourseFilters & { page?: number; limit?: number }): Promise<PaginatedCourses>
  
  // Obtener curso por ID
  async getCourseById(id: number): Promise<CourseWithRelations>
  
  // Obtener curso por código
  async getCourseByCode(code: string): Promise<CourseWithRelations>
  
  // Crear curso
  async createCourse(data: CreateCourseDto): Promise<Course>
  
  // Actualizar curso
  async updateCourse(id: number, data: UpdateCourseDto): Promise<Course>
  
  // Eliminar curso (soft delete)
  async deleteCourse(id: number): Promise<void>
  
  // Restaurar curso
  async restoreCourse(id: number): Promise<Course>
  
  // Obtener estadísticas
  async getCourseStats(id: number)
}
```

## 🪝 Hooks Personalizados

Ubicación: `src/hooks/data/useCourses.ts`

```typescript
export function useCourses(initialQuery: CoursesQuery = {}) {
  return {
    data: PaginatedCourses | null,
    isLoading: boolean,
    error: string | null,
    query: CoursesQuery,
    updateQuery: (newQuery: Partial<CoursesQuery>) => void,
    refresh: () => void,
  };
}
```

**Uso:**
```typescript
const { data, isLoading, error, query, updateQuery, refresh } = useCourses({
  page: 1,
  limit: 12,
  sortBy: 'name',
  sortOrder: 'asc',
});
```

## 🎨 Temas y Colores

Ubicación: `src/config/theme.config.ts`

Nueva función para obtener tema por área:
```typescript
export const getCourseTheme = (area: string = 'default') => {
  // Retorna objeto con clases Tailwind para el área
  // Científica, Humanística, Sociales, Tecnológica, Artística, Idiomas, Educación Física
}
```

## 🌙 Dark Mode

Todos los componentes incluyen soporte completo para dark mode:
- ✅ Classes `dark:` integrados
- ✅ Colores adaptados
- ✅ Bordes y fondos coherentes
- ✅ Transiciones suaves

## 📱 Responsividad

Breakpoints implementados:
- 📱 `sm`: 640px
- 📱 `md`: 768px
- 🖥️ `lg`: 1024px
- 🖥️ `xl`: 1280px

## 🔐 Permisos y Protección

Integración con permisos:
```typescript
<ProtectedPage module="course" action="read">
  {/* Contenido protegido */}
</ProtectedPage>

<ProtectedButton 
  module="course" 
  action="update"
  hideOnNoPermission
>
  Editar
</ProtectedButton>
```

## 📝 Validaciones

Formulario con validaciones Zod:
```typescript
const courseSchema = z.object({
  code: z.string().min(2).max(20),
  name: z.string().min(3).max(100),
  area: z.string().optional().nullable(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional().nullable(),
  isActive: z.boolean(),
});
```

## 🚀 Uso en una Página

```tsx
import { CoursesPageContent } from '@/components/features/courses';

export default function CoursesPage() {
  return <CoursesPageContent />;
}
```

## 📋 Checklist de Implementación

- ✅ **CourseCard** - Tarjeta visual completa
- ✅ **CourseFilters** - Filtros avanzados
- ✅ **CoursesGrid** - Grid con paginación
- ✅ **CourseForm** - Formulario con validación
- ✅ **CourseStats** - Panel de estadísticas
- ✅ **CoursesPageContent** - Componente integrador
- ✅ **CourseDetailDialog** - Dialog de detalles
- ✅ **DeleteCourseDialog** - Dialog de eliminación
- ✅ **coursesService** - Service API
- ✅ **useCourses Hook** - Hook personalizado
- ✅ **getCourseTheme** - Temas por área
- ✅ **Types actualizados** - Interfaces completas
- ✅ **Dark Mode** - Soporte completo
- ✅ **Responsividad** - Mobile/Tablet/Desktop
- ✅ **Permisos** - Integración de seguridad

## 🔄 Próximas Fases

1. **Integración Backend**: Reemplazar TODO comments con llamadas reales al servicio
2. **Casos de Uso Avanzados**: Relaciones con horarios, estudiantes
3. **Importación/Exportación**: CSV, Excel
4. **Búsqueda Avanzada**: Búsqueda full-text
5. **Auditoría**: Registro de cambios

## 📚 Referencias

- Estructura baseada en: `src/components/features/roles/`
- UI Components: shadcn/ui
- Estilos: Tailwind CSS
- Formularios: React Hook Form + Zod
- Iconos: Lucide Icons
