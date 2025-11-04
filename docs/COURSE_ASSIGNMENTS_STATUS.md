# 📋 Course Assignments - Frontend Implementation Status

## ✅ Lo que ya está creado:

### 1. **Types** (src/types/course-assignments.types.ts)
- ✅ `CourseAssignment` - Tipo principal de asignación
- ✅ `AssignmentType` - 'titular' | 'apoyo' | 'temporal' | 'suplente'
- ✅ `CourseAssignmentFilters` - Filtros para búsqueda
- ✅ `PaginatedCourseAssignments` - Respuesta paginada
- ✅ `CourseAssignmentFormData` - Datos para formularios
- ✅ `SectionAssignmentData` - Datos de sección específica
- ✅ `CreateCourseAssignmentDto` - DTO para crear
- ✅ `UpdateCourseAssignmentDto` - DTO para actualizar
- ✅ `BulkCreateCourseAssignmentDto` - DTO para creación masiva
- ✅ `BulkUpdateCourseAssignmentDto` - DTO para actualización masiva
- ✅ `CourseAssignmentStats` - Estadísticas
- ✅ `TeacherCourse` - Cursos de un profesor
- ✅ `DeleteCourseAssignmentResponse` - Respuesta de eliminación

### 2. **Service** (src/services/course-assignments.service.ts)
- ✅ `getFormData()` - Obtiene datos para formularios
- ✅ `getCourseAssignments()` - Lista con paginación y filtros
- ✅ `getCourseAssignmentById()` - Obtiene una asignación
- ✅ `getSectionAssignmentData()` - Datos de una sección
- ✅ `getSectionAssignments()` - Asignaciones de una sección
- ✅ `getGradeAssignments()` - Asignaciones de un grado
- ✅ `getTeacherCourses()` - Cursos de un profesor
- ✅ `getStats()` - Estadísticas generales
- ✅ `createCourseAssignment()` - Crear asignación
- ✅ `updateCourseAssignment()` - Actualizar asignación
- ✅ `deleteCourseAssignment()` - Eliminar asignación
- ✅ `bulkCreateCourseAssignments()` - Crear múltiples
- ✅ `bulkUpdateCourseAssignments()` - Actualizar múltiples

---

## 📡 Endpoints del Backend Requeridos

Según la documentación `FRONTEND_INTEGRATION_COURSE_ASSIGNMENTS.md`, estos son los endpoints que deben estar disponibles:

### ✅ Endpoints Ya Documentados (deberían existir):

1. **GET /api/course-assignments/form-data**
   - Obtiene secciones, cursos, profesores y ciclo activo
   - Usado por: Selector de grado-sección

2. **GET /api/course-assignments**
   - Lista paginada con filtros
   - Query params: page, limit, search, sectionId, courseId, teacherId, gradeId, assignmentType, isActive, sortBy, sortOrder

3. **GET /api/course-assignments/section/:sectionId/data**
   - Datos completos de una sección (info + asignaciones)
   - Usado por: Tabla de asignaciones

4. **GET /api/course-assignments/section/:sectionId**
   - Asignaciones activas de una sección

5. **GET /api/course-assignments/grade/:gradeId**
   - Asignaciones activas de un grado

6. **GET /api/course-assignments/teacher/:teacherId/courses**
   - Cursos asignados a un profesor

7. **GET /api/course-assignments/stats**
   - Estadísticas generales

8. **GET /api/course-assignments/:id**
   - Detalle de una asignación específica

9. **POST /api/course-assignments**
   - Crear una asignación
   - Body: `{ sectionId, courseId, teacherId, assignmentType?, notes? }`

10. **PATCH /api/course-assignments/:id**
    - Actualizar una asignación
    - Body: `{ teacherId?, assignmentType?, notes?, isActive? }`

11. **DELETE /api/course-assignments/:id**
    - Eliminar asignación (soft/hard delete según tenga horarios)

12. **POST /api/course-assignments/bulk**
    - Crear múltiples asignaciones
    - Body: `{ assignments: [...] }`

