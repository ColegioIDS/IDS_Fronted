# 🎯 Plan de Integración Frontend: Asistencia por Curso

## 📋 Resumen Ejecutivo

Tu backend YA TIENE el endpoint `POST /api/attendance/bulk-apply-status` implementado ✅

Lo que necesitamos es:
1. ✅ Actualizar tipos del frontend
2. ✅ Crear nuevos endpoints para obtener cursos disponibles
3. ✅ Crear endpoint para asistencia por múltiples cursos
4. ✅ Actualizar componentes del frontend

---

## 🔧 PASO 1: Endpoints Backend a CREAR o ACTUALIZAR

### 1.1 ✅ EXISTENTE - `POST /api/attendance/bulk-apply-status`
**Estado:** YA IMPLEMENTADO ✓

```http
POST /api/attendance/bulk-apply-status
Content-Type: application/json

{
  "enrollmentIds": [10, 15, 22],
  "date": "2025-11-09",
  "attendanceStatusId": 1,
  "notes": "Evento escolar"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "updated": 3,
    "created": 0,
    "skipped": 0,
    "errors": []
  }
}
```

---

### 1.2 ❌ NUEVO - `GET /api/attendance/configuration/courses-for-section/:sectionId`

**Propósito:** Obtener cursos disponibles de una sección para registrar asistencia

**Implementación Backend:**
```typescript
// src/modules/attendance/attendance.controller.ts

/**
 * GET /api/attendance/configuration/courses-for-section/:sectionId
 *
 * Obtiene todos los cursos asignados a una sección con sus maestros
 *
 * @param sectionId - ID de la sección
 * @returns Array de cursos asignados a esa sección
 *
 * @example
 * GET /api/attendance/configuration/courses-for-section/1
 *
 * Response:
 * [
 *   {
 *     "id": 5,
 *     "courseId": 10,
 *     "name": "Matemáticas",
 *     "code": "MATH",
 *     "color": "#FF5733",
 *     "teacherId": 3,
 *     "teacherName": "Lic. García",
 *     "startTime": "08:00",
 *     "endTime": "09:00"
 *   },
 *   {
 *     "id": 6,
 *     "courseId": 11,
 *     "name": "Español",
 *     "code": "SPAN",
 *     "color": "#33FF57",
 *     "teacherId": 3,
 *     "teacherName": "Lic. García",
 *     "startTime": "09:00",
 *     "endTime": "10:00"
 *   }
 * ]
 */
@Get('configuration/courses-for-section/:sectionId')
@Permissions('attendance', 'read-config')
@ApiOperation({ summary: 'Get courses for a section' })
@ApiResponse({ status: 200, description: 'Courses retrieved' })
async getCoursesForSection(
  @ValidatedParam(z.object({ 
    sectionId: z.preprocess((v) => Number(v), z.number().int().positive()) 
  }))
  params: { sectionId: number }
) {
  this.logger.log(`Fetching courses for section: ${params.sectionId}`);
  return this.attendanceService.getCoursesForSection(params.sectionId);
}
```

**Implementación Service:**
```typescript
// src/modules/attendance/attendance.service.ts

async getCoursesForSection(sectionId: number) {
  const courseAssignments = await this.prisma.courseAssignment.findMany({
    where: { sectionId, isActive: true },
    include: {
      course: true,
      teacher: {
        select: { id: true, givenNames: true, lastNames: true }
      },
      schedules: {
        select: { startTime: true, endTime: true }
      }
    },
    orderBy: { course: { name: 'asc' } }
  });

  return courseAssignments.map(ca => ({
    id: ca.id,
    courseId: ca.courseId,
    name: ca.course.name,
    code: ca.course.code,
    color: ca.course.color,
    teacherId: ca.teacherId,
    teacherName: `${ca.teacher.givenNames} ${ca.teacher.lastNames}`,
    startTime: ca.schedules?.[0]?.startTime,
    endTime: ca.schedules?.[0]?.endTime
  }));
}
```

---

### 1.3 ❌ NUEVO - `POST /api/attendance/bulk-by-courses`

**Propósito:** Registrar asistencia para múltiples cursos simultáneamente

