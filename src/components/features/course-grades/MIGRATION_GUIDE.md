# 🔄 Guía de Migración e Integración de Componentes

## 📋 Resumen

Esta guía documenta la integración de los componentes existentes de `course-assignments` con la nueva estructura de `course-grades` siguiendo el patrón establecido en el módulo de `roles`.

## 🗂️ Estructura Anterior vs Nueva

### ❌ Estructura Anterior
```
src/components/
├── course-assignments/
│   ├── components/
│   │   ├── assignment-summary.tsx
│   │   ├── bulk-save-actions.tsx
│   │   ├── course-teacher-table.tsx
│   │   └── grade-section-selector.tsx
│   ├── forms/
│   │   ├── assignment-form.tsx
│   │   └── bulk-assignment-form.tsx
│   └── course-assignments-content.tsx
└── course-grades/
    └── CourseGradeManager.tsx (legacy)
```

### ✅ Nueva Estructura (Siguiendo patrón de Roles)
```
src/
├── types/
│   └── course-grades.types.ts
├── services/
│   └── course-grades.service.ts
└── components/
    └── features/
        └── course-grades/
            ├── CourseGradeCard.tsx
            ├── CourseGradeDetailDialog.tsx
            ├── CourseGradeFilters.tsx
            ├── CourseGradeForm.tsx
            ├── CourseGradesGrid.tsx
            ├── CourseGradesPageContent.tsx
            ├── CourseGradeStats.tsx
            ├── DeleteCourseGradeDialog.tsx
            ├── index.ts
            └── README.md
```

## 🎯 Componentes Creados (Siguiendo Patrón de Roles)

### 1. **Types & Service Layer**
- ✅ `src/types/course-grades.types.ts` - Todas las interfaces TypeScript
- ✅ `src/services/course-grades.service.ts` - Servicio API centralizado

### 2. **Core Components**
- ✅ `CourseGradeCard.tsx` - Card individual para mostrar asignación
- ✅ `CourseGradesGrid.tsx` - Grid responsive de cards
- ✅ `CourseGradeForm.tsx` - Formulario crear/editar asignación
- ✅ `CourseGradeFilters.tsx` - Filtros avanzados con estado
- ✅ `CourseGradeStats.tsx` - Estadísticas visuales
- ✅ `DeleteCourseGradeDialog.tsx` - Modal de confirmación
- ✅ `CourseGradeDetailDialog.tsx` - Modal con detalles completos
- ✅ `CourseGradesPageContent.tsx` - Contenedor principal

### 3. **Exports & Documentation**
- ✅ `index.ts` - Exportaciones centralizadas
- ✅ `README.md` - Documentación completa

## 🔧 Componentes de `course-assignments` a Integrar

### Componentes Útiles que Pueden Integrarse:

#### 1. **grade-section-selector.tsx**
**Propósito**: Selector de grado y sección  
**Integración sugerida**: 
- Puede agregarse a `CourseGradeForm.tsx` como un filtro adicional
- Útil si se quiere especificar secciones específicas al asignar cursos

```tsx
// Ejemplo de integración:
import GradeSectionSelector from '@/components/course-assignments/components/grade-section-selector';

// Agregar al CourseGradeForm.tsx después de seleccionar grado
{formData.gradeId && (
  <GradeSectionSelector
    gradeId={formData.gradeId}
    onSectionSelect={(section) => handleSectionChange(section)}
  />
)}
```

#### 2. **course-teacher-table.tsx**
**Propósito**: Tabla de profesores asignados a cursos  
**Integración sugerida**:
- Crear un nuevo componente `CourseGradeTeachers.tsx`
- Mostrar en `CourseGradeDetailDialog.tsx` como tab adicional
- Útil para ver qué profesores dictan cada curso en el grado

```tsx
// Nuevo componente: CourseGradeTeachers.tsx
import CourseTeacherTable from '@/components/course-assignments/components/course-teacher-table';

export default function CourseGradeTeachers({ courseId, gradeId }) {
  return (
    <div className="mt-4">
      <h4 className="mb-3 font-semibold">Profesores Asignados</h4>
      <CourseTeacherTable courseId={courseId} gradeId={gradeId} />
    </div>
  );
}
```