13. **PATCH /api/course-assignments/bulk**
    - Actualizar múltiples asignaciones
    - Body: `{ assignments: [{ id, data: {...} }] }`

---

## ⚠️ Endpoints que DEBES VERIFICAR en el Backend

Por favor, verifica que estos endpoints estén implementados en tu backend. Si alguno falta, indícamelo y te daré la especificación completa para implementarlo.

**Críticos para la funcionalidad:**
1. ✅ `/api/course-assignments/form-data` - **CRÍTICO** (para cargar datos iniciales)
2. ✅ `/api/course-assignments/section/:sectionId/data` - **CRÍTICO** (para tabla de asignaciones)
3. ✅ `/api/course-assignments/bulk` (PATCH) - **IMPORTANTE** (para guardar múltiples cambios)

**Secundarios (pueden implementarse después):**
4. `/api/course-assignments/stats` - Para dashboard
5. `/api/course-assignments/teacher/:teacherId/courses` - Para ver carga de profesor
6. `/api/course-assignments/grade/:gradeId` - Para vista por grado

---

## 📁 Estructura de Componentes que Falta Crear

Necesito crear estos componentes en `src/components/features/course-assignments/`:

1. **CourseAssignmentsPageContent.tsx** ✨ (Principal)
   - Contenedor principal
   - Maneja el flujo de navegación
   - Selector de grado → Tabla de asignaciones

2. **GradeSectionSelector.tsx**
   - Selector de grado y sección
   - Muestra información del ciclo activo
   - Validación de ciclo escolar

3. **CourseAssignmentsTable.tsx**
   - Tabla de cursos con selects de profesores
   - Tracking de cambios
   - Validaciones en tiempo real

4. **AssignmentRow.tsx** (Opcional)
   - Fila individual de la tabla
   - Select de profesor
   - Indicadores de estado

5. **BulkSaveActions.tsx**
   - Botones de guardar/cancelar
   - Resumen de cambios
   - Confirmación

6. **AssignmentSummary.tsx**
   - Card con resumen de la sección
   - Estadísticas de asignaciones
   - Profesor titular

7. **AssignmentFilters.tsx** (Opcional)
   - Filtros para la vista de lista
   - Búsqueda por profesor/curso

8. **CourseAssignmentStats.tsx** (Opcional)
   - Dashboard de estadísticas

---

## 🎯 Próximos Pasos

1. **VERIFICAR ENDPOINTS**: Confirma qué endpoints ya existen en tu backend
2. **CREAR COMPONENTES**: Una vez confirmados los endpoints, crearé todos los componentes
3. **INTEGRAR**: Conectar componentes con el servicio
4. **DARK MODE**: Aplicar estilos con shadcn/ui y dark mode completo
5. **PAGE**: Crear la página en `app/(admin)/course-assignments/page.tsx`

---

## 💡 Notas Importantes

- Todos los componentes usarán **shadcn/ui** (Card, Button, Select, Badge, etc.)
- **Dark mode** completo en todos los componentes
- **Gradientes** similares a course-grades (indigo/blue)
- **Toasts** con `sonner`
- **Validaciones** en tiempo real
- **Permisos** integrados con `ProtectedContent`

---

## ❓ ¿Qué necesito de ti?

Por favor, responde estas preguntas:

1. **¿Todos los endpoints listados arriba están implementados en tu backend?**
   - Si falta alguno, indícame cuál(es)

2. **¿El endpoint `/api/course-assignments/form-data` devuelve el `activeCycle`?**
   - Necesito: `{ id, name, startDate, endDate }`

3. **¿Tienes alguna preferencia sobre la interfaz?**
   - ¿Quieres que sea similar a los componentes existentes en `src/components/course-assignments/`?
   - ¿O prefieres un diseño completamente nuevo siguiendo el estilo de course-grades?

4. **¿Necesitas la funcionalidad de historial de cambios?**
   - Ver quién asignó qué profesor y cuándo

Una vez que me confirmes, procederé a crear todos los componentes! 🚀