**Implementación Backend:**
```typescript
// src/modules/attendance/attendance.controller.ts

/**
 * POST /api/attendance/bulk-by-courses
 *
 * Registra asistencia para múltiples cursos a la vez
 * Para cada curso × cada estudiante = crea 1 registro
 *
 * @body BulkAttendanceByCourseDto
 * @returns Resumen de registros creados
 *
 * @example
 * POST /api/attendance/bulk-by-courses
 * {
 *   "date": "2025-11-09",
 *   "courseAssignmentIds": [5, 6, 7],
 *   "attendances": [
 *     { "enrollmentId": 10, "attendanceStatusId": 1, "notes": "Presente" },
 *     { "enrollmentId": 15, "attendanceStatusId": 2, "notes": "Ausente" },
 *     { "enrollmentId": 22, "attendanceStatusId": 4, "notes": "Tardanza" }
 *   ]
 * }
 *
 * Response: 200 OK
 * {
 *   "success": true,
 *   "message": "Asistencia guardada para 3 cursos × 3 estudiantes (9 registros)",
 *   "data": {
 *     "totalRecords": 9,
 *     "courseAssignments": [5, 6, 7],
 *     "studentCount": 3,
 *     "created": 9,
 *     "updated": 0,
 *     "skipped": 0,
 *     "errors": []
 *   }
 * }
 */
@Post('bulk-by-courses')
@Permissions('attendance', 'create-bulk')
@HttpCode(HttpStatus.CREATED)
@ApiOperation({ summary: 'Create attendance for multiple courses at once' })
@ApiResponse({ status: 201, description: 'Bulk attendance by courses created' })
async bulkByCourses(
  @ValidatedBody(bulkAttendanceByCourseSchema) bulkByCourseDto: BulkAttendanceByCourseDto,
  @CurrentUser() user: RequestUser
) {
  this.logger.log(
    `Creating attendance for ${bulkByCourseDto.courseAssignmentIds.length} courses × ${bulkByCourseDto.attendances.length} students`
  );
  
  return this.attendanceService.bulkByCourses(bulkByCourseDto, user.id);
}
```

**Implementación Service:**
```typescript
// src/modules/attendance/attendance.service.ts

async bulkByCourses(dto: BulkAttendanceByCourseDto, userId: number) {
  const date = new Date(dto.date);
  let created = 0;
  let updated = 0;
  let errors: any[] = [];

  // Para cada curso
  for (const courseAssignmentId of dto.courseAssignmentIds) {
    // Validar que el courseAssignmentId existe
    const courseAssignment = await this.prisma.courseAssignment.findUnique({
      where: { id: courseAssignmentId }
    });

    if (!courseAssignment) {
      errors.push({
        courseAssignmentId,
        error: `Course assignment no encontrado`
      });
      continue;
    }

    // Para cada estudiante
    for (const attendance of dto.attendances) {
      try {
        // Validar que el attendanceStatusId existe
        const status = await this.prisma.attendanceStatus.findUnique({
          where: { id: attendance.attendanceStatusId }
        });

        if (!status) {
          errors.push({
            enrollmentId: attendance.enrollmentId,
            courseAssignmentId,
            error: `Attendance status no encontrado`
          });
          continue;
        }

        // Buscar existente o crear
        const existing = await this.prisma.studentAttendance.findUnique({
          where: {
            unique_student_attendance: {
              enrollmentId: attendance.enrollmentId,
              date,
              courseAssignmentId
            }
          }
        });

        if (existing) {
          // ACTUALIZAR
          await this.prisma.studentAttendance.update({
            where: { id: existing.id },
            data: {
              attendanceStatusId: attendance.attendanceStatusId,
              notes: attendance.notes,
              lastModifiedBy: userId,
              lastModifiedAt: new Date()
            }
          });
          updated++;
        } else {
          // CREAR
          await this.prisma.studentAttendance.create({
            data: {
              enrollmentId: attendance.enrollmentId,
              date,
              courseAssignmentId,
              attendanceStatusId: attendance.attendanceStatusId,
              notes: attendance.notes,
              recordedBy: userId,
              recordedAt: new Date()
            }
          });
          created++;
        }
      } catch (error) {
        errors.push({
          enrollmentId: attendance.enrollmentId,
          courseAssignmentId,
          error: error.message
        });
      }
    }
  }

  return {
    success: errors.length === 0 || (created + updated) > 0,
    message: `Asistencia guardada para ${dto.courseAssignmentIds.length} cursos × ${dto.attendances.length} estudiantes (${created + updated} registros)`,
    data: {
      totalRecords: created + updated,
      courseAssignments: dto.courseAssignmentIds,
      studentCount: dto.attendances.length,
      created,
      updated,
      skipped: dto.attendances.length * dto.courseAssignmentIds.length - (created + updated),
      errors
    }
  };
}
```

