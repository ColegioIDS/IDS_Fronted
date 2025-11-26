# 🚀 Quick Start - Módulo Course Grades

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Importar el Módulo

```tsx
// En tu página
import { CourseGradesPageContent } from '@/components/features/course-grades';

export default function MiPagina() {
  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <CourseGradesPageContent />
    </div>
  );
}
```

**¡Eso es todo!** 🎉 El módulo está listo para usar.

---

## 📂 Archivos Importantes

```
src/
├── types/course-grades.types.ts              👈 Todas las interfaces
├── services/course-grades.service.ts         👈 Servicio API
├── components/features/course-grades/
│   ├── CourseGradesPageContent.tsx          👈 Componente principal
│   ├── index.ts                             👈 Exportaciones
│   ├── README.md                            👈 Documentación completa
│   ├── MIGRATION_GUIDE.md                   👈 Guía de migración
│   ├── IMPLEMENTATION_SUMMARY.md            👈 Resumen de implementación
│   └── VISUAL_GUIDE.md                      👈 Guía visual
└── app/(admin)/course-grades/page.tsx       👈 Página actualizada
```

---

## 🎯 Funcionalidades Incluidas

### ✅ CRUD Completo
- **Crear** asignación curso-grado
- **Leer** asignaciones con filtros y paginación
- **Actualizar** tipo de curso (núcleo/electivo)
- **Eliminar** asignación con confirmación

### ✅ Filtros Avanzados
- Por curso
- Por grado
- Por tipo (núcleo/electivo)
- Ordenamiento personalizado
- Resumen de filtros activos

### ✅ Visualización
- Grid de cards responsive
- Modal de detalles completos
- Estadísticas en tiempo real
- Empty states
- Loading states

### ✅ UX/UI
- Dark mode support
- Toast notifications
- Form validation
- Error handling
- Responsive design
- Paginación completa

---

## 🔌 API Endpoints Utilizados

```typescript
GET    /api/course-grades/available/grades     // Obtener grados disponibles
GET    /api/course-grades/available/courses    // Obtener cursos disponibles
GET    /api/course-grades                      // Listar asignaciones (paginado)
GET    /api/course-grades/:id                  // Obtener por ID
GET    /api/course-grades/course/:id/grades    // Grados de un curso
GET    /api/course-grades/grade/:id/courses    // Cursos de un grado
GET    /api/course-grades/:id/stats            // Estadísticas
POST   /api/course-grades                      // Crear asignación
PATCH  /api/course-grades/:id                  // Actualizar asignación
DELETE /api/course-grades/:id                  // Eliminar asignación
```

---

## 📝 Ejemplos de Código

### Uso Básico (Recomendado)
```tsx
import { CourseGradesPageContent } from '@/components/features/course-grades';

export default function CourseGradesPage() {
  return <CourseGradesPageContent />;
}
```

### Uso del Servicio
```typescript
import { courseGradesService } from '@/services/course-grades.service';

// Crear asignación
const newAssignment = await courseGradesService.createCourseGrade({
  courseId: 1,
  gradeId: 5,
  isCore: true,
});

// Obtener asignaciones con filtros
const assignments = await courseGradesService.getCourseGrades({
  page: 1,
  limit: 12,
  courseId: 1,
  isCore: true,
});

// Actualizar tipo de curso
await courseGradesService.updateCourseGrade(1, { isCore: false });

// Eliminar asignación
await courseGradesService.deleteCourseGrade(1);
```

### Uso de Componentes Individuales
```tsx
import {
  CourseGradeForm,
  CourseGradesGrid,
  CourseGradeFilters,
  CourseGradeStats,
} from '@/components/features/course-grades';

export default function CustomPage() {
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({});
  
  return (
    <div>
      <CourseGradeStats 
        totalAssignments={45}
        totalCourses={15}
        totalGrades={11}
        coreAssignments={30}
        electiveAssignments={15}
      />
      
      <CourseGradeFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={() => setFilters({})}
      />
      
      <CourseGradesGrid
        courseGrades={data}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
      />
      
      {showForm && (
        <CourseGradeForm
          courseGrade={null}
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
```

