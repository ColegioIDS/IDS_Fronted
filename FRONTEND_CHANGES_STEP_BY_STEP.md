# 🚀 Guía Paso a Paso: Cambios Frontend

## 📋 Índice
1. [Actualizar Tipos](#paso-1-actualizar-tipos)
2. [Crear Hook de Cursos](#paso-2-crear-hook)
3. [Actualizar Servicio](#paso-3-actualizar-servicio)
4. [Crear Componente CourseSelector](#paso-4-crear-componente)
5. [Integrar en AttendanceTable](#paso-5-integrar-en-tabla)
6. [Testing](#paso-6-testing)

---

## PASO 1: Actualizar Tipos

### Archivo: `src/types/attendance.types.ts`

**Agregar al final del archivo:**

```typescript
// ✅ Nuevas interfaces para asistencia por curso

export interface AttendanceCourse {
  id: number;
  courseId: number;
  name: string;
  code: string;
  color?: string;
  teacherId: number;
  teacherName: string;
  startTime?: string;
  endTime?: string;
}

export interface BulkAttendanceByCourseDto {
  date: string;
  courseAssignmentIds: number[];
  attendances: Array<{
    enrollmentId: number;
    attendanceStatusId: number;
    notes?: string;
  }>;
}

// ✅ Actualizar BulkApplyStatusDto
// CAMBIAR DE:
export interface BulkApplyStatusDto {
  enrollmentIds: number[];
  date: string;
  attendanceStatusId: number;
  notes?: string;
}

// A:
export interface BulkApplyStatusDto {
  enrollmentIds: number[];
  date: string;
  attendanceStatusId: number;
  courseAssignmentIds?: number[];  // ← NUEVO
  notes?: string;
}
```

---

## PASO 2: Crear Hook

### Archivo: `src/hooks/attendance/useAttendanceCourses.ts` (NUEVO)

```typescript
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AttendanceCourse } from '@/types/attendance.types';

interface UseAttendanceCoursesReturn {
  courses: AttendanceCourse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener cursos disponibles de una sección
 * 
 * @param sectionId - ID de la sección
 * @returns { courses, loading, error, refetch }
 * 
 * @example
 * const { courses, loading } = useAttendanceCourses(sectionId);
 */
export function useAttendanceCourses(sectionId?: number): UseAttendanceCoursesReturn {
  const [courses, setCourses] = useState<AttendanceCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    if (!sectionId) {
      setCourses([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(
        `/api/attendance/configuration/courses-for-section/${sectionId}`
      );
      
      // Validar respuesta
      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setCourses(data);
      
      console.log(`✅ Cursos cargados para sección ${sectionId}:`, data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching courses';
      setError(message);
      console.error(`❌ Error cargando cursos para sección ${sectionId}:`, err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [sectionId]);

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses
  };
}
```

---

## PASO 3: Actualizar Servicio

### Archivo: `src/services/attendance.service.ts`

**Agregar nuevo método:**

```typescript
/**
 * Registrar asistencia para múltiples cursos simultáneamente
 */
async bulkByCourses(data: BulkAttendanceByCourseDto): Promise<BulkAttendanceResponse> {
  try {
    console.log('📤 POST /api/attendance/bulk-by-courses', data);
    const response = await api.post('/api/attendance/bulk-by-courses', data);
    console.log('✅ Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error in bulkByCourses:', error);
    throw error;
  }
}
```

**Actualizar método existente:**

```typescript
// CAMBIAR bulkApplyStatus DE:
async bulkApplyStatus(data: BulkApplyStatusDto): Promise<BulkAttendanceResponse> {
  const response = await api.post('/api/attendance/bulk-apply-status', data);
  return response.data;
}

// A:
async bulkApplyStatus(data: BulkApplyStatusDto): Promise<BulkAttendanceResponse> {
  try {
    console.log('📤 POST /api/attendance/bulk-apply-status', data);
    const response = await api.post('/api/attendance/bulk-apply-status', data);
    console.log('✅ Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error in bulkApplyStatus:', error);
    throw error;
  }
}
```

---

## PASO 4: Crear Componente CourseSelector

### Archivo: `src/components/features/attendance/components/attendance-controls/CourseSelector.tsx` (NUEVO)

```typescript
'use client';

import React, { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAttendanceCourses } from '@/hooks/attendance/useAttendanceCourses';
import { Loader2 } from 'lucide-react';

interface CourseSelectorProps {
  sectionId?: number;
  selectedCourseIds: number[];
  onSelectionChange: (courseIds: number[]) => void;
  disabled?: boolean;
}

/**
 * Componente para seleccionar múltiples cursos
 * 
 * @param sectionId - ID de la sección
 * @param selectedCourseIds - Array de IDs de cursos seleccionados
 * @param onSelectionChange - Callback cuando cambia la selección
 * @param disabled - Deshabilitar interacción
 * 
 * @example
 * <CourseSelector
 *   sectionId={1}
 *   selectedCourseIds={[5, 6]}
 *   onSelectionChange={setCourses}
 * />
 */
export function CourseSelector({
  sectionId,
  selectedCourseIds,
  onSelectionChange,
  disabled = false
}: CourseSelectorProps) {
  const { courses, loading, error } = useAttendanceCourses(sectionId);

  const allSelected = useMemo(
    () => courses.length > 0 && selectedCourseIds.length === courses.length,
    [courses, selectedCourseIds]
  );

  const handleToggleCourse = (courseId: number) => {
    if (selectedCourseIds.includes(courseId)) {
      onSelectionChange(selectedCourseIds.filter(id => id !== courseId));
    } else {
      onSelectionChange([...selectedCourseIds, courseId]);
    }
  };

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(courses.map(c => c.id));
    }
  };

  // Estado: Cargando
  if (loading) {
    return (
      <Card className="border-blue-200 dark:border-blue-900">
        <CardContent className="pt-6 flex items-center justify-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Cargando cursos...
          </span>
        </CardContent>
      </Card>
    );
  }

  // Estado: Error
  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-900">
        <CardContent className="pt-6">
          <p className="text-sm text-red-600 dark:text-red-400">
            ❌ Error: {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Estado: Sin cursos
  if (courses.length === 0) {
    return (
      <Card className="border-gray-200 dark:border-gray-800">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ℹ️ No hay cursos disponibles para esta sección
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            📚 Seleccionar Cursos
            <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
              ({selectedCourseIds.length}/{courses.length})
            </span>
          </CardTitle>
          <Button
            variant={allSelected ? 'default' : 'outline'}
            size="sm"
            onClick={handleSelectAll}
            disabled={disabled || courses.length === 0}
            className="text-xs"
          >
            {allSelected ? '✓ Todos' : 'Todos'}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {courses.map(course => (
            <label
              key={course.id}
              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                disabled
                  ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                  : 'hover:bg-blue-100 dark:hover:bg-blue-900/40'
              } ${
                selectedCourseIds.includes(course.id)
                  ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-400 dark:border-blue-600'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <Checkbox
                checked={selectedCourseIds.includes(course.id)}
                onCheckedChange={() => handleToggleCourse(course.id)}
                disabled={disabled}
                className="h-5 w-5"
              />

              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {/* Color del curso */}
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: course.color || '#6b7280' }}
                  title={`Color de ${course.name}`}
                />

                {/* Nombre del curso */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {course.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {course.teacherName}
                  </div>
                </div>

                {/* Horario */}
                {course.startTime && course.endTime && (
                  <div className="text-xs text-gray-500 dark:text-gray-500 flex-shrink-0">
                    {course.startTime} - {course.endTime}
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>

        {/* Información útil */}
        {selectedCourseIds.length > 0 && (
          <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded text-xs text-blue-800 dark:text-blue-200">
            <span className="font-semibold">ℹ️ Información:</span> La asistencia se registrará para <strong>todos los {selectedCourseIds.length} cursos</strong> seleccionados de manera simultánea, optimizando tu tiempo.
          </div>
        )}

        {selectedCourseIds.length === 0 && (
          <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded text-xs text-yellow-800 dark:text-yellow-200">
            <span className="font-semibold">⚠️ Aviso:</span> Sin cursos seleccionados, la asistencia se registrará como general (sin especificar curso).
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## PASO 5: Integrar en AttendanceTable

### Archivo: `src/components/features/attendance/components/attendance-grid/AttendanceTable.tsx`

**Cambio 1: Importar el componente**

```typescript
// Agregar al inicio del archivo
import { CourseSelector } from '../attendance-controls/CourseSelector';
```

**Cambio 2: Agregar estado para cursos**

```typescript
// Dentro del componente, agregar estado:
const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
```

**Cambio 3: Actualizar handleBulkAction**

```typescript
// CAMBIAR DE:
const handleBulkAction = useCallback(
  async (enrollmentIds: number[], attendanceStatusId: number) => {
    if (selectedStudents.length === 0 || !selectedDate) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar estudiantes y una fecha',
        variant: 'destructive'
      });
      return;
    }

    setUpdatingBulk(true);
    try {
      await bulkApplyStatus({
        enrollmentIds: selectedStudents,
        date: selectedDate.toISOString().split('T')[0],
        attendanceStatusId
      });

      toast({
        title: 'Éxito',
        description: `Asistencia registrada para ${selectedStudents.length} estudiantes`,
        variant: 'default'
      });

      setSelectedStudents([]);
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error('Error en acción masiva:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Error al registrar asistencia',
        variant: 'destructive'
      });
    } finally {
      setUpdatingBulk(false);
    }
  },
  [selectedStudents, selectedDate, onRefresh, bulkApplyStatus]
);

// A:
const handleBulkAction = useCallback(
  async (enrollmentIds: number[], attendanceStatusId: number) => {
    if (enrollmentIds.length === 0 || !selectedDate) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar estudiantes y una fecha',
        variant: 'destructive'
      });
      return;
    }

    setUpdatingBulk(true);
    try {
      // Si hay cursos seleccionados, usar bulk-by-courses (optimizado)
      if (selectedCourses.length > 0) {
        console.log(`📚 Registrando asistencia para ${selectedCourses.length} cursos`);
        
        const { bulkByCourses } = useAttendanceActions();
        await bulkByCourses({
          date: selectedDate.toISOString().split('T')[0],
          courseAssignmentIds: selectedCourses,
          attendances: enrollmentIds.map(id => ({
            enrollmentId: id,
            attendanceStatusId
          }))
        });

        toast({
          title: 'Éxito',
          description: `Asistencia registrada para ${enrollmentIds.length} estudiantes en ${selectedCourses.length} cursos`,
          variant: 'default'
        });
      } else {
        // Sin cursos seleccionados, usar bulk-apply-status (backwards compatible)
        console.log('📋 Registrando asistencia general (sin cursos específicos)');
        
        await bulkApplyStatus({
          enrollmentIds,
          date: selectedDate.toISOString().split('T')[0],
          attendanceStatusId
        });

        toast({
          title: 'Éxito',
          description: `Asistencia registrada para ${enrollmentIds.length} estudiantes`,
          variant: 'default'
        });
      }

      setSelectedStudents([]);
      setSelectedCourses([]);
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error('Error en acción masiva:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Error al registrar asistencia',
        variant: 'destructive'
      });
    } finally {
      setUpdatingBulk(false);
    }
  },
  [selectedStudents, selectedCourses, selectedDate, onRefresh, bulkApplyStatus]
);
```

**Cambio 4: Agregar CourseSelector en el JSX**

```typescript
// En el return/JSX del componente, agregar ANTES de la tabla de estudiantes:

