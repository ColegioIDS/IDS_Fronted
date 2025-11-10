# Estructura de Componentes de Asistencia (Reestructurado)

## 📊 Nuevo Flujo Intuitivo

La carpeta `components/` está organizada por **función/flujo de usuario**, no por tipo de componente.

```
components/
├── layout/              → Configuración inicial (selector de grado, sección, fecha)
├── selection/           → Definir qué se va a registrar (cursos, filtros)
├── display/             → Mostrar los datos (tablas, tarjetas)
├── actions/             → Acciones sobre los datos (bulk, guardar)
└── states/              → Estados y retroalimentación (vacío, error, festivo)
```

---

## 🎯 Componentes por Carpeta

### 1️⃣ **`layout/`** - Configuración
**Propósito**: Seleccionar grado, sección, fecha y ver resumen

```
layout/
├── AttendanceHeader.tsx      → Componente principal (selector de grado/sección)
├── AttendanceStats.tsx       → Estadísticas y resumen
├── GradeSelector.tsx         → Dropdown de grados
├── SectionSelector.tsx       → Dropdown de secciones
├── DatePicker.tsx            → Selector de fecha
└── index.ts                  → Exports
```

**Usar cuando**: El usuario necesita seleccionar dónde registrar asistencia

---

### 2️⃣ **`selection/`** - Definición de Datos
**Propósito**: Elegir qué cursos registrar y aplicar filtros

```
selection/
├── CourseSelector.tsx        → Grid de cursos con checkboxes
├── FilterControls.tsx        → Filtros adicionales (búsqueda, estados)
└── index.ts                  → Exports
```

**Usar cuando**: El usuario necesita especificar los datos a registrar

---

### 3️⃣ **`display/`** - Visualización
**Propósito**: Mostrar estudiantes y permitir marcar asistencia

```
display/
├── AttendanceTable.tsx       → Vista en tabla (recomendada para desktop)
├── AttendanceCards.tsx       → Vista en tarjetas (recomendada para móvil)
├── StudentAvatar.tsx         → Avatar del estudiante
└── index.ts                  → Exports
```

**Usar cuando**: El usuario necesita ver y marcar los registros

---

### 4️⃣ **`actions/`** - Operaciones
**Propósito**: Realizar cambios en los datos (marcar asistencia masivamente, guardar)

```
actions/
├── BulkActions.tsx           → Acciones masivas (cambiar estado de varios)
├── SaveStatus.tsx            → Indicador de guardado
├── ViewModeToggle.tsx        → Cambiar entre tabla/tarjetas
├── AttendanceButtons.tsx     → Botones para cambiar estado
└── index.ts                  → Exports
```

**Usar cuando**: Se realizan cambios que requieren feedback

---

### 5️⃣ **`states/`** - Estados UI
**Propósito**: Mostrar diferentes estados de la aplicación

```
states/
├── EmptyState.tsx            → Sin grado/sección seleccionada
├── ErrorState.tsx            → Errores en carga/guardado
├── HolidayNotice.tsx         → Notificación de día festivo
├── LoadingState.tsx          → Pantalla de carga
└── index.ts                  → Exports
```

**Usar cuando**: Hay un estado especial a comunicar al usuario

---

## 🔄 Flujo de Usuario

```
┌─────────────────────────────────────────────────────┐
│ 1️⃣ LAYOUT: Selecciona grado, sección, fecha       │
│    Componentes: AttendanceHeader, GradeSelector    │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────v──────────────────────────────────┐
│ 2️⃣ SELECTION: Define qué cursos registrar         │
│    Componentes: CourseSelector, FilterControls     │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────v──────────────────────────────────┐
│ 3️⃣ DISPLAY: Ve tabla o tarjetas de estudiantes    │
│    Componentes: AttendanceTable, AttendanceCards   │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────v──────────────────────────────────┐
│ 4️⃣ ACTIONS: Marca asistencia, acciones masivas    │
│    Componentes: BulkActions, SaveStatus            │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────v──────────────────────────────────┐
│ 5️⃣ STATES: Muestra estados especiales             │
│    Componentes: HolidayNotice, ErrorState          │
└─────────────────────────────────────────────────────┘
```

---

## 💡 Guía de Importes

### ❌ ANTES (Confuso)
```typescript
import AttendanceHeader from './components/attendance-header/AttendanceHeader';
import AttendanceTable from './components/attendance-grid/AttendanceTable';
import CourseSelector from './components/attendance-controls/CourseSelector';
import { NoGradeSelectedState } from './components/attendance-states/EmptyState';
```

### ✅ DESPUÉS (Claro)
```typescript
// Importar desde layout
import AttendanceHeader from './components/layout';

// Importar desde display
import { AttendanceTable } from './components/display';

// Importar desde selection
import { CourseSelector } from './components/selection';

// Importar desde states
import { NoGradeSelectedState } from './components/states';
```

---

## 🎯 Beneficios

| Beneficio | Descripción |
|-----------|-------------|
| **Intuitivo** | Los componentes están donde el usuario los esperaría |
| **Mantenible** | Fácil encontrar componentes relacionados |
| **Escalable** | Agregar nuevos componentes es obvio dónde |
| **Documentado** | Cada carpeta tiene un propósito claro |
| **Flujo Lógico** | Sigue el viaje del usuario |

---

## 🔍 Búsqueda Rápida

¿Necesitas componente para...?

- **Selector de grado/sección** → `layout/`
- **Seleccionar cursos** → `selection/`
- **Mostrar tabla de estudiantes** → `display/`
- **Guardar datos** → `actions/`
- **Mostrar error o festivo** → `states/`

---

## 📝 Notas

- Los archivos originales en `attendance-header/`, `attendance-grid/`, etc. se pueden eliminar después de verificar que todo funciona
- Todos los imports están centralizados con `index.ts` en cada carpeta
- El componente principal `attendance-grid.tsx` importa desde las nuevas ubicaciones

