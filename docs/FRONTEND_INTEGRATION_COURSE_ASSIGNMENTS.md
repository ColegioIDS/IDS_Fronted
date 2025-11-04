# 📚 Integración Frontend - Course Assignments (Asignaciones de Cursos)

## 📋 Tabla de Contenidos

1. [Información General](#información-general)
2. [Endpoints Disponibles](#endpoints-disponibles)
3. [Tipos TypeScript](#tipos-typescript)
4. [Ejemplos de Uso](#ejemplos-de-uso)
5. [Manejo de Errores](#manejo-de-errores)
6. [Casos de Uso Comunes](#casos-de-uso-comunes)

---

## 🎯 Información General

**Base URL:** `/api/course-assignments`

**Autenticación:** Todos los endpoints requieren autenticación JWT y permisos específicos.

**Permisos requeridos:**
- `course-assignment:create` - Crear asignaciones
- `course-assignment:read` - Leer asignaciones
- `course-assignment:read-one` - Leer una asignación específica
- `course-assignment:update` - Actualizar asignaciones
- `course-assignment:delete` - Eliminar asignaciones
- `course-assignment:bulk-create` - Crear múltiples asignaciones
- `course-assignment:bulk-update` - Actualizar múltiples asignaciones

---

## 📡 Endpoints Disponibles

### 1. Listar Asignaciones (Paginado)

**GET** `/api/course-assignments`

Obtiene todas las asignaciones con paginación y filtros.

**Query Parameters:**
```typescript
{
  page?: number;           // Página actual (default: 1)
  limit?: number;          // Items por página (default: 10)
  search?: string;         // Búsqueda por nombre de curso, código, profesor o sección
  sectionId?: number;      // Filtrar por sección
  courseId?: number;       // Filtrar por curso
  teacherId?: number;      // Filtrar por profesor
  gradeId?: number;        // Filtrar por grado
  assignmentType?: string; // 'titular' | 'apoyo' | 'temporal' | 'suplente'
  isActive?: boolean;      // Filtrar por estado activo/inactivo
  sortBy?: string;         // 'assignedAt' | 'teacherName' | 'courseName' | 'sectionName' | 'updatedAt'
  sortOrder?: string;      // 'asc' | 'desc'
}
```

**Respuesta:**
```typescript
{
  data: CourseAssignment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }
}
```

**Ejemplo:**
```bash
GET /api/course-assignments?page=1&limit=10&sectionId=5&isActive=true
```

---

### 2. Obtener Datos del Formulario

**GET** `/api/course-assignments/form-data`

Obtiene todos los datos necesarios para el formulario de asignaciones (secciones, cursos, profesores).

**Respuesta:**
```typescript
{
  sections: Array<{
    id: number;
    name: string;
    gradeId: number;
    gradeName: string;
    gradeLevel: string;
    capacity: number;
  }>;
  courses: Array<{
    id: number;
    name: string;
    code: string;
    area: string | null;
    isActive: boolean;
  }>;
  teachers: Array<{
    id: number;
    givenNames: string;
    lastNames: string;
    fullName: string;
    email: string | null;
    isActive: boolean;
  }>;
}
```

**Ejemplo de uso:**
```typescript
const response = await fetch('/api/course-assignments/form-data', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const formData = await response.json();
```

---

### 3. Obtener Datos de Asignaciones de una Sección

**GET** `/api/course-assignments/section/:sectionId/data`

Obtiene todas las asignaciones de una sección específica con información consolidada.

**Path Parameters:**
- `sectionId` (number): ID de la sección

**Respuesta:**
```typescript
{
  section: {
    id: number;
    name: string;
    capacity: number;
    gradeId: number;
    teacherId: number | null;
    grade: {
      id: number;
      name: string;
      level: string;
    };
    teacher: {
      id: number;
      givenNames: string;
      lastNames: string;
      fullName: string;
      email: string | null;
    } | null;
  };
  assignments: Array<{
    id: number;
    courseId: number;
    teacherId: number;
    assignmentType: string;
    isActive: boolean;
    assignedAt: Date;
    notes: string | null;
    course: {
      id: number;
      code: string;
      name: string;
      area: string | null;
      color: string | null;
    };
    teacher: {
      id: number;
      givenNames: string;
      lastNames: string;
      fullName: string;
      email: string | null;
    };
    _count: {
      schedules: number;
      history: number;
    };
  }>;
  totalAssignments: number;
}
```

---

### 4. Obtener Asignaciones por Sección

**GET** `/api/course-assignments/section/:sectionId`

Obtiene las asignaciones activas de una sección.

**Path Parameters:**
- `sectionId` (number): ID de la sección

---

### 5. Obtener Asignaciones por Grado

**GET** `/api/course-assignments/grade/:gradeId`

Obtiene las asignaciones activas de un grado.

**Path Parameters:**
- `gradeId` (number): ID del grado

---

### 6. Obtener Cursos de un Profesor

**GET** `/api/course-assignments/teacher/:teacherId/courses`

Obtiene todos los cursos asignados a un profesor.

**Path Parameters:**
- `teacherId` (number): ID del profesor

---

### 7. Obtener Estadísticas

**GET** `/api/course-assignments/stats`

Obtiene estadísticas generales de asignaciones.

**Respuesta:**
```typescript
{
  totalAssignments: number;
  activeAssignments: number;
  inactiveAssignments: number;
  byAssignmentType: {
    titular: number;
    apoyo: number;
    temporal: number;
    suplente: number;
  };
  teachersWithAssignments: number;
  sectionsWithAssignments: number;
  coursesAssigned: number;
}
```

---

### 8. Obtener una Asignación por ID

**GET** `/api/course-assignments/:id`

Obtiene una asignación específica con todos sus detalles.

**Path Parameters:**
- `id` (number): ID de la asignación

**Respuesta:**
```typescript
{
  id: number;
  sectionId: number;
  courseId: number;
  teacherId: number;
  assignmentType: string;
  isActive: boolean;
  assignedAt: Date;
  notes: string | null;
  section: {
    id: number;
    name: string;
    capacity: number;
    gradeId: number;
    grade: {
      id: number;
      name: string;
      level: string;
      order: number;
    };
  };
  course: {
    id: number;
    code: string;
    name: string;
    area: string | null;
    color: string | null;
    isActive: boolean;
  };
  teacher: {
    id: number;
    givenNames: string;
    lastNames: string;
    email: string | null;
  };
  schedules?: Array<{
    id: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    classroom: string | null;
  }>;
  history?: Array<{
    id: number;
    teacherId: number;
    assignedAt: Date;
    unassignedAt: Date | null;
    reason: string | null;
  }>;
  _count?: {
    schedules: number;
    history: number;
  };
}
```

---

### 9. Crear Asignación

**POST** `/api/course-assignments`

Crea una nueva asignación de curso.

**Body:**
```typescript
{
  sectionId: number;                                    // Requerido
  courseId: number;                                     // Requerido
  teacherId: number;                                    // Requerido
  assignmentType: 'titular' | 'apoyo' | 'temporal' | 'suplente';  // Default: 'titular'
  notes?: string;                                       // Opcional, máx 500 caracteres
}
```

**Validaciones:**
- No puede existir otra asignación del mismo curso en la misma sección
- El profesor debe estar activo
- El curso debe estar activo
- El profesor no puede tener más de 15 cursos asignados

**Ejemplo:**
```typescript
const newAssignment = {
  sectionId: 5,
  courseId: 12,
  teacherId: 8,
  assignmentType: 'titular',
  notes: 'Profesor titular de matemáticas'
};

const response = await fetch('/api/course-assignments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newAssignment)
});
```

---

### 10. Actualizar Asignación

**PATCH** `/api/course-assignments/:id`

Actualiza una asignación existente.

**Path Parameters:**
- `id` (number): ID de la asignación

**Body:**
```typescript
{
  teacherId?: number;        // Opcional
  assignmentType?: string;   // Opcional
  notes?: string;            // Opcional
  isActive?: boolean;        // Opcional
}
```

**Nota:** Al cambiar el profesor, se crea automáticamente un registro en el historial.

**Ejemplo:**
```typescript
const updates = {
  teacherId: 10,
  notes: 'Cambio de profesor por licencia'
};

await fetch('/api/course-assignments/5', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(updates)
});
```

---

### 11. Eliminar Asignación

**DELETE** `/api/course-assignments/:id`

Elimina una asignación (soft o hard delete dependiendo si tiene horarios).

**Path Parameters:**
- `id` (number): ID de la asignación

**Respuesta:**
```typescript
{
  message: string;
  deleted: boolean;  // true = eliminación permanente, false = desactivación
}
```

**Comportamiento:**
- Si la asignación tiene horarios relacionados: **Soft delete** (solo desactiva)
- Si no tiene horarios: **Hard delete** (elimina permanentemente)

---

### 12. Crear Múltiples Asignaciones

**POST** `/api/course-assignments/bulk`

Crea múltiples asignaciones en una sola operación.

**Body:**
```typescript
{
  assignments: Array<{
    sectionId: number;
    courseId: number;
    teacherId: number;
    assignmentType?: 'titular' | 'apoyo' | 'temporal' | 'suplente';
    notes?: string;
  }>;
}
```

**Respuesta:**
```typescript
{
  created: CourseAssignment[];
  failed: Array<{
    data: CreateCourseAssignmentDto;
    error: string;
  }>;
}
```

**Ejemplo:**
```typescript
const bulkData = {
  assignments: [
    {
      sectionId: 5,
      courseId: 12,
      teacherId: 8,
      assignmentType: 'titular'
    },
    {
      sectionId: 5,
      courseId: 13,
      teacherId: 9,
      assignmentType: 'titular'
    }
  ]
};

const response = await fetch('/api/course-assignments/bulk', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(bulkData)
});
```

---

### 13. Actualizar Múltiples Asignaciones

**PATCH** `/api/course-assignments/bulk`

Actualiza múltiples asignaciones en una sola operación.

**Body:**
```typescript
{
  assignments: Array<{
    id: number;
    data: {
      teacherId?: number;
      assignmentType?: string;
      notes?: string;
      isActive?: boolean;
    };
  }>;
}
```

**Respuesta:**
```typescript
{
  updated: CourseAssignment[];
  failed: Array<{
    id: number;
    data: UpdateCourseAssignmentDto;
    error: string;
  }>;
}
```

---

## 📘 Tipos TypeScript

```typescript
// Tipos de asignación
type AssignmentType = 'titular' | 'apoyo' | 'temporal' | 'suplente';

// Asignación básica
interface CourseAssignment {
  id: number;
  sectionId: number;
  courseId: number;
  teacherId: number;
  assignmentType: AssignmentType;
  isActive: boolean;
  assignedAt: Date;
  notes: string | null;
  section: {
    id: number;
    name: string;
    capacity: number;
    gradeId: number;
    grade: {
      id: number;
      name: string;
      level: string;
      order: number;
    };
  };
  course: {
    id: number;
    code: string;
    name: string;
    area: string | null;
    color: string | null;
    isActive: boolean;
  };
  teacher: {
    id: number;
    givenNames: string;
    lastNames: string;
    email: string | null;
  };
  _count?: {
    schedules: number;
    history: number;
  };
}

// Parámetros de filtrado
interface CourseAssignmentFilters {
  page?: number;
  limit?: number;
  search?: string;
  sectionId?: number;
  courseId?: number;
  teacherId?: number;
  gradeId?: number;
  assignmentType?: AssignmentType;
  isActive?: boolean;
  sortBy?: 'assignedAt' | 'teacherName' | 'courseName' | 'sectionName' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// Respuesta paginada
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Crear asignación
interface CreateCourseAssignmentDto {
  sectionId: number;
  courseId: number;
  teacherId: number;
  assignmentType?: AssignmentType;
  notes?: string;
}

// Actualizar asignación
interface UpdateCourseAssignmentDto {
  teacherId?: number;
  assignmentType?: AssignmentType;
  notes?: string;
  isActive?: boolean;
}
```

---

## 💻 Ejemplos de Uso

### Ejemplo 1: Listar Asignaciones de una Sección

```typescript
import { useState, useEffect } from 'react';

interface CourseAssignmentsListProps {
  sectionId: number;
}

export function CourseAssignmentsList({ sectionId }: CourseAssignmentsListProps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `/api/course-assignments/section/${sectionId}/data`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (!response.ok) throw new Error('Error al cargar datos');
        
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [sectionId]);

  if (loading) return <div>Cargando...</div>;
  if (!data) return <div>No hay datos</div>;

  return (
    <div>
      <h2>Sección: {data.section.name}</h2>
      <p>Grado: {data.section.grade.name}</p>
      <p>Total de asignaciones: {data.totalAssignments}</p>

      <table>
        <thead>
          <tr>
            <th>Curso</th>
            <th>Profesor</th>
            <th>Tipo</th>
            <th>Horarios</th>
          </tr>
        </thead>
        <tbody>
          {data.assignments.map((assignment) => (
            <tr key={assignment.id}>
              <td>{assignment.course.name}</td>
              <td>{assignment.teacher.fullName}</td>
              <td>{assignment.assignmentType}</td>
              <td>{assignment._count.schedules} horarios</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

### Ejemplo 2: Formulario de Crear Asignación

```typescript
import { useState, useEffect } from 'react';

export function CreateAssignmentForm() {
  const [formData, setFormData] = useState(null);
  const [assignment, setAssignment] = useState({
    sectionId: '',
    courseId: '',
    teacherId: '',
    assignmentType: 'titular',
    notes: ''
  });

  useEffect(() => {
    async function loadFormData() {
      const response = await fetch('/api/course-assignments/form-data', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setFormData(data);
    }
    loadFormData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/course-assignments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sectionId: parseInt(assignment.sectionId),
          courseId: parseInt(assignment.courseId),
          teacherId: parseInt(assignment.teacherId),
          assignmentType: assignment.assignmentType,
          notes: assignment.notes || undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      alert('Asignación creada exitosamente');
      // Redirigir o limpiar formulario
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  if (!formData) return <div>Cargando...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Sección:</label>
        <select
          value={assignment.sectionId}
          onChange={(e) => setAssignment({ ...assignment, sectionId: e.target.value })}
          required
        >
          <option value="">Seleccione una sección</option>
          {formData.sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.gradeName} - {section.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Curso:</label>
        <select
          value={assignment.courseId}
          onChange={(e) => setAssignment({ ...assignment, courseId: e.target.value })}
          required
        >
          <option value="">Seleccione un curso</option>
          {formData.courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} - {course.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Profesor:</label>
        <select
          value={assignment.teacherId}
          onChange={(e) => setAssignment({ ...assignment, teacherId: e.target.value })}
          required
        >
          <option value="">Seleccione un profesor</option>
          {formData.teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.fullName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Tipo de Asignación:</label>
        <select
          value={assignment.assignmentType}
          onChange={(e) => setAssignment({ ...assignment, assignmentType: e.target.value })}
        >
          <option value="titular">Titular</option>
          <option value="apoyo">Apoyo</option>
          <option value="temporal">Temporal</option>
          <option value="suplente">Suplente</option>
        </select>
      </div>

      <div>
        <label>Notas:</label>
        <textarea
          value={assignment.notes}
          onChange={(e) => setAssignment({ ...assignment, notes: e.target.value })}
          maxLength={500}
          placeholder="Notas adicionales (opcional)"
        />
      </div>

      <button type="submit">Crear Asignación</button>
    </form>
  );
}
```

---

### Ejemplo 3: Tabla con Paginación

```typescript
import { useState, useEffect } from 'react';

export function AssignmentsTable() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    limit: 10,
    search: '',
    isActive: true
  });

  useEffect(() => {
    async function fetchAssignments() {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: filters.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.isActive !== undefined && { isActive: filters.isActive.toString() })
      });

      const response = await fetch(`/api/course-assignments?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      setData(result);
    }

    fetchAssignments();
  }, [page, filters]);

  if (!data) return <div>Cargando...</div>;

  return (
    <div>
      <div className="filters">
        <input
          type="text"
          placeholder="Buscar..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        
        <label>
          <input
            type="checkbox"
            checked={filters.isActive}
            onChange={(e) => setFilters({ ...filters, isActive: e.target.checked })}
          />
          Solo activos
        </label>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Sección</th>
            <th>Curso</th>
            <th>Profesor</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.data.map((assignment) => (
            <tr key={assignment.id}>
              <td>{assignment.id}</td>
              <td>{assignment.section.name}</td>
              <td>{assignment.course.name}</td>
              <td>{assignment.teacher.givenNames} {assignment.teacher.lastNames}</td>
              <td>{assignment.assignmentType}</td>
              <td>{assignment.isActive ? 'Activo' : 'Inactivo'}</td>
              <td>
                <button onClick={() => handleEdit(assignment.id)}>Editar</button>
                <button onClick={() => handleDelete(assignment.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          disabled={!data.meta.hasPrevPage}
          onClick={() => setPage(page - 1)}
        >
          Anterior
        </button>
        
        <span>
          Página {data.meta.page} de {data.meta.totalPages}
        </span>
        
        <button
          disabled={!data.meta.hasNextPage}
          onClick={() => setPage(page + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
```

---

### Ejemplo 4: Dashboard de Estadísticas

```typescript
import { useState, useEffect } from 'react';

export function AssignmentsStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      const response = await fetch('/api/course-assignments/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStats(data);
    }
    fetchStats();
  }, []);

  if (!stats) return <div>Cargando estadísticas...</div>;

  return (
    <div className="stats-dashboard">
      <div className="stat-card">
        <h3>Total de Asignaciones</h3>
        <p className="stat-value">{stats.totalAssignments}</p>
      </div>

      <div className="stat-card">
        <h3>Asignaciones Activas</h3>
        <p className="stat-value">{stats.activeAssignments}</p>
      </div>

      <div className="stat-card">
        <h3>Profesores con Cursos</h3>
        <p className="stat-value">{stats.teachersWithAssignments}</p>
      </div>

      <div className="stat-card">
        <h3>Secciones con Cursos</h3>
        <p className="stat-value">{stats.sectionsWithAssignments}</p>
      </div>

      <div className="stat-card">
        <h3>Por Tipo de Asignación</h3>
        <ul>
          <li>Titular: {stats.byAssignmentType.titular || 0}</li>
          <li>Apoyo: {stats.byAssignmentType.apoyo || 0}</li>
          <li>Temporal: {stats.byAssignmentType.temporal || 0}</li>
          <li>Suplente: {stats.byAssignmentType.suplente || 0}</li>
        </ul>
      </div>
    </div>
  );
}
```

---

## ⚠️ Manejo de Errores

### Códigos de Error Comunes

```typescript
// 400 - Bad Request
{
  statusCode: 400,
  message: "Validation error message",
  error: "Bad Request"
}

// 404 - Not Found
{
  statusCode: 404,
  message: "Asignación no encontrada",
  error: "Not Found"
}

// 409 - Conflict
{
  statusCode: 409,
  message: "Ya existe una asignación para este curso en esta sección",
  error: "Conflict"
}

// 401 - Unauthorized
{
  statusCode: 401,
  message: "Unauthorized",
  error: "Unauthorized"
}

// 403 - Forbidden
{
  statusCode: 403,
  message: "Insufficient permissions",
  error: "Forbidden"
}
```

### Ejemplo de Manejo de Errores

```typescript
async function createAssignment(data: CreateCourseAssignmentDto) {
  try {
    const response = await fetch('/api/course-assignments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      
      switch (response.status) {
        case 400:
          throw new Error(`Validación: ${error.message}`);
        case 404:
          throw new Error('Recurso no encontrado');
        case 409:
          throw new Error('Ya existe una asignación con estos datos');
        case 401:
          throw new Error('Sesión expirada. Por favor inicie sesión nuevamente');
        case 403:
          throw new Error('No tiene permisos para realizar esta acción');
        default:
          throw new Error('Error al crear la asignación');
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

---

## 🎯 Casos de Uso Comunes

### 1. Ver Horario de una Sección

```typescript
async function getSectionSchedule(sectionId: number) {
  const response = await fetch(
    `/api/course-assignments/section/${sectionId}/data`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  const data = await response.json();
  
  // data.assignments contiene todos los cursos con sus horarios
  data.assignments.forEach(assignment => {
    console.log(`${assignment.course.name} - ${assignment.teacher.fullName}`);
    console.log(`Horarios: ${assignment._count.schedules}`);
  });
}
```

### 2. Cambiar Profesor de un Curso

```typescript
async function changeTeacher(assignmentId: number, newTeacherId: number, reason: string) {
  const response = await fetch(`/api/course-assignments/${assignmentId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      teacherId: newTeacherId,
      notes: reason
    })
  });

  if (!response.ok) {
    throw new Error('Error al cambiar profesor');
  }

  // Se crea automáticamente un registro en el historial
  return await response.json();
}
```

### 3. Asignar Múltiples Cursos a una Sección

```typescript
async function assignCoursesToSection(sectionId: number, assignments: Array<{courseId: number, teacherId: number}>) {
  const bulkData = {
    assignments: assignments.map(a => ({
      sectionId,
      courseId: a.courseId,
      teacherId: a.teacherId,
      assignmentType: 'titular'
    }))
  };

  const response = await fetch('/api/course-assignments/bulk', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bulkData)
  });

  const result = await response.json();
  
  console.log(`Creadas: ${result.created.length}`);
  console.log(`Fallidas: ${result.failed.length}`);
  
  if (result.failed.length > 0) {
    result.failed.forEach(f => {
      console.error(`Error en curso ${f.data.courseId}: ${f.error}`);
    });
  }
}
```

### 4. Validar Carga Académica de un Profesor

```typescript
async function checkTeacherLoad(teacherId: number) {
  const response = await fetch(
    `/api/course-assignments/teacher/${teacherId}/courses`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  const courses = await response.json();
  
  const MAX_COURSES = 15;
  const currentLoad = courses.length;
  
  return {
    courses: courses.length,
    canAssignMore: currentLoad < MAX_COURSES,
    remaining: MAX_COURSES - currentLoad
  };
}
```

---

## 📝 Notas Importantes

1. **Límites:**
   - Un profesor puede tener máximo **15 cursos** asignados
   - No se puede asignar el mismo curso dos veces a la misma sección

2. **Eliminación:**
   - Si una asignación tiene horarios, solo se desactiva (soft delete)
   - Si no tiene horarios, se elimina permanentemente (hard delete)

3. **Historial:**
   - Cada cambio de profesor se registra automáticamente en el historial

4. **Estados:**
   - `isActive: true` - Asignación activa
   - `isActive: false` - Asignación desactivada (pero no eliminada)

5. **Tipos de Asignación:**
   - `titular` - Profesor principal del curso
   - `apoyo` - Profesor de apoyo
   - `temporal` - Asignación temporal
   - `suplente` - Profesor suplente

---

## 🚀 Tips de Optimización

1. **Caché:** Considera usar React Query o SWR para cachear las llamadas a `/form-data`
2. **Paginación:** Usa `limit` bajo (10-20) para mejor rendimiento
3. **Búsqueda:** Implementa debouncing en los campos de búsqueda
4. **Actualizaciones:** Usa optimistic updates para mejor UX

---

¿Necesitas más ejemplos o tienes alguna duda? 🤔