**DTO para validación:**
```typescript
// src/modules/attendance/dto/bulk-attendance-by-course.dto.ts

import { z } from 'zod';

export const bulkAttendanceByCourseSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), 'Formato de fecha inválido'),
  courseAssignmentIds: z.array(
    z.number().int().positive('courseAssignmentId debe ser un número positivo')
  ).min(1, 'Debe seleccionar al menos un curso'),
  attendances: z.array(
    z.object({
      enrollmentId: z.number().int().positive(),
      attendanceStatusId: z.number().int().positive(),
      notes: z.string().optional()
    })
  ).min(1, 'Debe tener al menos un estudiante')
});

export type BulkAttendanceByCourseDto = z.infer<typeof bulkAttendanceByCourseSchema>;
```

---

### 1.4 ✅ ACTUALIZAR - `POST /api/attendance/bulk-apply-status`

**Cambio:** Soportar `courseAssignmentIds` (array) además de aplicar a múltiples estudiantes

**Nuevo comportamiento:**
```http
POST /api/attendance/bulk-apply-status
{
  "enrollmentIds": [10, 15, 22],
  "date": "2025-11-09",
  "attendanceStatusId": 1,
  "courseAssignmentIds": [5, 6, 7],  // ← NUEVO
  "notes": "Evento escolar"
}

Response:
{
  "success": true,
  "data": {
    "totalRecords": 9,  // 3 estudiantes × 3 cursos
    "updated": 9,
    "created": 0,
    "courseAssignments": [5, 6, 7],
    "studentCount": 3
  }
}
```

**Implementación actualizada:**
```typescript
// En attendance.service.ts, actualizar el método bulkApplyStatus

async bulkApplyStatus(
  enrollmentIds: number[],
  date: Date,
  attendanceStatusId: number,
  courseAssignmentIds?: number[],  // ← NUEVO
  notes?: string,
  userId?: number
) {
  let updated = 0;
  let created = 0;
  let errors: any[] = [];

  // Si no se proporcionan cursos, aplicar a general (courseAssignmentId = null)
  const coursesToProcess = courseAssignmentIds && courseAssignmentIds.length > 0 
    ? courseAssignmentIds 
    : [null];

  for (const courseAssignmentId of coursesToProcess) {
    for (const enrollmentId of enrollmentIds) {
      try {
        const existing = await this.prisma.studentAttendance.findUnique({
          where: {
            unique_student_attendance: {
              enrollmentId,
              date,
              courseAssignmentId
            }
          }
        });

        if (existing) {
          await this.prisma.studentAttendance.update({
            where: { id: existing.id },
            data: {
              attendanceStatusId,
              notes: notes || existing.notes,
              lastModifiedBy: userId,
              lastModifiedAt: new Date()
            }
          });
          updated++;
        } else {
          await this.prisma.studentAttendance.create({
            data: {
              enrollmentId,
              date,
              courseAssignmentId,
              attendanceStatusId,
              notes,
              recordedBy: userId
            }
          });
          created++;
        }
      } catch (error) {
        errors.push({
          enrollmentId,
          courseAssignmentId,
          error: error.message
        });
      }
    }
  }

  return {
    success: true,
    message: `Asistencia procesada: ${updated} actualizadas, ${created} creadas`,
    data: {
      totalRecords: updated + created,
      courseAssignments: coursesToProcess.filter(x => x !== null),
      studentCount: enrollmentIds.length,
      updated,
      created,
      skipped: enrollmentIds.length * coursesToProcess.length - (updated + created),
      errors
    }
  };
}
```

---

## 🎨 PASO 2: Cambios Frontend

### 2.1 Actualizar Tipos

**Archivo:** `src/types/attendance.types.ts`

```typescript
// Agregar interfaces nuevas

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

// Actualizar BulkApplyStatusDto para soportar courseAssignmentIds

export interface BulkApplyStatusDto {
  enrollmentIds: number[];
  date: string;
  attendanceStatusId: number;
  courseAssignmentIds?: number[];  // ← NUEVO
  notes?: string;
}
```

---

### 2.2 Crear Hook para Cursos

