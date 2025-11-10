# Plan de Reestructuración del Módulo de Asistencia

## 📊 Estructura Actual (Confusa)
```
attendance/
├── attendance-grid.tsx (componente principal)
├── components/
│   ├── attendance-controls/ (5 componentes)
│   ├── attendance-grid/ (6 componentes)
│   ├── attendance-header/ (5 componentes)
│   ├── attendance-modals/
│   └── attendance-states/ (4 componentes)
└── data/
```

**Problema**: Los componentes se agrupan por "tipo" (controls, grid, header) pero no siguen el flujo de usuario.

---

## 🎯 Nueva Estructura Propuesta (Intuitiva)

```
attendance/
├── attendance-grid.tsx (MAIN - sin cambios)
├── components/
│   ├── layout/                           ← Componentes de layout
│   │   ├── AttendanceHeader.tsx          (selector de grado, sección, fecha)
│   │   └── AttendanceStats.tsx           (estadísticas y resumen)
│   │
│   ├── selection/                        ← Panel de selección (NUEVA SECCIÓN)
│   │   ├── CourseSelector.tsx            (selección de cursos)
│   │   ├── StudentSelector.tsx           (si existe)
│   │   └── FilterControls.tsx            (filtros adicionales)
│   │
│   ├── display/                          ← Vistas de datos
│   │   ├── AttendanceTable.tsx           (vista en tabla)
│   │   ├── AttendanceCards.tsx           (vista en cards)
│   │   ├── StudentRow.tsx                (fila individual)
│   │   └── StudentAvatar.tsx             (avatar del estudiante)
│   │
│   ├── actions/                          ← Acciones y controles
│   │   ├── BulkActions.tsx               (acciones masivas)
│   │   ├── AttendanceButtons.tsx         (botones de estado)
│   │   └── ViewModeToggle.tsx            (cambio de vista)
│   │
│   └── states/                           ← Estados y notificaciones
│       ├── EmptyState.tsx                (sin datos)
│       ├── ErrorState.tsx                (errores)
│       ├── HolidayNotice.tsx             (noticia de festivo)
│       ├── LoadingState.tsx              (cargando)
│       └── SaveStatus.tsx                (estado de guardado)
│
└── data/
```

---

## 📈 Flujo de Usuario (Nueva Estructura)

### 1. **Layout** → Selecciona grado, sección, fecha
   - `AttendanceHeader` (selector principal)
   - `AttendanceStats` (muestra totales)

### 2. **Selection** → Define qué ver
   - `CourseSelector` (cursos a registrar)
   - `FilterControls` (filtros adicionales)

### 3. **Display** → Visualiza datos
   - `AttendanceTable` O `AttendanceCards` (elige vista)
   - Contiene: `StudentRow`, `StudentAvatar`

### 4. **Actions** → Realiza cambios
   - `AttendanceButtons` (marca asistencia)
   - `BulkActions` (acciones masivas)
   - `ViewModeToggle` (cambia vista)

### 5. **States** → Retroalimentación
   - `HolidayNotice` (noticia de festivo)
   - `LoadingState` (cargando)
   - `ErrorState` (error)
   - `EmptyState` (sin datos)
   - `SaveStatus` (guardado)

---

## ✨ Beneficios

| Antes | Después |
|-------|---------|
| 5 carpetas por "tipo" | 5 carpetas por "función" |
| Confuso dónde buscar | Flujo de usuario claro |
| Difícil de entender | Intuitivo |
| Disperso | Organizado lógicamente |

---

## 🔧 Implementación

1. **Crear nuevas carpetas** (structure change)
2. **Mover archivos** sin cambiar código
3. **Actualizar imports** en `attendance-grid.tsx`
4. **Eliminar carpetas vacías**

**Tiempo de implementación**: ~10 minutos
**Riesgo**: Mínimo (solo organización, sin cambios funcionales)
**Impacto**: Mejora significativa en mantenibilidad