return (
  <div className="space-y-4">
    {/* Selector de cursos - NUEVO */}
    <CourseSelector
      sectionId={sectionId}
      selectedCourseIds={selectedCourses}
      onSelectionChange={setSelectedCourses}
      disabled={updatingBulk}
    />

    {/* El resto del componente sigue igual */}
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold">Estudiantes</h2>
      {/* ... resto del código */}
    </div>

    {/* ... tabla de estudiantes, etc */}
  </div>
);
```

---

## PASO 6: Testing

### Test Manual en Navegador

**1. Verificar que se carguen los cursos:**
```
Abre DevTools (F12)
Ve a Consola
Deberías ver: "✅ Cursos cargados para sección 1: [...]"
```

**2. Seleccionar cursos:**
```
Haz click en los checkboxes de cursos
Verifica que el contador cambio (p.ej. "2/3")
```

**3. Registrar asistencia:**
```
Selecciona estudiantes
Selecciona un estado (P, I, T, etc)
Haz click en "Guardar Asistencia"
Verifica en DevTools:
  - ✅ "Registrando asistencia para 3 cursos"
  - Respuesta: "Asistencia registrada para 5 estudiantes en 3 cursos"
```

**4. Verificar en Backend:**
```sql
-- Deberías tener múltiples registros:
SELECT * FROM student_attendances 
WHERE date = '2025-11-09' 
AND enrollmentId = 10
ORDER BY courseAssignmentId;