**Archivo:** `src/hooks/attendance/useAttendanceCourses.ts`

```typescript
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AttendanceCourse } from '@/types/attendance.types';

export function useAttendanceCourses(sectionId?: number) {
  const [courses, setCourses] = useState<AttendanceCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sectionId) return;

    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(
          `/api/attendance/configuration/courses-for-section/${sectionId}`
        );
        setCourses(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [sectionId]);

  return { courses, loading, error };
}
```

---

### 2.3 Actualizar Servicio de Asistencia

**Archivo:** `src/services/attendance.service.ts`

```typescript
// Agregar nuevo método para bulk by courses

async bulkByCourses(data: BulkAttendanceByCourseDto): Promise<BulkAttendanceResponse> {
  const response = await api.post('/api/attendance/bulk-by-courses', data);
  return response.data;
}

// Actualizar bulkApplyStatus para soportar cursos

async bulkApplyStatus(data: BulkApplyStatusDto): Promise<BulkAttendanceResponse> {
  const response = await api.post('/api/attendance/bulk-apply-status', data);
  return response.data;
}
```

---

### 2.4 Crear Componente para Selección de Cursos

**Archivo:** `src/components/features/attendance/components/attendance-controls/CourseSelector.tsx`

```typescript
import React, { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useAttendanceCourses } from '@/hooks/attendance/useAttendanceCourses';
import { AttendanceCourse } from '@/types/attendance.types';

interface CourseSelectorProps {
  sectionId: number;
  selectedCourseIds: number[];
  onSelectionChange: (courseIds: number[]) => void;
  disabled?: boolean;
}

export function CourseSelector({
  sectionId,
  selectedCourseIds,
  onSelectionChange,
  disabled = false
}: CourseSelectorProps) {
  const { courses, loading } = useAttendanceCourses(sectionId);

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

  if (loading) {
    return <div className="p-4 text-gray-500">Cargando cursos...</div>;
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">
          Cursos ({selectedCourseIds.length}/{courses.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          disabled={disabled || courses.length === 0}
        >
          {allSelected ? 'Limpiar' : 'Todos'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {courses.map(course => (
          <label key={course.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
            <Checkbox
              checked={selectedCourseIds.includes(course.id)}
              onCheckedChange={() => handleToggleCourse(course.id)}
              disabled={disabled}
            />
            <div className="flex-1">
              <div
                className="w-3 h-3 rounded-full inline-block mr-2"
                style={{ backgroundColor: course.color || '#6b7280' }}
              />
              <span className="text-sm font-medium">{course.name}</span>
              <span className="text-xs text-gray-500 ml-2">
                {course.teacherName}
              </span>
            </div>
          </label>
        ))}
      </div>

      {selectedCourseIds.length > 0 && (
        <div className="text-xs text-blue-600 dark:text-blue-400">
          ℹ️ La asistencia se registrará para todos los {selectedCourseIds.length} cursos seleccionados
        </div>
      )}
    </div>
  );
}
```

---

### 2.5 Actualizar AttendanceTable.tsx

**Cambios necesarios:**

```typescript
// Agregar estado para cursos seleccionados
const [selectedCourses, setSelectedCourses] = useState<number[]>([]);

// Actualizar handleBulkAction para pasar cursos
const handleBulkAction = useCallback(
  async (enrollmentIds: number[], attendanceStatusId: number) => {
    try {
      // Si hay cursos seleccionados, usar bulk-by-courses
      if (selectedCourses.length > 0) {
        await bulkByCourses({
          date: selectedDate.toISOString().split('T')[0],
          courseAssignmentIds: selectedCourses,
          attendances: enrollmentIds.map(id => ({
            enrollmentId: id,
            attendanceStatusId
          }))
        });
      } else {
        // Sino, usar bulk-apply-status (backwards compatible)
        await bulkApplyStatus({
          enrollmentIds,
          date: selectedDate.toISOString().split('T')[0],
          attendanceStatusId
        });
      }

      toast({
        title: 'Éxito',
        description: 'Asistencia registrada correctamente',
        variant: 'default'
      });

      if (onRefresh) await onRefresh();
      setSelectedStudents([]);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Error al registrar asistencia',
        variant: 'destructive'
      });
    }
  },
  [selectedDate, selectedCourses, onRefresh, bulkApplyStatus, bulkByCourses]
);

// En el JSX, agregar CourseSelector
return (
  <div className="space-y-4">
    <CourseSelector
      sectionId={sectionId!}
      selectedCourseIds={selectedCourses}
      onSelectionChange={setSelectedCourses}
    />
    
    {/* Resto del componente */}
  </div>
);
```

