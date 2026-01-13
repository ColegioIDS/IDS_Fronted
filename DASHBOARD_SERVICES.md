# Dashboard Services - Documentación

## 📁 Archivos Creados

### 1. `src/types/dashboard.types.ts`
Define todos los tipos e interfaces para el dashboard:
- `DashboardTeacherStats` - Estadísticas principales (cards)
- `DashboardCourse` - Información de un curso
- `AttendanceChartData` - Datos para gráfico de asistencia
- `GradesChartData` - Datos para gráfico de calificaciones
- `PendingTask` - Tarea pendiente por calificar
- `RecentActivityItem` - Evento reciente
- `DashboardQuery` - Parámetros de consulta

### 2. `src/services/dashboard.service.ts`
Servicio con métodos para llamar a los endpoints del dashboard:

```typescript
// Estadísticas principales
dashboardService.getStats()
// GET /api/dashboard/stats

// Cursos del docente
dashboardService.getCourses({ period: '2024-1' })
// GET /api/dashboard/courses?period=2024-1

// Gráfico de asistencia
dashboardService.getAttendanceChart('2024-1')
// GET /api/dashboard/attendance-chart?period=2024-1

// Gráfico de calificaciones
dashboardService.getGradesChart('2024-1')
// GET /api/dashboard/grades-chart?period=2024-1

// Tareas pendientes
dashboardService.getPendingTasks({ period: '2024-1' })
// GET /api/dashboard/pending-tasks?period=2024-1

// Actividad reciente
dashboardService.getRecentActivity(5)
// GET /api/dashboard/recent-activity?limit=5

// Todos los datos combinados
dashboardService.getAllDashboardData()
// GET /api/dashboard/all
```

### 3. `src/hooks/useDashboardData.ts`
Hooks personalizados para usar en componentes React:

#### Hook Principal
```typescript
const { 
  stats, 
  courses, 
  attendanceChart, 
  gradesChart, 
  pendingTasks, 
  recentActivity, 
  isLoading, 
  error,
  refresh 
} = useDashboardData({ period: '2024-1' });
```

#### Hooks Individuales
```typescript
// Solo estadísticas
const { stats, isLoading, error } = useDashboardStats();

// Solo cursos
const { courses, isLoading, error } = useDashboardCourses('2024-1');

// Gráficos
const { attendance, grades, isLoading, error } = useDashboardCharts('2024-1');

// Tareas pendientes
const { tasks, isLoading, error } = useDashboardPendingTasks('2024-1');

// Actividad reciente
const { activity, isLoading, error } = useDashboardActivity(5);
```

## 🚀 Cómo Usar en Componentes

### Ejemplo 1: Cargar Estadísticas
```tsx
// src/components/dashboard/docente/QuickStats.tsx
import { useDashboardStats } from '@/hooks/useDashboardData';

export default function QuickStats() {
  const { stats, isLoading, error } = useDashboardStats();

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard 
        label="Total de Estudiantes"
        value={stats?.totalStudents}
      />
      <StatCard 
        label="Cursos Activos"
        value={stats?.activeCoursesToday}
      />
      {/* ... más cards */}
    </div>
  );
}
```

### Ejemplo 2: Cargar Todo de una Vez
```tsx
// src/components/dashboard/roles/DashboardDocente.tsx
import { useDashboardData } from '@/hooks/useDashboardData';

export default function DashboardDocente() {
  const { 
    stats, 
    courses, 
    attendanceChart,
    isLoading,
    error
  } = useDashboardData({ period: '2024-1' });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorComponent error={error} />;

  return (
    <>
      <QuickStats stats={stats} />
      <MyCoursesSection courses={courses} />
      <AttendanceChart data={attendanceChart} />
    </>
  );
}
```

### Ejemplo 3: Con Período Variable
```tsx
export default function Dashboard() {
  const [period, setPeriod] = useState('2024-1');
  const { stats, courses, refresh } = useDashboardData({ period });

  return (
    <>
      <select onChange={(e) => setPeriod(e.target.value)}>
        <option value="2024-1">Período 1</option>
        <option value="2024-2">Período 2</option>
      </select>
      
      <QuickStats stats={stats} />
      <button onClick={refresh}>Actualizar</button>
    </>
  );
}
```

## 📊 Respuesta Esperada del Backend

### `/api/dashboard/stats`
```json
{
  "success": true,
  "data": {
    "role": "TEACHER",
    "totalStudents": 45,
    "activeCoursesToday": 3,
    "averageAttendance": 85.5,
    "pendingTasksToGrade": 12
  }
}
```

### `/api/dashboard/courses`
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "1",
        "name": "Matemáticas",
        "section": "A - 6to Primaria",
        "students": 35,
        "averageGrade": 8.2,
        "attendanceRate": 92
      }
    ],
    "totalCourses": 4
  }
}
```

### `/api/dashboard/attendance-chart`
```json
{
  "success": true,
  "data": {
    "data": [
      { "course": "Matemáticas", "attendance": 92, "target": 90 },
      { "course": "Ciencias", "attendance": 88, "target": 90 }
    ],
    "period": "2024-1"
  }
}
```

## ⚙️ Manejo de Errores

Todos los hooks incluyen manejo de errores:

```typescript
const { stats, isLoading, error } = useDashboardStats();

if (error) {
  return (
    <div className="p-4 bg-red-100 border border-red-400 rounded">
      <p className="text-red-700">Error: {error}</p>
      <button onClick={() => window.location.reload()}>
        Reintentar
      </button>
    </div>
  );
}
```

## 🔄 Actualizar Datos

El hook principal devuelve una función `refresh()`:

```typescript
const { stats, refresh } = useDashboardData();

return (
  <button onClick={refresh} className="px-4 py-2 bg-blue-600 text-white">
    Actualizar Dashboard
  </button>
);
```

## 📝 Próximos Pasos

1. **Reemplazar datos placeholder** en los componentes
2. **Conectar servicios** a los componentes del dashboard docente
3. **Implementar endpoints** en el backend según los tipos definidos
4. **Agregar caché** con React Query o SWR (opcional)
5. **Crear dashboards** para coordinador y administrador

## 🔗 Relación entre Archivos

```
QuickStats.tsx
    ↓
useDashboardStats()
    ↓
dashboardService.getStats()
    ↓
/api/dashboard/stats (Backend)
```

## 💡 Notas

- Todos los servicios incluyen validación de respuestas
- Los hooks manejan loading y error automáticamente
- Los datos se cargan en paralelo cuando es posible
- Compatible con período académico variable
