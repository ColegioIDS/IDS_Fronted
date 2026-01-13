# Dashboard - Documentación de Estructura

## 📁 Estructura de Archivos Creada

```
src/components/dashboard/
├── DashboardRouter.tsx                 # Router principal por roles
├── roles/
│   ├── DashboardDocente.tsx           # ✅ Dashboard para docentes (IMPLEMENTADO)
│   ├── DashboardCoordinador.tsx       # 📋 Placeholder para coordinadores
│   └── DashboardAdministrador.tsx     # 📋 Placeholder para administradores
└── docente/
    ├── DocenteHeader.tsx               # Encabezado con saludo y fecha
    ├── QuickStats.tsx                  # 4 tarjetas con estadísticas
    ├── MyCoursesSection.tsx            # Lista de cursos activos
    ├── AttendanceChart.tsx             # Gráfico de asistencia (Recharts)
    ├── GradesChart.tsx                 # Gráfico de calificaciones (Recharts)
    ├── PendingTasks.tsx                # Tareas pendientes por calificar
    ├── RecentActivity.tsx              # Actividad reciente en cursos
    └── QuickActions.tsx                # Botones de acceso rápido
```

## 🔄 Cómo Funciona el Routing

El sistema detecta automáticamente el rol del usuario desde el `AuthContext`:

```tsx
// AuthContext proporciona:
{
  role: {
    id: number,
    name: string,        // "docente", "coordinador", "administrador"
    permissions?: [...]
  }
}
```

El `DashboardRouter.tsx` mapea roles a componentes:

```tsx
const ROLE_COMPONENTS = {
  docente: DashboardDocente,
  coordinador: DashboardCoordinador,
  administrador: DashboardAdministrador,
};
```

## 📊 Dashboard del Docente - Componentes

### 1. **DocenteHeader.tsx**
- Saludo dinámico según la hora
- Muestra período académico
- Muestra fecha actual

### 2. **QuickStats.tsx**
4 tarjetas con métricas:
- Total de estudiantes (145)
- Cursos activos (4)
- Asistencia promedio (87%)
- Tareas pendientes (12)

### 3. **MyCoursesSection.tsx**
Lista interactiva de cursos con:
- Nombre y sección
- Cantidad de estudiantes
- Promedio de calificaciones
- Barra de asistencia
- Botón de acciones

**Datos placeholder:**
```tsx
[
  { 
    id: '1',
    name: 'Matemáticas',
    section: 'A - 6to Primaria',
    students: 35,
    averageGrade: 8.2,
    attendanceRate: 92,
  },
  // ... más cursos
]
```

### 4. **AttendanceChart.tsx**
Gráfico de barras (Recharts) comparando:
- Asistencia real vs meta (90%)
- Datos por curso

### 5. **GradesChart.tsx**
Gráfico de líneas mostrando:
- Promedio general por semana
- Tendencia de calificaciones
- 6 semanas de datos

### 6. **PendingTasks.tsx**
Tareas pendientes con:
- Tipo (Calificar, Feedback, Revisar)
- Curso asociado
- Cantidad de pendientes
- Fecha de vencimiento
- Nivel de prioridad (alta, media, baja)
- Botón de acceso directo

### 7. **RecentActivity.tsx**
Actividad reciente mostrando:
- Nombre del estudiante
- Acción realizada
- Curso
- Tiempo transcurrido
- Icono según tipo de evento

### 8. **QuickActions.tsx**
4 botones de acceso rápido:
- 📊 Calificar
- 📋 Tareas
- 👥 Asistencia
- 📅 Horario

Cada botón navega a su módulo correspondiente.

## 🎨 Características de Diseño

✅ **Dark Mode Completo** - Todos los componentes soportan dark mode
✅ **Responsive** - Funciona en mobile, tablet y desktop
✅ **Iconos** - Usa Lucide React
✅ **Gráficos** - Usa Recharts con colores personalizados
✅ **Animaciones** - Transiciones suaves y efectos hover
✅ **Accesibilidad** - Semántica HTML correcta

## 📝 Datos Placeholder

Todos los datos son hardcodeados. Para conectar con el backend:

### 1. Crear hooks personalizados:
```tsx
// hooks/useDashboardData.ts
export function useDashboardDocente() {
  const [courses, setCourses] = useState([]);
  
  useEffect(() => {
    // Llamar API: GET /api/teacher/courses
  }, []);
  
  return { courses };
}
```

### 2. Reemplazar datos en componentes:
```tsx
// En DashboardDocente.tsx
export default function DashboardDocente() {
  const { courses } = useDashboardDocente();
  
  return (
    <>
      <QuickStats data={stats} />
      <MyCoursesSection courses={courses} />
    </>
  );
}
```

### 3. Actualizaciones necesarias:
- **QuickStats**: Llamar `/api/teacher/stats`
- **MyCoursesSection**: Llamar `/api/teacher/courses`
- **AttendanceChart**: Llamar `/api/attendance/summary`
- **GradesChart**: Llamar `/api/grades/statistics`
- **PendingTasks**: Llamar `/api/teacher/pending-tasks`
- **RecentActivity**: Llamar `/api/teacher/activity`

## 🔐 Permisos

El dashboard respeta los permisos del usuario:
```tsx
const { hasPermission } = useAuth();

if (!hasPermission('attendance', 'view')) {
  return <NoAccess />;
}
```

## 🚀 Próximos Pasos

1. **Dashboard Coordinador** - Similar al docente pero con vista de múltiples docentes
2. **Dashboard Administrador** - KPIs a nivel institucional
3. **Integración Backend** - Reemplazar datos placeholder con API calls
4. **Caché de Datos** - Usar React Query o SWR para optimizar
5. **Exportación de Reportes** - PDF/Excel desde los gráficos

## 📚 Archivos Modificados

- ✅ `src/app/(admin)/dashboard/page.tsx` - Ahora usa DashboardRouter
- ✅ `src/components/dashboard/DashboardRouter.tsx` - Nuevo
- ✅ `src/components/dashboard/roles/*.tsx` - Nuevos (3 archivos)
- ✅ `src/components/dashboard/docente/*.tsx` - Nuevos (8 archivos)

**Total: 12 archivos nuevos**
