# 📋 Opción de Carga Masiva - Localización

## 🎯 ¿Dónde Está?

La opción de **carga masiva de asistencia** ya existe en tu aplicación en:

```
📁 src/components/features/attendance/pages/
  └── AttendanceTeacherPage.tsx  ← AQUÍ
```

## 🚀 Cómo Accederla

### Desde el Código:
```typescript
import { AttendanceTeacherPage } from '@/components/features/attendance';

// Usar en tu página:
<AttendanceTeacherPage onSuccess={() => handleSuccess()} />
```

### Flujo de Carga Masiva:

```
1️⃣  Seleccionar Fecha
    ↓
2️⃣  Ver Cursos Disponibles
    (Obtiene automáticamente los cursos del maestro para ese día)
    ↓
3️⃣  Seleccionar 1-10 Cursos
    (Checkboxes para multi-selección)
    ↓
4️⃣  Seleccionar Estado de Asistencia Único
    (Presenta, Ausente, Tardío, etc.)
    ↓
5️⃣  Opcionales: Hora de Llegada + Notas
    ↓
6️⃣  Revisar y Guardar
    (Carga asistencia para TODOS los alumnos de los cursos seleccionados)
```

## 📊 Ventaja vs StudentAttendanceList

| Aspecto | StudentAttendanceList | AttendanceTeacherPage |
|--------|----------------------|----------------------|
| **Alcance** | Una sección | Múltiples cursos |
| **Alumnos** | Todos de la sección | Solo del curso seleccionado |
| **Estado** | Individual por alumno | Mismo para todos |
| **Uso** | Cuando hay una sección | Cuando hay múltiples cursos |

## 🔌 Endpoints Utilizados

### AttendanceTeacherPage (Carga Masiva):
```
GET /api/attendance/teacher/courses/:date
  → Obtiene cursos del maestro para esa fecha

POST /api/attendance/teacher/by-courses
  → Registra asistencia para 1-10 cursos simultáneamente
```

### StudentAttendanceList (Individual):
```
GET /api/attendance/enrollment/section/:sectionId/students
  → Obtiene estudiantes de una sección

POST /api/attendance/register
  → Registra asistencia para una sección
```

## 📝 Componentes Relacionados

**Carga Masiva (Por Cursos):**
- `AttendanceTeacherPage.tsx` - Página principal
- `CourseSelectionGrid.tsx` - Grid de selección de cursos
- `AttendanceStatusSelector.tsx` - Selector de estado único
- `useTeacherCourses.ts` - Hook para obtener cursos
- `useTeacherAttendanceRegistration.ts` - Hook para registrar

**Individual (Por Sección):**
- `StudentAttendanceList.tsx` - Lista con botones de estado
- `useSectionStudents.ts` - Hook para obtener alumnos
- `attendance-grid.tsx` - Integración en la tabla

## 🎨 Cambios Recientes

✅ **StudentAttendanceList ahora usa:**
- Botones de estado (no select)
- Botones "Mark all as..." para selección rápida masiva
- Mejor UX con iconos de estado

## 🚦 Cómo Acceder Desde la UI

Si tu app tiene un menú o navegación, busca:
- "Attendance by Teacher"
- "Attendance by Courses"
- "Carga Masiva de Asistencia"
- "Teacher Attendance"

Si no ves esa opción, el componente puede estar en:
- Modal de configuración
- Pestaña adicional
- Submenu de asistencia

## 🔗 Rutas Relacionadas

```typescript
// En tu router/layout
import { AttendanceTeacherPage } from '@/components/features/attendance';

// Opción 1: Modal
<AttendanceTeacherPage />

// Opción 2: Página dedicada
// /attendance/teacher
// /attendance/by-courses
```

---

**¿Necesitas integrar AttendanceTeacherPage en un lugar específico?**
