# 🎓 GUÍA DE INTEGRACIÓN - COURSE-GRADES EN FRONTEND

**Última actualización:** 3 Noviembre 2025
**Estado:** ✅ Listo para integración
**Framework:** Compatible con React, Vue, Angular

---

## 📋 TABLA DE CONTENIDOS

1. [Descripción General](#descripción-general)
2. [Endpoints Disponibles](#endpoints-disponibles)
3. [Configuración Inicial](#configuración-inicial)
4. [Implementación en React](#implementación-en-react)
5. [Ejemplos de Uso](#ejemplos-de-uso)
6. [Manejo de Errores](#manejo-de-errores)
7. [Permisos RBAC](#permisos-rbac)
8. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 🎯 Descripción General

**CourseGrades** es el módulo que gestiona la relación entre **Cursos** y **Grados** académicos. Permite:

✅ Asignar cursos a grados específicos
✅ Marcar si un curso es obligatorio (núcleo) o electivo
✅ Obtener grados por curso
✅ Obtener cursos por grado
✅ Ver estadísticas de asignaciones

### Relación Visual

```
GRADO 1 (Primer Grado - Primaria)
├── Español (Obligatorio)
├── Matemáticas (Obligatorio)
├── English (Obligatorio)
├── Ciencias Naturales (Obligatorio)
├── Estudios Sociales (Obligatorio)
├── Artes Plásticas (Electivo)
├── Música (Electivo)
└── Educación Física (Electivo)

GRADO 2 (Segundo Grado - Primaria)
├── Español (Obligatorio)
├── Matemáticas (Obligatorio)
...
```

---

## 🔧 ENDPOINTS DISPONIBLES

### 1️⃣ Obtener Grados Disponibles

```http
GET /api/course-grades/available/grades
```

**Descripción:** Lista de grados activos para selectores
**Permiso:** `course-grade:read`

**Ejemplo cURL:**
```bash
curl -X GET http://localhost:3000/api/course-grades/available/grades \
  -H "Authorization: Bearer TOKEN"
```

**Respuesta (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Primer Grado",
      "level": "Primaria",
      "order": 1,
      "isActive": true
    },
    {
      "id": 2,
      "name": "Segundo Grado",
      "level": "Primaria",
      "order": 2,
      "isActive": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 1000,
    "total": 2,
    "totalPages": 1
  }
}
```

---

### 2️⃣ Obtener Cursos Disponibles

```http
GET /api/course-grades/available/courses
```

**Descripción:** Lista de cursos activos con detalles
**Permiso:** `course-grade:read`

**Ejemplo cURL:**
```bash
curl -X GET http://localhost:3000/api/course-grades/available/courses \
  -H "Authorization: Bearer TOKEN"
```

**Respuesta (200):**
```json
{
  "data": [
    {
      "id": 1,
      "code": "ESP",
      "name": "Español",
      "area": "Lenguaje",
      "color": "#FF6B6B",
      "isActive": true,
      "_count": {
        "courseGrades": 3,
        "assignments": 0,
        "studentGrades": 0,
        "courseAssignments": 0,
        "schedules": 0
      }
    },
    {
      "id": 2,
      "code": "MAT",
      "name": "Matemáticas",
      "area": "Matemática",
      "color": "#4ECDC4",
      "isActive": true,
      "_count": {
        "courseGrades": 3,
        "assignments": 0,
        "studentGrades": 0,
        "courseAssignments": 0,
        "schedules": 0
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 1000,
    "total": 10,
    "totalPages": 1
  }
}
```

---

### 3️⃣ Listar todas las Asignaciones

```http
GET /api/course-grades?page=1&limit=10
```

**Descripción:** Todas las relaciones Curso-Grado con paginación
**Permiso:** `course-grade:read`

**Query Parameters:**
- `page` - Número de página (default: 1)
- `limit` - Registros por página (default: 10, max: 100)
- `courseId` - Filtrar por curso
- `gradeId` - Filtrar por grado
- `isCore` - Filtrar por tipo (true/false)
- `sortBy` - Campo para ordenar (courseId, gradeId, isCore)
- `sortOrder` - Orden (asc, desc)

**Ejemplo:**
```bash
curl "http://localhost:3000/api/course-grades?gradeId=1&isCore=true" \
  -H "Authorization: Bearer TOKEN"
```

---

### 4️⃣ Obtener Asignación por ID

```http
GET /api/course-grades/:id
```

**Descripción:** Detalles de una asignación específica
**Permiso:** `course-grade:read-one`

---

### 5️⃣ Obtener Cursos por Grado

```http
GET /api/course-grades/grade/:gradeId/courses
```

**Descripción:** Todos los cursos asignados a un grado
**Permiso:** `course-grade:read`

**Ejemplo:**
```bash
curl http://localhost:3000/api/course-grades/grade/1/courses \
  -H "Authorization: Bearer TOKEN"
```

---

### 6️⃣ Obtener Grados por Curso

```http
GET /api/course-grades/course/:courseId/grades
```

**Descripción:** Todos los grados donde se enseña un curso
**Permiso:** `course-grade:read`

**Ejemplo:**
```bash
curl http://localhost:3000/api/course-grades/course/1/grades \
  -H "Authorization: Bearer TOKEN"
```

---

### 7️⃣ Crear Asignación

```http
POST /api/course-grades
```

**Descripción:** Crear nueva relación Curso-Grado
**Permiso:** `course-grade:create`

**Body:**
```json
{
  "courseId": 1,
  "gradeId": 1,
  "isCore": true
}
```

**Validaciones:**
- `courseId` (required) - ID válido del curso
- `gradeId` (required) - ID válido del grado
- `isCore` (optional) - Boolean, default: true
- No puede haber duplicados (courseId, gradeId) únicos

**Respuesta (201):**
```json
{
  "id": 1,
  "courseId": 1,
  "gradeId": 1,
  "isCore": true,
  "course": { ... },
  "grade": { ... }
}
```

**Ejemplo cURL:**
```bash
curl -X POST http://localhost:3000/api/course-grades \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": 1,
    "gradeId": 1,
    "isCore": true
  }'
```

---

### 8️⃣ Actualizar Asignación

```http
PATCH /api/course-grades/:id
```

**Descripción:** Actualizar si es curso núcleo o electivo
**Permiso:** `course-grade:update`

**Body:**
```json
{
  "isCore": false
}
```

**Ejemplo:**
```bash
curl -X PATCH http://localhost:3000/api/course-grades/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "isCore": false }'
```

---

### 9️⃣ Eliminar Asignación

```http
DELETE /api/course-grades/:id
```

**Descripción:** Eliminar relación Curso-Grado
**Permiso:** `course-grade:delete`

**Ejemplo:**
```bash
curl -X DELETE http://localhost:3000/api/course-grades/1 \
  -H "Authorization: Bearer TOKEN"
```

---

## ⚙️ CONFIGURACIÓN INICIAL

### 1. Instalar dependencias

```bash
npm install axios
# o si usas fetch (ya incluido en navegadores)
```

### 2. Crear archivo de configuración

Crea `src/config/api.config.ts`:

```typescript
// src/config/api.config.ts

export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  ENDPOINTS: {
    COURSE_GRADES: {
      BASE: '/api/course-grades',
      AVAILABLE_GRADES: '/api/course-grades/available/grades',
      AVAILABLE_COURSES: '/api/course-grades/available/courses',
      BY_GRADE: (gradeId: number) => `/api/course-grades/grade/${gradeId}/courses`,
      BY_COURSE: (courseId: number) => `/api/course-grades/course/${courseId}/grades`,
    },
  },
  TIMEOUT: 10000,
};

export const getAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});
```

### 3. Crear servicio API

Crea `src/services/courseGradesService.ts`:

```typescript
// src/services/courseGradesService.ts

import axios, { AxiosInstance } from 'axios';
import { API_CONFIG, getAuthHeaders } from '../config/api.config';

interface Grade {
  id: number;
  name: string;
  level: string;
  order: number;
  isActive: boolean;
}

interface Course {
  id: number;
  code: string;
  name: string;
  area: string;
  color: string;
  isActive: boolean;
  _count: {
    courseGrades: number;
    assignments: number;
    studentGrades: number;
    courseAssignments: number;
    schedules: number;
  };
}

interface CourseGrade {
  id: number;
  courseId: number;
  gradeId: number;
  isCore: boolean;
  course?: Course;
  grade?: Grade;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class CourseGradesService {
  private api: AxiosInstance;

  constructor(token: string) {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: getAuthHeaders(token),
    });
  }

  /**
   * Obtiene todos los grados disponibles
   */
  async getAvailableGrades(): Promise<Grade[]> {
    const response = await this.api.get<PaginatedResponse<Grade>>(
      API_CONFIG.ENDPOINTS.COURSE_GRADES.AVAILABLE_GRADES
    );
    return response.data.data;
  }

  /**
   * Obtiene todos los cursos disponibles
   */
  async getAvailableCourses(): Promise<Course[]> {
    const response = await this.api.get<PaginatedResponse<Course>>(
      API_CONFIG.ENDPOINTS.COURSE_GRADES.AVAILABLE_COURSES
    );
    return response.data.data;
  }

  /**
   * Obtiene ambos en paralelo
   */
  async getAvailableData(): Promise<{
    grades: Grade[];
    courses: Course[];
  }> {
    const [gradesRes, coursesRes] = await Promise.all([
      this.api.get<PaginatedResponse<Grade>>(
        API_CONFIG.ENDPOINTS.COURSE_GRADES.AVAILABLE_GRADES
      ),
      this.api.get<PaginatedResponse<Course>>(
        API_CONFIG.ENDPOINTS.COURSE_GRADES.AVAILABLE_COURSES
      ),
    ]);

    return {
      grades: gradesRes.data.data,
      courses: coursesRes.data.data,
    };
  }

  /**
   * Obtiene cursos por grado
   */
  async getCoursesByGrade(gradeId: number): Promise<Course[]> {
    const response = await this.api.get<Course[]>(
      API_CONFIG.ENDPOINTS.COURSE_GRADES.BY_GRADE(gradeId)
    );
    return response.data;
  }

  /**
   * Obtiene grados por curso
   */
  async getGradesByCourse(courseId: number): Promise<Grade[]> {
    const response = await this.api.get<Grade[]>(
      API_CONFIG.ENDPOINTS.COURSE_GRADES.BY_COURSE(courseId)
    );
    return response.data;
  }

  /**
   * Lista todas las asignaciones
   */
  async listAll(
    page = 1,
    limit = 10,
    filters?: {
      courseId?: number;
      gradeId?: number;
      isCore?: boolean;
    }
  ): Promise<PaginatedResponse<CourseGrade>> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(filters?.courseId && { courseId: String(filters.courseId) }),
      ...(filters?.gradeId && { gradeId: String(filters.gradeId) }),
      ...(filters?.isCore !== undefined && { isCore: String(filters.isCore) }),
    });

    const response = await this.api.get<PaginatedResponse<CourseGrade>>(
      `${API_CONFIG.ENDPOINTS.COURSE_GRADES.BASE}?${params}`
    );
    return response.data;
  }

  /**
   * Obtiene una asignación por ID
   */
  async getById(id: number): Promise<CourseGrade> {
    const response = await this.api.get<CourseGrade>(
      `${API_CONFIG.ENDPOINTS.COURSE_GRADES.BASE}/${id}`
    );
    return response.data;
  }

  /**
   * Crea nueva asignación
   */
  async create(data: {
    courseId: number;
    gradeId: number;
    isCore?: boolean;
  }): Promise<CourseGrade> {
    const response = await this.api.post<CourseGrade>(
      API_CONFIG.ENDPOINTS.COURSE_GRADES.BASE,
      data
    );
    return response.data;
  }

  /**
   * Actualiza una asignación
   */
  async update(
    id: number,
    data: { isCore?: boolean }
  ): Promise<CourseGrade> {
    const response = await this.api.patch<CourseGrade>(
      `${API_CONFIG.ENDPOINTS.COURSE_GRADES.BASE}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Elimina una asignación
   */
  async delete(id: number): Promise<void> {
    await this.api.delete(`${API_CONFIG.ENDPOINTS.COURSE_GRADES.BASE}/${id}`);
  }
}

export default CourseGradesService;
export type { Grade, Course, CourseGrade, PaginatedResponse };
```

---

## 🔌 IMPLEMENTACIÓN EN REACT

### Hook useAuth (obtener token)

```typescript
// hooks/useAuth.ts - Suponiendo que ya tienes esto
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
```

### Hook useCourseGrades

```typescript
// hooks/useCourseGrades.ts

import { useState, useEffect, useCallback } from 'react';
import CourseGradesService, {
  Grade,
  Course,
  CourseGrade,
  PaginatedResponse,
} from '../services/courseGradesService';
import { useAuth } from './useAuth';

interface UseCourseGradesReturn {
  // Datos
  grades: Grade[];
  courses: Course[];
  courseGrades: CourseGrade[];
  coursesByGrade: Course[];
  gradesByCourse: Grade[];
  totalItems: number;

  // Estados
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;

  // Métodos
  loadAvailableData: () => Promise<void>;
  loadCoursesByGrade: (gradeId: number) => Promise<void>;
  loadGradesByCourse: (courseId: number) => Promise<void>;
  listAll: (page: number, limit: number, filters?: any) => Promise<void>;
  createAssignment: (data: any) => Promise<CourseGrade | null>;
  updateAssignment: (id: number, data: any) => Promise<CourseGrade | null>;
  deleteAssignment: (id: number) => Promise<boolean>;
  setCurrentPage: (page: number) => void;
}

export const useCourseGrades = (): UseCourseGradesReturn => {
  const { token } = useAuth();
  const service = new CourseGradesService(token);

  const [grades, setGrades] = useState<Grade[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseGrades, setCourseGrades] = useState<CourseGrade[]>([]);
  const [coursesByGrade, setCoursesByGrade] = useState<Course[]>([]);
  const [gradesByCourse, setGradesByCourse] = useState<Grade[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((err: any, context: string) => {
    const errorMsg =
      err.response?.data?.message || err.message || `Error en ${context}`;
    setError(errorMsg);
    console.error(`[${context}]`, err);
  }, []);

  const loadAvailableData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { grades, courses } = await service.getAvailableData();
      setGrades(grades);
      setCourses(courses);
    } catch (err) {
      handleError(err, 'loadAvailableData');
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const loadCoursesByGrade = useCallback(async (gradeId: number) => {
    try {
      setLoading(true);
      setError(null);
      const courses = await service.getCoursesByGrade(gradeId);
      setCoursesByGrade(courses);
    } catch (err) {
      handleError(err, 'loadCoursesByGrade');
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const loadGradesByCourse = useCallback(async (courseId: number) => {
    try {
      setLoading(true);
      setError(null);
      const grades = await service.getGradesByCourse(courseId);
      setGradesByCourse(grades);
    } catch (err) {
      handleError(err, 'loadGradesByCourse');
    } finally {
      setLoading(false);
    }
  }, [service, handleError]);

  const listAll = useCallback(
    async (page = 1, limit = 10, filters?: any) => {
      try {
        setLoading(true);
        setError(null);
        const response = await service.listAll(page, limit, filters);
        setCourseGrades(response.data);
        setTotalItems(response.meta.total);
        setTotalPages(response.meta.totalPages);
        setCurrentPage(page);
      } catch (err) {
        handleError(err, 'listAll');
      } finally {
        setLoading(false);
      }
    },
    [service, handleError]
  );

  const createAssignment = useCallback(
    async (data: any): Promise<CourseGrade | null> => {
      try {
        setLoading(true);
        setError(null);
        const result = await service.create(data);
        // Recargar lista si está visible
        await listAll(currentPage);
        return result;
      } catch (err) {
        handleError(err, 'createAssignment');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [service, handleError, currentPage, listAll]
  );

  const updateAssignment = useCallback(
    async (id: number, data: any): Promise<CourseGrade | null> => {
      try {
        setLoading(true);
        setError(null);
        const result = await service.update(id, data);
        // Recargar lista si está visible
        await listAll(currentPage);
        return result;
      } catch (err) {
        handleError(err, 'updateAssignment');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [service, handleError, currentPage, listAll]
  );

  const deleteAssignment = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        await service.delete(id);
        // Recargar lista si está visible
        await listAll(currentPage);
        return true;
      } catch (err) {
        handleError(err, 'deleteAssignment');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [service, handleError, currentPage, listAll]
  );

  // Cargar datos disponibles al iniciar
  useEffect(() => {
    loadAvailableData();
  }, [loadAvailableData]);

  return {
    grades,
    courses,
    courseGrades,
    coursesByGrade,
    gradesByCourse,
    totalItems,
    loading,
    error,
    currentPage,
    totalPages,
    loadAvailableData,
    loadCoursesByGrade,
    loadGradesByCourse,
    listAll,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    setCurrentPage,
  };
};
```

---

## 📝 EJEMPLOS DE USO

### Ejemplo 1: Formulario de Creación

```typescript
// components/CreateCourseGradeForm.tsx

import React, { useState } from 'react';
import { useCourseGrades } from '../hooks/useCourseGrades';

export const CreateCourseGradeForm: React.FC = () => {
  const {
    grades,
    courses,
    loading,
    error,
    createAssignment,
  } = useCourseGrades();

  const [formData, setFormData] = useState({
    courseId: '',
    gradeId: '',
    isCore: true,
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.courseId || !formData.gradeId) {
      alert('Selecciona curso y grado');
      return;
    }

    const result = await createAssignment({
      courseId: Number(formData.courseId),
      gradeId: Number(formData.gradeId),
      isCore: formData.isCore,
    });

    if (result) {
      setSuccess(true);
      setFormData({ courseId: '', gradeId: '', isCore: true });
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2>Crear Asignación Curso-Grado</h2>

      {error && (
        <div style={{ color: '#d32f2f', marginBottom: '10px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ color: '#388e3c', marginBottom: '10px' }}>
          ✓ Creado exitosamente
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Grado *</label>
          <select
            value={formData.gradeId}
            onChange={(e) =>
              setFormData({ ...formData, gradeId: e.target.value })
            }
            disabled={loading}
          >
            <option value="">Selecciona grado</option>
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.level})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Curso *</label>
          <select
            value={formData.courseId}
            onChange={(e) =>
              setFormData({ ...formData, courseId: e.target.value })
            }
            disabled={loading}
          >
            <option value="">Selecciona curso</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            <input
              type="checkbox"
              checked={formData.isCore}
              onChange={(e) =>
                setFormData({ ...formData, isCore: e.target.checked })
              }
            />
            {' '}Curso Obligatorio (Núcleo)
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#ccc' : '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Creando...' : 'Crear'}
        </button>
      </form>
    </div>
  );
};
```

### Ejemplo 2: Listar y Editar

```typescript
// components/CourseGradesList.tsx

import React, { useEffect } from 'react';
import { useCourseGrades } from '../hooks/useCourseGrades';

export const CourseGradesList: React.FC = () => {
  const {
    courseGrades,
    loading,
    error,
    currentPage,
    totalPages,
    listAll,
    updateAssignment,
    deleteAssignment,
    setCurrentPage,
  } = useCourseGrades();

  useEffect(() => {
    listAll(currentPage);
  }, []);

  const handleToggleCore = async (id: number, isCore: boolean) => {
    await updateAssignment(id, { isCore: !isCore });
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Eliminar esta asignación?')) {
      await deleteAssignment(id);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div style={{ color: '#d32f2f' }}>{error}</div>;

  return (
    <div>
      <h2>Asignaciones Curso-Grado</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Curso</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Grado</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Tipo</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {courseGrades.map((cg) => (
            <tr key={cg.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>
                {cg.course?.code} - {cg.course?.name}
              </td>
              <td style={{ padding: '10px' }}>{cg.grade?.name}</td>
              <td style={{ padding: '10px' }}>
                {cg.isCore ? '✅ Obligatorio' : '📋 Electivo'}
              </td>
              <td style={{ padding: '10px' }}>
                <button
                  onClick={() => handleToggleCore(cg.id, cg.isCore)}
                  style={{
                    marginRight: '5px',
                    padding: '5px 10px',
                    cursor: 'pointer',
                  }}
                >
                  Cambiar Tipo
                </button>
                <button
                  onClick={() => handleDelete(cg.id)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => {
              setCurrentPage(page);
              listAll(page);
            }}
            style={{
              padding: '5px 10px',
              marginRight: '5px',
              backgroundColor: currentPage === page ? '#1976d2' : '#eee',
              color: currentPage === page ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### Ejemplo 3: Selector de Cursos por Grado

```typescript
// components/GradeCourseSelector.tsx

import React, { useEffect, useState } from 'react';
import { useCourseGrades } from '../hooks/useCourseGrades';

interface GradeCoursesSelectorProps {
  gradeId: number;
  onCoursesLoaded?: (courses: any[]) => void;
}

export const GradeCoursesSelector: React.FC<GradeCoursesSelectorProps> = ({
  gradeId,
  onCoursesLoaded,
}) => {
  const { loadCoursesByGrade, coursesByGrade, loading, error } =
    useCourseGrades();
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);

  useEffect(() => {
    if (gradeId) {
      loadCoursesByGrade(gradeId);
    }
  }, [gradeId]);

  useEffect(() => {
    onCoursesLoaded?.(coursesByGrade);
  }, [coursesByGrade]);

  if (loading) return <div>Cargando cursos...</div>;
  if (error) return <div style={{ color: '#d32f2f' }}>{error}</div>;

  return (
    <div>
      <h3>Cursos del Grado</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {coursesByGrade.map((course) => (
          <div
            key={course.id}
            style={{
              padding: '10px',
              border: `2px solid ${course.color}`,
              borderRadius: '4px',
              cursor: 'pointer',
              backgroundColor: selectedCourses.includes(course.id)
                ? course.color + '20'
                : 'white',
            }}
            onClick={() => {
              setSelectedCourses((prev) =>
                prev.includes(course.id)
                  ? prev.filter((id) => id !== course.id)
                  : [...prev, course.id]
              );
            }}
          >
            <strong>{course.code}</strong> - {course.name}
            <div style={{ fontSize: '0.85em', color: '#666' }}>
              Área: {course.area}
            </div>
          </div>
        ))}
      </div>
      <p style={{ marginTop: '10px' }}>
        Seleccionados: {selectedCourses.length}
      </p>
    </div>
  );
};
```

---

## ⚠️ MANEJO DE ERRORES

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| **401 Unauthorized** | Token inválido/expirado | Redirigir a login |
| **403 Forbidden** | Sin permisos requeridos | Pedir permisos al admin |
| **409 Conflict** | Relación duplicada | Validar antes de crear |
| **400 Bad Request** | Datos inválidos | Revisar validaciones |
| **404 Not Found** | Curso/Grado no existe | Verificar IDs |

### Ejemplo de Manejo

```typescript
const handleCreateAssignment = async (data: any) => {
  try {
    const result = await courseGradesService.create(data);
    showSuccess('Asignación creada');
  } catch (error: any) {
    const status = error.response?.status;
    
    switch (status) {
      case 401:
        // Token expirado
        redirectToLogin();
        break;
      case 403:
        // Sin permisos
        showError('No tienes permisos para crear asignaciones');
        break;
      case 409:
        // Duplicado
        showError('Esta asignación ya existe');
        break;
      case 400:
        // Validación fallida
        showError(error.response?.data?.message);
        break;
      default:
        showError('Error desconocido');
    }
  }
};
```

---

## 🔐 PERMISOS RBAC

### Permisos Requeridos

| Acción | Permiso Requerido | Descripción |
|--------|------------------|-------------|
| Listar todos | `course-grade:read` | Ver todas las asignaciones |
| Ver detalles | `course-grade:read-one` | Ver una asignación específica |
| Crear | `course-grade:create` | Crear nueva asignación |
| Editar | `course-grade:update` | Modificar tipo (núcleo/electivo) |
| Eliminar | `course-grade:delete` | Eliminar asignación |

### Verificar Permisos en Frontend

```typescript
// utils/permissions.ts

export const hasPermission = (
  userPermissions: string[],
  module: string,
  action: string
): boolean => {
  const permission = `${module}:${action}`;
  return userPermissions.includes(permission);
};

// Uso en componente
import { hasPermission } from '../utils/permissions';
import { useAuth } from '../hooks/useAuth';

export const CourseGradesUI: React.FC = () => {
  const { user } = useAuth();

  const canCreate = hasPermission(user.permissions, 'course-grade', 'create');
  const canDelete = hasPermission(user.permissions, 'course-grade', 'delete');

  return (
    <div>
      {canCreate && <CreateCourseGradeForm />}
      {canDelete && <DeleteButton />}
    </div>
  );
};
```

---

## ❓ PREGUNTAS FRECUENTES

### P: ¿Cómo obtengo el token?

**R:** El token se obtiene en login:
```typescript
const response = await axios.post('/api/auth/login', {
  username,
  password,
});
const token = response.data.access_token;
localStorage.setItem('authToken', token);
```

---

### P: ¿Cómo manejo la paginación?

**R:** Usa el hook `useCourseGrades`:
```typescript
const { listAll, currentPage, totalPages, setCurrentPage } = useCourseGrades();

// Ir a página 2
setCurrentPage(2);
await listAll(2, 10);
```

---

### P: ¿Qué diferencia hay entre isCore true y false?

**R:**
- **isCore = true**: Curso obligatorio (se debe cursar)
- **isCore = false**: Curso electivo (opcional)

---

### P: ¿Puedo eliminar un curso si tiene estudiantes matriculados?

**R:** Puedes eliminar la relación Curso-Grado, pero NO puedes eliminar el Curso si tiene:
- Calificaciones de estudiantes
- Asignaciones activas

---

### P: ¿Dónde está la documentación de API completa?

**R:** Consulta estos archivos:
- `QUICK_REFERENCE_COURSES.md`
- `HOW_TO_GET_GRADES_AND_COURSES.md`
- `POSTMAN_COLLECTION_COURSES.md`

---

## 📞 SOPORTE

Si tienes problemas:

1. **Verifica el token** - ¿Está activo?
2. **Revisa los permisos** - ¿Tienes el permiso requerido?
3. **Comprueba los datos** - ¿Son válidos?
4. **Lee los logs** - ¿Hay mensajes de error?
5. **Contacta al backend** - Si nada funciona

---

**Última actualización:** 3 Noviembre 2025
**Versión:** 1.0

