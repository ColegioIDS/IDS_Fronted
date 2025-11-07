// src/hooks/attendance/USAGE_GUIDE.md

# 📚 Guía de Uso - Hooks de Attendance

## 🎯 Visión General

Se han creado 3 hooks principales para manejar el módulo de attendance:

1. **`useAttendanceData`** - Fetch y gestión de datos
2. **`useAttendanceFilters`** - Gestión de filtros
3. **`useAttendanceActions`** - Acciones CRUD

---

## 🚀 Importación

```typescript
import {
  useAttendanceData,
  useAttendanceFilters,
  useAttendanceActions,
} from '@/hooks/attendance';
```

---

## 📖 Hook 1: `useAttendanceData`

### Descripción
Maneja el fetch de datos de asistencia con estados de carga, error y paginación.

### Valores Retornados

```typescript
{
  // Estado
  attendances: StudentAttendanceWithRelations[];
  stats: AttendanceStats | null;
  pagination: { page, limit, total, totalPages };
  loading: boolean;
  error: string | null;
  
  // Métodos
  fetchAttendances(query?): Promise<PaginatedAttendance>;
  fetchAttendanceById(id): Promise<StudentAttendanceWithRelations>;
  fetchStudentAttendances(enrollmentId, query?): Promise<PaginatedAttendance>;
  fetchSectionAttendances(sectionId, query?): Promise<PaginatedAttendance>;
  fetchStats(query?): Promise<AttendanceStats>;
  changePage(page, query?): Promise<PaginatedAttendance>;
  changeLimit(limit, query?): Promise<PaginatedAttendance>;
  clearState(): void;
  clearError(): void;
}
```

### Ejemplo de Uso

```typescript
'use client';

import { useAttendanceData } from '@/hooks/attendance';
import { useEffect } from 'react';

export function AttendanceList() {
  const {
    attendances,
    stats,
    pagination,
    loading,
    error,
    fetchAttendances,
    changePage,
  } = useAttendanceData();

  // Cargar datos iniciales
  useEffect(() => {
    fetchAttendances({
      page: 1,
      limit: 10,
      sectionId: 5,
      dateFrom: '2025-11-01',
      dateTo: '2025-11-30',
    });
  }, []);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Asistencias ({pagination.total})</h2>
      <p>Presentes: {stats?.present}</p>
      <p>Ausentes: {stats?.absent}</p>
      
      {attendances.map((att) => (
        <div key={att.id}>
          <p>{att.enrollment?.student.givenNames}</p>
          <p>Estado: {att.statusCode}</p>
          <p>Fecha: {att.date}</p>
        </div>
      ))}

      {/* Paginación */}
      <button 
        onClick={() => changePage(pagination.page + 1)}
        disabled={pagination.page >= pagination.totalPages}
      >
        Siguiente
      </button>
    </div>
  );
}
```

---

## 📖 Hook 2: `useAttendanceFilters`

### Descripción
Maneja el estado de filtros sin afectar directamente los datos. Ideal para formularios de búsqueda.

### Valores Retornados

```typescript
{
  // Estado
  filters: FilterState;
  
  // Métodos de modificación
  setFilter(key, value): void;
  setMultipleFilters(filters): void;
  setDateRange(dateFrom, dateTo): void;
  setSorting(sortBy, sortOrder): void;
  clearFilters(): void;
  clearFilter(key): void;
  
  // Métodos de lectura
  getQueryParams(): AttendanceQuery;
  hasActiveFilters: boolean;
  getFilterDescription: string;
}
```

### Ejemplo de Uso