#### 3. **assignment-summary.tsx**
**Propósito**: Resumen de asignaciones  
**Integración sugerida**:
- Puede reemplazar o complementar `CourseGradeStats.tsx`
- Agregar como widget adicional en la vista principal

```tsx
// En CourseGradesPageContent.tsx
import AssignmentSummary from '@/components/course-assignments/components/assignment-summary';

// Agregar después de CourseGradeStats
<AssignmentSummary filters={filters} />
```

#### 4. **bulk-save-actions.tsx**
**Propósito**: Acciones masivas de guardado  
**Integración sugerida**:
- Crear componente `BulkCourseGradeActions.tsx` en la nueva estructura
- Agregar botón de acciones masivas en `CourseGradesPageContent.tsx`

```tsx
// Nuevo componente inspirado en bulk-save-actions
export default function BulkCourseGradeActions() {
  const handleBulkAssign = async (courseIds: number[], gradeIds: number[]) => {
    // Lógica para asignar múltiples cursos a múltiples grados
  };

  return (
    <div>
      {/* UI para selección masiva */}
    </div>
  );
}
```

## 📝 Plan de Integración Paso a Paso

### Fase 1: Actualizar la Página Principal ✅
```typescript
// ✅ COMPLETADO
// src/app/(admin)/course-grades/page.tsx
import { CourseGradesPageContent } from '@/components/features/course-grades';
```

### Fase 2: Migrar Componentes Útiles (OPCIONAL)

#### Opción A: Integración Gradual (Recomendada)
1. **Mantener componentes existentes** de `course-assignments` como están
2. **Importarlos en la nueva estructura** según se necesiten
3. **Refactorizar gradualmente** para que usen el nuevo service layer

```tsx
// Ejemplo de uso mixto
import { CourseGradesPageContent } from '@/components/features/course-grades';
import GradeSectionSelector from '@/components/course-assignments/components/grade-section-selector';

export default function ExtendedCourseGradesPage() {
  return (
    <div>
      <CourseGradesPageContent />
      {/* Componentes adicionales del sistema anterior */}
      <GradeSectionSelector />
    </div>
  );
}
```

#### Opción B: Migración Completa
1. **Crear versiones nuevas** de cada componente en `course-grades/`
2. **Adaptar al nuevo patrón** (types, service, componentes)
3. **Deprecar componentes antiguos**

### Fase 3: Componentes Sugeridos para Crear

#### 1. **CourseGradeTeachers.tsx** (Extensión)
```tsx
// src/components/features/course-grades/CourseGradeTeachers.tsx
export default function CourseGradeTeachers({ 
  courseId, 
  gradeId 
}: CourseGradeTeachersProps) {
  // Mostrar profesores asignados a este curso-grado
  // Usar service para obtener datos
}
```

#### 2. **BulkCourseGradeForm.tsx** (Nuevo)
```tsx
// src/components/features/course-grades/BulkCourseGradeForm.tsx
export default function BulkCourseGradeForm({
  onClose,
  onSuccess,
}: BulkCourseGradeFormProps) {
  // Asignar múltiples cursos a múltiples grados
  // Selección múltiple de cursos y grados
}
```

#### 3. **CourseGradeSchedule.tsx** (Nuevo)
```tsx
// src/components/features/course-grades/CourseGradeSchedule.tsx
export default function CourseGradeSchedule({ 
  courseGradeId 
}: CourseGradeScheduleProps) {
  // Mostrar horarios del curso en el grado
  // Integrar con módulo de schedules
}
```

## 🎨 Patrones de Diseño Aplicados

### 1. **Separation of Concerns**
```
Types (Interfaces) → Service (API) → Components (UI)
```

### 2. **Container/Presentational Pattern**
- **Container**: `CourseGradesPageContent` (lógica y estado)
- **Presentational**: Todos los demás componentes (solo UI)