-- Resultado esperado (3 registros para 3 cursos):
| id | enrollmentId | date       | courseAssignmentId | attendanceStatusId |
|----|--------------|------------|--------------------|--------------------|
| 1  | 10           | 2025-11-09 | 5                  | 1                  |
| 2  | 10           | 2025-11-09 | 6                  | 1                  |
| 3  | 10           | 2025-11-09 | 7                  | 1                  |
```

### Test sin Cursos (Backwards Compatible)

**1. Limpiar selección de cursos:**
```
Haz click en botón "Todos" para deseleccionar todo
Deberías ver: "Sin cursos seleccionados, la asistencia se registrará como general"
```

**2. Registrar asistencia:**
```
Selecciona estudiantes
Selecciona un estado
Haz click en "Guardar Asistencia"
Verifica: "Registrando asistencia general (sin cursos específicos)"
```

**3. Verificar en Backend:**
```sql
-- courseAssignmentId debería ser NULL:
SELECT * FROM student_attendances 
WHERE date = '2025-11-09' 
AND enrollmentId = 10;

-- Resultado esperado (1 registro sin curso específico):
| id | enrollmentId | date       | courseAssignmentId | attendanceStatusId |
|----|--------------|------------|--------------------|--------------------|
| 4  | 10           | 2025-11-09 | NULL               | 1                  |
```

### Logs Esperados en Consola

```
✅ Cursos cargados para sección 1: [
  { id: 5, name: "Matemáticas", ... },
  { id: 6, name: "Español", ... },
  { id: 7, name: "Ciencias", ... }
]

📚 Registrando asistencia para 3 cursos

📤 POST /api/attendance/bulk-by-courses {
  date: "2025-11-09",
  courseAssignmentIds: [5, 6, 7],
  attendances: [...]
}

✅ Response: {
  success: true,
  data: {
    totalRecords: 9,
    created: 9,
    courseAssignments: [5, 6, 7]
  }
}
```

---

## 🎯 Checklist Final

Frontend:
- [ ] `src/types/attendance.types.ts` - Tipos actualizados
- [ ] `src/hooks/attendance/useAttendanceCourses.ts` - Hook creado
- [ ] `src/services/attendance.service.ts` - Servicio actualizado
- [ ] `src/components/.../CourseSelector.tsx` - Componente creado
- [ ] `src/components/.../AttendanceTable.tsx` - Integración completa
- [ ] Compila sin errores
- [ ] Testing manual completado

Backend (Asumiendo que ya está hecho):
- [ ] Endpoint GET `/api/attendance/configuration/courses-for-section/:sectionId` implementado
- [ ] Endpoint POST `/api/attendance/bulk-by-courses` implementado
- [ ] Endpoint POST `/api/attendance/bulk-apply-status` actualizado
- [ ] Testing con Postman