```typescript
'use client';

import { useAttendanceFilters, useAttendanceData } from '@/hooks/attendance';
import { useEffect } from 'react';

export function AttendanceFilters() {
  const {
    filters,
    setFilter,
    setDateRange,
    setSorting,
    clearFilters,
    hasActiveFilters,
    getQueryParams,
  } = useAttendanceFilters();

  const { fetchAttendances } = useAttendanceData();

  // Buscar cuando cambian los filtros
  const handleSearch = async () => {
    const query = getQueryParams();
    await fetchAttendances(query);
  };

  return (
    <div>
      <input
        type="date"
        onChange={(e) => setFilter('dateFrom', e.target.value)}
        value={filters.dateFrom || ''}
      />
      <input
        type="date"
        onChange={(e) => setFilter('dateTo', e.target.value)}
        value={filters.dateTo || ''}
      />

      <select onChange={(e) => setFilter('statusCode', e.target.value as any)}>
        <option value="">Todos los estados</option>
        <option value="A">Presente</option>
        <option value="I">Ausente</option>
        <option value="IJ">Ausente Justificado</option>
        <option value="TI">Tarde</option>
        <option value="TJ">Tarde Justificado</option>
      </select>

      <button onClick={handleSearch}>Buscar</button>
      <button onClick={clearFilters} disabled={!hasActiveFilters}>
        Limpiar Filtros
      </button>

      {hasActiveFilters && (
        <p>Filtros activos: {/* mostrar descripción */}</p>
      )}
    </div>
  );
}
```

---

## 📖 Hook 3: `useAttendanceActions`

### Descripción
Maneja operaciones CRUD (crear, actualizar, eliminar) con estados de carga y error.

### Valores Retornados

```typescript
{
  // Estado
  loading: boolean;
  error: string | null;
  success: boolean;
  
  // Métodos CRUD
  createAttendance(data): Promise<StudentAttendance>;
  updateAttendance(id, data): Promise<StudentAttendance>;
  deleteAttendance(id): Promise<void>;
  
  // Operaciones bulk
  bulkCreateAttendances(data): Promise<BulkAttendanceResponse>;
  bulkUpdateAttendances(data): Promise<BulkAttendanceResponse>;
  bulkDeleteAttendances(data): Promise<BulkAttendanceResponse>;
  bulkApplyStatus(data): Promise<BulkAttendanceResponse>;
  
  // Justificantes
  createJustification(data): Promise<StudentJustification>;
  updateJustification(id, data): Promise<StudentJustification>;
  approveJustification(id, approvedBy): Promise<StudentJustification>;
  rejectJustification(id, reason): Promise<StudentJustification>;
  
  // Helpers
  clearState(): void;
  clearError(): void;
}
```

### Ejemplo de Uso

```typescript
'use client';

import { useAttendanceActions, useAttendanceData } from '@/hooks/attendance';
import { useState } from 'react';

export function CreateAttendanceForm() {
  const {
    loading,
    error,
    success,
    createAttendance,
    clearError,
  } = useAttendanceActions();

  const { fetchAttendances } = useAttendanceData();

  const [formData, setFormData] = useState({
    enrollmentId: 0,
    date: '',
    statusCode: 'A' as const,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createAttendance(formData);
      
      // Refrescar lista
      await fetchAttendances();
      
      // Limpiar formulario
      setFormData({
        enrollmentId: 0,
        date: '',
        statusCode: 'A',
        notes: '',
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="error">
          {error}
          <button onClick={clearError}>Descartar</button>
        </div>
      )}
      
      {success && <div className="success">Creado exitosamente</div>}

      <input
        type="number"
        placeholder="Enrollment ID"
        value={formData.enrollmentId}
        onChange={(e) =>
          setFormData({ ...formData, enrollmentId: parseInt(e.target.value) })
        }
        required
      />

      <input
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        required
      />

      <select
        value={formData.statusCode}
        onChange={(e) =>
          setFormData({
            ...formData,
            statusCode: e.target.value as any,
          })
        }
      >
        <option value="A">Presente</option>
        <option value="I">Ausente</option>
        <option value="IJ">Ausente Justificado</option>
        <option value="TI">Tarde</option>
        <option value="TJ">Tarde Justificado</option>
      </select>

      <textarea
        placeholder="Notas"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear'}
      </button>
    </form>
  );
}
```

---

## 🔗 Ejemplo Completo: Componente Integrado

