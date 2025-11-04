# 📚 Documentación Frontend - Módulo Course Grades (Cursos por Grado)

## 📋 Tabla de Contenidos
- [Descripción General](#descripción-general)
- [Base URL](#base-url)
- [Tipos TypeScript](#tipos-typescript)
- [Endpoints](#endpoints)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Manejo de Errores](#manejo-de-errores)

---

## 🎯 Descripción General

El módulo **Course Grades** gestiona la relación entre cursos y grados escolares. Permite asignar cursos a grados específicos y definir si un curso es núcleo (obligatorio) o electivo.

### Características Principales:
- ✅ Asignar cursos a grados
- ✅ Definir si un curso es núcleo o electivo
- ✅ Listar cursos por grado
- ✅ Listar grados por curso
- ✅ Obtener estadísticas de asignaciones
- ✅ Paginación y filtros avanzados

---

## 🌐 Base URL

```
Base URL: /api/course-grades
```

**Autenticación:** Todas las peticiones requieren un token JWT en el header:
```
Authorization: Bearer <token>
```

---

## 📦 Tipos TypeScript

### Interfaces de Datos

```typescript
// Tipos básicos
interface CourseGrade {
  id: number;
  courseId: number;
  gradeId: number;
  isCore: boolean;
}

// Con relaciones completas
interface CourseGradeDetail {
  id: number;
  courseId: number;
  gradeId: number;
  isCore: boolean;
  course: {
    id: number;
    code: string;
    name: string;
    area: string | null;
    description?: string | null;
    isActive?: boolean;
  };
  grade: {
    id: number;
    name: string;
    level: string;
    order?: number;
    isActive?: boolean;
  };
}

// Respuesta paginada
interface PaginatedCourseGradesResponse {
  data: CourseGradeDetail[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Estadísticas
interface CourseGradeStats {
  courseId: number;
  totalGrades: number;
  coreGrades: number;
  electives: number;
}

// Para selectores
interface AvailableCourse {
  id: number;
  code: string;
  name: string;
  area: string | null;
  isActive: boolean;
}

interface AvailableGrade {
  id: number;
  name: string;
  level: string;
  order: number;
  isActive: boolean;
}
```

### DTOs

```typescript
// Crear nueva asignación
interface CreateCourseGradeDto {
  courseId: number;        // ID del curso (requerido)
  gradeId: number;         // ID del grado (requerido)
  isCore?: boolean;        // Si es curso núcleo (opcional, default: true)
}

// Actualizar asignación
interface UpdateCourseGradeDto {
  isCore?: boolean;        // Cambiar si es núcleo o electivo
}

// Parámetros de consulta
interface QueryCourseGradesDto {
  page?: number;           // Número de página (default: 1)
  limit?: number;          // Registros por página (default: 10, max: 100)
  courseId?: number;       // Filtrar por curso específico
  gradeId?: number;        // Filtrar por grado específico
  isCore?: boolean;        // Filtrar por tipo (núcleo/electivo)
  sortBy?: 'courseId' | 'gradeId' | 'isCore';  // Campo para ordenar
  sortOrder?: 'asc' | 'desc';                   // Orden ascendente/descendente
}
```

---

## 🔌 Endpoints

### 1️⃣ Obtener Grados Disponibles

**Propósito:** Obtener lista de todos los grados disponibles para poblar selectores.

```typescript
GET /api/course-grades/available/grades
```

**Permisos requeridos:** `course-grade:read`

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "1° Primaria",
      "level": "PRIMARY",
      "order": 1,
      "isActive": true
    },
    {
      "id": 2,
      "name": "2° Primaria",
      "level": "PRIMARY",
      "order": 2,
      "isActive": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 1000,
    "total": 11,
    "totalPages": 1
  }
}
```

---

### 2️⃣ Obtener Cursos Disponibles

**Propósito:** Obtener lista de todos los cursos disponibles para poblar selectores.

```typescript
GET /api/course-grades/available/courses
```

**Permisos requeridos:** `course-grade:read`

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "code": "MAT-001",
      "name": "Matemáticas Básicas",
      "area": "Ciencias Exactas",
      "isActive": true
    },
    {
      "id": 2,
      "code": "LEN-001",
      "name": "Lenguaje y Comunicación",
      "area": "Humanidades",
      "isActive": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 1000,
    "total": 25,
    "totalPages": 1
  }
}
```

---

### 3️⃣ Listar Asignaciones (Paginado con Filtros)

**Propósito:** Obtener lista paginada de asignaciones curso-grado con filtros opcionales.

```typescript
GET /api/course-grades?page=1&limit=10&courseId=1&isCore=true
```

**Permisos requeridos:** `course-grade:read`

**Query Parameters:**
| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| page | number | No | 1 | Número de página |
| limit | number | No | 10 | Registros por página (max: 100) |
| courseId | number | No | - | Filtrar por ID de curso |
| gradeId | number | No | - | Filtrar por ID de grado |
| isCore | boolean | No | - | Filtrar por tipo (true=núcleo, false=electivo) |
| sortBy | string | No | 'courseId' | Campo para ordenar (courseId, gradeId, isCore) |
| sortOrder | string | No | 'asc' | Orden (asc, desc) |

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": 1,
      "courseId": 1,
      "gradeId": 5,
      "isCore": true,
      "course": {
        "id": 1,
        "code": "MAT-001",
        "name": "Matemáticas Básicas",
        "area": "Ciencias Exactas"
      },
      "grade": {
        "id": 5,
        "name": "5° Primaria",
        "level": "PRIMARY"
      }
    },
    {
      "id": 2,
      "courseId": 1,
      "gradeId": 6,
      "isCore": true,
      "course": {
        "id": 1,
        "code": "MAT-001",
        "name": "Matemáticas Básicas",
        "area": "Ciencias Exactas"
      },
      "grade": {
        "id": 6,
        "name": "6° Primaria",
        "level": "PRIMARY"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

### 4️⃣ Obtener Asignación por ID

**Propósito:** Obtener detalles de una asignación específica.

```typescript
GET /api/course-grades/:id
```

**Permisos requeridos:** `course-grade:read-one`

**Path Parameters:**
- `id` (number): ID de la asignación

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "courseId": 1,
  "gradeId": 5,
  "isCore": true,
  "course": {
    "id": 1,
    "code": "MAT-001",
    "name": "Matemáticas Básicas",
    "area": "Ciencias Exactas"
  },
  "grade": {
    "id": 5,
    "name": "5° Primaria",
    "level": "PRIMARY"
  }
}
```

**Errores:**
- `404`: Asignación no encontrada

---

### 5️⃣ Obtener Grados por Curso

**Propósito:** Obtener todos los grados asignados a un curso específico.

```typescript
GET /api/course-grades/course/:courseId/grades
```

**Permisos requeridos:** `course-grade:read`

**Path Parameters:**
- `courseId` (number): ID del curso

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "courseId": 1,
    "gradeId": 5,
    "isCore": true,
    "course": {
      "id": 1,
      "code": "MAT-001",
      "name": "Matemáticas Básicas",
      "area": "Ciencias Exactas"
    },
    "grade": {
      "id": 5,
      "name": "5° Primaria",
      "level": "PRIMARY"
    }
  },
  {
    "id": 2,
    "courseId": 1,
    "gradeId": 6,
    "isCore": true,
    "course": {
      "id": 1,
      "code": "MAT-001",
      "name": "Matemáticas Básicas",
      "area": "Ciencias Exactas"
    },
    "grade": {
      "id": 6,
      "name": "6° Primaria",
      "level": "PRIMARY"
    }
  }
]
```

---

### 6️⃣ Obtener Cursos por Grado

**Propósito:** Obtener todos los cursos asignados a un grado específico.

```typescript
GET /api/course-grades/grade/:gradeId/courses
```

**Permisos requeridos:** `course-grade:read`

**Path Parameters:**
- `gradeId` (number): ID del grado

**Respuesta exitosa (200):**
```json
[
  {
    "id": 1,
    "courseId": 1,
    "gradeId": 5,
    "isCore": true,
    "course": {
      "id": 1,
      "code": "MAT-001",
      "name": "Matemáticas Básicas",
      "area": "Ciencias Exactas"
    },
    "grade": {
      "id": 5,
      "name": "5° Primaria",
      "level": "PRIMARY"
    }
  },
  {
    "id": 5,
    "courseId": 2,
    "gradeId": 5,
    "isCore": true,
    "course": {
      "id": 2,
      "code": "LEN-001",
      "name": "Lenguaje y Comunicación",
      "area": "Humanidades"
    },
    "grade": {
      "id": 5,
      "name": "5° Primaria",
      "level": "PRIMARY"
    }
  }
]
```

---

### 7️⃣ Obtener Estadísticas de Curso

**Propósito:** Obtener estadísticas sobre las asignaciones de un curso.

```typescript
GET /api/course-grades/:courseId/stats
```

**Permisos requeridos:** `course-grade:read`

**Path Parameters:**
- `courseId` (number): ID del curso

**Respuesta exitosa (200):**
```json
{
  "courseId": 1,
  "totalGrades": 11,
  "coreGrades": 8,
  "electives": 3
}
```

**Errores:**
- `404`: No hay asignaciones para el curso

---

### 8️⃣ Crear Nueva Asignación

**Propósito:** Crear una nueva asignación de curso a grado.

```typescript
POST /api/course-grades
```

**Permisos requeridos:** `course-grade:create`

**Request Body:**
```json
{
  "courseId": 1,
  "gradeId": 5,
  "isCore": true
}
```

**Validaciones:**
- `courseId`: Requerido, debe ser un número positivo
- `gradeId`: Requerido, debe ser un número positivo
- `isCore`: Opcional, valor booleano (default: true)

**Respuesta exitosa (201):**
```json
{
  "id": 1,
  "courseId": 1,
  "gradeId": 5,
  "isCore": true,
  "course": {
    "id": 1,
    "code": "MAT-001",
    "name": "Matemáticas Básicas",
    "area": "Ciencias Exactas"
  },
  "grade": {
    "id": 5,
    "name": "5° Primaria",
    "level": "PRIMARY"
  }
}
```

**Errores:**
- `400`: El curso o grado especificado no existe
- `409`: Ya existe una relación entre ese curso y grado

---

### 9️⃣ Actualizar Asignación

**Propósito:** Actualizar una asignación existente (principalmente para cambiar entre núcleo/electivo).

```typescript
PATCH /api/course-grades/:id
```

**Permisos requeridos:** `course-grade:update`

**Path Parameters:**
- `id` (number): ID de la asignación

**Request Body:**
```json
{
  "isCore": false
}
```

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "courseId": 1,
  "gradeId": 5,
  "isCore": false,
  "course": {
    "id": 1,
    "code": "MAT-001",
    "name": "Matemáticas Básicas",
    "area": "Ciencias Exactas"
  },
  "grade": {
    "id": 5,
    "name": "5° Primaria",
    "level": "PRIMARY"
  }
}
```

**Errores:**
- `404`: Asignación no encontrada

---

### 🔟 Eliminar Asignación

**Propósito:** Eliminar una asignación curso-grado.

```typescript
DELETE /api/course-grades/:id
```

**Permisos requeridos:** `course-grade:delete`

**Path Parameters:**
- `id` (number): ID de la asignación

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "courseId": 1,
  "gradeId": 5,
  "isCore": true,
  "course": {
    "id": 1,
    "code": "MAT-001",
    "name": "Matemáticas Básicas",
    "area": "Ciencias Exactas"
  },
  "grade": {
    "id": 5,
    "name": "5° Primaria",
    "level": "PRIMARY"
  }
}
```

**Errores:**
- `404`: Asignación no encontrada

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Servicio React/Next.js

```typescript
// services/courseGradesService.ts
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_URL = `${API_BASE}/api/course-grades`;

export interface CourseGrade {
  id: number;
  courseId: number;
  gradeId: number;
  isCore: boolean;
  course?: {
    id: number;
    code: string;
    name: string;
    area: string | null;
  };
  grade?: {
    id: number;
    name: string;
    level: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class CourseGradesService {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  // Obtener asignaciones paginadas
  async getAll(params?: {
    page?: number;
    limit?: number;
    courseId?: number;
    gradeId?: number;
    isCore?: boolean;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<PaginatedResponse<CourseGrade>> {
    const response = await axios.get(API_URL, {
      params,
      headers: this.getHeaders(),
    });
    return response.data;
  }

  // Obtener grados disponibles
  async getAvailableGrades() {
    const response = await axios.get(`${API_URL}/available/grades`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  // Obtener cursos disponibles
  async getAvailableCourses() {
    const response = await axios.get(`${API_URL}/available/courses`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  // Obtener por ID
  async getById(id: number): Promise<CourseGrade> {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  // Obtener grados por curso
  async getGradesByCourse(courseId: number): Promise<CourseGrade[]> {
    const response = await axios.get(`${API_URL}/course/${courseId}/grades`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  // Obtener cursos por grado
  async getCoursesByGrade(gradeId: number): Promise<CourseGrade[]> {
    const response = await axios.get(`${API_URL}/grade/${gradeId}/courses`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  // Obtener estadísticas
  async getStats(courseId: number) {
    const response = await axios.get(`${API_URL}/${courseId}/stats`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  // Crear asignación
  async create(data: {
    courseId: number;
    gradeId: number;
    isCore?: boolean;
  }): Promise<CourseGrade> {
    const response = await axios.post(API_URL, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  // Actualizar asignación
  async update(id: number, data: { isCore?: boolean }): Promise<CourseGrade> {
    const response = await axios.patch(`${API_URL}/${id}`, data, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  // Eliminar asignación
  async delete(id: number): Promise<CourseGrade> {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }
}

export default new CourseGradesService();
```

### Ejemplo 2: Hook Personalizado (React)

```typescript
// hooks/useCourseGrades.ts
import { useState, useEffect } from 'react';
import courseGradesService, { CourseGrade, PaginatedResponse } from '@/services/courseGradesService';
import { toast } from 'react-toastify';

export function useCourseGrades(params?: {
  page?: number;
  limit?: number;
  courseId?: number;
  gradeId?: number;
  isCore?: boolean;
}) {
  const [data, setData] = useState<PaginatedResponse<CourseGrade> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await courseGradesService.getAll(params);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar asignaciones');
      toast.error('Error al cargar asignaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params?.page, params?.limit, params?.courseId, params?.gradeId, params?.isCore]);

  return { data, loading, error, refetch: fetchData };
}

export function useAvailableData() {
  const [grades, setGrades] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [gradesData, coursesData] = await Promise.all([
          courseGradesService.getAvailableGrades(),
          courseGradesService.getAvailableCourses(),
        ]);
        setGrades(gradesData.data);
        setCourses(coursesData.data);
      } catch (err) {
        toast.error('Error al cargar datos disponibles');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { grades, courses, loading };
}
```

### Ejemplo 3: Componente de Lista (React)

```typescript
// components/CourseGrades/CourseGradesList.tsx
import React, { useState } from 'react';
import { useCourseGrades } from '@/hooks/useCourseGrades';
import courseGradesService from '@/services/courseGradesService';
import { toast } from 'react-toastify';

export default function CourseGradesList() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({
    courseId: undefined,
    gradeId: undefined,
    isCore: undefined,
  });

  const { data, loading, error, refetch } = useCourseGrades({
    page,
    limit,
    ...filters,
  });

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta asignación?')) return;

    try {
      await courseGradesService.delete(id);
      toast.success('Asignación eliminada exitosamente');
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const toggleCore = async (id: number, currentIsCore: boolean) => {
    try {
      await courseGradesService.update(id, { isCore: !currentIsCore });
      toast.success('Asignación actualizada');
      refetch();
    } catch (err: any) {
      toast.error('Error al actualizar');
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container">
      <h1>Asignaciones Curso-Grado</h1>

      {/* Tabla */}
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Curso</th>
            <th>Grado</th>
            <th>Tipo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>
                [{item.course?.code}] {item.course?.name}
              </td>
              <td>{item.grade?.name}</td>
              <td>
                <button onClick={() => toggleCore(item.id, item.isCore)}>
                  {item.isCore ? '✓ Núcleo' : '○ Electivo'}
                </button>
              </td>
              <td>
                <button onClick={() => handleDelete(item.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Anterior
        </button>
        <span>
          Página {data?.meta.page} de {data?.meta.totalPages}
        </span>
        <button
          disabled={page === data?.meta.totalPages}
          onClick={() => setPage(page + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
```

### Ejemplo 4: Formulario de Creación

```typescript
// components/CourseGrades/CreateCourseGradeForm.tsx
import React, { useState } from 'react';
import { useAvailableData } from '@/hooks/useCourseGrades';
import courseGradesService from '@/services/courseGradesService';
import { toast } from 'react-toastify';

export default function CreateCourseGradeForm({ onSuccess }: { onSuccess: () => void }) {
  const { grades, courses, loading } = useAvailableData();
  const [formData, setFormData] = useState({
    courseId: '',
    gradeId: '',
    isCore: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.courseId || !formData.gradeId) {
      toast.error('Debe seleccionar un curso y un grado');
      return;
    }

    try {
      setSubmitting(true);
      await courseGradesService.create({
        courseId: parseInt(formData.courseId),
        gradeId: parseInt(formData.gradeId),
        isCore: formData.isCore,
      });
      toast.success('Asignación creada exitosamente');
      setFormData({ courseId: '', gradeId: '', isCore: true });
      onSuccess();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Error al crear asignación';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Cargando opciones...</div>;

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>Nueva Asignación Curso-Grado</h2>

      <div className="form-group">
        <label>Curso *</label>
        <select
          value={formData.courseId}
          onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
          required
        >
          <option value="">Seleccione un curso</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              [{course.code}] {course.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Grado *</label>
        <select
          value={formData.gradeId}
          onChange={(e) => setFormData({ ...formData, gradeId: e.target.value })}
          required
        >
          <option value="">Seleccione un grado</option>
          {grades.map((grade) => (
            <option key={grade.id} value={grade.id}>
              {grade.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.isCore}
            onChange={(e) => setFormData({ ...formData, isCore: e.target.checked })}
          />
          Curso Núcleo (obligatorio)
        </label>
      </div>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Creando...' : 'Crear Asignación'}
      </button>
    </form>
  );
}
```

### Ejemplo 5: Vista de Cursos por Grado

```typescript
// components/CourseGrades/CoursesByGrade.tsx
import React, { useState, useEffect } from 'react';
import courseGradesService, { CourseGrade } from '@/services/courseGradesService';

export default function CoursesByGrade({ gradeId }: { gradeId: number }) {
  const [courses, setCourses] = useState<CourseGrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await courseGradesService.getCoursesByGrade(gradeId);
        setCourses(data);
      } catch (err) {
        console.error('Error al cargar cursos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [gradeId]);

  if (loading) return <div>Cargando cursos...</div>;

  const coreCourses = courses.filter((c) => c.isCore);
  const electives = courses.filter((c) => !c.isCore);

  return (
    <div>
      <h3>Cursos del Grado</h3>

      {coreCourses.length > 0 && (
        <div>
          <h4>Cursos Núcleo ({coreCourses.length})</h4>
          <ul>
            {coreCourses.map((item) => (
              <li key={item.id}>
                <strong>[{item.course?.code}]</strong> {item.course?.name}
                {item.course?.area && <span> - {item.course.area}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {electives.length > 0 && (
        <div>
          <h4>Cursos Electivos ({electives.length})</h4>
          <ul>
            {electives.map((item) => (
              <li key={item.id}>
                <strong>[{item.course?.code}]</strong> {item.course?.name}
                {item.course?.area && <span> - {item.course.area}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {courses.length === 0 && (
        <p>No hay cursos asignados a este grado.</p>
      )}
    </div>
  );
}
```

---

## ⚠️ Manejo de Errores

### Códigos de Estado HTTP

| Código | Significado | Descripción |
|--------|------------|-------------|
| 200 | OK | Operación exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Datos de entrada inválidos |
| 401 | Unauthorized | Token de autenticación inválido o faltante |
| 403 | Forbidden | Sin permisos suficientes |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (ej: asignación duplicada) |
| 500 | Internal Server Error | Error interno del servidor |

### Estructura de Respuesta de Error

```typescript
interface ErrorResponse {
  message: string;           // Mensaje descriptivo del error
  error?: string;            // Tipo de error
  statusCode: number;        // Código HTTP
}
```

### Ejemplo de Manejo de Errores

```typescript
try {
  await courseGradesService.create({
    courseId: 1,
    gradeId: 5,
    isCore: true,
  });
} catch (err: any) {
  const statusCode = err.response?.status;
  const message = err.response?.data?.message;

  switch (statusCode) {
    case 400:
      toast.error('Datos inválidos: ' + message);
      break;
    case 401:
      toast.error('Sesión expirada. Por favor inicie sesión nuevamente.');
      // Redirigir al login
      break;
    case 403:
      toast.error('No tiene permisos para realizar esta acción');
      break;
    case 404:
      toast.error('Recurso no encontrado');
      break;
    case 409:
      toast.error('Ya existe una asignación entre este curso y grado');
      break;
    default:
      toast.error('Error al procesar la solicitud');
  }
}
```

---

## 📝 Notas Importantes

### Permisos Requeridos

Para usar este módulo, el usuario debe tener los siguientes permisos:

- `course-grade:read` - Ver listados y detalles
- `course-grade:read-one` - Ver detalles de una asignación específica
- `course-grade:create` - Crear nuevas asignaciones
- `course-grade:update` - Actualizar asignaciones existentes
- `course-grade:delete` - Eliminar asignaciones

### Validaciones del Backend

1. **Unicidad:** No puede haber dos asignaciones con el mismo `courseId` y `gradeId`
2. **Existencia:** El `courseId` y `gradeId` deben existir en sus respectivas tablas
3. **IDs positivos:** Todos los IDs deben ser números enteros positivos
4. **Límite de paginación:** Máximo 100 registros por página

### Mejores Prácticas

1. **Cache:** Considera cachear las listas de cursos y grados disponibles
2. **Debounce:** En búsquedas, usa debounce para evitar múltiples llamadas
3. **Optimistic UI:** Actualiza la UI antes de confirmar con el servidor para mejor UX
4. **Manejo de errores:** Siempre maneja los errores y muestra mensajes claros al usuario
5. **Validación:** Valida los datos en el frontend antes de enviarlos al backend

---

## 🔄 Flujos Comunes

### Flujo 1: Asignar un Curso a Múltiples Grados

```typescript
async function assignCourseToMultipleGrades(courseId: number, gradeIds: number[]) {
  const results = [];
  
  for (const gradeId of gradeIds) {
    try {
      const result = await courseGradesService.create({
        courseId,
        gradeId,
        isCore: true,
      });
      results.push({ success: true, gradeId, data: result });
    } catch (err: any) {
      results.push({ success: false, gradeId, error: err.response?.data?.message });
    }
  }
  
  return results;
}
```

### Flujo 2: Obtener Currícula Completa de un Grado

```typescript
async function getGradeCurriculum(gradeId: number) {
  const assignments = await courseGradesService.getCoursesByGrade(gradeId);
  
  // Agrupar por área
  const byArea = assignments.reduce((acc, item) => {
    const area = item.course?.area || 'Sin área';
    if (!acc[area]) acc[area] = [];
    acc[area].push(item);
    return acc;
  }, {} as Record<string, typeof assignments>);
  
  return {
    gradeId,
    totalCourses: assignments.length,
    coreCourses: assignments.filter(a => a.isCore).length,
    electives: assignments.filter(a => !a.isCore).length,
    byArea,
  };
}
```

---

## 🎨 Sugerencias de UI

### Dashboard/Cards

```
┌─────────────────────────┐
│  📊 Estadísticas        │
├─────────────────────────┤
│  Total Asignaciones: 45 │
│  Cursos Núcleo: 30      │
│  Electivos: 15          │
└─────────────────────────┘
```

### Tabla de Asignaciones

```
┌────┬───────────────────┬──────────────┬──────────┬──────────┐
│ ID │ Curso             │ Grado        │ Tipo     │ Acciones │
├────┼───────────────────┼──────────────┼──────────┼──────────┤
│ 1  │ [MAT-001] Mat...  │ 5° Primaria  │ ✓ Núcleo │ 🗑️ ✏️    │
│ 2  │ [LEN-001] Leng... │ 5° Primaria  │ ✓ Núcleo │ 🗑️ ✏️    │
└────┴───────────────────┴──────────────┴──────────┴──────────┘
```

---

**¡Documentación lista para integración con tu frontend! 🚀**

Si necesitas ejemplos adicionales o aclaraciones sobre algún endpoint, no dudes en preguntar.