---

## 📊 Resumen de Cambios

### Backend

| Acción | Endpoint | Método | Estado |
|--------|----------|--------|--------|
| Obtener cursos de sección | `GET /api/attendance/configuration/courses-for-section/:sectionId` | GET | ❌ CREAR |
| Registrar asistencia por cursos | `POST /api/attendance/bulk-by-courses` | POST | ❌ CREAR |
| Aplicar estado a múltiples estudiantes | `POST /api/attendance/bulk-apply-status` | POST | ✅ ACTUALIZAR |

### Frontend

| Archivo | Cambio |
|---------|--------|
| `src/types/attendance.types.ts` | Agregar interfaces: `AttendanceCourse`, `BulkAttendanceByCourseDto` |
| `src/services/attendance.service.ts` | Agregar método `bulkByCourses()` |
| `src/hooks/attendance/useAttendanceCourses.ts` | CREAR nuevo hook |
| `src/components/.../CourseSelector.tsx` | CREAR nuevo componente |
| `src/components/.../AttendanceTable.tsx` | Integrar CourseSelector y actualizar lógica |
| `src/components/.../AttendanceCards.tsx` | Integrar CourseSelector (opcional) |

---

## 🚀 Flujo de Trabajo Recomendado

### Fase 1: Backend (1-2 días)
1. Crear DTO y validación para `bulk-by-courses`
2. Implementar endpoint `GET /api/attendance/configuration/courses-for-section/:sectionId`
3. Implementar endpoint `POST /api/attendance/bulk-by-courses`
4. Actualizar `POST /api/attendance/bulk-apply-status` para soportar cursos
5. Probar con Postman

### Fase 2: Frontend (1-2 días)
1. Actualizar tipos
2. Crear hook `useAttendanceCourses`
3. Actualizar servicio
4. Crear componente `CourseSelector`
5. Integrar en `AttendanceTable.tsx`
6. Probar flujo completo

---

## 🔍 Validaciones Importantes

### Backend
- ✅ `courseAssignmentId` existe
- ✅ `attendanceStatusId` existe
- ✅ El usuario tiene permisos
- ✅ Fecha es válida
- ✅ Máximo 500 estudiantes/operación (opcional)

### Frontend
- ✅ Al menos 1 curso seleccionado
- ✅ Al menos 1 estudiante seleccionado
- ✅ Estado de asistencia seleccionado
- ✅ Fecha válida

---

## 📝 Notas Importantes

1. **Backwards Compatibility:** El endpoint `bulk-apply-status` sigue funcionando sin `courseAssignmentIds` para asistencia general

2. **Múltiples Registros:** Un estudiante + fecha + 3 cursos = 3 registros en BD
   - Esto es correcto según tu schema

3. **Optimización:** El componente muestra contador de cursos seleccionados para que el usuario entienda el impacto

4. **UX:** Agrega tooltip explicativo: "La asistencia se registrará para todos los cursos seleccionados"

---

## ✅ Checklist de Implementación

### Backend
- [ ] Crear DTO `BulkAttendanceByCourseDto`
- [ ] Crear schema de validación Zod
- [ ] Implementar método service `getCoursesForSection()`
- [ ] Implementar método service `bulkByCourses()`
- [ ] Crear controlador GET `/api/attendance/configuration/courses-for-section/:sectionId`
- [ ] Crear controlador POST `/api/attendance/bulk-by-courses`
- [ ] Actualizar servicio `bulkApplyStatus()` para soportar `courseAssignmentIds`
- [ ] Actualizar controlador POST `/api/attendance/bulk-apply-status`
- [ ] Testing con Postman
- [ ] Documentación swagger

### Frontend
- [ ] Actualizar `src/types/attendance.types.ts`
- [ ] Crear `src/hooks/attendance/useAttendanceCourses.ts`
- [ ] Actualizar `src/services/attendance.service.ts`
- [ ] Crear `src/components/.../CourseSelector.tsx`
- [ ] Integrar en `AttendanceTable.tsx`
- [ ] Integrar en `AttendanceCards.tsx` (opcional)
- [ ] Testing en desarrollo
- [ ] Testing en producción