```typescript
'use client';

import {
  useAttendanceData,
  useAttendanceFilters,
  useAttendanceActions,
} from '@/hooks/attendance';
import { useEffect } from 'react';

export function AttendancePageContent() {
  const {
    attendances,
    stats,
    pagination,
    loading,
    error,
    fetchAttendances,
    changePage,
  } = useAttendanceData();

  const {
    filters,
    setFilter,
    clearFilters,
    getQueryParams,
    hasActiveFilters,
  } = useAttendanceFilters();

  const {
    loading: actionLoading,
    error: actionError,
    updateAttendance,
  } = useAttendanceActions();

  // Cargar datos iniciales
  useEffect(() => {
    fetchAttendances({
      page: 1,
      limit: 20,
      sectionId: 5,
    });
  }, []);

  const handleFilterChange = () => {
    const query = getQueryParams();
    fetchAttendances({ ...query, page: 1 });
  };

  const handleStatusChange = async (attendanceId: number, newStatus: any) => {
    try {
      await updateAttendance(attendanceId, { statusCode: newStatus });
      // Refrescar
      await fetchAttendances(getQueryParams());
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="attendance-page">
      <h1>Sistema de Asistencia</h1>

      {/* Filtros */}
      <div className="filters">
        <input
          type="date"
          onChange={(e) => setFilter('dateFrom', e.target.value)}
          value={filters.dateFrom || ''}
        />
        <button onClick={handleFilterChange}>Filtrar</button>
        {hasActiveFilters && (
          <button onClick={clearFilters}>Limpiar Filtros</button>
        )}
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="stats">
          <div>Presentes: {stats.present}</div>
          <div>Ausentes: {stats.absent}</div>
          <div>Tardanzas: {stats.late}</div>
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <div>Cargando...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <table>
          <tbody>
            {attendances.map((att) => (
              <tr key={att.id}>
                <td>{att.enrollment?.student.givenNames}</td>
                <td>{att.date}</td>
                <td>
                  <select
                    value={att.statusCode}
                    onChange={(e) =>
                      handleStatusChange(att.id, e.target.value)
                    }
                    disabled={actionLoading}
                  >
                    <option value="A">Presente</option>
                    <option value="I">Ausente</option>
                    <option value="IJ">Ausente Justificado</option>
                    <option value="TI">Tarde</option>
                    <option value="TJ">Tarde Justificado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Paginación */}
      <div className="pagination">
        <button
          onClick={() => changePage(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          Anterior
        </button>
        <span>
          Página {pagination.page} de {pagination.totalPages}
        </span>
        <button
          onClick={() => changePage(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
```

---

## 🎨 Mejores Prácticas

1. **Separación de Responsabilidades**
   - `useAttendanceData` → Fetch
   - `useAttendanceFilters` → Filtros
   - `useAttendanceActions` → CRUD

2. **Error Handling**
   ```typescript
   try {
     await action();
   } catch (err) {
     // Manejo de error
   }
   ```

3. **Limpiar Estados**
   ```typescript
   useEffect(() => {
     return () => clearState(); // Cleanup
   }, []);
   ```

4. **Memoización de Callbacks**
   - Ya implementada en los hooks
   - Evita re-renders innecesarios

5. **Composición de Hooks**
   - Combina los 3 hooks para máxima flexibilidad
   - Reutilizable en componentes diferentes

---

## 🔒 Permisos por Scope

Los hooks ya soportan permisos por scope. Añade estos parámetros:

```typescript
const query = {
  scope: 'section', // 'all' | 'own' | 'grade' | 'section'
  sectionIdScope: 5,
  gradeId: 10,
};

await fetchAttendances(query);
```

---

## 📝 Notas Importantes

- Todos los hooks son **use client**
- Los métodos lanzan excepciones (usa try/catch)
- Estados se limpian automáticamente entre acciones
- Compatible con React Query/SWR si necesitas caché

---

Más información: Ver `src/services/attendance.service.ts` para endpoints específicos.