### 3. **Composition over Inheritance**
- Componentes pequeños y reutilizables
- Props para personalización
- Callbacks para eventos

## 🔄 Comparación con Roles

### Patrón de Roles Aplicado:
```
roles/
├── types/roles.types.ts        → course-grades.types.ts ✅
├── services/roles.service.ts   → course-grades.service.ts ✅
└── components/features/roles/  → components/features/course-grades/ ✅
    ├── RoleCard.tsx           → CourseGradeCard.tsx ✅
    ├── RoleFilters.tsx        → CourseGradeFilters.tsx ✅
    ├── RoleForm.tsx           → CourseGradeForm.tsx ✅
    ├── RolesGrid.tsx          → CourseGradesGrid.tsx ✅
    ├── RolesPageContent.tsx   → CourseGradesPageContent.tsx ✅
    ├── RoleStats.tsx          → CourseGradeStats.tsx ✅
    ├── DeleteRoleDialog.tsx   → DeleteCourseGradeDialog.tsx ✅
    ├── RoleDetailDialog.tsx   → CourseGradeDetailDialog.tsx ✅
    └── index.ts               → index.ts ✅
```

## 📊 Ventajas de la Nueva Estructura

### ✅ Consistencia
- Misma estructura que otros módulos (roles, grades, etc.)
- Fácil de entender para nuevos desarrolladores
- Documentación estandarizada

### ✅ Mantenibilidad
- Tipos TypeScript centralizados
- Servicio API único y testenable
- Componentes desacoplados

### ✅ Escalabilidad
- Fácil agregar nuevos componentes
- Service layer preparado para cacheo
- Componentes reutilizables

### ✅ Testing
- Tipos facilitan testing
- Service puede mockearse fácilmente
- Componentes aislados

## 🚀 Próximos Pasos Sugeridos

### Corto Plazo
1. ✅ **Actualizar página principal** para usar `CourseGradesPageContent`
2. ⏳ **Probar funcionalidad básica** CRUD
3. ⏳ **Ajustar estilos** según necesidad

### Mediano Plazo
4. ⏳ **Crear `BulkCourseGradeForm`** para asignaciones masivas
5. ⏳ **Integrar `GradeSectionSelector`** en el form
6. ⏳ **Crear vista de profesores** por curso-grado

### Largo Plazo
7. ⏳ **Migrar completamente** de `course-assignments`
8. ⏳ **Agregar tests unitarios**
9. ⏳ **Optimizar performance** (cacheo, lazy loading)
10. ⏳ **Documentar casos de uso** adicionales

## 📚 Referencias

### Documentación
- **API Docs**: `docs/FRONTEND_INTEGRATION_COURSE_GRADES.md`
- **Module README**: `src/components/features/course-grades/README.md`
- **Roles Reference**: `src/components/features/roles/`

### Archivos Clave
```
src/
├── types/course-grades.types.ts           # Todas las interfaces
├── services/course-grades.service.ts      # Servicio API
└── components/features/course-grades/     # Componentes UI
    ├── index.ts                          # Exportaciones
    └── CourseGradesPageContent.tsx       # Punto de entrada
```

## ✅ Checklist de Migración

- [x] Crear types (`course-grades.types.ts`)
- [x] Crear service (`course-grades.service.ts`)
- [x] Crear componentes siguiendo patrón de roles
- [x] Actualizar página principal (`page.tsx`)
- [x] Documentar estructura (README.md)
- [x] Crear guía de migración (este archivo)
- [ ] Probar en ambiente de desarrollo
- [ ] Integrar componentes de `course-assignments` (opcional)
- [ ] Crear componentes adicionales (bulk, teachers, etc.)
- [ ] Deprecar componentes antiguos (si aplica)
- [ ] Actualizar documentación del proyecto

## 🤝 Soporte

Si necesitas ayuda con la integración:
1. Revisa el README del módulo
2. Compara con el módulo de Roles
3. Consulta la documentación de la API
4. Revisa esta guía de migración

---

**¡Estructura lista para usar! 🎉**  
**Sigue el mismo patrón que Roles para mantener consistencia en el proyecto.**