---

## 🔐 Permisos Requeridos

```typescript
// El usuario debe tener estos permisos:
'course-grade:read'       // Ver listados
'course-grade:read-one'   // Ver detalles
'course-grade:create'     // Crear asignaciones
'course-grade:update'     // Actualizar asignaciones
'course-grade:delete'     // Eliminar asignaciones
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@/components/features/course-grades'"
**Solución:** Verifica que los archivos estén en la ruta correcta:
```
src/components/features/course-grades/
```

### Error: API retorna 401 (Unauthorized)
**Solución:** Verifica que el token JWT esté configurado correctamente en `@/config/api`

### Error: API retorna 403 (Forbidden)
**Solución:** Verifica que el usuario tenga los permisos necesarios (ver sección anterior)

### Error: "Property X does not exist on type Y"
**Solución:** Verifica que estés importando los tipos correctos desde `@/types/course-grades.types`

### Los filtros no funcionan
**Solución:** Verifica que el backend soporte los query parameters enviados

---

## 📚 Documentación Completa

### Para Desarrolladores
- **README.md** - Documentación completa del módulo
- **MIGRATION_GUIDE.md** - Guía de migración e integración
- **IMPLEMENTATION_SUMMARY.md** - Resumen de implementación
- **VISUAL_GUIDE.md** - Guía visual de componentes

### Para API
- **docs/FRONTEND_INTEGRATION_COURSE_GRADES.md** - Documentación de endpoints

---

## 🎨 Personalización

### Cambiar colores
Los colores se gestionan automáticamente desde el tema de Tailwind.
Para personalizarlos, edita `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: '#tu-color',
      success: '#tu-color',
      warning: '#tu-color',
      danger: '#tu-color',
    }
  }
}
```

### Cambiar textos
Los textos están hardcodeados en los componentes.
Puedes crear un archivo de i18n para internacionalización.

### Agregar campos al formulario
1. Actualiza la interface en `course-grades.types.ts`
2. Actualiza el DTO en el mismo archivo
3. Agrega el campo en `CourseGradeForm.tsx`
4. Actualiza la validación

---

## ✅ Checklist de Verificación

Antes de usar el módulo, verifica que:

- [ ] Tienes acceso a la API de course-grades
- [ ] Tu usuario tiene los permisos necesarios
- [ ] El token JWT está configurado correctamente
- [ ] React Toastify está instalado y configurado
- [ ] Lucide React está instalado (para iconos)
- [ ] Tailwind CSS está configurado
- [ ] El módulo está en `src/components/features/course-grades/`

---

## 🚀 Deploy

### Desarrollo
```bash
npm run dev
# o
yarn dev
```

### Producción
```bash
npm run build
npm run start
# o
yarn build
yarn start
```

---

## 📞 Soporte

### Si tienes problemas:
1. Revisa esta guía Quick Start
2. Lee el README.md del módulo
3. Consulta la documentación de la API
4. Revisa los logs del navegador (F12)
5. Verifica la respuesta de la API

### Archivos de referencia:
- **Types**: `src/types/course-grades.types.ts`
- **Service**: `src/services/course-grades.service.ts`
- **Main Component**: `src/components/features/course-grades/CourseGradesPageContent.tsx`

---

## 🎉 ¡Listo!

El módulo Course Grades está completamente funcional y listo para usar.

**Siguiendo el patrón de Roles** ✅  
**100% TypeScript** ✅  
**Completamente documentado** ✅  
**Responsive** ✅  
**Dark mode** ✅

---

**¿Necesitas más ayuda?**  
Consulta los archivos de documentación en:  
`src/components/features/course-grades/`

**Última actualización:** Noviembre 2025
